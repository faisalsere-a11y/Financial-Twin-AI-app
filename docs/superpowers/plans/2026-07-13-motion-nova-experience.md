# Motion, Nova Chat, and Interactive Fintech Experience Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a cohesive, accessible motion system, premium navigation and controls, repaired responsive layouts, an animated landing page, dynamic editable goals, and a deterministic profile-aware Nova chat across Financial Twin.

**Architecture:** Keep the landing page server-rendered and add focused client motion islands. Build shared motion and interaction primitives first, then apply them to the shell and product routes. Keep Nova calculations and goal mutations in pure tested modules; client components consume those modules and the existing account-scoped profile hook.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Framer Motion 11, Recharts, React Hook Form, Zod, TanStack Query, Tailwind CSS, Sonner, Vitest.

## Global Constraints

- Keep the existing design language and color palette.
- Maintain responsiveness across desktop, tablet, and mobile.
- Use GPU-friendly opacity and transform animation; do not animate recurring layout dimensions.
- Respect `prefers-reduced-motion` in CSS, Framer Motion, charts, counters, typing delays, and celebrations.
- Avoid layout shifts and reserve final dimensions in loading states.
- Preserve all current financial engines, authentication behavior, account isolation, CSV export behavior, and the explicit static sample mode.
- Add no runtime dependency; use existing Framer Motion, Recharts, Zod, React Hook Form, TanStack Query, Sonner, and local primitives.
- Do not fabricate customer logos, testimonials, usage metrics, financial history, or external-AI provenance.
- Keep Nova deterministic and local while making wording conversational and evidence-backed.
- Every task follows red-green-refactor and ends in a focused commit.

## File structure

- `lib/motion/number.ts`: pure number interpolation and formatting support.
- `lib/motion/variants.ts`: shared Framer Motion variants and timing constants.
- `components/motion/*`: provider, page transition, reveal/stagger, animated number, and motion card primitives.
- `lib/ui/select-state.ts`: pure keyboard-selection state transitions.
- `components/ui/select.tsx`: accessible animated themed listbox/select.
- `lib/profile/goal-updates.ts`: validated immutable goal edits and reordering.
- `components/goals/*`: progress ring, editor, milestone rail, and celebration.
- `lib/nova/chat.ts`: deterministic intent classification and response composition.
- `components/nova/*`: chat launcher, panel, messages, controlled markdown, and evidence display.
- Existing shell, landing, dashboard, investments, goals, reports, and loading files consume those primitives without duplicating motion logic.

---

### Task 1: Shared motion foundation and reduced-motion contract

**Files:**
- Create: `lib/motion/number.ts`
- Create: `lib/motion/variants.ts`
- Create: `components/motion/motion-provider.tsx`
- Create: `components/motion/page-transition.tsx`
- Create: `components/motion/reveal.tsx`
- Create: `components/motion/animated-number.tsx`
- Create: `components/motion/motion-card.tsx`
- Create: `app/(app)/template.tsx`
- Modify: `app/providers.tsx`
- Modify: `app/globals.css`
- Test: `tests/motion-system.test.ts`

**Interfaces:**
- Produces: `interpolateNumber(from: number, to: number, progress: number): number`.
- Produces: `motionTokens`, `pageVariants`, `revealVariants`, and `staggerVariants`.
- Produces: `<Reveal>`, `<Stagger>`, `<StaggerItem>`, `<AnimatedNumber>`, `<MotionCard>`, and `<PageTransition>`.

- [ ] **Step 1: Write the failing pure and source-contract tests**

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { interpolateNumber } from "../lib/motion/number";

describe("motion foundation", () => {
  it("clamps number interpolation to the requested range", () => {
    expect(interpolateNumber(100, 200, -1)).toBe(100);
    expect(interpolateNumber(100, 200, 0.5)).toBe(150);
    expect(interpolateNumber(100, 200, 2)).toBe(200);
  });

  it("configures user reduced motion and route transitions", () => {
    expect(readFileSync("components/motion/motion-provider.tsx", "utf8")).toContain('reducedMotion="user"');
    expect(readFileSync("app/(app)/template.tsx", "utf8")).toContain("PageTransition");
    expect(readFileSync("components/motion/animated-number.tsx", "utf8")).toContain('aria-hidden="true"');
  });
});
```

- [ ] **Step 2: Run the focused test and confirm RED**

Run: `.\node_modules\.bin\vitest.cmd run tests/motion-system.test.ts`

Expected: FAIL because `lib/motion/number.ts` and the motion components do not exist.

- [ ] **Step 3: Implement the pure interpolation and shared variants**

```ts
// lib/motion/number.ts
export function interpolateNumber(from: number, to: number, progress: number) {
  const clamped = Math.min(1, Math.max(0, progress));
  return from + (to - from) * clamped;
}

