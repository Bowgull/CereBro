import {
  KEEP_FORTRESS_MAP,
  type KeepLevelId,
  type KeepRoom,
} from "@/lib/keepFortressMap";
import { cerebroColors as C } from "@/lib/keepConfig";

const AGENT_COLORS: Record<string, string> = {
  aang: C.success,
  cortana: C.glowViolet,
  gojo: C.accent,
  batman: C.warning,
  spock: "#67E8F9",
  oak: "#8FB4D9",
  tony: C.danger,
  surfer: C.accent,
  c3po: C.gold,
  piccolo: "#4ADE80",
  hedwig: "#E9D5FF",
};

const LEVEL_LABELS: Record<KeepLevelId, string> = {
  upper: "Upper review",
  command: "Command",
  ground: "Ground entry",
  undercroft: "Undercroft",
};

function roomColor(room: KeepRoom) {
  return AGENT_COLORS[room.agentId] ?? C.stone;
}

function gridStyle(rect: { x: number; y: number; w: number; h: number }) {
  return {
    left: `${(rect.x / KEEP_FORTRESS_MAP.cols) * 100}%`,
    top: `${(rect.y / KEEP_FORTRESS_MAP.rows) * 100}%`,
    width: `${(rect.w / KEEP_FORTRESS_MAP.cols) * 100}%`,
    height: `${(rect.h / KEEP_FORTRESS_MAP.rows) * 100}%`,
  };
}

function pointStyle(point: { x: number; y: number }) {
  return {
    left: `${(point.x / KEEP_FORTRESS_MAP.cols) * 100}%`,
    top: `${(point.y / KEEP_FORTRESS_MAP.rows) * 100}%`,
  };
}

