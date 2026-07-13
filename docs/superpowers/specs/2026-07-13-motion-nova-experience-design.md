# Financial Twin Motion and Nova Experience Design

## Objective

Upgrade Financial Twin into a cohesive, premium motion-led fintech experience while preserving its existing financial engines, account isolation, responsive design, light/dark themes, static sample build, and authenticated server build. Motion must clarify hierarchy and state changes, never delay access to financial evidence, and always provide a reduced-motion equivalent.

## Scope and delivery order

The work is divided into three independently testable phases that share one visual language:

1. Build the reusable motion, interaction, selection, loading, and responsive layout foundations.
2. Apply the system to the landing page, shell, dashboard, portfolio, and goals experience, including the identified clipping repairs.
3. Add the modular deterministic Nova chat assistant and integrate it with the active financial profile.

Existing routes, calculations, authentication behavior, exports, account-scoped browser storage, and static deployment behavior remain in scope and must not regress.

## Motion architecture

### Shared primitives

Create focused client components rather than converting entire pages to client rendering:

- `MotionProvider` configures Framer Motion with `reducedMotion="user"` and shared transition defaults.
- `PageTransition` provides a short opacity and vertical-position entrance when route templates mount. It never animates layout dimensions or blocks navigation.
- `Reveal` animates content once as it enters the viewport and exposes a no-motion render path.
- `Stagger` and `StaggerItem` coordinate small groups of cards or rows without creating long cascades.
- `AnimatedNumber` interpolates display-only values while retaining the final semantic value for assistive technology.
- `MotionCard` adds opt-in hover lift, border glow, and shadow depth. Static information cards do not move unless marked interactive.
- `MotionPresence` handles dialogs, drawers, chat messages, and expandable goal details with consistent timings.

Motion tokens use restrained durations: 120–180 ms for direct controls, 220–320 ms for panels and route entrances, and no more than 500 ms for decorative hero sequences. Primary movement uses opacity and `transform`; height animation is limited to small disclosure regions. All continuous effects pause when offscreen and disappear under reduced motion.

### CSS layer

Extend the existing design tokens with named easing, duration, shadow, glow, shimmer, and surface variables. CSS handles button press states, focus rings, card hover transitions, skeleton shimmer, animated gradients, and decorative ambient movement. Animations must not change document flow, introduce horizontal scrolling, or depend on pointer hover for essential information.

## Global interactions

### Buttons and cards

Buttons receive a small hover lift, pressed scale, and light sweep/glow appropriate to their variant. Keyboard focus remains visually stronger than hover. Destructive actions do not use celebratory glow. Interactive cards lift by at most 3 px and scale by at most 1.015; dense metric cards use shadow and border changes without scale to avoid clipping.

### Page transitions and loading

Authenticated routes use a route template with `PageTransition`. Landing sections use viewport reveals while preserving server rendering. Existing loading routes are upgraded to layout-matched skeletons with a subtle shimmer. Loading placeholders reserve final component dimensions to prevent cumulative layout shift.

### Charts, statistics, and tables

Recharts animations use short, consistent durations and disable under reduced motion. SVG paths draw once; values update smoothly when scenario inputs change. `AnimatedNumber` is used for prominent balances and percentages, not every table cell. Table rows may stagger on initial display but sorting or filtering uses quick opacity/position transitions without reordering confusion.

### Feedback

Toasts enter from the nearest logical edge and preserve Sonner accessibility behavior. Success feedback includes a small checkmark draw; errors use one short horizontal nudge rather than repeated shaking. Inline statuses remain the authoritative confirmation for financial mutations.

## Premium application shell

The desktop sidebar supports expanded and compact states. The compact choice is stored per browser, not per financial profile, because it is a device presentation preference. The shell width and content offset animate together using transforms and width tokens, with no overlap or layout flash.

The active navigation item uses a moving pill/rail indicator. Icons gain a restrained scale and glow on hover. Text fades when collapsing, tooltips or accessible names preserve navigation clarity, and the Nova logo receives slow ambient lighting rather than continuous rotation. Mobile navigation uses an animated backdrop and spring-controlled drawer while retaining the current focus trap, Escape behavior, focus restoration, inert background, and keyboard navigation.

