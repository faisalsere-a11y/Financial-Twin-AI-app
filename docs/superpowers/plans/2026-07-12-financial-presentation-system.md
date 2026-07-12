# Financial Presentation System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create one tested presentation contract for financial overview data and reusable accessible visualization primitives, then migrate the dashboard's identity, metrics, and cash-flow timeline without changing domain calculations or scenario behavior.

**Architecture:** Pure adapters in `lib/presentation` transform existing `FinancialTwinResult` and `ScenarioComparison` values into stable view models containing raw values, formatted copy, tones, chart series, and text summaries. Reusable data components render those view models, while Recharts remains responsible only for the visual layer. The financial engine remains untouched and authoritative.

**Tech Stack:** TypeScript, React 19, Next.js 15, Tailwind CSS, Recharts, Vitest.

## Global Constraints

- Do not modify `lib/financial/engine.ts`, `lib/financial/risk.ts`, or their existing tests.
- Preserve every dashboard scenario selection, reset action, chart, recommendation, goal, and recent-activity behavior.
- Keep SAR formatting and the Saudi sample profile.
- Every chart must have a visible title, concise description, and screen-reader summary independent of SVG output.
- All colors use semantic theme variables; no dark-only chart tooltip or grid color literals.
- Add no dependency.
- Use red-green-refactor and keep all existing checks green.

---

### Task 1: Financial overview view model

**Files:**
- Create: `lib/presentation/financial-overview.ts`
- Create: `tests/financial-overview.test.ts`

**Interfaces:**
- Consumes: `FinancialProfile`, `ScenarioInput`, `calculateFinancialTwin`, `compareScenario`, and formatting helpers.
- Produces: `buildFinancialOverview(profile, scenario): FinancialOverviewViewModel`.

- [x] **Step 1: Write the failing adapter tests**

```ts
import { describe, expect, it } from "vitest";
import { calculateFinancialTwin, compareScenario } from "../lib/financial/engine";
import { sampleProfile, sampleScenario } from "../lib/financial/sample-data";
import { formatCurrency } from "../lib/utils";
import { buildFinancialOverview } from "../lib/presentation/financial-overview";

describe("financial overview presentation", () => {
  it("maps authoritative twin metrics without recalculating them", () => {
    const twin = calculateFinancialTwin(sampleProfile);
    const view = buildFinancialOverview(sampleProfile, sampleScenario);

    expect(view.profile).toEqual({ name: sampleProfile.name, initials: sampleProfile.initials, currency: "SAR" });
    expect(view.metrics.map((metric) => metric.id)).toEqual([
      "net-worth",
      "monthly-surplus",
      "emergency-runway",
      "health-score"
    ]);
    expect(view.metrics[0]?.value).toBe(formatCurrency(twin.netWorth));
    expect(view.metrics[1]?.rawValue).toBe(twin.monthlySurplus);
  });

  it("builds current and after series plus an equivalent text summary", () => {
    const comparison = compareScenario(sampleProfile, sampleScenario);
    const view = buildFinancialOverview(sampleProfile, sampleScenario);

    expect(view.cashFlow).toHaveLength(12);
    expect(view.cashFlow[0]).toEqual({
      month: comparison.current.timeline[0]?.month,
      current: comparison.current.timeline[0]?.cashFlow,
      after: comparison.after.timeline[0]?.cashFlow
    });
    expect(view.cashFlowSummary).toContain(formatCurrency(comparison.current.timeline.at(-1)?.cashFlow ?? 0));
    expect(view.cashFlowSummary).toContain(formatCurrency(comparison.after.timeline.at(-1)?.cashFlow ?? 0));
  });
});
```

- [x] **Step 2: Run and verify RED**

Run `.\node_modules\.bin\vitest.cmd run tests\financial-overview.test.ts`.

Expected: FAIL because the presentation module does not exist.

- [x] **Step 3: Implement the adapter**

Create explicit `MetricTone`, `MetricViewModel`, `CashFlowPointViewModel`, and `FinancialOverviewViewModel` types. `buildFinancialOverview()` calls the two domain functions once, formats values through `formatCurrency`/`formatPercent`, and returns:

```ts
{
  profile: { name, initials, currency },
  health: { score, band, riskLevel, riskScore },
  metrics: [
    { id: "net-worth", label: "Net worth", rawValue: twin.netWorth, value: formatCurrency(twin.netWorth), detail: "Assets minus outstanding debt", tone: "positive" },
    { id: "monthly-surplus", label: "Monthly surplus", rawValue: twin.monthlySurplus, value: formatCurrency(twin.monthlySurplus), detail: `${formatPercent(twin.savingsRate)} savings rate`, tone: twin.monthlySurplus >= 0 ? "positive" : "danger" },
    { id: "emergency-runway", label: "Emergency runway", rawValue: twin.emergencyFundMonths, value: `${twin.emergencyFundMonths.toFixed(1)} months`, detail: "Cash divided by monthly outflow", tone: twin.emergencyFundMonths >= 6 ? "positive" : twin.emergencyFundMonths >= 3 ? "caution" : "danger" },
    { id: "health-score", label: "Financial health", rawValue: twin.financialHealth.score, value: `${twin.financialHealth.score}/100`, detail: twin.financialHealth.band, tone: twin.financialHealth.score >= 80 ? "positive" : twin.financialHealth.score >= 60 ? "caution" : "danger" }
  ],
  cashFlow: comparison.current.timeline.map((point, index) => ({
    month: point.month,
    current: point.cashFlow,
    after: comparison.after.timeline[index]?.cashFlow ?? point.cashFlow
  })),
  cashFlowSummary,
  decision: { name: scenario.name, monthlySurplusDelta: comparison.delta.monthlySurplus, healthDelta: comparison.delta.healthScore }
}
```

