import { cerebroBrand as B } from "@/lib/cerebroTheme";

type OrnamentPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right";

type CereBroCornerProps = {
  position?: OrnamentPosition;
  size?: number;
  className?: string;
};

const cornerTransforms: Record<OrnamentPosition, string> = {
  "top-left": "rotate(0deg)",
  "top-right": "rotate(90deg)",
  "bottom-right": "rotate(180deg)",
  "bottom-left": "rotate(270deg)",
};

const cornerPositions: Record<OrnamentPosition, string> = {
  "top-left": "left-2 top-2",
  "top-right": "right-2 top-2",
  "bottom-right": "bottom-2 right-2",
  "bottom-left": "bottom-2 left-2",
};

export function CereBroCorner({ position = "top-left", size = 30, className = "" }: CereBroCornerProps) {
  return (
    <svg
      aria-hidden="true"
      className={`pointer-events-none absolute ${cornerPositions[position]} ${className}`}
      width={size}
      height={size}
      viewBox="0 0 30 30"
      style={{ transform: cornerTransforms[position] }}
    >
      <path d="M2 28V2h26" fill="none" stroke={B.line.brass} strokeWidth="1.1" />
      <path d="M7 26V7h19" fill="none" stroke={B.line.brassSoft} strokeWidth="1" />
      <path d="M2 12 12 2M8 19 19 8" fill="none" stroke={B.color.gold700} strokeWidth="0.8" />
      <circle cx="8" cy="8" r="1.5" fill={B.color.gold500} opacity="0.75" />
    </svg>
  );
}

export function CereBroCorners({ className = "" }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-0 ${className}`} aria-hidden="true">
      <CereBroCorner position="top-left" />
      <CereBroCorner position="top-right" />
      <CereBroCorner position="bottom-left" />
      <CereBroCorner position="bottom-right" />
    </div>
  );
}

export function CereBroEtchedLine({ vertical = false, className = "" }: { vertical?: boolean; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none block ${className}`}
      style={{
        width: vertical ? 1 : "100%",
        height: vertical ? "100%" : 1,
        background: vertical
          ? `linear-gradient(180deg, transparent, ${B.line.brass}, transparent)`
          : `linear-gradient(90deg, transparent, ${B.line.brass}, transparent)`,
      }}
    />
  );
}

export function CereBroCompassMark({ className = "", size = 42 }: { className?: string; size?: number }) {
  const center = size / 2;
  return (
    <svg aria-hidden="true" className={`pointer-events-none ${className}`} width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={center} cy={center} r={center - 5} fill="none" stroke={B.line.brass} strokeWidth="1" />
      <path d={`M${center} 2 ${center + 5} ${center} ${center} ${size - 2} ${center - 5} ${center}Z`} fill="none" stroke={B.color.gold300} strokeWidth="1" />
      <path d={`M2 ${center} ${center} ${center - 5} ${size - 2} ${center} ${center} ${center + 5}Z`} fill="none" stroke={B.color.gold500} strokeWidth="0.9" />
      <circle cx={center} cy={center} r="2.5" fill={B.color.gold300} />
    </svg>
  );
}
