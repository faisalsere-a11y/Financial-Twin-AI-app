# UI Foundation and Product Shell Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish a production-ready semantic light/dark design foundation, reduced-motion behavior, and accessible responsive product shell without changing route paths or financial behavior.

**Architecture:** CSS variables are the single source of truth for visual semantics, while small pure TypeScript modules own navigation and command metadata. React shell components consume those contracts and use a shared custom event to open the command palette from both keyboard and pointer controls. Existing UI primitives are migrated from dark-only literal colors to semantic tokens before route redesign begins.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Tailwind CSS 3, next-themes, Framer Motion, Lucide, Vitest, React DOM server renderer.

## Global Constraints

- Preserve all existing route paths, financial engines, API contracts, and authentication behavior.
- Add no runtime or test dependency for this milestone.
- Both light and dark themes must use the same semantic token names.
- Every continuous or non-essential animation must simplify under `prefers-reduced-motion: reduce`.
- Consequential controls must expose at least a 44px touch target; compact toolbar controls remain at least 40px.
- New behavior follows red-green-refactor and all existing tests remain green.
- No placeholder actions, TODO comments, demo-success claims, or raw dark-only surface colors may be introduced.

---

### Task 1: Semantic theme and reduced-motion contract

**Files:**
- Create: `tests/ui-foundation.test.tsx`
- Modify: `app/globals.css`
- Modify: `tailwind.config.ts`

**Interfaces:**
- Consumes: Tailwind's existing CSS-variable color pattern.
- Produces: `--canvas`, `--surface`, `--surface-raised`, `--surface-glass`, `--text-primary`, `--text-secondary`, `--brand`, `--positive`, `--caution`, `--danger`, and `--chart-*` variables plus Tailwind utilities with the same semantic names.

- [x] **Step 1: Write the failing token-contract test**

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("UI foundation", () => {
  const css = readFileSync("app/globals.css", "utf8");
  const tailwind = readFileSync("tailwind.config.ts", "utf8");

  it("defines the semantic palette in light and dark themes", () => {
    for (const token of [
      "--canvas",
      "--surface",
      "--surface-raised",
      "--surface-glass",
      "--text-primary",
      "--text-secondary",
      "--brand",
      "--positive",
      "--caution",
      "--danger",
      "--chart-1",
      "--chart-2",
      "--chart-3"
    ]) {
      expect(css.match(new RegExp(token, "g"))?.length).toBeGreaterThanOrEqual(2);
    }
    expect(tailwind).toContain('canvas: "hsl(var(--canvas))"');
    expect(tailwind).toContain('surface: "hsl(var(--surface))"');
  });

  it("provides a global reduced-motion fallback", () => {
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
    expect(css).toContain("scroll-behavior: auto");
    expect(css).toContain("animation-duration: 0.01ms");
  });
});
```

- [x] **Step 2: Run the test and verify RED**

Run:

```powershell
$env:PATH='C:\Users\alase\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin;' + $env:PATH
.\node_modules\.bin\vitest.cmd run tests\ui-foundation.test.tsx
```

Expected: FAIL because semantic variables and the reduced-motion media query do not exist.

- [x] **Step 3: Replace the palette and atmosphere with semantic variables**

Define a warm light `:root` and mineral dark `.dark` palette. Keep the existing shadcn-compatible variables as aliases so current components continue to compile:

```css
:root {
  --canvas: 42 33% 97%;
  --surface: 0 0% 100%;
  --surface-raised: 40 29% 99%;
  --surface-glass: 0 0% 100% / 0.76;
  --text-primary: 224 39% 12%;
  --text-secondary: 220 12% 42%;
  --brand: 221 83% 53%;
  --positive: 160 84% 32%;
  --caution: 38 92% 43%;
  --danger: 354 72% 50%;
  --chart-1: 221 83% 53%;
  --chart-2: 160 84% 32%;
  --chart-3: 262 83% 58%;
  --background: var(--canvas);
  --foreground: var(--text-primary);
  --card: var(--surface);
  --card-foreground: var(--text-primary);
  --popover: var(--surface-raised);
  --popover-foreground: var(--text-primary);
  --primary: var(--brand);
  --primary-foreground: 0 0% 100%;
  --secondary: 214 28% 92%;
  --secondary-foreground: var(--text-primary);
  --muted: 216 25% 93%;
  --muted-foreground: var(--text-secondary);
  --accent: 262 83% 58%;
  --accent-foreground: 0 0% 100%;
  --destructive: var(--danger);
  --destructive-foreground: 0 0% 100%;
  --border: 218 22% 86%;
  --input: 218 22% 82%;
  --ring: var(--brand);
}

