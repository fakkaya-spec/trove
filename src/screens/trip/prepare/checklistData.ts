// Faz 4 hazırlık ekranlarının ortak denetim-verisi yardımcıları.
// Motor değişmedi: repositories/inspections + domain/inspection yeniden kullanılır.
import { listTripInspections } from "../../../repositories/trips";
import { getInspection, getItemResults, InspectionRow } from "../../../repositories/inspections";
import { getTemplateById } from "../../../repositories/templates";
import { statusOf, toResultMap } from "../../../domain/inspection";
import type { TemplateSectionDef } from "../../../domain/types";

export interface ChecklistProgress {
  done: number;
  total: number;
}

export type ChecklistKind = "pre_departure" | "check_in";

/** Trip'e bağlı denetimin madde ilerlemesi; denetim yoksa null. */
export function tripChecklistProgress(
  tripId: string,
  kind: ChecklistKind
): ChecklistProgress | null {
  const ref = listTripInspections(tripId).find((i) => i.kind === kind);
  if (!ref) return null;
  const inspection = getInspection(ref.id);
  if (!inspection) return null;
  const template = getTemplateById(inspection.templateId);
  if (!template) return null;
  return checklistProgressOf(template.sections, inspection.id);
}

export function checklistProgressOf(
  sections: TemplateSectionDef[],
  inspectionId: string
): ChecklistProgress {
  const results = toResultMap(getItemResults(inspectionId));
  let done = 0;
  let total = 0;
  for (const section of sections) {
    for (const item of section.items) {
      if (item.inputKind !== "status") continue;
      total++;
      if (statusOf(results, item) !== "unchecked") done++;
    }
  }
  return { done, total };
}

export interface ChecklistData {
  inspection: InspectionRow;
  sections: TemplateSectionDef[];
}

export function loadChecklist(inspectionId: string): ChecklistData | null {
  const inspection = getInspection(inspectionId);
  if (!inspection) return null;
  const template = getTemplateById(inspection.templateId);
  if (!template) return null;
  return { inspection, sections: template.sections };
}
