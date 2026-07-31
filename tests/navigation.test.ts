// Navigasyon sözleşmesi testleri (`npx tsx tests/navigation.test.ts`).
// React Navigation'ı çalıştırmadan, kaynak düzeyinde şu sözleşmeleri doğrular:
//  - KİLİTLİ TROVE sekme yapısı: Trip · Log · Vessel (eski 5 sekme yok)
//  - Ayarlar'a Trip başlığındaki dişliden erişim
//  - Eski ekranların stack rotası olarak erişilebilir kalması (öksüz rota yok)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = join(__dirname, "..");
const app = readFileSync(join(root, "App.tsx"), "utf8");
const nav = readFileSync(join(root, "src", "navigation.ts"), "utf8");

// --- Sekme tanımları (KİLİTLİ: Trip · Log · Vessel) -------------------------
for (const tab of ["TripTab", "LogTab", "VesselTab"]) {
  assert.ok(nav.includes(`${tab}: undefined`), `TabParamList '${tab}' içermeli`);
  assert.ok(app.includes(`name="${tab}"`), `App.tsx Tab.Screen '${tab}' tanımlamalı`);
}
for (const old of ["HomeTab", "TripsTab", "BoatsTab", "LibraryTab", "ProfileTab"]) {
  assert.ok(!nav.includes(old), `Eski sekme '${old}' TabParamList'ten kalkmalı`);
  assert.ok(!app.includes(`name="${old}"`), `Eski sekme '${old}' App.tsx'ten kalkmalı`);
}
const tabCount = (app.match(/<Tab\.Screen/g) ?? []).length;
assert.equal(tabCount, 3, `Tam olarak 3 alt sekme olmalı (bulundu: ${tabCount})`);

// --- Ayarlar: Trip başlığındaki dişli --------------------------------------
assert.ok(nav.includes("Settings: undefined"), "Settings stack rotası tanımlı olmalı");
assert.ok(app.includes('navigation.navigate("Settings")'), "Dişli Settings'e gitmeli");
assert.ok(app.includes('icon="settings-outline"'), "Trip başlığında dişli ikonu olmalı");
assert.ok(app.includes('name="Settings"'), "Settings Stack.Screen olarak kayıtlı olmalı");

// --- Korunan stack ekranları (öksüz rota yok) -------------------------------
const preservedRoutes = [
  "Trips",
  "TripWizard",
  "TripDetail",
  "Provisioning",
  "HandoverReview",
  "BoatHistory",
  "Library",
  "Settings",
  "NewInspection",
  "Inspect",
  "InspectionSummary",
];
for (const route of preservedRoutes) {
  assert.ok(nav.includes(`${route}:`), `RootStackParamList '${route}' içermeli`);
  assert.ok(app.includes(`name="${route}"`), `'${route}' Stack.Screen olarak kayıtlı olmalı`);
}

// Trips listesine Trip başlığından erişim
assert.ok(app.includes('navigation.navigate("Trips")'), "Başlıktan tüm seferlere gidilebilmeli");

// Library artık sekme değil ama Ayarlar'dan erişilebilir olmalı
const profile = readFileSync(join(root, "src", "screens", "ProfileScreen.tsx"), "utf8");
assert.ok(
  profile.includes('navigation.navigate("Library")'),
  "Ayarlar ekranı şablon kütüphanesine bağlanmalı"
);

// Legacy ekranlar bayrak arkasında tanımlı kalmalı (silinmemeli)
for (const legacy of ["Checklists", "Checklist", "Guide", "Premium"]) {
  assert.ok(nav.includes(`${legacy}:`), `Legacy rota '${legacy}' korunmalı`);
}

console.log("navigation.test.ts: ALL PASS (3 tabs, settings gear, preserved stack routes)");
