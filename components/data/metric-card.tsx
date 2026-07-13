import { CardContent } from "@/components/ui/card";
import { AnimatedNumber } from "@/components/motion/animated-number";
import { MotionCard } from "@/components/motion/motion-card";
import type { MetricTone, MetricViewModel } from "@/lib/presentation/financial-overview";
import { cn } from "@/lib/utils";

const toneClasses: Record<MetricTone, string> = {
  positive: "from-positive/20 text-positive",
  caution: "from-caution/20 text-caution",
  danger: "from-destructive/20 text-destructive",
  neutral: "from-primary/20 text-primary"
};

export function MetricCard({
  metric,
  className,
  format
}: {
  metric: MetricViewModel;
  className?: string;
  format?: (value: number) => string;
}) {
  return (
    <MotionCard interactive={false} className={cn("relative h-full min-h-36 min-w-0", className)}>
      <div className={cn("pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t to-transparent", toneClasses[metric.tone].split(" ")[0])} />
      <CardContent className="relative min-w-0 p-5">
        <p className="break-words text-[11px] font-black uppercase tracking-[0.12em] text-muted-foreground">{metric.label}</p>
        <p className="mt-4 min-w-0 font-black tabular-nums tracking-tight text-foreground">
          <AnimatedNumber
            value={metric.rawValue}
            format={format ?? (() => metric.value)}
            wrap
            className="min-w-0 max-w-full text-xl sm:text-2xl"
          />
        </p>
        <p className={cn("mt-2 break-words text-xs font-semibold", toneClasses[metric.tone].split(" ")[1])}>{metric.detail}</p>
      </CardContent>
    </MotionCard>
  );
}
