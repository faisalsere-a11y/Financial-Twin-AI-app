"use client";

import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type RefObject
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUp, Sparkles, X } from "lucide-react";
import { NovaOrb } from "@/components/brand/nova-orb";
import { NovaMarkdown } from "@/components/nova/nova-markdown";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { calculateFinancialTwin } from "@/lib/financial/engine";
import { useFinancialProfile } from "@/lib/profile/use-financial-profile";
import { createNovaResponse, type NovaChatResponse } from "@/lib/nova/chat";
import { motionTokens } from "@/lib/motion/variants";
import { cn } from "@/lib/utils";

const approvedSuggestions = [
  "How much did I spend this month?",
  "Analyze my investments.",
  "How can I reach my savings goal?",
  "What's my biggest expense category?",
  "Summarize my financial health."
] as const;

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "[tabindex]:not([tabindex='-1'])"
].join(",");

type NovaMessageAttachment = {
  name: string;
  mediaType: string;
  size: number;
};

type NovaEmbeddedChart = {
  kind: "bar" | "line";
  label: string;
  points: ReadonlyArray<{ label: string; value: number }>;
};

export type NovaChatMessage = {
  id: string;
  role: "user" | "assistant";
  createdAt: string;
  text: string;
  title?: string;
  evidence: NovaChatResponse["evidence"];
  followUps?: string[];
  boundary?: string;
  attachment?: NovaMessageAttachment;
  embeddedChart?: NovaEmbeddedChart;
};

type NovaChatProps = {
  onClose: (restoreTarget: HTMLElement | null) => void;
  returnFocusRef: RefObject<HTMLButtonElement | null>;
};

function displayTime(timestamp: string) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(timestamp));
}

function plainAnnouncement(message: NovaChatMessage | undefined) {
  if (!message || message.role !== "assistant") return "";
  const body = message.text
    .replace(/```[\w-]*\n?/g, " ")
    .replace(/\*\*|`/g, "")
    .replace(/^\s*[-*]\s+/gm, "")
    .replace(/\s+/g, " ")
    .trim();
  return `${message.title ?? "Nova response"}. ${body}`;
}

function assistantMessage(
  response: NovaChatResponse,
  id: string,
  createdAt: string
): NovaChatMessage {
  return {
    id,
    role: "assistant",
    createdAt,
    text: response.markdown,
    title: response.title,
    evidence: response.evidence,
    followUps: response.followUps,
    boundary: response.boundary
  };
}

