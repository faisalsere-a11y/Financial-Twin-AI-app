"use client";

import * as React from "react";
import { animate, useMotionValue, useMotionValueEvent, useReducedMotion } from "framer-motion";
import { motionTokens } from "@/lib/motion/variants";
import { cn } from "@/lib/utils";

type AnimatedNumberProps = Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> & {
  value: number;
  from?: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  format?: (value: number) => string;
};

export function AnimatedNumber({
  value,
  from = 0,
  duration = motionTokens.deliberate,
  decimals = 0,
  prefix = "",
  suffix = "",
  format,
  className,
  ...props
}: AnimatedNumberProps) {
  const shouldReduceMotion = useReducedMotion();
  const animatedValue = useMotionValue(from);
  const [displayValue, setDisplayValue] = React.useState(from);

  useMotionValueEvent(animatedValue, "change", setDisplayValue);

  React.useEffect(() => {
    if (shouldReduceMotion) {
      animatedValue.set(value);
      return;
    }

    const controls = animate(animatedValue, value, {
      duration,
      ease: motionTokens.ease
    });

    return () => controls.stop();
  }, [animatedValue, duration, shouldReduceMotion, value]);

  const formatValue = React.useCallback(
    (number: number) =>
      format?.(number) ??
      `${prefix}${number.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      })}${suffix}`,
    [decimals, format, prefix, suffix]
  );
  const finalValue = formatValue(value);

  return (
    <span className={cn("relative inline-block whitespace-nowrap tabular-nums", className)} {...props}>
      <span aria-hidden="true" className="invisible">{finalValue}</span>
      <span aria-hidden="true" className="absolute inset-0">{formatValue(displayValue)}</span>
      <span className="sr-only">{finalValue}</span>
    </span>
  );
}
