// Seyir defteri (Faz 5) uçtan uca testleri — gerçek SQLite, DOSYA tabanlı:
// yeniden başlatma kalıcılığı gerçek kapat/aç ile kanıtlanır.
// Kapsam (görev listesi 1-18): migration yükseltmesi (4→5, mevcut veriyle),
// CRUD + kalıcılık + sync kuyruğu, örnek izolasyonu (3 yön), ücretsiz metin /
// Premium foto kapısı / süresi dolmuş Premium / çevrimdışı grace, navigasyon
// sözleşmesi, yer tutucu verinin kalktığı, i18n anahtar bütünlüğü.
// Çalıştırma: npx tsx tests/log.test.ts
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, existsSync } from "node:fs";
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

const dir = mkdtempSync(join(tmpdir(), "trove-log-"));
const dbFile = join(dir, "log-test.sqlite");

// --- 1) Migration yükseltmesi: v4 şeması + MEVCUT veri → v5 -----------------
let sqlite = new Database(dbFile);
migrateUpTo(expoLikeAdapter(sqlite), 4);
// FK zorlaması AÇIK (cihazla aynı): v4 altında geçerli ebeveyn zinciri +
// medyaya FK ile bağlı handover_pairs satırı — yeniden kurulumun en zorlu
// gerçek senaryosu.
const now = new Date().toISOString();
const S3 = [now, now];
sqlite
  .prepare(`INSERT INTO vessels (id, name, type, created_at, updated_at) VALUES ('v-legacy','Old Boat','sailing',?,?)`)
  .run(...S3);
sqlite
  .prepare(
    `INSERT INTO inspection_templates (id, boat_type, name_json, is_active, created_at, updated_at) VALUES ('t-legacy','sailing','{}',0,?,?)`
  )
  .run(...S3);
sqlite
  .prepare(
    `INSERT INTO handover_sessions (id, vessel_id, created_at, updated_at) VALUES ('s-legacy','v-legacy',?,?)`
  )
  .run(...S3);
sqlite
  .prepare(
    `INSERT INTO inspections (id, session_id, vessel_id, template_id, template_version, started_at, created_at, updated_at)
     VALUES ('i-legacy','s-legacy','v-legacy','t-legacy',1,?,?,?)`
  )
  .run(now, ...S3);
sqlite
  .prepare(
    `INSERT INTO media_assets (id, inspection_id, issue_id, kind, local_uri, taken_at, upload_state, created_at, updated_at)
     VALUES ('m-legacy', 'i-legacy', NULL, 'photo', 'media/legacy.jpg', ?, 'pending', ?, ?)`
  )
  .run(now, ...S3);
sqlite
  .prepare(
    `INSERT INTO handover_pairs (id, session_id, checkin_media_id, created_at, updated_at)
     VALUES ('p-legacy','s-legacy','m-legacy',?,?)`
  )
  .run(...S3);
migrate(expoLikeAdapter(sqlite)); // 5 uygulanır (FK'lı bağımlı veriyle)
migrate(expoLikeAdapter(sqlite)); // tekrarlanabilir olmalı
const legacyMedia = sqlite
  .prepare(`SELECT inspection_id, log_entry_id, local_uri FROM media_assets WHERE id='m-legacy'`)
  .get() as { inspection_id: string; log_entry_id: string | null; local_uri: string };
