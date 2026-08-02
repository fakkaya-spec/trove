// Faz 7 (Complete/rapor) testleri — gerçek SQLite, DOSYA tabanlı (onay ve
// rapor kaydının yeniden başlatma kalıcılığı gerçek kapat/aç ile kanıtlanır).
// Kapsam: migration 6→7 mevcut veriyle · Temel/Tam seçim + kritik görünürlük
// + kritik atlanamaz · açık madde birleştirme (log+denetim) + sınıflandırma ·
// sayaç deltası · medya bütünlüğü · onay kalıcılığı · rapor view-model +
// HTML içerik/boş bölüm/çevrimdışı/yasak dil · üretim hatası veri kaybetmez ·
// durum geçişi · navigasyon sözleşmesi · i18n bütünlüğü.
// Çalıştırma: npx tsx tests/complete.test.ts
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

const dir = mkdtempSync(join(tmpdir(), "trove-complete-"));
const dbFile = join(dir, "complete.sqlite");

// --- 1) Migration 6→7: mevcut veriyle yükseltme -----------------------------
let sqlite = new Database(dbFile);
migrateUpTo(expoLikeAdapter(sqlite), 6);
const now = new Date().toISOString();
sqlite
  .prepare(
    `INSERT INTO log_entries (id, type, title, occurred_at, created_at, updated_at)
     VALUES ('pre7-entry','observation','Pre-7 observation',?,?,?)`
  )
  .run(now, now, now);
