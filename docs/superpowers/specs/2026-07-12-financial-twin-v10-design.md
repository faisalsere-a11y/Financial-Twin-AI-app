# Financial Twin AI Version 10 Product Design

## Product intent

Financial Twin AI becomes a calm, premium decision environment rather than a conventional dashboard. The product helps a Saudi-focused user understand their financial position, test a consequential choice, see why the model changed, and decide on a safe next action. The experience must feel intelligent without pretending that generated guidance is certainty or regulated advice.

The repository's financial engines, scenario types, routes, API contracts, authentication behavior, exports, and Saudi/SAR sample profile remain authoritative. This work changes presentation, interaction, accessibility, and UI architecture without weakening those behaviors.

## Current-state inventory

The app has ten user-facing routes: landing, login, signup, forgot password, onboarding, dashboard, simulations, investments, goals, reports, and settings. It also exposes authentication, profile, simulation, and report-export APIs. The core financial engine calculates cash flow, net worth, debt ratio, savings rate, emergency runway, risk, health, timelines, goals, scenario comparisons, investment projections, and deterministic Monte Carlo ranges.

The latest checkout already contains a dark visual overhaul, a NOVA identity, route navigation, a command palette, simulation forms, charts, toasts, theme controls, and four passing engine tests. The production build and lint both pass. However, the design is not yet a complete product system:

- light mode is nominal but many surfaces, borders, chart labels, tooltips, and shell colors are hard-coded for dark mode;
- reduced motion is not implemented even though Framer Motion and animated visual treatments are used;
- route behavior is largely untested outside the financial engines;
- several controls lack explicit label relationships or full dialog semantics;
- command-palette launch controls do not open the palette by click;
- notifications, report-library buttons, onboarding save, settings save, password reset, and PDF export are presented as working actions but end as demo toasts;
- AI outputs lack confidence, provenance, assumption, and fallback-state explanation;
- the dashboard and landing page repeat financial visualization patterns rather than sharing purposeful primitives;
- large page components mix calculations, chart configuration, copy, interaction state, and layout;
- the copy repeatedly describes the product as a demo, which weakens trust and launch readiness;
- browser, mobile, keyboard, screen-reader, and Lighthouse verification evidence is still missing.

## Chosen approach

Use a progressive product-system refactor. Preserve the financial domain and server boundaries, then introduce reusable experience primitives and migrate routes in coherent vertical slices.

Two alternatives were rejected. A surface-only reskin would be quick but would preserve misleading actions, theme defects, weak AI trust cues, and inaccessible interaction patterns. A from-scratch rewrite would provide maximum visual freedom but creates avoidable regression risk across auth, simulation, export, and financial calculations.

## Experience architecture

### 1. Product shell

The authenticated app uses a responsive navigation rail on wide screens and a focus-managed modal drawer on mobile. A compact top bar contains contextual page state, command search, notifications, theme, and the user menu. The command palette is a true modal combobox with click and keyboard launch, focus return, arrow-key selection, Escape dismissal, and a no-results state.

Navigation language is concise: Overview, Twin, Decisions, Portfolio, Goals, Reports, Settings. Existing route paths remain unchanged. Every route exposes one dominant task and one contextual secondary action.

### 2. Design system

Create semantic tokens for canvas, elevated surfaces, borders, text tiers, brand, positive, caution, danger, data-series colors, shadows, and focus rings. Both light and dark themes use the same token names. No route component may use raw white-opacity borders, dark hex backgrounds, or dark-only tooltip colors.

The visual language is "precision with warmth": deep ink and mineral surfaces in dark mode, warm cloud surfaces in light mode, cobalt for intelligence, mint for positive movement, saffron for caution, and coral for risk. Typography uses strong editorial hierarchy and tabular numerals for financial values. Effects remain restrained: ambient glows establish depth; glass is reserved for navigation and AI surfaces; data cards remain crisp and readable.

Reusable primitives include page headers, metric cards, delta badges, confidence badges, chart frames, chart tooltips, empty states, error states, skeletons, section cards, segmented controls, mobile drawers, and accessible modal/dialog structure.

### 3. Landing and onboarding

The landing page tells a three-act story:

1. Understand: a cinematic hero introduces the financial twin and shows a live before/after decision preview.
2. Explore: interactive decision cards explain how income, debt, liquidity, risk, and goals respond.
3. Trust: transparent methodology, privacy boundaries, responsible-AI language, customer proof, and a focused call to action establish credibility.

The landing page remains performant by using CSS atmosphere and lightweight chart motion rather than image-heavy media. All motion respects reduced-motion preferences.

Onboarding becomes a guided financial model builder. Each step explains why the information matters, shows completion and validation clearly, and provides a persistent summary on wide screens. Submitting saves through the existing profile boundary where available; static export mode stores a versioned profile locally and discloses that behavior. Success transitions to the dashboard with an explicit review step rather than a toast-only dead end.

### 4. NOVA AI experience

NOVA appears as a contextual advisor layer, not decorative branding. Each AI response contains:

