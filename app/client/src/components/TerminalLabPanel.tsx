import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { compactCommandLabel, compactPathLabel } from "@/lib/displayLabels";
import { cerebroColors as C } from "@/lib/keepConfig";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select as UiSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function TerminalLabPanel({ onClose, onNavigate }: { onClose: () => void; onNavigate?: (route: "security") => void }) {
  const [command, setCommand] = useState("rg -n \"Terminal Lab\" CEREBRO_MASTER_BUILD_PLAN.md");
  const [selectedObservationId, setSelectedObservationId] = useState<number | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState("");
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [observationScope, setObservationScope] = useState<"all" | "selectedTask" | "selectedSession">("all");
  const [outputText, setOutputText] = useState("");
  const [exitCode, setExitCode] = useState("0");
  const [copiedDraftKey, setCopiedDraftKey] = useState<string | null>(null);
  const plan = trpc.terminalLab.plan.useQuery();
  const observationFilter =
    observationScope === "selectedTask" && selectedTaskId
      ? { limit: 12, taskId: Number(selectedTaskId) }
      : observationScope === "selectedSession" && selectedSessionId
        ? { limit: 12, sessionId: Number(selectedSessionId) }
        : { limit: 12 };
  const observations = trpc.terminalLab.observations.useQuery(observationFilter);
  const tasks = trpc.tasks.list.useQuery(undefined, { refetchInterval: 10000 });
  const sessions = trpc.sessions.list.useQuery({ limit: 25 }, { refetchInterval: 5000 });
  const preview = trpc.terminalLab.previewCommand.useMutation();
  const observeOutput = trpc.terminalLab.observeOutput.useMutation();
  const linkObservation = trpc.terminalLab.linkObservation.useMutation();
  const previewDiagnosticDraft = trpc.terminalLab.previewDiagnosticDraft.useMutation();
  const updateObservationStatus = trpc.terminalLab.updateObservationStatus.useMutation();
  const createApprovalPreview = trpc.terminalLab.createApprovalPreviewFromObservation.useMutation();
  const terminalApprovalPreviews = trpc.terminalLab.approvalPreviews.useQuery(
    selectedObservationId == null ? { limit: 5 } : { observationId: selectedObservationId, limit: 5 },
  );
  const createTaskFromObservation = trpc.terminalLab.createTaskFromObservation.useMutation();
  const createLearningProposal = trpc.terminalLab.createLearningProposalFromObservation.useMutation();
  const utils = trpc.useUtils();
  const data = plan.data;
  const selectedTask = tasks.data?.find((task) => String(task.id) === selectedTaskId);
  const selectedSession = sessions.data?.find((session) => String(session.id) === selectedSessionId);
  const sessionLabelById = new Map((sessions.data ?? []).map((session) => [session.id, session.displayName]));

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = command.trim();
    if (!trimmed || preview.isPending) return;
    preview.mutate(
      {
        command: trimmed,
        cwd: "/Users/lindsaybell/Desktop/CereBro",
        taskId: selectedTaskId ? Number(selectedTaskId) : undefined,
        sessionId: selectedSessionId ? Number(selectedSessionId) : undefined,
      },
      { onSuccess: () => utils.terminalLab.observations.invalidate() },
    );
  }

  function submitOutput(event: React.FormEvent) {
    event.preventDefault();
    if (selectedObservationId == null || !outputText.trim() || observeOutput.isPending) return;
    const parsedExitCode = Number(exitCode);
    observeOutput.mutate(
      {
        observationId: selectedObservationId,
        output: outputText.trim(),
        exitCode: Number.isInteger(parsedExitCode) && parsedExitCode >= 0 ? parsedExitCode : undefined,
      },
      {
        onSuccess: () => {
          setOutputText("");
          utils.terminalLab.observations.invalidate();
        },
      },
    );
  }

  function attachSelectedLinks(observationId: number) {
    if (linkObservation.isPending) return;
    linkObservation.mutate(
      {
        observationId,
        taskId: selectedTaskId ? Number(selectedTaskId) : null,
        sessionId: selectedSessionId ? Number(selectedSessionId) : null,
      },
      { onSuccess: () => utils.terminalLab.observations.invalidate() },
    );
  }

  function createFollowUpTask(observationId: number) {
    if (createTaskFromObservation.isPending) return;
    createTaskFromObservation.mutate(
      { observationId },
      {
        onSuccess: () => {
          utils.terminalLab.observations.invalidate();
          utils.tasks.list.invalidate();
          utils.tasks.projects.invalidate();
        },
      },
    );
  }

  function createLearningNote(observationId: number) {
    if (createLearningProposal.isPending) return;
    createLearningProposal.mutate(
      { observationId },
      {
        onSuccess: () => {
          utils.memory.proposals.invalidate();
        },
      },
    );
  }

  function previewTonyDraft(observationId: number, draftCommand: string) {
    if (previewDiagnosticDraft.isPending) return;
    setCommand(draftCommand);
    previewDiagnosticDraft.mutate(
      { observationId, command: draftCommand },
      {
        onSuccess: () => {
          utils.terminalLab.observations.invalidate();
        },
      },
    );
  }

  function setObservationStatus(observationId: number, status: "reviewing" | "blocked" | "archived") {
    if (updateObservationStatus.isPending) return;
    updateObservationStatus.mutate(
      { id: observationId, status },
      { onSuccess: () => utils.terminalLab.observations.invalidate() },
    );
  }

  function stageCommandApprovalPreview(observationId: number) {
    if (createApprovalPreview.isPending) return;
    createApprovalPreview.mutate(
      {
        observationId,
        reason: "Terminal Lab approval preview only. User still must explicitly approve any actual command run through Codex.",
      },
      {
        onSuccess: () => {
          setSelectedObservationId(observationId);
          utils.terminalLab.approvalPreviews.invalidate();
        },
      },
    );
  }

  function openSecurityGateForCommand(targetCommand: string) {
    if (!targetCommand.trim() || !onNavigate) return;
    try {
      window.sessionStorage.setItem("cerebro:security-target", targetCommand.trim());
    } catch {
      // Ignore storage failure. The Security Gate form still opens.
    }
    onNavigate("security");
  }

  async function copyTonyDraft(key: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedDraftKey(key);
      window.setTimeout(() => setCopiedDraftKey((current) => (current === key ? null : current)), 1800);
    } catch {
      setCommand(value);
      setCopiedDraftKey(`${key}:fallback`);
      window.setTimeout(() => setCopiedDraftKey((current) => (current === `${key}:fallback` ? null : current)), 2200);
    }
  }

  function approvalPromptForTonyDraft(input: {
    observationId: number;
    title: string;
    command: string;
    reason: string;
    approvalGate: string;
  }) {
    return [
      `Tony diagnostic draft from Terminal Lab observation #${input.observationId}`,
      "",
      `Command: ${input.command}`,
      `Purpose: ${input.reason}`,
      `Gate: ${input.approvalGate}`,
      "",
      "Please review this command and, if appropriate, run it through the normal Codex approval-gated command path. Do not execute it from Terminal Lab.",
    ].join("\n");
  }

  return (
    <div className="flex h-full flex-col overflow-hidden" style={{ background: C.background, border: `1px solid ${C.borderSoft}`, color: C.textPrimary }}>
      <div
        className="flex items-center justify-between gap-2 px-2 py-1.5 shrink-0"
        style={{ borderBottom: `1px solid ${C.borderSoft}`, background: C.surface }}
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <div className="text-[12px] font-semibold uppercase tracking-wider" style={{ color: C.textPrimary }}>
              Terminal Lab
            </div>
            <Badge variant="warning" className="uppercase">Execution disabled</Badge>
          </div>
          <div className="mt-1 flex flex-wrap gap-1">
            <Badge variant="secondary" className="uppercase">Mode {(data?.mode ?? "proposal_only").replace(/_/g, " ")}</Badge>
            <Badge variant="default" className="uppercase">Owner {data?.ownerAgent ?? "tony"}</Badge>
            <Badge variant="secondary" className="uppercase">Support {(data?.supportAgents ?? ["aang"]).join(", ")}</Badge>
          </div>
        </div>
        <Button type="button" onClick={onClose} variant="outline" size="sm" className="shrink-0">
          Close
        </Button>
      </div>

      <form onSubmit={submit} className="px-2 py-1.5 shrink-0 space-y-1.5" style={{ borderBottom: `1px solid ${C.borderSoft}` }}>
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] gap-1.5">
          <Input
            value={command}
            onChange={(event) => setCommand(event.target.value)}
            placeholder="Paste a command to explain before running it elsewhere."
          />
          <Button
            type="submit"
            disabled={!command.trim() || preview.isPending}
          >
            {preview.isPending ? "Reading" : "Preview"}
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
          <AppSelect
            label="Task Link"
            value={selectedTaskId || "none"}
            onChange={(value) => setSelectedTaskId(value === "none" ? "" : value)}
            options={[
              { value: "none", label: "No task link" },
              ...(tasks.data ?? []).map((task) => ({
                value: String(task.id),
                label: `#${task.id} ${task.projectName ? `${task.projectName}: ` : ""}${task.title}`,
              })),
            ]}
          />
          <AppSelect
            label="Session Link"
            value={selectedSessionId || "none"}
            onChange={(value) => setSelectedSessionId(value === "none" ? "" : value)}
            options={[
              { value: "none", label: "No session link" },
              ...(sessions.data ?? []).map((session) => ({
                value: String(session.id),
                label: session.displayName,
              })),
            ]}
          />
        </div>
        <div className="truncate text-[10px]" style={{ color: C.textMuted }}>
          Intent classifier only. Commands still run through Codex approval.
          {(selectedTask || selectedSession) && (
            <span> New previews will attach to {selectedTask ? `task #${selectedTask.id}` : ""}{selectedTask && selectedSession ? " and " : ""}{selectedSession ? selectedSession.displayName : ""}.</span>
          )}
        </div>
      </form>

      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] gap-2 px-2 pt-2 pb-16">
          <div className="space-y-2 min-w-0">
            {preview.data && (
              <section className="space-y-2">
                <SectionTitle title="Command Preview" detail={preview.data.risk.replace(/_/g, " ")} />
                <div className="rounded p-2 space-y-1.5" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
                  <div className="flex flex-wrap gap-1">
                    <Chip label={preview.data.risk.replace(/_/g, " ")} tone={toneForRisk(preview.data.risk)} />
                    <Chip label={`agent ${preview.data.suggestedAgent}`} tone={C.gold} />
                    <Chip label={preview.data.approvalRequiredToRun ? "approval required" : "no approval"} tone={C.warning} />
                    <Chip label={preview.data.wouldExecute ? "would execute" : "no execution"} tone={C.success} />
                    <Chip label={`saved #${preview.data.observationId}`} tone={C.textSecondary} />
                  </div>
                  <div
                    className="text-[11px] rounded px-2 py-1 overflow-x-auto"
                    style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}`, color: C.textPrimary }}
                  >
                    <code>{preview.data.command}</code>
                  </div>
                  <div className="text-[11px] leading-snug" style={{ color: C.textSecondary }}>
                    {preview.data.explanation}
                  </div>
                  <Button
                    type="button"
                    onClick={() => openSecurityGateForCommand(preview.data.command)}
                    disabled={!onNavigate}
                    variant="risk"
                    size="sm"
                    className="w-fit"
                    title={preview.data.command}
                  >
                    Security Gate
                  </Button>
                </div>

                <div className="rounded p-2" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
                  <SectionTitle title="Gates" detail="before run" />
                  <div className="mt-2 space-y-1">
                    {preview.data.gates.map((gate) => (
                      <div key={gate} className="text-[10px] leading-snug" style={{ color: C.textMuted }}>- {gate}</div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {previewDiagnosticDraft.data && "handoffNote" in previewDiagnosticDraft.data &&
              (() => {
                const draftPreview = previewDiagnosticDraft.data;
                return (
                  <section className="space-y-2">
                    <SectionTitle title="Tony Draft Preview" detail={draftPreview.risk.replace(/_/g, " ")} />
                    <div className="rounded p-2 space-y-1.5" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
                      <div className="flex flex-wrap gap-1">
                        <Chip label={`from #${draftPreview.parentObservationId}`} tone={C.textMuted} />
                        <Chip label={`saved #${draftPreview.observationId}`} tone={C.textSecondary} />
                        <Chip label={draftPreview.risk.replace(/_/g, " ")} tone={toneForRisk(draftPreview.risk)} />
                        <Chip label="no execution" tone={C.success} />
                      </div>
                      <div
                        className="text-[11px] rounded px-2 py-1 overflow-x-auto"
                        style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}`, color: C.textPrimary }}
                      >
                        <code>{draftPreview.command}</code>
                      </div>
                      <div className="text-[11px] leading-snug" style={{ color: C.textSecondary }}>
                        {draftPreview.handoffNote}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <CopyButton
                          label="Copy Command"
                          active={copiedDraftKey === `preview-command:${draftPreview.observationId}`}
                          fallback={copiedDraftKey === `preview-command:${draftPreview.observationId}:fallback`}
                          onClick={() => copyTonyDraft(`preview-command:${draftPreview.observationId}`, draftPreview.command)}
                        />
                        <CopyButton
                          label="Copy Approval Note"
                          active={copiedDraftKey === `preview-note:${draftPreview.observationId}`}
                          fallback={copiedDraftKey === `preview-note:${draftPreview.observationId}:fallback`}
                          onClick={() =>
                            copyTonyDraft(
                              `preview-note:${draftPreview.observationId}`,
                              [
                                `Tony diagnostic preview #${draftPreview.observationId}`,
                                `Parent observation: #${draftPreview.parentObservationId}`,
                                `Command: ${draftPreview.command}`,
                                draftPreview.handoffNote,
                              ].join("\n"),
                            )
                          }
                        />
                      </div>
                    </div>
                  </section>
                );
              })()}
            {previewDiagnosticDraft.data && !previewDiagnosticDraft.data.ok && (
              <section className="rounded p-2 text-[11px]" style={{ background: C.surface, border: `1px solid ${C.borderSoft}`, color: C.warning }}>
                {previewDiagnosticDraft.data.reason}
              </section>
            )}

            <section className="space-y-2">
              <SectionTitle title="Surfaces" detail="Terminal Lab V1" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {(data?.surfaces ?? []).map((surface) => (
                  <div key={surface.id} className="rounded p-1.5" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-xs font-semibold" style={{ color: C.textPrimary }}>{surface.label}</div>
                      <Chip label={surface.status.replace(/_/g, " ")} tone={surface.status === "live_preview" ? C.success : C.textMuted} />
                    </div>
                    <div className="text-[10px] leading-snug mt-1" style={{ color: C.textMuted }}>
                      {surface.notes}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <SectionTitle title="Recent Observations" detail={observationScope === "all" ? "local DB" : "filtered"} />
                <div className="flex flex-wrap gap-1 justify-end">
                  <ScopeButton active={observationScope === "all"} label="All" onClick={() => setObservationScope("all")} />
                  <ScopeButton
                    active={observationScope === "selectedTask"}
                    disabled={!selectedTaskId}
                    label="Task"
                    onClick={() => setObservationScope("selectedTask")}
                  />
                  <ScopeButton
                    active={observationScope === "selectedSession"}
                    disabled={!selectedSessionId}
                    label="Session"
                    onClick={() => setObservationScope("selectedSession")}
                  />
                </div>
              </div>
              <div className="space-y-2">
                {(observations.data ?? []).length === 0 ? (
                  <div className="rounded p-2 text-[11px]" style={{ background: C.surface, border: `1px solid ${C.borderSoft}`, color: C.textMuted }}>
                    {observationScope === "all" ? "No command previews recorded yet." : "No command previews match the selected link."}
                  </div>
                ) : (
                  observations.data?.map((item) => (
                    <div key={item.id} className="rounded p-1.5 space-y-1" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
                      <div className="flex flex-wrap gap-1">
                        <Chip label={`#${item.id}`} tone={C.textMuted} />
                        <Chip label={item.risk.replace(/_/g, " ")} tone={toneForRisk(item.risk)} />
                        <Chip label={item.suggestedAgent ?? "cortana"} tone={C.gold} />
                        <Chip label={item.status} tone={C.textSecondary} />
                        {item.diagnosticStatus && <Chip label={item.diagnosticStatus.replace(/_/g, " ")} tone={C.warning} />}
                        {item.diagnosticParentId != null && <Chip label={`from #${item.diagnosticParentId}`} tone={C.gold} />}
                        {item.diagnosticRootId != null && <Chip label={`root #${item.diagnosticRootId}`} tone={C.textSecondary} />}
                        {item.diagnosticDepth != null && <Chip label={`depth ${item.diagnosticDepth}`} tone={C.textMuted} />}
                        {item.taskId != null && <Chip label={`task #${item.taskId}`} tone={C.accent} />}
                        {item.sessionId != null && (
                          <Chip label={sessionLabelById.get(item.sessionId) ?? `Run #${item.sessionId}`} tone={C.accent} />
                        )}
                        {item.exitCode != null && <Chip label={`exit ${item.exitCode}`} tone={item.exitCode === 0 ? C.success : C.warning} />}
                      </div>
                      <div
                        className="text-[11px] rounded px-2 py-1 truncate"
                        style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}`, color: C.textPrimary }}
                        title={item.command}
                      >
                        <code>{compactCommandLabel(item.command)}</code>
                      </div>
                      {item.cwd && (
                        <div className="text-[10px] truncate" style={{ color: C.textMuted }} title={item.cwd}>
                          {compactPathLabel(item.cwd)}
                        </div>
                      )}
                      {item.diagnosticParentId != null && (
                        <div className="text-[10px] leading-snug" style={{ color: C.gold }}>
                          Tony diagnostic preview from observation #{item.diagnosticParentId}
                          {item.diagnosticRootId != null ? ` in chain root #${item.diagnosticRootId}` : ""}
                          {item.diagnosticDepth != null ? ` at depth ${item.diagnosticDepth}` : ""}. Still proposal-only; run only through Codex approval.
                        </div>
                      )}
                      {item.outputSummary && (
                        <div className="text-[11px] leading-snug line-clamp-2" style={{ color: C.textMuted }} title={item.outputSummary}>
                          {item.outputSummary}
                        </div>
                      )}
                      {item.followUps.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                          {item.followUps.map((followUp) => (
                            <div key={`${item.id}-${followUp.agent}-${followUp.title}`} className="rounded px-1.5 py-1" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}>
                              <div className="flex items-center justify-between gap-2">
                                <div className="text-[10px] font-semibold uppercase tracking-wider truncate" style={{ color: followUp.agent === "tony" ? C.gold : C.success }}>
                                  {followUp.agent}: {followUp.title}
                                </div>
                              </div>
                              <div className="text-[10px] leading-snug mt-0.5" style={{ color: C.textMuted }}>{followUp.reason}</div>
                            </div>
                          ))}
                        </div>
                      )}
                      {item.diagnosticDrafts.length > 0 && (
                        <div className="space-y-1">
                          {item.diagnosticDrafts.map((draft) => (
                            <div key={`${item.id}-${draft.title}-${draft.command}`} className="rounded p-1.5" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}>
                              <div className="grid gap-1.5 lg:grid-cols-[minmax(0,1fr)_auto]">
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <div className="text-[10px] font-semibold uppercase tracking-wider truncate" style={{ color: C.gold }}>
                                      Tony: {draft.title}
                                    </div>
                                    <Chip label="suggested only" tone={C.warning} />
                                  </div>
                                  <div className="text-[11px] rounded px-2 py-1 mt-1 truncate" style={{ background: C.background, color: C.textPrimary }} title={draft.command}>
                                    <code>{compactCommandLabel(draft.command)}</code>
                                  </div>
                                  <div className="text-[10px] leading-snug mt-1 line-clamp-2" style={{ color: C.textMuted }} title={draft.reason}>{draft.reason}</div>
                                </div>
                                <div className="flex flex-wrap gap-1 lg:justify-end lg:self-start">
                                  <Button
                                    type="button"
                                    onClick={() => previewTonyDraft(item.id, draft.command)}
                                    disabled={previewDiagnosticDraft.isPending}
                                    variant="risk"
                                    size="sm"
                                  >
                                    {previewDiagnosticDraft.isPending ? "Previewing" : "Preview"}
                                  </Button>
                                  <CopyButton
                                    label="Copy"
                                    active={copiedDraftKey === `draft-command:${item.id}:${draft.command}`}
                                    fallback={copiedDraftKey === `draft-command:${item.id}:${draft.command}:fallback`}
                                    onClick={() => copyTonyDraft(`draft-command:${item.id}:${draft.command}`, draft.command)}
                                  />
                                  <CopyButton
                                    label="Approval"
                                    active={copiedDraftKey === `draft-approval:${item.id}:${draft.command}`}
                                    fallback={copiedDraftKey === `draft-approval:${item.id}:${draft.command}:fallback`}
                                    onClick={() =>
                                      copyTonyDraft(
                                        `draft-approval:${item.id}:${draft.command}`,
                                        approvalPromptForTonyDraft({
                                          observationId: item.id,
                                          title: draft.title,
                                          command: draft.command,
                                          reason: draft.reason,
                                          approvalGate: draft.approvalGate,
                                        }),
                                      )
                                    }
                                  />
                                </div>
                              </div>
                              <div className="mt-1 grid grid-cols-1 md:grid-cols-2 gap-1">
                                <DiagnosticNote label="Evidence" value={draft.evidence} />
                                <DiagnosticNote label="Expected" value={draft.expectedSignal} />
                              </div>
                              <div className="text-[10px] leading-snug mt-1 line-clamp-2" style={{ color: C.warning }} title={draft.approvalGate}>
                                {draft.approvalGate}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="grid gap-1 md:grid-cols-[auto_auto_minmax(0,1fr)_auto]">
                        <ActionGroup label="Review">
                          <Button
                            type="button"
                            onClick={() => setObservationStatus(item.id, "reviewing")}
                            disabled={updateObservationStatus.isPending || item.status === "reviewing"}
                            variant={item.status === "reviewing" ? "secondary" : "ghost"}
                            size="sm"
                          >
                            Review
                          </Button>
                          <Button
                            type="button"
                            onClick={() => setObservationStatus(item.id, "blocked")}
                            disabled={updateObservationStatus.isPending || item.status === "blocked"}
                            variant="risk"
                            size="sm"
                          >
                            Block
                          </Button>
                        </ActionGroup>
                        <ActionGroup label="Gate">
                          <Button
                            type="button"
                            onClick={() => stageCommandApprovalPreview(item.id)}
                            disabled={createApprovalPreview.isPending}
                            variant="risk"
                            size="sm"
                          >
                            Approval
                          </Button>
                          <Button
                            type="button"
                            onClick={() => openSecurityGateForCommand(item.command)}
                            disabled={!onNavigate}
                            variant="risk"
                            size="sm"
                          >
                            Security
                          </Button>
                        </ActionGroup>
                        <ActionGroup label="Link">
                          <Button
                            type="button"
                            onClick={() => attachSelectedLinks(item.id)}
                            disabled={linkObservation.isPending || (!selectedTaskId && !selectedSessionId)}
                            variant="secondary"
                            size="sm"
                          >
                            Selected
                          </Button>
                          <Button
                            type="button"
                            onClick={() => createFollowUpTask(item.id)}
                            disabled={createTaskFromObservation.isPending || item.taskId != null}
                            variant="secondary"
                            size="sm"
                          >
                            Task
                          </Button>
                          <Button
                            type="button"
                            onClick={() => createLearningNote(item.id)}
                            disabled={createLearningProposal.isPending}
                            variant="secondary"
                            size="sm"
                          >
                            Learning
                          </Button>
                        </ActionGroup>
                        <ActionGroup label="Output">
                          <Button
                            type="button"
                            onClick={() => setSelectedObservationId(item.id)}
                            variant={selectedObservationId === item.id ? "secondary" : "ghost"}
                            size="sm"
                          >
                            Attach
                          </Button>
                          <Button
                            type="button"
                            onClick={() => setObservationStatus(item.id, "archived")}
                            disabled={updateObservationStatus.isPending || item.status === "archived"}
                            variant="ghost"
                            size="sm"
                          >
                            Archive
                          </Button>
                        </ActionGroup>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>

          <aside className="space-y-1.5 min-w-0">
            <section className="rounded p-1.5" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
              <SectionTitle title="Policy" detail="locked" />
              <div className="mt-2 grid gap-1">
                {(data?.policies ?? []).map((policy) => (
                  <RailLine key={policy} text={policy} />
                ))}
              </div>
            </section>

            <form onSubmit={submitOutput} className="rounded p-1.5 space-y-1.5" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
              <SectionTitle title="Observed Output" detail={selectedObservationId == null ? "select row" : `#${selectedObservationId}`} />
              <Textarea
                value={outputText}
                onChange={(event) => setOutputText(event.target.value)}
                placeholder="Paste output from a command that was run through the normal approved path."
                rows={4}
              />
              <div className="grid grid-cols-[72px_minmax(0,1fr)] gap-1.5">
                <Input
                  value={exitCode}
                  onChange={(event) => setExitCode(event.target.value)}
                  placeholder="0"
                />
                <Button
                  type="submit"
                  disabled={selectedObservationId == null || !outputText.trim() || observeOutput.isPending}
                >
                  {observeOutput.isPending ? "Saving" : "Save Summary"}
                </Button>
              </div>
              <div className="text-[10px] leading-snug" style={{ color: C.textMuted }}>
                Saves a redacted local summary. No command execution.
              </div>
            </form>

            <section className="rounded p-1.5" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
              <SectionTitle title="Live Links" detail="local only" />
              <div className="mt-2 grid gap-1">
                {[
                  "Previews attach to selected tasks and sessions.",
                  "Observations relink with Link Selected.",
                  "Observed output surfaces Aang and Tony follow-ups.",
                  "Execution stays approval-gated through Codex.",
                ].map((item) => (
                  <RailLine key={item} text={item} />
                ))}
              </div>
            </section>

            <section className="rounded p-1.5" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
              <SectionTitle title="Approval Previews" detail={selectedObservationId == null ? "recent" : `#${selectedObservationId}`} />
              <div className="mt-2 space-y-2">
                {(terminalApprovalPreviews.data ?? []).length === 0 ? (
                  <div className="text-[11px] leading-relaxed" style={{ color: C.textMuted }}>
                    No local command approval previews yet.
                  </div>
                ) : (
                  terminalApprovalPreviews.data?.map((approval) => (
                    <div key={approval.id} className="rounded p-1.5" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}>
                      <div className="flex flex-wrap gap-1">
                        <Chip label={`approval #${approval.id}`} tone={C.textMuted} />
                        <Chip label={approval.status} tone={C.warning} />
                        <Chip label={approval.actionType.replace(/_/g, " ")} tone={C.gold} />
                      </div>
                      <div className="text-[10px] leading-snug mt-1 line-clamp-3" style={{ color: C.textMuted }} title={approval.reason ?? ""}>
                        {approval.reason}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: C.textMuted }}>{title}</div>
      <div className="text-[10px] uppercase tracking-wider truncate" style={{ color: C.textMuted }}>{detail}</div>
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

function AppSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly { value: string; label: string }[];
}) {
  return (
    <label className="grid gap-1 text-[10px] uppercase tracking-wider" style={{ color: C.textMuted }}>
      {label}
      <UiSelect value={value} onValueChange={onChange} aria-label={label}>
        <SelectTrigger className="w-full normal-case">
          <SelectValue placeholder={label} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </UiSelect>
    </label>
  );
}

function CopyButton({
  label,
  active,
  fallback,
  onClick,
}: {
  label: string;
  active: boolean;
  fallback: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      onClick={onClick}
      variant={active ? "secondary" : fallback ? "risk" : "outline"}
      size="sm"
    >
      {active ? "Copied" : fallback ? "Loaded" : label}
    </Button>
  );
}

function ActionGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0 rounded px-2 py-1" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}>
      <div className="mb-1 text-[9px] uppercase tracking-wider" style={{ color: C.textMuted }}>
        {label}
      </div>
      <div className="flex flex-wrap gap-1">
        {children}
      </div>
    </div>
  );
}

function RailLine({ text }: { text: string }) {
  return (
    <div className="grid grid-cols-[8px_minmax(0,1fr)] gap-2 text-[11px] leading-snug" style={{ color: C.textMuted }}>
      <span aria-hidden="true" className="mt-1 h-1.5 w-1.5 rounded-full" style={{ background: C.border }} />
      <span>{text}</span>
    </div>
  );
}

function DiagnosticNote({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded px-2 py-1" style={{ background: C.background, border: `1px solid ${C.borderSoft}` }}>
      <div className="text-[9px] uppercase tracking-wider" style={{ color: C.textMuted }}>{label}</div>
      <div className="text-[10px] leading-snug mt-0.5" style={{ color: C.textSecondary }}>{value}</div>
    </div>
  );
}

function ScopeButton({
  active,
  disabled,
  label,
  onClick,
}: {
  active: boolean;
  disabled?: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      disabled={disabled}
      onClick={onClick}
      variant={active ? "secondary" : "ghost"}
      size="sm"
    >
      {label}
    </Button>
  );
}

function toneForRisk(risk: string) {
  if (risk === "destructive") return C.danger;
  if (risk === "mutating_or_external") return C.warning;
  if (risk === "read_only") return C.success;
  return C.textMuted;
}
