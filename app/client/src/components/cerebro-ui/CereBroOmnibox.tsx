import { Search } from "lucide-react";
import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cerebroBrand as B } from "@/lib/cerebroTheme";

type CereBroOmniboxProps = InputHTMLAttributes<HTMLInputElement> & {
  leading?: ReactNode;
  trailing?: ReactNode;
};

export const CereBroOmnibox = forwardRef<HTMLInputElement, CereBroOmniboxProps>(function CereBroOmnibox(
  { leading, trailing, className = "", style, ...props },
  ref,
) {
  return (
    <label
      className={`grid min-h-11 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-[var(--cb-radius-control)] px-3 ${className}`}
      style={{
        background: B.surface.address,
        border: `1px solid ${B.line.brass}`,
        boxShadow: `inset 0 1px 12px rgba(0, 0, 0, 0.58), ${B.shadow.bevel}`,
        color: B.color.parchment100,
        ...style,
      }}
    >
      <span className="grid place-items-center" style={{ color: B.color.gold300 }}>
        {leading ?? <Search size={16} strokeWidth={1.8} aria-hidden="true" />}
      </span>
      <input
        ref={ref}
        className="min-w-0 bg-transparent text-[13px] outline-none placeholder:text-[var(--cb-muted-500)]"
        style={{ color: B.color.parchment100, fontFamily: B.font.ui }}
        {...props}
      />
      <span>{trailing}</span>
    </label>
  );
});
