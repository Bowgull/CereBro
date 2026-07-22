// CereBro brand kit — CerebroRail
// The one navigation rail, on every surface. Fully componentized: leather-chrome
// background (cap + tiling slices, no vertical stretch) with real button
// components — brass-framed plaque + vector icon + live text label + ONE active
// style (gold ring, by state) for all five. No raster button art, so no
// off-family colors, no baked-in "active" variant, no blur, no size mismatch.
// See CEREBRO_BRAND_SYSTEM_SPEC.md and CEREBRO_UI_COHESION_AUDIT_2026-07-21.md.
import type { LucideIcon } from "lucide-react";
import { Globe, Wrench, ScrollText, Archive } from "lucide-react";
import { cerebroColors as C } from "@/lib/keepConfig";
import { cerebroBrand as B } from "@/lib/cerebroTheme";
import { CompassRose } from "@/components/brand/CompassRose";

export type RailZoneId = "keep" | "browser" | "workshop" | "ledger" | "basement";

type RailItem = {
  zone: RailZoneId;
  label: string;
};

// Rail's own icon set — chosen so no two buttons share a mark (Keep owns the
// compass emblem, so Browser is a globe, not another compass).
const RAIL_ICON: Record<Exclude<RailZoneId, "keep">, LucideIcon> = {
  browser: Globe,
  workshop: Wrench,
  ledger: ScrollText,
  basement: Archive,
};

const RAIL_WIDTH = 122;

export function CerebroRail({
  items,
  activeZone,
  onSelect,
  collapsed = false,
  statusLabel,
  statusActive,
}: {
  items: RailItem[];
  activeZone: RailZoneId;
  onSelect: (zone: RailZoneId) => void;
  collapsed?: boolean;
  statusLabel: string;
  statusActive: boolean;
}) {
  return (
    <nav
      className="relative flex shrink-0 flex-col overflow-hidden transition-[width] duration-200"
      style={{ width: collapsed ? 0 : RAIL_WIDTH }}
      aria-label="CereBro zones"
    >
      {/* Chrome: cap-top + tiling leather + cap-bottom — no vertical stretch. */}
      <div className="pointer-events-none absolute inset-x-0 top-0" aria-hidden="true" style={{ height: 9, background: "url('/brand/rail/cap-top.png') top / 100% 100% no-repeat" }} />
      <div className="pointer-events-none absolute inset-x-0" aria-hidden="true" style={{ top: 9, bottom: 27, background: "url('/brand/rail/tile-mid.png') top / 100% auto repeat-y" }} />
      <div className="pointer-events-none absolute inset-x-0 bottom-0" aria-hidden="true" style={{ height: 27, background: "url('/brand/rail/cap-bottom.png') bottom / 100% 100% no-repeat" }} />

      <div className="relative z-10 flex h-full flex-col px-2.5">
        <div className="flex flex-1 flex-col items-stretch justify-evenly py-3">
          {items.map((item) => {
            const isActive = activeZone === item.zone;
            const isKeep = item.zone === "keep";
            const Icon = isKeep ? null : RAIL_ICON[item.zone as Exclude<RailZoneId, "keep">];
            return (
              <button
                key={item.zone}
                type="button"
                onClick={() => onSelect(item.zone)}
                aria-label={`Open ${item.label}`}
                aria-current={isActive ? "page" : undefined}
                className={`group relative flex flex-col items-center justify-center gap-1.5 ${isKeep ? "py-4" : "py-2.5"} transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black`}
                style={{
                  background: isActive ? B.surface.plaqueActive : B.surface.plaque,
                  border: `1px solid ${isActive ? B.color.gold500 : B.line.brassSoft}`,
                  borderRadius: B.radius.control,
                  boxShadow: isActive
                    ? `${B.shadow.bevel}, 0 0 0 1px ${B.line.brass}, 0 0 16px rgba(198, 155, 85, 0.26)`
                    : B.shadow.bevel,
                  ["--tw-ring-color" as string]: C.accent,
                }}
              >
                {/* Active accent bar on the left edge. */}
                <span
                  className="pointer-events-none absolute left-0 top-1/2 h-8 w-[3px] -translate-y-1/2 rounded-r"
                  aria-hidden="true"
                  style={{ background: isActive ? B.color.gold500 : "transparent" }}
                />
                {isKeep ? (
                  <CompassRose size={44} variant="rail" bloom={false} style={{ opacity: isActive ? 1 : 0.85 }} />
                ) : (
                  Icon && (
                    <Icon
                      size={22}
                      strokeWidth={1.6}
                      aria-hidden="true"
                      style={{ color: isActive ? B.color.gold300 : B.color.gold500, opacity: isActive ? 1 : 0.9 }}
                    />
                  )
                )}
                <span
                  className="text-[11px] leading-none"
                  style={{
                    fontFamily: B.font.display,
                    color: isActive ? B.color.parchment100 : B.color.parchment300,
                  }}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Live activity pulse — anchored below the buttons. */}
        <div className="flex items-center justify-center gap-1.5 pb-9 pt-1" role="status" aria-label="Keep activity">
          <span
            className="h-1.5 w-1.5 shrink-0 rounded-full"
            style={{
              background: statusActive ? C.success : C.textMuted,
              boxShadow: statusActive ? `0 0 10px ${C.success}44` : undefined,
            }}
          />
          <span className="text-[9px] uppercase tracking-widest" style={{ color: C.textMuted }}>
            {statusLabel}
          </span>
        </div>
      </div>
    </nav>
  );
}
