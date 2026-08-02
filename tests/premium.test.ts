// Premium temel + beta tam erişim sözleşme testleri (sprint Faz A/B/D/E/O):
// beta seam merkezî ve tek nokta · beta kapalıyken normal kapı · satın alma
// beta'da asla çağrılmaz · oturum koruması (inActiveFlow + dismissedModules) ·
// giriş noktaları yalnız gerçek yeteneklerde · dürüst metin (var olmayan
// yetenek reklamı yok) · i18n paritesi · sabit fiyat yok.
// Çalıştırma: npx tsx tests/premium.test.ts
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  ALL_CAPABILITIES,
  BETA_FULL_ACCESS,
  capabilitiesFor,
  OFFLINE_GRACE_DAYS,
} from "../src/entitlement/policy";
import {
  __resetSessionForTests,
  dismissModule,
  enterActiveFlow,
  exitActiveFlow,
  isInActiveFlow,
  isModuleDismissed,
  subscribeSession,
} from "../src/entitlement/session";
import { PREMIUM_STRINGS, type PremiumStrings } from "../src/i18n/premium";

const root = join(__dirname, "..");
const read = (...p: string[]) => readFileSync(join(root, ...p), "utf8");

// --- 1) Beta tam erişim: merkezî, tek nokta, geri alınabilir ----------------
assert.equal(typeof BETA_FULL_ACCESS, "boolean", "beta anahtarı tek merkezî sabit");
for (const v of Object.values(ALL_CAPABILITIES)) {
  assert.equal(v, true, "beta kapasite kümesi yalnız MEVCUT yetenekleri tam verir");
}
// Saf kapı hesabı beta'dan HABERSİZ kalır — bayrak kapatılınca davranış
// otomatik geri gelir (kanıt: süresi dolmuş durum kapalı).
const DAY = 24 * 60 * 60 * 1000;
const t0 = Date.parse("2026-08-01T00:00:00Z");
assert.equal(
  capabilitiesFor(
    { isPremium: true, lastVerifiedAt: new Date(t0 - (OFFLINE_GRACE_DAYS + 1) * DAY).toISOString() },
    t0
  ).canCapturePhoto,
  false,
  "beta kapalıyken normal kapı: grace dışı = kapalı"
);
const providerSrc = read("src", "entitlement", "index.tsx");
assert.ok(
  /if \(BETA_FULL_ACCESS\) return true;/.test(providerSrc),
  "requestAccess beta'da kapıyı hiç açmaz (paywall yok, bağlam sayımı yok)"
);
assert.ok(
  /BETA_FULL_ACCESS \? ALL_CAPABILITIES : real/.test(providerSrc),
  "kapasite seam'i tek noktada (provider snapshot)"
);
assert.ok(
  !providerSrc.includes("purchase(") && !providerSrc.includes("requestPurchase"),
  "beta erişimi satın alma ÇAĞIRMAZ, sahte işlem/abonelik kaydı üretmez"
);
assert.ok(
  /premiumActive: real\.canCapturePhoto/.test(providerSrc),
  "premiumActive daima GERÇEK yetkidir (beta'dan bağımsız)"
);
// Ekran katmanında beta koşulu YOK (per-screen conditional yasağı)
import { readdirSync, statSync } from "node:fs";
function walk(p: string): string[] {
  return readdirSync(p).flatMap((n) => {
    const f = join(p, n);
    return statSync(f).isDirectory() ? walk(f) : [f];
  });
}
for (const f of walk(join(root, "src", "screens"))) {
  assert.ok(
    !readFileSync(f, "utf8").includes("BETA_FULL_ACCESS"),
    `${f.split("/").pop()}: ekranlar beta bayrağını bilmez — seam merkezîdir`
  );
}

