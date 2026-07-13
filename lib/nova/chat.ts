import type { ExpenseModel, FinancialProfile, FinancialTwinResult, GoalModel } from "../financial/types";
import { formatCurrency, formatPercent } from "../utils";

export type NovaChatIntent = "spending" | "investments" | "goals" | "health" | "debt" | "general";

export type NovaChatRequest = {
  message: string;
  profile: FinancialProfile;
  twin: FinancialTwinResult;
};

export type NovaChatResponse = {
  id: string;
  intent: NovaChatIntent;
  title: string;
  markdown: string;
  evidence: Array<{ label: string; value: string; detail?: string }>;
  followUps: string[];
  boundary: string;
};

type NovaEvidence = NovaChatResponse["evidence"][number];

type ResponseContent = Omit<NovaChatResponse, "id" | "intent" | "boundary">;

type SanitizedCashFlowSnapshot = {
  monthlyExpenses: number | null;
  monthlySurplus: number | null;
  expenseDetail: string;
  surplusDetail: string;
  disclosure: string | null;
};

const EDUCATIONAL_BOUNDARY =
  "Educational decision support only. Nova uses the supplied profile and financial twin model; it has no transaction feed and cannot replace personalized financial, investment, tax, or legal advice.";

const INTENT_KEYWORDS: ReadonlyArray<{
  intent: Exclude<NovaChatIntent, "general">;
  keywords: readonly string[];
}> = [
  {
    intent: "debt",
    keywords: [
      "debt",
      "debts",
      "loan",
      "loans",
      "mortgage",
      "mortgages",
      "credit card",
      "credit cards",
      "apr",
      "interest",
      "interest rate",
      "liability",
      "liabilities",
      "owe",
      "owed",
      "owing",
      "repayment",
      "repayments",
      "installment",
      "installments",
      "instalment",
      "instalments"
    ]
  },
  {
    intent: "goals",
    keywords: [
      "goal",
      "goals",
      "goal progress",
      "target",
      "targets",
      "milestone",
      "milestones",
      "save for",
      "saving for",
      "house down payment",
      "down payment",
      "emergency fund"
    ]
  },
  {
    intent: "investments",
    keywords: [
      "investment",
      "investments",
      "invest",
      "invested",
      "investing",
      "portfolio",
      "portfolios",
      "retirement",
      "asset allocation",
      "allocation",
      "stock",
      "stocks",
      "bond",
      "bonds",
      "fund",
      "funds",
      "market",
      "performance",
      "return",
      "returns"
    ]
  },
  {
    intent: "spending",
    keywords: [
      "expense",
      "expenses",
      "spend",
      "spending",
      "spent",
      "budget",
      "budgets",
      "cost",
      "costs",
      "transaction",
      "transactions",
      "history",
      "merchant",
      "merchants",
      "purchase",
      "purchases",
      "buy",
      "bought",
      "food",
      "lifestyle",
      "housing",
      "category",
      "categories",
      "bill",
      "bills",
      "subscription",
      "subscriptions",
      "groceries"
    ]
  },
  {
    intent: "health",
    keywords: [
      "financial health",
      "health",
      "risk",
      "net worth",
      "surplus",
      "cash flow",
      "savings rate",
      "emergency runway",
      "financial position",
      "doing financially",
      "health score"
    ]
  }
];

const HISTORY_KEYWORDS = [
  "transaction",
  "transactions",
  "transaction history",
  "history",
  "merchant",
  "merchants",
  "purchase",
  "purchases",
  "bought",
  "today",
  "this month",
  "last month",
  "past month",
  "this week",
  "last week",
  "yesterday",
  "recent activity",
  "month over month",
  "performance",
  "return",
  "returns",
  "return did",
  "returns last",
  "historical",
  "trend",
  "trends",
  "trended",
  "current month",
  "month to date",
  "week to date",
  "year to date",
  "current year",
  "this year",
  "last year",
  "past year",
  "current quarter",
  "this quarter",
  "last quarter",
  "past quarter",
  "previous month"
] as const;

const NAMED_MONTHS = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december"
] as const;

const AMBIGUOUS_MONTHS: ReadonlySet<string> = new Set(["march", "may"]);

const AMBIGUOUS_MONTH_QUERY_CUES = ["show", "display", "review", "compare", "summarize"] as const;

const AMBIGUOUS_MONTH_QUERY_PRONOUNS = ["my", "our", "your", "their", "his", "her"] as const;

const DATE_PREPOSITIONS = ["in", "during", "for", "since", "from", "through"] as const;

const PAST_DATE_CUES = ["did", "was", "were", "spent", "paid", "made", "earned", "last", "past", "previous"] as const;

