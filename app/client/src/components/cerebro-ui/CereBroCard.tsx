import { type ButtonHTMLAttributes, type ReactNode } from "react";
import { cerebroBrand as B } from "@/lib/cerebroTheme";
import { CereBroCorner } from "./CereBroOrnaments";

type CereBroCardProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: ReactNode;
  title: ReactNode;
  meta?: ReactNode;
  active?: boolean;
};

export function CereBroCard({ icon, title, meta, active = false, className = "", style, ...props }: CereBroCardProps) {
  return (
    <button
      type="button"
      className={`relative grid min-h-[92px] content-center justify-items-center gap-2 overflow-hidden rounded-[var(--cb-radius-frame)] px-3 py-3 text-center transition duration-150 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black ${className}`}
      style={{
        background: active ? B.surface.plaqueActive : "linear-gradient(180deg, rgba(13, 20, 18, 0.9), rgba(5, 9, 9, 0.95))",
        border: `1px solid ${active ? B.color.gold500 : B.line.brass}`,
        boxShadow: B.shadow.bevel,
        color: B.color.parchment100,
        ...style,
      }}
      {...props}
    >
      <CereBroCorner position="top-left" size={20} />
      <CereBroCorner position="bottom-right" size={20} />
      <span className="relative z-[1] grid h-10 w-10 place-items-center">{icon}</span>
      <span className="relative z-[1] max-w-full truncate text-[12px] font-semibold">{title}</span>
      {meta ? <span className="relative z-[1] max-w-full truncate text-[10px]" style={{ color: B.color.muted500 }}>{meta}</span> : null}
      <span className="absolute bottom-[-5px] h-2.5 w-2.5 rounded-full" aria-hidden="true" style={{ background: B.color.green600, border: `1px solid ${B.line.brass}`, boxShadow: "0 0 12px rgba(108, 174, 116, 0.4)" }} />
    </button>
  );
}
