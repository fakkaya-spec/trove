// Örnek veri izolasyon testleri — KİLİTLİ ürün şartının dört kanıtı:
//  1) Örnekler gerçek tekne/sefer sorgularında ASLA görünmez.
//  2) Örnek modda gerçek kayıtlar ASLA görünmez.
//  3) Örnekleri silmek/sıfırlamak gerçek veriye dokunAMAZ (ve tersi).
//  4) Sayım/geçmiş/rapor akışları örnek + gerçek kayıtları ASLA karıştırmaz.
// Gerçek SQLite üzerinde koşar (better-sqlite3, repos.test ile aynı düzen).
import assert from "node:assert/strict";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import type { SQLiteDatabase } from "expo-sqlite";
import { migrate } from "../src/db/migrations";
import * as schema from "../src/db/schema";
import { seedIfNeeded } from "../src/db/seed";
import { __setDbForTesting, Db } from "../src/db/client";
import { DEFAULT_TRIP_PROFILE } from "../src/domain/types";

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

import { resetSamples, SAMPLE_IDS } from "../src/db/seed/samples";
import {
  listVessels,
  listSampleVessels,
  createVessel,
  getVesselById,
} from "../src/repositories/vessels";
import {
  listTrips,
  listSampleTrips,
  createTrip,
  deleteTrip,
  getTrip,
  updateTripStatus,
  setTripBoat,
  updateTripCrew,
  updateTripProfile,
  ensureTripInspection,
} from "../src/repositories/trips";
import { SampleReadOnlyError } from "../src/repositories/log";
import { listInspections, listIssues } from "../src/repositories/inspections";
import { syncQueue } from "../src/db/schema";

// seedIfNeeded örnekleri de kurdu.
assert.equal(listSampleVessels().length, 3, "3 örnek tekne seed edilmeli");
assert.equal(listSampleTrips().length, 3, "3 örnek sefer seed edilmeli");

// Gerçek kayıtlar oluştur
const realVessel = createVessel({ name: "Gerçek Tekne", type: "sailing" });
const realTrip = createTrip({
  name: "Gerçek Sefer",
  tripType: "weekend",
  ownershipContext: "own",
  boatId: realVessel.id,
  nights: 2,
  adults: 2,
  children: 0,
  infants: 0,
  pets: 0,
  profile: DEFAULT_TRIP_PROFILE,
});

// --- 1) Örnekler gerçek sorgularda görünmez --------------------------------
const realVessels = listVessels();
const realTrips = listTrips();
assert.equal(realVessels.length, 1, "gerçek tekne listesi yalnız 1 kayıt içermeli");
assert.equal(realTrips.length, 1, "gerçek sefer listesi yalnız 1 kayıt içermeli");
assert.ok(realVessels.every((v) => !v.isSample && !v.id.startsWith("smp-")));
assert.ok(realTrips.every((t) => !t.isSample && !t.id.startsWith("smp-")));

// --- 2) Örnek modda gerçek kayıtlar görünmez -------------------------------
const sampleVessels = listSampleVessels();
const sampleTrips = listSampleTrips();
assert.ok(sampleVessels.every((v) => v.isSample && v.id.startsWith("smp-")));
assert.ok(sampleTrips.every((t) => t.isSample && t.id.startsWith("smp-")));
assert.ok(!sampleVessels.some((v) => v.id === realVessel.id), "gerçek tekne örneklere sızmamalı");
assert.ok(!sampleTrips.some((t) => t.id === realTrip.id), "gerçek sefer örneklere sızmamalı");

// Kimlikle erişim her iki kümeye de çalışır (örnek detayına girilebilir)
assert.equal(getVesselById(SAMPLE_IDS.serenity)?.isSample, true);
assert.equal(getVesselById(realVessel.id)?.isSample, false);

// --- 4) Sayım/geçmiş/rapor akışları karışmaz -------------------------------
const allInspections = listInspections();
assert.ok(
  !allInspections.some((i) => i.id === SAMPLE_IDS.checkin),
  "listInspections örnek denetimi içermemeli"
);
// Örnek denetim içeriği yalnız hedefli (id ile) erişimde görünür:
assert.equal(listIssues(SAMPLE_IDS.checkin).length, 2, "örnek check-in 2 gözlem taşımalı");

// --- H1) Örnek sefere GERÇEK-YOL mutasyonu repository'de reddedilir ---------
// Her koruma yazımdan ÖNCE koşar: sync_queue'ya tek satır bile düşmez.
const smp = SAMPLE_IDS.tripSerenity;
const syncRowsBefore = db.select().from(syncQueue).all().length;
assert.throws(() => updateTripStatus(smp, "completed"), SampleReadOnlyError);
assert.throws(() => setTripBoat(smp, realVessel.id), SampleReadOnlyError);
assert.throws(
  () => updateTripCrew(smp, { skipperName: "Hacker", crewNames: [] }),
  SampleReadOnlyError
);
assert.throws(
  () => updateTripProfile(smp, DEFAULT_TRIP_PROFILE),
  SampleReadOnlyError
);
assert.throws(() => deleteTrip(smp), SampleReadOnlyError);
// ensureTripInspection: VAR OLAN örnek denetim salt okunur döner (keşif)...
const sampleTrip = getTrip(smp)!;
assert.equal(
  ensureTripInspection(sampleTrip, "check_in", "sailing"),
  SAMPLE_IDS.checkin,
  "var olan örnek denetim salt okunur açılabilir"
);
// ...ama örnek sefer için YENİ denetim asla oluşturulamaz:
assert.throws(
  () => ensureTripInspection(sampleTrip, "pre_departure", "sailing"),
  SampleReadOnlyError,
  "örnek sefere yeni denetim oluşturulamaz"
);
assert.equal(
  db.select().from(syncQueue).all().length,
  syncRowsBefore,
  "reddedilen mutasyonlar sync_queue'ya HİÇBİR satır düşürmez"
);
assert.equal(getTrip(smp)!.status, "active", "örnek sefer verisi değişmedi");
assert.equal(getTrip(smp)!.skipperName, "Marco Rossi", "örnek kaptan değişmedi");

// --- 3) Örnek sıfırlama gerçek veriye dokunamaz ----------------------------
resetSamples(db);
assert.equal(listSampleVessels().length, 3, "reset sonrası örnekler yeniden kuruldu");
assert.equal(listVessels().length, 1, "reset gerçek tekneyi silmemeli");
assert.equal(listTrips().length, 1, "reset gerçek seferi silmemeli");
assert.equal(listTrips()[0].id, realTrip.id);

// Ters yön: gerçek silme örnekleri etkilemez
deleteTrip(realTrip.id);
assert.equal(listTrips().length, 0);
assert.equal(listSampleTrips().length, 3, "gerçek silme örnekleri etkilememeli");

console.log("samples.test.ts: ALL PASS (isolation: real 1/1, samples 3/3, reset safe)");
