import { AppShell } from "@/components/layout/app-shell";
import { redirect } from "next/navigation";

export default async function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  if (process.env.GITHUB_PAGES !== "true") {
    const { auth } = await import("@/lib/auth");
    const session = await auth();
    if (!session?.user) redirect("/login");
  }

  return <AppShell>{children}</AppShell>;
}
