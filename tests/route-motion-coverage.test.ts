import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const routePaths = [
  "components/auth/auth-card.tsx",
  "components/onboarding/onboarding-wizard.tsx",
  "components/simulations/simulation-center.tsx",
  "components/reports/reports-page.tsx",
  "components/settings/settings-page.tsx",
] as const;

const sourceFor = (path: string) => readFileSync(path, "utf8");

function selfClosingElements(source: string, element: string) {
  return source.match(new RegExp(`<${element}\\b[\\s\\S]*?\\/>`, "g")) ?? [];
}

describe("route motion coverage", () => {
  for (const path of routePaths) {
    it(`${path} uses exactly one shared local stagger group`, () => {
      const source = sourceFor(path);

      expect(source.match(/<Stagger(?:\s|>)/g) ?? []).toHaveLength(1);
      expect(source).toContain("<StaggerItem");
      expect(source).toContain('from "@/components/motion/reveal"');
      expect(source).not.toContain("setInterval(");
      expect(source).not.toContain("@keyframes");
    });
  }

  it("gives auth a shared page entrance outside the app template", () => {
    const source = sourceFor("components/auth/auth-card.tsx");

    expect(source).toContain('import { PageTransition } from "@/components/motion/page-transition";');
    expect(source).toMatch(/<PageTransition>\s*<main/);
    expect(source).toMatch(/<\/main>\s*<\/PageTransition>/);
    expect(source).not.toMatch(/<Reveal[^>]*>\s*<section/);
  });

  for (const [path, stateKey] of [
    ["components/onboarding/onboarding-wizard.tsx", "onboardingSteps[step]?.id ?? step"],
    ["components/simulations/simulation-center.tsx", "result-${result.comparison.scenario.id}"],
    ["components/reports/reports-page.tsx", "key={selectedReport}"],
    ["components/settings/settings-page.tsx", "role={status.kind"],
  ] as const) {
    it(`${path} uses shared reduced-motion presence for route state`, () => {
      const source = sourceFor(path);

      expect(source).toContain("AnimatePresence");
      expect(source).toContain("useReducedMotion");
      expect(source).toContain("revealVariants");
      expect(source).toContain("motionTokens.standard");
      expect(source).toContain(stateKey);
      expect(source).not.toMatch(/(?:initial|animate|exit)=\{\{[^}]*\b(?:height|width):/);
    });
  }

  for (const path of [
    "components/simulations/simulation-center.tsx",
    "components/reports/reports-page.tsx",
  ]) {
    it(`${path} leaves Recharts geometry static`, () => {
      const areas = selfClosingElements(sourceFor(path), "Area");

      expect(areas).toHaveLength(2);
      for (const area of areas) {
        expect(area).toContain("isAnimationActive={false}");
        expect(area).not.toContain("animationDuration");
      }
    });
  }

  it("scopes print motion resets to marked report wrappers", () => {
    const source = sourceFor("app/globals.css");
    const printRules = source.slice(source.indexOf("@media print"));

    expect(printRules).toMatch(
      /\.report-print-root \.report-motion-surface\s*\{[^}]*opacity: 1 !important;[^}]*transform: none !important;[^}]*\}/
    );
    expect(printRules).not.toMatch(
      /\.report-print-root \*(?:,|\s)*[^{}]*\{[^}]*(?:opacity: 1|transform: none) !important;/
    );
  });
});
