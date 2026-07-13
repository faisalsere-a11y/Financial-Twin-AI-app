"use client";

import { motion, useReducedMotion } from "framer-motion";
import { motionTokens } from "@/lib/motion/variants";
import { clamp, cn } from "@/lib/utils";

type GoalProgressRingProps = {
  label: string;
  value: number;
  className?: string;
};

const radius = 42;
const circumference = 2 * Math.PI * radius;

export function GoalProgressRing({ label, value, className }: GoalProgressRingProps) {
  const shouldReduceMotion = useReducedMotion() === true;
  const progress = clamp(Number.isFinite(value) ? value : 0, 0, 100);
  const roundedProgress = Math.round(progress);
  const dashOffset = circumference * (1 - progress / 100);

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={roundedProgress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuetext={`${roundedProgress}% funded`}
      className={cn("relative size-28 shrink-0", className)}
    >
      <svg viewBox="0 0 100 100" aria-hidden="true" className="size-full -rotate-90">
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-muted"
        />
        <motion.circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={shouldReduceMotion ? false : { strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{
            duration: shouldReduceMotion ? 0 : motionTokens.deliberate,
            ease: motionTokens.ease
          }}
          className="text-primary drop-shadow-[0_0_8px_hsl(var(--primary)/0.28)]"
        />
      </svg>
      <span aria-hidden="true" className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-black tabular-nums">{roundedProgress}%</span>
        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">funded</span>
      </span>
      <span className="sr-only">{label}: {roundedProgress}% funded</span>
    </div>
  );
}
