import { NextResponse } from "next/server";
import { z } from "zod";
import { generateAdvisorRecommendations } from "@/lib/ai/advisor";
import { compareScenario } from "@/lib/financial/engine";
import { sampleProfile } from "@/lib/financial/sample-data";

const simulationSchema = z.object({
  id: z.string().default("custom-scenario"),
  name: z.string().min(2),
  type: z.enum([
    "car",
    "house",
    "loan",
    "investment",
    "salary",
    "job-loss",
    "family",
    "education",
    "emergency",
    "travel",
    "retirement"
  ]),
  upfrontCost: z.coerce.number().min(0),
  assetDelta: z.coerce.number(),
  liabilityDelta: z.coerce.number().min(0),
  monthlyIncomeDelta: z.coerce.number(),
  monthlyExpenseDelta: z.coerce.number().min(0),
  monthlyDebtPaymentDelta: z.coerce.number().min(0),
  annualReturnDelta: z.coerce.number(),
  durationMonths: z.coerce.number().min(1),
  tags: z.array(z.string()).default(["Custom"])
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = simulationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid simulation input.", issues: parsed.error.flatten() }, { status: 400 });
  }

  const comparison = compareScenario(sampleProfile, parsed.data);
  const advice = await generateAdvisorRecommendations(comparison);

  return NextResponse.json({ comparison, advice });
}

export async function GET() {
  return NextResponse.json({
    scenarios: [
      "Buy a Car",
      "Buy a House",
      "Take a Loan",
      "Start Investment",
      "Increase Salary",
      "Lose Job",
      "Marriage",
      "Child",
      "Education",
      "Emergency Expense",
      "Travel",
      "Retirement"
    ]
  });
}
