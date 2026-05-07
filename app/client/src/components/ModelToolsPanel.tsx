import { useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import { cerebroColors as C } from "@/lib/keepConfig";

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

export default function ModelToolsPanel({ onClose }: { onClose: () => void }) {
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

  const policy = trpc.modelTools.policy.useQuery();
  const capabilities = trpc.modelTools.capabilities.useQuery({
    capabilityKind: kind === "all" ? undefined : kind,
    evalStatus: evalStatus === "all" ? undefined : evalStatus,
    provider: providerFilter.trim() || undefined,
    limit: 80,
  });
  const evals = trpc.modelTools.evals.useQuery({
    capabilityId: selectedCapabilityId ?? undefined,
    limit: 80,
  });
  const routePreview = trpc.modelTools.routePreview.useQuery({
    taskKind: routeTask.trim() || "general routing preview",
    modality: routeModality.trim() || undefined,
    privacyClass: routePrivacy,
    requiresFrontier,
  });

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

  const rows = capabilities.data?.items ?? [];
  const selectedCapability = rows.find((item) => item.id === selectedCapabilityId) ?? rows[0] ?? null;
  const policyData = policy.data;
  const localEvalTasks = policyData?.evalTasks ?? [];
  const route = routePreview.data;

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

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background: C.background, color: C.textPrimary }}>
      <header className="shrink-0 px-5 py-4" style={{ borderBottom: `1px solid ${C.borderSoft}`, background: C.backgroundSoft }}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest">Model Tools</h2>
            <p className="text-xs mt-1" style={{ color: C.textMuted }}>
              Local capability registry. Proposal records only.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Model Tools"
            className="px-2 py-1 text-xs font-semibold uppercase rounded"
            style={{ border: `1px solid ${C.borderSoft}`, color: C.textSecondary }}
          >
            Close
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2" aria-label="Model Tools status">
          <StatusBlock label="Mode" value={policyData?.mode ?? "proposal_only"} tone={C.textSecondary} />
          <StatusBlock label="External calls" value={policyData?.callsExternalModels ? "yes" : "no"} tone={policyData?.callsExternalModels ? C.danger : C.success} />
          <StatusBlock label="Untested" value={String(registryCounts.untested)} tone={registryCounts.untested ? C.warning : C.success} />
          <StatusBlock label="External lanes" value={String(registryCounts.external)} tone={registryCounts.external ? C.warning : C.textSecondary} />
        </div>

        {lastWrite && (
          <div className="mt-3 text-xs rounded p-2" role="status" aria-live="polite" style={{ color: C.success, background: C.surface, border: `1px solid ${C.borderSoft}` }}>
            {lastWrite} No model, tool, gateway, browser, fetch, account, token, or install action ran.
          </div>
        )}
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-4" aria-label="Model Tools registry" aria-busy={policy.isLoading || capabilities.isLoading}>
        <section className="grid gap-3 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
          <div className="rounded p-4 space-y-3" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
            <SectionTitle title="Registry" detail={`${rows.length} local proposals`} />
            <div className="grid gap-2 md:grid-cols-[1fr_auto_auto]">
              <input
                value={providerFilter}
                onChange={(event) => setProviderFilter(event.target.value)}
                aria-label="Filter model tools by provider"
                placeholder="Filter provider."
                className="px-3 py-2 rounded text-xs outline-none"
                style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}`, color: C.textPrimary }}
              />
              <select
                value={kind}
                onChange={(event) => setKind(event.target.value as CapabilityKind | "all")}
                aria-label="Filter model tools by capability"
                className="px-3 py-2 rounded text-xs outline-none"
                style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}`, color: C.textPrimary }}
              >
                <option value="all">All capabilities</option>
                {CAPABILITY_KINDS.map((item) => <option key={item} value={item}>{labelize(item)}</option>)}
              </select>
              <select
                value={evalStatus}
                onChange={(event) => setEvalStatus(event.target.value as EvalStatusFilter)}
                aria-label="Filter model tools by eval status"
                className="px-3 py-2 rounded text-xs outline-none"
                style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}`, color: C.textPrimary }}
              >
                {EVAL_STATUS_FILTERS.map((item) => <option key={item} value={item}>{labelize(item)}</option>)}
              </select>
            </div>

            <div className="grid gap-2" role="list" aria-label="Model tool capability proposals">
              {capabilities.isLoading ? (
                <div className="text-xs" style={{ color: C.textMuted }}>Reading local registry.</div>
              ) : rows.length === 0 ? (
                <div className="rounded p-3 text-xs leading-relaxed" style={{ color: C.textMuted, background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}>
                  No local capability proposals match these filters.
                </div>
              ) : rows.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedCapabilityId(item.id)}
                  aria-label={`Inspect model tool capability ${item.id}`}
                  aria-pressed={selectedCapability?.id === item.id}
                  className="text-left rounded p-3"
                  role="listitem"
                  style={{
                    background: selectedCapability?.id === item.id ? C.surfaceRaised : C.surfaceMuted,
                    border: `1px solid ${selectedCapability?.id === item.id ? C.accent : C.borderSoft}`,
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-xs font-bold uppercase tracking-widest truncate">{item.provider}</div>
                      <div className="text-sm font-semibold mt-1 break-words">{item.toolName}</div>
                    </div>
                    <Badge label={labelize(item.evalStatus)} tone={item.evalStatus === "untested" ? C.warning : C.success} />
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge label={labelize(item.capabilityKind)} tone={C.accent} />
                    <Badge label={labelize(item.accessMethod)} tone={C.textSecondary} />
                    <Badge label={labelize(item.privacyClass)} tone={toneForPrivacy(item.privacyClass)} />
                  </div>
                </button>
              ))}
            </div>
          </div>

          <aside className="rounded p-4 space-y-3" aria-label="Selected model tool detail" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
            <SectionTitle title="Detail" detail={selectedCapability ? `proposal ${selectedCapability.id}` : "none"} />
            {selectedCapability ? (
              <div className="space-y-3">
                <Field label="Provider" value={selectedCapability.provider} />
                <Field label="Tool" value={selectedCapability.toolName} />
                <Field label="Approval" value={labelize(selectedCapability.approvalLevel)} />
                <Field label="Sources" value={selectedCapability.sourceUris ?? "No source URLs recorded."} />
                <Field label="Strengths" value={selectedCapability.strengths ?? "No strengths recorded."} />
                <Field label="Weaknesses" value={selectedCapability.weaknesses ?? "No weaknesses recorded."} />
                <Field label="Risk" value={selectedCapability.riskReview ?? "No risk review recorded."} />
                <Field label="Updated" value={formatTime(selectedCapability.updatedAt)} />
              </div>
            ) : (
              <div className="text-xs" style={{ color: C.textMuted }}>Select a capability proposal.</div>
            )}
          </aside>
        </section>

        <section className="grid gap-3 xl:grid-cols-3">
          <form onSubmit={submitCapability} className="rounded p-4 space-y-3" aria-label="Create local model tool proposal" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
            <SectionTitle title="Propose" detail="local only" />
            <input value={provider} onChange={(event) => setProvider(event.target.value)} aria-label="Model tool provider" placeholder="Provider or tool owner." className="w-full px-3 py-2 rounded text-xs outline-none" style={inputStyle()} />
            <input value={toolName} onChange={(event) => setToolName(event.target.value)} aria-label="Model tool name" placeholder="Model or tool name." className="w-full px-3 py-2 rounded text-xs outline-none" style={inputStyle()} />
            <div className="grid gap-2 md:grid-cols-2">
              <Select label="Capability kind" value={newKind} onChange={(value) => setNewKind(value as CapabilityKind)} options={CAPABILITY_KINDS} />
              <Select label="Access method" value={accessMethod} onChange={(value) => setAccessMethod(value as typeof accessMethod)} options={ACCESS_METHODS} />
              <Select label="Privacy class" value={privacyClass} onChange={(value) => setPrivacyClass(value as PrivacyClass)} options={PRIVACY_CLASSES} />
              <Select label="Approval level" value={approvalLevel} onChange={(value) => setApprovalLevel(value as typeof approvalLevel)} options={APPROVAL_LEVELS} />
            </div>
            <textarea value={sourceUris} onChange={(event) => setSourceUris(event.target.value)} aria-label="Model tool source URLs" placeholder="Source URLs. Required before trust, but still not verified here." rows={2} className="w-full px-3 py-2 rounded text-xs outline-none resize-none" style={inputStyle()} />
            <textarea value={strengths} onChange={(event) => setStrengths(event.target.value)} aria-label="Model tool strengths" placeholder="Strengths." rows={2} className="w-full px-3 py-2 rounded text-xs outline-none resize-none" style={inputStyle()} />
            <textarea value={weaknesses} onChange={(event) => setWeaknesses(event.target.value)} aria-label="Model tool weaknesses" placeholder="Weaknesses or failure risks." rows={2} className="w-full px-3 py-2 rounded text-xs outline-none resize-none" style={inputStyle()} />
            <button type="submit" disabled={!provider.trim() || !toolName.trim() || createCapability.isPending} aria-label="Create local model tool proposal" className="w-full px-3 py-2 text-xs font-semibold uppercase rounded" style={buttonStyle(!provider.trim() || !toolName.trim() || createCapability.isPending)}>
              {createCapability.isPending ? "Recording" : "Create Proposal"}
            </button>
          </form>

          <form onSubmit={submitEval} className="rounded p-4 space-y-3" aria-label="Record local model tool eval note" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
            <SectionTitle title="Eval Note" detail={selectedCapability ? `for ${selectedCapability.id}` : "unlinked"} />
            <Select label="Eval task" value={evalTaskKey} onChange={setEvalTaskKey} options={localEvalTasks.map((task) => task.key)} />
            <Select label="Eval outcome" value={evalOutcome} onChange={(value) => setEvalOutcome(value as typeof evalOutcome)} options={EVAL_OUTCOMES} />
            <textarea value={evalSummary} onChange={(event) => setEvalSummary(event.target.value)} aria-label="Model tool eval summary" placeholder="What was checked or blocked." rows={4} className="w-full px-3 py-2 rounded text-xs outline-none resize-none" style={inputStyle()} />
            <textarea value={evalNotes} onChange={(event) => setEvalNotes(event.target.value)} aria-label="Model tool validation notes" placeholder="Validation notes. No provider call is made." rows={3} className="w-full px-3 py-2 rounded text-xs outline-none resize-none" style={inputStyle()} />
            <button type="submit" disabled={!evalSummary.trim() || recordEval.isPending} aria-label="Record local model tool eval note" className="w-full px-3 py-2 text-xs font-semibold uppercase rounded" style={buttonStyle(!evalSummary.trim() || recordEval.isPending)}>
              {recordEval.isPending ? "Recording" : "Record Eval Note"}
            </button>
            <div className="grid gap-2 max-h-52 overflow-y-auto" aria-label="Recent model tool eval notes">
              {(evals.data?.items ?? []).length === 0 ? (
                <div className="text-xs" style={{ color: C.textMuted }}>No eval notes for this selection.</div>
              ) : evals.data?.items.map((item) => (
                <div key={item.id} className="rounded p-2 text-xs" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}>
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

          <section className="rounded p-4 space-y-3" aria-label="Model tool route preview" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
            <SectionTitle title="Route Preview" detail={route?.routeStatus ?? "proposal"} />
            <input value={routeTask} onChange={(event) => setRouteTask(event.target.value)} aria-label="Route preview task kind" className="w-full px-3 py-2 rounded text-xs outline-none" style={inputStyle()} />
            <input value={routeModality} onChange={(event) => setRouteModality(event.target.value)} aria-label="Route preview modality" className="w-full px-3 py-2 rounded text-xs outline-none" style={inputStyle()} />
            <Select label="Route privacy class" value={routePrivacy} onChange={(value) => setRoutePrivacy(value as PrivacyClass)} options={PRIVACY_CLASSES} />
            <label className="flex items-center gap-2 text-xs" style={{ color: C.textSecondary }}>
              <input type="checkbox" checked={requiresFrontier} onChange={(event) => setRequiresFrontier(event.target.checked)} />
              Requires frontier reasoning
            </label>
            {route && (
              <div className="space-y-3">
                <Field label="Recommended lane" value={labelize(route.recommendedLane)} />
                <Field label="Approval gate" value={route.approvalGate} />
                <div className="space-y-2">
                  {route.lanes.map((lane) => (
                    <div key={lane.lane} className="rounded p-2 text-xs" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}>
                      <div className="font-semibold uppercase tracking-wider">{labelize(lane.lane)}</div>
                      <div className="mt-1" style={{ color: C.textSecondary }}>{lane.reason}</div>
                      <div className="mt-1" style={{ color: C.textMuted }}>{labelize(lane.approvalLevel)}. {labelize(lane.status)}</div>
                    </div>
                  ))}
                </div>
                <div className="rounded p-2 text-xs leading-relaxed" style={{ color: C.textMuted, background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}>
                  {route.noActionTaken.join(" ")}
                </div>
              </div>
            )}
          </section>
        </section>

        <section className="rounded p-4" aria-label="Model Tools gates" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
          <SectionTitle title="Gates" detail="always visible" />
          <div className="grid gap-2 md:grid-cols-2">
            {(policyData?.gates ?? []).map((gate) => (
              <div key={gate} className="text-xs leading-relaxed rounded p-2" style={{ color: C.textSecondary, background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}>
                {gate}
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function inputStyle() {
  return { background: C.surfaceMuted, border: `1px solid ${C.borderSoft}`, color: C.textPrimary };
}

function buttonStyle(disabled: boolean) {
  return {
    background: disabled ? C.surfaceMuted : C.accentSoft,
    color: disabled ? C.textMuted : C.textPrimary,
    border: `1px solid ${C.borderSoft}`,
  };
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
    <div className="rounded p-3" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
      <div className="text-[10px] uppercase tracking-widest" style={{ color: C.textMuted }}>{label}</div>
      <div className="mt-1 text-sm font-semibold truncate" title={value} style={{ color: tone }}>{value}</div>
    </div>
  );
}

function Badge({ label, tone }: { label: string; tone: string }) {
  return (
    <span className="inline-flex rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider" style={{ color: tone, border: `1px solid ${tone}66`, background: `${tone}11` }}>
      {label}
    </span>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: C.textMuted }}>{label}</div>
      <div className="mt-1 text-xs leading-relaxed break-words" style={{ color: C.textSecondary }}>{value}</div>
    </div>
  );
}

function Select({
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
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={label}
        className="px-3 py-2 rounded text-xs outline-none normal-case"
        style={inputStyle()}
      >
        {options.map((item) => <option key={item} value={item}>{labelize(item)}</option>)}
      </select>
    </label>
  );
}
