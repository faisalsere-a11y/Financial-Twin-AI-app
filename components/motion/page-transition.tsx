"use client";

import { motion, useReducedMotion } from "framer-motion";
import { motionTokens, pageVariants } from "@/lib/motion/variants";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduceMotion ? false : "hidden"}
      animate="visible"
      variants={pageVariants}
      transition={{
        duration: shouldReduceMotion ? 0 : motionTokens.standard,
        ease: motionTokens.ease
      }}
    >
      {children}
    </motion.div>
  );
}
