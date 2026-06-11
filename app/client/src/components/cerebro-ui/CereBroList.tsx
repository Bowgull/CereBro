import { type ButtonHTMLAttributes, type ReactNode } from "react";
import { cerebroBrand as B } from "@/lib/cerebroTheme";

type CereBroListRowProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: ReactNode;
  title: ReactNode;
  meta?: ReactNode;
};

export function CereBroList({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`grid gap-1 ${className}`}>{children}</div>;
}

export function CereBroListRow({ icon, title, meta, className = "", style, ...props }: CereBroListRowProps) {
  return (
    <button
      type="button"
      className={`grid grid-cols-[32px_minmax(0,1fr)] items-center gap-2 rounded-[var(--cb-radius-frame)] px-1.5 py-1.5 text-left transition duration-150 hover:bg-white/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:cursor-default disabled:opacity-65 ${className}`}
      style={{
        color: B.color.parchment100,
        ...style,
      }}
      {...props}
    >
      <span className="grid h-8 w-8 place-items-center rounded-[var(--cb-radius-frame)] text-[9px] font-bold" style={{ background: B.surface.address, border: `1px solid ${B.line.brassSoft}`, color: B.color.gold300 }}>
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[11px] font-semibold leading-tight">{title}</span>
        {meta ? <span className="block truncate text-[10px] leading-tight" style={{ color: B.color.muted500 }}>{meta}</span> : null}
      </span>
    </button>
  );
}
