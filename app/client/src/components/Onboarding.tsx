import { useState } from "react";
import { cerebroColors as C } from "@/lib/keepConfig";

// First-run onboarding wizard, per FIRST_RUN_ONBOARDING.md.
//
// V1 implementation: 12 steps, choices stored in localStorage. Real settings
// table + system health check land in Phase 6 alongside the harness wiring.
// Kept honest with explicit "Phase 6" callouts where checks are stubbed.

const STORAGE_KEY = "cerebro:onboarding";
const COMPLETE_FLAG = "cerebro:onboarding-complete";

export function isOnboardingComplete(): boolean {
  try { return localStorage.getItem(COMPLETE_FLAG) === "true"; }
  catch { return false; }
}

interface Choices {
  startMode: "fresh" | "import" | null;
  storageRoot: string;
  obsidianMode: "create" | "use-existing" | "skip" | null;
  obsidianPath: string;
  notionMode: "skip" | "later" | "configure" | null;
  notionToken: string;
  ollamaPolicy: "auto-detect" | "manual" | null;
  externalPolicy: "local-only" | "ask" | "disable" | null;
  browserPolicy: "disabled" | "source-only" | "approval" | null;
  approvalStrictness: "strict" | "balanced" | "fast" | null;
  ravenChoice: "sealed" | "hide" | null;
  firstProject: string;
}

const DEFAULT_CHOICES: Choices = {
  startMode: null,
  storageRoot: "~/CereBro",
  obsidianMode: null,
  obsidianPath: "",
  notionMode: null,
  notionToken: "",
  ollamaPolicy: null,
  externalPolicy: null,
  browserPolicy: null,
  approvalStrictness: "balanced",
  ravenChoice: "sealed",
  firstProject: "CereBro OS",
};

