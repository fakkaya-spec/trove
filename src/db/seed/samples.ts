import { eq, like } from "drizzle-orm";
import type { Db } from "../client";
import { nowIso } from "../client";
import {
  vessels,
  trips,
  inspections,
  inspectionItemResults,
  issues,
  meterReadings,
  handoverSessions,
  seedVersions,
} from "../schema";
import { getBestTemplate } from "../../repositories/templates";

// ---------------------------------------------------------------------------
// ÖRNEK VERİ (Serenity / Aurora / Nomad) — KİLİTLİ ürün şartı:
// yeni kullanıcı ölü/boş uygulama görmez; örneklerle keşfeder.
// KURALLAR:
//  - Tüm kayıtlar is_sample=1 (vessels/trips) veya "smp-" ön ekli sabit ID.
//  - Gerçek sorgulara ASLA karışmaz (repository filtreleri + tests/samples.test.ts).
//  - sync_queue'ya YAZILMAZ (doğrudan insert; enqueueSync çağrılmaz).
//  - resetSamples() yalnız örnekleri siler; gerçek veriye dokunAMAZ.
// ---------------------------------------------------------------------------

export const SAMPLES_SEED_KEY = "samples";
export const SAMPLES_VERSION = 1;

export const SAMPLE_IDS = {
  serenity: "smp-vessel-serenity",
  aurora: "smp-vessel-aurora",
  nomad: "smp-vessel-nomad",
  tripSerenity: "smp-trip-kornati",
  tripAurora: "smp-trip-amalfi",
  tripNomad: "smp-trip-cotedazur",
  checkin: "smp-insp-checkin",
  session: "smp-session-kornati",
} as const;

function seedVersion(db: Db, key: string): number {
  const [row] = db.select().from(seedVersions).where(eq(seedVersions.seedKey, key)).all();
  return row?.version ?? 0;
}

function markSeedVersion(db: Db, key: string, version: number): void {
  const [row] = db.select().from(seedVersions).where(eq(seedVersions.seedKey, key)).all();
  if (!row) {
    db.insert(seedVersions).values({ seedKey: key, version, appliedAt: nowIso() }).run();
  } else {
    db.update(seedVersions)
      .set({ version, appliedAt: nowIso() })
      .where(eq(seedVersions.seedKey, key))
      .run();
  }
}

const S = () => ({ createdAt: nowIso(), updatedAt: nowIso() });

