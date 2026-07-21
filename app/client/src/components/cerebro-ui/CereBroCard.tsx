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
      className={`relative grid min-h-[92px] content-center justify-items-center gap-1.5 overflow-hidden rounded-[var(--cb-radius-frame)] px-3 pb-3 pt-4 text-center transition duration-150 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black ${className}`}
      style={{
        background: active
          ? "radial-gradient(circle at 50% 36%, rgba(198, 155, 85, 0.1), transparent 34%), linear-gradient(180deg, rgba(18, 27, 24, 0.94), rgba(5, 10, 9, 0.98))"
          : "radial-gradient(circle at 50% 36%, rgba(198, 155, 85, 0.08), transparent 35%), linear-gradient(180deg, rgba(11, 17, 15, 0.94), rgba(4, 8, 8, 0.98))",
        border: `1px solid ${active ? B.color.gold500 : B.line.brassSoft}`,
        boxShadow: `${B.shadow.bevel}, inset 0 0 34px rgba(198, 155, 85, 0.045)`,
        color: B.color.gold300,
        ...style,
      }}
      {...props}
    >
      <span className="pointer-events-none absolute inset-[2px] rounded-sm" style={{ border: `1px solid rgba(198, 155, 85, ${active ? 0.26 : 0.16})` }} aria-hidden="true" />
      <CereBroCorner position="top-left" size={20} />
      <CereBroCorner position="bottom-right" size={20} />
      <span className="relative z-[1] grid h-11 w-11 place-items-center">{icon}</span>
      <span className="relative z-[1] max-w-full truncate text-[13px] font-medium leading-none" style={{ fontFamily: B.font.display, textShadow: "0 1px 0 rgba(0, 0, 0, 0.72)" }}>{title}</span>
      {meta ? <span className="relative z-[1] max-w-full truncate text-[10px]" style={{ color: B.color.muted500 }}>{meta}</span> : null}
      <span className="absolute bottom-[-5px] h-2.5 w-2.5 rounded-full" aria-hidden="true" style={{ background: B.color.green600, border: `1px solid ${B.line.brass}`, boxShadow: "0 0 12px rgba(108, 174, 116, 0.4)" }} />
    </button>
  );
}
