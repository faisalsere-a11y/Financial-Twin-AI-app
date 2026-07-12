# Portfolio, Goals, and Reports Workflows

**Goal:** Finish the remaining action routes with active-profile data, accessible inputs and charts, honest states, and only working actions.

**Architecture:** Each route continues to call the existing pure financial engines directly. Route-local presentation state owns portfolio inputs, selected report period, and transient export status. Shared `ChartFrame`, semantic chart tokens, active profile storage, and existing export utilities remain the only supporting infrastructure.

**Constraints:** Keep financial engines and CSV semantics unchanged; preserve every asset preset, deterministic Monte Carlo behavior, goal forecast, CSV download, print/PDF flow, and static export.

## Task 1: Portfolio simulator

- [x] Add a failing source contract for active-profile defaults, labeled constrained inputs, inline errors, risk explanation, percentile definitions, semantic charts, and accessible summaries.
- [x] Rebuild the portfolio console with validated inputs and engine-backed live results.
- [x] Explain volatility and deterministic seeded Monte Carlo output without implying guaranteed returns.
- [x] Run tests, lint, TypeScript, and production build; commit.

## Task 2: Goal portfolio

- [x] Add a failing source contract for active goals, forecast status, next contribution, risk signal, honest empty state, and real model-edit link.
- [x] Remove fake Wedding/Education slots and invented calendar events.
- [x] Render only active-profile goals with currency-correct progress and forecast evidence.
- [x] Run tests, lint, TypeScript, and build; commit.

## Task 3: Report workspace

- [x] Add a failing source contract for real report selection, active-profile CSV, print/PDF, inline export status, semantic chart, and accessible summary/table.
- [x] Make monthly, quarterly, and annual selections change the visible report state.
- [x] Keep client-generated CSV aligned with the active profile and make printing the actual PDF path.
- [x] Add print-safe layout rules and remove toast-only or non-selecting controls.
- [x] Run complete server/static verification, confirm domain-engine diffs are empty, and commit evidence.

Verification evidence captured on 2026-07-12:

- Vitest passed 64/64 tests across 22 files; repository ESLint and `tsc --noEmit` completed without findings.
- The server-capable build generated 18/18 pages; the report route is 253 kB first load, down from 260 kB before the rebuild.
- The GitHub Pages build generated 14/14 pages and exported the static artifact with `app/api` restored afterward.
- `lib/financial/engine.ts`, `lib/financial/investments.ts`, and `lib/reports/export.ts` remain unchanged from the branch merge base with `main`.
