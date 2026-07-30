// Repository + seed + yaşam döngüsü uçtan uca testi — gerçek SQLite üzerinde
// (better-sqlite3). Faz 0 kabul kriterlerinin veri katmanı doğrulaması.
// Çalıştırma: npx tsx tests/repos.test.ts
import assert from "node:assert/strict";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import type { SQLiteDatabase } from "expo-sqlite";
import { migrate } from "../src/db/migrations";
import * as schema from "../src/db/schema";
import { seedIfNeeded } from "../src/db/seed";
import { __setDbForTesting, Db } from "../src/db/client";

// expo-sqlite arayüzünün migration runner'ın kullandığı alt kümesi
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

// Repositories DB enjekte edildikten sonra import edilmeli (getDb çağrıları için)
import { getActiveTemplate, getInventoryDefs } from "../src/repositories/templates";
import {
  approveSection,
  completeInspection,
  createCheckInInspection,
  getInspection,
  getItemResults,
  listInventoryCounts,
  listIssues,
  listMeters,
  setItemStatus,
  upsertInventoryCount,
  upsertIssueForItem,
  upsertMeter,
} from "../src/repositories/inspections";
import { createVessel, listVessels } from "../src/repositories/vessels";
import { checkCompletion, toResultMap } from "../src/domain/inspection";

// --- Seed doğrulaması -------------------------------------------------------
const template = getActiveTemplate("sailing");
assert.ok(template, "seeded sailing template must exist");
assert.equal(template.sections.length, 7, "7 sections expected");
const statusItems = template.sections.flatMap((s) => s.items.filter((i) => i.inputKind === "status"));
const meterItems = template.sections.flatMap((s) => s.items.filter((i) => i.inputKind === "meter"));
assert.ok(statusItems.length >= 90, `expected ≥90 status items, got ${statusItems.length}`);
assert.equal(meterItems.length, 5, "5 meter items expected");
assert.ok(statusItems.some((i) => i.isCritical), "critical items present");
// 5 dil dolu mu?
for (const lang of ["en", "tr", "de", "ru", "es"]) {
  assert.ok(statusItems.every((i) => (i.title[lang] ?? "").length > 0), `all titles in ${lang}`);
}
const inventory = getInventoryDefs(template.id);
assert.equal(inventory.length, 9, "9 inventory defs expected");

// --- Kabul kriterleri: akış -------------------------------------------------
// 1-2) Tekne + inspection oluştur
const vessel = createVessel({ name: "S/Y Test", type: "sailing" });
assert.equal(listVessels().length, 1);
const created = createCheckInInspection({
  vesselId: vessel.id,
  templateId: template.id,
  templateVersion: template.version,
  locale: "tr",
});
assert.equal(created.status, "draft");
assert.ok(created.sessionId, "handover session linked");

// 5) Madde sorunlu işaretle → draft otomatik in_progress
const insp = getInspection(created.id)!;
const firstSection = template.sections[0];
const normalItem = firstSection.items.find((i) => !i.isCritical && i.inputKind === "status")!;
const criticalItem = firstSection.items.find((i) => i.isCritical && i.inputKind === "status")!;
setItemStatus(insp, normalItem.id, "not_working", "test notu");
assert.equal(getInspection(insp.id)!.status, "in_progress", "draft -> in_progress on first mutation");

// 6) Sorun kaydı
upsertIssueForItem(insp, {
  templateItemId: normalItem.id,
  severity: "high",
  title: "Test issue",
  description: "kırık",
  reportedToCompany: true,
});
assert.equal(listIssues(insp.id).length, 1);
// idempotent upsert
upsertIssueForItem(insp, { templateItemId: normalItem.id, severity: "low", title: "Test issue" });
assert.equal(listIssues(insp.id).length, 1, "issue upsert must not duplicate");

// 4) Toplu onay: kritik hariç
approveSection(insp, firstSection);
let results = toResultMap(getItemResults(insp.id));
assert.equal(results.get(criticalItem.id)?.status ?? "unchecked", "unchecked", "critical skipped by bulk");
assert.equal(results.get(normalItem.id)?.status, "not_working", "issue status preserved by bulk");
const nonCritical = firstSection.items.filter((i) => !i.isCritical && i.inputKind === "status");
assert.ok(
  nonCritical.every((i) => (results.get(i.id)?.status ?? "unchecked") !== "unchecked"),
  "all non-critical items checked after bulk approve"
);

// 7) Sayaçlar
upsertMeter(insp, "engine_hours", 1234.5);
upsertMeter(insp, "fuel_pct", 100);
upsertMeter(insp, "water_pct", 80);
upsertMeter(insp, "engine_hours", 1235); // upsert güncellemeli
const meters = listMeters(insp.id);
assert.equal(meters.length, 3);
assert.equal(meters.find((m) => m.kind === "engine_hours")!.value, 1235);

// Envanter
upsertInventoryCount(insp, inventory[0].id, 6);
assert.equal(listInventoryCounts(insp.id).get(inventory[0].id), 6);

// 8) Kapat-aç simülasyonu: her şey DB'den geri okunuyor
results = toResultMap(getItemResults(insp.id));
assert.equal(results.get(normalItem.id)?.note, "test notu", "note persisted");

// 9) Tamamlama koruması: kritikler unchecked iken engellenir
let completion = checkCompletion(template.sections, results);
assert.equal(completion.canComplete, false, "blocked while criticals unchecked");
assert.ok(completion.blockingItems.length > 0);

// Tüm kritikleri işaretle + kalan bölümleri topluca onayla
for (const section of template.sections) {
  for (const item of section.items) {
    if (item.inputKind === "status" && item.isCritical) setItemStatus(insp, item.id, "working");
  }
  approveSection(insp, section);
}
results = toResultMap(getItemResults(insp.id));
completion = checkCompletion(template.sections, results);
assert.equal(completion.canComplete, true);
assert.equal(completion.warningItems.length, 0);

// 10) Tamamla + özet verisi
completeInspection(insp.id);
const done = getInspection(insp.id)!;
assert.equal(done.status, "completed");
assert.ok(done.completedAt, "completedAt set");

// Geçersiz geçiş reddi
assert.throws(() => completeInspection(insp.id), /Invalid inspection transition/);

console.log(
  `repos.test.ts: ALL PASS (template: ${statusItems.length} status + ${meterItems.length} meter items, ` +
    `${inventory.length} inventory defs)`
);
