"use client";

import Link from "next/link";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { NovaOrb } from "@/components/brand/nova-orb";
import { Button } from "@/components/ui/button";

const navigationLinkClass = "rounded-lg px-1 py-2 transition-colors duration-[var(--motion-fast)] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

function LandingThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const dark = resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-9 shrink-0"
      aria-label={`Switch to ${dark ? "light" : "dark"} theme`}
      onClick={() => setTheme(dark ? "light" : "dark")}
    >
      {dark ? <Sun className="size-4" aria-hidden="true" /> : <Moon className="size-4" aria-hidden="true" />}
    </Button>
  );
}

export function LandingNav() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-border/80 bg-card/75 backdrop-blur-2xl supports-[backdrop-filter]:bg-card/65">
      <div className="container flex h-16 min-w-0 items-center justify-between gap-2">
        <Link
          href="/"
          aria-label="Financial Twin AI home"
          className="group flex min-w-0 shrink-0 items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <NovaOrb className="size-9 shrink-0 transition-transform duration-[var(--motion-fast)] group-hover:scale-105 motion-reduce:transform-none sm:size-10" />
          <span className="hidden min-w-0 leading-tight sm:block">
            <span className="block truncate text-sm font-black tracking-tight">Financial Twin AI</span>
            <span className="block truncate text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">NOVA intelligence</span>
          </span>
        </Link>
        <nav aria-label="Landing page" className="hidden items-center gap-5 text-sm font-semibold text-muted-foreground lg:flex xl:gap-7">
          <Link href="#how-it-works" className={navigationLinkClass}>How it works</Link>
          <Link href="#nova" className={navigationLinkClass}>NOVA</Link>
          <Link href="#trust" className={navigationLinkClass}>Trust</Link>
          <Link href="#faq" className={navigationLinkClass}>FAQ</Link>
        </nav>
        <div className="flex min-w-0 shrink-0 items-center gap-0.5 sm:gap-1">
          <LandingThemeToggle />
          <Button variant="ghost" size="sm" className="px-2 sm:px-3" asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button size="sm" className="px-2.5 sm:px-3" asChild>
            <Link href="/signup"><span className="sm:hidden">Start</span><span className="hidden sm:inline">Start free</span></Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
