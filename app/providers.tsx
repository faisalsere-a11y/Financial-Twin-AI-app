"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { CommandPalette } from "@/components/layout/command-palette";
import { MotionProvider } from "@/components/motion/motion-provider";
import { NovaChatCoordinator } from "@/components/nova/nova-chat-launcher";
import { ThemedToaster } from "@/components/ui/themed-toaster";
import { COMMAND_PALETTE_EVENT } from "@/lib/ui/commands";

const useBrowserLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [novaOpen, setNovaOpen] = useState(false);
  const applicationRootRef = useRef<HTMLDivElement>(null);
  const staticSession = process.env.NEXT_PUBLIC_GITHUB_PAGES === "true" ? null : undefined;

  const onNovaOpenChange = useCallback((open: boolean) => {
    setNovaOpen(open);
  }, []);

  useBrowserLayoutEffect(() => {
    if (!novaOpen) return;
    const applicationRoot = applicationRootRef.current;
    if (!applicationRoot) return;
    const previousAriaHidden = applicationRoot.getAttribute("aria-hidden");
    const previousInert = applicationRoot.inert;

    applicationRoot.setAttribute("aria-hidden", "true");
    applicationRoot.inert = true;

    return () => {
      applicationRoot.inert = previousInert;
      if (previousAriaHidden === null) applicationRoot.removeAttribute("aria-hidden");
      else applicationRoot.setAttribute("aria-hidden", previousAriaHidden);
    };
  }, [novaOpen]);

  useBrowserLayoutEffect(() => {
    if (!novaOpen) return;
    const blockCommandShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };
    const blockCommandRequest = (event: Event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
    };

    window.addEventListener("keydown", blockCommandShortcut, true);
    window.addEventListener(COMMAND_PALETTE_EVENT, blockCommandRequest, true);
    return () => {
      window.removeEventListener("keydown", blockCommandShortcut, true);
      window.removeEventListener(COMMAND_PALETTE_EVENT, blockCommandRequest, true);
    };
  }, [novaOpen]);

  return (
    <MotionProvider>
      <SessionProvider session={staticSession}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <NovaChatCoordinator
              paletteOpen={paletteOpen}
              novaOpen={novaOpen}
              onNovaOpenChange={onNovaOpenChange}
            >
              <div
                ref={applicationRootRef}
                aria-hidden={paletteOpen || undefined}
                inert={paletteOpen || undefined}
              >
                {children}
                <ThemedToaster />
              </div>
              <CommandPalette
                onOpenChange={(open) => {
                  if (open && novaOpen) return;
                  setPaletteOpen(open);
                }}
              />
            </NovaChatCoordinator>
          </ThemeProvider>
        </QueryClientProvider>
      </SessionProvider>
    </MotionProvider>
  );
}
