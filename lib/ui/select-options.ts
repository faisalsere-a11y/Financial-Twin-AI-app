import * as React from "react";
import type { SelectStateOption } from "@/lib/ui/select-state";

export type CollectedSelectOption = SelectStateOption & {
  domIdPart: string;
  hidden: boolean;
  label: React.ReactNode;
  nativeLabel: string;
};

type CandidateProps = {
  children?: React.ReactNode;
  disabled?: boolean;
  hidden?: boolean;
  label?: React.ReactNode;
  value?: unknown;
};

function reactNodeText(node: React.ReactNode): string {
  let text = "";
  React.Children.forEach(node, (child) => {
    if (typeof child === "string" || typeof child === "number" || typeof child === "bigint") {
      text += String(child);
    } else if (React.isValidElement(child)) {
      text += reactNodeText((child.props as { children?: React.ReactNode }).children);
    }
  });
  return text;
}

function identityToDomId(identity: string): string {
  return `o-${Array.from(identity, (character) => character.codePointAt(0)?.toString(36) ?? "0").join("-")}`;
}

export function collectSelectOptions(children: React.ReactNode): CollectedSelectOption[] {
  const options: CollectedSelectOption[] = [];
  const seenValues = new Set<string>();

  const visit = (nodes: React.ReactNode, inheritedDisabled = false) => {
    React.Children.forEach(nodes, (child) => {
      if (!React.isValidElement(child)) return;
      const props = child.props as CandidateProps;
      const isNativeOption = child.type === "option";
      const isValueOptionComponent = typeof child.type !== "string"
        && child.type !== React.Fragment
        && props.value !== undefined;

      if (isNativeOption || isValueOptionComponent) {
        const fallbackValue = props.value === undefined ? "" : String(props.value);
        const label = props.children ?? props.label ?? fallbackValue;
        const nativeLabel = reactNodeText(label);
        const value = props.value === undefined ? nativeLabel : String(props.value);
        if (seenValues.has(value)) return;
        seenValues.add(value);
        const identity = `value:${value}`;
        options.push({
          identity,
          domIdPart: identityToDomId(identity),
          value,
          label,
          nativeLabel,
          disabled: inheritedDisabled || Boolean(props.disabled),
          hidden: Boolean(props.hidden)
        });
        return;
      }

      if (child.type === React.Fragment || typeof child.type === "string") {
        const groupDisabled = inheritedDisabled
          || (child.type === "optgroup" && Boolean(props.disabled));
        visit(props.children, groupDisabled);
      }
    });
  };

  visit(children);
  return options;
}

export function selectOptionSignature(options: readonly CollectedSelectOption[]): string {
  return JSON.stringify(
    options.map((option) => [
      option.identity,
      option.value,
      option.disabled,
      option.hidden,
      option.nativeLabel
    ])
  );
}
