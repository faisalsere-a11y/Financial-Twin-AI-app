import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("shimmer rounded-md bg-muted bg-[length:200%_100%]", className)} {...props} />;
}

export { Skeleton };
