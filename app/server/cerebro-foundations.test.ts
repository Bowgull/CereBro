import { describe, expect, it } from "vitest";
import fs from "fs";
import path from "path";
import { AGENT_ROUTING, getAgentById } from "./agentRouter";
import { appRouter } from "./routers";
import {
  getObsidianStatus,
  getVaultLayout,
  writeObsidianNote,
  writeVaultTextArtifact,
} from "./integrations/vault";
import { getCerebroDb } from "./cerebroDb";
import { getSkillById, listSkillFiles } from "./skillLoader";

describe("CereBro agent routing metadata", () => {
  it("uses model classes instead of hardcoded Claude model names", () => {
    for (const agent of AGENT_ROUTING) {
      expect(agent.defaultModelClass).not.toMatch(/^claude-/);
      expect(agent.escalationModelClass ?? "").not.toMatch(/^claude-/);
    }
  });

  it("keeps Oak and Spock in their corrected lanes", () => {
    expect(getAgentById("oak")?.role).toContain("Validator");
    expect(getAgentById("oak")?.toolScope).toContain("validate_output");
    expect(getAgentById("spock")?.role).toContain("Logic checker");
    expect(getAgentById("spock")?.toolScope).toContain("bloat_check");
  });

  it("binds Aang to a real learning skill file", () => {
    const aang = getAgentById("aang");
    expect(aang?.skills).toContain("aang-learning");
    expect(getSkillById("aang-learning")?.content).toContain("# Aang Learning");
  });

  it("includes Hedwig as the V1 capture and messaging agent", () => {
    const hedwig = getAgentById("hedwig");
    expect(hedwig?.floor).toBe("crypts");
    expect(hedwig?.chamber).toBe("Messenger Roost");
    expect(hedwig?.toolScope).toContain("read_slack_capture");
    expect(hedwig?.toolScope).toContain("write_notion");
  });
});

describe("CereBro skill files", () => {
  it("discovers starter-pack skill files at runtime", () => {
    const skills = listSkillFiles();
    expect(skills.map((s) => s.id)).toContain("validation");
    expect(skills.map((s) => s.id)).toContain("aang-learning");
  });

  it("keeps local Claude agent role files aligned with the truth reconciliation", () => {
    const repoRoot = path.resolve(process.cwd(), "..");
    const oak = fs.readFileSync(path.join(repoRoot, ".claude", "agents", "oak.md"), "utf8");
    const spock = fs.readFileSync(path.join(repoRoot, ".claude", "agents", "spock.md"), "utf8");
    const cortana = fs.readFileSync(path.join(repoRoot, ".claude", "agents", "cortana.md"), "utf8");

    expect(oak).toContain("Final gate");
    expect(oak).not.toContain("Research curator. Reads heavy material");
    expect(spock).toContain("Logic checker");
    expect(cortana).toContain("Hard router");
    expect(cortana).toContain("Browser disabled by default");
  });
});

