import { existsSync, readFileSync } from "node:fs";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

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
    expect(landing.match(/<h1\b/g) ?? []).toHaveLength(1);
    expect(landing).not.toContain("position: fixed");
    expect(landing).not.toContain("snap-mandatory");
    expect(landing).not.toContain("overflow-y-hidden");
    expect(landing).not.toContain("infinite");
    expect(landing).not.toContain("marquee");
    expect(landing).toContain('href="#landing-content"');
    expect(landing).toContain('id="landing-content"');
    expect(landing).toContain("tabIndex={-1}");
  });

  it("uses only capability-backed trust proof", () => {
    const combined = `${landing}\n${preview}`.toLowerCase();
    for (const claim of [
      "saudi beta customer",
      "49 sar/mo",
      "249 sar/mo",
      "investor-ready demo",
      "demo pdf",
      "trusted by",
      "active users",
      "customer stories",
      "guaranteed return",
      "outperform the market"
    ]) expect(combined).not.toContain(claim);
    expect(combined).not.toContain("testimonial");
    expect(landing).toContain("No bank connection required");
    expect(landing).toContain("Deterministic simulation engines");
    expect(landing).toContain("Saudi sample profile");
    expect(landing).toContain("SQLite-backed account mode");
    expect(landing).toContain('id="how-it-works"');
    expect(landing).toContain('id="nova"');
    expect(landing).toContain('id="trust"');
    expect(landing).toContain('id="faq"');
  });

  it("keeps the complete narrative in server-rendered markup", async () => {
    vi.stubGlobal("React", React);
    try {
      const { LandingPage } = await import("../components/landing/landing-page");
      const markup = renderToStaticMarkup(React.createElement(LandingPage));

      expect(markup.match(/<h1\b/g) ?? []).toHaveLength(1);
      expect(markup).toContain("See the financial future of a decision");
      expect(markup).toContain("Recommendation");
      expect(markup).toContain("Evidence");
      expect(markup).toContain("Assumptions");
      expect(markup).toContain("Boundary");
      expect(markup).toContain("Interactive financial decision preview");
      expect(markup).toContain("Clarity before commitment");
      expect(markup).toContain("Model it before money moves");
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("renders the landing page in server and static modes", () => {
    expect(home).toContain("return <LandingPage />");
    expect(home).not.toContain("NEXT_PUBLIC_GITHUB_PAGES");
    expect(home).not.toContain("DashboardPage");
  });
});
