// Para kazanma hizalama testleri — KİLİTLİ felsefenin kod kanıtı:
// ücretsiz gerçekten kullanışlı · kapılar merkezî · okuma asla kapılanmaz ·
// taslak paywall'dan sağ çıkar · iptal ≠ hata · örnekler entitlement tüketmez ·
// ham abonelik sorgusu yok · paywall yalnız gerçek faydaları listeler ·
// sabit fiyat yok. Çalıştırma: npx tsx tests/monetization.test.ts
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import {
  capabilitiesFor,
  CONTEXT_CAPABILITY,
  OFFLINE_GRACE_DAYS,
  PAYWALL_CONTEXTS,
} from "../src/entitlement/policy";
import { ENTITLEMENT_STRINGS } from "../src/i18n/entitlement";

const root = join(__dirname, "..");
const read = (...p: string[]) => readFileSync(join(root, ...p), "utf8");

// --- 1-3) Temel akışlar ücretsiz: repository katmanında yetki kontrolü YOK --
for (const repo of [
  "provisioning.ts",
  "trips.ts",
  "inspections.ts",
  "log.ts",
  "completion.ts",
  "report.ts",
]) {
  const src = read("src", "repositories", repo);
  assert.ok(
    !/from ["'].*entitlement/.test(src) &&
      !src.includes("usePremium") &&
      !src.includes("isPremium"),
    `repositories/${repo} abonelikten tamamen bağımsız (ücretsiz temel akış + okuma asla kapılanmaz)`
  );
}
// Ekran düzeyi: kontrol listesi tamamlama ve metin log kaydetme kapısız
const checklist = read("src", "screens", "trip", "prepare", "TripChecklistScreen.tsx");
assert.ok(
  (checklist.match(/requestAccess\(/g) ?? []).length === 1 &&
    checklist.includes('requestAccess("inspection_photo")'),
  "kontrol listesinde tek kapı var ve yalnız FOTO içindir — işaretleme/tamamlama ücretsiz"
);
const addLog = read("src", "screens", "log", "AddLogScreen.tsx");
assert.ok(
  !addLog.includes("requestAccess") || addLog.includes('requestAccess("log_photo")'),
  "AddLog'da kapı yalnız foto"
);
assert.ok(
  addLog.indexOf("createLogEntry") > 0 && !addLog.includes('requestAccess("log_text'),
  "metin kaydetme yolu kapısız"
);

// --- 4, 8) Süresi dolan Premium: eski medya okunur; grace penceresi korunur --
const t0 = Date.parse("2026-08-02T12:00:00.000Z");
const DAY = 86400000;
const expired = capabilitiesFor(
  { isPremium: true, lastVerifiedAt: new Date(t0 - (OFFLINE_GRACE_DAYS + 1) * DAY).toISOString() },
  t0
);
assert.equal(expired.canCapturePhoto, false, "süresi dolunca YENİ çekim kapalı");
// okuma yolları (listMedia/listLogMedia) yukarıda kanıtlandı: repo katmanı
// abonelikten habersiz → mevcut kanıt daima okunur.
assert.equal(
  capabilitiesFor(
    { isPremium: true, lastVerifiedAt: new Date(t0 - (OFFLINE_GRACE_DAYS - 1) * DAY).toISOString() },
    t0
  ).canCapturePhoto,
  true,
  "çevrimdışı grace penceresi geçerli"
);

// --- 5, 10) Tüm kapılar merkezî; ham abonelik sorgusu yok --------------------
function walk(dirPath: string): string[] {
  return readdirSync(dirPath).flatMap((name) => {
    const full = join(dirPath, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}
const screenFiles = walk(join(root, "src", "screens")).filter((f) => f.endsWith(".tsx"));
// Legacy (bayrak arkasında, yeni akış dışı) + satın alma yüzeylerinin
// kendileri muaf (paywall + modül yükseltme sayfası — tasarım sistemi §5):
const RAW_ALLOWED = [
  "PaywallScreen.tsx",
  "HomeScreen.tsx",
  "PremiumScreen.tsx",
  "UpgradeSheetScreen.tsx",
];
for (const file of screenFiles) {
  const base = file.split("/").pop()!;
  const src = readFileSync(file, "utf8");
  if (src.includes("usePremium")) {
    assert.ok(
      RAW_ALLOWED.includes(base),
      `${base} ham abonelik durumu sorguluyor — ekranlar yalnız entitlement kapısını kullanmalı`
    );
  }
  // capturePhoto çağıran her yeni-akış ekranı merkezî kapıdan geçmeli
  if (src.includes("capturePhoto(") && !RAW_ALLOWED.includes(base)) {
    assert.ok(src.includes("requestAccess("), `${base} foto çekimini merkezî kapıya bağlamalı`);
  }
}

// --- 6) Taslak paywall gezintisinden sağ çıkar -------------------------------
const app = read("App.tsx");
assert.ok(
  /name="Paywall"[\s\S]{0,200}presentation: "modal"/.test(app),
  "paywall MODAL — altta duran ekranın (yazılmış metin dahil) state'i korunur"
);
assert.ok(addLog.includes("beforeRemove"), "AddLog taslağı kasıtsız kapanışa karşı korunur");

// --- 7) Satın alma iptali hata olarak gösterilmez ---------------------------
const premiumSrc = read("src", "premium.tsx");
assert.ok(
  /purchaseErrorListener\(\(\) => setBusy\(false\)\)/.test(premiumSrc),
  "iptal/hata dinleyicisi yalnız meşgul durumunu sıfırlar — Alert yok, akış korunur"
);

// --- 9) Örnek veri Premium entitlement tüketmez ------------------------------
// Örnek seferlerde foto düğmeleri readOnly korumasıyla kapıya hiç ULAŞMAZ:
assert.ok(
  /async function addPhoto[\s\S]{0,80}if \(readOnly/.test(checklist),
  "örnek modda foto eylemi kapıdan önce durur (paywall bağlam sayacı kirlenmez)"
);

// --- 11) Paywall yalnız gerçekleşmiş faydaları listeler ----------------------
for (const [k, v] of Object.entries(ENTITLEMENT_STRINGS.en)) {
  assert.ok(
    !/\bAI\b|cloud|voice|backup/i.test(v),
    `en.${k} henüz var olmayan yetenek vaat etmiyor`
  );
}

// --- 12) Sabit fiyat yok ------------------------------------------------------
const priceLike = /\$\s?\d|(\d+[.,]99)|₺\s?\d|EUR\s?\d/;
for (const file of [
  ...walk(join(root, "src", "i18n")),
  join(root, "src", "screens", "PaywallScreen.tsx"),
  join(root, "src", "entitlement", "policy.ts"),
]) {
  assert.ok(
    !priceLike.test(readFileSync(file, "utf8")),
    `${file.split("/").pop()} sabit fiyat içermez (fiyat yalnız mağazadan gelir)`
  );
}

// --- Bağlam bütünlüğü ---------------------------------------------------------
assert.equal(PAYWALL_CONTEXTS.length, 6);
for (const ctx of PAYWALL_CONTEXTS) {
  assert.ok(CONTEXT_CAPABILITY[ctx], `context '${ctx}' kapasiteye eşlenmiş`);
  assert.ok(
    (ENTITLEMENT_STRINGS.en[`ctx_${ctx}` as keyof typeof ENTITLEMENT_STRINGS.en] ?? "").length > 0,
    `context '${ctx}' kendini açıklıyor (sessiz kapı yok)`
  );
}
// Ayarlar'da gönüllü Premium girişi mevcut ve paywall'a gider
const profile = read("src", "screens", "ProfileScreen.tsx");
assert.ok(
  profile.includes('navigate("Paywall", { context: "settings" })'),
  "Ayarlar'dan Premium keşif girişi var"
);

console.log(
  `monetization.test.ts: ALL PASS (free flows ungated, central gates, drafts survive paywall, no prices, ${PAYWALL_CONTEXTS.length} contexts)`
);
