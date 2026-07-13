import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { interpolateNumber } from "../lib/motion/number";

describe("motion foundation", () => {
  const animatedNumber = readFileSync("components/motion/animated-number.tsx", "utf8");
  const appProviders = readFileSync("app/providers.tsx", "utf8");
  const globals = readFileSync("app/globals.css", "utf8");
  const motionCard = readFileSync("components/motion/motion-card.tsx", "utf8");
  const motionProvider = readFileSync("components/motion/motion-provider.tsx", "utf8");
  const pageTemplate = readFileSync("app/(app)/template.tsx", "utf8");
  const pageTransition = readFileSync("components/motion/page-transition.tsx", "utf8");
  const reveal = readFileSync("components/motion/reveal.tsx", "utf8");

  it("clamps number interpolation to the requested range", () => {
    expect(interpolateNumber(100, 200, -1)).toBe(100);
    expect(interpolateNumber(100, 200, 0.5)).toBe(150);
    expect(interpolateNumber(100, 200, 2)).toBe(200);
    expect(interpolateNumber(200, 100, 0.25)).toBe(175);
  });

  it("wires user motion preferences around the app and route content", () => {
    expect(motionProvider).toContain('reducedMotion="user"');
    expect(motionProvider).toContain("duration: motionTokens.standard");
    expect(appProviders).toContain('import { MotionProvider } from "@/components/motion/motion-provider"');
    expect(appProviders).toMatch(/<MotionProvider>[\s\S]*<SessionProvider/);
    expect(pageTemplate).toContain('import { PageTransition } from "@/components/motion/page-transition"');
    expect(pageTemplate).toContain("<PageTransition>{children}</PageTransition>");
  });

  it("keeps explicit reduced-motion branches in every animated primitive", () => {
    expect(animatedNumber).toMatch(
      /if \(shouldReduceMotion\) \{\s*animatedValue\.set\(value\);\s*return;/
    );
    expect(pageTransition).toContain('initial={shouldReduceMotion ? false : "hidden"}');
    expect(pageTransition).toContain("duration: shouldReduceMotion ? 0 : motionTokens.standard");
    expect(reveal.match(/initial=\{shouldReduceMotion \? false : "hidden"\}/g)).toHaveLength(2);
    expect(reveal).toContain("duration: shouldReduceMotion ? 0 : motionTokens.standard");
    expect(reveal).toContain("staggerChildren: 0");
    expect(motionCard).toContain("interactive && !shouldReduceMotion");
  });

  it("reserves the final formatted number width without duplicate spoken output", () => {
    expect(animatedNumber).toContain("const finalValue = formatValue(value);");
    expect(animatedNumber).toContain('className="invisible"');
    expect(animatedNumber).toContain('className="absolute inset-0"');
    expect(animatedNumber.match(/aria-hidden="true"/g)).toHaveLength(2);
    expect(animatedNumber.match(/className="sr-only"/g)).toHaveLength(1);
    expect(animatedNumber).toContain('<span className="sr-only">{finalValue}</span>');
  });

  it("uses fast timing for direct hover and press feedback", () => {
    expect(motionCard).toContain("duration: motionTokens.fast");
    expect(globals.match(/transition: transform var\(--motion-fast\)/g)?.length ?? 0).toBeGreaterThanOrEqual(2);
    expect(globals).toContain(".motion-safe-press {");
  });

  it("keeps reduced-motion controls private and authoritative", () => {
    const revealControls = reveal.match(/type ControlledRevealProp =\s*([^;]+);/)?.[1] ?? "";
    const itemControls = reveal.match(/type ControlledItemProp =\s*([^;]+);/)?.[1] ?? "";
    const cardControls = motionCard.match(/type ControlledMotionCardProp =\s*([^;]+);/)?.[1] ?? "";

    expect(reveal).toContain('type RevealProps = Omit<HTMLMotionProps<"div">, ControlledRevealProp>');
    expect(reveal).toContain('type StaggerItemProps = Omit<HTMLMotionProps<"div">, ControlledItemProp>');
    expect(motionCard).toContain('type MotionCardProps = Omit<HTMLMotionProps<"div">, ControlledMotionCardProp> & {');
    for (const prop of ["initial", "whileInView", "viewport", "variants", "transition"]) {
      expect(revealControls).toContain(`"${prop}"`);
    }
    for (const prop of ["variants", "transition"]) {
      expect(itemControls).toContain(`"${prop}"`);
    }
    for (const prop of [
      "initial",
      "whileInView",
      "viewport",
      "variants",
      "whileHover",
      "whileTap",
      "transition"
    ]) {
      expect(cardControls).toContain(`"${prop}"`);
    }

    expect(reveal.indexOf("{...props}")).toBeLessThan(
      reveal.indexOf('initial={shouldReduceMotion ? false : "hidden"}')
    );
    expect(motionCard.indexOf("{...props}")).toBeLessThan(
      motionCard.indexOf('initial={shouldReduceMotion ? false : "hidden"}')
    );
  });
});
