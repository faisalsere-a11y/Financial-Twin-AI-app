import { NextResponse } from "next/server";
import { calculateFinancialTwin, compareScenario } from "@/lib/financial/engine";
import { sampleProfile, sampleScenario } from "@/lib/financial/sample-data";
import { twinToCsv } from "@/lib/reports/export";

export async function GET() {
  const twin = calculateFinancialTwin(sampleProfile);
  const comparison = compareScenario(sampleProfile, sampleScenario);
  const csv = twinToCsv(twin, comparison);

  return new NextResponse(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": "attachment; filename=financial-twin-report.csv"
    }
  });
}
