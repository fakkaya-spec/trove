// Tasarım sistemi v1.0 sözleşme testleri — donmuş spesifikasyonun kod kanıtı:
// token paritesi (design-reference/tokens.ts ↔ src/theme.ts) · KEELLINE-1
// (gözlem kartları amber, mavi yalnız tamamlanmış) · KEELLINE-2 (karşılaştırma
// sütunları ↑/↓ okla ayrışır, yalnız renkle değil).
// Çalıştırma: npx tsx tests/design.test.ts
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { T as FROZEN_T, ICON as FROZEN_ICON } from "../design-reference/tokens";

const root = join(__dirname, "..");
const read = (...p: string[]) => readFileSync(join(root, ...p), "utf8");

// theme.ts react-native'e bağımlı olduğundan test ortamına import edilmez;
// T/TICON değerleri kaynak metinden okunur (mevcut sözleşme-testi deseni).
const themeSrc = read("src", "theme.ts");
const themeT = themeSrc.match(/export const T = \{[\s\S]*?\n\} as const;/)?.[0] ?? "";
assert.ok(themeT, "theme.ts T bloğu bulunmalı");
const themeValue = (key: string): string | number | undefined => {
  const m = themeT.match(new RegExp(`\\b${key}:\\s*(?:"([^"]*)"|(\\d+))`));
  if (!m) return undefined;
  return m[1] !== undefined ? m[1] : Number(m[2]);
};
const themeIcon = themeSrc.match(/export const TICON = \{([^}]*)\}/)?.[1] ?? "";

// --- 1) Token paritesi: RN T renkleri donmuş tokens.ts ile BİREBİR ---------
const COLOR_KEYS = [
  "bg", "surface", "surfaceEl",
  "ink0", "ink1", "ink2", "ink3",
  "rule", "ruleStr",
  "blue", "blueL", "green", "greenL",
  "amber", "amberL", "red", "redL",
  "vessel",
] as const;
for (const k of COLOR_KEYS) {
  assert.equal(
    themeValue(k),
    (FROZEN_T as Record<string, unknown>)[k],
    `theme.ts T.${k} donmuş tokens.ts ile aynı olmalı`
  );
}
// İkon ölçeği paritesi
for (const k of ["xs", "sm", "md", "lg", "xl"] as const) {
  const m = themeIcon.match(new RegExp(`\\b${k}:\\s*(\\d+)`));
  assert.equal(Number(m?.[1]), FROZEN_ICON[k], `TICON.${k} donmuş ICON ile aynı olmalı`);
}
// Yarıçaplar: web "14px" ↔ RN 14 (birim farkı meşru, sayı aynı)
assert.equal(`${themeValue("r")}px`, FROZEN_T.r);
assert.equal(`${themeValue("r2")}px`, FROZEN_T.r2);
assert.equal(`${themeValue("r3")}px`, FROZEN_T.r3);

// --- 2) KEELLINE-1: gözlem/açık madde sol çizgisi AMBER ---------------------
// (mavi KeelLine yalnız tamamlanmış/doğrulanmış öğelerde kalır)
const keelAmber = (src: string, styleName: string, file: string) => {
  const m = src.match(new RegExp(`${styleName}:\\s*\\{[^}]*backgroundColor:\\s*T\\.amber`, "s"));
  assert.ok(m, `${file}: ${styleName} amber sol çizgi kullanmalı (tasarım sistemi v1.0)`);
};
keelAmber(read("src", "screens", "trip", "underway", "UnderwayScreen.tsx"), "obsKeel", "UnderwayScreen");
keelAmber(read("src", "screens", "log", "LogScreen.tsx"), "keel", "LogScreen");
keelAmber(read("src", "screens", "trip", "complete", "TripCompleteScreen.tsx"), "obsKeel", "TripCompleteScreen");

// Tamamlanmış işaretleri mavi KeelLine primitive'inde kalır (semantik korunur)
const primitives = read("src", "components", "trove", "primitives.tsx");
assert.ok(
  /KeelLine[\s\S]{0,200}T\.blue/.test(primitives),
  "primitives KeelLine tamamlanmış işareti mavi kalır"
);

// --- 3) KEELLINE-2: karşılaştırma sütunları ok önekli (WCAG AA) -------------
const handover = read("src", "screens", "trip", "HandoverReviewScreen.tsx");
assert.ok(
  handover.includes("`↑ ${s.checkIn}`") && handover.includes("`↓ ${s.checkOut}`"),
  "HandoverReview karşılaştırma başlıkları ↑/↓ ok önekleriyle ayrışmalı"
);

console.log("design.test.ts: ALL PASS (token parity, amber obs keel ×3, ↑/↓ comparison)");
