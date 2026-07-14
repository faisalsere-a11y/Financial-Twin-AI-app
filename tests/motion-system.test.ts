import { readFileSync } from "node:fs";
import * as React from "react";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { AnimatedNumber } from "../components/motion/animated-number";
import { PageTransition } from "../components/motion/page-transition";
import { Reveal, Stagger, StaggerItem } from "../components/motion/reveal";
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

  it("reserves measured height at one width and resets at a different width", () => {
    expect(numberMotion).toHaveProperty("reserveMeasuredBlock");
    if (!("reserveMeasuredBlock" in numberMotion)) return;

    const reserveMeasuredBlock = numberMotion.reserveMeasuredBlock as (
      currentReservation: { width: number; height: number } | null,
      measuredWidth: number,
      measuredHeight: number
    ) => { width: number; height: number };
    const equalCodepointCompact = "SAR 111";
    const equalCodepointWrapped = "SAR WWW";
    expect(Array.from(equalCodepointCompact)).toHaveLength(Array.from(equalCodepointWrapped).length);

    let reservation = reserveMeasuredBlock(null, 180, 24);
    reservation = reserveMeasuredBlock(reservation, 180, 48);
    expect(reservation).toEqual({ width: 180, height: 48 });

    reservation = reserveMeasuredBlock(reservation, 180, 20);
    expect(reservation).toEqual({ width: 180, height: 48 });

    reservation = reserveMeasuredBlock(reservation, 240, 20);
    expect(reservation).toEqual({ width: 240, height: 20 });
    expect(numberMotion).not.toHaveProperty("reserveFormattedEndpoint");
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
    expect(pageTransition).toContain("initial={false}");
    expect(pageTransition).toContain('useState<PagePhase>("visible")');
    expect(pageTransition).toContain("useBrowserLayoutEffect");
    expect(pageTransition).toContain('window.matchMedia("(prefers-reduced-motion: reduce)").matches');
    expect(pageTransition).toContain('setPhase("hidden")');
    expect(pageTransition).toContain('setPhase("visible")');
    expect(pageTransition).toContain("duration: shouldReduceMotion ? 0 : motionTokens.standard");
    expect(reveal).not.toContain('initial={shouldReduceMotion ? false : "hidden"}');
    expect(reveal.match(/initial=\{false\}/g)).toHaveLength(2);
    expect(reveal.match(/animate=\{phase\}/g)).toHaveLength(2);
    expect(reveal).toContain('useState<RevealPhase>("visible")');
    expect(reveal).toContain("useBrowserLayoutEffect");
    expect(reveal).toContain("getBoundingClientRect()");
    expect(reveal).toContain("IntersectionObserver");
    expect(reveal).toContain("observer.disconnect()");
    expect(reveal).toContain("function useProgressiveReveal(observationKey: string)");
    expect(reveal).toContain('useProgressiveReveal("div")');
    expect(reveal).toContain("useProgressiveReveal(as)");
    expect(reveal).toContain("}, [observationKey, shouldReduceMotion]);");
    expect(reveal).toContain("duration: shouldReduceMotion ? 0 : motionTokens.standard");
    expect(reveal).toContain("staggerChildren: 0");
    expect(motionCard).toContain("interactive && !shouldReduceMotion");
  });

  it("server-renders reveal and stagger content without hidden motion styles", () => {
    vi.stubGlobal("React", React);
    try {
      const revealMarkup = renderToStaticMarkup(
        createElement(Reveal, null, "Visible reveal content")
      );
      const staggerMarkup = renderToStaticMarkup(
        createElement(
          Stagger,
          { as: "ol", "aria-label": "Progressive sequence" },
          createElement(StaggerItem, { as: "li" }, "Visible stagger content")
        )
      );
      const markup = `${revealMarkup}${staggerMarkup}`;

      expect(markup).toContain("Visible reveal content");
      expect(markup).toContain("Visible stagger content");
      expect(staggerMarkup).toMatch(/^<ol[^>]*aria-label="Progressive sequence"[^>]*><li/);
      expect(staggerMarkup).not.toContain("<div");
      expect(markup).not.toMatch(/opacity:\s*0/);
      expect(markup).not.toMatch(/translateY\(18px\)/);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("server-renders route content visibly before JavaScript or motion preferences resolve", () => {
    vi.stubGlobal("React", React);
    try {
      const markup = renderToStaticMarkup(
        createElement(PageTransition, null, "Visible route content")
      );

      expect(markup).toContain("Visible route content");
      expect(markup).not.toMatch(/opacity:\s*0/);
      expect(markup).not.toMatch(/translateY\(10px\)/);
      expect(markup).not.toMatch(/transform:\s*translateY/);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("reserves the final formatted number width without duplicate spoken output", () => {
    expect(animatedNumber).toContain("const finalValue = formatValue(value);");
    expect(animatedNumber).toContain("reserveMeasuredBlock");
    expect(animatedNumber).not.toContain("reserveFormattedEndpoint");
    expect(animatedNumber.match(/aria-hidden="true"/g)).toHaveLength(2);
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
    expect(animatedNumber).toContain("relative grid w-full min-w-0 max-w-full");
    expect(animatedNumber).toContain("col-start-1 row-start-1 h-auto min-w-0 max-w-full self-start");
    expect(animatedNumber).toContain('const wrapVisualClass = "absolute inset-0 min-w-0 max-w-full"');
    expect(animatedNumber).toContain("[overflow-wrap:anywhere]");
    expect(animatedNumber).toContain('wrap ? wrapVisualClass : "absolute inset-0"');
  });

  it("server-renders one intrinsic wrap sizer and one non-sizing visual layer", () => {
    const markup = renderToStaticMarkup(
      createElement(AnimatedNumber, {
        value: 12_345,
        from: 0,
        wrap: true,
        format: (value) => `SAR ${Math.round(value).toLocaleString("en-US")}`
      })
    );
    const hiddenLayers = markup.match(/<span aria-hidden="true"[^>]*>[^<]*<\/span>/g) ?? [];

    expect(hiddenLayers).toHaveLength(2);
    expect(hiddenLayers.filter((layer) => layer.includes("invisible"))).toHaveLength(1);
    expect(hiddenLayers.filter((layer) => layer.includes("absolute inset-0"))).toHaveLength(1);
    expect(hiddenLayers.every((layer) => layer.includes("SAR 12,345"))).toBe(true);
    expect(markup.match(/class="sr-only"/g)).toHaveLength(1);
  });

  it("measures wrap geometry on final changes and observes only wrapper width changes", () => {
    expect(animatedNumber).toContain("const wrapperRef = React.useRef<HTMLSpanElement>(null)");
    expect(animatedNumber).toContain("const sizerRef = React.useRef<HTMLSpanElement>(null)");
    expect(animatedNumber).toContain("wrapper.clientWidth");
    expect(animatedNumber).toContain("sizer.getBoundingClientRect().height");
    expect(animatedNumber).toContain('wrapper.style.minHeight = `${reservation.height}px`');
    expect(animatedNumber).toContain('typeof ResizeObserver === "undefined"');
    expect(animatedNumber).toContain("if (nextWidth === observedWidth) return");
    expect(animatedNumber).toContain("observer.observe(wrapper)");
    expect(animatedNumber).toContain("observer.disconnect()");
    expect(animatedNumber).not.toContain("setReservationValue");
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
    expect(reveal).toContain('type StaggerElement = "div" | "ul" | "ol"');
    expect(reveal).toContain('type StaggerItemElement = "div" | "li"');
    expect(reveal).toContain('type StaggerProps<Element extends StaggerElement = "div"> =');
    expect(reveal).toContain("Omit<HTMLMotionProps<Element>, ControlledRevealProp>");
    expect(reveal).toContain('type StaggerItemProps<Element extends StaggerItemElement = "div"> =');
    expect(reveal).toContain("Omit<HTMLMotionProps<Element>, ControlledItemProp>");
    expect(motionCard).toContain('type MotionCardProps = Omit<HTMLMotionProps<"div">, ControlledMotionCardProp> & {');
    for (const prop of [
      "initial",
      "animate",
      "whileInView",
      "whileFocus",
      "whileHover",
      "whileTap",
      "whileDrag",
      "exit",
      "viewport",
      "variants",
      "transition"
    ]) {
      expect(revealControls).toContain(`"${prop}"`);
    }
    for (const prop of [
      "initial",
      "animate",
      "whileInView",
      "whileFocus",
      "whileHover",
      "whileTap",
      "whileDrag",
      "exit",
      "viewport",
      "variants",
      "transition"
    ]) {
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
      reveal.indexOf("initial={false}")
    );
    expect(motionCard.indexOf("{...props}")).toBeLessThan(
      motionCard.indexOf('initial={shouldReduceMotion ? false : "hidden"}')
    );
  });
});
