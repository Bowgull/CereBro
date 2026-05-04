import { useState, useMemo } from "react";
import {
  AGENTS_BY_FLOOR,
  FLOORS,
  cerebroColors as C,
  type FloorId,
  type AgentConfig,
} from "@/lib/keepConfig";
import type { Hero } from "@/hooks/useHeroSocket";

interface Props {
  heroes: Hero[];
  selectedHeroId: number | null;
  onHeroClick: (id: number) => void;
}

// V1: every active session shows up as an orb in Cortana's Hub.
// Phase 3 introduces per-agent session routing.
export default function KeepMap({ heroes }: Props) {
  const [floor, setFloor] = useState<FloorId>("ground");
  const agents = AGENTS_BY_FLOOR[floor];
  const userPresent = heroes.length > 0;

  return (
    <div className="h-full w-full flex flex-col" style={{ background: C.background }}>
      <FloorSelector active={floor} onChange={setFloor} />

      <div className="flex-1 relative overflow-auto p-6">
        <FloorPlan agents={agents} userPresent={userPresent} sessionCount={heroes.length} />
      </div>
    </div>
  );
}

function FloorSelector({ active, onChange }: { active: FloorId; onChange: (f: FloorId) => void }) {
  const order: FloorId[] = ["upper", "ground", "crypts"];
  return (
    <div
      className="flex items-center gap-1 px-4 py-2 border-b"
      style={{ borderColor: C.borderSoft, background: C.backgroundSoft }}
    >
      {order.map((id) => {
        const f = FLOORS[id];
        const isActive = id === active;
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className="px-3 py-1.5 text-xs uppercase tracking-widest rounded transition-colors"
            style={{
              color: isActive ? C.textPrimary : C.textMuted,
              background: isActive ? C.surfaceRaised : "transparent",
              border: `1px solid ${isActive ? C.accentSoft : C.borderSoft}`,
            }}
          >
            {f.name}
          </button>
        );
      })}
      <div className="ml-3 text-xs" style={{ color: C.textMuted }}>
        {FLOORS[active].blurb}
      </div>
    </div>
  );
}

function FloorPlan({
  agents,
  userPresent,
  sessionCount,
}: {
  agents: AgentConfig[];
  userPresent: boolean;
  sessionCount: number;
}) {
  // 3 columns x up to 2 rows. Chambers placed by their col/row.
  const grid = useMemo(() => {
    const map = new Map<string, AgentConfig>();
    agents.forEach((a) => map.set(`${a.col}-${a.row}`, a));
    return map;
  }, [agents]);

  const rows = [0, 1];
  const cols = [0, 1, 2];

  return (
    <div className="mx-auto" style={{ maxWidth: 1100 }}>
      {rows.map((r) => {
        const rowHasAny = cols.some((c) => grid.has(`${c}-${r}`));
        if (!rowHasAny) return null;
        return (
          <div key={r} className="grid grid-cols-3 gap-4 mb-4">
            {cols.map((c) => {
              const agent = grid.get(`${c}-${r}`);
              if (!agent) return <div key={c} />;
              const isHub = agent.id === "cortana";
              return (
                <Chamber
                  key={agent.id}
                  agent={agent}
                  highlight={isHub && userPresent}
                  badge={isHub && sessionCount > 0 ? `${sessionCount} live` : undefined}
                  showOrb={isHub}
                  orbActive={userPresent}
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

function Chamber({
  agent,
  highlight,
  badge,
  showOrb,
  orbActive,
}: {
  agent: AgentConfig;
  highlight?: boolean;
  badge?: string;
  showOrb?: boolean;
  orbActive?: boolean;
}) {
  return (
    <div
      className="relative rounded-lg p-4 flex flex-col"
      style={{
        background: highlight ? C.surfaceRaised : C.surface,
        border: `1px solid ${highlight ? C.accentViolet : C.borderSoft}`,
        minHeight: 180,
        boxShadow: highlight ? `0 0 0 1px ${C.accentSoft} inset` : undefined,
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-xs uppercase tracking-widest" style={{ color: C.textMuted }}>
            {agent.chamber}
          </div>
          <div className="text-base font-semibold mt-0.5" style={{ color: C.textPrimary }}>
            {agent.name}
          </div>
        </div>
        {badge && (
          <span
            className="text-xs px-2 py-0.5 rounded uppercase tracking-wider"
            style={{ background: C.accentSoft, color: C.textPrimary }}
          >
            {badge}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3 flex-1">
        <AgentSigil hue={agent.hue} initial={agent.initial} />
        <div className="text-xs leading-relaxed" style={{ color: C.textSecondary }}>
          {agent.role}
        </div>
      </div>

      {showOrb && (
        <div className="mt-3 flex items-center gap-2">
          <Orb active={!!orbActive} />
          <div className="text-xs" style={{ color: orbActive ? C.glowViolet : C.textMuted }}>
            {orbActive ? "You are present" : "Awaiting you"}
          </div>
        </div>
      )}
    </div>
  );
}

function AgentSigil({ hue, initial }: { hue: string; initial: string }) {
  return (
    <div
      className="flex items-center justify-center font-bold text-lg shrink-0"
      style={{
        width: 44,
        height: 44,
        borderRadius: 8,
        background: `${hue}22`,
        border: `1px solid ${hue}66`,
        color: hue,
      }}
    >
      {initial}
    </div>
  );
}

function Orb({ active }: { active: boolean }) {
  return (
    <div
      style={{
        width: 14,
        height: 14,
        borderRadius: "50%",
        background: active ? C.glowViolet : C.surfaceMuted,
        border: `1px solid ${active ? C.accentViolet : C.borderSoft}`,
        boxShadow: active ? `0 0 12px ${C.accentViolet}` : undefined,
      }}
    />
  );
}
