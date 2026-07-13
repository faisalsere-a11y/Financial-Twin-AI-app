"use client";

import * as React from "react";
import type { HTMLMotionProps } from "framer-motion";
import { motion, useReducedMotion } from "framer-motion";
import { motionTokens, revealVariants } from "@/lib/motion/variants";
import { cn } from "@/lib/utils";

type MotionCardProps = HTMLMotionProps<"div"> & {
  interactive?: boolean;
};

const MotionCard = React.forwardRef<HTMLDivElement, MotionCardProps>(
  ({ children, className, interactive = true, ...props }, ref) => {
    const shouldReduceMotion = useReducedMotion();

    return (
      <motion.div
        ref={ref}
        initial={shouldReduceMotion ? false : "hidden"}
        whileInView="visible"
        viewport={{ once: true, amount: 0.18 }}
        variants={revealVariants}
        whileHover={interactive && !shouldReduceMotion ? { y: -2, scale: 1.01 } : undefined}
        whileTap={interactive && !shouldReduceMotion ? { scale: 0.995 } : undefined}
        transition={{ duration: shouldReduceMotion ? 0 : motionTokens.standard, ease: motionTokens.ease }}
        className={cn(
          "relative overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-glass",
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

MotionCard.displayName = "MotionCard";

export { MotionCard };