const DATED_OUTFLOW_PHRASES = [
  "did i pay",
  "did we pay",
  "have i paid",
  "have we paid",
  "i paid for",
  "we paid for",
  "amount paid",
  "payments made"
] as const;

const GENERAL_FINANCIAL_HISTORY_KEYWORDS = [
  "income",
  "salary",
  "paycheck",
  "asset",
  "assets",
  "cash",
  "balance",
  "balances",
  "saving",
  "savings",
  "wealth",
  "financial snapshot"
] as const;

const FINANCIAL_HISTORY_KEYWORDS = [
  ...INTENT_KEYWORDS.flatMap((group) => group.keywords),
  ...GENERAL_FINANCIAL_HISTORY_KEYWORDS
] as const;

const EXPENSE_LABELS: Record<keyof ExpenseModel, string> = {
  housing: "Housing",
  food: "Food",
  transport: "Transport",
  utilities: "Utilities",
  subscriptions: "Subscriptions",
  insurance: "Insurance",
  education: "Education",
  lifestyle: "Lifestyle",
  children: "Children",
  other: "Other"
};

const PHRASE_TEMPLATES = [
  (subject: string) => `Here’s what the supplied model shows for **${subject}**.`,
  (subject: string) => `Let’s read the current modeled numbers for **${subject}**.`,
  (subject: string) => `Based on the supplied financial twin, this is the clearest view of **${subject}**.`
] as const;

