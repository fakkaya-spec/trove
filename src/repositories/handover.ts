import { and, asc, eq, inArray, isNull } from "drizzle-orm";
import { getDb, newId, nowIso, stamps } from "../db/client";
import { handoverPairs, handoverSessions, inspections, mediaAssets } from "../db/schema";
import { resolveMediaUri } from "../media/paths";
import { enqueueSync } from "./sync";

export interface HandoverSessionRow {
  id: string;
  tripId: string | null;
  vesselId: string;
  checkinInspectionId: string | null;
  checkoutInspectionId: string | null;
}

function toRow(r: typeof handoverSessions.$inferSelect): HandoverSessionRow {
  return {
    id: r.id,
    tripId: r.tripId,
    vesselId: r.vesselId,
    checkinInspectionId: r.checkinInspectionId,
    checkoutInspectionId: r.checkoutInspectionId,
  };
}

export function getSessionForTrip(tripId: string): HandoverSessionRow | null {
  const [r] = getDb()
    .select()
    .from(handoverSessions)
    .where(and(eq(handoverSessions.tripId, tripId), isNull(handoverSessions.deletedAt)))
    .limit(1)
    .all();
  return r ? toRow(r) : null;
}

/** Trip için teslim oturumu bulur/oluşturur (idempotent). */
export function ensureSessionForTrip(tripId: string, vesselId: string): HandoverSessionRow {
  const existing = getSessionForTrip(tripId);
  if (existing) return existing;
  const id = newId();
  getDb()
    .insert(handoverSessions)
    .values({ id, tripId, vesselId, status: "open", startsAt: nowIso(), ...stamps() })
    .run();
  enqueueSync("handover_sessions", id);
  return getSessionForTrip(tripId)!;
}

/** Denetimi oturuma bağlar (check-in/check-out kolonu + inspections.session_id). */
export function linkInspectionToSession(
  sessionId: string,
  kind: "check_in" | "check_out",
  inspectionId: string
): void {
  const db = getDb();
  const now = nowIso();
  db.update(handoverSessions)
    .set(
      kind === "check_in"
        ? { checkinInspectionId: inspectionId, updatedAt: now }
        : { checkoutInspectionId: inspectionId, updatedAt: now }
    )
    .where(eq(handoverSessions.id, sessionId))
    .run();
  db.update(inspections)
    .set({ sessionId, updatedAt: now })
    .where(eq(inspections.id, inspectionId))
    .run();
  enqueueSync("handover_sessions", sessionId);
}

// --- Foto eşleştirme (rehberli yeniden çekim) --------------------------------

export interface PairRow {
  id: string;
  checkinMediaId: string;
  checkinUri: string;
  checkoutMediaId: string | null;
  checkoutUri: string | null;
  label: string | null;
  requiresReview: boolean;
  note: string | null;
}

/**
 * Check-in denetiminin fotoğraflarından eksik eşleştirme kayıtlarını üretir
 * (idempotent). Her check-in fotoğrafı check-out'ta yeniden çekim adayıdır.
 */
export function ensurePairsForSession(
  session: HandoverSessionRow,
  labels: Map<string, string>
): void {
  if (!session.checkinInspectionId) return;
  const db = getDb();
  const photos = db
    .select({ id: mediaAssets.id, issueId: mediaAssets.issueId })
    .from(mediaAssets)
    .where(
      and(
        eq(mediaAssets.inspectionId, session.checkinInspectionId),
        eq(mediaAssets.kind, "photo"),
        isNull(mediaAssets.deletedAt)
      )
    )
    .all();
  const existing = new Set(
    db
      .select({ m: handoverPairs.checkinMediaId })
      .from(handoverPairs)
      .where(eq(handoverPairs.sessionId, session.id))
      .all()
      .map((r) => r.m)
  );
  for (const photo of photos) {
    if (existing.has(photo.id)) continue;
    db.insert(handoverPairs)
      .values({
        id: newId(),
        sessionId: session.id,
        checkinMediaId: photo.id,
        label: (photo.issueId && labels.get(photo.issueId)) ?? null,
        ...stamps(),
      })
      .run();
  }
}

export function listPairs(sessionId: string): PairRow[] {
  const db = getDb();
  const rows = db
    .select()
    .from(handoverPairs)
    .where(and(eq(handoverPairs.sessionId, sessionId), isNull(handoverPairs.deletedAt)))
    .orderBy(asc(handoverPairs.createdAt))
    .all();
  const mediaIds = [
    ...new Set(rows.flatMap((r) => [r.checkinMediaId, r.checkoutMediaId].filter(Boolean))),
  ] as string[];
  const uris = new Map(
    mediaIds.length === 0
      ? []
      : db
          .select({ id: mediaAssets.id, uri: mediaAssets.localUri })
          .from(mediaAssets)
          .where(inArray(mediaAssets.id, mediaIds))
          .all()
          .map((m) => [m.id, resolveMediaUri(m.uri)])
  );
  return rows.map((r) => ({
    id: r.id,
    checkinMediaId: r.checkinMediaId,
    checkinUri: uris.get(r.checkinMediaId) ?? "",
    checkoutMediaId: r.checkoutMediaId,
    checkoutUri: r.checkoutMediaId ? (uris.get(r.checkoutMediaId) ?? null) : null,
    label: r.label,
    requiresReview: r.requiresReview === 1,
    note: r.note,
  }));
}

export function setPairCheckoutMedia(pairId: string, mediaId: string): void {
  getDb()
    .update(handoverPairs)
    .set({ checkoutMediaId: mediaId, updatedAt: nowIso() })
    .where(eq(handoverPairs.id, pairId))
    .run();
  enqueueSync("handover_pairs", pairId);
}

/** İnceleme bayrağı KULLANICI kararıdır — uygulama otomatik hasar kararı vermez. */
export function setPairReview(pairId: string, requiresReview: boolean, note?: string): void {
  getDb()
    .update(handoverPairs)
    .set({ requiresReview: requiresReview ? 1 : 0, note: note ?? null, updatedAt: nowIso() })
    .where(eq(handoverPairs.id, pairId))
    .run();
  enqueueSync("handover_pairs", pairId);
}
