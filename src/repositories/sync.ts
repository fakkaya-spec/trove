import { getDb, newId, nowIso, stamps } from "../db/client";
import { syncQueue } from "../db/schema";

// Faz 0: yalnızca kuyruk iskeleti. Bulut senkronu Faz 2'de bu kuyruğu tüketir.
// Her yerel mutasyon buraya bir kayıt düşürür; idempotent upsert varsayımı.
export function enqueueSync(entity: string, entityId: string, op: "upsert" | "delete" = "upsert"): void {
  try {
    getDb()
      .insert(syncQueue)
      .values({ id: newId(), entity, entityId, op, queuedAt: nowIso(), ...stamps() })
      .run();
  } catch {
    // Kuyruk hatası kullanıcı akışını asla durdurmaz.
  }
}
