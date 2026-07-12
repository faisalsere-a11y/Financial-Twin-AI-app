import { describe, expect, it, vi } from "vitest";
import {
  COMMAND_PALETTE_EVENT,
  commands,
  filterCommands,
  openCommandPalette
} from "../lib/ui/commands";

describe("command palette contract", () => {
  it("finds commands by label and hint", () => {
    expect(filterCommands("monte carlo").map((item) => item.href)).toEqual(["/investments"]);
    expect(filterCommands("twin overview").map((item) => item.href)).toEqual(["/dashboard"]);
  });

  it("keeps every destination unique", () => {
    expect(new Set(commands.map((item) => item.href)).size).toBe(commands.length);
  });

  it("dispatches the shared open event", () => {
    const dispatchEvent = vi.fn();
    openCommandPalette({ dispatchEvent } as unknown as Window);

    expect(dispatchEvent.mock.calls[0]?.[0]).toBeInstanceOf(Event);
    expect(dispatchEvent.mock.calls[0]?.[0].type).toBe(COMMAND_PALETTE_EVENT);
  });
});
