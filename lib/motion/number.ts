export function interpolateNumber(from: number, to: number, progress: number) {
  const clamped = Math.min(1, Math.max(0, progress));
  return from + (to - from) * clamped;
}

export type MeasuredBlockReservation = Readonly<{
  width: number;
  height: number;
}>;

export function reserveMeasuredBlock(
  currentReservation: MeasuredBlockReservation | null,
  measuredWidth: number,
  measuredHeight: number
): MeasuredBlockReservation {
  if (!currentReservation || currentReservation.width !== measuredWidth) {
    return { width: measuredWidth, height: measuredHeight };
  }

  return {
    width: measuredWidth,
    height: Math.max(currentReservation.height, measuredHeight)
  };
}
