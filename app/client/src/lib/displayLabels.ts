export function sourceDisplayName(uri: string): string {
  try {
    const parsed = new URL(uri);
    const path = parsed.pathname === "/" ? "" : parsed.pathname.replace(/\/$/, "");
    return `${parsed.hostname}${path}`.slice(0, 96);
  } catch {
    return uri.slice(0, 96);
  }
}
