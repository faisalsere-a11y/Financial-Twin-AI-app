import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.06em] transition-colors",
  {
    variants: {
      variant: {
        default: "border-primary/25 bg-primary/10 text-primary",
        secondary: "border-border bg-muted text-muted-foreground",
        outline: "border-border text-foreground",
        success: "border-positive/25 bg-positive/10 text-positive",
        warning: "border-caution/25 bg-caution/10 text-caution",
        danger: "border-destructive/25 bg-destructive/10 text-destructive",
        blue: "border-primary/25 bg-primary/10 text-primary"
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
