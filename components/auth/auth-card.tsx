"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, ChartNoAxesCombined, Lock, Mail, ShieldCheck, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { NovaOrb } from "@/components/layout/app-shell";
import {
  authPresentation,
  getAuthDefaults,
  getAuthDestination,
  sampleCredentials,
  type AuthMode
} from "@/lib/auth/presentation";

const isGitHubPages = process.env.NEXT_PUBLIC_GITHUB_PAGES === "true";

type AuthFormValues = {
  name: string;
  email: string;
  password: string;
};

type AuthStatus = {
  kind: "info" | "success" | "error";
  message: string;
};

function createAuthSchema(mode: AuthMode) {
  return z.object({
    name: mode === "signup" ? z.string().trim().min(2, "Enter at least two characters.") : z.string(),
    email: z.string().trim().email("Enter a valid email address."),
    password: mode === "forgot" ? z.string() : z.string().min(6, "Password must be at least six characters.")
  });
}

const trustSignals = [
  {
    icon: ChartNoAxesCombined,
    title: "Deterministic financial core",
    body: "The same profile and decision inputs produce the same calculations."
  },
  {
    icon: ShieldCheck,
    title: "Visible assumptions",
    body: "Scenarios label the evidence, tradeoffs, and limits behind each result."
  }
];

