import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";

const modulePath = "lib/auth/presentation.ts";

describe("auth presentation", () => {
  it("starts every mode without exposed credentials", async () => {
    expect(existsSync(modulePath)).toBe(true);
    if (!existsSync(modulePath)) return;
    const { getAuthDefaults, sampleCredentials } = await import("../lib/auth/presentation");

    expect(getAuthDefaults("login")).toEqual({ name: "", email: "", password: "" });
    expect(getAuthDefaults("signup")).toEqual({ name: "", email: "", password: "" });
    expect(getAuthDefaults("forgot")).toEqual({ name: "", email: "", password: "" });
    expect(sampleCredentials).toEqual({ email: "ahmed@example.com", password: "password123" });
  });

  it("uses mode-specific destinations", async () => {
    expect(existsSync(modulePath)).toBe(true);
    if (!existsSync(modulePath)) return;
    const { getAuthDestination } = await import("../lib/auth/presentation");

    expect(getAuthDestination("login")).toBe("/dashboard");
    expect(getAuthDestination("signup")).toBe("/onboarding");
    expect(getAuthDestination("forgot")).toBe("/login");
  });

  it("describes recovery as unavailable without a mail provider", async () => {
    expect(existsSync(modulePath)).toBe(true);
    if (!existsSync(modulePath)) return;
    const { authPresentation } = await import("../lib/auth/presentation");

    expect(authPresentation.forgot.unavailableMessage).toContain("not configured");
    expect(authPresentation.forgot.unavailableMessage).not.toContain("sent");
  });
});
