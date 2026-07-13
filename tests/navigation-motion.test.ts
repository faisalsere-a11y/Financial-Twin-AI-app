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
    expect(shell).not.toContain("lg:invisible");
    expect(shell).toContain("useLayoutEffect");
    expect(shell).toContain("sidebarMotionReady");
    expect(shell).toContain(
      "duration: !sidebarMotionReady || shouldReduceMotion ? 0 : motionTokens.standard"
    );
    expect(shell).toContain("motionEnabled={sidebarMotionReady}");
    expect(shell.match(/const motionDisabled = !motionEnabled \|\| shouldReduceMotion/g)).toHaveLength(2);
    expect(shell).toContain("<Brand compact={collapsed} motionEnabled={motionEnabled} />");
    expect(shell).toContain("if (!motionEnabled) return <>{children}</>");
    expect(shell.match(/<SidebarPresence motionEnabled={motionEnabled}/g)).toHaveLength(4);
    expect(shell).toContain(
      "transition={{ duration: motionDisabled ? 0 : motionTokens.standard, ease: motionTokens.ease }}"
    );
    expect(shell).toMatch(
      /setSidebarCollapsed\(preference\.collapsed\);[\s\S]*requestAnimationFrame\(\(\) => setSidebarMotionReady\(true\)\)/
    );
    expect(shell).toContain("sidebarPreferenceReadableRef");
  });

  it("keeps navigation reachable in a short desktop viewport", () => {
    expect(shell).toContain(
      '"flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto overscroll-contain py-6"'
    );
    expect(shell).toContain("h-[78px] shrink-0");
    expect(shell).toContain("flex shrink-0 items-center border-t");
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

  it("keeps the product theme toggle stable through hydration", () => {
    expect(shell).toContain("const [mounted, setMounted] = useState(false);");
    expect(shell).toContain("useEffect(() => setMounted(true), []);");
    expect(shell).toContain('aria-label={mounted ? `Switch to ${dark ? "light" : "dark"} theme` : "Change color theme"}');
    expect(shell).toContain("disabled={!mounted}");
    expect(shell).toContain("SunMoon");
    expect(shell).not.toContain("suppressHydrationWarning");
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
    expect(palette).not.toContain("previousFocusRef.current?.focus()");
    expect(palette).toContain("!dialogRef.current?.contains(document.activeElement)");
    expect(palette).toContain("focusRestoreFrameRef");
    expect(palette).toContain("paletteOpenRef");
    expect(palette).toContain("cancelAnimationFrame");
    expect(palette).toContain("const restoreTarget = previousFocusRef.current");
    expect(palette).toContain("if (!paletteOpenRef.current) restoreTarget?.focus()");
    expect(palette).toMatch(/const show = useCallback\(\(\) => \{\s*cancelFocusRestore\(\);/);
    expect(palette).toContain("useEffect(() => cancelFocusRestore, [cancelFocusRestore])");
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
