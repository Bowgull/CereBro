// The one CereBro chip. Ten panels each redeclared an identical
// `Chip({label, tone})` that mapped a token color to a semantic Badge variant
// (consolidation #6). This is that single shared component.
import { cerebroColors as C } from "@/lib/keepConfig";
import { Badge } from "@/components/ui/badge";

function toneToVariant(tone: string) {
  if (tone === C.danger) return "destructive" as const;
  if (tone === C.warning || tone === C.gold) return "warning" as const;
  if (tone === C.success) return "success" as const;
  if (tone === C.accentViolet || tone === C.glowViolet) return "violet" as const;
  if (tone === C.accent) return "default" as const;
  return "secondary" as const;
}

export function Chip({ label, tone }: { label: string; tone: string }) {
  return (
    <Badge variant={toneToVariant(tone)} className="uppercase" title={label}>
      <span className="min-w-0 truncate">{label}</span>
    </Badge>
  );
}