function normalizeMessage(message: string) {
  const value = typeof message === "string" ? message : "";

  return value
    .normalize("NFKD")
    .replace(/[’‘‛ʼ＇']/g, " ")
    .replace(/\p{M}+/gu, "")
    .toLowerCase()
    .replace(/[\p{P}\p{S}_]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function containsKeyword(normalized: string, keyword: string) {
  return ` ${normalized} `.includes(` ${keyword} `);
}

export function classifyNovaIntent(message: string): NovaChatIntent {
  const normalized = normalizeMessage(message);

  for (const group of INTENT_KEYWORDS) {
    if (group.keywords.some((keyword) => containsKeyword(normalized, keyword))) return group.intent;
  }

  if (isDatedSpendingOutflow(normalized)) return "spending";

  return "general";
}

function isHistoryRequest(normalized: string) {
  if (HISTORY_KEYWORDS.some((keyword) => containsKeyword(normalized, keyword))) return true;

  const hasNamedMonth = NAMED_MONTHS.some((month) => {
    if (!containsKeyword(normalized, month)) return false;
    if (!AMBIGUOUS_MONTHS.has(month)) return true;
    const tokens = normalized.split(" ");
    const hasPositionalCue = tokens.some((token, index) => {
      if (token !== month) return false;
      const previous = tokens[index - 1];
      const previousPrevious = tokens[index - 2];
      const next = tokens[index + 1];
      const hasDatePreposition = DATE_PREPOSITIONS.some((prefix) => prefix === previous);
      const hasNumericDay = typeof next === "string" && /^\d{1,2}$/.test(next);
      const hasPossessiveMarker = next === "s";
      const hasDirectQueryCue = AMBIGUOUS_MONTH_QUERY_CUES.some((cue) => cue === previous);
      const hasPronounQueryCue =
        AMBIGUOUS_MONTH_QUERY_PRONOUNS.some((pronoun) => pronoun === previous) &&
        AMBIGUOUS_MONTH_QUERY_CUES.some((cue) => cue === previousPrevious);
      return (
        hasDatePreposition ||
        hasNumericDay ||
        hasPossessiveMarker ||
        hasDirectQueryCue ||
        hasPronounQueryCue
      );
    });
    const hasPastCue = PAST_DATE_CUES.some((cue) => containsKeyword(normalized, cue));
    return hasPastCue || hasPositionalCue;
  });
  const hasCalendarYear = /(?:^|\s)(?:19|20)\d{2}(?:\s|$)/.test(normalized);
  const hasFinancialSubject = FINANCIAL_HISTORY_KEYWORDS.some((keyword) =>
    containsKeyword(normalized, keyword)
  );
  return (hasNamedMonth || hasCalendarYear) && hasFinancialSubject;
}

function isDatedSpendingOutflow(normalized: string) {
  return (
    isHistoryRequest(normalized) &&
    DATED_OUTFLOW_PHRASES.some((phrase) => containsKeyword(normalized, phrase))
  );
}

function stableHash(value: string) {
  let hash = 0x811c9dc5;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }

  return hash >>> 0;
}

function finiteNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function nonNegativeNumber(value: unknown): number | null {
  const finite = finiteNumber(value);
  if (finite === null || finite < 0) return null;
  return finite === 0 ? 0 : finite;
}

function positiveNumber(value: unknown): number | null {
  const finite = finiteNumber(value);
  return finite !== null && finite > 0 ? finite : null;
}

function neutralizedNonNegativeNumber(value: unknown): number | null {
  const finite = finiteNumber(value);
  return finite === null ? null : Math.max(0, finite);
}

function boundedScore(value: unknown): number | null {
  const finite = finiteNumber(value);
  return finite === null ? null : Math.min(100, Math.max(0, finite));
}

function numberToken(value: unknown) {
  const finite = finiteNumber(value);
  return finite === null ? "unavailable" : String(finite);
}

function safeCurrency(value: unknown, currency: FinancialProfile["currency"]) {
  const finite = finiteNumber(value);
  if (finite === null) return "Unavailable";

  try {
    return formatCurrency(finite, currency);
  } catch {
    return "Unavailable";
  }
}

function safeNonNegativeCurrency(value: unknown, currency: FinancialProfile["currency"]) {
  return safeCurrency(nonNegativeNumber(value), currency);
}

function safePercent(value: unknown, digits = 0) {
  const finite = finiteNumber(value);
  return finite === null ? "Unavailable" : formatPercent(finite, digits);
}

function safeNonNegativePercent(value: unknown, digits = 0) {
  return safePercent(nonNegativeNumber(value), digits);
}

function safeScore(value: unknown) {
  const score = boundedScore(value);
  return score === null ? "Unavailable" : `${Math.round(score)}/100`;
}

function safePlainText(value: unknown, fallback: string) {
  if (typeof value !== "string") return fallback;
  const clean = value.replace(/[\u0000-\u001f\u007f]+/g, " ").replace(/\s+/g, " ").trim();
  return clean || fallback;
}

function safeMarkdownText(value: unknown, fallback: string) {
  return safePlainText(value, fallback)
    .replace(/`/g, "'")
    .replace(/</g, "‹")
    .replace(/>/g, "›")
    .replace(/\\/g, "\\\\")
    .replace(/([*_{}\[\]()#+.!|])/g, "\\$1");
}

function sumNonNegative(values: unknown[]) {
  const numbers = values.map(nonNegativeNumber);
  if (numbers.some((value) => value === null)) return null;
  const sum = (numbers as number[]).reduce((total, value) => total + value, 0);
  return Number.isFinite(sum) ? sum : null;
}

function sanitizedCashFlowSnapshot(request: NovaChatRequest): SanitizedCashFlowSnapshot {
  const { profile, twin } = request;
  const expenseComponents = Object.values(profile.expenses).map(nonNegativeNumber);
  const incomeComponents = [
    nonNegativeNumber(profile.income.salaryMonthly),
    nonNegativeNumber(profile.income.bonusesAnnual),
    nonNegativeNumber(profile.income.otherMonthly)
  ];
  const invalidExpenseCount = expenseComponents.filter((value) => value === null).length;
  const invalidIncomeCount = incomeComponents.filter((value) => value === null).length;

  if (!invalidExpenseCount && !invalidIncomeCount) {
    return {
      monthlyExpenses: nonNegativeNumber(twin.monthlyExpenses),
      monthlySurplus: finiteNumber(twin.monthlySurplus),
      expenseDetail: "Supplied financial-twin total; this is not observed transaction activity.",
      surplusDetail: "Supplied income less modeled monthly expenses.",
      disclosure: null
    };
  }

  const validExpenseComponents = expenseComponents.filter((value): value is number => value !== null);
  const expenseSum = validExpenseComponents.reduce((total, value) => total + value, 0);
  const monthlyExpenses = nonNegativeNumber(expenseSum);
  let monthlyIncome: number | null = null;

  if (!invalidIncomeCount) {
    const salaryMonthly = incomeComponents[0] as number;
    const bonusesAnnual = incomeComponents[1] as number;
    const otherMonthly = incomeComponents[2] as number;
    monthlyIncome = nonNegativeNumber(salaryMonthly + bonusesAnnual / 12 + otherMonthly);
  }

  const derivedSurplus =
    monthlyIncome !== null && monthlyExpenses !== null ? finiteNumber(monthlyIncome - monthlyExpenses) : null;
  const omittedParts = [
    invalidExpenseCount
      ? `${invalidExpenseCount} invalid expense input${invalidExpenseCount === 1 ? "" : "s"}`
      : null,
    invalidIncomeCount ? `${invalidIncomeCount} invalid income input${invalidIncomeCount === 1 ? "" : "s"}` : null
  ].filter((part): part is string => part !== null);
  const omittedCount = invalidExpenseCount + invalidIncomeCount;
  const omission = `${omittedParts.join(" and ")} ${omittedCount === 1 ? "was" : "were"} omitted from cash-flow evidence.`;
  const disclosure =
    derivedSurplus === null
      ? `${omission} Monthly expenses were derived from valid nonnegative categories, but monthly surplus is unavailable without complete valid income inputs.`
      : `${omission} Monthly expenses and surplus were recalculated from valid nonnegative profile inputs.`;

  return {
    monthlyExpenses,
    monthlySurplus: derivedSurplus,
    expenseDetail: `Derived from valid nonnegative expense categories. ${omission}`,
    surplusDetail:
      derivedSurplus === null
        ? `Unavailable without complete valid income inputs. ${omission}`
        : `Derived from valid nonnegative income and expense inputs. ${omission}`,
    disclosure
  };
}

function requestFingerprint(request: NovaChatRequest, normalized: string) {
  const { profile, twin } = request;
  const parts = [
    normalized,
    safePlainText(profile.id, "profile"),
    profile.currency,
    profile.riskTolerance,
    ...Object.values(profile.expenses).map(numberToken),
    ...Object.values(profile.assets).map(numberToken),
    ...profile.debts.flatMap((debt) => [
      safePlainText(debt.label, "debt"),
      numberToken(debt.balance),
      numberToken(debt.monthlyPayment),
      numberToken(debt.apr)
    ]),
    ...profile.goals.flatMap((goal) => [
      safePlainText(goal.id, "goal"),
      numberToken(goal.targetAmount),
      numberToken(goal.currentAmount),
      numberToken(goal.monthlyContribution)
    ]),
    numberToken(twin.monthlyIncome),
    numberToken(twin.monthlyExpenses),
    numberToken(twin.monthlyDebtPayment),
    numberToken(twin.monthlySurplus),
    numberToken(twin.debtRatio),
    numberToken(twin.savingsRate),
    numberToken(twin.emergencyFundMonths),
    numberToken(twin.netWorth),
    numberToken(twin.risk.score),
    numberToken(twin.financialHealth.score)
  ];

  return parts.join("|");
}

function introduction(normalized: string, subject: string) {
  const template = PHRASE_TEMPLATES[stableHash(normalized) % PHRASE_TEMPLATES.length] ?? PHRASE_TEMPLATES[0];
  return template(subject);
}

function historyBoundary() {
  return "No transaction feed is connected, so I cannot verify dated purchases, merchants, or historical financial values. The model also has no dated market-performance history. Each figure below is part of the current model snapshot, not a value from the requested date or observed activity.";
}

function ensureHistoryBoundary(markdown: string, normalized: string) {
  if (!isHistoryRequest(normalized) || markdown.includes("No transaction feed is connected")) return markdown;
  const [introductionParagraph, ...remainingParagraphs] = markdown.split("\n\n");
  return [introductionParagraph, historyBoundary(), ...remainingParagraphs].join("\n\n");
}

function cashFlowSentence(snapshot: SanitizedCashFlowSnapshot, currency: FinancialProfile["currency"]) {
  const surplus = snapshot.monthlySurplus;
  const sentence =
    surplus === null
      ? "The monthly cash-flow figure is unavailable."
      : surplus < 0
        ? `Modeled cash flow has a monthly shortfall of **${safeCurrency(Math.abs(surplus), currency)}**.`
        : `Modeled cash flow leaves a monthly surplus of **${safeCurrency(surplus, currency)}**.`;
  return snapshot.disclosure ? `${sentence} ${snapshot.disclosure}` : sentence;
}

function spendingContent(request: NovaChatRequest, normalized: string): ResponseContent {
  const { profile } = request;
  const cashFlow = sanitizedCashFlowSnapshot(request);
  const categories = (Object.keys(EXPENSE_LABELS) as Array<keyof ExpenseModel>).map((key) => ({
    label: EXPENSE_LABELS[key],
    value: nonNegativeNumber(profile.expenses[key])
  }));
  const largest = categories.reduce<(typeof categories)[number] | null>((current, category) => {
    if (category.value === null || category.value <= 0) return current;
    if (!current || current.value === null || category.value > current.value) return category;
    return current;
  }, null);
  const evidence: NovaEvidence[] = [
    {
      label: "Modeled monthly expenses",
      value: safeNonNegativeCurrency(cashFlow.monthlyExpenses, profile.currency),
      detail: cashFlow.expenseDetail
    },
    ...(largest
      ? [
          {
            label: "Largest modeled category",
            value: largest.label,
            detail: `${safeNonNegativeCurrency(largest.value, profile.currency)} in the supplied expense model.`
          }
        ]
      : []),
    {
      label: "Monthly surplus",
      value: safeCurrency(cashFlow.monthlySurplus, profile.currency),
      detail: cashFlow.surplusDetail
    }
  ];
  const categorySentence = largest
    ? `The **modeled monthly expenses** total **${safeNonNegativeCurrency(cashFlow.monthlyExpenses, profile.currency)}**. The largest positive category is **${largest.label}** at **${safeNonNegativeCurrency(largest.value, profile.currency)}**.`
    : `The **modeled monthly expenses** total **${safeNonNegativeCurrency(cashFlow.monthlyExpenses, profile.currency)}**. There are no positive expense categories to rank, so I will not name a largest item.`;
  const paragraphs = [
    introduction(normalized, "your spending model"),
    ...(isHistoryRequest(normalized) ? [historyBoundary()] : []),
    categorySentence,
    cashFlowSentence(cashFlow, profile.currency)
  ];
  const followUps = !largest
    ? [
        "Which expense categories should I add to the model?",
        "How much monthly income is modeled?",
        "How can I create a positive monthly surplus?",
        "Summarize my financial health."
      ]
    : isHistoryRequest(normalized)
      ? [
          "Show my modeled expense categories.",
          "Which modeled expense category is largest?",
          "How does my monthly surplus compare with expenses?",
          "Summarize my financial health."
        ]
      : [
          "Which modeled expense category is largest?",
          "How does my monthly surplus compare with expenses?",
          "What happens if I reduce lifestyle spending?",
          "Summarize my financial health."
        ];

  return {
    title: "Modeled spending",
    markdown: paragraphs.join("\n\n"),
    evidence,
    followUps
  };
}

function investmentContent(request: NovaChatRequest, normalized: string): ResponseContent {
  const { profile } = request;
  const investmentAssets = nonNegativeNumber(profile.assets.investments);
  const retirementAssets = nonNegativeNumber(profile.assets.retirement);
  const investedTotal = sumNonNegative([profile.assets.investments, profile.assets.retirement]);
  const hasPositiveInvestment =
    (investmentAssets !== null && investmentAssets > 0) ||
    (retirementAssets !== null && retirementAssets > 0);
  const riskTolerance = safePlainText(profile.riskTolerance, "Unavailable");
  const paragraphs = [
    introduction(normalized, "your investment balances"),
    ...(isHistoryRequest(normalized) ? [historyBoundary()] : []),
    hasPositiveInvestment
      ? `The supplied investment and retirement buckets total **${safeNonNegativeCurrency(investedTotal, profile.currency)}**: **${safeNonNegativeCurrency(investmentAssets, profile.currency)}** in investment assets and **${safeNonNegativeCurrency(retirementAssets, profile.currency)}** in retirement assets.`
      : "No positive amount is modeled in the investment or retirement asset buckets.",
    `Your supplied risk tolerance is **${safeMarkdownText(riskTolerance, "Unavailable")}**. These balances describe allocation only; they do not establish past or future returns.`
  ];

  return {
    title: "Investment balances",
    markdown: paragraphs.join("\n\n"),
    evidence: [
      {
        label: "Investment assets",
        value: safeNonNegativeCurrency(investmentAssets, profile.currency),
        detail: "Supplied profile investment bucket."
      },
      {
        label: "Retirement assets",
        value: safeNonNegativeCurrency(retirementAssets, profile.currency),
        detail: "Supplied profile retirement bucket."
      },
      {
        label: "Invested total",
        value: safeNonNegativeCurrency(investedTotal, profile.currency),
        detail: "Investment assets plus retirement assets from the supplied profile."
      },
      {
        label: "Risk tolerance",
        value: riskTolerance,
        detail: "Profile setting, not a recommendation or return forecast."
      }
    ],
    followUps: [
      "How much is modeled in investment assets?",
      "How much is modeled for retirement?",
      "How does my risk tolerance relate to this mix?",
      "Summarize my financial health."
    ]
  };
}

function priorityRank(goal: GoalModel) {
  if (goal.priority === "High") return 3;
  if (goal.priority === "Medium") return 2;
  return 1;
}

function selectGoal(goals: GoalModel[], normalized: string): GoalModel | null {
  let selected: GoalModel | null = null;
  let selectedScore = -1;
  const validGoals = goals.filter((goal) => positiveNumber(goal.targetAmount) !== null);

  validGoals.forEach((goal, index) => {
    const normalizedName = normalizeMessage(goal.name);
    const normalizedCategory = normalizeMessage(goal.category);
    const nameMatch = normalizedName && containsKeyword(normalized, normalizedName) ? 20 : 0;
    const categoryMatch = normalizedCategory && containsKeyword(normalized, normalizedCategory) ? 10 : 0;
    const score = nameMatch + categoryMatch + priorityRank(goal) - index / Math.max(1, validGoals.length * 10);

    if (score > selectedScore) {
      selected = goal;
      selectedScore = score;
    }
  });

  return selected;
}

function goalContent(request: NovaChatRequest, normalized: string): ResponseContent {
  const { profile } = request;
  const cashFlow = sanitizedCashFlowSnapshot(request);
  const goal = selectGoal(profile.goals, normalized);

  if (!goal) {
    const hasInvalidGoals = profile.goals.length > 0;
    return {
      title: "Goal progress",
      markdown: [
        introduction(normalized, "your goals"),
        hasInvalidGoals
          ? "No valid goals are modeled in this profile. Every supplied goal needs a finite positive target before it can be ranked or forecast."
          : "No goals are modeled in this profile, so there is no goal to rank or forecast.",
        cashFlowSentence(cashFlow, profile.currency)
      ].join("\n\n"),
      evidence: [
        {
          label: "Goals",
          value: hasInvalidGoals ? "None valid" : "None modeled",
          detail: hasInvalidGoals
            ? "Supplied goals with nonpositive or nonfinite targets were omitted."
            : "The supplied goal list is empty."
        },
        {
          label: "Monthly surplus",
          value: safeCurrency(cashFlow.monthlySurplus, profile.currency),
          detail: cashFlow.surplusDetail
        }
      ],
      followUps: [
        "What information should I add for a goal?",
        "How much monthly surplus is modeled?",
        "Summarize my financial health.",
        "Review my spending model."
      ]
    };
  }

  const target = positiveNumber(goal.targetAmount);
  const current = neutralizedNonNegativeNumber(goal.currentAmount);
  const contribution = neutralizedNonNegativeNumber(goal.monthlyContribution);
  const completed = target !== null && target > 0 && current !== null && current >= target;
  const remaining = target !== null && current !== null ? Math.max(0, target - current) : null;
  const rawProgress = target !== null && target > 0 && current !== null ? (current / target) * 100 : null;
  const progress = rawProgress === null || !Number.isFinite(rawProgress) ? null : Math.min(100, Math.max(0, rawProgress));
  const rawMonths =
    !completed && remaining !== null && remaining > 0 && contribution !== null && contribution > 0
      ? Math.ceil(remaining / contribution)
      : null;
  const months = rawMonths !== null && Number.isFinite(rawMonths) ? rawMonths : null;
  const goalName = safePlainText(goal.name, "Selected goal");
  const markdownGoalName = safeMarkdownText(goal.name, "Selected goal");
  const timeValue = completed ? "Complete" : months === null ? "Not estimable" : `${months} months`;
  const fundingSentence = completed
    ? `This goal is already funded in the supplied profile; the remaining modeled amount is **${safeNonNegativeCurrency(0, profile.currency)}**.`
    : months !== null
      ? `At the supplied monthly contribution of **${safeNonNegativeCurrency(contribution, profile.currency)}**, the remaining **${safeNonNegativeCurrency(remaining, profile.currency)}** takes about **${months} months**. This is deterministic remaining-amount math, not a dated forecast.`
      : "A finite positive monthly contribution is not supplied, so a completion time cannot be estimated without inventing an assumption.";

  return {
    title: "Goal progress",
    markdown: [
      introduction(normalized, "your goal progress"),
      `For **${markdownGoalName}**, the profile has **${safeNonNegativeCurrency(current, profile.currency)}** toward **${safeNonNegativeCurrency(target, profile.currency)}** (${safeNonNegativePercent(progress)}).`,
      fundingSentence,
      cashFlowSentence(cashFlow, profile.currency)
    ].join("\n\n"),
    evidence: [
      {
        label: "Goal progress",
        value: safeNonNegativePercent(progress),
        detail: `${goalName}: supplied current amount divided by supplied target amount.`
      },
      {
        label: "Current amount",
        value:
          current === null || target === null
            ? "Unavailable"
            : `${safeNonNegativeCurrency(current, profile.currency)} of ${safeNonNegativeCurrency(target, profile.currency)}`,
        detail: goalName
      },
      {
        label: "Remaining",
        value: safeNonNegativeCurrency(remaining, profile.currency),
        detail: "Target amount less current amount, floored at zero."
      },
      {
        label: "Time at current contribution",
        value: timeValue,
        detail: completed
          ? "The supplied current amount meets or exceeds the target."
          : months === null
            ? "A finite positive contribution is required for a month estimate."
            : `Remaining amount divided by the supplied ${safeNonNegativeCurrency(contribution, profile.currency)} monthly contribution.`
      }
    ],
    followUps: [
      `How much remains for ${goalName}?`,
      "What is the current monthly contribution?",
      "Which goals are high priority?",
      "How does my monthly surplus support goals?"
    ]
  };
}

function debtContent(request: NovaChatRequest, normalized: string): ResponseContent {
  const { profile, twin } = request;
  const validDebts = profile.debts.filter(
    (debt) =>
      nonNegativeNumber(debt.balance) !== null &&
      nonNegativeNumber(debt.monthlyPayment) !== null &&
      nonNegativeNumber(debt.apr) !== null
  );
  const invalidDebtCount = profile.debts.length - validDebts.length;
  const accountCount = validDebts.length;
  const totalDebt = accountCount
    ? sumNonNegative(validDebts.map((debt) => debt.balance))
    : profile.debts.length
      ? null
      : 0;
  const monthlyDebtPayment = accountCount
    ? sumNonNegative(validDebts.map((debt) => debt.monthlyPayment))
    : profile.debts.length
      ? null
      : 0;
  const debtRatio = invalidDebtCount ? null : nonNegativeNumber(twin.debtRatio);
  const highestAprDebt = validDebts.reduce<(typeof validDebts)[number] | null>((highest, debt) => {
    if (!highest) return debt;
    return debt.apr > highest.apr ? debt : highest;
  }, null);
  const invalidDebtDetail = invalidDebtCount
    ? ` ${invalidDebtCount} invalid debt row${invalidDebtCount === 1 ? " was" : "s were"} omitted.`
    : "";
  const evidence: NovaEvidence[] = [
    {
      label: "Total debt balance",
      value: safeNonNegativeCurrency(totalDebt, profile.currency),
      detail: accountCount
        ? `Sum of ${accountCount} valid supplied debt balance${accountCount === 1 ? "" : "s"}.${invalidDebtDetail}`
        : profile.debts.length
          ? `All supplied debt rows were invalid and omitted.${invalidDebtDetail}`
          : "No debt accounts are listed in the supplied profile."
    },
    {
      label: "Monthly debt payments",
      value: safeNonNegativeCurrency(monthlyDebtPayment, profile.currency),
      detail: accountCount
        ? `Sum of monthly payments from valid supplied debt rows.${invalidDebtDetail}`
        : "No valid debt-payment total is available."
    },
    {
      label: "Debt payment ratio",
      value: safeNonNegativePercent(debtRatio, 1),
      detail: invalidDebtCount
        ? "Unavailable because invalid debt rows were omitted from the evidence."
        : "Supplied financial-twin debt-payment ratio."
    },
    ...(highestAprDebt
      ? [
          {
            label: "Highest APR",
            value: safeNonNegativePercent(highestAprDebt.apr, 1),
            detail: `${safePlainText(highestAprDebt.label, "Debt account")} in the supplied debt list.`
          }
        ]
      : [])
  ];
  const debtSummary = accountCount
    ? `The valid supplied debt rows total **${safeNonNegativeCurrency(totalDebt, profile.currency)}** across **${accountCount}** account${accountCount === 1 ? "" : "s"}, with **${safeNonNegativeCurrency(monthlyDebtPayment, profile.currency)}** in monthly payments.${invalidDebtDetail}`
    : profile.debts.length
      ? `No valid debt accounts are available. All **${profile.debts.length}** supplied debt row${profile.debts.length === 1 ? " was" : "s were"} invalid and omitted, so no balance or APR is ranked.`
      : "No debt accounts are modeled in the supplied profile, so there is no balance or APR to rank.";
  const aprSummary = highestAprDebt
    ? `The highest valid listed APR is **${safeNonNegativePercent(highestAprDebt.apr, 1)}** on **${safeMarkdownText(highestAprDebt.label, "Debt account")}**. The modeled debt-payment ratio is **${safeNonNegativePercent(debtRatio, 1)}**.`
    : accountCount
      ? "No finite APR is available in the supplied debt list, so I will not name a highest-rate account."
      : profile.debts.length
        ? "Invalid debt rows are not used for totals, payment evidence, ratios, or APR rankings."
        : "The modeled monthly debt-payment total and ratio are both shown as supplied by the twin.";
  const followUps = highestAprDebt
    ? [
        "Which modeled debt has the highest APR?",
        "How much are my monthly debt payments?",
        "What is my debt payment ratio?",
        "How does debt affect my financial health?"
      ]
    : accountCount
      ? [
          "Which debt accounts need a valid APR?",
          "How much are my monthly debt payments?",
          "What is my debt payment ratio?",
          "How does debt affect my financial health?"
        ]
      : [
          "How should I record a new debt account?",
          "How much monthly surplus is modeled?",
          "Review my spending model.",
          "Summarize my financial health."
        ];

  return {
    title: "Debt position",
    markdown: [introduction(normalized, "your debt position"), debtSummary, aprSummary].join("\n\n"),
    evidence,
    followUps
  };
}

function healthEvidence(request: NovaChatRequest, cashFlow: SanitizedCashFlowSnapshot): NovaEvidence[] {
  const { profile, twin } = request;
  const riskScore = boundedScore(twin.risk.score);
  const riskLevel = safePlainText(twin.risk.level, "Unavailable");

  return [
    {
      label: "Financial health",
      value: safeScore(twin.financialHealth.score),
      detail: `${safePlainText(twin.financialHealth.band, "Unavailable")} band in the supplied twin.`
    },
    {
      label: "Risk",
      value: riskScore === null ? `${riskLevel} (score unavailable)` : `${riskLevel} (${Math.round(riskScore)}/100)`,
      detail: "Supplied deterministic risk result."
    },
    {
      label: "Net worth",
      value: safeCurrency(twin.netWorth, profile.currency),
      detail: "Supplied financial-twin net worth."
    },
    {
      label: "Monthly surplus",
      value: safeCurrency(cashFlow.monthlySurplus, profile.currency),
      detail: cashFlow.surplusDetail
    }
  ];
}

function healthContent(request: NovaChatRequest, normalized: string): ResponseContent {
  const { profile, twin } = request;
  const cashFlow = sanitizedCashFlowSnapshot(request);
  const score = boundedScore(twin.financialHealth.score);
  const scoreSentence =
    score === null
      ? "The supplied financial-health score is unavailable, so I will not substitute or estimate one."
      : `The supplied financial-health score is **${safeScore(score)}** in the **${safeMarkdownText(twin.financialHealth.band, "Unavailable")}** band, with **${safeMarkdownText(twin.risk.level, "Unavailable")}** modeled risk.`;

  return {
    title: "Financial health",
    markdown: [
      introduction(normalized, "your financial health"),
      scoreSentence,
      `Modeled net worth is **${safeCurrency(twin.netWorth, profile.currency)}**. ${cashFlowSentence(cashFlow, profile.currency)}`
    ].join("\n\n"),
    evidence: healthEvidence(request, cashFlow),
    followUps: [
      "Which factors drive my financial health score?",
      "How much monthly surplus is modeled?",
      "What is my current risk level?",
      "How does debt affect my financial health?"
    ]
  };
}

function generalContent(request: NovaChatRequest, normalized: string): ResponseContent {
  const { profile, twin } = request;
  const cashFlow = sanitizedCashFlowSnapshot(request);
  const cashFlowDisclosure = cashFlow.disclosure ? ` ${cashFlow.disclosure}` : "";

  return {
    title: "Financial twin snapshot",
    markdown: [
      introduction(normalized, "your financial snapshot"),
      "I can explain the supplied model across **spending**, **investments**, **goals**, **debt**, and **financial health**. I do not infer transactions or facts outside that model.",
      `The current snapshot shows **${safeScore(twin.financialHealth.score)}** financial health, **${safeCurrency(twin.netWorth, profile.currency)}** net worth, and **${safeCurrency(cashFlow.monthlySurplus, profile.currency)}** monthly surplus.${cashFlowDisclosure}`
    ].join("\n\n"),
    evidence: healthEvidence(request, cashFlow),
    followUps: [
      "Summarize my financial health.",
      "Review my modeled spending.",
      "Analyze my investment balances.",
      "How much debt is modeled?"
    ]
  };
}

export function createNovaResponse(request: NovaChatRequest): NovaChatResponse {
  const normalized = normalizeMessage(request.message);
  const intent = classifyNovaIntent(request.message);
  const content =
    intent === "spending"
      ? spendingContent(request, normalized)
      : intent === "investments"
        ? investmentContent(request, normalized)
        : intent === "goals"
          ? goalContent(request, normalized)
          : intent === "health"
            ? healthContent(request, normalized)
            : intent === "debt"
              ? debtContent(request, normalized)
              : generalContent(request, normalized);
  const idHash = stableHash(requestFingerprint(request, normalized)).toString(16).padStart(8, "0");

  return {
    id: `nova-${idHash}`,
    intent,
    ...content,
    markdown: ensureHistoryBoundary(content.markdown, normalized),
    boundary: EDUCATIONAL_BOUNDARY
  };
}
