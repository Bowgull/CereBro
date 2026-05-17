import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { compactCommandLabel, compactPathLabel } from "@/lib/displayLabels";
import { cerebroColors as C, cerebroTheme as T } from "@/lib/keepConfig";
import { disambiguateSessionOptions } from "@/lib/sessionLabels";
import { terminalLabObservationActionCopy, terminalLabProjectReadCopy, terminalLabReceiptChainCopy } from "@/lib/terminalLabCopyModel";
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

type TerminalProjectContext = {
  name: string;
  localPath: string;
  localExists: boolean;
  nextSafeAction: string;
  tasks: {
    projectId: number | null;
  };
  git: {
    branch: string | null;
    upstream: string | null;
    dirty: boolean;
    dirtyCount: number;
    statusText: string;
  };
  activity: {
    approvals: { pending: number };
    terminalStatus: { total: number; blocked: number; reviewing: number };
    hedwig: { needsReview: number };
    sourceEvents: { sensitive: number };
  };
  pushReadiness: {
    state: string;
    label: string;
    executesGit: boolean;
    automationRequiresApproval: boolean;
    evidence: {
      branch: string | null;
      upstream: string | null;
      dirtyCount: number;
      pendingApprovals: number;
      blockedTerminal: number;
      reviewingTerminal: number;
    };
  };
};

const G = T.graphiteCandle;

