import { cerebroColors as C } from "@/lib/keepConfig";

type CompactReadDatumProps = {
  label: string;
  value: string | number;
  tone: string;
  wrap?: boolean;
};

export function CompactReadDatum({ label, value, tone, wrap = false }: CompactReadDatumProps) {
  const displayValue = String(value);

  return (
    <div className="min-w-0 rounded px-2 py-1.5" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}>
      <div className="truncate text-[9px] font-bold uppercase tracking-widest" style={{ color: C.textMuted }} title={label}>
        {label}
      </div>
      <div
        className={`${wrap ? "break-words" : "truncate"} mt-0.5 text-[10px] leading-snug`}
        style={{ color: tone }}
        title={displayValue}
      >
        {displayValue}
      </div>
    </div>
  );
}