// lib/motion/variants.ts
export const motionTokens = {
  fast: 0.16,
  standard: 0.26,
  deliberate: 0.42,
  ease: [0.22, 1, 0.36, 1] as const
};
export const pageVariants = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } };
export const revealVariants = { hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } };
export const staggerVariants = { visible: { transition: { staggerChildren: 0.065 } } };
```

- [ ] **Step 4: Implement the motion components and provider wiring**

Use `MotionConfig reducedMotion="user"`, `useReducedMotion()`, `whileInView`, `viewport={{ once: true, amount: 0.18 }}`, and final-value screen-reader text in `AnimatedNumber`. Add `PageTransition` to `app/(app)/template.tsx`. Extend `app/globals.css` with `--motion-fast`, `--motion-standard`, `--motion-deliberate`, shimmer, glow-sweep, and motion-safe hover utilities; preserve the existing reduced-motion media query.

- [ ] **Step 5: Run the focused and existing dashboard tests**

Run: `.\node_modules\.bin\vitest.cmd run tests/motion-system.test.ts tests/dashboard-experience.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit**

```powershell
git add lib/motion components/motion app/providers.tsx app/globals.css 'app/(app)/template.tsx' tests/motion-system.test.ts
git commit -m "feat: add accessible motion foundation"
```

---

### Task 2: Premium buttons, cards, skeletons, tables, and feedback

**Files:**
- Modify: `components/ui/button.tsx`
- Modify: `components/ui/card.tsx`
- Modify: `components/ui/skeleton.tsx`
- Modify: `components/ui/themed-toaster.tsx`
- Modify: `components/ui/table.tsx`
- Modify: `components/reports/reports-page.tsx`
- Modify: `app/(app)/loading.tsx`
- Test: `tests/interaction-primitives.test.ts`

**Interfaces:**
- Produces: `Card` prop `interactive?: boolean` without changing existing calls.
- Produces: `TableBody` prop `animated?: boolean` and motion-safe stagger classes.

- [ ] **Step 1: Write the failing interaction contracts**

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("interaction primitives", () => {
  it("adds restrained motion and matched loading geometry", () => {
    const button = readFileSync("components/ui/button.tsx", "utf8");
    const card = readFileSync("components/ui/card.tsx", "utf8");
    const skeleton = readFileSync("components/ui/skeleton.tsx", "utf8");
    expect(button).toContain("active:scale-[0.98]");
    expect(card).toContain("interactive");
    expect(card).toContain("motion-safe:hover:-translate-y");
    expect(skeleton).toContain("shimmer");
  });

  it("keeps animated tables and status feedback accessible", () => {
    expect(readFileSync("components/ui/table.tsx", "utf8")).toContain("animated");
    expect(readFileSync("components/ui/themed-toaster.tsx", "utf8")).toContain("prefers-reduced-motion");
    expect(readFileSync("app/(app)/loading.tsx", "utf8")).toContain("Skeleton");
  });
});
```

- [ ] **Step 2: Run and confirm RED**

Run: `.\node_modules\.bin\vitest.cmd run tests/interaction-primitives.test.ts`

Expected: FAIL on missing interaction props and shimmer contracts.

- [ ] **Step 3: Implement opt-in card motion and global control feedback**

Add `interactive` to `Card`, using no more than `-translate-y-0.5` and `scale-[1.01]`. Add press and glow-sweep pseudo-element styles to enabled buttons while preserving `Slot` behavior, focus rings, and disabled state. Add `shimmer` to `Skeleton` with fixed background-size animation.

- [ ] **Step 4: Add animated table rows, toast motion, and route-matched skeletons**

Make row animation opt-in through `TableBody animated`. Apply it to report tables. Configure Sonner class names for slide/check/error-nudge animations. Replace the generic loading screen with skeleton geometry matching a page header, four metrics, and two chart panels.

- [ ] **Step 5: Verify**

Run: `.\node_modules\.bin\vitest.cmd run tests/interaction-primitives.test.ts tests/reports-experience.test.ts tests/ui-foundation.test.tsx`

Expected: PASS.

- [ ] **Step 6: Commit**

```powershell
git add components/ui components/reports/reports-page.tsx 'app/(app)/loading.tsx' tests/interaction-primitives.test.ts
git commit -m "feat: polish interaction and loading primitives"
```

---

### Task 3: Accessible animated select/listbox

**Files:**
- Create: `lib/ui/select-state.ts`
- Rewrite: `components/ui/select.tsx`
- Test: `tests/select-behavior.test.ts`
- Modify: `tests/ui-foundation.test.tsx`

**Interfaces:**
- Produces: `moveSelection(current: number, count: number, key: "ArrowDown" | "ArrowUp" | "Home" | "End"): number`.
- Preserves: `<Select value onValueChange id disabled>` and `<SelectItem value disabled>` call sites.

- [ ] **Step 1: Write failing reducer tests and source contracts**

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { moveSelection } from "../lib/ui/select-state";

describe("premium select", () => {
  it("wraps arrow navigation and handles Home and End", () => {
    expect(moveSelection(0, 3, "ArrowUp")).toBe(2);
    expect(moveSelection(2, 3, "ArrowDown")).toBe(0);
    expect(moveSelection(1, 3, "Home")).toBe(0);
    expect(moveSelection(1, 3, "End")).toBe(2);
  });

  it("uses accessible listbox semantics and graceful close paths", () => {
    const source = readFileSync("components/ui/select.tsx", "utf8");
    expect(source).toContain('role="listbox"');
    expect(source).toContain('role="option"');
    expect(source).toContain('aria-expanded');
    expect(source).toContain('key === "Escape"');
  });
});
```