- [x] **Step 4: Run focused and full tests**

Expected: the focused tests and all prior tests pass.

- [x] **Step 5: Commit**

```powershell
git add lib/presentation/financial-overview.ts tests/financial-overview.test.ts
git commit -m "feat: add financial overview presentation model"
```

### Task 2: Accessible data primitives

**Files:**
- Create: `components/data/chart-frame.tsx`
- Create: `components/data/metric-card.tsx`
- Create: `lib/presentation/chart-theme.ts`
- Create: `tests/data-primitives.test.ts`

**Interfaces:**
- `ChartFrame({ title, description, summary, children, action? })` renders a semantic figure.
- `MetricCard({ metric })` consumes `MetricViewModel`.
- `chartTheme` exposes CSS-variable-safe series, grid, axis, and tooltip colors.

- [x] **Step 1: Write failing contract tests**

Read the planned source files with `readFileSync` and assert that `ChartFrame` contains `<figure>`, `<figcaption>`, `aria-describedby`, and an `sr-only` summary; `MetricCard` contains `tabular-nums` and maps all three metric tones; and `chartTheme` uses `hsl(var(--chart-1))`, `hsl(var(--chart-2))`, `hsl(var(--border))`, and `hsl(var(--popover))`.

- [x] **Step 2: Run and verify RED**

Expected: FAIL because the three modules do not exist.

- [x] **Step 3: Implement `chartTheme`**

```ts
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
```

- [x] **Step 4: Implement the components**

`ChartFrame` uses `useId()` to connect its title, description, and summary. `MetricCard` uses semantic `positive`, `caution`, and `destructive` classes, renders the raw value through the formatted view-model value, and keeps the detail visible.

- [x] **Step 5: Run tests, lint, and commit**

```powershell
git add components/data lib/presentation/chart-theme.ts tests/data-primitives.test.ts
git commit -m "feat: add accessible financial data primitives"
```

### Task 3: Migrate dashboard overview and cash-flow chart

**Files:**
- Modify: `components/dashboard/dashboard-client.tsx`
- Modify: `tests/data-primitives.test.ts`

**Interfaces:**
- Consumes: `buildFinancialOverview`, `MetricCard`, `ChartFrame`, and `chartTheme`.
- Preserves: `DashboardClient` export and all existing scenario selection behavior.

- [x] **Step 1: Add a failing migration guard**

Assert that `dashboard-client.tsx` imports all four shared contracts, no longer declares a local `MetricCard`, wraps the cash-flow chart with `ChartFrame`, uses `overview.cashFlow`, and contains no `#0d1423` or `rgba(255,255,255` chart literals.

- [x] **Step 2: Run and verify RED**

Expected: FAIL because the dashboard still owns local metric and chart presentation.

- [x] **Step 3: Migrate the identity and metric layer**

Build `overview` once in `DashboardClient` from the selected scenario. Pass it into `IdentityHeader`, render its four metrics through the shared `MetricCard`, and retain the existing reset toast and scenario tiles.

- [x] **Step 4: Migrate the cash-flow chart**

Pass `overview.cashFlow` to Recharts inside `ChartFrame`. Use `chartTheme.current`, `chartTheme.after`, `chartTheme.grid`, and `chartTheme.axis`; use a semantic tooltip style object; and supply `overview.cashFlowSummary`. Preserve current/after legends and selected-scenario updates.

- [x] **Step 5: Run full verification and commit**

Run Vitest, ESLint, TypeScript, and Next production build. Expected: all checks pass and all 18 routes remain present.

```powershell
git add components/dashboard/dashboard-client.tsx tests/data-primitives.test.ts
git commit -m "refactor: migrate dashboard to presentation system"
```

### Task 4: Milestone audit

**Files:**
- Modify: `docs/superpowers/plans/2026-07-12-financial-presentation-system.md`

- [x] **Step 1: Re-run the full automated gate**

Run Vitest, ESLint, TypeScript, and Next production build from a clean worktree.

- [x] **Step 2: Verify domain preservation and scope**

Confirm `git diff c6b7fb3..HEAD -- lib/financial/engine.ts lib/financial/risk.ts tests/financial-engine.test.ts tests/investment-engine.test.ts` is empty and inspect `git status --short` plus `git diff --stat`.

- [x] **Step 3: Update checkboxes and commit evidence**

```powershell
git add docs/superpowers/plans/2026-07-12-financial-presentation-system.md
git commit -m "docs: record financial presentation verification"
```

This milestone does not complete the overall product goal. Landing, auth, onboarding, NOVA trust states, decisions, portfolio, goals, reports, settings, responsive browser QA, and Lighthouse remain subsequent verified slices.
