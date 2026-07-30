// İkmal motoru saf birim testleri: npx tsx tests/provisioning.test.ts
import assert from "node:assert/strict";
import {
  calculateRule,
  calculatePlan,
  quantityToBuy,
  roundQty,
  ruleApplies,
  shoppingListText,
  shoppingProgress,
} from "../src/domain/provisioning";
import { tripDays } from "../src/domain/trip";
import { nextAction, tripProgress } from "../src/domain/trip";
import type { ProvisionInputs, ProvisionRuleDef, TripUsageProfile } from "../src/domain/types";
import { DEFAULT_TRIP_PROFILE } from "../src/domain/types";

function rule(overrides: Partial<ProvisionRuleDef>): ProvisionRuleDef {
  return {
    id: "r1",
    ruleKey: "test",
    category: "drinking_water",
    name: { en: "Water" },
    unit: "L",
    mode: "per_person_per_day",
    baseQty: 2.5,
    adultFactor: 1,
    childFactor: 0.7,
    hotClimateFactor: 1.3,
    anchorFactor: 1,
    styleFactors: { essential: 1, balanced: 1, comfortable: 1 },
    reservePct: 20,
    minQty: 0,
    roundTo: 0.5,
    requires: {},
    sort: 0,
    version: 1,
    ...overrides,
  };
}

function inputs(over?: Partial<ProvisionInputs>, prof?: Partial<TripUsageProfile>): ProvisionInputs {
  return {
    adults: 2,
    children: 0,
    infants: 0,
    pets: 0,
    days: 3,
    nights: 2,
    profile: { ...DEFAULT_TRIP_PROFILE, ...prof },
    ...over,
  };
}

// 1) Temel formül: 2.5 × 2 kişi × 3 gün × 1.2 rezerv = 18 L
{
  const r = calculateRule(rule({}), inputs());
  assert.equal(r.quantity, 18);
  assert.equal(r.explanation.reservePct, 20);
}

// 2) Çocuk çarpanı: 2 yetişkin + 2 çocuk×0.7 = 3.4 kişi → 2.5×3.4×3×1.2 = 30.6 → 31 (0.5'e yukarı yuvarlama)
{
  const r = calculateRule(rule({}), inputs({ children: 2 }));
  assert.equal(r.quantity, 31);
}

// 3) Sıcak iklim çarpanı uygulanır
{
  const cool = calculateRule(rule({}), inputs());
  const hot = calculateRule(rule({}), inputs({}, { climate: "hot" }));
  assert.ok(hot.quantity > cool.quantity, "hot climate must increase water");
  assert.ok(hot.explanation.modifiers.some((m) => m.label === "hot_climate"));
}

// 4) Watermaker içme suyunu azaltır ama SIFIRLAMAZ
{
  const wm = calculateRule(rule({}), inputs({}, { watermaker: true }));
  assert.ok(wm.quantity > 0, "watermaker must never reduce water to zero");
  assert.ok(wm.quantity < 18);
}

// 5) Watermaker acil rezervi ETKİLEMEZ
{
  const emergency = rule({ category: "emergency_reserve", mode: "per_person_per_trip", reservePct: 0, hotClimateFactor: 1, baseQty: 4, roundTo: 1 });
  const base = calculateRule(emergency, inputs());
  const withWm = calculateRule(emergency, inputs({}, { watermaker: true }));
  assert.equal(base.quantity, withWm.quantity, "emergency reserve unaffected by watermaker");
}

// 6) Öğün bazlı kural: 0 öğün → kural uygulanmaz
{
  const meal = rule({ mode: "per_person_per_meal", meal: "dinner", reservePct: 0, roundTo: 1, baseQty: 1, hotClimateFactor: 1 });
  assert.equal(ruleApplies(meal, inputs({}, { dinnersAboard: 0 })), false);
  const r = calculateRule(meal, inputs({}, { dinnersAboard: 4 }));
  assert.equal(r.quantity, 8); // 1 × 2 kişi × 4 öğün
}

// 7) requires koşulları: freezer varken buz kuralı uygulanmaz
{
  const ice = rule({ category: "ice", mode: "per_day", requires: { freezer: false }, hotClimateFactor: 1, reservePct: 0 });
  assert.equal(ruleApplies(ice, inputs({}, { freezer: true })), false);
  assert.equal(ruleApplies(ice, inputs({}, { freezer: false })), true);
}

