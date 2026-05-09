import { cerebroColors as C } from "@/lib/keepConfig";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type RuleItem = readonly [string, string];

const foundations: RuleItem[] = [
  ["Shell", "Top bar, left rail, center surface, right context, bottom Ask Aang."],
  ["Type", "Compact UI type. Monospace for ids, logs, paths, evidence, models."],
  ["Color", "Dark neutrals. Gold receipts. Blue work. Violet routing. Amber review. Red blocked."],
  ["Shape", "Small radius. Borders carry structure. No card maze."],
  ["Motion", "Only state, route, drawer, approval, and comparison motion."],
];

const primitives: RuleItem[] = [
  ["Buttons", "Icon for tools. Text for judgment. Primary is rare. Disabled explains why."],
  ["Dropdowns", "Compact choices. Trigger shows current value. Risk changes use a gate."],
  ["Context menus", "Object actions only. Every action has a visible equivalent."],
  ["Drawers", "Preserve current work. Use for logs, council, comparison, media, source detail."],
  ["Modals", "Hard gates only. Action, target, risk, evidence, receipt."],
  ["Tables", "Queues and ledgers. Status, owner, time, source visible."],
];

const uxFlow = [
  "Ask Aang.",
  "Aang reads mode.",
  "Cortana routes.",
  "Owner agent works.",
  "Evidence is attached.",
  "Approval gates risky action.",
  "Validator checks when needed.",
  "Output lands.",
  "Ledger records receipt.",
];

const surfaceRules: RuleItem[] = [
  ["Keep", "Spatial spine. Agent addresses, status, route, council."],
  ["Workshop", "Dense work. Preview, browser, terminal, evidence, annotation, comparison."],
  ["Ledger", "Proof before summary. Route, evidence, approvals, commands, outputs."],
  ["Settings", "Plain controls. Permissions, storage, models, integrations."],
];

export default function UISystemPanel({ onClose }: { onClose: () => void }) {
  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background: C.background, color: C.textPrimary }}>
      <header className="shrink-0 px-5 py-4" style={{ borderBottom: `1px solid ${C.borderSoft}`, background: C.backgroundSoft }}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest" style={{ color: C.textPrimary }}>
              UI and UX System
            </h2>
            <p className="text-xs mt-1" style={{ color: C.textMuted }}>
              Canon for surfaces, primitives, flows, and gates.
            </p>
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

      <div className="flex-1 overflow-auto p-5">
        <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
          <RuleSection title="Frontend Law" items={foundations} />
          <RuleSection title="UX Spine" items={surfaceRules} />

          <Card>
            <CardHeader>
              <CardTitle>Golden Path</CardTitle>
            </CardHeader>
            <CardContent>
            <ol className="grid gap-2 m-0 p-0 list-none">
              {uxFlow.map((step, index) => (
                <li key={step} className="grid grid-cols-[2rem_1fr] items-center gap-2 text-xs">
                  <span className="text-center py-1" style={{ color: C.gold, border: `1px solid ${C.borderSoft}`, background: C.backgroundSoft }}>
                    {index + 1}
                  </span>
                  <span style={{ color: C.textSecondary }}>{step}</span>
                </li>
              ))}
            </ol>
            </CardContent>
          </Card>

          <RuleSection title="Primitives" items={primitives} />
        </div>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Build Gate</CardTitle>
          </CardHeader>
          <CardContent>
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4 text-xs">
            {[
              "What mode is this.",
              "Which object changes.",
              "Which agent owns it.",
              "What evidence is used.",
              "What approval can block it.",
              "Where the receipt lands.",
              "What happens when it fails.",
              "Which rule did the UI follow.",
            ].map((item) => (
              <div key={item} className="p-3" style={{ background: C.backgroundSoft, border: `1px solid ${C.borderSoft}`, color: C.textSecondary }}>
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
      <div className="grid gap-2">
        {items.map(([label, body]) => (
          <div key={label} className="grid grid-cols-[9rem_1fr] gap-3 text-xs">
            <div className="font-bold uppercase" style={{ color: C.gold }}>
              {label}
            </div>
            <div style={{ color: C.textSecondary }}>
              {body}
            </div>
          </div>
        ))}
      </div>
      </CardContent>
    </Card>
  );
}
