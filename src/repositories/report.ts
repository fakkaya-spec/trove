import { and, eq, isNull } from "drizzle-orm";
import { getDb, newId, nowIso, stamps } from "../db/client";
import { logEntries, mediaAssets, reports } from "../db/schema";
import { getTrip, listTripInspections } from "./trips";
import { getVesselById } from "./vessels";
import { getInspection, getItemResults, listMeters } from "./inspections";
import { getTemplateById } from "./templates";
import { reviewByCategory, listSignoffs } from "./completion";
import { checkDepthOf } from "../domain/completion";
import { compareMeters } from "../domain/handover";
import { isDone } from "../domain/trip";
import { formatOccurredAt } from "../domain/log";
import { toResultMap } from "../domain/inspection";
import type {
  ReportLabels,
  ReportReviewItem,
  ReportSignoff,
  TripReportModel,
} from "../domain/report";
import type { ReviewCategory } from "../domain/completion";
import type { Locale } from "../i18n/strings";
import { COMPLETE_STRINGS, categoryLabel, roleLabel } from "../i18n/complete";
import { TRIP_STRINGS, TripStrings } from "../i18n/trip";
import { PRODUCT_NAME } from "../config/product";
import { enqueueSync } from "./sync";

// ---------------------------------------------------------------------------
// Rapor toplayıcı (Faz 7): kanonik kayıtlardan tipli view-model üretir.
// Medya ÇOĞALTILMAZ — yalnız göreli anahtarlar okunur; render katmanı
// (src/report/) bunları görüntüye çözer. Yeni kalıcı kanıt ikilisi üretilmez.
// ---------------------------------------------------------------------------

/** Rapora gömülecek en fazla foto — PDF boyutu ve okunabilirlik dengesi. */
export const REPORT_PHOTO_LIMIT = 6;

export interface CollectedReport {
  /** photos.src boş — render katmanı photoSources'tan doldurur. */
  model: TripReportModel;
  photoSources: { relPath: string; label: string | null; takenAt: string }[];
  labels: ReportLabels;
  /** Raporun bağlandığı (tamamlayıcı) denetim. */
  completingInspectionId: string | null;
}

export function makeReportLabels(locale: Locale): ReportLabels {
  const c = COMPLETE_STRINGS[locale];
  const s = TRIP_STRINGS[locale];
  const meterNames = Object.fromEntries(
    ["engine_hours", "fuel_pct", "water_pct", "battery_v", "generator_hours", "waste_pct"].map(
      (k) => [k, s[`meter_${k}` as keyof TripStrings] as string]
    )
  );
  const categoryLabels = Object.fromEntries(
    (
      ["new_at_checkout", "still_open", "present_at_checkin", "resolved_during_trip"] as const
    ).map((cat) => [cat, categoryLabel(c, cat)])
  ) as Record<ReviewCategory, string>;
  return {
    productName: PRODUCT_NAME,
    returnedLabel: c.returnedLabel,
    newIssuesLabel: c.newIssuesLabel,
    openLabel: c.cat_still_open,
    yesWord: c.yesWord,
    noneWord: c.noneWord,
    essentialLabel: c.essentialLabel,
    fullLabel: c.fullLabel,
    itemsReviewed: c.itemsReviewed,
    crewHeading: c.crewHeading,
    metersHeading: c.metersHeading,
    openItemsHeading: c.openItemsHeading,
    photosHeading: c.photosHeading,
    signoffsHeading: c.signoffsHeading,
    categoryLabels,
    meterNames,
    deltaLabel: s.deltaLabel,
    checkInLabel: c.checkInHeading,
    checkOutLabel: c.checkOutHeading,
    signedBy: c.signedBy,
    recordedAt: c.recordedAt,
    factsDisclaimer: s.factsDisclaimer,
    localOriginNote: c.localOriginNote,
    reportIdLabel: c.reportIdLabel,
    generatedAtLabel: c.generatedAtLabel,
    skipperLabel: s.skipperName,
    adultsLabel: s.adults,
    childrenLabel: s.children,
  };
}

