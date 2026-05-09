export function sourceDisplayName(uri: string): string {
  try {
    const parsed = new URL(uri);
    const path = parsed.pathname === "/" ? "" : parsed.pathname.replace(/\/$/, "");
    return `${parsed.hostname}${path}`.slice(0, 96);
  } catch {
    return uri.slice(0, 96);
  }
}

export function compactPathLabel(path: string, maxLength = 64): string {
  if (path.length <= maxLength) return path;

  const normalized = path.replace(/\\/g, "/");
  const parts = normalized.split("/").filter(Boolean);
  if (parts.length <= 2) return `...${path.slice(-(maxLength - 3))}`;

  const tail = parts.slice(-2).join("/");
  const homePrefix = normalized.startsWith("/Users/") ? "~/" : ".../";
  const label = `${homePrefix}${tail}`;
  if (label.length <= maxLength) return label;

  return `...${label.slice(-(maxLength - 3))}`;
}
