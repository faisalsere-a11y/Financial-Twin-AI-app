"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Bell,
  BrainCircuit,
  CircleDollarSign,
  Flag,
  Home,
  Landmark,
  Search,
  Settings,
  Sparkles,
  Wand2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const commands = [
  { label: "Dashboard", href: "/dashboard", icon: Home, hint: "Twin overview" },
  { label: "Run buy car simulation", href: "/simulations?scenario=car", icon: Wand2, hint: "Decision lab" },
  { label: "Investment simulator", href: "/investments", icon: BarChart3, hint: "Monte Carlo" },
  { label: "Goals tracker", href: "/goals", icon: Flag, hint: "Forecast dates" },
  { label: "Reports", href: "/reports", icon: Landmark, hint: "Export CSV/PDF" },
  { label: "AI insights timeline", href: "/dashboard#insights", icon: Sparkles, hint: "Recommendations" },
  { label: "Notifications", href: "/settings#notifications", icon: Bell, hint: "Alerts" },
  { label: "Settings", href: "/settings", icon: Settings, hint: "Profile and security" },
  { label: "Financial Twin", href: "/dashboard#twin", icon: BrainCircuit, hint: "Health model" },
  { label: "Pricing", href: "/#pricing", icon: CircleDollarSign, hint: "Plans" }
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((current) => !current);
      }
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return commands;
    return commands.filter((command) => `${command.label} ${command.hint}`.toLowerCase().includes(needle));
  }, [query]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-background/70 px-4 pt-20 backdrop-blur-xl">
      <div className="glass-panel w-full max-w-2xl overflow-hidden rounded-xl">
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <Search className="text-muted-foreground" />
          <Input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search commands, pages, scenarios..."
            className="border-0 bg-transparent focus-visible:ring-0"
          />
          <kbd className="rounded border border-border px-2 py-1 text-xs text-muted-foreground">Esc</kbd>
        </div>
        <div className="max-h-96 overflow-y-auto p-2">
          {filtered.map((command) => {
            const Icon = command.icon;
            return (
              <Link
                key={command.label}
                href={command.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors hover:bg-muted/70",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                )}
              >
                <span className="flex size-9 items-center justify-center rounded-lg border border-border bg-background/60 text-primary">
                  <Icon />
                </span>
                <span className="flex flex-1 flex-col">
                  <span className="font-semibold">{command.label}</span>
                  <span className="text-xs text-muted-foreground">{command.hint}</span>
                </span>
              </Link>
            );
          })}
          {!filtered.length && <div className="px-4 py-8 text-center text-sm text-muted-foreground">No command found.</div>}
        </div>
      </div>
    </div>
  );
}
