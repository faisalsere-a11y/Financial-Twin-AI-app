"use client";

import { useTheme } from "next-themes";
import { Toaster } from "sonner";

export function ThemedToaster() {
  const { resolvedTheme } = useTheme();

  return (
    <>
      <Toaster
        richColors
        theme={resolvedTheme === "light" ? "light" : "dark"}
        position="top-right"
        toastOptions={{
          className: "toast-slide-in border-border bg-popover text-popover-foreground",
          classNames: {
            success: "toast-check-reveal",
            error: "toast-error-nudge"
          }
        }}
      />
      <style jsx global>{`
        @keyframes toast-edge-slide {
          from {
            opacity: 0;
            transform: translate3d(0.5rem, 0, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }

        @keyframes toast-check-reveal {
          from {
            opacity: 0;
            transform: scaleX(0);
          }
          to {
            opacity: 1;
            transform: scaleX(1);
          }
        }

        @keyframes toast-error-nudge {
          0% {
            opacity: 0;
            transform: translate3d(0.5rem, 0, 0);
          }
          55% {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
          78% {
            opacity: 1;
            transform: translate3d(-0.125rem, 0, 0);
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }

        @media (prefers-reduced-motion: no-preference) {
          .toast-slide-in [data-content] {
            animation: toast-edge-slide var(--motion-standard) cubic-bezier(0.22, 1, 0.36, 1) both;
          }

          .toast-check-reveal [data-icon] svg {
            animation: toast-check-reveal var(--motion-fast) cubic-bezier(0.22, 1, 0.36, 1) both;
            transform-origin: left center;
          }

          .toast-error-nudge [data-content] {
            animation: toast-error-nudge var(--motion-fast) cubic-bezier(0.22, 1, 0.36, 1) both;
          }
        }
      `}</style>
    </>
  );
}
