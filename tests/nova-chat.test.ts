import { afterEach, describe, expect, it, vi } from "vitest";
import { calculateFinancialTwin } from "../lib/financial/engine";
import { sampleProfile } from "../lib/financial/sample-data";
import type { FinancialProfile, FinancialTwinResult } from "../lib/financial/types";
import { classifyNovaIntent, createNovaResponse } from "../lib/nova/chat";
import type { NovaChatIntent, NovaChatResponse } from "../lib/nova/chat";
import { formatCurrency, formatPercent } from "../lib/utils";

const twin = calculateFinancialTwin(sampleProfile);

function evidenceValue(response: NovaChatResponse, label: string) {
  return response.evidence.find((item) => item.label === label)?.value;
}

function responseText(response: NovaChatResponse) {
  return [
    response.title,
    response.markdown,
    ...response.evidence.flatMap((item) => [item.label, item.value, item.detail ?? ""]),
    ...response.followUps,
    response.boundary
  ].join(" ");
}

function expectResponseContract(response: NovaChatResponse, intent: NovaChatIntent) {
  expect(response.intent).toBe(intent);
  expect(response.id).toMatch(/^nova-[a-f0-9]{8}$/);
  expect(response.title.trim()).not.toBe("");
  expect(response.markdown.trim()).not.toBe("");
  expect(response.evidence.length).toBeGreaterThan(0);
  expect(response.evidence.every((item) => item.label.trim() && item.value.trim())).toBe(true);
  expect(response.followUps).toHaveLength(4);
  expect(new Set(response.followUps).size).toBe(4);
  expect(response.followUps.every((followUp) => followUp.trim().length > 0)).toBe(true);
  expect(response.boundary).toMatch(/educational decision support/i);
  expect(responseText(response)).not.toMatch(/\bNaN\b|\bInfinity\b|∞/);
}

function zeroProfile(): FinancialProfile {
  const profile = structuredClone(sampleProfile);
  profile.income = {
    salaryMonthly: 0,
    bonusesAnnual: 0,
    otherMonthly: 0,
    stabilityScore: 0
  };
  profile.expenses = {
    housing: 0,
    food: 0,
    transport: 0,
    utilities: 0,
    subscriptions: 0,
    insurance: 0,
    education: 0,
    lifestyle: 0,
    children: 0,
    other: 0
  };
  profile.assets = {
    cash: 0,
    investments: 0,
    retirement: 0,
    realEstate: 0,
    other: 0
  };
  profile.debts = [];
  profile.goals = [];
  profile.creditLimit = 0;
  profile.creditUsed = 0;
  return profile;
}

