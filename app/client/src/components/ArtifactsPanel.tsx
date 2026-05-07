import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { cerebroColors as C } from "@/lib/keepConfig";

const KIND_OPTIONS = [
  "all",
  "obsidian_note",
  "source_note",
  "creative_prompt",
  "reusable_prompt",
  "tool_handoff",
  "external_model_handoff",
  "message_draft",
  "message_sent",
  "message_capture",
  "session_handoff",
  "code_handoff",
  "qa_report",
  "model_test",
  "temp_file",
  "cleanup_report",
] as const;

type KindFilter = (typeof KIND_OPTIONS)[number];

const WRITE_KINDS = [
  "obsidian_note",
  "source_note",
  "creative_prompt",
  "reusable_prompt",
  "tool_handoff",
  "external_model_handoff",
  "message_draft",
  "cleanup_report",
] as const;

type WriteKind = (typeof WRITE_KINDS)[number];
type WritePolicy = "history" | "draft" | "report";

const WRITE_KIND_COPY: Record<WriteKind, { label: string; body: string; ownerAgent: string; policy: WritePolicy }> = {
  obsidian_note: {
    label: "Obsidian note",
    body: "Markdown note body",
    ownerAgent: "c3po",
    policy: "history",
  },
  source_note: {
    label: "Source note",
    body: "Summary, provenance notes, and useful excerpts",
    ownerAgent: "surfer",
    policy: "history",
  },
  creative_prompt: {
    label: "Creative prompt",
    body: "Prompt, references, usage notes, and selection criteria",
    ownerAgent: "gojo",
    policy: "history",
  },
  reusable_prompt: {
    label: "Reusable prompt",
    body: "Prompt, when to use it, why it worked, and how CereBro should adapt it",
    ownerAgent: "aang",
    policy: "history",
  },
  tool_handoff: {
    label: "Tool handoff",
    body: "Tool URL, use case, handoff prompt, approval notes, and limitations",
    ownerAgent: "surfer",
    policy: "history",
  },
  external_model_handoff: {
    label: "External model handoff",
    body: "Model/tool name, prompt, why external help is justified, and approval/cost notes",
    ownerAgent: "tony",
    policy: "history",
  },
  message_draft: {
    label: "Message draft",
    body: "Draft message body",
    ownerAgent: "hedwig",
    policy: "draft",
  },
  cleanup_report: {
    label: "Cleanup report",
    body: "Piccolo scan notes, proposed actions, and approval status",
    ownerAgent: "piccolo",
    policy: "report",
  },
};

