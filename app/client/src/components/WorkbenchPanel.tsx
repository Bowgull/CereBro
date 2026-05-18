import { useEffect, useMemo, useState } from "react";
import type React from "react";
import { trpc } from "@/lib/trpc";
import { compactCommandLabel, compactPathLabel, sourceDisplayName } from "@/lib/displayLabels";
import { cerebroColors as C, cerebroTheme as T } from "@/lib/keepConfig";
import { disambiguateSessionOptions } from "@/lib/sessionLabels";
import { CompactReadDatum } from "@/components/CompactReadDatum";
import {
  workbenchCurrentBodyCopy,
  workbenchHeaderCopy,
  workbenchProjectReceiptCopy,
  workbenchReceiptBodyCopy,
  workbenchReceiptChainCopy,
  workbenchReceiptDetailCopy,
  workbenchReceiptDetailsCopy,
  workbenchReceiptGroupCopy,
  workbenchReceiptKindLabel,
  workbenchReceiptListCopy,
  workbenchReceiptPreviewBadges,
  workbenchReceiptRowSummary,
  workbenchPermissionLabel,
  workbenchTemporaryPreviewCopy,
} from "@/lib/workbenchCopyModel";
import {
  workbenchBrowserActionPreviewModel,
  workbenchBrowserDraftModel,
  workbenchBrowserReadinessModel,
  workbenchBrowserRunnerContractModel,
  workbenchBrowserShellModel,
  workbenchBrowserTabStateModel,
  workbenchWatchShelfDraftModel,
  workbenchWatchShelfModel,
} from "@/lib/workbenchBrowserModel";
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

type EvidenceKind = "all" | "manual_note" | "image_review" | "video_frame" | "annotation" | "validation_note" | "terminal_output" | "before_after";
type PermissionClass = "manual_note" | "media_review" | "annotation" | "validation";
type ValidatorAgent = "oak" | "spock";
type ValidationNoteStatus = "needs_review" | "looks_consistent" | "blocked" | "validated_for_local_use";
type EvidenceGroupBy = "project" | "task" | "session" | "kind" | "source" | "command" | "artifact" | "validation_status";
type WorkbenchRoute = "projects" | "security" | "ledger";
type SelectOption = { value: string; label: string };
type WorkbenchDraft = {
  source?: string;
  kind?: EvidenceKind;
  routeRecordId?: number;
  title?: string;
  summary?: string;
  targetUri?: string | null;
  projectName?: string | null;
  projectPath?: string | null;
  projectFocus?: {
    projectId?: number | null;
    projectSlug?: string | null;
    projectName?: string | null;
    projectPath?: string | null;
    resolution?: string;
    autosave?: boolean;
  } | null;
  routeAgent?: string | null;
  permissionClass?: PermissionClass;
  projectId?: number | null;
  taskId?: number | null;
  sessionId?: number | null;
  commandObservationId?: number | null;
};
type WorkbenchFilterDraft = {
  source?: string;
  evidenceId?: number;
  kind?: EvidenceKind;
  projectId?: number | null;
  query?: string;
  groupBy?: EvidenceGroupBy;
  notice?: string;
};

const G = T.graphiteCandle;

type TemporaryMediaPreview = {
  name: string;
  type: string;
  size: number;
  kind: "image" | "video";
  url: string;
  durationSec: number | null;
};

