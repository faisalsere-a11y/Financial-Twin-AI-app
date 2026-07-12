export type AuthMode = "login" | "signup" | "forgot";

export interface AuthPresentation {
  title: string;
  eyebrow: string;
  helper: string;
  submitLabel: string;
  pendingLabel: string;
  destination: "/dashboard" | "/onboarding" | "/login";
  unavailableMessage?: string;
}

export const sampleCredentials = {
  email: "ahmed@example.com",
  password: "password123"
} as const;

export const authPresentation: Record<AuthMode, AuthPresentation> = {
  login: {
    title: "Welcome back",
    eyebrow: "Continue your financial model",
    helper: "Sign in to review your twin, decisions, goals, and reports.",
    submitLabel: "Sign in",
    pendingLabel: "Signing in…",
    destination: "/dashboard"
  },
  signup: {
    title: "Create your financial twin",
    eyebrow: "Start with a trustworthy model",
    helper: "Create an account, then build your profile through guided onboarding.",
    submitLabel: "Create account",
    pendingLabel: "Creating account…",
    destination: "/onboarding"
  },
  forgot: {
    title: "Recover access",
    eyebrow: "Password recovery",
    helper: "Enter the email associated with your local account.",
    submitLabel: "Check recovery availability",
    pendingLabel: "Checking…",
    destination: "/login",
    unavailableMessage: "Password recovery email is not configured for this deployment. Return to sign in or use sample access while an administrator restores your account."
  }
};

const authDefaults: Record<AuthMode, { name: string; email: string; password: string }> = {
  login: { name: "", email: "", password: "" },
  signup: { name: "", email: "", password: "" },
  forgot: { name: "", email: "", password: "" }
};

export function getAuthDefaults(mode: AuthMode) {
  return { ...authDefaults[mode] };
}

export function getAuthDestination(mode: AuthMode) {
  return authPresentation[mode].destination;
}
