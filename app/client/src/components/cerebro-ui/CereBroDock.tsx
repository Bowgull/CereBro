import { type ReactNode } from "react";
import { cerebroBrand as B } from "@/lib/cerebroTheme";

type CereBroDockProps = {
  avatar?: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
};

export function CereBroDock({ avatar, children, actions, className = "" }: CereBroDockProps) {
  return (
    <div
      className={`grid min-h-[86px] grid-cols-[72px_minmax(0,1fr)_auto] items-center gap-3 rounded-[var(--cb-radius-frame)] px-3 py-2 ${className}`}
      style={{
        background: "linear-gradient(180deg, rgba(4, 8, 8, 0.9), rgba(2, 5, 5, 0.98))",
        border: `1px solid ${B.line.brassSoft}`,
        boxShadow: "0 -18px 46px rgba(0, 0, 0, 0.5)",
        color: B.color.parchment100,
      }}
    >
      <div
        className="grid h-16 w-16 place-items-center rounded-full"
        style={{
          background: "rgba(8, 14, 13, 0.92)",
          border: `1px solid ${B.line.brass}`,
          boxShadow: `${B.shadow.bevel}, 0 12px 30px rgba(0, 0, 0, 0.36)`,
        }}
      >
        {avatar}
      </div>
      <div className="min-w-0">{children}</div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}
