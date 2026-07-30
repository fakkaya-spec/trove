// İkmal kural seed'i (v1) — muhafazakar, DÜZENLENEBİLİR planlama tahminleri.
// Bu değerler evrensel doğruluk iddiası taşımaz; UI bunları "tahmini" olarak
// etiketler ve kullanıcı her miktarı değiştirebilir (madde 26).
import type {
  LocalizedText,
  MealKind,
  ProvisionCategory,
  ProvisionRuleMode,
  ProvisioningStyle,
} from "../../domain/types";

export const PROVISION_RULES_VERSION = 1;

export interface RuleSeed {
  ruleKey: string;
  category: ProvisionCategory;
  name: LocalizedText;
  unit: string;
  mode: ProvisionRuleMode;
  baseQty: number;
  adultFactor?: number;
  childFactor?: number;
  meal?: MealKind;
  hotClimateFactor?: number;
  anchorFactor?: number;
  styleFactors?: Record<ProvisioningStyle, number>;
  reservePct?: number;
  minQty?: number;
  roundTo?: number;
  requires?: Record<string, boolean>;
}

const T = (en: string, tr: string, de: string, ru: string, es: string): LocalizedText => ({
  en, tr, de, ru, es,
});

const STYLE_LUX = { essential: 0.7, balanced: 1, comfortable: 1.4 };

