"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefCallback
} from "react";
import type { HTMLMotionProps } from "framer-motion";
import { motion, useReducedMotion } from "framer-motion";
import { motionTokens, revealVariants, staggerVariants } from "@/lib/motion/variants";

const revealThreshold = 0.18;
const useBrowserLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

type RevealPhase = "hidden" | "visible";
type ControlledRevealProp =
  | "initial"
  | "animate"
  | "whileInView"
  | "whileFocus"
  | "whileHover"
  | "whileTap"
  | "whileDrag"
  | "exit"
  | "viewport"
  | "variants"
  | "transition";
type ControlledItemProp =
  | "initial"
  | "animate"
  | "whileInView"
  | "whileFocus"
  | "whileHover"
  | "whileTap"
  | "whileDrag"
  | "exit"
  | "viewport"
  | "variants"
  | "transition";
type RevealProps = Omit<HTMLMotionProps<"div">, ControlledRevealProp>;
type StaggerElement = "div" | "ul" | "ol";
type StaggerItemElement = "div" | "li";
type StaggerProps<Element extends StaggerElement = "div"> =
  Omit<HTMLMotionProps<Element>, ControlledRevealProp> & { as?: Element };
type StaggerItemProps<Element extends StaggerItemElement = "div"> =
  Omit<HTMLMotionProps<Element>, ControlledItemProp> & { as?: Element };

const RevealPhaseContext = createContext<{ phase: RevealPhase; shouldReduceMotion: boolean }>({
  phase: "visible",
  shouldReduceMotion: false
});

function isCurrentlyVisible(element: HTMLElement) {
  const bounds = element.getBoundingClientRect();
  const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

  return (
    bounds.width > 0 &&
    bounds.height > 0 &&
    bounds.bottom > 0 &&
    bounds.right > 0 &&
    bounds.top < viewportHeight &&
    bounds.left < viewportWidth
  );
}

function useProgressiveReveal(observationKey: string) {
  const elementRef = useRef<HTMLElement | null>(null);
  const [phase, setPhase] = useState<RevealPhase>("visible");
  const shouldReduceMotion = useReducedMotion() === true;
  const setElementRef = useCallback<RefCallback<HTMLElement>>((element) => {
    elementRef.current = element;
  }, []);

  useBrowserLayoutEffect(() => {
    const element = elementRef.current;

    if (!element || shouldReduceMotion || typeof IntersectionObserver === "undefined") {
      setPhase("visible");
      return;
    }

    if (isCurrentlyVisible(element)) {
      setPhase("visible");
      return;
    }

    setPhase("hidden");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setPhase("visible");
        observer.disconnect();
      },
      { threshold: revealThreshold }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [observationKey, shouldReduceMotion]);

  return { phase, setElementRef, shouldReduceMotion };
}

export function Reveal({ children, ...props }: RevealProps) {
  const { phase, setElementRef, shouldReduceMotion } = useProgressiveReveal("div");
  const visibleTransition = {
    duration: shouldReduceMotion ? 0 : motionTokens.standard,
    ease: motionTokens.ease
  };

  return (
    <motion.div
      {...props}
      ref={setElementRef}
      initial={false}
      animate={phase}
      variants={revealVariants}
      transition={phase === "hidden" ? { duration: 0 } : visibleTransition}
    >
      {children}
    </motion.div>
  );
}

export function Stagger<Element extends StaggerElement = "div">({
  children,
  as = "div" as Element,
  ...props
}: StaggerProps<Element>) {
  const { phase, setElementRef, shouldReduceMotion } = useProgressiveReveal(as);
  const MotionStagger = (as === "ul" ? motion.ul : as === "ol" ? motion.ol : motion.div) as typeof motion.div;
  const motionProps = props as unknown as Omit<HTMLMotionProps<"div">, ControlledRevealProp>;
  const variants = shouldReduceMotion
    ? {
        hidden: { transition: { staggerChildren: 0 } },
        visible: { transition: { staggerChildren: 0 } }
      }
    : {
        hidden: { transition: { staggerChildren: 0 } },
        ...staggerVariants
      };

  return (
    <RevealPhaseContext.Provider value={{ phase, shouldReduceMotion }}>
      <MotionStagger
        {...motionProps}
        ref={setElementRef}
        initial={false}
        animate={phase}
        variants={variants}
      >
        {children}
      </MotionStagger>
    </RevealPhaseContext.Provider>
  );
}

export function StaggerItem<Element extends StaggerItemElement = "div">({
  children,
  as = "div" as Element,
  ...props
}: StaggerItemProps<Element>) {
  const context = useContext(RevealPhaseContext);
  const shouldReduceMotion = useReducedMotion() === true || context.shouldReduceMotion;
  const MotionItem = (as === "li" ? motion.li : motion.div) as typeof motion.div;
  const motionProps = props as unknown as Omit<HTMLMotionProps<"div">, ControlledItemProp>;
  const visibleTransition = {
    duration: shouldReduceMotion ? 0 : motionTokens.standard,
    ease: motionTokens.ease
  };

  return (
    <MotionItem
      {...motionProps}
      variants={revealVariants}
      transition={context.phase === "hidden" ? { duration: 0 } : visibleTransition}
    >
      {children}
    </MotionItem>
  );
}