.dark {
  --canvas: 225 38% 6%;
  --surface: 224 31% 9%;
  --surface-raised: 223 27% 12%;
  --surface-glass: 224 31% 9% / 0.78;
  --text-primary: 216 33% 97%;
  --text-secondary: 218 13% 66%;
  --brand: 217 91% 60%;
  --positive: 160 84% 44%;
  --caution: 42 92% 56%;
  --danger: 350 88% 62%;
  --chart-1: 217 91% 60%;
  --chart-2: 160 84% 44%;
  --chart-3: 263 84% 70%;
  --background: var(--canvas);
  --foreground: var(--text-primary);
  --card: var(--surface);
  --card-foreground: var(--text-primary);
  --popover: var(--surface-raised);
  --popover-foreground: var(--text-primary);
  --primary: var(--brand);
  --secondary: 224 24% 16%;
  --secondary-foreground: var(--text-primary);
  --muted: 224 22% 15%;
  --muted-foreground: var(--text-secondary);
  --border: 220 23% 19%;
  --input: 220 23% 21%;
  --ring: var(--positive);
}
```

Update `body`, `.glass-panel`, `.glass-panel-strong`, `.subtle-grid`, `.gradient-mesh`, and selection styles to use these variables. Add:

```css
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
  }
}
```

Extend Tailwind colors with:

```ts
canvas: "hsl(var(--canvas))",
surface: "hsl(var(--surface))",
"surface-raised": "hsl(var(--surface-raised))",
"text-primary": "hsl(var(--text-primary))",
"text-secondary": "hsl(var(--text-secondary))",
brand: "hsl(var(--brand))",
positive: "hsl(var(--positive))",
caution: "hsl(var(--caution))",
danger: "hsl(var(--danger))",
chart: {
  1: "hsl(var(--chart-1))",
  2: "hsl(var(--chart-2))",
  3: "hsl(var(--chart-3))"
}
```

- [x] **Step 4: Run the focused test and full suite**

Run the focused command from Step 2, then `.\node_modules\.bin\vitest.cmd run`.

Expected: 3 test files and 6 tests pass.

- [x] **Step 5: Commit**

```powershell
git add tests/ui-foundation.test.tsx app/globals.css tailwind.config.ts
git commit -m "feat: establish semantic theme foundation"
```

### Task 2: Theme-aware providers and semantic UI primitives

**Files:**
- Modify: `tests/ui-foundation.test.tsx`
- Create: `components/ui/themed-toaster.tsx`
- Modify: `app/providers.tsx`
- Modify: `components/ui/button.tsx`
- Modify: `components/ui/card.tsx`
- Modify: `components/ui/input.tsx`
- Modify: `components/ui/select.tsx`
- Modify: `components/ui/switch.tsx`
- Modify: `components/ui/table.tsx`
- Modify: `components/ui/textarea.tsx`

**Interfaces:**
- Consumes: semantic colors from Task 1 and `next-themes` resolved theme.
- Produces: UI primitives that render correctly in both themes and a toaster that follows the resolved theme.

- [x] **Step 1: Add failing static-render tests**

```ts
import { renderToStaticMarkup } from "react-dom/server";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

it("renders primitives with semantic surface and text classes", () => {
  const card = renderToStaticMarkup(<Card><CardTitle>Balance</CardTitle></Card>);
  const button = renderToStaticMarkup(<Button variant="outline">Compare</Button>);
  expect(card).toContain("bg-card");
  expect(card).toContain("text-card-foreground");
  expect(button).toContain("border-border");
  expect(button).not.toContain("border-white");
});

it("renders a labeled switch with semantic state styles", () => {
  const html = renderToStaticMarkup(<Switch checked aria-label="Notifications" />);
  expect(html).toContain('role="switch"');
  expect(html).toContain('aria-checked="true"');
  expect(html).toContain("bg-primary");
  expect(html).not.toContain("border-white");
});
```

- [x] **Step 2: Run and verify RED**

Expected: FAIL because the primitives contain dark-only literal classes.

- [x] **Step 3: Implement semantic primitives and toaster**

Use `border-border`, `bg-card`, `bg-muted`, `text-foreground`, `text-muted-foreground`, `bg-primary`, `bg-secondary`, and semantic hover states in every listed primitive. Preserve component props and exports.

Create:

```tsx
"use client";

