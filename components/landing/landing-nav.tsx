"use client";

import Link from "next/link";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { NovaOrb } from "@/components/brand/nova-orb";
import { Button } from "@/components/ui/button";

function LandingThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const dark = resolvedTheme === "dark";

  return (
    <Button variant="ghost" size="icon" aria-label={`Switch to ${dark ? "light" : "dark"} theme`} onClick={() => setTheme(dark ? "light" : "dark")}>
      {dark ? <Sun className="size-4" aria-hidden="true" /> : <Moon className="size-4" aria-hidden="true" />}
    </Button>
  );
}

export function LandingNav() {
  return (
    <header className="fixed left-0 right-0 top-0 z-40 border-b border-border bg-card/75 backdrop-blur-2xl">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="group flex items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <NovaOrb className="size-10 transition-transform group-hover:scale-105" />
          <span className="leading-tight">
            <span className="block text-sm font-black tracking-tight">Financial Twin AI</span>
            <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">NOVA intelligence</span>
          </span>
        </Link>
        <nav aria-label="Landing page" className="hidden items-center gap-6 text-sm font-semibold text-muted-foreground md:flex">
          <Link href="#how-it-works" className="rounded-lg hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">How it works</Link>
          <Link href="#nova" className="rounded-lg hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">NOVA</Link>
          <Link href="#trust" className="rounded-lg hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Trust</Link>
          <Link href="#faq" className="rounded-lg hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">FAQ</Link>
        </nav>
        <div className="flex items-center gap-1 sm:gap-2">
          <LandingThemeToggle />
          <Button variant="ghost" size="sm" asChild><Link href="/login">Login</Link></Button>
          <Button size="sm" asChild><Link href="/signup">Start free</Link></Button>
        </div>
      </div>
    </header>
  );
}
