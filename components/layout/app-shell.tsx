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
  Wand2,
  X,
  type LucideIcon
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { NovaOrb } from "@/components/brand/nova-orb";
import { openCommandPalette } from "@/lib/ui/commands";
import { navItems, type NavigationIcon } from "@/lib/ui/navigation";
import { useFinancialProfile } from "@/lib/profile/use-financial-profile";
import { cn } from "@/lib/utils";

const navigationIcons: Record<NavigationIcon, LucideIcon> = {
  activity: Activity,
  dashboard: LayoutDashboard,
  portfolio: PieChart,
  reports: Landmark,
  settings: Settings,
  target: Target,
  user: UserRound
};

function Brand({ href = "/dashboard" }: { href?: string }) {
  return (
    <Link href={href} className="group flex items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
      <NovaOrb className="size-10 transition-transform group-hover:scale-105" />
      <span className="leading-tight">
        <span className="block text-sm font-black tracking-tight">Financial Twin AI</span>
        <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
          NOVA intelligence
        </span>
      </span>
    </Link>
  );
}

function Sidebar({
  onNavigate,
  firstLinkRef
}: {
  onNavigate?: () => void;
  firstLinkRef?: (element: HTMLAnchorElement | null) => void;
}) {
  const pathname = usePathname();
  const { profile, source } = useFinancialProfile();

  return (
    <aside className="flex h-full flex-col border-r border-border bg-card/95 backdrop-blur-2xl">
      <div className="flex h-[78px] items-center border-b border-border px-6">
        <Brand />
      </div>
      <div className="px-4 pt-5">
        <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4">
          <div className="mb-3 flex items-center justify-between">
            <Badge variant={source === "saved" ? "success" : "blue"}>{source === "saved" ? "Saved twin" : "Sample twin"}</Badge>
            <span className="text-[10px] font-bold text-primary">{profile.currency}</span>
          </div>
          <p className="text-sm font-black text-foreground">{profile.name}</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {source === "saved" ? "Saved in this browser" : "Bundled sample profile"} · {profile.country}
          </p>
        </div>
      </div>
      <nav aria-label="Primary navigation" className="flex flex-1 flex-col gap-1.5 px-4 py-6">
        {navItems.map((item, index) => {
          const Icon = navigationIcons[item.icon];
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              ref={index === 0 ? firstLinkRef : undefined}
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group flex min-h-14 items-center gap-3 rounded-2xl border px-3.5 py-2.5 text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                active
                  ? "border-primary/25 bg-primary/10 text-foreground shadow-glow"
                  : "border-transparent text-muted-foreground hover:border-border hover:bg-muted/70 hover:text-foreground"
              )}
            >
              <span
                className={cn(
                  "flex size-9 items-center justify-center rounded-xl border transition-colors",
                  active
                    ? "border-primary/25 bg-primary/10 text-primary"
                    : "border-border bg-muted/50 text-muted-foreground group-hover:text-primary"
                )}
              >
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-bold">{item.label}</span>
                <span className="block truncate text-[11px] text-muted-foreground">{item.hint}</span>
              </span>
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border p-5">
        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
          <span className="flex items-center gap-2">
            <span className="h-0.5 w-4 rounded bg-positive" />
            {profile.country}
          </span>
          <span>Browser model</span>
        </div>
      </div>
    </aside>
  );
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const dark = resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={`Switch to ${dark ? "light" : "dark"} theme`}
      onClick={() => setTheme(dark ? "light" : "dark")}
    >
      {dark ? <Sun className="size-4" aria-hidden="true" /> : <Moon className="size-4" aria-hidden="true" />}
    </Button>
  );
}

