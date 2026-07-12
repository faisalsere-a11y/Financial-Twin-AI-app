import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("settings experience", () => {
  const source = readFileSync("components/settings/settings-page.tsx", "utf8");

  it("uses durable profile, preferences, and theme state", () => {
    expect(source).toContain("useFinancialProfile");
    expect(source).toContain("useAppPreferences");
    expect(source).toContain('id="profile-name"');
    expect(source).toContain('htmlFor="profile-name"');
    expect(source).toContain('id="theme"');
    expect(source).toContain('value="system"');
    expect(source).toContain('value="light"');
    expect(source).toContain('value="dark"');
  });

  it("provides stable accessible preference controls", () => {
    expect(source).toContain('id="notifications"');
    expect(source).toContain('aria-labelledby="notifications-title"');
    expect(source).toContain("checked={draftPreferences.notifications}");
    expect(source).toContain("checked={draftPreferences.exportReauthentication}");
    expect(source).toContain("checked={draftPreferences.regionalMode}");
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
