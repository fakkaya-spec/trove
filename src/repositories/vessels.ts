import { and, desc, eq, isNull } from "drizzle-orm";
import { getDb, newId, stamps } from "../db/client";
import { vessels } from "../db/schema";
import type { BoatType } from "../domain/types";
import { enqueueSync } from "./sync";

export type OwnershipType = "owned" | "chartered" | "managed" | "temporary";

export interface VesselRow {
  id: string;
  name: string;
  type: BoatType;
  model: string | null;
  ownershipType: OwnershipType;
  isSample: boolean;
}

// İZOLASYON KURALI (docs/MONETIZATION.md 5 + Faz 3 kararı): gerçek sorgular
// örnekleri, örnek sorguları gerçekleri ASLA içermez. Filtre repository
// katmanında — ekranlar bayrakla uğraşmaz. tests/samples.test.ts kanıtlar.
function selectVessels(sample: boolean): VesselRow[] {
  return getDb()
    .select({
      id: vessels.id,
      name: vessels.name,
      type: vessels.type,
      model: vessels.model,
      ownershipType: vessels.ownershipType,
      isSample: vessels.isSample,
    })
    .from(vessels)
    .where(and(isNull(vessels.deletedAt), eq(vessels.isSample, sample ? 1 : 0)))
    .orderBy(desc(vessels.updatedAt))
    .all()
    .map((v) => ({
      ...v,
      type: v.type as BoatType,
      ownershipType: v.ownershipType as OwnershipType,
      isSample: v.isSample === 1,
    }));
}

/** Yalnız GERÇEK tekneler (örnekler hariç). */
export function listVessels(): VesselRow[] {
  return selectVessels(false);
}

/** Yalnız ÖRNEK tekneler (karşılama/keşif modu). */
export function listSampleVessels(): VesselRow[] {
  return selectVessels(true);
}

export function createVessel(input: {
  name: string;
  type: BoatType;
  model?: string;
  ownershipType?: OwnershipType;
}): VesselRow {
  const id = newId();
  const ownershipType = input.ownershipType ?? "owned";
  getDb()
    .insert(vessels)
    .values({
      id,
      name: input.name.trim(),
      type: input.type,
      model: input.model ?? null,
      ownershipType,
      ...stamps(),
    })
    .run();
  enqueueSync("vessels", id);
  return {
    id,
    name: input.name.trim(),
    type: input.type,
    model: input.model ?? null,
    ownershipType,
    isSample: false,
  };
}

/** Kimlikle erişim her iki kümeye de çalışır (örnek detayına girilebilir). */
export function getVesselById(id: string): VesselRow | null {
  return (
    selectVessels(false).find((v) => v.id === id) ??
    selectVessels(true).find((v) => v.id === id) ??
    null
  );
}
