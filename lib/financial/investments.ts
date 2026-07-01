import { clamp } from "../utils";
import type { InvestmentProjectionInput, InvestmentProjectionPoint } from "./types";

export interface InvestmentProjectionResult {
  points: InvestmentProjectionPoint[];
  futureValue: number;
  totalContributions: number;
  gain: number;
}

export interface MonteCarloInput extends InvestmentProjectionInput {
  iterations: number;
  seed?: number;
}

export interface MonteCarloResult {
  p10: number;
  median: number;
  p90: number;
  paths: Array<{
    month: number;
    pessimistic: number;
    expected: number;
    optimistic: number;
  }>;
}

function compoundMonthly(input: InvestmentProjectionInput, returnAdjustment = 0) {
  const monthlyRate = (input.annualReturn + returnAdjustment) / 100 / 12;
  const months = input.years * 12;
  let value = input.initialAmount;

  for (let month = 1; month <= months; month += 1) {
    value = value * (1 + monthlyRate) + input.monthlyContribution;
  }

  return value;
}

export function runInvestmentProjection(input: InvestmentProjectionInput): InvestmentProjectionResult {
  const points = Array.from({ length: input.years + 1 }, (_, year) => {
    const scoped = { ...input, years: year };
    const contributions = input.initialAmount + input.monthlyContribution * year * 12;
    return {
      year,
      conservative: Math.round(compoundMonthly(scoped, -input.volatility * 0.35)),
      expected: Math.round(compoundMonthly(scoped)),
      optimistic: Math.round(compoundMonthly(scoped, input.volatility * 0.35)),
      contributions
    };
  });
  const futureValue = Math.round(points.at(-1)?.expected ?? input.initialAmount);
  const totalContributions = input.initialAmount + input.monthlyContribution * input.years * 12;

  return {
    points,
    futureValue,
    totalContributions,
    gain: futureValue - totalContributions
  };
}

function seededRandom(seed: number) {
  let state = seed % 2147483647;
  if (state <= 0) state += 2147483646;
  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

function normal(random: () => number) {
  const u = Math.max(random(), 0.00001);
  const v = Math.max(random(), 0.00001);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function percentile(values: number[], pct: number) {
  const sorted = [...values].sort((a, b) => a - b);
  const index = clamp(Math.floor((pct / 100) * (sorted.length - 1)), 0, sorted.length - 1);
  return Math.round(sorted[index] ?? 0);
}

export function runMonteCarlo(input: MonteCarloInput): MonteCarloResult {
  const random = seededRandom(input.seed ?? Date.now());
  const months = input.years * 12;
  const finals: number[] = [];
  const snapshots: number[][] = Array.from({ length: 24 }, () => []);

  for (let iteration = 0; iteration < input.iterations; iteration += 1) {
    let value = input.initialAmount;
    for (let month = 1; month <= months; month += 1) {
      const yearlyShock = input.annualReturn + normal(random) * input.volatility;
      const monthlyRate = yearlyShock / 100 / 12;
      value = Math.max(0, value * (1 + monthlyRate) + input.monthlyContribution);
      const snapshotIndex = Math.floor(((month - 1) / months) * snapshots.length);
      snapshots[snapshotIndex]?.push(value);
    }
    finals.push(value);
  }

  return {
    p10: percentile(finals, 10),
    median: percentile(finals, 50),
    p90: percentile(finals, 90),
    paths: snapshots.map((values, index) => ({
      month: Math.round(((index + 1) / snapshots.length) * months),
      pessimistic: percentile(values, 10),
      expected: percentile(values, 50),
      optimistic: percentile(values, 90)
    }))
  };
}
