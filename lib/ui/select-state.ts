export type SelectionKey = "ArrowDown" | "ArrowUp" | "Home" | "End";

export function moveSelection(current: number, count: number, key: SelectionKey): number {
  if (count <= 0) return -1;
  if (key === "Home") return 0;
  if (key === "End") return count - 1;
  return key === "ArrowDown" ? (current + 1) % count : (current - 1 + count) % count;
}
