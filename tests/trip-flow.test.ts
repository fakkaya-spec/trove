// Trip + ikmal uçtan uca testi — gerçek SQLite (better-sqlite3).
// Faz 1-2 kabul kriterlerinin veri katmanı doğrulaması.
// Çalıştırma: npx tsx tests/trip-flow.test.ts
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
// Migration'lar tekrarlanabilir olmalı: ikinci çağrı hata vermemeli, tablo bozmamalı
migrate(expoLikeAdapter(sqlite));
const db = drizzle(sqlite, { schema }) as unknown as Db;
__setDbForTesting(db);
seedIfNeeded(db);
seedIfNeeded(db); // seed idempotent olmalı

import { listTemplates, getBestTemplate } from "../src/repositories/templates";
import { createVessel } from "../src/repositories/vessels";
import {
  createTrip,
  ensureTripInspection,
  getTrip,
  getTripModuleStates,
  listTrips,
} from "../src/repositories/trips";
import {
  addCustomItem,
  deleteItem,
  generatePlan,
  listPlanItems,
  planProgress,
  updateItem,
} from "../src/repositories/provisioning";
import { getItemResults, setItemStatus, getInspection, completeInspection } from "../src/repositories/inspections";
import { getTemplateById } from "../src/repositories/templates";
import { checkCompletion, toResultMap } from "../src/domain/inspection";
import { DEFAULT_TRIP_PROFILE } from "../src/domain/types";
import { quantityToBuy } from "../src/domain/provisioning";

// --- Seed: 5 şablon + kurallar ---------------------------------------------
const templates = listTemplates();
assert.equal(templates.length, 5, `5 templates expected, got ${templates.length}`);
for (const kind of ["charter_check_in", "charter_check_out", "pre_departure", "return_secure"]) {
  assert.ok(templates.some((t) => t.kind === kind), `template kind ${kind} present`);
}
assert.ok(getBestTemplate("motor", "pre_departure"), "motor pre-departure template");
assert.ok(getBestTemplate("catamaran", "pre_departure"), "fallback to sailing for catamaran");

// --- Trip oluşturma ---------------------------------------------------------
const boat = createVessel({ name: "S/Y Meltemi", type: "sailing", ownershipType: "owned" });
const trip = createTrip({
  name: "Gökova Weekend",
  tripType: "weekend",
  ownershipContext: "own",
  boatId: boat.id,
  nights: 2,
  adults: 2,
  children: 2,
  infants: 0,
  pets: 0,
  profile: {
    ...DEFAULT_TRIP_PROFILE,
    breakfastsAboard: 2,
    lunchesAboard: 3,
    dinnersAboard: 2,
    climate: "hot",
    style: "balanced",
    allergies: "fıstık",
  },
});
assert.equal(listTrips().length, 1);
assert.equal(getTrip(trip.id)!.profile.allergies, "fıstık", "profile persisted");

// --- İkmal planı ------------------------------------------------------------
const plan = generatePlan(trip, "tr");
const plan2 = generatePlan(trip, "tr");
assert.equal(plan.id, plan2.id, "generatePlan idempotent");
assert.ok(plan.inputs, "inputs snapshot stored");
assert.equal(plan.inputs!.days, 3, "weekend + 2 nights = 3 days");

let items = listPlanItems(plan.id);
assert.ok(items.length >= 15, `expected ≥15 provision items, got ${items.length}`);
// Sıcak iklim + çocuklu sefer: su kalemi ve çocuk kalemi mevcut
const water = items.find((i) => i.category === "drinking_water")!;
assert.ok(water.finalQty > 0);
assert.ok(water.explanation, "explanation stored");
assert.ok(water.explanation!.modifiers.some((m) => m.label === "hot_climate"));
assert.ok(items.some((i) => i.category === "children"), "children rule applied");
assert.ok(items.some((i) => i.category === "emergency_reserve"), "emergency reserve present");
// Buzdolabı var + freezer yok → buz kuralı uygulanır
assert.ok(items.some((i) => i.category === "ice"));

// Stok düşme + durumlar
updateItem(water.id, { onboardQty: 6 });
items = listPlanItems(plan.id);
const water2 = items.find((i) => i.id === water.id)!;
assert.equal(quantityToBuy(water2.finalQty, water2.onboardQty), water2.finalQty - 6);

// Özel kalem ekle / düzenle / sil
const customId = addCustomItem(plan.id, { name: "Limon", category: "fruit_veg", unit: "pcs", finalQty: 6 });
updateItem(customId, { finalQty: 8, state: "purchased" });
items = listPlanItems(plan.id);
assert.equal(items.find((i) => i.id === customId)!.finalQty, 8);
deleteItem(customId);
assert.ok(!listPlanItems(plan.id).some((i) => i.id === customId), "soft-deleted item hidden");

// İlerleme: hepsini purchased yap → %100
for (const item of listPlanItems(plan.id)) {
  updateItem(item.id, { state: "purchased" });
}
assert.equal(planProgress(plan.id).percent, 100);

// --- Trip'e bağlı pre-departure denetimi ------------------------------------
const inspId = ensureTripInspection(getTrip(trip.id)!, "pre_departure", boat.type);
assert.equal(ensureTripInspection(getTrip(trip.id)!, "pre_departure", boat.type), inspId, "idempotent");
const insp = getInspection(inspId)!;
const tpl = getTemplateById(insp.templateId)!;
const statusItems = tpl.sections.flatMap((s) => s.items.filter((i) => i.inputKind === "status"));
assert.ok(statusItems.length >= 50, `pre-departure has ${statusItems.length} items`);

// Kritikleri işaretle + tamamla
for (const item of statusItems) setItemStatus(insp, item.id, "working");
const completion = checkCompletion(tpl.sections, toResultMap(getItemResults(inspId)));
assert.equal(completion.canComplete, true);
completeInspection(inspId);

// --- Modül durumları & dönüş kontrolü ---------------------------------------
let states = getTripModuleStates(getTrip(trip.id)!);
assert.equal(states.preDeparture, "completed");
assert.equal(states.provisioningPercent, 100);
assert.equal(states.returnCheck, null);

const returnId = ensureTripInspection(getTrip(trip.id)!, "return_secure", boat.type);
const returnInsp = getInspection(returnId)!;
const returnTpl = getTemplateById(returnInsp.templateId)!;
const returnItems = returnTpl.sections.flatMap((s) => s.items.filter((i) => i.inputKind === "status"));
assert.equal(returnItems.length, 22, "return template item count");
for (const item of returnItems) setItemStatus(returnInsp, item.id, "working");
completeInspection(returnId);

states = getTripModuleStates(getTrip(trip.id)!);
assert.equal(states.returnCheck, "completed");

console.log(
  `trip-flow.test.ts: ALL PASS (${templates.length} templates, plan items: ${listPlanItems(plan.id).length}, pre-dep items: ${statusItems.length})`
);
