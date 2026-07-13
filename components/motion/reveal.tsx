"use client";

import type { HTMLMotionProps } from "framer-motion";
import { motion, useReducedMotion } from "framer-motion";
import { motionTokens, revealVariants, staggerVariants } from "@/lib/motion/variants";

const revealViewport = { once: true, amount: 0.18 } as const;

export function Reveal({ children, ...props }: HTMLMotionProps<"div">) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduceMotion ? false : "hidden"}
      whileInView="visible"
      viewport={revealViewport}
      variants={revealVariants}
      transition={{
        duration: shouldReduceMotion ? 0 : motionTokens.standard,
        ease: motionTokens.ease
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function Stagger({ children, ...props }: HTMLMotionProps<"div">) {
  const shouldReduceMotion = useReducedMotion();
  const variants = shouldReduceMotion
    ? { visible: { transition: { staggerChildren: 0 } } }
    : staggerVariants;

  return (
    <motion.div
      initial={shouldReduceMotion ? false : "hidden"}
      whileInView="visible"
      viewport={revealViewport}
      variants={variants}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, ...props }: HTMLMotionProps<"div">) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      variants={revealVariants}
      transition={{
        duration: shouldReduceMotion ? 0 : motionTokens.standard,
        ease: motionTokens.ease
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
