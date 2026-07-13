import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("interaction primitives", () => {
  it("adds restrained motion and matched loading geometry", () => {
    const button = readFileSync("components/ui/button.tsx", "utf8");
    const card = readFileSync("components/ui/card.tsx", "utf8");
    const skeleton = readFileSync("components/ui/skeleton.tsx", "utf8");
    expect(button).toContain("active:scale-[0.98]");
    expect(card).toContain("interactive");
    expect(card).toContain("motion-safe:hover:-translate-y");
    expect(skeleton).toContain("shimmer");
  });

  it("keeps animated tables and status feedback accessible", () => {
    expect(readFileSync("components/ui/table.tsx", "utf8")).toContain("animated");
    expect(readFileSync("components/ui/themed-toaster.tsx", "utf8")).toContain("prefers-reduced-motion");
    expect(readFileSync("app/(app)/loading.tsx", "utf8")).toContain("Skeleton");
  });

  it("keeps celebratory glow away from destructive actions", () => {
    const button = readFileSync("components/ui/button.tsx", "utf8");

    expect(button).not.toMatch(/const buttonVariants = cva\(\s*"[^"]*glow-sweep/);
    expect(button).toMatch(/default:\s*\n\s*"[^"]*glow-sweep/);
    expect(button).not.toMatch(/destructive:\s*"[^"]*glow-sweep/);
  });

  it("uses the fast token for enabled button sweeps without changing decorative timing", () => {
    const button = readFileSync("components/ui/button.tsx", "utf8");
    const globals = readFileSync("app/globals.css", "utf8");

    expect(button).toContain("button-glow-sweep");
    expect(globals).toMatch(
      /\.button-glow-sweep:not\(:disabled\):hover::after\s*{[^}]*animation: motion-glow-sweep var\(--motion-fast\)/
    );
    expect(globals).toMatch(
      /\.glow-sweep:hover::after\s*{[^}]*animation: motion-glow-sweep var\(--motion-deliberate\)/
    );
  });

  it("gives toast entry, success, and error their own motion-safe feedback", () => {
    const toaster = readFileSync("components/ui/themed-toaster.tsx", "utf8");

    expect(toaster).toContain("toast-slide-in");
    expect(toaster).toContain("toast-check-reveal");
    expect(toaster).toContain("toast-error-nudge");
    expect(toaster).toContain("@media (prefers-reduced-motion: no-preference)");
    expect(toaster).toContain("translate3d");
    expect(toaster).toContain("scaleX");
  });
});