export function AuthCard({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const presentation = authPresentation[mode];
  const [status, setStatus] = useState<AuthStatus | null>(null);
  const form = useForm<AuthFormValues>({
    resolver: zodResolver(createAuthSchema(mode)),
    defaultValues: getAuthDefaults(mode)
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setStatus(null);

    if (mode === "forgot") {
      setStatus({ kind: "info", message: presentation.unavailableMessage ?? "Password recovery is unavailable." });
      return;
    }

    const destination = getAuthDestination(mode);

    if (isGitHubPages) {
      setStatus({
        kind: "success",
        message: mode === "signup" ? "Opening onboarding with the bundled sample profile." : "Opening the bundled sample workspace."
      });
      router.push(destination);
      return;
    }

    try {
      if (mode === "signup") {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values)
        });

        if (!response.ok) {
          const body = (await response.json().catch(() => null)) as { error?: string } | null;
          setStatus({
            kind: "error",
            message: body?.error ?? "The account could not be created. Check your details and try again."
          });
          return;
        }
      }

      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false
      });

      if (result?.error || !result?.ok) {
        setStatus({
          kind: "error",
          message: mode === "signup" ? "Your account was created, but sign-in failed. Return to sign in and try again." : "Email or password was not recognized."
        });
        return;
      }

      setStatus({ kind: "success", message: mode === "signup" ? "Account created. Opening onboarding." : "Signed in. Opening your dashboard." });
      router.push(destination);
    } catch {
      setStatus({ kind: "error", message: "Authentication is temporarily unavailable. Check your connection and try again." });
    }
  });

  const fillSampleAccess = () => {
    form.setValue("email", sampleCredentials.email, { shouldDirty: true, shouldValidate: true });
    form.setValue("password", sampleCredentials.password, { shouldDirty: true, shouldValidate: true });
    setStatus({ kind: "info", message: "Sample access details are ready. Select sign in to continue." });
  };

  const emailError = form.formState.errors.email?.message;
  const passwordError = form.formState.errors.password?.message;
  const nameError = form.formState.errors.name?.message;

  return (
    <main className="relative isolate min-h-screen overflow-hidden px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.12),transparent_34%),radial-gradient(circle_at_bottom_right,hsl(var(--positive)/0.08),transparent_30%)]" />
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center gap-6 lg:min-h-[calc(100vh-6rem)] lg:grid-cols-[minmax(0,1.05fr)_minmax(25rem,0.78fr)] lg:gap-12">
        <section aria-labelledby="auth-trust-title" className="rounded-2xl border border-border bg-card/55 p-5 shadow-glass backdrop-blur sm:p-7 lg:border-0 lg:bg-transparent lg:p-4 lg:shadow-none lg:backdrop-blur-none">
          <div className="flex items-center gap-3">
            <NovaOrb className="size-11 shrink-0" />
            <div>
              <Badge variant="blue">Financial Twin AI</Badge>
              <p className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Decision intelligence for your money</p>
            </div>
          </div>

          <div className="mt-6 max-w-xl lg:mt-10">
            <p className="text-sm font-bold text-primary">A model you can inspect</p>
            <h2 id="auth-trust-title" className="mt-2 text-balance text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
              Make the next decision with your financial context intact.
            </h2>
            <p className="mt-4 max-w-lg leading-7 text-muted-foreground">
              Financial Twin brings cash flow, resilience, goals, and tradeoffs into one explainable workspace. It supports decisions; it does not replace regulated financial advice.
            </p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:mt-10">
            {trustSignals.map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-xl border border-border bg-background/65 p-4">
                <Icon className="size-5 text-primary" aria-hidden="true" />
                <h3 className="mt-3 text-sm font-black">{title}</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>

          <p className="mt-5 flex items-start gap-2 text-xs leading-5 text-muted-foreground lg:mt-8">
            <Lock className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            Sample access uses a bundled profile and requires no bank connection. Account data remains within this deployment&apos;s configured storage boundary.
          </p>
        </section>

        <Card className="glass-panel-strong w-full border-primary/20 bg-card/90 shadow-glow">
          <CardHeader className="gap-3 p-6 sm:p-8 sm:pb-5">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">{presentation.eyebrow}</p>
              <CardTitle className="mt-2 text-3xl normal-case tracking-tight sm:text-4xl">{presentation.title}</CardTitle>
            </div>
            <p className="max-w-md text-sm leading-6 text-muted-foreground">{presentation.helper}</p>
          </CardHeader>
          <CardContent className="p-6 pt-0 sm:p-8 sm:pt-0">
            <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
              {mode === "signup" && (
                <div className="flex flex-col gap-2">
                  <Label htmlFor="name">Name</Label>
                  <div className="relative">
                    <UserRound className="pointer-events-none absolute left-3 top-3 size-5 text-muted-foreground" aria-hidden="true" />
                    <Input id="name" autoComplete="name" className="pl-11" aria-invalid={Boolean(nameError)} aria-describedby={nameError ? "name-error" : undefined} {...form.register("name")} />
                  </div>
                  {nameError && <p id="name-error" role="alert" className="text-sm text-destructive">{nameError}</p>}
                </div>
              )}

              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-3 size-5 text-muted-foreground" aria-hidden="true" />
                  <Input id="email" type="email" inputMode="email" autoComplete="email" className="pl-11" aria-invalid={Boolean(emailError)} aria-describedby={emailError ? "email-error" : undefined} {...form.register("email")} />
                </div>
                {emailError && <p id="email-error" role="alert" className="text-sm text-destructive">{emailError}</p>}
              </div>

              {mode !== "forgot" && (
                <div className="flex flex-col gap-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-3 size-5 text-muted-foreground" aria-hidden="true" />
                    {mode === "signup" ? (
                      <Input id="password" type="password" autoComplete="new-password" className="pl-11" aria-invalid={Boolean(passwordError)} aria-describedby={passwordError ? "password-error" : undefined} {...form.register("password")} />
                    ) : (
                      <Input id="password" type="password" autoComplete="current-password" className="pl-11" aria-invalid={Boolean(passwordError)} aria-describedby={passwordError ? "password-error" : undefined} {...form.register("password")} />
                    )}
                  </div>
                  {passwordError && <p id="password-error" role="alert" className="text-sm text-destructive">{passwordError}</p>}
                </div>
              )}

              {status && (
                <div
                  aria-live="polite"
                  role={status.kind === "error" ? "alert" : "status"}
                  className={status.kind === "error" ? "rounded-xl border border-destructive/25 bg-destructive/10 p-3 text-sm text-destructive" : status.kind === "success" ? "rounded-xl border border-positive/25 bg-positive/10 p-3 text-sm text-positive" : "rounded-xl border border-primary/25 bg-primary/10 p-3 text-sm text-foreground"}
                >
                  {status.message}
                </div>
              )}

              <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? presentation.pendingLabel : presentation.submitLabel}
                <ArrowRight data-icon="inline-end" aria-hidden="true" />
              </Button>

              {mode === "login" && (
                <Button type="button" variant="outline" size="lg" onClick={fillSampleAccess}>
                  Use sample access
                </Button>
              )}
            </form>

            <nav aria-label="Authentication options" className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5 text-sm">
              {mode === "login" ? (
                <>
                  <Link href="/signup" className="font-bold text-foreground hover:text-primary">Create account</Link>
                  <Link href="/forgot-password" className="text-muted-foreground hover:text-foreground">Forgot password?</Link>
                </>
              ) : (
                <Link href="/login" className="font-bold text-foreground hover:text-primary">Return to sign in</Link>
              )}
            </nav>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
