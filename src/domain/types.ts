// Domain tipleri — UI ve persistence'tan bağımsız.
// Kaynak gerçeklik: docs/PHASE0.md §5 şeması.

export type ItemStatus =
  | "unchecked"
  | "working"
  | "needs_attention"
  | "not_working"
  | "not_applicable";

export type InspectionStatus =
  | "draft"
  | "in_progress"
  | "completed"
  | "awaiting_signature"
  | "locked"
  | "synced"
  | "archived";

export type InspectionKind = "check_in" | "check_out" | "periodic";

export type IssueSeverity = "low" | "medium" | "high" | "critical";

export type MeterKind =
  | "engine_hours"
  | "fuel_pct"
  | "water_pct"
  | "battery_v"
  | "generator_hours"
  | "waste_pct";

export type MediaKind = "photo" | "video" | "audio" | "signature";

export type BoatType =
  | "sailing"
  | "catamaran"
  | "motor"
  | "rib"
  | "jetski"
  | "gulet"
  | "fishing";

/** Çok dilli metin: {"en": "...", "tr": "...", ...} */
export type LocalizedText = Record<string, string>;

export interface TemplateItemDef {
  id: string;
  sectionId: string;
  sort: number;
  title: LocalizedText;
  tip?: LocalizedText;
  isCritical: boolean;
  requiresPhotoOnIssue: boolean;
  required: boolean;
  inputKind: "status" | "meter";
  meterKind?: MeterKind;
  safetyNote?: LocalizedText;
}

export interface TemplateSectionDef {
  id: string;
  sort: number;
  icon: string;
  title: LocalizedText;
  items: TemplateItemDef[];
}

export interface TemplateDef {
  id: string;
  boatType: BoatType;
  name: LocalizedText;
  version: number;
  sections: TemplateSectionDef[];
}

export interface ItemResult {
  templateItemId: string;
  status: ItemStatus;
  note?: string | null;
}

export interface MeterValue {
  kind: MeterKind;
  value: number;
  unit: string;
  confirmed: boolean;
}

export const METER_UNITS: Record<MeterKind, string> = {
  engine_hours: "h",
  fuel_pct: "%",
  water_pct: "%",
  battery_v: "V",
  generator_hours: "h",
  waste_pct: "%",
};

/** Sorunlu sayılan durumlar */
export const ISSUE_STATUSES: ItemStatus[] = ["needs_attention", "not_working"];

// --- Trip ------------------------------------------------------------------

export type TripType =
  | "short_day_trip"
  | "full_day_trip"
  | "weekend"
  | "multi_day_coastal"
  | "offshore_passage";

export type TripStatus = "planning" | "active" | "completed" | "archived";

export type OwnershipContext = "own" | "charter" | "undecided";

export type MeterStage =
  | "trip_start"
  | "pre_departure"
  | "charter_check_in"
  | "charter_check_out"
  | "trip_return"
  | "ad_hoc";

export type ProvisioningStyle = "essential" | "balanced" | "comfortable";
export type ClimateProfile = "cool" | "moderate" | "hot";
export type MooringProfile = "marina" | "mixed" | "anchor";
export type ShopAccess = "easy" | "limited" | "none";

/** Trip kullanım profili — trips.profile_json içinde bilinçli denormalize snapshot. */
export interface TripUsageProfile {
  mooring: MooringProfile;
  breakfastsAboard: number;
  lunchesAboard: number;
  dinnersAboard: number;
  snacks: boolean;
  shopAccess: ShopAccess;
  watermaker: boolean;
  refrigerator: boolean;
  freezer: boolean;
  climate: ClimateProfile;
  style: ProvisioningStyle;
  dietaryNotes?: string;
  allergies?: string;
}

export const DEFAULT_TRIP_PROFILE: TripUsageProfile = {
  mooring: "mixed",
  breakfastsAboard: 0,
  lunchesAboard: 0,
  dinnersAboard: 0,
  snacks: true,
  shopAccess: "limited",
  watermaker: false,
  refrigerator: true,
  freezer: false,
  climate: "moderate",
  style: "balanced",
};

// --- Provisioning ----------------------------------------------------------

export type ProvisionCategory =
  | "drinking_water"
  | "beverages"
  | "breakfast"
  | "lunch"
  | "dinner"
  | "snacks"
  | "fruit_veg"
  | "pantry"
  | "condiments"
  | "coffee_tea"
  | "children"
  | "hygiene"
  | "cleaning"
  | "paper"
  | "waste_storage"
  | "medical_comfort"
  | "ice"
  | "emergency_reserve"
  | "pet";

export type ProvisionRuleMode =
  | "per_person_per_day"
  | "per_person_per_meal"
  | "per_person_per_trip"
  | "per_trip"
  | "per_day";

export type MealKind = "breakfast" | "lunch" | "dinner" | "snack";

export interface ProvisionRuleDef {
  id: string;
  ruleKey: string;
  category: ProvisionCategory;
  name: LocalizedText;
  unit: string;
  mode: ProvisionRuleMode;
  baseQty: number;
  adultFactor: number;
  childFactor: number;
  meal?: MealKind;
  hotClimateFactor: number;
  anchorFactor: number;
  styleFactors: Record<ProvisioningStyle, number>;
  reservePct: number;
  minQty: number;
  roundTo: number;
  /** Koşullar: {"refrigerator":false} → yalnız buzdolabı yoksa; {"pets":true} → evcil varsa */
  requires: Record<string, boolean>;
  sort: number;
  version: number;
}

export type ProvisionItemState =
  | "suggested"
  | "already_onboard"
  | "purchased"
  | "packed"
  | "skipped";

/** Hesap girdilerinin snapshot'ı — sonradan "neden bu miktar" açıklanabilsin diye saklanır. */
export interface ProvisionInputs {
  adults: number;
  children: number;
  infants: number;
  pets: number;
  days: number;
  nights: number;
  profile: TripUsageProfile;
}

export interface ProvisionExplanation {
  ruleKey: string;
  base: number;
  people: number;
  multiplierLabel: string;
  multiplier: number;
  modifiers: { label: string; factor: number }[];
  reservePct: number;
  raw: number;
  rounded: number;
}