export default function KeepFortressBlueprint() {
  return (
    <div
      className="absolute inset-0 overflow-auto p-4"
      style={{ background: C.background }}
      aria-label="Keep tile blueprint"
    >
      <div className="w-full h-full min-h-[560px] grid grid-rows-[1fr_auto] gap-3">
        <div
          className="relative overflow-hidden w-full self-center"
          style={{
            aspectRatio: "64 / 34",
            maxHeight: "100%",
            border: `1px solid ${C.borderSoft}`,
            background:
              "linear-gradient(180deg, rgba(27,38,59,0.78), rgba(8,11,18,0.96))",
          }}
        >
          <div
            className="absolute"
            style={{
              ...gridStyle(KEEP_FORTRESS_MAP.shell),
              border: `2px solid ${C.stone}`,
              background: "rgba(13,17,25,0.5)",
            }}
          />

          <div
            className="absolute inset-0 opacity-50"
            style={{
              backgroundImage:
                "linear-gradient(rgba(107,166,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(107,166,255,0.1) 1px, transparent 1px)",
              backgroundSize: "1.5625% 2.941%",
            }}
          />

          {KEEP_FORTRESS_MAP.floorCourses.map((course) => (
            <div
              key={course.id}
              className="absolute"
              style={{
                left: `${(2 / KEEP_FORTRESS_MAP.cols) * 100}%`,
                top: `${(course.y / KEEP_FORTRESS_MAP.rows) * 100}%`,
                width: `${(60 / KEEP_FORTRESS_MAP.cols) * 100}%`,
                height: 8,
                background: `repeating-linear-gradient(90deg, ${C.stoneWallHi} 0 24px, ${C.stoneMortar} 24px 27px)`,
                borderTop: "1px solid rgba(244,239,227,0.16)",
                borderBottom: "1px solid rgba(0,0,0,0.7)",
              }}
              title={course.label}
            />
          ))}

          {KEEP_FORTRESS_MAP.hallways.map((hall) => (
            <div
              key={hall.id}
              className="absolute"
              style={{
                ...gridStyle(hall),
                background: hall.level === "undercroft" ? "rgba(74,222,128,0.14)" : "rgba(107,166,255,0.14)",
                borderTop: "1px solid rgba(107,166,255,0.34)",
                borderBottom: "1px solid rgba(107,166,255,0.24)",
              }}
              title={LEVEL_LABELS[hall.level]}
            />
          ))}

          {KEEP_FORTRESS_MAP.zoomBounds.map((zoom) => (
            <div
              key={zoom.id}
              className="absolute"
              style={{
                ...gridStyle(zoom),
                border: `1px dotted ${zoom.id === "undercroft" ? "#4ADE80" : C.textMuted}`,
                opacity: 0.75,
              }}
              title={zoom.label}
            />
          ))}

          {KEEP_FORTRESS_MAP.rooms.map((room) => {
            const color = roomColor(room);
            return (
              <section
                key={room.roomId}
                className="absolute p-2 overflow-hidden"
                style={{
                  ...gridStyle(room.rect),
                  border: `2px ${room.phase === "dim" ? "dashed" : "solid"} ${color}`,
                  background:
                    room.level === "undercroft"
                      ? "linear-gradient(180deg, rgba(16,32,27,0.82), rgba(6,10,10,0.96))"
                      : room.phase === "dim"
                        ? "repeating-linear-gradient(135deg, rgba(32,42,56,0.48) 0 12px, rgba(8,11,16,0.72) 12px 24px)"
                        : "linear-gradient(180deg, rgba(32,42,56,0.84), rgba(12,16,24,0.92))",
                }}
              >
                <div className="relative z-10 flex items-center justify-between gap-2">
                  <h2 className="m-0 text-[10px] font-bold uppercase leading-tight" style={{ color: C.textPrimary }}>
                    {room.roomName}
                  </h2>
                  <span className="w-2.5 h-2.5 shrink-0" style={{ background: color, border: "1px solid rgba(244,239,227,0.7)" }} />
                </div>
                <p className="relative z-10 mt-1 m-0 text-[9px] leading-tight" style={{ color: C.textSecondary }}>
                  {room.notes}
                </p>
                <div
                  className="absolute left-2 right-2 bottom-5 h-px"
                  style={{ background: "rgba(244,239,227,0.18)" }}
                />
                {room.windowSlots.map((windowSlot, index) => (
                  <i
                    key={`${room.roomId}-window-${index}`}
                    className="absolute w-3 h-5"
                    style={{
                      ...pointStyle(windowSlot),
                      border: "1px solid rgba(107,166,255,0.58)",
                      background: "rgba(107,166,255,0.13)",
                    }}
                  />
                ))}
                {room.doors.map((door, index) => (
                  <i
                    key={`${room.roomId}-door-${index}`}
                    className="absolute w-3 h-5"
                    style={{
                      ...pointStyle(door),
                      transform: "translate(-50%, -100%)",
                      border: `2px solid ${C.gold}`,
                      background: "rgba(5,7,11,0.72)",
                    }}
                  />
                ))}
                {room.propZones.map((prop) => (
                  <i
                    key={`${room.roomId}-${prop.id}`}
                    className="absolute"
                    style={{
                      ...gridStyle(prop),
                      border: "1px solid rgba(244,239,227,0.32)",
                      background: "rgba(244,239,227,0.08)",
                    }}
                    title={prop.label}
                  />
                ))}
                <i
                  className="absolute w-2.5 h-2.5"
                  style={{
                    ...pointStyle(room.agentSpot),
                    transform: "translate(-50%, -50%)",
                    border: "1px solid rgba(244,239,227,0.78)",
                    background: color,
                  }}
                  title={`${room.roomName} agent spot`}
                />
              </section>
            );
          })}

          {KEEP_FORTRESS_MAP.stairs.map((stair) => (
            <div
              key={stair.id}
              className="absolute"
              style={{
                ...gridStyle(stair),
                borderLeft: `4px solid ${C.gold}`,
                borderBottom: `4px solid ${C.gold}`,
                transform: `skewX(${stair.direction === "up-left" ? 24 : -24}deg)`,
                opacity: 0.88,
              }}
              title={stair.label}
            />
          ))}

          {KEEP_FORTRESS_MAP.pathEdges.map((edge) => {
            const from = KEEP_FORTRESS_MAP.pathNodes.find((node) => node.id === edge.from);
            const to = KEEP_FORTRESS_MAP.pathNodes.find((node) => node.id === edge.to);
            if (!from || !to) return null;
            const x1 = (from.x / KEEP_FORTRESS_MAP.cols) * 100;
            const y1 = (from.y / KEEP_FORTRESS_MAP.rows) * 100;
            const x2 = (to.x / KEEP_FORTRESS_MAP.cols) * 100;
            const y2 = (to.y / KEEP_FORTRESS_MAP.rows) * 100;
            const left = Math.min(x1, x2);
            const top = Math.min(y1, y2);
            return (
              <div
                key={`${edge.from}-${edge.to}`}
                className="absolute pointer-events-none"
                style={{
                  left: `${left}%`,
                  top: `${top}%`,
                  width: `${Math.max(Math.abs(x2 - x1), 0.2)}%`,
                  height: `${Math.max(Math.abs(y2 - y1), 0.2)}%`,
                  borderTop: `2px solid ${C.accent}`,
                  borderRight: y1 !== y2 ? `2px solid ${C.accent}` : undefined,
                  opacity: 0.45,
                }}
              />
            );
          })}

          {KEEP_FORTRESS_MAP.pathNodes.map((node) => (
            <i
              key={node.id}
              className="absolute w-2 h-2"
              style={{
                ...pointStyle(node),
                transform: "translate(-50%, -50%)",
                border: "1px solid rgba(244,239,227,0.78)",
                background: "rgba(107,166,255,0.58)",
              }}
              title={node.label}
            />
          ))}
        </div>

        <div
          className="grid grid-cols-[minmax(220px,0.8fr)_minmax(0,1.6fr)] gap-3 text-xs"
          style={{ color: C.textSecondary }}
        >
          <section style={{ border: `1px solid ${C.borderSoft}`, background: `${C.surface}aa`, padding: 12 }}>
            <h2 className="m-0 mb-2 text-xs uppercase tracking-widest" style={{ color: C.textPrimary }}>
              Blueprint
            </h2>
            <p className="m-0 leading-relaxed">
              64 by 34 tiles. Every agent has an address. Hero rooms can be built first. Dim rooms still reserve real castle space.
            </p>
          </section>

          <section style={{ border: `1px solid ${C.borderSoft}`, background: `${C.surface}aa`, padding: 12 }}>
            <h2 className="m-0 mb-2 text-xs uppercase tracking-widest" style={{ color: C.textPrimary }}>
              Residency
            </h2>
            <div className="grid grid-cols-4 gap-x-3 gap-y-1">
              {KEEP_FORTRESS_MAP.rooms.map((room) => (
                <div key={room.roomId} className="truncate">
                  <span style={{ color: roomColor(room) }}>{room.agentId}</span>
                  <span style={{ color: C.textMuted }}> x{room.rect.x} y{room.rect.y} w{room.rect.w} h{room.rect.h}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
