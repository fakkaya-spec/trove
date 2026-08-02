// İlk beş dakika (Faz 8) sözleşme testleri — gerçek SQLite + kaynak sözleşme:
// Welcome→AddVessel · tekne listesi TROVE · aşamalı AddVessel (isteğe bağlı
// alanlar kalıcı) · TripWizard/TripDetail/HandoverReview TROVE + davranış
// korunumu · örnek salt-okunurluk · rota kayıtları.
// Çalıştırma: npx tsx tests/firstuse.test.ts
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { eq } from "drizzle-orm";
import type { SQLiteDatabase } from "expo-sqlite";
import { migrate } from "../src/db/migrations";
import * as schema from "../src/db/schema";
import { __setDbForTesting, Db } from "../src/db/client";
import { VESSEL_STRINGS } from "../src/i18n/vessel";

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

import { createVessel, getVesselById, listVessels } from "../src/repositories/vessels";

const root = join(__dirname, "..");
const read = (...p: string[]) => readFileSync(join(root, ...p), "utf8");

// --- 1) AddVessel: isteğe bağlı kimlik alanları gerçekten kalıcı ------------
const v1 = createVessel({
  name: "  Meltemi  ",
  type: "sailing",
  ownershipType: "owned",
  model: "51 Cruiser",
  manufacturer: "Bavaria",
  modelYear: 2019,
  lengthM: 15.4,
  engineType: "Volvo Penta 75 hp",
  registrationNumber: "ES-1234-MAL",
  hullIdentificationNumber: "BAVVN51K2001",
});
assert.equal(v1.name, "Meltemi", "ad kırpılır");
const raw = db
  .select()
  .from(schema.vessels)
  .where(eq(schema.vessels.id, v1.id))
  .all()[0];
assert.equal(raw.manufacturer, "Bavaria");
assert.equal(raw.modelYear, 2019);
assert.equal(raw.lengthM, 15.4);
assert.equal(raw.registrationNumber, "ES-1234-MAL");
assert.equal(raw.hullIdentificationNumber, "BAVVN51K2001");
assert.equal(raw.engineType, "Volvo Penta 75 hp");
// Yalnız zorunlularla da çalışır; boşlar null kalır
const v2 = createVessel({ name: "Poyraz", type: "motor" });
const raw2 = db.select().from(schema.vessels).where(eq(schema.vessels.id, v2.id)).all()[0];
assert.equal(raw2.manufacturer, null, "isteğe bağlı alanlar zorlanmaz");
assert.equal(getVesselById(v2.id)?.name, "Poyraz");
assert.equal(listVessels().length, 2, "liste yalnız gerçek tekneler");

// --- 2) Rotalar kayıtlı; Welcome ilk eylemi doğrudan AddVessel --------------
const app = read("App.tsx");
assert.ok(/name="AddVessel"/.test(app), "AddVessel rotası kayıtlı");
assert.ok(
  read("src", "navigation.ts").includes("AddVessel: undefined;"),
  "AddVessel navigasyon tipi tanımlı"
);
assert.ok(
  read("src", "screens", "WelcomeScreen.tsx").includes('navigate("AddVessel")'),
  "Karşılama birincil eylemi aşamalı tekne ekleme formuna gider"
);

// --- 3) Yenilenen ekranlar TROVE dilinde; eski tema importu yok -------------
for (const f of [
  ["src", "screens", "boats", "BoatsScreen.tsx"],
  ["src", "screens", "boats", "AddVesselScreen.tsx"],
  ["src", "screens", "trip", "TripWizardScreen.tsx"],
  ["src", "screens", "trip", "TripDetailScreen.tsx"],
  ["src", "screens", "trip", "HandoverReviewScreen.tsx"],
]) {
  const src = read(...f);
  assert.ok(
    !/\bcolors\.\w/.test(src) && !src.includes('from "../../components/ui"'),
    `${f.at(-1)}: eski tema/ui bileşeni kullanmaz (kilitli kural 7)`
  );
  assert.ok(src.includes("T."), `${f.at(-1)}: T token'ları kullanır`);
}

// --- 4) Davranış korunumu sözleşmeleri --------------------------------------
const wizard = read("src", "screens", "trip", "TripWizardScreen.tsx");
assert.ok(
  wizard.includes("createTrip(") && wizard.includes("generatePlan(trip, locale)"),
  "sihirbaz aynı motoru çağırır (createTrip + ikmal planı)"
);
assert.ok(wizard.includes("beforeRemove"), "kirli sihirbaz geri korumalı");
assert.ok(
  wizard.includes('ownership === "charter"') && wizard.includes('"undecided"'),
  "sahiplik ayrımı (own/charter/undecided) korunur"
);
const addVessel = read("src", "screens", "boats", "AddVesselScreen.tsx");
assert.ok(addVessel.includes("beforeRemove"), "kirli tekne formu geri korumalı");
assert.ok(
  addVessel.includes("KeyboardAvoidingView"),
  "tekne formu klavye kaçınmalı"
);
const detail = read("src", "screens", "trip", "TripDetailScreen.tsx");
assert.ok(
  /trip\.isSample \?[\s\S]{0,400}statusOptions\.find/.test(detail) &&
    detail.includes("listTripInspections"),
  "örnek seferde durum salt gösterim + denetim oluşturulmaz (H1 korunur)"
);
assert.ok(
  /!trip\.isSample && \(!boat \|\| showBoatPicker\)/.test(detail),
  "tekne seçici örneklerde asla görünmez"
);
const handover = read("src", "screens", "trip", "HandoverReviewScreen.tsx");
assert.ok(
  handover.includes("factsDisclaimer") && handover.includes('requestAccess("handover_pair")'),
  "teslim: olgu feragati + merkezî foto kapısı korunur"
);
assert.ok(
  /T\.amber/.test(handover) && !/colors\.signal/.test(handover),
  "negatif delta amber (dikkat) — kırmızı yalnız gerçek hata"
);

// --- 5) i18n paritesi (vessel modülü) ---------------------------------------
const locales = Object.keys(VESSEL_STRINGS);
assert.equal(locales.length, 9);
const enKeys = JSON.stringify(Object.keys(VESSEL_STRINGS.en).sort());
for (const loc of locales) {
  assert.equal(
    JSON.stringify(Object.keys(VESSEL_STRINGS[loc as keyof typeof VESSEL_STRINGS]).sort()),
    enKeys,
    `${loc} vessel anahtar paritesi`
  );
}
assert.notEqual(VESSEL_STRINGS.tr.addVessel, VESSEL_STRINGS.en.addVessel, "TR çevirisi gerçek");

console.log(
  "firstuse.test.ts: ALL PASS (vessel optional fields persist, routes, TROVE tokens, behavior preservation, i18n parity)"
);
