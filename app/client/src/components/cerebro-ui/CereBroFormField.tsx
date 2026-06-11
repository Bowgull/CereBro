import { type InputHTMLAttributes } from "react";
import { cerebroBrand as B } from "@/lib/cerebroTheme";

type CereBroFormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export function CereBroFormField({ label, className = "", style, ...props }: CereBroFormFieldProps) {
  return (
    <label className="grid gap-1">
      {label ? <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: B.color.muted500 }}>{label}</span> : null}
      <input
        className={`h-10 rounded-[var(--cb-radius-control)] px-3 text-[12px] outline-none transition focus:ring-2 focus:ring-[var(--cb-gold-500)] ${className}`}
        style={{
          background: B.surface.address,
          border: `1px solid ${B.line.brassSoft}`,
          boxShadow: "inset 0 1px 12px rgba(0, 0, 0, 0.58)",
          color: B.color.parchment100,
          ...style,
        }}
        {...props}
      />
    </label>
  );
}
