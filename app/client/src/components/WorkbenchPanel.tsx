import { useEffect, useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import { cerebroColors as C } from "@/lib/keepConfig";

type EvidenceKind = "all" | "manual_note" | "image_review" | "video_frame" | "annotation" | "validation_note" | "terminal_output";
type PermissionClass = "manual_note" | "media_review" | "annotation" | "validation";
type ValidatorAgent = "oak" | "spock";
type ValidationNoteStatus = "needs_review" | "looks_consistent" | "blocked" | "validated_for_local_use";
type EvidenceGroupBy = "project" | "task" | "session" | "kind" | "source" | "command" | "artifact" | "validation_status";

type TemporaryMediaPreview = {
  name: string;
  type: string;
  size: number;
  kind: "image" | "video";
  url: string;
  durationSec: number | null;
};

export default function WorkbenchPanel({ onClose }: { onClose: () => void }) {
  const plan = trpc.workbench.plan.useQuery();
  const projects = trpc.projectIntelligence.overview.useQuery();
  const linkOptions = trpc.workbench.linkOptions.useQuery();
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
  const utils = trpc.useUtils();
  const createEvidence = trpc.workbench.createEvidence.useMutation({
    onSuccess: () => utils.workbench.evidence.invalidate(),
  });
  const createValidationNote = trpc.workbench.createValidationNote.useMutation({
    onSuccess: () => {
      utils.workbench.evidence.invalidate();
      if (selectedEvidenceId != null) utils.workbench.evidenceDetail.invalidate({ id: selectedEvidenceId });
    },
  });
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<number | null>(null);
  const evidenceDetail = trpc.workbench.evidenceDetail.useQuery(
    { id: selectedEvidenceId ?? 0 },
    { enabled: selectedEvidenceId != null },
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
  const [sourceId, setSourceId] = useState<number | "none">("none");
  const [commandObservationId, setCommandObservationId] = useState<number | "none">("none");
  const [artifactId, setArtifactId] = useState<number | "none">("none");
  const [temporaryMedia, setTemporaryMedia] = useState<TemporaryMediaPreview | null>(null);
  const [mediaFrameTimeSec, setMediaFrameTimeSec] = useState("");
  const data = plan.data;
  const projectOptions = useMemo(
    () => (projects.data?.projects ?? []).filter((project) => project.tasks.projectId != null),
    [projects.data?.projects],
  );

  useEffect(() => {
    const url = temporaryMedia?.url;
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [temporaryMedia?.url]);

  function clearTemporaryMedia() {
    if (temporaryMedia) URL.revokeObjectURL(temporaryMedia.url);
    setTemporaryMedia(null);
    setMediaFrameTimeSec("");
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
      "The media bytes are only previewed in this browser session. Saving evidence stores metadata and notes only.",
    ].join("\n"));
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
          clearTemporaryMedia();
        },
      },
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background: C.background, color: C.textPrimary }}>
      <header className="shrink-0 px-5 py-4" style={{ borderBottom: `1px solid ${C.borderSoft}`, background: C.backgroundSoft }}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest">Workbench</h2>
            <p className="text-xs mt-1" style={{ color: C.textMuted }}>
              Visible evidence shell. Planning only.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close workbench"
            className="px-2 py-1 text-xs font-semibold uppercase rounded"
            style={{ border: `1px solid ${C.borderSoft}`, color: C.textSecondary }}
          >
            Close
          </button>
        </div>
        <div role="status" aria-live="polite" className="mt-3 text-xs" style={{ color: C.textMuted }}>
          {plan.isLoading ? "Reading workbench policy." : "Workbench policy loaded. No browser or media tools started."}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4" aria-label="Workbench plan" aria-busy={plan.isLoading}>
        {!data ? (
          <div className="rounded p-4 text-sm" style={{ background: C.surface, border: `1px solid ${C.borderSoft}`, color: C.textMuted }}>
            Loading workbench plan.
          </div>
        ) : (
          <div className="grid gap-4">
            <section className="rounded p-4" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
              <div className="flex flex-wrap gap-2 mb-3">
                <Chip label={data.mode.replace(/_/g, " ")} tone={C.warning} />
                <Chip label={data.opensBrowser ? "browser opens" : "no browser"} tone={C.success} />
                <Chip label={data.capturesMedia ? "media capture" : "no media capture"} tone={C.success} />
                <Chip label={data.writesExternal ? "external writes" : "no external writes"} tone={C.success} />
              </div>
              <p className="text-sm leading-relaxed" style={{ color: C.textSecondary }}>
                {data.summary}
              </p>
            </section>

            <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4" aria-label="Workbench surfaces">
              {data.surfaces.map((surface) => (
                <article key={surface.id} className="rounded p-3" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: C.textPrimary }}>{surface.label}</h3>
                    <Chip label={surface.status.replace(/_/g, " ")} tone={surface.status === "partially_live" ? C.accent : C.textMuted} />
                  </div>
                  <div className="mt-2 text-[11px] uppercase tracking-wider" style={{ color: C.gold }}>
                    {surface.ownerAgent}
                  </div>
                  <p className="mt-2 text-xs leading-relaxed" style={{ color: C.textMuted }}>
                    {surface.permission}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {surface.records.slice(0, 5).map((record) => (
                      <Chip key={record} label={record.replace(/_/g, " ")} tone={C.textMuted} />
                    ))}
                  </div>
                </article>
              ))}
            </section>

            <section className="grid gap-3 lg:grid-cols-2" aria-label="Workbench permissions">
              {data.permissionModel.map((item) => (
                <article key={item.class} className="rounded p-3" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
                  <h3 className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: C.textPrimary }}>
                    {item.class.replace(/_/g, " ")}
                  </h3>
                  <List title="Allowed" tone={C.success} items={item.allowed} />
                  <List title="Blocked" tone={C.danger} items={item.blocked} />
                </article>
              ))}
            </section>

            <section className="rounded p-4" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
              <h3 className="text-xs font-bold uppercase tracking-widest mb-2">Evidence Record</h3>
              <div className="flex flex-wrap gap-1 mb-3">
                {data.evidenceRecordShape.required.map((field) => (
                  <Chip key={field} label={field.replace(/_/g, " ")} tone={C.accent} />
                ))}
              </div>
              <p className="text-xs leading-relaxed" style={{ color: C.textMuted }}>
                {data.evidenceRecordShape.note}
              </p>
            </section>

            <section className="rounded p-4" aria-label="Create local Workbench evidence" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
              <div className="flex items-center justify-between gap-3 mb-3">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest">Add Evidence</h3>
                  <p className="text-xs mt-1" style={{ color: C.textMuted }}>
                    Manual local record. Append-only. No capture.
                  </p>
                </div>
                <Chip label="local db" tone={C.success} />
              </div>

              <div className="grid gap-2 md:grid-cols-[160px_minmax(0,1fr)]">
                <select
                  value={kind}
                  onChange={(event) => {
                    const nextKind = event.target.value as EvidenceKind;
                    setKind(nextKind);
                    if (nextKind === "image_review" || nextKind === "video_frame") setPermissionClass("media_review");
                    if (nextKind === "annotation") setPermissionClass("annotation");
                    if (nextKind === "validation_note") setPermissionClass("validation");
                  }}
                  aria-label="Evidence kind"
                  className="px-3 py-2 rounded text-xs outline-none"
                  style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}`, color: C.textPrimary }}
                >
                  <option value="manual_note">Manual note</option>
                  <option value="image_review">Image review note</option>
                  <option value="video_frame">Video frame note</option>
                  <option value="annotation">Annotation note</option>
                  <option value="validation_note">Validation note</option>
                  <option value="terminal_output">Terminal output note</option>
                </select>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Evidence title."
                  aria-label="Evidence title"
                  className="px-3 py-2 rounded text-xs outline-none"
                  style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}`, color: C.textPrimary }}
                />
                <select
                  value={projectId}
                  onChange={(event) => setProjectId(event.target.value === "none" ? "none" : Number(event.target.value))}
                  aria-label="Evidence project link"
                  className="px-3 py-2 rounded text-xs outline-none"
                  style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}`, color: C.textPrimary }}
                >
                  <option value="none">No project</option>
                  {projectOptions.map((project) => (
                    <option key={project.slug} value={project.tasks.projectId ?? ""}>
                      {project.name}
                    </option>
                  ))}
                </select>
                <input
                  value={targetUri}
                  onChange={(event) => setTargetUri(event.target.value)}
                  placeholder="Optional target URL, file path, artifact id, or panel."
                  aria-label="Evidence target"
                  className="px-3 py-2 rounded text-xs outline-none"
                  style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}`, color: C.textPrimary }}
                />
                <select
                  value={taskId}
                  onChange={(event) => setTaskId(event.target.value === "none" ? "none" : Number(event.target.value))}
                  aria-label="Link evidence to local task"
                  className="px-3 py-2 rounded text-xs outline-none"
                  style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}`, color: C.textPrimary }}
                >
                  <option value="none">No task link</option>
                  {(linkOptions.data?.tasks ?? [])
                    .filter((task) => projectId === "none" || task.projectId === projectId)
                    .map((task) => (
                      <option key={task.id} value={task.id}>
                        #{task.id} {task.projectName ?? "unlinked"} {task.status} {task.title}
                      </option>
                    ))}
                </select>
                <select
                  value={sessionId}
                  onChange={(event) => setSessionId(event.target.value === "none" ? "none" : Number(event.target.value))}
                  aria-label="Link evidence to local session"
                  className="px-3 py-2 rounded text-xs outline-none"
                  style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}`, color: C.textPrimary }}
                >
                  <option value="none">No session link</option>
                  {(linkOptions.data?.sessions ?? [])
                    .filter((session) => projectId === "none" || session.projectId === projectId)
                    .map((session) => (
                      <option key={session.id} value={session.id}>
                        #{session.id} {session.projectName ?? "unlinked"} {session.endedAt == null ? "live" : "ended"} {session.claudeSessionId}
                      </option>
                    ))}
                </select>
                <select
                  value={routeAgent}
                  onChange={(event) => setRouteAgent(event.target.value)}
                  aria-label="Route evidence to agent"
                  className="px-3 py-2 rounded text-xs outline-none"
                  style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}`, color: C.textPrimary }}
                >
                  <option value="gojo">Gojo</option>
                  <option value="surfer">Surfer</option>
                  <option value="tony">Tony</option>
                  <option value="oak">Professor Oak</option>
                  <option value="spock">Spock</option>
                  <option value="aang">Aang</option>
                  <option value="cortana">Cortana</option>
                </select>
                <select
                  value={sourceId}
                  onChange={(event) => setSourceId(event.target.value === "none" ? "none" : Number(event.target.value))}
                  aria-label="Link evidence to saved source"
                  className="px-3 py-2 rounded text-xs outline-none"
                  style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}`, color: C.textPrimary }}
                >
                  <option value="none">No source link</option>
                  {(linkOptions.data?.sources ?? []).map((source) => (
                    <option key={source.id} value={source.id}>
                      #{source.id} {source.projectId == null ? "unlinked" : `project ${source.projectId}`} {source.trustLevel}/{source.freshnessStatus} {source.title ?? source.uri}
                    </option>
                  ))}
                </select>
                <select
                  value={commandObservationId}
                  onChange={(event) => setCommandObservationId(event.target.value === "none" ? "none" : Number(event.target.value))}
                  aria-label="Link evidence to command observation"
                  className="px-3 py-2 rounded text-xs outline-none"
                  style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}`, color: C.textPrimary }}
                >
                  <option value="none">No command link</option>
                  {(linkOptions.data?.commandObservations ?? []).map((command) => (
                    <option key={command.id} value={command.id}>
                      #{command.id} {command.status}/{command.risk} {command.projectId == null ? "unlinked" : `project ${command.projectId}`} {command.command.slice(0, 80)}
                    </option>
                  ))}
                </select>
                <select
                  value={artifactId}
                  onChange={(event) => setArtifactId(event.target.value === "none" ? "none" : Number(event.target.value))}
                  aria-label="Link evidence to local artifact"
                  className="px-3 py-2 rounded text-xs outline-none"
                  style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}`, color: C.textPrimary }}
                >
                  <option value="none">No artifact link</option>
                  {(linkOptions.data?.artifacts ?? [])
                    .filter((artifact) => projectId === "none" || artifact.projectId === projectId)
                    .map((artifact) => (
                      <option key={artifact.id} value={artifact.id}>
                        #{artifact.id} {artifact.lifecycleState} {artifact.title ?? artifact.storagePath}
                      </option>
                    ))}
                </select>
                <select
                  value={permissionClass}
                  onChange={(event) => setPermissionClass(event.target.value as PermissionClass)}
                  aria-label="Evidence permission class"
                  className="px-3 py-2 rounded text-xs outline-none"
                  style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}`, color: C.textPrimary }}
                >
                  <option value="manual_note">Manual note</option>
                  <option value="media_review">Media review</option>
                  <option value="annotation">Annotation</option>
                  <option value="validation">Validation</option>
                </select>
                <input
                  value={viewport}
                  onChange={(event) => setViewport(event.target.value)}
                  placeholder="Viewport, such as 1440x900."
                  aria-label="Evidence viewport"
                  className="px-3 py-2 rounded text-xs outline-none"
                  style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}`, color: C.textPrimary }}
                />
                <input
                  value={coordinates}
                  onChange={(event) => setCoordinates(event.target.value)}
                  placeholder="Coordinates, such as x=120 y=80 w=300 h=140."
                  aria-label="Evidence coordinates"
                  className="px-3 py-2 rounded text-xs outline-none"
                  style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}`, color: C.textPrimary }}
                />
                <input
                  value={annotationText}
                  onChange={(event) => setAnnotationText(event.target.value)}
                  placeholder="Annotation note, optional."
                  aria-label="Evidence annotation text"
                  className="md:col-span-2 px-3 py-2 rounded text-xs outline-none"
                  style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}`, color: C.textPrimary }}
                />
                <textarea
                  value={summary}
                  onChange={(event) => setSummary(event.target.value)}
                  placeholder="What is visible, what matters, and which agent should care."
                  aria-label="Evidence summary"
                  className="md:col-span-2 min-h-24 px-3 py-2 rounded text-xs outline-none resize-y"
                  style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}`, color: C.textPrimary }}
                />
              </div>
              <div
                className="mt-3 rounded p-3"
                aria-label="Temporary image intake"
                onDragOver={(event) => {
                  event.preventDefault();
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  stageTemporaryMedia(event.dataTransfer.files.item(0));
                }}
                style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest" style={{ color: C.textPrimary }}>
                      Temporary Image
                    </h4>
                    <p className="text-xs mt-1 leading-relaxed" style={{ color: C.textMuted }}>
                      Browser-memory preview. No upload. No vault save. No vision model.
                    </p>
                  </div>
                  <label
                    className="inline-flex cursor-pointer items-center rounded px-3 py-2 text-xs font-semibold uppercase tracking-wider"
                    style={{ background: C.surface, border: `1px solid ${C.borderSoft}`, color: C.textSecondary }}
                  >
                    Choose Media
                    <input
                      type="file"
                      accept="image/*,video/*"
                      className="sr-only"
                      aria-label="Choose temporary Workbench media"
                      onChange={(event) => {
                        stageTemporaryMedia(event.target.files?.item(0) ?? null);
                        event.currentTarget.value = "";
                      }}
                    />
                  </label>
                </div>
                {temporaryMedia ? (
                  <div className="mt-3 grid gap-3 md:grid-cols-[180px_minmax(0,1fr)]">
                    <div className="overflow-hidden rounded" style={{ border: `1px solid ${C.borderSoft}`, background: C.background }}>
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
                    </div>
                    <div className="grid content-start gap-2">
                      <div className="flex flex-wrap gap-1">
                        <Chip label={temporaryMedia.kind} tone={C.accent} />
                        <Chip label={temporaryMedia.type} tone={C.accent} />
                        <Chip label={formatBytes(temporaryMedia.size)} tone={C.textMuted} />
                        {temporaryMedia.durationSec != null && <Chip label={`${formatSeconds(temporaryMedia.durationSec)} duration`} tone={C.textMuted} />}
                        <Chip label="temporary" tone={C.warning} />
                      </div>
                      <div className="text-xs leading-relaxed break-words" style={{ color: C.textSecondary }}>
                        {temporaryMedia.name}
                      </div>
                      {temporaryMedia.kind === "video" && (
                        <input
                          value={mediaFrameTimeSec}
                          onChange={(event) => setMediaFrameTimeSec(event.target.value)}
                          inputMode="decimal"
                          placeholder="Frame time in seconds."
                          aria-label="Video frame time in seconds"
                          className="px-2 py-1.5 rounded text-xs outline-none"
                          style={{ background: C.surface, border: `1px solid ${C.borderSoft}`, color: C.textPrimary }}
                        />
                      )}
                      <div className="text-xs leading-relaxed" style={{ color: C.textMuted }}>
                        Saving the evidence row records title, notes, frame timing, and target metadata. It does not save the media bytes.
                      </div>
                      <button
                        type="button"
                        onClick={clearTemporaryMedia}
                        aria-label="Clear temporary Workbench media"
                        className="w-fit rounded px-2 py-1.5 text-xs font-semibold uppercase tracking-wider"
                        style={{ background: C.surface, border: `1px solid ${C.borderSoft}`, color: C.textMuted }}
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 rounded px-3 py-3 text-xs" style={{ background: C.surface, border: `1px solid ${C.borderSoft}`, color: C.textMuted }}>
                    Drop an image or video here, or choose one. The selected file stays temporary until a later approved durable-save flow exists.
                  </div>
                )}
              </div>
              <div className="mt-3 flex items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-xs" style={{ color: C.textMuted }}>
                  <input
                    type="checkbox"
                    checked={sensitive}
                    onChange={(event) => setSensitive(event.target.checked)}
                    aria-label="Mark evidence as sensitive"
                  />
                  Sensitive
                </label>
                <div role="status" aria-live="polite" className="text-xs flex-1" style={{ color: C.textMuted }}>
                  {createEvidence.data?.ok ? `Saved evidence #${createEvidence.data.evidence.id}. No external action.` : "Evidence records append. They do not replace earlier notes."}
                </div>
                <button
                  type="button"
                  onClick={submitEvidence}
                  disabled={!title.trim() || !summary.trim() || createEvidence.isPending}
                  aria-label="Save local Workbench evidence"
                  className="px-3 py-2 rounded text-xs font-semibold uppercase tracking-wider"
                  style={{
                    background: title.trim() && summary.trim() && !createEvidence.isPending ? C.accentSoft : C.surfaceMuted,
                    border: `1px solid ${C.borderSoft}`,
                    color: title.trim() && summary.trim() && !createEvidence.isPending ? C.textPrimary : C.textMuted,
                  }}
                >
                  {createEvidence.isPending ? "Saving" : "Save Local Evidence"}
                </button>
              </div>
            </section>

            <section className="rounded p-4" aria-label="Recent Workbench evidence" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
              <div className="flex items-center justify-between gap-3 mb-3">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest">Recent Evidence</h3>
                  <p className="text-xs mt-1" style={{ color: C.textMuted }}>
                    Filter and inspect local records.
                  </p>
                </div>
                <Chip label={`${evidence.data?.summary.total ?? 0} shown`} tone={C.textMuted} />
              </div>
              <div className="grid gap-2 mb-3 md:grid-cols-[minmax(0,1fr)_160px_180px_auto]">
                <input
                  value={filterQuery}
                  onChange={(event) => setFilterQuery(event.target.value)}
                  placeholder="Search evidence."
                  aria-label="Search Workbench evidence"
                  className="px-3 py-2 rounded text-xs outline-none"
                  style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}`, color: C.textPrimary }}
                />
                <select
                  value={filterKind}
                  onChange={(event) => setFilterKind(event.target.value as EvidenceKind)}
                  aria-label="Filter evidence by kind"
                  className="px-3 py-2 rounded text-xs outline-none"
                  style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}`, color: C.textPrimary }}
                >
                  <option value="all">All kinds</option>
                  <option value="manual_note">Manual note</option>
                  <option value="image_review">Image review</option>
                  <option value="video_frame">Video frame</option>
                  <option value="annotation">Annotation</option>
                  <option value="validation_note">Validation</option>
                  <option value="terminal_output">Terminal</option>
                </select>
                <select
                  value={filterProjectId}
                  onChange={(event) => setFilterProjectId(event.target.value === "all" ? "all" : Number(event.target.value))}
                  aria-label="Filter evidence by project"
                  className="px-3 py-2 rounded text-xs outline-none"
                  style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}`, color: C.textPrimary }}
                >
                  <option value="all">All projects</option>
                  {projectOptions.map((project) => (
                    <option key={project.slug} value={project.tasks.projectId ?? ""}>
                      {project.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => {
                    setFilterQuery("");
                    setFilterKind("all");
                    setFilterProjectId("all");
                  }}
                  aria-label="Reset Workbench evidence filters"
                  className="px-3 py-2 rounded text-xs font-semibold uppercase tracking-wider"
                  style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}`, color: C.textMuted }}
                >
                  Reset
                </button>
              </div>
              <div className="mb-3 rounded p-3" aria-label="Workbench evidence groups" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}>
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest" style={{ color: C.textPrimary }}>
                      Evidence Groups
                    </h4>
                    <p className="text-xs mt-1" style={{ color: C.textMuted }}>
                      Local grouping. No source fetch. No command run.
                    </p>
                  </div>
                  <select
                    value={groupBy}
                    onChange={(event) => setGroupBy(event.target.value as EvidenceGroupBy)}
                    aria-label="Group Workbench evidence"
                    className="px-2 py-1.5 rounded text-xs outline-none"
                    style={{ background: C.surface, border: `1px solid ${C.borderSoft}`, color: C.textPrimary }}
                  >
                    <option value="project">Project</option>
                    <option value="task">Task</option>
                    <option value="session">Session</option>
                    <option value="kind">Kind</option>
                    <option value="source">Source</option>
                    <option value="command">Command</option>
                    <option value="artifact">Artifact</option>
                    <option value="validation_status">Validation status</option>
                  </select>
                </div>
                {(evidenceGroups.data?.gates ?? []).map((gate) => (
                  <div key={gate} className="mb-2 rounded px-2 py-1.5 text-xs" style={{ background: C.surface, border: `1px solid ${C.borderSoft}`, color: C.textMuted }}>
                    {gate}
                  </div>
                ))}
                {(evidenceGroups.data?.groups ?? []).length === 0 ? (
                  <div className="rounded px-2 py-2 text-xs" style={{ background: C.surface, border: `1px solid ${C.borderSoft}`, color: C.textMuted }}>
                    No groups match the current filters.
                  </div>
                ) : (
                  <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                    {evidenceGroups.data?.groups.map((group) => (
                      <button
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
                        aria-label={`Filter Workbench evidence by ${group.label}`}
                        className="rounded p-2 text-left"
                        style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}
                      >
                        <div className="text-xs font-semibold leading-snug break-words" style={{ color: C.textPrimary }}>
                          {group.label}
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1">
                          <Chip label={`${group.count} records`} tone={C.accent} />
                          <Chip label={`${group.validationNotes} validations`} tone={C.warning} />
                          {group.sensitive > 0 && <Chip label={`${group.sensitive} sensitive`} tone={C.danger} />}
                        </div>
                        <div className="mt-2 text-[11px]" style={{ color: C.textMuted }}>
                          Sample: {group.sampleIds.map((id) => `#${id}`).join(", ")}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {(evidence.data?.gates ?? []).map((gate) => (
                <div key={gate} className="mb-2 rounded px-3 py-2 text-xs" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}`, color: C.textMuted }}>
                  {gate}
                </div>
              ))}
              {(evidence.data?.items ?? []).length === 0 ? (
                <div className="rounded px-3 py-3 text-xs" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}`, color: C.textMuted }}>
                  No Workbench evidence records yet.
                </div>
              ) : (
                <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_360px]">
                  <div className="grid gap-2">
                    {evidence.data?.items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedEvidenceId(item.id)}
                      aria-label={`Inspect Workbench evidence ${item.id}`}
                      className="rounded p-3 text-left"
                      style={{
                        background: selectedEvidenceId === item.id ? C.surfaceRaised : C.surfaceMuted,
                        border: `1px solid ${selectedEvidenceId === item.id ? C.accent : C.borderSoft}`,
                      }}
                    >
                      <div className="flex flex-wrap items-center gap-1">
                        <Chip label={`#${item.id}`} tone={C.textMuted} />
                        <Chip label={item.kind.replace(/_/g, " ")} tone={C.accent} />
                        <Chip label={item.validationStatus.replace(/_/g, " ")} tone={C.warning} />
                        {item.projectName && <Chip label={item.projectName} tone={C.gold} />}
                        {item.routeAgent && <Chip label={`to ${item.routeAgent}`} tone={C.textMuted} />}
                        {item.mediaName && <Chip label="media metadata" tone={C.accent} />}
                        {item.mediaKind && <Chip label={item.mediaKind.replace(/_/g, " ")} tone={C.accent} />}
                        {item.mediaTemporary && <Chip label="temporary" tone={C.warning} />}
                        {item.sensitive && <Chip label="sensitive" tone={C.danger} />}
                      </div>
                      <div className="mt-2 text-xs font-semibold" style={{ color: C.textPrimary }}>{item.title}</div>
                      <p className="mt-1 text-xs leading-relaxed" style={{ color: C.textMuted }}>{item.summary}</p>
                      {item.targetUri && (
                        <div className="mt-2 text-[11px] break-all" style={{ color: C.textMuted }}>{item.targetUri}</div>
                      )}
                    </button>
                    ))}
                  </div>
                  <EvidenceDetailPanel
                    detail={evidenceDetail.data}
                    loading={evidenceDetail.isLoading}
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
                  />
                </div>
              )}
            </section>

            <section className="grid gap-2" aria-label="Workbench gates">
              {data.gates.map((gate) => (
                <div key={gate} className="rounded px-3 py-2 text-xs" style={{ background: C.surface, border: `1px solid ${C.borderSoft}`, color: C.textMuted }}>
                  {gate}
                </div>
              ))}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

