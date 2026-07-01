export type CurrencyCode = "SAR" | "USD" | "EUR" | "AED";

export type RiskLevel = "Low" | "Medium" | "High";
export type HealthBand = "Excellent" | "Good" | "Fair" | "Poor";

export type EmploymentType =
  | "Full-time"
  | "Founder"
  | "Contract"
  | "Government"
  | "Self-employed"
  | "Unemployed";

export interface IncomeModel {
  salaryMonthly: number;
  bonusesAnnual: number;
  otherMonthly: number;
  stabilityScore: number;
}

export interface ExpenseModel {
  housing: number;
  food: number;
  transport: number;
  utilities: number;
  subscriptions: number;
  insurance: number;
  education: number;
  lifestyle: number;
  children: number;
  other: number;
}

export interface DebtModel {
  label: string;
  balance: number;
  monthlyPayment: number;
  apr: number;
  type: "credit-card" | "personal-loan" | "mortgage" | "auto-loan" | "education";
}

export interface AssetModel {
  cash: number;
  investments: number;
  retirement: number;
  realEstate: number;
  other: number;
}

export interface GoalModel {
  id: string;
  name: string;
  category: "Emergency" | "Retirement" | "House" | "Wedding" | "Vacation" | "Education";
  targetAmount: number;
  currentAmount: number;
  monthlyContribution: number;
  targetDate: string;
  priority: "High" | "Medium" | "Low";
}

export interface FinancialProfile {
  id: string;
  name: string;
  initials: string;
  age: number;
  country: string;
  currency: CurrencyCode;
  employment: EmploymentType;
  riskTolerance: RiskLevel;
  income: IncomeModel;
  expenses: ExpenseModel;
  debts: DebtModel[];
  assets: AssetModel;
  goals: GoalModel[];
  creditLimit: number;
  creditUsed: number;
  dependents: number;
  insuranceCoverageMonthly: number;
}

export interface ScenarioInput {
  id: string;
  name: string;
  type:
    | "car"
    | "house"
    | "loan"
    | "investment"
    | "salary"
    | "job-loss"
    | "family"
    | "education"
    | "emergency"
    | "travel"
    | "retirement";
  upfrontCost: number;
  assetDelta: number;
  liabilityDelta: number;
  monthlyIncomeDelta: number;
  monthlyExpenseDelta: number;
  monthlyDebtPaymentDelta: number;
  annualReturnDelta: number;
  durationMonths: number;
  tags: string[];
}

export interface RiskResult {
  score: number;
  level: RiskLevel;
  explanation: string;
  factors: Array<{
    label: string;
    score: number;
    status: RiskLevel;
    detail: string;
  }>;
}

export interface FinancialHealthResult {
  score: number;
  band: HealthBand;
  drivers: Array<{
    label: string;
    value: number;
    impact: "positive" | "neutral" | "negative";
  }>;
}

export interface TimelinePoint {
  month: string;
  income: number;
  expenses: number;
  savings: number;
  debt: number;
  investments: number;
  netWorth: number;
  cashFlow: number;
}

export interface FinancialTwinResult {
  profile: FinancialProfile;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyDebtPayment: number;
  monthlySurplus: number;
  debtRatio: number;
  savingsRate: number;
  emergencyFundMonths: number;
  netWorth: number;
  risk: RiskResult;
  financialHealth: FinancialHealthResult;
  timeline: TimelinePoint[];
}

export interface ScenarioComparison {
  scenario: ScenarioInput;
  current: FinancialTwinResult;
  after: FinancialTwinResult;
  delta: {
    monthlySurplus: number;
    debtPayment: number;
    riskScore: number;
    healthScore: number;
    netWorth12Month: number;
    savings12Month: number;
  };
  recommendations: string[];
}

export interface InvestmentProjectionInput {
  initialAmount: number;
  monthlyContribution: number;
  annualReturn: number;
  years: number;
  volatility: number;
}

export interface InvestmentProjectionPoint {
  year: number;
  conservative: number;
  expected: number;
  optimistic: number;
  contributions: number;
}
