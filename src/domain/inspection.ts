// Saf iş kuralları — React'siz, DB'siz, test edilebilir.
// Ürün kararları (kullanıcı onaylı, 2026-07-30):
//  - İstisna bazlı akış; ama veri modelinde hiçbir madde kullanıcı onayı
//    olmadan "working" SAYILMAZ: maddeler "unchecked" başlar.
//  - "Bu bölümde sorun yok" toplu onayı yalnızca KRİTİK OLMAYAN unchecked
//    maddeleri working yapar; kritik maddeler tek tek onay ister.
//  - Kritik maddeler unchecked iken denetim tamamlanamaz.
import {
  InspectionStatus,
  ISSUE_STATUSES,
  ItemResult,
  ItemStatus,
  TemplateItemDef,
  TemplateSectionDef,
} from "./types";

export interface SectionProgress {
  total: number;
  unchecked: number;
  issues: number;
  criticalUnchecked: number;
  /** Bölüm bitmiş sayılır: hiç unchecked madde yok */
  complete: boolean;
}

type ResultMap = Map<string, ItemResult>;

export function toResultMap(results: ItemResult[]): ResultMap {
  return new Map(results.map((r) => [r.templateItemId, r]));
}

export function statusOf(results: ResultMap, item: TemplateItemDef): ItemStatus {
  return results.get(item.id)?.status ?? "unchecked";
}

export function sectionProgress(
  section: TemplateSectionDef,
  results: ResultMap
): SectionProgress {
  const statusItems = section.items.filter((i) => i.inputKind === "status");
  let unchecked = 0;
  let issues = 0;
  let criticalUnchecked = 0;
  for (const item of statusItems) {
    const s = statusOf(results, item);
    if (s === "unchecked") {
      unchecked++;
      if (item.isCritical) criticalUnchecked++;
    } else if (ISSUE_STATUSES.includes(s)) {
      issues++;
    }
  }
  return {
    total: statusItems.length,
    unchecked,
    issues,
    criticalUnchecked,
    complete: statusItems.length > 0 ? unchecked === 0 : true,
  };
}

/**
 * "Bu bölümde sorun yok" toplu onayı: kritik olmayan unchecked maddeleri
 * working yapar. Kritik maddelere DOKUNMAZ — onlar tek tek onaylanır.
 * Dönen liste: yeni yazılması gereken sonuçlar.
 */
export function bulkApproveSection(
  section: TemplateSectionDef,
  results: ResultMap
): ItemResult[] {
  return section.items
    .filter(
      (i) =>
        i.inputKind === "status" &&
        !i.isCritical &&
        statusOf(results, i) === "unchecked"
    )
    .map((i) => ({ templateItemId: i.id, status: "working" as ItemStatus }));
}

export interface CompletionCheck {
  canComplete: boolean;
  /** Tamamlamayı ENGELLEYEN eksikler: unchecked kritik maddeler */
  blockingItems: TemplateItemDef[];
  /** Uyarı ile geçilebilen eksikler: unchecked kritik olmayan maddeler */
  warningItems: TemplateItemDef[];
}

export function checkCompletion(
  sections: TemplateSectionDef[],
  results: ResultMap
): CompletionCheck {
  const blocking: TemplateItemDef[] = [];
  const warning: TemplateItemDef[] = [];
  for (const section of sections) {
    for (const item of section.items) {
      if (item.inputKind !== "status") continue;
      if (statusOf(results, item) !== "unchecked") continue;
      if (item.isCritical) blocking.push(item);
      else warning.push(item);
    }
  }
  return {
    canComplete: blocking.length === 0,
    blockingItems: blocking,
    warningItems: warning,
  };
}

/** Sorun kaydı gerektiren durum mu? (issue sheet açılır) */
export function needsIssueSheet(status: ItemStatus): boolean {
  return ISSUE_STATUSES.includes(status);
}

/** Kritik madde ❌ işaretlendiğinde güvenlik uyarısı gösterilir mi? */
export function isCriticalFailure(item: TemplateItemDef, status: ItemStatus): boolean {
  return item.isCritical && status === "not_working";
}

// --- Inspection durum makinesi ---------------------------------------------

const TRANSITIONS: Record<InspectionStatus, InspectionStatus[]> = {
  draft: ["in_progress", "archived"],
  in_progress: ["completed", "archived"],
  completed: ["awaiting_signature", "in_progress", "archived"], // geri açılabilir (imza öncesi)
  awaiting_signature: ["locked", "in_progress"],
  locked: ["synced", "archived"],
  synced: ["archived"],
  archived: [],
};

export function canTransition(from: InspectionStatus, to: InspectionStatus): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false;
}

export function assertTransition(from: InspectionStatus, to: InspectionStatus): void {
  if (!canTransition(from, to)) {
    throw new Error(`Invalid inspection transition: ${from} -> ${to}`);
  }
}

// --- Özet -------------------------------------------------------------------

export interface InspectionSummary {
  totalItems: number;
  working: number;
  needsAttention: number;
  notWorking: number;
  notApplicable: number;
  unchecked: number;
}

export function summarize(
  sections: TemplateSectionDef[],
  results: ResultMap
): InspectionSummary {
  const sum: InspectionSummary = {
    totalItems: 0,
    working: 0,
    needsAttention: 0,
    notWorking: 0,
    notApplicable: 0,
    unchecked: 0,
  };
  for (const section of sections) {
    for (const item of section.items) {
      if (item.inputKind !== "status") continue;
      sum.totalItems++;
      switch (statusOf(results, item)) {
        case "working":
          sum.working++;
          break;
        case "needs_attention":
          sum.needsAttention++;
          break;
        case "not_working":
          sum.notWorking++;
          break;
        case "not_applicable":
          sum.notApplicable++;
          break;
        default:
          sum.unchecked++;
      }
    }
  }
  return sum;
}

/** LocalizedText'ten dile göre metin; yoksa İngilizce'ye, o da yoksa ilk değere düşer. */
export function lt(text: Record<string, string> | undefined, locale: string): string {
  if (!text) return "";
  return text[locale] ?? text.en ?? Object.values(text)[0] ?? "";
}
