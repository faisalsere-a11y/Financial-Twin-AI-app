import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("landing experience", () => {
  const landing = readFileSync("components/landing/landing-page.tsx", "utf8");
  const previewPath = "components/landing/decision-preview.tsx";
  const preview = existsSync(previewPath) ? readFileSync(previewPath, "utf8") : "";
  const home = readFileSync("app/page.tsx", "utf8");

  it("keeps the page server-rendered and the preview focused", () => {
    expect(existsSync(previewPath)).toBe(true);
    if (!existsSync(previewPath)) return;
    expect(landing).not.toContain('"use client"');
    expect(landing).not.toContain("framer-motion");
    expect(landing).not.toContain("recharts");
    expect(preview).toContain('"use client"');
    expect(preview).toContain("buildLandingPreview");
    expect(preview).toContain('role="tablist"');
    expect(preview).toContain("<svg");
    expect(preview).toContain("sr-only");
  });

  it("removes unsupported marketing claims", () => {
    for (const claim of ["Saudi beta customer", "49 SAR/mo", "249 SAR/mo", "Investor-ready demo", "demo PDF"])
      expect(landing).not.toContain(claim);
    expect(landing).toContain('id="how-it-works"');
    expect(landing).toContain('id="nova"');
    expect(landing).toContain('id="trust"');
    expect(landing).toContain('id="faq"');
  });

  it("renders the landing page in server and static modes", () => {
    expect(home).toContain("return <LandingPage />");
    expect(home).not.toContain("NEXT_PUBLIC_GITHUB_PAGES");
    expect(home).not.toContain("DashboardPage");
  });
});
