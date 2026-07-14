"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { motionTokens, pageVariants } from "@/lib/motion/variants";

type PagePhase = "hidden" | "visible";

const useBrowserLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export function PageTransition({ children }: { children: React.ReactNode }) {
  const shouldReduceMotion = useReducedMotion() === true;
  const [phase, setPhase] = useState<PagePhase>("visible");

  useBrowserLayoutEffect(() => {
    const prefersReducedMotion = shouldReduceMotion
      || (typeof window.matchMedia === "function"
        && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    if (prefersReducedMotion) {
      setPhase("visible");
      return;
    }

    setPhase("hidden");
    const entranceFrame = window.requestAnimationFrame(() => setPhase("visible"));
    return () => window.cancelAnimationFrame(entranceFrame);
  }, [shouldReduceMotion]);

  const visibleTransition = {
    duration: shouldReduceMotion ? 0 : motionTokens.standard,
    ease: motionTokens.ease
  };

  return (
    <motion.div
      initial={false}
      animate={phase}
      variants={pageVariants}
      transition={phase === "hidden" ? { duration: 0 } : visibleTransition}
    >
      {children}
    </motion.div>
  );
}