export default function TerminalLabPanel({ onClose, onNavigate }: { onClose: () => void; onNavigate?: (route: "projects" | "security" | "workbench" | "ledger") => void }) {
  const terminalCopy = terminalLabProjectReadCopy();
  const [command, setCommand] = useState("rg -n \"Terminal Lab\" CEREBRO_MASTER_BUILD_PLAN.md");
  const [selectedObservationId, setSelectedObservationId] = useState<number | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState("");
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [taskLinkQuery, setTaskLinkQuery] = useState("");
  const [sessionLinkQuery, setSessionLinkQuery] = useState("");
  const [observationScope, setObservationScope] = useState<"all" | "selectedTask" | "selectedSession">("all");
  const [outputText, setOutputText] = useState("");
  const [exitCode, setExitCode] = useState("0");
  const [copiedDraftKey, setCopiedDraftKey] = useState<string | null>(null);
  const [receiptDetailsOpen, setReceiptDetailsOpen] = useState(false);
  const [terminalApprovalPreviewsOpen, setTerminalApprovalPreviewsOpen] = useState(false);
  const plan = trpc.terminalLab.plan.useQuery();
  const observationFilter =
    observationScope === "selectedTask" && selectedTaskId
      ? { limit: 12, taskId: Number(selectedTaskId) }
      : observationScope === "selectedSession" && selectedSessionId
        ? { limit: 12, sessionId: Number(selectedSessionId) }
        : { limit: 12 };
  const observations = trpc.terminalLab.observations.useQuery(observationFilter);
  const selectedTaskNumber = selectedTaskId ? Number(selectedTaskId) : undefined;
  const tasks = trpc.tasks.workQueue.useQuery(
    { limit: 80, focusedTaskId: selectedTaskNumber },
    {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  );
  const sessions = trpc.sessions.recent.useQuery(
    { limit: 25 },
    {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  );
  const projectOverview = trpc.projectIntelligence.overview.useQuery(undefined, {
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
  const terminalEvidence = trpc.workbench.evidenceSummary.useQuery(
    { kind: "terminal_output", latestLimit: 50 },
    {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  );
  const workbenchReceipts = trpc.workbench.evidenceSummary.useQuery(
    { groupBy: "project", latestLimit: 1 },
    {
      enabled: receiptDetailsOpen,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  );
  const preview = trpc.terminalLab.previewCommand.useMutation();
  const observeOutput = trpc.terminalLab.observeOutput.useMutation();
  const linkObservation = trpc.terminalLab.linkObservation.useMutation();
  const previewDiagnosticDraft = trpc.terminalLab.previewDiagnosticDraft.useMutation();
  const updateObservationStatus = trpc.terminalLab.updateObservationStatus.useMutation();
  const createApprovalPreview = trpc.terminalLab.createApprovalPreviewFromObservation.useMutation();
  const terminalApprovalPreviews = trpc.terminalLab.approvalPreviews.useQuery(
    selectedObservationId == null ? { limit: 5 } : { observationId: selectedObservationId, limit: 5 },
    {
      enabled: terminalApprovalPreviewsOpen,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  );
  const executionProposals = trpc.execution.proposals.useQuery(
    selectedObservationId == null
      ? { limit: 5 }
      : { sourceType: "command_observation", sourceId: selectedObservationId, limit: 5 },
    {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  );
  const createExecutionProposal = trpc.execution.proposeFromCommandObservation.useMutation();
  const runApprovedAction = trpc.execution.runApprovedAction.useMutation();
  const createTaskFromObservation = trpc.terminalLab.createTaskFromObservation.useMutation();
  const createLearningProposal = trpc.terminalLab.createLearningProposalFromObservation.useMutation();
  const utils = trpc.useUtils();
  const data = plan.data;
  const observationActionCopy = terminalLabObservationActionCopy();
  const observationRows = observations.data ?? [];
  const taskOptions = tasks.data?.items ?? [];
  const sessionOptions = disambiguateSessionOptions(sessions.data?.items ?? []);
  const normalizedTaskLinkQuery = taskLinkQuery.trim().toLowerCase();
  const normalizedSessionLinkQuery = sessionLinkQuery.trim().toLowerCase();
  const visibleTaskOptions = normalizedTaskLinkQuery
    ? taskOptions.filter((task) => {
        const label = `#${task.id} ${task.projectName ? `${task.projectName}: ` : ""}${task.title}`;
        return label.toLowerCase().includes(normalizedTaskLinkQuery);
      })
    : taskOptions;
  const visibleSessionOptions = normalizedSessionLinkQuery
    ? sessionOptions.filter((session) => session.optionLabel.toLowerCase().includes(normalizedSessionLinkQuery))
    : sessionOptions;
  const selectedTask = taskOptions.find((task) => String(task.id) === selectedTaskId);
  const selectedSession = sessionOptions.find((session) => String(session.id) === selectedSessionId);
  const sessionLabelById = new Map(sessionOptions.map((session) => [session.id, session.optionLabel]));
  const selectedObservation = observationRows.find((item) => item.id === selectedObservationId) ?? null;
  const evidenceByObservationId = new Map(
    (terminalEvidence.data?.latest ?? [])
      .filter((item) => item.commandObservationId != null)
      .map((item) => [item.commandObservationId!, item]),
  );
  const selectedEvidence = selectedObservation ? evidenceByObservationId.get(selectedObservation.id) ?? null : null;
  const projectRows = projectOverview.data?.projects ?? [];
  const contextPath = selectedObservation?.cwd ?? "/Users/lindsaybell/Desktop/CereBro";
  const contextProject =
    projectRows.find((project) => selectedTask?.projectName && project.name === selectedTask.projectName) ??
    projectRows.find((project) => contextPath === project.localPath || contextPath.startsWith(`${project.localPath}/`)) ??
    projectRows.find((project) => project.slug === "cerebro") ??
    projectRows[0] ??
    null;
  const previewProject = preview.data?.projectId == null
    ? contextProject
    : projectRows.find((project) => project.tasks.projectId === preview.data?.projectId) ?? contextProject;
  const contextReceiptStats = (() => {
    if (!receiptDetailsOpen) return { total: 0, terminal: 0, needsReview: 0, validated: 0 };
    const projectId = contextProject?.tasks.projectId;
    if (projectId == null) return { total: 0, terminal: 0, needsReview: 0, validated: 0 };
    const group = workbenchReceipts.data?.groups.find((item) => item.key === String(projectId));
    if (!group) return { total: 0, terminal: 0, needsReview: 0, validated: 0 };
    return {
      total: group.count,
      terminal: group.terminal,
      needsReview: group.needsReview,
      validated: group.validated,
    };
  })();
  const teachingFrame = preview.data
    ? {
        title: "Aang reads this command preview.",
        route: `Aang explains. Cortana routes ${preview.data.suggestedAgent}. Spock holds execution approval.`,
        lesson: preview.data.explanation,
        proves: preview.data.risk === "read_only"
          ? "This can reveal local state when run through the approved command path."
          : "This needs a clearer execution reason before it can become an approved action.",
        next: preview.data.approvalRequiredToRun
          ? "Inspect the gates, then use Security Gate or Approval if this command still matters."
          : "Record the expected Workbench receipt before running anything elsewhere.",
        notYet: preview.data.gates,
        tone: toneForRisk(preview.data.risk),
      }
    : selectedObservation
      ? {
          title: `Aang teaches observation #${selectedObservation.id}.`,
          route: `Aang explains. Tony reads the follow-up. ${selectedObservation.risk === "read_only" ? "Spock watches the boundary." : "Spock gates execution."}`,
          lesson: selectedObservation.outputSummary
            ? selectedObservation.outputSummary
            : selectedObservation.explanation ?? "No output has been attached yet. Paste approved command output to turn this into a lesson.",
          proves: selectedObservation.exitCode === 0
            ? selectedEvidence
              ? `Workbench receipt #${selectedEvidence.id} is saved with ${selectedEvidence.validationStatus.replace(/_/g, " ")} validation.`
              : "Exit 0 suggests the command completed, but the output still needs a concrete Workbench receipt body."
            : selectedObservation.exitCode != null
              ? selectedEvidence
                ? `Exit ${selectedObservation.exitCode} is linked to Workbench receipt #${selectedEvidence.id}; check the Ledger trail before Tony acts on it.`
                : `Exit ${selectedObservation.exitCode} means this needs review and a Workbench receipt before Tony acts on it.`
              : selectedEvidence
                ? `Workbench receipt #${selectedEvidence.id} exists, but no exit code is recorded here.`
                : "No exit code or Workbench receipt has been recorded yet.",
          next: selectedEvidence
            ? selectedEvidence.validationStatus === "needs_review"
              ? "Open the Workbench body and add validation before treating this as build support."
              : "Use the Workbench body and Ledger trail as the receipt path for the next build decision."
            : selectedObservation.outputSummary
              ? "Create a Workbench receipt, then add a learning note or Tony follow-up if this result should shape the next build pass."
              : "Attach observed output from an approved command run, then save a Workbench receipt.",
          notYet: [
            "Do not rerun from Terminal Lab.",
            selectedEvidence ? "Do not treat this receipt as validated until its Workbench validation says so." : "Do not treat this as build support until a Workbench receipt exists.",
            "Do not push or mutate git from this panel.",
          ],
          tone: toneForRisk(selectedObservation.risk),
        }
      : {
          title: "Aang is waiting for a command or observation.",
          route: "Aang reads Build mode. Cortana keeps Terminal Lab proposal-only. Tony waits for a scoped command.",
          lesson: "Paste a command to explain it before running it elsewhere, or select an observation to teach from existing output.",
          proves: "Nothing is proven yet.",
          next: "Preview a command, then link it to a task or session.",
          notYet: [
            "No command execution from Terminal Lab.",
            "No external write, install, push, or destructive action without a gate.",
          ],
          tone: C.textMuted,
        };

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

  function openPreviewProjectContext() {
    const project = previewProject;
    if (!project || !onNavigate) return;
    try {
      window.sessionStorage.setItem(
        "cerebro:project-lab-focus",
        JSON.stringify({
          source: "terminal_lab_git_write_preview",
          projectId: project.tasks.projectId,
          projectName: project.name,
          notice: `Terminal Lab routed a git-write preview to ${project.name} push context. No git command ran.`,
        }),
      );
    } catch {
      // Project Lab still opens.
    }
    onNavigate("projects");
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
          utils.tasks.workQueue.invalidate();
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

  function stageExecutionContract(observationId: number) {
    if (createExecutionProposal.isPending) return;
    createExecutionProposal.mutate(
      { observationId },
      {
        onSuccess: () => {
          setSelectedObservationId(observationId);
          utils.execution.proposals.invalidate();
        },
      },
    );
  }

  function readRunGuard(proposalId: number) {
    if (runApprovedAction.isPending) return;
    runApprovedAction.mutate(
      { proposalId, approved: true },
      { onSuccess: () => utils.execution.proposals.invalidate() },
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

  function stageWorkbenchProof(observation: {
    id: number;
    projectId: number | null;
    taskId: number | null;
    sessionId: number | null;
    command: string;
    cwd: string | null;
    risk: string;
    status: string;
    outputSummary: string | null;
    explanation: string | null;
    exitCode: number | null;
  }) {
    if (!onNavigate) return;
    const summary = [
      observation.outputSummary || observation.explanation || "Terminal observation needs a concrete receipt summary.",
      "",
      `Command: ${observation.command}`,
      observation.cwd ? `Working directory: ${observation.cwd}` : null,
      `Risk: ${observation.risk.replace(/_/g, " ")}`,
      `Status: ${observation.status}`,
      observation.exitCode == null ? null : `Exit: ${observation.exitCode}`,
      "",
      "Staged from Terminal Lab. Saving in Workbench creates a local append-only receipt body. It does not execute the command.",
    ].filter(Boolean).join("\n");
    try {
      window.sessionStorage.setItem(
        "cerebro:workbench-draft",
        JSON.stringify({
          source: "terminal_lab",
          kind: "terminal_output",
          title: `Terminal receipt #${observation.id}`,
          summary,
          targetUri: `terminal_lab:observation:${observation.id}`,
          routeAgent: "tony",
          permissionClass: "manual_note",
          projectId: observation.projectId,
          taskId: observation.taskId,
          sessionId: observation.sessionId,
          commandObservationId: observation.id,
        }),
      );
    } catch {
      // Workbench will still open; the user can add the receipt manually.
    }
    onNavigate("workbench");
  }

  function openWorkbenchProof(observationId: number, evidenceId: number) {
    if (!onNavigate) return;
    try {
      window.sessionStorage.setItem(
        "cerebro:workbench-filter",
        JSON.stringify({
          source: "terminal_lab",
          evidenceId,
          kind: "terminal_output",
          query: `terminal_lab:observation:${observationId}`,
          groupBy: "command",
          notice: `Showing Workbench receipt for Terminal Lab observation #${observationId}.`,
        }),
      );
    } catch {
      // Workbench still opens; the user can filter manually.
    }
    onNavigate("workbench");
  }

  function openLedgerReceipt(observationId: number, evidenceId: number) {
    if (!onNavigate) return;
    try {
      window.sessionStorage.setItem(
        "cerebro:ledger-focus",
        JSON.stringify({
          source: "terminal_lab",
          evidenceId,
          observationId,
          notice: `Ledger opened Workbench receipt #${evidenceId} from Terminal Lab observation #${observationId}.`,
        }),
      );
    } catch {
      // Ledger still opens; the user can select the receipt manually.
    }
    onNavigate("ledger");
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
    <div className="flex h-full flex-col overflow-hidden" style={{ background: G.slabMuted, border: `1px solid ${G.line}`, color: C.textPrimary }}>
      <div
        className="flex items-center justify-between gap-2 px-2 py-1.5 shrink-0"
        style={{ borderBottom: `1px solid ${G.line}`, background: G.slab }}
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <div className="text-[12px] font-semibold uppercase tracking-wider" style={{ color: C.textPrimary }}>
              Terminal Lab
            </div>
            <Badge variant="success" className="uppercase">{terminalCopy.headerBadge}</Badge>
          </div>
          <div className="mt-1 flex flex-wrap gap-1">
            <Badge variant="secondary" className="uppercase">{terminalCopy.headerMode}</Badge>
            <Badge variant="default" className="uppercase">{terminalCopy.headerOwner}</Badge>
            <Badge variant="secondary" className="uppercase">{terminalCopy.headerSupport}</Badge>
          </div>
        </div>
        <Button type="button" onClick={onClose} variant="outline" size="sm" className="shrink-0">
          Close
        </Button>
      </div>

      <form onSubmit={submit} className="px-2 py-1.5 shrink-0 space-y-1.5" style={{ borderBottom: `1px solid ${G.lineSoft}`, background: G.slabRaised }}>
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
          <LinkPicker
            label="Task Link"
            searchLabel="Find task link"
            searchPlaceholder="Find task."
            searchValue={taskLinkQuery}
            onSearchChange={setTaskLinkQuery}
            value={selectedTaskId || "none"}
            onChange={(value) => setSelectedTaskId(value === "none" ? "" : value)}
            emptyLabel={normalizedTaskLinkQuery ? "No matching task" : "No task link"}
            options={[
              { value: "none", label: "No task link" },
              ...visibleTaskOptions.map((task) => ({
                value: String(task.id),
                label: `#${task.id} ${task.projectName ? `${task.projectName}: ` : ""}${task.title}`,
              })),
            ]}
          />
          <LinkPicker
            label="Session Link"
            searchLabel="Find session link"
            searchPlaceholder="Find run."
            searchValue={sessionLinkQuery}
            onSearchChange={setSessionLinkQuery}
            value={selectedSessionId || "none"}
            onChange={(value) => setSelectedSessionId(value === "none" ? "" : value)}
            emptyLabel={normalizedSessionLinkQuery ? "No matching run" : "No session link"}
            options={[
              { value: "none", label: "No session link" },
              ...visibleSessionOptions.map((session) => ({
                value: String(session.id),
                label: session.optionLabel,
              })),
            ]}
          />
        </div>
        <div className="truncate text-[10px]" style={{ color: C.textMuted }}>
          {terminalCopy.intentLine}
          {(selectedTask || selectedSession) && (
            <span> New previews will attach to {selectedTask ? `task #${selectedTask.id}` : ""}{selectedTask && selectedSession ? " and " : ""}{selectedSession ? selectedSession.displayName : ""}.</span>
          )}
        </div>
      </form>

      <AangTeachingFrame frame={teachingFrame} />
      <TerminalReceiptChainStrip
        observationId={selectedObservation?.id ?? preview.data?.observationId ?? null}
        receiptId={selectedEvidence?.id ?? null}
        receiptStatus={selectedEvidence?.validationStatus ?? null}
        projectName={contextProject?.name ?? null}
        pushLabel={contextProject?.pushReadiness.label ?? null}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] gap-2 px-2 pt-2 pb-16">
          <div className="space-y-2 min-w-0">
            {preview.data && (
              <section className="space-y-2">
                <SectionTitle title="Command Preview" detail={preview.data.risk.replace(/_/g, " ")} />
                <div className="rounded p-2 space-y-1.5" style={{ background: G.slab, border: `1px solid ${G.lineSoft}` }}>
                  <div className="flex flex-wrap gap-1">
                    <Chip label={preview.data.risk.replace(/_/g, " ")} tone={toneForRisk(preview.data.risk)} />
                    <Chip label={`agent ${preview.data.suggestedAgent}`} tone={C.gold} />
                    <Chip label={preview.data.approvalRequiredToRun ? "approval required" : "no approval"} tone={C.warning} />
                    <Chip label={preview.data.wouldExecute ? "would execute" : "no execution"} tone={C.success} />
                    <Chip label={`saved #${preview.data.observationId}`} tone={C.textSecondary} />
                    {preview.data.projectLabRouteRecommended && <Chip label="Project Lab route" tone={C.gold} />}
                  </div>
                  <div
                    className="text-[11px] rounded px-2 py-1 overflow-x-auto"
                    style={{ background: G.slabMuted, border: `1px solid ${G.lineSoft}`, color: C.textPrimary }}
                  >
                    <code>{preview.data.command}</code>
                  </div>
                  <div className="text-[11px] leading-snug" style={{ color: C.textSecondary }}>
                    {preview.data.explanation}
                  </div>
                  {preview.data.projectLabRouteReason && (
                    <div className="rounded px-2 py-1 text-[11px] leading-snug" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}`, color: C.textMuted }}>
                      {preview.data.projectLabRouteReason}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1">
                    {preview.data.projectLabRouteRecommended && (
                      <Button
                        type="button"
                        onClick={openPreviewProjectContext}
                        disabled={!onNavigate || !previewProject}
                        variant="outline"
                        size="sm"
                        className="w-fit"
                        title="Open Project Lab push context. Terminal Lab does not run git."
                        aria-label={`Open Project Lab push context for command preview ${preview.data.observationId}`}
                      >
                        Project Context
                      </Button>
                    )}
                    <Button
                      type="button"
                      onClick={() => openSecurityGateForCommand(preview.data.command)}
                      disabled={!onNavigate}
                      variant="risk"
                      size="sm"
                      className="w-fit"
                      title={!onNavigate ? "Security Gate route is not available from this panel state." : "Open Security Gate with this command as the target. Terminal Lab does not run it."}
                      aria-label={!onNavigate ? "Security Gate route unavailable" : `Open Security Gate for command preview ${preview.data.observationId}`}
                    >
                      Security Gate
                    </Button>
                  </div>
                </div>

                <div className="rounded p-2" style={{ background: G.slab, border: `1px solid ${G.lineSoft}` }}>
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
              <div className="flex items-center justify-between gap-2">
                <SectionTitle title="Recent Observations" detail={observationScope === "all" ? "local DB" : "filtered"} />
                <div className="flex flex-wrap gap-1 justify-end">
                  <ScopeButton active={observationScope === "all"} label="All" onClick={() => setObservationScope("all")} />
                  <ScopeButton
                    active={observationScope === "selectedTask"}
                    disabled={!selectedTaskId}
                    label="Task"
                    disabledReason="Select a task link before filtering observations by task."
                    onClick={() => setObservationScope("selectedTask")}
                  />
                  <ScopeButton
                    active={observationScope === "selectedSession"}
                    disabled={!selectedSessionId}
                    label="Session"
                    disabledReason="Select a session link before filtering observations by session."
                    onClick={() => setObservationScope("selectedSession")}
                  />
                </div>
              </div>
              <div className="space-y-2">
                {observationRows.length === 0 ? (
                  <div className="rounded p-2 text-[11px] leading-snug" style={{ background: C.surface, border: `1px solid ${C.borderSoft}`, color: C.textMuted }}>
                    {observationScope === "all"
                      ? "No command previews recorded yet. Paste a command, preview it, then save the receipt body in Workbench."
                      : "No command previews match the selected link. Switch to All or select a different task or session."}
                  </div>
                ) : (
                  observationRows.map((item) => (
                    <div key={item.id} className="rounded p-1.5 space-y-1" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
                      {(() => {
                        const savedEvidence = evidenceByObservationId.get(item.id);
                        return (
                          <>
                      <div className="flex flex-wrap gap-1">
                        <Chip label={`#${item.id}`} tone={C.textMuted} />
                        <Chip label={item.risk.replace(/_/g, " ")} tone={toneForRisk(item.risk)} />
                        <Chip label={item.suggestedAgent ?? "cortana"} tone={C.gold} />
                        <Chip label={item.status} tone={C.textSecondary} />
                        {savedEvidence && <Chip label={`receipt #${savedEvidence.id}`} tone={C.success} />}
                        {item.diagnosticStatus && <Chip label={item.diagnosticStatus.replace(/_/g, " ")} tone={C.warning} />}
                        {item.diagnosticParentId != null && <Chip label={`from #${item.diagnosticParentId}`} tone={C.gold} />}
                        {item.diagnosticRootId != null && <Chip label={`root #${item.diagnosticRootId}`} tone={C.textSecondary} />}
                        {item.diagnosticDepth != null && <Chip label={`depth ${item.diagnosticDepth}`} tone={C.textMuted} />}
                        {item.projectLabRouteRecommended && <Chip label="Project Lab route" tone={C.gold} />}
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
                      {item.projectLabRouteReason && (
                        <div className="text-[10px] leading-snug" style={{ color: C.gold }}>
                          {item.projectLabRouteReason} Terminal Lab did not run git.
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
                      {savedEvidence && (
                        <div className="text-[10px] leading-snug" style={{ color: savedEvidence.validationStatus === "needs_review" ? C.warning : C.success }}>
                          Workbench receipt #{savedEvidence.id}: {savedEvidence.validationStatus.replace(/_/g, " ")}. Open Workbench for the body or Ledger for the audit trail.
                        </div>
                      )}
                      <details className="rounded p-1.5" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}>
                        <summary className="cursor-pointer text-[10px] font-semibold uppercase tracking-wider" style={{ color: C.textPrimary }}>
                          {observationActionCopy.drawerTitle}
                        </summary>
                        <div className="mt-1.5 space-y-1.5">
                          {item.followUps.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                              {item.followUps.map((followUp) => (
                                <div key={`${item.id}-${followUp.agent}-${followUp.title}`} className="rounded px-1.5 py-1" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
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
                                <div key={`${item.id}-${draft.title}-${draft.command}`} className="rounded p-1.5" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
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
                                        title={previewDiagnosticDraft.isPending ? "Previewing Tony diagnostic draft." : "Preview Tony's diagnostic command as a saved observation. This does not run it."}
                                        aria-label={`Preview Tony diagnostic draft from observation ${item.id}`}
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
                                    <DiagnosticNote label="Receipt Need" value={draft.evidence} />
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
                            <ActionGroup label={observationActionCopy.statusGroup}>
                              <Button
                                type="button"
                                onClick={() => setObservationStatus(item.id, "reviewing")}
                                disabled={updateObservationStatus.isPending || item.status === "reviewing"}
                                title={item.status === "reviewing" ? "This observation is already marked for review." : undefined}
                                aria-label={item.status === "reviewing" ? "Observation already marked for review" : `Mark observation ${item.id} for review`}
                                variant={item.status === "reviewing" ? "secondary" : "ghost"}
                                size="sm"
                              >
                                {observationActionCopy.reviewButton}
                              </Button>
                              <Button
                                type="button"
                                onClick={() => setObservationStatus(item.id, "blocked")}
                                disabled={updateObservationStatus.isPending || item.status === "blocked"}
                                title={item.status === "blocked" ? "This observation is already blocked." : undefined}
                                aria-label={item.status === "blocked" ? "Observation already blocked" : `Block observation ${item.id}`}
                                variant="risk"
                                size="sm"
                              >
                                {observationActionCopy.blockButton}
                              </Button>
                            </ActionGroup>
                            <ActionGroup label={observationActionCopy.approvalGroup}>
                              <Button
                                type="button"
                                onClick={() => stageCommandApprovalPreview(item.id)}
                                disabled={createApprovalPreview.isPending}
                                title={createApprovalPreview.isPending ? "Creating local approval preview." : "Create a local approval preview. This does not run the command."}
                                aria-label={`Create local approval preview for observation ${item.id}`}
                                variant="risk"
                                size="sm"
                              >
                                {observationActionCopy.approvalButton}
                              </Button>
                              <Button
                                type="button"
                                onClick={() => stageExecutionContract(item.id)}
                                disabled={createExecutionProposal.isPending}
                                title={createExecutionProposal.isPending ? "Creating local execution contract." : "Create a local action proposal contract. This does not run the command."}
                                aria-label={`Create local execution action proposal for observation ${item.id}`}
                                variant="risk"
                                size="sm"
                              >
                                Action Contract
                              </Button>
                              <Button
                                type="button"
                                onClick={() => openSecurityGateForCommand(item.command)}
                                disabled={!onNavigate}
                                title={!onNavigate ? "Security Gate route is not available from this panel state." : "Open Security Gate with this command as the target."}
                                aria-label={!onNavigate ? "Security Gate route unavailable" : `Open Security Gate for observation ${item.id}`}
                                variant="risk"
                                size="sm"
                              >
                                {observationActionCopy.securityButton}
                              </Button>
                            </ActionGroup>
                            <ActionGroup label={observationActionCopy.connectGroup}>
                              <Button
                                type="button"
                                onClick={() => attachSelectedLinks(item.id)}
                                disabled={linkObservation.isPending || (!selectedTaskId && !selectedSessionId)}
                                title={!selectedTaskId && !selectedSessionId ? "Select a task or session before linking this observation." : undefined}
                                aria-label={!selectedTaskId && !selectedSessionId ? "Select a task or session before linking" : `Link selected task or session to observation ${item.id}`}
                                variant="secondary"
                                size="sm"
                              >
                                {observationActionCopy.selectedLinkButton}
                              </Button>
                              <Button
                                type="button"
                                onClick={() => createFollowUpTask(item.id)}
                                disabled={createTaskFromObservation.isPending || item.taskId != null}
                                title={item.taskId != null ? "This observation is already linked to a task." : undefined}
                                aria-label={item.taskId != null ? "Observation already linked to a task" : `Create follow-up task from observation ${item.id}`}
                                variant="secondary"
                                size="sm"
                              >
                                {observationActionCopy.taskButton}
                              </Button>
                              <Button
                                type="button"
                                onClick={() => createLearningNote(item.id)}
                                disabled={createLearningProposal.isPending}
                                title={createLearningProposal.isPending ? "Creating local learning proposal." : "Create a local learning proposal from this observation."}
                                aria-label={`Create learning proposal from observation ${item.id}`}
                                variant="secondary"
                                size="sm"
                              >
                                {observationActionCopy.learningButton}
                              </Button>
                            </ActionGroup>
                            <ActionGroup label={observationActionCopy.receiptGroup}>
                              <Button
                                type="button"
                                onClick={() => setSelectedObservationId(item.id)}
                                aria-label={`Teach from observation ${item.id}`}
                                title="Show Aang's teaching frame for this observation."
                                variant={selectedObservationId === item.id ? "secondary" : "ghost"}
                                size="sm"
                              >
                                {observationActionCopy.teachButton}
                              </Button>
                              <Button
                                type="button"
                                onClick={() => savedEvidence ? openWorkbenchProof(item.id, savedEvidence.id) : stageWorkbenchProof(item)}
                                disabled={!onNavigate}
                                title={!onNavigate ? "Workbench route is not available from this panel state." : savedEvidence ? "Open the linked Workbench receipt body." : "Stage this observation as a local Workbench receipt."}
                                aria-label={!onNavigate ? "Workbench route unavailable" : savedEvidence ? `Open Workbench receipt ${savedEvidence.id}` : `Save observation ${item.id} as Workbench receipt`}
                                variant="secondary"
                                size="sm"
                              >
                                {savedEvidence ? observationActionCopy.workbenchBodyButton : observationActionCopy.saveReceiptButton}
                              </Button>
                              {savedEvidence && (
                                <Button
                                  type="button"
                                  onClick={() => openLedgerReceipt(item.id, savedEvidence.id)}
                                  disabled={!onNavigate}
                                  title={!onNavigate ? "Ledger route is not available from this panel state." : "Open the Ledger audit trail for this receipt."}
                                  aria-label={!onNavigate ? "Ledger route unavailable" : `Open Ledger trail for receipt ${savedEvidence.id}`}
                                  variant="secondary"
                                  size="sm"
                                >
                                  {observationActionCopy.ledgerButton}
                                </Button>
                              )}
                              <Button
                                type="button"
                                onClick={() => setObservationStatus(item.id, "archived")}
                                disabled={updateObservationStatus.isPending || item.status === "archived"}
                                title={item.status === "archived" ? "This observation is already archived." : undefined}
                                aria-label={item.status === "archived" ? "Observation already archived" : `Archive observation ${item.id}`}
                                variant="ghost"
                                size="sm"
                              >
                                {observationActionCopy.archiveButton}
                              </Button>
                            </ActionGroup>
                          </div>
                        </div>
                      </details>
                          </>
                        );
                      })()}
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>

          <aside className="space-y-1.5 min-w-0">
            <ProjectContextRail
              project={contextProject}
              isLoading={projectOverview.isLoading}
              contextLabel={selectedObservation ? `observation #${selectedObservation.id}` : selectedTask ? `task #${selectedTask.id}` : "current repo"}
              receiptStats={contextReceiptStats}
              receiptStatsOpen={receiptDetailsOpen}
              receiptStatsReading={workbenchReceipts.isLoading}
              onReceiptStatsToggle={setReceiptDetailsOpen}
              onNavigate={onNavigate}
            />

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
                  title={
                    selectedObservationId == null
                      ? "Select an observation before saving observed output."
                      : !outputText.trim()
                        ? "Paste approved command output before saving a local summary."
                        : "Save a redacted local output summary. This does not run a command."
                  }
                  aria-label="Save observed output summary"
                >
                  {observeOutput.isPending ? "Saving" : "Save Summary"}
                </Button>
              </div>
              <div className="text-[10px] leading-snug" style={{ color: C.textMuted }}>
                Saves a redacted local summary. No command execution.
              </div>
            </form>

            <section className="rounded p-1.5" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }} aria-label="Execution contract readback">
              <SectionTitle title="Execution Contract" detail={selectedObservationId == null ? "recent" : `#${selectedObservationId}`} />
              <div className="mt-2 space-y-1.5">
                {executionProposals.isLoading ? (
                  <div className="text-[11px] leading-snug" style={{ color: C.textMuted }}>Reading local action proposals.</div>
                ) : executionProposals.data?.items.length === 0 ? (
                  <div className="text-[11px] leading-snug" style={{ color: C.textMuted }}>
                    No action contract yet. Create one from an observation after the approval preview and Workbench receipt are visible.
                  </div>
                ) : (
                  executionProposals.data?.items.map((proposal) => (
                    <div key={proposal.id} className="rounded p-1.5" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}>
                      <div className="flex flex-wrap gap-1">
                        <Chip label={`action #${proposal.id}`} tone={C.textMuted} />
                        <Chip label={proposal.riskClass.replace(/_/g, " ")} tone={toneForRisk(proposal.riskClass)} />
                        <Chip label={proposal.approvalStatus ?? "no approval"} tone={proposal.approvalStatus === "approved" ? C.success : C.warning} />
                        <Chip label={proposal.readiness.canExecute ? "contract ready" : "blocked"} tone={proposal.readiness.canExecute ? C.success : C.warning} />
                        <Chip label={proposal.resultState.replace(/_/g, " ")} tone={C.textSecondary} />
                      </div>
                      <div className="mt-1 rounded px-2 py-1 text-[10px] leading-snug" style={{ background: C.surface, border: `1px solid ${C.borderSoft}`, color: C.textSecondary }}>
                        {proposal.readiness.canExecute
                          ? "Task, Workbench body, and approval receipt are present. Runner adapter is still blocked in this slice."
                          : proposal.readiness.missing.join("; ")}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-1">
                        <Button
                          type="button"
                          onClick={() => readRunGuard(proposal.id)}
                          disabled={runApprovedAction.isPending}
                          title="Read the run guard. This does not execute a command in this slice."
                          aria-label={`Read run guard for execution action proposal ${proposal.id}`}
                          variant="risk"
                          size="sm"
                        >
                          Read Run Gate
                        </Button>
                      </div>
                    </div>
                  ))
                )}
                {runApprovedAction.data && (
                  <div className="rounded p-1.5 text-[10px] leading-snug" role="status" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}`, color: C.warning }}>
                    {runApprovedAction.data.reason}
                  </div>
                )}
              </div>
            </section>

            <details className="rounded p-1.5" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
              <summary className="cursor-pointer text-[11px] font-bold uppercase tracking-widest" style={{ color: C.textPrimary }}>
                Terminal Rules
              </summary>
              <div className="mt-2 grid gap-2">
                <section className="rounded p-1.5" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}>
                  <SectionTitle title="Policy" detail="locked" />
                  <div className="mt-2 grid gap-1">
                    {(data?.policies ?? []).map((policy) => (
                      <RailLine key={policy} text={policy} />
                    ))}
                  </div>
                </section>

                <section className="rounded p-1.5" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}>
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

                <section className="rounded p-1.5" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}>
                  <SectionTitle title="Surfaces" detail="Terminal Lab V1" />
                  <div className="mt-2 grid gap-1.5">
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

                <details
                  className="rounded p-1.5"
                  onToggle={(event) => setTerminalApprovalPreviewsOpen(event.currentTarget.open)}
                  style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}
                >
                  <summary className="cursor-pointer">
                    <SectionTitle title="Approval Previews" detail={terminalApprovalPreviewsOpen ? selectedObservationId == null ? "recent" : `#${selectedObservationId}` : "open to read"} />
                  </summary>
                  <div className="mt-2 space-y-2">
                    {!terminalApprovalPreviewsOpen ? (
                      <div className="text-[11px] leading-relaxed" style={{ color: C.textMuted }}>
                        Open to read local command approval previews.
                      </div>
                    ) : terminalApprovalPreviews.isLoading ? (
                      <div className="text-[11px] leading-relaxed" style={{ color: C.textMuted }}>
                        Reading local command approval previews.
                      </div>
                    ) : (terminalApprovalPreviews.data ?? []).length === 0 ? (
                      <div className="text-[11px] leading-relaxed" style={{ color: C.textMuted }}>
                        No local command approval previews yet.
                      </div>
                    ) : (
                      terminalApprovalPreviews.data?.map((approval) => (
                        <div key={approval.id} className="rounded p-1.5" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
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
                </details>
              </div>
            </details>
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
    <Badge variant={variant} className="uppercase" title={label}>
      <span className="min-w-0 truncate">{label}</span>
    </Badge>
  );
}

function AangTeachingFrame({
  frame,
}: {
  frame: {
    title: string;
    route: string;
    lesson: string;
    proves: string;
    next: string;
    notYet: string[];
    tone: string;
  };
}) {
  return (
    <section
      className="shrink-0 px-2 py-1.5"
      aria-label="Aang teaching frame"
      style={{ background: G.slabRaised, borderBottom: `1px solid ${G.lineSoft}` }}
    >
      <div className="grid gap-1.5 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <div className="rounded p-1.5" style={{ background: G.slab, border: `1px solid ${G.lineSoft}` }}>
          <div className="flex items-center justify-between gap-2">
            <div className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: frame.tone }}>
              Aang Teaching
            </div>
            <Chip label="proposal only" tone={C.success} />
          </div>
          <div className="mt-1 text-[11px] font-semibold leading-snug" style={{ color: C.textPrimary }}>
            {frame.title}
          </div>
          <div className="mt-1 text-[10px] leading-snug" style={{ color: C.textMuted }}>
            {frame.route}
          </div>
        </div>

        <TeachingBlock title="Lesson" body={frame.lesson} tone={C.gold} />
        <TeachingBlock title="Receipt" body={frame.proves} tone={C.accent} />
      </div>
      <div className="mt-1.5 grid gap-1.5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <TeachingBlock title="Next Safe Step" body={frame.next} tone={C.success} />
        <div className="rounded p-1.5" style={{ background: G.slab, border: `1px solid ${G.lineSoft}` }}>
          <div className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: C.warning }}>
            Not Yet
          </div>
          <ul className="mt-1 grid gap-0.5">
            {frame.notYet.map((item) => (
              <li key={item} className="text-[10px] leading-snug" style={{ color: C.textMuted }}>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function TerminalReceiptChainStrip({
  observationId,
  receiptId,
  receiptStatus,
  projectName,
  pushLabel,
}: {
  observationId: number | null;
  receiptId: number | null;
  receiptStatus: string | null;
  projectName: string | null;
  pushLabel: string | null;
}) {
  const receiptTone = receiptId == null ? C.warning : receiptStatus === "needs_review" ? C.warning : C.success;
  const copy = terminalLabReceiptChainCopy();
  const steps = [
    {
      label: copy.firstStepLabel,
      value: observationId == null ? copy.emptyObservationText : `observation #${observationId}`,
      tone: observationId == null ? C.textMuted : C.gold,
    },
    {
      label: copy.workbenchStepLabel,
      value: receiptId == null ? copy.emptyReceiptText : `receipt #${receiptId} ${receiptStatus?.replace(/_/g, " ") ?? "recorded"}`,
      tone: receiptTone,
    },
    {
      label: copy.projectStepLabel,
      value: projectName == null ? copy.emptyProjectText : `${projectName}: ${pushLabel ?? copy.fallbackProjectValue}`,
      tone: projectName == null ? C.textMuted : C.accent,
    },
  ];

  return (
    <section className="shrink-0 px-2 py-1.5" aria-label={copy.ariaLabel} style={{ borderBottom: `1px solid ${G.lineSoft}`, background: G.slabRaised }}>
      <div className="grid gap-1 md:grid-cols-3">
        {steps.map((step) => (
          <div key={step.label} className="min-w-0 rounded px-1.5 py-1" style={{ background: G.slab, border: `1px solid ${G.lineSoft}` }}>
            <div className="text-[9px] font-semibold uppercase leading-none" style={{ color: step.tone }}>
              {step.label}
            </div>
            <div className="mt-0.5 truncate text-[10px] leading-tight" title={step.value} style={{ color: C.textSecondary }}>
              {step.value}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-1 text-[10px] leading-snug" style={{ color: C.textMuted }}>
        {copy.footer}
      </div>
    </section>
  );
}

function ProjectContextRail({
  project,
  isLoading,
  contextLabel,
  receiptStats,
  receiptStatsOpen,
  receiptStatsReading,
  onReceiptStatsToggle,
  onNavigate,
}: {
  project: TerminalProjectContext | null;
  isLoading: boolean;
  contextLabel: string;
  receiptStats: { total: number; terminal: number; needsReview: number; validated: number };
  receiptStatsOpen: boolean;
  receiptStatsReading: boolean;
  onReceiptStatsToggle: (open: boolean) => void;
  onNavigate?: (route: "projects" | "workbench" | "ledger") => void;
}) {
  if (isLoading) {
    return (
      <section className="rounded p-1.5" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
        <SectionTitle title="Project Context" detail="reading" />
        <div className="mt-2 text-[11px] leading-snug" style={{ color: C.textMuted }}>
          Reading Project Lab push context.
        </div>
      </section>
    );
  }

  if (!project) {
    return (
      <section className="rounded p-1.5" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
        <SectionTitle title="Project Context" detail="none" />
        <div className="mt-2 text-[11px] leading-snug" style={{ color: C.textMuted }}>
          No Project Lab context matched this command yet. Link the observation to a project, task, or session before treating it as push context.
        </div>
      </section>
    );
  }

  const pushTone = toneForPushState(project.pushReadiness.state);
  const activeProject = project;
  const copy = terminalLabProjectReadCopy();
  const statusTone = project.localExists
    ? project.git.dirty
      ? C.danger
      : C.success
    : C.warning;
  const receiptTone = !receiptStatsOpen ? C.textMuted : receiptStats.needsReview > 0 ? C.warning : receiptStats.total > 0 ? C.success : C.textMuted;
  const mapRead = [
    { label: "Branch", value: project.pushReadiness.evidence.branch ?? project.git.branch ?? "unavailable", tone: project.git.branch ? C.textSecondary : C.warning },
    { label: "Dirty", value: project.git.dirty ? `${project.git.dirtyCount} local` : "clean", tone: project.git.dirty ? C.danger : C.success },
    { label: copy.readStateLabel, value: project.pushReadiness.label, tone: pushTone },
    {
      label: copy.bodyStatsLabel,
      value: receiptStatsOpen ? copy.bodyStatsValue(receiptStats.total, receiptStats.needsReview) : copy.bodyStatsClosed,
      tone: receiptTone,
    },
    { label: copy.manualLabel, value: copy.manualValue, tone: C.gold },
    { label: copy.executionLabel, value: copy.executionValue(project.pushReadiness.executesGit), tone: project.pushReadiness.executesGit ? C.danger : C.success },
  ];
  function openProjectContext() {
    if (!onNavigate) return;
    try {
      window.sessionStorage.setItem(
        "cerebro:project-lab-focus",
        JSON.stringify({
          source: "terminal_lab",
          projectId: activeProject.tasks.projectId,
          projectName: activeProject.name,
          notice: `Terminal Lab ${contextLabel} opened ${activeProject.name} project context.`,
        }),
      );
    } catch {
      // Project Lab still opens; the user can inspect project context manually.
    }
    onNavigate("projects");
  }
  function openWorkbenchContext() {
    if (!onNavigate) return;
    try {
      window.sessionStorage.setItem(
        "cerebro:workbench-filter",
        JSON.stringify({
          source: "terminal_lab",
          projectId: activeProject.tasks.projectId,
          groupBy: "project",
          notice: `Terminal Lab ${contextLabel} opened ${activeProject.name} Workbench receipts.`,
        }),
      );
    } catch {
      // Workbench still opens; the user can inspect receipt bodies manually.
    }
    onNavigate("workbench");
  }
  function openLedgerContext() {
    if (!onNavigate) return;
    try {
      window.sessionStorage.setItem(
        "cerebro:ledger-focus",
        JSON.stringify({
          source: "terminal_lab",
          projectId: activeProject.tasks.projectId,
          projectName: activeProject.name,
          notice: `Terminal Lab ${contextLabel} opened Ledger for ${activeProject.name}.`,
        }),
      );
    } catch {
      // Ledger still opens; the user can inspect audit rows manually.
    }
    onNavigate("ledger");
  }

  return (
    <section className="rounded p-1.5" aria-label="Project Lab context" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
      <SectionTitle title={copy.title} detail={contextLabel} />
      <div className="mt-2 flex flex-wrap gap-1">
        <Chip label={project.name} tone={C.gold} />
        <Chip label={project.localExists ? project.git.statusText : "missing"} tone={statusTone} />
        <Chip label={project.pushReadiness.label} tone={pushTone} />
      </div>

      <div className="mt-2 grid grid-cols-2 gap-1 md:grid-cols-3">
        {mapRead.map((item) => (
          <ContextDatum key={item.label} label={item.label} value={item.value} tone={item.tone} />
        ))}
      </div>

      <div className="mt-2 rounded p-1.5" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}>
        <div className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: C.success }}>
          Next Safe Action
        </div>
        <div className="mt-1 text-[11px] leading-snug" style={{ color: C.textSecondary }}>
          {project.nextSafeAction}
        </div>
      </div>

      <details
        className="mt-2 rounded p-1.5"
        onToggle={(event) => onReceiptStatsToggle(event.currentTarget.open)}
        style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}
      >
        <summary className="cursor-pointer text-[10px] font-semibold uppercase tracking-wider" style={{ color: C.textPrimary }}>
          {copy.receiptDetailsTitle} <span style={{ color: C.textMuted }}>{receiptStatsOpen ? "local" : copy.receiptDetailsClosed}</span>
        </summary>
        <div className="mt-1.5">
          <div className="flex items-center justify-between gap-2">
            <div className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: receiptStats.needsReview > 0 ? C.warning : receiptStats.total > 0 ? C.success : C.textMuted }}>
              {copy.receiptDetailsHeading}
            </div>
            <Chip label={`${receiptStats.total} total`} tone={receiptStats.total > 0 ? C.accent : C.textMuted} />
          </div>
          {receiptStatsReading ? (
            <div className="mt-1 text-[10px] leading-snug" style={{ color: C.textMuted }}>
              {copy.receiptDetailsReading}
            </div>
          ) : (
            <>
              <div className="mt-1 grid grid-cols-3 gap-1">
                <ContextDatum label="Terminal" value={String(receiptStats.terminal)} tone={receiptStats.terminal > 0 ? C.warning : C.textSecondary} />
                <ContextDatum label="Review" value={String(receiptStats.needsReview)} tone={receiptStats.needsReview > 0 ? C.danger : C.textSecondary} />
                <ContextDatum label="Validated" value={String(receiptStats.validated)} tone={receiptStats.validated > 0 ? C.success : C.textSecondary} />
              </div>
              <div className="mt-1 text-[10px] leading-snug" style={{ color: C.textMuted }}>
                {copy.receiptDetailsFooter}
              </div>
            </>
          )}
        </div>
      </details>

      <details className="mt-2 rounded p-1.5" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}>
        <summary className="cursor-pointer text-[10px] font-semibold uppercase tracking-wider" style={{ color: C.textPrimary }}>
          {copy.boundaryTitle}
        </summary>
        <div className="mt-1 text-[10px] leading-snug" style={{ color: C.textMuted }}>
          {copy.boundaryText}
        </div>
        <div className="mt-1 text-[10px] leading-snug" style={{ color: C.textMuted }}>
          {copy.boundaryStateText(project.pushReadiness.executesGit, project.pushReadiness.automationRequiresApproval)}
        </div>
      </details>
      {onNavigate && (
        <div className="mt-2 grid grid-cols-3 gap-1">
          <Button type="button" size="sm" variant="outline" className="h-7 px-2" onClick={openProjectContext} aria-label={`Open ${project.name} in Project Lab`}>
            Project
          </Button>
          <Button type="button" size="sm" variant="outline" className="h-7 px-2" onClick={openWorkbenchContext} aria-label={`Open ${project.name} Workbench receipts`}>
            Workbench
          </Button>
          <Button type="button" size="sm" variant="outline" className="h-7 px-2" onClick={openLedgerContext} aria-label={`Open ${project.name} Ledger audit trail`}>
            Ledger
          </Button>
        </div>
      )}
    </section>
  );
}

function ContextDatum({ label, value, tone = C.textSecondary }: { label: string; value: string; tone?: string }) {
  return (
    <div className="min-w-0 rounded px-1.5 py-1" style={{ background: G.slabMuted, border: `1px solid ${G.lineSoft}` }}>
      <div className="text-[9px] uppercase tracking-wider" style={{ color: C.textMuted }}>
        {label}
      </div>
      <div className="mt-0.5 truncate text-[10px]" title={value} style={{ color: tone }}>
        {value}
      </div>
    </div>
  );
}

function TeachingBlock({ title, body, tone }: { title: string; body: string; tone: string }) {
  return (
    <div className="rounded p-1.5" style={{ background: G.slab, border: `1px solid ${G.lineSoft}` }}>
      <div className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: tone }}>
        {title}
      </div>
      <div className="mt-1 text-[11px] leading-snug" style={{ color: C.textSecondary }}>
        {body}
      </div>
    </div>
  );
}

function LinkPicker({
  label,
  searchLabel,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  value,
  onChange,
  emptyLabel,
  options,
}: {
  label: string;
  searchLabel: string;
  searchPlaceholder: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  value: string;
  onChange: (value: string) => void;
  emptyLabel: string;
  options: readonly { value: string; label: string }[];
}) {
  const hasVisibleMatches = options.length > 1;

  return (
    <div className="grid gap-1">
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
      <Input
        aria-label={searchLabel}
        value={searchValue}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder={searchPlaceholder}
        className="h-6 text-[11px]"
      />
      {!hasVisibleMatches && (
        <div className="truncate text-[10px]" style={{ color: C.textMuted }}>
          {emptyLabel}
        </div>
      )}
    </div>
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
  disabledReason,
  label,
  onClick,
}: {
  active: boolean;
  disabled?: boolean;
  disabledReason?: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      disabled={disabled}
      onClick={onClick}
      title={disabled ? disabledReason : undefined}
      aria-label={disabled ? disabledReason : label}
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

function toneForPushState(state: string) {
  if (state === "needs_cleanup") return C.danger;
  if (state === "hold_dirty" || state === "commit_locally") return C.warning;
  if (state === "push_branch" || state === "open_pr") return C.success;
  return C.textMuted;
}
