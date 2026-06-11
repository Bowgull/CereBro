import { type CSSProperties, type ReactNode } from "react";
import { cerebroBrand as B } from "@/lib/cerebroTheme";
import { CereBroCorners } from "./CereBroOrnaments";

type CereBroChromeProps = {
  brand?: ReactNode;
  center?: ReactNode;
  actions?: ReactNode;
  className?: string;
  style?: CSSProperties;
};

export function CereBroChrome({ brand, center, actions, className = "", style }: CereBroChromeProps) {
  return (
    <header
      className={`relative flex shrink-0 items-center justify-between gap-2 overflow-hidden rounded-[var(--cb-radius-frame)] px-2.5 py-1.5 ${className}`}
      aria-label="CereBro chrome"
      style={{
        background: `radial-gradient(circle at 8% 0%, rgba(198, 155, 85, 0.12), transparent 28%), radial-gradient(circle at 88% 12%, rgba(77, 170, 154, 0.1), transparent 30%), ${B.surface.plaque}`,
        border: `1px solid ${B.line.brass}`,
        boxShadow: `0 14px 38px rgba(0, 0, 0, 0.36), ${B.shadow.bevel}`,
        ...style,
      }}
    >
      <CereBroCorners />
      <div className="relative z-[1] flex min-w-0 shrink-0 items-center gap-2">{brand}</div>
      {center ? <div className="relative z-[1] hidden min-w-0 flex-1 items-center justify-center md:flex">{center}</div> : <span className="min-w-0 flex-1" />}
      {actions ? <div className="relative z-[1] flex min-w-0 shrink-0 items-center gap-1">{actions}</div> : null}
    </header>
  );
}

export function CereBroChromeMark({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <>
      <div className="grid h-7 w-7 place-items-center rounded-[var(--cb-radius-frame)]" style={{ background: B.surface.plaqueActive, border: `1px solid ${B.line.brass}`, color: B.color.gold300, boxShadow: `${B.shadow.bevel}, 0 0 22px rgba(198, 155, 85, 0.1)` }}>
        <span className="text-sm leading-none">◆</span>
      </div>
      <div className="min-w-0">
        <h1 className="truncate text-[12px] font-bold uppercase leading-none tracking-widest" style={{ color: B.color.parchment100 }}>
          {title}
        </h1>
        <p className="mt-0.5 truncate text-[10px] leading-none" style={{ color: B.color.muted500 }}>
          {subtitle}
        </p>
      </div>
    </>
  );
}
