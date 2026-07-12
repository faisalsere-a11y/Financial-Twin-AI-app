import * as React from "react";
import { cn, clamp } from "@/lib/utils";

const Progress = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value?: number; indicatorClassName?: string }
>(({ className, value = 0, indicatorClassName, ...props }, ref) => (
  <div ref={ref} className={cn("relative h-2 w-full overflow-hidden rounded-full bg-muted", className)} {...props}>
    <div
      className={cn("h-full rounded-full bg-gradient-to-r from-blue-400 to-violet-500 transition-all", indicatorClassName)}
      style={{ width: `${clamp(value, 0, 100)}%` }}
    />
  </div>
));
Progress.displayName = "Progress";

export { Progress };
