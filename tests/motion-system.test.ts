import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AnimatedNumber } from "../components/motion/animated-number";
import * as numberMotion from "../lib/motion/number";

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
    expect(numberMotion.interpolateNumber(100, 200, -1)).toBe(100);
    expect(numberMotion.interpolateNumber(100, 200, 0.5)).toBe(150);
    expect(numberMotion.interpolateNumber(100, 200, 2)).toBe(200);
    expect(numberMotion.interpolateNumber(200, 100, 0.25)).toBe(175);
  });

  it("keeps the longest formatted endpoint reserved across descending updates", () => {
    expect(numberMotion).toHaveProperty("reserveFormattedEndpoint");
    if (!("reserveFormattedEndpoint" in numberMotion)) return;

    const reserveFormattedEndpoint = numberMotion.reserveFormattedEndpoint as (
      currentReservation: string,
      nextEndpoint: string
    ) => string;
    let reservation = reserveFormattedEndpoint("SAR 0", "SAR 1,234,567");

    expect(reservation).toBe("SAR 1,234,567");
    reservation = reserveFormattedEndpoint(reservation, "SAR 42");
    expect(reservation).toBe("SAR 1,234,567");
    expect(reserveFormattedEndpoint(reservation, "SAR 12,345,678")).toBe("SAR 12,345,678");
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
    const numberEffect = animatedNumber.slice(
      animatedNumber.indexOf("useBrowserLayoutEffect(() =>"),
      animatedNumber.indexOf("const formatValue")
    );
    expect(animatedNumber).toContain("React.useState(value)");
    expect(animatedNumber).toContain('window.matchMedia("(prefers-reduced-motion: reduce)").matches');
    expect(numberEffect.indexOf("if (prefersReducedMotion)")).toBeLessThan(
      numberEffect.indexOf("animatedValue.set(from)")
    );
    expect(animatedNumber).toContain("if (!hasAnimatedRef.current)");
    expect(pageTransition).toContain('initial={shouldReduceMotion ? false : "hidden"}');
    expect(pageTransition).toContain("duration: shouldReduceMotion ? 0 : motionTokens.standard");
    expect(reveal.match(/initial=\{shouldReduceMotion \? false : "hidden"\}/g)).toHaveLength(2);
    expect(reveal).toContain("duration: shouldReduceMotion ? 0 : motionTokens.standard");
    expect(reveal).toContain("staggerChildren: 0");
    expect(motionCard).toContain("interactive && !shouldReduceMotion");
  });

  it("reserves the final formatted number width without duplicate spoken output", () => {
    expect(animatedNumber).toContain("const finalValue = formatValue(value);");
    expect(animatedNumber).toContain("reserveFormattedEndpoint");
    expect(animatedNumber).toContain("reservationValue");
    expect(animatedNumber.match(/aria-hidden="true"/g)).toHaveLength(3);
    expect(animatedNumber.match(/className="sr-only"/g)).toHaveLength(1);
    expect(animatedNumber).toContain('<span className="sr-only">{finalValue}</span>');
  });

  it("server-renders the final value in both visual layers and one semantic layer", () => {
    const markup = renderToStaticMarkup(
      createElement(AnimatedNumber, {
        value: 12_345,
        from: 0,
        format: (value) => `SAR ${Math.round(value).toLocaleString("en-US")}`
      })
    );
    const hiddenLayers = markup.match(/<span aria-hidden="true"[^>]*>[^<]*<\/span>/g) ?? [];

    expect(hiddenLayers).toHaveLength(2);
    expect(hiddenLayers.every((layer) => layer.includes("SAR 12,345"))).toBe(true);
    expect(markup.match(/SAR 12,345/g)).toHaveLength(3);
    expect(markup).not.toContain("SAR 0");
    expect(markup.match(/class="sr-only"/g)).toHaveLength(1);
  });

  it("uses opt-in same-cell grid layers for wrap-safe numbers", () => {
    expect(animatedNumber).toContain("wrap?: boolean");
    expect(animatedNumber).toContain("wrap = false");
    expect(animatedNumber).toContain("relative inline-grid min-w-0 max-w-full");
    expect(animatedNumber).toContain("col-start-1 row-start-1 min-w-0 max-w-full");
    expect(animatedNumber).toContain('const wrapVisualClass = "absolute inset-0 min-w-0 max-w-full"');
    expect(animatedNumber).toContain("[overflow-wrap:anywhere]");
    expect(animatedNumber).toContain('wrap ? wrapVisualClass : "absolute inset-0"');
  });

  it("server-renders wrap sizers as hidden and the visual layer as non-sizing", () => {
    const markup = renderToStaticMarkup(
      createElement(AnimatedNumber, {
        value: 12_345,
        from: 0,
        wrap: true,
        format: (value) => `SAR ${Math.round(value).toLocaleString("en-US")}`
      })
    );
    const hiddenLayers = markup.match(/<span aria-hidden="true"[^>]*>[^<]*<\/span>/g) ?? [];

    expect(hiddenLayers).toHaveLength(3);
    expect(hiddenLayers.filter((layer) => layer.includes("invisible"))).toHaveLength(2);
    expect(hiddenLayers.filter((layer) => layer.includes("absolute inset-0"))).toHaveLength(1);
    expect(markup.match(/class="sr-only"/g)).toHaveLength(1);
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
