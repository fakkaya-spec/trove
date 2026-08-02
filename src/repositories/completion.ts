import { and, asc, eq, isNull } from "drizzle-orm";
import { getDb, newId, nowIso, stamps } from "../db/client";
import { issues, logEntries, tripSignoffs, trips } from "../db/schema";
import {
  categorize,
  OpenItem,
  OpenItemOrigin,
  ReviewCategory,
  SignoffRole,
} from "../domain/completion";
import { OPEN_OBSERVATION_TYPES, SampleReadOnlyError } from "./log";
import { listTripInspections } from "./trips";
import { setIssueResolved } from "./inspections";
import { resolveLogEntry } from "./log";
import { enqueueSync } from "./sync";

// ---------------------------------------------------------------------------
// Tamamlama okuma modeli (Faz 7): denetim sorunları + log gözlemleri tek
// "açık maddeler" kavramında SUNULUR — veri modelleri birleştirilmez.
// Örnek izolasyon deseni aynen: gerçek sorgular örnek görmez, örnek kayda
// gerçek-yol mutasyonu tipli hatayla reddedilir.
// ---------------------------------------------------------------------------

const KIND_ORIGIN: Record<string, OpenItemOrigin> = {
  check_in: "check_in",
  check_out: "check_out",
  pre_departure: "trip",
  return_secure: "check_out",
};

/**
 * Seferin TÜM inceleme maddeleri (çözülmüş + açık) — rapor ve tamamlama
 * incelemesi bunu sınıflandırır. UI yalnız açıkları istiyorsa filtreler.
 */
export function listReviewItems(tripId: string): OpenItem[] {
  const items: OpenItem[] = [];

  // Log tarafı: gözlem/olay/arıza türleri (gerçek kayıtlar; örnekler hariç)
  const logs = getDb()
    .select()
    .from(logEntries)
    .where(
      and(
        eq(logEntries.tripId, tripId),
        isNull(logEntries.deletedAt),
        eq(logEntries.isSample, 0)
      )
    )
    .orderBy(asc(logEntries.occurredAt))
    .all();
  for (const e of logs) {
    if (!(OPEN_OBSERVATION_TYPES as readonly string[]).includes(e.type)) continue;
    items.push({
      source: "log",
      id: e.id,
      title: e.title,
      severity: e.severity,
      origin: "trip",
      recordedAt: e.occurredAt,
      resolved: e.resolvedAt !== null,
    });
  }

  // Denetim tarafı: trip'e bağlı denetimlerin sorunları
  for (const ref of listTripInspections(tripId)) {
    const origin = KIND_ORIGIN[ref.kind] ?? "trip";
    const rows = getDb()
      .select()
      .from(issues)
      .where(and(eq(issues.inspectionId, ref.id), isNull(issues.deletedAt)))
      .orderBy(asc(issues.createdAt))
      .all();
    for (const r of rows) {
      items.push({
        source: "inspection",
        id: r.id,
        title: r.title,
        severity: r.severity,
        origin,
        recordedAt: r.createdAt,
        resolved: r.resolved === 1,
      });
    }
  }
  return items;
}

/** Yalnız çözülmemişler (tamamlama incelemesi UI'ı). */
export function listOpenItems(tripId: string): OpenItem[] {
  return listReviewItems(tripId).filter((i) => !i.resolved);
}

/** Sınıflandırılmış özet (rapor view-model girdisi). */
export function reviewByCategory(tripId: string): Record<ReviewCategory, OpenItem[]> {
  const grouped: Record<ReviewCategory, OpenItem[]> = {
    resolved_during_trip: [],
    still_open: [],
    new_at_checkout: [],
    present_at_checkin: [],
  };
  for (const item of listReviewItems(tripId)) grouped[categorize(item)].push(item);
  return grouped;
}

/**
 * Açık maddeyi çözüldü işaretler — kaynağına göre kanonik modele yazar.
 * Kullanıcı çözmeye ZORLANMAZ; açık bırakmak meşrudur (raporda görünür).
 */
export function resolveOpenItem(item: OpenItem): void {
  if (item.source === "log") resolveLogEntry(item.id);
  else setIssueResolved(item.id, true);
}

// --- Yazılı onay (sign-off) -------------------------------------------------

export interface SignoffRow {
  id: string;
  tripId: string;
  inspectionId: string | null;
  role: SignoffRole;
  name: string;
  note: string | null;
  signedAt: string;
}

function assertRealTrip(tripId: string): void {
  const [t] = getDb().select().from(trips).where(eq(trips.id, tripId)).limit(1).all();
  if (t && t.isSample === 1) throw new SampleReadOnlyError(`trip ${tripId}`);
}

export function addSignoff(input: {
  tripId: string;
  role: SignoffRole;
  name: string;
  inspectionId?: string | null;
  note?: string;
}): SignoffRow {
  assertRealTrip(input.tripId);
  const id = newId();
  getDb()
    .insert(tripSignoffs)
    .values({
      id,
      tripId: input.tripId,
      inspectionId: input.inspectionId ?? null,
      role: input.role,
      name: input.name.trim(),
      note: input.note?.trim() || null,
      signedAt: nowIso(),
      ...stamps(),
    })
    .run();
  enqueueSync("trip_signoffs", id);
  return listSignoffs(input.tripId).find((s) => s.id === id)!;
}

export function listSignoffs(tripId: string): SignoffRow[] {
  return getDb()
    .select()
    .from(tripSignoffs)
    .where(and(eq(tripSignoffs.tripId, tripId), isNull(tripSignoffs.deletedAt)))
    .orderBy(asc(tripSignoffs.signedAt))
    .all()
    .map((r) => ({
      id: r.id,
      tripId: r.tripId,
      inspectionId: r.inspectionId,
      role: r.role as SignoffRole,
      name: r.name,
      note: r.note,
      signedAt: r.signedAt,
    }));
}
