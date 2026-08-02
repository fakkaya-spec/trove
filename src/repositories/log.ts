import { and, desc, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { getDb, newId, nowIso, stamps } from "../db/client";
import { logEntries, mediaAssets, syncQueue, trips } from "../db/schema";
import { LOG_ENTRY_TYPES, LOG_SEVERITIES, LogEntryType, LogSeverity } from "../domain/log";
import { enqueueSync } from "./sync";

// ---------------------------------------------------------------------------
// Seyir defteri repository'si.
// İZOLASYON KURALI (KİLİTLİ): gerçek listeler örnekleri, örnek listeler
// gerçekleri ASLA içermez — filtre bu katmandadır, UI'da değil. Örnek
// kayıtlara gerçek-yol mutasyonu tipli hatayla REDDEDİLİR ve örnekler
// sync kuyruğuna asla yazılmaz.
// ---------------------------------------------------------------------------

const typeSchema = z.enum(LOG_ENTRY_TYPES);
const severitySchema = z.enum(LOG_SEVERITIES);

/** Örnek kayda gerçek-yol mutasyonu — çağıran katman için tipli, ayırt edilebilir hata. */
export class SampleReadOnlyError extends Error {
  constructor(what: string) {
    super(`SAMPLE_READ_ONLY: ${what} is sample data and cannot be mutated`);
    this.name = "SampleReadOnlyError";
  }
}

export interface LogEntryRow {
  id: string;
  tripId: string | null;
  vesselId: string | null;
  type: LogEntryType;
  title: string;
  description: string | null;
  place: string | null;
  severity: LogSeverity | null;
  occurredAt: string;
  authorName: string | null;
  isSample: boolean;
}

function toRow(r: typeof logEntries.$inferSelect): LogEntryRow {
  return {
    id: r.id,
    tripId: r.tripId,
    vesselId: r.vesselId,
    type: r.type as LogEntryType,
    title: r.title,
    description: r.description,
    place: r.place,
    severity: (r.severity as LogSeverity | null) ?? null,
    occurredAt: r.occurredAt,
    authorName: r.authorName,
    isSample: r.isSample === 1,
  };
}

export interface CreateLogEntryInput {
  tripId: string;
  vesselId?: string | null;
  type: LogEntryType;
  title: string;
  description?: string;
  place?: string;
  severity?: LogSeverity;
  occurredAt?: string;
  authorName?: string;
}

/** Yerel-önce kayıt: anında SQLite'a yazar, sonra sync kuyruğuna düşer. */
export function createLogEntry(input: CreateLogEntryInput): LogEntryRow {
  typeSchema.parse(input.type);
  if (input.severity !== undefined) severitySchema.parse(input.severity);
  z.string().min(1).parse(input.title.trim());

  const [trip] = getDb().select().from(trips).where(eq(trips.id, input.tripId)).limit(1).all();
  if (trip && trip.isSample === 1) throw new SampleReadOnlyError(`trip ${input.tripId}`);

  const id = newId();
  getDb()
    .insert(logEntries)
    .values({
      id,
      tripId: input.tripId,
      vesselId: input.vesselId ?? trip?.boatId ?? null,
      type: input.type,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      place: input.place?.trim() || null,
      severity: input.severity ?? null,
      occurredAt: input.occurredAt ?? nowIso(),
      authorName: input.authorName ?? null,
      ...stamps(),
    })
    .run();
  enqueueSync("log_entries", id);
  return getLogEntry(id)!;
}

export function getLogEntry(id: string): LogEntryRow | null {
  const [r] = getDb().select().from(logEntries).where(eq(logEntries.id, id)).limit(1).all();
  return r ? toRow(r) : null;
}

/** Trip'in GERÇEK kayıtları (örnekler hariç), en yeni üstte. */
export function listLogEntries(tripId: string): LogEntryRow[] {
  return getDb()
    .select()
    .from(logEntries)
    .where(
      and(
        eq(logEntries.tripId, tripId),
        isNull(logEntries.deletedAt),
        eq(logEntries.isSample, 0)
      )
    )
    .orderBy(desc(logEntries.occurredAt))
    .all()
    .map(toRow);
}

/** Yalnız ÖRNEK kayıtlar (keşif modu). */
export function listSampleLogEntries(tripId: string): LogEntryRow[] {
  return getDb()
    .select()
    .from(logEntries)
    .where(
      and(
        eq(logEntries.tripId, tripId),
        isNull(logEntries.deletedAt),
        eq(logEntries.isSample, 1)
      )
    )
    .orderBy(desc(logEntries.occurredAt))
    .all()
    .map(toRow);
}

/** Teknenin GERÇEK kayıtları (tekne geçmişi görünümleri için). */
export function listLogEntriesByVessel(vesselId: string): LogEntryRow[] {
  return getDb()
    .select()
    .from(logEntries)
    .where(
      and(
        eq(logEntries.vesselId, vesselId),
        isNull(logEntries.deletedAt),
        eq(logEntries.isSample, 0)
      )
    )
    .orderBy(desc(logEntries.occurredAt))
    .all()
    .map(toRow);
}

function assertMutable(id: string): typeof logEntries.$inferSelect {
  const [r] = getDb().select().from(logEntries).where(eq(logEntries.id, id)).limit(1).all();
  if (!r) throw new Error(`Log entry not found: ${id}`);
  if (r.isSample === 1) throw new SampleReadOnlyError(`log entry ${id}`);
  return r;
}

export function updateLogEntry(
  id: string,
  patch: Partial<{
    title: string;
    description: string | null;
    place: string | null;
    severity: LogSeverity | null;
    type: LogEntryType;
  }>
): void {
  assertMutable(id);
  if (patch.type) typeSchema.parse(patch.type);
  if (patch.severity != null) severitySchema.parse(patch.severity);
  getDb()
    .update(logEntries)
    .set({ ...patch, updatedAt: nowIso() })
    .where(eq(logEntries.id, id))
    .run();
  enqueueSync("log_entries", id);
}

/** Silme onayı UI'da; burada soft delete (senkron-güvenli). */
export function deleteLogEntry(id: string): void {
  assertMutable(id);
  const now = nowIso();
  getDb()
    .update(logEntries)
    .set({ deletedAt: now, updatedAt: now })
    .where(eq(logEntries.id, id))
    .run();
  enqueueSync("log_entries", id, "delete");
}

// --- Medya (kanonik tablo media_assets; ikili çoğaltılmaz) ------------------

/**
 * Çekilmiş fotoğrafı log kaydına bağlar. Yakalama İZNİ çağırandan ÖNCE
 * entitlement katmanından (log_photo) alınmış olmalıdır; bu fonksiyon yalnız
 * yerel kaydı yazar — kanıt, sonraki yetki hataları ne olursa olsun silinmez.
 */
export function addLogMedia(logEntryId: string, localUri: string): string {
  assertMutable(logEntryId);
  const id = newId();
  getDb()
    .insert(mediaAssets)
    .values({
      id,
      inspectionId: null,
      logEntryId,
      kind: "photo",
      localUri,
      takenAt: nowIso(),
      uploadState: "pending",
      ...stamps(),
    })
    .run();
  enqueueSync("media_assets", id);
  return id;
}

export function listLogMedia(logEntryId: string) {
  return getDb()
    .select()
    .from(mediaAssets)
    .where(and(eq(mediaAssets.logEntryId, logEntryId), isNull(mediaAssets.deletedAt)))
    .all();
}

// --- Senkron durumu ---------------------------------------------------------

/**
 * Kuyrukta bekleyen (synced_at boş) log kayıtlarının kimlikleri.
 * KİLİTLİ dil: bekleyen iş "başarısız" DEĞİLDİR — "senkron bekliyor"dur.
 */
export function pendingLogSyncIds(): Set<string> {
  const rows = getDb()
    .select({ entityId: syncQueue.entityId })
    .from(syncQueue)
    .where(and(eq(syncQueue.entity, "log_entries"), isNull(syncQueue.syncedAt)))
    .all();
  return new Set(rows.map((r) => r.entityId));
}
