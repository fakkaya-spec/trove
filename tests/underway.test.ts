// Faz 6 (Underway) testleri — gerçek SQLite (dosya tabanlı).
// Kapsam: migration 5→6 yükseltmesi mevcut veriyle, açık gözlem listesi +
// çöz/yeniden aç + örnek koruması, tripDayOf kıskacı, i18n bütünlüğü,
// faz-yönlendirme/navigasyon sözleşmesi (kaynak düzeyinde).
// Çalıştırma: npx tsx tests/underway.test.ts
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import type { SQLiteDatabase } from "expo-sqlite";
import { migrate, migrateUpTo } from "../src/db/migrations";
import * as schema from "../src/db/schema";
import { seedIfNeeded } from "../src/db/seed";
import { SAMPLE_IDS } from "../src/db/seed/samples";
import { __setDbForTesting, Db } from "../src/db/client";

function expoLikeAdapter(sqlite: Database.Database): SQLiteDatabase {
  return {
    execSync: (sql: string) => sqlite.exec(sql),
    getAllSync: (sql: string) => sqlite.prepare(sql).all(),
    runSync: (sql: string, params?: unknown[]) =>
      sqlite.prepare(sql).run(...((params as unknown[]) ?? [])),
    withTransactionSync: (fn: () => void) => sqlite.transaction(fn)(),
  } as unknown as SQLiteDatabase;
}

const dir = mkdtempSync(join(tmpdir(), "trove-underway-"));
const dbFile = join(dir, "underway.sqlite");

// --- Migration 5→6: mevcut log verisi resolved_at=NULL ile korunur ----------
const sqlite = new Database(dbFile);
migrateUpTo(expoLikeAdapter(sqlite), 5);
const now = new Date().toISOString();
sqlite
  .prepare(
    `INSERT INTO log_entries (id, type, title, occurred_at, created_at, updated_at)
     VALUES ('legacy-entry','observation','Old observation',?,?,?)`
  )
  .run(now, now, now);
migrate(expoLikeAdapter(sqlite)); // 6 uygulanır
migrate(expoLikeAdapter(sqlite)); // idempotent
const upgraded = sqlite
  .prepare(`SELECT title, resolved_at FROM log_entries WHERE id='legacy-entry'`)
  .get() as { title: string; resolved_at: string | null };
assert.equal(upgraded.title, "Old observation", "mevcut kayıt yükseltmede korunur");
assert.equal(upgraded.resolved_at, null, "eski gözlemler açık başlar");

const db = drizzle(sqlite, { schema }) as unknown as Db;
__setDbForTesting(db);
seedIfNeeded(db);

import { createVessel } from "../src/repositories/vessels";
import { createTrip } from "../src/repositories/trips";
import {
  createLogEntry,
  getLogEntry,
  listLogEntries,
  listOpenObservations,
  reopenLogEntry,
  resolveLogEntry,
  SampleReadOnlyError,
} from "../src/repositories/log";
import { tripDayOf } from "../src/domain/trip";
import { DEFAULT_TRIP_PROFILE } from "../src/domain/types";
import { UNDERWAY_STRINGS } from "../src/i18n/underway";

// --- Açık gözlemler: tür filtresi + çöz/yeniden aç --------------------------
const boat = createVessel({ name: "S/Y Underway", type: "sailing" });
const trip = createTrip({
  name: "Underway Test",
  tripType: "multi_day_coastal",
  ownershipContext: "own",
  boatId: boat.id,
  nights: 6,
  adults: 4,
  children: 0,
  infants: 0,
  pets: 0,
  profile: DEFAULT_TRIP_PROFILE,
});

const obs = createLogEntry({ tripId: trip.id, type: "observation", title: "Winch noise" });
const incident = createLogEntry({ tripId: trip.id, type: "incident", title: "Fender lost" });
createLogEntry({ tripId: trip.id, type: "note", title: "Nice anchorage" });

let open = listOpenObservations(trip.id);
assert.equal(open.length, 2, "yalnız observation/incident/defect türleri açık listede");
assert.ok(!open.some((e) => e.type === "note"), "not türü izleme listesine girmez");

