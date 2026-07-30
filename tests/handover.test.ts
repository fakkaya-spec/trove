// Faz 3 — Charter handover uçtan uca testi (gerçek SQLite, better-sqlite3).
// Çalıştırma: npx tsx tests/handover.test.ts
import assert from "node:assert/strict";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import type { SQLiteDatabase } from "expo-sqlite";
import { migrate } from "../src/db/migrations";
import * as schema from "../src/db/schema";
import { seedIfNeeded } from "../src/db/seed";
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

const sqlite = new Database(":memory:");
migrate(expoLikeAdapter(sqlite));
const db = drizzle(sqlite, { schema }) as unknown as Db;
__setDbForTesting(db);
seedIfNeeded(db);

import { createVessel } from "../src/repositories/vessels";
import { createTrip, ensureTripInspection, getTrip } from "../src/repositories/trips";
import {
  ensurePairsForSession,
  getSessionForTrip,
  listPairs,
  setPairCheckoutMedia,
  setPairReview,
} from "../src/repositories/handover";
import {
  addMedia,
  getInspection,
  upsertIssueForItem,
  upsertMeter,
  setItemStatus,
} from "../src/repositories/inspections";
import { getTemplateById } from "../src/repositories/templates";
import {
  buildHandoverReportText,
  compareMeters,
  deriveHandoverStatus,
} from "../src/domain/handover";
import { DEFAULT_TRIP_PROFILE } from "../src/domain/types";

// --- Charter trip + session bağlama -----------------------------------------
const boat = createVessel({ name: "S/Y Charter", type: "sailing", ownershipType: "chartered" });
const trip = createTrip({
  name: "Fethiye Charter",
  tripType: "multi_day_coastal",
  ownershipContext: "charter",
  boatId: boat.id,
  nights: 6,
  adults: 4,
  children: 0,
  infants: 0,
  pets: 0,
  profile: { ...DEFAULT_TRIP_PROFILE },
});

const checkInId = ensureTripInspection(getTrip(trip.id)!, "check_in", boat.type);
let session = getSessionForTrip(trip.id);
assert.ok(session, "session created with check-in");
assert.equal(session!.checkinInspectionId, checkInId, "check-in linked to session");
assert.equal(session!.tripId, trip.id, "session linked to trip");

const checkOutId = ensureTripInspection(getTrip(trip.id)!, "check_out", boat.type);
session = getSessionForTrip(trip.id);
assert.equal(session!.checkoutInspectionId, checkOutId, "check-out linked to SAME session");

// Aynı denetim tekrar istenirse yeni oturum açılmaz
assert.equal(ensureTripInspection(getTrip(trip.id)!, "check_in", boat.type), checkInId);

// --- Check-in verisi: sorun + foto + sayaçlar --------------------------------
const checkIn = getInspection(checkInId)!;
const tpl = getTemplateById(checkIn.templateId)!;
const anyItem = tpl.sections[0].items.find((i) => i.inputKind === "status")!;
setItemStatus(checkIn, anyItem.id, "needs_attention", "çizik");
const issueId = upsertIssueForItem(checkIn, {
  templateItemId: anyItem.id,
  severity: "needs_attention" === "needs_attention" ? "medium" : "medium",
  title: "Gövde çiziği (mevcut)",
  description: "sancak baş omuzluk",
});
const m1 = addMedia(checkIn, { localUri: "file:///ci-photo-1.jpg", issueId });
addMedia(checkIn, { localUri: "file:///ci-photo-2.jpg", issueId });
upsertMeter(checkIn, "engine_hours", 1200);
upsertMeter(checkIn, "fuel_pct", 100);

// --- Eşleştirme üretimi (idempotent) -----------------------------------------
ensurePairsForSession(session!, new Map([[issueId, "Gövde çiziği (mevcut)"]]));
ensurePairsForSession(session!, new Map([[issueId, "Gövde çiziği (mevcut)"]]));
let pairs = listPairs(session!.id);
assert.equal(pairs.length, 2, "one pair per check-in photo, no duplicates");
assert.equal(pairs[0].label, "Gövde çiziği (mevcut)");
assert.equal(pairs[0].checkoutMediaId, null);

