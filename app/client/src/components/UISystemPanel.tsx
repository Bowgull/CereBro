import { cerebroColors as C } from "@/lib/keepConfig";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type RuleItem = readonly [string, string];

const foundations: RuleItem[] = [
  ["Shell", "Top bar, left rail, center surface, right context, bottom Ask Aang."],
  ["Type", "Compact UI type. Monospace for ids, logs, paths, receipts, models."],
  ["Color", "Dark neutrals. Gold receipts. Blue work. Violet routing. Amber review. Red blocked."],
  ["Shape", "Small radius. Borders carry structure. No card maze."],
  ["Motion", "Only state, route, drawer, approval, and comparison motion."],
];

const primitives: RuleItem[] = [
  ["Buttons", "Icon for tools. Text for judgment. Primary is rare. Disabled explains why."],
  ["Dropdowns", "Compact choices. Trigger shows current value. Risk changes use a gate."],
  ["Context menus", "Object actions only. Every action has a visible equivalent."],
  ["Drawers", "Preserve current work. Use for logs, council, comparison, media, source detail."],
  ["Modals", "Hard gates only. Action, target, risk, receipt."],
  ["Tables", "Queues and ledgers. Status, owner, time, source visible."],
];

const uxFlow = [
  "Ask Aang.",
  "Aang reads mode.",
  "Cortana routes.",
  "Owner agent works.",
  "Receipt body is attached.",
  "Approval gates risky action.",
  "Validator checks when needed.",
  "Output lands.",
  "Ledger records receipt.",
];

const surfaceRules: RuleItem[] = [
  ["Keep", "Spatial spine. Agent addresses, status, route, council."],
  ["Workshop", "Dense work. Preview, browser, terminal, receipts, annotation, comparison."],
  ["Ledger", "Receipt before summary. Route, audit trail, approvals, commands, outputs."],
  ["Settings", "Plain controls. Permissions, storage, models, integrations."],
];

export default function UISystemPanel({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex h-full flex-col overflow-hidden" style={{ background: C.background, border: `1px solid ${C.borderSoft}`, color: C.textPrimary }}>
      <header className="shrink-0 px-2 py-1.5" style={{ borderBottom: `1px solid ${C.borderSoft}`, background: C.backgroundSoft }}>
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h2 className="text-[12px] font-bold uppercase tracking-wider" style={{ color: C.textPrimary }}>
              UI and UX System
            </h2>
          </div>
          <Button
            type="button"
            onClick={onClose}
            aria-label="Close UI and UX system"
            variant="outline"
            size="sm"
          >
            Close
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-2">
        <div className="grid gap-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <RuleSection title="Frontend Law" items={foundations} />
          <RuleSection title="UX Spine" items={surfaceRules} />

          <Card>
            <CardHeader>
              <CardTitle>Golden Path</CardTitle>
            </CardHeader>
            <CardContent>
            <ol className="grid gap-1.5 m-0 p-0 list-none">
              {uxFlow.map((step, index) => (
                <li key={step} className="grid min-w-0 grid-cols-[1.5rem_minmax(0,1fr)] items-center gap-1.5 text-[11px]">
                  <span className="text-center py-0.5 font-mono" style={{ color: C.gold, border: `1px solid ${C.borderSoft}`, background: C.backgroundSoft }}>
                    {index + 1}
                  </span>
                  <span className="min-w-0 truncate" style={{ color: C.textSecondary }}>{step}</span>
                </li>
              ))}
            </ol>
            </CardContent>
          </Card>

          <RuleSection title="Primitives" items={primitives} />
        </div>

        <Card className="mt-2">
          <CardHeader>
            <CardTitle>Build Gate</CardTitle>
          </CardHeader>
          <CardContent>
          <div className="grid gap-1.5 text-[11px] md:grid-cols-2 xl:grid-cols-4">
            {[
              "What mode is this.",
              "Which object changes.",
              "Which agent owns it.",
              "What receipt is used.",
              "What approval can block it.",
              "Where the receipt lands.",
              "What happens when it fails.",
              "Which rule did the UI follow.",
            ].map((item) => (
              <div key={item} className="min-w-0 rounded p-1.5" style={{ background: C.backgroundSoft, border: `1px solid ${C.borderSoft}`, color: C.textSecondary }}>
                {item}
              </div>
            ))}
          </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function RuleSection({ title, items }: { title: string; items: RuleItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
      <div className="grid gap-1.5">
        {items.map(([label, body]) => (
          <div key={label} className="grid min-w-0 gap-1 text-[11px] sm:grid-cols-[6.5rem_minmax(0,1fr)] sm:gap-2">
            <div className="font-bold uppercase tracking-wider" style={{ color: C.gold }}>
              {label}
            </div>
            <div className="min-w-0" style={{ color: C.textSecondary }}>
              {body}
            </div>
          </div>
        ))}
      </div>
      </CardContent>
    </Card>
  );
}