describe("CereBro proposal-only shell plans", () => {
  it("defines the modular workbench without opening tools or writing externally", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: {} as never,
      res: {} as never,
    });

    const plan = await caller.workbench.plan();
    expect(plan.mode).toBe("proposal_only");
    expect(plan.writesExternal).toBe(false);
    expect(plan.opensBrowser).toBe(false);
    expect(plan.capturesMedia).toBe(false);
    expect(plan.surfaces.map((surface) => surface.id)).toContain("annotation_canvas");
    expect(plan.surfaces.map((surface) => surface.id)).toContain("localhost_preview");
    const imageSurface = plan.surfaces.find((surface) => surface.id === "image_video_review");
    expect(imageSurface?.status).toBe("partially_live");
    expect(imageSurface?.permission).toContain("Temporary image/video previews");
    expect(plan.evidenceRecordShape.appendOnly).toBe(true);
    expect(plan.gates.join(" ")).toContain("does not open a browser");

    const evidence = await caller.workbench.createEvidence({
      kind: "manual_note",
      title: "Visible issue note",
      summary: "The workbench can record what the user points at without capturing media yet.",
      targetUri: "panel:workbench",
      ownerAgent: "gojo",
      routeAgent: "spock",
      viewport: "1440x900",
      coordinates: "x=120 y=80 w=300 h=140",
      annotationText: "Inspect this visible issue before any automation exists.",
      permissionClass: "manual_note",
    });
    expect(evidence.ok).toBe(true);
    expect(evidence.appendOnly).toBe(true);
    expect(evidence.writesExternal).toBe(false);
    expect(evidence.opensBrowser).toBe(false);
    expect(evidence.capturesMedia).toBe(false);
    expect(evidence.evidence.validationStatus).toBe("unvalidated");
    expect(evidence.evidence.coordinates).toContain("x=120");
    expect(evidence.evidence.permissionPreflightId).toBeGreaterThan(0);
    expect(evidence.permissionPreflightId).toBe(evidence.evidence.permissionPreflightId);

    const imageEvidence = await caller.workbench.createEvidence({
      kind: "image_review",
      title: "Temporary screenshot review",
      summary: "Metadata-only note for a temporary image preview. Image bytes were not saved.",
      targetUri: "temporary-image:settings-screen.png",
      ownerAgent: "gojo",
      routeAgent: "oak",
      mediaName: "settings-screen.png",
      mediaMimeType: "image/png",
      mediaByteSize: 24000,
      mediaKind: "image",
      mediaTemporary: true,
      permissionClass: "media_review",
    });
    expect(imageEvidence.ok).toBe(true);
    expect(imageEvidence.writesExternal).toBe(false);
    expect(imageEvidence.capturesMedia).toBe(false);
    expect(imageEvidence.evidence.kind).toBe("image_review");
    expect(imageEvidence.evidence.permissionClass).toBe("media_review");
    expect(imageEvidence.evidence.mediaName).toBe("settings-screen.png");
    expect(imageEvidence.evidence.mediaMimeType).toBe("image/png");
    expect(imageEvidence.evidence.mediaByteSize).toBe(24000);
    expect(imageEvidence.evidence.mediaKind).toBe("image");
    expect(imageEvidence.evidence.mediaTemporary).toBe(true);
    expect(imageEvidence.evidence.permissionPreflightId).toBeGreaterThan(0);

    const videoFrameEvidence = await caller.workbench.createEvidence({
      kind: "video_frame",
      title: "Temporary video frame review",
      summary: "Metadata-only note for a temporary video frame. Video bytes were not saved.",
      targetUri: "temporary-video:flow-recording.mov",
      ownerAgent: "gojo",
      routeAgent: "spock",
      mediaName: "flow-recording.mov",
      mediaMimeType: "video/quicktime",
      mediaByteSize: 54000,
      mediaKind: "video_frame",
      mediaFrameTimeSec: 12.5,
      mediaDurationSec: 43.25,
      mediaTemporary: true,
      permissionClass: "media_review",
    });
    expect(videoFrameEvidence.ok).toBe(true);
    expect(videoFrameEvidence.writesExternal).toBe(false);
    expect(videoFrameEvidence.capturesMedia).toBe(false);
    expect(videoFrameEvidence.evidence.kind).toBe("video_frame");
    expect(videoFrameEvidence.evidence.mediaKind).toBe("video_frame");
    expect(videoFrameEvidence.evidence.mediaFrameTimeSec).toBe(12.5);
    expect(videoFrameEvidence.evidence.mediaDurationSec).toBe(43.25);
    expect(videoFrameEvidence.evidence.mediaTemporary).toBe(true);
    expect(videoFrameEvidence.gates.join(" ")).toContain("did not capture a screenshot");

    const records = await caller.workbench.evidence({
      query: "visible issue",
      limit: 10,
    });
    expect(records.mode).toBe("read_only");
    expect(records.appendOnly).toBe(true);
    expect(records.writesExternal).toBe(false);
    expect(records.items.map((item) => item.id)).toContain(evidence.evidence.id);

    const detail = await caller.workbench.evidenceDetail({ id: evidence.evidence.id });
    expect(detail.found).toBe(true);
    expect(detail.opensBrowser).toBe(false);
    expect(detail.capturesMedia).toBe(false);
    if (detail.found) {
      expect(detail.evidence.routeAgent).toBe("spock");
      expect(detail.evidence.viewport).toBe("1440x900");
      expect(detail.evidence.annotationText).toContain("visible issue");
      expect(detail.permissionPreflight?.id).toBe(evidence.permissionPreflightId);
      expect(detail.permissionPreflight?.decision).toBe("allowed_local");
      expect(detail.permissionPreflight?.reasons.join(" ")).toContain("Workbench evidence");
      expect(detail.gates.join(" ")).toContain("reads local append-only evidence only");
    }

    const linkOptions = await caller.workbench.linkOptions();
    expect(linkOptions.mode).toBe("read_only");
    expect(linkOptions.writesExternal).toBe(false);
    expect(linkOptions.opensBrowser).toBe(false);
    expect(linkOptions.executesCommand).toBe(false);
    expect(Array.isArray(linkOptions.tasks)).toBe(true);
    expect(Array.isArray(linkOptions.sessions)).toBe(true);
    expect(Array.isArray(linkOptions.artifacts)).toBe(true);
    expect(linkOptions.gates.join(" ")).toContain("does not fetch it");

    const validationNote = await caller.workbench.createValidationNote({
      evidenceId: evidence.evidence.id,
      validatorAgent: "oak",
      status: "needs_review",
      note: "Local validation note only. Check the referenced evidence before reuse.",
    });
    expect(validationNote.ok).toBe(true);
    expect(validationNote.writesExternal).toBe(false);
    expect(validationNote.opensBrowser).toBe(false);
    expect(validationNote.capturesMedia).toBe(false);
    if (validationNote.ok) {
      expect(validationNote.evidence.kind).toBe("validation_note");
      expect(validationNote.evidence.targetUri).toBe(`evidence:${evidence.evidence.id}`);
      expect(validationNote.evidence.validationStatus).toBe("needs_review");
      expect(validationNote.evidence.permissionPreflightId).toBeGreaterThan(0);
      expect(validationNote.evidence.permissionPreflightId).not.toBe(evidence.permissionPreflightId);
      expect(validationNote.permissionPreflightId).toBe(validationNote.evidence.permissionPreflightId);
      expect(validationNote.gates.join(" ")).toContain("original evidence record was not overwritten");
      expect(validationNote.gates.join(" ")).toContain("permission preflight audit row");
    }

    const grouped = await caller.workbench.evidenceGroups({
      groupBy: "validation_status",
      query: "visible issue",
    });
    expect(grouped.mode).toBe("read_only");
    expect(grouped.appendOnly).toBe(true);
    expect(grouped.writesExternal).toBe(false);
    expect(grouped.opensBrowser).toBe(false);
    expect(grouped.executesCommand).toBe(false);
    expect(grouped.groups.map((group) => group.key)).toContain("unvalidated");
    expect(grouped.gates.join(" ")).toContain("do not fetch sources or execute commands");

    const taskGroups = await caller.workbench.evidenceGroups({
      groupBy: "task",
      query: "visible issue",
    });
    expect(taskGroups.mode).toBe("read_only");
    expect(taskGroups.groups.map((group) => group.key)).toContain("unlinked");

    const detailWithHistory = await caller.workbench.evidenceDetail({ id: evidence.evidence.id });
    expect(detailWithHistory.found).toBe(true);
    if (detailWithHistory.found) {
      expect(detailWithHistory.validationHistory.map((item) => item.id)).toContain(validationNote.ok ? validationNote.evidence.id : -1);
      expect(detailWithHistory.validationHistory[0]?.targetUri).toBe(`evidence:${evidence.evidence.id}`);
      expect(detailWithHistory.validationHistory[0]?.permissionPreflightId).toBe(validationNote.ok ? validationNote.evidence.permissionPreflightId : -1);
    }
  });

  it("defines the Aang Companion event policy without desktop side effects", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: {} as never,
      res: {} as never,
    });

    const policy = await caller.companion.policy();
    expect(policy.mode).toBe("proposal_only");
    expect(policy.startsDesktopProcess).toBe(false);
    expect(policy.sendsNotifications).toBe(false);
    expect(policy.readsScreen).toBe(false);
    expect(policy.routedBy).toBe("cortana");
    expect(policy.allowedEvents.map((event) => event.id)).toContain("pending_approval");
    expect(policy.blockedEvents).toContain("Slack reads or writes");
    expect(policy.shellOptions.find((option) => option.id === "web_mock")?.status).toBe("recommended_first");

    const events = await caller.companion.localEvents();
    expect(events.mode).toBe("read_only");
    expect(events.writesExternal).toBe(false);
    expect(events.sendsNotifications).toBe(false);
    expect(events.startsDesktopProcess).toBe(false);
    expect(events.events.map((event) => event.id)).toContain("pending_approval");
    expect(events.events.map((event) => event.id)).toContain("workbench_evidence");
    expect(events.gates.join(" ")).toContain("do not notify");
  });
});

