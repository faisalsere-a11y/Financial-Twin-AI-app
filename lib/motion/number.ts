export function interpolateNumber(from: number, to: number, progress: number) {
  const clamped = Math.min(1, Math.max(0, progress));
  return from + (to - from) * clamped;
}
