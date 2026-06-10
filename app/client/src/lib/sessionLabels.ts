export type SessionLabelSource = {
  id: number;
  displayName: string;
  title?: string | null;
};

export function disambiguateSessionOptions<T extends SessionLabelSource>(sessions: T[]) {
  const counts = new Map<string, number>();
  for (const session of sessions) {
    counts.set(session.displayName, (counts.get(session.displayName) ?? 0) + 1);
  }
  return sessions.map((session) => ({
    ...session,
    optionLabel: (counts.get(session.displayName) ?? 0) > 1
      ? `${session.displayName} #${session.id}`
      : session.displayName,
  }));
}

export function groupSessionFilters<T extends SessionLabelSource>(sessions: T[]) {
  const groups = new Map<string, { key: string; label: string; title: string; ids: number[] }>();
  for (const session of sessions) {
    const key = session.displayName;
    const existing = groups.get(key);
    if (existing) {
      existing.ids.push(session.id);
      existing.title = `${existing.title}, #${session.id}`;
      continue;
    }
    groups.set(key, {
      key,
      label: session.displayName,
      title: `Run #${session.id}`,
      ids: [session.id],
    });
  }
  return Array.from(groups.values()).map((group) => ({
    ...group,
    label: group.ids.length > 1 ? `${group.label} (${group.ids.length})` : group.label,
  }));
}
