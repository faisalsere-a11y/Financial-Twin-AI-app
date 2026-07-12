"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, CheckCircle2, Database, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectItem } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { NovaOrb } from "@/components/brand/nova-orb";
import { AppPageHeader } from "@/components/layout/app-shell";
import { calculateFinancialTwin } from "@/lib/financial/engine";
import {
  onboardingSchema,
  onboardingSteps,
  onboardingToFinancialProfile,
  profileToOnboardingValues,
  type OnboardingValues
} from "@/lib/profile/onboarding";
import { useFinancialProfile } from "@/lib/profile/use-financial-profile";
import { cn, formatCurrency, formatPercent } from "@/lib/utils";

type FieldProps = {
  name: FieldPath<OnboardingValues>;
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
};

function FormField({ name, label, hint, error, children }: FieldProps) {
  const errorId = `${name}-error`;
  const hintId = `${name}-hint`;
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={name}>{label}</Label>
      {hint && <p id={hintId} className="text-xs leading-5 text-muted-foreground">{hint}</p>}
      {children}
      {error && <p id={errorId} role="alert" className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

export function OnboardingWizard() {
  const activeProfile = useFinancialProfile();
  const { subject, isLoaded, savedAt } = activeProfile;
  const profileKey = `${subject}:${savedAt ?? "sample"}`;
  if (!subject || !isLoaded) {
    return <div aria-live="polite"><AppPageHeader title="Build your financial twin" description="Loading the active account model." /><Card><CardContent className="p-6 text-sm text-muted-foreground">Waiting for an authenticated account.</CardContent></Card></div>;
  }
  return <SubjectOnboardingWizard key={profileKey} activeProfile={activeProfile} />;
}

function SubjectOnboardingWizard({ activeProfile }: { activeProfile: ReturnType<typeof useFinancialProfile> }) {
  const router = useRouter();
  const { profile, source, subject, savedAt, isLoaded, save } = activeProfile;
  const hydratedSubject = useRef<string | null>(null);
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState<{ kind: "success" | "error"; message: string } | null>(null);
  const form = useForm<OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: profileToOnboardingValues(profile),
    mode: "onBlur"
  });
  const values = form.watch();
  const progress = ((step + 1) / onboardingSteps.length) * 100;

  useEffect(() => {
    if (!isLoaded || !subject || hydratedSubject.current === subject) return;
    form.reset(profileToOnboardingValues(profile));
    setStep(0);
    setStatus(null);
    hydratedSubject.current = subject;
  }, [form, isLoaded, profile, subject]);

  const previewProfile = useMemo(() => {
    const parsed = onboardingSchema.safeParse(values);
    return parsed.success ? onboardingToFinancialProfile(parsed.data, profile) : profile;
  }, [profile, values]);
  const twin = useMemo(() => calculateFinancialTwin(previewProfile), [previewProfile]);

  const errorFor = (name: FieldPath<OnboardingValues>) => form.formState.errors[name]?.message as string | undefined;
  const describedBy = (name: FieldPath<OnboardingValues>, hint = false) => {
    const ids = [hint ? `${name}-hint` : null, errorFor(name) ? `${name}-error` : null].filter(Boolean);
    return ids.length ? ids.join(" ") : undefined;
  };
  const numberRegistration = (name: FieldPath<OnboardingValues>) => form.register(name, { valueAsNumber: true });

  const next = async () => {
    setStatus(null);
    const current = onboardingSteps[step];
    if (!current) return;
    const valid = await form.trigger([...current.fields]);
    if (!valid) {
      const firstInvalid = current.fields.find((field) => form.getFieldState(field).invalid);
      if (firstInvalid) form.setFocus(firstInvalid);
      return;
    }
    setStep((currentStep) => Math.min(onboardingSteps.length - 1, currentStep + 1));
  };

  const submit = form.handleSubmit((submittedValues) => {
    try {
      const updatedProfile = onboardingToFinancialProfile(submittedValues, profile);
      save(updatedProfile);
      setStatus({ kind: "success", message: "Saved in this browser. Opening your updated dashboard." });
      router.push("/dashboard");
    } catch {
      setStatus({ kind: "error", message: "Your model could not be saved in this browser. Check storage access and try again." });
    }
  });

  return (
    <div className="mx-auto max-w-7xl">
      <AppPageHeader
        title="Build your financial twin"
        description="Turn income, outflow, debt, assets, goals, and risk comfort into one inspectable financial model."
      />

      <div className="mb-6 rounded-2xl border border-primary/20 bg-primary/10 p-4 sm:flex sm:items-center sm:justify-between sm:gap-4">
        <div className="flex items-start gap-3">
          <Database className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
          <div>
            <p className="text-sm font-black text-foreground">Browser-saved model</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {source === "saved" ? "Editing the profile previously saved on this device." : "Starting from the bundled sample profile."} No bank connection or background synchronization is implied.
            </p>
          </div>
        </div>
        <p className="mt-3 text-xs font-bold text-muted-foreground sm:mt-0">
          {savedAt ? `Last saved ${new Date(savedAt).toLocaleString()}` : "Not yet saved on this device"}
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem] xl:items-start">
        <Card className="overflow-visible">
          <CardHeader className="gap-5 border-b border-border p-5 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.14em] text-primary">Step {step + 1} of {onboardingSteps.length}</p>
                <CardTitle className="mt-2 text-2xl normal-case tracking-tight">{onboardingSteps[step]?.title}</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">{onboardingSteps[step]?.summary}</p>
              </div>
              <div className="w-full sm:w-52">
                <Progress value={progress} aria-label={`${Math.round(progress)}% complete`} />
              </div>
            </div>

            <ol aria-label="Financial model steps" className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {onboardingSteps.map((item, index) => (
                <li key={item.id}>
                  <button
                    type="button"
                    aria-current={index === step ? "step" : undefined}
                    disabled={index > step}
                    onClick={() => setStep(index)}
                    className={cn(
                      "flex min-h-11 w-full items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-45",
                      index === step ? "border-primary/30 bg-primary/10 text-foreground" : "border-border bg-card text-muted-foreground"
                    )}
                  >
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-[10px]">{index + 1}</span>
                    <span className="truncate">{item.title}</span>
                  </button>
                </li>
              ))}
            </ol>
          </CardHeader>

          <CardContent className="p-5 sm:p-6">
            <form onSubmit={submit} noValidate className="grid gap-7">
              {step === 0 && (
                <fieldset className="grid gap-5 md:grid-cols-2">
                  <legend className="sr-only">Profile and household context</legend>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="age">Age</Label>
                    <Input id="age" type="number" min={18} max={90} inputMode="numeric" aria-invalid={Boolean(errorFor("age"))} aria-describedby={errorFor("age") ? "age-error" : undefined} {...numberRegistration("age")} />
                    {errorFor("age") && <p id="age-error" role="alert" className="text-sm text-destructive">{errorFor("age")}</p>}
                  </div>
                  <FormField name="country" label="Country" hint="Used for regional context; it does not connect an account." error={errorFor("country")}>
                    <Input id="country" autoComplete="country-name" aria-invalid={Boolean(errorFor("country"))} aria-describedby={describedBy("country", true)} {...form.register("country")} />
                  </FormField>
                  <FormField name="currency" label="Model currency" error={errorFor("currency")}>
                    <Select id="currency" aria-invalid={Boolean(errorFor("currency"))} aria-describedby={describedBy("currency")} {...form.register("currency")}>
                      <SelectItem value="SAR">SAR — Saudi Riyal</SelectItem><SelectItem value="USD">USD — US Dollar</SelectItem><SelectItem value="EUR">EUR — Euro</SelectItem><SelectItem value="AED">AED — UAE Dirham</SelectItem>
                    </Select>
                  </FormField>
                  <FormField name="employment" label="Employment" error={errorFor("employment")}>
                    <Select id="employment" aria-invalid={Boolean(errorFor("employment"))} aria-describedby={describedBy("employment")} {...form.register("employment")}>
                      <SelectItem value="Full-time">Full-time</SelectItem><SelectItem value="Government">Government</SelectItem><SelectItem value="Founder">Founder</SelectItem><SelectItem value="Contract">Contract</SelectItem><SelectItem value="Self-employed">Self-employed</SelectItem><SelectItem value="Unemployed">Unemployed</SelectItem>
                    </Select>
                  </FormField>
                  <FormField name="children" label="Dependents" error={errorFor("children")}>
                    <Input id="children" type="number" min={0} inputMode="numeric" aria-invalid={Boolean(errorFor("children"))} aria-describedby={describedBy("children")} {...numberRegistration("children")} />
                  </FormField>
                </fieldset>
              )}

              {step === 1 && (
                <fieldset className="grid gap-5 md:grid-cols-2">
                  <legend className="sr-only">Income</legend>
                  <FormField name="salary" label="Monthly salary" error={errorFor("salary")}><Input id="salary" type="number" min={0} inputMode="decimal" aria-invalid={Boolean(errorFor("salary"))} aria-describedby={describedBy("salary")} {...numberRegistration("salary")} /></FormField>
                  <FormField name="bonuses" label="Annual bonuses" error={errorFor("bonuses")}><Input id="bonuses" type="number" min={0} inputMode="decimal" aria-invalid={Boolean(errorFor("bonuses"))} aria-describedby={describedBy("bonuses")} {...numberRegistration("bonuses")} /></FormField>
                  <FormField name="monthlyIncome" label="Total monthly income" hint="Include salary, the monthly share of bonuses, and reliable other income." error={errorFor("monthlyIncome")}><Input id="monthlyIncome" type="number" min={0} inputMode="decimal" aria-invalid={Boolean(errorFor("monthlyIncome"))} aria-describedby={describedBy("monthlyIncome", true)} {...numberRegistration("monthlyIncome")} /></FormField>
                </fieldset>
              )}

              {step === 2 && (
                <fieldset className="grid gap-5 md:grid-cols-2">
                  <legend className="sr-only">Monthly outflow</legend>
                  <FormField name="housing" label="Housing" error={errorFor("housing")}><Input id="housing" type="number" min={0} inputMode="decimal" aria-invalid={Boolean(errorFor("housing"))} aria-describedby={describedBy("housing")} {...numberRegistration("housing")} /></FormField>
                  <FormField name="expenses" label="Living expenses" hint="Food, transport, utilities, education, lifestyle, dependents, and other costs." error={errorFor("expenses")}><Input id="expenses" type="number" min={0} inputMode="decimal" aria-invalid={Boolean(errorFor("expenses"))} aria-describedby={describedBy("expenses", true)} {...numberRegistration("expenses")} /></FormField>
                  <FormField name="subscriptions" label="Subscriptions" error={errorFor("subscriptions")}><Input id="subscriptions" type="number" min={0} inputMode="decimal" aria-invalid={Boolean(errorFor("subscriptions"))} aria-describedby={describedBy("subscriptions")} {...numberRegistration("subscriptions")} /></FormField>
                  <FormField name="insurance" label="Insurance" error={errorFor("insurance")}><Input id="insurance" type="number" min={0} inputMode="decimal" aria-invalid={Boolean(errorFor("insurance"))} aria-describedby={describedBy("insurance")} {...numberRegistration("insurance")} /></FormField>
                </fieldset>
              )}

              {step === 3 && (
                <fieldset className="grid gap-5 md:grid-cols-2">
                  <legend className="sr-only">Debt and assets</legend>
                  <FormField name="loanBalance" label="Personal loan balance" error={errorFor("loanBalance")}><Input id="loanBalance" type="number" min={0} inputMode="decimal" aria-invalid={Boolean(errorFor("loanBalance"))} aria-describedby={describedBy("loanBalance")} {...numberRegistration("loanBalance")} /></FormField>
                  <FormField name="loanPayment" label="Personal loan monthly payment" error={errorFor("loanPayment")}><Input id="loanPayment" type="number" min={0} inputMode="decimal" aria-invalid={Boolean(errorFor("loanPayment"))} aria-describedby={describedBy("loanPayment")} {...numberRegistration("loanPayment")} /></FormField>
                  <FormField name="creditCardBalance" label="Credit card balance" error={errorFor("creditCardBalance")}><Input id="creditCardBalance" type="number" min={0} inputMode="decimal" aria-invalid={Boolean(errorFor("creditCardBalance"))} aria-describedby={describedBy("creditCardBalance")} {...numberRegistration("creditCardBalance")} /></FormField>
                  <FormField name="creditLimit" label="Total credit limit" error={errorFor("creditLimit")}><Input id="creditLimit" type="number" min={0} inputMode="decimal" aria-invalid={Boolean(errorFor("creditLimit"))} aria-describedby={describedBy("creditLimit")} {...numberRegistration("creditLimit")} /></FormField>
                  <FormField name="savings" label="Cash savings" error={errorFor("savings")}><Input id="savings" type="number" min={0} inputMode="decimal" aria-invalid={Boolean(errorFor("savings"))} aria-describedby={describedBy("savings")} {...numberRegistration("savings")} /></FormField>
                  <FormField name="investments" label="Investments" error={errorFor("investments")}><Input id="investments" type="number" min={0} inputMode="decimal" aria-invalid={Boolean(errorFor("investments"))} aria-describedby={describedBy("investments")} {...numberRegistration("investments")} /></FormField>
                </fieldset>
              )}

              {step === 4 && (
                <fieldset className="grid gap-5 md:grid-cols-2">
                  <legend className="sr-only">Goals and risk comfort</legend>
                  <FormField name="emergencyFund" label="Emergency fund allocated" error={errorFor("emergencyFund")}><Input id="emergencyFund" type="number" min={0} inputMode="decimal" aria-invalid={Boolean(errorFor("emergencyFund"))} aria-describedby={describedBy("emergencyFund")} {...numberRegistration("emergencyFund")} /></FormField>
                  <FormField name="goal" label="Primary goal" error={errorFor("goal")}><Input id="goal" aria-invalid={Boolean(errorFor("goal"))} aria-describedby={describedBy("goal")} {...form.register("goal")} /></FormField>
                  <FormField name="goalAmount" label="Goal target" error={errorFor("goalAmount")}><Input id="goalAmount" type="number" min={0} inputMode="decimal" aria-invalid={Boolean(errorFor("goalAmount"))} aria-describedby={describedBy("goalAmount")} {...numberRegistration("goalAmount")} /></FormField>
                  <FormField name="riskTolerance" label="Risk comfort" hint="This is your stated comfort, not a suitability assessment." error={errorFor("riskTolerance")}>
                    <Select id="riskTolerance" aria-invalid={Boolean(errorFor("riskTolerance"))} aria-describedby={describedBy("riskTolerance", true)} {...form.register("riskTolerance")}><SelectItem value="Low">Low</SelectItem><SelectItem value="Medium">Medium</SelectItem><SelectItem value="High">High</SelectItem></Select>
                  </FormField>
                </fieldset>
              )}

              {status && (
                <div aria-live="polite" role={status.kind === "error" ? "alert" : "status"} className={status.kind === "error" ? "rounded-xl border border-destructive/25 bg-destructive/10 p-3 text-sm text-destructive" : "rounded-xl border border-positive/25 bg-positive/10 p-3 text-sm text-positive"}>
                  {status.message}
                </div>
              )}

              <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
                <Button type="button" variant="outline" disabled={step === 0} onClick={() => { setStatus(null); setStep((current) => Math.max(0, current - 1)); }}>
                  <ArrowLeft data-icon="inline-start" aria-hidden="true" />Back
                </Button>
                {step < onboardingSteps.length - 1 ? (
                  <Button type="button" onClick={next}>Continue<ArrowRight data-icon="inline-end" aria-hidden="true" /></Button>
                ) : (
                  <Button type="submit" disabled={form.formState.isSubmitting}><CheckCircle2 data-icon="inline-start" aria-hidden="true" />Save and open dashboard</Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <aside aria-labelledby="model-review-title" className="xl:sticky xl:top-24">
          <Card className="border-primary/20 bg-gradient-to-br from-primary/10 via-card to-positive/5">
            <CardHeader>
              <div className="flex items-center gap-3">
                <NovaOrb className="size-9" />
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-primary">Live calculation</p>
                  <CardTitle id="model-review-title" className="mt-1 text-lg normal-case tracking-tight">Review your model</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid gap-3">
              {[
                ["Monthly income", formatCurrency(twin.monthlyIncome, previewProfile.currency)],
                ["Monthly outflow", formatCurrency(twin.monthlyExpenses, previewProfile.currency)],
                ["Monthly surplus", formatCurrency(twin.monthlySurplus, previewProfile.currency)],
                ["Debt payment ratio", formatPercent(twin.debtRatio)],
                ["Emergency runway", `${twin.emergencyFundMonths.toFixed(1)} months`]
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 rounded-xl border border-border bg-background/60 px-3 py-3">
                  <span className="text-xs font-bold text-muted-foreground">{label}</span>
                  <span className="text-sm font-black tabular-nums text-foreground">{value}</span>
                </div>
              ))}
              <div className="mt-1 rounded-xl border border-positive/20 bg-positive/10 p-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs font-black uppercase tracking-[0.12em] text-positive">Financial health</span>
                  <span className="text-2xl font-black text-positive">{twin.financialHealth.score}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{twin.financialHealth.band} based on the current inputs.</p>
              </div>
              <p className="mt-2 flex items-start gap-2 text-xs leading-5 text-muted-foreground">
                <ShieldCheck className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                Calculations are deterministic and educational. Review assumptions before acting on a financial decision.
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
