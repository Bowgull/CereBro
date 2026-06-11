import { type ButtonHTMLAttributes, type ReactNode } from "react";
import { Plus } from "lucide-react";
import { cerebroBrand as B } from "@/lib/cerebroTheme";

type CereBroMedallionProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
  imageSrc?: string;
  label: string;
  fallback?: ReactNode;
  variant?: "framed" | "asset";
};

export function CereBroMedallion({ active = false, imageSrc, label, fallback, variant = "framed", className = "", style, ...props }: CereBroMedallionProps) {
  const rendersAssetChrome = variant === "asset" && imageSrc;

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`relative grid h-12 w-12 shrink-0 place-items-center rounded-full transition duration-150 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black ${className}`}
      style={{
        background: rendersAssetChrome ? "transparent" : active ? B.surface.plaqueActive : B.surface.plaque,
        border: rendersAssetChrome ? "0" : `1px solid ${active ? B.color.gold500 : B.line.brassSoft}`,
        boxShadow: rendersAssetChrome ? "none" : `${B.shadow.bevel}, 0 8px 18px rgba(0, 0, 0, 0.35)`,
        color: B.color.gold300,
        ...style,
      }}
      {...props}
    >
      {rendersAssetChrome ? (
        <span
          className="absolute inset-[4px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(230, 194, 132, 0.18), rgba(2, 5, 5, 0.04) 48%, transparent 72%)",
            boxShadow: "0 0 18px rgba(230, 194, 132, 0.14)",
          }}
          aria-hidden="true"
        />
      ) : (
        <span className="absolute inset-1 rounded-full" style={{ border: `1px solid ${B.line.brassSoft}` }} aria-hidden="true" />
      )}
      {imageSrc ? (
        <img
          src={imageSrc}
          alt=""
          className={rendersAssetChrome ? "absolute inset-0 z-[1] h-full w-full rounded-full object-contain" : "relative h-7 w-7 rounded object-contain"}
          style={rendersAssetChrome ? { filter: "brightness(1.28) contrast(1.18) drop-shadow(0 0 8px rgba(230, 194, 132, 0.18))" } : undefined}
          draggable={false}
        />
      ) : <span className="relative">{fallback ?? <Plus size={18} strokeWidth={1.7} aria-hidden="true" />}</span>}
      <span className="pointer-events-none absolute -bottom-1 h-2 w-2 rounded-full" aria-hidden="true" style={{ background: active ? B.color.gold300 : B.color.green600, border: `1px solid ${B.line.brass}`, boxShadow: `0 0 12px ${active ? "rgba(230, 194, 132, 0.55)" : "rgba(108, 174, 116, 0.5)"}` }} />
    </button>
  );
}
