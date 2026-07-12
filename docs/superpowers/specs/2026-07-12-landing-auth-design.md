# Landing and Authentication Experience Design

## Outcome

The public journey should make one promise clearly: Financial Twin helps a person test a consequential money decision before committing to it. The landing page proves that promise with the repository's real financial model, explains how NOVA reaches a recommendation, and moves the user into a transparent sample session or account flow. Authentication should feel like the same premium product, not a generic form floating on a dark background.

## Current evidence

The existing landing page is visually substantial but relies on hard-coded chart data, fabricated customer quotes, unimplemented paid plans, repeated “demo” framing, dark-only colors, and a large client bundle containing Framer Motion and Recharts. Static GitHub Pages mode bypasses the landing page and opens directly into the dashboard, which conflicts with the required first impression. The auth forms prefill a password, report validation and server failures only through toasts, redirect every successful mode to the dashboard, and claim that a password-reset link was prepared when no email provider exists.

The financial engine, sample profile, scenario library, semantic themes, reduced-motion foundation, navigation shell, and accessible presentation components already provide the trustworthy foundation this slice needs.

## Considered approaches

### Visual reskin

Keep the current sections and replace dark-only classes. This is low risk but leaves misleading pricing, invented testimonials, hard-coded metrics, and fake reset behavior intact. It does not meet the product-trust or performance goals.

### Cinematic client showcase

Add richer Framer Motion sequences, scroll choreography, and multiple Recharts visualizations. This could create a dramatic first impression, but it increases hydration, bundle cost, and reduced-motion complexity while doing little to prove that the financial intelligence is real.

### Evidence-led product story

Use a mostly server-rendered landing page with one small interactive decision-preview island powered by the actual financial engine. Replace sales theatre with model transparency, privacy boundaries, scenario evidence, and clear sample/account paths. This is the selected approach because it makes the product more memorable by being credible, faster, and specific.

## Landing architecture

`LandingPage` becomes a server component. It renders navigation, editorial sections, the trust model, FAQ, and calls to action without hydration. A focused `DecisionPreview` client component owns only scenario selection and the animated current-versus-after visualization. It derives every displayed amount, health delta, cash-flow change, and summary from `buildFinancialOverview()` and the existing scenario library.

The preview uses lightweight semantic HTML and inline SVG rather than Recharts or Framer Motion. It exposes a text summary independent of the chart, keyboard-operable scenario tabs, a selected state, and a direct link to the matching simulation. CSS transitions provide restrained atmosphere and are already neutralized by the global reduced-motion contract.

## Story structure

1. **Hero — decide with foresight.** A precise headline, short explanation, “Create your twin” primary action, and “Explore sample twin” secondary action. The preview beside it shows a real sample decision and clearly labels sample data.
2. **How it works — model, simulate, understand.** Three steps explain the twin inputs, deterministic scenario comparison, and NOVA explanation layer.
3. **NOVA with evidence.** A recommendation card separates recommendation, evidence, assumptions, and educational-use boundary. It never implies bank synchronization or certainty.
4. **Decision coverage.** Real scenario types already supported by the engine are grouped by life, resilience, and wealth decisions.
5. **Trust and privacy.** Explain sample mode, local SQLite server mode, OpenAI fallback behavior, and the fact that Financial Twin is not a bank or regulated adviser.
6. **FAQ and final action.** Answer product, AI, privacy, and export questions with only behavior the repository actually supports.

Fake customer testimonials and unimplemented subscription plans are removed. Navigation anchors become How it works, NOVA, Trust, and FAQ. The static export root renders the landing page; sample access remains available at `/dashboard` and through authentication.

## Authentication architecture

The three routes retain their existing paths and one shared `AuthCard` export. A pure auth-presentation module owns mode-specific title, helper copy, submit labels, successful destination, and static-mode disclosure so behavior is testable without a DOM.

Login, signup, and recovery fields start empty. Login includes an explicit “Use sample access” action that fills the documented sample credentials, preserving that workflow without exposing a password by default. Signup redirects to onboarding after account creation and sign-in. Login redirects to the dashboard.

Every field has a stable label, autocomplete value, inline validation message, and `aria-describedby` relationship. Submission exposes a visible `aria-live` status for pending, success, and error states. Toasts may reinforce a completed action but never serve as the sole outcome.

Password recovery behaves honestly. Because the repository has no mail provider, submitting the form shows an inline unavailable state explaining that recovery email is not configured for this deployment and offers return-to-login/sample-access routes. It does not claim an email was sent. This external-service limitation remains a final production integration requirement, not a hidden fake success.

## Visual direction

The landing page uses the existing “precision with warmth” tokens: a clean editorial canvas, cobalt intelligence, mint positive movement, saffron caution, and mineral surfaces. Typography carries the drama through scale and whitespace. A thin decision-path line, layered sample cards, and restrained orb glow establish depth without glass on every surface.

Auth uses a two-column composition on wide screens: a concise trust narrative and live sample metrics on one side, the form on the other. Mobile collapses to the form with a compact trust strip. Both themes use semantic tokens exclusively.

## Error and state model

- Landing preview always has a deterministic initial scenario and never waits on a network request.
- Scenario controls expose selected, focus, and hover states without relying on color alone.
- Auth distinguishes client validation, duplicate account, invalid credentials, network failure, static sample mode, and unconfigured password recovery.
- Pending submission disables only the submit control and exposes a textual status.
- Success routes are mode-specific and are announced before navigation.

## SEO and performance

Root metadata uses a descriptive title, title template, product-specific description, canonical intent, and financial-planning keywords without unsupported claims. The landing page contains one `h1`, sequential section headings, semantic landmarks, and descriptive link text.

Removing Recharts and Framer Motion from the landing route should materially reduce its client payload. The decision preview hydrates only its controls. No image dependency is added, and ambient effects remain CSS-only.

## Verification

- Pure tests prove the decision preview uses the same view model as the dashboard and that auth destinations/copy are mode-correct.
- Source-contract tests cover semantic landing sections, removal of fabricated/demo claims, absence of Recharts/Framer imports, auth label/error/live-region semantics, and static-root landing behavior.
- Existing engine, navigation, UI-foundation, and presentation tests remain green.
- ESLint, TypeScript, and the production build must pass with all 18 existing routes preserved.
- Browser QA later covers desktop/mobile layout, keyboard navigation, both themes, reduced motion, form errors, sample access, and Lighthouse 90+ gates.

## Explicit scope boundary

This slice does not add a billing system, customer testimonials, bank connections, or an email provider. It accurately presents the capabilities already implemented and exposes unavailable external integrations honestly. Onboarding, NOVA API response states, remaining authenticated routes, and final browser/Lighthouse validation continue in subsequent slices.
