import { and, desc, eq, isNull , inArray } from "drizzle-orm";
import { z } from "zod";
import { getDb, newId, nowIso, stamps } from "../db/client";
import { inspections, trips , issues } from "../db/schema";
import {
  DEFAULT_TRIP_PROFILE,
  InspectionStatus,
  OwnershipContext,
  TripStatus,
  TripType,
  TripUsageProfile,
} from "../domain/types";
import { tripDays , TripModuleStates } from "../domain/trip";
import { getBestTemplate, TemplateKind } from "./templates";
import { ensureSessionForTrip, linkInspectionToSession } from "./handover";
import { enqueueSync } from "./sync";

// --- Modül durumları (Home / TripDetail kartları için) ----------------------

import { getPlanForTrip, planProgress } from "./provisioning";

const tripTypeSchema = z.enum([
  "short_day_trip",
  "full_day_trip",
  "weekend",
  "multi_day_coastal",
  "offshore_passage",
]);

export interface TripRow {
  id: string;
  boatId: string | null;
  name: string;
  tripType: TripType;
  ownershipContext: OwnershipContext;
  status: TripStatus;
  startAt: string | null;
  endAt: string | null;
  departureLocation: string | null;
  destination: string | null;
  nights: number;
  adults: number;
  children: number;
  infants: number;
  pets: number;
  skipperName: string | null;
  crewNames: string[];
  profile: TripUsageProfile;
}

function parseProfile(json: string): TripUsageProfile {
  try {
    return { ...DEFAULT_TRIP_PROFILE, ...(JSON.parse(json) as Partial<TripUsageProfile>) };
  } catch {
    return { ...DEFAULT_TRIP_PROFILE };
  }
}

function toRow(r: typeof trips.$inferSelect): TripRow {
  let crew: string[] = [];
  try {
    crew = JSON.parse(r.crewNamesJson) as string[];
  } catch {
    crew = [];
  }
  return {
    id: r.id,
    boatId: r.boatId,
    name: r.name,
    tripType: r.tripType as TripType,
    ownershipContext: r.ownershipContext as OwnershipContext,
    status: r.status as TripStatus,
    startAt: r.startAt,
    endAt: r.endAt,
    departureLocation: r.departureLocation,
    destination: r.destination,
    nights: r.nights,
    adults: r.adults,
    children: r.children,
    infants: r.infants,
    pets: r.pets,
    skipperName: r.skipperName,
    crewNames: crew,
    profile: parseProfile(r.profileJson),
  };
}

export interface CreateTripInput {
  name: string;
  tripType: TripType;
  ownershipContext: OwnershipContext;
  boatId?: string;
  startAt?: string;
  endAt?: string;
  departureLocation?: string;
  destination?: string;
  nights: number;
  adults: number;
  children: number;
  infants: number;
  pets: number;
  skipperName?: string;
  crewNames?: string[];
  profile: TripUsageProfile;
}

export function createTrip(input: CreateTripInput): TripRow {
  tripTypeSchema.parse(input.tripType);
  z.number().int().min(1).parse(input.adults + input.children); // en az 1 kişi
  const id = newId();
  getDb()
    .insert(trips)
    .values({
      id,
      boatId: input.boatId ?? null,
      name: input.name.trim(),
      tripType: input.tripType,
      ownershipContext: input.ownershipContext,
      status: "planning",
      startAt: input.startAt ?? null,
      endAt: input.endAt ?? null,
      departureLocation: input.departureLocation ?? null,
      destination: input.destination ?? null,
      nights: input.nights,
      adults: input.adults,
      children: input.children,
      infants: input.infants,
      pets: input.pets,
      skipperName: input.skipperName ?? null,
      crewNamesJson: JSON.stringify(input.crewNames ?? []),
      profileJson: JSON.stringify(input.profile),
      ...stamps(),
    })
    .run();
  enqueueSync("trips", id);
  return getTrip(id)!;
}

export function getTrip(id: string): TripRow | null {
  const [r] = getDb().select().from(trips).where(eq(trips.id, id)).limit(1).all();
  return r ? toRow(r) : null;
}

export function listTrips(): TripRow[] {
  return getDb()
    .select()
    .from(trips)
    .where(isNull(trips.deletedAt))
    .orderBy(desc(trips.updatedAt))
    .all()
    .map(toRow);
}

