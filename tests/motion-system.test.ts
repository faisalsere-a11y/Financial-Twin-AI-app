import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { interpolateNumber } from "../lib/motion/number";

describe("motion foundation", () => {
  it("clamps number interpolation to the requested range", () => {
    expect(interpolateNumber(100, 200, -1)).toBe(100);
    expect(interpolateNumber(100, 200, 0.5)).toBe(150);
    expect(interpolateNumber(100, 200, 2)).toBe(200);
  });

  it("configures user reduced motion and route transitions", () => {
    expect(readFileSync("components/motion/motion-provider.tsx", "utf8")).toContain('reducedMotion="user"');
    expect(readFileSync("app/(app)/template.tsx", "utf8")).toContain("PageTransition");
    expect(readFileSync("components/motion/animated-number.tsx", "utf8")).toContain('aria-hidden="true"');
  });
});
