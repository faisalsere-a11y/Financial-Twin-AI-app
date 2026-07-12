# Landing and Authentication Experience Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the hard-coded demo landing and generic auth forms with an evidence-led, lightweight public journey powered by the real financial engine and honest, accessible authentication states.

**Architecture:** A pure landing adapter selects existing scenarios and produces preview data through `buildFinancialOverview`; a small client island owns scenario selection and inline SVG rendering while the remaining landing page stays server-rendered. A separate pure auth-presentation module owns mode-specific copy, destinations, defaults, and sample credentials so `AuthCard` handles only form state and side effects.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Tailwind CSS, React Hook Form, Zod, NextAuth, Vitest.

## Global Constraints

- Preserve `/`, `/login`, `/signup`, `/forgot-password`, `/dashboard`, and every existing route path.
- Preserve seeded sample access while never prefilling or exposing the password by default.
- Use only existing dependencies; landing must not import Recharts or Framer Motion.
- All displayed financial numbers come from the existing financial engine and Saudi/SAR sample profile.
- Remove fabricated testimonials, unimplemented pricing, fake synchronization, and fake password-reset success.
- Every form outcome is visible inline; toast notifications are supplementary only.
- Use semantic light/dark tokens and the existing reduced-motion contract.
- Use red-green-refactor and keep the full automated gate green.

---

### Task 1: Landing decision presentation model

**Files:**
- Create: `lib/presentation/landing-preview.ts`
- Create: `tests/landing-preview.test.ts`

**Interfaces:**
- Consumes: `scenarioLibrary`, `sampleProfile`, and `buildFinancialOverview`.
- Produces: `landingScenarioOptions`, `buildLandingPreview(scenarioId)`, and `LandingPreviewViewModel`.

- [x] **Step 1: Write the failing adapter tests**

```ts
import { describe, expect, it } from "vitest";
import { compareScenario } from "../lib/financial/engine";
import { sampleProfile, scenarioLibrary } from "../lib/financial/sample-data";
import { buildLandingPreview, landingScenarioOptions } from "../lib/presentation/landing-preview";

describe("landing decision preview", () => {
  it("offers only scenarios backed by the existing library", () => {
    expect(landingScenarioOptions.map((option) => option.id)).toEqual([
      "scenario-start-investment",
      "scenario-buy-car",
      "scenario-buy-home"
    ]);
    for (const option of landingScenarioOptions) {
      expect(scenarioLibrary.some((scenario) => scenario.id === option.id)).toBe(true);
    }
  });

  it("derives every preview value from the financial engine", () => {
    const scenario = scenarioLibrary.find((item) => item.id === "scenario-buy-car")!;
    const comparison = compareScenario(sampleProfile, scenario);
    const preview = buildLandingPreview(scenario.id);

    expect(preview.scenario.name).toBe(scenario.name);
    expect(preview.overview.decision.monthlySurplusDelta).toBe(comparison.delta.monthlySurplus);
    expect(preview.healthAfter).toBe(comparison.after.financialHealth.score);
    expect(preview.evidence).toContain(`${Math.abs(comparison.delta.monthlySurplus).toLocaleString("en-US")} SAR`);
    expect(preview.simulationHref).toBe("/simulations?scenario=car");
  });

  it("falls back deterministically to the investment scenario", () => {
    expect(buildLandingPreview("missing").scenario.id).toBe("scenario-start-investment");
  });
});
```

- [x] **Step 2: Run and verify RED**

Run `.\node_modules\.bin\vitest.cmd run tests\landing-preview.test.ts`.

Expected: FAIL because `landing-preview.ts` does not exist.

- [x] **Step 3: Implement the adapter**

Use the three exact scenario ids from the test. Return the selected scenario, `buildFinancialOverview(sampleProfile, scenario)`, current/after health values, an evidence sentence based on the signed surplus delta, a concise assumption string, and `/simulations?scenario=${scenario.type}`. Unknown ids return the investment scenario.

- [x] **Step 4: Run focused and full tests**

Expected: the landing-preview tests and all prior tests pass.

- [x] **Step 5: Commit**

```powershell
git add lib/presentation/landing-preview.ts tests/landing-preview.test.ts
git commit -m "feat: add engine-backed landing preview model"
```

### Task 2: Lightweight interactive landing page

**Files:**
- Create: `components/landing/decision-preview.tsx`
- Modify: `components/landing/landing-page.tsx`
- Modify: `components/layout/app-shell.tsx`
- Modify: `lib/ui/commands.ts`
- Modify: `app/page.tsx`
- Modify: `app/layout.tsx`
- Create: `tests/landing-experience.test.ts`