describe("CereBro file lifecycle metadata", () => {
  it("defines a canonical vault layout including Obsidian, creative, messages, and trash staging", () => {
    const layout = getVaultLayout();
    const keys = layout.map((entry) => entry.key);

    expect(keys).toContain("obsidian");
    expect(keys).toContain("creativeImages");
    expect(keys).toContain("creativeVideo");
    expect(keys).toContain("messages");
    expect(keys).toContain("trashStaging");
  });

  it("keeps Obsidian unconfigured when no vault or explicit Obsidian path is set", async () => {
    const prevVault = process.env.CEREBRO_VAULT_DIR;
    const prevObsidian = process.env.CEREBRO_OBSIDIAN_DIR;
    delete process.env.CEREBRO_VAULT_DIR;
    delete process.env.CEREBRO_OBSIDIAN_DIR;

    try {
      await expect(getObsidianStatus()).resolves.toMatchObject({
        configured: false,
        obsidianDir: null,
        exists: false,
        source: "none",
      });
    } finally {
      if (prevVault === undefined) delete process.env.CEREBRO_VAULT_DIR;
      else process.env.CEREBRO_VAULT_DIR = prevVault;
      if (prevObsidian === undefined) delete process.env.CEREBRO_OBSIDIAN_DIR;
      else process.env.CEREBRO_OBSIDIAN_DIR = prevObsidian;
    }
  });

  it("writes approved Obsidian notes into the configured vault path", async () => {
    const prevVault = process.env.CEREBRO_VAULT_DIR;
    const prevObsidian = process.env.CEREBRO_OBSIDIAN_DIR;
    const dir = fs.mkdtempSync(path.join(process.cwd(), "tmp-obsidian-"));
    process.env.CEREBRO_OBSIDIAN_DIR = dir;
    delete process.env.CEREBRO_VAULT_DIR;

    try {
      const written = await writeObsidianNote({
        title: "Hello CereBro",
        body: "# Hello CereBro\n\nTest note.",
        subdir: "Learning/Notes",
      });

      expect(written.ok).toBe(true);
      expect(written.relativePath).toBe("learning/notes/hello-cerebro.md");
      expect(fs.readFileSync(path.join(dir, written.relativePath!), "utf8")).toContain("Test note.");

      const second = await writeObsidianNote({
        title: "Hello CereBro",
        body: "# Hello CereBro\n\nSecond note.",
        subdir: "Learning/Notes",
      });
      expect(second.ok).toBe(true);
      expect(second.relativePath).toMatch(/^learning\/notes\/hello-cerebro-\d{14}\.md$/);
      expect(fs.readFileSync(path.join(dir, written.relativePath!), "utf8")).toContain("Test note.");
      expect(fs.readFileSync(path.join(dir, second.relativePath!), "utf8")).toContain("Second note.");
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
      if (prevVault === undefined) delete process.env.CEREBRO_VAULT_DIR;
      else process.env.CEREBRO_VAULT_DIR = prevVault;
      if (prevObsidian === undefined) delete process.env.CEREBRO_OBSIDIAN_DIR;
      else process.env.CEREBRO_OBSIDIAN_DIR = prevObsidian;
    }
  });

  it("writes text artifacts into configured vault folders without touching the real vault", async () => {
    const prevVault = process.env.CEREBRO_VAULT_DIR;
    const prevObsidian = process.env.CEREBRO_OBSIDIAN_DIR;
    const dir = fs.mkdtempSync(path.join(process.cwd(), "tmp-vault-"));
    process.env.CEREBRO_VAULT_DIR = dir;
    delete process.env.CEREBRO_OBSIDIAN_DIR;

    try {
      const written = await writeVaultTextArtifact({
        relativeDir: "06_Messages/drafts",
        title: "Follow Up",
        body: "Draft message.",
        ext: "md",
      });

      expect(written.ok).toBe(true);
      expect(written.relativePath).toBe("06_Messages/drafts/follow-up.md");
      expect(fs.readFileSync(path.join(dir, written.relativePath!), "utf8")).toBe("Draft message.");

      const second = await writeVaultTextArtifact({
        relativeDir: "06_Messages/drafts",
        title: "Follow Up",
        body: "Second draft message.",
        ext: "md",
      });
      expect(second.ok).toBe(true);
      expect(second.relativePath).toMatch(/^06_Messages\/drafts\/follow-up-\d{14}\.md$/);
      expect(fs.readFileSync(path.join(dir, written.relativePath!), "utf8")).toBe("Draft message.");
      expect(fs.readFileSync(path.join(dir, second.relativePath!), "utf8")).toBe("Second draft message.");
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
      if (prevVault === undefined) delete process.env.CEREBRO_VAULT_DIR;
      else process.env.CEREBRO_VAULT_DIR = prevVault;
      if (prevObsidian === undefined) delete process.env.CEREBRO_OBSIDIAN_DIR;
      else process.env.CEREBRO_OBSIDIAN_DIR = prevObsidian;
    }
  });
});