- [ ] **Step 2: Run and confirm RED**

Run: `.\node_modules\.bin\vitest.cmd run tests/select-behavior.test.ts`

Expected: FAIL because the reducer is absent and the current component is native-only.

- [ ] **Step 3: Implement the pure keyboard reducer**

```ts
export function moveSelection(current: number, count: number, key: "ArrowDown" | "ArrowUp" | "Home" | "End") {
  if (count <= 0) return -1;
  if (key === "Home") return 0;
  if (key === "End") return count - 1;
  return key === "ArrowDown" ? (current + 1) % count : (current - 1 + count) % count;
}
```

- [ ] **Step 4: Implement the themed listbox**

Use a button trigger, positioned `AnimatePresence` panel, listbox options, roving active index, outside-pointer close, Escape close, focus restoration, and a visually hidden native `<select>` synchronized for forms. Generate stable IDs with `useId`; preserve label association through the passed `id`.

- [ ] **Step 5: Verify all select consumers**

Run: `.\node_modules\.bin\vitest.cmd run tests/select-behavior.test.ts tests/ui-foundation.test.tsx tests/settings-experience.test.ts tests/investment-experience.test.ts tests/simulation-experience.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit**

```powershell
git add lib/ui/select-state.ts components/ui/select.tsx tests/select-behavior.test.ts tests/ui-foundation.test.tsx
git commit -m "feat: add accessible premium select"
```

---

### Task 4: Animated collapsible application shell

**Files:**
- Modify: `components/layout/app-shell.tsx`
- Modify: `components/layout/command-palette.tsx`
- Modify: `lib/ui/navigation.ts`
- Test: `tests/navigation-motion.test.ts`

**Interfaces:**
- Produces: browser preference key `financial-twin.sidebar-collapsed.v1`.
- Preserves: current mobile focus trap, Escape close, focus return, inert background, route links, command palette event, and print hiding.

- [ ] **Step 1: Write failing shell contracts**

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("premium navigation shell", () => {
  const shell = readFileSync("components/layout/app-shell.tsx", "utf8");
  it("supports persisted desktop collapse and animated active state", () => {
    expect(shell).toContain("financial-twin.sidebar-collapsed.v1");
    expect(shell).toContain('aria-label="Collapse navigation"');
    expect(shell).toContain("layoutId");
  });
  it("animates mobile navigation without weakening modal behavior", () => {
    expect(shell).toContain("AnimatePresence");
    expect(shell).toContain('aria-modal="true"');
    expect(shell).toContain("inert=");
    expect(shell).toContain("previousFocus");
  });
});
```

- [ ] **Step 2: Run and confirm RED**

Run: `.\node_modules\.bin\vitest.cmd run tests/navigation-motion.test.ts`

Expected: FAIL on collapse and motion contracts.

- [ ] **Step 3: Implement desktop collapse**

Add a hydrated persisted boolean, a labeled collapse button, shared `layoutId` active rail, width transition between 280 px and 88 px, synchronized main offset, icon hover scale, text presence fade, and tooltips/`aria-label` values in compact mode.

- [ ] **Step 4: Implement mobile and command palette presence motion**

Wrap backdrop/drawer and command palette in `AnimatePresence`. Use opacity plus x/scale transforms, never animate full-screen blur. Retain existing keyboard loops and background isolation.

- [ ] **Step 5: Verify**

