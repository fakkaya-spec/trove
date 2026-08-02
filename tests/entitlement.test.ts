// Entitlement politikası testleri — KİLİTLİ MONETIZATION kurallarının kanıtı:
//  - Foto kapasiteleri yalnız Premium + geçerli doğrulama penceresinde açılır.
//  - Çevrimdışı grace: son doğrulamadan OFFLINE_GRACE_DAYS gün sonra kapanır.
//  - Pencere dışına düşmek yalnız YENİ çekimi kapatır (okuma bu katmandan geçmez).
//  - Bağlam takibi (kural 9): her paywall açılışı bağlam sayacını artırır.
// Çalıştırma: npx tsx tests/entitlement.test.ts
import assert from "node:assert/strict";
import {
  capabilitiesFor,
  CONTEXT_CAPABILITY,
  OFFLINE_GRACE_DAYS,
  PAYWALL_CONTEXTS,
  trackContext,
  withinGrace,
} from "../src/entitlement/policy";

const DAY = 24 * 60 * 60 * 1000;
const now = Date.parse("2026-08-02T12:00:00.000Z");
const iso = (ms: number) => new Date(ms).toISOString();

// --- Ücretsiz kullanıcı: tüm foto kapasiteleri kapalı ------------------------
const free = capabilitiesFor({ isPremium: false, lastVerifiedAt: null }, now);
assert.equal(free.canCapturePhoto, false);
assert.equal(free.canImportPhoto, false);
assert.equal(free.canAttachPhoto, false);
assert.equal(free.canCreatePhotoPair, false);
assert.equal(free.canSyncNewPhotos, false);

// Premium bayrağı olsa bile hiç doğrulanmadıysa kapalı (damga provider'da atılır)
assert.equal(
  capabilitiesFor({ isPremium: true, lastVerifiedAt: null }, now).canCapturePhoto,
  false
);

// --- Premium + taze doğrulama: hepsi açık ------------------------------------
const fresh = capabilitiesFor({ isPremium: true, lastVerifiedAt: iso(now) }, now);
assert.ok(
  fresh.canCapturePhoto && fresh.canImportPhoto && fresh.canAttachPhoto &&
  fresh.canCreatePhotoPair && fresh.canSyncNewPhotos
);

// --- Çevrimdışı grace penceresi ----------------------------------------------
assert.equal(withinGrace(iso(now - (OFFLINE_GRACE_DAYS - 1) * DAY), now), true);
assert.equal(withinGrace(iso(now - OFFLINE_GRACE_DAYS * DAY), now), true, "pencere dahil");
assert.equal(withinGrace(iso(now - (OFFLINE_GRACE_DAYS + 1) * DAY), now), false);
assert.equal(withinGrace(null, now), false);
assert.equal(withinGrace("not-a-date", now), false);
// Saat geriye alınmışsa (gelecek damga) kullanıcı cezalandırılmaz
assert.equal(withinGrace(iso(now + DAY), now), true);

// Pencere dışı: Premium önbelleği olsa da yeni çekim kapalı
const stale = capabilitiesFor(
  { isPremium: true, lastVerifiedAt: iso(now - (OFFLINE_GRACE_DAYS + 1) * DAY) },
  now
);
assert.equal(stale.canCapturePhoto, false, "grace dışı yeni çekim kapalı");

// --- Bağlam eşlemesi tam ve tanımlı -------------------------------------------
assert.equal(PAYWALL_CONTEXTS.length, 5);
for (const ctx of PAYWALL_CONTEXTS) {
  assert.ok(CONTEXT_CAPABILITY[ctx], `context '${ctx}' bir kapasiteye eşlenmeli`);
}

// --- Bağlam sayacı (kural 9) --------------------------------------------------
let counts = trackContext({}, "inspection_photo");
counts = trackContext(counts, "inspection_photo");
counts = trackContext(counts, "gallery_import");
assert.equal(counts.inspection_photo, 2);
assert.equal(counts.gallery_import, 1);
assert.equal(counts.log_photo, 0);
// Saflık: girdi nesnesi değişmez
const base = { inspection_photo: 1 } as const;
trackContext(base, "inspection_photo");
assert.equal(base.inspection_photo, 1);

console.log(
  `entitlement.test.ts: ALL PASS (grace ${OFFLINE_GRACE_DAYS}d, ${PAYWALL_CONTEXTS.length} contexts)`
);
