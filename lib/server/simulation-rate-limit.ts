const requestWindows = new Map<string, { count: number; resetAt: number }>();
const MAX_TRACKED_SUBJECTS = 10_000;

function pruneExpiredWindows(now: number) {
  for (const [subject, window] of requestWindows) {
    if (window.resetAt <= now) requestWindows.delete(subject);
  }
  while (requestWindows.size >= MAX_TRACKED_SUBJECTS) {
    const oldestSubject = requestWindows.keys().next().value as string | undefined;
    if (!oldestSubject) break;
    requestWindows.delete(oldestSubject);
  }
}

export function checkSimulationRateLimit(subject: string, limit: number, now = Date.now()) {
  const current = requestWindows.get(subject);
  if (!current || current.resetAt <= now) {
    pruneExpiredWindows(now);
    requestWindows.set(subject, { count: 1, resetAt: now + 60_000 });
    return null;
  }
  if (current.count >= limit) return Math.max(1, Math.ceil((current.resetAt - now) / 1000));
  current.count += 1;
  return null;
}
