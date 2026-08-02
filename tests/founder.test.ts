// Kurucu Kilometre Taşı Sistemi testleri — yeniden kullanılabilir motor +
// cihaz metrikleri. KANIT: hiçbir eşik ürün davranışını otomatik değiştirmez
// (Premium açılmaz); uyarı kapatılana dek bekler; örnek veri sayılmaz;
// normal kullanıcı yüzeyi yok. Çalıştırma: npx tsx tests/founder.test.ts
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import type { SQLiteDatabase } from "expo-sqlite";
import { migrate } from "../src/db/migrations";
import * as schema from "../src/db/schema";
import { seedIfNeeded } from "../src/db/seed";
import { __setDbForTesting, Db } from "../src/db/client";
import {
  MILESTONE_THRESHOLDS,
  METRIC_KEYS,
  pendingAlerts,
  reachedMilestones,
  TRACKED_MILESTONES,
} from "../src/domain/milestones";
import { FOUNDER_STRINGS } from "../src/i18n/founder";

function expoLikeAdapter(sqlite: Database.Database): SQLiteDatabase {
  return {
    execSync: (sql: string) => sqlite.exec(sql),
    getAllSync: (sql: string) => sqlite.prepare(sql).all(),
    runSync: (sql: string, params?: unknown[]) =>
      sqlite.prepare(sql).run(...((params as unknown[]) ?? [])),
    withTransactionSync: (fn: () => void) => sqlite.transaction(fn)(),
  } as unknown as SQLiteDatabase;
}

// --- Motor: yeniden kullanılabilir eşik değerlendirmesi ----------------------
assert.deepEqual([...MILESTONE_THRESHOLDS], [10, 25, 50, 100, 250, 500, 1000]);
assert.equal(TRACKED_MILESTONES.length, 7, "her eşik izleniyor (tek seferlik 100 kontrolü değil)");

const at137 = reachedMilestones({ activated_users: 137 });
assert.deepEqual(
  at137.map((m) => m.threshold),
  [10, 25, 50, 100],
  "137 kullanıcı → 10/25/50/100 ulaşılmış"
);
assert.equal(reachedMilestones({ activated_users: 9 }).length, 0);
assert.equal(reachedMilestones({}).length, 0, "veri yokken uyarı yok (sahte tetik yok)");

// 100 eşiği para kazanma incelemesi işaretli; 50 değil
assert.equal(at137.find((m) => m.threshold === 100)!.monetizationReview, true);
assert.equal(at137.find((m) => m.threshold === 50)!.monetizationReview, false);

// --- Uyarılar kapatılana dek bekler ------------------------------------------
let pending = pendingAlerts({ activated_users: 137 }, []);
assert.equal(pending.length, 4);
pending = pendingAlerts({ activated_users: 137 }, ["activated_users_10", "activated_users_25"]);
assert.deepEqual(pending.map((m) => m.threshold), [50, 100], "kapatılanlar geri gelmez");
// Kapatma yeni eşiği ETKİLEMEZ:
pending = pendingAlerts({ activated_users: 260 }, ["activated_users_100"]);
assert.ok(pending.some((m) => m.threshold === 250), "yeni eşik yeni uyarı üretir");