Run: `.\node_modules\.bin\vitest.cmd run tests/navigation-motion.test.ts tests/navigation.test.ts tests/commands.test.ts tests/launch-hardening.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit**

```powershell
git add components/layout lib/ui/navigation.ts tests/navigation-motion.test.ts
git commit -m "feat: animate premium application shell"
```

---

### Task 5: Dashboard metric motion and obligations clipping repair

**Files:**
- Modify: `components/layout/app-shell.tsx`
- Modify: `components/dashboard/dashboard-client.tsx`
- Modify: `components/data/metric-card.tsx`
- Test: `tests/dashboard-motion-layout.test.ts`

**Interfaces:**
- Consumes: `AnimatedNumber`, `Reveal`, `Stagger`, and `MotionCard`.
- Produces: overflow-safe `MiniMetric` with optional `numericValue`, `format`, and `suffix` props.

- [ ] **Step 1: Write failing layout and motion contracts**

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("dashboard motion and layout", () => {
  it("makes metric grid boundaries shrink-safe", () => {
    const shell = readFileSync("components/layout/app-shell.tsx", "utf8");
    const dashboard = readFileSync("components/dashboard/dashboard-client.tsx", "utf8");
    expect(shell).toContain("min-w-0");
    expect(shell).toContain("break-words");
    expect(dashboard).toContain("minmax(0,1fr)");
  });
  it("animates primary metrics and charts with reduced-motion support", () => {
    const dashboard = readFileSync("components/dashboard/dashboard-client.tsx", "utf8");
    expect(dashboard).toContain("AnimatedNumber");
    expect(dashboard).toContain("isAnimationActive={!reduceMotion}");
  });
});
```

- [ ] **Step 2: Run and confirm RED**

Run: `.\node_modules\.bin\vitest.cmd run tests/dashboard-motion-layout.test.ts`

Expected: FAIL on new shrink-safety and animation contracts.

- [ ] **Step 3: Repair obligations and metric layout**

Add `min-w-0` at every identity-header grid boundary, `h-full` on peer metrics, responsive numeric typography, and safe wrapping that keeps `/mo` visible. Replace rigid four-column definitions with `repeat(4,minmax(0,1fr))` only at widths that support it and a two-column intermediate layout otherwise.

- [ ] **Step 4: Apply number, card, and chart animation**

Animate prominent figures with final semantic text, stagger quick-decision cards, and pass reduced-motion-aware Recharts animation props. Keep chart textual summaries authoritative.

- [ ] **Step 5: Verify**

Run: `.\node_modules\.bin\vitest.cmd run tests/dashboard-motion-layout.test.ts tests/dashboard-experience.test.ts tests/financial-overview.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit**

```powershell
git add components/layout/app-shell.tsx components/dashboard components/data/metric-card.tsx tests/dashboard-motion-layout.test.ts
git commit -m "fix: animate dashboard without metric clipping"
```

---

### Task 6: Portfolio responsive repair and animated projections

**Files:**
- Modify: `components/investments/investment-simulator.tsx`
- Modify: `components/data/chart-frame.tsx`
- Test: `tests/investment-motion-layout.test.ts`

**Interfaces:**
- Consumes: `AnimatedNumber`, `Reveal`, `Stagger`, and `MotionCard`.
- Preserves: `runInvestmentProjection`, `runMonteCarlo`, deterministic seed 1337, accessible summaries, and account/profile revision boundaries.

- [ ] **Step 1: Write failing responsive contracts**

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("portfolio motion layout", () => {
  const source = readFileSync("components/investments/investment-simulator.tsx", "utf8");
  it("uses shrink-safe auto-fitting metrics and chart containers", () => {
    expect(source).toContain("minmax(min(100%,14rem),1fr)");
    expect(source).toContain("min-w-0");
    expect(source).toContain("overflow-hidden");
  });
  it("animates metrics and charts without changing deterministic inputs", () => {
    expect(source).toContain("AnimatedNumber");
    expect(source).toContain("isAnimationActive={!reduceMotion}");
    expect(source).toContain("seed: 1337");
  });
});
```

- [ ] **Step 2: Run and confirm RED**

Run: `.\node_modules\.bin\vitest.cmd run tests/investment-motion-layout.test.ts`

Expected: FAIL.

- [ ] **Step 3: Repair the layout**

Change summary metrics to `grid-cols-[repeat(auto-fit,minmax(min(100%,14rem),1fr))]`, add `min-w-0` to the content column and chart frames, use overflow-safe value typography, and move the two-column shell breakpoint to the first width where 22 rem plus chart minimum and gaps fit.

- [ ] **Step 4: Apply motion**

