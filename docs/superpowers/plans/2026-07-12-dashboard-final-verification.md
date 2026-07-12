# Dashboard Integrity and Final Verification

**Goal:** Finish the authenticated home surface with truthful active-profile evidence, structured NOVA guidance, accessible interactions, and a final route-by-route quality gate.

**Architecture:** Keep the dashboard as a client-side presentation of the existing financial engines. Reuse the financial overview and NOVA decision view models, semantic chart primitives, active profile store, and scenario deep links. Do not add activity persistence or invent historical events.

## Task 1: Trustworthy decision cockpit

- [x] Add a failing source contract for active-profile identity, accessible scenario selection, deterministic NOVA provenance, engine-backed decision evidence, honest history state, and semantic charts.
- [x] Remove fabricated activity, fixed projection percentages, toast-only reset, and sample-only identity copy.
- [x] Replace them with current-versus-after engine outputs, structured NOVA evidence, working route links, and inline status.
- [x] Run tests, lint, TypeScript, server build, and commit.

Dashboard verification evidence captured on 2026-07-12:

- Vitest passed 67/67 tests across 23 files; repository ESLint and `tsc --noEmit` completed without findings.
- The server build generated 18/18 pages and reduced dashboard first-load JavaScript from 311 kB to 304 kB.
- Dashboard scenarios are real buttons with pressed state and inline announcement; all evidence comes from `compareScenario`, `forecastGoalCompletion`, or `buildNovaDecisionView`.

## Task 2: Final repository and route verification

- [ ] Re-audit routes, actions, placeholders/TODOs, hard-coded dark chart colors, and protected domain-engine diffs.
- [ ] Run the complete test, lint, type, server-build, and static-export gates.
- [ ] Exercise all routes at desktop and mobile widths, including keyboard, light/dark, reduced motion, loading/empty/error/success states, and working actions.
- [ ] Run locally available accessibility and Lighthouse checks for landing and dashboard; record any environment-limited checks explicitly.
- [ ] Commit final evidence and leave the feature branch clean.