export function updateTripStatus(id: string, status: TripStatus): void {
  getDb().update(trips).set({ status, updatedAt: nowIso() }).where(eq(trips.id, id)).run();
  enqueueSync("trips", id);
}

export function setTripBoat(id: string, boatId: string): void {
  getDb().update(trips).set({ boatId, updatedAt: nowIso() }).where(eq(trips.id, id)).run();
  enqueueSync("trips", id);
}

export function updateTripProfile(id: string, profile: TripUsageProfile): void {
  getDb()
    .update(trips)
    .set({ profileJson: JSON.stringify(profile), updatedAt: nowIso() })
    .where(eq(trips.id, id))
    .run();
  enqueueSync("trips", id);
}

/** Silme onayı UI'da; burada soft delete. */
export function deleteTrip(id: string): void {
  const now = nowIso();
  getDb().update(trips).set({ deletedAt: now, updatedAt: now }).where(eq(trips.id, id)).run();
  enqueueSync("trips", id, "delete");
}

export function tripDurationDays(trip: TripRow): number {
  return tripDays(trip.tripType, trip.nights);
}

// --- Trip'e bağlı denetimler -----------------------------------------------

export interface TripInspectionRef {
  id: string;
  kind: string;
  status: InspectionStatus;
}

export function listTripInspections(tripId: string): TripInspectionRef[] {
  return getDb()
    .select({ id: inspections.id, kind: inspections.kind, status: inspections.status })
    .from(inspections)
    .where(and(eq(inspections.tripId, tripId), isNull(inspections.deletedAt)))
    .all()
    .map((r) => ({ id: r.id, kind: r.kind, status: r.status as InspectionStatus }));
}

export function getTripModuleStates(trip: TripRow): TripModuleStates {
  const inspectionRefs = listTripInspections(trip.id);
  const byKind = (kind: string) =>
    inspectionRefs.find((i) => i.kind === kind)?.status ?? null;

  let openCritical = 0;
  if (inspectionRefs.length > 0) {
    const rows = getDb()
      .select({ severity: issues.severity, resolved: issues.resolved })
      .from(issues)
      .where(
        and(
          inArray(
            issues.inspectionId,
            inspectionRefs.map((i) => i.id)
          ),
          isNull(issues.deletedAt)
        )
      )
      .all();
    openCritical = rows.filter((r) => r.severity === "critical" && r.resolved === 0).length;
  }

  const plan = getPlanForTrip(trip.id);
  return {
    preDeparture: byKind("pre_departure"),
    returnCheck: byKind("return_secure"),
    checkIn: byKind("check_in"),
    checkOut: byKind("check_out"),
    provisioningPercent: plan ? planProgress(plan.id).percent : null,
    openCriticalIssues: openCritical,
  };
}

const KIND_TO_TEMPLATE: Record<string, TemplateKind> = {
  check_in: "charter_check_in",
  check_out: "charter_check_out",
  pre_departure: "pre_departure",
  return_secure: "return_secure",
};

/**
 * Trip için ilgili denetimi bulur veya oluşturur (idempotent).
 * Tekne tipi için birebir şablon yoksa yelkenli şablonuna düşer.
 */
export function ensureTripInspection(
  trip: TripRow,
  kind: "check_in" | "check_out" | "pre_departure" | "return_secure",
  boatType: string
): string {
  const existing = listTripInspections(trip.id).find((i) => i.kind === kind);
  if (existing) return existing.id;

  const template = getBestTemplate(boatType, KIND_TO_TEMPLATE[kind]);
  if (!template) throw new Error(`No template for kind=${kind}`);
  if (!trip.boatId) throw new Error("Trip has no boat yet");

  const id = newId();
  getDb()
    .insert(inspections)
    .values({
      id,
      tripId: trip.id,
      vesselId: trip.boatId,
      templateId: template.id,
      templateVersion: template.version,
      kind,
      status: "draft",
      locale: "en",
      startedAt: nowIso(),
      ...stamps(),
    })
    .run();
  enqueueSync("inspections", id);

  // Charter teslim denetimleri aynı HandoverSession altında eşleşir
  // (check-in ↔ check-out karşılaştırmasının temeli).
  if (kind === "check_in" || kind === "check_out") {
    const session = ensureSessionForTrip(trip.id, trip.boatId);
    linkInspectionToSession(session.id, kind, id);
  }
  return id;
}
