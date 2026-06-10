import React from "react";
import { cerebroColors as C } from "@/lib/keepConfig";

interface StatsPanelProps {
  totalAgents: number;
  totalTokens: number;
  totalCost: number;
  activeAgents: number;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({
  totalAgents,
  totalTokens,
  totalCost,
  activeAgents,
}) => {
  const stats = [
    { label: "Agents", value: totalAgents.toLocaleString(), tone: C.success },
    { label: "Active", value: activeAgents.toLocaleString(), tone: C.accent },
    { label: "Tokens", value: totalTokens.toLocaleString(), tone: C.accent },
    { label: "Cost", value: `$${totalCost.toFixed(4)}`, tone: C.gold },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 p-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="min-w-0 rounded p-2"
          style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}
        >
          <p className="mb-1 truncate text-[10px] font-semibold uppercase tracking-widest" style={{ color: C.textMuted }}>
            {stat.label}
          </p>
          <p className="truncate font-mono text-lg font-semibold leading-none" style={{ color: stat.tone }} title={stat.value}>
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
};

export default StatsPanel;
