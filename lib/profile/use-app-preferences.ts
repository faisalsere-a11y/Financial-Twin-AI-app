"use client";

import { useCallback, useEffect, useState } from "react";
import {
  PREFERENCES_STORAGE_KEY,
  PREFERENCES_UPDATED_EVENT,
  defaultPreferences,
  readPreferences,
  resetPreferences,
  savePreferences,
  type AppPreferences,
  type PreferencesStoreResult
} from "./browser-store";

type ActivePreferencesState = PreferencesStoreResult & { isLoaded: boolean };

const initialState: ActivePreferencesState = {
  preferences: { ...defaultPreferences },
  savedAt: null,
  isLoaded: false
};

export function useAppPreferences() {
  const [state, setState] = useState<ActivePreferencesState>(initialState);

  const reload = useCallback(() => {
    const result = readPreferences(window.localStorage);
    setState({ ...result, isLoaded: true });
    return result;
  }, []);

  useEffect(() => {
    reload();
    const onStorage = (event: StorageEvent) => {
      if (event.key === PREFERENCES_STORAGE_KEY) reload();
    };
    const onPreferencesUpdated = () => reload();

    window.addEventListener("storage", onStorage);
    window.addEventListener(PREFERENCES_UPDATED_EVENT, onPreferencesUpdated);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(PREFERENCES_UPDATED_EVENT, onPreferencesUpdated);
    };
  }, [reload]);

  const save = useCallback((preferences: AppPreferences) => {
    const result = savePreferences(window.localStorage, preferences);
    setState({ ...result, isLoaded: true });
    window.dispatchEvent(new Event(PREFERENCES_UPDATED_EVENT));
    return result;
  }, []);

  const reset = useCallback(() => {
    resetPreferences(window.localStorage);
    const result = readPreferences(window.localStorage);
    setState({ ...result, isLoaded: true });
    window.dispatchEvent(new Event(PREFERENCES_UPDATED_EVENT));
    return result;
  }, []);

  return { ...state, save, reset, reload };
}