export default function WorkbenchPanel({ onClose, onNavigate }: { onClose: () => void; onNavigate?: (route: WorkbenchRoute) => void }) {
  const plan = trpc.workbench.plan.useQuery();
  const projects = trpc.projectIntelligence.overview.useQuery();
  const [receiptLinksOpen, setReceiptLinksOpen] = useState(false);
  const [projectProofOpen, setProjectProofOpen] = useState(false);
  const linkOptions = trpc.workbench.linkOptions.useQuery(undefined, {
    enabled: receiptLinksOpen,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
  const [filterKind, setFilterKind] = useState<EvidenceKind>("all");
  const [filterProjectId, setFilterProjectId] = useState<number | "all">("all");
  const [filterQuery, setFilterQuery] = useState("");
  const [executionLinkedOnly, setExecutionLinkedOnly] = useState(false);
  const [groupBy, setGroupBy] = useState<EvidenceGroupBy>("project");
  const [watchShelfOpen, setWatchShelfOpen] = useState(false);
  const [watchShelfCategory, setWatchShelfCategory] = useState("Watching");
  const [browserAddressDraft, setBrowserAddressDraft] = useState("");
  const [browserActionLabel, setBrowserActionLabel] = useState("Add to Watch");
  const evidence = trpc.workbench.evidence.useQuery({
    limit: 30,
    kind: filterKind === "all" ? undefined : filterKind,
    projectId: filterProjectId === "all" ? undefined : filterProjectId,
    query: filterQuery.trim() || undefined,
    executionLinked: executionLinkedOnly || undefined,
  });
  const evidenceGroups = trpc.workbench.evidenceGroups.useQuery({
    groupBy,
    kind: filterKind === "all" ? undefined : filterKind,
    projectId: filterProjectId === "all" ? undefined : filterProjectId,
    query: filterQuery.trim() || undefined,
    executionLinked: executionLinkedOnly || undefined,
  });
  const projectProofSummary = trpc.workbench.evidenceSummary.useQuery(
    {
      groupBy: "project",
      latestLimit: 1,
    },
    {
      enabled: projectProofOpen,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  );
  const utils = trpc.useUtils();
  const createEvidence = trpc.workbench.createEvidence.useMutation({
    onSuccess: () => {
      utils.workbench.evidence.invalidate();
      utils.workbench.evidenceSummary.invalidate();
    },
  });
  const createValidationNote = trpc.workbench.createValidationNote.useMutation({
    onSuccess: () => {
      utils.workbench.evidence.invalidate();
      utils.workbench.evidenceSummary.invalidate();
      if (selectedEvidenceId != null) utils.workbench.evidenceDetail.invalidate({ id: selectedEvidenceId });
    },
  });
  const createBeforeAfterComparison = trpc.workbench.createBeforeAfterComparison.useMutation({
    onSuccess: () => {
      utils.workbench.evidence.invalidate();
      utils.workbench.evidenceGroups.invalidate();
      utils.workbench.evidenceSummary.invalidate();
      if (selectedEvidenceId != null) utils.workbench.evidenceDetail.invalidate({ id: selectedEvidenceId });
    },
  });
  const createBrowserActionProposal = trpc.workbench.createBrowserActionProposal.useMutation({
    onSuccess: () => {
      utils.workbench.browserActionProposals.invalidate();
    },
  });
  const [browserProposalNotice, setBrowserProposalNotice] = useState<string | null>(null);
  const createBrowserActionApprovalPreview = trpc.workbench.createBrowserActionApprovalPreview.useMutation({
    onSuccess: (result) => {
      setBrowserProposalNotice(
        result.approval
          ? `Browser approval #${result.approval.id} staged. Not run.`
          : "Browser approval preview was not staged.",
      );
    },
  });
  const createBrowserActionWorkbenchBody = trpc.workbench.createBrowserActionWorkbenchBody.useMutation({
    onSuccess: (result) => {
      utils.workbench.evidence.invalidate();
      utils.workbench.evidenceGroups.invalidate();
      utils.workbench.evidenceSummary.invalidate();
      setBrowserProposalNotice(`Workbench body #${result.evidence.id} saved. Not run.`);
    },
  });
  const createBrowserActionSpockGate = trpc.workbench.createBrowserActionSpockGate.useMutation({
    onSuccess: (result) => {
      setBrowserProposalNotice(
        result.review
          ? `Spock receipt #${result.review.id} saved. Not run.`
          : "Spock receipt was not saved.",
      );
    },
  });
  const [selectedBrowserReadinessId, setSelectedBrowserReadinessId] = useState<number | null>(null);
  const browserProposalReadiness = trpc.workbench.browserActionProposalReadiness.useQuery(
    { proposalId: selectedBrowserReadinessId ?? 0 },
    {
      enabled: selectedBrowserReadinessId != null,
      staleTime: 10_000,
      refetchOnWindowFocus: false,
    },
  );
  const [selectedBrowserResultId, setSelectedBrowserResultId] = useState<number | null>(null);
  const browserResultContract = trpc.workbench.browserActionResultRecoveryContract.useQuery(
    { proposalId: selectedBrowserResultId ?? 0 },
    {
      enabled: selectedBrowserResultId != null,
      staleTime: 10_000,
      refetchOnWindowFocus: false,
    },
  );
  const [selectedBrowserProposalId, setSelectedBrowserProposalId] = useState<number | null>(null);
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<number | null>(null);
  const [comparisonPickerOpen, setComparisonPickerOpen] = useState(false);
  const evidenceDetail = trpc.workbench.evidenceDetail.useQuery(
    { id: selectedEvidenceId ?? 0 },
    { enabled: selectedEvidenceId != null },
  );
  const evidencePicker = trpc.workbench.evidencePicker.useQuery(
    { limit: 120, excludeId: selectedEvidenceId ?? undefined },
    {
      enabled: selectedEvidenceId != null && comparisonPickerOpen,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  );
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [targetUri, setTargetUri] = useState("");
  const [kind, setKind] = useState<EvidenceKind>("manual_note");
  const [routeAgent, setRouteAgent] = useState("gojo");
  const [permissionClass, setPermissionClass] = useState<PermissionClass>("manual_note");
  const [viewport, setViewport] = useState("");
  const [coordinates, setCoordinates] = useState("");
  const [annotationText, setAnnotationText] = useState("");
  const [sensitive, setSensitive] = useState(false);
  const [projectId, setProjectId] = useState<number | "none">("none");
  const [taskId, setTaskId] = useState<number | "none">("none");
  const [sessionId, setSessionId] = useState<number | "none">("none");
  const [taskLinkQuery, setTaskLinkQuery] = useState("");
  const [sessionLinkQuery, setSessionLinkQuery] = useState("");
  const [sourceId, setSourceId] = useState<number | "none">("none");
  const [commandObservationId, setCommandObservationId] = useState<number | "none">("none");
  const [artifactId, setArtifactId] = useState<number | "none">("none");
  const [sourceLinkQuery, setSourceLinkQuery] = useState("");
  const [commandLinkQuery, setCommandLinkQuery] = useState("");
  const [artifactLinkQuery, setArtifactLinkQuery] = useState("");
  const [stagedDraftNotice, setStagedDraftNotice] = useState<string | null>(null);
  const [stagedDraftChain, setStagedDraftChain] = useState<WorkbenchDraft | null>(null);
  const [pendingProjectFocusDraft, setPendingProjectFocusDraft] = useState<WorkbenchDraft | null>(null);
  const [temporaryMedia, setTemporaryMedia] = useState<TemporaryMediaPreview | null>(null);
  const [mediaFrameTimeSec, setMediaFrameTimeSec] = useState("");
  const [annotationMarker, setAnnotationMarker] = useState<{ xPct: number; yPct: number } | null>(null);
  const receiptBodyCopy = workbenchReceiptBodyCopy({ hasDraft: Boolean(stagedDraftNotice) });
  const headerCopy = workbenchHeaderCopy({ isLoading: plan.isLoading });
  const currentBodyCopy = workbenchCurrentBodyCopy();
  const receiptDetailsCopy = workbenchReceiptDetailsCopy();
  const temporaryPreviewCopy = workbenchTemporaryPreviewCopy();
  const receiptGroupCopy = workbenchReceiptGroupCopy();
  const receiptListCopy = workbenchReceiptListCopy();
  const browserShell = workbenchBrowserShellModel();
  const browserDraft = workbenchBrowserDraftModel(browserAddressDraft);
  const browserTabState = workbenchBrowserTabStateModel(browserDraft);
  const browserAction =
    browserShell.actions.find((action) => action.label === browserActionLabel) ?? browserShell.actions[0];
  const browserActionPreview = workbenchBrowserActionPreviewModel(browserAction, browserDraft);
  const browserReadiness = workbenchBrowserReadinessModel(browserDraft);
  const browserRunnerContract = workbenchBrowserRunnerContractModel(browserDraft);
  const browserActionProposal = trpc.workbench.browserActionProposalPreview.useQuery(
    {
      actionLabel: browserActionPreview.label,
      target: browserDraft.raw,
      draftKind: browserDraft.kind,
    },
    {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  );
  const browserActionProposals = trpc.workbench.browserActionProposals.useQuery(
    { limit: 3 },
    {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  );
  const watchShelf = workbenchWatchShelfModel();
  const watchShelfDraft = workbenchWatchShelfDraftModel(browserDraft, watchShelfCategory);
  const data = plan.data;
  const evidenceItems = evidence.data?.items ?? [];
  const visibleEvidenceItems = evidenceItems.slice(0, 12);
  const hiddenEvidenceCount = Math.max(0, evidenceItems.length - visibleEvidenceItems.length);
  const projectOptions = useMemo(
    () => (projects.data?.projects ?? []).filter((project) => project.tasks.projectId != null),
    [projects.data?.projects],
  );
  function resolveDraftProjectId(draft: WorkbenchDraft): number | "none" {
    const exactId = draft.projectFocus?.projectId ?? draft.projectId;
    if (exactId != null) return exactId;

    const wantedName = (draft.projectFocus?.projectName ?? draft.projectName ?? "").trim().toLowerCase();
    const wantedPath = (draft.projectFocus?.projectPath ?? draft.projectPath ?? "").trim();
    const matchedProject = projectOptions.find((project) => {
      const projectId = project.tasks.projectId;
      if (projectId == null) return false;
      if (wantedName && project.name.trim().toLowerCase() === wantedName) return true;
      return Boolean(wantedPath && project.localPath === wantedPath);
    });

    return matchedProject?.tasks.projectId ?? "none";
  }
  const taskLinkOptions = useMemo(() => {
    const normalizedQuery = taskLinkQuery.trim().toLowerCase();
    return (linkOptions.data?.tasks ?? [])
      .filter((task) => projectId === "none" || task.projectId === projectId)
      .filter((task) => {
        if (!normalizedQuery) return true;
        const label = `#${task.id} ${task.projectName ?? "unlinked"} ${task.status} ${task.title}`;
        return label.toLowerCase().includes(normalizedQuery);
      })
      .map((task) => ({
        value: String(task.id),
        label: `#${task.id} ${task.projectName ?? "unlinked"} ${task.status} ${task.title}`,
      }));
  }, [linkOptions.data?.tasks, projectId, taskLinkQuery]);
  const sessionLinkOptions = useMemo(() => {
    const normalizedQuery = sessionLinkQuery.trim().toLowerCase();
    return disambiguateSessionOptions(linkOptions.data?.sessions ?? [])
      .filter((session) => projectId === "none" || session.projectId === projectId)
      .filter((session) => {
        if (!normalizedQuery) return true;
        return session.optionLabel.toLowerCase().includes(normalizedQuery);
      })
      .map((session) => ({
        value: String(session.id),
        label: session.optionLabel,
      }));
  }, [linkOptions.data?.sessions, projectId, sessionLinkQuery]);
  const sourceLinkOptions = useMemo(() => {
    const normalizedQuery = sourceLinkQuery.trim().toLowerCase();
    return (linkOptions.data?.sources ?? [])
      .filter((source) => {
        if (!normalizedQuery) return true;
        const label = `#${source.id} ${source.projectName ?? "unlinked"} ${source.trustLevel}/${source.freshnessStatus} ${
          source.title ?? sourceDisplayName(source.uri)
        }`;
        return label.toLowerCase().includes(normalizedQuery);
      })
      .map((source) => ({
        value: String(source.id),
        label: `#${source.id} ${source.projectName ?? "unlinked"} ${source.trustLevel}/${source.freshnessStatus} ${
          source.title ?? sourceDisplayName(source.uri)
        }`,
      }));
  }, [linkOptions.data?.sources, sourceLinkQuery]);
  const commandLinkOptions = useMemo(() => {
    const normalizedQuery = commandLinkQuery.trim().toLowerCase();
    return (linkOptions.data?.commandObservations ?? [])
      .filter((command) => {
        if (!normalizedQuery) return true;
        const label = `#${command.id} ${command.status}/${command.risk} ${command.projectName ?? "unlinked"} ${command.command.slice(0, 80)}`;
        return label.toLowerCase().includes(normalizedQuery);
      })
      .map((command) => ({
        value: String(command.id),
        label: `#${command.id} ${command.status}/${command.risk} ${command.projectName ?? "unlinked"} ${command.command.slice(0, 80)}`,
      }));
  }, [commandLinkQuery, linkOptions.data?.commandObservations]);
  const artifactLinkOptions = useMemo(() => {
    const normalizedQuery = artifactLinkQuery.trim().toLowerCase();
    return (linkOptions.data?.artifacts ?? [])
      .filter((artifact) => projectId === "none" || artifact.projectId === projectId)
      .filter((artifact) => {
        if (!normalizedQuery) return true;
        const label = `#${artifact.id} ${artifact.lifecycleState} ${artifact.projectName ?? "unlinked"} ${artifact.title ?? artifact.storagePath}`;
        return label.toLowerCase().includes(normalizedQuery);
      })
      .map((artifact) => ({
        value: String(artifact.id),
        label: `#${artifact.id} ${artifact.lifecycleState} ${artifact.projectName ?? "unlinked"} ${artifact.title ?? artifact.storagePath}`,
      }));
  }, [artifactLinkQuery, linkOptions.data?.artifacts, projectId]);
  const projectProofGroups = useMemo(() => {
    const projectNames = new Map(
      projectOptions.map((project) => [project.tasks.projectId, project.name] as const),
    );
    return (projectProofSummary.data?.groups ?? [])
      .map((group) => {
        const projectId = group.key === "unlinked" ? null : Number(group.key);
        return {
          key: group.key,
          projectId,
          label: group.label || projectNames.get(projectId) || "Unlinked receipt",
          total: group.count,
          terminal: group.terminal,
          review: group.needsReview,
          validated: group.validated,
          latestAt: group.latestAt,
        };
      })
      .slice(0, 6);
  }, [projectOptions, projectProofSummary.data?.groups]);
  const projectReceiptCopy = workbenchProjectReceiptCopy({
    open: projectProofOpen,
    total: projectProofSummary.data?.summary.total ?? 0,
  });
  const workbenchLanes = [
    {
      label: "Browser",
      meta: "Manual page context",
      kind: "manual_note" as EvidenceKind,
      agent: "surfer",
      permission: "manual_note" as PermissionClass,
      tone: C.success,
    },
    {
      label: "Preview",
      meta: "Screens, images, browser views",
      kind: "image_review" as EvidenceKind,
      agent: "gojo",
      permission: "media_review" as PermissionClass,
      tone: C.accent,
    },
    {
      label: "Terminal",
      meta: "Command output and logs",
      kind: "terminal_output" as EvidenceKind,
      agent: "tony",
      permission: "manual_note" as PermissionClass,
      tone: C.warning,
    },
    {
      label: "Validate",
      meta: "Oak or Spock notes",
      kind: "validation_note" as EvidenceKind,
      agent: "spock",
      permission: "validation" as PermissionClass,
      tone: C.accentViolet,
    },
    {
      label: "Compare",
      meta: "Before and after receipt comparison",
      kind: "before_after" as EvidenceKind,
      agent: "gojo",
      permission: "validation" as PermissionClass,
      tone: C.gold,
    },
  ];

  function stageLane(lane: (typeof workbenchLanes)[number]) {
    setKind(lane.kind);
    setRouteAgent(lane.agent);
    setPermissionClass(lane.permission);
    setTitle((current) => current.trim() || `${lane.label} receipt`);
    setSummary((current) => current.trim() || `${lane.meta}. Add the concrete observation, source, and receipt before saving.`);
  }

  useEffect(() => {
    const url = temporaryMedia?.url;
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [temporaryMedia?.url]);

  useEffect(() => {
    let raw: string | null = null;
    try {
      raw = window.sessionStorage.getItem("cerebro:workbench-draft");
      if (raw) window.sessionStorage.removeItem("cerebro:workbench-draft");
    } catch {
      return;
    }
    if (!raw) return;
    try {
      const draft = JSON.parse(raw) as WorkbenchDraft;
      if (draft.kind && draft.kind !== "all") setKind(draft.kind);
      if (draft.title) setTitle(draft.title);
      if (draft.summary) setSummary(draft.summary);
      setTargetUri(draft.targetUri ?? "");
      setRouteAgent(draft.routeAgent ?? "tony");
      setPermissionClass(draft.permissionClass ?? "manual_note");
      const draftProjectId = resolveDraftProjectId(draft);
      setProjectId(draftProjectId);
      setPendingProjectFocusDraft(draftProjectId === "none" ? draft : null);
      setTaskId(draft.taskId == null ? "none" : draft.taskId);
      setSessionId(draft.sessionId == null ? "none" : draft.sessionId);
      setCommandObservationId(draft.commandObservationId == null ? "none" : draft.commandObservationId);
      setFilterKind(draft.kind === "terminal_output" ? "terminal_output" : "all");
      setGroupBy(draft.commandObservationId == null ? "project" : "command");
      setStagedDraftChain(draft);
      setStagedDraftNotice(
        draft.source === "terminal_lab"
          ? "Terminal Lab staged a Workbench receipt draft. Review it, then save a local receipt."
          : draft.source === "runtime_route_record" && draft.routeRecordId != null
            ? `Route #${draft.routeRecordId} staged a Workbench receipt draft. Target stays runtime_route:${draft.routeRecordId}.`
            : "Workbench receipt draft staged. Review it, then save a local receipt.",
      );
    } catch {
      setStagedDraftNotice("Workbench draft could not be read. Add the receipt manually.");
    }
  }, [projectOptions]);

  useEffect(() => {
    if (!pendingProjectFocusDraft) return;
    const draftProjectId = resolveDraftProjectId(pendingProjectFocusDraft);
    if (draftProjectId === "none") return;
    setProjectId(draftProjectId);
    setPendingProjectFocusDraft(null);
  }, [pendingProjectFocusDraft, projectOptions]);

  useEffect(() => {
    let raw: string | null = null;
    try {
      raw = window.sessionStorage.getItem("cerebro:workbench-filter");
      if (raw) window.sessionStorage.removeItem("cerebro:workbench-filter");
    } catch {
      return;
    }
    if (!raw) return;
    try {
      const draft = JSON.parse(raw) as WorkbenchFilterDraft;
      if (draft.kind && draft.kind !== "all") setFilterKind(draft.kind);
      if (draft.projectId != null) setFilterProjectId(draft.projectId);
      if (typeof draft.evidenceId === "number") setSelectedEvidenceId(draft.evidenceId);
      if (draft.query) setFilterQuery(draft.query);
      if (draft.groupBy) setGroupBy(draft.groupBy);
      setStagedDraftNotice(draft.notice ?? "Workbench receipt filter staged.");
    } catch {
      setStagedDraftNotice("Workbench filter could not be read. Use receipt search.");
    }
  }, []);

  function clearTemporaryMedia() {
    if (temporaryMedia) URL.revokeObjectURL(temporaryMedia.url);
    setTemporaryMedia(null);
    setMediaFrameTimeSec("");
    setAnnotationMarker(null);
  }

  function stageTemporaryMedia(file: File | null) {
    if (!file) return;
    const mediaKind: TemporaryMediaPreview["kind"] | null =
      file.type.startsWith("image/") ? "image" : file.type.startsWith("video/") ? "video" : null;
    if (!mediaKind) return;
    clearTemporaryMedia();
    const preview = {
      name: file.name,
      type: file.type || "image/unknown",
      size: file.size,
      kind: mediaKind,
      url: URL.createObjectURL(file),
      durationSec: null,
    };
    setTemporaryMedia(preview);
    setKind(mediaKind === "video" ? "video_frame" : "image_review");
    setPermissionClass("media_review");
    setRouteAgent("gojo");
    setTargetUri(`temporary-${mediaKind}:${file.name}`);
    setTitle((current) => current.trim() || `${mediaKind === "video" ? "Video frame" : "Image"} review: ${file.name}`);
    setSummary((current) => current.trim() || [
      `Temporary local ${mediaKind} selected: ${file.name}.`,
      `Type: ${preview.type}.`,
      `Size: ${formatBytes(preview.size)}.`,
      mediaKind === "video" ? "Use the frame-time field to record the frame being reviewed." : "Image review records visible notes only.",
      "The media bytes are only previewed in this browser session. Saving a receipt stores metadata and notes only.",
    ].join("\n"));
  }

  function markTemporaryMedia(event: React.PointerEvent<HTMLDivElement>) {
    if (!temporaryMedia) return;
    const rect = event.currentTarget.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const xPct = clamp(((event.clientX - rect.left) / rect.width) * 100, 0, 100);
    const yPct = clamp(((event.clientY - rect.top) / rect.height) * 100, 0, 100);
    const video = event.currentTarget.querySelector("video");
    const frameTime = temporaryMedia.kind === "video" && video && Number.isFinite(video.currentTime)
      ? video.currentTime
      : null;
    const framePart = frameTime == null ? "" : ` frameSec=${frameTime.toFixed(2)}`;
    const nextCoordinates = [
      `xPct=${xPct.toFixed(2)}`,
      `yPct=${yPct.toFixed(2)}`,
      `target=temporary-${temporaryMedia.kind}:${temporaryMedia.name}`,
      framePart.trim(),
    ].filter(Boolean).join(" ");
    setAnnotationMarker({ xPct, yPct });
    setCoordinates(nextCoordinates);
    setKind("annotation");
    setPermissionClass("annotation");
    setRouteAgent("gojo");
    if (frameTime != null) setMediaFrameTimeSec(frameTime.toFixed(2));
    setAnnotationText((current) => current.trim() || `Review point at ${xPct.toFixed(2)}%, ${yPct.toFixed(2)}%.`);
    setSummary((current) => {
      if (current.trim()) return current;
      return [
        `Temporary ${temporaryMedia.kind} annotation for ${temporaryMedia.name}.`,
        `Coordinates: ${nextCoordinates}.`,
        "Media bytes remain browser-local. Saving records metadata and notes only.",
      ].join("\n");
    });
  }

  function submitEvidence() {
    const cleanTitle = title.trim();
    const cleanSummary = summary.trim();
    if (!cleanTitle || !cleanSummary || createEvidence.isPending) return;
    createEvidence.mutate(
      {
        kind: kind === "all" ? "manual_note" : kind,
        title: cleanTitle,
        summary: cleanSummary,
        targetUri: targetUri.trim() || null,
        projectId: projectId === "none" ? null : projectId,
        taskId: taskId === "none" ? null : taskId,
        sessionId: sessionId === "none" ? null : sessionId,
        sourceId: sourceId === "none" ? null : sourceId,
        commandObservationId: commandObservationId === "none" ? null : commandObservationId,
        artifactId: artifactId === "none" ? null : artifactId,
        ownerAgent: "cortana",
        routeAgent: routeAgent.trim() || null,
        viewport: viewport.trim() || null,
        coordinates: coordinates.trim() || null,
        annotationText: annotationText.trim() || null,
        mediaName: temporaryMedia?.name ?? null,
        mediaMimeType: temporaryMedia?.type ?? null,
        mediaByteSize: temporaryMedia?.size ?? null,
        mediaKind: temporaryMedia?.kind === "video" ? "video_frame" : temporaryMedia?.kind ?? null,
        mediaFrameTimeSec: mediaFrameTimeSec.trim() && Number.isFinite(Number(mediaFrameTimeSec)) ? Number(mediaFrameTimeSec) : null,
        mediaDurationSec: temporaryMedia?.durationSec ?? null,
        mediaTemporary: Boolean(temporaryMedia),
        permissionClass,
        sensitive,
      },
      {
        onSuccess: () => {
          setTitle("");
          setSummary("");
          setTargetUri("");
          setViewport("");
          setCoordinates("");
          setAnnotationText("");
          setSensitive(false);
          setTaskId("none");
          setSessionId("none");
          setSourceId("none");
          setCommandObservationId("none");
          setArtifactId("none");
          setAnnotationMarker(null);
          clearTemporaryMedia();
        },
      },
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden" style={{ background: G.slabMuted, border: `1px solid ${G.line}`, color: C.textPrimary }}>
      <header className="shrink-0 px-3 py-2" style={{ borderBottom: `1px solid ${G.line}`, background: G.slab }}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-[13px] font-bold uppercase tracking-widest">Workbench</h2>
            <p className="text-[11px] mt-0.5" style={{ color: C.textMuted }}>
              {headerCopy.subtitle}
            </p>
          </div>
          <Button
            type="button"
            onClick={onClose}
            aria-label="Close workbench"
            variant="outline"
            size="sm"
          >
            Close
          </Button>
        </div>
        <div role="status" aria-live="polite" className="mt-2 text-[11px]" style={{ color: C.textMuted }}>
          {headerCopy.statusText}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-3" aria-label="Workbench plan" aria-busy={plan.isLoading}>
        {!data ? (
          <div className="rounded p-4 text-sm" style={{ background: G.slab, border: `1px solid ${G.lineSoft}`, color: C.textMuted }}>
            Loading workbench plan.
          </div>
        ) : (
          <div className="grid gap-2">
            <section className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 xl:grid-cols-[0.95fr_repeat(4,1fr)]" aria-label="Workbench receipt lanes">
              <div className="rounded p-2 sm:col-span-2 xl:col-span-1" style={{ background: G.slab, border: `1px solid ${G.lineSoft}` }}>
                <div className="flex items-center justify-between gap-2">
                  <div className="text-[10px] uppercase tracking-widest" style={{ color: C.textMuted }}>
                    {currentBodyCopy.label}
                  </div>
                  <Chip label={currentBodyCopy.badge} tone={C.warning} />
                </div>
                <div className="text-sm font-semibold mt-1" style={{ color: C.textPrimary }}>
                  {currentBodyCopy.title}
                </div>
                <p className="text-[11px] leading-snug mt-1" style={{ color: C.textMuted }}>
                  {currentBodyCopy.text}
                </p>
              </div>

              {workbenchLanes.map((lane) => (
                <Button
                  key={lane.label}
                  type="button"
                  onClick={() => stageLane(lane)}
                  aria-label={`Stage ${lane.label} receipt`}
                  className="h-auto justify-start rounded p-2 text-left"
                  variant="secondary"
                  style={{
                    background: kind === lane.kind ? G.slabRaised : G.slab,
                    border: `1px solid ${kind === lane.kind ? lane.tone : G.lineSoft}`,
                    color: C.textSecondary,
                  }}
                >
                  <span className="block w-full">
                    <span className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: lane.tone }}>
                        {lane.label}
                      </span>
                      <span className="text-[10px] uppercase tracking-wider" style={{ color: C.textMuted }}>
                        {lane.agent}
                      </span>
                    </span>
                    <span className="block text-[11px] leading-snug mt-1" style={{ color: C.textMuted }}>
                      {lane.meta}
                    </span>
                  </span>
                </Button>
              ))}
            </section>

            <WorkbenchReceiptChainStrip
              draft={stagedDraftChain}
              selectedEvidenceId={selectedEvidenceId}
              selectedEvidence={evidenceDetail.data?.found ? evidenceDetail.data.evidence : null}
              projectLabel={
                projectId !== "none"
                  ? projectOptions.find((project) => project.tasks.projectId === projectId)?.name ?? "linked project"
                : null
              }
            />
            {stagedDraftNotice && (
              <div
                className="rounded p-1.5 text-[11px] leading-snug"
                role="status"
                style={{ background: G.slab, border: `1px solid ${G.candleSoft}`, color: C.textSecondary }}
              >
                <span className="font-semibold uppercase tracking-wider" style={{ color: C.gold }}>Focus</span> {stagedDraftNotice}
              </div>
            )}

            <section className="rounded p-2" aria-label="Manual browser shell" style={{ background: G.slab, border: `1px solid ${G.lineSoft}` }}>
              <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="text-[11px] font-bold uppercase tracking-widest">{browserShell.title}</h3>
                  <p className="text-[11px] mt-0.5" style={{ color: C.textMuted }}>
                    User-controlled page context. First pass shell only.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-1">
                  <Chip label={browserShell.status} tone={C.success} />
                  <Chip label={browserShell.safetyLabel} tone={C.accent} />
                </div>
              </div>

              <div className="grid gap-1.5">
                <div className="flex items-center gap-1.5 rounded p-1.5" style={{ background: G.slabMuted, border: `1px solid ${G.lineSoft}` }}>
                  <Button type="button" size="sm" variant="ghost" className="h-7 w-7 px-0" disabled aria-label="Browser back planned">‹</Button>
                  <Button type="button" size="sm" variant="ghost" className="h-7 w-7 px-0" disabled aria-label="Browser forward planned">›</Button>
                  <Button type="button" size="sm" variant="ghost" className="h-7 w-7 px-0" disabled aria-label="Browser reload planned">↻</Button>
                  <Input
                    value={browserAddressDraft}
                    onChange={(event) => setBrowserAddressDraft(event.target.value)}
                    placeholder={browserShell.addressPlaceholder}
                    aria-label="Browser address and search field"
                    className="h-7 flex-1"
                    title="Stages a local page draft only. It does not open, fetch, search, save, or capture."
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-7 px-2"
                    disabled={browserDraft.kind === "empty"}
                    title="Open is blocked until the manual browser runner contract exists."
                    aria-label="Stage browser page draft"
                  >
                    Stage
                  </Button>
                  <Button type="button" size="sm" variant="ghost" className="h-7 w-7 px-0" disabled aria-label="Browser quiet shield">◇</Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={watchShelfOpen ? "secondary" : "outline"}
                    className="h-7 px-2"
                    onClick={() => setWatchShelfOpen((open) => !open)}
                    aria-expanded={watchShelfOpen}
                    aria-controls="workbench-watch-shelf"
                  >
                    Watch Shelf
                  </Button>
                  <details className="relative">
                    <summary
                      className="flex h-7 w-7 cursor-pointer list-none items-center justify-center rounded text-[13px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                      aria-label="Browser page actions"
                      style={{ border: `1px solid ${G.lineSoft}`, color: C.textSecondary, ["--tw-ring-color" as string]: C.accent }}
                    >
                      ⋯
                    </summary>
                    <div className="absolute right-0 z-20 mt-1 w-56 rounded p-1.5" role="menu" style={{ background: G.slabRaised, border: `1px solid ${G.lineSoft}`, boxShadow: `0 16px 36px ${C.background}cc` }}>
                      <div className="px-1.5 pb-1 text-[10px] font-bold uppercase tracking-widest" style={{ color: C.textMuted }}>Page Actions</div>
                      {browserShell.actions.map((action) => (
                        <Button
                          key={action.label}
                          type="button"
                          variant={browserActionPreview.label === action.label ? "secondary" : "ghost"}
                          size="sm"
                          className="h-auto w-full justify-start px-1.5 py-1.5 text-left"
                          title={action.plannedReason}
                          role="menuitem"
                          onClick={() => setBrowserActionLabel(action.label)}
                        >
                          <span className="block">
                            <span className="block text-[11px] font-semibold">{action.label}</span>
                            <span className="block text-[10px] font-normal" style={{ color: C.textMuted }}>{action.plannedReason}</span>
                          </span>
                        </Button>
                      ))}
                      <div className="mt-1 rounded p-1.5 text-[10px] leading-snug" style={{ background: G.slab, border: `1px solid ${G.lineSoft}`, color: C.textMuted }}>
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold uppercase tracking-wider" style={{ color: C.textPrimary }}>
                            {browserActionPreview.label}
                          </span>
                          <Chip label={browserActionPreview.statusLabel} tone={browserActionPreview.statusLabel === "no page" ? C.textMuted : C.warning} />
                        </div>
                        <div className="mt-1 break-all">{browserActionPreview.targetLabel}</div>
                        <div className="mt-1">{browserActionPreview.routeLabel}</div>
                        <div className="mt-1">{browserActionPreview.noActionText}</div>
                        <div className="mt-1 rounded px-1.5 py-1" style={{ background: G.slabMuted, border: `1px solid ${G.lineSoft}` }}>
                          <div className="flex flex-wrap items-center gap-1">
                            <Chip label="server contract" tone={C.accent} />
                            <Chip
                              label={browserActionProposal.data?.statusLabel ?? "reading"}
                              tone={browserActionProposal.data?.canExecute ? C.danger : C.warning}
                            />
                            <Chip label={browserActionProposal.data?.resultState ?? "not run"} tone={C.textMuted} />
                          </div>
                          <div className="mt-1">
                            {browserActionProposal.data?.requiredGates.join(" / ") ?? "Reading backend proposal gates."}
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-1">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="h-6 px-2 text-[10px]"
                              disabled={createBrowserActionProposal.isPending}
                              title="Create a durable local Browser action proposal. This does not approve or run it."
                              onClick={() => {
                                createBrowserActionProposal.mutate(
                                  {
                                    actionLabel: browserActionPreview.label,
                                    target: browserDraft.raw,
                                    draftKind: browserDraft.kind,
                                  },
                                  {
                                    onSuccess: (result) => {
                                      setBrowserProposalNotice(`Browser proposal #${result.proposal.id} saved. Not run.`);
                                    },
                                  },
                                );
                              }}
                            >
                              Stage Proposal
                            </Button>
                            {browserProposalNotice && (
                              <span className="text-[10px]" style={{ color: C.textMuted }}>
                                {browserProposalNotice}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </details>
                </div>

                <div className="grid gap-1.5 rounded p-2 md:grid-cols-[minmax(0,1fr)_auto]" aria-label="Browser runner readiness" style={{ background: G.slabMuted, border: `1px solid ${G.lineSoft}` }}>
                  <div>
                    <div className="flex flex-wrap items-center gap-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: C.textPrimary }}>
                        Runner Readiness
                      </span>
                      <Chip label={browserReadiness.statusLabel} tone={C.warning} />
                      <Chip label={browserReadiness.pageStateLabel} tone={browserReadiness.pageStateLabel === "no page" ? C.textMuted : C.accent} />
                      <Chip label={browserRunnerContract.statusLabel} tone={C.warning} />
                    </div>
                    <div className="mt-1 text-[10px] leading-snug" style={{ color: C.textMuted }}>
                      {browserReadiness.noActionText}
                    </div>
                    <div className="mt-1 grid gap-1 text-[10px] leading-snug md:grid-cols-2" style={{ color: C.textMuted }}>
                      <div className="rounded px-1.5 py-1" style={{ background: G.slab, border: `1px solid ${G.lineSoft}` }}>
                        <span className="font-semibold" style={{ color: C.textPrimary }}>Runner Contract</span>
                        <div className="mt-0.5 break-all">{browserRunnerContract.targetLabel}</div>
                        <div className="mt-0.5">{browserRunnerContract.noActionText}</div>
                      </div>
                      <div className="rounded px-1.5 py-1" style={{ background: G.slab, border: `1px solid ${G.lineSoft}` }}>
                        <span className="font-semibold" style={{ color: C.textPrimary }}>Manual Allowance</span>
                        <div className="mt-0.5">{browserRunnerContract.allowedManualActions[0]}</div>
                        <div className="mt-0.5">{browserRunnerContract.blockedActions.slice(0, 3).join(" ")}</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-start gap-1 md:justify-end" aria-label="Browser runner gates">
                    {browserRunnerContract.requiredReceipts.map((gate) => (
                      <Chip key={gate} label={gate} tone={C.textMuted} />
                    ))}
                  </div>
                </div>

                <div className="grid gap-1.5 rounded p-2" aria-label="Recent Browser proposals" style={{ background: G.slabMuted, border: `1px solid ${G.lineSoft}` }}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: C.textPrimary }}>
                      Recent Proposals
                    </span>
                    <div className="flex flex-wrap items-center gap-1">
                      <Chip label="local only" tone={C.accent} />
                      <Chip label="blocked" tone={C.warning} />
                    </div>
                  </div>
                  {browserActionProposals.isLoading ? (
                    <div className="text-[10px]" style={{ color: C.textMuted }}>
                      Reading local Browser proposals.
                    </div>
                  ) : browserActionProposals.data?.items.length ? (
                    <div className="grid gap-1">
                      {browserActionProposals.data.items.map((proposal) => (
                        <div
                          key={proposal.id}
                          className="grid gap-1 rounded px-1.5 py-1 md:grid-cols-[minmax(0,1fr)_auto]"
                          style={{ background: G.slab, border: `1px solid ${G.lineSoft}` }}
                        >
                          <div className="min-w-0">
                            <div className="truncate text-[11px] font-semibold" style={{ color: C.textPrimary }}>
                              #{proposal.id} {proposal.actionLabel}
                            </div>
                            <div className="truncate text-[10px]" style={{ color: C.textMuted }}>
                              {proposal.target}
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-1 md:justify-end">
                            <Chip label={proposal.statusLabel} tone={proposal.canExecute ? C.danger : C.warning} />
                            <Chip label={proposal.resultState} tone={C.textMuted} />
                            <Button
                              type="button"
                              size="sm"
                              variant={selectedBrowserProposalId === proposal.id ? "secondary" : "outline"}
                              className="h-6 px-2 text-[10px]"
                              title="Open Browser proposal receipt actions and reads."
                              onClick={() => {
                                setSelectedBrowserProposalId((current) => current === proposal.id ? null : proposal.id);
                              }}
                            >
                              Details
                            </Button>
                          </div>
                          {selectedBrowserProposalId === proposal.id && (
                            <div className="md:col-span-2">
                              <div className="grid gap-1 rounded p-1.5 md:grid-cols-[minmax(0,1fr)_auto]" aria-label="Browser proposal details" style={{ background: G.slabMuted, border: `1px solid ${G.lineSoft}` }}>
                                <div className="min-w-0 text-[10px] leading-snug" style={{ color: C.textMuted }}>
                                  <span className="font-semibold" style={{ color: C.textPrimary }}>Proposal #{proposal.id}</span>
                                  {" "}is local only. Stage receipts or read contracts here. Nothing runs from this detail panel.
                                </div>
                                <div className="flex flex-wrap items-center gap-1 md:justify-end">
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    className="h-6 px-2 text-[10px]"
                                    disabled={createBrowserActionApprovalPreview.isPending}
                                    title="Stage a local approval preview for this Browser proposal. This does not approve or run it."
                                    onClick={() => {
                                      createBrowserActionApprovalPreview.mutate({
                                        proposalId: proposal.id,
                                        reason: "Local Browser action approval preview only. This does not approve or run browser work.",
                                      });
                                    }}
                                  >
                                    Stage Approval
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    className="h-6 px-2 text-[10px]"
                                    disabled={createBrowserActionWorkbenchBody.isPending}
                                    title="Save a local Workbench body for this Browser proposal. This does not approve or run it."
                                    onClick={() => {
                                      createBrowserActionWorkbenchBody.mutate({
                                        proposalId: proposal.id,
                                      });
                                    }}
                                  >
                                    Stage Body
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    className="h-6 px-2 text-[10px]"
                                    disabled={createBrowserActionSpockGate.isPending}
                                    title="Save a local Spock security receipt for this Browser proposal. This does not approve or run it."
                                    onClick={() => {
                                      createBrowserActionSpockGate.mutate({
                                        proposalId: proposal.id,
                                      });
                                    }}
                                  >
                                    Stage Spock
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant={selectedBrowserReadinessId === proposal.id ? "secondary" : "outline"}
                                    className="h-6 px-2 text-[10px]"
                                    title="Read Browser proposal gate readiness. This does not approve or run it."
                                    onClick={() => setSelectedBrowserReadinessId(proposal.id)}
                                  >
                                    Read Gates
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant={selectedBrowserResultId === proposal.id ? "secondary" : "outline"}
                                    className="h-6 px-2 text-[10px]"
                                    title="Read the Browser result and recovery contract. This does not approve or run it."
                                    onClick={() => setSelectedBrowserResultId(proposal.id)}
                                  >
                                    Read Result
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-[10px]" style={{ color: C.textMuted }}>
                      No Browser proposals saved.
                    </div>
                  )}
                  <div className="text-[10px]" style={{ color: C.textMuted }}>
                    No saved Browser proposal runs from this list.
                  </div>
                  {browserProposalNotice && (
                    <div className="text-[10px]" style={{ color: C.textMuted }}>
                      {browserProposalNotice}
                    </div>
                  )}
                  {selectedBrowserReadinessId != null && (
                    <div className="rounded p-2 text-[10px] leading-snug" aria-label="Browser proposal gate readiness" style={{ background: G.slab, border: `1px solid ${G.lineSoft}`, color: C.textMuted }}>
                      {browserProposalReadiness.isLoading ? (
                        <div>Reading Browser proposal gates.</div>
                      ) : browserProposalReadiness.data ? (
                        <div className="grid gap-1.5">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="font-bold uppercase tracking-widest" style={{ color: C.textPrimary }}>
                              Gate Read #{browserProposalReadiness.data.proposal.id}
                            </span>
                            <div className="flex flex-wrap items-center gap-1">
                              <Chip label={`${browserProposalReadiness.data.summary.readyCount} ready`} tone={C.accent} />
                              <Chip label={`${browserProposalReadiness.data.summary.missingCount} missing`} tone={C.warning} />
                              <Chip label={browserProposalReadiness.data.canExecute ? "can execute" : "blocked"} tone={browserProposalReadiness.data.canExecute ? C.danger : C.warning} />
                            </div>
                          </div>
                          <div className="grid gap-1 md:grid-cols-2">
                            {browserProposalReadiness.data.gates.map((gate) => (
                              <div key={gate.key} className="rounded px-1.5 py-1" style={{ background: G.slabMuted, border: `1px solid ${G.lineSoft}` }}>
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-semibold" style={{ color: C.textPrimary }}>{gate.label}</span>
                                  <Chip label={gate.present ? "ready" : "missing"} tone={gate.present ? C.accent : C.warning} />
                                </div>
                                <div className="mt-0.5">{gate.detail}</div>
                              </div>
                            ))}
                          </div>
                          <div>
                            Next missing gate: {browserProposalReadiness.data.summary.nextMissingGate ?? "none"}.
                          </div>
                        </div>
                      ) : (
                        <div>No gate read available.</div>
                      )}
                    </div>
                  )}
                  {selectedBrowserResultId != null && (
                    <div className="rounded p-2 text-[10px] leading-snug" aria-label="Browser result recovery contract" style={{ background: G.slab, border: `1px solid ${G.lineSoft}`, color: C.textMuted }}>
                      {browserResultContract.isLoading ? (
                        <div>Reading Browser result contract.</div>
                      ) : browserResultContract.data ? (
                        <div className="grid gap-1.5">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="font-bold uppercase tracking-widest" style={{ color: C.textPrimary }}>
                              Result Contract #{browserResultContract.data.proposal.id}
                            </span>
                            <div className="flex flex-wrap items-center gap-1">
                              <Chip label={browserResultContract.data.resultContract.resultState} tone={C.textMuted} />
                              <Chip label={browserResultContract.data.canExecute ? "can execute" : "blocked"} tone={browserResultContract.data.canExecute ? C.danger : C.warning} />
                              <Chip label={browserResultContract.data.recoveryContract.status} tone={C.warning} />
                            </div>
                          </div>
                          <div className="grid gap-1 md:grid-cols-2">
                            <div className="rounded px-1.5 py-1" style={{ background: G.slabMuted, border: `1px solid ${G.lineSoft}` }}>
                              <div className="font-semibold" style={{ color: C.textPrimary }}>{browserResultContract.data.resultContract.receiptTitle}</div>
                              <div className="mt-0.5">
                                Required fields: {browserResultContract.data.resultContract.requiredFields.slice(0, 4).join(", ")}.
                              </div>
                            </div>
                            <div className="rounded px-1.5 py-1" style={{ background: G.slabMuted, border: `1px solid ${G.lineSoft}` }}>
                              <div className="font-semibold" style={{ color: C.textPrimary }}>Recovery Note</div>
                              <div className="mt-0.5">{browserResultContract.data.recoveryContract.note}</div>
                            </div>
                          </div>
                          <div>
                            {browserResultContract.data.gates[0]}
                          </div>
                        </div>
                      ) : (
                        <div>No result contract available.</div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1 overflow-x-auto rounded p-1" aria-label="Browser page tabs" style={{ background: G.slabMuted, border: `1px solid ${G.lineSoft}` }}>
                  {browserTabState.visibleTabs.map((tab) => (
                    <Button
                      key={tab.label}
                      type="button"
                      size="sm"
                      variant={tab.active ? "secondary" : "outline"}
                      disabled={!tab.active}
                      className="h-7 shrink-0 px-2"
                      aria-pressed={tab.active}
                      title={tab.state === "draft" ? "Draft only. No page opened." : tab.state === "planned" ? "Planned until tab state storage exists." : "Active local page frame."}
                    >
                      {tab.label}
                    </Button>
                  ))}
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled={!browserTabState.canCreateTab}
                    className="h-7 w-7 shrink-0 px-0"
                    aria-label="New browser tab planned"
                    title="New tab is blocked until tab storage and runner contracts exist."
                  >
                    +
                  </Button>
                  <div className="ml-auto hidden min-w-[180px] text-[10px] leading-snug md:block" style={{ color: C.textMuted }}>
                    {browserTabState.tabSummary}
                  </div>
                </div>

                {watchShelfOpen && (
                  <div id="workbench-watch-shelf" className="rounded p-2" aria-label="Watch Shelf drawer" style={{ background: G.slabMuted, border: `1px solid ${G.candleSoft}` }}>
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: C.gold }}>{watchShelf.title}</div>
                        <div className="mt-0.5 text-[11px]" style={{ color: C.textMuted }}>Drawer. Not a browser tab.</div>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={!watchShelfDraft.canSave}
                        title="Requires a real open page before it can save."
                      >
                        {watchShelfDraft.saveLabel}
                      </Button>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {watchShelf.categories.map((category) => (
                        <Button
                          key={category}
                          type="button"
                          size="sm"
                          variant={watchShelfDraft.selectedCategory === category ? "secondary" : "outline"}
                          className="h-7 px-2"
                          onClick={() => setWatchShelfCategory(category)}
                          aria-pressed={watchShelfDraft.selectedCategory === category}
                        >
                          {category}
                        </Button>
                      ))}
                    </div>
                    <div className="mt-2 rounded p-2 text-[11px] leading-snug" style={{ background: G.slab, border: `1px solid ${G.lineSoft}` }}>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="font-semibold uppercase tracking-wider" style={{ color: C.textPrimary }}>
                          {watchShelfDraft.candidateLabel}
                        </div>
                        <Chip label={watchShelfDraft.selectedCategory} tone={watchShelfDraft.selectedCategory === "Anime" ? C.warning : C.accent} />
                      </div>
                      <div className="mt-1 break-all" style={{ color: C.textMuted }}>{watchShelfDraft.candidateTarget}</div>
                      <div className="mt-1" style={{ color: C.textMuted }}>
                        {browserDraft.kind === "empty" ? watchShelf.emptyBody : "This is only a local shelf readback. It cannot save until a real page is open."}
                      </div>
                    </div>
                    <div className="mt-2 text-[11px] leading-snug" style={{ color: C.textMuted }}>
                      {watchShelfDraft.noActionText}
                    </div>
                  </div>
                )}

                <div className="rounded p-3 text-center" aria-label="Browser first-run page" style={{ background: C.background, border: `1px solid ${G.lineSoft}` }}>
                  <div className="text-[12px] font-semibold uppercase tracking-widest" style={{ color: C.textPrimary }}>
                    {browserDraft.kind === "empty" ? browserShell.emptyTitle : browserDraft.tabLabel}
                  </div>
                  <div className="mx-auto mt-1 max-w-lg text-[11px] leading-snug" style={{ color: C.textMuted }}>
                    {browserDraft.kind === "empty" ? browserShell.emptyBody : browserDraft.displayTarget}
                  </div>
                  <div className="mt-2 flex justify-center gap-1">
                    <Chip label={browserDraft.kind === "empty" ? "no draft" : browserDraft.kind} tone={browserDraft.kind === "empty" ? C.textMuted : C.accent} />
                    <Chip label={browserDraft.canOpen ? "can open" : "open blocked"} tone={browserDraft.canOpen ? C.success : C.warning} />
                  </div>
                  <div className="mx-auto mt-2 max-w-xl text-[11px] leading-snug" style={{ color: C.textMuted }}>
                    {browserDraft.kind === "empty" ? browserShell.noActionText : browserDraft.noActionText}
                  </div>
                  <div className="mx-auto mt-1 max-w-xl text-[10px] leading-snug" style={{ color: C.textMuted }}>
                    {browserTabState.noActionText}
                  </div>
                </div>
              </div>
            </section>

            <details
              className="rounded p-2"
              aria-label="Project receipt grouping"
              onToggle={(event) => setProjectProofOpen(event.currentTarget.open)}
              style={{ background: G.slab, border: `1px solid ${G.lineSoft}` }}
            >
              <summary className="cursor-pointer list-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black" style={{ ["--tw-ring-color" as string]: C.accent }}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-[11px] font-bold uppercase tracking-widest">{projectReceiptCopy.title}</h3>
                    <p className="text-[11px] mt-0.5" style={{ color: C.textMuted }}>
                      {projectReceiptCopy.subtitle}
                    </p>
                  </div>
                  <Chip
                    label={projectReceiptCopy.badge}
                    tone={C.accent}
                  />
                </div>
              </summary>
              <div className="mt-2">
              <div className="mb-2 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-[11px] font-bold uppercase tracking-widest">{projectReceiptCopy.readTitle}</h3>
                  <p className="text-[11px] mt-0.5" style={{ color: C.textMuted }}>
                    {projectReceiptCopy.readSubtitle}
                  </p>
                </div>
                <Chip label={projectReceiptCopy.openBadge} tone={C.accent} />
              </div>
              {projectProofSummary.isLoading ? (
                <div className="rounded px-2 py-2 text-[11px]" style={{ background: G.slabMuted, border: `1px solid ${G.lineSoft}`, color: C.textMuted }}>
                  {projectReceiptCopy.loadingText}
                </div>
              ) : projectProofGroups.length === 0 ? (
                <div className="rounded px-2 py-2 text-[11px] leading-snug" style={{ background: G.slabMuted, border: `1px solid ${G.lineSoft}`, color: C.textMuted }}>
                  {projectReceiptCopy.emptyText}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-1.5 md:grid-cols-2 xl:grid-cols-3">
                  {projectProofGroups.map((group) => (
                    <Button
                      key={group.key}
                      type="button"
                      variant="secondary"
                      className="h-auto justify-start rounded p-2 text-left"
                      onClick={() => {
                        setFilterProjectId(group.projectId == null ? "all" : group.projectId);
                        setFilterKind("all");
                        setFilterQuery("");
                        setGroupBy("project");
                      }}
                      aria-label={`Open Workbench receipts for ${group.label}`}
                      style={{ background: G.slabMuted, border: `1px solid ${G.lineSoft}` }}
                    >
                      <span className="block w-full">
                        <span className="flex items-start justify-between gap-2">
                          <span className="text-[12px] font-semibold leading-snug" style={{ color: C.textPrimary }}>
                            {group.label}
                          </span>
                          <Chip label={`${group.total}`} tone={C.textMuted} />
                        </span>
                        <span className="mt-1 flex flex-wrap gap-1">
                          <Chip label={`${group.total} receipts`} tone={C.accent} />
                          <Chip label={`${group.terminal} terminal`} tone={C.warning} />
                          <Chip label={`${group.review} review`} tone={group.review > 0 ? C.danger : C.textMuted} />
                          <Chip label={`${group.validated} validated`} tone={group.validated > 0 ? C.success : C.textMuted} />
                        </span>
                        <span className="mt-1 block truncate text-[11px]" style={{ color: C.textMuted }} title={new Date(group.latestAt * 1000).toLocaleString()}>
                          Latest receipt group read.
                        </span>
                      </span>
                    </Button>
                  ))}
                </div>
              )}
              </div>
            </details>

            <section className="rounded p-2" aria-label="Create local Workbench receipt" style={{ background: G.slab, border: `1px solid ${G.lineSoft}` }}>
              <div className="mb-2 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-[11px] font-bold uppercase tracking-widest">{receiptBodyCopy.title}</h3>
                  <p className="text-[11px] mt-0.5" style={{ color: C.textMuted }}>
                    {receiptBodyCopy.subtitle}
                  </p>
                </div>
                <Chip label={receiptBodyCopy.badge} tone={C.success} />
              </div>
              {stagedDraftNotice && (
                <div className="mb-2 rounded p-1.5 text-[11px] leading-snug" style={{ background: G.slabMuted, border: `1px solid ${G.candleSoft}`, color: C.textSecondary }}>
                  <span className="font-semibold uppercase tracking-wider" style={{ color: C.gold }}>{receiptBodyCopy.draftPrefix}</span> {stagedDraftNotice}
                </div>
              )}

              <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 xl:grid-cols-4">
                <AppSelect
                  label="Receipt kind"
                  value={kind}
                  onChange={(value) => {
                    const nextKind = value as EvidenceKind;
                    setKind(nextKind);
                    if (nextKind === "image_review" || nextKind === "video_frame") setPermissionClass("media_review");
                    if (nextKind === "annotation") setPermissionClass("annotation");
                    if (nextKind === "validation_note") setPermissionClass("validation");
                  }}
                  options={[
                    { value: "manual_note", label: "Manual note" },
                    { value: "image_review", label: "Image review note" },
                    { value: "video_frame", label: "Video frame note" },
                    { value: "annotation", label: "Annotation note" },
                    { value: "validation_note", label: "Validation note" },
                    { value: "terminal_output", label: "Terminal output note" },
                    { value: "before_after", label: "Before/after note" },
                  ]}
                />
                <Input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Receipt title."
                  aria-label="Receipt title"
                  className="xl:col-span-3"
                />
                <Textarea
                  value={summary}
                  onChange={(event) => setSummary(event.target.value)}
                  placeholder="What is visible, what matters, and which agent should care."
                  aria-label="Receipt summary"
                  className="sm:col-span-2 xl:col-span-4"
                />
              </div>

              <div className="mt-2 grid gap-1.5">
                <details
                  className="rounded p-2"
                  onToggle={(event) => setReceiptLinksOpen(event.currentTarget.open)}
                  style={{ background: G.slabMuted, border: `1px solid ${G.lineSoft}` }}
                >
                  <summary className="cursor-pointer text-[10px] font-bold uppercase tracking-widest" style={{ color: C.textPrimary }}>
                    Receipt Links
                  </summary>
                  <div className="mt-2 rounded px-2 py-1.5 text-[11px]" style={{ background: G.slab, border: `1px solid ${G.lineSoft}`, color: C.textMuted }}>
                    {linkOptions.isLoading ? "Reading local link options." : "Link options read only when this drawer is open."}
                  </div>
                  <div className="mt-2 grid grid-cols-1 gap-1.5 sm:grid-cols-2 xl:grid-cols-3">
                    <AppSelect
                      label="Project link"
                      value={String(projectId)}
                      onChange={(value) => setProjectId(value === "none" ? "none" : Number(value))}
                      options={[
                        { value: "none", label: "No project" },
                        ...projectOptions.map((project) => ({
                          value: String(project.tasks.projectId ?? ""),
                          label: project.name,
                        })),
                      ]}
                    />
                    <LinkSelect
                      label="Task link"
                      searchLabel="Find Workbench task link"
                      searchPlaceholder="Find task."
                      searchValue={taskLinkQuery}
                      onSearchChange={setTaskLinkQuery}
                      value={String(taskId)}
                      onChange={(value) => setTaskId(value === "none" ? "none" : Number(value))}
                      options={[
                        { value: "none", label: "No task link" },
                        ...taskLinkOptions,
                      ]}
                      emptyLabel={taskLinkQuery.trim() ? "No matching task" : "No task link"}
                    />
                    <LinkSelect
                      label="Session link"
                      searchLabel="Find Workbench session link"
                      searchPlaceholder="Find run."
                      searchValue={sessionLinkQuery}
                      onSearchChange={setSessionLinkQuery}
                      value={String(sessionId)}
                      onChange={(value) => setSessionId(value === "none" ? "none" : Number(value))}
                      options={[
                        { value: "none", label: "No session link" },
                        ...sessionLinkOptions,
                      ]}
                      emptyLabel={sessionLinkQuery.trim() ? "No matching run" : "No session link"}
                    />
                    <LinkSelect
                      label="Source link"
                      searchLabel="Find Workbench source link"
                      searchPlaceholder="Find source."
                      searchValue={sourceLinkQuery}
                      onSearchChange={setSourceLinkQuery}
                      value={String(sourceId)}
                      onChange={(value) => setSourceId(value === "none" ? "none" : Number(value))}
                      options={[
                        { value: "none", label: "No source link" },
                        ...sourceLinkOptions,
                      ]}
                      emptyLabel={sourceLinkQuery.trim() ? "No matching source" : "No source link"}
                    />
                    <LinkSelect
                      label="Command link"
                      searchLabel="Find Workbench command link"
                      searchPlaceholder="Find command."
                      searchValue={commandLinkQuery}
                      onSearchChange={setCommandLinkQuery}
                      value={String(commandObservationId)}
                      onChange={(value) => setCommandObservationId(value === "none" ? "none" : Number(value))}
                      options={[
                        { value: "none", label: "No command link" },
                        ...commandLinkOptions,
                      ]}
                      emptyLabel={commandLinkQuery.trim() ? "No matching command" : "No command link"}
                    />
                    <LinkSelect
                      label="Artifact link"
                      searchLabel="Find Workbench artifact link"
                      searchPlaceholder="Find artifact."
                      searchValue={artifactLinkQuery}
                      onSearchChange={setArtifactLinkQuery}
                      value={String(artifactId)}
                      onChange={(value) => setArtifactId(value === "none" ? "none" : Number(value))}
                      options={[
                        { value: "none", label: "No artifact link" },
                        ...artifactLinkOptions,
                      ]}
                      emptyLabel={artifactLinkQuery.trim() ? "No matching artifact" : "No artifact link"}
                    />
                  </div>
                </details>

                <details className="rounded p-2" style={{ background: G.slabMuted, border: `1px solid ${G.lineSoft}` }}>
                  <summary className="cursor-pointer text-[10px] font-bold uppercase tracking-widest" style={{ color: C.textPrimary }}>
                    {receiptDetailsCopy.title}
                  </summary>
                  <div className="mt-2 grid grid-cols-1 gap-1.5 sm:grid-cols-2 xl:grid-cols-4">
                    <AppSelect
                      label={receiptDetailsCopy.routeLabel}
                      value={routeAgent}
                      onChange={setRouteAgent}
                      options={[
                        { value: "gojo", label: "Gojo" },
                        { value: "surfer", label: "Surfer" },
                        { value: "tony", label: "Tony" },
                        { value: "oak", label: "Professor Oak" },
                        { value: "spock", label: "Spock" },
                        { value: "aang", label: "Aang" },
                        { value: "cortana", label: "Cortana" },
                      ]}
                    />
                    <AppSelect
                      label={receiptDetailsCopy.permissionLabel}
                      value={permissionClass}
                      onChange={(value) => setPermissionClass(value as PermissionClass)}
                      options={[
                        { value: "manual_note", label: "Manual note" },
                        { value: "media_review", label: "Media review" },
                        { value: "annotation", label: "Annotation" },
                        { value: "validation", label: "Validation" },
                      ]}
                    />
                    <Input
                      value={viewport}
                      onChange={(event) => setViewport(event.target.value)}
                      placeholder={receiptDetailsCopy.viewportPlaceholder}
                      aria-label="Receipt viewport"
                    />
                    <Input
                      value={coordinates}
                      onChange={(event) => setCoordinates(event.target.value)}
                      placeholder={receiptDetailsCopy.coordinatesPlaceholder}
                      aria-label="Receipt coordinates"
                    />
                    <Input
                      value={targetUri}
                      onChange={(event) => setTargetUri(event.target.value)}
                      placeholder={receiptDetailsCopy.targetPlaceholder}
                      aria-label="Receipt target"
                      className="sm:col-span-2"
                    />
                    <Input
                      value={annotationText}
                      onChange={(event) => setAnnotationText(event.target.value)}
                      placeholder={receiptDetailsCopy.notePlaceholder}
                      aria-label="Receipt annotation text"
                      className="sm:col-span-2"
                    />
                    <label className="flex items-center gap-2 text-xs" style={{ color: C.textMuted }}>
                      <Checkbox
                        checked={sensitive}
                        onCheckedChange={(checked) => setSensitive(checked === true)}
                        aria-label="Mark receipt as sensitive"
                      />
                      {receiptDetailsCopy.sensitiveLabel}
                    </label>
                  </div>
                </details>
              </div>

              <details
                className="mt-2 rounded p-2"
                aria-label={temporaryPreviewCopy.ariaLabel}
                style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}
              >
                <summary className="cursor-pointer text-[10px] font-bold uppercase tracking-widest" style={{ color: C.textPrimary }}>
                  {temporaryPreviewCopy.title}
                </summary>
                <div
                  className="mt-2 rounded p-2"
                  onDragOver={(event) => {
                    event.preventDefault();
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    stageTemporaryMedia(event.dataTransfer.files.item(0));
                  }}
                  style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-[11px] leading-snug" style={{ color: C.textMuted }}>
                      {temporaryPreviewCopy.statusText}
                    </p>
                    <label
                      className="inline-flex cursor-pointer items-center rounded px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider"
                      style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}`, color: C.textSecondary }}
                    >
                      {temporaryPreviewCopy.chooseButton}
                      <Input
                        type="file"
                        accept="image/*,video/*"
                        className="sr-only"
                        aria-label={temporaryPreviewCopy.chooseAria}
                        onChange={(event) => {
                          stageTemporaryMedia(event.target.files?.item(0) ?? null);
                          event.currentTarget.value = "";
                        }}
                      />
                    </label>
                  </div>
                  {temporaryMedia ? (
                    <div className="mt-2 grid gap-2 md:grid-cols-[180px_minmax(0,1fr)]">
                      <div
                        className="relative overflow-hidden rounded"
                        role="button"
                        tabIndex={0}
                        aria-label={temporaryPreviewCopy.markAria}
                        onPointerDown={markTemporaryMedia}
                        onKeyDown={(event) => {
                          if (event.key !== "Enter" && event.key !== " ") return;
                          const rect = event.currentTarget.getBoundingClientRect();
                          const fakeEvent = {
                            ...event,
                            clientX: rect.left + rect.width / 2,
                            clientY: rect.top + rect.height / 2,
                            currentTarget: event.currentTarget,
                          } as unknown as React.PointerEvent<HTMLDivElement>;
                          markTemporaryMedia(fakeEvent);
                        }}
                        style={{ border: `1px solid ${C.borderSoft}`, background: C.background, cursor: "crosshair" }}
                      >
                        {temporaryMedia.kind === "image" ? (
                          <img
                            src={temporaryMedia.url}
                            alt=""
                            className="block h-40 w-full object-contain"
                          />
                        ) : (
                          <video
                            src={temporaryMedia.url}
                            controls
                            preload="metadata"
                            className="block h-40 w-full object-contain"
                            onLoadedMetadata={(event) => {
                              const duration = event.currentTarget.duration;
                              setTemporaryMedia((current) => current ? {
                                ...current,
                                durationSec: Number.isFinite(duration) ? duration : null,
                              } : current);
                            }}
                          />
                        )}
                        {annotationMarker && (
                          <div
                            aria-hidden="true"
                            className="pointer-events-none absolute h-4 w-4 rounded-full"
                            style={{
                              left: `${annotationMarker.xPct}%`,
                              top: `${annotationMarker.yPct}%`,
                              transform: "translate(-50%, -50%)",
                              border: `2px solid ${C.warning}`,
                              boxShadow: `0 0 0 2px ${C.background}, 0 0 12px ${C.warning}`,
                            }}
                          />
                        )}
                      </div>
                      <div className="grid content-start gap-2">
                        <div className="flex flex-wrap gap-1">
                          <Chip label={temporaryMedia.kind} tone={C.accent} />
                          <Chip label={temporaryMedia.type} tone={C.accent} />
                          <Chip label={formatBytes(temporaryMedia.size)} tone={C.textMuted} />
                          {temporaryMedia.durationSec != null && <Chip label={`${formatSeconds(temporaryMedia.durationSec)} duration`} tone={C.textMuted} />}
                          <Chip label="temporary" tone={C.warning} />
                        </div>
                        <div className="text-[11px] leading-snug break-words" style={{ color: C.textSecondary }}>
                          {temporaryMedia.name}
                        </div>
                        {temporaryMedia.kind === "video" && (
                          <Input
                            value={mediaFrameTimeSec}
                            onChange={(event) => setMediaFrameTimeSec(event.target.value)}
                            inputMode="decimal"
                            placeholder="Frame time in seconds."
                            aria-label="Video frame time in seconds"
                          />
                        )}
                        <div className="text-[11px] leading-snug" style={{ color: C.textMuted }}>
                          {temporaryPreviewCopy.selectedText}
                        </div>
                        <Button
                          type="button"
                          onClick={clearTemporaryMedia}
                          aria-label="Clear temporary Workbench media"
                          variant="ghost"
                          size="sm"
                          className="w-fit"
                        >
                          {temporaryPreviewCopy.clearButton}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2 rounded px-2 py-2 text-[11px] leading-snug" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}`, color: C.textMuted }}>
                      {temporaryPreviewCopy.emptyText}
                    </div>
                  )}
                </div>
              </details>
              <div className="mt-2 flex items-center justify-between gap-2">
                <div role="status" aria-live="polite" className="flex-1 text-[11px]" style={{ color: C.textMuted }}>
                  {createEvidence.data?.ok ? `Saved receipt #${createEvidence.data.evidence.id}. No external action.` : "Receipts append. They do not replace earlier notes."}
                </div>
                <Button
                  type="button"
                  onClick={submitEvidence}
                  disabled={!title.trim() || !summary.trim() || createEvidence.isPending}
                  title={!title.trim() || !summary.trim() ? "Add a title and summary before saving a local receipt." : "Save a local receipt. No capture or external action runs."}
                  aria-label="Save local Workbench receipt"
                >
                  {createEvidence.isPending ? "Saving" : "Save Local Receipt"}
                </Button>
              </div>
            </section>

            <details className="rounded p-2" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
              <summary className="cursor-pointer text-[11px] font-bold uppercase tracking-widest" style={{ color: C.textPrimary }}>
                Workbench Rules
              </summary>
              <div className="mt-2 grid gap-2">
                <section className="rounded p-2" aria-label="Workbench plan summary" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}>
                  <div className="flex flex-wrap gap-1 mb-2">
                    <Chip label={data.mode.replace(/_/g, " ")} tone={C.warning} />
                    <Chip label={data.opensBrowser ? "browser opens" : "no browser"} tone={C.success} />
                    <Chip label={data.capturesMedia ? "media capture" : "no media capture"} tone={C.success} />
                    <Chip label={data.writesExternal ? "external writes" : "no external writes"} tone={C.success} />
                  </div>
                  <p className="text-[11px] leading-snug" style={{ color: C.textSecondary }}>
                    {data.summary}
                  </p>
                </section>

                <section className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 xl:grid-cols-4" aria-label="Workbench surfaces">
                  {data.surfaces.map((surface) => (
                    <article key={surface.id} className="rounded p-2" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}>
                      <div className="flex items-start justify-between gap-1.5">
                        <h3 className="text-[11px] font-bold uppercase tracking-widest leading-snug" style={{ color: C.textPrimary }}>{surface.label}</h3>
                        <Chip label={surface.status.replace(/_/g, " ")} tone={surface.status === "partially_live" ? C.accent : C.textMuted} />
                      </div>
                      <div className="mt-1 text-[10px] uppercase tracking-wider" style={{ color: C.gold }}>
                        {surface.ownerAgent}
                      </div>
                      <p className="mt-1 text-[11px] leading-snug" style={{ color: C.textMuted }}>
                        {surface.permission}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {surface.records.slice(0, 5).map((record) => (
                          <Chip key={record} label={record.replace(/_/g, " ")} tone={C.textMuted} />
                        ))}
                      </div>
                    </article>
                  ))}
                </section>

                <section className="grid grid-cols-1 gap-1.5 sm:grid-cols-2" aria-label="Workbench permissions">
                  {data.permissionModel.map((item) => (
                    <article key={item.class} className="rounded p-2" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}>
                      <h3 className="text-[11px] font-bold uppercase tracking-widest mb-1.5" style={{ color: C.textPrimary }}>
                        {item.class.replace(/_/g, " ")}
                      </h3>
                      <List title="Allowed" tone={C.success} items={item.allowed} />
                      <List title="Blocked" tone={C.danger} items={item.blocked} />
                    </article>
                  ))}
                </section>

                <section className="rounded p-2" aria-label="Workbench receipt shape" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}>
                  <h3 className="text-[11px] font-bold uppercase tracking-widest mb-2">Receipt Shape</h3>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {data.evidenceRecordShape.required.map((field) => (
                      <Chip key={field} label={field.replace(/_/g, " ")} tone={C.accent} />
                    ))}
                  </div>
                  <p className="text-[11px] leading-snug" style={{ color: C.textMuted }}>
                    {data.evidenceRecordShape.note}
                  </p>
                </section>

                <section className="grid gap-1.5" aria-label="Workbench gates">
                  {data.gates.map((gate) => (
                    <div key={gate} className="rounded px-2 py-1.5 text-[11px]" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}`, color: C.textMuted }}>
                      {gate}
                    </div>
                  ))}
                </section>
              </div>
            </details>

            <section className="rounded p-2" aria-label="Recent Workbench receipts" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
              <div className="mb-2 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-[11px] font-bold uppercase tracking-widest">Recent Receipts</h3>
                  <p className="text-[11px] mt-0.5" style={{ color: C.textMuted }}>
                    Filter and inspect local receipts.
                  </p>
                </div>
                <Chip label={`${evidence.data?.summary.total ?? 0} shown`} tone={C.textMuted} />
              </div>
              <div className="mb-2 grid grid-cols-1 gap-1.5 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_160px_180px_auto_auto]">
                <Input
                  value={filterQuery}
                  onChange={(event) => setFilterQuery(event.target.value)}
                  placeholder="Search receipts."
                  aria-label="Search Workbench receipts"
                  className="sm:col-span-2 xl:col-span-1"
                />
                <AppSelect
                  label="Filter kind"
                  value={filterKind}
                  onChange={(value) => setFilterKind(value as EvidenceKind)}
                  options={[
                    { value: "all", label: "All kinds" },
                    { value: "manual_note", label: "Manual note" },
                    { value: "image_review", label: "Image review" },
                    { value: "video_frame", label: "Video frame" },
                    { value: "annotation", label: "Annotation" },
                    { value: "validation_note", label: "Validation" },
                    { value: "terminal_output", label: "Terminal" },
                    { value: "before_after", label: "Before/after" },
                  ]}
                />
                <AppSelect
                  label="Filter project"
                  value={String(filterProjectId)}
                  onChange={(value) => setFilterProjectId(value === "all" ? "all" : Number(value))}
                  options={[
                    { value: "all", label: "All projects" },
                    ...projectOptions.map((project) => ({
                      value: String(project.tasks.projectId ?? ""),
                      label: project.name,
                    })),
                  ]}
                />
                <Button
                  type="button"
                  onClick={() => setExecutionLinkedOnly((value) => !value)}
                  aria-pressed={executionLinkedOnly}
                  aria-label={executionLinkedOnly ? "Show all Workbench receipts" : "Show only execution-linked Workbench receipts"}
                  title="Filter to receipt bodies linked to local execution results. No command runs."
                  variant={executionLinkedOnly ? "default" : "secondary"}
                  size="sm"
                >
                  Execution Linked
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setFilterQuery("");
                    setFilterKind("all");
                    setFilterProjectId("all");
                    setExecutionLinkedOnly(false);
                  }}
                  aria-label="Reset Workbench receipt filters"
                  title="Clear receipt filters. This does not delete or change receipts."
                  variant="secondary"
                  size="sm"
                >
                  Reset
                </Button>
              </div>
              <details className="mb-2 rounded p-2" aria-label="Workbench receipt groups" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}>
                <summary className="cursor-pointer list-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black" style={{ ["--tw-ring-color" as string]: C.accent }}>
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-widest" style={{ color: C.textPrimary }}>
                        {receiptGroupCopy.title}
                      </h4>
                      <p className="text-[11px] mt-0.5" style={{ color: C.textMuted }}>
                        {receiptGroupCopy.subtitle}
                      </p>
                    </div>
                    <Chip label={`${evidenceGroups.data?.groups.length ?? 0} groups`} tone={C.textMuted} />
                  </div>
                </summary>
                <div className="mt-2">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div className="rounded px-2 py-1.5 text-[11px]" style={{ background: C.surface, border: `1px solid ${C.borderSoft}`, color: C.textMuted }}>
                    {receiptGroupCopy.gateText}
                  </div>
                  <AppSelect
                    label={receiptGroupCopy.controlLabel}
                    value={groupBy}
                    onChange={(value) => setGroupBy(value as EvidenceGroupBy)}
                    options={[
                      { value: "project", label: "Project" },
                      { value: "task", label: "Task" },
                      { value: "session", label: "Session" },
                      { value: "kind", label: "Kind" },
                      { value: "source", label: "Source" },
                      { value: "command", label: "Command" },
                      { value: "artifact", label: "Artifact" },
                      { value: "validation_status", label: "Validation status" },
                    ]}
                  />
                </div>
                {(evidenceGroups.data?.gates ?? []).map((gate) => (
                  <div key={gate} className="mb-2 rounded px-2 py-1.5 text-xs" style={{ background: C.surface, border: `1px solid ${C.borderSoft}`, color: C.textMuted }}>
                    {gate}
                  </div>
                ))}
                {(evidenceGroups.data?.groups ?? []).length === 0 ? (
                  <div className="rounded px-2 py-2 text-[11px]" style={{ background: C.surface, border: `1px solid ${C.borderSoft}`, color: C.textMuted }}>
                    {receiptGroupCopy.emptyText}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 xl:grid-cols-3">
                    {evidenceGroups.data?.groups.map((group) => (
                      <Button
                        key={group.key}
                        type="button"
                        onClick={() => {
                          if (groupBy === "project") setFilterProjectId(group.key === "unlinked" ? "all" : Number(group.key));
                          if (groupBy === "kind") setFilterKind(group.key as EvidenceKind);
                          if (
                            groupBy === "task" ||
                            groupBy === "session" ||
                            groupBy === "validation_status" ||
                            groupBy === "source" ||
                            groupBy === "command" ||
                            groupBy === "artifact"
                          ) {
                            setFilterQuery(group.key === "unlinked" ? "" : group.label);
                          }
                        }}
                        aria-label={`Filter Workbench receipts by ${group.label}`}
                        title={`Filter local Workbench receipts by ${group.label}. No source fetch or command runs.`}
                        className="h-auto justify-start rounded p-1.5 text-left"
                        variant="secondary"
                      >
                        <span className="block">
                          <span className="block text-[11px] font-semibold leading-snug break-words">
                            {group.label}
                          </span>
                          <span className="mt-1 flex flex-wrap gap-1">
                            <Chip label={`${group.count} receipts`} tone={C.accent} />
                            <Chip label={`${group.validationNotes} validations`} tone={C.warning} />
                            {group.sensitive > 0 && <Chip label={`${group.sensitive} sensitive`} tone={C.danger} />}
                          </span>
                          <span className="mt-1 block text-[11px]" style={{ color: C.textMuted }}>
                            {receiptGroupCopy.itemHint}
                          </span>
                        </span>
                      </Button>
                    ))}
                  </div>
                )}
                </div>
              </details>
              {(evidence.data?.gates ?? []).length > 0 && (
                <details className="mb-2 rounded p-2" aria-label="Workbench receipt read gates" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}>
                  <summary className="cursor-pointer text-[10px] font-bold uppercase tracking-widest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black" style={{ color: C.textPrimary, ["--tw-ring-color" as string]: C.accent }}>
                    {receiptListCopy.readRulesTitle}
                  </summary>
                  <div className="mt-2 grid gap-1.5">
                    {(evidence.data?.gates ?? []).map((gate) => (
                      <div key={gate} className="rounded px-3 py-2 text-xs" style={{ background: C.surface, border: `1px solid ${C.borderSoft}`, color: C.textMuted }}>
                        {gate}
                      </div>
                    ))}
                  </div>
                </details>
              )}
              {(evidence.data?.items ?? []).length === 0 ? (
                <div className="rounded px-3 py-3 text-xs leading-snug" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}`, color: C.textMuted }}>
                  No Workbench receipts yet. Pick a lane above, name the observation, then save a local receipt.
                </div>
              ) : (
                <div className="grid gap-2 lg:grid-cols-[minmax(0,1fr)_360px]">
                  <div className="grid gap-1.5">
                    {visibleEvidenceItems.map((item) => (
                      <Button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedEvidenceId(item.id)}
                        aria-label={`Inspect Workbench receipt ${item.id}`}
                        title={`Open receipt #${item.id} body in Workbench. No external action runs.`}
                        className="h-auto justify-start rounded p-2 text-left"
                        variant="secondary"
                        style={{
                          background: selectedEvidenceId === item.id ? C.surfaceRaised : C.surfaceMuted,
                          border: `1px solid ${selectedEvidenceId === item.id ? C.accent : C.borderSoft}`,
                        }}
                      >
                        <span className="block w-full">
                          <span className="flex flex-wrap items-center gap-1">
                            <Chip label={`#${item.id}`} tone={C.textMuted} />
                            <Chip label={workbenchReceiptKindLabel(item.kind)} tone={C.accent} />
                            <Chip label={item.validationStatus.replace(/_/g, " ")} tone={toneForValidationStatus(item.validationStatus)} />
                            {item.projectName && <Chip label={item.projectName} tone={C.gold} />}
                            {item.routeAgent && <Chip label={`to ${item.routeAgent}`} tone={C.textMuted} />}
                            {item.executionResultId != null && (
                              <Chip
                                label={`result #${item.executionResultId} ${item.executionResultStatus?.replace(/_/g, " ") ?? "recorded"}`}
                                tone={item.executionResultStatus === "completed" ? C.success : C.warning}
                              />
                            )}
                            {workbenchReceiptPreviewBadges(item).map((badge) => (
                              <Chip key={`${item.id}-${badge.label}`} label={badge.label} tone={badge.tone === "warning" ? C.warning : C.accent} />
                            ))}
                            {item.sensitive && <Chip label="sensitive" tone={C.danger} />}
                            <Chip label="opens body only" tone={C.textMuted} />
                          </span>
                          <span className="mt-2 block text-xs font-semibold" style={{ color: C.textPrimary }}>{item.title}</span>
                          <span className="mt-1 block max-h-[34px] overflow-hidden text-[11px] leading-snug whitespace-normal" style={{ color: C.textMuted }}>
                            {workbenchReceiptRowSummary(item.summary)}
                          </span>
                          {item.targetUri && (
                            <span className="mt-1 block text-[11px] truncate" style={{ color: C.textMuted }} title={item.targetUri}>
                              Target: {sourceDisplayName(item.targetUri)}
                            </span>
                          )}
                        </span>
                      </Button>
                    ))}
                    {hiddenEvidenceCount > 0 && (
                      <div className="rounded px-2 py-1.5 text-[11px]" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}`, color: C.textMuted }}>
                        {hiddenEvidenceCount} more records match. Narrow the filters to inspect them.
                      </div>
                    )}
                  </div>
                  <EvidenceDetailPanel
                    detail={evidenceDetail.data}
                    loading={evidenceDetail.isLoading}
                    onNavigate={onNavigate}
                    onCreateValidationNote={(input) => {
                      createValidationNote.mutate({
                        evidenceId: input.evidenceId,
                        validatorAgent: input.validatorAgent,
                        status: input.status,
                        note: input.note,
                      });
                    }}
                    isCreatingValidationNote={createValidationNote.isPending}
                    validationSavedId={createValidationNote.data?.ok ? createValidationNote.data.evidence.id : null}
                    evidenceOptions={(evidencePicker.data?.items ?? []).map((item) => ({
                      id: item.id,
                      title: item.title,
                      kind: item.kind,
                      summary: item.summary,
                      projectName: item.projectName,
                      validationStatus: item.validationStatus,
                      sensitive: item.sensitive,
                      mediaName: item.mediaName,
                      createdAt: item.createdAt,
                    }))}
                    evidencePickerLoading={evidencePicker.isLoading}
                    evidencePickerGates={evidencePicker.data?.gates ?? []}
                    onComparisonPickerOpenChange={setComparisonPickerOpen}
                    onCreateComparison={(input) => {
                      createBeforeAfterComparison.mutate(input);
                    }}
                    isCreatingComparison={createBeforeAfterComparison.isPending}
                    comparisonSavedId={createBeforeAfterComparison.data?.ok ? createBeforeAfterComparison.data.evidence.id : null}
                  />
                </div>
              )}
            </section>

          </div>
        )}
      </main>
    </div>
  );
}

function WorkbenchReceiptChainStrip({
  draft,
  selectedEvidenceId,
  selectedEvidence,
  projectLabel,
}: {
  draft: WorkbenchDraft | null;
  selectedEvidenceId: number | null;
  selectedEvidence: {
    id: number;
    title: string;
    targetUri: string | null;
    projectName: string | null;
    commandObservationId: number | null;
    validationStatus: string;
  } | null;
  projectLabel: string | null;
}) {
  const commandObservationId = selectedEvidence?.commandObservationId ?? draft?.commandObservationId ?? null;
  const targetUri = selectedEvidence?.targetUri ?? draft?.targetUri ?? null;
  const routeTarget = targetUri?.startsWith("runtime_route:") ? targetUri : null;
  const evidenceId = selectedEvidence?.id ?? selectedEvidenceId;
  const linkedProject = selectedEvidence?.projectName ?? projectLabel ?? (draft?.projectId == null ? null : "linked project");
  const validationStatus = selectedEvidence?.validationStatus ?? null;
  const copy = workbenchReceiptChainCopy();
  const steps = [
    {
      label: copy.sourceStepLabel(Boolean(routeTarget)),
      value: routeTarget ? sourceDisplayName(routeTarget) : commandObservationId == null ? copy.emptySourceText : `observation #${commandObservationId}`,
      tone: routeTarget || commandObservationId != null ? C.gold : C.textMuted,
    },
    {
      label: copy.bodyStepLabel,
      value: evidenceId == null
        ? draft
          ? copy.draftBodyText
          : copy.emptyBodyText
        : `receipt #${evidenceId} ${validationStatus?.replace(/_/g, " ") ?? "open"}`,
      tone: evidenceId == null ? draft ? C.warning : C.textMuted : validationStatus === "needs_review" ? C.warning : C.success,
    },
    {
      label: copy.projectStepLabel,
      value: linkedProject ?? copy.emptyProjectText,
      tone: linkedProject ? C.accent : C.warning,
    },
  ];

  return (
    <section className="rounded p-1.5" aria-label={copy.ariaLabel} style={{ background: G.slab, border: `1px solid ${G.lineSoft}` }}>
      <div className="grid gap-1 md:grid-cols-3">
        {steps.map((step) => (
          <div key={step.label} className="min-w-0 rounded px-1.5 py-1" style={{ background: G.slabMuted, border: `1px solid ${G.lineSoft}` }}>
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

function EvidenceDetailPanel({
  detail,
  loading,
  onNavigate,
  onCreateValidationNote,
  isCreatingValidationNote,
  validationSavedId,
  evidenceOptions,
  evidencePickerLoading,
  evidencePickerGates,
  onComparisonPickerOpenChange,
  onCreateComparison,
  isCreatingComparison,
  comparisonSavedId,
}: {
  detail:
    | {
        found: false;
        gates: string[];
      }
    | {
        found: true;
        gates: string[];
        evidence: {
          id: number;
          kind: string;
          title: string;
          summary: string;
          targetUri: string | null;
          projectId: number | null;
          projectName: string | null;
          taskId: number | null;
          taskTitle: string | null;
          sessionId: number | null;
          sessionClaudeId: string | null;
          sessionDisplayName: string | null;
          sourceId: number | null;
          sourceTitle: string | null;
          sourceUri: string | null;
          commandObservationId: number | null;
          command: string | null;
          artifactId: number | null;
          artifactTitle: string | null;
          artifactPath: string | null;
          ownerAgent: string;
          routeAgent: string | null;
          viewport: string | null;
          coordinates: string | null;
          annotationText: string | null;
          permissionClass: string;
          validationStatus: string;
          sensitive: boolean;
          mediaName: string | null;
          mediaMimeType: string | null;
          mediaByteSize: number | null;
          mediaKind: string | null;
          mediaFrameTimeSec: number | null;
          mediaDurationSec: number | null;
          mediaTemporary: boolean;
          beforeEvidenceId: number | null;
          afterEvidenceId: number | null;
          comparisonResult: string | null;
        };
        permissionPreflight: {
          id: number;
          mode: string | null;
          decision: string | null;
          requiredApprovals: string[];
          reasons: string[];
        } | null;
        validationHistory: Array<{
          id: number;
          title: string;
          summary: string;
          ownerAgent: string;
          sessionId: number | null;
          sessionDisplayName: string | null;
          validationStatus: string;
          permissionPreflightId: number | null;
          createdAt: number;
        }>;
        comparisonHistory: Array<{
          id: number;
          title: string;
          summary: string;
          sessionId: number | null;
          sessionDisplayName: string | null;
          beforeEvidenceId: number | null;
          afterEvidenceId: number | null;
          comparisonResult: string | null;
          validationStatus: string;
          permissionPreflightId: number | null;
          createdAt: number;
        }>;
        executionResult: {
          id: number;
          proposalId: number | null;
          approvalId: number | null;
          executorAgent: string;
          command: string;
          cwd: string;
          exitCode: number | null;
          stdoutSummary: string;
          stderrSummary: string;
          durationMs: number;
          timedOut: boolean;
          status: string;
          receiptBody: string;
          recoveryNote: string | null;
          actionType: string | null;
          riskClass: string | null;
          createdAt: number;
        } | null;
        knowledgeRoute: {
          mode: string;
          projectBridgePath: string;
          repositorySourcePath: string;
          projectMapPath: string;
          sourcesIndexPath: string;
          archiveLane: string;
          archiveRetrieval: string;
          writesExternalSystems: boolean;
          approvalGate: string;
        } | null;
      }
    | undefined;
  loading: boolean;
  onCreateValidationNote?: (input: { evidenceId: number; validatorAgent: ValidatorAgent; status: ValidationNoteStatus; note: string }) => void;
  onNavigate?: (route: WorkbenchRoute) => void;
  isCreatingValidationNote?: boolean;
  validationSavedId?: number | null;
  evidenceOptions?: Array<{
    id: number;
    title: string;
    kind: string;
    summary: string;
    projectName: string | null;
    validationStatus: string;
    sensitive: boolean;
    mediaName: string | null;
    createdAt: number;
  }>;
  evidencePickerLoading?: boolean;
  evidencePickerGates?: string[];
  onComparisonPickerOpenChange?: (open: boolean) => void;
  onCreateComparison?: (input: { beforeEvidenceId: number; afterEvidenceId: number; title: string; summary: string; result: string; routeAgent?: string | null }) => void;
  isCreatingComparison?: boolean;
  comparisonSavedId?: number | null;
}) {
  const [validatorAgent, setValidatorAgent] = useState<ValidatorAgent>("oak");
  const [validationStatus, setValidationStatus] = useState<ValidationNoteStatus>("needs_review");
  const [validationNote, setValidationNote] = useState("");
  const [compareWithId, setCompareWithId] = useState<number | "none">("none");
  const [comparisonTitle, setComparisonTitle] = useState("");
  const [comparisonSummary, setComparisonSummary] = useState("");
  const [comparisonResult, setComparisonResult] = useState("");
  const [pickerQuery, setPickerQuery] = useState("");
  const [pickerKind, setPickerKind] = useState<EvidenceKind>("all");
  const detailCopy = workbenchReceiptDetailCopy();
  if (loading) {
    return (
      <aside className="rounded p-2 text-[11px]" style={{ background: G.slabMuted, border: `1px solid ${G.lineSoft}`, color: C.textMuted }}>
        Reading receipt body.
      </aside>
    );
  }
  if (!detail) {
    return (
      <aside className="rounded p-2 text-[11px]" style={{ background: G.slabMuted, border: `1px solid ${G.lineSoft}`, color: C.textMuted }}>
        Select a receipt to inspect body, links, coordinates, and gates.
      </aside>
    );
  }
  if (!detail.found) {
    return (
      <aside className="rounded p-2 text-[11px]" style={{ background: G.slabMuted, border: `1px solid ${G.lineSoft}`, color: C.textMuted }}>
        {detail.gates[0]}
      </aside>
    );
  }
  const item = detail.evidence;
  const comparisonOptions = (evidenceOptions ?? []).filter((option) => {
    if (option.id === item.id) return false;
    if (pickerKind !== "all" && option.kind !== pickerKind) return false;
    const query = pickerQuery.trim().toLowerCase();
    if (!query) return true;
    return [
      option.title,
      option.summary,
      option.kind,
      option.projectName ?? "",
      option.mediaName ?? "",
      option.validationStatus,
      String(option.id),
    ].some((value) => value.toLowerCase().includes(query));
  });
  const selectedComparison = compareWithId === "none" ? null : comparisonOptions.find((option) => option.id === compareWithId) ?? null;
  function openSecurityGate() {
    if (!item.targetUri || !onNavigate) return;
    try {
      window.sessionStorage.setItem("cerebro:security-target", item.targetUri);
    } catch {
      // Ignore storage failure. The Security Gate form still opens.
    }
    onNavigate("security");
  }
  function openLedgerAudit() {
    if (!onNavigate) return;
    try {
      window.sessionStorage.setItem(
        "cerebro:ledger-focus",
        JSON.stringify({
          source: "workbench",
          evidenceId: item.id,
          projectId: item.projectId,
          projectName: item.projectName,
          notice: `Ledger opened Workbench receipt #${item.id}.`,
        }),
      );
    } catch {
      // Ledger still opens; the user can select the receipt manually.
    }
    onNavigate("ledger");
  }
  function openProjectContext() {
    if (!onNavigate) return;
    try {
      window.sessionStorage.setItem(
        "cerebro:project-lab-focus",
        JSON.stringify({
          source: "workbench",
          evidenceId: item.id,
          projectId: item.projectId,
          projectName: item.projectName,
          notice: item.projectName
            ? `Workbench receipt #${item.id} opened ${item.projectName} project context.`
            : `Workbench receipt #${item.id} has no linked project.`,
        }),
      );
    } catch {
      // Project Lab still opens; the user can inspect project context manually.
    }
    onNavigate("projects");
  }
  const sourceLabel = item.sourceTitle ?? (item.sourceUri ? sourceDisplayName(item.sourceUri) : item.sourceId == null ? "unlinked" : `Source #${item.sourceId}`);
  const projectLabel = item.projectName ?? "unlinked";
  const validationLabel =
    detail.validationHistory.length > 0
      ? `${detail.validationHistory.length} notes`
      : item.validationStatus.replace(/_/g, " ");
  const linkedExecution = detail.executionResult;
  const ledgerLabel = `receipt #${item.id}`;
  const nextAction =
    item.validationStatus === "needs_review"
      ? "Append validation before treating this as checked."
      : item.projectName
        ? "Open Ledger or Project Lab before push decisions."
        : "Link a project before using this for push context.";
  const proofRead = [
    { label: "Body", value: item.title, tone: C.textPrimary },
    { label: "Source", value: sourceLabel, tone: item.sourceId == null && !item.sourceUri ? C.warning : C.accent },
    { label: "Project", value: projectLabel, tone: item.projectName ? C.success : C.warning },
    ...(linkedExecution
      ? [{ label: "Execution", value: `result #${linkedExecution.id} ${linkedExecution.status.replace(/_/g, " ")}`, tone: linkedExecution.status === "completed" ? C.success : C.warning }]
      : []),
    { label: "Validation", value: validationLabel, tone: toneForValidationStatus(item.validationStatus) },
    { label: "Ledger", value: ledgerLabel, tone: C.gold },
    { label: "Next", value: nextAction, tone: C.textSecondary },
  ];
  return (
    <aside className="rounded p-2" aria-label="Workbench receipt body" style={{ background: G.slabMuted, border: `1px solid ${G.lineSoft}` }}>
      <div className="mb-2 flex flex-wrap gap-1">
        <Chip label={`#${item.id}`} tone={C.textMuted} />
        <Chip label={workbenchReceiptKindLabel(item.kind)} tone={C.accent} />
        <Chip label={workbenchPermissionLabel(item.permissionClass)} tone={C.gold} />
        {item.sensitive && <Chip label="sensitive" tone={C.danger} />}
      </div>
      <h3 className="text-[11px] font-bold uppercase tracking-widest" style={{ color: C.textPrimary }}>{item.title}</h3>
      <p className="mt-1 text-[11px] leading-snug" style={{ color: C.textMuted }}>{workbenchReceiptRowSummary(item.summary)}</p>
      <div className="mt-2 rounded p-2" aria-label="Workbench receipt read" style={{ background: G.slab, border: `1px solid ${G.lineSoft}` }}>
        <div className="mb-2 flex items-center justify-between gap-2">
          <h4 className="text-[10px] font-bold uppercase tracking-widest" style={{ color: C.textPrimary }}>
            {detailCopy.readTitle}
          </h4>
          <Chip label={detailCopy.readBadge} tone={C.gold} />
        </div>
        <div className="grid gap-1 sm:grid-cols-2">
          {proofRead.map((entry) => (
            <Meta key={entry.label} label={entry.label} value={entry.value} tone={entry.tone} />
          ))}
        </div>
        {onNavigate && (
          <div className="mt-2 grid grid-cols-3 gap-1">
            <Button type="button" size="sm" variant="outline" className="h-7 px-2" onClick={openLedgerAudit} aria-label={`Open Ledger audit for receipt ${item.id}`}>
              Ledger
            </Button>
            <Button type="button" size="sm" variant="outline" className="h-7 px-2" onClick={openProjectContext} aria-label={`Open Project Lab context for receipt ${item.id}`}>
              Project
            </Button>
            <Button
              type="button"
              size="sm"
              variant={item.targetUri ? "risk" : "outline"}
              className="h-7 px-2"
              onClick={openSecurityGate}
              disabled={!item.targetUri}
              aria-label={`Open Security Gate for receipt ${item.id}`}
              title={item.targetUri ? "Open Security Gate for this receipt target." : "This receipt has no target URI."}
            >
              Security
            </Button>
          </div>
        )}
        {linkedExecution && (
          <div className="mt-2 rounded p-1.5" aria-label={`Execution result linked to Workbench receipt ${item.id}`} style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}>
            <div className="mb-1 flex flex-wrap items-center gap-1">
              <Chip label={`result #${linkedExecution.id}`} tone={C.gold} />
              <Chip label={linkedExecution.status.replace(/_/g, " ")} tone={linkedExecution.status === "completed" ? C.success : C.warning} />
              <Chip label={`exit ${linkedExecution.exitCode ?? "none"}`} tone={linkedExecution.exitCode === 0 ? C.success : C.warning} />
              <Chip label={linkedExecution.riskClass?.replace(/_/g, " ") ?? "risk unknown"} tone={linkedExecution.riskClass === "read_only" ? C.accent : C.warning} />
            </div>
            <div className="grid gap-1 sm:grid-cols-2">
              <CompactReadDatum label="Command" value={linkedExecution.command} tone={C.textSecondary} wrap />
              <CompactReadDatum label="Executor" value={linkedExecution.executorAgent} tone={C.accent} />
              <CompactReadDatum label="Approval" value={linkedExecution.approvalId == null ? "missing" : `#${linkedExecution.approvalId}`} tone={linkedExecution.approvalId == null ? C.warning : C.success} />
              <CompactReadDatum label="Recovery" value={linkedExecution.recoveryNote ?? "not recorded"} tone={linkedExecution.recoveryNote ? C.textSecondary : C.warning} wrap />
            </div>
            <div className="mt-1 text-[10px] leading-snug" style={{ color: C.textMuted }}>
              Workbench is reading the linked execution receipt. It does not rerun the command.
            </div>
          </div>
        )}
      </div>
      {detail.knowledgeRoute && (
        <details className="mt-2 rounded p-2" aria-label="Workbench project knowledge route" style={{ background: G.slab, border: `1px solid ${G.lineSoft}` }} open>
          <summary
            className="cursor-pointer rounded text-[10px] font-bold uppercase tracking-widest focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            style={{ color: C.textPrimary, ["--tw-ring-color" as string]: C.accent, ["--tw-ring-offset-color" as string]: C.surface }}
          >
            Knowledge Route Read
          </summary>
          <div className="mt-2 flex flex-wrap gap-1" aria-label="Workbench knowledge route badges">
            <Chip label={detail.knowledgeRoute.mode === "read_only" ? "read only" : detail.knowledgeRoute.mode.replace(/_/g, " ")} tone={C.gold} />
            <Chip label={detail.knowledgeRoute.writesExternalSystems ? "external write" : "no external write"} tone={detail.knowledgeRoute.writesExternalSystems ? C.danger : C.success} />
            <Chip label={detail.knowledgeRoute.archiveRetrieval.replace(/_/g, " ")} tone={C.accent} />
          </div>
          <div className="mt-2 grid grid-cols-2 gap-1">
            <CompactReadDatum label="Bridge" value={detail.knowledgeRoute.projectBridgePath} tone={C.success} wrap />
            <CompactReadDatum label="Source" value={detail.knowledgeRoute.repositorySourcePath} tone={C.accent} wrap />
            <CompactReadDatum label="Map" value={detail.knowledgeRoute.projectMapPath} tone={C.textSecondary} wrap />
            <CompactReadDatum label="Index" value={detail.knowledgeRoute.sourcesIndexPath} tone={C.textSecondary} wrap />
            <CompactReadDatum
              label="Archive"
              value={`${detail.knowledgeRoute.archiveLane} / ${detail.knowledgeRoute.archiveRetrieval.replace(/_/g, " ")}`}
              tone={C.warning}
              wrap
            />
            <CompactReadDatum
              label="Writes"
              value={detail.knowledgeRoute.writesExternalSystems ? "enabled" : "approval gated"}
              tone={detail.knowledgeRoute.writesExternalSystems ? C.danger : C.gold}
              wrap
            />
          </div>
          <div className="mt-2 text-[11px] leading-snug" style={{ color: C.textMuted }}>
            {detail.knowledgeRoute.approvalGate}
          </div>
          <div className="mt-2 rounded px-2 py-1.5 text-[11px] leading-snug" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}`, color: C.textSecondary }}>
            No note scan, vector index, source fetch, Obsidian/Notion/Drive/memory write, or route default change ran from this read.
          </div>
        </details>
      )}
      <details className="mt-2 rounded p-2" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
        <summary className="cursor-pointer text-[10px] font-bold uppercase tracking-widest" style={{ color: C.textPrimary }}>
          {detailCopy.detailTitle}
        </summary>
        <div className="mt-2 grid gap-1">
          <Meta label={detailCopy.ownerLabel} value={item.ownerAgent} />
          <Meta label={detailCopy.assignedAgentLabel} value={item.routeAgent ?? "unrouted"} />
          <Meta label={detailCopy.projectLabel} value={item.projectName ?? "unlinked"} />
          <Meta label={detailCopy.taskLabel} value={item.taskTitle ?? (item.taskId == null ? "unlinked" : `Task #${item.taskId}`)} />
          <Meta label={detailCopy.sessionLabel} value={item.sessionDisplayName ?? (item.sessionId == null ? "unlinked" : `Run #${item.sessionId}`)} />
          <Meta
            label={detailCopy.sourceLabel}
            value={item.sourceTitle ?? (item.sourceUri ? sourceDisplayName(item.sourceUri) : item.sourceId == null ? "unlinked" : `Source #${item.sourceId}`)}
            title={item.sourceUri ?? undefined}
          />
          <Meta
            label={detailCopy.commandLabel}
            value={item.command ? compactCommandLabel(item.command) : item.commandObservationId == null ? "unlinked" : `Command observation #${item.commandObservationId}`}
            title={item.command ?? undefined}
          />
          <Meta
            label={detailCopy.artifactLabel}
            value={item.artifactTitle ?? (item.artifactPath ? compactPathLabel(item.artifactPath) : item.artifactId == null ? "unlinked" : `Artifact #${item.artifactId}`)}
            title={item.artifactPath ?? undefined}
          />
          <Meta label={detailCopy.targetLabel} value={item.targetUri ? sourceDisplayName(item.targetUri) : "none"} title={item.targetUri ?? undefined} />
          {item.targetUri && (
            <Button
              type="button"
              onClick={openSecurityGate}
              disabled={!onNavigate}
              variant="risk"
              size="sm"
              className="w-fit"
              title="Open Security Gate for this target. Workbench does not browse, clone, install, or execute."
              aria-label={`Open Security Gate for receipt ${item.id}`}
            >
              Security Gate
            </Button>
          )}
          <Meta label={detailCopy.viewportLabel} value={item.viewport ?? "none"} />
          <Meta label={detailCopy.coordinatesLabel} value={item.coordinates ?? "none"} />
          <Meta label={detailCopy.annotationLabel} value={item.annotationText ?? "none"} />
          <Meta label={detailCopy.previewNameLabel} value={item.mediaName ?? "none"} />
          <Meta label={detailCopy.previewKindLabel} value={item.mediaKind == null ? "none" : workbenchReceiptKindLabel(item.mediaKind)} />
          <Meta label={detailCopy.previewTypeLabel} value={item.mediaMimeType ?? "none"} />
          <Meta label={detailCopy.previewSizeLabel} value={item.mediaByteSize == null ? "none" : formatBytes(item.mediaByteSize)} />
          <Meta label={detailCopy.frameTimeLabel} value={item.mediaFrameTimeSec == null ? "none" : formatSeconds(item.mediaFrameTimeSec)} />
          <Meta label={detailCopy.durationLabel} value={item.mediaDurationSec == null ? "none" : formatSeconds(item.mediaDurationSec)} />
          <Meta label={detailCopy.previewStorageLabel} value={item.mediaTemporary ? detailCopy.localPreviewStorageText : detailCopy.noPreviewStorageText} />
          <Meta label={detailCopy.beforeReceiptLabel} value={item.beforeEvidenceId == null ? "none" : `Receipt #${item.beforeEvidenceId}`} />
          <Meta label={detailCopy.afterReceiptLabel} value={item.afterEvidenceId == null ? "none" : `Receipt #${item.afterEvidenceId}`} />
          <Meta label={detailCopy.comparisonLabel} value={item.comparisonResult ?? "none"} />
        </div>
      </details>
      <details className="mt-2 rounded p-2" aria-label="Workbench security check" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
        <summary className="cursor-pointer text-[10px] font-bold uppercase tracking-widest" style={{ color: C.textPrimary }}>
          {detailCopy.securityTitle}
        </summary>
        {detail.permissionPreflight == null ? (
          <div className="mt-2 text-[11px] leading-snug" style={{ color: C.textMuted }}>
            {detailCopy.noSecurityText}
          </div>
        ) : (
          <div className="mt-2 grid gap-2">
            <div className="flex flex-wrap gap-1">
              <Chip label={`preflight #${detail.permissionPreflight.id}`} tone={C.textMuted} />
              {detail.permissionPreflight.mode && <Chip label={detail.permissionPreflight.mode.replace(/_/g, " ")} tone={C.gold} />}
              {detail.permissionPreflight.decision && <Chip label={detail.permissionPreflight.decision.replace(/_/g, " ")} tone={C.warning} />}
            </div>
            {detail.permissionPreflight.requiredApprovals.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {detail.permissionPreflight.requiredApprovals.map((approval) => (
                  <Chip key={approval} label={approval} tone={C.danger} />
                ))}
              </div>
            )}
            <ul className="grid gap-1" style={{ color: C.textMuted }}>
              {detail.permissionPreflight.reasons.map((reason) => (
              <li key={reason} className="text-[11px] leading-snug">
                  {reason}
                </li>
              ))}
            </ul>
          </div>
        )}
      </details>
      {detail.gates.length > 0 && (
        <details className="mt-2 rounded p-2" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
          <summary className="cursor-pointer text-[10px] font-bold uppercase tracking-widest" style={{ color: C.textPrimary }}>
            {detailCopy.readRulesTitle}
          </summary>
          <div className="mt-2 grid gap-1.5">
            {detail.gates.map((gate) => (
              <div key={gate} className="rounded px-2 py-1.5 text-[11px]" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}`, color: C.textMuted }}>
                {gate}
              </div>
            ))}
          </div>
        </details>
      )}
      <details className="mt-2 rounded p-2" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
        <summary className="cursor-pointer text-[10px] font-bold uppercase tracking-widest" style={{ color: C.textPrimary }}>
          Validation Trail
        </summary>
        {detail.validationHistory.length === 0 ? (
          <div className="mt-2 text-[11px] leading-snug" style={{ color: C.textMuted }}>
            No validation notes yet. Append a local validation note before treating this receipt as checked.
          </div>
        ) : (
          <div className="mt-2 grid gap-2">
            {detail.validationHistory.map((entry) => (
              <article key={entry.id} className="rounded p-2" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}>
                <div className="flex flex-wrap gap-1">
                  <Chip label={`#${entry.id}`} tone={C.textMuted} />
                  <Chip label={entry.ownerAgent} tone={C.accent} />
                  {entry.sessionDisplayName && <Chip label={entry.sessionDisplayName} tone={C.gold} />}
                  <Chip label={entry.validationStatus.replace(/_/g, " ")} tone={toneForValidationStatus(entry.validationStatus)} />
                  {entry.permissionPreflightId != null && <Chip label={`preflight #${entry.permissionPreflightId}`} tone={C.textMuted} />}
                  <Chip label={formatTimestamp(entry.createdAt)} tone={C.textMuted} />
                </div>
                <p className="mt-2 text-[11px] leading-snug" style={{ color: C.textMuted }}>{entry.summary}</p>
              </article>
            ))}
          </div>
        )}
      </details>
      <details className="mt-2 rounded p-2" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
        <summary className="cursor-pointer text-[10px] font-bold uppercase tracking-widest" style={{ color: C.textPrimary }}>
          Comparison Trail
        </summary>
        {detail.comparisonHistory.length === 0 ? (
          <div className="mt-2 text-[11px] leading-snug" style={{ color: C.textMuted }}>
            No before/after comparisons include this receipt yet. Pick another local receipt below to append a comparison.
          </div>
        ) : (
          <div className="mt-2 grid gap-2">
            {detail.comparisonHistory.map((entry) => (
              <article key={entry.id} className="rounded p-2" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}>
                <div className="flex flex-wrap gap-1">
                  <Chip label={`#${entry.id}`} tone={C.textMuted} />
                  {entry.sessionDisplayName && <Chip label={entry.sessionDisplayName} tone={C.gold} />}
                  <Chip label={`before receipt #${entry.beforeEvidenceId ?? "none"}`} tone={C.accent} />
                  <Chip label={`after receipt #${entry.afterEvidenceId ?? "none"}`} tone={C.accent} />
                  <Chip label={entry.validationStatus.replace(/_/g, " ")} tone={toneForValidationStatus(entry.validationStatus)} />
                  {entry.permissionPreflightId != null && <Chip label={`preflight #${entry.permissionPreflightId}`} tone={C.textMuted} />}
                  <Chip label={formatTimestamp(entry.createdAt)} tone={C.textMuted} />
                </div>
                <p className="mt-2 text-[11px] leading-snug" style={{ color: C.textMuted }}>{entry.summary}</p>
                {entry.comparisonResult && (
                  <p className="mt-2 text-[11px] leading-snug" style={{ color: C.textSecondary }}>{entry.comparisonResult}</p>
                )}
              </article>
            ))}
          </div>
        )}
      </details>
      <details
        className="mt-2 rounded p-2"
        onToggle={(event) => onComparisonPickerOpenChange?.(event.currentTarget.open)}
        style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}
      >
        <summary className="cursor-pointer text-[10px] font-bold uppercase tracking-widest" style={{ color: C.textPrimary }}>
          Append Before/After Receipt
        </summary>
        <div className="mt-2 grid gap-2">
          <div className="rounded px-2 py-1.5 text-[11px]" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}`, color: C.textMuted }}>
            {evidencePickerLoading ? "Reading local comparison receipts." : "Comparison receipts read only when this drawer is open."}
          </div>
          <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_150px]">
            <Input
              value={pickerQuery}
              onChange={(event) => setPickerQuery(event.target.value)}
              aria-label="Search comparison receipt picker"
              placeholder="Search local receipts."
            />
            <AppSelect
              label="Picker kind"
              value={pickerKind}
              onChange={(value) => setPickerKind(value as EvidenceKind)}
              options={[
                { value: "all", label: "All kinds" },
                { value: "manual_note", label: "Manual" },
                { value: "image_review", label: "Image" },
                { value: "video_frame", label: "Video frame" },
                { value: "annotation", label: "Annotation" },
                { value: "validation_note", label: "Validation" },
                { value: "terminal_output", label: "Terminal" },
                { value: "before_after", label: "Before/after" },
              ]}
            />
          </div>
          <AppSelect
            label="Compare with receipt"
            value={String(compareWithId)}
            onChange={(value) => setCompareWithId(value === "none" ? "none" : Number(value))}
            options={[
              { value: "none", label: evidencePickerLoading ? "Reading local receipts" : "Compare with receipt" },
              ...comparisonOptions.map((option) => ({
                value: String(option.id),
                label: `#${option.id} ${option.kind.replace(/_/g, " ")} ${option.title}`,
              })),
            ]}
          />
          {selectedComparison && (
            <div className="rounded px-2 py-2 text-xs leading-relaxed" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}`, color: C.textMuted }}>
              #{selectedComparison.id} {selectedComparison.projectName ?? "unlinked"} {selectedComparison.validationStatus.replace(/_/g, " ")}
              {selectedComparison.sensitive ? " sensitive" : ""}. {selectedComparison.summary}
            </div>
          )}
          {!evidencePickerLoading && comparisonOptions.length === 0 && (
            <div className="rounded px-2 py-2 text-xs leading-snug" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}`, color: C.textMuted }}>
              No local receipts match the picker filters. Clear the search or switch the picker kind.
            </div>
          )}
          {(evidencePickerGates ?? []).map((gate) => (
            <div key={gate} className="rounded px-2 py-1.5 text-xs" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}`, color: C.textMuted }}>
              {gate}
            </div>
          ))}
          <Input
            value={comparisonTitle}
            onChange={(event) => setComparisonTitle(event.target.value)}
            aria-label="Before/after comparison title"
            placeholder="Comparison title."
          />
          <Textarea
            value={comparisonSummary}
            onChange={(event) => setComparisonSummary(event.target.value)}
            aria-label="Before/after receipt comparison summary"
            placeholder="What changed between these receipt bodies."
          />
          <Textarea
            value={comparisonResult}
            onChange={(event) => setComparisonResult(event.target.value)}
            aria-label="Before/after comparison result"
            placeholder="Result or next local review status."
          />
          <div className="flex items-center justify-between gap-2">
            <div role="status" aria-live="polite" className="text-[11px]" style={{ color: C.textMuted }}>
              {comparisonSavedId ? `Saved comparison receipt #${comparisonSavedId}.` : "Creates a new local comparison receipt."}
            </div>
            <Button
              type="button"
              disabled={compareWithId === "none" || !comparisonTitle.trim() || !comparisonSummary.trim() || !comparisonResult.trim() || isCreatingComparison}
              title={
                compareWithId === "none"
                  ? "Choose a second local receipt before appending a comparison."
                  : !comparisonTitle.trim() || !comparisonSummary.trim() || !comparisonResult.trim()
                    ? "Add a title, summary, and result before appending the comparison."
                    : "Append a new before/after receipt. The original receipts are not overwritten."
              }
              onClick={() => {
                if (compareWithId === "none" || !comparisonTitle.trim() || !comparisonSummary.trim() || !comparisonResult.trim()) return;
                onCreateComparison?.({
                  beforeEvidenceId: item.id,
                  afterEvidenceId: compareWithId,
                  title: comparisonTitle.trim(),
                  summary: comparisonSummary.trim(),
                  result: comparisonResult.trim(),
                  routeAgent: "spock",
                });
                setComparisonTitle("");
                setComparisonSummary("");
                setComparisonResult("");
              }}
              aria-label="Append local before/after receipt comparison"
              size="sm"
            >
              {isCreatingComparison ? "Saving" : "Append Comparison"}
            </Button>
          </div>
        </div>
      </details>
      <details className="mt-2 rounded p-2" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
        <summary className="cursor-pointer text-[10px] font-bold uppercase tracking-widest" style={{ color: C.textPrimary }}>
          Append Validation Receipt
        </summary>
        <div className="mt-2 grid gap-2">
          {linkedExecution && (
            <div className="rounded p-1.5" aria-label="Execution-linked validation controls" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}>
              <div className="mb-1 flex flex-wrap items-center gap-1">
                <Chip label={`result #${linkedExecution.id}`} tone={C.gold} />
                <Chip label={linkedExecution.status.replace(/_/g, " ")} tone={linkedExecution.status === "completed" ? C.success : C.warning} />
                <Chip label={`exit ${linkedExecution.exitCode ?? "none"}`} tone={linkedExecution.exitCode === 0 ? C.success : C.warning} />
              </div>
              <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setValidatorAgent("spock");
                    setValidationStatus("looks_consistent");
                    setValidationNote(`Execution result #${linkedExecution.id} completed as an approved read-only local command. Exit ${linkedExecution.exitCode ?? "none"}. Recovery note: ${linkedExecution.recoveryNote ?? "not recorded"}. Treat as local evidence only.`);
                  }}
                  title="Prepare a local validation note for a completed read-only execution result."
                  aria-label={`Prepare looks consistent validation for execution result ${linkedExecution.id}`}
                >
                  Mark Looks Consistent
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setValidatorAgent("spock");
                    setValidationStatus("blocked");
                    setValidationNote(`Execution result #${linkedExecution.id} needs review before use. Status: ${linkedExecution.status}. Exit ${linkedExecution.exitCode ?? "none"}. Recovery note: ${linkedExecution.recoveryNote ?? "not recorded"}.`);
                  }}
                  title="Prepare a blocking validation note for a result that should not be used yet."
                  aria-label={`Prepare blocked validation for execution result ${linkedExecution.id}`}
                >
                  Mark Blocked
                </Button>
              </div>
              <div className="mt-1 text-[10px] leading-snug" style={{ color: C.textMuted }}>
                These controls only prepare a local validation receipt. They do not rerun, approve, or change the original result.
              </div>
            </div>
          )}
          <AppSelect
            label="Validator agent"
            value={validatorAgent}
            onChange={(value) => setValidatorAgent(value as ValidatorAgent)}
            options={[
              { value: "oak", label: "Professor Oak" },
              { value: "spock", label: "Spock" },
            ]}
          />
          <AppSelect
            label="Validation status"
            value={validationStatus}
            onChange={(value) => setValidationStatus(value as ValidationNoteStatus)}
            options={[
              { value: "needs_review", label: "Needs review" },
              { value: "looks_consistent", label: "Looks consistent" },
              { value: "blocked", label: "Blocked" },
              { value: "validated_for_local_use", label: "Validated for local use" },
            ]}
          />
          <Textarea
            value={validationNote}
            onChange={(event) => setValidationNote(event.target.value)}
            aria-label="Validation note"
            placeholder="Local validation note. This appends a new receipt."
          />
          <div className="flex items-center justify-between gap-2">
            <div role="status" aria-live="polite" className="text-[11px]" style={{ color: C.textMuted }}>
              {validationSavedId ? `Saved validation receipt #${validationSavedId}.` : "Original receipt is not overwritten."}
            </div>
            <Button
              type="button"
              disabled={!validationNote.trim() || isCreatingValidationNote}
              title={!validationNote.trim() ? "Write a validation note before appending it." : "Append a validation receipt. The original receipt is not overwritten."}
              onClick={() => {
                if (!validationNote.trim()) return;
                onCreateValidationNote?.({
                  evidenceId: item.id,
                  validatorAgent,
                  status: validationStatus,
                  note: validationNote.trim(),
                });
                setValidationNote("");
              }}
              aria-label="Append local validation note"
              size="sm"
            >
              {isCreatingValidationNote ? "Saving" : "Append Validation"}
            </Button>
          </div>
        </div>
      </details>
    </aside>
  );
}