**Interfaces:**
- `DecisionPreview()` owns only the selected landing scenario id.
- `LandingPage()` is a server component with no browser hooks or chart/motion libraries.
- Root `/` always renders `LandingPage`; sample dashboard remains `/dashboard`.

- [ ] **Step 1: Write failing source-contract tests**

```ts
import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("landing experience", () => {
  const landing = readFileSync("components/landing/landing-page.tsx", "utf8");
  const previewPath = "components/landing/decision-preview.tsx";
  const preview = existsSync(previewPath) ? readFileSync(previewPath, "utf8") : "";
  const home = readFileSync("app/page.tsx", "utf8");

  it("keeps the page server-rendered and the preview focused", () => {
    expect(existsSync(previewPath)).toBe(true);
    if (!existsSync(previewPath)) return;
    expect(landing).not.toContain('"use client"');
    expect(landing).not.toContain("framer-motion");
    expect(landing).not.toContain("recharts");
    expect(preview).toContain('"use client"');
    expect(preview).toContain("buildLandingPreview");
    expect(preview).toContain('role="tablist"');
    expect(preview).toContain("<svg");
    expect(preview).toContain("sr-only");
  });

  it("removes unsupported marketing claims", () => {
    for (const claim of ["Saudi beta customer", "49 SAR/mo", "249 SAR/mo", "Investor-ready demo", "demo PDF"])
      expect(landing).not.toContain(claim);
    expect(landing).toContain('id="how-it-works"');
    expect(landing).toContain('id="nova"');
    expect(landing).toContain('id="trust"');
    expect(landing).toContain('id="faq"');
  });

  it("renders the landing page in server and static modes", () => {
    expect(home).toContain("return <LandingPage />");
    expect(home).not.toContain("NEXT_PUBLIC_GITHUB_PAGES");
    expect(home).not.toContain("DashboardPage");
  });
});
```

- [ ] **Step 2: Run and verify RED**

Expected: FAIL because the preview file does not exist and the current landing violates the contracts.

- [ ] **Step 3: Implement `DecisionPreview`**

Render three tab buttons from `landingScenarioOptions`, the selected preview's sample-data label, health and monthly-impact metrics, NOVA recommendation/evidence/assumption blocks, an accessible text summary, and a six-point inline SVG chart derived from `preview.overview.cashFlow.slice(0, 6)`. Use semantic CSS variables for SVG strokes and link to `preview.simulationHref`.

- [ ] **Step 4: Rebuild the server-rendered landing**

Implement the six design sections in the approved spec. Use only real supported scenario names and capabilities. Replace testimonials and pricing with the NOVA evidence and trust sections. Update `LandingNav` anchors to `#how-it-works`, `#nova`, `#trust`, and `#faq`; update the command palette's old pricing destination to `/#how-it-works`; always return `<LandingPage />` from `app/page.tsx`; and add descriptive title-template, description, keywords, and robots metadata in `app/layout.tsx`.

- [ ] **Step 5: Run tests, lint, typecheck, build, and commit**

Expected: all checks pass, `/` remains static, all 18 routes remain present, and landing first-load JS is materially lower than the current 302 kB.

```powershell
git add components/landing components/layout/app-shell.tsx lib/ui/commands.ts app/page.tsx app/layout.tsx tests/landing-experience.test.ts
git commit -m "feat: rebuild evidence-led landing experience"
```

### Task 3: Authentication presentation contract

**Files:**
- Create: `lib/auth/presentation.ts`
- Create: `tests/auth-presentation.test.ts`

**Interfaces:**
- Produces: `AuthMode`, `authPresentation`, `getAuthDefaults(mode)`, `getAuthDestination(mode)`, and `sampleCredentials`.

- [ ] **Step 1: Write failing contract tests**

```ts
import { describe, expect, it } from "vitest";
import { authPresentation, getAuthDefaults, getAuthDestination, sampleCredentials } from "../lib/auth/presentation";

describe("auth presentation", () => {
  it("starts every mode without exposed credentials", () => {
    expect(getAuthDefaults("login")).toEqual({ name: "", email: "", password: "" });
    expect(getAuthDefaults("signup")).toEqual({ name: "", email: "", password: "" });
    expect(getAuthDefaults("forgot")).toEqual({ name: "", email: "", password: "" });
    expect(sampleCredentials).toEqual({ email: "ahmed@example.com", password: "password123" });
  });

  it("uses mode-specific destinations", () => {
    expect(getAuthDestination("login")).toBe("/dashboard");
    expect(getAuthDestination("signup")).toBe("/onboarding");
    expect(getAuthDestination("forgot")).toBe("/login");
  });

  it("describes recovery as unavailable without a mail provider", () => {
    expect(authPresentation.forgot.unavailableMessage).toContain("not configured");
    expect(authPresentation.forgot.unavailableMessage).not.toContain("sent");
  });
});
```