export function NovaChat({ onClose, returnFocusRef }: NovaChatProps) {
  const { profile, subject, savedAt, isLoaded } = useFinancialProfile();
  const contextKey = `${subject}:${savedAt ?? "sample"}`;
  const shouldReduceMotion = useReducedMotion();
  const [messages, setMessages] = useState<NovaChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const contextKeyRef = useRef(contextKey);
  const sequenceRef = useRef(0);
  const generationRef = useRef(0);
  const pendingRef = useRef(false);
  const responseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const focusFrameRef = useRef<number | null>(null);
  const scrollFrameRef = useRef<number | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const closingRef = useRef(false);
  const contextChanged = contextKeyRef.current !== contextKey;
  const visibleMessages = useMemo(
    () => contextChanged ? [] : messages,
    [contextChanged, messages]
  );
  const visiblePending = contextChanged ? false : pending;

  const nextMessageId = useCallback((role: NovaChatMessage["role"]) => {
    sequenceRef.current += 1;
    return `${contextKeyRef.current}:${role}:${sequenceRef.current}`;
  }, []);

  const cancelPendingWork = useCallback((updateState = true) => {
    generationRef.current += 1;
    pendingRef.current = false;
    if (responseTimerRef.current !== null) {
      clearTimeout(responseTimerRef.current);
      responseTimerRef.current = null;
    }
    if (focusFrameRef.current !== null) {
      cancelAnimationFrame(focusFrameRef.current);
      focusFrameRef.current = null;
    }
    if (scrollFrameRef.current !== null) {
      cancelAnimationFrame(scrollFrameRef.current);
      scrollFrameRef.current = null;
    }
    if (updateState) setPending(false);
  }, []);

  const focusComposer = useCallback(() => {
    if (focusFrameRef.current !== null) cancelAnimationFrame(focusFrameRef.current);
    focusFrameRef.current = requestAnimationFrame(() => {
      focusFrameRef.current = null;
      composerRef.current?.focus({ preventScroll: true });
    });
  }, []);

  const handleClose = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    cancelPendingWork();
    onClose(returnFocusRef.current ?? previousFocusRef.current);
  }, [cancelPendingWork, onClose, returnFocusRef]);

  useLayoutEffect(() => {
    cancelPendingWork();
    contextKeyRef.current = contextKey;
    sequenceRef.current = 0;
    setMessages([]);
    setDraft("");
    setPending(false);
  }, [cancelPendingWork, contextKey]);

  useLayoutEffect(() => {
    closingRef.current = false;
    const previousFocus = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    previousFocusRef.current = previousFocus;

    const body = document.body;
    const previousOverflow = body.style.overflow;
    const previousPaddingRight = body.style.paddingRight;
    const scrollbarWidth = Math.max(0, window.innerWidth - document.documentElement.clientWidth);
    const bodyPaddingRight = Number.parseFloat(window.getComputedStyle(body).paddingRight) || 0;

    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) body.style.paddingRight = `${bodyPaddingRight + scrollbarWidth}px`;

    focusFrameRef.current = requestAnimationFrame(() => {
      focusFrameRef.current = null;
      dialogRef.current?.focus();
      composerRef.current?.focus({ preventScroll: true });
    });

    return () => {
      cancelPendingWork(false);
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPaddingRight;
    };
  }, [cancelPendingWork]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.isComposing) return;

      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        handleClose();
      }
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [handleClose]);

  useEffect(() => {
    if (!visibleMessages.length && !visiblePending) return;
    if (scrollFrameRef.current !== null) cancelAnimationFrame(scrollFrameRef.current);
    scrollFrameRef.current = requestAnimationFrame(() => {
      scrollFrameRef.current = null;
      const viewport = messagesRef.current;
      viewport?.scrollTo({
        top: viewport.scrollHeight,
        behavior: shouldReduceMotion ? "auto" : "smooth"
      });
    });
    return () => {
      if (scrollFrameRef.current !== null) {
        cancelAnimationFrame(scrollFrameRef.current);
        scrollFrameRef.current = null;
      }
    };
  }, [shouldReduceMotion, visibleMessages.length, visiblePending]);

  const submitMessage = useCallback((value: string) => {
    const question = value.trim();
    if (!question || pendingRef.current || !isLoaded || contextKeyRef.current !== contextKey) return;

    pendingRef.current = true;
    setPending(true);
    setDraft("");
    const requestGeneration = generationRef.current + 1;
    generationRef.current = requestGeneration;
    const userMessage: NovaChatMessage = {
      id: nextMessageId("user"),
      role: "user",
      createdAt: new Date().toISOString(),
      text: question,
      evidence: []
    };
    setMessages((current) => [...current, userMessage]);

    const response = createNovaResponse({
      message: question,
      profile,
      twin: calculateFinancialTwin(profile)
    });

    const appendResponse = () => {
      responseTimerRef.current = null;
      if (
        generationRef.current !== requestGeneration
        || contextKeyRef.current !== contextKey
        || closingRef.current
      ) return;

      setMessages((current) => [
        ...current,
        assistantMessage(response, nextMessageId("assistant"), new Date().toISOString())
      ]);
      pendingRef.current = false;
      setPending(false);
    };

    const responseDelay = shouldReduceMotion ? 0 : 360;
    if (responseDelay === 0) appendResponse();
    else responseTimerRef.current = setTimeout(appendResponse, responseDelay);
  }, [contextKey, isLoaded, nextMessageId, profile, shouldReduceMotion]);

  const latestAssistant = useMemo(
    () => [...visibleMessages].reverse().find((message) => message.role === "assistant"),
    [visibleMessages]
  );

  if (typeof document === "undefined") return null;

  return createPortal(
    <motion.div
      className="nova-chat-layer app-print-hide fixed inset-0 z-[80] flex h-[100dvh] max-h-[100dvh] w-full max-w-full items-stretch justify-center overflow-hidden bg-background/82 backdrop-blur-xl sm:items-end sm:p-4 md:items-center"
      initial={shouldReduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: shouldReduceMotion ? 0 : motionTokens.standard, ease: motionTokens.ease }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) handleClose();
      }}
    >
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="nova-chat-title"
        aria-describedby="nova-chat-description"
        tabIndex={-1}
        initial={shouldReduceMotion ? false : { opacity: 0, y: 20, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: shouldReduceMotion ? 0 : motionTokens.standard, ease: motionTokens.ease }}
        className="glass-panel-strong flex h-[100dvh] max-h-[100dvh] w-full min-w-0 flex-col overflow-hidden overflow-x-hidden bg-card sm:h-[min(44rem,calc(100dvh-2rem))] sm:max-h-[calc(100dvh-2rem)] sm:max-w-2xl sm:rounded-3xl"
        onKeyDown={(event) => {
          if (event.key !== "Tab") return;
          const focusable = Array.from(
            dialogRef.current?.querySelectorAll<HTMLElement>(focusableSelector) ?? []
          );
          const first = focusable[0];
          const last = focusable.at(-1);
          if (!first || !last) {
            event.preventDefault();
            dialogRef.current?.focus();
          } else if (event.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current)) {
            event.preventDefault();
            last.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
          }
        }}
      >
        <header className="flex shrink-0 items-center gap-3 border-b border-border bg-card/92 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-5 sm:pt-4">
          <NovaOrb className="size-10 shrink-0" />
          <div className="min-w-0 flex-1">
            <h2 id="nova-chat-title" className="font-black tracking-tight">Chat with Nova</h2>
            <p id="nova-chat-description" className="truncate text-xs text-muted-foreground">
              Answers grounded in your active financial twin
            </p>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={handleClose} aria-label="Close Nova chat">
            <X className="size-4" aria-hidden="true" />
          </Button>
        </header>

        <div
          ref={messagesRef}
          role="log"
          aria-label="Nova conversation"
          aria-live="off"
          className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain px-4 py-5 sm:px-5"
        >
          {!visibleMessages.length && !visiblePending && (
            <section aria-labelledby="nova-suggestions-title" className="mx-auto flex min-h-full max-w-xl flex-col justify-center py-6">
              <div className="mb-5 flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
                  <Sparkles className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 id="nova-suggestions-title" className="font-black">What would you like to understand?</h3>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Ask about the current model. Nova will show the evidence behind each answer.
                  </p>
                </div>
              </div>
              <div className="grid gap-2">
                {approvedSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    disabled={!isLoaded || visiblePending}
                    onClick={() => {
                      submitMessage(suggestion);
                      focusComposer();
                    }}
                    className="rounded-2xl border border-border bg-card/70 px-4 py-3 text-left text-sm font-semibold transition-colors hover:border-primary/30 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </section>
          )}

          <div className="mx-auto max-w-xl space-y-4">
            <AnimatePresence initial={false}>
              {visibleMessages.map((message) => (
                <motion.article
                  key={message.id}
                  aria-label={message.role === "assistant" ? "Nova response" : "Your message"}
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: shouldReduceMotion ? 0 : motionTokens.fast, ease: motionTokens.ease }}
                  className={cn(
                    "min-w-0 overflow-hidden rounded-2xl border px-4 py-3",
                    message.role === "user"
                      ? "ml-auto max-w-[88%] border-primary/20 bg-primary text-primary-foreground"
                      : "mr-auto w-full border-border bg-card/80"
                  )}
                >
                  {message.role === "user" ? (
                    <p className="whitespace-pre-wrap break-words text-sm leading-6">{message.text}</p>
                  ) : (
                    <div className="min-w-0">
                      <h3 className="font-black tracking-tight">{message.title}</h3>
                      <NovaMarkdown markdown={message.text} className="mt-2 break-words text-foreground" />
                      {!!message.evidence.length && (
                        <dl className="mt-4 flex flex-wrap gap-2" aria-label="Evidence used">
                          {message.evidence.map((item) => (
                            <div key={`${item.label}:${item.value}`} className="max-w-full rounded-xl border border-primary/15 bg-primary/5 px-3 py-2">
                              <dt className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{item.label}</dt>
                              <dd className="break-words text-xs font-black text-foreground">{item.value}</dd>
                              {item.detail && <dd className="mt-0.5 break-words text-[11px] text-muted-foreground">{item.detail}</dd>}
                            </div>
                          ))}
                        </dl>
                      )}
                      {message.boundary && (
                        <p className="mt-4 border-t border-border pt-3 text-[11px] leading-5 text-muted-foreground">
                          {message.boundary}
                        </p>
                      )}
                      {!!message.followUps?.length && (
                        <div className="mt-4 flex flex-wrap gap-2" aria-label="Suggested follow-up questions">
                          {message.followUps.map((followUp) => (
                            <button
                              key={followUp}
                              type="button"
                              disabled={visiblePending}
                              onClick={() => {
                                submitMessage(followUp);
                                focusComposer();
                              }}
                              className="max-w-full rounded-full border border-border bg-muted/55 px-3 py-1.5 text-left text-xs font-semibold text-foreground transition-colors hover:border-primary/30 hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                            >
                              {followUp}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  <time dateTime={message.createdAt} className={cn(
                    "mt-2 block text-[10px]",
                    message.role === "user" ? "text-primary-foreground/70" : "text-muted-foreground"
                  )}>
                    {displayTime(message.createdAt)}
                  </time>
                </motion.article>
              ))}
            </AnimatePresence>

            {visiblePending && (
              <div role="status" aria-live="polite" aria-label="Nova is typing" className="flex items-center gap-2 text-sm text-muted-foreground">
                <NovaOrb className="size-6 shrink-0" />
                <span>Typing</span>
                <span aria-hidden="true" className={cn("flex gap-1", !shouldReduceMotion && "animate-pulse")}>
                  <span>·</span><span>·</span><span>·</span>
                </span>
              </div>
            )}
          </div>
        </div>

        <span className="sr-only" aria-live="polite" aria-atomic="true">
          {plainAnnouncement(latestAssistant)}
        </span>

        <form
          className="shrink-0 border-t border-border bg-card/95 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 sm:px-5 sm:pb-4"
          onSubmit={(event) => {
            event.preventDefault();
            submitMessage(draft);
            focusComposer();
          }}
        >
          <label htmlFor="nova-chat-composer" className="sr-only">Ask Nova a question</label>
          <div className="flex min-w-0 items-end gap-2">
            <Textarea
              ref={composerRef}
              id="nova-chat-composer"
              value={draft}
              disabled={!isLoaded}
              readOnly={visiblePending}
              rows={2}
              maxLength={1_000}
              placeholder={isLoaded ? "Ask about your financial twin…" : "Refreshing your financial twin…"}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (
                  event.key === "Enter"
                  && !event.shiftKey
                  && !event.nativeEvent.isComposing
                ) {
                  event.preventDefault();
                  submitMessage(draft);
                  focusComposer();
                }
              }}
              className="min-h-[3rem] max-h-32 min-w-0 resize-none"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!draft.trim() || visiblePending || !isLoaded}
              aria-label="Send message to Nova"
              className="shrink-0"
            >
              <ArrowUp className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>,
    document.body
  );
}
