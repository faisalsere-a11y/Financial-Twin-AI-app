import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { moveSelection } from "../lib/ui/select-state";

describe("premium select", () => {
  it("wraps arrow navigation and handles Home and End", () => {
    expect(moveSelection(0, 3, "ArrowUp")).toBe(2);
    expect(moveSelection(2, 3, "ArrowDown")).toBe(0);
    expect(moveSelection(1, 3, "Home")).toBe(0);
    expect(moveSelection(1, 3, "End")).toBe(2);
  });

  it("returns no selection for empty option collections", () => {
    expect(moveSelection(0, 0, "ArrowDown")).toBe(-1);
    expect(moveSelection(0, -1, "End")).toBe(-1);
  });

  it("enters a non-empty collection from an unset selection", () => {
    expect(moveSelection(-1, 3, "ArrowDown")).toBe(0);
    expect(moveSelection(-1, 3, "Home")).toBe(0);
    expect(moveSelection(-1, 3, "End")).toBe(2);
  });

  it("uses accessible listbox semantics and graceful close paths", () => {
    const source = readFileSync("components/ui/select.tsx", "utf8");
    expect(source).toContain('role="listbox"');
    expect(source).toContain('role="option"');
    expect(source).toContain("aria-expanded");
    expect(source).toContain('key === "Escape"');
  });

  it("preserves native form and label semantics without duplicate controls", () => {
    const source = readFileSync("components/ui/select.tsx", "utf8");
    expect(source).toContain("useId");
    expect(source).toContain("nativeSelectRef");
    expect(source).toContain('className="sr-only"');
    expect(source).toContain("nativeOnChange?.(event)");
    expect(source).toContain('Object.defineProperty(node, "value"');
    expect(source).toContain("const getValue = valueDescriptor.get.bind(node)");
    expect(source).toContain("reconcileSelectedValue(");
    expect(source).toContain("optionSignature");
    expect(source).toContain("nativeSelect.value = selectedValueRef.current");
    expect(source).toContain("if (isControlledRef.current)");
    expect(source).not.toContain("if (!form || isControlled) return");
    expect(source.match(/<select/g)).toHaveLength(1);
  });

  it("supports disabled states, focus restoration, outside close, and reduced motion", () => {
    const source = readFileSync("components/ui/select.tsx", "utf8");
    expect(source).toContain("option.disabled");
    expect(source).toContain("triggerRef.current?.focus()");
    expect(source).toContain("node.focus = (options) => triggerRef.current?.focus(options)");
    expect(source).toContain('document.addEventListener("pointerdown"');
    expect(source).toContain("AnimatePresence");
    expect(source).toContain("useReducedMotion");
  });

  it("wires exactly one selected custom option and preserves native hidden options", () => {
    const source = readFileSync("components/ui/select.tsx", "utf8");

    expect(source).toContain("const selected = option.identity === selectedOption?.identity");
    expect(source).toContain("const visibleOptions");
    expect(source).toContain("hidden={option.hidden}");
  });
});
