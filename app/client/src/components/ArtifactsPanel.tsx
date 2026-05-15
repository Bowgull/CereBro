import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { sourceDisplayName } from "@/lib/displayLabels";
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
import { disambiguateSessionOptions, groupSessionFilters } from "@/lib/sessionLabels";

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

function writePolicyCopy(policy: WritePolicy): string {
  if (policy === "draft") return "Draft trail: same-title saves create timestamped versions.";
  if (policy === "report") return "Report history: each same-title save preserves earlier reports.";
  return "History save: same-title saves create timestamped versions.";
}

function destinationLabel(provider: string, path: string): string {
  if (provider === "vault") return "Vault";
  if (provider === "local") return path.startsWith("memory_entries:") ? "Memory" : "Local";
  if (provider === "notion") return "Notion";
  if (provider === "obsidian") return "Obsidian";
  return provider.replace(/_/g, " ");
}

export default function ArtifactsPanel({ onClose }: { onClose: () => void }) {
  const utils = trpc.useUtils();
  const [kind, setKind] = useState<KindFilter>("all");
  const [writeKind, setWriteKind] = useState<WriteKind>("obsidian_note");
  const [sessionFilter, setSessionFilter] = useState("all");
  const [writeSessionId, setWriteSessionId] = useState("none");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sourceUri, setSourceUri] = useState("");
  const [obsidianSubdir, setObsidianSubdir] = useState("20_Knowledge/Capture");
  const [lastWrite, setLastWrite] = useState<string | null>(null);
  const selectedSessionIds =
    sessionFilter === "all" ? undefined : sessionFilter.split(",").map((id) => Number(id)).filter(Boolean);
  const artifacts = trpc.artifacts.list.useQuery({
    kind: kind === "all" ? undefined : kind,
    sessionIds: selectedSessionIds,
    limit: 200,
  });
  const sessions = trpc.sessions.recent.useQuery({ limit: 50 }, { refetchInterval: 10000 });
  const writeVault = trpc.artifacts.writeTextToVault.useMutation({
    onSuccess: () => utils.artifacts.list.invalidate(),
  });
  const writeObsidian = trpc.memory.writeToObsidian.useMutation({
    onSuccess: () => utils.artifacts.list.invalidate(),
  });

  const rows = artifacts.data ?? [];
  const sessionOptions = disambiguateSessionOptions(sessions.data?.items ?? []);
  const sessionFilters = groupSessionFilters(sessions.data?.items ?? []);
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
        sessionId: writeSessionId === "none" ? undefined : Number(writeSessionId),
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
    <div className="flex h-full flex-col overflow-hidden" style={{ background: C.background, border: `1px solid ${C.borderSoft}`, color: C.textPrimary }}>
      <div
        className="flex items-center justify-between px-2.5 py-1.5 shrink-0"
        style={{ borderBottom: `1px solid ${C.borderSoft}`, background: C.surface }}
      >
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: C.textPrimary }}>
            Saved Outputs
            <span className="ml-2" style={{ color: C.textSecondary }}>{rows.length}</span>
          </div>
          <div className="mt-0.5 text-[10px]" style={{ color: C.textMuted }}>
            Notes, drafts, reports, prompts, and saved files. Details keep the storage proof.
          </div>
        </div>
        <Button type="button" onClick={onClose} variant="outline" size="sm">
          Close
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-1.5 px-2.5 py-1.5 shrink-0" style={{ borderBottom: `1px solid ${C.borderSoft}` }}>
        <OutputStat label="Saved" value={String(rows.length)} tone={C.gold} />
        <OutputStat label="Writing" value={WRITE_KIND_COPY[writeKind].label} tone={C.success} />
        <OutputStat label="Trail" value={writeCopy.policy} tone={C.accent} />
      </div>

      <div
        className="flex items-center gap-1 overflow-x-auto px-2.5 py-1.5 shrink-0"
        aria-label="Artifact kind filters"
        style={{ borderBottom: `1px solid ${C.borderSoft}`, scrollbarColor: `${C.border} ${C.backgroundSoft}` }}
      >
        {KIND_OPTIONS.map((k) => {
          const active = kind === k;
          return (
            <Button
              type="button"
              key={k}
              onClick={() => setKind(k)}
              className="shrink-0 whitespace-nowrap"
              variant={active ? "secondary" : "ghost"}
              size="sm"
            >
              {k.replace(/_/g, " ")}
            </Button>
          );
        })}
      </div>
      <div
        className="flex items-center gap-1 overflow-x-auto px-2.5 py-1.5 shrink-0"
        aria-label="Artifact run filters"
        style={{ borderBottom: `1px solid ${C.borderSoft}`, scrollbarColor: `${C.border} ${C.backgroundSoft}` }}
      >
        <FilterButton
          label="All Runs"
          active={sessionFilter === "all"}
          count={rows.length}
          onClick={() => setSessionFilter("all")}
        />
        {sessionFilters.map((session) => (
          <FilterButton
            key={session.key}
            label={session.label}
            active={sessionFilter === session.ids.join(",")}
            count={rows.filter((row) => row.sessionId != null && session.ids.includes(row.sessionId)).length}
            title={session.title}
            onClick={() => setSessionFilter(session.ids.join(","))}
          />
        ))}
      </div>

      <form onSubmit={submit} className="space-y-1.5 px-2.5 py-1.5 shrink-0" style={{ borderBottom: `1px solid ${C.borderSoft}` }}>
        <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-[145px_145px_minmax(0,1fr)_70px]">
          <AppSelect
            label="Artifact kind"
            value={writeKind}
            onChange={(value) => setWriteKind(value as WriteKind)}
            options={WRITE_KINDS.map((k) => ({ value: k, label: WRITE_KIND_COPY[k].label }))}
          />
          <AppSelect
            label="Run link"
            value={writeSessionId}
            onChange={setWriteSessionId}
            options={[
              { value: "none", label: "No run link" },
              ...sessionOptions.map((session) => ({
                value: String(session.id),
                label: session.optionLabel,
              })),
            ]}
          />
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={`${writeCopy.label} title`}
          />
          <Button
            type="submit"
            size="sm"
            disabled={!title.trim() || !body.trim() || isWriting}
            title={
              !title.trim() || !body.trim()
                ? "Add a title and body before saving an output receipt."
                : writeKind === "obsidian_note"
                  ? "Write a local Obsidian note and record the output receipt."
                  : "Write a local vault artifact and record the output receipt."
            }
            aria-label={writeKind === "obsidian_note" ? "Save local Obsidian note" : "Save local vault artifact"}
          >
            {isWriting ? "Saving" : "Save"}
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-1.5">
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={writeCopy.body}
            className="min-h-16"
          />
          <details>
            <summary className="cursor-pointer list-none text-[10px] font-bold uppercase tracking-wider focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black" style={{ color: C.textMuted, ["--tw-ring-color" as string]: C.accent }}>
              Save Routing
            </summary>
            <div className="mt-1.5 grid gap-1.5 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_1.2fr]">
            {writeKind === "obsidian_note" ? (
              <Input
                value={obsidianSubdir}
                onChange={(e) => setObsidianSubdir(e.target.value)}
                placeholder="Obsidian subfolder"
              />
            ) : (
              <Input
                value={sourceUri}
                onChange={(e) => setSourceUri(e.target.value)}
                placeholder={writeKind === "source_note" ? "Source URL or file path" : "Optional source/context URI"}
              />
            )}
            <div className="rounded p-1.5 text-[10px] leading-snug" style={{ background: C.surface, border: `1px solid ${C.borderSoft}`, color: C.textMuted }}>
              Owner: {writeCopy.ownerAgent}. {writePolicyCopy(writeCopy.policy)}
            </div>
            <div className="rounded p-1.5 text-[10px] leading-snug" style={{ background: C.surface, border: `1px solid ${C.borderSoft}`, color: C.textMuted }}>
              These controls save durable history/drafts/reports. Current-state updates need a separate explicit current-state writer.
            </div>
            {lastWrite && (
              <div className="rounded p-1.5 text-[10px] leading-snug md:col-span-2 xl:col-span-3" style={{ background: C.surfaceRaised, border: `1px solid ${C.borderSoft}`, color: C.textSecondary }}>
                {lastWrite}
              </div>
            )}
            </div>
          </details>
        </div>
      </form>

      <div className="flex-1 overflow-y-auto">
        {artifacts.isLoading ? (
          <div className="px-2.5 py-1.5 text-[11px]" style={{ color: C.textMuted }}>Loading.</div>
        ) : rows.length === 0 ? (
          <div className="mx-2 my-2 rounded p-2 text-[11px] leading-snug" style={{ background: C.surface, border: `1px solid ${C.borderSoft}`, color: C.textMuted }}>
            No saved outputs match this filter. Save a note, draft, report, prompt, or file receipt.
          </div>
        ) : (
          rows.map((artifact) => (
              <div
                key={artifact.id}
                className="grid grid-cols-1 items-start gap-1.5 px-2.5 py-1.5 md:grid-cols-[minmax(0,1fr)_118px_150px_86px]"
                style={{ borderBottom: `1px solid ${C.borderSoft}` }}
              >
                <div className="min-w-0">
                  <div className="truncate text-[12px] font-semibold" style={{ color: C.textPrimary }} title={artifact.title ?? undefined}>
                    {artifact.title ?? `Artifact ${artifact.id}`}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-1">
                    <Badge variant="secondary" className="uppercase">
                      {artifact.kind.replace(/_/g, " ")}
                    </Badge>
                    {artifact.sessionDisplayName && (
                      <Badge variant="outline" className="max-w-full uppercase" title={artifact.sessionDisplayName}>
                        {artifact.sessionDisplayName}
                      </Badge>
                    )}
                  </div>
                </div>
                <div>
                  <Badge variant={badgeVariant(artifact.lifecycleState)} className="uppercase">
                    {artifact.lifecycleState.replace(/_/g, " ")}
                  </Badge>
                </div>
                <div className="min-w-0">
                  <div className="truncate text-[11px] font-semibold" style={{ color: C.textSecondary }} title={artifact.storagePath}>
                    {destinationLabel(artifact.storageProvider, artifact.storagePath)}
                  </div>
                  {artifact.sourceUri && (
                    <div className="text-[10px] truncate mt-0.5" style={{ color: C.textMuted }} title={artifact.sourceUri}>
                      Source: {artifact.sourceDisplayName ?? sourceDisplayName(artifact.sourceUri)}
                    </div>
                  )}
                  <details className="mt-1">
                    <summary className="cursor-pointer list-none text-[10px] font-bold uppercase tracking-wider focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black" style={{ color: C.textMuted, ["--tw-ring-color" as string]: C.accent }}>
                      Output Details
                    </summary>
                    <div className="mt-1 grid gap-1 rounded p-1.5 text-[10px] leading-snug" style={{ background: C.surface, border: `1px solid ${C.borderSoft}`, color: C.textMuted }}>
                      <span className="truncate" title={artifact.storagePath}>Path: {artifact.storageProvider}:{artifact.storagePath}</span>
                      <span>Keep: {artifact.retentionRule.replace(/_/g, " ")}</span>
                      <span>Owner: {artifact.ownerAgent ?? "unassigned"}</span>
                    </div>
                  </details>
                </div>
                <div className="md:text-right">
                  <div className="text-[10px] uppercase tracking-wider" style={{ color: C.textMuted }}>
                    {formatRelative(artifact.createdAt)}
                  </div>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
}

function FilterButton({
  label,
  active,
  count,
  title,
  onClick,
}: {
  label: string;
  active: boolean;
  count: number;
  title?: string;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      onClick={onClick}
      className="shrink-0"
      variant={active ? "secondary" : "ghost"}
      size="sm"
      title={title}
    >
      {label}
      <Badge variant={active ? "default" : "secondary"} className="ml-1">
        {count}
      </Badge>
    </Button>
  );
}

function OutputStat({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="rounded p-2" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}>
      <div className="text-[10px] uppercase tracking-widest" style={{ color: C.textMuted }}>
        {label}
      </div>
      <div className="mt-0.5 truncate text-[11px] font-semibold" style={{ color: tone }}>
        {value}
      </div>
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
  options: readonly { value: string; label: string }[];
}) {
  return (
    <UiSelect value={value} onValueChange={onChange} aria-label={label}>
      <SelectTrigger size="sm" className="w-full">
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
  );
}

function badgeVariant(state: string): "default" | "secondary" | "destructive" | "warning" | "success" {
  if (state === "published") return "success";
  if (state === "review" || state === "inbox") return "warning";
  if (state === "temp") return "destructive";
  if (state === "archived" || state === "superseded") return "secondary";
  return "default";
}