- [ ] **Step 2: Run and verify RED**

Expected: FAIL because the presentation module does not exist.

- [ ] **Step 3: Implement the pure contract**

Define copy for login, signup, and forgot modes, including title, helper, submit label, pending label, optional unavailable message, and destination. Return new empty defaults on every call. Keep sample credentials in the pure module for the explicit fill action.

- [ ] **Step 4: Run focused and full tests**

Expected: all auth and existing tests pass.

- [ ] **Step 5: Commit**

```powershell
git add lib/auth/presentation.ts tests/auth-presentation.test.ts
git commit -m "feat: define honest authentication states"
```

### Task 4: Accessible authentication experience

**Files:**
- Modify: `components/auth/auth-card.tsx`
- Create: `tests/auth-experience.test.ts`

**Interfaces:**
- Consumes: the Task 3 auth contract, existing register API, NextAuth credentials provider, and router.
- Preserves: sample login, local signup, login/signup/recovery routes, and static-export access.

- [ ] **Step 1: Write failing source-contract tests**

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("authentication experience", () => {
  const source = readFileSync("components/auth/auth-card.tsx", "utf8");

  it("connects accessible form and outcome semantics", () => {
    expect(source).toContain('from "@/lib/auth/presentation"');
    expect(source).toContain("aria-live");
    expect(source).toContain('role="alert"');
    expect(source).toContain('id="email-error"');
    expect(source).toContain('id="password-error"');
    expect(source).toContain('autoComplete="email"');
    expect(source).toContain('autoComplete="current-password"');
  });

  it("preserves sample access without exposing credentials", () => {
    expect(source).toContain("Use sample access");
    expect(source).toContain("sampleCredentials");
    expect(source).not.toContain('password: "password123"');
    expect(source).not.toContain("prepared for demo inbox");
    expect(source).not.toContain("Welcome to the GitHub Pages demo");
  });

  it("uses the mode-specific successful destination", () => {
    expect(source).toContain("getAuthDestination(mode)");
  });
});
```

- [ ] **Step 2: Run and verify RED**

Expected: FAIL against the current toast-only, prefilled form.

- [ ] **Step 3: Implement form state and honest outcomes**

Use empty defaults, `setValue()` for the explicit sample action, inline `status` state with `kind: "info" | "success" | "error"`, field-level validation messages, and mode-specific autocomplete. Forgot submission sets the approved unavailable message and does not redirect or toast success. Static login/signup announces sample mode then routes to the correct destination. Server signup registers, authenticates, then routes to onboarding; server login routes to dashboard. Duplicate or invalid responses remain visible inline.

- [ ] **Step 4: Implement the responsive auth composition**

Use a semantic `<main>` with a wide-screen trust panel showing sample metrics, local-model disclosure, and privacy boundary; render the form in a raised card; retain all cross-route links; and use semantic theme classes only. Mobile renders a compact trust strip before the form.

- [ ] **Step 5: Run full verification and commit**

Run Vitest, ESLint, TypeScript, and production build. Expected: all pass with all routes preserved.

```powershell
git add components/auth/auth-card.tsx tests/auth-experience.test.ts
git commit -m "feat: rebuild accessible authentication journey"
```

### Task 5: Public-journey audit

**Files:**
- Modify: `app/not-found.tsx`
- Modify: `docs/superpowers/plans/2026-07-12-landing-auth-experience.md`

- [ ] **Step 1: Remove remaining public demo framing**

Change the not-found copy to “The page you requested does not exist or has moved,” keep the dashboard return action, and verify `rg -n "demo|Demo|beta customer|SAR/mo|prepared for demo|queued for demo" components/landing components/auth app/page.tsx app/layout.tsx app/not-found.tsx` returns no misleading public-journey claims.

```tsx
<p className="text-sm text-muted-foreground">
  The page you requested does not exist or has moved.
</p>
```

- [ ] **Step 2: Run the complete automated gate**

Run Vitest, ESLint, TypeScript, and Next build. Record test count, route count, and landing first-load JS.

- [ ] **Step 3: Verify scope and preservation**

Confirm domain-engine diffs are empty, route files still exist, static export still has `/dashboard` sample access, and Git status contains only this slice before the final commit.

- [ ] **Step 4: Update checkboxes and commit evidence**

```powershell
git add app/not-found.tsx docs/superpowers/plans/2026-07-12-landing-auth-experience.md
git commit -m "docs: record public journey verification"
```

Browser-based desktop/mobile, theme, keyboard, reduced-motion, and Lighthouse verification remains mandatory in the final product audit when the in-app browser surface is available.
