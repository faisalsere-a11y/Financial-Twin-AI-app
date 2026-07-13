"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import { motionTokens } from "@/lib/motion/variants";
import { moveSelection, type SelectionKey } from "@/lib/ui/select-state";
import { cn } from "@/lib/utils";

type SelectItemProps = Omit<React.OptionHTMLAttributes<HTMLOptionElement>, "value"> & {
  value: string;
  children: React.ReactNode;
};

type SelectProps = Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "children"> & {
  children: React.ReactNode;
  onValueChange?: (value: string) => void;
};

type OptionData = {
  key: React.Key;
  value: string;
  label: React.ReactNode;
  disabled: boolean;
};

function stringValue(value: SelectProps["value"] | SelectProps["defaultValue"]): string {
  if (Array.isArray(value)) return value[0] === undefined ? "" : String(value[0]);
  return value === undefined || value === null ? "" : String(value);
}

function collectOptions(children: React.ReactNode): OptionData[] {
  const options: OptionData[] = [];

  const visit = (nodes: React.ReactNode) => {
    React.Children.forEach(nodes, (child) => {
      if (!React.isValidElement(child)) return;
      if (child.type === React.Fragment) {
        visit((child.props as { children?: React.ReactNode }).children);
        return;
      }

      const props = child.props as Partial<SelectItemProps>;
      if (props.value === undefined) return;
      options.push({
        key: child.key ?? `${props.value}-${options.length}`,
        value: String(props.value),
        label: props.children,
        disabled: Boolean(props.disabled)
      });
    });
  };

  visit(children);
  return options;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(function Select(
  {
    value,
    defaultValue,
    onValueChange,
    onChange: nativeOnChange,
    onBlur: nativeOnBlur,
    onInvalid: nativeOnInvalid,
    children,
    className,
    id,
    disabled = false,
    required = false,
    autoFocus,
    tabIndex,
    "aria-describedby": ariaDescribedBy,
    "aria-errormessage": ariaErrorMessage,
    "aria-invalid": ariaInvalid,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    ...nativeProps
  },
  forwardedRef
) {
  const generatedId = React.useId();
  const triggerId = id ?? `select-${generatedId}`;
  const listboxId = `${triggerId}-listbox`;
  const nativeId = `${triggerId}-native`;
  const options = React.useMemo(() => collectOptions(children), [children]);
  const initialValue = stringValue(defaultValue) || options[0]?.value || "";
  const isControlled = value !== undefined;
  const isControlledRef = React.useRef(isControlled);
  isControlledRef.current = isControlled;
  const [uncontrolledValue, setUncontrolledValue] = React.useState(initialValue);
  const selectedValue = isControlled ? stringValue(value) : uncontrolledValue;
  const selectedOption = options.find((option) => option.value === selectedValue);
  const [open, setOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const shouldReduceMotion = useReducedMotion();
  const rootRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const nativeSelectRef = React.useRef<HTMLSelectElement | null>(null);
  const nativeFocusRef = React.useRef<{
    node: HTMLSelectElement;
    focus: HTMLSelectElement["focus"];
  } | null>(null);
  const nativeValueCleanupRef = React.useRef<(() => void) | null>(null);
  const optionRefs = React.useRef(new Map<number, HTMLDivElement>());

  const setNativeSelectRef = React.useCallback(
    (node: HTMLSelectElement | null) => {
      nativeValueCleanupRef.current?.();
      nativeValueCleanupRef.current = null;
      if (nativeFocusRef.current && nativeFocusRef.current.node !== node) {
        nativeFocusRef.current.node.focus = nativeFocusRef.current.focus;
        nativeFocusRef.current = null;
      }
      nativeSelectRef.current = node;
      if (node && !nativeFocusRef.current) {
        nativeFocusRef.current = { node, focus: node.focus };
        node.focus = (options) => triggerRef.current?.focus(options);
      }
      if (node) {
        const ownDescriptor = Object.getOwnPropertyDescriptor(node, "value");
        const valueDescriptor = ownDescriptor
          ?? Object.getOwnPropertyDescriptor(Object.getPrototypeOf(node), "value");
        if (valueDescriptor?.get && valueDescriptor.set && valueDescriptor.configurable !== false) {
          Object.defineProperty(node, "value", {
            configurable: true,
            enumerable: valueDescriptor.enumerable,
            get: () => valueDescriptor.get?.call(node),
            set: (nextValue: string) => {
              valueDescriptor.set?.call(node, nextValue);
              if (!isControlledRef.current) setUncontrolledValue(String(nextValue));
            }
          });
          nativeValueCleanupRef.current = () => {
            if (ownDescriptor) Object.defineProperty(node, "value", ownDescriptor);
            else Reflect.deleteProperty(node, "value");
          };
        }
      }
      if (typeof forwardedRef === "function") forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    },
    [forwardedRef]
  );

  const enabledIndices = React.useMemo(
    () => options.flatMap((option, index) => (option.disabled ? [] : [index])),
    [options]
  );

  const selectedIndex = options.findIndex((option) => option.value === selectedValue);

  const setInitialActiveOption = React.useCallback(() => {
    const nextIndex = selectedIndex >= 0 && !options[selectedIndex]?.disabled
      ? selectedIndex
      : (enabledIndices[0] ?? -1);
    setActiveIndex(nextIndex);
  }, [enabledIndices, options, selectedIndex]);

  const closeAndFocus = React.useCallback(() => {
    setOpen(false);
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  }, []);

  const handleNativeChange = React.useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      if (!isControlled) setUncontrolledValue(event.target.value);
      onValueChange?.(event.target.value);
      nativeOnChange?.(event);
    },
    [isControlled, nativeOnChange, onValueChange]
  );

  const chooseOption = React.useCallback(
    (option: OptionData) => {
      if (disabled || option.disabled) return;
      const nativeSelect = nativeSelectRef.current;
      if (nativeSelect) {
        nativeSelect.value = option.value;
        nativeSelect.dispatchEvent(new Event("change", { bubbles: true }));
      } else {
        if (!isControlled) setUncontrolledValue(option.value);
        onValueChange?.(option.value);
      }
      closeAndFocus();
    },
    [closeAndFocus, disabled, isControlled, onValueChange]
  );

  const moveActiveOption = React.useCallback(
    (key: SelectionKey) => {
      if (enabledIndices.length === 0) {
        setActiveIndex(-1);
        return;
      }
      const currentEnabledIndex = enabledIndices.indexOf(activeIndex);
      const normalizedCurrent = currentEnabledIndex >= 0
        ? currentEnabledIndex
        : key === "ArrowUp" ? 0 : -1;
      const nextEnabledIndex = moveSelection(normalizedCurrent, enabledIndices.length, key);
      setActiveIndex(enabledIndices[nextEnabledIndex] ?? -1);
    },
    [activeIndex, enabledIndices]
  );

  const handleTriggerKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    const key = event.key;
    if (key === "Escape") {
      if (open) {
        event.preventDefault();
        closeAndFocus();
      }
      return;
    }
    if (key === "Tab") {
      setOpen(false);
      return;
    }
    if (key === "Enter" || key === " ") {
      event.preventDefault();
      if (!open) {
        setInitialActiveOption();
        setOpen(true);
      } else if (activeIndex >= 0) {
        const option = options[activeIndex];
        if (option) chooseOption(option);
      }
      return;
    }
    if (key === "ArrowDown" || key === "ArrowUp" || key === "Home" || key === "End") {
      event.preventDefault();
      if (!open) {
        setOpen(true);
        const currentEnabledIndex = enabledIndices.indexOf(selectedIndex);
        const normalizedCurrent = currentEnabledIndex >= 0
          ? currentEnabledIndex
          : key === "ArrowUp" ? 0 : -1;
        const nextEnabledIndex = moveSelection(normalizedCurrent, enabledIndices.length, key);
        setActiveIndex(enabledIndices[nextEnabledIndex] ?? -1);
      } else {
        moveActiveOption(key);
      }
    }
  };

  const handleTriggerBlur = (event: React.FocusEvent<HTMLButtonElement>) => {
    if (rootRef.current?.contains(event.relatedTarget as Node | null)) return;
    setOpen(false);
    nativeSelectRef.current?.dispatchEvent(
      new FocusEvent("focusout", { bubbles: true, relatedTarget: event.relatedTarget })
    );
  };

  React.useEffect(() => {
    if (!open) return;
    const handleOutsidePointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", handleOutsidePointer);
    return () => document.removeEventListener("pointerdown", handleOutsidePointer);
  }, [open]);

  React.useEffect(() => {
    if (!open || activeIndex < 0) return;
    optionRefs.current.get(activeIndex)?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open]);

  React.useEffect(() => {
    if (isControlled) return;
    const nativeValue = nativeSelectRef.current?.value;
    if (nativeValue !== undefined && nativeValue !== uncontrolledValue) {
      setUncontrolledValue(nativeValue);
    }
  }, [isControlled, uncontrolledValue]);

  React.useEffect(() => {
    const nativeSelect = nativeSelectRef.current;
    const form = nativeSelect?.form;
    if (!form || isControlled) return;
    const handleReset = () => {
      window.setTimeout(() => setUncontrolledValue(nativeSelect.value), 0);
    };
    form.addEventListener("reset", handleReset);
    return () => form.removeEventListener("reset", handleReset);
  }, [isControlled]);

  return (
    <div ref={rootRef} className="relative w-full">
      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-activedescendant={open && activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined}
        aria-describedby={ariaDescribedBy}
        aria-errormessage={ariaErrorMessage}
        aria-invalid={ariaInvalid}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-required={required || undefined}
        disabled={disabled}
        autoFocus={autoFocus}
        tabIndex={tabIndex}
        onClick={() => {
          if (!open) setInitialActiveOption();
          setOpen((current) => !current);
        }}
        onKeyDown={handleTriggerKeyDown}
        onBlur={handleTriggerBlur}
        className={cn(
          "flex h-11 w-full items-center justify-between gap-3 rounded-xl border border-input bg-card/80 px-3 py-2 text-left text-sm text-foreground shadow-sm backdrop-blur-sm motion-safe:transition-[border-color,box-shadow,transform] motion-safe:duration-[var(--motion-fast)] focus-visible:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          open && "border-primary/40 ring-2 ring-ring",
          className
        )}
      >
        <span className={cn("min-w-0 flex-1 truncate", !selectedOption && "text-muted-foreground")}>
          {selectedOption?.label ?? "Select an option"}
        </span>
        <ChevronDown
          aria-hidden="true"
          className={cn("size-4 shrink-0 text-muted-foreground motion-safe:transition-transform motion-safe:duration-[var(--motion-fast)]", open && "rotate-180")}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id={listboxId}
            role="listbox"
            aria-labelledby={ariaLabelledBy ?? triggerId}
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.98, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.98, y: -4 }}
            transition={{ duration: shouldReduceMotion ? 0 : motionTokens.standard, ease: motionTokens.ease }}
            className="absolute left-0 right-0 z-50 mt-2 max-h-72 origin-top overflow-y-auto overscroll-contain rounded-xl border border-border bg-popover/95 p-1.5 text-popover-foreground shadow-xl backdrop-blur-xl"
          >
            {options.map((option, index) => {
              const selected = option.value === selectedValue;
              const active = index === activeIndex;
              return (
                <motion.div
                  ref={(node) => {
                    if (node) optionRefs.current.set(index, node);
                    else optionRefs.current.delete(index);
                  }}
                  id={`${listboxId}-option-${index}`}
                  key={option.key}
                  role="option"
                  aria-selected={selected}
                  aria-disabled={option.disabled || undefined}
                  data-active={active || undefined}
                  onPointerMove={() => {
                    if (!option.disabled) setActiveIndex(index);
                  }}
                  onPointerDown={(event) => event.preventDefault()}
                  onClick={() => chooseOption(option)}
                  className={cn(
                    "flex min-h-10 cursor-default select-none items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm outline-none",
                    active && "bg-accent text-accent-foreground",
                    selected && "font-bold text-primary",
                    option.disabled && "pointer-events-none opacity-45"
                  )}
                >
                  <span className="min-w-0 flex-1 truncate">{option.label}</span>
                  {selected && <Check className="size-4 shrink-0" aria-hidden="true" />}
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <select
        {...nativeProps}
        ref={setNativeSelectRef}
        id={nativeId}
        value={isControlled ? selectedValue : undefined}
        defaultValue={isControlled ? undefined : initialValue}
        disabled={disabled}
        required={required}
        tabIndex={-1}
        aria-hidden="true"
        className="sr-only"
        onChange={handleNativeChange}
        onBlur={nativeOnBlur}
        onInvalid={(event) => {
          nativeOnInvalid?.(event);
          if (!event.defaultPrevented) {
            event.preventDefault();
            triggerRef.current?.focus();
          }
        }}
      >
        {children}
      </select>
    </div>
  );
});

Select.displayName = "Select";

export function SelectItem({ value, children, disabled, ...props }: SelectItemProps) {
  return <option {...props} value={value} disabled={disabled}>{children}</option>;
}

export { Select };