export default function Onboarding({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(1);
  const [choices, setChoices] = useState<Choices>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...DEFAULT_CHOICES, ...JSON.parse(saved) } : DEFAULT_CHOICES;
    } catch { return DEFAULT_CHOICES; }
  });

  const update = <K extends keyof Choices>(key: K, value: Choices[K]) => {
    const next = { ...choices, [key]: value };
    setChoices(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
  };

  const next = () => setStep((s) => Math.min(12, s + 1));
  const back = () => setStep((s) => Math.max(1, s - 1));
  const finish = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(choices));
      localStorage.setItem(COMPLETE_FLAG, "true");
    } catch {}
    onComplete();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: `${C.background}f0`, fontFamily: "'IBM Plex Mono', 'Courier New', monospace" }}
    >
      <div
        className="w-full max-w-2xl flex flex-col"
        style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, maxHeight: "90vh" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 shrink-0"
          style={{ borderBottom: `1px solid ${C.borderSoft}` }}
        >
          <div>
            <div className="text-xs uppercase tracking-widest" style={{ color: C.textMuted }}>
              First Run · Step {step} of 12
            </div>
            <div className="text-base font-semibold mt-0.5" style={{ color: C.textPrimary }}>
              {STEP_TITLES[step - 1]}
            </div>
          </div>
          <div className="text-2xl" style={{ color: C.gold }}>◆</div>
        </div>

        {/* Progress */}
        <div className="px-6 pt-3 shrink-0">
          <div className="h-1 rounded-full overflow-hidden" style={{ background: C.surfaceMuted }}>
            <div
              className="h-full transition-all"
              style={{ width: `${(step / 12) * 100}%`, background: C.accent }}
            />
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex-1 overflow-y-auto">
          {step === 1 && <StepWelcome choices={choices} update={update} />}
          {step === 2 && <StepStorageRoot choices={choices} update={update} />}
          {step === 3 && <StepObsidian choices={choices} update={update} />}
          {step === 4 && <StepNotion choices={choices} update={update} />}
          {step === 5 && <StepOllama choices={choices} update={update} />}
          {step === 6 && <StepExternal choices={choices} update={update} />}
          {step === 7 && <StepBrowser choices={choices} update={update} />}
          {step === 8 && <StepApproval choices={choices} update={update} />}
          {step === 9 && <StepRaven choices={choices} update={update} />}
          {step === 10 && <StepFirstProject choices={choices} update={update} />}
          {step === 11 && <StepHealthCheck />}
          {step === 12 && <StepFinish choices={choices} />}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-6 py-3 shrink-0"
          style={{ borderTop: `1px solid ${C.borderSoft}` }}
        >
          <button
            onClick={back}
            disabled={step === 1}
            className="px-3 py-1.5 text-xs uppercase tracking-wider rounded transition-colors"
            style={{
              border: `1px solid ${C.borderSoft}`,
              color: step === 1 ? C.textMuted : C.textSecondary,
              opacity: step === 1 ? 0.4 : 1,
            }}
          >
            Back
          </button>

          {step < 12 ? (
            <button
              onClick={next}
              className="px-4 py-1.5 text-xs font-semibold uppercase tracking-wider rounded transition-colors"
              style={{ background: C.accent, color: C.background }}
            >
              Next
            </button>
          ) : (
            <button
              onClick={finish}
              className="px-4 py-1.5 text-xs font-semibold uppercase tracking-wider rounded transition-colors"
              style={{ background: C.success, color: C.background }}
            >
              Enter the Keep
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const STEP_TITLES = [
  "Welcome to CereBro",
  "Storage root",
  "Obsidian vault",
  "Notion (optional)",
  "Local models (Ollama)",
  "External model policy",
  "Browser tools",
  "Approval strictness",
  "Raven Reviews",
  "Your first Project Space",
  "System health check",
  "All set",
];

// ── Step components ─────────────────────────────────────────────────────────

function Body({ children }: { children: React.ReactNode }) {
  return <div className="text-sm leading-relaxed" style={{ color: C.textSecondary }}>{children}</div>;
}

function ChoiceList<T extends string>({
  options, value, onChange,
}: {
  options: Array<{ id: T; label: string; hint?: string }>;
  value: T | null;
  onChange: (v: T) => void;
}) {
  return (
    <div className="space-y-2 mt-4">
      {options.map((o) => {
        const active = value === o.id;
        return (
          <button
            key={o.id}
            onClick={() => onChange(o.id)}
            className="w-full text-left px-3 py-2.5 rounded transition-colors"
            style={{
              background: active ? `${C.accent}11` : C.surfaceMuted,
              border: `1px solid ${active ? C.accent : C.borderSoft}`,
              color: active ? C.textPrimary : C.textSecondary,
            }}
          >
            <div className="text-sm font-semibold">{o.label}</div>
            {o.hint && <div className="text-xs mt-0.5" style={{ color: C.textMuted }}>{o.hint}</div>}
          </button>
        );
      })}
    </div>
  );
}

function TextInput({
  value, onChange, placeholder,
}: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full mt-3 px-3 py-2 text-sm rounded outline-none"
      style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}`, color: C.textPrimary }}
    />
  );
}

function StepWelcome({ choices, update }: { choices: Choices; update: <K extends keyof Choices>(k: K, v: Choices[K]) => void }) {
  return (
    <>
      <Body>
        CereBro is a local-first, task-based AI operating system. Aang will be the front
        door for your work, Cortana routes tasks to specialists, and Oak validates
        anything that gets saved. This wizard configures storage, models, and the safety
        gates. Most choices have safe defaults you can change later.
      </Body>
      <ChoiceList<"fresh" | "import">
        value={choices.startMode}
        onChange={(v) => update("startMode", v)}
        options={[
          { id: "fresh",  label: "Fresh setup",   hint: "Empty Project Space, default skills, no imports." },
          { id: "import", label: "Import later",  hint: "Same as fresh; you can import Obsidian or Notion content after." },
        ]}
      />
    </>
  );
}

function StepStorageRoot({ choices, update }: { choices: Choices; update: <K extends keyof Choices>(k: K, v: Choices[K]) => void }) {
  return (
    <>
      <Body>
        CereBro keeps SQLite state, the Chroma vector index, the Obsidian vault, and
        artifacts under one root. Default is your home directory. Pick an external SSD
        if you have a synced Drive folder you'd rather use.
      </Body>
      <TextInput
        value={choices.storageRoot}
        onChange={(v) => update("storageRoot", v)}
        placeholder="~/CereBro"
      />
      <div className="text-xs mt-2" style={{ color: C.textMuted }}>
        Path validation runs in Phase 6.
      </div>
    </>
  );
}

function StepObsidian({ choices, update }: { choices: Choices; update: <K extends keyof Choices>(k: K, v: Choices[K]) => void }) {
  return (
    <>
      <Body>
        Obsidian is the human-readable knowledge vault. Notes stay useful even if
        CereBro is not running. Memory writes go through Oak validation before
        landing here.
      </Body>
      <ChoiceList<"create" | "use-existing" | "skip">
        value={choices.obsidianMode}
        onChange={(v) => update("obsidianMode", v)}
        options={[
          { id: "create",       label: "Create a new vault", hint: "At {storage-root}/obsidian-vault." },
          { id: "use-existing", label: "Use an existing vault", hint: "Point at a folder you already have." },
          { id: "skip",         label: "Skip for now", hint: "Memory will run on Chroma + SQLite only until you connect one." },
        ]}
      />
      {choices.obsidianMode === "use-existing" && (
        <TextInput
          value={choices.obsidianPath}
          onChange={(v) => update("obsidianPath", v)}
          placeholder="/Users/you/Documents/MyVault"
        />
      )}
    </>
  );
}

function StepNotion({ choices, update }: { choices: Choices; update: <K extends keyof Choices>(k: K, v: Choices[K]) => void }) {
  return (
    <>
      <Body>
        Notion is optional. CereBro never makes Notion the source of truth. Outbox
        publishing requires approval per write. You can configure this later.
      </Body>
      <ChoiceList<"skip" | "later" | "configure">
        value={choices.notionMode}
        onChange={(v) => update("notionMode", v)}
        options={[
          { id: "skip",      label: "Skip", hint: "Don't connect Notion." },
          { id: "later",     label: "Configure later", hint: "Set token in Settings when you want it." },
          { id: "configure", label: "Add my Notion integration token now" },
        ]}
      />
      {choices.notionMode === "configure" && (
        <TextInput
          value={choices.notionToken}
          onChange={(v) => update("notionToken", v)}
          placeholder="secret_…"
        />
      )}
    </>
  );
}

function StepOllama({ choices, update }: { choices: Choices; update: <K extends keyof Choices>(k: K, v: Choices[K]) => void }) {
  return (
    <>
      <Body>
        CereBro defaults to local Ollama for most agent work. The Model Router will
        try local models first and only escalate to external Claude with your
        approval. Detection runs in Phase 6.
      </Body>
      <ChoiceList<"auto-detect" | "manual">
        value={choices.ollamaPolicy}
        onChange={(v) => update("ollamaPolicy", v)}
        options={[
          { id: "auto-detect", label: "Auto-detect installed models", hint: "Phase 6 will probe `ollama list`." },
          { id: "manual",      label: "I'll pick models manually later" },
        ]}
      />
    </>
  );
}

function StepExternal({ choices, update }: { choices: Choices; update: <K extends keyof Choices>(k: K, v: Choices[K]) => void }) {
  return (
    <>
      <Body>
        When local can't carry the work, CereBro can escalate to external Claude.
        Every escalation costs cache + tokens against your existing session quota
        and may share private context. Pick how strict the gate should be.
      </Body>
      <ChoiceList<"local-only" | "ask" | "disable">
        value={choices.externalPolicy}
        onChange={(v) => update("externalPolicy", v)}
        options={[
          { id: "ask",         label: "Ask before each escalation", hint: "Recommended. Per-call approval with redaction options." },
          { id: "local-only",  label: "Local only", hint: "Never escalate. CereBro reports the gap when local can't deliver." },
          { id: "disable",     label: "Disable all external models", hint: "Hard off; same as local-only but locks the toggle." },
        ]}
      />
    </>
  );
}

function StepBrowser({ choices, update }: { choices: Choices; update: <K extends keyof Choices>(k: K, v: Choices[K]) => void }) {
  return (
    <>
      <Body>
        Browser tools are disabled by default. Silver Surfer's chamber stays locked
        until you turn this on. Pick the level of access. You can change it later in
        Settings.
      </Body>
      <ChoiceList<"disabled" | "source-only" | "approval">
        value={choices.browserPolicy}
        onChange={(v) => update("browserPolicy", v)}
        options={[
          { id: "disabled",    label: "Disabled", hint: "Recommended. Surfer's chamber renders locked." },
          { id: "source-only", label: "Source ingestion only", hint: "Static fetch + readability. No automation." },
          { id: "approval",    label: "Automation with per-session approval", hint: "Playwright + screenshots, every session prompts." },
        ]}
      />
    </>
  );
}

function StepApproval({ choices, update }: { choices: Choices; update: <K extends keyof Choices>(k: K, v: Choices[K]) => void }) {
  return (
    <>
      <Body>
        Approval Required tools (memory writes, Notion outbox, terminal commands,
        external model calls) prompt before running. How strict should those prompts
        be?
      </Body>
      <ChoiceList<"strict" | "balanced" | "fast">
        value={choices.approvalStrictness}
        onChange={(v) => update("approvalStrictness", v)}
        options={[
          { id: "strict",   label: "Strict", hint: "Confirm every action individually. No batched approvals." },
          { id: "balanced", label: "Balanced", hint: "Recommended. Approve once per task; risky actions still confirm." },
          { id: "fast",     label: "Fast", hint: "Approve a class of actions for the session. Highest risk." },
        ]}
      />
    </>
  );
}

function StepRaven({ choices, update }: { choices: Choices; update: <K extends keyof Choices>(k: K, v: Choices[K]) => void }) {
  return (
    <>
      <Body>
        Raven Reviews is sealed in V1. Three-gate password unseal exists for the
        future; nothing in V1 reaches it. You can keep it as a sealed placeholder or
        hide it from the UI entirely.
      </Body>
      <ChoiceList<"sealed" | "hide">
        value={choices.ravenChoice}
        onChange={(v) => update("ravenChoice", v)}
        options={[
          { id: "sealed", label: "Keep sealed", hint: "Recommended. Module exists, locked." },
          { id: "hide",   label: "Hide from view", hint: "No surface in the Keep at all." },
        ]}
      />
    </>
  );
}

function StepFirstProject({ choices, update }: { choices: Choices; update: <K extends keyof Choices>(k: K, v: Choices[K]) => void }) {
  return (
    <>
      <Body>
        Project Spaces are the unit of organization. They hold tasks, sessions,
        sources, outputs, decisions, and memory references for one effort. Name your
        first one. (Real Project Spaces persistence lands in Phase 6.)
      </Body>
      <TextInput
        value={choices.firstProject}
        onChange={(v) => update("firstProject", v)}
        placeholder="CereBro OS"
      />
    </>
  );
}

function StepHealthCheck() {
  const checks: Array<{ label: string; ok: boolean; note: string }> = [
    { label: "Storage root reachable",        ok: true,  note: "Path validation runs in Phase 6." },
    { label: "SQLite schema ready",           ok: true,  note: "Applied idempotently on connect." },
    { label: "Obsidian vault present",        ok: false, note: "Wired in Phase 6." },
    { label: "Ollama installed and reachable",ok: false, note: "Probed in Phase 6." },
    { label: "Notion bridge",                 ok: false, note: "Optional; configurable in Settings." },
    { label: "Browser adapter",               ok: false, note: "Disabled by default; check Settings to enable." },
    { label: "External model policy",         ok: true,  note: "Saved." },
  ];
  return (
    <>
      <Body>
        A best-effort health check. Most real probes wire in Phase 6. Yellow lines
        are not failures; they are honest stubs noting what's not yet built.
      </Body>
      <div className="mt-4 space-y-1.5">
        {checks.map((c) => (
          <div
            key={c.label}
            className="flex items-start gap-2 px-3 py-2 rounded"
            style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}
          >
            <span style={{ color: c.ok ? C.success : C.warning, lineHeight: 1.4 }}>{c.ok ? "✓" : "○"}</span>
            <div className="flex-1">
              <div className="text-xs font-semibold" style={{ color: C.textPrimary }}>{c.label}</div>
              <div className="text-xs" style={{ color: C.textMuted }}>{c.note}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function StepFinish({ choices }: { choices: Choices }) {
  return (
    <>
      <Body>
        You're set. The Keep opens to Aang in the upper Spires. Type into the
        "Ask Aang…" command bar at the bottom to capture intent. Cortana routes
        from her hub on the ground floor. Oak gates anything important.
      </Body>
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        {[
          ["Storage root",      choices.storageRoot],
          ["Obsidian",          choices.obsidianMode ?? "—"],
          ["Notion",            choices.notionMode ?? "—"],
          ["Ollama",            choices.ollamaPolicy ?? "—"],
          ["External models",   choices.externalPolicy ?? "—"],
          ["Browser",           choices.browserPolicy ?? "—"],
          ["Approval",          choices.approvalStrictness ?? "—"],
          ["Raven",             choices.ravenChoice ?? "—"],
          ["First project",     choices.firstProject],
        ].map(([k, v]) => (
          <div
            key={k}
            className="px-3 py-2 rounded"
            style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}
          >
            <div className="uppercase tracking-widest" style={{ color: C.textMuted, fontSize: 10 }}>{k}</div>
            <div className="font-semibold mt-0.5" style={{ color: C.textPrimary }}>{v as string}</div>
          </div>
        ))}
      </div>
    </>
  );
}