describe("Hedwig capture planning", () => {
  it("keeps Slack/Notion capture proposal-only until approved connections exist", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: {} as never,
      res: {} as never,
    });

    const plan = await caller.hedwig.capturePlan();
    expect(plan.mode).toBe("proposal_only");
    expect(plan.notionDatabase.envVar).toBe("NOTION_CAPTURE_DATABASE_ID");
    expect(plan.slackProposal.recommendedShape).toBe("both_dm_and_capture_channel");

    const preview = await caller.hedwig.previewCapture({
      text: "Save this for Declyne later https://example.com/plaid-notes",
      sourceLabel: "slack:capture",
    });
    expect(preview.writesExternal).toBe(false);
    expect(preview.persistedLocalObservation).toBe(true);
    expect(preview.observationId).toBeGreaterThan(0);
    expect(preview.captureType).toBe("link");
    expect(preview.projectGuess).toBe("Declyne");
    expect(preview.proposedNotionRow["Source URI"]).toBe("https://example.com/plaid-notes");

    const observations = await caller.hedwig.observations({ limit: 5 });
    expect(observations.map((item) => item.id)).toContain(preview.observationId);
    expect(observations.find((item) => item.id === preview.observationId)?.source).toBe("hedwig_preview");

    const triage = await caller.hedwig.triageObservation({ id: preview.observationId });
    expect(triage.found).toBe(true);
    expect(triage.writesExternal).toBe(false);
    if (triage.found) {
      expect(triage.recommendedRoute).toBe("source");
      expect(triage.sourceDraft?.uri).toBe("https://example.com/plaid-notes");
      expect(triage.gates.join(" ")).toContain("does not write to Notion");
    }

    const created = await caller.hedwig.createTaskFromObservation({ id: preview.observationId });
    expect(created.ok).toBe(true);
    expect(created.writesExternal).toBe(false);
    if (created.ok) {
      expect(created.task.title).toContain("Triage capture:");
      expect(created.task.agent).toBe("surfer");
      expect(created.observation?.status).toBe("tasked");
      expect(created.observation?.taskId).toBe(created.task.id);
    }

    const sourcePreview = await caller.hedwig.previewCapture({
      text: "Save this for CereBro sources https://example.com/source-card",
      sourceLabel: "slack:capture",
    });
    const savedSource = await caller.hedwig.saveSourceFromObservation({ id: sourcePreview.observationId });
    expect(savedSource.ok).toBe(true);
    expect(savedSource.writesExternal).toBe(false);
    if (savedSource.ok) {
      expect(savedSource.source.uri).toBe("https://example.com/source-card");
      expect(savedSource.observation?.status).toBe("sourced");
      expect(savedSource.artifactId).toBeGreaterThan(0);
      expect(savedSource.sourceEventId).toBeGreaterThan(0);
    }
    const db = await getCerebroDb();
    const sourceEvents = await db.execute({
      sql: `SELECT event_type, uri, owner_agent FROM source_events WHERE uri = ? ORDER BY id DESC LIMIT 5`,
      args: ["https://example.com/source-card"],
    });
    expect(sourceEvents.rows.map((row) => String(row.event_type))).toContain("hedwig_capture_source_save");
    expect(sourceEvents.rows.map((row) => String(row.owner_agent))).toContain("hedwig");

    const panel = await caller.surfer.panel();
    expect(panel.savedSources.map((source) => source.uri)).toContain("https://example.com/source-card");
    expect(panel.recentSourceEvents.map((event) => event.uri)).toContain("https://example.com/source-card");
    expect(panel.recentSourceEvents.map((event) => event.eventType)).toContain("hedwig_capture_source_save");

    const reminderPreview = await caller.hedwig.previewCapture({
      text: "Remind me tomorrow to review the CereBro capture inbox schema",
      sourceLabel: "slack:dm",
    });
    const reminder = await caller.hedwig.createReminderProposalFromObservation({
      id: reminderPreview.observationId,
    });
    expect(reminder.ok).toBe(true);
    expect(reminder.writesExternal).toBe(false);
    if (reminder.ok) {
      expect(reminder.reminder?.timingHint).toBe("tomorrow");
      expect(reminder.reminder?.ownerAgent).toBe("hedwig");
      expect(reminder.observation?.status).toBe("triaged");
    }

    const reminderProposals = await caller.hedwig.reminderProposals({ limit: 5 });
    expect(reminderProposals.map((item) => item.id)).toContain(reminder.ok ? reminder.reminder!.id : -1);
    const reminderDetail = await caller.hedwig.proposalDetail({
      kind: "reminder",
      id: reminder.ok ? reminder.reminder!.id : -1,
    });
    expect(reminderDetail.found).toBe(true);
    expect(reminderDetail.writesExternal).toBe(false);
    if (reminderDetail.found) {
      expect(reminderDetail.statusOptions).toContain("ready_for_approval");
      expect(reminderDetail.gates.join(" ")).toContain("Scheduling");
    }
    const updatedReminder = await caller.hedwig.updateReminderProposalStatus({
      id: reminder.ok ? reminder.reminder!.id : -1,
      status: "ready_for_approval",
    });
    expect(updatedReminder.writesExternal).toBe(false);
    expect(updatedReminder.reminder?.status).toBe("ready_for_approval");
    const reviewedReminder = await caller.hedwig.updateReminderProposalReview({
      id: reminder.ok ? reminder.reminder!.id : -1,
      reviewPriority: "urgent",
      reviewNotes: "Confirm exact time before scheduling anything.",
      approvalScope: "one calendar/slack reminder only",
      proposedExternalTarget: "local approval preview only",
    });
    expect(reviewedReminder.writesExternal).toBe(false);
    expect(reviewedReminder.reminder?.reviewPriority).toBe("urgent");
    expect(reviewedReminder.reminder?.reviewNotes).toContain("Confirm exact time");

    const messagePreview = await caller.hedwig.previewCapture({
      text: "Message Cortana that the Hedwig capture flow needs a calmer empty state",
      sourceLabel: "slack:dm",
    });
    const draft = await caller.hedwig.createMessageDraftProposalFromObservation({
      id: messagePreview.observationId,
    });
    expect(draft.ok).toBe(true);
    expect(draft.writesExternal).toBe(false);
    if (draft.ok) {
      expect(draft.draft?.recipientHint).toBe("Cortana");
      expect(draft.draft?.ownerAgent).toBe("hedwig");
      expect(draft.observation?.status).toBe("triaged");
    }

    const messageDrafts = await caller.hedwig.messageDraftProposals({ limit: 5 });
    expect(messageDrafts.map((item) => item.id)).toContain(draft.ok ? draft.draft!.id : -1);
    const draftDetail = await caller.hedwig.proposalDetail({
      kind: "message",
      id: draft.ok ? draft.draft!.id : -1,
    });
    expect(draftDetail.found).toBe(true);
    expect(draftDetail.writesExternal).toBe(false);
    if (draftDetail.found) {
      expect(draftDetail.statusOptions).toContain("reviewing");
      expect(draftDetail.gates.join(" ")).toContain("Sending");
    }
    const updatedDraft = await caller.hedwig.updateMessageDraftProposalStatus({
      id: draft.ok ? draft.draft!.id : -1,
      status: "reviewing",
    });
    expect(updatedDraft.writesExternal).toBe(false);
    expect(updatedDraft.draft?.status).toBe("reviewing");
    const reviewedDraft = await caller.hedwig.updateMessageDraftProposalReview({
      id: draft.ok ? draft.draft!.id : -1,
      reviewPriority: "high",
      reviewNotes: "Keep this as a draft until recipient and tone are approved.",
      approvalScope: "one reviewed message send only",
      proposedExternalTarget: "Slack DM proposal only",
    });
    expect(reviewedDraft.writesExternal).toBe(false);
    expect(reviewedDraft.draft?.reviewPriority).toBe("high");
    expect(reviewedDraft.draft?.proposedExternalTarget).toBe("Slack DM proposal only");

    const sourceDetail = await caller.hedwig.proposalDetail({
      kind: "source",
      id: sourcePreview.observationId,
    });
    expect(sourceDetail.found).toBe(true);
    expect(sourceDetail.writesExternal).toBe(false);
    if (sourceDetail.found) {
      expect(sourceDetail.statusOptions).toContain("archived");
      expect(sourceDetail.gates.join(" ")).toContain("does not fetch");
    }
    const updatedSource = await caller.hedwig.updateSourceProposalStatus({
      id: sourcePreview.observationId,
      status: "archived",
    });
    expect(updatedSource.writesExternal).toBe(false);
    expect(updatedSource.observation?.status).toBe("archived");
    const reviewedSource = await caller.hedwig.updateSourceProposalReview({
      id: sourcePreview.observationId,
      priority: "high",
      reviewNotes: "Validate with Surfer before trusting the captured link.",
      approvalScope: "one public URL enrichment only",
      proposedExternalTarget: "Surfer source enrichment proposal",
      needsReview: true,
    });
    expect(reviewedSource.writesExternal).toBe(false);
    expect(reviewedSource.observation?.priority).toBe("high");
    expect(reviewedSource.observation?.needsReview).toBe(true);
    expect(reviewedSource.observation?.reviewNotes).toContain("Validate with Surfer");

    const approvalPreview = await caller.hedwig.createApprovalPreviewFromProposal({
      kind: "source",
      id: sourcePreview.observationId,
      actionType: "source_enrichment",
      reason: "Preview approval only; do not fetch yet.",
    });
    expect(approvalPreview.ok).toBe(true);
    expect(approvalPreview.writesExternal).toBe(false);
    expect(approvalPreview.approval?.status).toBe("pending");
    expect(approvalPreview.approval?.actionType).toBe("source_enrichment");
    expect(approvalPreview.approval?.permissionPreflightId).toBeGreaterThan(0);
    expect(approvalPreview.gates.join(" ")).toContain("pending local approval record only");
    const approvalRows = await caller.hedwig.approvalPreviews({
      targetType: "capture_observation",
      targetId: sourcePreview.observationId,
      limit: 5,
    });
    expect(approvalRows.map((item) => item.id)).toContain(approvalPreview.approval?.id);
    expect(approvalRows.find((item) => item.id === approvalPreview.approval?.id)?.permissionPreflightId).toBe(approvalPreview.approval?.permissionPreflightId);

    const approvalQueue = await caller.approvals.list({
      origin: "hedwig",
      query: "source enrichment",
      limit: 20,
    });
    expect(approvalQueue.mode).toBe("read_only");
    expect(approvalQueue.writesExternal).toBe(false);
    expect(approvalQueue.wouldApprove).toBe(false);
    expect(approvalQueue.items.map((item) => item.id)).toContain(approvalPreview.approval?.id);
    const queued = approvalQueue.items.find((item) => item.id === approvalPreview.approval?.id);
    expect(queued?.origin).toBe("hedwig");
    expect(queued?.permissionPreflightId).toBe(approvalPreview.approval?.permissionPreflightId);
    expect(queued?.permissionPreflight?.id).toBe(approvalPreview.approval?.permissionPreflightId);
    expect(queued?.permissionPreflight?.decision).toBe("approval_required");
    expect(queued?.permissionPreflight?.reasons.join(" ")).toContain("Hedwig source enrichment");
    expect(queued?.validationPreview.oakNotes.join(" ")).toContain("Source action");
    expect(queued?.validationPreview.spockNotes.join(" ")).toContain("local approval preview");

    const hedwigPreflights = await caller.permissions.preflightRecords({
      actionClass: "browser_or_media_capture",
      limit: 20,
    });
    expect(hedwigPreflights.items.map((item) => item.id)).toContain(approvalPreview.approval?.permissionPreflightId);
  });
});

