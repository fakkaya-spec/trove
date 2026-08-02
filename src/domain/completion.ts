// Sefer tamamlama (Faz 7) saf iş kuralları — React'siz, DB'siz.
// Ürün ilkesi: dönüş günü kullanıcının gerçek dikkat bütçesine sığan,
// kâğıt işi gibi hissettirmeyen bir kapanış. Kayıt OLGULARI taşır;
// hukuki geçerlilik/sigorta onayı İDDİA EDİLMEZ.
import type { TemplateItemDef, TemplateSectionDef } from "./types";

// --- Temel Kontrol (Essential Check) ----------------------------------------
// 57-106 maddelik şablon duvarı yerine gerçekçi bir dönüş akışı: kritik
// maddeler + sıraya göre tamamlama. TÜREV bir sunum katmanıdır — şablon
// verisi değişmez, gizli madde asla "tamam" sayılmaz, kritikler atlanamaz.

export const ESSENTIAL_RULES_VERSION = 1;

/** Hedef büyüklük — "tam 12" değil; kritik sayısı fazlaysa kritikler kazanır. */
export const ESSENTIAL_TARGET = 12;

/**
 * Temel küme: TÜM kritik durum maddeleri + (hedefe kadar) zorunlu maddeler
 * bölüm/madde sırasıyla. Deterministik ve yalnız mevcut şablon
 * metaverisinden türetilir (küratörlü ek eşleme gerekmedi).
 */
export function essentialItemIds(
  sections: TemplateSectionDef[],
  target: number = ESSENTIAL_TARGET
): Set<string> {
  const ids = new Set<string>();
  const ordered: TemplateItemDef[] = [];
  for (const section of sections) {
    for (const item of section.items) {
      if (item.inputKind !== "status") continue;
      ordered.push(item);
      if (item.isCritical) ids.add(item.id);
    }
  }
  for (const item of ordered) {
    if (ids.size >= target) break;
    if (item.required) ids.add(item.id);
  }
  return ids;
}

/** Rapor beyanı için: temel mi tam mı tamamlandı? */
export type CheckDepth = "essential" | "full";

export function checkDepthOf(
  sections: TemplateSectionDef[],
  checkedItemIds: Set<string>
): CheckDepth {
  for (const section of sections) {
    for (const item of section.items) {
      if (item.inputKind !== "status") continue;
      if (!checkedItemIds.has(item.id)) return "essential";
    }
  }
  return "full";
}

// --- Açık maddeler okuma modeli ---------------------------------------------
// Denetim "sorunları" ve log "gözlemleri" kullanıcı için TEK kavramdır:
// "açık madde". Veri modelleri BİRLEŞTİRİLMEZ; bu katman yalnız sunumu
// birleştirir. Kullanıcı bir sorunu çözülmüş İLAN ETMEYE zorlanamaz —
// açık bırakmak meşru bir sonuçtur ve raporda açıkça görünür.

export type OpenItemSource = "log" | "inspection";

/** Kaydın kökeni — rapor sınıflandırmasının temeli. */
export type OpenItemOrigin = "check_in" | "trip" | "check_out";

export interface OpenItem {
  source: OpenItemSource;
  id: string;
  title: string;
  severity: string | null;
  origin: OpenItemOrigin;
  /** ISO — log için occurredAt, denetim sorunu için kayıt zamanı */
  recordedAt: string;
  resolved: boolean;
}

/** Rapor kategorileri — veritabanı dili değil, insan dili karşılıkları i18n'de. */
export type ReviewCategory =
  | "resolved_during_trip"
  | "still_open"
  | "new_at_checkout"
  | "present_at_checkin";

export function categorize(item: OpenItem): ReviewCategory {
  if (item.resolved) return "resolved_during_trip";
  if (item.origin === "check_out") return "new_at_checkout";
  if (item.origin === "check_in") return "present_at_checkin";
  return "still_open";
}

export function openCount(items: OpenItem[]): number {
  return items.filter((i) => !i.resolved).length;
}

// --- Onay (sign-off) ---------------------------------------------------------

export const SIGNOFF_ROLES = ["skipper", "charterer", "base_rep"] as const;
export type SignoffRole = (typeof SIGNOFF_ROLES)[number];

// --- Rapor dosya adı ---------------------------------------------------------

/**
 * TROVE_<Tekne>_<Sefer-veya-Tarih>_Report.pdf — dosya sistemine güvenli.
 * Unicode harfler korunur (küresel ürün); ayırıcı/yasak karakterler tire olur.
 */
export function reportFileName(vesselName: string | null, tripLabel: string): string {
  const clean = (s: string) =>
    s
      .trim()
      .replace(/[\\/:*?"<>|#%&{}$!'@+`=\s]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40);
  const parts = ["TROVE", clean(vesselName ?? "Trip"), clean(tripLabel), "Report"];
  return `${parts.filter(Boolean).join("_")}.pdf`;
}
