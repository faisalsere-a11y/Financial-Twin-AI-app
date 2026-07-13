import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-bold motion-safe:transition-transform motion-safe:[transition-duration:var(--motion-fast)] motion-safe:ease-out motion-safe:active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:scale-100 disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "button-glow-sweep border border-primary/25 bg-primary text-primary-foreground shadow-glow hover:bg-primary/90",
        secondary: "button-glow-sweep border border-positive/25 bg-positive/10 text-positive hover:bg-positive/15",
        outline: "border border-border bg-card/70 hover:bg-muted",
        ghost: "hover:bg-muted hover:text-foreground",
        destructive: "bg-destructive text-destructive-foreground hover:brightness-110",
        glass: "button-glow-sweep border border-border bg-card/75 text-foreground backdrop-blur hover:bg-muted"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-6",
        icon: "size-10"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