// --- OTOMASYON YOK kanıtı ----------------------------------------------------
const milestonesSrc = readFileSync(join(__dirname, "..", "src", "domain", "milestones.ts"), "utf8");
assert.ok(
  !/premium|entitlement|paywall|price/i.test(milestonesSrc.replace(/\/\/[^\n]*/g, "").replace(/\/\*[\s\S]*?\*\//g, "")),
  "motor Premium/paywall/fiyat koduna DOKUNMAZ — yalnız hatırlatma"
);
const alertBody = FOUNDER_STRINGS.en.monetizationBody;
assert.ok(/NOT been enabled automatically/.test(alertBody), "uyarı metni: Premium otomatik AÇILMADI");
assert.ok(/Monetization review is now due/.test(alertBody));
assert.ok(/Monetization Roadmap/.test(alertBody), "yol haritasına yönlendirir");

// --- Cihaz metrikleri: yalnız gerçek kayıtlar --------------------------------
const sqlite = new Database(":memory:");
migrate(expoLikeAdapter(sqlite));
const db = drizzle(sqlite, { schema }) as unknown as Db;
__setDbForTesting(db);
seedIfNeeded(db); // örnekler kuruldu (3 sefer + 5 log + check-in denetimi)

// Repository'ler getDb'yi çağrı anında çözer — statik import güvenli.
// eslint-disable-next-line import/first
import { collectDeviceMetrics } from "../src/repositories/founderMetrics";
// eslint-disable-next-line import/first
import { createVessel } from "../src/repositories/vessels";
// eslint-disable-next-line import/first
import { createTrip, ensureTripInspection, updateTripStatus, getTrip } from "../src/repositories/trips";
// eslint-disable-next-line import/first
import { createLogEntry, addLogMedia } from "../src/repositories/log";
// eslint-disable-next-line import/first
import { generatePlan } from "../src/repositories/provisioning";
// eslint-disable-next-line import/first
import { DEFAULT_TRIP_PROFILE } from "../src/domain/types";

const empty = collectDeviceMetrics();
for (const key of METRIC_KEYS)
  assert.equal(empty[key], 0, `örnekler ${key} metriğine SAYILMAZ (izolasyon)`);

const boat = createVessel({ name: "Metric Boat", type: "sailing" });
const trip = createTrip({
  name: "Metric Trip",
  tripType: "weekend",
  ownershipContext: "charter",
  boatId: boat.id,
  nights: 2,
  adults: 2,
  children: 0,
  infants: 0,
  pets: 0,
  profile: DEFAULT_TRIP_PROFILE,
});
generatePlan(getTrip(trip.id)!, "en");
ensureTripInspection(getTrip(trip.id)!, "check_in", boat.type);
ensureTripInspection(getTrip(trip.id)!, "check_out", boat.type);
const entry = createLogEntry({ tripId: trip.id, type: "note", title: "Metric note" });
addLogMedia(entry.id, "media/m.jpg");
updateTripStatus(trip.id, "completed");

const m = collectDeviceMetrics();
assert.equal(m.real_trips, 1);
assert.equal(m.completed_trips, 1);
assert.equal(m.provisioning_plans, 1);
assert.equal(m.inspections, 2);
assert.equal(m.check_ins, 1);
assert.equal(m.check_outs, 1);
assert.equal(m.log_entries, 1);
assert.equal(m.photo_evidence, 1);
assert.ok(m.returning_days >= 1);
assert.equal(m.activated_users, 0, "aktif kullanıcı cihazda SAYILMAZ (dürüstlük: kaynak elle/telemetri)");

// --- Normal kullanıcı yüzeyi yok ---------------------------------------------
const root = join(__dirname, "..");
const profile = readFileSync(join(root, "src", "screens", "ProfileScreen.tsx"), "utf8");
assert.ok(profile.includes("onLongPress"), "kurucu girişi gizli harekettir");
assert.ok(profile.includes("founderEnabled &&"), "Kurucu satırı yalnız mod açıkken görünür");
const app = readFileSync(join(root, "App.tsx"), "utf8");
assert.ok(app.includes('name="Founder"'), "Founder rotası kayıtlı");
for (const tabFile of ["TripHomeScreen.tsx"]) {
  const src = readFileSync(join(root, "src", "screens", "trip", tabFile), "utf8");
  assert.ok(!src.includes("Founder"), `${tabFile} kurucu yüzeyi sızdırmaz`);
}

console.log(
  `founder.test.ts: ALL PASS (engine ${TRACKED_MILESTONES.length} milestones, alerts persist until dismissed, no automation, device metrics real-only)`
);
