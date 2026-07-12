import { cn } from "@/lib/utils";

export function NovaOrb({ className }: { className?: string }) {
  return (
    <span aria-hidden="true" className={cn("relative flex items-center justify-center rounded-full", className)}>
      <span className="absolute inset-0 rounded-full bg-primary/20 blur-xl" />
      <span className="nova-orb relative block size-full rounded-full" />
    </span>
  );
}
