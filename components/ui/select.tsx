"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function Select({
  value,
  onValueChange,
  children,
  className,
  ...props
}: Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "onChange"> & {
  onValueChange?: (value: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onValueChange?.(event.target.value)}
      className={cn(
        "h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function SelectItem({ value, children }: { value: string; children: React.ReactNode }) {
  return <option value={value}>{children}</option>;
}
