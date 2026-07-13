import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { motionTokens, staggerVariants } from "../lib/motion/variants";

function source(path: string) {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

describe("landing motion contracts", () => {
  const landing = source("components/landing/landing-page.tsx");
  const motionPath = "components/landing/landing-motion.tsx";
  const atmospherePath = "components/landing/hero-atmosphere.tsx";
  const landingMotion = source(motionPath);
  const atmosphere = source(atmospherePath);
  const preview = source("components/landing/decision-preview.tsx");
  const navigation = source("components/landing/landing-nav.tsx");

  it("keeps the landing page server-rendered behind focused client islands", () => {
    expect(existsSync(motionPath)).toBe(true);
    expect(existsSync(atmospherePath)).toBe(true);
    expect(landing).not.toContain('"use client"');
    expect(landing).not.toContain('from "framer-motion"');
    expect(landing).not.toContain('from "recharts"');
    expect(landing).not.toMatch(/\b(useEffect|useState|useRef|useReducedMotion)\b/);
    expect(landing).toContain("LandingReveal");
    expect(landing).toContain("LandingStagger");
    expect(landing).toContain("HeroAtmosphere");
    expect(landingMotion).toContain('"use client"');
    expect(landingMotion).toContain('from "@/components/motion/reveal"');
    expect(landingMotion).toContain("Reveal");
    expect(landingMotion).toContain("Stagger");
    expect(landingMotion).toContain("StaggerItem");
    expect(landingMotion).not.toContain('from "framer-motion"');
  });

  it("limits every decorative stagger group to a sub-500ms sequence", () => {
    const visible = staggerVariants.visible as { transition?: { staggerChildren?: number } };
    const staggerSeconds = visible.transition?.staggerChildren ?? 0;
    const maximumSequenceSeconds = motionTokens.standard + staggerSeconds * 3;

    expect(landingMotion).toContain("MAX_STAGGER_ITEMS = 4");
    expect(landingMotion).toContain("index < MAX_STAGGER_ITEMS");
    expect(maximumSequenceSeconds).toBeLessThanOrEqual(0.5);
    expect(motionTokens.deliberate).toBeLessThanOrEqual(0.5);
    const sourceDurations = [...landing.matchAll(/duration-\[(\d+)ms\]/g)].map((match) => Number(match[1]));
    expect(sourceDurations.every((duration) => duration <= 500)).toBe(true);
    expect(landing).toContain('animationDuration: "420ms"');
    expect(landing).toContain('animationDelay: "80ms"');
    expect(420 + 80).toBeLessThanOrEqual(500);
  });

  it("runs the atmosphere only for a visible fine-pointer surface", () => {
    expect(atmosphere).toContain("useReducedMotion");
    expect(atmosphere).toContain("useMotionValue");
    expect(atmosphere).toContain("useSpring");
    expect(atmosphere).toContain("useMotionValueEvent");
    expect(atmosphere).toContain('matchMedia("(pointer: fine)")');
    expect(atmosphere).toContain("IntersectionObserver");
    expect(atmosphere).toContain("entry.isIntersecting");
    expect(atmosphere).toContain("getBoundingClientRect()");
    expect(atmosphere).toContain('addEventListener("pointermove"');
    expect(atmosphere).toContain('removeEventListener("pointermove"');
    expect(atmosphere).toContain('event.pointerType === "touch"');
    expect(atmosphere).toContain("requestAnimationFrame");
    expect(atmosphere).toContain("cancelAnimationFrame");
    expect(atmosphere).toContain('addEventListener("pointercancel"');
    expect(atmosphere).not.toContain('window.addEventListener("pointermove"');
    expect(atmosphere).not.toContain('document.addEventListener("pointermove"');
  });

  it("writes normalized spring output to inert transform-only decoration", () => {
    expect(atmosphere).toContain("normalizePointer");
    expect(atmosphere).toContain("Math.max(-1");
    expect(atmosphere).toContain("Math.min(1");
    expect(atmosphere).toContain('style.setProperty("--landing-x"');
    expect(atmosphere).toContain('style.setProperty("--landing-y"');
    expect(atmosphere).toContain("translate3d");
    expect(atmosphere).toContain('aria-hidden="true"');
    expect(atmosphere).toContain("inert");
    expect(atmosphere).toContain("pointer-events-none");
    expect(atmosphere).toContain('active ? "will-change-transform"');
    expect(atmosphere).toContain("bg-chart-3/15");
    expect(atmosphere).not.toContain("bg-chart-3/16");
    expect(atmosphere).not.toMatch(/set[A-Z][A-Za-z]+\([^)]*(clientX|clientY)/);
  });

  it("renders chart paths immediately when reduced motion is requested", () => {
    expect(preview).toContain("useReducedMotion");
    expect(preview).toContain("motion.polyline");
    expect(preview).toContain("initial={shouldReduceMotion ? false");
    expect(preview).toContain("duration: shouldReduceMotion ? 0 : motionTokens.deliberate");
    expect(preview).toContain("delay: shouldReduceMotion ? 0");
  });

  it("uses the shared fast control timing for landing navigation and preview tabs", () => {
    expect(navigation).toContain('aria-label="Landing page"');
    expect(navigation).toContain("duration-[var(--motion-fast)]");
    expect(navigation).toContain("focus-visible:ring-2");
    expect(preview).toContain("duration-[var(--motion-fast)]");
    expect(preview).toContain("focus-visible:ring-2");
  });
});
