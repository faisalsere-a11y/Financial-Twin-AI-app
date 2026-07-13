export type SelectionKey = "ArrowDown" | "ArrowUp" | "Home" | "End";

export type SelectStateOption = {
  identity: string;
  value: string;
  disabled: boolean;
  hidden?: boolean;
};

export type SelectValue = string | number | readonly string[] | null | undefined;

export function moveSelection(current: number, count: number, key: SelectionKey): number {
  if (count <= 0) return -1;
  if (key === "Home") return 0;
  if (key === "End") return count - 1;
  return key === "ArrowDown" ? (current + 1) % count : (current - 1 + count) % count;
}

export function normalizeSelectValue(value: SelectValue): string | undefined {
  if (Array.isArray(value)) return value[0] === undefined ? undefined : String(value[0]);
  return value === undefined || value === null ? undefined : String(value);
}

export function resolveInitialValue(
  defaultValue: SelectValue,
  options: readonly SelectStateOption[]
): string {
  const requestedValue = normalizeSelectValue(defaultValue);
  if (requestedValue !== undefined && options.some((option) => option.value === requestedValue)) {
    return requestedValue;
  }
  return options[0]?.value ?? "";
}

export function reconcileSelectedValue(
  currentValue: string,
  options: readonly SelectStateOption[],
  preferredValue?: string
): string {
  if (options.some((option) => option.value === currentValue)) return currentValue;
  if (preferredValue !== undefined && options.some((option) => option.value === preferredValue)) {
    return preferredValue;
  }
  return options[0]?.value ?? "";
}

export function reconcileActiveIdentity(
  activeIdentity: string | null,
  selectedValue: string,
  options: readonly SelectStateOption[]
): string | null {
  const currentOption = options.find((option) => option.identity === activeIdentity);
  if (currentOption && !currentOption.disabled && !currentOption.hidden) {
    return currentOption.identity;
  }

  const selectedOption = options.find(
    (option) => option.value === selectedValue && !option.disabled && !option.hidden
  );
  return selectedOption?.identity
    ?? options.find((option) => !option.disabled && !option.hidden)?.identity
    ?? null;
}
