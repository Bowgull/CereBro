// Shared copy helpers (language pass, audit item 3).

/**
 * Turn an internal enum value into human words for display.
 * "proposal_only" → "Proposal only" · "READ_ONLY" → "Read only" · "unknown" → "Unknown"
 * Never render a raw enum in the UI — wrap it in this.
 */
export function humanizeEnum(value: string | null | undefined, fallback = "Unknown"): string {
  if (!value) return fallback;
  const words = value.replace(/[_-]+/g, " ").trim().toLowerCase();
  if (!words) return fallback;
  return words.charAt(0).toUpperCase() + words.slice(1);
}
