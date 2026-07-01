import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import bcrypt from "bcryptjs";
import { compareScenario } from "../lib/financial/engine";
import { sampleProfile, scenarioLibrary } from "../lib/financial/sample-data";

const dbPath = join(process.cwd(), "prisma", "dev.db");
mkdirSync(dirname(dbPath), { recursive: true });

const db = new DatabaseSync(dbPath);
db.exec("PRAGMA foreign_keys = ON;");

db.exec(`
CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT,
  "email" TEXT NOT NULL,
  "emailVerified" DATETIME,
  "image" TEXT,
  "passwordHash" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");

CREATE TABLE IF NOT EXISTS "Account" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  "refresh_token" TEXT,
  "access_token" TEXT,
  "expires_at" INTEGER,
  "token_type" TEXT,
  "scope" TEXT,
  "id_token" TEXT,
  "session_state" TEXT,
  CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

CREATE TABLE IF NOT EXISTS "Session" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "sessionToken" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "expires" DATETIME NOT NULL,
  CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "Session_sessionToken_key" ON "Session"("sessionToken");

CREATE TABLE IF NOT EXISTS "VerificationToken" (
  "identifier" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "expires" DATETIME NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "VerificationToken_token_key" ON "VerificationToken"("token");
CREATE UNIQUE INDEX IF NOT EXISTS "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

CREATE TABLE IF NOT EXISTS "FinancialProfile" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "age" INTEGER NOT NULL,
  "country" TEXT NOT NULL,
  "currency" TEXT NOT NULL,
  "employment" TEXT NOT NULL,
  "riskTolerance" TEXT NOT NULL,
  "monthlySalary" REAL NOT NULL,
  "annualBonus" REAL NOT NULL,
  "monthlyExpenses" REAL NOT NULL,
  "cashSavings" REAL NOT NULL,
  "investments" REAL NOT NULL,
  "retirement" REAL NOT NULL,
  "realEstate" REAL NOT NULL,
  "creditLimit" REAL NOT NULL,
  "creditUsed" REAL NOT NULL,
  "dependents" INTEGER NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "FinancialProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "FinancialProfile_userId_key" ON "FinancialProfile"("userId");

CREATE TABLE IF NOT EXISTS "Debt" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "profileId" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "balance" REAL NOT NULL,
  "payment" REAL NOT NULL,
  "apr" REAL NOT NULL,
  "type" TEXT NOT NULL,
  CONSTRAINT "Debt_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "FinancialProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "Goal" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "profileId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "targetAmount" REAL NOT NULL,
  "currentAmount" REAL NOT NULL,
  "monthlyContribution" REAL NOT NULL,
  "targetDate" DATETIME NOT NULL,
  "priority" TEXT NOT NULL,
  CONSTRAINT "Goal_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "FinancialProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "Simulation" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "inputJson" TEXT NOT NULL,
  "resultJson" TEXT NOT NULL,
  "favorite" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Simulation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
`);

const now = new Date().toISOString();
const userId = "user_ahmed";
const profileId = "profile_ahmed";
const passwordHash = await bcrypt.hash("password123", 12);

db.exec(`
DELETE FROM "Simulation";
DELETE FROM "Goal";
DELETE FROM "Debt";
DELETE FROM "FinancialProfile";
DELETE FROM "User";
`);

db.prepare(
  `INSERT INTO "User" ("id", "name", "email", "passwordHash", "createdAt", "updatedAt") VALUES (?, ?, ?, ?, ?, ?)`
).run(userId, sampleProfile.name, "ahmed@example.com", passwordHash, now, now);

db.prepare(
  `INSERT INTO "FinancialProfile" (
    "id", "userId", "age", "country", "currency", "employment", "riskTolerance", "monthlySalary",
    "annualBonus", "monthlyExpenses", "cashSavings", "investments", "retirement", "realEstate",
    "creditLimit", "creditUsed", "dependents", "createdAt", "updatedAt"
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
).run(
  profileId,
  userId,
  sampleProfile.age,
  sampleProfile.country,
  sampleProfile.currency,
  sampleProfile.employment,
  sampleProfile.riskTolerance,
  sampleProfile.income.salaryMonthly,
  sampleProfile.income.bonusesAnnual,
  Object.values(sampleProfile.expenses).reduce((total, value) => total + value, 0),
  sampleProfile.assets.cash,
  sampleProfile.assets.investments,
  sampleProfile.assets.retirement,
  sampleProfile.assets.realEstate,
  sampleProfile.creditLimit,
  sampleProfile.creditUsed,
  sampleProfile.dependents,
  now,
  now
);

const debtInsert = db.prepare(
  `INSERT INTO "Debt" ("id", "profileId", "label", "balance", "payment", "apr", "type") VALUES (?, ?, ?, ?, ?, ?, ?)`
);
sampleProfile.debts.forEach((debt, index) => {
  debtInsert.run(`debt_${index}`, profileId, debt.label, debt.balance, debt.monthlyPayment, debt.apr, debt.type);
});

const goalInsert = db.prepare(
  `INSERT INTO "Goal" ("id", "profileId", "name", "category", "targetAmount", "currentAmount", "monthlyContribution", "targetDate", "priority") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
);
sampleProfile.goals.forEach((goal, index) => {
  goalInsert.run(
    `goal_${index}`,
    profileId,
    goal.name,
    goal.category,
    goal.targetAmount,
    goal.currentAmount,
    goal.monthlyContribution,
    new Date(goal.targetDate).toISOString(),
    goal.priority
  );
});

const simulationInsert = db.prepare(
  `INSERT INTO "Simulation" ("id", "userId", "name", "type", "inputJson", "resultJson", "favorite", "createdAt") VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
);
scenarioLibrary.slice(0, 4).forEach((scenario, index) => {
  simulationInsert.run(
    `simulation_${index}`,
    userId,
    scenario.name,
    scenario.type,
    JSON.stringify(scenario),
    JSON.stringify(compareScenario(sampleProfile, scenario)),
    index === 0 ? 1 : 0,
    now
  );
});

db.close();
console.log(`Created and seeded ${dbPath}`);