No speculative submenu is added because the current information architecture has no nested route groups. The shell architecture will support nested groups later without displaying empty or invented sections now.

## Dropdown and selection controls

Replace the native visual wrapper with a reusable accessible listbox/select component that matches existing component APIs. It provides:

- Rounded glass surface, theme-aware shadow, and subtle backdrop blur.
- Fade/scale entrance anchored to the trigger.
- Arrow-key navigation, Home/End, Enter/Space selection, Escape close, outside-click close, and focus restoration.
- Visible focus and selected indicators.
- Collision-aware width and a maximum height with scroll containment.
- Native `<select>` fallback under reduced scripting or static pre-hydration where needed.

The component will not add a new package. Its tests cover keyboard behavior, accessible roles/names, selection callbacks, and graceful close behavior.

## Layout repairs

### Dashboard obligations metric

The clipping originates from rigid metric text inside a four-column identity grid combined with card-level overflow clipping. The repair will add `min-width: 0` at grid boundaries, responsive value typography, safe wrapping for the `/mo` suffix, consistent internal padding, and equal-height metric cells. Tests and browser checks will cover intermediate widths where the desktop grid has limited space.

### Portfolio summary and charts

The four-column summary becomes an auto-fitting responsive grid with a safe minimum width. Metric cards gain `min-width: 0`, overflow-safe numeric text, and equal-height content. Chart wrappers use `min-width: 0`, explicit aspect/height constraints, and contained Recharts surfaces. The sidebar/content grid changes breakpoint before either column becomes narrower than its supported content.

## Landing page experience

The landing page remains server-rendered with isolated motion clients.

### Hero

The hero combines staged copy, an animated gradient field, a pointer-responsive light layer on precise-pointer devices, and an enhanced financial decision preview. The preview uses animated chart paths, floating evidence chips, and very small parallax offsets. Pointer effects are disabled on touch, low-power assumptions, and reduced motion. Calls to action use glow and pressed feedback but remain stable targets.

### Scroll narrative

Trust metrics, workflow cards, Nova evidence rows, decision groups, FAQ items, and the final call-to-action reveal in short grouped sequences. Background color and lighting shift between sections through gradients rather than full-screen filters. No scroll-jacking, forced pinning, or long sticky animation is introduced.

### Social proof

The current product has no verified customer logos, testimonial identities, or usage statistics. The upgrade will not fabricate them. Social proof is represented through verifiable product capabilities, deterministic-engine evidence, privacy boundaries, and supported decision categories. Animated numeric proof is limited to real model outputs in the interactive preview.

## Dynamic goals experience

The goals page becomes an interactive portfolio without hiding the underlying engine evidence.

- Summary metrics use animated numbers.
- Each goal receives an accessible animated progress ring and milestone rail.
- Cards expand to show target date, engine forecast, contribution schedule, risk signal, and Nova insight.
- Users can directly edit name, target amount, current amount, monthly contribution, target date, and priority in a focused dialog/drawer.
- Saving validates with Zod, updates the account-scoped active profile, announces success inline, and refreshes engine forecasts.
- Reordering uses explicit Move earlier/Move later controls that work with keyboard and touch. Visual drag handles may be decorative but drag is not the only interaction.
- A completion celebration appears only when a user action moves a goal from below 100% to funded. It uses a short CSS particle burst, never fires on initial page load, and is removed under reduced motion.
- Empty state, loading state, save error, invalid input, and successful update states are explicit.

## Deterministic Nova chat

### Experience

Nova appears as a fixed bottom-right launcher that coexists with the command button by using a shared floating-action rail. The launcher uses a soft idle pulse that stops after interaction and under reduced motion. Opening the chat creates a responsive panel on desktop and a near-full-screen sheet on mobile. It traps focus, closes with Escape, restores focus, and makes background content inert.

The conversation includes timestamps, suggested prompts, auto-scroll, typing state, staged message appearance, safe controlled markdown rendering, formatted code blocks, evidence chips, and follow-up suggestions. Messages are scoped to the active account and profile revision; switching accounts or changing the financial profile starts a fresh context.