describe("Terminal Lab planning", () => {
  it("previews commands without executing them", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: {} as never,
      res: {} as never,
    });

    const plan = await caller.terminalLab.plan();
    expect(plan.mode).toBe("proposal_only");
    expect(plan.policies).toContain("No shell execution from Terminal Lab in this slice.");

    const task = await caller.tasks.create({
      title: "Check Terminal Lab linkage",
      agent: "tony",
      projectName: "CereBro",
      projectPath: "/Users/lindsaybell/Desktop/CereBro",
    });

    const readOnly = await caller.terminalLab.previewCommand({
      command: "rg -n Terminal CEREBRO_MASTER_BUILD_PLAN.md",
      taskId: task.id,
    });
    expect(readOnly.wouldExecute).toBe(false);
    expect(readOnly.risk).toBe("read_only");
    expect(readOnly.persisted).toBe(true);
    expect(readOnly.observationId).toBeGreaterThan(0);

    const destructive = await caller.terminalLab.previewCommand({
      command: "rm -rf app/client/public/sprites",
    });
    expect(destructive.wouldExecute).toBe(false);
    expect(destructive.risk).toBe("destructive");
    expect(destructive.gates.join(" ")).toContain("Destructive commands require explicit approval");

    const observations = await caller.terminalLab.observations({ limit: 5 });
    expect(observations.map((item) => item.id)).toContain(readOnly.observationId);
    expect(observations.find((item) => item.id === readOnly.observationId)?.status).toBe("previewed");
    expect(observations.find((item) => item.id === readOnly.observationId)?.taskId).toBe(task.id);

    const observed = await caller.terminalLab.observeOutput({
      observationId: readOnly.observationId,
      output: "Found 2 matches\nAPI_KEY=abc123\nhello@example.com",
      exitCode: 0,
    });
    expect(observed.wouldExecute).toBe(false);
    expect(observed.writesExternal).toBe(false);
    expect(observed.observation?.status).toBe("observed");
    expect(observed.observation?.outputSummary).toContain("API_KEY=[redacted]");
    expect(observed.observation?.outputSummary).toContain("[redacted-email]");
    expect(observed.observation?.followUps.map((item) => item.agent)).toContain("aang");
    expect(observed.observation?.followUps.map((item) => item.agent)).toContain("tony");

    const linked = await caller.terminalLab.linkObservation({
      observationId: destructive.observationId,
      taskId: task.id,
    });
    expect(linked.ok).toBe(true);
    expect(linked.wouldExecute).toBe(false);
    expect(linked.writesExternal).toBe(false);
    expect(linked.observation?.taskId).toBe(task.id);

    const failedPreview = await caller.terminalLab.previewCommand({
      command: "rg -n MissingThing missing-file.md",
      cwd: "/Users/lindsaybell/Desktop/CereBro",
    });
    await caller.terminalLab.observeOutput({
      observationId: failedPreview.observationId,
      output: "missing-file.md: No such file or directory",
      exitCode: 2,
    });
    const failedObservation = await caller.terminalLab.observations({ limit: 10 });
    const failedRow = failedObservation.find((item) => item.id === failedPreview.observationId);
    expect(failedRow?.diagnosticDrafts.map((item) => item.command)).toContain("pwd");
    expect(failedRow?.diagnosticDrafts.some((item) => item.command.includes("find . -maxdepth 4"))).toBe(true);
    expect(failedRow?.diagnosticDrafts.find((item) => item.command === "pwd")?.evidence).toContain("missing-file.md");
    expect(failedRow?.diagnosticDrafts.find((item) => item.command === "pwd")?.expectedSignal).toContain("project folder");

    const diagnosticPreview = await caller.terminalLab.previewDiagnosticDraft({
      observationId: failedPreview.observationId,
      command: "pwd",
    });
    expect(diagnosticPreview.ok).toBe(true);
    expect(diagnosticPreview.wouldExecute).toBe(false);
    expect(diagnosticPreview.writesExternal).toBe(false);
    if (diagnosticPreview.ok) {
      expect(diagnosticPreview.parentObservationId).toBe(failedPreview.observationId);
      expect(diagnosticPreview.command).toBe("pwd");
      expect(diagnosticPreview.projectId).toBe(failedPreview.projectId);
      expect(diagnosticPreview.handoffNote).toContain("regular Codex approval path");
      expect(diagnosticPreview.gates.join(" ")).toContain("does not execute");
      expect(diagnosticPreview.diagnosticRootId).toBe(failedPreview.observationId);
      expect(diagnosticPreview.diagnosticDepth).toBe(1);
    }
    const diagnosticRows = await caller.terminalLab.observations({ limit: 10 });
    const diagnosticRow = diagnosticRows.find((item) => item.id === (diagnosticPreview.ok ? diagnosticPreview.observationId : -1));
    expect(diagnosticRow?.diagnosticParentId).toBe(failedPreview.observationId);
    expect(diagnosticRow?.diagnosticRootId).toBe(failedPreview.observationId);
    expect(diagnosticRow?.diagnosticDepth).toBe(1);
    const diagnosticDetail = await caller.terminalLab.observationDetail({ id: failedPreview.observationId });
    expect(diagnosticDetail.found).toBe(true);
    expect(diagnosticDetail.writesExternal).toBe(false);
    expect(diagnosticDetail.wouldExecute).toBe(false);
    if (diagnosticDetail.found) {
      expect(diagnosticDetail.statusOptions).toContain("reviewing");
      expect(diagnosticDetail.gates.join(" ")).toContain("local Terminal Lab metadata only");
    }
    const reviewedObservation = await caller.terminalLab.updateObservationStatus({
      id: failedPreview.observationId,
      status: "reviewing",
    });
    expect(reviewedObservation.ok).toBe(true);
    expect(reviewedObservation.writesExternal).toBe(false);
    expect(reviewedObservation.wouldExecute).toBe(false);
    expect(reviewedObservation.observation?.status).toBe("reviewing");
    const terminalApproval = await caller.terminalLab.createApprovalPreviewFromObservation({
      observationId: failedPreview.observationId,
      reason: "Preview only; user has not approved running anything.",
    });
    expect(terminalApproval.ok).toBe(true);
    expect(terminalApproval.writesExternal).toBe(false);
    expect(terminalApproval.wouldExecute).toBe(false);
    expect(terminalApproval.approval?.status).toBe("pending");
    expect(terminalApproval.approval?.targetType).toBe("command_observation");
    expect(terminalApproval.approval?.permissionPreflightId).toBeGreaterThan(0);
    const terminalApprovals = await caller.terminalLab.approvalPreviews({
      observationId: failedPreview.observationId,
      limit: 5,
    });
    expect(terminalApprovals.map((item) => item.id)).toContain(terminalApproval.approval?.id);
    expect(terminalApprovals.find((item) => item.id === terminalApproval.approval?.id)?.permissionPreflightId).toBe(terminalApproval.approval?.permissionPreflightId);

    const approvalQueue = await caller.approvals.list({
      origin: "terminal",
      query: "missing-file",
      limit: 20,
    });
    expect(approvalQueue.mode).toBe("read_only");
    expect(approvalQueue.writesExternal).toBe(false);
    expect(approvalQueue.wouldApprove).toBe(false);
    expect(approvalQueue.items.map((item) => item.id)).toContain(terminalApproval.approval?.id);
    const queued = approvalQueue.items.find((item) => item.id === terminalApproval.approval?.id);
    expect(queued?.origin).toBe("terminal");
    expect(queued?.projectName).toBe("CereBro");
    expect(queued?.permissionPreflightId).toBe(terminalApproval.approval?.permissionPreflightId);
    expect(queued?.permissionPreflight?.id).toBe(terminalApproval.approval?.permissionPreflightId);
    expect(queued?.permissionPreflight?.actionClass).toBe("command_execution");
    expect(queued?.permissionPreflight?.reasons.join(" ")).toContain("Terminal Lab approval previews");
    expect(queued?.validationPreview.spockNotes.join(" ")).toContain("local approval preview");

    const terminalPreflights = await caller.permissions.preflightRecords({
      actionClass: "command_execution",
      limit: 20,
    });
    expect(terminalPreflights.items.map((item) => item.id)).toContain(terminalApproval.approval?.permissionPreflightId);

    const approvalGroups = await caller.approvals.groups({
      groupBy: "origin",
      origin: "terminal",
      query: "missing-file",
    });
    expect(approvalGroups.mode).toBe("read_only");
    expect(approvalGroups.writesExternal).toBe(false);
    expect(approvalGroups.wouldApprove).toBe(false);
    expect(approvalGroups.groups.map((group) => group.key)).toContain("terminal");
    expect(approvalGroups.gates.join(" ")).toContain("does not approve");

    const rejectedDiagnostic = await caller.terminalLab.previewDiagnosticDraft({
      observationId: failedPreview.observationId,
      command: "rm -rf .",
    });
    expect(rejectedDiagnostic.ok).toBe(false);
    expect(rejectedDiagnostic.wouldExecute).toBe(false);
    expect(rejectedDiagnostic.writesExternal).toBe(false);

    const followUpTask = await caller.terminalLab.createTaskFromObservation({
      observationId: failedPreview.observationId,
    });
    expect(followUpTask.ok).toBe(true);
    expect(followUpTask.wouldExecute).toBe(false);
    expect(followUpTask.writesExternal).toBe(false);
    if (followUpTask.ok) {
      expect(followUpTask.task.title).toContain("Follow up terminal observation:");
      expect(followUpTask.task.agent).toBe("tony");
      expect(followUpTask.observation?.taskId).toBe(followUpTask.task.id);
      expect(followUpTask.observation?.projectId).toBe(followUpTask.task.projectId);
    }

    const learningProposal = await caller.terminalLab.createLearningProposalFromObservation({
      observationId: failedPreview.observationId,
    });
    expect(learningProposal.ok).toBe(true);
    expect(learningProposal.wouldExecute).toBe(false);
    expect(learningProposal.writesExternal).toBe(false);
    expect(learningProposal.proposal?.proposedByAgent).toBe("aang");
    expect(learningProposal.proposal?.source).toBe(`terminal_observation:${failedPreview.observationId}`);

    const proposals = await caller.memory.proposals({ limit: 5 });
    expect(proposals.map((item) => item.id)).toContain(learningProposal.proposal?.id);

    const modulePreview = await caller.terminalLab.previewCommand({
      command: "pnpm test",
      cwd: "/Users/lindsaybell/Desktop/CereBro/app",
    });
    await caller.terminalLab.observeOutput({
      observationId: modulePreview.observationId,
      output: "Error: Cannot find module '@testing-library/react'",
      exitCode: 1,
    });
    const moduleRows = await caller.terminalLab.observations({ limit: 10 });
    const moduleRow = moduleRows.find((item) => item.id === modulePreview.observationId);
    expect(moduleRow?.diagnosticDrafts.map((item) => item.command)).toContain("rg -n \"@testing-library/react\" .");
    expect(moduleRow?.diagnosticDrafts.some((item) => item.command.includes("package.json"))).toBe(true);
    expect(moduleRow?.diagnosticDrafts.find((item) => item.command.includes("@testing-library/react"))?.approvalGate).toContain("No package install");

    const portPreview = await caller.terminalLab.previewCommand({
      command: "pnpm dev",
      cwd: "/Users/lindsaybell/Desktop/CereBro/app",
    });
    await caller.terminalLab.observeOutput({
      observationId: portPreview.observationId,
      output: "Error: Port 3002 is already in use",
      exitCode: 1,
    });
    const portRows = await caller.terminalLab.observations({ limit: 10 });
    const portRow = portRows.find((item) => item.id === portPreview.observationId);
    expect(portRow?.diagnosticDrafts.map((item) => item.command)).toContain("lsof -nP -iTCP:3002 -sTCP:LISTEN");
    expect(portRow?.diagnosticDrafts.find((item) => item.command.includes("3002"))?.expectedSignal).toContain("PID");
  });
});