Animate summary values, preset changes, and chart paths. Disable Recharts animation under reduced motion and keep chart dimensions fixed at 20 rem.

- [ ] **Step 5: Verify**

Run: `.\node_modules\.bin\vitest.cmd run tests/investment-motion-layout.test.ts tests/investment-experience.test.ts tests/investment-engine.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit**

```powershell
git add components/investments/investment-simulator.tsx components/data/chart-frame.tsx tests/investment-motion-layout.test.ts
git commit -m "fix: refine animated portfolio layout"
```

---

### Task 7: High-impact server-rendered landing experience

**Files:**
- Create: `components/landing/landing-motion.tsx`
- Create: `components/landing/hero-atmosphere.tsx`
- Modify: `components/landing/landing-page.tsx`
- Modify: `components/landing/decision-preview.tsx`
- Modify: `components/landing/landing-nav.tsx`
- Test: `tests/landing-motion.test.ts`
- Modify: `tests/landing-experience.test.ts`

**Interfaces:**
- Produces: `<LandingReveal>`, `<LandingStagger>`, and `<HeroAtmosphere>` client islands.
- Preserves: `LandingPage` as a server component with no direct Framer Motion or Recharts import.

- [ ] **Step 1: Write failing landing contracts**

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("landing motion", () => {
  const landing = readFileSync("components/landing/landing-page.tsx", "utf8");
  const motion = readFileSync("components/landing/landing-motion.tsx", "utf8");
  it("preserves server rendering while using focused motion islands", () => {
    expect(landing).not.toContain('"use client"');
    expect(landing).not.toContain('from "framer-motion"');
    expect(landing).toContain("LandingReveal");
    expect(motion).toContain('"use client"');
  });
  it("disables pointer atmosphere for touch and reduced motion", () => {
    const atmosphere = readFileSync("components/landing/hero-atmosphere.tsx", "utf8");
    expect(atmosphere).toContain("useReducedMotion");
    expect(atmosphere).toContain("pointer: fine");
  });
});
```

- [ ] **Step 2: Run and confirm RED**

Run: `.\node_modules\.bin\vitest.cmd run tests/landing-motion.test.ts`

Expected: FAIL because the landing motion islands do not exist.

- [ ] **Step 3: Implement focused motion islands**

Build client wrappers around shared `Reveal`/`Stagger`. `HeroAtmosphere` tracks normalized pointer coordinates only for precise pointers, writes spring-smoothed CSS transforms, and renders static gradients under reduced motion.

- [ ] **Step 4: Redesign hero and scroll narrative**

Add layered ambient light, staged headline/copy/CTA, floating evidence chips, animated preview chart, trust capability ticker, staggered workflow/features, Nova evidence sequence, and animated final CTA. Do not add unverifiable testimonials, logos, or user counts.

- [ ] **Step 5: Verify server/static contracts**

Run: `.\node_modules\.bin\vitest.cmd run tests/landing-motion.test.ts tests/landing-experience.test.ts tests/landing-preview.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit**

```powershell
git add components/landing tests/landing-motion.test.ts tests/landing-experience.test.ts
git commit -m "feat: create cinematic landing experience"
```

---

### Task 8: Dynamic editable goals and completion celebration

**Files:**
- Create: `lib/profile/goal-updates.ts`
- Create: `components/goals/goal-progress-ring.tsx`
- Create: `components/goals/goal-editor.tsx`
- Create: `components/goals/goal-celebration.tsx`
- Modify: `components/goals/goals-page.tsx`
- Test: `tests/goal-updates.test.ts`
- Modify: `tests/goals-experience.test.ts`

**Interfaces:**
- Produces: `goalUpdateSchema`.
- Produces: `updateGoal(profile, goalId, values): FinancialProfile`.
- Produces: `moveGoal(profile, goalId, direction: -1 | 1): FinancialProfile`.
- Produces: `crossedGoalCompletion(before, after): boolean`.

- [ ] **Step 1: Write failing domain tests**

```ts
import { describe, expect, it } from "vitest";
import { sampleProfile } from "../lib/financial/sample-data";
import { crossedGoalCompletion, moveGoal, updateGoal } from "../lib/profile/goal-updates";

