import { and, desc, eq, isNull, notLike } from "drizzle-orm";
import { z } from "zod";
import { getDb, newId, nowIso, stamps } from "../db/client";
import {
  handoverSessions,
  inspectionItemResults,
  inspections,
  issues,
  mediaAssets,
  meterReadings,
  inventoryCounts,
} from "../db/schema";
import {
  assertTransition,
  bulkApproveSection,
  toResultMap,
} from "../domain/inspection";
import type {
  InspectionKind,
  InspectionStatus,
  IssueSeverity,
  ItemResult,
  ItemStatus,
  MeterKind,
  TemplateSectionDef,
} from "../domain/types";
import { METER_UNITS } from "../domain/types";
import { enqueueSync } from "./sync";

// --- Şema doğrulama (ortak) -------------------------------------------------

const itemStatusSchema = z.enum([
  "unchecked",
  "working",
  "needs_attention",
  "not_working",
  "not_applicable",
]);
const severitySchema = z.enum(["low", "medium", "high", "critical"]);
const meterValueSchema = z.object({
  kind: z.enum(["engine_hours", "fuel_pct", "water_pct", "battery_v", "generator_hours", "waste_pct"]),
  value: z.number().finite().nonnegative(),
});

// --- Inspection yaşam döngüsü ----------------------------------------------

export interface InspectionRow {
  id: string;
  vesselId: string;
  templateId: string;
  kind: InspectionKind;
  status: InspectionStatus;
  startedAt: string;
  completedAt: string | null;
  sessionId: string | null;
}

export function createCheckInInspection(input: {
  vesselId: string;
  templateId: string;
  templateVersion: number;
  locale: string;
}): InspectionRow {
  const db = getDb();
  const sessionId = newId();
  const inspectionId = newId();
  const now = nowIso();

  db.insert(handoverSessions)
    .values({ id: sessionId, vesselId: input.vesselId, status: "open", startsAt: now, ...stamps() })
    .run();
  db.insert(inspections)
    .values({
      id: inspectionId,
      sessionId,
      vesselId: input.vesselId,
      templateId: input.templateId,
      templateVersion: input.templateVersion,
      kind: "check_in",
      status: "draft",
      locale: input.locale,
      startedAt: now,
      ...stamps(),
    })
    .run();
  db.update(handoverSessions)
    .set({ checkinInspectionId: inspectionId, updatedAt: now })
    .where(eq(handoverSessions.id, sessionId))
    .run();

  enqueueSync("handover_sessions", sessionId);
  enqueueSync("inspections", inspectionId);
  return {
    id: inspectionId,
    vesselId: input.vesselId,
    templateId: input.templateId,
    kind: "check_in",
    status: "draft",
    startedAt: now,
    completedAt: null,
    sessionId,
  };
}

export function getInspection(id: string): InspectionRow | null {
  const [row] = getDb().select().from(inspections).where(eq(inspections.id, id)).limit(1).all();
  if (!row) return null;
  return {
    id: row.id,
    vesselId: row.vesselId,
    templateId: row.templateId,
    kind: row.kind as InspectionKind,
    status: row.status as InspectionStatus,
    startedAt: row.startedAt,
    completedAt: row.completedAt,
    sessionId: row.sessionId,
  };
}

export function listInspections(): (InspectionRow & { vesselName?: string })[] {
  const db = getDb();
  // Örnek denetimler (smp- ID) gerçek listelere karışmaz (izolasyon kuralı).
  const rows = db
    .select()
    .from(inspections)
    .where(and(isNull(inspections.deletedAt), notLike(inspections.id, "smp-%")))
    .orderBy(desc(inspections.updatedAt))
    .all();
  return rows.map((row) => ({
    id: row.id,
    vesselId: row.vesselId,
    templateId: row.templateId,
    kind: row.kind as InspectionKind,
    status: row.status as InspectionStatus,
    startedAt: row.startedAt,
    completedAt: row.completedAt,
    sessionId: row.sessionId,
  }));
}

function setStatus(id: string, from: InspectionStatus, to: InspectionStatus): void {
  assertTransition(from, to);
  getDb()
    .update(inspections)
    .set({ status: to, updatedAt: nowIso() })
    .where(eq(inspections.id, id))
    .run();
  enqueueSync("inspections", id);
}

/** İlk mutasyonda draft → in_progress */
function ensureInProgress(inspection: InspectionRow): void {
  if (inspection.status === "draft") setStatus(inspection.id, "draft", "in_progress");
}