describe("Project Lab proposal-only actions", () => {
  it("creates local draft plans without creating tasks or editing repos", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: {} as never,
      res: {} as never,
    });

    const db = await getCerebroDb();
    await db.execute({
      sql: `INSERT OR IGNORE INTO projects (name, path) VALUES (?, ?)`,
      args: ["CereBro", "/Users/lindsaybell/Desktop/CereBro"],
    });

    const draft = await caller.projectIntelligence.createActionDraft({
      slug: "cerebro",
      actionKey: "plan_next_slice",
    });
    expect(draft.ok).toBe(true);
    expect(draft.writesExternal).toBe(false);
    expect(draft.editsRepo).toBe(false);
    expect(draft.createsTask).toBe(false);
    if (draft.ok) {
      expect(draft.appendOnly).toBe(true);
      expect(draft.draft.title).toContain("CereBro");
      expect(draft.gates.join(" ")).toContain("does not create a task");
    }

    const draftNote = await caller.projectIntelligence.appendActionDraftNote({
      draftId: draft.ok ? draft.draft.id : -1,
      note: "Local note only. Convert this draft to a task only after explicit approval.",
      authorAgent: "cortana",
    });
    expect(draftNote.ok).toBe(true);
    expect(draftNote.writesExternal).toBe(false);
    expect(draftNote.editsRepo).toBe(false);
    expect(draftNote.createsTask).toBe(false);
    if (draftNote.ok) {
      expect(draftNote.appendOnly).toBe(true);
      expect(draftNote.note.note).toContain("Local note only");
      expect(draftNote.gates.join(" ")).toContain("Created one local append-only");
    }

    const detail = await caller.projectIntelligence.detail({ slug: "cerebro" });
    expect(detail.found).toBe(true);
    if (detail.found) {
      const savedDraft = detail.actionDrafts.find((item) => item.id === (draft.ok ? draft.draft.id : -1));
      expect(savedDraft).toBeTruthy();
      expect(savedDraft?.notes.map((note) => note.id)).toContain(draftNote.ok ? draftNote.note.id : -1);
      expect(detail.gates.join(" ")).toContain("external repo edits are not available");
    }

    const overview = await caller.projectIntelligence.overview();
    expect(overview.summary.actionDrafts).toBeGreaterThan(0);
    expect(overview.projects.find((project) => project.slug === "cerebro")?.activity.actionDrafts.total).toBeGreaterThan(0);
  });

  it("keeps local draft plans visible before a project row exists", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: {} as never,
      res: {} as never,
    });

    const draft = await caller.projectIntelligence.createActionDraft({
      slug: "waymark",
      actionKey: "validation_pass",
    });
    expect(draft.ok).toBe(true);
    expect(draft.writesExternal).toBe(false);
    expect(draft.editsRepo).toBe(false);
    expect(draft.createsTask).toBe(false);
    if (draft.ok) {
      expect(draft.draft.projectId).toBeNull();
      expect(draft.draft.projectSlug).toBe("waymark");
    }

    const draftNote = await caller.projectIntelligence.appendActionDraftNote({
      draftId: draft.ok ? draft.draft.id : -1,
      note: "Keep this visible as a local proposal even before task/project linking.",
      authorAgent: "spock",
    });
    expect(draftNote.ok).toBe(true);
    expect(draftNote.writesExternal).toBe(false);
    expect(draftNote.editsRepo).toBe(false);
    expect(draftNote.createsTask).toBe(false);

    const detail = await caller.projectIntelligence.detail({ slug: "waymark" });
    expect(detail.found).toBe(true);
    if (detail.found) {
      expect(detail.projectId).toBeNull();
      const savedDraft = detail.actionDrafts.find((item) => item.id === (draft.ok ? draft.draft.id : -1));
      expect(savedDraft).toBeTruthy();
      expect(savedDraft?.notes.map((note) => note.id)).toContain(draftNote.ok ? draftNote.note.id : -1);
    }

    const overview = await caller.projectIntelligence.overview();
    const waymark = overview.projects.find((project) => project.slug === "waymark");
    expect(waymark?.tasks.projectId).toBeNull();
    expect(waymark?.activity.actionDrafts.total).toBeGreaterThan(0);
    expect(waymark?.activity.actionDrafts.byActionKey.validation_pass).toBeGreaterThan(0);
  });
});

