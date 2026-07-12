import { Card, CardContent } from "@/components/ui/card";
import type { MetricTone, MetricViewModel } from "@/lib/presentation/financial-overview";
import { cn } from "@/lib/utils";

const toneClasses: Record<MetricTone, string> = {
  positive: "from-positive/20 text-positive",
  caution: "from-caution/20 text-caution",
  danger: "from-destructive/20 text-destructive",
  neutral: "from-primary/20 text-primary"
};

export function MetricCard({ metric, className }: { metric: MetricViewModel; className?: string }) {
  return (
    <Card className={cn("relative min-h-36 overflow-hidden", className)}>
      <div className={cn("pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t to-transparent", toneClasses[metric.tone].split(" ")[0])} />
      <CardContent className="relative p-5">
        <p className="text-[11px] font-black uppercase tracking-[0.12em] text-muted-foreground">{metric.label}</p>
        <p className="mt-4 text-2xl font-black tabular-nums tracking-tight text-foreground">{metric.value}</p>
        <p className={cn("mt-2 text-xs font-semibold", toneClasses[metric.tone].split(" ")[1])}>{metric.detail}</p>
      </CardContent>
    </Card>
  );
}
