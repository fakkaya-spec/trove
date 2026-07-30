import { desc, isNull } from "drizzle-orm";
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
}

export function listVessels(): VesselRow[] {
  return getDb()
    .select({
      id: vessels.id,
      name: vessels.name,
      type: vessels.type,
      model: vessels.model,
      ownershipType: vessels.ownershipType,
    })
    .from(vessels)
    .where(isNull(vessels.deletedAt))
    .orderBy(desc(vessels.updatedAt))
    .all()
    .map((v) => ({
      ...v,
      type: v.type as BoatType,
      ownershipType: v.ownershipType as OwnershipType,
    }));
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
  return { id, name: input.name.trim(), type: input.type, model: input.model ?? null, ownershipType };
}

export function getVesselById(id: string): VesselRow | null {
  return listVessels().find((v) => v.id === id) ?? null;
}
