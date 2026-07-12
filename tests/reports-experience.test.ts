import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const reportSource = fs.readFileSync(
  path.join(process.cwd(), "components/reports/reports-page.tsx"),
  "utf8"
);
const globalStyles = fs.readFileSync(path.join(process.cwd(), "app/globals.css"), "utf8");

describe("report workspace experience", () => {
  it("makes report period selection change the visible engine-backed timeline", () => {
    expect(reportSource).toContain('type ReportPeriod = "monthly" | "quarterly" | "annual"');
    expect(reportSource).toContain('useState<ReportPeriod>("annual")');
    expect(reportSource).toContain("visibleTimeline");
    expect(reportSource).toContain("selectedOption.months");
    expect(reportSource).toContain('type="radio"');
    expect(reportSource).toContain("checked={selectedReport === option.id}");
    expect(reportSource).toContain("Monthly outlook");
    expect(reportSource).toContain("Quarterly outlook");
    expect(reportSource).toContain("Annual outlook");
  });

  it("keeps active-profile CSV and print/PDF as working actions with inline status", () => {
    expect(reportSource).toContain("twinToCsv(twin, compareScenario(profile, sampleScenario))");
    expect(reportSource).toContain("window.print()");
    expect(reportSource).toContain('role="status"');
    expect(reportSource).toContain('aria-live="polite"');
    expect(reportSource).not.toContain("toast.");
    expect(reportSource).not.toContain('from "sonner"');
  });

  it("uses semantic chart tokens, an accessible chart summary/table, and print rules", () => {
    expect(reportSource).toContain("ChartFrame");
    expect(reportSource).toContain("chartTheme.current");
    expect(reportSource).toContain("chartTheme.after");
    expect(reportSource).toContain("chartTooltipStyle");
    expect(reportSource).toContain("<caption");
    expect(reportSource).toContain('scope="col"');
    expect(reportSource).not.toContain('stroke="#');
    expect(reportSource).not.toContain('background: "#');
    expect(reportSource).not.toContain("rgba(255,255,255");
    expect(globalStyles).toContain("@media print");
    expect(globalStyles).toContain(".app-print-hide");
    expect(globalStyles).toContain(".report-print-root");
  });
});