// --- 2) Oturum koruması: inActiveFlow + dismissedModules --------------------
__resetSessionForTests();
assert.equal(isInActiveFlow(), false);
enterActiveFlow();
enterActiveFlow(); // iç içe akış sayacı
exitActiveFlow();
assert.equal(isInActiveFlow(), true, "iç içe akışta koruma sürer");
exitActiveFlow();
assert.equal(isInActiveFlow(), false);
assert.equal(isModuleDismissed("log"), false);
let notified = 0;
const unsub = subscribeSession(() => {
  notified += 1;
});
dismissModule("log");
assert.equal(isModuleDismissed("log"), true, "oturum içinde tekrar gösterilmez");
assert.ok(notified > 0, "görünürlük dinleyicileri tetiklenir");
unsub();
__resetSessionForTests();
assert.equal(isModuleDismissed("log"), false, "kalıcılık YOK — her açılış temiz (testte reset)");
// Kalıcılık gerçekten yok: session.ts hiçbir storage kullanmaz
const sessionSrc = read("src", "entitlement", "session.ts");
assert.ok(
  !sessionSrc.includes("AsyncStorage") && !sessionSrc.includes("getDb"),
  "oturum durumu bellekte — yeniden başlatmada sıfırlanır"
);

// --- 3) Giriş noktaları: yalnız gerçek yetenekler, doğru yerleşim -----------
const entryRow = read("src", "components", "premium", "PremiumEntryRow.tsx");
assert.ok(
  entryRow.includes("premiumActive") && !entryRow.includes("capabilities.canCapturePhoto"),
  "giriş satırı GERÇEK Premium'da gizlenir; beta'da görünür kalır (spec §9)"
);
assert.ok(
  /withinOwnFlow && isInActiveFlow\(\)|!withinOwnFlow && isInActiveFlow\(\)/.test(entryRow) &&
    entryRow.includes("isModuleDismissed"),
  "giriş satırı aktif akışta ve oturumda kapatılan modülde görünmez"
);
const checklistSrc = read("src", "screens", "trip", "prepare", "TripChecklistScreen.tsx");
assert.ok(
  /kind === "check_in" && !readOnly[\s\S]{0,200}PremiumEntryRow/.test(checklistSrc) &&
    checklistSrc.includes("withinOwnFlow"),
  "denetim girişi yalnız check-in sonunda (doğal sınır), maddeleri KESMEZ"
);
assert.ok(
  checklistSrc.includes("enterActiveFlow()"),
  "aktif kontrol listesi inActiveFlow korumasını açar"
);
const addLogSrc = read("src", "screens", "log", "AddLogScreen.tsx");
assert.ok(
  addLogSrc.includes("enterActiveFlow()") && addLogSrc.includes('module="log"'),
  "jurnal girişi korumalı; log ufku kamera alanının yanında"
);
assert.ok(
  read("src", "screens", "trip", "underway", "TripCompleteState.tsx").includes("PremiumReportCta"),
  "rapor ufku tamamlanan sefer yüzeyinde"
);
// D3/D4: kodlanmamış derinlik için ÖLÜ EYLEM YOK (yorum notu serbest,
// JSX kullanımı yasak)
assert.ok(
  !read("src", "screens", "trip", "prepare", "TripShoppingScreen.tsx").includes("<PremiumEntryRow"),
  "ikmal kişiselleştirme kodda yok → giriş satırı yok (ölü eylem yasağı)"
);
assert.ok(
  !read("src", "screens", "trip", "prepare", "TripCrewScreen.tsx").includes("<PremiumEntryRow"),
  "mürettebat derinliği kodda yok → giriş satırı yok"
);
// Underway'de kendiliğinden Premium yüzeyi YOK
const underwaySrc = read("src", "screens", "trip", "underway", "UnderwayScreen.tsx");
assert.ok(
  !underwaySrc.includes("Premium") && !underwaySrc.includes("Upgrade"),
  "Underway operasyonel yüzeyinde Premium daveti yok (§3)"
);

