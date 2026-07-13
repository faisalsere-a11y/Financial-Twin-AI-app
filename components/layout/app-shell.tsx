"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Activity,
  Gauge,
  Landmark,
  LayoutDashboard,
  Menu,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
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
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { NovaOrb } from "@/components/brand/nova-orb";
import { FloatingActions } from "@/components/layout/floating-actions";
import { AnimatedNumber } from "@/components/motion/animated-number";
import { motionTokens } from "@/lib/motion/variants";
import { openCommandPalette } from "@/lib/ui/commands";
import {
  getSidebarPreferenceStorage,
  navItems,
  persistSidebarCollapsedPreference,
  readSidebarCollapsedPreferenceResult,
  type NavigationIcon
} from "@/lib/ui/navigation";
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

const SIDEBAR_WIDTH_EXPANDED = 280;
const SIDEBAR_WIDTH_COLLAPSED = 88;
// Browser/device preference: financial-twin.sidebar-collapsed.v1
const useBrowserLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

type ShellOffsetStyle = CSSProperties & {
  "--sidebar-width": string;
};

function SidebarPresence({
  motionEnabled,
  children,
  mode
}: {
  motionEnabled: boolean;
  children: React.ReactNode;
  mode?: "sync" | "wait";
}) {
  if (!motionEnabled) return <>{children}</>;

  return (
    <AnimatePresence initial={false} mode={mode}>
      {children}
    </AnimatePresence>
  );
}