describe("Model/tool capability registry", () => {
  it("keeps model/tool routing proposal-only until capabilities are verified", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: {} as never,
      res: {} as never,
    });

    const policy = await caller.modelTools.policy();
    expect(policy.mode).toBe("proposal_only");
    expect(policy.writesExternal).toBe(false);
    expect(policy.callsExternalModels).toBe(false);
    expect(policy.installsDependencies).toBe(false);
    expect(policy.browsesOrFetches).toBe(false);
    expect(policy.gatewayCandidates).toContain("LiteLLM");
    expect(policy.evalTasks.map((task) => task.key)).toContain("handoff_prompt_gate");

    const proposal = await caller.modelTools.proposeCapability({
      provider: "Example AI",
      toolName: "Example Vision Free Tier",
      capabilityKind: "vision",
      accessMethod: "web_handoff",
      accountRequired: "unknown",
      freeTier: "Unverified. Surfer must source-check current limits before use.",
      modalities: "image, screenshot, text",
      strengths: "Potential first-pass UI screenshot review.",
      weaknesses: "No local evidence yet. Treat as untrusted until tested.",
      promptStyle: "Provide visible context, privacy summary, and exact question.",
      privacyClass: "limited_external",
      approvalLevel: "explicit_approval",
      sourceUris: "https://example.com/docs",
      riskReview: "Do not send private screenshots until Oak reviews the privacy class.",
    });
    expect(proposal.ok).toBe(true);
    expect(proposal.appendOnly).toBe(true);
    expect(proposal.writesExternal).toBe(false);
    expect(proposal.callsExternalModels).toBe(false);
    expect(proposal.installsDependencies).toBe(false);
    expect(proposal.capability.evalStatus).toBe("untested");
    expect(proposal.gates.join(" ")).toContain("did not call the model/tool");

    const evalNote = await caller.modelTools.recordEval({
      capabilityId: proposal.capability.id,
      evalTaskKey: "visual_annotation_route",
      taskSummary: "Check whether the tool can turn a UI screenshot into a routed annotation note.",
      expectedSignal: "Names the route agent, privacy class, and visible evidence.",
      resultSummary: "Not run. Placeholder eval note for the local registry.",
      status: "recorded",
      evaluatorAgent: "spock",
      privacyNotes: "No screenshot was sent.",
    });
    expect(evalNote.ok).toBe(true);
    expect(evalNote.appendOnly).toBe(true);
    expect(evalNote.writesExternal).toBe(false);
    expect(evalNote.callsExternalModels).toBe(false);

    const capabilities = await caller.modelTools.capabilities({ capabilityKind: "vision", limit: 10 });
    expect(capabilities.mode).toBe("read_only");
    expect(capabilities.writesExternal).toBe(false);
    expect(capabilities.callsExternalModels).toBe(false);
    expect(capabilities.items.map((item) => item.id)).toContain(proposal.capability.id);

    const evals = await caller.modelTools.evals({ capabilityId: proposal.capability.id });
    expect(evals.items.map((item) => item.id)).toContain(evalNote.eval.id);

    const route = await caller.modelTools.routePreview({
      taskKind: "screenshot vision review",
      modality: "image",
      privacyClass: "sensitive_review",
      requiresFrontier: true,
    });
    expect(route.routeStatus).toBe("proposal_only");
    expect(route.approvalGate).toContain("Oak/Spock review");
    expect(route.lanes.map((lane) => lane.lane)).toContain("vision_adapter_candidate");
    expect(route.lanes.map((lane) => lane.lane)).toContain("frontier_reasoning_candidate");
    expect(route.noActionTaken.join(" ")).toContain("No external model or tool was called");
  });
});

