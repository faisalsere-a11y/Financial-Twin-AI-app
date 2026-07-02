import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "border border-blue-400/30 bg-gradient-to-br from-blue-500 to-violet-600 text-white shadow-glow hover:brightness-110",
        secondary: "border border-emerald-400/25 bg-emerald-400/10 text-emerald-200 hover:bg-emerald-400/[0.15]",
        outline: "border border-white/10 bg-white/[0.03] hover:bg-white/[0.07]",
        ghost: "hover:bg-white/[0.07] hover:text-foreground",
        destructive: "bg-destructive text-destructive-foreground hover:brightness-110",
        glass: "border border-white/10 bg-white/[0.06] text-foreground backdrop-blur hover:bg-white/[0.1]"
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
