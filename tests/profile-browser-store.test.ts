import { describe, expect, it } from "vitest";
import { sampleProfile } from "../lib/financial/sample-data";
import {
  defaultPreferences,
  PROFILE_STORAGE_KEY,
  PREFERENCES_STORAGE_KEY,
  readPreferences,
  readProfile,
  resetPreferences,
  resetProfile,
  savePreferences,
  saveProfile,
  type KeyValueStorage
} from "../lib/profile/browser-store";

class MemoryStorage implements KeyValueStorage {
  values = new Map<string, string>();

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }

  removeItem(key: string) {
    this.values.delete(key);
  }
}

describe("versioned browser profile store", () => {
  it("saves and validates a financial profile envelope", () => {
    const storage = new MemoryStorage();
    const edited = { ...sampleProfile, name: "Maha Al-Salem", initials: "MA" };
    const savedAt = "2026-07-12T19:30:00.000Z";

    expect(saveProfile(storage, edited, savedAt)).toEqual({ profile: edited, source: "saved", savedAt });
    expect(readProfile(storage)).toEqual({ profile: edited, source: "saved", savedAt });
    expect(JSON.parse(storage.values.get(PROFILE_STORAGE_KEY) ?? "{}").version).toBe(1);
  });

  it("falls back safely when stored profile data is malformed or unsupported", () => {
    const storage = new MemoryStorage();
    storage.setItem(PROFILE_STORAGE_KEY, JSON.stringify({ version: 2, savedAt: "not-a-date", profile: { name: "Broken" } }));

    const result = readProfile(storage);

    expect(result.source).toBe("sample");
    expect(result.savedAt).toBeNull();
    expect(result.profile).toEqual(sampleProfile);
    expect(result.profile).not.toBe(sampleProfile);
  });

  it("persists preference state and resets both stores", () => {
    const storage = new MemoryStorage();
    const preferences = { ...defaultPreferences, language: "ar" as const, notifications: false };

    expect(savePreferences(storage, preferences, "2026-07-12T20:00:00.000Z")).toEqual({
      preferences,
      savedAt: "2026-07-12T20:00:00.000Z"
    });
    expect(readPreferences(storage).preferences).toEqual(preferences);
    expect(JSON.parse(storage.values.get(PREFERENCES_STORAGE_KEY) ?? "{}").version).toBe(1);

    resetProfile(storage);
    resetPreferences(storage);

    expect(readProfile(storage).source).toBe("sample");
    expect(readPreferences(storage)).toEqual({ preferences: defaultPreferences, savedAt: null });
  });
});
