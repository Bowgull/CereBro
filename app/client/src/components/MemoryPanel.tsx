import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { cerebroColors as C } from "@/lib/keepConfig";

const KINDS = ["fact", "note", "reference", "feedback"] as const;
type Kind = (typeof KINDS)[number];

const KIND_COLOR: Record<Kind, string> = {
  fact: C.accent,
  note: C.textSecondary,
  reference: C.warning,
  feedback: C.success,
};

function formatRelative(unixSec: number): string {
  const diff = Date.now() / 1000 - unixSec;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function MemoryPanel({ onClose }: { onClose: () => void }) {
  const utils = trpc.useUtils();
  const [filter, setFilter] = useState<Kind | "all">("all");
  const [search, setSearch] = useState("");
  const [body, setBody] = useState("");
  const [kind, setKind] = useState<Kind>("note");
  const [tags, setTags] = useState("");

  const list = trpc.memory.list.useQuery({
    kind: filter === "all" ? undefined : filter,
    search: search.trim() || undefined,
  });
  const proposalsQuery = trpc.memory.proposals.useQuery({ limit: 100 });
  const propose = trpc.memory.propose.useMutation({
    onSuccess: () => utils.memory.proposals.invalidate(),
  });
  const del = trpc.memory.delete.useMutation({
    onSuccess: () => utils.memory.list.invalidate(),
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed) return;
    propose.mutate({
      body: trimmed,
      kind,
      tags: tags.trim() || undefined,
      proposedByAgent: "aang",
    });
    setBody("");
    setTags("");
  }

  const entries = list.data ?? [];
  const proposals = proposalsQuery.data ?? [];

  return (
    <div
      className="absolute bottom-0 left-0 right-0 max-h-[55%] flex flex-col"
      style={{ background: `${C.background}f5`, borderTop: `1px solid ${C.borderSoft}` }}
    >
      <div
        className="flex items-center justify-between px-3 py-2 shrink-0"
        style={{ borderBottom: `1px solid ${C.borderSoft}`, background: C.surface }}
      >
        <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: C.textMuted }}>
          Memory
          <span className="ml-2" style={{ color: C.textSecondary }}>{entries.length}</span>
          {proposals.length > 0 && (
            <span className="ml-2" style={{ color: C.warning }}>{proposals.length} proposed</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {(["all", ...KINDS] as const).map((k) => {
            const active = filter === k;
            return (
              <button
                key={k}
                onClick={() => setFilter(k)}
                className="px-2 py-0.5 text-xs uppercase tracking-wider rounded"
                style={{
                  color: active ? C.textPrimary : C.textMuted,
                  background: active ? C.surfaceRaised : "transparent",
                  border: `1px solid ${active ? C.accentSoft : C.borderSoft}`,
                }}
              >
                {k}
              </button>
            );
          })}
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search."
            className="px-2 py-0.5 text-xs rounded outline-none ml-2"
            style={{
              background: C.surfaceMuted,
              color: C.textPrimary,
              border: `1px solid ${C.borderSoft}`,
              width: 140,
            }}
          />
          <button onClick={onClose} className="ml-2 text-xs uppercase tracking-wider" style={{ color: C.textMuted }}>
            Close
          </button>
        </div>
      </div>

      <form onSubmit={submit} className="flex gap-2 px-3 py-2 shrink-0" style={{ borderBottom: `1px solid ${C.borderSoft}` }}>
        <select
          value={kind}
          onChange={(e) => setKind(e.target.value as Kind)}
          className="px-2 py-1.5 text-xs rounded outline-none"
          style={{
            background: C.surfaceMuted,
            color: C.textPrimary,
            border: `1px solid ${C.borderSoft}`,
          }}
        >
          {KINDS.map((k) => (
            <option key={k} value={k}>{k}</option>
          ))}
        </select>
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="New memory proposal. Enter to stage."
          className="flex-1 px-2 py-1.5 text-xs rounded outline-none"
          style={{
            background: C.surfaceMuted,
            color: C.textPrimary,
            border: `1px solid ${C.borderSoft}`,
          }}
        />
        <input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="tags, comma-sep"
          className="px-2 py-1.5 text-xs rounded outline-none"
          style={{
            background: C.surfaceMuted,
            color: C.textPrimary,
            border: `1px solid ${C.borderSoft}`,
            width: 160,
          }}
        />
        <button
          type="submit"
          disabled={!body.trim() || propose.isPending}
          className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded"
          style={{
            background: body.trim() ? C.accentSoft : C.surfaceMuted,
            color: body.trim() ? C.textPrimary : C.textMuted,
            border: `1px solid ${C.borderSoft}`,
          }}
        >
          Propose
        </button>
      </form>

      <div className="flex-1 overflow-y-auto">
        {proposals.length > 0 && (
          <div style={{ borderBottom: `1px solid ${C.borderSoft}` }}>
            <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-widest" style={{ color: C.warning, background: C.surface }}>
              Proposed
            </div>
            {proposals.map((p) => (
              <div key={p.id} className="px-3 py-2" style={{ borderBottom: `1px solid ${C.borderSoft}` }}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs px-1.5 py-0.5 rounded uppercase tracking-wider" style={{ color: C.warning, background: `${C.warning}22`, border: `1px solid ${C.warning}55` }}>
                    {p.status}
                  </span>
                  <span className="text-xs" style={{ color: C.textMuted }}>
                    Oak: {p.oakStatus}
                  </span>
                </div>
                <div className="text-xs leading-relaxed" style={{ color: C.textSecondary }}>
                  {p.body}
                </div>
              </div>
            ))}
          </div>
        )}
        {list.isLoading ? (
          <div className="px-3 py-3 text-xs" style={{ color: C.textMuted }}>Loading.</div>
        ) : entries.length === 0 ? (
          <div className="px-3 py-3 text-xs" style={{ color: C.textMuted }}>
            No entries. Memory grows as you save facts, notes, references, and feedback.
          </div>
        ) : (
          entries.map((m) => (
            <div
              key={m.id}
              className="px-3 py-2"
              style={{ borderBottom: `1px solid ${C.borderSoft}` }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="text-xs px-1.5 py-0.5 rounded uppercase tracking-wider"
                  style={{
                    color: KIND_COLOR[m.kind],
                    background: `${KIND_COLOR[m.kind]}22`,
                    border: `1px solid ${KIND_COLOR[m.kind]}55`,
                  }}
                >
                  {m.kind}
                </span>
                <span className="text-xs" style={{ color: C.textMuted }}>
                  {formatRelative(m.createdAt)}
                </span>
                {m.tags && (
                  <span className="text-xs" style={{ color: C.textMuted }}>· {m.tags}</span>
                )}
                <button
                  onClick={() => {
                    if (confirm("Delete this saved memory entry?")) {
                      del.mutate({ id: m.id, approved: true });
                    }
                  }}
                  className="ml-auto text-xs uppercase tracking-wider"
                  style={{ color: C.textMuted }}
                  title="Delete"
                >
                  ×
                </button>
              </div>
              <div className="text-xs leading-relaxed" style={{ color: C.textPrimary }}>
                {m.body}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