// 8) Sadece-çocuk kuralı: çocuk yoksa uygulanmaz (adultFactor 0 + requires)
{
  const kids = rule({ adultFactor: 0, childFactor: 1, requires: { children: true }, reservePct: 0, hotClimateFactor: 1, roundTo: 1, baseQty: 1 });
  assert.equal(ruleApplies(kids, inputs()), false);
  const r = calculateRule(kids, inputs({ children: 2 }));
  assert.equal(r.quantity, 6); // 1 × (0×2 + 1×2) × 3 gün
}

// 9) min ve yuvarlama
{
  assert.equal(roundQty(7.01, 0.5), 7.5);
  const r = calculateRule(rule({ minQty: 50, hotClimateFactor: 1 }), inputs());
  assert.equal(r.quantity, 50);
}

// 10) Stok düşme
{
  assert.equal(quantityToBuy(18, 5), 13);
  assert.equal(quantityToBuy(4, 10), 0);
}

// 11) Mağaza erişimi yoksa rezervli kalemler artar
{
  const base = calculateRule(rule({}), inputs());
  const noShop = calculateRule(rule({}), inputs({}, { shopAccess: "none" }));
  assert.ok(noShop.quantity > base.quantity);
}

// 12) Plan hesabı sıralı ve 0 miktarları eler
{
  const rules = [
    rule({ id: "a", ruleKey: "a", sort: 2 }),
    rule({ id: "b", ruleKey: "b", sort: 1, mode: "per_person_per_meal", meal: "dinner" }),
  ];
  const plan = calculatePlan(rules, inputs({}, { dinnersAboard: 0 }));
  assert.equal(plan.length, 1); // öğünsüz dinner kuralı elendi
  assert.equal(plan[0].rule.ruleKey, "a");
}

// 13) Alışveriş ilerlemesi: skipped ve stoklu kalemler paydaya girmez
{
  const p = shoppingProgress([
    { finalQty: 10, onboardQty: 0, state: "purchased" },
    { finalQty: 10, onboardQty: 0, state: "suggested" },
    { finalQty: 10, onboardQty: 10, state: "suggested" }, // to_buy=0 → sayılmaz
    { finalQty: 10, onboardQty: 0, state: "skipped" },
  ]);
  assert.equal(p.toBuyItems, 2);
  assert.equal(p.purchasedOrPacked, 1);
  assert.equal(p.percent, 50);
}

// 14) Paylaşım metni: skipped/stoklu kalemler dışarıda, kategori başlıkları var
{
  const text = shoppingListText(
    "List",
    [
      { name: "Water", finalQty: 18, onboardQty: 6, unit: "L", state: "suggested", category: "drinking_water" },
      { name: "Ice", finalQty: 4, onboardQty: 4, unit: "kg", state: "suggested", category: "ice" },
      { name: "Beer", finalQty: 6, onboardQty: 0, unit: "L", state: "skipped", category: "beverages" },
    ],
    { drinking_water: "Water", ice: "Ice", beverages: "Beverages" }
  );
  assert.ok(text.includes("Water — 12 L"));
  assert.ok(!text.includes("Ice —"));
  assert.ok(!text.includes("Beer"));
}

// 15) Trip günleri ve ilerleme/sonraki adım
{
  assert.equal(tripDays("short_day_trip", 0), 1);
  assert.equal(tripDays("weekend", 2), 3);
  const st = {
    preDeparture: null,
    provisioningPercent: null,
    returnCheck: null,
    checkIn: null,
    checkOut: null,
    openCriticalIssues: 0,
  } as const;
  assert.equal(nextAction({ ...st }, true), "start_check_in");
  assert.equal(nextAction({ ...st }, false), "start_pre_departure");
  assert.equal(
    nextAction({ ...st, preDeparture: "completed", provisioningPercent: 40 }, false),
    "continue_shopping"
  );
  assert.equal(
    nextAction(
      { ...st, preDeparture: "completed", provisioningPercent: 100, openCriticalIssues: 2 },
      false
    ),
    "review_critical_issues"
  );
  assert.equal(
    nextAction(
      { ...st, preDeparture: "completed", provisioningPercent: 100, returnCheck: "completed" },
      false
    ),
    "trip_complete"
  );
  const prog = tripProgress(
    { ...st, preDeparture: "completed", provisioningPercent: 100, returnCheck: null },
    false
  );
  assert.equal(prog.modulesTotal, 3);
  assert.equal(prog.modulesDone, 2);
}

console.log("provisioning.test.ts: ALL PASS");