describe("goal updates", () => {
  it("immutably updates the selected goal", () => {
    const goal = sampleProfile.goals[0]!;
    const next = updateGoal(sampleProfile, goal.id, { ...goal, currentAmount: goal.currentAmount + 500 });
    expect(next.goals[0]?.currentAmount).toBe(goal.currentAmount + 500);
    expect(next).not.toBe(sampleProfile);
  });
  it("reorders within bounds", () => {
    expect(moveGoal(sampleProfile, sampleProfile.goals[0]!.id, -1).goals).toEqual(sampleProfile.goals);
    expect(moveGoal(sampleProfile, sampleProfile.goals[1]!.id, -1).goals[0]?.id).toBe(sampleProfile.goals[1]?.id);
  });
  it("celebrates only a transition across 100 percent", () => {
    expect(crossedGoalCompletion({ currentAmount: 90, targetAmount: 100 }, { currentAmount: 100, targetAmount: 100 })).toBe(true);
    expect(crossedGoalCompletion({ currentAmount: 100, targetAmount: 100 }, { currentAmount: 100, targetAmount: 100 })).toBe(false);
  });
});
```

- [ ] **Step 2: Run and confirm RED**

Run: `.\node_modules\.bin\vitest.cmd run tests/goal-updates.test.ts`

Expected: FAIL because the goal update module is absent.

- [ ] **Step 3: Implement validated immutable goal operations**

Use Zod to validate name, category, amounts, contribution, ISO target date, and priority. Throw a stable `GoalUpdateError` for missing IDs or invalid values. Clamp reorder indexes without mutating the original profile.

- [ ] **Step 4: Implement goal motion components**

Build an SVG progress ring with semantic text, a keyboard-accessible dialog/drawer editor, milestone rail, explicit earlier/later buttons, and CSS particle celebration gated by `useReducedMotion()` and `crossedGoalCompletion`.

- [ ] **Step 5: Integrate with account-scoped profile persistence**

Use `save` from `useFinancialProfile`, preserve subject/revision boundaries, keep invalid entries in the editor, announce save success inline, and recompute `forecastGoalCompletion(profile)` from the updated profile.

- [ ] **Step 6: Verify**

Run: `.\node_modules\.bin\vitest.cmd run tests/goal-updates.test.ts tests/goals-experience.test.ts tests/profile-browser-store.test.ts tests/financial-engine.test.ts`

Expected: PASS.

- [ ] **Step 7: Commit**

```powershell
git add lib/profile/goal-updates.ts components/goals tests/goal-updates.test.ts tests/goals-experience.test.ts
git commit -m "feat: make goals interactive and dynamic"
```

---

### Task 9: Deterministic conversational Nova response engine

**Files:**
- Create: `lib/nova/chat.ts`
- Test: `tests/nova-chat.test.ts`

**Interfaces:**
- Produces: `NovaChatIntent`, `NovaChatRequest`, `NovaChatResponse`, `classifyNovaIntent(message)`, and `createNovaResponse(request)` exactly as defined in the approved design specification.

- [ ] **Step 1: Write failing intent and evidence tests**

```ts
import { describe, expect, it } from "vitest";
import { calculateFinancialTwin } from "../lib/financial/engine";
import { sampleProfile } from "../lib/financial/sample-data";
import { classifyNovaIntent, createNovaResponse } from "../lib/nova/chat";

describe("deterministic Nova chat", () => {
  const twin = calculateFinancialTwin(sampleProfile);
  it.each([
    ["What is my biggest expense?", "spending"],
    ["Analyze my investments", "investments"],
    ["How can I reach my house goal?", "goals"],
    ["Summarize my financial health", "health"],
    ["How much debt do I have?", "debt"]
  ])("classifies %s", (message, intent) => expect(classifyNovaIntent(message)).toBe(intent));

  it("grounds every answer in real profile evidence", () => {
    const response = createNovaResponse({ message: "Summarize my financial health", profile: sampleProfile, twin });
    expect(response.intent).toBe("health");
    expect(response.evidence.some((item) => item.value.includes(String(twin.financialHealth.score)))).toBe(true);
    expect(response.boundary).toContain("educational");
  });

  it("varies wording stably without randomness", () => {
    const request = { message: "Analyze my investments", profile: sampleProfile, twin };
    expect(createNovaResponse(request)).toEqual(createNovaResponse(request));
  });
});
```

- [ ] **Step 2: Run and confirm RED**

Run: `.\node_modules\.bin\vitest.cmd run tests/nova-chat.test.ts`

Expected: FAIL because `lib/nova/chat.ts` does not exist.

- [ ] **Step 3: Implement intent classification**

Normalize lowercase text, strip punctuation, and apply priority groups in this order: debt, goals, investments, spending, health, general. Use explicit keyword arrays and never infer unsupported transaction history.

- [ ] **Step 4: Implement response composition**

Derive evidence from `FinancialTwinResult`, profile expense categories, assets, debts, and goal forecasts. Select one of three approved phrase templates through a stable string hash. Return four context-aware follow-ups and the educational boundary. Unsupported history questions state that no transaction feed is connected.

- [ ] **Step 5: Verify**

Run: `.\node_modules\.bin\vitest.cmd run tests/nova-chat.test.ts tests/financial-engine.test.ts tests/nova-decision.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit**

