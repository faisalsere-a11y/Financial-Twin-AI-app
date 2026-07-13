import { readFileSync } from "node:fs";
import postcss from "postcss";
import tailwindcss from "tailwindcss";
import { describe, expect, it } from "vitest";
import tailwindConfig from "../tailwind.config";

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

  it("disambiguates transition timing from animation timing utilities", async () => {
    for (const path of [
      "components/ui/button.tsx",
      "components/ui/card.tsx",
      "components/ui/select.tsx",
      "components/layout/app-shell.tsx",
      "components/landing/decision-preview.tsx",
      "components/landing/landing-nav.tsx",
      "components/landing/landing-page.tsx"
    ]) {
      const source = readFileSync(path, "utf8");
      expect(source).toContain("[transition-duration:var(--motion-fast)]");
      expect(source).not.toContain("duration-[var(--motion-fast)]");
    }

    const table = readFileSync("components/ui/table.tsx", "utf8");
    expect(table).toContain("[animation-duration:var(--motion-standard)]");
    expect(table).toContain("[animation-delay:40ms]");
    expect(table).toContain("[animation-delay:240ms]");
    expect(table).not.toContain("delay-[");

    const candidates = [
      "motion-safe:[transition-duration:var(--motion-fast)]",
      "motion-safe:[&_tr]:[animation-duration:var(--motion-standard)]",
      "motion-safe:[&_tr:nth-child(2)]:[animation-delay:40ms]",
      "motion-safe:[&_tr:nth-child(n+7)]:[animation-delay:240ms]"
    ];
    const result = await postcss([
      tailwindcss({
        ...tailwindConfig,
        content: [{ raw: `<div class="${candidates.join(" ")}"></div>`, extension: "html" }]
      })
    ]).process("@tailwind utilities;", { from: undefined });

    expect(result.css).toContain("@media (prefers-reduced-motion: no-preference)");
    expect(result.css).toMatch(/transition-duration:\s*var\(--motion-fast\)/);
    expect(result.css).toMatch(/animation-duration:\s*var\(--motion-standard\)/);
    expect(result.css).toMatch(/animation-delay:\s*40ms/);
    expect(result.css).toMatch(/animation-delay:\s*240ms/);
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
