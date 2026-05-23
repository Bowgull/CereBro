export function sourceDisplayName(uri: string): string {
  const routeMatch = uri.match(/^runtime_route:(\d+)$/);
  if (routeMatch) return `Route #${routeMatch[1]}`;

  try {
    const parsed = new URL(uri);
    const path = parsed.pathname === "/" ? "" : parsed.pathname.replace(/\/$/, "");
    return `${parsed.hostname}${path}`.slice(0, 96);
  } catch {
    return uri.slice(0, 96);
  }
}
