import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("route motion coverage", () => {
  for (const path of [
    "components/auth/auth-card.tsx",
    "components/onboarding/onboarding-wizard.tsx",
    "components/simulations/simulation-center.tsx",
    "components/reports/reports-page.tsx",
    "components/settings/settings-page.tsx",
  ]) {
    it(`${path} uses shared motion instead of ad-hoc keyframes`, () => {
      const source = readFileSync(path, "utf8");
      expect(source).toMatch(/Reveal|Stagger|MotionCard|AnimatePresence/);
      expect(source).not.toContain("setInterval(");
    });
  }

  it("keeps report content visible when motion wrappers are printed", () => {
    const source = readFileSync("app/globals.css", "utf8");
    const printRules = source.slice(source.indexOf("@media print"));

    expect(printRules).toContain("opacity: 1 !important");
    expect(printRules).toContain("transform: none !important");
  });
});
