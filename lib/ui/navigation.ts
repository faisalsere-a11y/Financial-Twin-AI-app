export const navItems = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: "dashboard",
    hint: "Financial command center",
    eyebrow: "Financial overview"
  },
  {
    label: "Twin",
    href: "/onboarding",
    icon: "user",
    hint: "Your financial model",
    eyebrow: "Twin profile"
  },
  {
    label: "Decisions",
    href: "/simulations",
    icon: "activity",
    hint: "Compare future paths",
    eyebrow: "Decision lab"
  },
  {
    label: "Portfolio",
    href: "/investments",
    icon: "portfolio",
    hint: "Growth and uncertainty",
    eyebrow: "Portfolio studio"
  },
  {
    label: "Goals",
    href: "/goals",
    icon: "target",
    hint: "Forecast milestones",
    eyebrow: "Goal horizon"
  },
  {
    label: "Reports",
    href: "/reports",
    icon: "reports",
    hint: "Review and export",
    eyebrow: "Financial records"
  },
  {
    label: "Settings",
    href: "/settings",
    icon: "settings",
    hint: "Preferences and security",
    eyebrow: "Workspace settings"
  }
] as const;

export type NavigationIcon = (typeof navItems)[number]["icon"];

export const SIDEBAR_COLLAPSED_STORAGE_KEY = "financial-twin.sidebar-collapsed.v1";

export function getSidebarPreferenceStorage(
  browser: Pick<Window, "localStorage">
) {
  try {
    return browser.localStorage;
  } catch {
    return null;
  }
}

export function readSidebarCollapsedPreference(
  storage: Pick<Storage, "getItem">
) {
  return readSidebarCollapsedPreferenceResult(storage).collapsed;
}

export function readSidebarCollapsedPreferenceResult(
  storage: Pick<Storage, "getItem">
) {
  try {
    return {
      collapsed: storage.getItem(SIDEBAR_COLLAPSED_STORAGE_KEY) === "true",
      readable: true
    };
  } catch {
    return { collapsed: false, readable: false };
  }
}

export function persistSidebarCollapsedPreference(
  storage: Pick<Storage, "setItem">,
  collapsed: boolean
) {
  try {
    storage.setItem(SIDEBAR_COLLAPSED_STORAGE_KEY, String(collapsed));
    return true;
  } catch {
    return false;
  }
}

export function getPageMeta(pathname: string) {
  const path = pathname.split(/[?#]/, 1)[0] || "/dashboard";
  return navItems.find((item) => path === item.href || path.startsWith(`${item.href}/`)) ?? navItems[0];
}
