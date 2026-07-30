// Charter teslim (handover) saf iş kuralları.
// İlke (madde 2.3): uygulama OLGULARI kaydeder — "yeni hasar", "kiracı yaptı"
// gibi sonuç cümleleri üretmez; karşılaştırma çıktıları insan incelemesi içindir.
import { InspectionStatus, MeterKind } from "./types";
import { isDone } from "./trip";

// --- Oturum durumu (türetilmiş; gizli durum makinesi tutulmaz) --------------

export type HandoverStatus =
  | "draft"
  | "check_in_in_progress"
  | "checked_in"
  | "check_out_in_progress"
  | "completed";

export function deriveHandoverStatus(
  checkIn: InspectionStatus | null,
  checkOut: InspectionStatus | null
): HandoverStatus {
  if (isDone(checkOut)) return "completed";
  if (checkOut !== null) return "check_out_in_progress";
  if (isDone(checkIn)) return "checked_in";
  if (checkIn !== null) return "check_in_in_progress";
  return "draft";
}

// --- Sayaç karşılaştırması ---------------------------------------------------

export interface MeterValueRow {
  kind: MeterKind;
  value: number;
  unit: string;
}

export interface MeterComparisonRow {
  kind: MeterKind;
  unit: string;
  checkIn: number | null;
  checkOut: number | null;
  /** checkOut - checkIn; iki değer de yoksa null */
  delta: number | null;
}

export function compareMeters(
  checkIn: MeterValueRow[],
  checkOut: MeterValueRow[]
): MeterComparisonRow[] {
  const kinds = new Map<MeterKind, MeterComparisonRow>();
  const put = (row: MeterValueRow, side: "checkIn" | "checkOut") => {
    let entry = kinds.get(row.kind);
    if (!entry) {
      entry = { kind: row.kind, unit: row.unit, checkIn: null, checkOut: null, delta: null };
      kinds.set(row.kind, entry);
    }
    entry[side] = row.value;
  };
  checkIn.forEach((r) => put(r, "checkIn"));
  checkOut.forEach((r) => put(r, "checkOut"));
  for (const entry of kinds.values()) {
    if (entry.checkIn !== null && entry.checkOut !== null) {
      entry.delta = Math.round((entry.checkOut - entry.checkIn) * 100) / 100;
    }
  }
  return [...kinds.values()];
}

// --- Rapor metni -------------------------------------------------------------

export interface HandoverReportInput {
  productName: string;
  tripName: string;
  boatName: string;
  dates: string;
  meters: MeterComparisonRow[];
  /** Check-in'de kaydedilen mevcut durum gözlemleri */
  checkInIssues: { title: string; severity: string; description?: string | null }[];
  /** Check-out'ta kaydedilen yeni gözlemler */
  checkOutIssues: { title: string; severity: string; description?: string | null }[];
  reviewFlaggedPairs: number;
  totalPairs: number;
  labels: {
    checkIn: string;
    checkOut: string;
    delta: string;
    existingObservations: string;
    newObservations: string;
    photoPairs: string;
    flaggedForReview: string;
    factsDisclaimer: string;
    meterNames: Record<string, string>;
  };
}

/** Paylaşılabilir düz metin teslim özeti. Olgular; sonuç/karar cümlesi yok. */
export function buildHandoverReportText(input: HandoverReportInput): string {
  const L = input.labels;
  const lines: string[] = [];
  lines.push(`⚓ ${input.productName} — ${input.tripName}`);
  lines.push(`⛵ ${input.boatName} · ${input.dates}`);
  lines.push("");

  if (input.meters.length > 0) {
    lines.push(`■ ${L.checkIn} / ${L.checkOut}`);
    for (const m of input.meters) {
      const name = L.meterNames[m.kind] ?? m.kind;
      const ci = m.checkIn !== null ? `${m.checkIn} ${m.unit}` : "—";
      const co = m.checkOut !== null ? `${m.checkOut} ${m.unit}` : "—";
      const delta =
        m.delta !== null ? `  (${L.delta}: ${m.delta > 0 ? "+" : ""}${m.delta} ${m.unit})` : "";
      lines.push(`  ${name}: ${ci} → ${co}${delta}`);
    }
    lines.push("");
  }

  if (input.checkInIssues.length > 0) {
    lines.push(`■ ${L.existingObservations} (${input.checkInIssues.length})`);
    for (const issue of input.checkInIssues) {
      lines.push(`  • [${issue.severity}] ${issue.title}${issue.description ? ` — ${issue.description}` : ""}`);
    }
    lines.push("");
  }

  if (input.checkOutIssues.length > 0) {
    lines.push(`■ ${L.newObservations} (${input.checkOutIssues.length})`);
    for (const issue of input.checkOutIssues) {
      lines.push(`  • [${issue.severity}] ${issue.title}${issue.description ? ` — ${issue.description}` : ""}`);
    }
    lines.push("");
  }

  if (input.totalPairs > 0) {
    lines.push(`■ ${L.photoPairs}: ${input.totalPairs} · ${L.flaggedForReview}: ${input.reviewFlaggedPairs}`);
    lines.push("");
  }

  lines.push(L.factsDisclaimer);
  return lines.join("\n").trim();
}
