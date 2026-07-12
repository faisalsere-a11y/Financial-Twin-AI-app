"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  Wand2,
  X,
  type LucideIcon
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  COMMAND_PALETTE_EVENT,
  filterCommands,
  type CommandIcon
} from "@/lib/ui/commands";
import { cn } from "@/lib/utils";

const icons: Record<CommandIcon, LucideIcon> = {
  bell: Bell,
  brain: BrainCircuit,
  chart: BarChart3,
  currency: CircleDollarSign,
  flag: Flag,
  home: Home,
  landmark: Landmark,
  settings: Settings,
  sparkles: Sparkles,
  wand: Wand2
};

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "[tabindex]:not([tabindex='-1'])"
].join(",");

export function CommandPalette({ onOpenChange }: { onOpenChange?: (open: boolean) => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const filtered = useMemo(() => filterCommands(query), [query]);

  const show = useCallback(() => {
    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setOpen(true);
    onOpenChange?.(true);
  }, [onOpenChange]);

  const close = useCallback(() => {
    setOpen(false);
    onOpenChange?.(false);
    setQuery("");
    requestAnimationFrame(() => previousFocusRef.current?.focus());
  }, [onOpenChange]);

  useEffect(() => {
    const onOpenRequest = () => show();
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (open) close();
        else show();
      } else if (event.key === "Escape" && open) {
        event.preventDefault();
        close();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener(COMMAND_PALETTE_EVENT, onOpenRequest);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener(COMMAND_PALETTE_EVENT, onOpenRequest);
    };
  }, [close, open, show]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  if (!open) return null;

  const focusCommand = (index: number) => {
    const items = dialogRef.current?.querySelectorAll<HTMLElement>("[role='option']");
    items?.[Math.max(0, Math.min(index, items.length - 1))]?.focus();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-background/78 px-4 pt-20 backdrop-blur-xl"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="command-palette-title"
        className="glass-panel-strong w-full max-w-2xl overflow-hidden rounded-2xl"
        onKeyDown={(event) => {
          if (event.key !== "Tab") return;
          const focusable = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>(focusableSelector) ?? []);
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
        <h2 id="command-palette-title" className="sr-only">Quick navigation and actions</h2>
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <Search className="size-5 text-muted-foreground" aria-hidden="true" />
          <Input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown" && filtered.length) {
                event.preventDefault();
                setActiveIndex(0);
                focusCommand(0);
              }
            }}
            placeholder="Search pages, decisions, and reports"
            aria-label="Search commands"
            aria-controls="command-palette-results"
            className="border-0 bg-transparent focus-visible:ring-0"
          />
          <kbd className="hidden rounded-lg border border-border bg-muted px-2 py-1 text-xs text-muted-foreground sm:block">
            Esc
          </kbd>
          <Button variant="ghost" size="icon" onClick={close} aria-label="Close command palette">
            <X className="size-4" />
          </Button>
        </div>
        <div id="command-palette-results" role="listbox" aria-label="Commands" className="max-h-96 overflow-y-auto p-2">
          {filtered.map((command, index) => {
            const Icon = icons[command.icon];
            return (
              <Link
                key={command.label}
                href={command.href}
                role="option"
                aria-selected={activeIndex === index}
                onFocus={() => setActiveIndex(index)}
                onKeyDown={(event) => {
                  if (event.key === "ArrowDown") {
                    event.preventDefault();
                    const next = (index + 1) % filtered.length;
                    setActiveIndex(next);
                    focusCommand(next);
                  } else if (event.key === "ArrowUp") {
                    event.preventDefault();
                    const next = (index - 1 + filtered.length) % filtered.length;
                    setActiveIndex(next);
                    focusCommand(next);
                  }
                }}
                onClick={close}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm transition-colors hover:bg-muted",
                  "focus-visible:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                )}
              >
                <span className="flex size-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <span className="flex flex-1 flex-col">
                  <span className="font-semibold">{command.label}</span>
                  <span className="text-xs text-muted-foreground">{command.hint}</span>
                </span>
              </Link>
            );
          })}
          {!filtered.length && (
            <div role="status" className="px-4 py-10 text-center text-sm text-muted-foreground">
              No matching command. Try a page or financial task.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
