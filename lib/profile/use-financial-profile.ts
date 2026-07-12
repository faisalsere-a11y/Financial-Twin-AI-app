"use client";

import { useCallback, useEffect, useState } from "react";
import { sampleProfile } from "../financial/sample-data";
import type { FinancialProfile } from "../financial/types";
import {
  PROFILE_STORAGE_KEY,
  PROFILE_UPDATED_EVENT,
  financialProfileSchema,
  readProfile,
  resetProfile,
  saveProfile,
  type ProfileStoreResult
} from "./browser-store";

type ActiveProfileState = ProfileStoreResult & { isLoaded: boolean };

const initialState: ActiveProfileState = {
  profile: financialProfileSchema.parse(sampleProfile),
  source: "sample",
  savedAt: null,
  isLoaded: false
};

export function useFinancialProfile() {
  const [state, setState] = useState<ActiveProfileState>(initialState);

  const reload = useCallback(() => {
    const result = readProfile(window.localStorage);
    setState({ ...result, isLoaded: true });
    return result;
  }, []);

  useEffect(() => {
    reload();

    const onStorage = (event: StorageEvent) => {
      if (event.key === PROFILE_STORAGE_KEY) reload();
    };
    const onProfileUpdated = () => reload();

    window.addEventListener("storage", onStorage);
    window.addEventListener(PROFILE_UPDATED_EVENT, onProfileUpdated);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(PROFILE_UPDATED_EVENT, onProfileUpdated);
    };
  }, [reload]);

  const save = useCallback((profile: FinancialProfile) => {
    const result = saveProfile(window.localStorage, profile);
    setState({ ...result, isLoaded: true });
    window.dispatchEvent(new Event(PROFILE_UPDATED_EVENT));
    return result;
  }, []);

  const reset = useCallback(() => {
    resetProfile(window.localStorage);
    const result = readProfile(window.localStorage);
    setState({ ...result, isLoaded: true });
    window.dispatchEvent(new Event(PROFILE_UPDATED_EVENT));
    return result;
  }, []);

  return { ...state, save, reset, reload };
}
