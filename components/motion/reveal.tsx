"use client";

import type { HTMLMotionProps } from "framer-motion";
import { motion, useReducedMotion } from "framer-motion";
import { motionTokens, revealVariants, staggerVariants } from "@/lib/motion/variants";

const revealViewport = { once: true, amount: 0.18 } as const;
type ControlledRevealProp = "initial" | "whileInView" | "viewport" | "variants" | "transition";
type ControlledItemProp = "variants" | "transition";
type RevealProps = Omit<HTMLMotionProps<"div">, ControlledRevealProp>;
type StaggerItemProps = Omit<HTMLMotionProps<"div">, ControlledItemProp>;

export function Reveal({ children, ...props }: RevealProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      {...props}
      initial={shouldReduceMotion ? false : "hidden"}
      whileInView="visible"
      viewport={revealViewport}
      variants={revealVariants}
      transition={{
        duration: shouldReduceMotion ? 0 : motionTokens.standard,
        ease: motionTokens.ease
      }}
    >
      {children}
    </motion.div>
  );
}

export function Stagger({ children, ...props }: RevealProps) {
  const shouldReduceMotion = useReducedMotion();
  const variants = shouldReduceMotion
    ? { visible: { transition: { staggerChildren: 0 } } }
    : staggerVariants;

  return (
    <motion.div
      {...props}
      initial={shouldReduceMotion ? false : "hidden"}
      whileInView="visible"
      viewport={revealViewport}
      variants={variants}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, ...props }: StaggerItemProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      {...props}
      variants={revealVariants}
      transition={{
        duration: shouldReduceMotion ? 0 : motionTokens.standard,
        ease: motionTokens.ease
      }}
    >
      {children}
    </motion.div>
  );
}
