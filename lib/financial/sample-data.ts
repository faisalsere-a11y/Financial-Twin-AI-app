import type { FinancialProfile, ScenarioInput } from "./types";

export const sampleProfile: FinancialProfile = {
  id: "profile-ahmed",
  name: "Ahmed Al-Harbi",
  initials: "AH",
  age: 34,
  country: "Saudi Arabia",
  currency: "SAR",
  employment: "Full-time",
  riskTolerance: "Medium",
  dependents: 1,
  creditLimit: 42000,
  creditUsed: 13800,
  insuranceCoverageMonthly: 620,
  income: {
    salaryMonthly: 16500,
    bonusesAnnual: 24000,
    otherMonthly: 0,
    stabilityScore: 88
  },
  expenses: {
    housing: 4200,
    food: 1800,
    transport: 1100,
    utilities: 620,
    subscriptions: 330,
    insurance: 620,
    education: 850,
    lifestyle: 1950,
    children: 980,
    other: 350
  },
  debts: [
    {
      label: "Personal Loan",
      balance: 84000,
      monthlyPayment: 2200,
      apr: 5.2,
      type: "personal-loan"
    },
    {
      label: "Credit Card",
      balance: 13800,
      monthlyPayment: 900,
      apr: 27,
      type: "credit-card"
    },
    {
      label: "Education Finance",
      balance: 44200,
      monthlyPayment: 400,
      apr: 3.1,
      type: "education"
    }
  ],
  assets: {
    cash: 52000,
    investments: 92000,
    retirement: 118000,
    realEstate: 198450,
    other: 2000
  },
  goals: [
    {
      id: "goal-emergency",
      name: "Emergency Fund",
      category: "Emergency",
      targetAmount: 90000,
      currentAmount: 52000,
      monthlyContribution: 2500,
      targetDate: "2027-11-01",
      priority: "High"
    },
    {
      id: "goal-house",
      name: "House Down Payment",
      category: "House",
      targetAmount: 280000,
      currentAmount: 98000,
      monthlyContribution: 3500,
      targetDate: "2029-04-01",
      priority: "High"
    },
    {
      id: "goal-retirement",
      name: "Retirement Portfolio",
      category: "Retirement",
      targetAmount: 1800000,
      currentAmount: 210000,
      monthlyContribution: 2200,
      targetDate: "2049-01-01",
      priority: "Medium"
    },
    {
      id: "goal-vacation",
      name: "Japan Family Trip",
      category: "Vacation",
      targetAmount: 42000,
      currentAmount: 16500,
      monthlyContribution: 1500,
      targetDate: "2027-07-01",
      priority: "Low"
    }
  ]
};

export const sampleScenario: ScenarioInput = {
  id: "scenario-buy-car",
  name: "Buy a Car",
  type: "car",
  upfrontCost: 35000,
  assetDelta: 142000,
  liabilityDelta: 107000,
  monthlyIncomeDelta: 0,
  monthlyExpenseDelta: 820,
  monthlyDebtPaymentDelta: 1650,
  annualReturnDelta: 0,
  durationMonths: 60,
  tags: ["Possible in 3m", "Transport", "Medium risk"]
};

export const scenarioLibrary: ScenarioInput[] = [
  sampleScenario,
  {
    id: "scenario-start-investment",
    name: "Start Investment",
    type: "investment",
    upfrontCost: 0,
    assetDelta: 0,
    liabilityDelta: 0,
    monthlyIncomeDelta: 0,
    monthlyExpenseDelta: 1200,
    monthlyDebtPaymentDelta: 0,
    annualReturnDelta: 7.5,
    durationMonths: 120,
    tags: ["Recommended", "+12% annual return", "Wealth"]
  },
  {
    id: "scenario-take-loan",
    name: "Take a Loan",
    type: "loan",
    upfrontCost: 0,
    assetDelta: 0,
    liabilityDelta: 25000,
    monthlyIncomeDelta: 0,
    monthlyExpenseDelta: 0,
    monthlyDebtPaymentDelta: 800,
    annualReturnDelta: 0,
    durationMonths: 36,
    tags: ["High Risk", "+25k now", "Debt"]
  },
  {
    id: "scenario-buy-home",
    name: "Buy a Home",
    type: "house",
    upfrontCost: 120000,
    assetDelta: 980000,
    liabilityDelta: 860000,
    monthlyIncomeDelta: 0,
    monthlyExpenseDelta: 1850,
    monthlyDebtPaymentDelta: 3200,
    annualReturnDelta: 2.4,
    durationMonths: 300,
    tags: ["Possible in 2y", "High commitment", "Housing"]
  },
  {
    id: "scenario-salary-increase",
    name: "Increase Salary",
    type: "salary",
    upfrontCost: 0,
    assetDelta: 0,
    liabilityDelta: 0,
    monthlyIncomeDelta: 2400,
    monthlyExpenseDelta: 250,
    monthlyDebtPaymentDelta: 0,
    annualReturnDelta: 0,
    durationMonths: 12,
    tags: ["Upside", "+2.4k SAR/mo", "Career"]
  },
  {
    id: "scenario-emergency",
    name: "Emergency Expense",
    type: "emergency",
    upfrontCost: 18000,
    assetDelta: 0,
    liabilityDelta: 0,
    monthlyIncomeDelta: 0,
    monthlyExpenseDelta: 0,
    monthlyDebtPaymentDelta: 0,
    annualReturnDelta: 0,
    durationMonths: 1,
    tags: ["Stress test", "-18k savings", "Risk"]
  }
];

export const activityFeed = [
  "Investment scenario improved health score by 4 points",
  "Emergency fund target moved 2 months earlier",
  "Debt ratio alert triggered after car simulation",
  "Quarterly report exported as CSV",
  "AI advisor recommended increasing down payment to 50,000 SAR"
];
