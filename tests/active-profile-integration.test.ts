import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(path, "utf8");

describe("active financial profile integration", () => {
  const clientFiles = [
    "components/layout/app-shell.tsx",
    "components/dashboard/dashboard-client.tsx",
    "components/simulations/simulation-center.tsx",
    "components/goals/goals-page.tsx",
    "components/reports/reports-page.tsx"
  ];

  it("uses the active-profile hook across every financial client route", () => {
    for (const path of clientFiles) {
      expect(read(path), path).toContain("useFinancialProfile");
    }
  });

  it("removes direct sample-profile calculations from authenticated clients", () => {
    for (const path of clientFiles.slice(1)) {
      expect(read(path), path).not.toContain("sampleProfile");
    }
    const shell = read(clientFiles[0]);
    expect(shell).not.toContain("98.7% complete");
    expect(shell).not.toContain("Private preview");
    expect(shell).not.toContain("Â");
  });

  it("sends the validated active profile through server simulations", () => {
    const client = read("components/simulations/simulation-center.tsx");
    const route = read("app/api/simulations/route.ts");

    expect(client).toContain("JSON.stringify({ scenario, profile })");
    expect(route).toContain("financialProfileSchema");
    expect(route).toContain("body.profile");
    expect(route).toContain("body.scenario ?? body");
  });
});
