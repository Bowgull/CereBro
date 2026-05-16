import { useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import { sourceDisplayName } from "@/lib/displayLabels";
import { cerebroColors as C } from "@/lib/keepConfig";
import { Badge as UiBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select as UiSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const CAPABILITY_KINDS = [
  "text_reasoning",
  "coding",
  "vision",
  "image_generation",
  "video_frames",
  "ocr",
  "research",
  "spreadsheet",
  "document",
  "browser_tool",
  "gateway",
] as const;

const ACCESS_METHODS = ["local", "direct_api", "gateway", "web_handoff", "browser_assisted", "manual_copy_paste"] as const;
const PRIVACY_CLASSES = ["local_private", "public_safe", "limited_external", "sensitive_review", "blocked_sensitive", "unknown"] as const;
const APPROVAL_LEVELS = ["none", "confirm_each_use", "explicit_approval", "account_setup_required", "blocked"] as const;
const EVAL_STATUS_FILTERS = ["all", "untested", "source_verified", "tested_pass", "tested_mixed", "tested_fail", "stale"] as const;
const EVAL_OUTCOMES = ["recorded", "pass", "mixed", "fail", "blocked"] as const;

type CapabilityKind = (typeof CAPABILITY_KINDS)[number];
type EvalStatusFilter = (typeof EVAL_STATUS_FILTERS)[number];
type PrivacyClass = (typeof PRIVACY_CLASSES)[number];

function labelize(value: string) {
  return value.replace(/_/g, " ");
}

function splitSourceUris(value: string | null | undefined) {
  return (value ?? "")
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatTime(unixSec: number) {
  return new Date(unixSec * 1000).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function toneForPrivacy(value: string) {
  if (value === "local_private") return C.success;
  if (value === "public_safe") return C.accent;
  if (value === "limited_external") return C.warning;
  if (value === "sensitive_review" || value === "blocked_sensitive") return C.danger;
  return C.textMuted;
}

function toneForSourceReadiness(value: string) {
  if (value === "eval_ready" || value === "source_ready") return C.success;
  if (value === "blocked") return C.danger;
  if (value === "needs_source_review") return C.warning;
  return C.textMuted;
}

export default function ModelToolsPanel({ onClose, onNavigate }: { onClose: () => void; onNavigate?: (route: "approvals") => void }) {
  const utils = trpc.useUtils();
  const [kind, setKind] = useState<CapabilityKind | "all">("all");
  const [evalStatus, setEvalStatus] = useState<EvalStatusFilter>("all");
  const [providerFilter, setProviderFilter] = useState("");
  const [selectedCapabilityId, setSelectedCapabilityId] = useState<number | null>(null);
  const [lastWrite, setLastWrite] = useState<string | null>(null);

  const [provider, setProvider] = useState("");
  const [toolName, setToolName] = useState("");
  const [newKind, setNewKind] = useState<CapabilityKind>("text_reasoning");
  const [accessMethod, setAccessMethod] = useState<(typeof ACCESS_METHODS)[number]>("manual_copy_paste");
  const [privacyClass, setPrivacyClass] = useState<PrivacyClass>("unknown");
  const [approvalLevel, setApprovalLevel] = useState<(typeof APPROVAL_LEVELS)[number]>("explicit_approval");
  const [sourceUris, setSourceUris] = useState("");
  const [strengths, setStrengths] = useState("");
  const [weaknesses, setWeaknesses] = useState("");

  const [routeTask, setRouteTask] = useState("screenshot vision review");
  const [routeModality, setRouteModality] = useState("image");
  const [routePrivacy, setRoutePrivacy] = useState<PrivacyClass>("sensitive_review");
  const [requiresFrontier, setRequiresFrontier] = useState(false);

  const [evalTaskKey, setEvalTaskKey] = useState("handoff_prompt_gate");
  const [evalSummary, setEvalSummary] = useState("");
  const [evalOutcome, setEvalOutcome] = useState<(typeof EVAL_OUTCOMES)[number]>("recorded");
  const [evalNotes, setEvalNotes] = useState("");
  const [evalNotesOpen, setEvalNotesOpen] = useState(false);
  const [ollamaStatusOpen, setOllamaStatusOpen] = useState(false);
  const [routePreviewInput, setRoutePreviewInput] = useState<{
    taskKind: string;
    modality?: string;
    privacyClass: PrivacyClass;
    requiresFrontier: boolean;
  } | null>(null);

  const policy = trpc.modelTools.policy.useQuery();
  const capabilities = trpc.modelTools.capabilities.useQuery({
    capabilityKind: kind === "all" ? undefined : kind,
    evalStatus: evalStatus === "all" ? undefined : evalStatus,
    provider: providerFilter.trim() || undefined,
    limit: 80,
  });
  const ollamaStatusApprovals = trpc.modelTools.ollamaStatusApprovalPreviews.useQuery(
    { limit: 5 },
    {
      enabled: ollamaStatusOpen,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  );
  const routePreview = trpc.modelTools.routePreview.useQuery(
    routePreviewInput ?? {
      taskKind: "general routing preview",
      privacyClass: "unknown",
      requiresFrontier: false,
    },
    {
      enabled: routePreviewInput != null,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  );

  const createCapability = trpc.modelTools.proposeCapability.useMutation({
    onSuccess: (result) => {
      setLastWrite(`Created local capability proposal ${result.capability.id}.`);
      setSelectedCapabilityId(result.capability.id);
      setProvider("");
      setToolName("");
      setSourceUris("");
      setStrengths("");
      setWeaknesses("");
      utils.modelTools.capabilities.invalidate();
    },
  });
  const recordEval = trpc.modelTools.recordEval.useMutation({
    onSuccess: (result) => {
      setLastWrite(`Recorded local eval note ${result.eval.id}.`);
      setEvalSummary("");
      setEvalNotes("");
      utils.modelTools.evals.invalidate();
    },
  });
  const createOllamaStatusApproval = trpc.modelTools.createOllamaStatusApprovalPreview.useMutation({
    onSuccess: (result) => {
      setLastWrite(
        result.approval
          ? `Staged Ollama status approval preview ${result.approval.id}.`
          : "Ollama status approval preview did not return a record.",
      );
      utils.modelTools.ollamaStatusApprovalPreviews.invalidate();
      utils.approvals.list.invalidate();
      utils.approvals.permissionPreflights.invalidate();
    },
  });

  const rows = capabilities.data?.items ?? [];
  const groupedRows = useMemo(() => {
    const groups = new Map<string, { key: string; representative: (typeof rows)[number]; count: number }>();
    for (const item of rows) {
      const key = [
        item.provider,
        item.toolName,
        item.capabilityKind,
        item.accessMethod,
        item.privacyClass,
        item.approvalLevel,
        item.evalStatus,
      ].join("::");
      const existing = groups.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        groups.set(key, { key, representative: item, count: 1 });
      }
    }
    return Array.from(groups.values());
  }, [rows]);
  const selectedCapability = rows.find((item) => item.id === selectedCapabilityId) ?? groupedRows[0]?.representative ?? null;
  const evals = trpc.modelTools.evals.useQuery(
    {
      capabilityId: selectedCapability?.id,
      limit: 80,
    },
    {
      enabled: evalNotesOpen && selectedCapability != null,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  );
  const policyData = policy.data;
  const localEvalTasks = policyData?.evalTasks ?? [];
  const route = routePreview.data;
  const summary = policyData?.capabilityMapSummary;

  const registryCounts = useMemo(() => {
    const untested = rows.filter((item) => item.evalStatus === "untested").length;
    const blocked = rows.filter((item) => item.approvalLevel === "blocked" || item.privacyClass === "blocked_sensitive").length;
    const external = rows.filter((item) => item.accessMethod !== "local").length;
    return { untested, blocked, external };
  }, [rows]);

  function submitCapability(event: React.FormEvent) {
    event.preventDefault();
    const trimmedProvider = provider.trim();
    const trimmedToolName = toolName.trim();
    if (!trimmedProvider || !trimmedToolName || createCapability.isPending) return;
    createCapability.mutate({
      provider: trimmedProvider,
      toolName: trimmedToolName,
      capabilityKind: newKind,
      accessMethod,
      privacyClass,
      approvalLevel,
      sourceUris: sourceUris.trim() || undefined,
      strengths: strengths.trim() || undefined,
      weaknesses: weaknesses.trim() || undefined,
      riskReview: privacyClass === "sensitive_review" ? "Oak/Spock review required before use." : undefined,
    });
  }

  function submitEval(event: React.FormEvent) {
    event.preventDefault();
    const trimmedSummary = evalSummary.trim();
    if (!trimmedSummary || recordEval.isPending) return;
    recordEval.mutate({
      capabilityId: selectedCapability?.id,
      evalTaskKey,
      taskSummary: trimmedSummary,
      expectedSignal: localEvalTasks.find((task) => task.key === evalTaskKey)?.expectedSignal,
      status: evalOutcome,
      evaluatorAgent: "spock",
      validationNotes: evalNotes.trim() || undefined,
      privacyNotes: "Local eval note only. No provider call was made.",
    });
  }

  function readRoutePreview() {
    setRoutePreviewInput({
      taskKind: routeTask.trim() || "general routing preview",
      modality: routeModality.trim() || undefined,
      privacyClass: routePrivacy,
      requiresFrontier,
    });
  }

  return (
    <div className="flex h-full flex-col overflow-hidden" style={{ background: C.background, border: `1px solid ${C.borderSoft}`, color: C.textPrimary }}>
      <header className="shrink-0 px-3 py-2" style={{ borderBottom: `1px solid ${C.borderSoft}`, background: C.backgroundSoft }}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-[13px] font-bold uppercase tracking-widest">Basement Model Registry</h2>
            <p className="text-[11px] mt-0.5" style={{ color: C.textMuted }}>
              Capability proposals, route previews, and local eval notes. No provider calls.
            </p>
          </div>
          <Button
            type="button"
            onClick={onClose}
            aria-label="Close Model Tools"
            variant="outline"
            size="sm"
          >
            Close
          </Button>
        </div>

        <div className="mt-2 grid grid-cols-1 gap-1.5 sm:grid-cols-2 xl:grid-cols-5" aria-label="Model registry status">
          <StatusBlock label="Mode" value={policyData?.mode ?? "proposal_only"} tone={C.textSecondary} />
          <StatusBlock label="External calls" value={policyData?.callsExternalModels ? "yes" : "no"} tone={policyData?.callsExternalModels ? C.danger : C.success} />
          <StatusBlock label="Registry rows" value={String(summary?.totalRecords ?? rows.length)} tone={summary?.totalRecords ? C.accent : C.textMuted} />
          <StatusBlock label="Eval notes" value={String(summary?.evalNotes ?? 0)} tone={summary?.evalNotes ? C.success : C.textMuted} />
          <StatusBlock label="Blocked" value={String(summary?.blockedRecords ?? registryCounts.blocked)} tone={(summary?.blockedRecords ?? registryCounts.blocked) ? C.danger : C.success} />
        </div>

        {lastWrite && (
          <div className="mt-2 rounded p-2 text-[11px]" role="status" aria-live="polite" style={{ color: C.success, background: C.surface, border: `1px solid ${C.borderSoft}` }}>
            {lastWrite} No model, tool, gateway, browser, fetch, account, token, or install action ran.
          </div>
        )}
      </header>

      <main className="flex-1 overflow-y-auto p-3 space-y-2" aria-label="Model Tools registry" aria-busy={policy.isLoading || capabilities.isLoading}>
        <section className="rounded p-2" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
          <SectionTitle title="Configuration Rules" detail="machine boundary" />
          <div className="mt-2 grid gap-1.5 md:grid-cols-3">
            <MachineRule title="Fast Shell" body={policyData?.speedStance ?? "Instant shell. Route first. Run slow work in visible background lanes."} tone={C.success} />
            <MachineRule title="Source First" body="A source URL is a signal, not trust. Surfer and Oak still validate current claims." tone={C.warning} />
            <MachineRule title="Approval" body="External model/tool use needs a visible action receipt before it runs." tone={C.danger} />
          </div>
        </section>

        <section className="rounded p-2" aria-label="Model tool capability map" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
          <SectionTitle title="Capability Map" detail={policyData?.registryStatus ? labelize(policyData.registryStatus) : "proposal only"} />
          <div className="mt-2 grid gap-1.5 xl:grid-cols-4">
            {(policyData?.capabilityMap ?? []).map((lane) => (
              <CapabilityMapCard key={lane.id} lane={lane} />
            ))}
          </div>
          <div className="mt-2 grid gap-1.5 sm:grid-cols-4">
            <StatusBlock label="Untested" value={String(summary?.untestedRecords ?? registryCounts.untested)} tone={(summary?.untestedRecords ?? registryCounts.untested) ? C.warning : C.success} />
            <StatusBlock label="Tested" value={String(summary?.testedRecords ?? 0)} tone={summary?.testedRecords ? C.success : C.textMuted} />
            <StatusBlock label="External" value={String(summary?.externalRecords ?? registryCounts.external)} tone={(summary?.externalRecords ?? registryCounts.external) ? C.warning : C.textMuted} />
            <StatusBlock label="No action" value="read only" tone={C.success} />
          </div>
          <div className="mt-2 rounded p-2 text-[11px] leading-snug" style={{ color: C.textMuted, background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}>
            {policyData?.registryShape.rule ?? "A capability is a proposal until source-verified or eval-tested."}
          </div>
        </section>

        <section className="rounded p-2" aria-label="Model tool source verification gate" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
          <SectionTitle title="Source Verification Gate" detail={policyData?.sourceVerificationGate?.mode ?? "read only"} />
          <div className="mt-2 grid gap-1.5 md:grid-cols-4">
            <StatusBlock label="Missing sources" value={String(summary?.sourceReadiness?.missingSources ?? 0)} tone={(summary?.sourceReadiness?.missingSources ?? 0) > 0 ? C.warning : C.success} />
            <StatusBlock label="Needs review" value={String(summary?.sourceReadiness?.needsSourceReview ?? 0)} tone={(summary?.sourceReadiness?.needsSourceReview ?? 0) > 0 ? C.warning : C.success} />
            <StatusBlock label="Source ready" value={String(summary?.sourceReadiness?.sourceReady ?? 0)} tone={(summary?.sourceReadiness?.sourceReady ?? 0) > 0 ? C.success : C.textMuted} />
            <StatusBlock label="Eval ready" value={String(summary?.sourceReadiness?.evalReady ?? 0)} tone={(summary?.sourceReadiness?.evalReady ?? 0) > 0 ? C.success : C.textMuted} />
          </div>
          <div className="mt-2 grid gap-1.5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <MachineRule
              title="Trust Rule"
              body={policyData?.sourceVerificationGate?.nextAction ?? "Review sources locally before a capability can become a route default."}
              tone={C.warning}
            />
            <MachineRule
              title="No Action"
              body={policyData?.sourceVerificationGate?.noActionTaken?.join(" ") ?? "No browser, search, fetch, provider, model, gateway, install, token, or account action ran."}
              tone={C.success}
            />
          </div>
        </section>

        <section className="rounded p-2" aria-label="Local model lanes" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
          <SectionTitle title="Local Model Lanes" detail="fast local first" />
          <div className="mt-2 rounded p-2 text-[11px] leading-snug" style={{ color: C.textSecondary, background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}>
            {policyData?.routingStance ?? "Use local lanes first when they are fast and strong enough. Escalate only with approval."}
          </div>
          <div className="mt-2 grid gap-1.5 lg:grid-cols-2">
            {(policyData?.localModelLanes ?? []).map((lane) => (
              <div
                key={lane.id}
                className="rounded p-2 text-[11px] leading-snug"
                style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate text-xs font-bold uppercase tracking-widest" title={lane.label}>{lane.label}</div>
                    <div className="mt-0.5 truncate" style={{ color: C.textMuted }} title={`${lane.ownerAgent}. ${lane.tool}. ${lane.modelClass}.`}>
                      {lane.ownerAgent}. {lane.tool}. {labelize(lane.modelClass)}.
                    </div>
                  </div>
                  <Badge label={labelize(lane.installStatus)} tone={lane.installStatus === "not_verified" ? C.warning : C.success} />
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  <Badge label={labelize(lane.speedClass)} tone={C.success} />
                  <Badge label={labelize(lane.privacyClass)} tone={toneForPrivacy(lane.privacyClass)} />
                  <Badge label={labelize(lane.status)} tone={C.textSecondary} />
                </div>
                <div className="mt-2 space-y-1">
                  <Field label="Use" value={lane.defaultUse} />
                  <Field label="Avoid" value={lane.avoidFor} />
                  <Field label="Gate" value={lane.approvalGate} />
                  <Field label="UI" value={lane.uiRule} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {policyData?.ollamaSetupPlan && (
          <section className="rounded p-2" aria-label="Ollama setup readiness" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
            <SectionTitle title="Ollama Setup" detail={labelize(policyData.ollamaSetupPlan.status)} />
            <div className="mt-2 grid gap-1.5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
              <div className="rounded p-2 text-[11px] leading-snug" style={{ color: C.textSecondary, background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}>
                <div className="flex flex-wrap gap-1">
                  <Badge label={labelize(policyData.ollamaSetupPlan.executionMode)} tone={C.warning} />
                  <Badge label="no install ran" tone={C.success} />
                </div>
                <div className="mt-2 space-y-1">
                  <Field label="Hardware" value={policyData.ollamaSetupPlan.hardwareStance} />
                  <Field label="Storage" value={policyData.ollamaSetupPlan.storageRule} />
                  <Field label="UI" value={policyData.ollamaSetupPlan.uiRule} />
                </div>
              </div>
              <div className="rounded p-2 text-[11px] leading-snug" style={{ color: C.textSecondary, background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}>
                <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: C.textMuted }}>No Action Taken</div>
                <div className="mt-1 grid gap-1">
                  {policyData.ollamaSetupPlan.noActionTaken.map((item) => (
                    <div key={item}>{item}</div>
                  ))}
                </div>
              </div>
            </div>

            <details
              className="mt-2 rounded p-2 text-[11px] leading-snug"
              onToggle={(event) => setOllamaStatusOpen(event.currentTarget.open)}
              style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}
            >
              <summary className="cursor-pointer">
                <span className="flex flex-wrap items-start justify-between gap-2">
                  <span>
                    <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: C.gold }}>Install Status Check</span>
                    <span className="mt-1 block" style={{ color: C.textSecondary }}>{policyData.ollamaSetupPlan.installStatusCheck.approvalGate}</span>
                  </span>
                  <Badge label={labelize(policyData.ollamaSetupPlan.installStatusCheck.status)} tone={C.warning} />
                </span>
              </summary>
              <div className="mt-2 grid gap-1.5 md:grid-cols-3">
                <StatusList title="Allowed" items={policyData.ollamaSetupPlan.installStatusCheck.allowedCommands} tone={C.success} />
                <StatusList title="Forbidden" items={policyData.ollamaSetupPlan.installStatusCheck.forbiddenCommands} tone={C.danger} />
                <StatusList title="Receipt" items={policyData.ollamaSetupPlan.installStatusCheck.receiptFields} tone={C.accent} />
              </div>
              <div className="mt-2 grid gap-1.5 md:grid-cols-2">
                <Field label="If missing" value={policyData.ollamaSetupPlan.installStatusCheck.nextStateIfMissing} />
                <Field label="If present" value={policyData.ollamaSetupPlan.installStatusCheck.nextStateIfPresent} />
              </div>
              <div className="mt-2" style={{ color: C.textMuted }}>{policyData.ollamaSetupPlan.installStatusCheck.noActionTaken}</div>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => createOllamaStatusApproval.mutate({ reason: "User-visible approval preview for Ollama install-status check. No command runs from this button." })}
                  disabled={createOllamaStatusApproval.isPending}
                  title="Stage a local approval preview. This does not run command -v, ollama --version, ollama list, install, or pull."
                  aria-label="Stage Ollama status check approval preview"
                >
                  {createOllamaStatusApproval.isPending ? "Staging" : "Stage Approval Preview"}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => onNavigate?.("approvals")}
                  disabled={!onNavigate}
                  title="Open the local Approval Queue. This does not approve or execute the status check."
                  aria-label="Open Approval Queue for Ollama status approval previews"
                >
                  Open Approval Queue
                </Button>
                <Badge
                  label={ollamaStatusOpen ? `pending ${ollamaStatusApprovals.data?.items.filter((item) => item.status === "pending").length ?? 0}` : "open to read"}
                  tone={ollamaStatusOpen ? C.warning : C.textMuted}
                />
              </div>
              <div className="mt-2 grid gap-1">
                {ollamaStatusApprovals.isLoading ? (
                  <div style={{ color: C.textMuted }}>Reading local approval previews.</div>
                ) : (ollamaStatusApprovals.data?.items ?? []).length === 0 ? (
                  <div style={{ color: C.textMuted }}>No local approval previews staged for this check.</div>
                ) : ollamaStatusApprovals.data?.items.map((item) => (
                  <div key={item.id} className="rounded p-1.5" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-semibold uppercase tracking-wider" style={{ color: C.textPrimary }}>Approval #{item.id}</span>
                      <Badge label={labelize(item.status)} tone={item.status === "pending" ? C.warning : C.textSecondary} />
                    </div>
                    <div className="mt-1" style={{ color: C.textMuted }}>{item.reason ?? "Local approval preview only."}</div>
                  </div>
                ))}
              </div>
            </details>

            <details className="mt-2 rounded p-2" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}>
              <summary className="cursor-pointer text-[10px] font-bold uppercase tracking-widest" style={{ color: C.textPrimary }}>
                Model Batches
              </summary>
              <div className="mt-2 grid gap-1.5 lg:grid-cols-2">
              <ModelBatch title="First Approval Batch" items={policyData.ollamaSetupPlan.firstApprovalBatch} />
              <ModelBatch title="Stretch Candidates" items={policyData.ollamaSetupPlan.stretchCandidates} />
              </div>
            </details>

            <details className="mt-2 rounded p-2 text-[11px] leading-snug" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}>
              <summary className="cursor-pointer text-[10px] font-bold uppercase tracking-widest" style={{ color: C.danger }}>Do Not Start With</summary>
              <div className="mt-1 flex flex-wrap gap-1">
                {policyData.ollamaSetupPlan.blockedFirstInstalls.map((item) => (
                  <Badge key={item} label={item} tone={C.danger} />
                ))}
              </div>
            </details>
          </section>
        )}

        <section className="rounded p-2" aria-label="Creative tool lanes" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
          <SectionTitle title="Creative Lanes" detail="proposal only" />
          <div className="mt-2 grid gap-1.5 lg:grid-cols-4">
            {(policyData?.creativeLanes ?? []).map((lane) => (
              <div
                key={lane.id}
                className="rounded p-2 text-[11px] leading-snug"
                style={{
                  background: C.surfaceMuted,
                  border: `1px solid ${lane.privacyLane === "sealed_private" ? C.danger : C.borderSoft}`,
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate text-xs font-bold uppercase tracking-widest" title={lane.label}>{lane.label}</div>
                    <div className="mt-0.5 truncate" style={{ color: C.textMuted }} title={`${lane.ownerAgent}. ${lane.tool}.`}>
                      {lane.ownerAgent}. {lane.tool}.
                    </div>
                  </div>
                  <Badge label={labelize(lane.installStatus)} tone={lane.installStatus === "not_installed" ? C.warning : C.textSecondary} />
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  <Badge label={labelize(lane.privacyLane)} tone={lane.privacyLane === "sealed_private" ? C.danger : C.success} />
                  <Badge label={labelize(lane.accessMethod)} tone={C.textSecondary} />
                </div>
                <div className="mt-2 space-y-1">
                  <Field label="Gate" value={lane.approvalGate} />
                  <Field label="Output" value={lane.outputBoundary} />
                  <Field label="Memory" value={lane.memoryPolicy} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-2 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
          <div className="rounded p-2 space-y-2" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
            <SectionTitle title="Registry" detail={`${summary?.totalRecords ?? rows.length} proposals. ${groupedRows.length} visible groups`} />
            <div className="grid gap-1.5 md:grid-cols-[minmax(0,1fr)_150px_150px]">
              <Input
                value={providerFilter}
                onChange={(event) => setProviderFilter(event.target.value)}
                aria-label="Filter model tools by provider"
                placeholder="Filter provider."
              />
              <AppSelect
                label="Capability"
                value={kind}
                onChange={(value) => setKind(value as CapabilityKind | "all")}
                options={["all", ...CAPABILITY_KINDS]}
              />
              <AppSelect
                label="Eval status"
                value={evalStatus}
                onChange={(value) => setEvalStatus(value as EvalStatusFilter)}
                options={EVAL_STATUS_FILTERS}
              />
            </div>

            <div className="grid gap-1.5" role="list" aria-label="Model tool capability proposals">
              {capabilities.isLoading ? (
                <div className="text-xs" style={{ color: C.textMuted }}>Reading local registry.</div>
              ) : groupedRows.length === 0 ? (
                <div className="rounded p-2 text-[11px] leading-snug" style={{ color: C.textMuted, background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}>
                  No local capability proposals match these filters.
                </div>
              ) : groupedRows.map(({ key, representative: item, count }) => (
                <Button
                  key={key}
                  type="button"
                  onClick={() => setSelectedCapabilityId(item.id)}
                  aria-label={`Inspect model tool capability ${item.id}`}
                  aria-pressed={selectedCapability?.id === item.id}
                  title={`Inspect local model/tool proposal ${item.id}. No provider or tool call runs.`}
                  variant="outline"
                  className="h-auto justify-start whitespace-normal p-2 text-left"
                  role="listitem"
                  style={{
                    background: selectedCapability?.id === item.id ? C.surfaceRaised : C.surfaceMuted,
                    border: `1px solid ${selectedCapability?.id === item.id ? C.accent : C.borderSoft}`,
                  }}
                >
                  <span className="block w-full min-w-0">
                    <span className="flex items-start justify-between gap-2">
                      <span className="min-w-0">
                        <span className="block truncate text-xs font-bold uppercase tracking-widest">{item.provider}</span>
                        <span className="mt-1 block truncate text-xs font-semibold" title={item.toolName}>{item.toolName}</span>
                      </span>
                      <span className="flex shrink-0 flex-wrap justify-end gap-1">
                        {count > 1 && <Badge label={`${count} copies`} tone={C.warning} />}
                        <Badge label={labelize(item.evalStatus)} tone={item.evalStatus === "untested" ? C.warning : C.success} />
                        <Badge label={labelize(item.sourceReadiness.label)} tone={toneForSourceReadiness(item.sourceReadiness.status)} />
                      </span>
                    </span>
                    <span className="mt-1.5 flex flex-wrap gap-1">
                      <Badge label={labelize(item.capabilityKind)} tone={C.accent} />
                      <Badge label={labelize(item.accessMethod)} tone={C.textSecondary} />
                      <Badge label={labelize(item.privacyClass)} tone={toneForPrivacy(item.privacyClass)} />
                    </span>
                  </span>
                </Button>
              ))}
            </div>
          </div>

          <aside className="rounded p-2 space-y-2" aria-label="Selected model tool detail" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
            <SectionTitle title="Detail" detail={selectedCapability ? `proposal ${selectedCapability.id}` : "none"} />
            {selectedCapability ? (
              <div className="grid gap-1.5">
                <Field label="Provider" value={selectedCapability.provider} />
                <Field label="Tool" value={selectedCapability.toolName} />
                <Field label="Approval" value={labelize(selectedCapability.approvalLevel)} />
                <Field label="Source read" value={labelize(selectedCapability.sourceReadiness.label)} />
                <Field label="Next" value={selectedCapability.sourceReadiness.nextStep} />
                <SourceField value={selectedCapability.sourceUris} />
                <StatusList title="Required" items={selectedCapability.sourceReadiness.requiredBeforeTrust} tone={toneForSourceReadiness(selectedCapability.sourceReadiness.status)} />
                <Field label="Strengths" value={selectedCapability.strengths ?? "No strengths recorded."} />
                <Field label="Weaknesses" value={selectedCapability.weaknesses ?? "No weaknesses recorded."} />
                <Field label="Risk" value={selectedCapability.riskReview ?? "No risk review recorded."} />
                <Field label="Updated" value={formatTime(selectedCapability.updatedAt)} />
              </div>
            ) : (
              <div className="text-[11px]" style={{ color: C.textMuted }}>Select a capability proposal.</div>
            )}
          </aside>
        </section>

        <section className="grid gap-2 xl:grid-cols-3">
          <details className="rounded p-2" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
            <summary className="cursor-pointer">
              <SectionTitle title="Propose" detail="local only" />
            </summary>
            <form onSubmit={submitCapability} className="mt-2 space-y-2" aria-label="Create local model tool proposal">
            <Input value={provider} onChange={(event) => setProvider(event.target.value)} aria-label="Model tool provider" placeholder="Provider or tool owner." />
            <Input value={toolName} onChange={(event) => setToolName(event.target.value)} aria-label="Model tool name" placeholder="Model or tool name." />
            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              <AppSelect label="Capability kind" value={newKind} onChange={(value) => setNewKind(value as CapabilityKind)} options={CAPABILITY_KINDS} />
              <AppSelect label="Access method" value={accessMethod} onChange={(value) => setAccessMethod(value as typeof accessMethod)} options={ACCESS_METHODS} />
              <AppSelect label="Privacy class" value={privacyClass} onChange={(value) => setPrivacyClass(value as PrivacyClass)} options={PRIVACY_CLASSES} />
              <AppSelect label="Approval level" value={approvalLevel} onChange={(value) => setApprovalLevel(value as typeof approvalLevel)} options={APPROVAL_LEVELS} />
            </div>
            <Textarea value={sourceUris} onChange={(event) => setSourceUris(event.target.value)} aria-label="Model tool source URLs" placeholder="Source URLs. Required before trust, but still not verified here." rows={2} />
            <Textarea value={strengths} onChange={(event) => setStrengths(event.target.value)} aria-label="Model tool strengths" placeholder="Strengths." rows={2} />
            <Textarea value={weaknesses} onChange={(event) => setWeaknesses(event.target.value)} aria-label="Model tool weaknesses" placeholder="Weaknesses or failure risks." rows={2} />
            <Button
              type="submit"
              disabled={!provider.trim() || !toolName.trim() || createCapability.isPending}
              title={!provider.trim() || !toolName.trim() ? "Enter provider and tool name before creating a local proposal." : "Create a local model/tool proposal. No provider or tool call runs."}
              aria-label="Create local model tool proposal"
              className="w-full"
            >
              {createCapability.isPending ? "Recording" : "Create Proposal"}
            </Button>
            </form>
          </details>

          <details
            className="rounded p-2"
            onToggle={(event) => setEvalNotesOpen(event.currentTarget.open)}
            style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}
          >
            <summary className="cursor-pointer">
              <SectionTitle title="Eval Note" detail={evalNotesOpen ? selectedCapability ? `for ${selectedCapability.id}` : "unlinked" : "open to read"} />
            </summary>
            <form onSubmit={submitEval} className="mt-2 space-y-2" aria-label="Record local model tool eval note">
            <AppSelect label="Eval task" value={evalTaskKey} onChange={setEvalTaskKey} options={localEvalTasks.map((task) => task.key)} />
            <AppSelect label="Eval outcome" value={evalOutcome} onChange={(value) => setEvalOutcome(value as typeof evalOutcome)} options={EVAL_OUTCOMES} />
            <Textarea value={evalSummary} onChange={(event) => setEvalSummary(event.target.value)} aria-label="Model tool eval summary" placeholder="What was checked or blocked." rows={4} />
            <Textarea value={evalNotes} onChange={(event) => setEvalNotes(event.target.value)} aria-label="Model tool validation notes" placeholder="Validation notes. No provider call is made." rows={3} />
            <Button
              type="submit"
              disabled={!evalSummary.trim() || recordEval.isPending}
              title={!evalSummary.trim() ? "Enter an eval summary before recording the local note." : "Record a local eval note. No provider call is made."}
              aria-label="Record local model tool eval note"
              className="w-full"
            >
              {recordEval.isPending ? "Recording" : "Record Eval Note"}
            </Button>
            <div className="grid max-h-52 gap-1.5 overflow-y-auto" aria-label="Recent model tool eval notes">
              {!evalNotesOpen ? (
                <div className="text-[11px]" style={{ color: C.textMuted }}>Open to read recent local eval notes.</div>
              ) : evals.isLoading ? (
                <div className="text-[11px]" style={{ color: C.textMuted }}>Reading local eval notes.</div>
              ) : (evals.data?.items ?? []).length === 0 ? (
                <div className="text-[11px]" style={{ color: C.textMuted }}>No eval notes for this selection.</div>
              ) : evals.data?.items.map((item) => (
                <div key={item.id} className="rounded p-2 text-[11px]" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}>
                  <div className="font-semibold uppercase tracking-wider">{labelize(item.evalTaskKey)}</div>
                  <div className="mt-1" style={{ color: C.textSecondary }}>{item.taskSummary}</div>
                  <div className="mt-1 flex gap-2">
                    <Badge label={item.status} tone={item.status === "pass" ? C.success : item.status === "fail" ? C.danger : C.warning} />
                    <span style={{ color: C.textMuted }}>{formatTime(item.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
            </form>
          </details>

          <section className="rounded p-2 space-y-2" aria-label="Model tool route preview" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
            <SectionTitle title="Route Preview" detail={routePreviewInput ? route?.routeStatus ?? "reading" : "open to read"} />
            <Input value={routeTask} onChange={(event) => setRouteTask(event.target.value)} aria-label="Route preview task kind" />
            <Input value={routeModality} onChange={(event) => setRouteModality(event.target.value)} aria-label="Route preview modality" />
            <AppSelect label="Route privacy class" value={routePrivacy} onChange={(value) => setRoutePrivacy(value as PrivacyClass)} options={PRIVACY_CLASSES} />
            <label className="flex items-center gap-2 text-xs" style={{ color: C.textSecondary }}>
              <Checkbox checked={requiresFrontier} onCheckedChange={(checked) => setRequiresFrontier(checked === true)} />
              Requires frontier reasoning
            </label>
            <Button
              type="button"
              onClick={readRoutePreview}
              disabled={routePreview.isLoading}
              title="Read a local route preview. No provider, model, tool, gateway, browser, or install action runs."
              aria-label="Read local model route preview"
            >
              {routePreview.isLoading ? "Reading" : "Read Preview"}
            </Button>
            {!routePreviewInput ? (
              <div className="rounded p-2 text-[11px] leading-snug" style={{ color: C.textMuted, background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}>
                Route preview is local and reads only when requested.
              </div>
            ) : route && (
              <div className="space-y-2">
                <Field label="Recommended lane" value={labelize(route.recommendedLane)} />
                <Field label="Approval gate" value={route.approvalGate} />
                <div className="space-y-1.5">
                  {route.lanes.map((lane) => (
                    <div key={lane.lane} className="rounded p-2 text-[11px]" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}>
                      <div className="font-semibold uppercase tracking-wider">{labelize(lane.lane)}</div>
                      <div className="mt-1" style={{ color: C.textSecondary }}>{lane.reason}</div>
                      <div className="mt-1" style={{ color: C.textMuted }}>{labelize(lane.approvalLevel)}. {labelize(lane.status)}</div>
                    </div>
                  ))}
                </div>
                <div className="rounded p-2 text-[11px] leading-snug" style={{ color: C.textMuted, background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}>
                  {route.noActionTaken.join(" ")}
                </div>
              </div>
            )}
          </section>
        </section>

        <details className="rounded p-2" aria-label="Model Tools gates" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
          <summary className="cursor-pointer">
            <SectionTitle title="Gates" detail="policy" />
          </summary>
          <div className="mt-2 grid gap-1.5 md:grid-cols-2">
            {(policyData?.gates ?? []).map((gate) => (
              <div key={gate} className="rounded p-2 text-[11px] leading-snug" style={{ color: C.textSecondary, background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}>
                {gate}
              </div>
            ))}
          </div>
        </details>
      </main>
    </div>
  );
}

function SectionTitle({ title, detail }: { title: string; detail?: string }) {
  return (
    <div className="flex items-end justify-between gap-3">
      <h3 className="text-xs font-bold uppercase tracking-widest">{title}</h3>
      {detail && <div className="text-[10px] uppercase tracking-wider" style={{ color: C.textMuted }}>{detail}</div>}
    </div>
  );
}

function StatusBlock({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="rounded p-2" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
      <div className="text-[10px] uppercase tracking-widest" style={{ color: C.textMuted }}>{label}</div>
      <div className="mt-0.5 truncate text-[11px] font-semibold" title={value} style={{ color: tone }}>{value}</div>
    </div>
  );
}

function MachineRule({ title, body, tone }: { title: string; body: string; tone: string }) {
  return (
    <div className="rounded p-2" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}>
      <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: tone }}>{title}</div>
      <div className="mt-1 text-[11px] leading-snug" style={{ color: C.textSecondary }}>{body}</div>
    </div>
  );
}

function CapabilityMapCard({
  lane,
}: {
  lane: {
    id: string;
    label: string;
    ownerAgent: string;
    laneIds: readonly string[];
    status: string;
    defaultUse: string;
    escalationRule: string;
    approvalRule: string;
    uiRule: string;
    noActionTaken: string;
    registryRecordCount?: number;
  };
}) {
  const tone = lane.status === "sealed_private" ? C.danger : lane.status === "gated_proposal" ? C.warning : C.success;
  return (
    <div className="rounded p-2 text-[11px] leading-snug" style={{ background: C.surfaceMuted, border: `1px solid ${lane.status === "sealed_private" ? C.danger : C.borderSoft}` }}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate text-xs font-bold uppercase tracking-widest" title={lane.label}>{lane.label}</div>
          <div className="mt-0.5 truncate" style={{ color: C.textMuted }} title={lane.ownerAgent}>{lane.ownerAgent}</div>
        </div>
        <Badge label={labelize(lane.status)} tone={tone} />
      </div>
      <div className="mt-2 flex flex-wrap gap-1">
        <Badge label={`${lane.registryRecordCount ?? 0} records`} tone={(lane.registryRecordCount ?? 0) > 0 ? C.accent : C.textMuted} />
        {lane.laneIds.map((id) => (
          <Badge key={id} label={labelize(id)} tone={C.textSecondary} />
        ))}
      </div>
      <div className="mt-2 space-y-1">
        <Field label="Use" value={lane.defaultUse} />
        <Field label="Escalate" value={lane.escalationRule} />
        <Field label="Gate" value={lane.approvalRule} />
        <Field label="UI" value={lane.uiRule} />
        <Field label="Proof" value={lane.noActionTaken} />
      </div>
    </div>
  );
}

function ModelBatch({
  title,
  items,
}: {
  title: string;
  items: ReadonlyArray<{ model: string; modelClass: string; expectedSize: string; use: string; avoid: string }>;
}) {
  return (
    <div className="rounded p-2" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}>
      <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: C.textMuted }}>{title}</div>
      <div className="mt-1 grid gap-1.5">
        {items.map((item) => (
          <div key={item.model} className="rounded p-1.5" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
            <div className="flex flex-wrap items-center gap-1">
              <Badge label={item.model} tone={C.gold} />
              <Badge label={labelize(item.modelClass)} tone={C.accent} />
              <Badge label={item.expectedSize} tone={C.textSecondary} />
            </div>
            <div className="mt-1 grid gap-1">
              <Field label="Use" value={item.use} />
              <Field label="Avoid" value={item.avoid} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusList({ title, items, tone }: { title: string; items: readonly string[]; tone: string }) {
  return (
    <div className="rounded p-2" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
      <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: tone }}>{title}</div>
      <div className="mt-1 grid gap-1">
        {items.map((item) => (
          <div key={item} className="break-words text-[11px] leading-snug" style={{ color: C.textSecondary }}>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function Badge({ label, tone }: { label: string; tone: string }) {
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
    <UiBadge variant={variant} className="uppercase">
      {label}
    </UiBadge>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[76px_minmax(0,1fr)] gap-2 text-[11px] leading-snug">
      <div className="truncate font-bold uppercase tracking-widest" style={{ color: C.textMuted }} title={label}>{label}</div>
      <div className="break-words" style={{ color: C.textSecondary }}>{value}</div>
    </div>
  );
}

function SourceField({ value }: { value: string | null | undefined }) {
  const sources = splitSourceUris(value);
  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: C.textMuted }}>Sources</div>
      {sources.length === 0 ? (
        <div className="mt-1 text-[11px] leading-snug" style={{ color: C.textSecondary }}>No source URLs recorded.</div>
      ) : (
        <div className="mt-1 flex flex-wrap gap-1">
          {sources.map((source) => (
            <span
              key={source}
              className="max-w-full truncate rounded px-1.5 py-0.5 text-[10px]"
              style={{ color: C.textSecondary, background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}
              title={source}
            >
              {sourceDisplayName(source)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function AppSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
}) {
  return (
    <label className="grid gap-1 text-[10px] uppercase tracking-widest" style={{ color: C.textMuted }}>
      {label}
      <UiSelect
        value={value}
        onValueChange={onChange}
        aria-label={label}
      >
        <SelectTrigger className="w-full normal-case">
          <SelectValue placeholder={label} />
        </SelectTrigger>
        <SelectContent>
          {options.map((item) => (
            <SelectItem key={item} value={item}>
              {labelize(item)}
            </SelectItem>
          ))}
        </SelectContent>
      </UiSelect>
    </label>
  );
}
