import { useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import { cerebroColors as C } from "@/lib/keepConfig";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type TargetType = "keep" | "workbench" | "ledger" | "settings" | "deck" | "prototype" | "copy" | "asset" | "other";
type ReviewStatus = "needs_review" | "ready_for_patch" | "blocked" | "passed_local_review";
type ChecklistKey =
  | "design_md_loaded"
  | "existing_renderer_read"
  | "assets_inventoried"
  | "generic_ui_checked"
  | "proof_visible"
  | "aang_cortana_route_visible"
  | "copy_voice_checked"
  | "motion_has_function"
  | "placeholder_named"
  | "visual_check_recorded";

const TARGET_TYPES: TargetType[] = ["keep", "workbench", "ledger", "settings", "deck", "prototype", "copy", "asset", "other"];
const REVIEW_STATUSES: ReviewStatus[] = ["needs_review", "ready_for_patch", "blocked", "passed_local_review"];

export default function DesignReviewPanel({ onClose }: { onClose: () => void }) {
  const plan = trpc.designReview.plan.useQuery();
  const reviews = trpc.designReview.list.useQuery({ limit: 30 });
  const projects = trpc.projectIntelligence.overview.useQuery();
  const [receiptPickerOpen, setReceiptPickerOpen] = useState(false);
  const evidencePicker = trpc.workbench.evidencePicker.useQuery(
    { limit: 80 },
    {
      enabled: receiptPickerOpen,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  );
  const utils = trpc.useUtils();
  const createReview = trpc.designReview.create.useMutation({
    onSuccess: () => {
      utils.designReview.list.invalidate();
    },
  });

  const [targetType, setTargetType] = useState<TargetType>("keep");
  const [targetLabel, setTargetLabel] = useState("");
  const [projectId, setProjectId] = useState<number | "none">("none");
  const [evidenceId, setEvidenceId] = useState<number | "none">("none");
  const [status, setStatus] = useState<ReviewStatus>("needs_review");
  const [checked, setChecked] = useState<ChecklistKey[]>(["design_md_loaded"]);
  const [violations, setViolations] = useState("");
  const [nextActions, setNextActions] = useState("");
  const [proofSummary, setProofSummary] = useState("");

  const projectOptions = useMemo(
    () => (projects.data?.projects ?? []).filter((project) => project.tasks.projectId != null),
    [projects.data?.projects],
  );

  const planData = plan.data;

  function toggleChecklist(key: ChecklistKey) {
    setChecked((current) => current.includes(key)
      ? current.filter((item) => item !== key)
      : [...current, key]);
  }

  function submitReview() {
    const cleanTarget = targetLabel.trim();
    const cleanProof = proofSummary.trim();
    const nextActionList = lines(nextActions);
    if (!cleanTarget || !cleanProof || nextActionList.length === 0 || createReview.isPending) return;
    createReview.mutate({
      targetType,
      targetLabel: cleanTarget,
      projectId: projectId === "none" ? null : projectId,
      evidenceId: evidenceId === "none" ? null : evidenceId,
      status,
      checklist: checked,
      violations: lines(violations),
      nextActions: nextActionList,
      proofSummary: cleanProof,
    }, {
      onSuccess: () => {
        setTargetLabel("");
        setEvidenceId("none");
        setViolations("");
        setNextActions("");
        setProofSummary("");
        setStatus("needs_review");
        setChecked(["design_md_loaded"]);
      },
    });
  }

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background: C.background, color: C.textPrimary }}>
      <header className="shrink-0 px-3 py-2" style={{ borderBottom: `1px solid ${C.borderSoft}`, background: C.backgroundSoft }}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-[13px] font-bold uppercase tracking-widest">Design Review</h2>
            <p className="mt-0.5 text-[11px]" style={{ color: C.textMuted }}>
              Gojo review loop. Local records only.
            </p>
          </div>
          <Button
            type="button"
            onClick={onClose}
            aria-label="Close design review"
            variant="outline"
            size="sm"
          >
            Close
          </Button>
        </div>
        <div role="status" aria-live="polite" className="mt-2 text-[11px]" style={{ color: C.textMuted }}>
          {plan.isLoading ? "Reading design policy." : "Policy loaded. No screenshot, browser, command, or file action started."}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-3" aria-label="Design review workspace">
        {!planData ? (
          <div className="rounded p-3 text-sm" style={{ background: C.surface, border: `1px solid ${C.borderSoft}`, color: C.textMuted }}>
            Loading design review policy.
          </div>
        ) : (
          <div className="grid gap-2 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="grid gap-2 content-start">
              <section className="rounded p-2" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
                <div className="mb-2 flex flex-wrap gap-1">
                  <Chip label={planData.mode.replace(/_/g, " ")} tone={C.warning} />
                  <Chip label={planData.ownerAgent} tone={C.accent} />
                  <Chip label={planData.writesExternal ? "external write" : "local only"} tone={planData.writesExternal ? C.danger : C.success} />
                  <Chip label={planData.opensBrowser ? "browser opens" : "no browser"} tone={planData.opensBrowser ? C.danger : C.success} />
                  <Chip label={planData.executesCommand ? "commands run" : "no command run"} tone={planData.executesCommand ? C.danger : C.success} />
                </div>
                <div className="grid gap-2 lg:grid-cols-2">
                  <div>
                    <h3 className="mb-1.5 text-[10px] font-bold uppercase tracking-widest" style={{ color: C.textMuted }}>Source Files</h3>
                    <div className="grid gap-1">
                      {planData.sourceFiles.map((file) => (
                        <div key={file} className="rounded px-2 py-1 text-[11px] font-mono" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}`, color: C.textSecondary }}>
                          {file}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="mb-1.5 text-[10px] font-bold uppercase tracking-widest" style={{ color: C.textMuted }}>Route</h3>
                    <div className="grid gap-1">
                      {planData.routeChain.map((step, index) => (
                        <div key={step} className="rounded px-2 py-1 text-[11px]" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}`, color: C.textSecondary }}>
                          {index + 1}. {step}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded p-2" aria-label="Create design review" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-[11px] font-bold uppercase tracking-widest">Record Review</h3>
                    <p className="mt-0.5 text-[11px]" style={{ color: C.textMuted }}>
                      Local checklist. Link a Workbench receipt when the body exists.
                    </p>
                  </div>
                  <Chip label="append only" tone={C.success} />
                </div>

                <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                  <Select value={targetType} onValueChange={(value) => setTargetType(value as TargetType)}>
                    <SelectTrigger aria-label="Design review target type" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TARGET_TYPES.map((type) => <SelectItem key={type} value={type}>{labelize(type)}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={status} onValueChange={(value) => setStatus(value as ReviewStatus)}>
                    <SelectTrigger aria-label="Design review status" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {REVIEW_STATUSES.map((item) => <SelectItem key={item} value={item}>{labelize(item)}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Input value={targetLabel} onChange={(event) => setTargetLabel(event.target.value)} aria-label="Design review target label" placeholder="Target, such as Workbench receipt detail." />
                  <Select value={String(projectId)} onValueChange={(value) => setProjectId(value === "none" ? "none" : Number(value))}>
                    <SelectTrigger aria-label="Design review project" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No project</SelectItem>
                      {projectOptions.map((project) => (
                        <SelectItem key={project.slug} value={String(project.tasks.projectId ?? "none")}>{project.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={String(evidenceId)}
                    onValueChange={(value) => setEvidenceId(value === "none" ? "none" : Number(value))}
                    onOpenChange={setReceiptPickerOpen}
                  >
                    <SelectTrigger aria-label="Linked Workbench receipt" className="w-full sm:col-span-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No receipt link</SelectItem>
                      {(evidencePicker.data?.items ?? []).map((item) => (
                        <SelectItem key={item.id} value={String(item.id)}>
                        #{item.id} {item.kind.replace(/_/g, " ")} {item.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="text-[11px] sm:col-span-2" style={{ color: C.textMuted }}>
                    {evidencePicker.isLoading ? "Reading local receipt links." : "Receipt links read when the selector opens."}
                  </div>
                </div>

                <div className="mt-2 rounded p-2" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}>
                  <h4 className="mb-1.5 text-[10px] font-bold uppercase tracking-widest" style={{ color: C.textPrimary }}>Checklist</h4>
                  <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                    {planData.checklist.map((item) => (
                      <label key={item.key} className="flex items-center gap-2 text-[11px] leading-snug" style={{ color: C.textSecondary }}>
                        <Checkbox
                          checked={checked.includes(item.key)}
                          onCheckedChange={() => toggleChecklist(item.key)}
                          aria-label={`Toggle ${item.label}`}
                          title={`Toggle local design checklist item: ${item.label}`}
                        />
                        {item.label}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mt-2 grid gap-1.5">
                  <Textarea value={proofSummary} onChange={(event) => setProofSummary(event.target.value)} aria-label="Design review receipt summary" placeholder="What was checked. Name the receipt or say what receipt is missing." rows={3} />
                  <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                    <Textarea value={violations} onChange={(event) => setViolations(event.target.value)} aria-label="Design review violations" placeholder="Violations, one per line. Leave blank only if none were found." rows={3} />
                    <Textarea value={nextActions} onChange={(event) => setNextActions(event.target.value)} aria-label="Design review next actions" placeholder="Next actions, one per line. Required." rows={3} />
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between gap-2">
                  <div role="status" aria-live="polite" className="text-[11px]" style={{ color: C.textMuted }}>
                    {createReview.data?.ok ? `Saved review #${createReview.data.review.id}. No external action.` : "Review records append. They do not patch code."}
                  </div>
                  <Button
                    type="button"
                    onClick={submitReview}
                    disabled={!targetLabel.trim() || !proofSummary.trim() || lines(nextActions).length === 0 || createReview.isPending}
                    title={
                      !targetLabel.trim() || !proofSummary.trim() || lines(nextActions).length === 0
                        ? "Add target, summary, and next actions before saving the local design review."
                        : "Save a local design review receipt. This does not patch code or open tools."
                    }
                    aria-label="Save local design review"
                    variant="default"
                  >
                    {createReview.isPending ? "Saving" : "Save Review"}
                  </Button>
                </div>
              </section>

              <section className="grid gap-2" aria-label="Design review gates">
                {planData.gates.map((gate) => (
                  <div key={gate} className="rounded px-2 py-1.5 text-[11px]" style={{ background: C.surface, border: `1px solid ${C.borderSoft}`, color: C.textMuted }}>
                    {gate}
                  </div>
                ))}
              </section>
            </div>

            <aside className="h-fit rounded p-2 xl:sticky xl:top-3" aria-label="Recent design reviews" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
              <div className="mb-2 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-[11px] font-bold uppercase tracking-widest">Recent Reviews</h3>
                  <p className="mt-0.5 text-[11px]" style={{ color: C.textMuted }}>
                    Local design receipt ledger.
                  </p>
                </div>
                <Chip label={`${reviews.data?.summary.total ?? 0} shown`} tone={C.textMuted} />
              </div>
              {(reviews.data?.items ?? []).length === 0 ? (
                <div className="rounded px-2 py-2 text-[11px]" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}`, color: C.textMuted }}>
                  No design reviews yet. Record the first one after checking `DESIGN.md`.
                </div>
              ) : (
                <div className="grid gap-1.5">
                  {reviews.data?.items.map((review) => (
                    <article key={review.id} className="rounded p-2" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}>
                      <div className="flex flex-wrap gap-1">
                        <Chip label={`#${review.id}`} tone={C.textMuted} />
                        <Chip label={labelize(review.targetType)} tone={C.accent} />
                        <Chip label={labelize(review.status)} tone={review.status === "blocked" ? C.danger : C.warning} />
                        <Chip label={review.checklistScore} tone={C.gold} />
                        {review.evidenceId != null && <Chip label={`receipt #${review.evidenceId}`} tone={C.success} />}
                      </div>
                      <h4 className="mt-1.5 text-[11px] font-semibold" style={{ color: C.textPrimary }}>{review.targetLabel}</h4>
                      <p className="mt-1 max-h-[34px] overflow-hidden text-[11px] leading-snug" style={{ color: C.textMuted }}>{review.proofSummary}</p>
                      {review.violations.length > 0 && (
                        <div className="mt-1.5 grid gap-0.5">
                          {review.violations.slice(0, 3).map((violation) => (
                            <div key={violation} className="text-[11px]" style={{ color: C.warning }}>{violation}</div>
                          ))}
                        </div>
                      )}
                      <div className="mt-1.5 text-[11px]" style={{ color: C.textMuted }}>
                        {review.nextActions[0]}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}

function Chip({ label, tone }: { label: string; tone: string }) {
  const variant = tone === C.danger
    ? "destructive"
    : tone === C.warning || tone === C.gold
      ? "warning"
      : tone === C.success
        ? "success"
        : tone === C.accentViolet || tone === C.glowViolet
          ? "violet"
          : tone === C.accent
            ? "default"
            : "secondary";

  return (
    <Badge variant={variant} className="uppercase">
      {label}
    </Badge>
  );
}

function lines(value: string) {
  return value.split("\n").map((line) => line.trim()).filter(Boolean);
}

function labelize(value: string) {
  return value.replace(/_/g, " ");
}
