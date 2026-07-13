import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const shell = readFileSync("components/layout/app-shell.tsx", "utf8");
const dashboard = readFileSync("components/dashboard/dashboard-client.tsx", "utf8");
const metricCard = readFileSync("components/data/metric-card.tsx", "utf8");
const identityHeader = dashboard.slice(
  dashboard.indexOf("function IdentityHeader"),
  dashboard.indexOf("function ScenarioTile")
);

describe("dashboard motion and layout", () => {
  it("makes shell and identity metric boundaries shrink-safe", () => {
    expect(shell).toContain("min-w-0");
    expect(shell).toContain("break-words");
    expect(identityHeader.match(/min-w-0/g)?.length ?? 0).toBeGreaterThanOrEqual(6);
    expect(shell).toContain("h-full min-w-0");
  });

  it("keeps two metric columns at intermediate widths and waits until 2xl for four", () => {
    expect(identityHeader).toContain("grid-cols-2");
    expect(identityHeader).toContain("2xl:grid-cols-[repeat(4,minmax(0,1fr))]");
    expect(identityHeader).not.toContain("md:grid-cols-4");
  });

  it("supports animated numeric mini metrics while preserving string values and suffix space", () => {
    expect(shell).toContain("numericValue?: number");
    expect(shell).toContain("format?: (value: number) => string");
    expect(shell).toContain("suffix?: string");
    expect(shell).toContain("<AnimatedNumber");
    expect(shell).toContain("shrink-0 whitespace-nowrap");
    expect(shell).toMatch(/<AnimatedNumber[\s\S]*?wrap[\s\S]*?className="min-w-0 max-w-full"/);
    const miniMetric = shell.slice(shell.indexOf("export function MiniMetric"), shell.indexOf("export function AppPageHeader"));
    expect(miniMetric.match(/\{suffix\}/g)).toHaveLength(1);
    expect(miniMetric).not.toMatch(/<AnimatedNumber[^>]*suffix=/);
    expect(identityHeader).toMatch(
      /label="Obligations"[\s\S]*?numericValue=\{overview\.flow\.monthlyDebtPayment\}[\s\S]*?suffix="\/mo"/
    );
  });

  it("animates prominent metrics and quick decisions without scaling dense metric cards", () => {
    expect(metricCard).toContain("AnimatedNumber");
    expect(metricCard).toContain("MotionCard");
    expect(metricCard).toContain("interactive={false}");
    expect(metricCard).toMatch(/<AnimatedNumber[\s\S]*?wrap[\s\S]*?className="min-w-0 max-w-full text-xl sm:text-2xl"/);
    expect(dashboard).toContain("<Stagger");
    expect(dashboard).toContain("<StaggerItem");
    expect(dashboard).toContain("<Reveal");
  });

  it("makes every Recharts series reduced-motion aware with one short duration", () => {
    expect(dashboard).toContain("isAnimationActive={!reduceMotion}");
    expect(dashboard).toContain("const chartAnimationDuration = 420");
    expect(dashboard.match(/isAnimationActive=\{!reduceMotion\}/g)).toHaveLength(4);
    expect(dashboard.match(/animationDuration=\{chartAnimationDuration\}/g)).toHaveLength(4);
    expect(dashboard).toContain("summary={overview.cashFlowSummary}");
    expect(dashboard).toContain("summary={flowSummary}");
  });
});
