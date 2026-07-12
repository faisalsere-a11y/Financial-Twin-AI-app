import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("onboarding experience", () => {
  const source = readFileSync("components/onboarding/onboarding-wizard.tsx", "utf8");

  it("uses the active profile and financial engine for review", () => {
    expect(source).toContain("useFinancialProfile");
    expect(source).toContain("onboardingToFinancialProfile");
    expect(source).toContain("profileToOnboardingValues");
    expect(source).toContain("calculateFinancialTwin");
    expect(source).toContain("Review your model");
  });

  it("connects step, field, error, and outcome semantics", () => {
    expect(source).toContain('aria-current={index === step ? "step" : undefined}');
    expect(source).toContain('htmlFor="age"');
    expect(source).toContain('id="age"');
    expect(source).toContain('id="age-error"');
    expect(source).toContain("aria-describedby");
    expect(source).toContain('role="alert"');
    expect(source).toContain('aria-live="polite"');
  });

  it("saves honestly and completes the workflow", () => {
    expect(source).toContain("Saved in this browser");
    expect(source).toContain("Save and open dashboard");
    expect(source).toContain('router.push("/dashboard")');
    expect(source).not.toContain("toast.success");
    expect(source).not.toContain("saved for this demo");
  });
});