- a direct recommendation;
- the financial evidence that drove it;
- a confidence level derived from input completeness and deterministic model stability;
- assumptions and known limitations;
- suggested follow-up actions that lead to real routes or scenario variants;
- a clear deterministic-fallback label when no OpenAI key is configured.

Simulation responses expose loading, streaming-like progressive reveal, fallback, retry, and error states. They never imply live bank synchronization when the sample profile is in use. Advice copy includes a concise educational-use boundary without overwhelming the task.

### 5. Route-level design

- **Overview (`/dashboard`)**: lead with net worth, cash-flow resilience, goal momentum, and a daily NOVA brief. Scenarios are secondary and link into Decisions. Charts share semantic series colors and accessible summaries.
- **Twin (`/onboarding`)**: treat the existing wizard as an editable model profile with completeness, freshness, and source indicators.
- **Decisions (`/simulations`)**: use a scenario library plus a focused builder, side-by-side current/after results, confidence and assumptions, and shareable/saveable results where persistence exists.
- **Portfolio (`/investments`)**: keep projections and deterministic Monte Carlo logic, add plain-language risk explanations, legends, input constraints, and accessible chart summaries.
- **Goals (`/goals`)**: remove non-interactive fake goal cards. Existing goals show status, forecast, next contribution, and risk; creating a goal must either be a complete flow or a clearly labeled route into Twin editing.
- **Reports (`/reports`)**: keep CSV export, replace fake PDF success with an actual printable report action, and make report-library entries produce a real selected report state.
- **Settings (`/settings`)**: persist theme and demo preferences locally, label every field, give switches stable state, and separate production-readiness disclosure from user settings.
- **Auth**: preserve seeded and local authentication, remove prefilled passwords on signup, expose form errors inline, provide accessible busy states, and make static-demo behavior explicit before submission.

## Data and state flow

Financial domain functions remain pure and are not coupled to React. Route adapters translate domain results into view models with formatted values, deltas, chart series, confidence, and accessible summaries. Components consume view models and emit user intent; they do not duplicate financial calculations.

Server mode uses the existing API routes. Static GitHub Pages mode uses the same domain engine client-side and a small versioned local persistence adapter for profile and preferences. The active mode is disclosed in the UI. TanStack Query owns server request status; local UI state owns transient selection and dialogs; theme and preferences use `next-themes` and the persistence adapter.

## Error handling and honesty

Every asynchronous flow has initial, loading, success, empty, retryable error, and terminal error states. Errors state what happened, whether data was saved, and what the user can do next. Toasts supplement visible state but never serve as the sole proof that a consequential action completed.

Actions must be real or clearly framed as preview/read-only. No control may claim a file, password reset, notification change, save, or synchronization occurred when the implementation only shows a toast.

## Accessibility and motion

The target is WCAG 2.2 AA. Requirements include semantic landmarks and headings, explicit form labels and descriptions, 44px touch targets for primary controls, visible focus, focus trapping and return for dialogs/drawers, keyboard-operable charts and selections where interactive, non-color status cues, live regions for async results, and text alternatives for financial visuals.

Motion uses opacity and transform only, remains under 400ms for interface transitions, and is disabled or simplified under `prefers-reduced-motion`. Continuous ambient effects pause for reduced motion. Data remains present without animation.

## Performance

Keep the existing dependency set unless a missing capability cannot be implemented accessibly in-house. Lazy-load route-heavy chart and motion code where it materially reduces initial payload. Avoid layout shifts by reserving chart and skeleton dimensions. Landing and authenticated dashboard target Lighthouse scores of at least 90 in performance, accessibility, best practices, and SEO where locally measurable.

## Verification strategy

Use test-driven delivery for new behavior. Add tests for view-model derivation, confidence calculation, persistence adapters, mode disclosure, and any refactored domain integration. Add component-level interaction coverage for theme, command palette, onboarding validation/submission, simulation states, report selection/export, settings persistence, and accessibility semantics.

The full gate is:

1. all existing and new Vitest tests pass;
2. ESLint and TypeScript pass without warnings;
3. the production build succeeds;
4. every inventoried route passes desktop and mobile smoke checks;
5. keyboard-only navigation, focus return, reduced motion, and automated accessibility checks pass on primary flows;
6. Lighthouse meets the four 90+ targets on landing and dashboard where the local browser environment permits measurement;
7. a final search finds no placeholder actions, TODOs, misleading demo-success copy, or raw dark-only surface colors in migrated components.

## Delivery decomposition

The work ships as independently testable milestones:

1. design tokens, themes, motion, accessibility, and shell;
2. shared financial view models and visualization primitives;
3. landing and auth;
4. onboarding and persistence;
5. dashboard and NOVA brief;
6. simulations and trustworthy AI response states;
7. investments and goals;
8. reports and settings;
9. route-wide responsive, accessibility, performance, and copy polish;
10. complete regression and launch-readiness audit.

Required credentials or unavailable external services may block live OpenAI and email-provider validation, but deterministic fallback and honest local behavior remain fully testable.
