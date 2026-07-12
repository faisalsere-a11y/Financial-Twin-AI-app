# Decision Lab and NOVA Workflow

**Goal:** Turn `/simulations` into a trustworthy decision lab that honors landing deep links, supports the existing scenario library and custom car inputs, and separates NOVA recommendation, evidence, confidence, assumptions, provenance, actions, and limitations.

**Architecture:** A pure presentation adapter converts `ScenarioComparison` plus optional advisor notes and provenance into a stable NOVA view model. The simulation API accepts both legacy scenario-only requests and `{ scenario, profile }`, returning explicit advisor provenance. The client owns selected scenarios and form state through TanStack Query, using the deterministic adapter in static mode and the API in server mode.

**Constraints:** Keep both financial engines unchanged, preserve every scenario type and custom car calculation, keep static export, and do not imply probability, bank sync, persistence, or OpenAI use when unavailable.

## Task 1: NOVA decision view model

- [x] Add failing tests for recommendation, exact evidence, confidence rubric, assumptions, provenance, and educational boundary.
- [x] Implement `lib/presentation/nova-decision.ts` as a pure adapter.
- [x] Verify adverse and resilient scenarios produce materially different recommendations.
- [x] Run focused and full tests; commit.

## Task 2: Advisor provenance contract

- [x] Add failing tests for deterministic and OpenAI response shapes.
- [x] Return `{ recommendations, source }` from a new advisor response function while preserving the existing recommendations function.
- [x] Include `advisorSource` in the simulation API response and static fallback.
- [x] Run tests, lint, and TypeScript; commit.

## Task 3: Accessible decision lab

- [x] Add a failing source contract for scenario deep links, scenario library selection, labeled fields/errors, loading/error/retry states, structured NOVA sections, and accessible chart summary.
- [x] Rebuild the screen with library and custom-builder modes, initializing from `?scenario=` in the browser.
- [x] Use the active profile and NOVA adapter in both server and static modes.
- [x] Remove fake favorite behavior and toast-only outcomes; provide inline status and retry.
- [x] Use semantic chart tokens and a text/table equivalent for current versus after results.
- [x] Run full server and static production verification; commit evidence.

Verification evidence captured on 2026-07-12:

- Vitest passed 55/55 tests across 19 files; ESLint and `tsc --noEmit` completed without findings.
- The server build generated 18/18 pages with `/simulations` at 272 kB first-load JavaScript, down from 277 kB before the rebuild.
- The GitHub Pages build generated 14/14 pages and exported the structured deterministic fallback, custom builder, scenario library, active-profile calculation path, and inline outcome states.
- Landing remains 124 kB first-load JavaScript and authenticated route coverage is unchanged.
- Both financial engines remain unchanged from the branch merge base with `main`.
