import { NextResponse } from "next/server";
import { calculateFinancialTwin, forecastGoalCompletion } from "@/lib/financial/engine";
import { sampleProfile } from "@/lib/financial/sample-data";

export async function GET() {
  return NextResponse.json({
    profile: sampleProfile,
    twin: calculateFinancialTwin(sampleProfile),
    goals: forecastGoalCompletion(sampleProfile)
  });
}
