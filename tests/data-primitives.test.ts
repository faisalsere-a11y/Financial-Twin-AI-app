import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("financial data primitives", () => {
  it("provides an accessible chart frame", () => {
    const path = "components/data/chart-frame.tsx";
    expect(existsSync(path)).toBe(true);
    if (!existsSync(path)) return;

    const source = readFileSync(path, "utf8");
    expect(source).toContain("<figure");
    expect(source).toContain("<figcaption");
    expect(source).toContain("aria-describedby");
    expect(source).toContain("sr-only");
  });

  it("renders financial values with every semantic tone", () => {
    const path = "components/data/metric-card.tsx";
    expect(existsSync(path)).toBe(true);
    if (!existsSync(path)) return;

    const source = readFileSync(path, "utf8");
    expect(source).toContain("tabular-nums");
    expect(source).toContain('positive:');
    expect(source).toContain('caution:');
    expect(source).toContain('danger:');
  });

  it("uses theme-safe chart colors", () => {
    const path = "lib/presentation/chart-theme.ts";
    expect(existsSync(path)).toBe(true);
    if (!existsSync(path)) return;

    const source = readFileSync(path, "utf8");
    expect(source).toContain('hsl(var(--chart-1))');
    expect(source).toContain('hsl(var(--chart-2))');
    expect(source).toContain('hsl(var(--border))');
    expect(source).toContain('hsl(var(--popover))');
  });

  it("migrates the dashboard to shared presentation contracts", () => {
    const source = readFileSync("components/dashboard/dashboard-client.tsx", "utf8");

    expect(source).toContain("buildFinancialOverview");
    expect(source).toContain('from "@/components/data/metric-card"');
    expect(source).toContain('from "@/components/data/chart-frame"');
    expect(source).toContain('from "@/lib/presentation/chart-theme"');
    expect(source).not.toContain("function MetricCard(");
    expect(source).toContain("<ChartFrame");
    expect(source).toContain("overview.cashFlow");
    expect(source).not.toContain("#0d1423");
    expect(source).not.toContain("rgba(255,255,255");
  });
});
