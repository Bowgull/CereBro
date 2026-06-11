import { type ReactNode } from "react";
import { cerebroBrand as B } from "@/lib/cerebroTheme";

export function CereBroMenuSurface({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-[var(--cb-radius-control)] p-1 ${className}`}
      style={{
        background: B.surface.plaque,
        border: `1px solid ${B.line.brass}`,
        boxShadow: `0 18px 46px rgba(0, 0, 0, 0.62), ${B.shadow.bevel}`,
        color: B.color.parchment100,
      }}
    >
      {children}
    </div>
  );
}
