"use client";

import { useTheme } from "next-themes";
import { Bell, Globe2, Lock, Moon, Shield, UserRound } from "lucide-react";
import { toast } from "sonner";
import { AppPageHeader } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectItem } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

function SettingRow({
  icon: Icon,
  title,
  description,
  children
}: {
  icon: typeof UserRound;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 md:flex-row md:items-center md:justify-between">
      <div className="flex gap-3">
        <span className="flex size-10 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-400/10 text-blue-200">
          <Icon />
        </span>
        <div>
          <p className="font-bold">{title}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

export function SettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="mx-auto max-w-4xl">
      <AppPageHeader
        title="Settings"
        description="Manage profile, security, notifications, theme, language, and currency preferences."
      />
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-2"><Label>Name</Label><Input defaultValue="Ahmed Al-Harbi" /></div>
            <div className="flex flex-col gap-2"><Label>Email</Label><Input defaultValue="ahmed@example.com" /></div>
            <div className="flex flex-col gap-2"><Label>Language</Label><Select defaultValue="en"><SelectItem value="en">English</SelectItem><SelectItem value="ar">Arabic</SelectItem></Select></div>
            <div className="flex flex-col gap-2"><Label>Currency</Label><Select defaultValue="SAR"><SelectItem value="SAR">SAR</SelectItem><SelectItem value="USD">USD</SelectItem><SelectItem value="AED">AED</SelectItem></Select></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <SettingRow icon={Moon} title="Theme" description="Switch between dark and light mode.">
              <Switch checked={theme !== "light"} onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")} />
            </SettingRow>
            <SettingRow icon={Bell} title="Notifications" description="Receive debt, goal, and risk alerts.">
              <Switch checked onCheckedChange={() => toast.success("Notification preference updated.")} />
            </SettingRow>
            <SettingRow icon={Shield} title="Security" description="Require a fresh login before exports.">
              <Switch checked onCheckedChange={() => toast.success("Security preference updated.")} />
            </SettingRow>
            <SettingRow icon={Globe2} title="Regional Mode" description="Use Saudi weekends, SAR formatting, and local calendar reminders.">
              <Switch checked onCheckedChange={() => toast.success("Regional mode updated.")} />
            </SettingRow>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="text-blue-300" />
              Demo Security Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-6 text-muted-foreground">
            SQLite, seeded credentials, and mocked AI are configured for a local hackathon demo. A production launch
            should add encrypted fields, audit logs, KMS-backed secrets, transaction monitoring, and formal financial
            advice disclaimers.
          </CardContent>
        </Card>
        <Button onClick={() => toast.success("Settings saved.")}>Save settings</Button>
      </div>
    </div>
  );
}
