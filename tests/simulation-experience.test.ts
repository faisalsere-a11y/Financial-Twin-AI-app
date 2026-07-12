import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("decision lab experience", () => {
  const source = readFileSync("components/simulations/simulation-center.tsx", "utf8");

  it("honors scenario deep links and exposes library and custom modes", () => {
    expect(source).toContain("new URLSearchParams(window.location.search)");
    expect(source).toContain('.get("scenario")');
    expect(source).toContain('role="radiogroup"');
    expect(source).toContain('role="radio"');
    expect(source).toContain('aria-checked={selectedScenario.id === scenario.id}');
    expect(source).toContain("Custom car builder");
  });

  it("connects labeled fields, errors, and async outcomes", () => {
    expect(source).toContain('htmlFor="price"');
    expect(source).toContain('id="price"');
    expect(source).toContain("aria-describedby");
    expect(source).toContain('role="alert"');
    expect(source).toContain('aria-live="polite"');
    expect(source).toContain("mutation.reset()");
    expect(source).toContain("Retry analysis");
    expect(source).not.toContain("toast.");
  });

  it("renders structured NOVA evidence and accessible charts", () => {
    expect(source).toContain("buildNovaDecisionView");
    expect(source).toContain("Recommendation");
    expect(source).toContain("Engine evidence");
    expect(source).toContain("Model confidence");
    expect(source).toContain("Assumptions and limits");
    expect(source).toContain("ChartFrame");
    expect(source).toContain("chartTheme.current");
    expect(source).toContain("chartTheme.after");
    expect(source).not.toContain("Scenario added to favorites");
    expect(source).not.toContain('stroke="#');
    expect(source).not.toContain('background: "#');
  });
});
