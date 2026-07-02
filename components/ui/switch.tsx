"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function Switch({
  checked,
  onCheckedChange,
  className,
  ...props
}: Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> & {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange?.(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border border-white/10 bg-white/[0.08] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[state=checked]:bg-blue-500",
        checked && "bg-blue-500",
        className
      )}
      {...props}
    >
      <span
        className={cn(
          "pointer-events-none block size-5 translate-x-0 rounded-full bg-white shadow-lg ring-0 transition-transform",
          checked && "translate-x-5"
        )}
      />
    </button>
  );
}
