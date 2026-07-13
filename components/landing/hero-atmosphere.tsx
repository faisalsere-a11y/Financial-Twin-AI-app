"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useMotionValue, useMotionValueEvent, useReducedMotion, useSpring } from "framer-motion";

const atmosphereStyle = {
  "--landing-x": "0px",
  "--landing-y": "0px",
  "--landing-x-opposite": "0px",
  "--landing-y-opposite": "0px"
} as CSSProperties;

function normalizePointer(position: number, start: number, size: number) {
  if (size <= 0) return 0;
  return Math.max(-1, Math.min(1, ((position - start) / size) * 2 - 1));
}

export function HeroAtmosphere() {
  const rootRef = useRef<HTMLDivElement>(null);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const springX = useSpring(pointerX, { stiffness: 120, damping: 24, mass: 0.45 });
  const springY = useSpring(pointerY, { stiffness: 120, damping: 24, mass: 0.45 });
  const shouldReduceMotion = useReducedMotion() === true;
  const [hasFinePointer, setHasFinePointer] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const active = hasFinePointer && isVisible && !shouldReduceMotion;

  useMotionValueEvent(springX, "change", (latest) => {
    const element = rootRef.current;
    if (!element) return;
    element.style.setProperty("--landing-x", `${latest * 28}px`);
    element.style.setProperty("--landing-x-opposite", `${latest * -16}px`);
  });

  useMotionValueEvent(springY, "change", (latest) => {
    const element = rootRef.current;
    if (!element) return;
    element.style.setProperty("--landing-y", `${latest * 20}px`);
    element.style.setProperty("--landing-y-opposite", `${latest * -12}px`);
  });

  useEffect(() => {
    const pointerQuery = window.matchMedia("(pointer: fine)");
    const syncPointer = () => setHasFinePointer(pointerQuery.matches);

    syncPointer();
    pointerQuery.addEventListener("change", syncPointer);
    return () => pointerQuery.removeEventListener("change", syncPointer);
  }, []);

  useEffect(() => {
    const surface = rootRef.current?.parentElement;
    if (!surface) return;

    if (typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.05 }
    );

    observer.observe(surface);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const element = rootRef.current;
    const surface = element?.parentElement;
    if (!element || !surface) return;
    let animationFrame: number | null = null;
    let latestPointer: PointerEvent | null = null;
    let cachedBounds: Pick<DOMRect, "left" | "top" | "width" | "height"> | null = null;

    const cacheBounds = () => {
      const bounds = surface.getBoundingClientRect();
      cachedBounds = bounds.width > 0 && bounds.height > 0
        ? { left: bounds.left, top: bounds.top, width: bounds.width, height: bounds.height }
        : null;
    };

    const resetPointer = () => {
      if (animationFrame !== null) cancelAnimationFrame(animationFrame);
      animationFrame = null;
      latestPointer = null;
      cachedBounds = null;
      pointerX.set(0);
      pointerY.set(0);
      springX.jump(0);
      springY.jump(0);
      element.style.setProperty("--landing-x", "0px");
      element.style.setProperty("--landing-y", "0px");
      element.style.setProperty("--landing-x-opposite", "0px");
      element.style.setProperty("--landing-y-opposite", "0px");
    };

    if (!active) {
      resetPointer();
      return;
    }

    const flushPointer = () => {
      animationFrame = null;
      const pointer = latestPointer;
      const bounds = cachedBounds;
      if (!pointer || !bounds) return;
      pointerX.set(normalizePointer(pointer.clientX, bounds.left, bounds.width));
      pointerY.set(normalizePointer(pointer.clientY, bounds.top, bounds.height));
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      latestPointer = event;
      if (animationFrame !== null) return;

      animationFrame = requestAnimationFrame(flushPointer);
    };

    cacheBounds();
    let boundsObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      boundsObserver = new ResizeObserver(cacheBounds);
      boundsObserver.observe(surface);
    }
    surface.addEventListener("pointerenter", cacheBounds);
    surface.addEventListener("pointermove", handlePointerMove, { passive: true });
    surface.addEventListener("pointerleave", resetPointer);
    surface.addEventListener("pointercancel", resetPointer);
    window.addEventListener("resize", cacheBounds);
    window.addEventListener("scroll", cacheBounds, { passive: true, capture: true });
    return () => {
      surface.removeEventListener("pointerenter", cacheBounds);
      surface.removeEventListener("pointermove", handlePointerMove);
      surface.removeEventListener("pointerleave", resetPointer);
      surface.removeEventListener("pointercancel", resetPointer);
      window.removeEventListener("resize", cacheBounds);
      window.removeEventListener("scroll", cacheBounds, { capture: true });
      if (boundsObserver) boundsObserver.disconnect();
      resetPointer();
    };
  }, [active, pointerX, pointerY, springX, springY]);

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      inert
      data-active={active ? "true" : "false"}
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={atmosphereStyle}
    >
      <div className="subtle-grid absolute inset-0 opacity-50 [mask-image:linear-gradient(to_bottom,black,transparent_82%)]" />
      <div
        className={`absolute -left-52 -top-56 size-[42rem] rounded-full bg-primary/20 opacity-70 blur-3xl ${active ? "will-change-transform" : ""}`}
        style={{ transform: "translate3d(var(--landing-x), var(--landing-y), 0)" }}
      />
      <div
        className={`absolute -right-56 top-10 size-[38rem] rounded-full bg-chart-3/15 opacity-75 blur-3xl ${active ? "will-change-transform" : ""}`}
        style={{ transform: "translate3d(var(--landing-x-opposite), var(--landing-y-opposite), 0)" }}
      />
      <div
        className={`absolute left-[42%] top-[46%] size-[27rem] rounded-full bg-positive/10 opacity-65 blur-3xl ${active ? "will-change-transform" : ""}`}
        style={{ transform: "translate3d(var(--landing-x-opposite), var(--landing-y), 0)" }}
      />
      <div className="absolute left-1/2 top-20 h-px w-[min(64rem,88vw)] -translate-x-1/2 bg-gradient-to-r from-transparent via-primary/35 to-transparent opacity-80" />
      <div className="absolute left-1/2 top-24 aspect-square w-[min(58rem,90vw)] -translate-x-1/2 rounded-full border border-primary/10 opacity-50" />
      <div className="absolute left-1/2 top-44 aspect-square w-[min(42rem,72vw)] -translate-x-1/2 rounded-full border border-chart-3/10 opacity-40" />
    </div>
  );
}
