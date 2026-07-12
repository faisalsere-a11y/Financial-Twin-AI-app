import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { checkSimulationRateLimit } from "../lib/server/simulation-rate-limit";

function source(path: string) {
  return readFileSync(path, "utf8");
}

describe("launch hardening contracts", () => {
  it("counts simulation limits independently per account", () => {
    const now = 1_700_000_000_000;
    expect(checkSimulationRateLimit("rate-user-a", 2, now)).toBeNull();
    expect(checkSimulationRateLimit("rate-user-a", 2, now)).toBeNull();
    expect(checkSimulationRateLimit("rate-user-a", 2, now)).toBe(60);
    expect(checkSimulationRateLimit("rate-user-b", 2, now)).toBeNull();
    expect(checkSimulationRateLimit("rate-user-a", 2, now + 60_000)).toBeNull();
  });

  it("guards the server app shell but preserves the explicit static sample", () => {
    const layout = source("app/(app)/layout.tsx");
    const providers = source("app/providers.tsx");
    expect(layout).toContain('process.env.GITHUB_PAGES !== "true"');
    expect(layout).toContain("await auth()");
    expect(layout).toContain('redirect("/login")');
    expect(providers).toContain('process.env.NEXT_PUBLIC_GITHUB_PAGES === "true" ? null : undefined');
  });

  it("authenticates and rate limits the paid simulation endpoint", () => {
    const route = source("app/api/simulations/route.ts");
    expect(route).toContain("await auth()");
    expect(route).toContain("status: 401");
    expect(route).toContain("status: 429");
    expect(route).toContain('"Retry-After"');
    expect(source("lib/ai/advisor.ts")).toContain("timeout,");
  });

  it("does not report an in-memory registration as durable", () => {
    const store = source("lib/sqlite-auth-store.ts");
    const route = source("app/api/auth/register/route.ts");
    expect(store).toContain('reason: "unavailable"');
    expect(route).toContain("status: 503");
    expect(route).toContain('error: "Invalid registration request."');
  });

  it("gives the external advisor the active profile currency", () => {
    const advisor = source("lib/ai/advisor.ts");
    expect(advisor).toContain("currency: comparison.current.profile.currency");
    expect(advisor).toContain("provided profile currency");
  });

  it("rehydrates every profile-backed form when the session subject changes", () => {
    for (const path of [
      "components/settings/settings-page.tsx",
      "components/onboarding/onboarding-wizard.tsx",
      "components/investments/investment-simulator.tsx"
    ]) {
      const form = source(path);
      expect(form).toContain("hydratedSubject");
      expect(form).toContain("hydratedSubject.current === subject");
      expect(form).toContain("key={profileKey}");
      expect(form).toContain('const profileKey = `${subject}:${savedAt ?? "sample"}`');
      expect(form).toContain("if (!subject || !isLoaded)");
      expect(form).toContain("activeProfile={activeProfile}");
    }
    const simulation = source("components/simulations/simulation-center.tsx");
    expect(simulation).toContain("activeSubjectRef");
    expect(simulation).toContain("request.subject !== activeSubjectRef.current");
    expect(simulation).toContain("activeRequestRef.current?.abort()");
    expect(simulation).toContain("requestGenerationRef");
    expect(simulation).toContain("cancelActiveAnalysis");
    expect(simulation).toContain("activeProfile={activeProfile}");
    expect(simulation).toContain("key={profileKey}");
    const settings = source("components/settings/settings-page.tsx");
    expect(settings).toContain("status={status}");
    expect(settings).toContain("setStatus={setStatus}");
  });

  it("keeps the paid advisor disabled by default and bounds single-process limiter state", () => {
    expect(source("lib/ai/advisor.ts")).toContain('process.env.AI_ADVISOR_ENABLED !== "true"');
    const limiter = source("lib/server/simulation-rate-limit.ts");
    expect(limiter).toContain("MAX_TRACKED_SUBJECTS");
    expect(limiter).toContain("requestWindows.delete");
    expect(source(".env.example")).toContain('AI_ADVISOR_ENABLED="false"');
  });

  it("honors reduced motion and makes modal backgrounds inert", () => {
    expect(source("components/dashboard/dashboard-client.tsx")).toContain("useReducedMotion");
    expect(source("app/providers.tsx")).toContain("inert=");
    expect(source("components/layout/app-shell.tsx")).toContain("inert=");
  });

  it("keeps settings promises and supporting visuals honest", () => {
    const settings = source("components/settings/settings-page.tsx");
    expect(settings).not.toContain("Export re-authentication");
    expect(settings).not.toContain("Notification controls");
    expect(source("app/(app)/error.tsx")).not.toContain("recovered safely");
    expect(source("components/investments/investment-simulator.tsx")).toContain('aria-hidden="true"');
  });
});