function formatRelative(unixSec: number): string {
  const diff = Date.now() / 1000 - unixSec;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function stateColor(state: string): string {
  if (state === "published") return C.success;
  if (state === "review" || state === "inbox") return C.warning;
  if (state === "temp") return C.danger;
  if (state === "archived" || state === "superseded") return C.textMuted;
  return C.accent;
}

function writePolicyCopy(policy: WritePolicy): string {
  if (policy === "draft") return "Draft trail: same-title saves create timestamped versions.";
  if (policy === "report") return "Report history: each same-title save preserves earlier reports.";
  return "History save: same-title saves create timestamped versions.";
}

export default function ArtifactsPanel({ onClose }: { onClose: () => void }) {
  const utils = trpc.useUtils();
  const [kind, setKind] = useState<KindFilter>("all");
  const [writeKind, setWriteKind] = useState<WriteKind>("obsidian_note");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sourceUri, setSourceUri] = useState("");
  const [obsidianSubdir, setObsidianSubdir] = useState("indexes");
  const [lastWrite, setLastWrite] = useState<string | null>(null);
  const artifacts = trpc.artifacts.list.useQuery({
    kind: kind === "all" ? undefined : kind,
    limit: 200,
  });
  const writeVault = trpc.artifacts.writeTextToVault.useMutation({
    onSuccess: () => utils.artifacts.list.invalidate(),
  });
  const writeObsidian = trpc.memory.writeToObsidian.useMutation({
    onSuccess: () => utils.artifacts.list.invalidate(),
  });

  const rows = artifacts.data ?? [];
  const isWriting = writeVault.isPending || writeObsidian.isPending;
  const writeCopy = WRITE_KIND_COPY[writeKind];

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedBody = body.trim();
    const trimmedSourceUri = sourceUri.trim();
    const trimmedSubdir = obsidianSubdir.trim();
    if (!trimmedTitle || !trimmedBody) return;

    if (writeKind === "obsidian_note") {
      writeObsidian.mutate({
        title: trimmedTitle,
        body: trimmedBody,
        subdir: trimmedSubdir || undefined,
        approved: true,
      }, {
        onSuccess: (result) => {
          setLastWrite(result.ok ? `Saved Obsidian note: ${result.relativePath}` : result.reason ?? "Obsidian write failed.");
        },
      });
    } else {
      writeVault.mutate({
        kind: writeKind,
        title: trimmedTitle,
        body: trimmedBody,
        ownerAgent: writeCopy.ownerAgent,
        sourceUri: trimmedSourceUri || undefined,
        approved: true,
      }, {
        onSuccess: (result) => {
          setLastWrite(result.ok ? `Saved vault artifact: ${result.relativePath}` : result.reason ?? "Vault write failed.");
        },
      });
    }

    setTitle("");
    setBody("");
    setSourceUri("");
  }

  return (
    <div className="h-full flex flex-col" style={{ background: C.background }}>
      <div
        className="flex items-center justify-between px-4 py-2 shrink-0"
        style={{ borderBottom: `1px solid ${C.borderSoft}`, background: C.surface }}
      >
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: C.textMuted }}>
            Artifact Library
            <span className="ml-2" style={{ color: C.textSecondary }}>{rows.length}</span>
          </div>
          <div className="text-xs mt-0.5" style={{ color: C.textMuted }}>
            Metadata trail for saved notes, outputs, messages, reports, and vault files. History accumulates.
          </div>
        </div>
        <button onClick={onClose} className="text-xs uppercase tracking-wider" style={{ color: C.textMuted }}>
          Close
        </button>
      </div>

      <div className="flex items-center gap-1 px-4 py-2 shrink-0 flex-wrap" style={{ borderBottom: `1px solid ${C.borderSoft}` }}>
        {KIND_OPTIONS.map((k) => {
          const active = kind === k;
          return (
            <button
              key={k}
              onClick={() => setKind(k)}
              className="px-2 py-1 text-xs uppercase tracking-wider rounded whitespace-nowrap"
              style={{
                color: active ? C.textPrimary : C.textMuted,
                background: active ? C.surfaceRaised : "transparent",
                border: `1px solid ${active ? C.accentSoft : C.borderSoft}`,
              }}
            >
              {k.replace(/_/g, " ")}
            </button>
          );
        })}
      </div>

      <form onSubmit={submit} className="px-4 py-3 shrink-0 space-y-2" style={{ borderBottom: `1px solid ${C.borderSoft}` }}>
        <div className="grid grid-cols-1 md:grid-cols-[170px_minmax(0,1fr)_auto] gap-2">
          <select
            value={writeKind}
            onChange={(e) => setWriteKind(e.target.value as WriteKind)}
            className="px-2 py-1.5 text-xs rounded outline-none"
            style={{ background: C.surfaceMuted, color: C.textPrimary, border: `1px solid ${C.borderSoft}` }}
            aria-label="Artifact kind"
          >
            {WRITE_KINDS.map((k) => (
              <option key={k} value={k}>{WRITE_KIND_COPY[k].label}</option>
            ))}
          </select>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={`${writeCopy.label} title`}
            className="px-2 py-1.5 text-xs rounded outline-none"
            style={{ background: C.surfaceMuted, color: C.textPrimary, border: `1px solid ${C.borderSoft}` }}
          />
          <button
            type="submit"
            disabled={!title.trim() || !body.trim() || isWriting}
            className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded"
            style={{
              background: title.trim() && body.trim() ? C.accentSoft : C.surfaceMuted,
              color: title.trim() && body.trim() ? C.textPrimary : C.textMuted,
              border: `1px solid ${C.borderSoft}`,
            }}
          >
            {isWriting ? "Saving" : "Save"}
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_220px] gap-2">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={writeCopy.body}
            className="px-2 py-1.5 text-xs rounded outline-none resize-none min-h-20"
            style={{ background: C.surfaceMuted, color: C.textPrimary, border: `1px solid ${C.borderSoft}` }}
          />
          <div className="space-y-2">
            {writeKind === "obsidian_note" ? (
              <input
                value={obsidianSubdir}
                onChange={(e) => setObsidianSubdir(e.target.value)}
                placeholder="Obsidian subfolder"
                className="w-full px-2 py-1.5 text-xs rounded outline-none"
                style={{ background: C.surfaceMuted, color: C.textPrimary, border: `1px solid ${C.borderSoft}` }}
              />
            ) : (
              <input
                value={sourceUri}
                onChange={(e) => setSourceUri(e.target.value)}
                placeholder={writeKind === "source_note" ? "Source URL or file path" : "Optional source/context URI"}
                className="w-full px-2 py-1.5 text-xs rounded outline-none"
                style={{ background: C.surfaceMuted, color: C.textPrimary, border: `1px solid ${C.borderSoft}` }}
              />
            )}
            <div className="text-[10px] leading-relaxed" style={{ color: C.textMuted }}>
              Owner: {writeCopy.ownerAgent}. {writePolicyCopy(writeCopy.policy)}
            </div>
            <div className="text-[10px] leading-relaxed" style={{ color: C.textMuted }}>
              These controls save durable history/drafts/reports. Current-state updates need a separate explicit current-state writer.
            </div>
            {lastWrite && (
              <div className="text-[10px] leading-relaxed" style={{ color: C.textSecondary }}>
                {lastWrite}
              </div>
            )}
          </div>
        </div>
      </form>

      <div className="flex-1 overflow-y-auto">
        {artifacts.isLoading ? (
          <div className="px-4 py-3 text-xs" style={{ color: C.textMuted }}>Loading.</div>
        ) : rows.length === 0 ? (
          <div className="px-4 py-3 text-xs leading-relaxed" style={{ color: C.textMuted }}>
            No artifacts recorded for this filter yet. They appear as approved writes, Notion publishes,
            Obsidian notes, message drafts, and cleanup reports are saved.
          </div>
        ) : (
          rows.map((artifact) => {
            const color = stateColor(artifact.lifecycleState);
            return (
              <div
                key={artifact.id}
                className="grid grid-cols-1 md:grid-cols-[160px_120px_minmax(0,1fr)_140px] gap-2 md:gap-3 px-4 py-2 items-start"
                style={{ borderBottom: `1px solid ${C.borderSoft}` }}
              >
                <div>
                  <div className="text-xs font-semibold truncate" style={{ color: C.textPrimary }} title={artifact.title ?? undefined}>
                    {artifact.title ?? `Artifact ${artifact.id}`}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider mt-0.5" style={{ color: C.textMuted }}>
                    {artifact.kind.replace(/_/g, " ")}
                  </div>
                </div>
                <div>
                  <span
                    className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded"
                    style={{ color, background: `${color}22`, border: `1px solid ${color}55` }}
                  >
                    {artifact.lifecycleState.replace(/_/g, " ")}
                  </span>
                  <div className="text-[10px] mt-1" style={{ color: C.textMuted }}>
                    {artifact.retentionRule.replace(/_/g, " ")}
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="text-xs truncate" style={{ color: C.textSecondary }} title={artifact.storagePath}>
                    {artifact.storageProvider}:{artifact.storagePath}
                  </div>
                  {artifact.sourceUri && (
                    <div className="text-[10px] truncate mt-0.5" style={{ color: C.textMuted }} title={artifact.sourceUri}>
                      Source: {artifact.sourceUri}
                    </div>
                  )}
                </div>
                <div className="md:text-right">
                  <div className="text-[10px] uppercase tracking-wider" style={{ color: C.textMuted }}>
                    {formatRelative(artifact.createdAt)}
                  </div>
                  {artifact.ownerAgent && (
                    <div className="text-[10px] mt-0.5" style={{ color: C.textMuted }}>
                      {artifact.ownerAgent}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
