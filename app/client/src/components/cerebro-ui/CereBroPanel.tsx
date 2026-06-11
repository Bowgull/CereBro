import { type CSSProperties, type ReactNode } from "react";
import { cerebroBrand as B } from "@/lib/cerebroTheme";
import { CereBroCorners } from "./CereBroOrnaments";

type CereBroPanelProps = {
  title?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

export function CereBroPanel({ title, action, children, className = "", style }: CereBroPanelProps) {
  return (
    <section
      className={`relative overflow-hidden rounded-[var(--cb-radius-frame)] px-3 pb-2.5 pt-2.5 ${className}`}
      style={{
        background: "radial-gradient(circle at 50% 0%, rgba(198, 155, 85, 0.055), transparent 46%), rgba(5, 10, 10, 0.74)",
        border: `1px solid ${B.line.brassSoft}`,
        boxShadow: `${B.shadow.bevel}, inset 0 0 34px rgba(198, 155, 85, 0.035)`,
        color: B.color.parchment100,
        ...style,
      }}
    >
      <CereBroCorners />
      {title || action ? (
        <div className="relative z-[1] mb-2 flex items-center justify-between gap-3">
          {title ? <h3 className="text-[15px] font-semibold" style={{ color: B.color.gold300, fontFamily: B.font.display }}>{title}</h3> : <span />}
          {action}
        </div>
      ) : null}
      <div className="relative z-[1]">{children}</div>
    </section>
  );
}
