import type { AgentId } from "./keepConfig";

export type KeepRoomPhase = "hero" | "dim";
export type KeepLevelId = "upper" | "command" | "ground" | "undercroft";
export type KeepDoorSide = "left" | "right" | "center";
export type KeepFacing = "north" | "east" | "south" | "west";

export interface KeepRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface KeepPoint {
  x: number;
  y: number;
}

export interface KeepDoor {
  side: KeepDoorSide;
  x: number;
  y: number;
}

export interface KeepRoomPropZone extends KeepRect {
  id: string;
  label: string;
}

export interface KeepRoom {
  agentId: AgentId;
  roomId: string;
  roomName: string;
  level: KeepLevelId;
  rect: KeepRect;
  phase: KeepRoomPhase;
  doors: KeepDoor[];
  agentSpot: KeepPoint;
  callSpot: KeepPoint;
  windowSlots: KeepPoint[];
  propZones: KeepRoomPropZone[];
  notes: string;
}

export interface KeepFloorCourse {
  id: string;
  level: KeepLevelId;
  y: number;
  label: string;
}

export interface KeepHallway extends KeepRect {
  id: string;
  level: KeepLevelId;
}

export interface KeepStair extends KeepRect {
  id: string;
  from: KeepLevelId;
  to: KeepLevelId;
  label: string;
  direction: "up-right" | "up-left" | "down";
}

export interface KeepPathNode extends KeepPoint {
  id: string;
  label: string;
}

export interface KeepPathEdge {
  from: string;
  to: string;
}

export interface KeepCouncilSpot extends KeepPoint {
  id: string;
  agentId: Exclude<AgentId, "cortana">;
  facing: KeepFacing;
  tier: "front" | "back" | "threshold";
}

export interface KeepZoomBounds extends KeepRect {
  id: string;
  label: string;
}

export interface KeepFortressMap {
  cols: number;
  rows: number;
  tileSize: number;
  shell: KeepRect;
  rooms: KeepRoom[];
  floorCourses: KeepFloorCourse[];
  hallways: KeepHallway[];
  stairs: KeepStair[];
  pathNodes: KeepPathNode[];
  pathEdges: KeepPathEdge[];
  councilSpots: KeepCouncilSpot[];
  zoomBounds: KeepZoomBounds[];
}

const door = (side: KeepDoorSide, x: number, y: number): KeepDoor => ({ side, x, y });
const spot = (x: number, y: number): KeepPoint => ({ x, y });
const zone = (id: string, label: string, x: number, y: number, w: number, h: number): KeepRoomPropZone => ({
  id,
  label,
  x,
  y,
  w,
  h,
});