### Response engine

Create a pure deterministic response module with the following input and output contract:

```ts
type NovaChatRequest = {
  message: string;
  profile: FinancialProfile;
  twin: FinancialTwinResult;
};

type NovaChatResponse = {
  id: string;
  intent: "spending" | "investments" | "goals" | "health" | "debt" | "general";
  title: string;
  markdown: string;
  evidence: Array<{ label: string; value: string; detail?: string }>;
  followUps: string[];
  boundary: string;
};
```

Intent classification uses explicit normalized keyword groups and deterministic priority rules. Responses use multiple approved phrase templates selected from a stable hash of the message so wording varies without randomness or pretending to use an external model. Every numerical claim is derived from the existing financial engines or profile fields. Unsupported questions receive a graceful financial-scope response instead of invented data.

### Markdown and extensibility

Because Nova controls its own generated response content, a small renderer supports paragraphs, emphasis, bullets, inline code, and fenced code blocks without adding a dependency. User messages are always rendered as text. The chat data model reserves typed attachment and embedded-chart fields for future work but the initial UI does not expose nonfunctional upload, voice, or memory controls.

## Performance and accessibility

- Preserve server rendering for landing content and avoid a global client conversion.
- Lazy-load Nova chat panel code after launcher interaction or idle time; the launcher remains small.
- Use dynamic imports for heavy optional motion surfaces where beneficial.
- Animate only opacity and transforms for recurring motion.
- Avoid simultaneous blur animation; blur is static or changes only on panel entry.
- Respect `prefers-reduced-motion` in CSS, Framer Motion, counters, charts, confetti, and typing delays.
- Maintain one `h1`, semantic landmarks, connected labels, visible focus, correct dialog/listbox roles, and live announcements.
- Preserve print styles and suppress chat/floating actions in print.

## Error and state handling

- Motion components render children normally if JavaScript animation setup is unavailable.
- Nova always has a deterministic response; classification failures fall back to `general`.
- Profile-dependent surfaces render a neutral loading boundary until account-scoped profile hydration finishes.
- Goal save failures keep the dialog open and preserve entered values.
- Dropdowns restore focus on close and never trap focus after unmount.
- In-flight animated/staged chat output is canceled when account or profile revision changes.

## Testing and verification

Development follows red-green-refactor cycles. Automated coverage includes:

- Motion contracts and reduced-motion fallbacks.
- Animated number formatting and final-value semantics.
- Select keyboard navigation and selection behavior.
- Deterministic Nova intent classification, evidence calculations, stable variation, unsupported prompts, and account/profile reset behavior.
- Goal validation, persistence, reordering, completion transition, and accessible announcements.
- Source and rendered contracts for shell collapse, route transitions, loading skeletons, chart containment, and landing server rendering.

Final verification includes the full Vitest suite, ESLint, `tsc --noEmit`, `git diff --check`, authenticated production build, static export, protected-engine diff check, and browser regression at desktop, tablet, and mobile widths. Browser checks cover clipping, horizontal overflow, light/dark themes, reduced motion, keyboard navigation, sidebar state, dropdowns, goal edits, Nova chat, route transitions, console health, and layout stability.

## Dependencies

No new runtime dependency is planned. The implementation uses the existing Framer Motion, Recharts, React Hook Form, Zod, TanStack Query, Lucide, Sonner, and local UI primitives. A new dependency may only be proposed if the custom accessible select or controlled markdown renderer fails its required accessibility or security tests; it is not part of the approved baseline.

## Explicit exclusions

- No fabricated testimonials, customer logos, or usage statistics.
- No external AI request, API key requirement, or simulated claim that Nova used an external model.
- No bank connection, money movement, voice recording, file upload, persistent cross-session chat memory, or embedded chat charts in this release.
- No scroll-jacking, mandatory pointer effects, or drag-only goal reordering.
- No changes to the protected financial, investment, or CSV export engine behavior unless a separately proven bug requires user-approved scope expansion.
