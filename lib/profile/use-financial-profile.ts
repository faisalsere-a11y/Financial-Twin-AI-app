"use client";

import { useCallback, useEffect, useState } from "react";
import { sampleProfile } from "../financial/sample-data";
import type { FinancialProfile } from "../financial/types";
import {
  PROFILE_UPDATED_EVENT,
  financialProfileSchema,
  readProfile,
  resetProfile,
  saveProfile, profileStorageKey,
  type ProfileStoreResult
} from "./browser-store";
import { useStorageSubject } from "./use-storage-subject";

type ActiveProfileState = ProfileStoreResult & { isLoaded: boolean; subject: string | null };

const initialState: ActiveProfileState = {
  profile: financialProfileSchema.parse(sampleProfile),
  source: "sample",
  savedAt: null,
  isLoaded: false,
  subject: null
};

export function useFinancialProfile() {
  const [state, setState] = useState<ActiveProfileState>(initialState);
  const { subject, isReady } = useStorageSubject();

  const reload = useCallback(() => {
    if (!subject) return null;
    const result = readProfile(window.localStorage, subject);
    setState({ ...result, isLoaded: true, subject });
    return result;
  }, [subject]);

  useEffect(() => {
    if (!isReady || !subject) return;
    reload();

    const onStorage = (event: StorageEvent) => {
      if (event.key === profileStorageKey(subject)) reload();
    };
    const onProfileUpdated = () => reload();

    window.addEventListener("storage", onStorage);
    window.addEventListener(PROFILE_UPDATED_EVENT, onProfileUpdated);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(PROFILE_UPDATED_EVENT, onProfileUpdated);
    };
  }, [isReady, reload, subject]);

  const save = useCallback((profile: FinancialProfile) => {
    if (!subject) throw new Error("An authenticated storage subject is required.");
    const result = saveProfile(window.localStorage, subject, profile);
    setState({ ...result, isLoaded: true, subject });
    window.dispatchEvent(new Event(PROFILE_UPDATED_EVENT));
    return result;
  }, [subject]);

  const reset = useCallback(() => {
    if (!subject) throw new Error("An authenticated storage subject is required.");
    resetProfile(window.localStorage, subject);
    const result = readProfile(window.localStorage, subject);
    setState({ ...result, isLoaded: true, subject });
    window.dispatchEvent(new Event(PROFILE_UPDATED_EVENT));
    return result;
  }, [subject]);

  const visibleState = state.subject === subject ? state : initialState;
  return { ...visibleState, save, reset, reload };
}
