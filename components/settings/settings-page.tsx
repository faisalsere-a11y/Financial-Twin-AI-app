"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Database, Palette, RotateCcw, Save, ShieldCheck } from "lucide-react";
import { AppPageHeader } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectItem } from "@/components/ui/select";
import { useFinancialProfile } from "@/lib/profile/use-financial-profile";
import type { CurrencyCode } from "@/lib/financial/types";

function SettingRow({
  icon: Icon,
  id,
  title,
  description,
  children
}: {
  icon: typeof Palette;
  id: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-background/55 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
          <Icon className="size-4" aria-hidden="true" />
        </span>
        <div>
          <p id={`${id}-title`} className="font-bold text-foreground">{title}</p>
          <p className="mt-1 max-w-xl text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function initialsFor(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const {
    profile,
    source,
    savedAt: profileSavedAt,
    isLoaded: profileLoaded,
    save: saveActiveProfile,
    reset: resetActiveProfile
  } = useFinancialProfile();
  const profileHydrated = useRef(false);
  const [profileName, setProfileName] = useState(profile.name);
  const [currency, setCurrency] = useState<CurrencyCode>(profile.currency);
  const [resetArmed, setResetArmed] = useState(false);
  const [status, setStatus] = useState<{ kind: "info" | "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    if (!profileLoaded || profileHydrated.current) return;
    setProfileName(profile.name);
    setCurrency(profile.currency);
    profileHydrated.current = true;
  }, [profile, profileLoaded]);

  const saveSettings = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedName = profileName.trim();
    if (normalizedName.length < 2) {
      setStatus({ kind: "error", message: "Enter at least two characters for the profile name." });
      return;
    }

    try {
      saveActiveProfile({ ...profile, name: normalizedName, initials: initialsFor(normalizedName), currency });
      setResetArmed(false);
      setStatus({ kind: "success", message: "Saved in this browser. Your active model is updated for this account on this device." });
    } catch {
      setStatus({ kind: "error", message: "Settings could not be saved. Check browser storage access and try again." });
    }
  };

  const restoreDefaults = () => {
    if (!resetArmed) {
      setResetArmed(true);
      setStatus({ kind: "info", message: "This removes the browser-saved profile for this account. Select confirm to continue." });
      return;
    }

    try {
      const profileResult = resetActiveProfile();
      setProfileName(profileResult.profile.name);
      setCurrency(profileResult.profile.currency);
      setTheme("system");
      setResetArmed(false);
      setStatus({ kind: "success", message: "Bundled defaults restored. Browser-saved profile data for this account was removed." });
    } catch {
      setStatus({ kind: "error", message: "Defaults could not be restored. Check browser storage access and try again." });
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <AppPageHeader
        title="Settings"
        description="Manage model identity, appearance, and this device's data boundary."
      />

      <form onSubmit={saveSettings} className="grid gap-6">
        <Card>
          <CardHeader className="border-b border-border">
            <CardTitle className="flex items-center gap-2 text-sm normal-case tracking-tight">
              <Database className="size-4 text-primary" aria-hidden="true" />Model identity
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
            <div className="flex flex-col gap-2">
              <Label htmlFor="profile-name">Profile name</Label>
              <Input id="profile-name" autoComplete="name" value={profileName} onChange={(event) => { setProfileName(event.target.value); setStatus(null); }} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="account-email">Account email</Label>
              <Input id="account-email" value="Managed by the active sign-in account" readOnly aria-describedby="account-email-note" />
              <p id="account-email-note" className="text-xs leading-5 text-muted-foreground">Email changes require an account-management backend and are not available here.</p>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="currency">Model currency</Label>
              <Select id="currency" value={currency} onValueChange={(value) => { setCurrency(value as CurrencyCode); setStatus(null); }}>
                <SelectItem value="SAR">SAR — Saudi Riyal</SelectItem><SelectItem value="USD">USD — US Dollar</SelectItem><SelectItem value="EUR">EUR — Euro</SelectItem><SelectItem value="AED">AED — UAE Dirham</SelectItem>
              </Select>
            </div>
            <div className="flex flex-col justify-end gap-2">
              <p className="text-xs leading-5 text-muted-foreground">Income, expenses, debt, assets, goals, and risk comfort are edited in the full model builder.</p>
              <Button type="button" variant="outline" asChild><Link href="/onboarding">Edit full financial model</Link></Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-border">
            <CardTitle className="flex items-center gap-2 text-sm normal-case tracking-tight">
              <Palette className="size-4 text-primary" aria-hidden="true" />Experience preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 p-5 sm:p-6">
            <SettingRow icon={Palette} id="theme-setting" title="Theme" description="Follow the operating system or choose a persistent light or dark appearance.">
              <div className="w-full sm:w-48"><Label htmlFor="theme" className="sr-only">Theme</Label><Select id="theme" value={theme ?? "system"} onValueChange={setTheme}><SelectItem value="system">System</SelectItem><SelectItem value="light">Light</SelectItem><SelectItem value="dark">Dark</SelectItem></Select></div>
            </SettingRow>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm normal-case tracking-tight">
              <ShieldCheck className="size-4 text-primary" aria-hidden="true" />Data boundary
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 text-sm leading-6 text-muted-foreground sm:grid-cols-[1fr_auto] sm:items-end">
            <div>
              <p>Your financial model is stored in this browser under the active account. No bank connection, cloud profile sync, or background account import is represented.</p>
              <p className="mt-2 text-xs">Active source: {source === "saved" ? "account-scoped browser profile" : "bundled sample profile"}. {profileSavedAt ? `Last saved ${new Date(profileSavedAt).toLocaleString()}.` : "No browser save yet."}</p>
            </div>
            <Button type="button" variant={resetArmed ? "destructive" : "outline"} onClick={restoreDefaults}>
              <RotateCcw data-icon="inline-start" aria-hidden="true" />
              {resetArmed ? "Confirm restore bundled defaults" : "Restore bundled defaults"}
            </Button>
          </CardContent>
        </Card>

        {status && (
          <div aria-live="polite" role={status.kind === "error" ? "alert" : "status"} className={status.kind === "error" ? "rounded-xl border border-destructive/25 bg-destructive/10 p-3 text-sm text-destructive" : status.kind === "success" ? "rounded-xl border border-positive/25 bg-positive/10 p-3 text-sm text-positive" : "rounded-xl border border-primary/25 bg-primary/10 p-3 text-sm text-foreground"}>
            {status.message}
          </div>
        )}

        <div className="flex justify-end">
          <Button type="submit" size="lg"><Save data-icon="inline-start" aria-hidden="true" />Save settings</Button>
        </div>
      </form>
    </div>
  );
}
