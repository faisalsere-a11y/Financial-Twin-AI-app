import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("UI foundation", () => {
  const css = readFileSync("app/globals.css", "utf8");
  const tailwind = readFileSync("tailwind.config.ts", "utf8");

  it("defines the semantic palette in light and dark themes", () => {
    for (const token of [
      "--canvas",
      "--surface",
      "--surface-raised",
      "--surface-glass",
      "--text-primary",
      "--text-secondary",
      "--brand",
      "--positive",
      "--caution",
      "--danger",
      "--chart-1",
      "--chart-2",
      "--chart-3"
    ]) {
      expect(css.match(new RegExp(token, "g"))?.length ?? 0).toBeGreaterThanOrEqual(2);
    }

    expect(tailwind).toContain('canvas: "hsl(var(--canvas))"');
    expect(tailwind).toContain('surface: "hsl(var(--surface))"');
  });

  it("provides a global reduced-motion fallback", () => {
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
    expect(css).toContain("scroll-behavior: auto");
    expect(css).toContain("animation-duration: 0.01ms");
  });
});