export function completeInspection(id: string): void {
  const insp = getInspection(id);
  if (!insp) throw new Error("Inspection not found");
  const now = nowIso();
  const started = Date.parse(insp.startedAt);
  setStatus(id, insp.status, "completed");
  getDb()
    .update(inspections)
    .set({
      completedAt: now,
      durationS: Number.isFinite(started) ? Math.round((Date.now() - started) / 1000) : null,
      updatedAt: now,
    })
    .where(eq(inspections.id, id))
    .run();
}

export function reopenInspection(id: string): void {
  const insp = getInspection(id);
  if (!insp) throw new Error("Inspection not found");
  setStatus(id, insp.status, "in_progress");
}

// --- Madde sonuçları --------------------------------------------------------

export function getItemResults(inspectionId: string): ItemResult[] {
  return getDb()
    .select()
    .from(inspectionItemResults)
    .where(eq(inspectionItemResults.inspectionId, inspectionId))
    .all()
    .map((r) => ({
      templateItemId: r.templateItemId,
      status: r.status as ItemStatus,
      note: r.note,
    }));
}

export function setItemStatus(
  inspection: InspectionRow,
  templateItemId: string,
  status: ItemStatus,
  note?: string
): void {
  itemStatusSchema.parse(status);
  ensureInProgress(inspection);
  const db = getDb();
  const now = nowIso();
  const existing = db
    .select()
    .from(inspectionItemResults)
    .where(
      and(
        eq(inspectionItemResults.inspectionId, inspection.id),
        eq(inspectionItemResults.templateItemId, templateItemId)
      )
    )
    .limit(1)
    .all();
  if (existing.length > 0) {
    db.update(inspectionItemResults)
      .set({ status, note: note ?? existing[0].note, updatedAt: now })
      .where(
        and(
          eq(inspectionItemResults.inspectionId, inspection.id),
          eq(inspectionItemResults.templateItemId, templateItemId)
        )
      )
      .run();
  } else {
    db.insert(inspectionItemResults)
      .values({
        inspectionId: inspection.id,
        templateItemId,
        status,
        note: note ?? null,
        ...stamps(),
      })
      .run();
  }
  enqueueSync("inspection_item_results", `${inspection.id}:${templateItemId}`);
}

/** "Bu bölümde sorun yok": kritik olmayan unchecked → working (domain kuralı). */
export function approveSection(inspection: InspectionRow, section: TemplateSectionDef): number {
  const results = toResultMap(getItemResults(inspection.id));
  const updates = bulkApproveSection(section, results);
  for (const u of updates) {
    setItemStatus(inspection, u.templateItemId, u.status);
  }
  return updates.length;
}

// --- Sorunlar ---------------------------------------------------------------

export interface IssueRow {
  id: string;
  templateItemId: string | null;
  severity: IssueSeverity;
  title: string;
  description: string | null;
  reportedToCompany: boolean;
  resolved: boolean;
}

export function listIssues(inspectionId: string): IssueRow[] {
  return getDb()
    .select()
    .from(issues)
    .where(and(eq(issues.inspectionId, inspectionId), isNull(issues.deletedAt)))
    .all()
    .map((r) => ({
      id: r.id,
      templateItemId: r.templateItemId,
      severity: r.severity as IssueSeverity,
      title: r.title,
      description: r.description,
      reportedToCompany: r.reportedToCompany === 1,
      resolved: r.resolved === 1,
    }));
}

export function upsertIssueForItem(
  inspection: InspectionRow,
  input: {
    templateItemId: string;
    severity: IssueSeverity;
    title: string;
    description?: string;
    reportedToCompany?: boolean;
    resolved?: boolean;
  }
): string {
  severitySchema.parse(input.severity);
  ensureInProgress(inspection);
  const db = getDb();
  const now = nowIso();
  const existing = db
    .select()
    .from(issues)
    .where(
      and(
        eq(issues.inspectionId, inspection.id),
        eq(issues.templateItemId, input.templateItemId),
        isNull(issues.deletedAt)
      )
    )
    .limit(1)
    .all();
  if (existing.length > 0) {
    db.update(issues)
      .set({
        severity: input.severity,
        title: input.title,
        description: input.description ?? null,
        reportedToCompany: input.reportedToCompany ? 1 : 0,
        resolved: input.resolved ? 1 : 0,
        updatedAt: now,
      })
      .where(eq(issues.id, existing[0].id))
      .run();
    enqueueSync("issues", existing[0].id);
    return existing[0].id;
  }
  const id = newId();
  db.insert(issues)
    .values({
      id,
      inspectionId: inspection.id,
      templateItemId: input.templateItemId,
      severity: input.severity,
      title: input.title,
      description: input.description ?? null,
      reportedToCompany: input.reportedToCompany ? 1 : 0,
      resolved: input.resolved ? 1 : 0,
      ...stamps(),
    })
    .run();
  enqueueSync("issues", id);
  return id;
}

