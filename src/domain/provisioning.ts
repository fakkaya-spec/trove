// İkmal (provisioning) hesap motoru — SAF fonksiyonlar, UI'sız, DB'siz.
// Ürün kuralları (madde 26):
//  - Bu bir PLANLAMA yardımcısıdır; hayatta kalma garantisi değildir.
//  - Her değer kullanıcı tarafından değiştirilebilir; varsayımlar görünür.
//  - Watermaker acil içme suyu önerisini SIFIRLAMAZ (yalnızca azaltır,
//    emergency_reserve kuralına hiç dokunmaz).
//  - Girdiler ve kural sürümü, sonradan açıklanabilsin diye saklanır.
import {
  ProvisionExplanation,
  ProvisionInputs,
  ProvisionRuleDef,
} from "./types";

export interface CalculatedProvision {
  rule: ProvisionRuleDef;
  quantity: number;
  explanation: ProvisionExplanation;
}

/** Kural bu sefer için geçerli mi? (requires koşulları + yolcu tipleri) */
export function ruleApplies(rule: ProvisionRuleDef, inputs: ProvisionInputs): boolean {
  const p = inputs.profile;
  const ctx: Record<string, boolean> = {
    refrigerator: p.refrigerator,
    freezer: p.freezer,
    watermaker: p.watermaker,
    snacks: p.snacks,
    children: inputs.children + inputs.infants > 0,
    infants: inputs.infants > 0,
    pets: inputs.pets > 0,
  };
  for (const [key, wanted] of Object.entries(rule.requires)) {
    if (ctx[key] !== undefined && ctx[key] !== wanted) return false;
  }
  if (rule.mode === "per_person_per_meal") {
    const meals = mealCount(rule, inputs);
    if (meals <= 0) return false;
  }
  return true;
}

function mealCount(rule: ProvisionRuleDef, inputs: ProvisionInputs): number {
  const p = inputs.profile;
  switch (rule.meal) {
    case "breakfast":
      return p.breakfastsAboard;
    case "lunch":
      return p.lunchesAboard;
    case "dinner":
      return p.dinnersAboard;
    case "snack":
      return p.snacks ? inputs.days : 0;
    default:
      return inputs.days;
  }
}

export function roundQty(value: number, roundTo: number): number {
  if (roundTo <= 0) return value;
  const r = Math.ceil(value / roundTo) * roundTo;
  // kayan nokta artıklarını temizle (0.30000000000000004 → 0.3)
  return Math.round(r * 1000) / 1000;
}

/** Tek kuralın deterministik hesabı. */
export function calculateRule(
  rule: ProvisionRuleDef,
  inputs: ProvisionInputs
): CalculatedProvision {
  const p = inputs.profile;
  const people = inputs.adults * rule.adultFactor + inputs.children * rule.childFactor;

  let multiplier = 1;
  let multiplierLabel = "";
  switch (rule.mode) {
    case "per_person_per_day":
      multiplier = inputs.days;
      multiplierLabel = "days";
      break;
    case "per_person_per_meal":
      multiplier = mealCount(rule, inputs);
      multiplierLabel = "meals";
      break;
    case "per_person_per_trip":
      multiplier = 1;
      multiplierLabel = "trip";
      break;
    case "per_day":
      multiplier = inputs.days;
      multiplierLabel = "days";
      break;
    case "per_trip":
      multiplier = 1;
      multiplierLabel = "trip";
      break;
  }

  const usesPeople = rule.mode.startsWith("per_person");
  const peopleFactor = usesPeople ? people : 1;

  const modifiers: { label: string; factor: number }[] = [];
  let modProduct = 1;
  if (p.climate === "hot" && rule.hotClimateFactor !== 1) {
    modifiers.push({ label: "hot_climate", factor: rule.hotClimateFactor });
    modProduct *= rule.hotClimateFactor;
  }
  if (p.mooring === "anchor" && rule.anchorFactor !== 1) {
    modifiers.push({ label: "anchoring", factor: rule.anchorFactor });
    modProduct *= rule.anchorFactor;
  }
  const styleFactor = rule.styleFactors[p.style] ?? 1;
  if (styleFactor !== 1) {
    modifiers.push({ label: `style_${p.style}`, factor: styleFactor });
    modProduct *= styleFactor;
  }
  // Watermaker: yalnızca günlük içme suyunu azaltır, asla sıfırlamaz;
  // emergency_reserve kategorisine hiç uygulanmaz.
  if (
    p.watermaker &&
    rule.category === "drinking_water" &&
    rule.mode === "per_person_per_day"
  ) {
    modifiers.push({ label: "watermaker", factor: 0.5 });
    modProduct *= 0.5;
  }
  if (p.shopAccess === "none" && rule.reservePct > 0) {
    // Yolda market yoksa rezerv payı artar (planlama girdisi, garanti değil)
    modifiers.push({ label: "no_shop_access", factor: 1.25 });
    modProduct *= 1.25;
  }

  const raw = rule.baseQty * peopleFactor * multiplier * modProduct;
  const withReserve = raw * (1 + rule.reservePct / 100);
  const rounded = Math.max(rule.minQty, roundQty(withReserve, rule.roundTo));

  return {
    rule,
    quantity: rounded,
    explanation: {
      ruleKey: rule.ruleKey,
      base: rule.baseQty,
      people: usesPeople ? Math.round(people * 100) / 100 : 0,
      multiplierLabel,
      multiplier,
      modifiers,
      reservePct: rule.reservePct,
      raw: Math.round(raw * 1000) / 1000,
      rounded,
    },
  };
}

