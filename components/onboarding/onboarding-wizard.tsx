"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectItem } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { AppPageHeader } from "@/components/layout/app-shell";

const onboardingSchema = z.object({
  age: z.coerce.number().min(18).max(90),
  country: z.string().min(2),
  currency: z.string().min(3),
  employment: z.string().min(2),
  salary: z.coerce.number().min(0),
  bonuses: z.coerce.number().min(0),
  monthlyIncome: z.coerce.number().min(0),
  housing: z.coerce.number().min(0),
  expenses: z.coerce.number().min(0),
  subscriptions: z.coerce.number().min(0),
  loanBalance: z.coerce.number().min(0),
  loanPayment: z.coerce.number().min(0),
  creditCardBalance: z.coerce.number().min(0),
  creditLimit: z.coerce.number().min(0),
  savings: z.coerce.number().min(0),
  investments: z.coerce.number().min(0),
  insurance: z.coerce.number().min(0),
  children: z.coerce.number().min(0),
  emergencyFund: z.coerce.number().min(0),
  goal: z.string().min(2),
  goalAmount: z.coerce.number().min(0),
  riskTolerance: z.enum(["Low", "Medium", "High"])
});

type OnboardingValues = z.infer<typeof onboardingSchema>;

const steps = [
  {
    title: "Profile",
    fields: ["age", "country", "currency", "employment", "children"] as const
  },
  {
    title: "Income",
    fields: ["salary", "bonuses", "monthlyIncome"] as const
  },
  {
    title: "Outflow",
    fields: ["housing", "expenses", "subscriptions", "insurance"] as const
  },
  {
    title: "Debt & Assets",
    fields: ["loanBalance", "loanPayment", "creditCardBalance", "creditLimit", "savings", "investments"] as const
  },
  {
    title: "Goals & Risk",
    fields: ["emergencyFund", "goal", "goalAmount", "riskTolerance"] as const
  }
];

const defaults: OnboardingValues = {
  age: 34,
  country: "Saudi Arabia",
  currency: "SAR",
  employment: "Full-time",
  salary: 16500,
  bonuses: 24000,
  monthlyIncome: 18500,
  housing: 4200,
  expenses: 8600,
  subscriptions: 330,
  loanBalance: 84000,
  loanPayment: 2200,
  creditCardBalance: 13800,
  creditLimit: 42000,
  savings: 52000,
  investments: 92000,
  insurance: 620,
  children: 1,
  emergencyFund: 52000,
  goal: "House Down Payment",
  goalAmount: 280000,
  riskTolerance: "Medium"
};

function Field({
  label,
  children
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

export function OnboardingWizard() {
  const [step, setStep] = useState(0);
  const form = useForm<OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: defaults
  });
  const values = form.watch();
  const progress = ((step + 1) / steps.length) * 100;
  const monthlySurplus = useMemo(
    () => values.monthlyIncome - values.housing - values.expenses - values.subscriptions - values.insurance - values.loanPayment,
    [values]
  );

  const next = async () => {
    const valid = await form.trigger(steps[step]?.fields as never);
    if (valid) setStep((current) => Math.min(steps.length - 1, current + 1));
  };

  const submit = form.handleSubmit(() => {
    toast.success("Financial twin profile saved for this demo.");
  });

  return (
    <div className="mx-auto max-w-5xl">
      <AppPageHeader
        title="Onboarding Wizard"
        description="Build the initial financial twin from income, expenses, subscriptions, debt, savings, investments, insurance, children, goals, and risk tolerance."
      />
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle className="normal-case tracking-normal">{steps[step]?.title}</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">Step {step + 1} of {steps.length}</p>
            </div>
            <div className="w-40">
              <Progress value={progress} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="grid gap-6">
            {step === 0 && (
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Age"><Input type="number" {...form.register("age")} /></Field>
                <Field label="Country"><Input {...form.register("country")} /></Field>
                <Field label="Currency"><Select value={values.currency} onValueChange={(value) => form.setValue("currency", value)}><SelectItem value="SAR">SAR</SelectItem><SelectItem value="USD">USD</SelectItem><SelectItem value="AED">AED</SelectItem></Select></Field>
                <Field label="Employment"><Select value={values.employment} onValueChange={(value) => form.setValue("employment", value)}><SelectItem value="Full-time">Full-time</SelectItem><SelectItem value="Government">Government</SelectItem><SelectItem value="Founder">Founder</SelectItem><SelectItem value="Self-employed">Self-employed</SelectItem></Select></Field>
                <Field label="Children"><Input type="number" {...form.register("children")} /></Field>
              </div>
            )}
            {step === 1 && (
              <div className="grid gap-4 md:grid-cols-3">
                <Field label="Salary"><Input type="number" {...form.register("salary")} /></Field>
                <Field label="Annual Bonuses"><Input type="number" {...form.register("bonuses")} /></Field>
                <Field label="Monthly Income"><Input type="number" {...form.register("monthlyIncome")} /></Field>
              </div>
            )}
            {step === 2 && (
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Housing"><Input type="number" {...form.register("housing")} /></Field>
                <Field label="Expenses"><Input type="number" {...form.register("expenses")} /></Field>
                <Field label="Subscriptions"><Input type="number" {...form.register("subscriptions")} /></Field>
                <Field label="Insurance"><Input type="number" {...form.register("insurance")} /></Field>
              </div>
            )}
            {step === 3 && (
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Loans"><Input type="number" {...form.register("loanBalance")} /></Field>
                <Field label="Loan Monthly Payment"><Input type="number" {...form.register("loanPayment")} /></Field>
                <Field label="Credit Cards"><Input type="number" {...form.register("creditCardBalance")} /></Field>
                <Field label="Credit Limit"><Input type="number" {...form.register("creditLimit")} /></Field>
                <Field label="Savings"><Input type="number" {...form.register("savings")} /></Field>
                <Field label="Investments"><Input type="number" {...form.register("investments")} /></Field>
              </div>
            )}
            {step === 4 && (
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Emergency Fund"><Input type="number" {...form.register("emergencyFund")} /></Field>
                <Field label="Primary Goal"><Input {...form.register("goal")} /></Field>
                <Field label="Goal Amount"><Input type="number" {...form.register("goalAmount")} /></Field>
                <Field label="Risk Tolerance"><Select value={values.riskTolerance} onValueChange={(value) => form.setValue("riskTolerance", value as OnboardingValues["riskTolerance"])}><SelectItem value="Low">Low</SelectItem><SelectItem value="Medium">Medium</SelectItem><SelectItem value="High">High</SelectItem></Select></Field>
              </div>
            )}
            <div className="rounded-xl border border-primary/20 bg-primary/10 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">Live twin preview</p>
              <p className="mt-2 text-2xl font-black">{monthlySurplus.toLocaleString()} SAR monthly surplus</p>
              <p className="text-sm text-muted-foreground">This updates as your onboarding inputs change.</p>
            </div>
            <div className="flex items-center justify-between">
              <Button type="button" variant="secondary" disabled={step === 0} onClick={() => setStep((current) => Math.max(0, current - 1))}>
                <ArrowLeft data-icon="inline-start" />
                Back
              </Button>
              {step < steps.length - 1 ? (
                <Button type="button" onClick={next}>
                  Continue
                  <ArrowRight data-icon="inline-end" />
                </Button>
              ) : (
                <Button type="submit">
                  <CheckCircle2 data-icon="inline-start" />
                  Save Twin
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
