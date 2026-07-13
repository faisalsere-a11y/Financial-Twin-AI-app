"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent
} from "react";
import { createPortal } from "react-dom";
import { LoaderCircle, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { GoalModel } from "@/lib/financial/types";
import { goalUpdateSchema, type GoalUpdateValues } from "@/lib/profile/goal-updates";
import { cn } from "@/lib/utils";

type GoalEditorProps = {
  goal: GoalModel;
  onClose: () => void;
  onSave: (goalId: string, values: GoalUpdateValues) => void;
  returnFocusId: string;
};

type GoalFormState = {
  name: string;
  category: GoalModel["category"];
  targetAmount: string;
  currentAmount: string;
  monthlyContribution: string;
  targetDate: string;
  priority: GoalModel["priority"];
};

type FieldName = keyof GoalFormState;
type FieldErrors = Partial<Record<FieldName, string>>;

const goalCategories = [
  "Emergency",
  "Retirement",
  "House",
  "Wedding",
  "Vacation",
  "Education"
] as const satisfies readonly GoalModel["category"][];

const goalPriorities = ["High", "Medium", "Low"] as const satisfies readonly GoalModel["priority"][];
const fieldNames: FieldName[] = [
  "name",
  "category",
  "targetAmount",
  "currentAmount",
  "monthlyContribution",
  "targetDate",
  "priority"
];

const focusableSelector = [
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "a[href]",
  "[tabindex]:not([tabindex='-1'])"
].join(",");

const selectClassName = "flex h-11 w-full rounded-xl border border-input bg-card/80 px-3 py-2 text-sm text-foreground shadow-sm outline-none focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

function initialFormState(goal: GoalModel): GoalFormState {
  return {
    name: goal.name,
    category: goal.category,
    targetAmount: String(goal.targetAmount),
    currentAmount: String(goal.currentAmount),
    monthlyContribution: String(goal.monthlyContribution),
    targetDate: goal.targetDate,
    priority: goal.priority
  };
}

function parseAmount(value: string) {
  return value.trim() === "" ? Number.NaN : Number(value);
}

function toGoalUpdateValues(form: GoalFormState): GoalUpdateValues {
  return {
    name: form.name,
    category: form.category,
    targetAmount: parseAmount(form.targetAmount),
    currentAmount: parseAmount(form.currentAmount),
    monthlyContribution: parseAmount(form.monthlyContribution),
    targetDate: form.targetDate,
    priority: form.priority
  };
}

function isFieldName(value: unknown): value is FieldName {
  return typeof value === "string" && fieldNames.includes(value as FieldName);
}

function FieldError({ field, errors }: { field: FieldName; errors: FieldErrors }) {
  if (!errors[field]) return null;
  return <p id={`goal-${field}-error`} className="mt-1.5 text-xs font-semibold text-destructive">{errors[field]}</p>;
}

export function GoalEditor({ goal, onClose, onSave, returnFocusId }: GoalEditorProps) {
  const [form, setForm] = useState(() => initialFormState(goal));
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const savingRef = useRef(false);

  useEffect(() => {
    const dialogElement = dialogRef.current;
    if (!dialogElement) return;

    const returnFocusTarget = document.getElementById(returnFocusId);
    previousFocusRef.current = returnFocusTarget instanceof HTMLElement
      ? returnFocusTarget
      : document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const previousOverflow = document.body.style.overflow;
    const backgroundStates = Array.from(document.body.children)
      .filter((element): element is HTMLElement => (
        element instanceof HTMLElement && !element.contains(dialogElement)
      ))
      .map((backgroundElement) => ({
        backgroundElement,
        inert: backgroundElement.inert,
        ariaHidden: backgroundElement.getAttribute("aria-hidden")
      }));
    const blockCompetingPaletteShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };

    document.body.style.overflow = "hidden";
    for (const { backgroundElement } of backgroundStates) {
      backgroundElement.inert = true;
      backgroundElement.setAttribute("aria-hidden", "true");
    }
    window.addEventListener("keydown", blockCompetingPaletteShortcut, { capture: true });
    const focusFrame = window.requestAnimationFrame(() => nameInputRef.current?.focus());

    return () => {
      window.cancelAnimationFrame(focusFrame);
      window.removeEventListener("keydown", blockCompetingPaletteShortcut, { capture: true });
      document.body.style.overflow = previousOverflow;
      for (const { backgroundElement, inert, ariaHidden } of backgroundStates) {
        backgroundElement.inert = inert;
        if (ariaHidden === null) backgroundElement.removeAttribute("aria-hidden");
        else backgroundElement.setAttribute("aria-hidden", ariaHidden);
      }
      const previousFocus = previousFocusRef.current;
      window.requestAnimationFrame(() => {
        const currentReturnFocusTarget = document.getElementById(returnFocusId);
        if (currentReturnFocusTarget instanceof HTMLElement) currentReturnFocusTarget.focus();
        else if (previousFocus?.isConnected) previousFocus.focus();
      });
    };
  }, [returnFocusId]);

  const updateField = <Field extends FieldName>(field: Field, value: GoalFormState[Field]) => {
    setForm((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    setSubmitError(null);
  };

  const requestClose = () => {
    if (!savingRef.current) onClose();
  };

  const handleDialogKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      requestClose();
      return;
    }

    if (event.key === "Tab") {
      const focusable = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(focusableSelector) ?? []
      );
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0]!;
      const last = focusable.at(-1)!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (savingRef.current) return;

    setSubmitError(null);
    const result = goalUpdateSchema.safeParse(toGoalUpdateValues(form));
    if (!result.success) {
      const nextErrors: FieldErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0];
        if (isFieldName(field) && !nextErrors[field]) nextErrors[field] = issue.message;
      }
      setFieldErrors(nextErrors);
      window.requestAnimationFrame(() => {
        dialogRef.current?.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
      });
      return;
    }

    savingRef.current = true;
    setIsSaving(true);
    try {
      onSave(goal.id, result.data);
      onClose();
    } catch (error) {
      savingRef.current = false;
      setIsSaving(false);
      const detail = error instanceof Error ? error.message : "The profile store did not accept the update.";
      setSubmitError(`Your goal was not saved. ${detail}`);
    }
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex justify-end bg-background/75 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !savingRef.current) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="goal-editor-title"
        aria-describedby="goal-editor-description"
        onKeyDown={handleDialogKeyDown}
        className="flex h-full w-full max-w-xl flex-col overflow-hidden border-l border-border bg-background shadow-2xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-border px-5 py-5 sm:px-7">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-primary">Goal workspace</p>
            <h2 id="goal-editor-title" className="mt-1 text-2xl font-black">Edit {goal.name}</h2>
            <p id="goal-editor-description" className="mt-1 text-sm leading-6 text-muted-foreground">
              Update the target, funding, timing, and priority. Forecasts refresh after this account-scoped save.
            </p>
          </div>
          <Button type="button" size="icon" variant="ghost" onClick={requestClose} disabled={isSaving} aria-label="Close goal editor">
            <X className="size-5" aria-hidden="true" />
          </Button>
        </header>

        <form noValidate aria-busy={isSaving} onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-6 sm:px-7">
            {submitError && (
              <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive">
                {submitError}
              </div>
            )}

            <div>
              <Label htmlFor="goal-name">Goal name</Label>
              <Input
                ref={nameInputRef}
                id="goal-name"
                value={form.name}
                disabled={isSaving}
                aria-invalid={Boolean(fieldErrors.name)}
                aria-describedby={fieldErrors.name ? "goal-name-error" : undefined}
                onChange={(event) => updateField("name", event.target.value)}
                className="mt-2"
              />
              <FieldError field="name" errors={fieldErrors} />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="goal-category">Category</Label>
                <select
                  id="goal-category"
                  value={form.category}
                  disabled={isSaving}
                  aria-invalid={Boolean(fieldErrors.category)}
                  aria-describedby={fieldErrors.category ? "goal-category-error" : undefined}
                  onChange={(event) => updateField("category", event.target.value as GoalModel["category"])}
                  className={cn(selectClassName, "mt-2")}
                >
                  {goalCategories.map((category) => <option key={category} value={category}>{category}</option>)}
                </select>
                <FieldError field="category" errors={fieldErrors} />
              </div>
              <div>
                <Label htmlFor="goal-priority">Priority</Label>
                <select
                  id="goal-priority"
                  value={form.priority}
                  disabled={isSaving}
                  aria-invalid={Boolean(fieldErrors.priority)}
                  aria-describedby={fieldErrors.priority ? "goal-priority-error" : undefined}
                  onChange={(event) => updateField("priority", event.target.value as GoalModel["priority"])}
                  className={cn(selectClassName, "mt-2")}
                >
                  {goalPriorities.map((priority) => <option key={priority} value={priority}>{priority}</option>)}
                </select>
                <FieldError field="priority" errors={fieldErrors} />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="goal-target-amount">Target amount</Label>
                <Input
                  id="goal-target-amount"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="any"
                  value={form.targetAmount}
                  disabled={isSaving}
                  aria-invalid={Boolean(fieldErrors.targetAmount)}
                  aria-describedby={fieldErrors.targetAmount ? "goal-targetAmount-error" : undefined}
                  onChange={(event) => updateField("targetAmount", event.target.value)}
                  className="mt-2"
                />
                <FieldError field="targetAmount" errors={fieldErrors} />
              </div>
              <div>
                <Label htmlFor="goal-current-amount">Funded so far</Label>
                <Input
                  id="goal-current-amount"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="any"
                  value={form.currentAmount}
                  disabled={isSaving}
                  aria-invalid={Boolean(fieldErrors.currentAmount)}
                  aria-describedby={fieldErrors.currentAmount ? "goal-currentAmount-error" : undefined}
                  onChange={(event) => updateField("currentAmount", event.target.value)}
                  className="mt-2"
                />
                <FieldError field="currentAmount" errors={fieldErrors} />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="goal-monthly-contribution">Monthly contribution</Label>
                <Input
                  id="goal-monthly-contribution"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="any"
                  value={form.monthlyContribution}
                  disabled={isSaving}
                  aria-invalid={Boolean(fieldErrors.monthlyContribution)}
                  aria-describedby={fieldErrors.monthlyContribution ? "goal-monthlyContribution-error" : undefined}
                  onChange={(event) => updateField("monthlyContribution", event.target.value)}
                  className="mt-2"
                />
                <FieldError field="monthlyContribution" errors={fieldErrors} />
              </div>
              <div>
                <Label htmlFor="goal-target-date">Target date</Label>
                <Input
                  id="goal-target-date"
                  type="date"
                  value={form.targetDate}
                  disabled={isSaving}
                  aria-invalid={Boolean(fieldErrors.targetDate)}
                  aria-describedby={fieldErrors.targetDate ? "goal-targetDate-error" : undefined}
                  onChange={(event) => updateField("targetDate", event.target.value)}
                  className="mt-2"
                />
                <FieldError field="targetDate" errors={fieldErrors} />
              </div>
            </div>
          </div>

          <footer className="flex flex-col-reverse gap-3 border-t border-border bg-muted/30 px-5 py-4 sm:flex-row sm:justify-end sm:px-7">
            <Button type="button" variant="outline" onClick={requestClose} disabled={isSaving}>Cancel</Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" /> : <Save className="size-4" aria-hidden="true" />}
              {isSaving ? "Saving goal…" : "Save goal"}
            </Button>
          </footer>
        </form>
      </div>
    </div>,
    document.body
  );
}