// --- 4) Yükseltme sayfası: kapanış tutarlı, taslak korunur ------------------
const sheetSrc = read("src", "screens", "premium", "UpgradeSheetScreen.tsx");
assert.ok(
  /beforeRemove[\s\S]{0,80}dismissModule\(module\)/.test(sheetSrc),
  "her kapanış yolu (donanım geri dahil) modülü oturum için işaretler"
);
const appSrc = read("App.tsx");
assert.ok(
  /name="Upgrade"[\s\S]{0,300}presentation: "transparentModal"/.test(appSrc),
  "yükseltme sayfası şeffaf modal — alttaki ekran (taslak dahil) yaşar"
);
assert.ok(
  /const module = CONTEXT_MODULE\[context\];/.test(appSrc),
  "kapı bağlamları modül sayfasına, settings tam paywall'a gider"
);

// --- 5) Dürüst metin: var olmayan yetenek 'benefits' içinde reklam edilmez --
const FORBIDDEN_IN_BENEFITS = [
  /\bAI\b/i,
  /voice/i,
  /cloud/i,
  /multilingual/i,
  /signature/i,
  /web package/i,
  /meal.?plan/i,
  /allerg/i,
];
const en = PREMIUM_STRINGS.en;
for (const mod of ["inspection", "log", "report"] as const) {
  for (const b of en.modules[mod].benefits) {
    for (const rx of FORBIDDEN_IN_BENEFITS) {
      assert.ok(!rx.test(b), `${mod} benefit "${b}" kodda olmayan yeteneği vaat edemez`);
    }
  }
  const n = en.modules[mod].benefits.length;
  assert.ok(n >= 2 && n <= 4, `${mod}: 2-4 fayda satırı (spec §5), şu an ${n}`);
}
// Paywall karşılaştırması yalnız gerçek satırlar (ikmal/mürettebat derinliği yok)
const paywallSrc = read("src", "screens", "PaywallScreen.tsx");
assert.ok(
  !paywallSrc.includes("cmpProvisioningPremium") && !paywallSrc.includes("cmpCrewPremium"),
  "paywall tablosu kodlanmamış derinliği reklam etmez"
);
assert.ok(
  paywallSrc.includes("paywallHeadline") && paywallSrc.includes("ctaNotNow"),
  "paywall onaylı başlık + 'Şimdi değil' ikincil eylemi taşır"
);
// Sabit fiyat yok: fiyat yalnız mağaza verisinden
for (const f of ["src/screens/PaywallScreen.tsx", "src/screens/premium/UpgradeSheetScreen.tsx"]) {
  const src = read(...f.split("/"));
  assert.ok(
    !/[$€£]\s?\d|\d+[.,]\d{2}\s?(USD|EUR|TL)|\d+[.,]99/.test(src),
    `${f} sabit fiyat içeremez — fiyat yalnız mağazadan`
  );
  assert.ok(src.includes("prices.") || src.includes("storeAvailable"), `${f} mağaza verisini kullanır`);
}

// --- 6) i18n paritesi: 9 dil, aynı anahtarlar; en+tr modül metinleri tam ----
const locales = Object.keys(PREMIUM_STRINGS);
assert.equal(locales.length, 9, "9 dil");
const enKeys = JSON.stringify(Object.keys(en).sort());
for (const loc of locales) {
  const s = PREMIUM_STRINGS[loc as keyof typeof PREMIUM_STRINGS] as PremiumStrings;
  assert.equal(JSON.stringify(Object.keys(s).sort()), enKeys, `${loc} anahtar paritesi`);
  for (const mod of Object.keys(en.modules) as (keyof PremiumStrings["modules"])[]) {
    assert.equal(
      s.modules[mod].benefits.length,
      en.modules[mod].benefits.length,
      `${loc}/${mod} fayda satırı paritesi`
    );
  }
}
assert.notEqual(PREMIUM_STRINGS.tr.ctaUpgrade, en.ctaUpgrade, "TR çevirisi gerçek (kopya değil)");

console.log(
  "premium.test.ts: ALL PASS (beta seam central+reversible, session protection, honest copy, entry placement, i18n parity, no fixed prices)"
);
