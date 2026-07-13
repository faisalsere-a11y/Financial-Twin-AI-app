import type { Variants } from "framer-motion";

export const motionTokens = {
  fast: 0.16,
  standard: 0.26,
  deliberate: 0.42,
  ease: [0.22, 1, 0.36, 1] as const
};

export const pageVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
} satisfies Variants;

export const revealVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 }
} satisfies Variants;

export const staggerVariants = {
  visible: { transition: { staggerChildren: 0.065 } }
} satisfies Variants;