function Topbar() {
  const { profile, source } = useFinancialProfile();

  return (
    <header className="app-print-hide sticky top-0 z-30 flex h-[78px] items-center justify-between border-b border-border bg-card/80 px-4 backdrop-blur-2xl lg:px-8">
      <div className="hidden items-center gap-3 lg:flex">
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-3 py-2">
          <NovaOrb className="size-7" />
          <div>
            <p className="text-xs font-black text-foreground">NOVA ready</p>
            <p className="text-[11px] text-muted-foreground">Using the {source === "saved" ? "saved" : "sample"} financial model</p>
          </div>
        </div>
        <Badge variant="success">
          <Sparkles className="mr-1 size-3" aria-hidden="true" />
          Twin calculated
        </Badge>
      </div>
      <div className="flex items-center gap-2 lg:ml-auto">
        <Button variant="glass" size="sm" className="hidden md:inline-flex" onClick={() => openCommandPalette()}>
          <Search data-icon="inline-start" aria-hidden="true" />
          Search
          <span className="text-[10px] text-muted-foreground">Ctrl K</span>
        </Button>
        <Button variant="glass" size="sm" asChild>
          <Link href="/simulations">
            <Wand2 data-icon="inline-start" aria-hidden="true" />
            New decision
          </Link>
        </Button>
        <Button variant="ghost" size="icon" asChild>
          <Link href="/settings#notifications" aria-label="Notification preferences">
            <Bell className="size-4" aria-hidden="true" />
          </Link>
        </Button>
        <ThemeToggle />
        <Avatar className="border border-border bg-muted">
          <AvatarFallback className="bg-transparent text-xs font-black">{profile.initials}</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const firstMobileLinkRef = useRef<HTMLAnchorElement>(null);

  const closeMobile = useCallback(() => {
    setMobileOpen(false);
    requestAnimationFrame(() => menuButtonRef.current?.focus());
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMobile();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    requestAnimationFrame(() => firstMobileLinkRef.current?.focus());

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [closeMobile, mobileOpen]);

  return (
    <div className="gradient-mesh min-h-screen">
      <div className="app-print-hide fixed inset-y-0 left-0 z-40 hidden w-[280px] lg:block">
        <Sidebar />
      </div>
      {mobileOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="mobile-menu-title"
          className="fixed inset-0 z-50 lg:hidden"
          onKeyDown={(event) => {
            if (event.key !== "Tab") return;
            const drawer = event.currentTarget.querySelector<HTMLElement>("#mobile-primary-navigation");
            const focusable = Array.from(
              drawer?.querySelectorAll<HTMLElement>("a[href], button:not([disabled]), [tabindex]:not([tabindex='-1'])") ?? []
            );
            const first = focusable[0];
            const last = focusable.at(-1);
            if (!first || !last) return;
            if (event.shiftKey && document.activeElement === first) {
              event.preventDefault();
              last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
              event.preventDefault();
              first.focus();
            }
          }}
        >
          <h2 id="mobile-menu-title" className="sr-only">Primary navigation</h2>
          <button
            className="absolute inset-0 bg-background/80 backdrop-blur"
            onClick={closeMobile}
            aria-label="Close navigation"
          />
          <div id="mobile-primary-navigation" className="relative h-full w-[min(22rem,88vw)] shadow-glass-strong">
            <Button
              variant="ghost"
              size="icon"
              onClick={closeMobile}
              aria-label="Close navigation"
              className="absolute right-3 top-4 z-10"
            >
              <X className="size-4" aria-hidden="true" />
            </Button>
            <Sidebar onNavigate={closeMobile} firstLinkRef={(element) => { firstMobileLinkRef.current = element; }} />
          </div>
        </div>
      )}
      <div className="lg:pl-[280px]">
        <div className="flex h-[78px] items-center border-b border-border bg-card/80 px-4 backdrop-blur-2xl lg:hidden">
          <Button
            ref={menuButtonRef}
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
            aria-expanded={mobileOpen}
            aria-controls="mobile-primary-navigation"
          >
            <Menu className="size-5" aria-hidden="true" />
          </Button>
          <div className="ml-3">
            <Brand />
          </div>
        </div>
        <Topbar />
        <main id="main-content" className="app-print-main subtle-grid relative min-h-[calc(100vh-78px)] overflow-hidden p-4 lg:p-8">
          <div className="pointer-events-none absolute right-8 top-8 size-80 rounded-full bg-chart-3/10 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-1/4 size-96 rounded-full bg-positive/[0.08] blur-3xl" />
          <div className="relative">{children}</div>
        </main>
      </div>
      <button
        type="button"
        onClick={() => openCommandPalette()}
        className="app-print-hide fixed bottom-4 right-4 hidden rounded-full border border-border bg-card/85 px-3 py-2 text-xs text-muted-foreground shadow-glass backdrop-blur transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:block"
      >
        <span className="font-semibold text-foreground">Ctrl K</span> command
      </button>
    </div>
  );
}

export function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card/70 px-3 py-2">
      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-black tabular-nums text-foreground">{value}</p>
    </div>
  );
}

export function AppPageHeader({
  title,
  description,
  action,
  eyebrow = "Financial Twin AI"
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
  eyebrow?: string;
}) {
  return (
    <header className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-primary">
          <Gauge className="size-4" aria-hidden="true" />
          {eyebrow}
        </p>
        <h1 className="gradient-text-blue text-3xl font-black tracking-tight md:text-5xl">{title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      {action}
    </header>
  );
}
