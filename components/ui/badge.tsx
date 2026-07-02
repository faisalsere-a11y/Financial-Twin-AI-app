import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.06em] transition-colors",
  {
    variants: {
      variant: {
        default: "border-blue-400/25 bg-blue-400/[0.12] text-blue-200",
        secondary: "border-white/10 bg-white/[0.045] text-slate-300",
        outline: "border-white/[0.12] text-foreground",
        success: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
        warning: "border-amber-400/20 bg-amber-400/10 text-amber-300",
        danger: "border-rose-400/20 bg-rose-400/10 text-rose-300",
        blue: "border-blue-400/20 bg-blue-400/10 text-blue-300"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
