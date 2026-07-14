import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { shouldDismissMobileDrawer } from "../lib/ui/mobile-drawer";

describe("responsive application shell", () => {
  it("dismisses only a present mobile drawer in the desktop viewport", () => {
    expect(shouldDismissMobileDrawer(true, true)).toBe(true);
    expect(shouldDismissMobileDrawer(false, true)).toBe(false);
    expect(shouldDismissMobileDrawer(true, false)).toBe(false);
    expect(shouldDismissMobileDrawer(false, false)).toBe(false);
  });

  it("restores shell ownership immediately at lg without focusing the hidden trigger", () => {
    const source = readFileSync("components/layout/app-shell.tsx", "utf8");

    expect(source).toContain("shouldDismissMobileDrawer");
    expect(source).toContain('window.matchMedia("(min-width: 1024px)")');
    expect(source).toContain('window.addEventListener("resize", dismissAtDesktop)');
    expect(source).toContain('window.removeEventListener("resize", dismissAtDesktop)');
    expect(source).toContain("suppressMobileFocusRestoreRef.current = true");
    expect(source).toMatch(/requestAnimationFrame\([\s\S]*window\.matchMedia\("\(min-width: 1024px\)"\)\.matches[\s\S]*menuButtonRef\.current\?\.focus\(\)/);
    expect(source).toMatch(/shouldDismissMobileDrawer[\s\S]*setMobileOpen\(false\)[\s\S]*setMobilePresent\(false\)/);
    expect(source).toContain("if (suppressMobileFocusRestoreRef.current)");
  });

  it("gates sidebar hover transforms and glow under reduced-motion-safe variants", () => {
    const source = readFileSync("components/layout/app-shell.tsx", "utf8");

    expect(source).toContain("motion-safe:group-hover:scale-[1.04]");
    expect(source).toContain("motion-safe:group-hover:shadow-glow");
    expect(source).not.toMatch(/(?<!motion-safe:)group-hover:scale-\[1\.04\]/);
    expect(source).not.toMatch(/(?<!motion-safe:)group-hover:shadow-glow/);
  });
});
