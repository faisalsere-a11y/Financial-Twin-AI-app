export type SelectPopupPlacement = {
  side: "below" | "above";
  top: number;
  left: number;
  width: number;
  maxHeight: number;
};

export type SelectPopupPlacementInput = {
  anchor: { top: number; bottom: number; left: number; width: number };
  viewport: { top?: number; left?: number; width: number; height: number };
  contentHeight: number;
};

const viewportGutter = 8;
const triggerGap = 8;
const preferredMaxHeight = 288;

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), Math.max(minimum, maximum));
}

export function placeSelectPopup({
  anchor,
  viewport,
  contentHeight
}: SelectPopupPlacementInput): SelectPopupPlacement {
  const viewportTop = viewport.top ?? 0;
  const viewportLeft = viewport.left ?? 0;
  const viewportRight = viewportLeft + viewport.width;
  const viewportBottom = viewportTop + viewport.height;
  const availableWidth = Math.max(0, viewport.width - viewportGutter * 2);
  const width = Math.min(Math.max(0, anchor.width), availableWidth);
  const left = clamp(
    anchor.left,
    viewportLeft + viewportGutter,
    viewportRight - viewportGutter - width
  );
  const availableBelow = Math.max(
    0,
    viewportBottom - anchor.bottom - triggerGap - viewportGutter
  );
  const availableAbove = Math.max(
    0,
    anchor.top - triggerGap - viewportTop - viewportGutter
  );
  const requestedHeight = Math.min(Math.max(0, contentHeight), preferredMaxHeight);
  const side = availableBelow < requestedHeight && availableAbove > availableBelow
    ? "above"
    : "below";
  const availableHeight = side === "above" ? availableAbove : availableBelow;
  const maxHeight = Math.min(preferredMaxHeight, availableHeight);
  const renderedHeight = Math.min(Math.max(0, contentHeight), maxHeight);
  const top = side === "above"
    ? Math.max(viewportTop + viewportGutter, anchor.top - triggerGap - renderedHeight)
    : anchor.bottom + triggerGap;

  return { side, top, left, width, maxHeight };
}
