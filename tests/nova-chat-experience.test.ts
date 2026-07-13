import { readFileSync } from "node:fs";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { NovaMarkdown } from "../components/nova/nova-markdown";

function source(path: string) {
  return readFileSync(path, "utf8");
}

const approvedSuggestions = [
  "How much did I spend this month?",
  "Analyze my investments.",
  "How can I reach my savings goal?",
  "What's my biggest expense category?",
  "Summarize my financial health."
] as const;

describe("Nova chat experience", () => {
  it("renders only the approved markdown subset and escapes raw HTML", () => {
    const markup = renderToStaticMarkup(
      React.createElement(NovaMarkdown, {
        markdown: [
          'Hello <script>alert("x")</script> & **strong** with `inline`.',
          "",
          "- First <img src=x onerror=alert(1)>",
          "- Second **item**",
          "",
          "```ts",
          'const value = "<unsafe>";',
          "```"
        ].join("\n")
      })
    );

    expect(markup).toContain("<strong>strong</strong>");
    expect(markup).toContain("<code>inline</code>");
    expect(markup).toContain("<ul");
    expect(markup).toContain("<pre");
    expect(markup).toContain("&lt;script&gt;");
    expect(markup).toContain("&lt;img src=x onerror=alert(1)&gt;");
    expect(markup).not.toContain("<script>");
    expect(markup).not.toContain("<img ");
  });

  it("keeps unmatched markdown markers as safe readable text", () => {
    const markup = renderToStaticMarkup(
      React.createElement(NovaMarkdown, {
        markdown: "An **unfinished marker and `inline marker\n\n```js\nconst unfinished = true;"
      })
    );

    expect(markup).toContain("**unfinished marker");
    expect(markup).toContain("`inline marker");
    expect(markup).toContain("const unfinished = true;");
  });

  it("never uses a raw-HTML rendering escape hatch", () => {
    const markdown = source("components/nova/nova-markdown.tsx");
    const chat = source("components/nova/nova-chat.tsx");

    expect(markdown).toContain("fenced");
    expect(markdown).not.toContain("dangerouslySetInnerHTML");
    expect(chat).not.toContain("dangerouslySetInnerHTML");
  });

  it("uses the exact profile-revision context and deterministic Nova engine", () => {
    const chat = source("components/nova/nova-chat.tsx");

    expect(chat).toContain("createNovaResponse");
    expect(chat).toContain('`${subject}:${savedAt ?? "sample"}`');
    expect(chat).toContain("calculateFinancialTwin(profile)");
    expect(chat).toContain("contextKey");
  });

  it("models typed messages, timestamps, evidence, and future-only rich fields", () => {
    const chat = source("components/nova/nova-chat.tsx");

    expect(chat).toContain('role: "user" | "assistant"');
    expect(chat).toContain("createdAt: string");
    expect(chat).toContain("evidence:");
    expect(chat).toContain("attachment?:");
    expect(chat).toContain("embeddedChart?:");
    expect(chat).toContain("<time");
    expect(chat).not.toMatch(/upload|microphone|voice|memory|streaming/i);
  });

  it("offers exactly the five approved suggestions through the shared submit path", () => {
    const chat = source("components/nova/nova-chat.tsx");

    approvedSuggestions.forEach((suggestion) => expect(chat).toContain(suggestion));
    expect(chat).toContain("submitMessage(suggestion)");
    expect(chat).toContain("submitMessage(followUp)");
    expect(chat).toContain("submitMessage(draft)");
  });

  it("provides a portaled labeled modal with safe close and focus behavior", () => {
    const chat = source("components/nova/nova-chat.tsx");

    expect(chat).toContain("createPortal");
    expect(chat).toContain('role="dialog"');
    expect(chat).toContain('aria-modal="true"');
    expect(chat).toContain("aria-labelledby=");
    expect(chat).toContain("previousFocus");
    expect(chat).toContain("focusableSelector");
    expect(chat).toContain("event.shiftKey");
    expect(chat).toContain('event.key === "Escape"');
    expect(chat).toContain("if (event.isComposing) return");
    expect(chat).toContain("requestAnimationFrame");
    expect(chat).toContain("event.target === event.currentTarget");
    expect(chat).toContain('aria-label="Close Nova chat"');
  });

  it("preserves one-shot initial focus through profile initialization without stealing later focus", () => {
    const chat = source("components/nova/nova-chat.tsx");
    const cancelPendingStart = chat.indexOf("const cancelPendingWork");
    const cancelInitialFocusStart = chat.indexOf("const cancelInitialFocus", cancelPendingStart);
    const cancelPendingSource = chat.slice(cancelPendingStart, cancelInitialFocusStart);
    const closeStart = chat.indexOf("const handleClose");
    const closeEnd = chat.indexOf("useLayoutEffect", closeStart);
    const closeSource = chat.slice(closeStart, closeEnd);
    const initialFocusEffectStart = chat.indexOf("if (!isLoaded || !initialFocusPendingRef.current) return;");
    const initialFocusEffectEnd = chat.indexOf("useEffect(() =>", initialFocusEffectStart);
    const initialFocusEffectSource = chat.slice(initialFocusEffectStart, initialFocusEffectEnd);

    expect(chat).toContain("initialFocusPendingRef");
    expect(chat).toContain("initialFocusFrameRef");
    expect(cancelPendingSource).not.toContain("initialFocusFrameRef");
    expect(closeSource).toContain("cancelInitialFocus();");
    expect(closeSource.indexOf("cancelInitialFocus();")).toBeLessThan(closeSource.indexOf("onClose("));
    expect(chat).toContain("dialogRef.current?.focus({ preventScroll: true });");
    expect(initialFocusEffectSource).toContain("dialog.contains(document.activeElement)");
    expect(initialFocusEffectSource).toContain("document.activeElement !== dialog");
    expect(initialFocusEffectSource).toContain("if (!initialFocusPendingRef.current || closingRef.current) return;");
    expect(initialFocusEffectSource).toContain("activeDialog.contains(document.activeElement)");
    expect(initialFocusEffectSource).toContain("document.activeElement !== activeDialog");
    expect(initialFocusEffectSource).toContain("composer.focus({ preventScroll: true });");
    expect(initialFocusEffectSource).toContain("initialFocusPendingRef.current = false;");
    expect(initialFocusEffectSource).toContain("return cancelInitialFocus;");
  });

  it("preserves modal isolation and scroll-lock values without layout shift", () => {
    const chat = source("components/nova/nova-chat.tsx");
    const providers = source("app/providers.tsx");

    expect(chat).toContain("previousOverflow");
    expect(chat).toContain("previousPaddingRight");
    expect(chat).toContain("scrollbarWidth");
    expect(providers).toContain("previousAriaHidden");
    expect(providers).toContain("previousInert");
    expect(providers).toContain("useLayoutEffect");
  });

  it("clears the active conversation synchronously and cancels stale work on context change", () => {
    const chat = source("components/nova/nova-chat.tsx");

    expect(chat).toContain("useLayoutEffect");
    expect(chat).toContain("cancelPendingWork");
    expect(chat).toContain("clearTimeout");
    expect(chat).toContain("cancelAnimationFrame");
    expect(chat).toContain("generationRef");
    expect(chat).toContain("setMessages([])");
    expect(chat).toContain("setPending(false)");
    expect(chat).toContain("const visiblePending = contextChanged ? false : pending");
    expect(chat).toContain("[cancelPendingWork, contextKey]");
  });

  it("stages one response at a time and removes delay and travel for reduced motion", () => {
    const chat = source("components/nova/nova-chat.tsx");

    expect(chat).toContain("useReducedMotion");
    expect(chat).toContain("shouldReduceMotion ? 0");
    expect(chat).toContain("pendingRef.current");
    expect(chat).toContain('aria-label="Nova is typing"');
    expect(chat).toContain('aria-live="polite"');
    expect(chat).toContain("scrollTo");
  });

  it("keeps the composer focusable throughout staged and quick-action submissions", () => {
    const chat = source("components/nova/nova-chat.tsx");
    const composerStart = chat.indexOf("<Textarea");
    const composer = chat.slice(composerStart, chat.indexOf("/>", composerStart));

    expect(composer).toContain("readOnly={visiblePending}");
    expect(composer).not.toContain("disabled={!isLoaded || visiblePending}");
    expect(chat).toContain("focusComposer");
    expect(chat).toContain("submitMessage(suggestion);\n                      focusComposer();");
    expect(chat).toContain("submitMessage(followUp);\n                                focusComposer();");
    expect(chat).toContain("submitMessage(draft);\n            focusComposer();");
  });

  it("lazy loads and safely idle-prefetches the full panel", () => {
    const launcher = source("components/nova/nova-chat-launcher.tsx");
    const shell = source("components/layout/app-shell.tsx");

    expect(launcher).toContain('import("./nova-chat")');
    expect(launcher).toContain("requestIdleCallback");
    expect(launcher).toContain("cancelIdleCallback");
    expect(launcher).toContain("clearTimeout");
    expect(launcher).toContain("useReducedMotion");
    expect(launcher).toContain("hasInteracted");
    expect(shell).not.toContain('from "@/components/nova/nova-chat"');
  });

  it("releases Nova modal ownership when the launcher unmounts", () => {
    const launcher = source("components/nova/nova-chat-launcher.tsx");

    expect(launcher).toContain("novaOpenRef.current");
    expect(launcher).toContain("if (novaOpenRef.current) onNovaOpenChange(false)");
  });

  it("handles a rejected lazy chunk without leaving a poisoned prefetch promise", () => {
    const launcher = source("components/nova/nova-chat-launcher.tsx");

    expect(launcher).toContain("clearFailedPanelModule");
    expect(launcher).toContain("catch(clearFailedPanelModule)");
    expect(launcher).toContain("panelModulePromise = null");
  });

  it("replaces the standalone command affordance with a non-overlapping shared rail", () => {
    const rail = source("components/layout/floating-actions.tsx");
    const shell = source("components/layout/app-shell.tsx");

    expect(rail).toContain("NovaChatLauncher");
    expect(rail).toContain("openCommandPalette");
    expect(rail).toContain('aria-label="Open command palette"');
    expect(rail).toContain("floating-action-rail");
    expect(rail).toContain("app-print-hide");
    expect(shell).toContain("<FloatingActions");
    expect(shell).not.toContain("Ctrl K</span> command");
  });

  it("prevents Nova and the command palette from owning modal focus together", () => {
    const providers = source("app/providers.tsx");
    const launcher = source("components/nova/nova-chat-launcher.tsx");
    const rail = source("components/layout/floating-actions.tsx");

    expect(providers).toContain("novaOpen");
    expect(providers).toContain("paletteOpen");
    expect(providers).toContain("COMMAND_PALETTE_EVENT");
    expect(providers).toContain("stopImmediatePropagation");
    expect(providers).toContain("addEventListener");
    expect(providers).toContain("true");
    expect(providers).toContain(
      "useBrowserLayoutEffect(() => {\n    if (!novaOpen) return;\n    const blockCommandShortcut"
    );
    expect(providers).toContain("inert=");
    expect(providers).toContain("aria-hidden=");
    expect(launcher).toContain("paletteOpen");
    expect(rail).toContain("novaOpen");
  });

  it("keeps the sheet responsive, composer visible, and every Nova surface out of print", () => {
    const chat = source("components/nova/nova-chat.tsx");
    const css = source("app/globals.css");

    expect(chat).toContain("100dvh");
    expect(chat).toContain("overflow-x-hidden");
    expect(chat).toContain("nova-chat-layer");
    expect(css).toContain(".floating-action-rail");
    expect(css).toContain(".nova-chat-layer");
    expect(css).toContain("display: none !important");
  });

  it("preserves static sample session behavior without adding an auth-session request", () => {
    const providers = source("app/providers.tsx");
    const launcher = source("components/nova/nova-chat-launcher.tsx");
    const chat = source("components/nova/nova-chat.tsx");

    expect(providers).toContain('process.env.NEXT_PUBLIC_GITHUB_PAGES === "true" ? null : undefined');
    expect(`${launcher}\n${chat}`).not.toContain("/api/auth/session");
  });
});