function deepFreeze<T>(value: T): T {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.values(value).forEach((child) => deepFreeze(child));
  return Object.freeze(value);
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("deterministic Nova chat", () => {
  it.each<[string, NovaChatIntent]>([
    ["What is my biggest expense?", "spending"],
    ["Analyze my investments", "investments"],
    ["How can I reach my house goal?", "goals"],
    ["Summarize my financial health", "health"],
    ["How much debt do I have?", "debt"],
    ["Hello, Nova", "general"]
  ])("classifies %s", (message, intent) => {
    expect(classifyNovaIntent(message)).toBe(intent);
  });

  it.each<[string, NovaChatIntent]>([
    ["  WHAT’S   MY CREDIT-CARD DEBT?!  ", "debt"],
    ["HOUSE—GOAL... progress", "goals"],
    ["How's my RETIREMENT portfolio???", "investments"],
    ["What’s my FOOD / LIFESTYLE spending?!", "spending"],
    ["NET-WORTH & cash_flow", "health"]
  ])("normalizes case, whitespace, punctuation, and apostrophes in %s", (message, intent) => {
    expect(classifyNovaIntent(message)).toBe(intent);
  });

  it.each<[string, NovaChatIntent]>([
    ["Compare my debt, house goal, investments, spending, and health", "debt"],
    ["Compare my house goal, investments, spending, and health", "goals"],
    ["Compare investments, spending, and health", "investments"],
    ["Compare spending and health", "spending"],
    ["Give me a health summary", "health"]
  ])("applies deterministic priority to %s", (message, intent) => {
    expect(classifyNovaIntent(message)).toBe(intent);
  });

  it.each([
    "What is my monthly pay?",
    "When will I get paid?",
    "Show my paycheck",
    "How much income do I receive?"
  ])("does not confuse income language with spending: %s", (message) => {
    expect(classifyNovaIntent(message)).toBe("general");
  });

  it.each([
    "May I review my investment portfolio?",
    "March toward a stronger investment portfolio"
  ])("does not treat ambiguous month language as historical: %s", (message) => {
    const response = createNovaResponse({
      message,
      profile: sampleProfile,
      twin
    });

    expect(response.intent).toBe("investments");
    expect(response.markdown).not.toMatch(/no transaction feed is connected/i);
  });

  it.each<[string, NovaChatIntent, RegExp]>([
    ["Explain my monthly expenses", "spending", /expense|spend|budget/i],
    ["Analyze my investments", "investments", /invest|portfolio|risk/i],
    ["How can I reach my house goal?", "goals", /goal|contribution|target/i],
    ["Summarize my financial health", "health", /health|risk|surplus/i],
    ["How much debt do I have?", "debt", /debt|payment|apr/i],
    ["What should we review?", "general", /spending|goal|debt|health/i]
  ])("returns the complete %s response contract", (message, intent, followUpContext) => {
    const response = createNovaResponse({ message, profile: sampleProfile, twin });

    expectResponseContract(response, intent);
    expect(response.followUps.join(" ")).toMatch(followUpContext);
  });

  it("uses one stable educational boundary for every intent", () => {
    const messages = [
      "Explain my monthly expenses",
      "Analyze my investments",
      "Review my goals",
      "Summarize my financial health",
      "How much debt do I have?",
      "Hello, Nova"
    ];
    const boundaries = messages.map((message) => createNovaResponse({ message, profile: sampleProfile, twin }).boundary);

    expect(new Set(boundaries)).toHaveLength(1);
    expect(boundaries[0]).toMatch(/educational decision support/i);
  });

  it("grounds spending in the modeled monthly total and real largest category", () => {
    const response = createNovaResponse({
      message: "What is my biggest expense?",
      profile: sampleProfile,
      twin
    });

    expect(evidenceValue(response, "Modeled monthly expenses")).toBe(
      formatCurrency(twin.monthlyExpenses, sampleProfile.currency)
    );
    expect(evidenceValue(response, "Largest modeled category")).toBe("Housing");
    expect(response.markdown).toContain(formatCurrency(sampleProfile.expenses.housing, sampleProfile.currency));
    expect(evidenceValue(response, "Monthly surplus")).toBe(
      formatCurrency(twin.monthlySurplus, sampleProfile.currency)
    );
  });

  it.each([
    "How much did I spend this month?",
    "How much are my expenses in the current month?",
    "How much did I spend in June?",
    "Show June spending",
    "Show May spending",
    "What did I pay month-to-date?",
    "Show my transaction history",
    "Which merchant did I buy from last week?"
  ])("states the transaction boundary for unsupported history: %s", (message) => {
    const response = createNovaResponse({ message, profile: sampleProfile, twin });

    expect(response.intent).toBe("spending");
    expect(response.markdown).toMatch(/no transaction feed is connected/i);
    expect(response.markdown).toMatch(/modeled monthly expenses/i);
    expect(response.markdown).not.toMatch(/\byou spent\b/i);
    expect(evidenceValue(response, "Modeled monthly expenses")).toBe(
      formatCurrency(twin.monthlyExpenses, sampleProfile.currency)
    );
  });

  it.each<[string, NovaChatIntent]>([
    ["Show transaction history for my credit card debt", "debt"],
    ["Show merchant history for my house goal", "goals"],
    ["Show my investment transaction history", "investments"],
    ["Show my financial history", "spending"]
  ])("keeps the no-feed boundary when priority selects %s", (message, intent) => {
    const response = createNovaResponse({ message, profile: sampleProfile, twin });

    expect(response.intent).toBe(intent);
    expect(response.markdown).toMatch(/no transaction feed is connected/i);
    expect(response.markdown).toMatch(/not observed activity|cannot verify/i);
  });

  it.each([
    "What return did my investment portfolio make last month?",
    "How did my investment portfolio do in 2024?",
    "Show my June portfolio",
    "Show my March portfolio",
    "What returns has my portfolio made?"
  ])("does not invent investment performance history or returns: %s", (message) => {
    const response = createNovaResponse({
      message,
      profile: sampleProfile,
      twin
    });

    expect(response.intent).toBe("investments");
    expect(response.markdown).toMatch(/no transaction feed is connected/i);
    expect(response.markdown).toMatch(/no dated .*performance history/i);
    expect(response.markdown).not.toMatch(/gained|returned \d|performance was/i);
  });

  it("grounds investment evidence in the supplied asset buckets and risk tolerance", () => {
    const response = createNovaResponse({ message: "Analyze my investments", profile: sampleProfile, twin });
    const investedTotal = sampleProfile.assets.investments + sampleProfile.assets.retirement;

    expect(evidenceValue(response, "Investment assets")).toBe(
      formatCurrency(sampleProfile.assets.investments, sampleProfile.currency)
    );
    expect(evidenceValue(response, "Retirement assets")).toBe(
      formatCurrency(sampleProfile.assets.retirement, sampleProfile.currency)
    );
    expect(evidenceValue(response, "Invested total")).toBe(
      formatCurrency(investedTotal, sampleProfile.currency)
    );
    expect(evidenceValue(response, "Risk tolerance")).toBe(sampleProfile.riskTolerance);
  });

  it("selects the named goal and derives progress, remaining amount, and months deterministically", () => {
    const goal = sampleProfile.goals.find((item) => item.category === "House");
    expect(goal).toBeDefined();

    const response = createNovaResponse({
      message: "How can I reach my house goal?",
      profile: sampleProfile,
      twin
    });
    const remaining = Math.max(0, (goal?.targetAmount ?? 0) - (goal?.currentAmount ?? 0));
    const months = Math.ceil(remaining / Math.max(1, goal?.monthlyContribution ?? 0));

    expect(response.markdown).toContain(goal?.name);
    expect(evidenceValue(response, "Goal progress")).toBe(
      formatPercent(((goal?.currentAmount ?? 0) / Math.max(1, goal?.targetAmount ?? 0)) * 100)
    );
    expect(evidenceValue(response, "Current amount")).toBe(
      `${formatCurrency(goal?.currentAmount ?? 0, sampleProfile.currency)} of ${formatCurrency(goal?.targetAmount ?? 0, sampleProfile.currency)}`
    );
    expect(evidenceValue(response, "Remaining")).toBe(formatCurrency(remaining, sampleProfile.currency));
    expect(evidenceValue(response, "Time at current contribution")).toBe(`${months} months`);
  });

  it("grounds debt evidence in balances, modeled payments, ratio, and actual APR", () => {
    const response = createNovaResponse({ message: "How much debt do I have?", profile: sampleProfile, twin });
    const totalDebt = sampleProfile.debts.reduce((sum, debt) => sum + debt.balance, 0);
    const highestAprDebt = [...sampleProfile.debts].sort((left, right) => right.apr - left.apr)[0];

    expect(evidenceValue(response, "Total debt balance")).toBe(
      formatCurrency(totalDebt, sampleProfile.currency)
    );
    expect(evidenceValue(response, "Monthly debt payments")).toBe(
      formatCurrency(twin.monthlyDebtPayment, sampleProfile.currency)
    );
    expect(evidenceValue(response, "Debt payment ratio")).toBe(formatPercent(twin.debtRatio, 1));
    expect(evidenceValue(response, "Highest APR")).toBe(formatPercent(highestAprDebt?.apr ?? 0, 1));
    expect(response.markdown).toContain(highestAprDebt?.label);
  });

  it("grounds health and fallback answers in the supplied twin", () => {
    const health = createNovaResponse({
      message: "Summarize my financial health",
      profile: sampleProfile,
      twin
    });
    const general = createNovaResponse({ message: "Hello, Nova", profile: sampleProfile, twin });

    expect(evidenceValue(health, "Financial health")).toBe(`${twin.financialHealth.score}/100`);
    expect(evidenceValue(health, "Risk")).toBe(`${twin.risk.level} (${twin.risk.score}/100)`);
    expect(evidenceValue(health, "Net worth")).toBe(formatCurrency(twin.netWorth, sampleProfile.currency));
    expect(evidenceValue(health, "Monthly surplus")).toBe(
      formatCurrency(twin.monthlySurplus, sampleProfile.currency)
    );
    expect(evidenceValue(general, "Financial health")).toBe(`${twin.financialHealth.score}/100`);
    expect(evidenceValue(general, "Monthly surplus")).toBe(
      formatCurrency(twin.monthlySurplus, sampleProfile.currency)
    );
  });

  it("selects among exactly three local phrase shapes by stable message hash", () => {
    const messages = [
      "Analyze my investments",
      "Review my investment allocation",
      "Explain my retirement portfolio",
      "Summarize my investment assets",
      "Assess my investment mix",
      "Help me understand my portfolio",
      "Evaluate investments",
      "Discuss my investment accounts",
      "Walk through my retirement assets",
      "Show my portfolio allocation",
      "Check investment risk",
      "Describe my invested assets"
    ];
    const responses = messages.map((message) =>
      createNovaResponse({ message, profile: sampleProfile, twin })
    );
    const introductions = responses.map((response) => response.markdown.split("\n\n")[0]);

    expect(new Set(introductions)).toHaveLength(3);
    expect(new Set(responses.map((response) => response.id))).toHaveLength(messages.length);
    responses.forEach((response, index) => {
      expect(response).toEqual(
        createNovaResponse({ message: messages[index] ?? "", profile: sampleProfile, twin })
      );
    });
  });

  it("does not depend on time, randomness, crypto, fetch, or object identity", () => {
    vi.spyOn(Math, "random").mockImplementation(() => {
      throw new Error("randomness is forbidden");
    });
    vi.spyOn(Date, "now").mockImplementation(() => {
      throw new Error("time is forbidden");
    });
    vi.stubGlobal("crypto", {
      getRandomValues: () => {
        throw new Error("crypto randomness is forbidden");
      },
      randomUUID: () => {
        throw new Error("crypto randomness is forbidden");
      }
    });
    vi.stubGlobal("fetch", () => {
      throw new Error("network access is forbidden");
    });
    const request = { message: "Analyze my investments", profile: sampleProfile, twin };

    expect(createNovaResponse(request)).toEqual(createNovaResponse(structuredClone(request)));
  });

  it("does not mutate a deeply frozen profile or twin", () => {
    const profile = structuredClone(sampleProfile);
    const frozenRequest = deepFreeze({
      message: "How can I reach my house goal?",
      profile,
      twin: calculateFinancialTwin(profile)
    });
    const snapshot = structuredClone(frozenRequest);

    expect(() => createNovaResponse(frozenRequest)).not.toThrow();
    expect(frozenRequest).toEqual(snapshot);
  });

  it("handles empty debts and goals plus zero income, expenses, and assets without rankings", () => {
    const profile = zeroProfile();
    const emptyTwin = calculateFinancialTwin(profile);
    const spending = createNovaResponse({ message: "What is my biggest expense?", profile, twin: emptyTwin });
    const investments = createNovaResponse({ message: "Analyze my investments", profile, twin: emptyTwin });
    const goals = createNovaResponse({ message: "Review my goals", profile, twin: emptyTwin });
    const debt = createNovaResponse({ message: "Review my debt", profile, twin: emptyTwin });

    [spending, investments, goals, debt].forEach((response) =>
      expectResponseContract(response, response.intent)
    );
    expect(spending.markdown).toMatch(/no positive expense categories/i);
    expect(spending.evidence.some((item) => item.label === "Largest modeled category")).toBe(false);
    expect(spending.followUps.join(" ")).not.toMatch(/largest/i);
    expect(spending.followUps.join(" ")).toMatch(/add|model/i);
    expect(investments.markdown).toMatch(/no positive amount is modeled/i);
    expect(goals.markdown).toMatch(/no goals are modeled/i);
    expect(debt.markdown).toMatch(/no debt accounts are modeled/i);
    expect(debt.evidence.some((item) => item.label === "Highest APR")).toBe(false);
    expect(debt.followUps.join(" ")).not.toMatch(/highest apr/i);
    expect(debt.followUps.join(" ")).toMatch(/record|model/i);
  });

  it("handles negative surplus and net worth plus a completed goal", () => {
    const profile = zeroProfile();
    profile.income.salaryMonthly = 1_000;
    profile.expenses.housing = 2_500;
    profile.debts = [
      {
        label: "Loan",
        balance: 10_000,
        monthlyPayment: 200,
        apr: 5,
        type: "personal-loan"
      }
    ];
    profile.goals = [
      {
        id: "complete",
        name: "Completed reserve",
        category: "Emergency",
        targetAmount: 1_000,
        currentAmount: 1_200,
        monthlyContribution: 0,
        targetDate: "2025-01-01",
        priority: "High"
      }
    ];
    const negativeTwin = calculateFinancialTwin(profile);
    const health = createNovaResponse({ message: "Check my health", profile, twin: negativeTwin });
    const goals = createNovaResponse({ message: "Review my completed goal", profile, twin: negativeTwin });

    expect(evidenceValue(health, "Monthly surplus")).toBe(
      formatCurrency(negativeTwin.monthlySurplus, profile.currency)
    );
    expect(evidenceValue(health, "Net worth")).toBe(formatCurrency(negativeTwin.netWorth, profile.currency));
    expect(health.markdown).toMatch(/shortfall/i);
    expect(evidenceValue(goals, "Remaining")).toBe(formatCurrency(0, profile.currency));
    expect(evidenceValue(goals, "Time at current contribution")).toBe("Complete");
    expect(goals.markdown).toMatch(/already funded|complete/i);
    expect(responseText(health) + responseText(goals)).not.toMatch(/\bNaN\b|\bInfinity\b|∞/);
  });

  it("defends every intent against nonfinite supplied numbers", () => {
    const profile = structuredClone(sampleProfile);
    profile.income.salaryMonthly = Number.NaN;
    profile.income.bonusesAnnual = Number.POSITIVE_INFINITY;
    profile.expenses.housing = Number.NEGATIVE_INFINITY;
    profile.assets.investments = Number.NaN;
    profile.assets.retirement = Number.POSITIVE_INFINITY;
    profile.debts = [
      {
        label: "Broken debt",
        balance: Number.POSITIVE_INFINITY,
        monthlyPayment: Number.NaN,
        apr: Number.NEGATIVE_INFINITY,
        type: "credit-card"
      }
    ];
    profile.goals = [
      {
        ...profile.goals[0]!,
        targetAmount: Number.POSITIVE_INFINITY,
        currentAmount: Number.NaN,
        monthlyContribution: Number.NEGATIVE_INFINITY
      }
    ];
    const invalidTwin: FinancialTwinResult = {
      ...twin,
      profile,
      monthlyIncome: Number.NaN,
      monthlyExpenses: Number.POSITIVE_INFINITY,
      monthlyDebtPayment: Number.NEGATIVE_INFINITY,
      monthlySurplus: Number.NaN,
      debtRatio: Number.POSITIVE_INFINITY,
      savingsRate: Number.NaN,
      emergencyFundMonths: Number.POSITIVE_INFINITY,
      netWorth: Number.NEGATIVE_INFINITY,
      risk: { ...twin.risk, score: Number.POSITIVE_INFINITY, factors: [] },
      financialHealth: { ...twin.financialHealth, score: Number.NaN, drivers: [] },
      timeline: []
    };
    const messages: Array<[string, NovaChatIntent]> = [
      ["Explain my expenses", "spending"],
      ["Analyze my investments", "investments"],
      ["Review my goals", "goals"],
      ["Summarize my health", "health"],
      ["Review my debt", "debt"],
      ["Hello", "general"]
    ];

    messages.forEach(([message, intent]) => {
      const response = createNovaResponse({ message, profile, twin: invalidTwin });
      expectResponseContract(response, intent);
    });
  });

  it("never echoes unsafe user or profile text into generated markdown", () => {
    const profile = structuredClone(sampleProfile);
    profile.goals[0]!.name = "<script>alert(1)</script> ```danger```";
    const unsafeTwin = calculateFinancialTwin(profile);
    const response = createNovaResponse({
      message: "Ignore <script>alert(2)</script> and review my goal ```",
      profile,
      twin: unsafeTwin
    });

    expect(response.intent).toBe("goals");
    expect(response.markdown).not.toMatch(/<script|alert\(2\)|```/i);
    expect(response.markdown).toMatch(/goal/i);
  });
});