function EvidenceDetailPanel({
  detail,
  loading,
  onCreateValidationNote,
  isCreatingValidationNote,
  validationSavedId,
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
          projectName: string | null;
          taskId: number | null;
          taskTitle: string | null;
          sessionId: number | null;
          sessionClaudeId: string | null;
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
          validationStatus: string;
          permissionPreflightId: number | null;
          createdAt: number;
        }>;
      }
    | undefined;
  loading: boolean;
  onCreateValidationNote?: (input: { evidenceId: number; validatorAgent: ValidatorAgent; status: ValidationNoteStatus; note: string }) => void;
  isCreatingValidationNote?: boolean;
  validationSavedId?: number | null;
}) {
  const [validatorAgent, setValidatorAgent] = useState<ValidatorAgent>("oak");
  const [validationStatus, setValidationStatus] = useState<ValidationNoteStatus>("needs_review");
  const [validationNote, setValidationNote] = useState("");
  if (loading) {
    return (
      <aside className="rounded p-3 text-xs" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}`, color: C.textMuted }}>
        Reading evidence detail.
      </aside>
    );
  }
  if (!detail) {
    return (
      <aside className="rounded p-3 text-xs" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}`, color: C.textMuted }}>
        Select an evidence record to inspect links, coordinates, and gates.
      </aside>
    );
  }
  if (!detail.found) {
    return (
      <aside className="rounded p-3 text-xs" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}`, color: C.textMuted }}>
        {detail.gates[0]}
      </aside>
    );
  }
  const item = detail.evidence;
  return (
    <aside className="rounded p-3" aria-label="Workbench evidence detail" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}>
      <div className="flex flex-wrap gap-1 mb-3">
        <Chip label={`#${item.id}`} tone={C.textMuted} />
        <Chip label={item.kind.replace(/_/g, " ")} tone={C.accent} />
        <Chip label={item.permissionClass.replace(/_/g, " ")} tone={C.gold} />
        {item.sensitive && <Chip label="sensitive" tone={C.danger} />}
      </div>
      <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: C.textPrimary }}>{item.title}</h3>
      <p className="mt-2 text-xs leading-relaxed" style={{ color: C.textMuted }}>{item.summary}</p>
      <div className="mt-3 grid gap-2">
        <Meta label="Owner" value={item.ownerAgent} />
        <Meta label="Route Agent" value={item.routeAgent ?? "unrouted"} />
        <Meta label="Project" value={item.projectName ?? "unlinked"} />
        <Meta label="Task" value={item.taskTitle ?? (item.taskId == null ? "unlinked" : `Task #${item.taskId}`)} />
        <Meta label="Session" value={item.sessionClaudeId ?? (item.sessionId == null ? "unlinked" : `Session #${item.sessionId}`)} />
        <Meta label="Source" value={item.sourceTitle ?? item.sourceUri ?? (item.sourceId == null ? "unlinked" : `Source #${item.sourceId}`)} />
        <Meta label="Command" value={item.command ?? (item.commandObservationId == null ? "unlinked" : `Command observation #${item.commandObservationId}`)} />
        <Meta label="Artifact" value={item.artifactTitle ?? item.artifactPath ?? (item.artifactId == null ? "unlinked" : `Artifact #${item.artifactId}`)} />
        <Meta label="Target" value={item.targetUri ?? "none"} />
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
      </div>
      <div className="mt-3 rounded p-3" aria-label="Workbench permission preflight" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
        <h4 className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: C.textPrimary }}>
          Permission Preflight
        </h4>
        {detail.permissionPreflight == null ? (
          <div className="text-xs leading-relaxed" style={{ color: C.textMuted }}>
            No linked permission preflight record exists for this evidence yet.
          </div>
        ) : (
          <div className="grid gap-2">
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
                <li key={reason} className="text-xs leading-relaxed">
                  {reason}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="mt-3 grid gap-2">
        {detail.gates.map((gate) => (
          <div key={gate} className="rounded px-2 py-1.5 text-xs" style={{ background: C.surface, border: `1px solid ${C.borderSoft}`, color: C.textMuted }}>
            {gate}
          </div>
        ))}
      </div>
      <div className="mt-3 rounded p-3" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
        <h4 className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: C.textPrimary }}>
          Validation History
        </h4>
        {detail.validationHistory.length === 0 ? (
          <div className="text-xs leading-relaxed" style={{ color: C.textMuted }}>
            No appended validation notes for this evidence yet.
          </div>
        ) : (
          <div className="grid gap-2">
            {detail.validationHistory.map((entry) => (
              <article key={entry.id} className="rounded p-2" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}>
                <div className="flex flex-wrap gap-1">
                  <Chip label={`#${entry.id}`} tone={C.textMuted} />
                  <Chip label={entry.ownerAgent} tone={C.accent} />
                  <Chip label={entry.validationStatus.replace(/_/g, " ")} tone={C.warning} />
                  {entry.permissionPreflightId != null && <Chip label={`preflight #${entry.permissionPreflightId}`} tone={C.textMuted} />}
                  <Chip label={formatTimestamp(entry.createdAt)} tone={C.textMuted} />
                </div>
                <p className="mt-2 text-xs leading-relaxed" style={{ color: C.textMuted }}>{entry.summary}</p>
              </article>
            ))}
          </div>
        )}
      </div>
      <div className="mt-3 rounded p-3" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
        <h4 className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: C.textPrimary }}>
          Append Validation Note
        </h4>
        <div className="grid gap-2">
          <select
            value={validatorAgent}
            onChange={(event) => setValidatorAgent(event.target.value as ValidatorAgent)}
            aria-label="Validator agent"
            className="px-2 py-1.5 rounded text-xs outline-none"
            style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}`, color: C.textPrimary }}
          >
            <option value="oak">Professor Oak</option>
            <option value="spock">Spock</option>
          </select>
          <select
            value={validationStatus}
            onChange={(event) => setValidationStatus(event.target.value as ValidationNoteStatus)}
            aria-label="Validation note status"
            className="px-2 py-1.5 rounded text-xs outline-none"
            style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}`, color: C.textPrimary }}
          >
            <option value="needs_review">Needs review</option>
            <option value="looks_consistent">Looks consistent</option>
            <option value="blocked">Blocked</option>
            <option value="validated_for_local_use">Validated for local use</option>
          </select>
          <textarea
            value={validationNote}
            onChange={(event) => setValidationNote(event.target.value)}
            aria-label="Validation note"
            placeholder="Local validation note. This appends a new evidence record."
            className="min-h-20 px-2 py-1.5 rounded text-xs outline-none resize-y"
            style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}`, color: C.textPrimary }}
          />
          <div className="flex items-center justify-between gap-2">
            <div role="status" aria-live="polite" className="text-[11px]" style={{ color: C.textMuted }}>
              {validationSavedId ? `Saved note #${validationSavedId}.` : "Original evidence is not overwritten."}
            </div>
            <button
              type="button"
              disabled={!validationNote.trim() || isCreatingValidationNote}
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
              className="px-2 py-1.5 rounded text-xs font-semibold uppercase tracking-wider"
              style={{
                background: validationNote.trim() && !isCreatingValidationNote ? C.accentSoft : C.surfaceMuted,
                border: `1px solid ${C.borderSoft}`,
                color: validationNote.trim() && !isCreatingValidationNote ? C.textPrimary : C.textMuted,
              }}
            >
              {isCreatingValidationNote ? "Saving" : "Append"}
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

function formatTimestamp(value: number) {
  if (!Number.isFinite(value)) return "unknown time";
  return new Date(value * 1000).toLocaleString();
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

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider" style={{ color: C.textMuted }}>{label}</div>
      <div className="text-xs leading-snug break-words" style={{ color: C.textSecondary }}>{value}</div>
    </div>
  );
}

function Chip({ label, tone }: { label: string; tone: string }) {
  return (
    <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider" style={{ background: `${tone}22`, color: tone }}>
      {label}
    </span>
  );
}

function List({ title, tone, items }: { title: string; tone: string; items: string[] }) {
  return (
    <div className="mb-3 last:mb-0">
      <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: tone }}>{title}</div>
      <ul className="grid gap-1" style={{ color: C.textMuted }}>
        {items.map((item) => (
          <li key={item} className="text-xs leading-relaxed">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
