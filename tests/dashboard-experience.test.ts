import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const source = fs.readFileSync(
  path.join(process.cwd(), "components/dashboard/dashboard-client.tsx"),
  "utf8"
);

describe("dashboard decision cockpit", () => {
  it("uses active-profile identity and accessible, resettable scenario selection", () => {
    expect(source).toContain("source={source}");
    expect(source).toContain("overview.profile.currency");
    expect(source).toContain('aria-pressed={selected}');
    expect(source).toContain('role="status"');
    expect(source).toContain('aria-live="polite"');
    expect(source).toContain("Reset selection");
    expect(source).not.toContain("Undo Simulation");
    expect(source).not.toContain("toast.");
    expect(source).not.toContain('from "sonner"');
  });

  it("replaces invented projections and activity with engine evidence and honest navigation", () => {
    expect(source).toContain("comparison.current.timeline.at(-1)");
    expect(source).toContain("comparison.after.timeline.at(-1)");
    expect(source).toContain("profile.debts.reduce");
    expect(source).toContain('href="/simulations"');
    expect(source).toContain('href="/goals"');
    expect(source).toContain("Simulation history is not stored");
    expect(source).not.toContain("activityFeed");
    expect(source).not.toContain("value: 42");
    expect(source).not.toContain("value: 61");
    expect(source).not.toContain("Recent Simulations");
  });

  it("presents structured deterministic NOVA evidence and accessible semantic charts", () => {
    expect(source).toContain("buildNovaDecisionView");
    expect(source).toContain("decision.provenance.label");
    expect(source).toContain("decision.confidence");
    expect(source).toContain("decision.boundary");
    expect(source).toContain("ChartFrame");
    expect(source).toContain('aria-hidden="true"');
    expect(source).toContain('role="progressbar"');
    expect(source).not.toContain("border-white");
    expect(source).not.toContain("bg-white");
    expect(source).not.toContain("text-blue-300");
  });
});
