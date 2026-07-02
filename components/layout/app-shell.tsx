"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Activity,
  Bell,
  Gauge,
  Landmark,
  LayoutDashboard,
  Menu,
  Moon,
  PieChart,
  Search,
  Settings,
  Sparkles,
  Sun,
  Target,
  UserRound,
  Wand2
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, hint: "Financial cockpit" },
  { label: "My Twin", href: "/onboarding", icon: UserRound, hint: "Profile model" },
  { label: "Simulations", href: "/simulations", icon: Activity, hint: "Decision lab" },
  { label: "Investments", href: "/investments", icon: PieChart, hint: "Monte Carlo" },
  { label: "Goals", href: "/goals", icon: Target, hint: "Forecast dates" },
  { label: "Reports", href: "/reports", icon: Landmark, hint: "Exports" },
  { label: "Settings", href: "/settings", icon: Settings, hint: "Security" }
];

export function NovaOrb({ className }: { className?: string }) {
  return (
    <span className={cn("relative flex items-center justify-center rounded-full", className)}>
      <span className="absolute inset-0 rounded-full bg-blue-400/20 blur-xl" />
      <span className="nova-orb relative block size-full rounded-full" />
    </span>
  );
}

function Brand() {
  return (
    <Link href="/dashboard" className="group flex items-center gap-3">
      <NovaOrb className="size-10 transition-transform group-hover:scale-105" />
      <span className="leading-tight">
        <span className="block text-sm font-black tracking-tight">Financial Twin AI</span>
        <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
          Nova Engine
        </span>
      </span>
    </Link>
  );
}

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full flex-col border-r border-white/10 bg-[#05080f]/90 backdrop-blur-2xl">
      <div className="flex h-[78px] items-center border-b border-white/10 px-6">
        <Brand />
      </div>
      <div className="px-4 pt-5">
        <div className="rounded-2xl border border-blue-400/20 bg-blue-400/10 p-4">
          <div className="mb-3 flex items-center justify-between">
            <Badge variant="blue">Twin Live</Badge>
            <span className="text-[10px] font-bold text-blue-200">98.7%</span>
          </div>
          <p className="text-sm font-black text-slate-100">Ahmed Al-Harbi</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Saudi demo profile synced to cash flow, goals, debt, and AI advisor.
          </p>
        </div>
      </div>
      <nav className="flex flex-1 flex-col gap-1.5 px-4 py-6">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "group flex items-center gap-3 rounded-2xl border px-3.5 py-3 text-sm transition-all",
                active
                  ? "border-blue-400/25 bg-gradient-to-r from-blue-500/[0.18] to-violet-500/[0.12] text-white shadow-glow"
                  : "border-transparent text-muted-foreground hover:border-white/10 hover:bg-white/[0.045] hover:text-foreground"
              )}
            >
              <span
                className={cn(
                  "flex size-9 items-center justify-center rounded-xl border transition-colors",
                  active
                    ? "border-blue-300/30 bg-blue-400/[0.15] text-blue-200"
                    : "border-white/10 bg-white/[0.03] text-slate-500 group-hover:text-blue-200"
                )}
              >
                <Icon className="size-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-bold">{item.label}</span>
                <span className="block truncate text-[11px] text-muted-foreground">{item.hint}</span>
              </span>
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/10 p-5">
        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
          <span className="flex items-center gap-2">
            <span className="h-0.5 w-4 rounded bg-emerald-400" />
            Saudi Arabia
          </span>
          <span>v2.4.0</span>
        </div>
      </div>
    </aside>
  );
}

function Topbar() {
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 flex h-[78px] items-center justify-between border-b border-white/10 bg-[#05080f]/72 px-4 backdrop-blur-2xl lg:px-8">
      <div className="hidden items-center gap-3 lg:flex">
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] px-3 py-2">
          <NovaOrb className="size-7" />
          <div>
            <p className="text-xs font-black text-slate-100">NOVA advisor online</p>
            <p className="text-[11px] text-muted-foreground">Last model sync 2 min ago</p>
          </div>
        </div>
        <Badge variant="success">
          <Sparkles className="mr-1 size-3" />
          Twin active
        </Badge>
      </div>
      <div className="flex items-center gap-2 lg:ml-auto">
        <Button variant="glass" size="sm" className="hidden md:inline-flex">
          <Search data-icon="inline-start" />
          Cmd / Ctrl K
        </Button>
        <Button variant="glass" size="sm" asChild>
          <Link href="/simulations">
            <Wand2 data-icon="inline-start" />
            New Simulation
          </Link>
        </Button>
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Toggle theme"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <Sun className="hidden size-4 dark:block" />
          <Moon className="size-4 dark:hidden" />
        </Button>
        <Avatar className="border border-white/10 bg-white/[0.04]">
          <AvatarFallback className="bg-transparent text-xs font-black">AH</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="gradient-mesh min-h-screen">
      <div className="fixed inset-y-0 left-0 z-40 hidden w-[280px] lg:block">
        <Sidebar />
      </div>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            className="absolute inset-0 bg-background/80 backdrop-blur"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          />
          <div className="relative h-full w-80">
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}
      <div className="lg:pl-[280px]">
        <div className="flex h-[78px] items-center border-b border-white/10 bg-[#05080f]/72 px-4 backdrop-blur-2xl lg:hidden">
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <Menu className="size-5" />
          </Button>
          <div className="ml-3">
            <Brand />
          </div>
        </div>
        <Topbar />
        <main className="subtle-grid relative min-h-[calc(100vh-78px)] overflow-hidden p-4 lg:p-8">
          <div className="pointer-events-none absolute right-8 top-8 size-80 rounded-full bg-violet-500/10 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-1/4 size-96 rounded-full bg-emerald-500/[0.08] blur-3xl" />
          <div className="relative">{children}</div>
        </main>
      </div>
      <div className="fixed bottom-4 right-4 hidden rounded-full border border-white/10 bg-white/[0.06] px-3 py-2 text-xs text-muted-foreground shadow-glass backdrop-blur md:block">
        <span className="font-semibold text-foreground">Ctrl K</span> command
      </div>
    </div>
  );
}

export function LandingNav() {
  return (
    <header className="fixed left-0 right-0 top-0 z-40 border-b border-white/10 bg-[#05080f]/68 backdrop-blur-2xl">
      <div className="container flex h-16 items-center justify-between">
        <Brand />
        <nav className="hidden items-center gap-6 text-sm font-semibold text-muted-foreground md:flex">
          <Link href="#features" className="hover:text-foreground">Features</Link>
          <Link href="#pricing" className="hover:text-foreground">Pricing</Link>
          <Link href="#faq" className="hover:text-foreground">FAQ</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/signup">Start free</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

export function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2">
      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-black text-slate-100">{value}</p>
    </div>
  );
}

export function AppPageHeader({
  title,
  description,
  action
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-blue-300">
          <Gauge className="size-4" />
          Financial Twin AI
        </p>
        <h1 className="gradient-text-blue text-3xl font-black tracking-tight md:text-5xl">{title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  );
}
