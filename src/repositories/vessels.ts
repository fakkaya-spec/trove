import { desc, isNull } from "drizzle-orm";
import { getDb, newId, stamps } from "../db/client";
import { vessels } from "../db/schema";
import type { BoatType } from "../domain/types";
import { enqueueSync } from "./sync";

export interface VesselRow {
  id: string;
  name: string;
  type: BoatType;
  model: string | null;
}

export function listVessels(): VesselRow[] {
  return getDb()
    .select({ id: vessels.id, name: vessels.name, type: vessels.type, model: vessels.model })
    .from(vessels)
    .where(isNull(vessels.deletedAt))
    .orderBy(desc(vessels.updatedAt))
    .all()
    .map((v) => ({ ...v, type: v.type as BoatType }));
}

export function createVessel(input: { name: string; type: BoatType; model?: string }): VesselRow {
  const id = newId();
  getDb()
    .insert(vessels)
    .values({ id, name: input.name.trim(), type: input.type, model: input.model ?? null, ...stamps() })
    .run();
  enqueueSync("vessels", id);
  return { id, name: input.name.trim(), type: input.type, model: input.model ?? null };
}
