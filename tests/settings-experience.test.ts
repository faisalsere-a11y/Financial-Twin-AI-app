import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("settings experience", () => {
  const source = readFileSync("components/settings/settings-page.tsx", "utf8");

  it("uses durable account-scoped profile and theme state", () => {
    expect(source).toContain("useFinancialProfile");
    expect(source).not.toContain("useAppPreferences");
    expect(source).toContain('id="profile-name"');
    expect(source).toContain('htmlFor="profile-name"');
    expect(source).toContain('id="theme"');
    expect(source).toContain('value="system"');
    expect(source).toContain('value="light"');
    expect(source).toContain('value="dark"');
  });

  it("provides accessible feedback without inert preference controls", () => {
    expect(source).not.toContain('id="notifications"');
    expect(source).not.toContain("exportReauthentication");
    expect(source).not.toContain("regionalMode");
    expect(source).toContain('htmlFor="theme"');
    expect(source).toContain('aria-live="polite"');
    expect(source).toContain('role={status.kind === "error" ? "alert" : "status"}');
  });

  it("states the real data boundary and removes fake success framing", () => {
    expect(source).toContain("Saved in this browser");
    expect(source).toContain("Restore bundled defaults");
    expect(source).toContain("No bank connection");
    expect(source).not.toContain("toast.success");
    expect(source).not.toContain("Demo Security Notes");
    expect(source).not.toContain("hackathon demo");
    expect(source).not.toContain("mocked AI");
  });
});
