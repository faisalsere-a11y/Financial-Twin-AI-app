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
  wrap?: boolean;
};

const useBrowserLayoutEffect = typeof window === "undefined" ? React.useEffect : React.useLayoutEffect;
const wrapLayerClass = "col-start-1 row-start-1 min-w-0 max-w-full";

export function AnimatedNumber({
  value,
  from = 0,
  duration = motionTokens.deliberate,
  decimals = 0,
  prefix = "",
  suffix = "",
  format,
  wrap = false,
  className,
  ...props
}: AnimatedNumberProps) {
  const shouldReduceMotion = useReducedMotion();
  const animatedValue = useMotionValue(value);
  const [displayValue, setDisplayValue] = React.useState(value);
  const hasAnimatedRef = React.useRef(false);

  useMotionValueEvent(animatedValue, "change", setDisplayValue);

  useBrowserLayoutEffect(() => {
    const prefersReducedMotion =
      shouldReduceMotion === true ||
      (typeof window.matchMedia === "function" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches);

    if (prefersReducedMotion) {
      animatedValue.set(value);
      hasAnimatedRef.current = true;
      return;
    }

    if (!hasAnimatedRef.current) {
      animatedValue.set(from);
    }
    hasAnimatedRef.current = true;

    const controls = animate(animatedValue, value, {
      duration,
      ease: motionTokens.ease
    });

    return () => controls.stop();
  }, [animatedValue, duration, from, shouldReduceMotion, value]);

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
    <span
      className={cn(
        "tabular-nums",
        wrap
          ? "inline-grid min-w-0 max-w-full grid-cols-1 whitespace-normal [overflow-wrap:anywhere]"
          : "relative inline-block whitespace-nowrap",
        className
      )}
      {...props}
    >
      <span aria-hidden="true" className={cn("invisible", wrap && wrapLayerClass)}>{finalValue}</span>
      <span aria-hidden="true" className={cn(wrap ? wrapLayerClass : "absolute inset-0")}>{formatValue(displayValue)}</span>
      <span className="sr-only">{finalValue}</span>
    </span>
  );
}
