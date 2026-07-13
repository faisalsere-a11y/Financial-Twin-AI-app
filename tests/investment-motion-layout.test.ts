import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const simulator = readFileSync("components/investments/investment-simulator.tsx", "utf8");
const chartFrame = readFileSync("components/data/chart-frame.tsx", "utf8");
const compactSimulator = simulator.replace(/\s+/g, " ");

describe("portfolio motion layout", () => {
  it("stacks until the expanded app shell can safely fit the 22rem input column", () => {
    expect(simulator).toContain("2xl:grid-cols-[22rem_minmax(0,1fr)]");
    expect(simulator).toContain("2xl:sticky 2xl:top-24");
    expect(simulator).not.toContain("xl:grid-cols-[22rem_1fr]");
    expect(simulator).toContain("grid-cols-[repeat(auto-fit,minmax(min(100%,14rem),1fr))]");
  });

  it("keeps equal-height summary cards and animated currency values wrap-safe", () => {
    expect(simulator).toContain("<Stagger");
    expect(simulator).toContain("<StaggerItem");
    expect(simulator).toContain("<MotionCard interactive={false}");
    expect(simulator).toContain("items-stretch");
    expect(simulator).toMatch(
      /<StaggerItem[\s\S]*?className="h-full min-w-0"[\s\S]*?<MotionCard interactive=\{false\}[\s\S]*?className="h-full min-w-0"/
    );
    expect(simulator).toMatch(
      /<AnimatedNumber[\s\S]*?value=\{metric\.value\}[\s\S]*?wrap[\s\S]*?className="min-w-0 max-w-full/
    );
  });

  it("makes the simulator, content, chart frame, and chart canvases shrink-safe", () => {
    expect(simulator).toContain('className="mx-auto min-w-0 max-w-[1320px]"');
    expect(simulator).toContain('className="grid min-w-0 gap-6"');
    expect(chartFrame).toContain("min-w-0 overflow-hidden rounded-2xl");
    expect(chartFrame).toContain('className="min-w-0 overflow-hidden p-5"');
    expect(simulator.match(/className="h-80 min-w-0 overflow-hidden"/g)).toHaveLength(2);
    expect(simulator.match(/<ResponsiveContainer width="100%" height="100%" minWidth=\{0\}>/g)).toHaveLength(2);
  });

  it("uses fixed chart space, authoritative text summaries, and reduced-motion-aware series", () => {
    expect(simulator).toContain("const chartAnimationDuration = 420");
    expect(simulator).toContain("const reduceMotion = useReducedMotion() === true");
    expect(simulator.match(/isAnimationActive=\{!reduceMotion\}/g)).toHaveLength(6);
    expect(simulator.match(/animationDuration=\{chartAnimationDuration\}/g)).toHaveLength(6);
    expect(simulator).toContain("summary={projectionSummary}");
    expect(simulator).toContain("summary={rangeSummary}");
    expect(simulator.match(/className="h-80 /g)).toHaveLength(2);
  });

  it("animates preset and result presentation with approved primitives", () => {
    expect(simulator).toContain("<Reveal key={asset}");
    expect(simulator).toContain("<AnimatedNumber");
    expect(simulator).toContain("<Reveal className=\"min-w-0\"");
    expect(simulator).toContain("<Stagger");
    expect(simulator).toContain("<MotionCard");
  });

  it("reserves the maximum intrinsic preset height in one shared grid cell", () => {
    expect(simulator).toContain("function PresetSummary");
    expect(simulator).toContain("Object.entries(presets).map");
    expect(simulator).toContain('className="grid min-w-0 grid-cols-1"');
    expect(simulator).toMatch(
      /aria-hidden="true"[\s\S]*?className="invisible pointer-events-none col-start-1 row-start-1 min-w-0"[\s\S]*?<PresetSummary/
    );
    expect(simulator).toMatch(
      /<Reveal key=\{asset\} className="col-start-1 row-start-1 h-full min-w-0"[\s\S]*?<PresetSummary[\s\S]*?className="h-full"/
    );
    expect(simulator).not.toContain("min-h-52");
  });

  it("preserves deterministic inputs and active-account revision boundaries", () => {
    expect(compactSimulator).toContain(
      "runInvestmentProjection({ ...inputs, annualReturn: preset.return, volatility: preset.volatility })"
    );
    expect(compactSimulator).toContain(
      "runMonteCarlo({ ...inputs, annualReturn: preset.return, volatility: preset.volatility, iterations: 400, seed: 1337 })"
    );
    expect(simulator.match(/\[inputs, preset\.return, preset\.volatility\]/g)).toHaveLength(2);
    expect(simulator).toContain('const profileKey = `${subject}:${savedAt ?? "sample"}`');
    expect(simulator).toContain("<SubjectInvestmentSimulator key={profileKey}");
    expect(simulator).toContain("hydratedSubject.current === subject");
    expect(simulator).toContain('form.reset(defaultsForProfile(profile))');
    expect(simulator).toContain('setAsset("ETF")');
  });

  it("preserves validated scenario controls and accessible summaries", () => {
    expect(simulator).toContain("resolver: zodResolver(inputSchema)");
    expect(simulator).toContain('form.register("initialAmount", { valueAsNumber: true })');
    expect(simulator).toContain('form.register("monthlyContribution", { valueAsNumber: true })');
    expect(simulator).toContain('form.register("years", { valueAsNumber: true })');
    expect(simulator).toContain("Object.keys(presets)");
    expect(simulator).toContain('aria-live="polite"');
    expect(simulator).toContain('aria-hidden="true"');
    expect(chartFrame).toContain("aria-labelledby={titleId}");
    expect(chartFrame).toContain('className="sr-only"');
  });
});
