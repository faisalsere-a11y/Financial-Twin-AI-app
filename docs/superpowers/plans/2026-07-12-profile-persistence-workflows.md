# Profile Persistence and Model-Editing Workflows

**Goal:** Make onboarding and settings honest, durable model-editing workflows, then let every authenticated client route consume the same active financial profile without changing calculation engines.

**Architecture:** A pure onboarding adapter converts form values to and from the authoritative `FinancialProfile` type. A versioned browser store validates saved profiles and preferences, falls back safely to `sampleProfile`, and emits a same-tab update event. A small client hook exposes the active profile, persistence source, saved time, and save/reset actions. Server APIs remain available, but the browser profile is the explicit source of truth for this dependency-free deployment and static export.

**Constraints:** Keep `lib/financial/engine.ts` and `lib/financial/investments.ts` unchanged. Preserve every route, SAR defaults, static export, authentication, CSV export, and existing scenario behavior. Never claim server or bank synchronization. Use inline accessible outcomes instead of success-only toasts.

## Task 1: Pure profile form adapter

**Files:**
- Create: `lib/profile/onboarding.ts`
- Create: `tests/profile-onboarding.test.ts`

- [x] Write failing tests for defaults, round-trip mapping, and engine-compatible output.
- [x] Derive defaults from `sampleProfile` rather than duplicating values.
- [x] Map the editable income, expense, debt, asset, goal, dependent, and risk fields into a complete `FinancialProfile` while preserving non-editable base values.
- [x] Verify the sample round trip preserves monthly income, expenses, debt payments, net worth, and financial health.
- [x] Run focused and full tests; commit.

## Task 2: Versioned profile and preference store

**Files:**
- Create: `lib/profile/browser-store.ts`
- Create: `tests/profile-browser-store.test.ts`

- [x] Write failing tests for versioned save/read, malformed data fallback, reset, and preference defaults.
- [x] Validate stored profile and preference envelopes with Zod.
- [x] Keep the storage interface injectable so tests do not require a browser.
- [x] Emit no network or synchronization claims; persist only inside the active browser storage boundary.
- [x] Run focused and full tests; commit.

## Task 3: Active-profile hook and onboarding experience

**Files:**
- Create: `lib/profile/use-financial-profile.ts`
- Modify: `components/onboarding/onboarding-wizard.tsx`
- Create: `tests/onboarding-experience.test.ts`

- [x] Write a failing source contract for labels, descriptions, field errors, status announcements, storage disclosure, and dashboard transition.
- [x] Hydrate the form from the active profile and use the financial engine for the live summary.
- [x] Add responsive step navigation, completion state, wide-screen summary, and explicit review/save actions.
- [x] Save the converted profile, announce success inline, and route to `/dashboard`; expose failures inline.
- [x] Run tests, lint, TypeScript, and build; commit.

## Task 4: Durable settings and truthful controls

**Files:**
- Modify: `components/settings/settings-page.tsx`
- Create: `tests/settings-experience.test.ts`

- [ ] Write a failing contract for stable switch state, labels, mode disclosure, save/reset outcomes, and removal of demo-security framing.
- [ ] Persist language, notifications, export re-authentication, and regional mode through the versioned store.
- [ ] Persist profile name and currency through the active profile hook; keep account email read-only unless a server account boundary exists.
- [ ] Retain `next-themes` persistence and expose system/light/dark explicitly.
- [ ] Run tests, lint, TypeScript, and build; commit.

## Task 5: One active profile across authenticated routes

**Files:**
- Modify: `components/layout/app-shell.tsx`
- Modify: `components/dashboard/dashboard-client.tsx`
- Modify: `components/simulations/simulation-center.tsx`
- Modify: `components/goals/goals-page.tsx`
- Modify: `components/reports/reports-page.tsx`
- Create: `tests/active-profile-integration.test.ts`

- [ ] Write a failing source contract proving each client route consumes `useFinancialProfile`.
- [ ] Replace hard-coded profile identity, completeness, and sample-only framing with active-profile state and truthful source labels.
- [ ] Recalculate dashboard, simulation, goal, and report results from the active profile; include the active profile in server simulation requests or use the existing client engine fallback.
- [ ] Preserve loading, export, and static-mode behavior.
- [ ] Run full verification and confirm domain-engine diffs remain empty; commit.

## Task 6: Profile-workflow verification

- [ ] Run Vitest, ESLint, `tsc --noEmit`, server-capable Next build, and GitHub Pages export.
- [ ] Verify malformed browser data falls back safely and reset restores the sample profile.
- [ ] Record route and bundle evidence, then continue to NOVA, decisions, investments, goals, and reports refinement.