migrate(expoLikeAdapter(sqlite)); // 7 uygulanır
migrate(expoLikeAdapter(sqlite)); // idempotent
assert.ok(
  sqlite.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name='trip_signoffs'`).get(),
  "trip_signoffs tablosu oluştu"
);
assert.ok(
  sqlite.prepare(`SELECT id FROM log_entries WHERE id='pre7-entry'`).get(),
  "mevcut veri yükseltmede korunur"
);
assert.equal(
  (sqlite.prepare(`PRAGMA foreign_key_check`).all() as unknown[]).length,
  0,
  "FK bütünlüğü temiz"
);

let db = drizzle(sqlite, { schema }) as unknown as Db;
__setDbForTesting(db);
seedIfNeeded(db);

import { createVessel } from "../src/repositories/vessels";
import { createTrip, ensureTripInspection, getTrip, updateTripStatus } from "../src/repositories/trips";
import {
  completeInspection,
  getInspection,
  getItemResults,
  listMedia,
  setItemStatus,
  upsertIssueForItem,
  upsertMeter,
  addMedia,
} from "../src/repositories/inspections";
import { getTemplateById, getBestTemplate } from "../src/repositories/templates";
import { createLogEntry, addLogMedia, listLogMedia } from "../src/repositories/log";
import {
  addSignoff,
  listOpenItems,
  listSignoffs,
  resolveOpenItem,
  reviewByCategory,
} from "../src/repositories/completion";
import {
  categorize,
  checkDepthOf,
  essentialItemIds,
  reportFileName,
} from "../src/domain/completion";
import { checkCompletion, toResultMap } from "../src/domain/inspection";
import { buildReportHtml } from "../src/domain/report";
import { collectTripReport, makeReportLabels, saveReportRecord, getReportForTrip, contentHashOf } from "../src/repositories/report";
import { generateTripReport, ReportUnavailableError } from "../src/report/generate";
import { DEFAULT_TRIP_PROFILE } from "../src/domain/types";
import { COMPLETE_STRINGS } from "../src/i18n/complete";
import { PREPARE_STRINGS } from "../src/i18n/prepare";

// --- 2-4) Temel/Tam seçim + kritikler ---------------------------------------
const returnTplRef = getBestTemplate("sailing", "return_secure")!;
const returnTpl = getTemplateById(returnTplRef.id)!;
const returnStatusItems = returnTpl.sections.flatMap((s) =>
  s.items.filter((i) => i.inputKind === "status")
);
const essential = essentialItemIds(returnTpl.sections);
const criticalIds = returnStatusItems.filter((i) => i.isCritical).map((i) => i.id);
assert.ok(criticalIds.length > 0, "dönüş şablonunda kritik madde var");
for (const cid of criticalIds)
  assert.ok(essential.has(cid), "her kritik madde temel kümede GÖRÜNÜR");
assert.ok(
  essential.size >= criticalIds.length && essential.size <= 15,
  `temel küme gerçekçi boyutta (${essential.size})`
);
assert.ok(essential.size < returnStatusItems.length, "temel küme tam listeden küçük");
// Küçük şablon (check_out, 8 madde): temel = tümü → geçiş anlamsız
const checkoutTplRef = getBestTemplate("sailing", "charter_check_out")!;
const checkoutTpl = getTemplateById(checkoutTplRef.id)!;
const checkoutStatus = checkoutTpl.sections.flatMap((s) =>
  s.items.filter((i) => i.inputKind === "status")
);
assert.equal(
  essentialItemIds(checkoutTpl.sections).size,
  checkoutStatus.length,
  "küçük şablonda temel=tam (filtre uygulanmaz)"
);
// Kritik atlanamaz: yalnız kritik-olmayan temel maddeler işaretliyse tamamlanamaz
{
  const onlyNonCritical = new Map(
    returnStatusItems
      .filter((i) => essential.has(i.id) && !i.isCritical)
      .map((i) => [i.id, { templateItemId: i.id, status: "working" as const }])
  );
  const check = checkCompletion(returnTpl.sections, onlyNonCritical);
  assert.equal(check.canComplete, false, "kritikler işaretlenmeden tamamlama BLOKLANIR");
  assert.ok(check.blockingItems.every((i) => i.isCritical));
}
// checkDepthOf: temel alt kümeyle "essential", tam kümeyle "full"
assert.equal(checkDepthOf(returnTpl.sections, essential), "essential");
assert.equal(
  checkDepthOf(returnTpl.sections, new Set(returnStatusItems.map((i) => i.id))),
  "full"
);

// --- Senaryo: kendi tekne seferi (dönüş listesi) ----------------------------
const boat = createVessel({ name: "S/Y Complete", type: "sailing" });
const trip = createTrip({
  name: "Complete Test",
  tripType: "weekend",
  ownershipContext: "own",
  boatId: boat.id,
  nights: 2,
  adults: 4,
  children: 0,
  infants: 0,
  pets: 0,
  skipperName: "Test Skipper",
  crewNames: ["Crew One"],
  destination: "Test Bay",
  startAt: "2026-08-01",
  endAt: "2026-08-03",
  profile: DEFAULT_TRIP_PROFILE,
});

// --- 5-8) Açık madde birleştirme + sınıflandırma ----------------------------
const obs = createLogEntry({ tripId: trip.id, type: "observation", title: "Winch noise" });
const returnInspId = ensureTripInspection(getTrip(trip.id)!, "return_secure", boat.type);
const returnInsp = getInspection(returnInspId)!;
const firstItem = returnStatusItems[0];
setItemStatus(returnInsp, firstItem.id, "needs_attention");
upsertIssueForItem(returnInsp, {
  templateItemId: firstItem.id,
  severity: "medium",
  title: "Checkout finding",
});
let open = listOpenItems(trip.id);
assert.ok(open.some((i) => i.source === "log" && i.id === obs.id), "log gözlemi incelemede");
assert.ok(
  open.some((i) => i.source === "inspection" && i.title === "Checkout finding"),
  "denetim sorunu incelemede"
);
const logItem = open.find((i) => i.id === obs.id)!;
const inspItem = open.find((i) => i.title === "Checkout finding")!;
assert.equal(categorize(logItem), "still_open", "sefer kaydı → hâlâ açık");
assert.equal(categorize(inspItem), "new_at_checkout", "dönüş/check-out bulgusu → yeni");
resolveOpenItem(logItem);
const grouped = reviewByCategory(trip.id);
assert.equal(grouped.resolved_during_trip.length, 1, "çözülen ayrı kategoride");
assert.ok(!listOpenItems(trip.id).some((i) => i.id === obs.id), "çözülen açıklardan düşer");

// --- 10) Medya bütünlüğü ----------------------------------------------------
const obs2 = createLogEntry({ tripId: trip.id, type: "observation", title: "With photo" });
addLogMedia(obs2.id, "media/photo1.jpg");
addMedia(returnInsp, { localUri: "media/photo2.jpg" });
assert.equal(listLogMedia(obs2.id).length, 1);
assert.equal(listMedia(returnInspId).length, 1);

// --- 9) Sayaç deltası (charter senaryosu) -----------------------------------
const cboat = createVessel({ name: "Charter Boat", type: "sailing", ownershipType: "chartered" });
const ctrip = createTrip({
  name: "Charter Complete",
  tripType: "weekend",
  ownershipContext: "charter",
  boatId: cboat.id,
  nights: 2,
  adults: 2,
  children: 0,
  infants: 0,
  pets: 0,
  profile: DEFAULT_TRIP_PROFILE,
});
const ciId = ensureTripInspection(getTrip(ctrip.id)!, "check_in", cboat.type);
const coId = ensureTripInspection(getTrip(ctrip.id)!, "check_out", cboat.type);
upsertMeter(getInspection(ciId)!, "engine_hours", 1204);
upsertMeter(getInspection(coId)!, "engine_hours", 1219);
const charterCollected = collectTripReport(ctrip.id, "en");
const engineRow = charterCollected.model.meters.find((m) => m.kind === "engine_hours")!;
assert.equal(engineRow.delta, 15, "sayaç deltası korunur (1219-1204)");

// --- Dönüş listesini tamamla → rapor modeli ---------------------------------
for (const item of returnStatusItems) {
  if (getItemResults(returnInspId).some((r) => r.templateItemId === item.id)) continue;
  setItemStatus(returnInsp, item.id, "working");
}
completeInspection(returnInspId);

// --- 11) Onay + kalıcılık ---------------------------------------------------
addSignoff({ tripId: trip.id, role: "skipper", name: "Test Skipper" });
assert.equal(listSignoffs(trip.id).length, 1);

// --- 12) Rapor view-model ---------------------------------------------------
const collected = collectTripReport(trip.id, "en");
const model = collected.model;
assert.equal(model.tripName, "Complete Test");
assert.equal(model.vesselName, "S/Y Complete");
assert.equal(model.destination, "Test Bay");
assert.equal(model.boatReturned, true, "tamamlanan dönüş → teslim edildi");
assert.equal(model.checkDepth, "full", "tüm maddeler işaretli → tam kontrol beyanı");
assert.equal(model.itemsTotal, returnStatusItems.length);
assert.equal(model.signoffs.length, 1);
assert.ok(model.totalPhotoCount >= 2, "denetim + log fotoğrafları sayılır");
assert.ok(collected.photoSources.some((p) => p.relPath === "media/photo1.jpg"));
assert.equal(model.newAtCheckoutCount, 1);

// --- 13-15, 21-22) HTML içerik sözleşmeleri ---------------------------------
const labels = makeReportLabels("en");
const html = buildReportHtml(
  { ...model, photos: [{ src: "data:image/jpeg;base64,QUJD", label: null, takenAt: "x" }] },
  labels
);
assert.ok(html.includes("Test Bay"), "sefer kimliği raporda");
assert.ok(html.includes("S/Y Complete"), "tekne raporda");
assert.ok(html.includes(labels.productName), "TROVE kimliği raporda");
assert.ok(html.includes(labels.returnedLabel), "teslim durumu ilk blokta");
assert.ok(html.includes(labels.factsDisclaimer), "olgu bildirimi var");
assert.ok(html.includes(labels.localOriginNote), "cihazda-üretildi notu var");
assert.ok(!html.includes("http"), "dış kaynak/ağ referansı YOK (çevrimdışı)");
assert.ok(!html.includes("undefined") && !html.includes(">null<"), "sahte/boş veri yok");
assert.ok(
  !/legally certified|court-proof|insurer approved|tamper-proof/i.test(html),
  "desteklenmeyen hukuki/sigorta iddiası YOK"
);
// Boş isteğe bağlı bölümler temizce atlanır
const emptyHtml = buildReportHtml(
  { ...model, meters: [], photos: [], totalPhotoCount: 0, signoffs: [], review: { new_at_checkout: [], still_open: [], present_at_checkin: [], resolved_during_trip: [] }, newAtCheckoutCount: 0, openCount: 0 },
  labels
);
assert.ok(!emptyHtml.includes(labels.metersHeading), "verisiz sayaç bölümü yok");
assert.ok(!emptyHtml.includes(labels.photosHeading), "verisiz foto bölümü yok");
assert.ok(!emptyHtml.includes(labels.signoffsHeading), "verisiz onay bölümü yok");
// i18n metinlerinde de yasak dil yok
for (const [k, v] of Object.entries(COMPLETE_STRINGS.en))
  assert.ok(
    !/legally certified|court-proof|insurer approved|tamper-proof/i.test(v),
    `en.${k} yasak iddia içermez`
  );

// Dosya adı temizliği
assert.equal(
  reportFileName('S/Y "Fast" One:2', "Kornati / Islands"),
  "TROVE_S-Y-Fast-One-2_Kornati-Islands_Report.pdf"
);
assert.ok(!/[\\/:*?"<>|\s]/.test(reportFileName("a b", "c/d").replace(/^TROVE_/, "")));

// --- Rapor kaydı: yaz + yeniden üret aynı satırı günceller ------------------
const rec1 = saveReportRecord(returnInspId, "reports/x.pdf", html);
const rec2 = saveReportRecord(returnInspId, "reports/x.pdf", `${html} `);
assert.equal(rec1.id, rec2.id, "yeniden üretim yeni satır açmaz");
assert.notEqual(contentHashOf(html), contentHashOf(`${html} `));
assert.equal(getReportForTrip(trip.id)!.id, rec1.id);

// --- 16) Üretim hatası veri kaybetmez (node'da native yok → Unavailable) ----
// (CJS'te top-level await yok; kalan akış async blokta sürer.)
const before = {
  trip: getTrip(trip.id)!,
  open: listOpenItems(trip.id).length,
  signoffs: listSignoffs(trip.id).length,
};
(async () => {
await assert.rejects(
  () => generateTripReport(trip.id, "en"),
  ReportUnavailableError,
  "native ortam yoksa açık tipli hata"
);
assert.equal(getTrip(trip.id)!.status, before.trip.status, "durum değişmedi");
assert.equal(listOpenItems(trip.id).length, before.open, "maddeler olduğu gibi");
assert.equal(listSignoffs(trip.id).length, before.signoffs, "onaylar olduğu gibi");

// --- 17) Durum geçişi + tamamlamanın tek sahibi akıştır ---------------------
updateTripStatus(trip.id, "completed");
assert.equal(getTrip(trip.id)!.status, "completed");
const root = join(__dirname, "..");
const checklistSrc = readFileSync(
  join(root, "src", "screens", "trip", "prepare", "TripChecklistScreen.tsx"),
  "utf8"
);
assert.ok(
  !checklistSrc.includes("updateTripStatus"),
  "kontrol listesi seferi artık kendisi kapatmaz (akış kapatır)"
);
const completeSrc = readFileSync(
  join(root, "src", "screens", "trip", "complete", "TripCompleteScreen.tsx"),
  "utf8"
);
assert.ok(completeSrc.includes("updateTripStatus"), "kapanış Complete akışında");
assert.ok(completeSrc.includes("generateTripReport"), "rapor gerçek üreticiye bağlı");

// --- 18-19) Navigasyon sözleşmesi -------------------------------------------
const app = readFileSync(join(root, "App.tsx"), "utf8");
for (const routeName of ["TripComplete", "TripCheckout", "TripReturn"])
  assert.ok(app.includes(`name="${routeName}"`), `${routeName} rotası kayıtlı`);
const tripHome = readFileSync(join(root, "src", "screens", "trip", "TripHomeScreen.tsx"), "utf8");
assert.ok(tripHome.includes("TripCompleteState"), "completed sekme durumu bağlı");
const underwaySrc = readFileSync(
  join(root, "src", "screens", "trip", "underway", "UnderwayScreen.tsx"),
  "utf8"
);
assert.ok(underwaySrc.includes('navigate("TripComplete"'), "Underway bitirme → rehberli kapanış");

// --- 20) i18n bütünlüğü -----------------------------------------------------
const enKeys = Object.keys(COMPLETE_STRINGS.en).sort();
for (const loc of ["tr", "de", "ru", "es", "hr", "it", "el", "fr"] as const)
  assert.deepEqual(Object.keys(COMPLETE_STRINGS[loc]).sort(), enKeys, `${loc} anahtarları tam`);
for (const [k, v] of Object.entries(COMPLETE_STRINGS.tr))
  assert.ok(typeof v === "string" && v.length > 0, `tr.${k} boş olamaz`);

// --- M4) PREPARE_STRINGS anahtar paritesi (eksik olan modül eklendi) --------
const prepEnKeys = Object.keys(PREPARE_STRINGS.en).sort();
for (const loc of ["tr", "de", "ru", "es", "hr", "it", "el", "fr"] as const)
  assert.deepEqual(
    Object.keys(PREPARE_STRINGS[loc]).sort(),
    prepEnKeys,
    `prepare.${loc} anahtarları tam`
  );
for (const [k, v] of Object.entries(PREPARE_STRINGS.en))
  assert.ok(typeof v === "string" && v.length > 0, `prepare.en.${k} boş olamaz`);
for (const [k, v] of Object.entries(PREPARE_STRINGS.tr))
  assert.ok(typeof v === "string" && v.length > 0, `prepare.tr.${k} boş olamaz`);

// --- M2) Dokunma hedefi sözleşmesi (Faz 6/7 ekranları) ----------------------
for (const rel of [
  ["src", "screens", "trip", "complete", "TripCompleteScreen.tsx"],
  ["src", "screens", "trip", "underway", "TripCompleteState.tsx"],
] as const) {
  const src = readFileSync(join(root, ...rel), "utf8");
  const name = rel[rel.length - 1];
  assert.ok(src.includes("touch.min"), `${name} paylaşılan dokunma token'ını kullanır`);
  assert.ok(
    !/minHeight: 3\d\b/.test(src) && !/minHeight: 40\b/.test(src),
    `${name} standart altı etkileşimli hedef içermez`
  );
}

// --- 11 devam) Yeniden başlatma kalıcılığı (onay + rapor kaydı) -------------
sqlite.close();
sqlite = new Database(dbFile);
migrate(expoLikeAdapter(sqlite));
db = drizzle(sqlite, { schema }) as unknown as Db;
__setDbForTesting(db);
assert.equal(listSignoffs(trip.id).length, 1, "onay yeniden başlatmadan sağ çıkar");
assert.equal(getReportForTrip(trip.id)!.pdfPath, "reports/x.pdf", "rapor kaydı kalıcı");
assert.equal(getTrip(trip.id)!.status, "completed", "tamamlanma durumu kalıcı");

sqlite.close();
rmSync(dir, { recursive: true, force: true });

console.log(
  `complete.test.ts: ALL PASS (migration 6→7, essential ${essential.size}/${returnStatusItems.length}, review merge+classify, meters Δ15, report html contracts, restart persistence)`
);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