export const RULE_SEEDS: RuleSeed[] = [
  {
    ruleKey: "drinking_water_daily",
    category: "drinking_water",
    name: T("Drinking water", "İçme suyu", "Trinkwasser", "Питьевая вода", "Agua potable"),
    unit: "L",
    mode: "per_person_per_day",
    baseQty: 2.5,
    childFactor: 0.7,
    hotClimateFactor: 1.3,
    reservePct: 20,
    minQty: 6,
    roundTo: 0.5,
  },
  {
    ruleKey: "emergency_water",
    category: "emergency_reserve",
    name: T(
      "Emergency water reserve", "Acil su rezervi", "Notwasser-Reserve",
      "Аварийный запас воды", "Reserva de agua de emergencia"
    ),
    unit: "L",
    mode: "per_person_per_trip",
    baseQty: 4,
    childFactor: 0.7,
    minQty: 8,
    roundTo: 1,
    // BİLEREK koşulsuz: watermaker/mağaza erişimi bu kuralı azaltmaz.
  },
  {
    ruleKey: "emergency_food",
    category: "emergency_reserve",
    name: T(
      "Emergency food (canned/long-life)", "Acil gıda (konserve)", "Notnahrung (Konserven)",
      "Аварийная еда (консервы)", "Comida de emergencia (conservas)"
    ),
    unit: "portion",
    mode: "per_person_per_trip",
    baseQty: 2,
    childFactor: 0.7,
    minQty: 4,
    roundTo: 1,
  },
  {
    ruleKey: "beverages_daily",
    category: "beverages",
    name: T(
      "Other beverages (juice/soda)", "Diğer içecekler (meyve suyu/gazlı)",
      "Andere Getränke (Saft/Limo)", "Другие напитки (сок/газировка)", "Otras bebidas (zumo/refrescos)"
    ),
    unit: "L",
    mode: "per_person_per_day",
    baseQty: 0.7,
    childFactor: 0.8,
    hotClimateFactor: 1.3,
    styleFactors: STYLE_LUX,
    roundTo: 0.5,
  },
  {
    ruleKey: "breakfast_portions",
    category: "breakfast",
    name: T("Breakfast portions", "Kahvaltı porsiyonu", "Frühstücksportionen", "Порции завтрака", "Raciones de desayuno"),
    unit: "portion",
    mode: "per_person_per_meal",
    meal: "breakfast",
    baseQty: 1,
    childFactor: 0.8,
    reservePct: 10,
    roundTo: 1,
  },
  {
    ruleKey: "lunch_portions",
    category: "lunch",
    name: T("Lunch portions", "Öğle yemeği porsiyonu", "Mittagsportionen", "Порции обеда", "Raciones de almuerzo"),
    unit: "portion",
    mode: "per_person_per_meal",
    meal: "lunch",
    baseQty: 1,
    childFactor: 0.8,
    reservePct: 10,
    roundTo: 1,
  },
  {
    ruleKey: "dinner_portions",
    category: "dinner",
    name: T("Dinner portions", "Akşam yemeği porsiyonu", "Abendessen-Portionen", "Порции ужина", "Raciones de cena"),
    unit: "portion",
    mode: "per_person_per_meal",
    meal: "dinner",
    baseQty: 1,
    childFactor: 0.8,
    reservePct: 10,
    roundTo: 1,
  },
  {
    ruleKey: "snacks_daily",
    category: "snacks",
    name: T("Snacks", "Atıştırmalık", "Snacks", "Снеки", "Aperitivos"),
    unit: "pcs",
    mode: "per_person_per_day",
    baseQty: 2,
    childFactor: 1.2,
    styleFactors: STYLE_LUX,
    roundTo: 1,
    requires: { snacks: true },
  },
  {
    ruleKey: "fruit_veg_daily",
    category: "fruit_veg",
    name: T("Fruit & vegetables", "Meyve & sebze", "Obst & Gemüse", "Фрукты и овощи", "Fruta y verdura"),
    unit: "kg",
    mode: "per_person_per_day",
    baseQty: 0.35,
    childFactor: 0.7,
    roundTo: 0.5,
  },
  {
    ruleKey: "pantry_daily",
    category: "pantry",
    name: T(
      "Pantry basics (pasta/rice/bread)", "Kiler (makarna/pirinç/ekmek)",
      "Vorräte (Pasta/Reis/Brot)", "Базовые продукты (паста/рис/хлеб)", "Despensa (pasta/arroz/pan)"
    ),
    unit: "kg",
    mode: "per_person_per_day",
    baseQty: 0.2,
    childFactor: 0.7,
    reservePct: 15,
    roundTo: 0.5,
  },
  {
    ruleKey: "condiments_set",
    category: "condiments",
    name: T(
      "Condiments & spices set", "Baharat/sos seti", "Gewürze & Saucen-Set",
      "Специи и соусы", "Condimentos y especias"
    ),
    unit: "set",
    mode: "per_trip",
    baseQty: 1,
    minQty: 1,
    roundTo: 1,
  },
  {
    ruleKey: "coffee_daily",
    category: "coffee_tea",
    name: T("Coffee", "Kahve", "Kaffee", "Кофе", "Café"),
    unit: "cup",
    mode: "per_person_per_day",
    baseQty: 2,
    childFactor: 0,
    styleFactors: STYLE_LUX,
    roundTo: 1,
  },
  {
    ruleKey: "tea_daily",
    category: "coffee_tea",
    name: T("Tea", "Çay", "Tee", "Чай", "Té"),
    unit: "cup",
    mode: "per_person_per_day",
    baseQty: 1,
    childFactor: 0.5,
    roundTo: 1,
  },
  {
    ruleKey: "children_daily",
    category: "children",
    name: T(
      "Children's items (milk/snacks)", "Çocuk ürünleri (süt/atıştırmalık)",
      "Kinderartikel (Milch/Snacks)", "Детские товары (молоко/снеки)", "Artículos infantiles (leche/snacks)"
    ),
    unit: "set",
    mode: "per_person_per_day",
    baseQty: 1,
    adultFactor: 0,
    childFactor: 1,
    roundTo: 1,
    requires: { children: true },
  },
  {
    ruleKey: "hygiene_set",
    category: "hygiene",
    name: T("Hygiene set", "Hijyen seti", "Hygiene-Set", "Гигиенический набор", "Kit de higiene"),
    unit: "set",
    mode: "per_person_per_trip",
    baseQty: 1,
    childFactor: 1,
    minQty: 1,
    roundTo: 1,
  },
  {
    ruleKey: "cleaning_set",
    category: "cleaning",
    name: T(
      "Cleaning supplies (dish soap/sponge)", "Temizlik (bulaşık dtj./sünger)",
      "Reinigung (Spülmittel/Schwamm)", "Моющие средства (для посуды/губки)", "Limpieza (lavavajillas/esponja)"
    ),
    unit: "set",
    mode: "per_trip",
    baseQty: 1,
    minQty: 1,
    roundTo: 1,
  },
  {
    ruleKey: "paper_towel",
    category: "paper",
    name: T("Paper towels", "Kağıt havlu", "Küchenpapier", "Бумажные полотенца", "Papel de cocina"),
    unit: "roll",
    mode: "per_day",
    baseQty: 0.5,
    minQty: 2,
    roundTo: 1,
  },
  {
    ruleKey: "toilet_paper",
    category: "paper",
    name: T("Toilet paper", "Tuvalet kağıdı", "Toilettenpapier", "Туалетная бумага", "Papel higiénico"),
    unit: "roll",
    mode: "per_person_per_day",
    baseQty: 0.3,
    childFactor: 1,
    minQty: 2,
    roundTo: 1,
  },
  {
    ruleKey: "waste_bags",
    category: "waste_storage",
    name: T(
      "Rubbish bags", "Çöp poşeti", "Müllbeutel", "Мешки для мусора", "Bolsas de basura"
    ),
    unit: "pcs",
    mode: "per_day",
    baseQty: 2,
    anchorFactor: 1.2,
    minQty: 10,
    roundTo: 5,
  },
  {
    ruleKey: "medical_comfort_set",
    category: "medical_comfort",
    name: T(
      "Comfort set (seasickness/sunscreen)", "Konfor seti (deniz tutması/güneş kremi)",
      "Komfort-Set (Seekrankheit/Sonnencreme)", "Комфорт (от укачивания/крем от солнца)",
      "Kit de confort (mareo/protector solar)"
    ),
    unit: "set",
    mode: "per_trip",
    baseQty: 1,
    minQty: 1,
    roundTo: 1,
  },
  {
    ruleKey: "ice_daily",
    category: "ice",
    name: T("Ice", "Buz", "Eis", "Лёд", "Hielo"),
    unit: "kg",
    mode: "per_day",
    baseQty: 2,
    hotClimateFactor: 1.5,
    anchorFactor: 1.3,
    roundTo: 1,
    requires: { freezer: false },
  },
  {
    ruleKey: "pet_daily",
    category: "pet",
    name: T("Pet food & supplies", "Evcil hayvan maması", "Tierfutter & Bedarf", "Корм для питомца", "Comida para mascota"),
    unit: "portion",
    mode: "per_day",
    baseQty: 2,
    roundTo: 1,
    requires: { pets: true },
  },
];
