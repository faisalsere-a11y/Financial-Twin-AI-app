"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import { motionTokens } from "@/lib/motion/variants";
import {
  placeSelectPopup,
  type SelectPopupPlacement
} from "@/lib/ui/select-placement";
import {
  collectSelectOptions,
  selectOptionSignature,
  type CollectedSelectOption
} from "@/lib/ui/select-options";
import {
  moveSelection,
  normalizeSelectValue,
  reconcileActiveIdentity,
  reconcileSelectedValue,
  resolveInitialValue,
  type SelectionKey
} from "@/lib/ui/select-state";
import { cn } from "@/lib/utils";

type SelectItemProps = Omit<React.OptionHTMLAttributes<HTMLOptionElement>, "value"> & {
  value: string;
  children?: React.ReactNode;
};

type SelectProps = Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "children"> & {
  children?: React.ReactNode;
  onValueChange?: (value: string) => void;
};

const useBrowserLayoutEffect = typeof window === "undefined" ? React.useEffect : React.useLayoutEffect;

function samePlacement(
  current: SelectPopupPlacement | null,
  next: SelectPopupPlacement
) {
  return current !== null
    && current.side === next.side
    && current.top === next.top
    && current.left === next.left
    && current.width === next.width
    && current.maxHeight === next.maxHeight;
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
  const options = React.useMemo(() => collectSelectOptions(children), [children]);
  const optionSignature = React.useMemo(() => selectOptionSignature(options), [options]);
  const preferredDefaultValue = normalizeSelectValue(defaultValue);
  const initialValue = resolveInitialValue(defaultValue, options);
  const isControlled = value !== undefined;
  const isControlledRef = React.useRef(isControlled);
  isControlledRef.current = isControlled;
  const [uncontrolledValue, setUncontrolledValue] = React.useState(initialValue);
  const selectedValue = isControlled ? (normalizeSelectValue(value) ?? "") : uncontrolledValue;
  const selectedValueRef = React.useRef(selectedValue);
  selectedValueRef.current = selectedValue;
  const selectedOption = options.find((option) => option.value === selectedValue);
  const visibleOptions = React.useMemo(
    () => options.filter((option) => !option.hidden),
    [options]
  );
  const [open, setOpen] = React.useState(false);
  const [portalReady, setPortalReady] = React.useState(false);
  const [placement, setPlacement] = React.useState<SelectPopupPlacement | null>(null);
  const [activeIdentity, setActiveIdentity] = React.useState<string | null>(null);
  const activeOption = visibleOptions.find(
    (option) => option.identity === activeIdentity && !option.disabled
  );
  const shouldReduceMotion = useReducedMotion();
  const rootRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const listboxRef = React.useRef<HTMLDivElement>(null);
  const nativeSelectRef = React.useRef<HTMLSelectElement | null>(null);
  const nativeFocusRef = React.useRef<{
    node: HTMLSelectElement;
    focus: HTMLSelectElement["focus"];
  } | null>(null);
  const nativeValueCleanupRef = React.useRef<(() => void) | null>(null);
  const optionsRef = React.useRef(options);
  optionsRef.current = options;
  const preferredDefaultValueRef = React.useRef(preferredDefaultValue);
  preferredDefaultValueRef.current = preferredDefaultValue;
  const optionRefs = React.useRef(new Map<string, HTMLDivElement>());

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
          const getValue = valueDescriptor.get.bind(node);
          const setValue = valueDescriptor.set.bind(node);
          Object.defineProperty(node, "value", {
            configurable: true,
            enumerable: valueDescriptor.enumerable,
            get: getValue,
            set: (nextValue: string) => {
              setValue(nextValue);
              if (!isControlledRef.current) {
                const actualValue = String(getValue());
                setUncontrolledValue(
                  reconcileSelectedValue(
                    actualValue,
                    optionsRef.current,
                    preferredDefaultValueRef.current
                  )
                );
              }
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

  const enabledOptions = React.useMemo(
    () => visibleOptions.filter((option) => !option.disabled),
    [visibleOptions]
  );

  const setInitialActiveOption = React.useCallback(() => {
    setActiveIdentity(reconcileActiveIdentity(null, selectedValue, options));
  }, [options, selectedValue]);

  React.useEffect(() => setPortalReady(true), []);

  const measurePlacement = React.useCallback((contentHeight?: number) => {
    const trigger = triggerRef.current;
    if (!trigger || typeof window === "undefined") return;
    const anchor = trigger.getBoundingClientRect();
    const listbox = listboxRef.current;
    const visualViewport = window.visualViewport;
    const measuredContentHeight = contentHeight
      ?? (listbox ? listbox.scrollHeight + Math.max(0, listbox.offsetHeight - listbox.clientHeight) : 288);
    const nextPlacement = placeSelectPopup({
      anchor: {
        top: anchor.top,
        bottom: anchor.bottom,
        left: anchor.left,
        width: anchor.width
      },
      viewport: {
        top: visualViewport?.offsetTop ?? 0,
        left: visualViewport?.offsetLeft ?? 0,
        width: visualViewport?.width ?? window.innerWidth,
        height: visualViewport?.height ?? window.innerHeight
      },
      contentHeight: measuredContentHeight
    });
    setPlacement((current) => samePlacement(current, nextPlacement) ? current : nextPlacement);
  }, []);

  const openPopup = React.useCallback(() => {
    measurePlacement(288);
    setOpen(true);
  }, [measurePlacement]);

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
    (option: CollectedSelectOption) => {
      if (disabled || option.disabled || option.hidden) return;
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
      if (enabledOptions.length === 0) {
        setActiveIdentity(null);
        return;
      }
      const currentEnabledIndex = enabledOptions.findIndex(
        (option) => option.identity === activeIdentity
      );
      const normalizedCurrent = currentEnabledIndex >= 0
        ? currentEnabledIndex
        : key === "ArrowUp" ? 0 : -1;
      const nextEnabledIndex = moveSelection(normalizedCurrent, enabledOptions.length, key);
      setActiveIdentity(enabledOptions[nextEnabledIndex]?.identity ?? null);
    },
    [activeIdentity, enabledOptions]
  );

  const handleTriggerKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    const key = event.key;
    if (key === "Escape") {
      if (open) {
        event.preventDefault();
        event.stopPropagation();
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
        openPopup();
      } else if (activeOption) {
        chooseOption(activeOption);
      }
      return;
    }
    if (key === "ArrowDown" || key === "ArrowUp" || key === "Home" || key === "End") {
      event.preventDefault();
      if (!open) {
        openPopup();
        const initialIdentity = reconcileActiveIdentity(null, selectedValue, options);
        const currentEnabledIndex = enabledOptions.findIndex(
          (option) => option.identity === initialIdentity
        );
        const normalizedCurrent = currentEnabledIndex >= 0
          ? currentEnabledIndex
          : key === "ArrowUp" ? 0 : -1;
        const nextEnabledIndex = moveSelection(normalizedCurrent, enabledOptions.length, key);
        setActiveIdentity(enabledOptions[nextEnabledIndex]?.identity ?? null);
      } else {
        moveActiveOption(key);
      }
    }
  };

  const handleTriggerBlur = (event: React.FocusEvent<HTMLButtonElement>) => {
    const relatedTarget = event.relatedTarget as Node | null;
    if (
      rootRef.current?.contains(relatedTarget)
      || listboxRef.current?.contains(relatedTarget)
    ) return;
    setOpen(false);
    nativeSelectRef.current?.dispatchEvent(
      new FocusEvent("focusout", { bubbles: true, relatedTarget: event.relatedTarget })
    );
  };

  React.useEffect(() => {
    if (!open) return;
    const handleOutsidePointer = (event: PointerEvent) => {
      if (
        !rootRef.current?.contains(event.target as Node)
        && !listboxRef.current?.contains(event.target as Node)
      ) setOpen(false);
    };
    document.addEventListener("pointerdown", handleOutsidePointer, true);
    return () => document.removeEventListener("pointerdown", handleOutsidePointer, true);
  }, [open]);

  useBrowserLayoutEffect(() => {
    if (!open) return;
    measurePlacement();
    let placementFrame: number | null = null;
    const schedulePlacement = () => {
      if (placementFrame !== null) return;
      placementFrame = window.requestAnimationFrame(() => {
        placementFrame = null;
        measurePlacement();
      });
    };

    window.addEventListener("resize", schedulePlacement);
    window.addEventListener("scroll", schedulePlacement, true);
    window.visualViewport?.addEventListener("resize", schedulePlacement);
    window.visualViewport?.addEventListener("scroll", schedulePlacement);
    const observer = typeof ResizeObserver === "undefined"
      ? null
      : new ResizeObserver(schedulePlacement);
    if (triggerRef.current) observer?.observe(triggerRef.current);
    if (listboxRef.current) observer?.observe(listboxRef.current);

    return () => {
      if (placementFrame !== null) window.cancelAnimationFrame(placementFrame);
      window.removeEventListener("resize", schedulePlacement);
      window.removeEventListener("scroll", schedulePlacement, true);
      window.visualViewport?.removeEventListener("resize", schedulePlacement);
      window.visualViewport?.removeEventListener("scroll", schedulePlacement);
      observer?.disconnect();
    };
  }, [measurePlacement, open, optionSignature]);

  React.useEffect(() => {
    if (isControlled) return;
    setUncontrolledValue((currentValue) =>
      reconcileSelectedValue(currentValue, options, preferredDefaultValue)
    );
  }, [isControlled, optionSignature, options, preferredDefaultValue]);

  React.useEffect(() => {
    if (!open) return;
    setActiveIdentity((currentIdentity) =>
      reconcileActiveIdentity(currentIdentity, selectedValue, options)
    );
  }, [open, optionSignature, options, selectedValue]);

  React.useEffect(() => {
    if (!open || !activeOption) return;
    optionRefs.current.get(activeOption.identity)?.scrollIntoView({ block: "nearest" });
  }, [activeOption, open]);

  React.useEffect(() => {
    const nativeSelect = nativeSelectRef.current;
    const form = nativeSelect?.form;
    if (!form) return;
    const handleReset = () => {
      window.setTimeout(
        () => {
          if (isControlledRef.current) {
            nativeSelect.value = selectedValueRef.current;
            return;
          }
          setUncontrolledValue(
            resolveInitialValue(preferredDefaultValueRef.current, optionsRef.current)
          );
        },
        0
      );
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
        aria-activedescendant={open && activeOption ? `${listboxId}-option-${activeOption.domIdPart}` : undefined}
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
          if (open) {
            setOpen(false);
            return;
          }
          setInitialActiveOption();
          openPopup();
        }}
        onKeyDown={handleTriggerKeyDown}
        onBlur={handleTriggerBlur}
        className={cn(
          "flex h-11 w-full items-center justify-between gap-3 rounded-xl border border-input bg-card/80 px-3 py-2 text-left text-sm text-foreground shadow-sm backdrop-blur-sm motion-safe:transition-[border-color,box-shadow,transform] motion-safe:[transition-duration:var(--motion-fast)] focus-visible:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          open && "border-primary/40 ring-2 ring-ring",
          className
        )}
      >
        <span className={cn("min-w-0 flex-1 truncate", !selectedOption && "text-muted-foreground")}>
          {selectedOption?.label ?? "Select an option"}
        </span>
        <ChevronDown
          aria-hidden="true"
          className={cn("size-4 shrink-0 text-muted-foreground motion-safe:transition-transform motion-safe:[transition-duration:var(--motion-fast)]", open && "rotate-180")}
        />
      </button>

      <select
        {...nativeProps}
        ref={setNativeSelectRef}
        id={nativeId}
        value={selectedValue}
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
        {options.map((option) => (
          <option
            key={option.identity}
            value={option.value}
            disabled={option.disabled}
            hidden={option.hidden}
          >
            {option.nativeLabel}
          </option>
        ))}
      </select>
      {!portalReady ? null : createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              ref={listboxRef}
              id={listboxId}
              role="listbox"
              aria-labelledby={ariaLabelledBy ?? triggerId}
              initial={shouldReduceMotion
                ? { opacity: 1 }
                : { opacity: 0, scale: 0.98, y: placement?.side === "above" ? 4 : -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={shouldReduceMotion
                ? { opacity: 1 }
                : { opacity: 0, scale: 0.98, y: placement?.side === "above" ? 4 : -4 }}
              transition={{ duration: shouldReduceMotion ? 0 : motionTokens.standard, ease: motionTokens.ease }}
              style={{
                top: placement?.top ?? 0,
                left: placement?.left ?? 0,
                width: placement?.width ?? 0,
                maxHeight: placement?.maxHeight ?? 0,
                visibility: placement ? "visible" : "hidden",
                transformOrigin: placement?.side === "above" ? "bottom" : "top"
              }}
              className="fixed z-[70] max-h-72 overflow-y-auto overscroll-contain rounded-xl border border-border bg-popover/95 p-1.5 text-popover-foreground shadow-xl backdrop-blur-xl"
            >
              {visibleOptions.map((option) => {
                const selected = option.identity === selectedOption?.identity;
                const active = option.identity === activeOption?.identity;
                return (
                  <motion.div
                    ref={(node) => {
                      if (node) optionRefs.current.set(option.identity, node);
                      else optionRefs.current.delete(option.identity);
                    }}
                    id={`${listboxId}-option-${option.domIdPart}`}
                    key={option.identity}
                    role="option"
                    aria-selected={selected}
                    aria-disabled={option.disabled || undefined}
                    data-active={active || undefined}
                    onPointerMove={() => {
                      if (!option.disabled) setActiveIdentity(option.identity);
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
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
});

Select.displayName = "Select";

export function SelectItem({ value, children, disabled, ...props }: SelectItemProps) {
  return <option {...props} value={value} disabled={disabled}>{children}</option>;
}

export { Select };
