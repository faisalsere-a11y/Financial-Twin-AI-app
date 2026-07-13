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

  it("renders primitives with semantic surface and text classes", () => {
    const card = readFileSync("components/ui/card.tsx", "utf8");
    const button = readFileSync("components/ui/button.tsx", "utf8");

    expect(card).toContain("bg-card");
    expect(card).toContain("text-card-foreground");
    expect(button).toContain("border-border");
    expect(button).not.toContain("border-white");
  });

  it("renders a labeled switch with semantic state styles", () => {
    const html = readFileSync("components/ui/switch.tsx", "utf8");

    expect(html).toContain('role="switch"');
    expect(html).toContain("aria-checked={checked}");
    expect(html).toContain("bg-primary");
    expect(html).not.toContain("border-white");
  });

  it("renders the premium select with semantic surfaces and form fallback", () => {
    const select = readFileSync("components/ui/select.tsx", "utf8");

    expect(select).toContain("bg-popover");
    expect(select).toContain("border-border");
    expect(select).toContain("shadow-xl");
    expect(select).toContain("max-h-72");
    expect(select).toContain("<select");
    expect(select).not.toContain("border-white");
  });

  it("keeps badge and progress surfaces theme semantic", () => {
    const badge = readFileSync("components/ui/badge.tsx", "utf8");
    const progress = readFileSync("components/ui/progress.tsx", "utf8");

    expect(badge).toContain("border-border");
    expect(badge).not.toContain("border-white");
    expect(progress).toContain("bg-muted");
    expect(progress).not.toContain("bg-white");
  });

  it("provides keyboard bypass links for repeated navigation", () => {
    const shell = readFileSync("components/layout/app-shell.tsx", "utf8");
    const landing = readFileSync("components/landing/landing-page.tsx", "utf8");

    expect(shell).toContain('href="#main-content"');
    expect(shell).toContain("Skip to main content");
    expect(landing).toContain('id="landing-content"');
    expect(landing).toContain('href="#landing-content"');
  });
});
