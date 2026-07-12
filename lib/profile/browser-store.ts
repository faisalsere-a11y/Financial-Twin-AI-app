import { z } from "zod";
import { sampleProfile } from "../financial/sample-data";
import type { FinancialProfile } from "../financial/types";

export const PROFILE_STORAGE_KEY = "financial-twin.profile.v1";
export const PREFERENCES_STORAGE_KEY = "financial-twin.preferences.v1";
export const STATIC_STORAGE_SUBJECT = "static-sample";
export const PROFILE_UPDATED_EVENT = "financial-twin:profile-updated";
export const PREFERENCES_UPDATED_EVENT = "financial-twin:preferences-updated";

export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

const debtSchema = z.object({
  label: z.string().min(1),
  balance: z.number().nonnegative(),
  monthlyPayment: z.number().nonnegative(),
  apr: z.number().nonnegative(),
  type: z.enum(["credit-card", "personal-loan", "mortgage", "auto-loan", "education"])
});

const goalSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  category: z.enum(["Emergency", "Retirement", "House", "Wedding", "Vacation", "Education"]),
  targetAmount: z.number().nonnegative(),
  currentAmount: z.number().nonnegative(),
  monthlyContribution: z.number().nonnegative(),
  targetDate: z.string().min(1),
  priority: z.enum(["High", "Medium", "Low"])
});

export const financialProfileSchema: z.ZodType<FinancialProfile> = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  initials: z.string().min(1),
  age: z.number().int().min(18).max(120),
  country: z.string().min(1),
  currency: z.enum(["SAR", "USD", "EUR", "AED"]),
  employment: z.enum(["Full-time", "Founder", "Contract", "Government", "Self-employed", "Unemployed"]),
  riskTolerance: z.enum(["Low", "Medium", "High"]),
  income: z.object({
    salaryMonthly: z.number().nonnegative(),
    bonusesAnnual: z.number().nonnegative(),
    otherMonthly: z.number().nonnegative(),
    stabilityScore: z.number().min(0).max(100)
  }),
  expenses: z.object({
    housing: z.number().nonnegative(),
    food: z.number().nonnegative(),
    transport: z.number().nonnegative(),
    utilities: z.number().nonnegative(),
    subscriptions: z.number().nonnegative(),
    insurance: z.number().nonnegative(),
    education: z.number().nonnegative(),
    lifestyle: z.number().nonnegative(),
    children: z.number().nonnegative(),
    other: z.number().nonnegative()
  }),
  debts: z.array(debtSchema),
  assets: z.object({
    cash: z.number().nonnegative(),
    investments: z.number().nonnegative(),
    retirement: z.number().nonnegative(),
    realEstate: z.number().nonnegative(),
    other: z.number().nonnegative()
  }),
  goals: z.array(goalSchema),
  creditLimit: z.number().nonnegative(),
  creditUsed: z.number().nonnegative(),
  dependents: z.number().int().nonnegative(),
  insuranceCoverageMonthly: z.number().nonnegative()
});

const profileEnvelopeSchema = z.object({
  version: z.literal(1),
  savedAt: z.string().datetime(),
  profile: financialProfileSchema
});

export const preferencesSchema = z.object({
  language: z.enum(["en", "ar"]),
  notifications: z.boolean(),
  exportReauthentication: z.boolean(),
  regionalMode: z.boolean()
});

export type AppPreferences = z.infer<typeof preferencesSchema>;

export const defaultPreferences: AppPreferences = {
  language: "en",
  notifications: true,
  exportReauthentication: true,
  regionalMode: true
};

const preferencesEnvelopeSchema = z.object({
  version: z.literal(1),
  savedAt: z.string().datetime(),
  preferences: preferencesSchema
});

export type ProfileStoreResult = {
  profile: FinancialProfile;
  source: "sample" | "saved";
  savedAt: string | null;
};

export type PreferencesStoreResult = {
  preferences: AppPreferences;
  savedAt: string | null;
};

function parseStoredValue<T>(storage: KeyValueStorage, key: string, schema: z.ZodType<T>) {
  try {
    const raw = storage.getItem(key);
    if (!raw) return null;
    const parsed = schema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

function scopedStorageKey(prefix: string, subject: string) {
  return `${prefix}:${encodeURIComponent(subject)}`;
}

export function profileStorageKey(subject: string) {
  return scopedStorageKey(PROFILE_STORAGE_KEY, subject);
}

export function preferencesStorageKey(subject: string) {
  return scopedStorageKey(PREFERENCES_STORAGE_KEY, subject);
}

export function readProfile(storage: KeyValueStorage, subject: string): ProfileStoreResult {
  const envelope = parseStoredValue(storage, profileStorageKey(subject), profileEnvelopeSchema);
  if (envelope) return { profile: envelope.profile, source: "saved", savedAt: envelope.savedAt };
  return { profile: financialProfileSchema.parse(sampleProfile), source: "sample", savedAt: null };
}

export function saveProfile(storage: KeyValueStorage, subject: string, profile: FinancialProfile, savedAt = new Date().toISOString()): ProfileStoreResult {
  const envelope = profileEnvelopeSchema.parse({ version: 1, savedAt, profile });
  storage.setItem(profileStorageKey(subject), JSON.stringify(envelope));
  return { profile: envelope.profile, source: "saved", savedAt: envelope.savedAt };
}

export function resetProfile(storage: KeyValueStorage, subject: string) {
  storage.removeItem(profileStorageKey(subject));
}

export function readPreferences(storage: KeyValueStorage, subject: string): PreferencesStoreResult {
  const envelope = parseStoredValue(storage, preferencesStorageKey(subject), preferencesEnvelopeSchema);
  if (envelope) return { preferences: envelope.preferences, savedAt: envelope.savedAt };
  return { preferences: preferencesSchema.parse(defaultPreferences), savedAt: null };
}

export function savePreferences(storage: KeyValueStorage, subject: string, preferences: AppPreferences, savedAt = new Date().toISOString()): PreferencesStoreResult {
  const envelope = preferencesEnvelopeSchema.parse({ version: 1, savedAt, preferences });
  storage.setItem(preferencesStorageKey(subject), JSON.stringify(envelope));
  return { preferences: envelope.preferences, savedAt: envelope.savedAt };
}

export function resetPreferences(storage: KeyValueStorage, subject: string) {
  storage.removeItem(preferencesStorageKey(subject));
}
