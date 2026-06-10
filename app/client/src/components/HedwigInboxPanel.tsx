import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { sourceDisplayName } from "@/lib/displayLabels";
import { cerebroColors as C } from "@/lib/keepConfig";
import { Badge } from "@/components/ui/badge";
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

export default function HedwigInboxPanel({ onClose, onNavigate }: { onClose: () => void; onNavigate?: (route: "security") => void }) {
  const [text, setText] = useState("");
  const [sourceLabel, setSourceLabel] = useState("slack:proposal");
  const [selectedProposal, setSelectedProposal] = useState<{
    kind: "source" | "reminder" | "message";
    id: number;
  } | null>(null);
  const [reviewPriority, setReviewPriority] = useState("normal");
  const [reviewNotes, setReviewNotes] = useState("");
  const [approvalScope, setApprovalScope] = useState("");
  const [externalTarget, setExternalTarget] = useState("");
  const [needsReview, setNeedsReview] = useState(true);
  const [approvalAction, setApprovalAction] = useState("source_enrichment");
  const [approvalPreviewsOpen, setApprovalPreviewsOpen] = useState(false);
  const plan = trpc.hedwig.capturePlan.useQuery();
  const observations = trpc.hedwig.observations.useQuery({ limit: 10 });
  const reminders = trpc.hedwig.reminderProposals.useQuery({ limit: 5 });
  const messageDrafts = trpc.hedwig.messageDraftProposals.useQuery({ limit: 5 });
  const preview = trpc.hedwig.previewCapture.useMutation();
  const [triageId, setTriageId] = useState<number | null>(null);
  const triage = trpc.hedwig.triageObservation.useQuery(
    { id: triageId ?? 0 },
    { enabled: triageId != null },
  );
  const createTask = trpc.hedwig.createTaskFromObservation.useMutation();
  const saveSource = trpc.hedwig.saveSourceFromObservation.useMutation();
  const createReminder = trpc.hedwig.createReminderProposalFromObservation.useMutation();
  const createMessageDraft = trpc.hedwig.createMessageDraftProposalFromObservation.useMutation();
  const proposalDetail = trpc.hedwig.proposalDetail.useQuery(
    selectedProposal ?? { kind: "source", id: 0 },
    { enabled: selectedProposal != null },
  );
  const updateSourceStatus = trpc.hedwig.updateSourceProposalStatus.useMutation();
  const updateReminderStatus = trpc.hedwig.updateReminderProposalStatus.useMutation();
  const updateMessageStatus = trpc.hedwig.updateMessageDraftProposalStatus.useMutation();
  const updateSourceReview = trpc.hedwig.updateSourceProposalReview.useMutation();
  const updateReminderReview = trpc.hedwig.updateReminderProposalReview.useMutation();
  const updateMessageReview = trpc.hedwig.updateMessageDraftProposalReview.useMutation();
  const createApprovalPreview = trpc.hedwig.createApprovalPreviewFromProposal.useMutation();
  const approvalPreviews = trpc.hedwig.approvalPreviews.useQuery(
    selectedProposal
      ? { targetType: targetTypeForProposal(selectedProposal.kind), targetId: selectedProposal.id, limit: 5 }
      : { limit: 5 },
    {
      enabled: selectedProposal != null && approvalPreviewsOpen,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  );
  const utils = trpc.useUtils();
  const data = plan.data;

  useEffect(() => {
    const detail = proposalDetail.data;
    if (!detail?.found) return;
    const item = detail.item;
    setReviewPriority("reviewPriority" in item ? item.reviewPriority ?? "normal" : "priority" in item ? item.priority ?? "normal" : "normal");
    setReviewNotes("reviewNotes" in item ? item.reviewNotes ?? "" : "");
    setApprovalScope("approvalScope" in item ? item.approvalScope ?? "" : "");
    setExternalTarget("proposedExternalTarget" in item ? item.proposedExternalTarget ?? "" : "");
    setNeedsReview("needsReview" in item ? Boolean(item.needsReview) : true);
    if (detail.kind === "source") setApprovalAction("source_enrichment");
    if (detail.kind === "reminder") setApprovalAction("schedule_reminder");
    if (detail.kind === "message") setApprovalAction("send_message");
  }, [proposalDetail.data]);

  useEffect(() => {
    setApprovalPreviewsOpen(false);
  }, [selectedProposal?.kind, selectedProposal?.id]);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || preview.isPending) return;
    preview.mutate(
      { text: trimmed, sourceLabel: sourceLabel.trim() || undefined },
      { onSuccess: () => utils.hedwig.observations.invalidate() },
    );
  }

  function createTaskFromTriage() {
    if (triageId == null || createTask.isPending) return;
    createTask.mutate(
      { id: triageId },
      {
        onSuccess: () => {
          utils.hedwig.observations.invalidate();
          utils.tasks.list.invalidate();
          utils.tasks.projects.invalidate();
          utils.projectIntelligence.overview.invalidate();
          utils.hedwig.triageObservation.invalidate({ id: triageId });
        },
      },
    );
  }

  function saveSourceFromTriage() {
    if (triageId == null || saveSource.isPending) return;
    saveSource.mutate(
      { id: triageId },
      {
        onSuccess: () => {
          utils.hedwig.observations.invalidate();
          utils.hedwig.triageObservation.invalidate({ id: triageId });
          utils.surfer.panel.invalidate();
          utils.projectIntelligence.overview.invalidate();
        },
      },
    );
  }

  function createReminderFromTriage() {
    if (triageId == null || createReminder.isPending) return;
    createReminder.mutate(
      { id: triageId },
      {
        onSuccess: () => {
          utils.hedwig.observations.invalidate();
          utils.hedwig.triageObservation.invalidate({ id: triageId });
          utils.hedwig.reminderProposals.invalidate();
          utils.projectIntelligence.overview.invalidate();
        },
      },
    );
  }

  function createMessageDraftFromTriage() {
    if (triageId == null || createMessageDraft.isPending) return;
    createMessageDraft.mutate(
      { id: triageId },
      {
        onSuccess: () => {
          utils.hedwig.observations.invalidate();
          utils.hedwig.triageObservation.invalidate({ id: triageId });
          utils.hedwig.messageDraftProposals.invalidate();
          utils.projectIntelligence.overview.invalidate();
        },
      },
    );
  }

  function openSecurityGate(target: string | null | undefined) {
    if (!target?.trim() || !onNavigate) return;
    try {
      window.sessionStorage.setItem("cerebro:security-target", target.trim());
    } catch {
      // Ignore storage failure. The Security Gate form still opens.
    }
    onNavigate("security");
  }

  function invalidateHedwigProposalViews() {
    utils.hedwig.observations.invalidate();
    utils.hedwig.reminderProposals.invalidate();
    utils.hedwig.messageDraftProposals.invalidate();
    utils.hedwig.approvalPreviews.invalidate();
    if (selectedProposal) utils.hedwig.proposalDetail.invalidate(selectedProposal);
    utils.projectIntelligence.overview.invalidate();
  }

  function updateSelectedProposalStatus(status: string) {
    if (!selectedProposal) return;
    if (selectedProposal.kind === "source") {
      updateSourceStatus.mutate(
        { id: selectedProposal.id, status: status as "inbox" | "triaged" | "sourced" | "archived" },
        { onSuccess: invalidateHedwigProposalViews },
      );
      return;
    }
    if (selectedProposal.kind === "reminder") {
      updateReminderStatus.mutate(
        {
          id: selectedProposal.id,
          status: status as "proposed" | "reviewing" | "ready_for_approval" | "deferred" | "archived",
        },
        { onSuccess: invalidateHedwigProposalViews },
      );
      return;
    }
    updateMessageStatus.mutate(
      {
        id: selectedProposal.id,
        status: status as "proposed" | "reviewing" | "ready_for_approval" | "deferred" | "archived",
      },
      { onSuccess: invalidateHedwigProposalViews },
    );
  }

  const statusUpdatePending =
    updateSourceStatus.isPending || updateReminderStatus.isPending || updateMessageStatus.isPending;
  const reviewUpdatePending =
    updateSourceReview.isPending || updateReminderReview.isPending || updateMessageReview.isPending;

  function saveSelectedReview() {
    if (!selectedProposal || reviewUpdatePending) return;
    if (selectedProposal.kind === "source") {
      updateSourceReview.mutate(
        {
          id: selectedProposal.id,
          priority: reviewPriority as "low" | "normal" | "high" | "urgent",
          reviewNotes: reviewNotes.trim() || null,
          approvalScope: approvalScope.trim() || null,
          proposedExternalTarget: externalTarget.trim() || null,
          needsReview,
        },
        { onSuccess: invalidateHedwigProposalViews },
      );
      return;
    }
    if (selectedProposal.kind === "reminder") {
      updateReminderReview.mutate(
        {
          id: selectedProposal.id,
          reviewPriority: reviewPriority as "low" | "normal" | "high" | "urgent",
          reviewNotes: reviewNotes.trim() || null,
          approvalScope: approvalScope.trim() || null,
          proposedExternalTarget: externalTarget.trim() || null,
        },
        { onSuccess: invalidateHedwigProposalViews },
      );
      return;
    }
    updateMessageReview.mutate(
      {
        id: selectedProposal.id,
        reviewPriority: reviewPriority as "low" | "normal" | "high" | "urgent",
        reviewNotes: reviewNotes.trim() || null,
        approvalScope: approvalScope.trim() || null,
        proposedExternalTarget: externalTarget.trim() || null,
      },
      { onSuccess: invalidateHedwigProposalViews },
    );
  }

  function stageApprovalPreview() {
    if (!selectedProposal || createApprovalPreview.isPending) return;
    createApprovalPreview.mutate(
      {
        kind: selectedProposal.kind,
        id: selectedProposal.id,
        actionType: approvalAction as
          | "notion_capture_write"
          | "slack_capture_read"
          | "source_enrichment"
          | "schedule_reminder"
          | "send_message",
        reason: reviewNotes.trim()
          ? `Approval preview from Hedwig review notes: ${reviewNotes.trim().slice(0, 700)}`
          : "Approval preview staged from Hedwig proposal detail. User approval is still required before external action.",
      },
      { onSuccess: invalidateHedwigProposalViews },
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden" style={{ background: C.background, border: `1px solid ${C.borderSoft}`, color: C.textPrimary }}>
      <div
        className="flex items-center justify-between px-2.5 py-1.5 shrink-0"
        style={{ borderBottom: `1px solid ${C.borderSoft}`, background: C.surface }}
      >
        <div className="min-w-0">
          <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: C.textMuted }}>
            Hedwig Capture Inbox
          </div>
          <div className="mt-0.5 truncate text-[10px]" style={{ color: C.textMuted }}>
            Proposal-only Slack and Notion capture schema. No external writes.
          </div>
        </div>
        <Button type="button" onClick={onClose} aria-label="Close Hedwig Capture Inbox" variant="outline" size="sm" className="shrink-0">
          Close
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-1.5 px-2.5 py-1.5 shrink-0 md:grid-cols-4" style={{ borderBottom: `1px solid ${C.borderSoft}` }}>
        <StatusBlock label="Mode" value={data?.mode ?? "proposal_only"} tone={C.textSecondary} />
        <StatusBlock label="Owner" value={data?.ownerAgent ?? "hedwig"} tone={C.accent} />
        <StatusBlock label="Notion DB" value={data?.notionDatabase.proposedName ?? "Capture Inbox"} tone={C.gold} />
        <StatusBlock label="Slack" value={data?.slackProposal.recommendedShape.replace(/_/g, " ") ?? "proposal"} tone={C.warning} />
      </div>

      <form onSubmit={submit} className="space-y-1.5 px-2.5 py-1.5 shrink-0" style={{ borderBottom: `1px solid ${C.borderSoft}` }}>
        <div className="grid grid-cols-[minmax(0,1fr)_160px_80px] gap-1.5">
          <Input
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Paste a thought, link, reminder, Reddit post, article, or save-for-later item."
          />
          <Input
            value={sourceLabel}
            onChange={(event) => setSourceLabel(event.target.value)}
            placeholder="Source label"
          />
          <Button
            type="submit"
            size="sm"
            disabled={!text.trim() || preview.isPending}
            title={!text.trim() ? "Paste a capture before previewing it." : "Preview the capture locally. No Notion, Slack, task, reminder, or message write runs."}
            aria-label="Preview local Hedwig capture"
          >
            {preview.isPending ? "Reading" : "Preview"}
          </Button>
        </div>
        <details>
          <summary className="cursor-pointer list-none text-[10px] font-bold uppercase tracking-wider focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black" style={{ color: C.textMuted, ["--tw-ring-color" as string]: C.accent }}>
            Capture Rules
          </summary>
          <div className="mt-1.5 rounded p-1.5 text-[10px] leading-snug" style={{ background: C.surface, border: `1px solid ${C.borderSoft}`, color: C.textMuted }}>
            Preview classifies the capture and shows the proposed Notion row. It does not save to Notion, read Slack, post Slack, or create tasks.
          </div>
        </details>
      </form>

      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 gap-2 p-2 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0 space-y-2">
            {preview.data && (
              <section className="space-y-1.5">
                <SectionTitle title="Capture Preview" detail={preview.data.captureType.replace(/_/g, " ")} />
                <div className="space-y-1.5 rounded p-2" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
                  <div className="flex flex-wrap gap-1">
                    <Chip label={preview.data.status} tone={C.textSecondary} />
                    <Chip label={preview.data.captureType.replace(/_/g, " ")} tone={C.accent} />
                    <Chip label={preview.data.projectGuess} tone={C.gold} />
                    <Chip label={preview.data.sensitive ? "sensitive" : "not sensitive"} tone={preview.data.sensitive ? C.danger : C.success} />
                    <Chip label={`saved #${preview.data.observationId}`} tone={C.textSecondary} />
                  </div>
                  <div className="text-[11px] font-semibold" style={{ color: C.textPrimary }}>
                    {preview.data.title}
                  </div>
                  <div className="text-[11px] leading-snug" style={{ color: C.textMuted }}>
                    {preview.data.approvalNeeded}
                  </div>
                </div>

                <details className="rounded p-2" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
                  <summary className="cursor-pointer list-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black" style={{ ["--tw-ring-color" as string]: C.accent }}>
                    <SectionTitle title="Proposed Notion Row" detail="no write" />
                  </summary>
                  <div className="mt-1.5 grid grid-cols-1 gap-1.5 md:grid-cols-2">
                    {Object.entries(preview.data.proposedNotionRow).map(([key, value]) => (
                      <MetaBlock key={key} label={key} value={value == null ? "none" : String(value)} />
                    ))}
                  </div>
                </details>
              </section>
            )}

            <section className="space-y-1.5">
              <SectionTitle title="Local Captures" detail="preview history" />
              <div className="space-y-1.5">
                {(observations.data ?? []).length === 0 ? (
                  <div className="rounded p-2 text-[11px]" style={{ background: C.surface, border: `1px solid ${C.borderSoft}`, color: C.textMuted }}>
                    No local capture previews recorded yet.
                  </div>
                ) : (
                  observations.data?.map((item) => (
                    <div key={item.id} className="space-y-1 rounded p-2" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
                      <div className="flex flex-wrap gap-1">
                        <Chip label={`#${item.id}`} tone={C.textMuted} />
                        <Chip label={item.captureType.replace(/_/g, " ")} tone={C.accent} />
                        <Chip label={item.projectGuess ?? "Unknown"} tone={C.gold} />
                        <Chip label={item.sensitive ? "sensitive" : "not sensitive"} tone={item.sensitive ? C.danger : C.success} />
                      </div>
                      <div className="text-xs font-semibold truncate" style={{ color: C.textPrimary }} title={item.title}>
                        {item.title}
                      </div>
                      <div className="text-[11px] leading-snug line-clamp-2" style={{ color: C.textMuted }} title={item.rawText}>
                        {item.rawText}
                      </div>
                      {item.sourceUri && (
                        <div className="text-[10px] truncate" style={{ color: C.textMuted }} title={item.sourceUri}>
                          Source: {sourceDisplayName(item.sourceUri)}
                        </div>
                      )}
                      <Button
                        type="button"
                        onClick={() => setTriageId(item.id)}
                        variant={triageId === item.id ? "default" : "secondary"}
                        size="sm"
                        title="Read the local triage proposal for this capture."
                        aria-label={`Read triage proposal for capture ${item.id}`}
                      >
                        Triage
                      </Button>
                      {item.sourceUri && (
                        <Button
                          type="button"
                          onClick={() => setSelectedProposal({ kind: "source", id: item.id })}
                          variant={selectedProposal?.kind === "source" && selectedProposal.id === item.id ? "default" : "risk"}
                          size="sm"
                          title="Open the local source proposal detail. This does not fetch or sync."
                          aria-label={`Open source proposal detail for capture ${item.id}`}
                        >
                          Source Detail
                        </Button>
                      )}
                      {item.sourceUri && (
                        <Button
                          type="button"
                          onClick={() => openSecurityGate(item.sourceUri)}
                          disabled={!onNavigate}
                          variant="risk"
                          size="sm"
                          title={!onNavigate ? "Security Gate route is not available from this panel state." : "Open Security Gate before any source fetch or external action."}
                          aria-label={!onNavigate ? "Security Gate route unavailable" : `Open Security Gate for capture ${item.id} source`}
                        >
                          Security Gate
                        </Button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </section>

            {triage.data?.found && (
              <section className="space-y-2">
                <SectionTitle title="Triage Proposal" detail={triage.data.recommendedRoute.replace(/_/g, " ")} />
                <div className="space-y-1.5 rounded p-2" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
                  <div className="flex flex-wrap gap-1">
                    <Chip label={triage.data.recommendedRoute.replace(/_/g, " ")} tone={C.accent} />
                    <Chip label={triage.data.proposedStatus} tone={C.textSecondary} />
                    <Chip label={triage.data.projectName ?? "no project"} tone={C.gold} />
                    <Chip label={triage.data.writesExternal ? "external write" : "local preview"} tone={C.success} />
                  </div>
                  <div className="text-[11px] leading-snug" style={{ color: C.textSecondary }}>
                    {triage.data.rationale}
                  </div>
                  <div className="grid grid-cols-1 gap-1.5 md:grid-cols-2">
                    <MetaBlock label="Task Draft" value={`${triage.data.taskDraft.agent}: ${triage.data.taskDraft.title}`} />
                    <MetaBlock label="Support" value={triage.data.supportAgents.join(", ")} />
                    {triage.data.sourceDraft && (
                      <MetaBlock label="Source Draft" value={sourceDisplayName(triage.data.sourceDraft.uri)} title={triage.data.sourceDraft.uri} />
                    )}
                    {triage.data.reminderDraft && <MetaBlock label="Reminder" value={triage.data.reminderDraft.timingHint} />}
                    {triage.data.messageDraft && <MetaBlock label="Message" value="draft only; needs recipient" />}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <Button
                      type="button"
                      onClick={createTaskFromTriage}
                      disabled={createTask.isPending}
                      title="Create a local task from this triage proposal. No external write runs."
                      aria-label="Create local task from Hedwig triage"
                      size="sm"
                    >
                      {createTask.isPending ? "Creating" : "Create Local Task"}
                    </Button>
                    {triage.data.found && triage.data.sourceDraft && (
                      <Button
                        type="button"
                        onClick={() => {
                          if (triage.data?.found) openSecurityGate(triage.data.sourceDraft?.uri);
                        }}
                        disabled={!onNavigate}
                        variant="risk"
                        size="sm"
                        title={!onNavigate ? "Security Gate route is not available from this panel state." : "Open Security Gate before source save or enrichment."}
                        aria-label="Open Security Gate for triage source"
                      >
                        Security Gate
                      </Button>
                    )}
                    {triage.data.sourceDraft && (
                      <Button
                        type="button"
                        onClick={saveSourceFromTriage}
                        disabled={saveSource.isPending}
                        variant="risk"
                        size="sm"
                        title="Save a local source record from this triage proposal. This does not fetch or write externally."
                        aria-label="Save local source from Hedwig triage"
                      >
                        {saveSource.isPending ? "Saving" : "Save Source"}
                      </Button>
                    )}
                    {triage.data.reminderDraft && (
                      <Button
                        type="button"
                        onClick={createReminderFromTriage}
                        disabled={createReminder.isPending}
                        variant="risk"
                        size="sm"
                        title="Create a local reminder proposal. This does not schedule anything."
                        aria-label="Create local reminder proposal"
                      >
                        {createReminder.isPending ? "Saving" : "Create Reminder Proposal"}
                      </Button>
                    )}
                    {triage.data.messageDraft && (
                      <Button
                        type="button"
                        onClick={createMessageDraftFromTriage}
                        disabled={createMessageDraft.isPending}
                        variant="risk"
                        size="sm"
                        title="Create a local message draft. This does not send anything."
                        aria-label="Create local message draft"
                      >
                        {createMessageDraft.isPending ? "Saving" : "Create Message Draft"}
                      </Button>
                    )}
                  </div>
                  {createTask.data?.ok && createTask.data.task && (
                    <div className="text-[11px] leading-snug" style={{ color: C.success }}>
                      Created task #{createTask.data.task.id}. No external writes.
                    </div>
                  )}
                  {createTask.data && !createTask.data.ok && (
                    <div className="text-[11px] leading-snug" style={{ color: C.warning }}>
                      {createTask.data.reason}
                    </div>
                  )}
                  {saveSource.data?.ok && saveSource.data.source && (
                    <div className="text-[11px] leading-snug" style={{ color: C.success }}>
                      Saved source #{saveSource.data.source.id}. No fetch or external write.
                    </div>
                  )}
                  {saveSource.data && !saveSource.data.ok && (
                    <div className="text-[11px] leading-snug" style={{ color: C.warning }}>
                      {saveSource.data.reason}
                    </div>
                  )}
                  {createReminder.data?.ok && createReminder.data.reminder && (
                    <div className="text-[11px] leading-snug" style={{ color: C.success }}>
                      Created reminder proposal #{createReminder.data.reminder.id}. No scheduling or external writes.
                    </div>
                  )}
                  {createReminder.data && !createReminder.data.ok && (
                    <div className="text-[11px] leading-snug" style={{ color: C.warning }}>
                      {createReminder.data.reason}
                    </div>
                  )}
                  {createMessageDraft.data?.ok && createMessageDraft.data.draft && (
                    <div className="text-[11px] leading-snug" style={{ color: C.success }}>
                      Created message draft proposal #{createMessageDraft.data.draft.id}. No sending or external writes.
                    </div>
                  )}
                  {createMessageDraft.data && !createMessageDraft.data.ok && (
                    <div className="text-[11px] leading-snug" style={{ color: C.warning }}>
                      {createMessageDraft.data.reason}
                    </div>
                  )}
                </div>
                <details className="rounded p-2" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
                  <summary className="cursor-pointer list-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black" style={{ ["--tw-ring-color" as string]: C.accent }}>
                    <SectionTitle title="Triage Gates" detail="no write" />
                  </summary>
                  <div className="mt-1.5 space-y-1">
                    {triage.data.gates.map((gate) => (
                      <div key={gate} className="text-[11px] leading-snug" style={{ color: C.textMuted }}>- {gate}</div>
                    ))}
                  </div>
                </details>
              </section>
            )}

            <details className="space-y-2">
              <summary className="cursor-pointer list-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black" style={{ ["--tw-ring-color" as string]: C.accent }}>
                <SectionTitle title="Notion Capture Database" detail={data?.notionDatabase.envVar ?? "NOTION_CAPTURE_DATABASE_ID"} />
              </summary>
              <div className="grid grid-cols-1 gap-1.5 md:grid-cols-2">
                {(data?.notionDatabase.properties ?? []).map((property) => (
                  <div key={property.name} className="rounded p-2" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-[11px] font-semibold" style={{ color: C.textPrimary }}>{property.name}</div>
                      <Chip label={property.type} tone={property.required ? C.warning : C.textMuted} />
                    </div>
                    <div className="mt-1 text-[11px] leading-snug" style={{ color: C.textMuted }}>
                      {property.notes}
                    </div>
                  </div>
                ))}
              </div>
            </details>
          </div>

          <aside className="min-w-0 space-y-2">
            <section className="rounded p-2" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
              <SectionTitle title="Proposal Detail" detail={selectedProposal ? selectedProposal.kind : "select"} />
              <div className="mt-2">
                {!selectedProposal ? (
                  <div className="text-[11px] leading-snug" style={{ color: C.textMuted }}>
                    Select a source, reminder, or message proposal to inspect its local status and approval gates.
                  </div>
                ) : proposalDetail.data?.found ? (
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1">
                      <Chip label={`${proposalDetail.data.kind} #${proposalDetail.data.id}`} tone={C.textMuted} />
                      <Chip label={proposalDetail.data.item.status} tone={C.accent} />
                      <Chip label={proposalDetail.data.writesExternal ? "external write" : "local only"} tone={C.success} />
                    </div>
                    <div className="text-[11px] font-semibold leading-snug" style={{ color: C.textPrimary }}>
                      {proposalDetail.data.item.title}
                    </div>
                    {"timingHint" in proposalDetail.data.item && (
                      <MetaBlock label="Timing" value={proposalDetail.data.item.timingHint ?? "needs date"} />
                    )}
                    {"recipientHint" in proposalDetail.data.item && (
                      <MetaBlock label="Recipient" value={proposalDetail.data.item.recipientHint ?? "needs recipient"} />
                    )}
                    {"sourceUri" in proposalDetail.data.item && proposalDetail.data.item.sourceUri && (
                      <MetaBlock label="Source" value={sourceDisplayName(proposalDetail.data.item.sourceUri)} title={proposalDetail.data.item.sourceUri} />
                    )}
                    {"sourceUri" in proposalDetail.data.item && proposalDetail.data.item.sourceUri && (
                      <Button
                        type="button"
                        onClick={() => {
                          const item = proposalDetail.data?.item;
                          if (item && "sourceUri" in item) openSecurityGate(item.sourceUri);
                        }}
                        disabled={!onNavigate}
                        variant="risk"
                        size="sm"
                        className="w-fit"
                        title={!onNavigate ? "Security Gate route is not available from this panel state." : "Open Security Gate before source enrichment or sync."}
                        aria-label="Open Security Gate for proposal source"
                      >
                        Security Gate
                      </Button>
                    )}
                    {"reviewPriority" in proposalDetail.data.item && (
                      <MetaBlock label="Review Priority" value={proposalDetail.data.item.reviewPriority ?? "normal"} />
                    )}
                    {"approvalScope" in proposalDetail.data.item && proposalDetail.data.item.approvalScope && (
                      <MetaBlock label="Approval Scope" value={proposalDetail.data.item.approvalScope} />
                    )}
                    {"proposedExternalTarget" in proposalDetail.data.item && proposalDetail.data.item.proposedExternalTarget && (
                      <MetaBlock
                        label="External Target"
                        value={sourceDisplayName(proposalDetail.data.item.proposedExternalTarget)}
                        title={proposalDetail.data.item.proposedExternalTarget}
                      />
                    )}
                    {"proposedExternalTarget" in proposalDetail.data.item && proposalDetail.data.item.proposedExternalTarget && (
                      <Button
                        type="button"
                        onClick={() => {
                          const item = proposalDetail.data?.item;
                          if (item && "proposedExternalTarget" in item) openSecurityGate(item.proposedExternalTarget);
                        }}
                        disabled={!onNavigate}
                        variant="risk"
                        size="sm"
                        className="w-fit"
                        title={!onNavigate ? "Security Gate route is not available from this panel state." : "Open Security Gate before any external target action."}
                        aria-label="Open Security Gate for proposal external target"
                      >
                        Security Gate
                      </Button>
                    )}
                    {"lastReviewedAt" in proposalDetail.data.item && proposalDetail.data.item.lastReviewedAt && (
                      <MetaBlock label="Last Review" value={new Date(proposalDetail.data.item.lastReviewedAt * 1000).toLocaleString()} />
                    )}
                    <div className="max-h-24 overflow-y-auto text-[11px] leading-snug" style={{ color: C.textMuted }}>
                      {"rawText" in proposalDetail.data.item ? proposalDetail.data.item.rawText : ""}
                    </div>
                    {"reviewNotes" in proposalDetail.data.item && proposalDetail.data.item.reviewNotes && (
                      <div className="rounded p-1.5 text-[11px] leading-snug" style={{ background: C.surfaceMuted, color: C.textSecondary, border: `1px solid ${C.borderSoft}` }}>
                        {proposalDetail.data.item.reviewNotes}
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-1">
                      {(() => {
                        const currentStatus = proposalDetail.data.item.status;
                        return proposalDetail.data.statusOptions.map((status) => (
                          <Button
                            key={status}
                          type="button"
                          onClick={() => updateSelectedProposalStatus(status)}
                          disabled={statusUpdatePending || status === currentStatus}
                          variant={status === currentStatus ? "default" : "secondary"}
                          size="sm"
                          title={status === currentStatus ? "This local proposal already has this status." : `Set local proposal status to ${status.replace(/_/g, " ")}.`}
                          aria-label={`Set proposal status to ${status.replace(/_/g, " ")}`}
                        >
                            {status.replace(/_/g, " ")}
                          </Button>
                        ));
                      })()}
                    </div>
                    <details className="space-y-1.5 rounded p-2" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}>
                      <summary className="cursor-pointer list-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black" style={{ ["--tw-ring-color" as string]: C.accent }}>
                        <SectionTitle title="Review Fields" detail="local edit" />
                      </summary>
                      <div className="grid grid-cols-1 gap-1.5 md:grid-cols-2">
                        <AppSelect
                          label="Priority"
                          value={reviewPriority}
                          onChange={setReviewPriority}
                          options={["low", "normal", "high", "urgent"]}
                        />
                        <AppSelect
                          label="Approval Action"
                          value={approvalAction}
                          onChange={setApprovalAction}
                          options={["source_enrichment", "notion_capture_write", "slack_capture_read", "schedule_reminder", "send_message"]}
                        />
                      </div>
                      <Input
                        value={approvalScope}
                        onChange={(event) => setApprovalScope(event.target.value)}
                        placeholder="Approval scope, e.g. one Notion capture row or one Slack DM read"
                      />
                      <Input
                        value={externalTarget}
                        onChange={(event) => setExternalTarget(event.target.value)}
                        placeholder="Proposed external target, still gated"
                      />
                      <Textarea
                        value={reviewNotes}
                        onChange={(event) => setReviewNotes(event.target.value)}
                        placeholder="Local review notes. Do not paste secrets."
                        rows={4}
                      />
                      {selectedProposal.kind === "source" && (
                        <label className="flex items-center gap-2 text-[11px]" style={{ color: C.textMuted }}>
                          <Checkbox
                            checked={needsReview}
                            onCheckedChange={(checked) => setNeedsReview(checked === true)}
                          />
                          Needs local review before external sync/enrichment
                        </label>
                      )}
                      <div className="flex flex-wrap gap-1.5">
                        <Button
                          type="button"
                          onClick={saveSelectedReview}
                          disabled={reviewUpdatePending}
                          title="Save local proposal review fields. This does not sync externally."
                          aria-label="Save local Hedwig proposal review"
                          size="sm"
                        >
                          {reviewUpdatePending ? "Saving" : "Save Local Review"}
                        </Button>
                        <Button
                          type="button"
                          onClick={stageApprovalPreview}
                          disabled={createApprovalPreview.isPending}
                          variant="risk"
                          title="Stage a pending local approval preview. This does not approve or execute the external action."
                          aria-label="Stage local approval preview"
                          size="sm"
                        >
                          {createApprovalPreview.isPending ? "Staging" : "Stage Approval Preview"}
                        </Button>
                      </div>
                      {createApprovalPreview.data?.ok && createApprovalPreview.data.approval && (
                        <div className="text-[11px] leading-snug" style={{ color: C.success }}>
                          Staged pending approval #{createApprovalPreview.data.approval.id}. No external action approved or executed.
                        </div>
                      )}
                    </details>
                    <details
                      key={`${selectedProposal.kind}-${selectedProposal.id}-approval-previews`}
                      open={approvalPreviewsOpen}
                      className="space-y-1"
                      onToggle={(event) => setApprovalPreviewsOpen(event.currentTarget.open)}
                    >
                      <summary className="cursor-pointer list-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black" style={{ ["--tw-ring-color" as string]: C.accent }}>
                        <SectionTitle title="Approval Previews" detail={approvalPreviewsOpen ? "pending local" : "open to read"} />
                      </summary>
                      {approvalPreviews.isLoading ? (
                        <div className="text-[11px] leading-snug" style={{ color: C.textMuted }}>
                          Reading local approval previews.
                        </div>
                      ) : (approvalPreviews.data ?? []).length === 0 ? (
                        <div className="text-[11px] leading-snug" style={{ color: C.textMuted }}>
                          No pending local approval previews for this proposal yet.
                        </div>
                      ) : (
                        approvalPreviews.data?.map((approval) => (
                          <div key={approval.id} className="rounded p-2" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}>
                            <div className="flex flex-wrap gap-1">
                              <Chip label={`approval #${approval.id}`} tone={C.textMuted} />
                              <Chip label={approval.status} tone={C.warning} />
                              <Chip label={approval.actionType.replace(/_/g, " ")} tone={C.gold} />
                            </div>
                            <div className="text-[11px] leading-snug mt-1 line-clamp-3" style={{ color: C.textMuted }} title={approval.reason ?? ""}>
                              {approval.reason}
                            </div>
                          </div>
                        ))
                      )}
                    </details>
                    <details className="space-y-1">
                      <summary className="cursor-pointer list-none text-[10px] font-bold uppercase tracking-wider focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black" style={{ color: C.textMuted, ["--tw-ring-color" as string]: C.accent }}>
                        Proposal Gates
                      </summary>
                      {proposalDetail.data.gates.map((gate) => (
                        <div key={gate} className="text-[11px] leading-snug" style={{ color: C.textMuted }}>
                          - {gate}
                        </div>
                      ))}
                    </details>
                  </div>
                ) : (
                  <div className="text-[11px] leading-snug" style={{ color: C.warning }}>
                    {proposalDetail.data?.gates[0] ?? "Loading proposal detail."}
                  </div>
                )}
              </div>
            </section>

            <details className="rounded p-2" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
              <summary className="cursor-pointer list-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black" style={{ ["--tw-ring-color" as string]: C.accent }}>
                <SectionTitle title="Slack Shape" detail={data?.slackProposal.recommendedShape.replace(/_/g, " ") ?? "proposal"} />
              </summary>
              <div className="mt-1.5 space-y-1.5">
                {(data?.slackProposal.options ?? []).map((option) => (
                  <div key={option.id} className="rounded p-2" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}>
                    <div className="text-[11px] font-semibold" style={{ color: C.textPrimary }}>{option.label}</div>
                    <div className="mt-1 text-[11px] leading-snug" style={{ color: C.textSecondary }}>{option.bestFor}</div>
                    <div className="mt-1 text-[11px] leading-snug" style={{ color: C.textMuted }}>{option.tradeoff}</div>
                  </div>
                ))}
              </div>
            </details>

            <details className="rounded p-2" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
              <summary className="cursor-pointer list-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black" style={{ ["--tw-ring-color" as string]: C.accent }}>
                <SectionTitle title="Approval Gates" detail="required" />
              </summary>
              <div className="mt-1.5 space-y-1">
                {(data?.slackProposal.approvalGates ?? []).map((gate) => (
                  <div key={gate} className="text-[11px] leading-snug" style={{ color: C.textMuted }}>- {gate}</div>
                ))}
              </div>
            </details>

            <details className="rounded p-2" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
              <summary className="cursor-pointer list-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black" style={{ ["--tw-ring-color" as string]: C.accent }}>
                <SectionTitle title="Routing Rules" detail="first pass" />
              </summary>
              <div className="mt-1.5 space-y-1">
                {(data?.routingRules ?? []).map((rule) => (
                  <div key={rule} className="text-[11px] leading-snug" style={{ color: C.textMuted }}>- {rule}</div>
                ))}
              </div>
            </details>

            <section className="rounded p-2" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
              <SectionTitle title="Reminder Proposals" detail="local" />
              <div className="mt-1.5 space-y-1.5">
                {(reminders.data ?? []).length === 0 ? (
                  <div className="text-[11px] leading-snug" style={{ color: C.textMuted }}>
                    No local reminder proposals yet.
                  </div>
                ) : (
                  reminders.data?.map((reminder) => (
                    <div key={reminder.id} className="rounded p-2" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}>
                      <div className="flex flex-wrap gap-1">
                        <Chip label={`#${reminder.id}`} tone={C.textMuted} />
                        <Chip label={reminder.status} tone={C.accent} />
                        <Chip label={reminder.timingHint ?? "needs date"} tone={C.gold} />
                        <Chip label={reminder.reviewPriority ?? "normal"} tone={C.textSecondary} />
                      </div>
                      <div className="mt-1 truncate text-[11px] font-semibold" style={{ color: C.textPrimary }} title={reminder.title}>
                        {reminder.title}
                      </div>
                      <div className="text-[11px] leading-snug mt-1 line-clamp-2" style={{ color: C.textMuted }} title={reminder.approvalRequired}>
                        {reminder.approvalRequired}
                      </div>
                      <Button
                        type="button"
                        onClick={() => setSelectedProposal({ kind: "reminder", id: reminder.id })}
                        className="mt-1.5"
                        variant={selectedProposal?.kind === "reminder" && selectedProposal.id === reminder.id ? "default" : "secondary"}
                        size="sm"
                      >
                        Details
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="rounded p-2" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
              <SectionTitle title="Message Drafts" detail="local" />
              <div className="mt-1.5 space-y-1.5">
                {(messageDrafts.data ?? []).length === 0 ? (
                  <div className="text-[11px] leading-snug" style={{ color: C.textMuted }}>
                    No local message draft proposals yet.
                  </div>
                ) : (
                  messageDrafts.data?.map((draft) => (
                    <div key={draft.id} className="rounded p-2" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}>
                      <div className="flex flex-wrap gap-1">
                        <Chip label={`#${draft.id}`} tone={C.textMuted} />
                        <Chip label={draft.status} tone={C.accent} />
                        <Chip label={draft.recipientHint ?? "needs recipient"} tone={C.gold} />
                        <Chip label={draft.reviewPriority ?? "normal"} tone={C.textSecondary} />
                      </div>
                      <div className="mt-1 truncate text-[11px] font-semibold" style={{ color: C.textPrimary }} title={draft.title}>
                        {draft.title}
                      </div>
                      <div className="text-[11px] leading-snug mt-1 line-clamp-2" style={{ color: C.textMuted }} title={draft.approvalRequired}>
                        {draft.approvalRequired}
                      </div>
                      <Button
                        type="button"
                        onClick={() => setSelectedProposal({ kind: "message", id: draft.id })}
                        className="mt-1.5"
                        variant={selectedProposal?.kind === "message" && selectedProposal.id === draft.id ? "default" : "secondary"}
                        size="sm"
                      >
                        Details
                      </Button>
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

function StatusBlock({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="min-w-0 rounded p-2" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
      <div className="text-[10px] uppercase tracking-wider" style={{ color: C.textMuted }}>{label}</div>
      <div className="mt-0.5 truncate text-[11px] font-semibold" style={{ color: tone }} title={value}>{value}</div>
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

function MetaBlock({ label, value, title }: { label: string; value: string; title?: string }) {
  return (
    <div className="min-w-0 rounded p-2" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}>
      <div className="text-[10px] uppercase tracking-wider" style={{ color: C.textMuted }}>{label}</div>
      <div className="text-[11px] leading-snug truncate mt-0.5" style={{ color: C.textSecondary }} title={title ?? value}>{value}</div>
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
    <label className="grid gap-1 text-[10px] uppercase tracking-wider" style={{ color: C.textMuted }}>
      {label}
      <UiSelect value={value} onValueChange={onChange} aria-label={label}>
        <SelectTrigger size="sm" className="w-full normal-case">
          <SelectValue placeholder={label} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option.replace(/_/g, " ")}
            </SelectItem>
          ))}
        </SelectContent>
      </UiSelect>
    </label>
  );
}

function targetTypeForProposal(kind: "source" | "reminder" | "message") {
  if (kind === "source") return "capture_observation";
  if (kind === "reminder") return "reminder_proposal";
  return "message_draft_proposal";
}
