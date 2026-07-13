"use client";

import * as React from "react";
import { animate, useMotionValue, useMotionValueEvent, useReducedMotion } from "framer-motion";
import { reserveMeasuredBlock, type MeasuredBlockReservation } from "@/lib/motion/number";
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
const wrapSizerClass = "col-start-1 row-start-1 h-auto min-w-0 max-w-full self-start";
const wrapVisualClass = "absolute inset-0 min-w-0 max-w-full";

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
  const wrapperRef = React.useRef<HTMLSpanElement>(null);
  const sizerRef = React.useRef<HTMLSpanElement>(null);
  const reservationRef = React.useRef<MeasuredBlockReservation | null>(null);

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
  const measureReservation = React.useCallback(() => {
    const wrapper = wrapperRef.current;
    const sizer = sizerRef.current;
    if (!wrap || !wrapper || !sizer) return;

    const measuredWidth = wrapper.clientWidth;
    const measuredHeight = sizer.getBoundingClientRect().height;
    const reservation = reserveMeasuredBlock(
      reservationRef.current,
      measuredWidth,
      measuredHeight
    );
    reservationRef.current = reservation;
    wrapper.style.minHeight = `${reservation.height}px`;
  }, [wrap]);

  useBrowserLayoutEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    if (!wrap) {
      reservationRef.current = null;
      wrapper.style.minHeight = "";
      return;
    }

    measureReservation();
  }, [finalValue, measureReservation, wrap]);

  useBrowserLayoutEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrap || !wrapper || typeof ResizeObserver === "undefined") return;

    let observedWidth = wrapper.clientWidth;
    const observer = new ResizeObserver(() => {
      const nextWidth = wrapper.clientWidth;
      if (nextWidth === observedWidth) return;
      observedWidth = nextWidth;
      measureReservation();
    });
    observer.observe(wrapper);

    return () => observer.disconnect();
  }, [measureReservation, wrap]);

  return (
    <span
      ref={wrapperRef}
      className={cn(
        "tabular-nums",
        wrap
          ? "relative grid w-full min-w-0 max-w-full grid-cols-1 whitespace-normal [overflow-wrap:anywhere]"
          : "relative inline-block whitespace-nowrap",
        className
      )}
      {...props}
    >
      <span ref={sizerRef} aria-hidden="true" className={cn("invisible", wrap && wrapSizerClass)}>{finalValue}</span>
      <span aria-hidden="true" className={wrap ? wrapVisualClass : "absolute inset-0"}>{formatValue(displayValue)}</span>
      <span className="sr-only">{finalValue}</span>
    </span>
  );
}