export function collectTripReport(tripId: string, locale: Locale): CollectedReport {
  const trip = getTrip(tripId);
  if (!trip) throw new Error(`Trip not found: ${tripId}`);
  const labels = makeReportLabels(locale);
  const c = COMPLETE_STRINGS[locale];
  const boat = trip.boatId ? getVesselById(trip.boatId) : null;

  const refs = listTripInspections(tripId);
  const checkInRef = refs.find((r) => r.kind === "check_in");
  const completingKind = trip.ownershipContext === "charter" ? "check_out" : "return_secure";
  const completingRef = refs.find((r) => r.kind === completingKind);

  // Temel/Tam beyanı — tamamlayan denetimin gerçek sonuçlarından türetilir.
  let checkDepth: TripReportModel["checkDepth"] = null;
  let itemsReviewed = 0;
  let itemsTotal = 0;
  if (completingRef) {
    const insp = getInspection(completingRef.id);
    const tpl = insp ? getTemplateById(insp.templateId) : null;
    if (insp && tpl) {
      const results = toResultMap(getItemResults(insp.id));
      const checkedIds = new Set<string>();
      for (const sec of tpl.sections)
        for (const item of sec.items) {
          if (item.inputKind !== "status") continue;
          itemsTotal++;
          const st = results.get(item.id)?.status ?? "unchecked";
          if (st !== "unchecked") {
            checkedIds.add(item.id);
            itemsReviewed++;
          }
        }
      checkDepth = checkDepthOf(tpl.sections, checkedIds);
    }
  }

  // İnceleme maddeleri — insan-dili kategoriler (origin etiketleri i18n'den)
  const grouped = reviewByCategory(tripId);
  const originLabel = (o: string) => c[`origin_${o}` as keyof typeof c] as string;
  const review = Object.fromEntries(
    Object.entries(grouped).map(([cat, items]) => [
      cat,
      items.map(
        (i): ReportReviewItem => ({
          title: i.title,
          severity: i.severity,
          originLabel: originLabel(i.origin),
          recordedAt: formatOccurredAt(i.recordedAt, locale),
        })
      ),
    ])
  ) as Record<ReviewCategory, ReportReviewItem[]>;

  const openCount =
    grouped.new_at_checkout.length + grouped.still_open.length + grouped.present_at_checkin.length;

  // Sayaçlar: check-in ↔ tamamlayan denetim
  const meters = compareMeters(
    checkInRef ? listMeters(checkInRef.id) : [],
    completingRef ? listMeters(completingRef.id) : []
  );

  // Foto kaynakları: denetim + log medyası (çoğaltma yok; göreli anahtar)
  const inspectionIds = refs.map((r) => r.id);
  const logIds = getDb()
    .select({ id: logEntries.id })
    .from(logEntries)
    .where(
      and(eq(logEntries.tripId, tripId), isNull(logEntries.deletedAt), eq(logEntries.isSample, 0))
    )
    .all()
    .map((r) => r.id);
  const mediaRows = getDb()
    .select()
    .from(mediaAssets)
    .where(and(eq(mediaAssets.kind, "photo"), isNull(mediaAssets.deletedAt)))
    .all()
    .filter(
      (m) =>
        (m.inspectionId !== null && inspectionIds.includes(m.inspectionId)) ||
        (m.logEntryId !== null && logIds.includes(m.logEntryId))
    );
  const photoSources = mediaRows.slice(0, REPORT_PHOTO_LIMIT).map((m) => ({
    relPath: m.localUri,
    label: null,
    takenAt: formatOccurredAt(m.takenAt, locale),
  }));

  const signoffs: ReportSignoff[] = listSignoffs(tripId).map((so) => ({
    roleLabel: roleLabel(c, so.role),
    name: so.name,
    signedAt: formatOccurredAt(so.signedAt, locale),
  }));

  const model: TripReportModel = {
    reportId: newId().replace(/-/g, "").slice(0, 8).toUpperCase(),
    generatedAt: formatOccurredAt(nowIso(), locale),
    tripName: trip.name,
    destination: trip.destination,
    vesselName: boat?.name ?? null,
    vesselModel: boat?.model ?? null,
    dates: trip.startAt && trip.endAt ? `${trip.startAt} – ${trip.endAt}` : null,
    skipperName: trip.skipperName,
    crewNames: trip.crewNames,
    adults: trip.adults,
    children: trip.children,
    boatReturned: completingRef ? isDone(completingRef.status) : false,
    checkDepth,
    itemsReviewed,
    itemsTotal,
    newAtCheckoutCount: grouped.new_at_checkout.length,
    openCount,
    review,
    meters,
    photos: [],
    totalPhotoCount: mediaRows.length,
    signoffs,
  };

  return { model, photoSources, labels, completingInspectionId: completingRef?.id ?? null };
}

// --- Rapor kaydı (reports tablosu; migration'sız yeniden kullanım) ----------

export interface ReportRecord {
  id: string;
  inspectionId: string;
  pdfPath: string | null;
  generatedAt: string | null;
  contentHash: string | null;
}

/** Basit deterministik içerik özeti (djb2) — mevcut content_hash kolonu için. */
export function contentHashOf(html: string): string {
  let h = 5381;
  for (let i = 0; i < html.length; i++) h = ((h << 5) + h + html.charCodeAt(i)) | 0;
  return (h >>> 0).toString(16);
}

/** Rapor kaydını yazar/yeniler (yeniden üretim aynı satırı günceller). */
export function saveReportRecord(inspectionId: string, pdfPath: string, html: string): ReportRecord {
  const db = getDb();
  const now = nowIso();
  const hash = contentHashOf(html);
  const [existing] = db
    .select()
    .from(reports)
    .where(and(eq(reports.inspectionId, inspectionId), isNull(reports.deletedAt)))
    .limit(1)
    .all();
  if (existing) {
    db.update(reports)
      .set({ pdfPath, generatedAt: now, contentHash: hash, updatedAt: now })
      .where(eq(reports.id, existing.id))
      .run();
    enqueueSync("reports", existing.id);
    return { id: existing.id, inspectionId, pdfPath, generatedAt: now, contentHash: hash };
  }
  const id = newId();
  db.insert(reports)
    .values({ id, inspectionId, pdfPath, generatedAt: now, contentHash: hash, ...stamps() })
    .run();
  enqueueSync("reports", id);
  return { id, inspectionId, pdfPath, generatedAt: now, contentHash: hash };
}

/** Seferin (tamamlayan denetime bağlı) rapor kaydı. */
export function getReportForTrip(tripId: string): ReportRecord | null {
  const trip = getTrip(tripId);
  if (!trip) return null;
  const completingKind = trip.ownershipContext === "charter" ? "check_out" : "return_secure";
  const ref = listTripInspections(tripId).find((r) => r.kind === completingKind);
  if (!ref) return null;
  const [r] = getDb()
    .select()
    .from(reports)
    .where(and(eq(reports.inspectionId, ref.id), isNull(reports.deletedAt)))
    .limit(1)
    .all();
  if (!r) return null;
  return {
    id: r.id,
    inspectionId: r.inspectionId,
    pdfPath: r.pdfPath,
    generatedAt: r.generatedAt,
    contentHash: r.contentHash,
  };
}
