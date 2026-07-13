"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from "react";
import { motion, useReducedMotion } from "framer-motion";
import { NovaOrb } from "@/components/brand/nova-orb";
import { Button } from "@/components/ui/button";

type NovaChatModule = typeof import("./nova-chat");
type NovaChatComponent = NovaChatModule["NovaChat"];

type IdleWindow = Window & {
  requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
  cancelIdleCallback?: (handle: number) => void;
};

type NovaChatCoordinatorValue = {
  paletteOpen: boolean;
  novaOpen: boolean;
  onNovaOpenChange: (open: boolean) => void;
};

type NovaChatCoordinatorProps = NovaChatCoordinatorValue & {
  children: ReactNode;
};

const NovaChatContext = createContext<NovaChatCoordinatorValue | null>(null);
let panelModulePromise: Promise<NovaChatModule> | null = null;

function loadNovaChat() {
  panelModulePromise ??= import("./nova-chat");
  return panelModulePromise;
}

function clearFailedPanelModule() {
  panelModulePromise = null;
}

export function NovaChatCoordinator({
  children,
  paletteOpen,
  novaOpen,
  onNovaOpenChange
}: NovaChatCoordinatorProps) {
  const value = useMemo(
    () => ({ paletteOpen, novaOpen, onNovaOpenChange }),
    [novaOpen, onNovaOpenChange, paletteOpen]
  );
  return <NovaChatContext.Provider value={value}>{children}</NovaChatContext.Provider>;
}

export function useNovaChatCoordinator() {
  const value = useContext(NovaChatContext);
  if (!value) throw new Error("NovaChatLauncher must be rendered inside NovaChatCoordinator.");
  return value;
}

export function NovaChatLauncher({ disabled = false }: { disabled?: boolean }) {
  const { paletteOpen, novaOpen, onNovaOpenChange } = useNovaChatCoordinator();
  const shouldReduceMotion = useReducedMotion();
  const [hasInteracted, setHasInteracted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [ChatPanel, setChatPanel] = useState<NovaChatComponent | null>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const restoreFocusFrameRef = useRef<number | null>(null);
  const requestGenerationRef = useRef(0);
  const mountedRef = useRef(true);
  const paletteOpenRef = useRef(paletteOpen);
  const novaOpenRef = useRef(novaOpen);
  paletteOpenRef.current = paletteOpen;
  novaOpenRef.current = novaOpen;
  const unavailable = disabled || paletteOpen || novaOpen;

  const cancelFocusRestore = useCallback(() => {
    if (restoreFocusFrameRef.current === null) return;
    cancelAnimationFrame(restoreFocusFrameRef.current);
    restoreFocusFrameRef.current = null;
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      requestGenerationRef.current += 1;
      cancelFocusRestore();
      if (novaOpenRef.current) onNovaOpenChange(false);
    };
  }, [cancelFocusRestore, onNovaOpenChange]);

  useEffect(() => {
    const idleWindow = window as IdleWindow;
    let idleHandle: number | null = null;
    let fallbackTimer: ReturnType<typeof setTimeout> | null = null;
    const prefetch = () => {
      idleHandle = null;
      fallbackTimer = null;
      void loadNovaChat().catch(clearFailedPanelModule);
    };

    if (idleWindow.requestIdleCallback) {
      idleHandle = idleWindow.requestIdleCallback(prefetch, { timeout: 1_800 });
    } else {
      fallbackTimer = setTimeout(prefetch, 1_200);
    }

    return () => {
      if (idleHandle !== null) idleWindow.cancelIdleCallback?.(idleHandle);
      if (fallbackTimer !== null) clearTimeout(fallbackTimer);
    };
  }, []);

  const closePanel = useCallback((restoreTarget: HTMLElement | null) => {
    requestGenerationRef.current += 1;
    setOpen(false);
    onNovaOpenChange(false);
    cancelFocusRestore();
    restoreFocusFrameRef.current = requestAnimationFrame(() => {
      restoreFocusFrameRef.current = null;
      const target = launcherRef.current ?? restoreTarget;
      if (target?.isConnected) target.focus({ preventScroll: true });
    });
  }, [cancelFocusRestore, onNovaOpenChange]);

  const openPanel = useCallback(async () => {
    if (disabled || paletteOpenRef.current || novaOpen || open || loading) return;
    cancelFocusRestore();
    setHasInteracted(true);
    setLoading(true);
    const requestGeneration = requestGenerationRef.current + 1;
    requestGenerationRef.current = requestGeneration;

    try {
      const panelModule = await loadNovaChat();
      if (
        !mountedRef.current
        || requestGenerationRef.current !== requestGeneration
        || paletteOpenRef.current
      ) return;

      setChatPanel(() => panelModule.NovaChat);
      onNovaOpenChange(true);
      setOpen(true);
    } catch {
      clearFailedPanelModule();
    } finally {
      if (mountedRef.current && requestGenerationRef.current === requestGeneration) {
        setLoading(false);
      }
    }
  }, [cancelFocusRestore, disabled, loading, novaOpen, onNovaOpenChange, open]);

  return (
    <>
      <motion.div
        animate={
          !hasInteracted && !shouldReduceMotion && !unavailable
            ? { y: [0, -2, 0], scale: [1, 1.025, 1] }
            : { y: 0, scale: 1 }
        }
        transition={
          !hasInteracted && !shouldReduceMotion && !unavailable
            ? { duration: 4.4, ease: "easeInOut", repeat: Infinity }
            : { duration: 0 }
        }
      >
        <Button
          ref={launcherRef}
          type="button"
          variant="default"
          size="icon"
          disabled={unavailable || loading}
          aria-label="Open Nova chat"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-busy={loading || undefined}
          onClick={() => { void openPanel(); }}
          className="size-12 rounded-full shadow-glow"
        >
          <NovaOrb className="size-7" />
        </Button>
      </motion.div>

      {open && ChatPanel && (
        <ChatPanel onClose={closePanel} returnFocusRef={launcherRef} />
      )}
    </>
  );
}
