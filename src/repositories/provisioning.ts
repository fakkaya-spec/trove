import { and, asc, desc, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { getDb, newId, nowIso, stamps } from "../db/client";
import { provisionItems, provisionPlans, provisionRules } from "../db/schema";
import {
  LocalizedText,
  ProvisionCategory,
  ProvisionExplanation,
  ProvisionInputs,
  ProvisionItemState,
  ProvisionRuleDef,
  ProvisioningStyle,
} from "../domain/types";
import { calculatePlan, quantityToBuy, shoppingProgress } from "../domain/provisioning";
import { lt } from "../domain/inspection";
import { tripDays } from "../domain/trip";
import type { TripRow } from "./trips";
import { enqueueSync } from "./sync";

const stateSchema = z.enum(["suggested", "already_onboard", "purchased", "packed", "skipped"]);

// --- Kurallar ---------------------------------------------------------------

function parseJson<T>(json: string | null, fallback: T): T {
  if (!json) return fallback;
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

export function loadRules(): ProvisionRuleDef[] {
  return getDb()
    .select()
    .from(provisionRules)
    .where(and(eq(provisionRules.active, 1), isNull(provisionRules.deletedAt)))
    .orderBy(asc(provisionRules.sort))
    .all()
    .map((r) => ({
      id: r.id,
      ruleKey: r.ruleKey,
      category: r.category as ProvisionCategory,
      name: parseJson<LocalizedText>(r.nameJson, {}),
      unit: r.unit,
      mode: r.mode as ProvisionRuleDef["mode"],
      baseQty: r.baseQty,
      adultFactor: r.adultFactor,
      childFactor: r.childFactor,
      meal: (r.meal as ProvisionRuleDef["meal"]) ?? undefined,
      hotClimateFactor: r.hotClimateFactor,
      anchorFactor: r.anchorFactor,
      styleFactors: parseJson<Record<ProvisioningStyle, number>>(r.styleFactorsJson, {
        essential: 1,
        balanced: 1,
        comfortable: 1,
      }),
      reservePct: r.reservePct,
      minQty: r.minQty,
      roundTo: r.roundTo,
      requires: parseJson<Record<string, boolean>>(r.requiresJson, {}),
      sort: r.sort,
      version: r.version,
    }));
}

// --- Plan -------------------------------------------------------------------

export interface ProvisionItemRow {
  id: string;
  ruleId: string | null;
  category: ProvisionCategory;
  name: string;
  unit: string;
  calculatedQty: number | null;
  finalQty: number;
  onboardQty: number;
  state: ProvisionItemState;
  note: string | null;
  explanation: ProvisionExplanation | null;
  sort: number;
}

export interface ProvisionPlanRow {
  id: string;
  tripId: string;
  rulesVersion: number;
  inputs: ProvisionInputs | null;
}

export function getPlanForTrip(tripId: string): ProvisionPlanRow | null {
  const [r] = getDb()
    .select()
    .from(provisionPlans)
    .where(and(eq(provisionPlans.tripId, tripId), isNull(provisionPlans.deletedAt)))
    .orderBy(desc(provisionPlans.createdAt))
    .limit(1)
    .all();
  if (!r) return null;
  return {
    id: r.id,
    tripId: r.tripId,
    rulesVersion: r.rulesVersion,
    inputs: parseJson<ProvisionInputs | null>(r.inputsJson, null),
  };
}

/**
 * Trip için ikmal planı üretir (varsa mevcut planı döndürür — idempotent).
 * Hesap girdileri ve kural sürümü plana snapshot olarak yazılır ki
 * "neden bu miktar" sorusu sonradan yanıtlanabilsin (madde 26).
 */
export function generatePlan(trip: TripRow, locale: string): ProvisionPlanRow {
  const existing = getPlanForTrip(trip.id);
  if (existing) return existing;

  const db = getDb();
  const rules = loadRules();
  const inputs: ProvisionInputs = {
    adults: trip.adults,
    children: trip.children,
    infants: trip.infants,
    pets: trip.pets,
    days: tripDays(trip.tripType, trip.nights),
    nights: trip.nights,
    profile: trip.profile,
  };
  const calculated = calculatePlan(rules, inputs);
  const rulesVersion = rules[0]?.version ?? 1;

  const planId = newId();
  db.insert(provisionPlans)
    .values({
      id: planId,
      tripId: trip.id,
      rulesVersion,
      inputsJson: JSON.stringify(inputs),
      ...stamps(),
    })
    .run();

  calculated.forEach((c, idx) => {
    db.insert(provisionItems)
      .values({
        id: newId(),
        planId,
        ruleId: c.rule.id,
        category: c.rule.category,
        name: lt(c.rule.name, locale),
        unit: c.rule.unit,
        calculatedQty: c.quantity,
        finalQty: c.quantity,
        onboardQty: 0,
        state: "suggested",
        explanationJson: JSON.stringify(c.explanation),
        sort: idx,
        ...stamps(),
      })
      .run();
  });

  enqueueSync("provision_plans", planId);
  return getPlanForTrip(trip.id)!;
}

export function listPlanItems(planId: string): ProvisionItemRow[] {
  return getDb()
    .select()
    .from(provisionItems)
    .where(and(eq(provisionItems.planId, planId), isNull(provisionItems.deletedAt)))
    .orderBy(asc(provisionItems.sort))
    .all()
    .map((r) => ({
      id: r.id,
      ruleId: r.ruleId,
      category: r.category as ProvisionCategory,
      name: r.name,
      unit: r.unit,
      calculatedQty: r.calculatedQty,
      finalQty: r.finalQty,
      onboardQty: r.onboardQty,
      state: r.state as ProvisionItemState,
      note: r.note,
      explanation: parseJson<ProvisionExplanation | null>(r.explanationJson, null),
      sort: r.sort,
    }));
}

export function addCustomItem(
  planId: string,
  input: { name: string; category: ProvisionCategory; unit: string; finalQty: number }
): string {
  z.string().min(1).parse(input.name.trim());
  const id = newId();
  const [maxSort] = getDb()
    .select({ sort: provisionItems.sort })
    .from(provisionItems)
    .where(eq(provisionItems.planId, planId))
    .orderBy(desc(provisionItems.sort))
    .limit(1)
    .all();
  getDb()
    .insert(provisionItems)
    .values({
      id,
      planId,
      ruleId: null,
      category: input.category,
      name: input.name.trim(),
      unit: input.unit,
      calculatedQty: null,
      finalQty: input.finalQty,
      onboardQty: 0,
      state: "suggested",
      sort: (maxSort?.sort ?? 0) + 1,
      ...stamps(),
    })
    .run();
  enqueueSync("provision_items", id);
  return id;
}

export function updateItem(
  id: string,
  patch: Partial<{
    name: string;
    finalQty: number;
    onboardQty: number;
    state: ProvisionItemState;
    note: string | null;
    unit: string;
  }>
): void {
  if (patch.state) stateSchema.parse(patch.state);
  if (patch.finalQty !== undefined) z.number().nonnegative().parse(patch.finalQty);
  if (patch.onboardQty !== undefined) z.number().nonnegative().parse(patch.onboardQty);
  getDb()
    .update(provisionItems)
    .set({ ...patch, updatedAt: nowIso() })
    .where(eq(provisionItems.id, id))
    .run();
  enqueueSync("provision_items", id);
}

/** Silme onayı UI'da; burada soft delete. */
export function deleteItem(id: string): void {
  const now = nowIso();
  getDb()
    .update(provisionItems)
    .set({ deletedAt: now, updatedAt: now })
    .where(eq(provisionItems.id, id))
    .run();
  enqueueSync("provision_items", id, "delete");
}

export function planProgress(planId: string) {
  return shoppingProgress(listPlanItems(planId));
}

export { quantityToBuy };