export function removeIssueForItem(inspectionId: string, templateItemId: string): void {
  const now = nowIso();
  getDb()
    .update(issues)
    .set({ deletedAt: now, updatedAt: now })
    .where(and(eq(issues.inspectionId, inspectionId), eq(issues.templateItemId, templateItemId)))
    .run();
}

// --- Medya ------------------------------------------------------------------

export function addMedia(
  inspection: InspectionRow,
  input: { localUri: string; issueId?: string; meterReadingId?: string; kind?: "photo" | "video" | "audio" }
): string {
  ensureInProgress(inspection);
  const id = newId();
  getDb()
    .insert(mediaAssets)
    .values({
      id,
      inspectionId: inspection.id,
      issueId: input.issueId ?? null,
      meterReadingId: input.meterReadingId ?? null,
      kind: input.kind ?? "photo",
      localUri: input.localUri,
      takenAt: nowIso(),
      uploadState: "pending",
      ...stamps(),
    })
    .run();
  enqueueSync("media_assets", id);
  return id;
}

export function listMedia(inspectionId: string, issueId?: string) {
  const db = getDb();
  const conditions = [eq(mediaAssets.inspectionId, inspectionId), isNull(mediaAssets.deletedAt)];
  if (issueId) conditions.push(eq(mediaAssets.issueId, issueId));
  return db
    .select()
    .from(mediaAssets)
    .where(and(...conditions))
    .all();
}

// --- Sayaçlar ---------------------------------------------------------------

export interface MeterRow {
  id: string;
  kind: MeterKind;
  value: number;
  unit: string;
}

export function listMeters(inspectionId: string): MeterRow[] {
  return getDb()
    .select()
    .from(meterReadings)
    .where(and(eq(meterReadings.inspectionId, inspectionId), isNull(meterReadings.deletedAt)))
    .all()
    .map((r) => ({ id: r.id, kind: r.meterKind as MeterKind, value: r.value, unit: r.unit }));
}

export function upsertMeter(inspection: InspectionRow, kind: MeterKind, value: number): string {
  meterValueSchema.parse({ kind, value });
  ensureInProgress(inspection);
  const db = getDb();
  const now = nowIso();
  const existing = db
    .select()
    .from(meterReadings)
    .where(
      and(
        eq(meterReadings.inspectionId, inspection.id),
        eq(meterReadings.meterKind, kind),
        isNull(meterReadings.deletedAt)
      )
    )
    .limit(1)
    .all();
  if (existing.length > 0) {
    db.update(meterReadings)
      .set({ value, confirmed: 1, updatedAt: now })
      .where(eq(meterReadings.id, existing[0].id))
      .run();
    enqueueSync("meter_readings", existing[0].id);
    return existing[0].id;
  }
  const id = newId();
  db.insert(meterReadings)
    .values({
      id,
      inspectionId: inspection.id,
      meterKind: kind,
      value,
      unit: METER_UNITS[kind],
      confirmed: 1,
      ...stamps(),
    })
    .run();
  enqueueSync("meter_readings", id);
  return id;
}

// --- Envanter ---------------------------------------------------------------

export function upsertInventoryCount(
  inspection: InspectionRow,
  inventoryItemId: string,
  foundCount: number
): void {
  z.number().int().nonnegative().parse(foundCount);
  ensureInProgress(inspection);
  const db = getDb();
  const now = nowIso();
  const existing = db
    .select()
    .from(inventoryCounts)
    .where(
      and(
        eq(inventoryCounts.inspectionId, inspection.id),
        eq(inventoryCounts.inventoryItemId, inventoryItemId)
      )
    )
    .limit(1)
    .all();
  if (existing.length > 0) {
    db.update(inventoryCounts)
      .set({ foundCount, updatedAt: now })
      .where(
        and(
          eq(inventoryCounts.inspectionId, inspection.id),
          eq(inventoryCounts.inventoryItemId, inventoryItemId)
        )
      )
      .run();
  } else {
    db.insert(inventoryCounts)
      .values({ inspectionId: inspection.id, inventoryItemId, foundCount, ...stamps() })
      .run();
  }
  enqueueSync("inventory_counts", `${inspection.id}:${inventoryItemId}`);
}

export function listInventoryCounts(inspectionId: string): Map<string, number> {
  const rows = getDb()
    .select()
    .from(inventoryCounts)
    .where(eq(inventoryCounts.inspectionId, inspectionId))
    .all();
  return new Map(rows.map((r) => [r.inventoryItemId, r.foundCount]));
}