assert.equal(legacyMedia.inspection_id, "i-legacy", "eski medya inspection bağını korur");
assert.equal(legacyMedia.log_entry_id, null, "eski medya log bağı NULL başlar");
assert.equal(legacyMedia.local_uri, "media/legacy.jpg", "yeniden kurulumda veri kaybı yok");
assert.ok(
  sqlite.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name='log_entries'`).get(),
  "log_entries tablosu oluştu"
);
assert.ok(
  sqlite.prepare(`SELECT id FROM handover_pairs WHERE checkin_media_id='m-legacy'`).get(),
  "medyaya bağlı handover_pairs satırı yeniden kurulumdan sağ çıkar"
);
assert.equal(
  (sqlite.prepare(`PRAGMA foreign_key_check`).all() as unknown[]).length,
  0,
  "migration sonrası FK bütünlüğü temiz"
);

let db = drizzle(sqlite, { schema }) as unknown as Db;
__setDbForTesting(db);
seedIfNeeded(db);

import { createVessel } from "../src/repositories/vessels";
import { createTrip } from "../src/repositories/trips";
import {
  addLogMedia,
  createLogEntry,
  deleteLogEntry,
  getLogEntry,
  listLogEntries,
  listLogEntriesByVessel,
  listLogMedia,
  listSampleLogEntries,
  pendingLogSyncIds,
  SampleReadOnlyError,
  updateLogEntry,
} from "../src/repositories/log";
import {
  compareLogEntriesDesc,
  deriveTitle,
  formatOccurredAt,
  logSyncState,
} from "../src/domain/log";
import { features } from "../src/config/features";
import {
  capabilitiesFor,
  CONTEXT_CAPABILITY,
  OFFLINE_GRACE_DAYS,
} from "../src/entitlement/policy";
import { DEFAULT_TRIP_PROFILE } from "../src/domain/types";
import { LOG_STRINGS } from "../src/i18n/log";

// --- 2-3) Metin kaydı oluştur + listele -------------------------------------
const boat = createVessel({ name: "S/Y Test", type: "sailing" });
const trip = createTrip({
  name: "Log Test Trip",
  tripType: "weekend",
  ownershipContext: "own",
  boatId: boat.id,
  nights: 2,
  adults: 2,
  children: 0,
  infants: 0,
  pets: 0,
  profile: DEFAULT_TRIP_PROFILE,
});

const e1 = createLogEntry({
  tripId: trip.id,
  type: "note",
  title: deriveTitle("Fuelled up at the marina\nsecond line ignored"),
  description: "Fuelled up at the marina",
  occurredAt: "2026-08-01T10:00:00.000Z",
});
const e2 = createLogEntry({
  tripId: trip.id,
  type: "observation",
  title: "Winch noise",
  severity: "minor",
  place: "Cockpit",
  occurredAt: "2026-08-01T12:00:00.000Z",
});
assert.equal(e1.title, "Fuelled up at the marina", "başlık ilk satırdan türetilir");
assert.equal(e1.vesselId, boat.id, "vessel trip'ten devralınır");

let list = listLogEntries(trip.id);
assert.equal(list.length, 2);
assert.equal(list[0].id, e2.id, "en yeni üstte (occurred_at desc)");
assert.equal(listLogEntriesByVessel(boat.id).length, 2, "tekneye göre listeleme");

// --- 7) Sync kuyruğu --------------------------------------------------------
assert.ok(pendingLogSyncIds().has(e1.id), "create sync kuyruğuna düşer");

// --- 5) Güncelleme ----------------------------------------------------------
updateLogEntry(e1.id, { place: "Murter marina" });
assert.equal(getLogEntry(e1.id)!.place, "Murter marina");

// --- 13) Medya bağlama (ikili çoğaltılmaz; tek media_assets satırı) ---------
const mediaId = addLogMedia(e2.id, "media/winch.jpg");
const media = listLogMedia(e2.id);
assert.equal(media.length, 1);
assert.equal(media[0].id, mediaId);
assert.equal(media[0].localUri, "media/winch.jpg");
assert.equal(media[0].inspectionId, null, "log medyası denetimsiz yaşar");

// --- 6) Soft delete ---------------------------------------------------------
const e3 = createLogEntry({ tripId: trip.id, type: "general", title: "Will be deleted" });
deleteLogEntry(e3.id);
assert.ok(!listLogEntries(trip.id).some((e) => e.id === e3.id), "soft delete listeden gizler");

// --- 8-10) Örnek izolasyonu -------------------------------------------------
const sampleLogs = listSampleLogEntries(SAMPLE_IDS.tripSerenity);
assert.equal(sampleLogs.length, 5, "Serenity örnek defteri 5 kayıt taşır");
assert.equal(
  listLogEntries(SAMPLE_IDS.tripSerenity).length,
  0,
  "gerçek sorgu örnek kayıtları ASLA görmez"
);
assert.ok(
  !listSampleLogEntries(trip.id).some((e) => e.id === e1.id),
  "örnek mod gerçek kayıtları ASLA görmez"
);
assert.throws(
  () => createLogEntry({ tripId: SAMPLE_IDS.tripSerenity, type: "note", title: "x" }),
  SampleReadOnlyError,
  "örnek sefere gerçek-yol yazımı reddedilir"
);
assert.throws(() => updateLogEntry("smp-log-winch", { title: "hack" }), SampleReadOnlyError);
assert.throws(() => deleteLogEntry("smp-log-winch"), SampleReadOnlyError);
assert.throws(() => addLogMedia("smp-log-winch", "media/x.jpg"), SampleReadOnlyError);
assert.ok(
  !pendingLogSyncIds().has("smp-log-winch"),
  "örnek kayıtlar sync kuyruğuna asla girmez"
);

// --- 4) Yeniden başlatma kalıcılığı (gerçek kapat/aç) -----------------------
sqlite.close();
sqlite = new Database(dbFile);
migrate(expoLikeAdapter(sqlite)); // açılış migration'ı idempotent
db = drizzle(sqlite, { schema }) as unknown as Db;
__setDbForTesting(db);
list = listLogEntries(trip.id);
assert.equal(list.length, 2, "kayıtlar yeniden başlatmadan sağ çıkar");
assert.equal(getLogEntry(e1.id)!.place, "Murter marina", "güncelleme kalıcı");
assert.equal(listLogMedia(e2.id).length, 1, "medya bağı kalıcı");
assert.equal(listSampleLogEntries(SAMPLE_IDS.tripSerenity).length, 5, "örnekler kalıcı");

// --- 11-12, 14-15) Ücretsiz/Premium politika sözleşmesi ---------------------
// (11) Ücretsiz kullanıcı metin kaydı: repository katmanında HİÇBİR yetki
// kontrolü yok — yukarıdaki tüm metin yazımları abonelik durumundan bağımsız
// çalıştı; bu, 'metin asla engellenmez' kuralının veri-katmanı kanıtıdır.
// (12) Foto eylemi log_photo bağlamıyla canCapturePhoto ister:
assert.equal(CONTEXT_CAPABILITY.log_photo, "canCapturePhoto");
const t0 = Date.parse("2026-08-02T12:00:00.000Z");
const DAY = 24 * 60 * 60 * 1000;
assert.equal(
  capabilitiesFor({ isPremium: false, lastVerifiedAt: null }, t0).canCapturePhoto,
  false,
  "ücretsiz kullanıcıda foto kapısı kapalı → paywall açılır"
);
// (13) Premium foto ekleyebilir:
assert.equal(
  capabilitiesFor({ isPremium: true, lastVerifiedAt: new Date(t0).toISOString() }, t0)
    .canCapturePhoto,
  true
);
// (14) Süresi dolmuş Premium: yeni çekim kapalı, ESKİ foto okunur kalır —
// listLogMedia yetkiden bağımsızdır:
assert.equal(
  capabilitiesFor(
    { isPremium: true, lastVerifiedAt: new Date(t0 - (OFFLINE_GRACE_DAYS + 1) * DAY).toISOString() },
    t0
  ).canCapturePhoto,
  false
);
assert.equal(listLogMedia(e2.id).length, 1, "mevcut kanıt asla rehin tutulmaz");
// (15) Çevrimdışı grace penceresi içinde Premium çekebilir:
assert.equal(
  capabilitiesFor(
    { isPremium: true, lastVerifiedAt: new Date(t0 - (OFFLINE_GRACE_DAYS - 1) * DAY).toISOString() },
    t0
  ).canCapturePhoto,
  true
);

// --- 16-17) Navigasyon sözleşmesi + yer tutucu kalktı -----------------------
const root = join(__dirname, "..");
const app = readFileSync(join(root, "App.tsx"), "utf8");
assert.ok(app.includes('name="AddLog"'), "AddLog kök stack'te kayıtlı");
assert.ok(app.includes("component={LogScreen}"), "LogTab LogScreen'i gösterir");
assert.ok(!app.includes("LogPlaceholder"), "placeholder navigasyondan kalktı");
assert.ok(
  !existsSync(join(root, "src", "screens", "log", "LogPlaceholderScreen.tsx")),
  "LogPlaceholderScreen dosyası kaldırıldı"
);
const logScreenSrc = readFileSync(join(root, "src", "screens", "log", "LogScreen.tsx"), "utf8");
assert.ok(!logScreenSrc.includes("PLACEHOLDER_ENTRIES"), "sahte veri kalmadı");
assert.ok(logScreenSrc.includes("listLogEntries"), "liste repository'den gelir");
const addLogSrc = readFileSync(join(root, "src", "screens", "log", "AddLogScreen.tsx"), "utf8");
assert.ok(addLogSrc.includes("createLogEntry"), "kaydetme repository'ye yazar");
assert.ok(addLogSrc.includes('requestAccess("log_photo")'), "foto merkezî kapıdan geçer");
assert.ok(!addLogSrc.includes("TODO"), "TODO kalmadı");

// --- Yerel saat gösterimi (saklama UTC, gösterim yerel + dile duyarlı) ------
const IST = "Europe/Istanbul"; // UTC+3
const midday = formatOccurredAt("2026-08-01T10:00:00.000Z", "tr", IST);
assert.ok(midday.includes("13:00"), `UTC 10:00 → UTC+3'te 13:00 (görülen: ${midday})`);
assert.ok(midday.includes("1 Ağu"), `gün yerel dilimde ve dile duyarlı (görülen: ${midday})`);
// Gece yarısı devrilmesi: UTC 22:30 → yerel ertesi gün 01:30
const rollover = formatOccurredAt("2026-08-01T22:30:00.000Z", "tr", IST);
assert.ok(rollover.includes("01:30"), `devrilme saati (görülen: ${rollover})`);
assert.ok(rollover.includes("2 Ağu"), `tarih ertesi güne devrilir (görülen: ${rollover})`);
// Bozuk damga: ham değer döner, uydurma dönüşüm yok
assert.equal(formatOccurredAt("not-a-timestamp", "tr", IST), "not-a-timestamp");
// Kronolojik sıra SAKLANAN UTC değerine göredir (yerel görünümden bağımsız)
const utcSorted = [
  { occurredAt: "2026-08-01T10:00:00.000Z" },
  { occurredAt: "2026-08-01T22:30:00.000Z" },
].sort(compareLogEntriesDesc);
assert.equal(utcSorted[0].occurredAt, "2026-08-01T22:30:00.000Z", "UTC'ye göre en yeni üstte");
assert.equal(list[0].id, e2.id, "repository sıralaması saklanan UTC üstünden sürer");

// --- Senkron dürüstlüğü: tüketici yokken yalnız 'bu cihazda kayıtlı' --------
assert.equal(features.syncWorker, false, "MVP: senkron tüketicisi henüz yok");
assert.equal(logSyncState(true, features.syncWorker), "saved_device",
  "kuyrukta beklese bile tüketici yokken 'senkron bekliyor' VAAT EDİLMEZ");
assert.equal(logSyncState(false, features.syncWorker), "saved_device");
// Gerçek tüketici açılınca ayrım hazır:
assert.equal(logSyncState(true, true), "waiting_sync");
assert.equal(logSyncState(false, true), "synced");
assert.ok(
  readFileSync(join(__dirname, "..", "src", "screens", "log", "LogScreen.tsx"), "utf8")
    .includes("logSyncState("),
  "karar merkezî yardımcıda; satır başına elle kurulmaz"
);

// --- Migration bütünlük kapısı ----------------------------------------------
// Geçerli yükseltilmiş DB geçer (yukarıdaki ana akış + foreign_key_check=0).
// Kasıtlı bozuk FK migration'ı AÇIKÇA düşürür ve FK geri açık kalır:
{
  const dir2 = mkdtempSync(join(tmpdir(), "trove-mig-"));
  const brokenFile = join(dir2, "broken.sqlite");
  const sq2 = new Database(brokenFile);
  migrateUpTo(expoLikeAdapter(sq2), 4);
  sq2.pragma("foreign_keys = OFF");
  sq2
    .prepare(
      `INSERT INTO media_assets (id, inspection_id, kind, local_uri, taken_at, upload_state, created_at, updated_at)
       VALUES ('m-orphan','ghost-inspection','photo','media/x.jpg',?, 'pending', ?, ?)`
    )
    .run(now, now, now);
  sq2.pragma("foreign_keys = ON");
  assert.throws(
    () => migrate(expoLikeAdapter(sq2)),
    /integrity check failed/i,
    "bozuk FK ile migration açıkça başarısız olur"
  );
  assert.equal(
    sq2.pragma("foreign_keys", { simple: true }),
    1,
    "başarısızlıkta bile foreign_keys geri açılır (finally)"
  );
  sq2.close();
  rmSync(dir2, { recursive: true, force: true });
}

// --- 18) i18n anahtar bütünlüğü ---------------------------------------------
const enKeys = Object.keys(LOG_STRINGS.en).sort();
for (const loc of ["tr", "de", "ru", "es", "hr", "it", "el", "fr"] as const) {
  assert.deepEqual(Object.keys(LOG_STRINGS[loc]).sort(), enKeys, `${loc} anahtarları tam`);
}
for (const [k, v] of Object.entries(LOG_STRINGS.en))
  assert.ok(typeof v === "string" && v.length > 0, `en.${k} boş olamaz`);
for (const [k, v] of Object.entries(LOG_STRINGS.tr))
  assert.ok(typeof v === "string" && v.length > 0, `tr.${k} boş olamaz`);

sqlite.close();
rmSync(dir, { recursive: true, force: true });

console.log(
  `log.test.ts: ALL PASS (migration 4→5 + restart persistence, isolation 5/0, entitlement gate, i18n ${enKeys.length} keys)`
);
