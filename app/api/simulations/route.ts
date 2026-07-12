import { NextResponse } from "next/server";
import { z } from "zod";
import { generateAdvisorResponse } from "@/lib/ai/advisor";
import { compareScenario } from "@/lib/financial/engine";
import { sampleProfile } from "@/lib/financial/sample-data";
import { financialProfileSchema } from "@/lib/profile/browser-store";
import { auth } from "@/lib/auth";
import { checkSimulationRateLimit } from "@/lib/server/simulation-rate-limit";

const configuredRateLimit = Number(process.env.SIMULATION_RATE_LIMIT_PER_MINUTE ?? 10);
const rateLimit = Number.isFinite(configuredRateLimit) && configuredRateLimit > 0 ? Math.floor(configuredRateLimit) : 10;

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
  const session = await auth();
  const user = session?.user as { id?: string; email?: string | null } | undefined;
  const subject = user?.id || user?.email;
  if (!subject) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const retryAfter = checkSimulationRateLimit(subject, rateLimit);
  if (retryAfter !== null) {
    return NextResponse.json(
      { error: "Simulation limit reached. Try again shortly." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  let body: { scenario?: unknown; profile?: unknown } | null;
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid simulation request." }, { status: 400 });
  }
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid simulation request." }, { status: 400 });
  }
  const parsed = simulationSchema.safeParse(body.scenario ?? body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid simulation input.", issues: parsed.error.flatten() }, { status: 400 });
  }

  const parsedProfile = financialProfileSchema.safeParse(body.profile);
  if (body.profile !== undefined && !parsedProfile.success) {
    return NextResponse.json({ error: "Invalid financial profile." }, { status: 400 });
  }

  const comparison = compareScenario(parsedProfile.success ? parsedProfile.data : sampleProfile, parsed.data);
  const advisor = await generateAdvisorResponse(comparison);

  return NextResponse.json({ comparison, advice: advisor.recommendations, advisorSource: advisor.source });
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
