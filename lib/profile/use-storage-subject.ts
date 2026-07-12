"use client";

import { useSession } from "next-auth/react";
import { STATIC_STORAGE_SUBJECT } from "./browser-store";

export function useStorageSubject() {
  const staticSample = process.env.NEXT_PUBLIC_GITHUB_PAGES === "true";
  const { data: session, status } = useSession();

  if (staticSample) return { subject: STATIC_STORAGE_SUBJECT, isReady: true };

  const user = session?.user as { id?: string; email?: string | null } | undefined;
  return {
    subject: user?.id || user?.email || null,
    isReady: status !== "loading"
  };
}