export const KEEP_FORTRESS_MAP: KeepFortressMap = {
  cols: 64,
  rows: 34,
  tileSize: 16,
  shell: { x: 1, y: 1, w: 62, h: 32 },
  floorCourses: [
    { id: "upper_slab", level: "upper", y: 11, label: "Upper slab" },
    { id: "command_slab", level: "command", y: 20, label: "Command slab" },
    { id: "ground_slab", level: "ground", y: 27, label: "Ground slab" },
    { id: "undercroft_slab", level: "undercroft", y: 28, label: "Undercroft cap" },
  ],
  hallways: [
    { id: "upper_hall", level: "upper", x: 3, y: 10, w: 58, h: 1 },
    { id: "command_hall", level: "command", x: 3, y: 19, w: 58, h: 1 },
    { id: "ground_hall", level: "ground", x: 3, y: 26, w: 58, h: 1 },
    { id: "undercroft_hall", level: "undercroft", x: 8, y: 28, w: 48, h: 1 },
  ],
  rooms: [
    {
      agentId: "batman",
      roomId: "batman_war_room",
      roomName: "Batman war room",
      level: "upper",
      rect: { x: 4, y: 4, w: 10, h: 7 },
      phase: "dim",
      doors: [door("right", 13, 10)],
      agentSpot: spot(9, 9),
      callSpot: spot(13, 5),
      windowSlots: [spot(11, 6), spot(12, 6)],
      propZones: [zone("war_table", "War table", 5, 8, 3, 2), zone("threat_board", "Threat board", 10, 5, 3, 2)],
      notes: "Strategy, threat models, sequencing.",
    },
    {
      agentId: "spock",
      roomId: "spock_observatory",
      roomName: "Spock observatory",
      level: "upper",
      rect: { x: 16, y: 4, w: 9, h: 7 },
      phase: "dim",
      doors: [door("left", 16, 10), door("right", 24, 10)],
      agentSpot: spot(20, 9),
      callSpot: spot(24, 5),
      windowSlots: [spot(22, 6), spot(23, 6)],
      propZones: [zone("scanner_bench", "Scanner bench", 17, 8, 3, 2), zone("risk_wall", "Risk receipt wall", 22, 5, 2, 3)],
      notes: "Logic checks and security receipt gate.",
    },
    {
      agentId: "oak",
      roomId: "oak_archive_lab",
      roomName: "Oak archive lab",
      level: "upper",
      rect: { x: 27, y: 4, w: 8, h: 7 },
      phase: "dim",
      doors: [door("left", 27, 10), door("right", 34, 10)],
      agentSpot: spot(31, 9),
      callSpot: spot(34, 5),
      windowSlots: [spot(33, 6)],
      propZones: [zone("source_shelves", "Source shelves", 28, 5, 3, 4), zone("review_table", "Review table", 31, 8, 3, 2)],
      notes: "Research shelves, source memory, deduplication.",
    },
    {
      agentId: "gojo",
      roomId: "gojo_gallery",
      roomName: "Gojo gallery",
      level: "upper",
      rect: { x: 45, y: 4, w: 14, h: 7 },
      phase: "hero",
      doors: [door("left", 45, 10)],
      agentSpot: spot(52, 9),
      callSpot: spot(58, 5),
      windowSlots: [spot(55, 6), spot(56, 6), spot(57, 6)],
      propZones: [zone("review_plinth", "Review plinth", 49, 6, 4, 2), zone("proof_rail", "Proof rail", 47, 9, 8, 1)],
      notes: "Elevated proof room with sightline to Cortana.",
    },
    {
      agentId: "tony",
      roomId: "tony_forge",
      roomName: "Tony forge",
      level: "command",
      rect: { x: 4, y: 13, w: 10, h: 7 },
      phase: "dim",
      doors: [door("right", 13, 19)],
      agentSpot: spot(9, 18),
      callSpot: spot(13, 14),
      windowSlots: [],
      propZones: [zone("forge_bench", "Forge bench", 5, 16, 4, 2), zone("diff_rack", "Diff rack", 10, 14, 3, 3)],
      notes: "Build room beside command.",
    },
    {
      agentId: "cortana",
      roomId: "cortana_command_nave",
      roomName: "Cortana command nave",
      level: "command",
      rect: { x: 18, y: 9, w: 28, h: 14 },
      phase: "hero",
      doors: [door("left", 18, 22), door("right", 45, 22)],
      agentSpot: spot(32, 16),
      callSpot: spot(45, 10),
      windowSlots: [],
      propZones: [
        zone("tube", "Vertical Cortana tube", 30, 11, 4, 7),
        zone("council_table", "Council table", 26, 19, 12, 3),
        zone("routing_wall", "Routing wall", 39, 13, 5, 3),
        zone("decision_ledger", "Decision ledger", 20, 13, 5, 3),
        zone("aang_threshold", "Aang threshold spot", 24, 20, 2, 2),
      ],
      notes: "Central command chamber. Larger than every other room.",
    },
    {
      agentId: "surfer",
      roomId: "surfer_cartography",
      roomName: "Surfer cartography",
      level: "command",
      rect: { x: 50, y: 13, w: 10, h: 7 },
      phase: "dim",
      doors: [door("left", 50, 19)],
      agentSpot: spot(55, 18),
      callSpot: spot(59, 14),
      windowSlots: [],
      propZones: [zone("map_table", "Map table", 54, 16, 4, 2), zone("browser_gate", "Browser gate", 51, 14, 3, 4)],
      notes: "Source scout and browser lane, gated by Spock.",
    },
    {
      agentId: "aang",
      roomId: "aang_threshold",
      roomName: "Aang threshold",
      level: "ground",
      rect: { x: 5, y: 22, w: 12, h: 6 },
      phase: "hero",
      doors: [door("left", 5, 27), door("right", 16, 27)],
      agentSpot: spot(11, 26),
      callSpot: spot(16, 23),
      windowSlots: [],
      propZones: [zone("intake_desk", "Intake desk", 8, 24, 4, 2), zone("request_cards", "Request cards", 12, 25, 3, 1)],
      notes: "Main entry and user intent bridge.",
    },
    {
      agentId: "c3po",
      roomId: "c3po_scriptorium",
      roomName: "C-3PO scriptorium",
      level: "ground",
      rect: { x: 50, y: 22, w: 10, h: 6 },
      phase: "dim",
      doors: [door("left", 50, 27)],
      agentSpot: spot(55, 26),
      callSpot: spot(59, 23),
      windowSlots: [],
      propZones: [zone("lectern", "Lectern", 53, 24, 3, 3), zone("format_shelf", "Format shelf", 56, 23, 3, 4)],
      notes: "Formatting, translation, and output polish.",
    },
    {
      agentId: "piccolo",
      roomId: "piccolo_watch_crypt",
      roomName: "Piccolo watch crypt",
      level: "undercroft",
      rect: { x: 10, y: 29, w: 16, h: 4 },
      phase: "hero",
      doors: [door("right", 25, 32)],
      agentSpot: spot(18, 32),
      callSpot: spot(25, 30),
      windowSlots: [],
      propZones: [zone("watcher_line", "Watcher line", 13, 31, 6, 1), zone("maintenance_board", "Maintenance board", 20, 30, 4, 2)],
      notes: "Watchers, heartbeats, and maintenance.",
    },
    {
      agentId: "hedwig",
      roomId: "hedwig_relay_roost",
      roomName: "Hedwig relay roost",
      level: "undercroft",
      rect: { x: 36, y: 29, w: 16, h: 4 },
      phase: "hero",
      doors: [door("left", 36, 32)],
      agentSpot: spot(44, 32),
      callSpot: spot(51, 30),
      windowSlots: [],
      propZones: [zone("relay_roost", "Relay roost", 47, 30, 3, 2), zone("message_queue", "Message queue", 38, 31, 6, 1)],
      notes: "Capture chute, Notion, Slack, reminders.",
    },
  ],
  stairs: [
    { id: "entry_to_command", from: "ground", to: "command", x: 17, y: 20, w: 7, h: 5, label: "Entry to command", direction: "up-right" },
    { id: "command_to_upper", from: "command", to: "upper", x: 40, y: 10, w: 7, h: 5, label: "Command to upper", direction: "up-left" },
    { id: "ground_to_undercroft", from: "ground", to: "undercroft", x: 30, y: 26, w: 5, h: 4, label: "Ground to undercroft", direction: "down" },
  ],
  pathNodes: [
    { id: "entry_gate", x: 2, y: 25, label: "Main gate" },
    { id: "aang_work", x: 11, y: 25, label: "Aang work spot" },
    { id: "aang_exit", x: 18, y: 25, label: "Aang to stair" },
    { id: "command_west", x: 26, y: 19, label: "Command west" },
    { id: "cortana_table", x: 31, y: 19, label: "Council front" },
    { id: "command_east", x: 45, y: 19, label: "Command east" },
    { id: "upper_stair", x: 45, y: 10, label: "Upper stair landing" },
    { id: "gojo_work", x: 52, y: 10, label: "Gojo gallery spot" },
    { id: "crypt_stair", x: 31, y: 28, label: "Undercroft landing" },
    { id: "piccolo_work", x: 18, y: 28, label: "Piccolo route point" },
    { id: "hedwig_work", x: 44, y: 28, label: "Hedwig route point" },
  ],
  pathEdges: [
    { from: "entry_gate", to: "aang_work" },
    { from: "aang_work", to: "aang_exit" },
    { from: "aang_exit", to: "command_west" },
    { from: "command_west", to: "cortana_table" },
    { from: "cortana_table", to: "command_east" },
    { from: "command_east", to: "upper_stair" },
    { from: "upper_stair", to: "gojo_work" },
    { from: "cortana_table", to: "crypt_stair" },
    { from: "crypt_stair", to: "piccolo_work" },
    { from: "crypt_stair", to: "hedwig_work" },
  ],
  councilSpots: [
    { id: "seat_aang_threshold", agentId: "aang", x: 24, y: 20, facing: "east", tier: "threshold" },
    { id: "seat_tony", agentId: "tony", x: 27, y: 21, facing: "east", tier: "front" },
    { id: "seat_gojo", agentId: "gojo", x: 29, y: 21, facing: "east", tier: "front" },
    { id: "seat_surfer", agentId: "surfer", x: 35, y: 21, facing: "west", tier: "front" },
    { id: "seat_c3po", agentId: "c3po", x: 37, y: 21, facing: "west", tier: "front" },
    { id: "seat_batman", agentId: "batman", x: 26, y: 20, facing: "east", tier: "front" },
    { id: "seat_oak", agentId: "oak", x: 29, y: 19, facing: "south", tier: "back" },
    { id: "seat_spock", agentId: "spock", x: 36, y: 19, facing: "south", tier: "back" },
    { id: "seat_piccolo", agentId: "piccolo", x: 31, y: 19, facing: "south", tier: "back" },
    { id: "seat_hedwig", agentId: "hedwig", x: 33, y: 19, facing: "south", tier: "back" },
  ],
  zoomBounds: [
    { id: "aang_threshold", label: "Aang threshold", x: 3, y: 20, w: 17, h: 9 },
    { id: "cortana_command", label: "Cortana command", x: 16, y: 8, w: 32, h: 16 },
    { id: "gojo_gallery", label: "Gojo gallery", x: 43, y: 3, w: 18, h: 9 },
    { id: "undercroft", label: "Undercroft", x: 8, y: 28, w: 46, h: 6 },
  ],
};

export const KEEP_ROOM_BY_AGENT = new Map(KEEP_FORTRESS_MAP.rooms.map((room) => [room.agentId, room]));
export const KEEP_ROOM_BY_ID = new Map(KEEP_FORTRESS_MAP.rooms.map((room) => [room.roomId, room]));

export function tileToWorld(point: KeepPoint, tileSize = KEEP_FORTRESS_MAP.tileSize): KeepPoint {
  return {
    x: point.x * tileSize,
    y: point.y * tileSize,
  };
}
