import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

function readSource(relativePath: string) {
  const filePath = path.join(process.cwd(), relativePath);
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : "";
}

const source = readSource("components/goals/goals-page.tsx");
const editor = readSource("components/goals/goal-editor.tsx");
const progressRing = readSource("components/goals/goal-progress-ring.tsx");
const celebration = readSource("components/goals/goal-celebration.tsx");

describe("goal portfolio experience", () => {
  it("renders only active-profile goals and exposes a real model-edit path", () => {
    expect(source).toContain("useFinancialProfile");
    expect(source).toContain("forecastGoalCompletion(profile)");
    expect(source).toContain("profile.goals.length === 0");
    expect(source).toContain('href="/onboarding"');
    expect(source).toContain("Edit goals in financial model");
    expect(source).not.toContain('["Wedding", "Education"]');
    expect(source).not.toContain("Financial Calendar");
    expect(source).not.toContain("Loan payment due");
  });

  it("shows currency-correct progress, forecast evidence, and the next contribution", () => {
    expect(source).toContain("profile.currency");
    expect(source).toContain("goal.targetDate");
    expect(source).toContain("goal.forecastDate");
    expect(source).toContain("goal.monthsRemaining");
    expect(source).toContain("goal.monthlyContribution");
    expect(source).toContain("Next monthly contribution");
    expect(source).toContain("Forecast status");
    expect(source).toContain("Risk signal");
  });

  it("animates prominent summary values without duplicating semantic output", () => {
    expect(source).toContain('import { AnimatedNumber } from "@/components/motion/animated-number"');
    expect(source).toContain("value={totalFunded}");
    expect(source).toContain("value={plannedMonthly}");
    expect(source).toContain("format={(value) => formatCurrency(value, profile.currency)}");
  });

  it("keeps dense goal evidence in keyboard-accessible reduced-motion-safe disclosures", () => {
    expect(source).toContain("expandedGoalIds");
    expect(source).toContain("new Set<string>()");
    expect(source).toContain("aria-expanded={detailsExpanded}");
    expect(source).toContain("aria-controls={detailsId}");
    expect(source).toContain("id={detailsId}");
    expect(source).toContain("AnimatePresence");
    expect(source).toContain("useReducedMotion");
    expect(source).toContain("shouldReduceMotion ? false");
    expect(source).toContain("detailsExpanded &&");
  });

  it("shows a deterministic Nova insight grounded in the current keyed profile forecast", () => {
    expect(source).toContain("createGoalPortfolioInsight(goals, profile.currency)");
    expect(source).toContain('id="goal-nova-insight-title"');
    expect(source).toContain("insight.message");
    expect(source).toContain("insight.evidence.map");
    expect(source).toContain("Grounded in this financial model only");
    expect(source.indexOf("const [expandedGoalIds")).toBeGreaterThan(source.indexOf("function GoalsExperience"));
    expect(source).toContain("key={profileKey}");
  });

  it("gives goal progress and status accessible names", () => {
    expect(source).toContain("<GoalProgressRing");
    expect(progressRing).toContain('role="progressbar"');
    expect(progressRing).toContain("aria-valuenow");
    expect(progressRing).toContain("aria-valuemin={0}");
    expect(progressRing).toContain("aria-valuemax={100}");
    expect(progressRing).toContain("useReducedMotion");
    expect(progressRing).toContain("motionTokens.deliberate");
    expect(source).toContain("funding milestones");
    expect(source).toContain("milestones.map");
    expect(source).toContain('aria-live="polite"');
  });

  it("edits every goal field through validated persistent updates", () => {
    for (const field of [
      "goal-name",
      "goal-category",
      "goal-target-amount",
      "goal-current-amount",
      "goal-monthly-contribution",
      "goal-target-date",
      "goal-priority"
    ]) {
      expect(editor).toContain(`htmlFor="${field}"`);
      expect(editor).toContain(`id="${field}"`);
    }

    expect(editor).toContain("goalUpdateSchema.safeParse");
    expect(editor).toContain("aria-invalid");
    expect(editor).toContain("savingRef.current");
    expect(editor).toContain('role="alert"');
    expect(editor).toContain('aria-busy={isSaving}');
    expect(editor).toContain("noValidate");
    expect(source).toContain("updateGoal(profile, goalId, values)");
    expect(source).toContain("save(nextProfile)");
  });

  it("provides a keyboard-contained editor with safe close and focus restoration", () => {
    expect(editor).toContain('role="dialog"');
    expect(editor).toContain('aria-modal="true"');
    expect(editor).toContain('aria-labelledby="goal-editor-title"');
    expect(editor).toContain('aria-describedby="goal-editor-description"');
    expect(editor).toContain("focusableSelector");
    expect(editor).toContain('event.key === "Tab"');
    expect(editor).toContain('event.key === "Escape"');
    expect(editor).toContain("previousFocusRef");
    expect(editor).toContain("document.body.style.overflow");
    expect(editor).toContain('import { createPortal } from "react-dom"');
    expect(editor).toContain("return createPortal(");
    expect(editor).toContain("document.body.children");
    expect(editor).toContain("backgroundElement.inert = true");
    expect(editor).toContain('backgroundElement.setAttribute("aria-hidden", "true")');
    expect(editor).toContain("blockCompetingPaletteShortcut");
    expect(editor).toContain('(event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k"');
    expect(editor).toContain("event.stopImmediatePropagation()");
    expect(editor).toContain('window.addEventListener("keydown", blockCompetingPaletteShortcut, { capture: true })');
    expect(editor).toContain("event.target === event.currentTarget");
    expect(source).toContain("inert={Boolean(selectedGoal)}");
  });

  it("prevents editor scroll-lock layout shift and uses the shared premium selects", () => {
    expect(editor).toContain("previousPaddingRight");
    expect(editor).toContain("scrollbarWidth");
    expect(editor).toContain("bodyPaddingRight");
    expect(editor).toContain("document.body.style.paddingRight = previousPaddingRight");
    expect(editor).toContain('import { Select, SelectItem } from "@/components/ui/select"');
    expect(editor).toContain('<Select\n                  id="goal-category"');
    expect(editor).toContain('<Select\n                  id="goal-priority"');
    expect(editor).toContain("<SelectItem key={category} value={category}>{category}</SelectItem>");
    expect(editor).toContain("<SelectItem key={priority} value={priority}>{priority}</SelectItem>");
    expect(editor).not.toContain("<select");
  });

  it("restores background isolation before saved-state announcements are published", () => {
    expect(editor).toMatch(/import \{[\s\S]*?useLayoutEffect[\s\S]*?\} from "react"/);
    const isolationLifecycle = editor.match(
      /useLayoutEffect\(\(\) => \{[\s\S]*?\n  \}, \[returnFocusId\]\);/
    )?.[0] ?? "";

    expect(isolationLifecycle).toContain("document.body.children");
    expect(isolationLifecycle).toContain("return () => {");
    expect(isolationLifecycle).toContain("backgroundElement.inert = inert");
    expect(isolationLifecycle).toContain('backgroundElement.removeAttribute("aria-hidden")');
    expect(isolationLifecycle).toContain('backgroundElement.setAttribute("aria-hidden", ariaHidden)');
  });

  it("keeps profile subject and revision boundaries while exposing explicit update states", () => {
    expect(source).toContain("subject, savedAt, isLoaded, save");
    expect(source).toContain('const profileKey = `${subject}:${savedAt ?? "sample"}`');
    expect(source).toContain("key={profileKey}");
    expect(source).toContain("Loading goal portfolio");
    expect(source).toContain('notice.type === "error"');
    expect(source).toContain('notice.type === "success"');
    expect(source).toContain('role={notice.type === "error" ? "alert" : "status"}');
    expect(source).toContain("profile.goals.length === 0");
  });

  it("reorders goals explicitly and celebrates only a saved user completion transition", () => {
    expect(source).toContain("moveGoal(profile, goalId, direction)");
    expect(source).toContain("Move ${goal.name} earlier");
    expect(source).toContain("Move ${goal.name} later");
    expect(source).toContain("pendingReorderFocusRef");
    expect(source).toContain("onGoalMoved(goalId, direction)");
    expect(source).toContain('id={`move-goal-${goal.id}-earlier`}');
    expect(source).toContain('id={`move-goal-${goal.id}-later`}');
    expect(source).toContain("target?.focus()");
    expect(source).toContain("crossedGoalCompletion(beforeGoal, afterGoal)");
    expect(source).toMatch(/save\(nextProfile\)[\s\S]*?onGoalCompleted/);
    expect(source).toContain("<GoalCelebration");
    expect(celebration).toContain("useReducedMotion() === true");
    expect(celebration).toContain("!shouldReduceMotion");
    expect(celebration).toContain("@keyframes goal-particle");
    expect(celebration).toContain("prefers-reduced-motion: reduce");
    expect(celebration).toContain("var(--positive)");
    expect(celebration).not.toContain("var(--success)");
    expect(celebration).toContain('role="status"');
    expect(celebration).toContain('aria-live="polite"');
  });
});
