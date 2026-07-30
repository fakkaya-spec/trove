import { and, asc, eq, isNull } from "drizzle-orm";
import { getDb } from "../db/client";
import { inspectionTemplates, inventoryItems, templateItems, templateSections } from "../db/schema";
import type {
  LocalizedText,
  MeterKind,
  TemplateDef,
  TemplateItemDef,
  TemplateSectionDef,
} from "../domain/types";

function parseLt(json: string | null): LocalizedText | undefined {
  if (!json) return undefined;
  try {
    return JSON.parse(json) as LocalizedText;
  } catch {
    return undefined;
  }
}

export interface InventoryItemDef {
  id: string;
  sort: number;
  name: LocalizedText;
  expectedCount: number;
}

export type TemplateKind =
  | "charter_check_in"
  | "charter_check_out"
  | "pre_departure"
  | "return_secure";

export function getActiveTemplate(
  boatType: string,
  kind: TemplateKind = "charter_check_in"
): TemplateDef | null {
  const db = getDb();
  const [tpl] = db
    .select()
    .from(inspectionTemplates)
    .where(
      and(
        eq(inspectionTemplates.boatType, boatType),
        eq(inspectionTemplates.kind, kind),
        eq(inspectionTemplates.isActive, 1),
        isNull(inspectionTemplates.deletedAt)
      )
    )
    .limit(1)
    .all();
  if (!tpl) return null;
  return getTemplateById(tpl.id);
}

/**
 * Tekne tipine en uygun şablon: birebir eşleşme yoksa aynı türden (kind)
 * yelkenli şablonuna düşer (Faz 1'de her tip için şablon yok — bilinçli).
 */
export function getBestTemplate(boatType: string, kind: TemplateKind): TemplateDef | null {
  return getActiveTemplate(boatType, kind) ?? getActiveTemplate("sailing", kind);
}

export interface TemplateListRow {
  id: string;
  kind: TemplateKind;
  boatType: string;
  name: LocalizedText;
  itemCount: number;
}

export function listTemplates(): TemplateListRow[] {
  const db = getDb();
  const rows = db
    .select()
    .from(inspectionTemplates)
    .where(and(eq(inspectionTemplates.isActive, 1), isNull(inspectionTemplates.deletedAt)))
    .all();
  return rows.map((r) => {
    const def = getTemplateById(r.id);
    const itemCount =
      def?.sections.reduce(
        (n, s) => n + s.items.filter((i) => i.inputKind === "status").length,
        0
      ) ?? 0;
    return {
      id: r.id,
      kind: r.kind as TemplateKind,
      boatType: r.boatType,
      name: parseLt(r.nameJson) ?? {},
      itemCount,
    };
  });
}

export function getTemplateById(id: string): TemplateDef | null {
  const db = getDb();
  const [tpl] = db
    .select()
    .from(inspectionTemplates)
    .where(eq(inspectionTemplates.id, id))
    .limit(1)
    .all();
  if (!tpl) return null;

  const sections = db
    .select()
    .from(templateSections)
    .where(and(eq(templateSections.templateId, id), isNull(templateSections.deletedAt)))
    .orderBy(asc(templateSections.sort))
    .all();

  const sectionDefs: TemplateSectionDef[] = sections.map((s) => {
    const items = getDb()
      .select()
      .from(templateItems)
      .where(and(eq(templateItems.sectionId, s.id), isNull(templateItems.deletedAt)))
      .orderBy(asc(templateItems.sort))
      .all();
    const itemDefs: TemplateItemDef[] = items.map((i) => ({
      id: i.id,
      sectionId: s.id,
      sort: i.sort,
      title: parseLt(i.titleJson) ?? {},
      tip: parseLt(i.tipJson),
      isCritical: i.isCritical === 1,
      requiresPhotoOnIssue: i.requiresPhotoOnIssue === 1,
      required: i.required === 1,
      inputKind: (i.inputKind as "status" | "meter") ?? "status",
      meterKind: (i.meterKind as MeterKind | null) ?? undefined,
      safetyNote: parseLt(i.safetyNoteJson),
    }));
    return {
      id: s.id,
      sort: s.sort,
      icon: s.icon,
      title: parseLt(s.titleJson) ?? {},
      items: itemDefs,
    };
  });

  return {
    id: tpl.id,
    boatType: tpl.boatType as TemplateDef["boatType"],
    name: parseLt(tpl.nameJson) ?? {},
    version: tpl.version,
    sections: sectionDefs,
  };
}

export function getInventoryDefs(templateId: string): InventoryItemDef[] {
  const rows = getDb()
    .select()
    .from(inventoryItems)
    .where(and(eq(inventoryItems.templateId, templateId), isNull(inventoryItems.deletedAt)))
    .orderBy(asc(inventoryItems.sort))
    .all();
  return rows.map((r) => ({
    id: r.id,
    sort: r.sort,
    name: parseLt(r.nameJson) ?? {},
    expectedCount: r.expectedCount,
  }));
}
