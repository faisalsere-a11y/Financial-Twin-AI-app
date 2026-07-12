export const chartTheme = {
  current: "hsl(var(--chart-1))",
  after: "hsl(var(--chart-2))",
  comparison: "hsl(var(--chart-3))",
  grid: "hsl(var(--border))",
  axis: "hsl(var(--muted-foreground))",
  tooltipBackground: "hsl(var(--popover))",
  tooltipForeground: "hsl(var(--popover-foreground))",
  tooltipBorder: "hsl(var(--border))"
} as const;

export const chartTooltipStyle = {
  background: chartTheme.tooltipBackground,
  border: `1px solid ${chartTheme.tooltipBorder}`,
  borderRadius: 12,
  color: chartTheme.tooltipForeground,
  boxShadow: "0 18px 48px hsl(var(--foreground) / 0.12)"
} as const;
