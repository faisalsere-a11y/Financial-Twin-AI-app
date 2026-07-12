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
    expect(layout).toContain('process.env.GITHUB_PAGES !== "true"');
    expect(layout).toContain("await auth()");
    expect(layout).toContain('redirect("/login")');
  });

  it("authenticates and rate limits the paid simulation endpoint", () => {
    const route = source("app/api/simulations/route.ts");
    expect(route).toContain("await auth()");
    expect(route).toContain("status: 401");
    expect(route).toContain("status: 429");
    expect(route).toContain('"Retry-After"');
    expect(source("lib/ai/advisor.ts")).toContain("timeout:");
  });

  it("does not report an in-memory registration as durable", () => {
    const store = source("lib/sqlite-auth-store.ts");
    const route = source("app/api/auth/register/route.ts");
    expect(store).toContain('reason: "unavailable"');
    expect(route).toContain("status: 503");
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
