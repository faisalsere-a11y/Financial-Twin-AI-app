"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";
import { useState } from "react";
import { CommandPalette } from "@/components/layout/command-palette";
import { MotionProvider } from "@/components/motion/motion-provider";
import { ThemedToaster } from "@/components/ui/themed-toaster";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [paletteOpen, setPaletteOpen] = useState(false);
  const staticSession = process.env.NEXT_PUBLIC_GITHUB_PAGES === "true" ? null : undefined;

  return (
    <MotionProvider>
      <SessionProvider session={staticSession}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <div aria-hidden={paletteOpen || undefined} inert={paletteOpen || undefined}>{children}</div>
            <CommandPalette onOpenChange={setPaletteOpen} />
            <ThemedToaster />
          </ThemeProvider>
        </QueryClientProvider>
      </SessionProvider>
    </MotionProvider>
  );
}
