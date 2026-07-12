export const COMMAND_PALETTE_EVENT = "financial-twin:open-command-palette";

export const commands = [
  { label: "Overview", href: "/dashboard", icon: "home", hint: "Twin overview" },
  { label: "Run a car decision", href: "/simulations?scenario=car", icon: "wand", hint: "Decision lab" },
  { label: "Portfolio simulator", href: "/investments", icon: "chart", hint: "Monte Carlo" },
  { label: "Goals", href: "/goals", icon: "flag", hint: "Forecast dates" },
  { label: "Reports", href: "/reports", icon: "landmark", hint: "Export and print" },
  { label: "NOVA brief", href: "/dashboard#insights", icon: "sparkles", hint: "AI evidence" },
  { label: "Notifications", href: "/settings#notifications", icon: "bell", hint: "Alerts" },
  { label: "Settings", href: "/settings", icon: "settings", hint: "Profile and security" },
  { label: "Financial Twin", href: "/dashboard#twin", icon: "brain", hint: "Health model" },
  { label: "Product tour", href: "/#how-it-works", icon: "currency", hint: "How Financial Twin works" }
] as const;

export type CommandIcon = (typeof commands)[number]["icon"];

export function filterCommands(query: string) {
  const needle = query.trim().toLowerCase();
  return needle
    ? commands.filter((command) => `${command.label} ${command.hint}`.toLowerCase().includes(needle))
    : [...commands];
}

export function openCommandPalette(target: Pick<Window, "dispatchEvent"> = window) {
  target.dispatchEvent(new Event(COMMAND_PALETTE_EVENT));
}