function Brand({
  href = "/dashboard",
  compact = false,
  motionEnabled = true
}: {
  href?: string;
  compact?: boolean;
  motionEnabled?: boolean;
}) {
  const shouldReduceMotion = useReducedMotion();
  const motionDisabled = !motionEnabled || shouldReduceMotion;

  return (
    <Link
      href={href}
      aria-label={compact ? "Financial Twin AI home" : undefined}
      title={compact ? "Financial Twin AI" : undefined}
      className={cn(
        "group flex items-center rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        compact ? "justify-center" : "gap-3"
      )}
    >
      <motion.span
        className="relative flex size-10 shrink-0 items-center justify-center"
        animate={motionDisabled ? { opacity: 1, scale: 1 } : { opacity: [0.92, 1, 0.92], scale: [1, 1.025, 1] }}
        transition={motionDisabled ? { duration: 0 } : { duration: 4.8, ease: "easeInOut", repeat: Infinity }}
      >
        <span aria-hidden="true" className="absolute inset-0 rounded-full bg-primary/20 blur-md" />
        <NovaOrb className="relative size-10 motion-safe:transition-transform motion-safe:duration-[var(--motion-fast)] group-hover:scale-[1.04]" />
      </motion.span>
      <SidebarPresence motionEnabled={motionEnabled}>
        {!compact && (
          <motion.span
            key="brand-copy"
            initial={motionDisabled ? { opacity: 1 } : { opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={motionDisabled ? { opacity: 1 } : { opacity: 0, x: -4 }}
            transition={{ duration: motionDisabled ? 0 : motionTokens.fast, ease: motionTokens.ease }}
            className="whitespace-nowrap leading-tight"
          >
            <span className="block text-sm font-black tracking-tight">Financial Twin AI</span>
            <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              NOVA intelligence
            </span>
          </motion.span>
        )}
      </SidebarPresence>
    </Link>
  );
}

function Sidebar({
  collapsed = false,
  layoutScope,
  onNavigate,
  firstLinkRef,
  onCollapseToggle,
  motionEnabled = true
}: {
  collapsed?: boolean;
  layoutScope: "desktop" | "mobile";
  onNavigate?: () => void;
  firstLinkRef?: (element: HTMLAnchorElement | null) => void;
  onCollapseToggle?: () => void;
  motionEnabled?: boolean;
}) {
  const pathname = usePathname();
  const { profile, source } = useFinancialProfile();
  const shouldReduceMotion = useReducedMotion();
  const motionDisabled = !motionEnabled || shouldReduceMotion;
  const presenceTransition = {
    duration: motionDisabled ? 0 : motionTokens.fast,
    ease: motionTokens.ease
  };

  return (
    <aside className="flex h-full min-w-0 flex-col overflow-hidden border-r border-border bg-card/95 backdrop-blur-2xl">
      <div className={cn("flex h-[78px] shrink-0 items-center border-b border-border", collapsed ? "justify-center px-3" : "px-6")}>
        <Brand compact={collapsed} motionEnabled={motionEnabled} />
      </div>
      <div className={cn("shrink-0 pt-5", collapsed ? "px-3" : "px-4")}>
        <SidebarPresence motionEnabled={motionEnabled} mode="wait">
          {collapsed ? (
            <motion.div
              key="compact-profile"
              initial={motionDisabled ? { opacity: 1 } : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={motionDisabled ? { opacity: 1 } : { opacity: 0 }}
              transition={presenceTransition}
              aria-label={`${profile.name}, ${profile.currency}`}
              title={`${profile.name} — ${profile.currency}`}
              className="flex h-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-xs font-black text-primary"
            >
              {profile.currency}
            </motion.div>
          ) : (
            <motion.div
              key="expanded-profile"
              initial={motionDisabled ? { opacity: 1 } : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={motionDisabled ? { opacity: 1 } : { opacity: 0 }}
              transition={presenceTransition}
              className="rounded-2xl border border-primary/20 bg-primary/10 p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <Badge variant={source === "saved" ? "success" : "blue"}>{source === "saved" ? "Saved twin" : "Sample twin"}</Badge>
                <span className="text-[10px] font-bold text-primary">{profile.currency}</span>
              </div>
              <p className="text-sm font-black text-foreground">{profile.name}</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {source === "saved" ? "Saved in this browser" : "Bundled sample profile"} · {profile.country}
              </p>
            </motion.div>
          )}
        </SidebarPresence>
      </div>
      <nav
        id={`${layoutScope}-primary-links`}
        aria-label="Primary navigation"
        className={cn(
          "flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto overscroll-contain py-6",
          collapsed ? "px-3" : "px-4"
        )}
      >
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
              aria-label={collapsed ? `${item.label}: ${item.hint}` : undefined}
              title={collapsed ? `${item.label} — ${item.hint}` : undefined}
              className={cn(
                "group relative isolate flex min-h-14 items-center rounded-2xl px-3.5 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                collapsed ? "justify-center px-2" : "gap-3",
                active
                  ? "text-foreground"
                  : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
              )}
            >
              {active && (
                <motion.span
                  layoutId={`primary-navigation-active-${layoutScope}`}
                  aria-hidden="true"
                  transition={{ duration: motionDisabled ? 0 : motionTokens.standard, ease: motionTokens.ease }}
                  className="absolute inset-0 z-0 rounded-2xl border border-primary/25 bg-primary/10 shadow-glow"
                />
              )}
              <span
                className={cn(
                  "relative z-10 flex size-9 shrink-0 items-center justify-center rounded-xl border motion-safe:transition-[color,transform,box-shadow] motion-safe:duration-[var(--motion-fast)] group-hover:scale-[1.04] group-hover:shadow-glow",
                  active
                    ? "border-primary/25 bg-primary/10 text-primary shadow-glow"
                    : "border-border bg-muted/50 text-muted-foreground group-hover:text-primary"
                )}
              >
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <SidebarPresence motionEnabled={motionEnabled}>
                {!collapsed && (
                  <motion.span
                    key="navigation-copy"
                    initial={motionDisabled ? { opacity: 1 } : { opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={motionDisabled ? { opacity: 1 } : { opacity: 0, x: -4 }}
                    transition={presenceTransition}
                    className="relative z-10 min-w-0 flex-1"
                  >
                    <span className="block font-bold">{item.label}</span>
                    <span className="block truncate text-[11px] text-muted-foreground">{item.hint}</span>
                  </motion.span>
                )}
              </SidebarPresence>
            </Link>
          );
        })}
      </nav>
      <div className={cn("flex shrink-0 items-center border-t border-border", collapsed ? "justify-center p-3" : "justify-between gap-3 p-5")}>
        <SidebarPresence motionEnabled={motionEnabled}>
          {!collapsed && (
            <motion.div
              key="model-status"
              initial={motionDisabled ? { opacity: 1 } : { opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              exit={motionDisabled ? { opacity: 1 } : { opacity: 0, x: -4 }}
              transition={presenceTransition}
              className="flex min-w-0 flex-1 items-center justify-between text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground"
            >
              <span className="flex items-center gap-2">
                <span className="h-0.5 w-4 rounded bg-positive" />
                {profile.country}
              </span>
              <span>Browser model</span>
            </motion.div>
          )}
        </SidebarPresence>
        {onCollapseToggle && (
          collapsed ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={onCollapseToggle}
              aria-label="Expand navigation"
              aria-expanded={false}
              aria-controls="desktop-primary-links"
              title="Expand navigation"
            >
              <PanelLeftOpen className="size-4" aria-hidden="true" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={onCollapseToggle}
              aria-label="Collapse navigation"
              aria-expanded={true}
              aria-controls="desktop-primary-links"
              title="Collapse navigation"
            >
              <PanelLeftClose className="size-4" aria-hidden="true" />
            </Button>
          )
        )}
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
          <Link href="/settings" aria-label="Open settings">
            <Settings className="size-4" aria-hidden="true" />
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
  const shouldReduceMotion = useReducedMotion();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarMotionReady, setSidebarMotionReady] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobilePresent, setMobilePresent] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const firstMobileLinkRef = useRef<HTMLAnchorElement>(null);
  const sidebarPreferenceReadableRef = useRef(false);
  const sidebarWidth = sidebarCollapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED;
  const shellTransition = {
    duration: !sidebarMotionReady || shouldReduceMotion ? 0 : motionTokens.standard,
    ease: motionTokens.ease
  };

  const closeMobile = useCallback(() => {
    setMobileOpen(false);
  }, []);

  const completeMobileClose = useCallback(() => {
    setMobilePresent(false);
    requestAnimationFrame(() => menuButtonRef.current?.focus());
  }, []);

  const openMobile = useCallback(() => {
    setMobilePresent(true);
    setMobileOpen(true);
  }, []);

  useBrowserLayoutEffect(() => {
    const storage = getSidebarPreferenceStorage(window);
    const preference = storage
      ? readSidebarCollapsedPreferenceResult(storage)
      : { collapsed: false, readable: false };
    sidebarPreferenceReadableRef.current = preference.readable;
    setSidebarCollapsed(preference.collapsed);
    const motionFrame = requestAnimationFrame(() => setSidebarMotionReady(true));
    return () => cancelAnimationFrame(motionFrame);
  }, []);

  useEffect(() => {
    if (!sidebarMotionReady || !sidebarPreferenceReadableRef.current) return;
    const storage = getSidebarPreferenceStorage(window);
    if (storage) persistSidebarCollapsedPreference(storage, sidebarCollapsed);
  }, [sidebarCollapsed, sidebarMotionReady]);

  useEffect(() => {
    if (!mobilePresent) return;
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
  }, [closeMobile, mobilePresent]);

  return (
    <div className="gradient-mesh min-h-screen">
      <a
        href="#main-content"
        aria-hidden={mobilePresent || undefined}
        inert={mobilePresent || undefined}
        className="app-print-hide fixed left-4 top-4 z-[100] -translate-y-24 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-glow transition-transform focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-ring"
      >
        Skip to main content
      </a>
      <motion.div
        initial={false}
        animate={{ width: sidebarWidth }}
        transition={shellTransition}
        aria-hidden={mobilePresent || undefined}
        inert={mobilePresent || undefined}
        className="app-print-hide fixed inset-y-0 left-0 z-40 hidden lg:block"
      >
        <Sidebar
          collapsed={sidebarCollapsed}
          layoutScope="desktop"
          motionEnabled={sidebarMotionReady}
          onCollapseToggle={() => {
            sidebarPreferenceReadableRef.current = true;
            setSidebarCollapsed((current) => !current);
          }}
        />
      </motion.div>
      <AnimatePresence onExitComplete={completeMobileClose}>
        {mobileOpen && (
          <motion.div
            key="mobile-navigation"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-menu-title"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={{ hidden: {}, visible: {} }}
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
            <motion.button
              type="button"
              variants={{
                hidden: { opacity: shouldReduceMotion ? 1 : 0 },
                visible: { opacity: 1 }
              }}
              transition={{ duration: shouldReduceMotion ? 0 : motionTokens.standard, ease: motionTokens.ease }}
              className="absolute inset-0 bg-background/80 backdrop-blur"
              onClick={closeMobile}
              aria-label="Close navigation"
            />
            <motion.div
              id="mobile-primary-navigation"
              variants={{
                hidden: { opacity: shouldReduceMotion ? 1 : 0, x: shouldReduceMotion ? 0 : -24 },
                visible: { opacity: 1, x: 0 }
              }}
              transition={{ duration: shouldReduceMotion ? 0 : motionTokens.standard, ease: motionTokens.ease }}
              className="relative h-full w-[min(22rem,88vw)] shadow-glass-strong"
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={closeMobile}
                aria-label="Close navigation"
                className="absolute right-3 top-4 z-10"
              >
                <X className="size-4" aria-hidden="true" />
              </Button>
              <Sidebar
                layoutScope="mobile"
                onNavigate={closeMobile}
                firstLinkRef={(element) => { firstMobileLinkRef.current = element; }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div
        initial={false}
        animate={{ "--sidebar-width": `${sidebarWidth}px` }}
        transition={shellTransition}
        style={{ "--sidebar-width": `${SIDEBAR_WIDTH_EXPANDED}px` } as ShellOffsetStyle}
        aria-hidden={mobilePresent || undefined}
        inert={mobilePresent || undefined}
        className="min-w-0 lg:pl-[var(--sidebar-width)]"
      >
        <div className="flex h-[78px] items-center border-b border-border bg-card/80 px-4 backdrop-blur-2xl lg:hidden">
          <Button
            ref={menuButtonRef}
            variant="ghost"
            size="icon"
            onClick={openMobile}
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
        <main id="main-content" tabIndex={-1} className="app-print-main subtle-grid relative min-h-[calc(100vh-78px)] min-w-0 overflow-hidden p-4 outline-none lg:p-8">
          <div className="pointer-events-none absolute right-8 top-8 size-80 rounded-full bg-chart-3/10 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-1/4 size-96 rounded-full bg-positive/[0.08] blur-3xl" />
          <div className="relative min-w-0">{children}</div>
        </main>
      </motion.div>
      <FloatingActions unavailable={mobilePresent} />
    </div>
  );
}

export interface MiniMetricProps {
  label: string;
  value?: string;
  numericValue?: number;
  format?: (value: number) => string;
  suffix?: string;
}

export function MiniMetric({ label, value, numericValue, format, suffix }: MiniMetricProps) {
  return (
    <div className="flex h-full min-w-0 flex-col rounded-xl border border-border bg-card/70 px-3 py-2">
      <p className="min-w-0 break-words text-[10px] font-black uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-1 text-xs font-black tabular-nums text-foreground sm:text-sm">
        {numericValue === undefined ? (
          <span className="min-w-0 break-words">{value}</span>
        ) : (
          <AnimatedNumber
            value={numericValue}
            format={format}
            wrap
            className="min-w-0 max-w-full"
          />
        )}
        {suffix ? <span className="shrink-0 whitespace-nowrap text-[0.82em] text-muted-foreground">{suffix}</span> : null}
      </p>
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
    <header className="mb-7 flex min-w-0 flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        <p className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-primary">
          <Gauge className="size-4" aria-hidden="true" />
          {eyebrow}
        </p>
        <h1 className="gradient-text-blue break-words text-3xl font-black tracking-tight md:text-5xl">{title}</h1>
        <p className="mt-3 max-w-2xl break-words text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      {action}
    </header>
  );
}