import { useTheme } from "next-themes";
import { Toaster } from "sonner";

export function ThemedToaster() {
  const { resolvedTheme } = useTheme();
  return (
    <Toaster
      richColors
      theme={resolvedTheme === "light" ? "light" : "dark"}
      position="top-right"
      toastOptions={{ className: "border-border bg-popover text-popover-foreground" }}
    />
  );
}
```

Replace the hard-coded `Toaster` in `app/providers.tsx` with `<ThemedToaster />`, set `disableTransitionOnChange`, and keep system theme enabled.

- [x] **Step 4: Verify focused and full tests**

Expected: all token and primitive assertions pass; existing engine tests remain green.

- [x] **Step 5: Commit**

```powershell
git add tests/ui-foundation.test.tsx app/providers.tsx components/ui
git commit -m "feat: make UI primitives theme aware"
```

### Task 3: Command metadata and accessible palette launch

**Files:**
- Create: `lib/ui/commands.ts`
- Create: `tests/commands.test.ts`
- Modify: `components/layout/command-palette.tsx`
- Modify: `components/layout/app-shell.tsx`

**Interfaces:**
- Produces: `COMMAND_PALETTE_EVENT`, `commands`, `filterCommands(query)`, and `openCommandPalette()`.
- Consumes: existing route paths and command labels.

- [x] **Step 1: Write failing command-contract tests**

```ts
import { describe, expect, it, vi } from "vitest";
import { COMMAND_PALETTE_EVENT, commands, filterCommands, openCommandPalette } from "@/lib/ui/commands";

describe("command palette contract", () => {
  it("finds commands by label and hint", () => {
    expect(filterCommands("monte carlo").map((item) => item.href)).toEqual(["/investments"]);
    expect(filterCommands("twin overview").map((item) => item.href)).toEqual(["/dashboard"]);
  });

  it("keeps every destination unique", () => {
    expect(new Set(commands.map((item) => item.href)).size).toBe(commands.length);
  });

  it("dispatches the shared open event", () => {
    const dispatchEvent = vi.fn();
    openCommandPalette({ dispatchEvent } as unknown as Window);
    expect(dispatchEvent.mock.calls[0]?.[0]).toBeInstanceOf(Event);
    expect(dispatchEvent.mock.calls[0]?.[0].type).toBe(COMMAND_PALETTE_EVENT);
  });
});
```

- [x] **Step 2: Run and verify RED**

Expected: FAIL because `lib/ui/commands.ts` does not exist.

- [x] **Step 3: Implement the pure command module**

```ts
export const COMMAND_PALETTE_EVENT = "financial-twin:open-command-palette";

export const commands = [
  { label: "Overview", href: "/dashboard", icon: "home", hint: "Twin overview" },
  { label: "Run a car decision", href: "/simulations?scenario=car", icon: "wand", hint: "Decision lab" },
  { label: "Portfolio simulator", href: "/investments", icon: "chart", hint: "Monte Carlo" },
  { label: "Goals", href: "/goals", icon: "flag", hint: "Forecast dates" },
  { label: "Reports", href: "/reports", icon: "landmark", hint: "Export and print" },
  { label: "NOVA brief", href: "/dashboard#insights", icon: "sparkles", hint: "AI evidence" },
  { label: "Notifications", href: "/settings#notifications", icon: "bell", hint: "Alerts" },
  { label: "Settings", href: "/settings", icon: "settings", hint: "Profile and security" },
  { label: "Financial Twin", href: "/dashboard#twin", icon: "brain", hint: "Health model" },
  { label: "Plans", href: "/#pricing", icon: "currency", hint: "Pricing" }
] as const;

export function filterCommands(query: string) {
  const needle = query.trim().toLowerCase();
  return needle
    ? commands.filter((command) => `${command.label} ${command.hint}`.toLowerCase().includes(needle))
    : [...commands];
}