/** Tüm plan: geçerli kuralları hesaplar, sıraya dizer. */
export function calculatePlan(
  rules: ProvisionRuleDef[],
  inputs: ProvisionInputs
): CalculatedProvision[] {
  return rules
    .filter((r) => ruleApplies(r, inputs))
    .map((r) => calculateRule(r, inputs))
    .filter((c) => c.quantity > 0)
    .sort((a, b) => a.rule.sort - b.rule.sort);
}

/** Stok düşme: alınacak = max(final - gemide, 0) */
export function quantityToBuy(finalQty: number, onboardQty: number): number {
  return Math.max(Math.round((finalQty - onboardQty) * 1000) / 1000, 0);
}

// --- Alışveriş ilerlemesi ---------------------------------------------------

export interface ShoppingProgress {
  totalItems: number;
  /** Satın alınması gereken (to_buy > 0 ve skipped değil) */
  toBuyItems: number;
  purchasedOrPacked: number;
  percent: number;
}

export function shoppingProgress(
  items: { finalQty: number; onboardQty: number; state: string }[]
): ShoppingProgress {
  const relevant = items.filter(
    (i) => i.state !== "skipped" && quantityToBuy(i.finalQty, i.onboardQty) > 0
  );
  const done = relevant.filter((i) => i.state === "purchased" || i.state === "packed").length;
  return {
    totalItems: items.length,
    toBuyItems: relevant.length,
    purchasedOrPacked: done,
    percent: relevant.length === 0 ? 100 : Math.round((done / relevant.length) * 100),
  };
}

/** Paylaşım metni (native share sheet için düz metin). */
export function shoppingListText(
  title: string,
  items: {
    name: string;
    finalQty: number;
    onboardQty: number;
    unit: string;
    state: string;
    category: string;
  }[],
  categoryLabels: Record<string, string>
): string {
  const lines: string[] = [title, ""];
  const byCat = new Map<string, typeof items>();
  for (const item of items) {
    if (item.state === "skipped") continue;
    const buy = quantityToBuy(item.finalQty, item.onboardQty);
    if (buy <= 0) continue;
    const list = byCat.get(item.category) ?? [];
    list.push(item);
    byCat.set(item.category, list);
  }
  for (const [cat, catItems] of byCat) {
    lines.push(`■ ${categoryLabels[cat] ?? cat}`);
    for (const item of catItems) {
      const buy = quantityToBuy(item.finalQty, item.onboardQty);
      const mark = item.state === "purchased" || item.state === "packed" ? "☑" : "☐";
      lines.push(`  ${mark} ${item.name} — ${buy} ${item.unit}`);
    }
    lines.push("");
  }
  return lines.join("\n").trim();
}