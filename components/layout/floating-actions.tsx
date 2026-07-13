"use client";

import { Command } from "lucide-react";
import { NovaChatLauncher, useNovaChatCoordinator } from "@/components/nova/nova-chat-launcher";
import { Button } from "@/components/ui/button";
import { openCommandPalette } from "@/lib/ui/commands";

export function FloatingActions({ unavailable = false }: { unavailable?: boolean }) {
  const { novaOpen, paletteOpen } = useNovaChatCoordinator();
  const railInert = unavailable || novaOpen || paletteOpen;

  return (
    <div
      aria-label="Quick actions"
      aria-hidden={railInert || undefined}
      inert={railInert || undefined}
      className="floating-action-rail app-print-hide fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] z-40 flex max-w-[calc(100vw-2rem)] items-center justify-end gap-2"
    >
      <Button
        type="button"
        variant="glass"
        disabled={unavailable || novaOpen || paletteOpen}
        onClick={() => openCommandPalette()}
        aria-label="Open command palette"
        className="h-12 rounded-full px-3 shadow-glass sm:px-4"
      >
        <Command className="size-4" aria-hidden="true" />
        <span className="hidden text-xs sm:inline">
          <span className="font-black">Ctrl K</span> command
        </span>
      </Button>
      <NovaChatLauncher disabled={unavailable} />
    </div>
  );
}