describe("Global permission modes", () => {
  it("records mode changes locally without approving hard-gated actions", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: {} as never,
      res: {} as never,
    });

    const policy = await caller.permissions.policy();
    expect(policy.mode).toBe("local_policy_shell");
    expect(policy.appendOnly).toBe(true);
    expect(policy.writesExternal).toBe(false);
    expect(policy.executesCommands).toBe(false);
    expect(policy.opensBrowser).toBe(false);
    expect(policy.capturesMedia).toBe(false);
    expect(policy.callsExternalModels).toBe(false);
    expect(policy.modes.map((mode) => mode.id)).toContain("auto_review");
    expect(policy.hardGates).toContain("tokens and API keys");
    expect(policy.preflightShape.note).toContain("recordPreflight appends local history");
    expect(policy.gates.join(" ")).toContain("Mode changes do not approve hard gates");

    const event = await caller.permissions.setMode({
      mode: "auto_review",
      reason: "Test local permission event.",
      requestedByAgent: "cortana",
    });
    expect(event.ok).toBe(true);
    expect(event.appendOnly).toBe(true);
    expect(event.event.mode).toBe("auto_review");
    expect(event.writesExternal).toBe(false);
    expect(event.executesCommands).toBe(false);
    expect(event.opensBrowser).toBe(false);
    expect(event.capturesMedia).toBe(false);
    expect(event.callsExternalModels).toBe(false);
    expect(event.gates.join(" ")).toContain("did not approve browser");

    const current = await caller.permissions.current();
    expect(current.mode).toBe("auto_review");
    expect(current.appendOnly).toBe(true);
    expect(current.summary).toContain("approved visible/local evidence");

    const history = await caller.permissions.history({ limit: 10 });
    expect(history.mode).toBe("read_only");
    expect(history.appendOnly).toBe(true);
    expect(history.items.map((item) => item.id)).toContain(event.event.id);

    const browserPreflight = await caller.permissions.preflight({
      perceptionClass: "public_browser",
      actionClass: "browser_or_media_capture",
    });
    expect(browserPreflight.advisoryOnly).toBe(true);
    expect(browserPreflight.opensBrowser).toBe(false);
    expect(browserPreflight.capturesMedia).toBe(false);
    expect(browserPreflight.decision).toBe("approval_required");
    expect(browserPreflight.requiredApprovals).toContain("public-browser approval");
    expect(browserPreflight.noActionTaken.join(" ")).toContain("No browser or media tool was opened");

    const sensitiveMemoryPreflight = await caller.permissions.preflight({
      perceptionClass: "workbench_media",
      actionClass: "local_note",
      sensitiveData: true,
      persistsMemory: true,
    });
    expect(sensitiveMemoryPreflight.decision).toBe("blocked_by_hard_gate");
    expect(sensitiveMemoryPreflight.requiredApprovals).toContain("explicit sensitive-memory approval");
    expect(sensitiveMemoryPreflight.callsExternalModels).toBe(false);

    const localNotePreflight = await caller.permissions.preflight({
      perceptionClass: "explicit_context",
      actionClass: "local_note",
    });
    expect(localNotePreflight.decision).toBe("allowed_local");
    expect(localNotePreflight.approvalRequired).toBe(false);

    const recordedPreflight = await caller.permissions.recordPreflight({
      perceptionClass: "workbench_media",
      actionClass: "browser_or_media_capture",
      sensitiveData: true,
      requestedByAgent: "gojo",
      targetSummary: "Local screenshot review request for Workbench evidence.",
    });
    expect(recordedPreflight.ok).toBe(true);
    expect(recordedPreflight.appendOnly).toBe(true);
    expect(recordedPreflight.advisoryOnly).toBe(true);
    expect(recordedPreflight.record.mode).toBe("auto_review");
    expect(recordedPreflight.record.decision).toBe("approval_required");
    expect(recordedPreflight.record.approvalRequired).toBe(true);
    expect(recordedPreflight.record.requiredApprovals).toContain("media capture approval");
    expect(recordedPreflight.record.requestedByAgent).toBe("gojo");
    expect(recordedPreflight.record.targetSummary).toContain("Workbench evidence");
    expect(recordedPreflight.opensBrowser).toBe(false);
    expect(recordedPreflight.capturesMedia).toBe(false);
    expect(recordedPreflight.callsExternalModels).toBe(false);
    expect(recordedPreflight.noActionTaken.join(" ")).toContain("No approval was granted");

    const preflightRecords = await caller.permissions.preflightRecords({
      actionClass: "browser_or_media_capture",
      limit: 10,
    });
    expect(preflightRecords.mode).toBe("read_only");
    expect(preflightRecords.appendOnly).toBe(true);
    expect(preflightRecords.writesExternal).toBe(false);
    expect(preflightRecords.executesCommands).toBe(false);
    expect(preflightRecords.opensBrowser).toBe(false);
    expect(preflightRecords.capturesMedia).toBe(false);
    expect(preflightRecords.callsExternalModels).toBe(false);
    expect(preflightRecords.items.map((item) => item.id)).toContain(recordedPreflight.record.id);
    expect(preflightRecords.summary.approvalRequired).toBeGreaterThan(0);
    expect(preflightRecords.gates.join(" ")).toContain("local append-only audit history");

    const approvalPreflightAudit = await caller.approvals.permissionPreflights({
      actionClass: "browser_or_media_capture",
      query: "Workbench evidence",
      limit: 10,
    });
    expect(approvalPreflightAudit.mode).toBe("read_only");
    expect(approvalPreflightAudit.appendOnly).toBe(true);
    expect(approvalPreflightAudit.writesExternal).toBe(false);
    expect(approvalPreflightAudit.wouldApprove).toBe(false);
    expect(approvalPreflightAudit.executesCommands).toBe(false);
    expect(approvalPreflightAudit.opensBrowser).toBe(false);
    expect(approvalPreflightAudit.capturesMedia).toBe(false);
    expect(approvalPreflightAudit.callsExternalModels).toBe(false);
    expect(approvalPreflightAudit.items.map((item) => item.id)).toContain(recordedPreflight.record.id);
    expect(approvalPreflightAudit.summary.approvalRequired).toBeGreaterThan(0);
    expect(approvalPreflightAudit.gates.join(" ")).toContain("policy evidence");
  });
});
