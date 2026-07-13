import * as React from "react";
import { describe, expect, it } from "vitest";
import { collectSelectOptions } from "../lib/ui/select-options";
import {
  reconcileActiveIdentity,
  reconcileSelectedValue,
  resolveInitialValue,
  type SelectStateOption
} from "../lib/ui/select-state";

const option = (
  identity: string,
  value: string,
  disabled = false,
  hidden = false
): SelectStateOption => ({ identity, value, disabled, hidden });

describe("select state hardening", () => {
  it("preserves an explicit empty default value", () => {
    const options = [option("paid", "paid"), option("empty", "", false, true)];

    expect(resolveInitialValue("", options)).toBe("");
    expect(resolveInitialValue(undefined, options)).toBe("paid");
  });

  it("reconciles a removed uncontrolled value deterministically", () => {
    const options = [option("one", "one"), option("preferred", "preferred")];

    expect(reconcileSelectedValue("removed", options, "preferred")).toBe("preferred");
    expect(reconcileSelectedValue("removed", options, "also-removed")).toBe("one");
    expect(reconcileSelectedValue("removed", [], "preferred")).toBe("");
  });

  it("preserves a selected value across option reorder", () => {
    const reordered = [option("third", "third"), option("first", "first")];

    expect(reconcileSelectedValue("first", reordered)).toBe("first");
  });

  it("keeps active identity stable across reorder", () => {
    const reordered = [option("third", "third"), option("first", "first")];

    expect(reconcileActiveIdentity("first", "third", reordered)).toBe("first");
  });

  it("reconciles removed or disabled active options to an enabled option", () => {
    const options = [
      option("disabled", "disabled", true),
      option("selected", "selected"),
      option("fallback", "fallback")
    ];

    expect(reconcileActiveIdentity("removed", "selected", options)).toBe("selected");
    expect(reconcileActiveIdentity("disabled", "disabled", options)).toBe("selected");
    expect(reconcileActiveIdentity("disabled", "missing", options)).toBe("selected");
    expect(reconcileActiveIdentity("disabled", "missing", [option("only", "only", true)])).toBeNull();
  });

  it("never makes a hidden selected option active", () => {
    const options = [
      option("placeholder", "", false, true),
      option("ready", "ready")
    ];

    expect(reconcileActiveIdentity("placeholder", "", options)).toBe("ready");
  });
});

describe("select option collection", () => {
  it("collects options through fragments, optgroups, and intrinsic wrappers", () => {
    const children = React.createElement(
      React.Fragment,
      null,
      React.createElement(
        "div",
        null,
        React.createElement(
          "optgroup",
          { label: "Unavailable", disabled: true },
          React.createElement("option", { key: "empty", value: "", label: "Empty choice" })
        )
      ),
      React.createElement("option", { key: "ready", value: "ready" }, "Ready")
    );

    const options = collectSelectOptions(children);

    expect(options.map(({ value, nativeLabel, disabled }) => ({ value, nativeLabel, disabled }))).toEqual([
      { value: "", nativeLabel: "Empty choice", disabled: true },
      { value: "ready", nativeLabel: "Ready", disabled: false }
    ]);
  });

  it("uses label when visible children are absent and text when value is omitted", () => {
    const options = collectSelectOptions([
      React.createElement("option", { key: "label", value: "labeled", label: "Label fallback" }),
      React.createElement("option", { key: "text" }, "Text value"),
      React.createElement("option", { key: "bare", value: "bare" })
    ]);

    expect(options.map(({ value, nativeLabel }) => ({ value, nativeLabel }))).toEqual([
      { value: "labeled", nativeLabel: "Label fallback" },
      { value: "Text value", nativeLabel: "Text value" },
      { value: "bare", nativeLabel: "bare" }
    ]);
  });

  it("keeps native and custom labels equal when children and label are both present", () => {
    const [option] = collectSelectOptions(
      React.createElement(
        "option",
        { value: "both", label: "Attribute label" },
        "Visible children"
      )
    );

    expect(option?.label).toBe("Visible children");
    expect(option?.nativeLabel).toBe("Visible children");
  });

  it("canonicalizes duplicate values by keeping only the first supported option", () => {
    const first = React.createElement("option", { key: "first", value: "same" }, "First");
    const second = React.createElement("option", { key: "second", value: "same" }, "Second");

    const before = collectSelectOptions([first, second]);
    const after = collectSelectOptions([second, first]);

    expect(before).toHaveLength(1);
    expect(after).toHaveLength(1);
    expect(before[0]?.nativeLabel).toBe("First");
    expect(after[0]?.nativeLabel).toBe("Second");
    expect(after[0]?.identity).toBe(before[0]?.identity);
  });

  it("retains hidden native options in canonical data", () => {
    const options = collectSelectOptions([
      React.createElement("option", { key: "placeholder", value: "", hidden: true }, "Choose one"),
      React.createElement("option", { key: "ready", value: "ready" }, "Ready")
    ]);

    expect(options.map(({ value, hidden }) => ({ value, hidden }))).toEqual([
      { value: "", hidden: true },
      { value: "ready", hidden: false }
    ]);
  });

  it("omits opaque option factories so native and custom collections share a boundary", () => {
    function OpaqueOptions() {
      return React.createElement("option", { value: "hidden" }, "Hidden");
    }

    expect(collectSelectOptions(React.createElement(OpaqueOptions))).toEqual([]);
  });
});
