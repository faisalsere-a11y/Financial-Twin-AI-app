import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import * as navigation from "../lib/ui/navigation";

const shell = readFileSync("components/layout/app-shell.tsx", "utf8");
const palette = readFileSync("components/layout/command-palette.tsx", "utf8");

type NavigationPreferences = {
  SIDEBAR_COLLAPSED_STORAGE_KEY?: string;
  getSidebarPreferenceStorage?: (
    browser: Pick<Window, "localStorage">
  ) => Storage | null;
  readSidebarCollapsedPreference?: (storage: Pick<Storage, "getItem">) => boolean;
  readSidebarCollapsedPreferenceResult?: (
    storage: Pick<Storage, "getItem">
  ) => { collapsed: boolean; readable: boolean };
  persistSidebarCollapsedPreference?: (
    storage: Pick<Storage, "setItem">,
    collapsed: boolean
  ) => boolean;
};

const preferences = navigation as NavigationPreferences;

describe("premium navigation shell", () => {
  it("supports persisted desktop collapse and animated active state", () => {
    expect(shell).toContain("financial-twin.sidebar-collapsed.v1");
    expect(shell).toContain('aria-label="Collapse navigation"');
    expect(shell).toContain("layoutId");
    expect(shell).toContain("sidebarWidth");
    expect(shell).toContain("SIDEBAR_WIDTH_EXPANDED");
    expect(shell).toContain("SIDEBAR_WIDTH_COLLAPSED");
    expect(shell).toContain('!sidebarHydrated && "lg:invisible"');
    expect(shell).toContain("sidebarPreferenceReadableRef");
  });

  it("provides compact labels and tooltips without removing expanded text", () => {
    expect(shell).toContain('"Expand navigation"');
    expect(shell).toContain('"Collapse navigation"');
    expect(shell).toContain("title={collapsed");
    expect(shell).toContain("aria-label={collapsed");
    expect(shell).toContain('aria-controls="desktop-primary-links"');
    expect(shell).toContain('id={`${layoutScope}-primary-links`}');
    expect(shell).not.toContain('id={`${layoutScope}-primary-navigation`}');
    expect(shell).toContain("AnimatePresence");
  });

  it("animates mobile navigation without weakening modal behavior", () => {
    expect(shell).toContain("AnimatePresence");
    expect(shell).toContain('aria-modal="true"');
    expect(shell).toContain("inert=");
    expect(shell).toContain("menuButtonRef");
    expect(shell).toContain("onExitComplete");
    expect(shell).toContain("event.shiftKey");
    expect(shell).toContain("firstMobileLinkRef.current?.focus()");
  });

  it("keeps command palette presence motion and focus restoration", () => {
    expect(palette).toContain("AnimatePresence");
    expect(palette).toContain("motion.div");
    expect(palette).toContain('aria-modal="true"');
    expect(palette).toContain("previousFocusRef.current?.focus()");
    expect(palette).toContain("!dialogRef.current?.contains(document.activeElement)");
    expect(palette).toContain("onExitComplete");
    expect(palette).toContain("COMMAND_PALETTE_EVENT");
    expect(palette).toContain("event.shiftKey");
  });
});

describe("sidebar collapse preference", () => {
  it("uses a browser-scoped versioned key and parses only the true sentinel", () => {
    expect(preferences.SIDEBAR_COLLAPSED_STORAGE_KEY).toBe(
      "financial-twin.sidebar-collapsed.v1"
    );

    const read = preferences.readSidebarCollapsedPreference;
    expect(read?.({ getItem: () => "true" })).toBe(true);
    expect(read?.({ getItem: () => "false" })).toBe(false);
    expect(read?.({ getItem: () => "1" })).toBe(false);
    expect(read?.({ getItem: () => null })).toBe(false);
  });

  it("contains storage read failures", () => {
    const read = preferences.readSidebarCollapsedPreference;
    const readResult = preferences.readSidebarCollapsedPreferenceResult;
    expect(
      read?.({
        getItem: () => {
          throw new DOMException("Storage denied", "SecurityError");
        }
      })
    ).toBe(false);
    expect(
      readResult?.({
        getItem: () => {
          throw new DOMException("Storage denied", "SecurityError");
        }
      })
    ).toEqual({ collapsed: false, readable: false });
    expect(readResult?.({ getItem: () => "true" })).toEqual({
      collapsed: true,
      readable: true
    });
  });

  it("contains browser storage getter failures", () => {
    const storage = { getItem: vi.fn(), setItem: vi.fn() } as unknown as Storage;
    expect(preferences.getSidebarPreferenceStorage?.({ localStorage: storage })).toBe(storage);

    const denied = Object.create(null) as Pick<Window, "localStorage">;
    Object.defineProperty(denied, "localStorage", {
      get() {
        throw new DOMException("Storage denied", "SecurityError");
      }
    });
    expect(preferences.getSidebarPreferenceStorage?.(denied)).toBeNull();
  });

  it("persists booleans and contains storage write failures", () => {
    const setItem = vi.fn();
    const persist = preferences.persistSidebarCollapsedPreference;

    expect(persist?.({ setItem }, true)).toBe(true);
    expect(setItem).toHaveBeenLastCalledWith(
      "financial-twin.sidebar-collapsed.v1",
      "true"
    );
    expect(persist?.({ setItem }, false)).toBe(true);
    expect(setItem).toHaveBeenLastCalledWith(
      "financial-twin.sidebar-collapsed.v1",
      "false"
    );
    expect(
      persist?.(
        {
          setItem: () => {
            throw new DOMException("Storage full", "QuotaExceededError");
          }
        },
        true
      )
    ).toBe(false);
  });
});