export function openCommandPalette(target: Pick<Window, "dispatchEvent"> = window) {
  target.dispatchEvent(new Event(COMMAND_PALETTE_EVENT));
}
```

- [x] **Step 4: Refactor the palette and launch control**

Map the icon string to Lucide components inside `command-palette.tsx`. Listen for both Ctrl/Cmd+K and `COMMAND_PALETTE_EVENT`. Render the overlay with `role="dialog"`, `aria-modal="true"`, `aria-labelledby="command-palette-title"`, a visually hidden title, `aria-label="Search commands"`, and a real close button. On close, return focus to the previously active element. The top-bar search button calls `openCommandPalette()`.

- [x] **Step 5: Run tests, lint, and commit**

Expected: command tests and full suite pass; lint is clean.

```powershell
git add lib/ui/commands.ts tests/commands.test.ts components/layout/command-palette.tsx components/layout/app-shell.tsx
git commit -m "feat: connect accessible command palette"
```

### Task 4: Navigation contract and responsive shell semantics

**Files:**
- Create: `lib/ui/navigation.ts`
- Create: `tests/navigation.test.ts`
- Modify: `components/layout/app-shell.tsx`

**Interfaces:**
- Produces: `navItems`, `getPageMeta(pathname)`, and semantic product-shell regions.
- Consumes: all existing authenticated route paths.

- [ ] **Step 1: Write the failing navigation tests**

```ts
import { describe, expect, it } from "vitest";
import { getPageMeta, navItems } from "@/lib/ui/navigation";

describe("product navigation", () => {
  it("preserves every authenticated route", () => {
    expect(navItems.map((item) => item.href)).toEqual([
      "/dashboard",
      "/onboarding",
      "/simulations",
      "/investments",
      "/goals",
      "/reports",
      "/settings"
    ]);
  });

  it("uses product language without changing paths", () => {
    expect(navItems.map((item) => item.label)).toEqual([
      "Overview",
      "Twin",
      "Decisions",
      "Portfolio",
      "Goals",
      "Reports",
      "Settings"
    ]);
    expect(getPageMeta("/simulations").eyebrow).toBe("Decision lab");
  });
});
```

- [ ] **Step 2: Run and verify RED**

Expected: FAIL because the navigation module does not exist.

- [ ] **Step 3: Implement navigation metadata**

Create a typed array with `label`, `href`, `icon`, `hint`, and `eyebrow` values. `getPageMeta()` returns the matching entry and falls back to Overview for unknown authenticated paths.

- [ ] **Step 4: Refactor shell semantics and theme surfaces**

Consume `navItems` in the shell and map icon keys locally. Add `aria-current="page"` to the active link. Use semantic surface classes everywhere. Label the sidebar `<nav aria-label="Primary navigation">`. Give the mobile overlay `role="dialog"`, `aria-modal="true"`, and a title, close it on Escape, lock background scroll while open, focus the first navigation link on open, and return focus to the menu trigger on close. Keep the existing responsive breakpoints and route paths.

- [ ] **Step 5: Run tests, lint, build, and commit**

Run:

```powershell
.\node_modules\.bin\vitest.cmd run
.\node_modules\.bin\eslint.cmd .
.\node_modules\.bin\next.cmd build
```

Expected: all tests pass, lint exits 0, and all 18 Next.js pages build.

```powershell
git add lib/ui/navigation.ts tests/navigation.test.ts components/layout/app-shell.tsx
git commit -m "feat: refine responsive product shell"
```

### Task 5: Foundation completion audit

**Files:**
- Modify: `docs/superpowers/plans/2026-07-12-ui-foundation-shell.md`

**Interfaces:**
- Consumes: Tasks 1-4 deliverables.
- Produces: verified milestone evidence and an updated plan with all completed boxes checked.

- [ ] **Step 1: Run the automated gate**

Run the full Vitest suite, ESLint, `tsc --noEmit`, and the production build. Expected: every command exits 0 with no warnings attributable to application code.

- [ ] **Step 2: Run static regression searches**

```powershell
rg -n "border-white|bg-white/|#05080f|#0d1423|color-scheme: dark" components/ui components/layout app/providers.tsx app/globals.css
rg -n "TODO|TBD|placeholder|queued for demo|prepared for demo" app components lib
```

Expected: the first command returns only intentionally documented decorative exceptions outside semantic surfaces; the second returns no new foundation regressions.

- [ ] **Step 3: Inspect Git scope**

Run `git status --short` and `git diff --stat HEAD~4..HEAD`. Expected: only the foundation files and plan are changed by this milestone.

- [ ] **Step 4: Update the plan checkboxes and commit verification evidence**

```powershell
git add docs/superpowers/plans/2026-07-12-ui-foundation-shell.md
git commit -m "docs: record UI foundation verification"
```

Browser-based mobile, focus, keyboard, reduced-motion, and Lighthouse checks remain part of the final product goal and must be executed when the in-app browser control surface is available. This foundation milestone is not sufficient to mark the overall goal complete.
