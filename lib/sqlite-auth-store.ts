import { join } from "node:path";
import bcrypt from "bcryptjs";

export interface AuthStoreUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  passwordHash: string | null;
}

type DatabaseCtor = new (path: string) => {
  exec: (sql: string) => void;
  prepare: (sql: string) => {
    get: (...values: unknown[]) => Record<string, unknown> | undefined;
    run: (...values: unknown[]) => unknown;
  };
  close: () => void;
};

const fallbackUsers = new Map<string, AuthStoreUser & { plainPassword?: string }>([
  [
    "ahmed@example.com",
    {
      id: "user_ahmed",
      name: "Ahmed Al-Harbi",
      email: "ahmed@example.com",
      image: null,
      passwordHash: null,
      plainPassword: "password123"
    }
  ]
]);

async function openDatabase() {
  try {
    const sqlite = (await import("node:sqlite")) as { DatabaseSync: DatabaseCtor };
    const db = new sqlite.DatabaseSync(join(process.cwd(), "prisma", "dev.db"));
    db.exec(`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT,
        "email" TEXT NOT NULL UNIQUE,
        "emailVerified" DATETIME,
        "image" TEXT,
        "passwordHash" TEXT,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL
      );
    `);
    return db;
  } catch {
    return null;
  }
}

export async function findAuthUser(email: string) {
  const normalized = email.toLowerCase();
  const db = await openDatabase();

  if (!db) return fallbackUsers.get(normalized) ?? null;

  try {
    const row = db.prepare(`SELECT "id", "name", "email", "image", "passwordHash" FROM "User" WHERE "email" = ?`).get(normalized);
    if (!row) return fallbackUsers.get(normalized) ?? null;

    return {
      id: String(row.id),
      name: row.name ? String(row.name) : null,
      email: String(row.email),
      image: row.image ? String(row.image) : null,
      passwordHash: row.passwordHash ? String(row.passwordHash) : null
    } satisfies AuthStoreUser;
  } finally {
    db.close();
  }
}

export async function createAuthUser(input: { name: string; email: string; password: string }) {
  const normalized = input.email.toLowerCase();
  const existing = await findAuthUser(normalized);
  if (existing) return { ok: false, reason: "exists" as const };

  const passwordHash = await bcrypt.hash(input.password, 12);
  const id = `user_${Date.now()}`;
  const now = new Date().toISOString();
  const db = await openDatabase();

  if (!db) {
    return { ok: false, reason: "unavailable" as const };
  }

  try {
    db.prepare(
      `INSERT INTO "User" ("id", "name", "email", "passwordHash", "createdAt", "updatedAt") VALUES (?, ?, ?, ?, ?, ?)`
    ).run(id, input.name, normalized, passwordHash, now, now);
    return { ok: true };
  } catch {
    return { ok: false, reason: "unavailable" as const };
  } finally {
    db.close();
  }
}

export async function verifyPassword(user: AuthStoreUser & { plainPassword?: string }, password: string) {
  if (user.passwordHash) return bcrypt.compare(password, user.passwordHash);
  return user.plainPassword === password;
}
