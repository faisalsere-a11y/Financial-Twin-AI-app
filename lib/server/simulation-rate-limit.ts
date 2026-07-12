const requestWindows = new Map<string, { count: number; resetAt: number }>();

export function checkSimulationRateLimit(subject: string, limit: number, now = Date.now()) {
  const current = requestWindows.get(subject);
  if (!current || current.resetAt <= now) {
    requestWindows.set(subject, { count: 1, resetAt: now + 60_000 });
    return null;
  }
  if (current.count >= limit) return Math.max(1, Math.ceil((current.resetAt - now) / 1000));
  current.count += 1;
  return null;
}