function formatTimestamp(value: number) {
  if (!Number.isFinite(value)) return "unknown time";
  return new Date(value * 1000).toLocaleString();
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function formatBytes(value: number) {
  if (!Number.isFinite(value) || value < 0) return "unknown size";
  if (value < 1024) return `${value} B`;
  const units = ["KB", "MB", "GB"];
  let size = value / 1024;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }
  return `${size.toFixed(size >= 10 ? 0 : 1)} ${units[unitIndex]}`;
}

function formatSeconds(value: number) {
  if (!Number.isFinite(value) || value < 0) return "unknown time";
  if (value < 60) return `${value.toFixed(value >= 10 ? 1 : 2)}s`;
  const minutes = Math.floor(value / 60);
  const seconds = value % 60;
  return `${minutes}m ${seconds.toFixed(1)}s`;
}

function Meta({ label, value, title, tone = C.textSecondary }: { label: string; value: string; title?: string; tone?: string }) {
  return (
    <div className="grid grid-cols-[92px_minmax(0,1fr)] gap-2 text-[11px] leading-snug">
      <div className="truncate uppercase tracking-wider" style={{ color: C.textMuted }} title={label}>{label}</div>
      <div className="break-words" style={{ color: tone }} title={title}>{value}</div>
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

function toneForValidationStatus(status: string) {
  if (status === "blocked") return C.danger;
  if (status === "needs_review") return C.warning;
  if (status === "looks_consistent" || status === "validated_for_local_use") return C.success;
  return C.textMuted;
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
  options: readonly SelectOption[];
}) {
  return (
    <UiSelect value={value} onValueChange={onChange} aria-label={label}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={`${option.value}-${option.label}`} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </UiSelect>
  );
}

function LinkSelect({
  label,
  searchLabel,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  value,
  onChange,
  options,
  emptyLabel,
}: {
  label: string;
  searchLabel: string;
  searchPlaceholder: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  value: string;
  onChange: (value: string) => void;
  options: readonly SelectOption[];
  emptyLabel: string;
}) {
  const hasVisibleMatches = options.length > 1;

  return (
    <div className="grid gap-1">
      <AppSelect label={label} value={value} onChange={onChange} options={options} />
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

function List({ title, tone, items }: { title: string; tone: string; items: string[] }) {
  return (
    <div className="mb-2 last:mb-0">
      <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: tone }}>{title}</div>
      <ul className="grid gap-0.5" style={{ color: C.textMuted }}>
        {items.map((item) => (
          <li key={item} className="text-[11px] leading-snug">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