// --- Check-out: yeniden çekim + inceleme bayrağı -----------------------------
const checkOut = getInspection(checkOutId)!;
const co1 = addMedia(checkOut, { localUri: "file:///co-photo-1.jpg" });
const target = pairs.find((p) => p.checkinMediaId === m1)!;
setPairCheckoutMedia(target.id, co1);
setPairReview(target.id, true, "açı farklı, tekrar bak");
pairs = listPairs(session!.id);
const updated = pairs.find((p) => p.id === target.id)!;
assert.equal(updated.checkoutUri, "file:///co-photo-1.jpg");
assert.equal(updated.requiresReview, true);

// --- Sayaç karşılaştırması ----------------------------------------------------
upsertMeter(checkOut, "engine_hours", 1234.5);
upsertMeter(checkOut, "fuel_pct", 60);
const cmp = compareMeters(
  [
    { kind: "engine_hours", value: 1200, unit: "h" },
    { kind: "fuel_pct", value: 100, unit: "%" },
    { kind: "water_pct", value: 80, unit: "%" },
  ],
  [
    { kind: "engine_hours", value: 1234.5, unit: "h" },
    { kind: "fuel_pct", value: 60, unit: "%" },
  ]
);
assert.equal(cmp.find((c) => c.kind === "engine_hours")!.delta, 34.5);
assert.equal(cmp.find((c) => c.kind === "fuel_pct")!.delta, -40);
assert.equal(cmp.find((c) => c.kind === "water_pct")!.delta, null, "missing side → no delta");

// --- Oturum durumu türetme ----------------------------------------------------
assert.equal(deriveHandoverStatus(null, null), "draft");
assert.equal(deriveHandoverStatus("in_progress", null), "check_in_in_progress");
assert.equal(deriveHandoverStatus("completed", null), "checked_in");
assert.equal(deriveHandoverStatus("completed", "in_progress"), "check_out_in_progress");
assert.equal(deriveHandoverStatus("completed", "completed"), "completed");

// --- Rapor metni: olgular var, sonuç cümlesi yok ------------------------------
const report = buildHandoverReportText({
  productName: "BoatCheck",
  tripName: trip.name,
  boatName: boat.name,
  dates: "2026-08-01 → 2026-08-07",
  meters: cmp,
  checkInIssues: [{ title: "Gövde çiziği (mevcut)", severity: "medium", description: "sancak baş" }],
  checkOutIssues: [{ title: "Usturmaça kılıfı yıpranmış", severity: "low" }],
  reviewFlaggedPairs: 1,
  totalPairs: 2,
  labels: {
    checkIn: "Check-in",
    checkOut: "Check-out",
    delta: "fark",
    existingObservations: "Check-in'de kaydedilenler",
    newObservations: "Check-out'ta kaydedilenler",
    photoPairs: "Foto eşleştirmeleri",
    flaggedForReview: "incelemeye işaretli",
    factsDisclaimer: "Bu özet yalnızca olguları kaydeder.",
    meterNames: { engine_hours: "Motor saati", fuel_pct: "Yakıt", water_pct: "Su" },
  },
});
assert.ok(report.includes("Motor saati: 1200 h → 1234.5 h  (fark: +34.5 h)"));
assert.ok(report.includes("Yakıt: 100 % → 60 %  (fark: -40 %)"));
assert.ok(report.includes("Gövde çiziği"));
assert.ok(report.includes("Foto eşleştirmeleri: 2 · incelemeye işaretli: 1"));
assert.ok(report.includes("yalnızca olguları"));
// Yasak sonuç dilinden örnekler raporda YOK (madde 2.3)
for (const banned of ["new damage", "caused", "liab", "seaworthy", "yeni hasar", "sorumlu"]) {
  assert.ok(!report.toLowerCase().includes(banned), `report must not contain "${banned}"`);
}

console.log("handover.test.ts: ALL PASS");
