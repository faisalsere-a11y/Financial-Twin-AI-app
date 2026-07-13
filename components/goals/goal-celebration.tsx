"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { Check, Sparkles } from "lucide-react";
import { useReducedMotion } from "framer-motion";

type GoalCelebrationProps = {
  goalName: string;
  onComplete: () => void;
};

const particles = [
  { x: "-4.6rem", y: "-2.8rem", color: "hsl(var(--primary))", delay: "0ms" },
  { x: "-2.8rem", y: "-4.2rem", color: "hsl(var(--positive))", delay: "35ms" },
  { x: "-0.8rem", y: "-4.8rem", color: "hsl(var(--accent-foreground))", delay: "70ms" },
  { x: "1.8rem", y: "-4.5rem", color: "hsl(var(--primary))", delay: "15ms" },
  { x: "4.4rem", y: "-3.2rem", color: "hsl(var(--positive))", delay: "55ms" },
  { x: "4.8rem", y: "-0.6rem", color: "hsl(var(--primary))", delay: "95ms" },
  { x: "-4.9rem", y: "-0.4rem", color: "hsl(var(--positive))", delay: "110ms" },
  { x: "3.5rem", y: "1.2rem", color: "hsl(var(--accent-foreground))", delay: "125ms" }
] as const;

export function GoalCelebration({ goalName, onComplete }: GoalCelebrationProps) {
  const shouldReduceMotion = useReducedMotion() === true;
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const timeout = window.setTimeout(
      () => onCompleteRef.current(),
      shouldReduceMotion ? 2200 : 3200
    );
    return () => window.clearTimeout(timeout);
  }, [shouldReduceMotion]);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="pointer-events-none fixed bottom-6 left-1/2 z-[70] w-[min(92vw,28rem)] -translate-x-1/2"
    >
      <div className="relative overflow-visible rounded-2xl border border-positive/30 bg-popover/95 px-5 py-4 text-popover-foreground shadow-2xl backdrop-blur-xl">
        {!shouldReduceMotion && (
          <span aria-hidden="true" className="absolute left-1/2 top-1/2">
            {particles.map((particle, index) => (
              <span
                key={`${particle.x}-${particle.y}`}
                className="goal-celebration-particle absolute left-0 top-0 size-2 rounded-full"
                style={{
                  "--particle-x": particle.x,
                  "--particle-y": particle.y,
                  "--particle-color": particle.color,
                  "--particle-delay": particle.delay,
                  "--particle-rotation": `${index * 47}deg`
                } as CSSProperties}
              />
            ))}
          </span>
        )}
        <div className="relative flex items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-positive/15 text-positive">
            {shouldReduceMotion ? <Check aria-hidden="true" /> : <Sparkles aria-hidden="true" />}
          </span>
          <div>
            <p className="font-black">Goal fully funded</p>
            <p className="mt-0.5 text-sm text-muted-foreground">{goalName} just reached 100%.</p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes goal-particle {
          0% {
            opacity: 0;
            transform: translate3d(0, 0, 0) rotate(0deg) scale(0.4);
          }
          18% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translate3d(var(--particle-x), var(--particle-y), 0) rotate(var(--particle-rotation)) scale(1);
          }
        }

        .goal-celebration-particle {
          background: var(--particle-color);
          animation: goal-particle var(--motion-deliberate) var(--particle-delay) cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        @media (prefers-reduced-motion: reduce) {
          .goal-celebration-particle {
            animation: none;
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
