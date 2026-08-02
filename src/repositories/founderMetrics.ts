import { and, eq, isNull, notLike } from "drizzle-orm";
import { getDb } from "../db/client";
import { inspections, logEntries, mediaAssets, provisionPlans, reports, trips } from "../db/schema";
import type { FounderMetrics } from "../domain/milestones";

// ---------------------------------------------------------------------------
// Cihaz metrikleri (Founder Mode) — YALNIZ gerçek kayıtlar (örnekler hariç;
// izolasyon deseni aynen). DÜRÜSTLÜK: backend/telemetri olmadan
// "activated_users" cihazda SAYILAMAZ (her kurulum yalnız kendini bilir);
// o metrik kurucu tarafından elle girilir (kaynak: TestFlight/Play Console)
// ve ileride telemetri kaynağıyla değiştirilir — motor değişmeden.
// ---------------------------------------------------------------------------

function dayOf(iso: string): string {
  return iso.slice(0, 10);
}

/** Bu CİHAZDAKİ gerçek kullanım sayıları. activated_users burada 0 döner —
 *  çağıran, kurucunun elle girdiği değeri üstüne yazar. */
export function collectDeviceMetrics(): FounderMetrics {
  const db = getDb();

  const realTrips = db
    .select({ id: trips.id, status: trips.status, createdAt: trips.createdAt })
    .from(trips)
    .where(and(isNull(trips.deletedAt), eq(trips.isSample, 0)))
    .all();

  const realInspections = db
    .select({ id: inspections.id, kind: inspections.kind, createdAt: inspections.createdAt })
    .from(inspections)
    .where(and(isNull(inspections.deletedAt), notLike(inspections.id, "smp-%")))
    .all();

  const realLogs = db
    .select({ id: logEntries.id, createdAt: logEntries.createdAt })
    .from(logEntries)
    .where(and(isNull(logEntries.deletedAt), eq(logEntries.isSample, 0)))
    .all();

  const photoRows = db
    .select({ inspectionId: mediaAssets.inspectionId, logEntryId: mediaAssets.logEntryId })
    .from(mediaAssets)
    .where(and(eq(mediaAssets.kind, "photo"), isNull(mediaAssets.deletedAt)))
    .all()
    .filter(
      (m) =>
        !(m.inspectionId ?? "").startsWith("smp-") && !(m.logEntryId ?? "").startsWith("smp-")
    );

  const planCount = db
    .select({ tripId: provisionPlans.tripId })
    .from(provisionPlans)
    .where(isNull(provisionPlans.deletedAt))
    .all()
    .filter((p) => !p.tripId.startsWith("smp-")).length;

  const reportCount = db
    .select({ id: reports.id })
    .from(reports)
    .where(isNull(reports.deletedAt))
    .all().length;

  // "Geri dönen kullanım": bu cihazda kayıt üretilen FARKLI gün sayısı.
  const days = new Set<string>();
  for (const r of realTrips) days.add(dayOf(r.createdAt));
  for (const r of realInspections) days.add(dayOf(r.createdAt));
  for (const r of realLogs) days.add(dayOf(r.createdAt));

  return {
    activated_users: 0,
    real_trips: realTrips.length,
    completed_trips: realTrips.filter((t) => t.status === "completed").length,
    provisioning_plans: planCount,
    inspections: realInspections.length,
    check_ins: realInspections.filter((i) => i.kind === "check_in").length,
    check_outs: realInspections.filter((i) => i.kind === "check_out").length,
    reports: reportCount,
    log_entries: realLogs.length,
    photo_evidence: photoRows.length,
    returning_days: days.size,
  };
}
