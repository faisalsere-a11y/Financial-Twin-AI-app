"use client";

import { MotionConfig } from "framer-motion";
import { motionTokens } from "@/lib/motion/variants";

export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig
      reducedMotion="user"
      transition={{ duration: motionTokens.standard, ease: motionTokens.ease }}
    >
      {children}
    </MotionConfig>
  );
}
