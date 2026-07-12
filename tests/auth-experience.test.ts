import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("authentication experience", () => {
  const source = readFileSync("components/auth/auth-card.tsx", "utf8");

  it("connects accessible form and outcome semantics", () => {
    expect(source).toContain('from "@/lib/auth/presentation"');
    expect(source).toContain("aria-live");
    expect(source).toContain('role="alert"');
    expect(source).toContain('id="email-error"');
    expect(source).toContain('id="password-error"');
    expect(source).toContain('autoComplete="email"');
    expect(source).toContain('autoComplete="current-password"');
  });

  it("preserves sample access without exposing credentials", () => {
    expect(source).toContain("Use sample access");
    expect(source).toContain("sampleCredentials");
    expect(source).not.toContain('password: "password123"');
    expect(source).not.toContain("prepared for demo inbox");
    expect(source).not.toContain("Welcome to the GitHub Pages demo");
  });

  it("uses the mode-specific successful destination", () => {
    expect(source).toContain("getAuthDestination(mode)");
  });
});
