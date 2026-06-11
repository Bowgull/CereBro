import { type CSSProperties } from "react";
import type { LucideIcon } from "lucide-react";
import { cerebroBrand as B } from "@/lib/cerebroTheme";
import { CereBroCorner } from "./CereBroOrnaments";

export type CereBroRailItem<Id extends string = string, Zone extends string = string> = {
  id: Id;
  zone: Zone;
  label: string;
  Icon: LucideIcon;
};

type CereBroRailProps<Id extends string = string, Zone extends string = string> = {
  items: CereBroRailItem<Id, Zone>[];
  activeZone: Zone;
  onNavigate: (id: Id) => void;
  compact?: boolean;
  footer?: string;
  className?: string;
  style?: CSSProperties;
};

function CompassGlyph() {
  return (
    <span className="relative block h-14 w-14 rounded-full" aria-hidden="true" style={{ border: `1px solid ${B.line.brass}`, boxShadow: `0 0 24px rgba(198, 155, 85, 0.16), ${B.shadow.bevel}` }}>
      <span className="absolute left-1/2 top-1/2 h-12 w-px -translate-x-1/2 -translate-y-1/2" style={{ background: B.color.gold300 }} />
      <span className="absolute left-1/2 top-1/2 h-px w-12 -translate-x-1/2 -translate-y-1/2" style={{ background: B.color.gold300 }} />
      <span className="absolute inset-3 rotate-45" style={{ border: `1px solid ${B.color.gold700}` }} />
      <span className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ background: B.color.gold300, boxShadow: "0 0 14px rgba(230, 194, 132, 0.5)" }} />
    </span>
  );
}

export function CereBroRail<Id extends string = string, Zone extends string = string>({
  items,
  activeZone,
  onNavigate,
  compact = false,
  footer,
  className = "",
  style,
}: CereBroRailProps<Id, Zone>) {
  const widthClass = compact ? "w-[84px]" : "w-[136px]";

  return (
    <nav
      className={`${widthClass} relative flex shrink-0 flex-col overflow-hidden ${className}`}
      aria-label="CereBro zones"
      style={{
        background: B.surface.rail,
        borderRight: `1px solid ${B.line.brass}`,
        boxShadow: "inset -1px 0 0 rgba(244, 239, 227, 0.05), inset 0 0 60px rgba(0, 0, 0, 0.5)",
        ...style,
      }}
    >
      <div className="pointer-events-none absolute inset-[5px]" aria-hidden="true" style={{ border: `1px solid ${B.line.brassSoft}` }} />
      <CereBroCorner position="top-left" size={30} />
      <CereBroCorner position="bottom-left" size={30} />

      <div className={`relative z-[1] grid place-items-center ${compact ? "h-24" : "h-40"}`}>
        <CompassGlyph />
        {!compact ? (
          <div className="mt-2 text-[15px] leading-none" style={{ color: B.color.gold300, fontFamily: B.font.display }}>
            Keep
          </div>
        ) : null}
      </div>

      <div className="relative z-[1] flex flex-1 flex-col gap-4 px-3 py-2">
        {items.map((item) => {
          const isActive = activeZone === item.zone;
          const Icon = item.Icon;

          return (
            <button
              key={item.zone}
              type="button"
              onClick={() => onNavigate(item.id)}
              aria-label={`Open ${item.label}`}
              aria-current={isActive ? "page" : undefined}
              className={`group relative grid min-h-[72px] place-items-center rounded-[var(--cb-radius-control)] px-2 text-center transition duration-150 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black ${compact ? "gap-1" : "grid-cols-[34px_minmax(0,1fr)] gap-2 text-left"}`}
              style={{
                background: isActive ? B.surface.railActive : "rgba(3, 13, 12, 0.56)",
                border: `1px solid ${isActive ? B.color.gold500 : B.line.brassSoft}`,
                boxShadow: `${B.shadow.bevel}${isActive ? ", 0 0 26px rgba(108, 174, 116, 0.18)" : ""}`,
                color: isActive ? B.color.parchment100 : B.color.parchment200,
              }}
            >
              {isActive ? <span className="absolute -left-3 top-1/2 h-10 w-[3px] -translate-y-1/2 rounded-r" style={{ background: B.color.green600, boxShadow: "0 0 18px rgba(108, 174, 116, 0.75)" }} /> : null}
              <span className="grid h-8 w-8 place-items-center rounded-full" style={{ border: `1px solid ${isActive ? B.color.gold300 : B.line.brassSoft}`, color: isActive ? B.color.gold300 : B.color.gold700 }}>
                <Icon size={compact ? 18 : 20} strokeWidth={1.55} aria-hidden="true" />
              </span>
              {!compact ? (
                <span className="min-w-0 text-[15px] leading-none" style={{ fontFamily: B.font.display }}>
                  {item.label}
                </span>
              ) : (
                <span className="max-w-full truncate text-[9px] font-semibold uppercase tracking-wider">{item.label}</span>
              )}
            </button>
          );
        })}
      </div>

      {footer ? (
        <div className="relative z-[1] mx-3 mb-3 rounded-[var(--cb-radius-frame)] px-2 py-2 text-center text-[9px] uppercase tracking-wider" style={{ border: `1px solid ${B.line.brassSoft}`, background: B.surface.plaque, color: B.color.muted500, boxShadow: B.shadow.bevel }}>
          {footer}
        </div>
      ) : null}
    </nav>
  );
}
