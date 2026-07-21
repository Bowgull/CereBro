import { type ButtonHTMLAttributes, type ReactNode } from "react";
import { X } from "lucide-react";
import { cerebroBrand as B } from "@/lib/cerebroTheme";

type CereBroTabProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
  leading?: ReactNode;
  onClose?: () => void;
};

export function CereBroTab({ active = false, leading, children, onClose, className = "", style, ...props }: CereBroTabProps) {
  return (
    <button
      type="button"
      className={`group grid min-h-9 min-w-[148px] max-w-[240px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 rounded-t-[var(--cb-radius-control)] px-3 text-left text-[12px] transition duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black ${className}`}
      style={{
        background: active ? B.surface.plaqueActive : "rgba(8, 14, 13, 0.72)",
        border: `1px solid ${active ? B.line.brass : B.line.brassSoft}`,
        borderBottomColor: active ? B.color.gold500 : "transparent",
        boxShadow: B.shadow.bevel,
        color: active ? B.color.parchment100 : B.color.muted500,
        ...style,
      }}
      {...props}
    >
      <span className="shrink-0">{leading}</span>
      <span className="truncate">{children}</span>
      {onClose ? (
        <span
          role="button"
          tabIndex={-1}
          aria-label="Close tab"
          className="grid h-5 w-5 place-items-center rounded text-current opacity-70 transition hover:opacity-100"
          onClick={(event) => {
            event.stopPropagation();
            onClose();
          }}
        >
          <X size={13} strokeWidth={1.8} aria-hidden="true" />
        </span>
      ) : null}
    </button>
  );
}
