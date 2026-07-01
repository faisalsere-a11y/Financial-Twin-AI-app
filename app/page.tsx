import { LandingPage } from "@/components/landing/landing-page";
import { AppShell } from "@/components/layout/app-shell";
import DashboardPage from "./(app)/dashboard/page";

export default function HomePage() {
  if (process.env.NEXT_PUBLIC_GITHUB_PAGES === "true") {
    return (
      <AppShell>
        <DashboardPage />
      </AppShell>
    );
  }

  return <LandingPage />;
}
