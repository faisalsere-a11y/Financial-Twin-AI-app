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
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "My Twin", href: "/onboarding", icon: UserRound },
  { label: "Simulations", href: "/simulations", icon: Activity },
  { label: "Investments", href: "/investments", icon: PieChart },
  { label: "Goals", href: "/goals", icon: Target },
  { label: "Reports", href: "/reports", icon: Landmark },
  { label: "Settings", href: "/settings", icon: Settings }
];

function Brand() {
  return (
    <Link href="/dashboard" className="flex items-center gap-3">
      <span className="relative flex size-9 items-center justify-center rounded-full bg-primary/20 text-primary shadow-glow">
        <span className="size-3 rounded-full bg-primary" />
      </span>
      <span className="font-bold tracking-tight">Financial Twin AI</span>
    </Link>
  );
}

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full flex-col border-r border-border bg-background/60 backdrop-blur-xl">
      <div className="flex h-[72px] items-center border-b border-border px-6">
        <Brand />
      </div>
      <nav className="flex flex-1 flex-col gap-2 px-4 py-8">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground transition-colors",
                active && "border border-primary/20 bg-primary/10 text-primary",
                !active && "hover:bg-muted/60 hover:text-foreground"
              )}
            >
              <Icon />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border p-5">
        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
          <span className="flex items-center gap-2">
            <span className="h-0.5 w-4 rounded bg-primary" />
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
    <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-border bg-background/70 px-4 backdrop-blur-xl lg:px-8">
      <div className="hidden items-center gap-3 lg:flex">
        <Badge variant="success">
          <Sparkles className="mr-1" />
          Twin Active
        </Badge>
        <span className="text-sm text-muted-foreground">Last synced 2 min ago</span>
      </div>
      <div className="flex items-center gap-2 lg:ml-auto">
        <Button variant="glass" size="sm" asChild>
          <Link href="/simulations">
            <Wand2 data-icon="inline-start" />
            New Simulation
          </Link>
        </Button>
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Toggle theme"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <Sun className="hidden dark:block" />
          <Moon className="dark:hidden" />
        </Button>
        <Avatar>
          <AvatarFallback>AH</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-y-0 left-0 z-40 hidden w-60 lg:block">
        <Sidebar />
      </div>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button className="absolute inset-0 bg-background/70 backdrop-blur" onClick={() => setMobileOpen(false)} />
          <div className="relative h-full w-72">
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}
      <div className="lg:pl-60">
        <div className="flex h-[72px] items-center border-b border-border px-4 lg:hidden">
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <Menu />
          </Button>
          <div className="ml-3">
            <Brand />
          </div>
        </div>
        <Topbar />
        <main className="subtle-grid min-h-[calc(100vh-72px)] p-4 lg:p-8">{children}</main>
      </div>
      <div className="fixed bottom-4 right-4 hidden rounded-full border border-border bg-card/80 px-3 py-2 text-xs text-muted-foreground shadow-glass backdrop-blur md:block">
        <span className="font-semibold text-foreground">⌘K</span> command
      </div>
    </div>
  );
}

export function LandingNav() {
  return (
    <header className="fixed left-0 right-0 top-0 z-40 border-b border-white/10 bg-background/55 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Brand />
        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <Link href="#features">Features</Link>
          <Link href="#pricing">Pricing</Link>
          <Link href="#faq">FAQ</Link>
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
    <div className="rounded-lg border border-border bg-background/35 px-3 py-2">
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-bold">{value}</p>
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
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-primary">
          <Gauge />
          Financial Twin AI
        </p>
        <h1 className="text-3xl font-black tracking-tight md:text-4xl">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  );
}