resolveLogEntry(obs.id);
open = listOpenObservations(trip.id);
assert.equal(open.length, 1, "çözülen gözlem listeden düşer");
assert.ok(getLogEntry(obs.id)!.resolvedAt, "çözülme damgası yazılır");
assert.equal(
  listLogEntries(trip.id).length,
  3,
  "çözmek kaydı SİLMEZ — defterde kalır (kanıt korunur)"
);

reopenLogEntry(obs.id);
assert.equal(listOpenObservations(trip.id).length, 2, "yeniden açma geri getirir");
assert.equal(getLogEntry(obs.id)!.resolvedAt, null);
void incident;

// Örnek koruması: örnek gözlem gerçek yoldan çözülemez
assert.throws(() => resolveLogEntry("smp-log-winch"), SampleReadOnlyError);
assert.throws(() => reopenLogEntry("smp-log-winch"), SampleReadOnlyError);

// --- tripDayOf: kıskaç + kenar durumlar -------------------------------------
const total = 7;
assert.equal(tripDayOf(null, total, "2026-08-02"), null, "başlangıç yoksa gün pili yok");
assert.equal(tripDayOf("garbage", total, "2026-08-02"), null, "bozuk tarih → null");
assert.deepEqual(tripDayOf("2026-08-02", total, "2026-08-02"), {
  day: 1,
  totalDays: total,
  overdue: false,
});
assert.deepEqual(tripDayOf("2026-07-31", total, "2026-08-02"), {
  day: 3,
  totalDays: total,
  overdue: false,
});
// Erken başlangıç (bugün < startAt) → Gün 1, gecikme yok
assert.deepEqual(tripDayOf("2026-08-05", total, "2026-08-02"), {
  day: 1,
  totalDays: total,
  overdue: false,
});
// Bitişi geçmiş → Y/Y'ye kıskaç + overdue işareti
assert.deepEqual(tripDayOf("2026-07-20", total, "2026-08-02"), {
  day: 7,
  totalDays: total,
  overdue: true,
});

// --- Faz yönlendirmesi + navigasyon sözleşmesi (kaynak düzeyi) --------------
const root = join(__dirname, "..");
const tripHome = readFileSync(join(root, "src", "screens", "trip", "TripHomeScreen.tsx"), "utf8");
assert.ok(tripHome.includes("UnderwayScreen"), "aktif faz Underway'i çizer");
assert.ok(tripHome.includes("TripPrepareHub"), "planlama fazı hub'da kalır");
const app = readFileSync(join(root, "App.tsx"), "utf8");
assert.ok(app.includes('name="TripReturn"'), "dönüş listesi rotası kayıtlı");
const underwaySrc = readFileSync(
  join(root, "src", "screens", "trip", "underway", "UnderwayScreen.tsx"),
  "utf8"
);
assert.ok(underwaySrc.includes("listOpenObservations"), "açık gözlemler repository'den");
assert.ok(underwaySrc.includes('navigate("AddLog")'), "hızlı kayıt AddLog'a gider");
assert.ok(
  !/2[0-9]°C|NE 12/.test(underwaySrc),
  "sahte hava verisi YOK (gelecek genişleme noktası)"
);

// --- i18n bütünlüğü ----------------------------------------------------------
const enKeys = Object.keys(UNDERWAY_STRINGS.en).sort();
for (const loc of ["tr", "de", "ru", "es", "hr", "it", "el", "fr"] as const) {
  assert.deepEqual(Object.keys(UNDERWAY_STRINGS[loc]).sort(), enKeys, `${loc} anahtarları tam`);
}
for (const [k, v] of Object.entries(UNDERWAY_STRINGS.en))
  assert.ok(typeof v === "string" && v.length > 0, `en.${k} boş olamaz`);
for (const [k, v] of Object.entries(UNDERWAY_STRINGS.tr))
  assert.ok(typeof v === "string" && v.length > 0, `tr.${k} boş olamaz`);

sqlite.close();
rmSync(dir, { recursive: true, force: true });

console.log(
  `underway.test.ts: ALL PASS (migration 5→6, open observations resolve/reopen, day clamp, i18n ${enKeys.length} keys)`
);
