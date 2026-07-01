"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowRight, Lock, Mail, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

const signupSchema = loginSchema.extend({
  name: z.string().min(2)
});

type Mode = "login" | "signup" | "forgot";

export function AuthCard({ mode }: { mode: Mode }) {
  const router = useRouter();
  const schema = mode === "signup" ? signupSchema : loginSchema.pick({ email: true }).merge(mode === "login" ? loginSchema.pick({ password: true }) : z.object({}));
  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "Ahmed Al-Harbi",
      email: "ahmed@example.com",
      password: "password123"
    }
  });

  const onSubmit = form.handleSubmit(async (values) => {
    if (mode === "forgot") {
      toast.success("Password reset link prepared for demo inbox.");
      router.push("/login");
      return;
    }

    if (mode === "signup") {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values)
      });
      if (!response.ok && response.status !== 409) {
        toast.error("Could not create account. Try the seeded demo login.");
        return;
      }
    }

    const result = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false
    });

    if (result?.error) {
      toast.error("Use ahmed@example.com / password123 for the seeded demo.");
      return;
    }

    toast.success("Welcome to Financial Twin AI.");
    router.push("/dashboard");
  });

  const title = mode === "login" ? "Welcome back" : mode === "signup" ? "Create your twin" : "Reset password";
  const helper =
    mode === "login"
      ? "Use the seeded demo account or your local sign-up."
      : mode === "signup"
        ? "Start with a secure profile and complete onboarding next."
        : "Enter your email and we will prepare a reset flow for the demo.";

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md border-primary/25">
        <CardHeader>
          <Badge variant="success" className="mb-4 w-fit">Financial Twin AI</Badge>
          <CardTitle className="text-3xl normal-case tracking-tight">{title}</CardTitle>
          <p className="text-sm text-muted-foreground">{helper}</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            {mode === "signup" && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">Name</Label>
                <div className="relative">
                  <UserRound className="pointer-events-none absolute left-3 top-2.5 text-muted-foreground" />
                  <Input id="name" className="pl-11" {...form.register("name")} />
                </div>
              </div>
            )}
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-2.5 text-muted-foreground" />
                <Input id="email" type="email" className="pl-11" {...form.register("email")} />
              </div>
            </div>
            {mode !== "forgot" && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-2.5 text-muted-foreground" />
                  <Input id="password" type="password" className="pl-11" {...form.register("password")} />
                </div>
              </div>
            )}
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Working..." : mode === "login" ? "Login" : mode === "signup" ? "Sign up" : "Send reset link"}
              <ArrowRight data-icon="inline-end" />
            </Button>
          </form>
          <div className="mt-6 flex items-center justify-between text-sm text-muted-foreground">
            {mode === "login" ? (
              <>
                <Link href="/signup" className="hover:text-foreground">Create account</Link>
                <Link href="/forgot-password" className="hover:text-foreground">Forgot password?</Link>
              </>
            ) : (
              <Link href="/login" className="hover:text-foreground">Already have an account?</Link>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
