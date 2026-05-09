import { useState } from "react";
import type { FormEvent } from "react";
import { trpc } from "@/lib/trpc";
import { sourceDisplayName } from "@/lib/displayLabels";
import { cerebroColors as C } from "@/lib/keepConfig";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function labelize(value: string | null | undefined) {
  if (!value) return "unknown";
  return value.replace(/_/g, " ");
}

function riskTone(value: string) {
  if (value === "blocked") return C.danger;
  if (value === "high") return C.danger;
  if (value === "medium") return C.warning;
  return C.success;
}

function formatTime(unixSec: number) {
  return new Date(unixSec * 1000).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function SecurityGatePanel({ onClose }: { onClose: () => void }) {
  const utils = trpc.useUtils();
  const [target, setTarget] = useState("");
  const plan = trpc.securityGate.plan.useQuery();
  const recent = trpc.securityGate.recent.useQuery({ limit: 12 });
  const inspect = trpc.securityGate.inspectTarget.useMutation();
  const createReview = trpc.securityGate.createReview.useMutation({
    onSuccess: () => {
      utils.securityGate.recent.invalidate();
    },
  });

  const receipt = createReview.data?.review ?? inspect.data?.receipt ?? null;

  function inspectTarget(event: FormEvent) {
    event.preventDefault();
    const trimmed = target.trim();
    if (!trimmed || inspect.isPending) return;
    inspect.mutate({ target: trimmed });
  }

  function recordReceipt() {
    const trimmed = target.trim();
    if (!trimmed || createReview.isPending) return;
    createReview.mutate({ target: trimmed });
  }

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background: C.background, color: C.textPrimary }}>
      <header className="shrink-0 px-3 py-2" style={{ borderBottom: `1px solid ${C.borderSoft}`, background: C.backgroundSoft }}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-[13px] font-bold uppercase tracking-widest">Security Gate</h2>
            <p className="text-[11px] mt-0.5" style={{ color: C.textMuted }}>
              Spock receipt for links, repos, packages, files, and browser targets. No browsing or execution.
            </p>
          </div>
          <Button type="button" onClick={onClose} aria-label="Close Security Gate" variant="outline" size="sm">
            Close
          </Button>
        </div>

        <div className="mt-2 grid gap-2 sm:grid-cols-2 xl:grid-cols-4" aria-label="Security gate posture">
          <Stat label="Mode" value={plan.data?.mode ?? "proposal_only"} tone={C.textSecondary} />
          <Stat label="Owner" value={plan.data?.ownerAgent ?? "spock"} tone={C.accent} />
          <Stat label="Receipts" value={String(recent.data?.items.length ?? 0)} tone={C.gold} />
          <Stat label="Default" value="gated" tone={C.warning} />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-3 grid gap-3 xl:grid-cols-[minmax(0,1fr)_380px]" aria-label="Security Gate workspace">
        <section className="grid gap-3 content-start">
          <form onSubmit={inspectTarget} className="rounded p-3 grid gap-2" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
            <SectionTitle title="Inspect Target" detail="local string review" />
            <Input
              value={target}
              onChange={(event) => setTarget(event.target.value)}
              aria-label="Security target"
              placeholder="URL, GitHub repo, package, file, or site."
            />
            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={!target.trim() || inspect.isPending} variant="secondary">
                {inspect.isPending ? "Inspecting" : "Inspect"}
              </Button>
              <Button type="button" disabled={!target.trim() || createReview.isPending} onClick={recordReceipt} variant="risk">
                {createReview.isPending ? "Recording" : "Record Receipt"}
              </Button>
            </div>
            <p className="text-[11px] leading-relaxed" style={{ color: C.textMuted }}>
              This creates local evidence only. Browser, clone, download, install, and execution stay gated.
            </p>
          </form>

          {receipt && (
            <section className="rounded p-3 grid gap-3" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
              <div className="flex items-start justify-between gap-3">
                <SectionTitle title="Receipt" detail={labelize(receipt.targetKind)} />
                <Chip label={labelize(receipt.riskLevel)} tone={riskTone(receipt.riskLevel)} />
              </div>
              <Meta label="Target" value={sourceDisplayName(receipt.targetUri)} title={receipt.targetUri} />
              <div className="grid gap-2 md:grid-cols-2">
                <ReceiptList title="Findings" items={receipt.findings} tone={C.warning} />
                <ReceiptList title="Blocked" items={receipt.blockedActions} tone={C.danger} />
                <ReceiptList title="Allowed" items={receipt.allowedActions} tone={C.success} />
                <ReceiptList title="Checks" items={receipt.checks} tone={C.accent} />
              </div>
              <div className="rounded p-2 text-xs leading-relaxed" style={{ color: C.textMuted, background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}>
                Browser profile: {receipt.browserPolicy.profile}. Downloads {receipt.browserPolicy.blockDownloads ? "blocked" : "allowed only after approval"}.
              </div>
            </section>
          )}

          <section className="rounded p-3 grid gap-2" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
            <SectionTitle title="Scanner Plan" detail={`${plan.data?.scannerPlan.length ?? 0} adapters`} />
            {(plan.data?.scannerPlan ?? []).map((item) => (
              <div key={item.tool} className="rounded p-2" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}>
                <div className="flex flex-wrap gap-1">
                  <Chip label={item.tool} tone={C.accent} />
                  <Chip label={labelize(item.status)} tone={C.textMuted} />
                </div>
                <p className="mt-1 text-xs leading-relaxed" style={{ color: C.textMuted }}>{item.target}</p>
                <div className="mt-1 text-[10px] truncate" style={{ color: C.textMuted }} title={item.source}>
                  Source: {sourceDisplayName(item.source)}
                </div>
              </div>
            ))}
          </section>
        </section>

        <aside className="rounded p-3 grid gap-2 content-start" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
          <SectionTitle title="Recent Receipts" detail="append-only" />
          {recent.isLoading ? (
            <div className="text-xs" style={{ color: C.textMuted }}>Reading local receipts.</div>
          ) : (recent.data?.items ?? []).length === 0 ? (
            <div className="text-xs" style={{ color: C.textMuted }}>No security receipts recorded yet.</div>
          ) : (
            recent.data?.items.map((item) => (
              <article key={item.id} className="rounded p-2" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}>
                <div className="flex flex-wrap gap-1">
                  <Chip label={`#${item.id}`} tone={C.textMuted} />
                  <Chip label={labelize(item.targetKind)} tone={C.accent} />
                  <Chip label={labelize(item.riskLevel)} tone={riskTone(item.riskLevel)} />
                  {item.permissionPreflightId != null && <Chip label={`preflight #${item.permissionPreflightId}`} tone={C.warning} />}
                </div>
                <div className="mt-1 text-xs font-semibold truncate" style={{ color: C.textPrimary }} title={item.targetUri}>
                  {sourceDisplayName(item.targetUri)}
                </div>
                <div className="mt-1 text-[11px]" style={{ color: C.textMuted }}>{formatTime(item.createdAt)}</div>
              </article>
            ))
          )}
          {(plan.data?.gates ?? []).map((gate) => (
            <div key={gate} className="rounded p-2 text-[11px] leading-relaxed" style={{ color: C.textMuted, background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}>
              {gate}
            </div>
          ))}
        </aside>
      </main>
    </div>
  );
}

function SectionTitle({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: C.textPrimary }}>{title}</h3>
      <span className="text-[10px] uppercase tracking-wider" style={{ color: C.textMuted }}>{detail}</span>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="rounded px-2 py-1.5" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
      <div className="text-[10px] uppercase tracking-widest" style={{ color: C.textMuted }}>{label}</div>
      <div className="mt-0.5 text-xs font-semibold truncate" style={{ color: tone }} title={value}>{value}</div>
    </div>
  );
}

function Meta({ label, value, title }: { label: string; value: string; title?: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider" style={{ color: C.textMuted }}>{label}</div>
      <div className="text-xs leading-snug break-words" style={{ color: C.textSecondary }} title={title}>{value}</div>
    </div>
  );
}

function ReceiptList({ title, items, tone }: { title: string; items: string[]; tone: string }) {
  return (
    <div className="rounded p-2" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}>
      <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: tone }}>{title}</div>
      <div className="grid gap-1">
        {items.slice(0, 5).map((item) => (
          <div key={item} className="text-[11px] leading-relaxed" style={{ color: C.textMuted }}>{item}</div>
        ))}
      </div>
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