```powershell
git add lib/nova/chat.ts tests/nova-chat.test.ts
git commit -m "feat: add deterministic Nova conversation engine"
```

---

### Task 10: Nova chat interface and floating-action rail

**Files:**
- Create: `components/nova/nova-markdown.tsx`
- Create: `components/nova/nova-chat.tsx`
- Create: `components/nova/nova-chat-launcher.tsx`
- Create: `components/layout/floating-actions.tsx`
- Modify: `app/providers.tsx`
- Modify: `components/layout/app-shell.tsx`
- Modify: `app/globals.css`
- Test: `tests/nova-chat-experience.test.ts`

**Interfaces:**
- Consumes: `createNovaResponse`, active profile, `calculateFinancialTwin`, and `NovaOrb`.
- Produces: `<NovaChatLauncher />` and `<FloatingActions />`.
- Chat context key: `${subject}:${savedAt ?? "sample"}`.

- [ ] **Step 1: Write failing interface contracts**

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Nova chat experience", () => {
  const chat = readFileSync("components/nova/nova-chat.tsx", "utf8");
  it("uses a profile-revision context and deterministic engine", () => {
    expect(chat).toContain("createNovaResponse");
    expect(chat).toContain('`${subject}:${savedAt ?? "sample"}`');
    expect(chat).toContain("calculateFinancialTwin(profile)");
  });
  it("provides modal, typing, suggestion, and focus behavior", () => {
    expect(chat).toContain('role="dialog"');
    expect(chat).toContain('aria-modal="true"');
    expect(chat).toContain("Typing");
    expect(chat).toContain("requestAnimationFrame");
    expect(chat).toContain("previousFocus");
  });
  it("renders controlled markdown without raw HTML", () => {
    const markdown = readFileSync("components/nova/nova-markdown.tsx", "utf8");
    expect(markdown).toContain("fenced");
    expect(markdown).not.toContain("dangerouslySetInnerHTML");
  });
});
```

- [ ] **Step 2: Run and confirm RED**

Run: `.\node_modules\.bin\vitest.cmd run tests/nova-chat-experience.test.ts`

Expected: FAIL because the chat components are absent.

- [ ] **Step 3: Implement controlled markdown and message model**

Parse only Nova-controlled paragraphs, bullet lines, `**strong**`, inline backticks, and fenced code blocks into React elements. Render user messages as text. Define typed user/assistant messages with ISO timestamps and evidence arrays.

- [ ] **Step 4: Implement the launcher and responsive chat panel**

Use lazy client import for the panel, idle pulse until first open, focus trap, Escape close, focus restoration, inert background callback, auto-scroll, reduced-motion-aware typing delay, message presence animation, five suggested prompts, evidence chips, and follow-up buttons. Cancel staged output when the profile context key changes.

- [ ] **Step 5: Integrate the shared floating-action rail**

Replace the standalone command button with `FloatingActions`, positioning command and Nova actions without overlap on desktop or mobile. Hide both in print. Keep command palette behavior unchanged.

- [ ] **Step 6: Verify**

Run: `.\node_modules\.bin\vitest.cmd run tests/nova-chat-experience.test.ts tests/nova-chat.test.ts tests/commands.test.ts tests/launch-hardening.test.ts`

Expected: PASS.

- [ ] **Step 7: Commit**

```powershell
git add components/nova components/layout/floating-actions.tsx components/layout/app-shell.tsx app/providers.tsx app/globals.css tests/nova-chat-experience.test.ts
git commit -m "feat: add conversational Nova chat"
```

---

### Task 11: Route-wide motion application and consistency audit

**Files:**
- Modify: `components/auth/auth-card.tsx`
- Modify: `components/onboarding/onboarding-wizard.tsx`
- Modify: `components/simulations/simulation-center.tsx`
- Modify: `components/reports/reports-page.tsx`
- Modify: `components/settings/settings-page.tsx`
- Modify: `components/dashboard/dashboard-client.tsx`
- Modify: `app/globals.css`
- Test: `tests/route-motion-coverage.test.ts`

**Interfaces:**
- Consumes all shared motion primitives.
- Preserves route-specific validation, status messages, account/profile revision keys, and engine provenance.

- [ ] **Step 1: Write the failing coverage contract**

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("route motion coverage", () => {
  for (const path of [
    "components/auth/auth-card.tsx",
    "components/onboarding/onboarding-wizard.tsx",
    "components/simulations/simulation-center.tsx",
    "components/reports/reports-page.tsx",
    "components/settings/settings-page.tsx"
  ]) {
    it(`${path} uses shared motion instead of ad-hoc keyframes`, () => {
      const source = readFileSync(path, "utf8");
      expect(source).toMatch(/Reveal|Stagger|MotionCard|AnimatePresence/);
      expect(source).not.toContain("setInterval(");
    });
  }
});
```

