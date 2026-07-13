"use client";

import { Children, isValidElement, type ReactNode } from "react";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

const MAX_STAGGER_ITEMS = 4;

type LandingRevealProps = {
  children: ReactNode;
  className?: string;
};

type LandingStaggerProps = LandingRevealProps & {
  itemClassName?: string;
  as?: "div" | "ul" | "ol";
  ariaLabel?: string;
};

export function LandingReveal({ children, className }: LandingRevealProps) {
  return <Reveal className={className}>{children}</Reveal>;
}

export function LandingStagger({ children, className, itemClassName, as = "div", ariaLabel }: LandingStaggerProps) {
  const items = Children.toArray(children);
  const itemAs = as === "div" ? "div" : "li";
  const StaticItem = itemAs;

  return (
    <Stagger as={as} aria-label={ariaLabel} className={className}>
      {items.map((child, index) => {
        const key = isValidElement(child) && child.key !== null ? child.key : index;
        const wrapperClassName = cn("min-w-0", itemClassName);

        return index < MAX_STAGGER_ITEMS ? (
          <StaggerItem as={itemAs} key={key} className={wrapperClassName}>
            {child}
          </StaggerItem>
        ) : (
          <StaticItem key={key} className={wrapperClassName}>
            {child}
          </StaticItem>
        );
      })}
    </Stagger>
  );
}
