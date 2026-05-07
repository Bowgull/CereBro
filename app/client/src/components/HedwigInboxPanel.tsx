import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { cerebroColors as C } from "@/lib/keepConfig";

export default function HedwigInboxPanel({ onClose }: { onClose: () => void }) {
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
    <div className="h-full flex flex-col" style={{ background: C.background }}>
      <div
        className="flex items-center justify-between px-4 py-2 shrink-0"
        style={{ borderBottom: `1px solid ${C.borderSoft}`, background: C.surface }}
      >
        <div className="min-w-0">
          <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: C.textMuted }}>
            Hedwig Capture Inbox
          </div>
          <div className="text-xs mt-0.5 truncate" style={{ color: C.textMuted }}>
            Proposal-only Slack and Notion capture schema. No external writes.
          </div>
        </div>
        <button onClick={onClose} className="text-xs uppercase tracking-wider shrink-0" style={{ color: C.textMuted }}>
          Close
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 px-4 py-3 shrink-0" style={{ borderBottom: `1px solid ${C.borderSoft}` }}>
        <StatusBlock label="Mode" value={data?.mode ?? "proposal_only"} tone={C.textSecondary} />
        <StatusBlock label="Owner" value={data?.ownerAgent ?? "hedwig"} tone={C.accent} />
        <StatusBlock label="Notion DB" value={data?.notionDatabase.proposedName ?? "Capture Inbox"} tone={C.gold} />
        <StatusBlock label="Slack" value={data?.slackProposal.recommendedShape.replace(/_/g, " ") ?? "proposal"} tone={C.warning} />
      </div>

      <form onSubmit={submit} className="px-4 py-3 shrink-0 space-y-2" style={{ borderBottom: `1px solid ${C.borderSoft}` }}>
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_180px_auto] gap-2">
          <input
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Paste a thought, link, reminder, Reddit post, article, or save-for-later item."
            className="px-2 py-1.5 text-xs rounded outline-none"
            style={{ background: C.surfaceMuted, color: C.textPrimary, border: `1px solid ${C.borderSoft}` }}
          />
          <input
            value={sourceLabel}
            onChange={(event) => setSourceLabel(event.target.value)}
            placeholder="Source label"
            className="px-2 py-1.5 text-xs rounded outline-none"
            style={{ background: C.surfaceMuted, color: C.textPrimary, border: `1px solid ${C.borderSoft}` }}
          />
          <button
            type="submit"
            disabled={!text.trim() || preview.isPending}
            className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded"
            style={{
              background: text.trim() && !preview.isPending ? C.accentSoft : C.surfaceMuted,
              color: text.trim() && !preview.isPending ? C.textPrimary : C.textMuted,
              border: `1px solid ${C.borderSoft}`,
            }}
          >
            {preview.isPending ? "Reading" : "Preview"}
          </button>
        </div>
        <div className="text-[11px] leading-relaxed" style={{ color: C.textMuted }}>
          Preview classifies the capture and shows the proposed Notion row. It does not save to Notion, read Slack, post Slack, or create tasks.
        </div>
      </form>

      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_380px] gap-3 p-4">
          <div className="space-y-3 min-w-0">
            {preview.data && (
              <section className="space-y-2">
                <SectionTitle title="Capture Preview" detail={preview.data.captureType.replace(/_/g, " ")} />
                <div className="rounded p-3 space-y-2" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
                  <div className="flex flex-wrap gap-1">
                    <Chip label={preview.data.status} tone={C.textSecondary} />
                    <Chip label={preview.data.captureType.replace(/_/g, " ")} tone={C.accent} />
                    <Chip label={preview.data.projectGuess} tone={C.gold} />
                    <Chip label={preview.data.sensitive ? "sensitive" : "not sensitive"} tone={preview.data.sensitive ? C.danger : C.success} />
                    <Chip label={`saved #${preview.data.observationId}`} tone={C.textSecondary} />
                  </div>
                  <div className="text-sm font-semibold" style={{ color: C.textPrimary }}>
                    {preview.data.title}
                  </div>
                  <div className="text-xs leading-relaxed" style={{ color: C.textMuted }}>
                    {preview.data.approvalNeeded}
                  </div>
                </div>

                <div className="rounded p-3" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
                  <SectionTitle title="Proposed Notion Row" detail="no write" />
                  <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                    {Object.entries(preview.data.proposedNotionRow).map(([key, value]) => (
                      <MetaBlock key={key} label={key} value={value == null ? "none" : String(value)} />
                    ))}
                  </div>
                </div>
              </section>
            )}

            <section className="space-y-2">
              <SectionTitle title="Local Captures" detail="preview history" />
              <div className="space-y-2">
                {(observations.data ?? []).length === 0 ? (
                  <div className="rounded p-3 text-xs" style={{ background: C.surface, border: `1px solid ${C.borderSoft}`, color: C.textMuted }}>
                    No local capture previews recorded yet.
                  </div>
                ) : (
                  observations.data?.map((item) => (
                    <div key={item.id} className="rounded p-2 space-y-1" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
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
                      <button
                        type="button"
                        onClick={() => setTriageId(item.id)}
                        className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider rounded"
                        style={{
                          background: triageId === item.id ? C.accentSoft : C.surfaceMuted,
                          color: triageId === item.id ? C.textPrimary : C.textMuted,
                          border: `1px solid ${C.borderSoft}`,
                        }}
                      >
                        Triage
                      </button>
                      {item.sourceUri && (
                        <button
                          type="button"
                          onClick={() => setSelectedProposal({ kind: "source", id: item.id })}
                          className="ml-1 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider rounded"
                          style={{
                            background:
                              selectedProposal?.kind === "source" && selectedProposal.id === item.id ? C.accentSoft : C.surfaceMuted,
                            color:
                              selectedProposal?.kind === "source" && selectedProposal.id === item.id ? C.textPrimary : C.gold,
                            border: `1px solid ${C.borderSoft}`,
                          }}
                        >
                          Source Detail
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </section>

            {triage.data?.found && (
              <section className="space-y-2">
                <SectionTitle title="Triage Proposal" detail={triage.data.recommendedRoute.replace(/_/g, " ")} />
                <div className="rounded p-3 space-y-2" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
                  <div className="flex flex-wrap gap-1">
                    <Chip label={triage.data.recommendedRoute.replace(/_/g, " ")} tone={C.accent} />
                    <Chip label={triage.data.proposedStatus} tone={C.textSecondary} />
                    <Chip label={triage.data.projectName ?? "no project"} tone={C.gold} />
                    <Chip label={triage.data.writesExternal ? "external write" : "local preview"} tone={C.success} />
                  </div>
                  <div className="text-xs leading-relaxed" style={{ color: C.textSecondary }}>
                    {triage.data.rationale}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <MetaBlock label="Task Draft" value={`${triage.data.taskDraft.agent}: ${triage.data.taskDraft.title}`} />
                    <MetaBlock label="Support" value={triage.data.supportAgents.join(", ")} />
                    {triage.data.sourceDraft && <MetaBlock label="Source Draft" value={triage.data.sourceDraft.uri} />}
                    {triage.data.reminderDraft && <MetaBlock label="Reminder" value={triage.data.reminderDraft.timingHint} />}
                    {triage.data.messageDraft && <MetaBlock label="Message" value="draft only; needs recipient" />}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={createTaskFromTriage}
                      disabled={createTask.isPending}
                      className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded"
                      style={{
                        background: createTask.isPending ? C.surfaceMuted : C.accentSoft,
                        color: createTask.isPending ? C.textMuted : C.textPrimary,
                        border: `1px solid ${C.borderSoft}`,
                      }}
                    >
                      {createTask.isPending ? "Creating" : "Create Local Task"}
                    </button>
                    {triage.data.sourceDraft && (
                      <button
                        type="button"
                        onClick={saveSourceFromTriage}
                        disabled={saveSource.isPending}
                        className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded"
                        style={{
                          background: saveSource.isPending ? C.surfaceMuted : C.surfaceMuted,
                          color: saveSource.isPending ? C.textMuted : C.gold,
                          border: `1px solid ${C.borderSoft}`,
                        }}
                      >
                        {saveSource.isPending ? "Saving" : "Save Source"}
                      </button>
                    )}
                    {triage.data.reminderDraft && (
                      <button
                        type="button"
                        onClick={createReminderFromTriage}
                        disabled={createReminder.isPending}
                        className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded"
                        style={{
                          background: createReminder.isPending ? C.surfaceMuted : C.surfaceMuted,
                          color: createReminder.isPending ? C.textMuted : C.gold,
                          border: `1px solid ${C.borderSoft}`,
                        }}
                      >
                        {createReminder.isPending ? "Saving" : "Create Reminder Proposal"}
                      </button>
                    )}
                    {triage.data.messageDraft && (
                      <button
                        type="button"
                        onClick={createMessageDraftFromTriage}
                        disabled={createMessageDraft.isPending}
                        className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded"
                        style={{
                          background: createMessageDraft.isPending ? C.surfaceMuted : C.surfaceMuted,
                          color: createMessageDraft.isPending ? C.textMuted : C.gold,
                          border: `1px solid ${C.borderSoft}`,
                        }}
                      >
                        {createMessageDraft.isPending ? "Saving" : "Create Message Draft"}
                      </button>
                    )}
                  </div>
                  {createTask.data?.ok && createTask.data.task && (
                    <div className="text-[11px] leading-relaxed" style={{ color: C.success }}>
                      Created task #{createTask.data.task.id}. No external writes.
                    </div>
                  )}
                  {createTask.data && !createTask.data.ok && (
                    <div className="text-[11px] leading-relaxed" style={{ color: C.warning }}>
                      {createTask.data.reason}
                    </div>
                  )}
                  {saveSource.data?.ok && saveSource.data.source && (
                    <div className="text-[11px] leading-relaxed" style={{ color: C.success }}>
                      Saved source #{saveSource.data.source.id}. No fetch or external write.
                    </div>
                  )}
                  {saveSource.data && !saveSource.data.ok && (
                    <div className="text-[11px] leading-relaxed" style={{ color: C.warning }}>
                      {saveSource.data.reason}
                    </div>
                  )}
                  {createReminder.data?.ok && createReminder.data.reminder && (
                    <div className="text-[11px] leading-relaxed" style={{ color: C.success }}>
                      Created reminder proposal #{createReminder.data.reminder.id}. No scheduling or external writes.
                    </div>
                  )}
                  {createReminder.data && !createReminder.data.ok && (
                    <div className="text-[11px] leading-relaxed" style={{ color: C.warning }}>
                      {createReminder.data.reason}
                    </div>
                  )}
                  {createMessageDraft.data?.ok && createMessageDraft.data.draft && (
                    <div className="text-[11px] leading-relaxed" style={{ color: C.success }}>
                      Created message draft proposal #{createMessageDraft.data.draft.id}. No sending or external writes.
                    </div>
                  )}
                  {createMessageDraft.data && !createMessageDraft.data.ok && (
                    <div className="text-[11px] leading-relaxed" style={{ color: C.warning }}>
                      {createMessageDraft.data.reason}
                    </div>
                  )}
                </div>
                <div className="rounded p-3" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
                  <SectionTitle title="Triage Gates" detail="no write" />
                  <div className="mt-2 space-y-1">
                    {triage.data.gates.map((gate) => (
                      <div key={gate} className="text-[11px] leading-relaxed" style={{ color: C.textMuted }}>- {gate}</div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            <section className="space-y-2">
              <SectionTitle title="Notion Capture Database" detail={data?.notionDatabase.envVar ?? "NOTION_CAPTURE_DATABASE_ID"} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {(data?.notionDatabase.properties ?? []).map((property) => (
                  <div key={property.name} className="rounded p-2" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-xs font-semibold" style={{ color: C.textPrimary }}>{property.name}</div>
                      <Chip label={property.type} tone={property.required ? C.warning : C.textMuted} />
                    </div>
                    <div className="text-[11px] leading-relaxed mt-1" style={{ color: C.textMuted }}>
                      {property.notes}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-3 min-w-0">
            <section className="rounded p-3" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
              <SectionTitle title="Proposal Detail" detail={selectedProposal ? selectedProposal.kind : "select"} />
              <div className="mt-2">
                {!selectedProposal ? (
                  <div className="text-[11px] leading-relaxed" style={{ color: C.textMuted }}>
                    Select a source, reminder, or message proposal to inspect its local status and approval gates.
                  </div>
                ) : proposalDetail.data?.found ? (
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1">
                      <Chip label={`${proposalDetail.data.kind} #${proposalDetail.data.id}`} tone={C.textMuted} />
                      <Chip label={proposalDetail.data.item.status} tone={C.accent} />
                      <Chip label={proposalDetail.data.writesExternal ? "external write" : "local only"} tone={C.success} />
                    </div>
                    <div className="text-xs font-semibold leading-snug" style={{ color: C.textPrimary }}>
                      {proposalDetail.data.item.title}
                    </div>
                    {"timingHint" in proposalDetail.data.item && (
                      <MetaBlock label="Timing" value={proposalDetail.data.item.timingHint ?? "needs date"} />
                    )}
                    {"recipientHint" in proposalDetail.data.item && (
                      <MetaBlock label="Recipient" value={proposalDetail.data.item.recipientHint ?? "needs recipient"} />
                    )}
                    {"sourceUri" in proposalDetail.data.item && proposalDetail.data.item.sourceUri && (
                      <MetaBlock label="Source URI" value={proposalDetail.data.item.sourceUri} />
                    )}
                    {"reviewPriority" in proposalDetail.data.item && (
                      <MetaBlock label="Review Priority" value={proposalDetail.data.item.reviewPriority ?? "normal"} />
                    )}
                    {"approvalScope" in proposalDetail.data.item && proposalDetail.data.item.approvalScope && (
                      <MetaBlock label="Approval Scope" value={proposalDetail.data.item.approvalScope} />
                    )}
                    {"proposedExternalTarget" in proposalDetail.data.item && proposalDetail.data.item.proposedExternalTarget && (
                      <MetaBlock label="External Target" value={proposalDetail.data.item.proposedExternalTarget} />
                    )}
                    {"lastReviewedAt" in proposalDetail.data.item && proposalDetail.data.item.lastReviewedAt && (
                      <MetaBlock label="Last Review" value={new Date(proposalDetail.data.item.lastReviewedAt * 1000).toLocaleString()} />
                    )}
                    <div className="text-[11px] leading-relaxed max-h-28 overflow-y-auto" style={{ color: C.textMuted }}>
                      {"rawText" in proposalDetail.data.item ? proposalDetail.data.item.rawText : ""}
                    </div>
                    {"reviewNotes" in proposalDetail.data.item && proposalDetail.data.item.reviewNotes && (
                      <div className="rounded p-2 text-[11px] leading-relaxed" style={{ background: C.surfaceMuted, color: C.textSecondary, border: `1px solid ${C.borderSoft}` }}>
                        {proposalDetail.data.item.reviewNotes}
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-1">
                      {(() => {
                        const currentStatus = proposalDetail.data.item.status;
                        return proposalDetail.data.statusOptions.map((status) => (
                          <button
                            key={status}
                            type="button"
                            onClick={() => updateSelectedProposalStatus(status)}
                            disabled={statusUpdatePending || status === currentStatus}
                            className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider rounded"
                            style={{
                              background: status === currentStatus ? C.accentSoft : C.surfaceMuted,
                              color: statusUpdatePending || status === currentStatus ? C.textMuted : C.textPrimary,
                              border: `1px solid ${C.borderSoft}`,
                            }}
                          >
                            {status.replace(/_/g, " ")}
                          </button>
                        ));
                      })()}
                    </div>
                    <div className="space-y-2 rounded p-2" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}>
                      <SectionTitle title="Review Fields" detail="local edit" />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <label className="min-w-0">
                          <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: C.textMuted }}>Priority</div>
                          <select
                            value={reviewPriority}
                            onChange={(event) => setReviewPriority(event.target.value)}
                            className="w-full px-2 py-1.5 text-xs rounded outline-none"
                            style={{ background: C.background, color: C.textPrimary, border: `1px solid ${C.borderSoft}` }}
                          >
                            {["low", "normal", "high", "urgent"].map((priority) => (
                              <option key={priority} value={priority}>{priority}</option>
                            ))}
                          </select>
                        </label>
                        <label className="min-w-0">
                          <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: C.textMuted }}>Approval Action</div>
                          <select
                            value={approvalAction}
                            onChange={(event) => setApprovalAction(event.target.value)}
                            className="w-full px-2 py-1.5 text-xs rounded outline-none"
                            style={{ background: C.background, color: C.textPrimary, border: `1px solid ${C.borderSoft}` }}
                          >
                            {["source_enrichment", "notion_capture_write", "slack_capture_read", "schedule_reminder", "send_message"].map((action) => (
                              <option key={action} value={action}>{action.replace(/_/g, " ")}</option>
                            ))}
                          </select>
                        </label>
                      </div>
                      <input
                        value={approvalScope}
                        onChange={(event) => setApprovalScope(event.target.value)}
                        placeholder="Approval scope, e.g. one Notion capture row or one Slack DM read"
                        className="w-full px-2 py-1.5 text-xs rounded outline-none"
                        style={{ background: C.background, color: C.textPrimary, border: `1px solid ${C.borderSoft}` }}
                      />
                      <input
                        value={externalTarget}
                        onChange={(event) => setExternalTarget(event.target.value)}
                        placeholder="Proposed external target, still gated"
                        className="w-full px-2 py-1.5 text-xs rounded outline-none"
                        style={{ background: C.background, color: C.textPrimary, border: `1px solid ${C.borderSoft}` }}
                      />
                      <textarea
                        value={reviewNotes}
                        onChange={(event) => setReviewNotes(event.target.value)}
                        placeholder="Local review notes. Do not paste secrets."
                        rows={4}
                        className="w-full px-2 py-1.5 text-xs rounded outline-none resize-none"
                        style={{ background: C.background, color: C.textPrimary, border: `1px solid ${C.borderSoft}` }}
                      />
                      {selectedProposal.kind === "source" && (
                        <label className="flex items-center gap-2 text-[11px]" style={{ color: C.textMuted }}>
                          <input
                            type="checkbox"
                            checked={needsReview}
                            onChange={(event) => setNeedsReview(event.target.checked)}
                          />
                          Needs local review before external sync/enrichment
                        </label>
                      )}
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={saveSelectedReview}
                          disabled={reviewUpdatePending}
                          className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider rounded"
                          style={{
                            background: reviewUpdatePending ? C.background : C.accentSoft,
                            color: reviewUpdatePending ? C.textMuted : C.textPrimary,
                            border: `1px solid ${C.borderSoft}`,
                          }}
                        >
                          {reviewUpdatePending ? "Saving" : "Save Local Review"}
                        </button>
                        <button
                          type="button"
                          onClick={stageApprovalPreview}
                          disabled={createApprovalPreview.isPending}
                          className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider rounded"
                          style={{
                            background: createApprovalPreview.isPending ? C.background : C.surface,
                            color: createApprovalPreview.isPending ? C.textMuted : C.gold,
                            border: `1px solid ${C.borderSoft}`,
                          }}
                        >
                          {createApprovalPreview.isPending ? "Staging" : "Stage Approval Preview"}
                        </button>
                      </div>
                      {createApprovalPreview.data?.ok && createApprovalPreview.data.approval && (
                        <div className="text-[11px] leading-relaxed" style={{ color: C.success }}>
                          Staged pending approval #{createApprovalPreview.data.approval.id}. No external action approved or executed.
                        </div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <SectionTitle title="Approval Previews" detail="pending local" />
                      {(approvalPreviews.data ?? []).length === 0 ? (
                        <div className="text-[11px] leading-relaxed" style={{ color: C.textMuted }}>
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
                    </div>
                    <div className="space-y-1">
                      {proposalDetail.data.gates.map((gate) => (
                        <div key={gate} className="text-[11px] leading-relaxed" style={{ color: C.textMuted }}>
                          - {gate}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-[11px] leading-relaxed" style={{ color: C.warning }}>
                    {proposalDetail.data?.gates[0] ?? "Loading proposal detail."}
                  </div>
                )}
              </div>
            </section>

            <section className="rounded p-3" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
              <SectionTitle title="Slack Shape" detail={data?.slackProposal.recommendedShape.replace(/_/g, " ") ?? "proposal"} />
              <div className="mt-2 space-y-2">
                {(data?.slackProposal.options ?? []).map((option) => (
                  <div key={option.id} className="rounded p-2" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}>
                    <div className="text-xs font-semibold" style={{ color: C.textPrimary }}>{option.label}</div>
                    <div className="text-[11px] leading-relaxed mt-1" style={{ color: C.textSecondary }}>{option.bestFor}</div>
                    <div className="text-[11px] leading-relaxed mt-1" style={{ color: C.textMuted }}>{option.tradeoff}</div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded p-3" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
              <SectionTitle title="Approval Gates" detail="required" />
              <div className="mt-2 space-y-1">
                {(data?.slackProposal.approvalGates ?? []).map((gate) => (
                  <div key={gate} className="text-[11px] leading-relaxed" style={{ color: C.textMuted }}>- {gate}</div>
                ))}
              </div>
            </section>

            <section className="rounded p-3" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
              <SectionTitle title="Routing Rules" detail="first pass" />
              <div className="mt-2 space-y-1">
                {(data?.routingRules ?? []).map((rule) => (
                  <div key={rule} className="text-[11px] leading-relaxed" style={{ color: C.textMuted }}>- {rule}</div>
                ))}
              </div>
            </section>

            <section className="rounded p-3" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
              <SectionTitle title="Reminder Proposals" detail="local" />
              <div className="mt-2 space-y-2">
                {(reminders.data ?? []).length === 0 ? (
                  <div className="text-[11px] leading-relaxed" style={{ color: C.textMuted }}>
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
                      <div className="text-xs font-semibold truncate mt-1" style={{ color: C.textPrimary }} title={reminder.title}>
                        {reminder.title}
                      </div>
                      <div className="text-[11px] leading-snug mt-1 line-clamp-2" style={{ color: C.textMuted }} title={reminder.approvalRequired}>
                        {reminder.approvalRequired}
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedProposal({ kind: "reminder", id: reminder.id })}
                        className="mt-2 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider rounded"
                        style={{
                          background:
                            selectedProposal?.kind === "reminder" && selectedProposal.id === reminder.id ? C.accentSoft : C.surface,
                          color:
                            selectedProposal?.kind === "reminder" && selectedProposal.id === reminder.id ? C.textPrimary : C.textMuted,
                          border: `1px solid ${C.borderSoft}`,
                        }}
                      >
                        Details
                      </button>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="rounded p-3" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
              <SectionTitle title="Message Drafts" detail="local" />
              <div className="mt-2 space-y-2">
                {(messageDrafts.data ?? []).length === 0 ? (
                  <div className="text-[11px] leading-relaxed" style={{ color: C.textMuted }}>
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
                      <div className="text-xs font-semibold truncate mt-1" style={{ color: C.textPrimary }} title={draft.title}>
                        {draft.title}
                      </div>
                      <div className="text-[11px] leading-snug mt-1 line-clamp-2" style={{ color: C.textMuted }} title={draft.approvalRequired}>
                        {draft.approvalRequired}
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedProposal({ kind: "message", id: draft.id })}
                        className="mt-2 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider rounded"
                        style={{
                          background:
                            selectedProposal?.kind === "message" && selectedProposal.id === draft.id ? C.accentSoft : C.surface,
                          color:
                            selectedProposal?.kind === "message" && selectedProposal.id === draft.id ? C.textPrimary : C.textMuted,
                          border: `1px solid ${C.borderSoft}`,
                        }}
                      >
                        Details
                      </button>
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
    <div className="rounded p-2 min-w-0" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
      <div className="text-[10px] uppercase tracking-wider" style={{ color: C.textMuted }}>{label}</div>
      <div className="text-xs font-semibold truncate mt-0.5" style={{ color: tone }} title={value}>{value}</div>
    </div>
  );
}

function SectionTitle({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: C.textMuted }}>{title}</div>
      <div className="text-[10px] uppercase tracking-wider truncate" style={{ color: C.textMuted }}>{detail}</div>
    </div>
  );
}

function Chip({ label, tone }: { label: string; tone: string }) {
  return (
    <span
      className="text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider"
      style={{ color: tone, background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}
    >
      {label}
    </span>
  );
}

function MetaBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded p-2 min-w-0" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}>
      <div className="text-[10px] uppercase tracking-wider" style={{ color: C.textMuted }}>{label}</div>
      <div className="text-[11px] leading-snug truncate mt-0.5" style={{ color: C.textSecondary }} title={value}>{value}</div>
    </div>
  );
}

function targetTypeForProposal(kind: "source" | "reminder" | "message") {
  if (kind === "source") return "capture_observation";
  if (kind === "reminder") return "reminder_proposal";
  return "message_draft_proposal";
}
