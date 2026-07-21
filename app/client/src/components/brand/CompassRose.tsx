// CereBro brand kit — CompassRose
// The signature centerpiece of the brand identity: a faceted brass compass star
// with an optional gold light-bloom. Built as scalable SVG so it reads the same
// as a hero centerpiece or a small nav-rail mark. See CEREBRO_BRAND_SYSTEM_SPEC.md.
import type { CSSProperties } from "react";

type CompassRoseProps = {
  size?: number;
  variant?: "center" | "rail";
  bloom?: boolean;
  className?: string;
  style?: CSSProperties;
};

export function CompassRose({ size = 96, variant = "center", bloom, className, style }: CompassRoseProps) {
  const showBloom = bloom ?? variant === "center";
  const uid = variant;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-hidden="true"
      className={className}
      style={style}
    >
      <defs>
        <linearGradient id={`cr-light-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F6E7B4" />
          <stop offset="1" stopColor="#C79A44" />
        </linearGradient>
        <linearGradient id={`cr-dark-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#B98F3A" />
          <stop offset="1" stopColor="#6F5220" />
        </linearGradient>
        <linearGradient id={`cr-minor-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#E7C878" />
          <stop offset="1" stopColor="#9C7126" />
        </linearGradient>
        <radialGradient id={`cr-bloom-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="rgba(214,158,67,0.42)" />
          <stop offset="0.45" stopColor="rgba(198,155,85,0.16)" />
          <stop offset="1" stopColor="rgba(198,155,85,0)" />
        </radialGradient>
      </defs>

      {showBloom && <circle cx="50" cy="50" r="50" fill={`url(#cr-bloom-${uid})`} />}

      {/* Ordinal (minor) rays — NE, SE, SW, NW */}
      <g fill={`url(#cr-minor-${uid})`}>
        <polygon points="71.2,28.8 52.3,52.3 47.7,47.7" />
        <polygon points="71.2,71.2 47.7,52.3 52.3,47.7" />
        <polygon points="28.8,71.2 47.7,47.7 52.3,52.3" />
        <polygon points="28.8,28.8 52.3,47.7 47.7,52.3" />
      </g>

      {/* Cardinal (major) rays — each split into a light + dark facet */}
      {/* North */}
      <polygon points="50,6 46,46 50,50" fill={`url(#cr-light-${uid})`} />
      <polygon points="50,6 54,46 50,50" fill={`url(#cr-dark-${uid})`} />
      {/* East */}
      <polygon points="94,50 54,46 50,50" fill={`url(#cr-light-${uid})`} />
      <polygon points="94,50 54,54 50,50" fill={`url(#cr-dark-${uid})`} />
      {/* South */}
      <polygon points="50,94 54,54 50,50" fill={`url(#cr-light-${uid})`} />
      <polygon points="50,94 46,54 50,50" fill={`url(#cr-dark-${uid})`} />
      {/* West */}
      <polygon points="6,50 46,54 50,50" fill={`url(#cr-light-${uid})`} />
      <polygon points="6,50 46,46 50,50" fill={`url(#cr-dark-${uid})`} />

      {/* Hub */}
      <circle cx="50" cy="50" r="8" fill="none" stroke="#C79A44" strokeWidth="1.4" />
      <circle cx="50" cy="50" r="4.6" fill="#120E07" stroke="#8A6A2C" strokeWidth="0.8" />
      <circle cx="50" cy="50" r="1.6" fill="#F6E7B4" />
    </svg>
  );
}
