// CereBro brand kit — CerebroRail
// The one navigation rail, on every surface. Hybrid build: the chrome is
// composed from cap/tile slices of the approved rail art (no stretching at any
// window height) and the illustrated buttons render at their natural aspect
// ratios. Active state is CSS until per-zone active art exists. The freed
// bottom space holds the live activity pulse. See CEREBRO_BRAND_SYSTEM_SPEC.md
// and CEREBRO_UI_COHESION_AUDIT_2026-07-21.md (items 2/5).
import { cerebroColors as C } from "@/lib/keepConfig";

export type RailZoneId = "keep" | "browser" | "workshop" | "ledger" | "basement";

type RailItem = {
  zone: RailZoneId;
  label: string;
};

// Button art from the approved mockup extraction, with natural pixel sizes —
// rendered widths derive heights so nothing ever stretches.
const RAIL_BUTTON_ART: Record<RailZoneId, { src: string; w: number; h: number }> = {
  keep: { src: "/browser-home/assets/rail-keep.png", w: 118, h: 185 },
  browser: { src: "/browser-home/assets/rail-browser-active.png", w: 118, h: 83 },
  workshop: { src: "/browser-home/assets/rail-workshop.png", w: 116, h: 80 },
  ledger: { src: "/browser-home/assets/rail-ledger.png", w: 116, h: 80 },
  basement: { src: "/browser-home/assets/rail-basement.png", w: 116, h: 91 },
};

const RAIL_WIDTH = 122;
const BUTTON_WIDTH = Math.round(RAIL_WIDTH * 0.84);

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
      className={`${collapsed ? "w-0" : `w-[${RAIL_WIDTH}px]`} relative flex shrink-0 flex-col overflow-hidden transition-[width] duration-200`}
      style={{ width: collapsed ? 0 : RAIL_WIDTH }}
      aria-label="CereBro zones"
    >
      {/* Chrome: cap-top + tiling leather + cap-bottom — no vertical stretch. */}
      <div className="pointer-events-none absolute inset-x-0 top-0" aria-hidden="true" style={{ height: 9, background: "url('/brand/rail/cap-top.png') top / 100% 100% no-repeat" }} />
      <div className="pointer-events-none absolute inset-x-0" aria-hidden="true" style={{ top: 9, bottom: 27, background: "url('/brand/rail/tile-mid.png') top / 100% auto repeat-y" }} />
      <div className="pointer-events-none absolute inset-x-0 bottom-0" aria-hidden="true" style={{ height: 27, background: "url('/brand/rail/cap-bottom.png') bottom / 100% 100% no-repeat" }} />

      {/* Buttons at natural aspect, distributed evenly across the full rail
          height so there is no dead pocket at the bottom (they never scale). */}
      <div className="relative z-10 flex h-full flex-col">
       <div className="flex flex-1 flex-col items-center justify-evenly py-3">
        {items.map((item) => {
          const art = RAIL_BUTTON_ART[item.zone];
          const height = Math.round((art.h / art.w) * BUTTON_WIDTH);
          const isActive = activeZone === item.zone;
          return (
            <button
              key={item.zone}
              type="button"
              onClick={() => onSelect(item.zone)}
              aria-label={`Open ${item.label}`}
              aria-current={isActive ? "page" : undefined}
              className="overflow-hidden rounded-sm transition duration-200 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              style={{
                width: BUTTON_WIDTH,
                height,
                filter: isActive ? "brightness(1.06)" : "brightness(0.62) saturate(0.75)",
                boxShadow: isActive
                  ? "0 0 0 1.5px rgba(198, 155, 85, 0.7), 0 0 18px rgba(198, 155, 85, 0.3)"
                  : undefined,
                ["--tw-ring-color" as string]: C.accent,
              }}
            >
              <img src={art.src} alt="" className="h-full w-full object-fill" draggable={false} />
              <span className="sr-only">{item.label}</span>
            </button>
          );
        })}
       </div>

       {/* Live activity pulse — anchored below the distributed buttons. */}
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
