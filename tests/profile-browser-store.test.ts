import { describe, expect, it } from "vitest";
import { sampleProfile } from "../lib/financial/sample-data";
import {
  defaultPreferences,
  preferencesStorageKey,
  profileStorageKey,
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

    expect(saveProfile(storage, "user-a", edited, savedAt)).toEqual({ profile: edited, source: "saved", savedAt });
    expect(readProfile(storage, "user-a")).toEqual({ profile: edited, source: "saved", savedAt });
    expect(JSON.parse(storage.values.get(profileStorageKey("user-a")) ?? "{}").version).toBe(1);
    expect(readProfile(storage, "user-b").source).toBe("sample");
  });

  it("falls back safely when stored profile data is malformed or unsupported", () => {
    const storage = new MemoryStorage();
    storage.setItem(profileStorageKey("user-a"), JSON.stringify({ version: 2, savedAt: "not-a-date", profile: { name: "Broken" } }));

    const result = readProfile(storage, "user-a");

    expect(result.source).toBe("sample");
    expect(result.savedAt).toBeNull();
    expect(result.profile).toEqual(sampleProfile);
    expect(result.profile).not.toBe(sampleProfile);
  });

  it("persists preference state and resets both stores", () => {
    const storage = new MemoryStorage();
    const preferences = { ...defaultPreferences, language: "ar" as const, notifications: false };

    expect(savePreferences(storage, "user-a", preferences, "2026-07-12T20:00:00.000Z")).toEqual({
      preferences,
      savedAt: "2026-07-12T20:00:00.000Z"
    });
    expect(readPreferences(storage, "user-a").preferences).toEqual(preferences);
    expect(readPreferences(storage, "user-b").preferences).toEqual(defaultPreferences);
    expect(JSON.parse(storage.values.get(preferencesStorageKey("user-a")) ?? "{}").version).toBe(1);

    resetProfile(storage, "user-a");
    resetPreferences(storage, "user-a");

    expect(readProfile(storage, "user-a").source).toBe("sample");
    expect(readPreferences(storage, "user-a")).toEqual({ preferences: defaultPreferences, savedAt: null });
  });
});
