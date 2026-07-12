"use client";

import { useCallback, useEffect, useState } from "react";
import {
  PREFERENCES_UPDATED_EVENT,
  defaultPreferences,
  readPreferences,
  resetPreferences,
  savePreferences, preferencesStorageKey,
  type AppPreferences,
  type PreferencesStoreResult
} from "./browser-store";
import { useStorageSubject } from "./use-storage-subject";

type ActivePreferencesState = PreferencesStoreResult & { isLoaded: boolean; subject: string | null };

const initialState: ActivePreferencesState = {
  preferences: { ...defaultPreferences },
  savedAt: null,
  isLoaded: false,
  subject: null
};

export function useAppPreferences() {
  const [state, setState] = useState<ActivePreferencesState>(initialState);
  const { subject, isReady } = useStorageSubject();

  const reload = useCallback(() => {
    if (!subject) return null;
    const result = readPreferences(window.localStorage, subject);
    setState({ ...result, isLoaded: true, subject });
    return result;
  }, [subject]);

  useEffect(() => {
    if (!isReady || !subject) return;
    reload();
    const onStorage = (event: StorageEvent) => {
      if (event.key === preferencesStorageKey(subject)) reload();
    };
    const onPreferencesUpdated = () => reload();

    window.addEventListener("storage", onStorage);
    window.addEventListener(PREFERENCES_UPDATED_EVENT, onPreferencesUpdated);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(PREFERENCES_UPDATED_EVENT, onPreferencesUpdated);
    };
  }, [isReady, reload, subject]);

  const save = useCallback((preferences: AppPreferences) => {
    if (!subject) throw new Error("An authenticated storage subject is required.");
    const result = savePreferences(window.localStorage, subject, preferences);
    setState({ ...result, isLoaded: true, subject });
    window.dispatchEvent(new Event(PREFERENCES_UPDATED_EVENT));
    return result;
  }, [subject]);

  const reset = useCallback(() => {
    if (!subject) throw new Error("An authenticated storage subject is required.");
    resetPreferences(window.localStorage, subject);
    const result = readPreferences(window.localStorage, subject);
    setState({ ...result, isLoaded: true, subject });
    window.dispatchEvent(new Event(PREFERENCES_UPDATED_EVENT));
    return result;
  }, [subject]);

  const visibleState = state.subject === subject ? state : initialState;
  return { ...visibleState, save, reset, reload };
}
