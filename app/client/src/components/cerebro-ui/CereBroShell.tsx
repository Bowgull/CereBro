import { type CSSProperties, type ReactNode } from "react";
import { cerebroBrand as B } from "@/lib/cerebroTheme";
import { CereBroCorners } from "./CereBroOrnaments";

type CereBroShellProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

export function CereBroShell({ children, className = "", style }: CereBroShellProps) {
  return (
    <div
      className={`h-[100dvh] min-h-[100dvh] flex flex-col overflow-hidden gap-1.5 p-1.5 sm:p-2 ${className}`}
      style={{
        background: B.surface.app,
        color: B.color.parchment100,
        fontFamily: B.font.ui,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function CereBroWorkspaceFrame({ children, className = "", style }: CereBroShellProps) {
  return (
    <section
      className={`relative flex flex-1 overflow-hidden rounded-[var(--cb-radius-frame)] ${className}`}
      style={{
        minHeight: 0,
        background: B.color.ink850,
        border: `1px solid ${B.line.brass}`,
        boxShadow: `${B.shadow.shell}, ${B.shadow.bevel}`,
        ...style,
      }}
    >
      <CereBroCorners className="z-10" />
      {children}
    </section>
  );
}