export function seedSamples(db: Db): void {
  if (seedVersion(db, SAMPLES_SEED_KEY) >= SAMPLES_VERSION) return;

  // --- Tekneler -------------------------------------------------------------
  db.insert(vessels)
    .values([
      {
        id: SAMPLE_IDS.serenity,
        name: "Serenity",
        type: "sailing",
        model: "Bavaria 51 Cruiser",
        manufacturer: "Bavaria",
        modelYear: 2019,
        lengthM: 15.4,
        registrationNumber: "ES-1234-MAL",
        hullIdentificationNumber: "BAVVN51K2001",
        engineType: "Volvo Penta 75 hp",
        ownershipType: "chartered",
        isSample: 1,
        ...S(),
      },
      {
        id: SAMPLE_IDS.aurora,
        name: "Aurora",
        type: "motor",
        model: "Azimut 48",
        manufacturer: "Azimut",
        modelYear: 2021,
        lengthM: 14.8,
        engineType: "2× Volvo Penta IPS600",
        ownershipType: "owned",
        isSample: 1,
        ...S(),
      },
      {
        id: SAMPLE_IDS.nomad,
        name: "Nomad",
        type: "sailing",
        model: "Jeanneau Sun Odyssey 40",
        manufacturer: "Jeanneau",
        modelYear: 2017,
        lengthM: 11.9,
        engineType: "Yanmar 40 hp",
        ownershipType: "owned",
        isSample: 1,
        ...S(),
      },
    ])
    .run();

  // --- Seferler -------------------------------------------------------------
  db.insert(trips)
    .values([
      {
        id: SAMPLE_IDS.tripSerenity,
        boatId: SAMPLE_IDS.serenity,
        name: "Kornati Islands",
        tripType: "multi_day_coastal",
        ownershipContext: "charter",
        status: "active",
        startAt: "2026-07-18",
        endAt: "2026-07-25",
        departureLocation: "Murter",
        destination: "Kornati National Park",
        nights: 7,
        adults: 6,
        children: 0,
        skipperName: "Marco Rossi",
        crewNamesJson: JSON.stringify([
          "Lucia Moretti",
          "Tom Andersson",
          "Sara Kim",
          "James Peterson",
          "Claire Peterson",
        ]),
        profileJson: JSON.stringify({ climate: "hot", style: "balanced", allergies: "1× vegetarian" }),
        isSample: 1,
        ...S(),
      },
      {
        id: SAMPLE_IDS.tripAurora,
        boatId: SAMPLE_IDS.aurora,
        name: "Amalfi Coast",
        tripType: "weekend",
        ownershipContext: "own",
        status: "planning",
        startAt: "2026-08-21",
        endAt: "2026-08-23",
        departureLocation: "Salerno",
        destination: "Amalfi Coast",
        nights: 2,
        adults: 2,
        children: 2,
        skipperName: "Elena Costa",
        isSample: 1,
        ...S(),
      },
      {
        id: SAMPLE_IDS.tripNomad,
        boatId: SAMPLE_IDS.nomad,
        name: "Côte d'Azur day cruise",
        tripType: "full_day_trip",
        ownershipContext: "own",
        status: "completed",
        startAt: "2026-06-10",
        endAt: "2026-06-10",
        departureLocation: "Antibes",
        destination: "Îles de Lérins",
        nights: 0,
        adults: 4,
        isSample: 1,
        ...S(),
      },
    ])
    .run();

  // --- Serenity check-in denetimi (tamamlanmış, kanıt derinliği için) -------
  const tpl = getBestTemplate("sailing", "charter_check_in");
  if (tpl) {
    // inspections tablosunda bayrak yok; izolasyon smp- ID + örnek ebeveyn üzerinden.
    db.insert(inspections)
      .values({
        id: SAMPLE_IDS.checkin,
        vesselId: SAMPLE_IDS.serenity,
        tripId: SAMPLE_IDS.tripSerenity,
        templateId: tpl.id,
        templateVersion: tpl.version,
        kind: "check_in",
        status: "completed",
        locale: "en",
        startedAt: "2026-07-18T09:05:00.000Z",
        completedAt: "2026-07-18T09:42:00.000Z",
        ...S(),
      })
      .run();

    const statusItems = tpl.sections
      .flatMap((sec) => sec.items)
      .filter((i) => i.inputKind === "status")
      .slice(0, 8);
    db.insert(inspectionItemResults)
      .values(
        statusItems.map((item, idx) => ({
          inspectionId: SAMPLE_IDS.checkin,
          templateItemId: item.id,
          status: idx === 5 ? "needs_attention" : "working",
          ...S(),
        }))
      )
      .run();

    db.insert(issues)
      .values([
        {
          id: "smp-issue-winch",
          inspectionId: SAMPLE_IDS.checkin,
          tripId: SAMPLE_IDS.tripSerenity,
          severity: "low",
          title: "Port winch — grinding noise under load",
          description: "Cockpit · noted during check-in demo",
          ...S(),
        },
        {
          id: "smp-issue-navlight",
          inspectionId: SAMPLE_IDS.checkin,
          tripId: SAMPLE_IDS.tripSerenity,
          severity: "low",
          title: "Navigation light flickering at speed",
          description: "Bow · port side",
          ...S(),
        },
      ])
      .run();

    db.insert(meterReadings)
      .values([
        {
          id: "smp-meter-engine",
          inspectionId: SAMPLE_IDS.checkin,
          tripId: SAMPLE_IDS.tripSerenity,
          boatId: SAMPLE_IDS.serenity,
          meterKind: "engine_hours",
          value: 1204,
          unit: "h",
          readingStage: "check_in",
          ...S(),
        },
        {
          id: "smp-meter-fuel",
          inspectionId: SAMPLE_IDS.checkin,
          tripId: SAMPLE_IDS.tripSerenity,
          boatId: SAMPLE_IDS.serenity,
          meterKind: "fuel_pct",
          value: 100,
          unit: "%",
          readingStage: "check_in",
          ...S(),
        },
      ])
      .run();

    db.insert(handoverSessions)
      .values({
        id: SAMPLE_IDS.session,
        vesselId: SAMPLE_IDS.serenity,
        skipperName: "Marco Rossi",
        checkinInspectionId: SAMPLE_IDS.checkin,
        status: "open",
        ...S(),
      })
      .run();
  }

  markSeedVersion(db, SAMPLES_SEED_KEY, SAMPLES_VERSION);
}

/**
 * Örnekleri sıfırlar: YALNIZ is_sample=1 satırları ve smp- ön ekli alt
 * kayıtları siler, sonra yeniden seed'ler. Gerçek veriye dokunAMAZ (testli).
 */
export function resetSamples(db: Db): void {
  db.delete(handoverSessions).where(like(handoverSessions.id, "smp-%")).run();
  db.delete(meterReadings).where(like(meterReadings.id, "smp-%")).run();
  db.delete(issues).where(like(issues.id, "smp-%")).run();
  db.delete(inspectionItemResults).where(like(inspectionItemResults.inspectionId, "smp-%")).run();
  db.delete(inspections).where(like(inspections.id, "smp-%")).run();
  db.delete(trips).where(eq(trips.isSample, 1)).run();
  db.delete(vessels).where(eq(vessels.isSample, 1)).run();
  db.update(seedVersions).set({ version: 0 }).where(eq(seedVersions.seedKey, SAMPLES_SEED_KEY)).run();
  seedSamples(db);
}
