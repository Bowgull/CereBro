import { useEffect, useMemo, useState } from "react";
import type React from "react";
import { trpc } from "@/lib/trpc";
import { compactCommandLabel, compactPathLabel, sourceDisplayName } from "@/lib/displayLabels";
import { cerebroColors as C } from "@/lib/keepConfig";
import { disambiguateSessionOptions } from "@/lib/sessionLabels";
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
  const [groupBy, setGroupBy] = useState<EvidenceGroupBy>("project");
  const evidence = trpc.workbench.evidence.useQuery({
    limit: 30,
    kind: filterKind === "all" ? undefined : filterKind,
    projectId: filterProjectId === "all" ? undefined : filterProjectId,
    query: filterQuery.trim() || undefined,
  });
  const evidenceGroups = trpc.workbench.evidenceGroups.useQuery({
    groupBy,
    kind: filterKind === "all" ? undefined : filterKind,
    projectId: filterProjectId === "all" ? undefined : filterProjectId,
    query: filterQuery.trim() || undefined,
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
    <div className="flex h-full flex-col overflow-hidden" style={{ background: C.background, border: `1px solid ${C.borderSoft}`, color: C.textPrimary }}>
      <header className="shrink-0 px-3 py-2" style={{ borderBottom: `1px solid ${C.borderSoft}`, background: C.backgroundSoft }}>
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
          <div className="rounded p-4 text-sm" style={{ background: C.surface, border: `1px solid ${C.borderSoft}`, color: C.textMuted }}>
            Loading workbench plan.
          </div>
        ) : (
          <div className="grid gap-2">
            <section className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 xl:grid-cols-[0.95fr_repeat(4,1fr)]" aria-label="Workbench receipt lanes">
              <div className="rounded p-2 sm:col-span-2 xl:col-span-1" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
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
                    background: kind === lane.kind ? C.surfaceRaised : C.surface,
                    border: `1px solid ${kind === lane.kind ? lane.tone : C.borderSoft}`,
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

            <details
              className="rounded p-2"
              aria-label="Project receipt grouping"
              onToggle={(event) => setProjectProofOpen(event.currentTarget.open)}
              style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}
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
                <div className="rounded px-2 py-2 text-[11px]" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}`, color: C.textMuted }}>
                  {projectReceiptCopy.loadingText}
                </div>
              ) : projectProofGroups.length === 0 ? (
                <div className="rounded px-2 py-2 text-[11px] leading-snug" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}`, color: C.textMuted }}>
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
                      style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}
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

            <section className="rounded p-2" aria-label="Create local Workbench receipt" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
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
                <div className="mb-2 rounded p-1.5 text-[11px] leading-snug" style={{ background: C.surfaceMuted, border: `1px solid ${C.gold}66`, color: C.textSecondary }}>
                  <span className="font-semibold uppercase tracking-wider" style={{ color: C.gold }}>{receiptBodyCopy.draftPrefix}</span> {receiptBodyCopy.draftText}
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
                  style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}
                >
                  <summary className="cursor-pointer text-[10px] font-bold uppercase tracking-widest" style={{ color: C.textPrimary }}>
                    Receipt Links
                  </summary>
                  <div className="mt-2 rounded px-2 py-1.5 text-[11px]" style={{ background: C.surface, border: `1px solid ${C.borderSoft}`, color: C.textMuted }}>
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

                <details className="rounded p-2" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}>
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
              <div className="mb-2 grid grid-cols-1 gap-1.5 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_160px_180px_auto]">
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
                  onClick={() => {
                    setFilterQuery("");
                    setFilterKind("all");
                    setFilterProjectId("all");
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
    <section className="rounded p-1.5" aria-label={copy.ariaLabel} style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
      <div className="grid gap-1 md:grid-cols-3">
        {steps.map((step) => (
          <div key={step.label} className="min-w-0 rounded px-1.5 py-1" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}>
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
        knowledgeRoute: {
          projectBridgePath: string;
          repositorySourcePath: string;
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
      <aside className="rounded p-2 text-[11px]" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}`, color: C.textMuted }}>
        Reading receipt body.
      </aside>
    );
  }
  if (!detail) {
    return (
      <aside className="rounded p-2 text-[11px]" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}`, color: C.textMuted }}>
        Select a receipt to inspect body, links, coordinates, and gates.
      </aside>
    );
  }
  if (!detail.found) {
    return (
      <aside className="rounded p-2 text-[11px]" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}`, color: C.textMuted }}>
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
    { label: "Validation", value: validationLabel, tone: toneForValidationStatus(item.validationStatus) },
    { label: "Ledger", value: ledgerLabel, tone: C.gold },
    { label: "Next", value: nextAction, tone: C.textSecondary },
  ];
  return (
    <aside className="rounded p-2" aria-label="Workbench receipt body" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}>
      <div className="mb-2 flex flex-wrap gap-1">
        <Chip label={`#${item.id}`} tone={C.textMuted} />
        <Chip label={workbenchReceiptKindLabel(item.kind)} tone={C.accent} />
        <Chip label={workbenchPermissionLabel(item.permissionClass)} tone={C.gold} />
        {item.sensitive && <Chip label="sensitive" tone={C.danger} />}
      </div>
      <h3 className="text-[11px] font-bold uppercase tracking-widest" style={{ color: C.textPrimary }}>{item.title}</h3>
      <p className="mt-1 text-[11px] leading-snug" style={{ color: C.textMuted }}>{workbenchReceiptRowSummary(item.summary)}</p>
      <div className="mt-2 rounded p-2" aria-label="Workbench receipt read" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
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
      </div>
      {detail.knowledgeRoute && (
        <details className="mt-2 rounded p-2" aria-label="Workbench project knowledge route" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
          <summary className="cursor-pointer text-[10px] font-bold uppercase tracking-widest" style={{ color: C.textPrimary }}>
            Knowledge Route
          </summary>
          <div className="mt-2 flex flex-wrap gap-1">
            <Chip label="read only" tone={C.gold} />
          </div>
          <div className="grid gap-1">
            <Meta label="Bridge" value={detail.knowledgeRoute.projectBridgePath} tone={C.success} />
            <Meta label="Source" value={detail.knowledgeRoute.repositorySourcePath} tone={C.accent} />
            <Meta label="Archive" value={`${detail.knowledgeRoute.archiveLane} / ${detail.knowledgeRoute.archiveRetrieval.replace(/_/g, " ")}`} tone={C.warning} />
            <Meta
              label="Writes"
              value={detail.knowledgeRoute.writesExternalSystems ? "enabled" : "approval gated"}
              tone={detail.knowledgeRoute.writesExternalSystems ? C.danger : C.gold}
            />
          </div>
          <div className="mt-2 text-[11px] leading-snug" style={{ color: C.textMuted }}>
            {detail.knowledgeRoute.approvalGate}
          </div>
        </details>
      )}
      <details className="mt-2 rounded p-2" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
        <summary className="cursor-pointer text-[10px] font-bold uppercase tracking-widest" style={{ color: C.textPrimary }}>
          Receipt Metadata
        </summary>
        <div className="mt-2 grid gap-1">
          <Meta label="Owner" value={item.ownerAgent} />
          <Meta label="Route Agent" value={item.routeAgent ?? "unrouted"} />
          <Meta label="Project" value={item.projectName ?? "unlinked"} />
          <Meta label="Task" value={item.taskTitle ?? (item.taskId == null ? "unlinked" : `Task #${item.taskId}`)} />
          <Meta label="Session" value={item.sessionDisplayName ?? (item.sessionId == null ? "unlinked" : `Run #${item.sessionId}`)} />
          <Meta
            label="Source"
            value={item.sourceTitle ?? (item.sourceUri ? sourceDisplayName(item.sourceUri) : item.sourceId == null ? "unlinked" : `Source #${item.sourceId}`)}
            title={item.sourceUri ?? undefined}
          />
          <Meta
            label="Command"
            value={item.command ? compactCommandLabel(item.command) : item.commandObservationId == null ? "unlinked" : `Command observation #${item.commandObservationId}`}
            title={item.command ?? undefined}
          />
          <Meta
            label="Artifact"
            value={item.artifactTitle ?? (item.artifactPath ? compactPathLabel(item.artifactPath) : item.artifactId == null ? "unlinked" : `Artifact #${item.artifactId}`)}
            title={item.artifactPath ?? undefined}
          />
          <Meta label="Target" value={item.targetUri ? sourceDisplayName(item.targetUri) : "none"} title={item.targetUri ?? undefined} />
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
          <Meta label="Viewport" value={item.viewport ?? "none"} />
          <Meta label="Coordinates" value={item.coordinates ?? "none"} />
          <Meta label="Annotation" value={item.annotationText ?? "none"} />
          <Meta label="Media Name" value={item.mediaName ?? "none"} />
          <Meta label="Media Kind" value={item.mediaKind == null ? "none" : item.mediaKind.replace(/_/g, " ")} />
          <Meta label="Media Type" value={item.mediaMimeType ?? "none"} />
          <Meta label="Media Size" value={item.mediaByteSize == null ? "none" : formatBytes(item.mediaByteSize)} />
          <Meta label="Frame Time" value={item.mediaFrameTimeSec == null ? "none" : formatSeconds(item.mediaFrameTimeSec)} />
          <Meta label="Duration" value={item.mediaDurationSec == null ? "none" : formatSeconds(item.mediaDurationSec)} />
          <Meta label="Media Storage" value={item.mediaTemporary ? "temporary browser preview only" : "not a temporary media record"} />
          <Meta label="Before Receipt" value={item.beforeEvidenceId == null ? "none" : `Receipt #${item.beforeEvidenceId}`} />
          <Meta label="After Receipt" value={item.afterEvidenceId == null ? "none" : `Receipt #${item.afterEvidenceId}`} />
          <Meta label="Comparison Result" value={item.comparisonResult ?? "none"} />
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
