import type { ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite";
import type { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";
import { migrate } from "./migrations";
import * as schema from "./schema";
import { seedIfNeeded } from "./seed";

export { newId, nowIso, stamps } from "./util";

// Sürücüden bağımsız tip: cihazda expo-sqlite, testte better-sqlite3.
export type Db = BaseSQLiteDatabase<"sync", unknown, typeof schema>;

let db: Db | null = null;

/** Uygulama açılışında bir kez çağrılır: aç → migrate → seed. */
export function initDb(): Db {
  if (db) return db;
  // Lazy require: expo-sqlite yalnızca cihazda yüklenir; node test ortamı
  // __setDbForTesting ile kendi sürücüsünü enjekte eder.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { openDatabaseSync } = require("expo-sqlite") as typeof import("expo-sqlite");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { drizzle } = require("drizzle-orm/expo-sqlite") as typeof import("drizzle-orm/expo-sqlite");
  const raw = openDatabaseSync("boatcheck.db");
  raw.execSync("PRAGMA journal_mode = WAL;");
  raw.execSync("PRAGMA foreign_keys = ON;");
  migrate(raw);
  const d: ExpoSQLiteDatabase<typeof schema> = drizzle(raw, { schema });
  db = d as unknown as Db;
  seedIfNeeded(db);
  return db;
}

/** YALNIZCA test: farklı bir drizzle örneği enjekte eder (ör. better-sqlite3). */
export function __setDbForTesting(testDb: Db): void {
  db = testDb;
}

export function getDb(): Db {
  if (!db) throw new Error("Database not initialized — call initDb() first.");
  return db;
}
