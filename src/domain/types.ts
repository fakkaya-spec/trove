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
