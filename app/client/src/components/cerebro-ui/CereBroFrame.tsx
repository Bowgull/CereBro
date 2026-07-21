import { type CSSProperties, type ReactNode } from "react";
import { cerebroBrand as B } from "@/lib/cerebroTheme";
import { CereBroCorners } from "./CereBroOrnaments";

type CereBroFrameVariant = "shell" | "panel" | "browser-page";

type CereBroFrameProps = {
  children: ReactNode;
  variant?: CereBroFrameVariant;
  className?: string;
  style?: CSSProperties;
};

const frameBackground: Record<CereBroFrameVariant, string> = {
  shell: B.surface.shell,
  panel: `radial-gradient(circle at 50% 0%, rgba(198, 155, 85, 0.1), transparent 34%), linear-gradient(180deg, ${B.color.ink850}, ${B.color.ink950})`,
  "browser-page": B.surface.page,
};

export function CereBroFrame({ children, variant = "shell", className = "", style }: CereBroFrameProps) {
  return (
    <section
      className={`relative overflow-hidden rounded-[var(--cb-radius-frame)] ${className}`}
      style={{
        background: frameBackground[variant],
        border: `1px solid ${B.line.brass}`,
        boxShadow: `${B.shadow.shell}, ${B.shadow.bevel}, inset 0 0 0 3px rgba(198, 155, 85, 0.08)`,
        color: B.color.parchment100,
        ...style,
      }}
    >
      <CereBroCorners />
      <div className="relative z-[1] h-full min-h-0">{children}</div>
    </section>
  );
}