- [ ] **Step 2: Run and confirm RED**

Run: `.\node_modules\.bin\vitest.cmd run tests/route-motion-coverage.test.ts`

Expected: FAIL for routes that do not yet consume the shared primitives.

- [ ] **Step 3: Apply shared motion deliberately**

Use route entrance from the template plus one local stagger group per route. Animate onboarding step presence, simulation result presence, report period changes, and settings status panels. Do not animate every nested element or validation message.

- [ ] **Step 4: Audit spacing, overflow, focus, and light/dark consistency**

Remove accidental `overflow-hidden` where it clips focus or shadows, retain it where charts/decoration require containment, add `min-w-0` to all flex/grid content boundaries found during the audit, and use only theme tokens for shadows/colors.

- [ ] **Step 5: Verify route suites**

Run: `.\node_modules\.bin\vitest.cmd run tests/route-motion-coverage.test.ts tests/auth-experience.test.ts tests/onboarding-experience.test.ts tests/simulation-experience.test.ts tests/reports-experience.test.ts tests/settings-experience.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit**

```powershell
git add components app/globals.css tests/route-motion-coverage.test.ts
git commit -m "feat: apply cohesive motion across product routes"
```

---

### Task 12: Full verification, browser regression, and deployment artifacts

**Files:**
- Modify: `docs/superpowers/plans/2026-07-13-motion-nova-experience.md`
- Regenerate: `docs/` through `scripts/build-github-pages.mjs`

**Interfaces:**
- Verifies all earlier task outputs together.

- [ ] **Step 1: Run complete automated gates**

```powershell
.\node_modules\.bin\vitest.cmd run
.\node_modules\.bin\tsc.cmd --noEmit
.\node_modules\.bin\eslint.cmd .
git diff --check
```

Expected: all tests pass, TypeScript and ESLint emit no errors, and diff check is clean.

- [ ] **Step 2: Verify protected engines remain unchanged**

```powershell
git diff 560fc46 -- lib/financial/engine.ts lib/financial/investments.ts lib/reports/export.ts
```

Expected: no diff unless a separately documented, test-proven fix was explicitly approved.

- [ ] **Step 3: Build authenticated server mode**

```powershell
$env:DATABASE_URL='file:./dev.db'
$env:AUTH_SECRET='motion-verification-secret-2026'
$env:AUTH_TRUST_HOST='true'
$env:NEXTAUTH_URL='http://localhost:3000'
node scripts/clean-next.mjs
.\node_modules\.bin\prisma.cmd generate
.\node_modules\.bin\next.cmd build
```

Expected: successful build with authenticated product routes dynamic and API routes present.

- [ ] **Step 4: Run browser regression in authenticated mode**

Exercise `/`, all auth routes, onboarding, dashboard, simulations, investments, goals, reports, and settings at approximately 1440×900, 900×1100, and 390×844. Verify:

- No horizontal overflow or clipped obligations/portfolio metrics.
- Sidebar expand/collapse persistence, active indicator, mobile focus trap, Escape, and focus return.
- Dropdown mouse and keyboard selection, Escape close, focus restoration, and theme appearance.
- Reduced-motion page navigation, counters, charts, drawer, goals, and Nova chat.
- Goal edit, validation, reorder, save, completion celebration, and account/profile revision reset.
- Nova prompt suggestions, custom question, evidence, unsupported transaction-history answer, timestamps, auto-scroll, Escape, and profile-context reset.
- Landing pointer motion on desktop, static touch behavior on mobile, and server-rendered content.
- Empty/loading/error/success states, console errors/warnings, one `h1`, one main landmark, and named controls.

- [ ] **Step 5: Build static sample and verify preservation**

Run: `node scripts/build-github-pages.mjs`

Expected: 14 static pages, `app/api` restored, `docs/superpowers` preserved, no backup paths, Nova deterministic chat functional, and no `/api/auth/session` request because static SessionProvider receives `null`.

- [ ] **Step 6: Record evidence and commit generated output**

Update this plan with exact test counts, build route counts, browser widths, verified interactions, limitations, and any consciously deferred recommendation. Then run:

```powershell
git add --all
git commit -m "chore: verify motion and Nova experience"
```

Expected: clean worktree and all plan checkboxes complete.
