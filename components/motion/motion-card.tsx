"use client";

import * as React from "react";
import type { HTMLMotionProps } from "framer-motion";
import { motion, useReducedMotion } from "framer-motion";
import { motionTokens, revealVariants } from "@/lib/motion/variants";
import { cn } from "@/lib/utils";

type ControlledMotionCardProp =
  | "initial"
  | "whileInView"
  | "viewport"
  | "variants"
  | "whileHover"
  | "whileTap"
  | "transition";
type MotionCardProps = Omit<HTMLMotionProps<"div">, ControlledMotionCardProp> & {
  interactive?: boolean;
};

const interactionTransition = { duration: motionTokens.fast, ease: motionTokens.ease };

const MotionCard = React.forwardRef<HTMLDivElement, MotionCardProps>(
  ({ children, className, interactive = true, ...props }, ref) => {
    const shouldReduceMotion = useReducedMotion();

    return (
      <motion.div
        {...props}
        ref={ref}
        initial={shouldReduceMotion ? false : "hidden"}
        whileInView="visible"
        viewport={{ once: true, amount: 0.18 }}
        variants={revealVariants}
        whileHover={
          interactive && !shouldReduceMotion
            ? { y: -2, scale: 1.01, transition: interactionTransition }
            : undefined
        }
        whileTap={
          interactive && !shouldReduceMotion
            ? { scale: 0.995, transition: interactionTransition }
            : undefined
        }
        transition={{ duration: shouldReduceMotion ? 0 : motionTokens.standard, ease: motionTokens.ease }}
        className={cn(
          "relative overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-glass",
          className
        )}
      >
        {children}
      </motion.div>
    );
  }
);

MotionCard.displayName = "MotionCard";

export { MotionCard };
