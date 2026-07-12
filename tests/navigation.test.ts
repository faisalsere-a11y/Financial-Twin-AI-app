import { describe, expect, it } from "vitest";
import { getPageMeta, navItems } from "../lib/ui/navigation";

describe("product navigation", () => {
  it("preserves every authenticated route", () => {
    expect(navItems.map((item) => item.href)).toEqual([
      "/dashboard",
      "/onboarding",
      "/simulations",
      "/investments",
      "/goals",
      "/reports",
      "/settings"
    ]);
  });

  it("uses product language without changing paths", () => {
    expect(navItems.map((item) => item.label)).toEqual([
      "Overview",
      "Twin",
      "Decisions",
      "Portfolio",
      "Goals",
      "Reports",
      "Settings"
    ]);
    expect(getPageMeta("/simulations").eyebrow).toBe("Decision lab");
  });
});
