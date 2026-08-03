import { and, desc, eq, isNull } from "drizzle-orm";
import { getDb, newId, stamps } from "../db/client";
import { vessels } from "../db/schema";
import type { BoatType } from "../domain/types";
import { enqueueSync } from "./sync";
import { SampleReadOnlyError } from "./log";

export type OwnershipType = "owned" | "chartered" | "managed" | "temporary";

export interface VesselRow {
  id: string;
  name: string;
  type: BoatType;
  model: string | null;
  ownershipType: OwnershipType;
  isSample: boolean;
  /** Göreli medya anahtarı (media/<id>.jpg) — gösterimde resolveMediaUri. */
  photoUri: string | null;
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
      photoUri: vessels.photoUri,
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

export interface VesselDetailsInput {
  manufacturer?: string;
  modelYear?: number;
  lengthM?: number;
  engineType?: string;
  registrationNumber?: string;
  hullIdentificationNumber?: string;
}

export function createVessel(
  input: {
    name: string;
    type: BoatType;
    model?: string;
    ownershipType?: OwnershipType;
    /** Göreli medya anahtarı (canlılık turu — tekne kimlik fotoğrafı). */
    photoUri?: string;
  } & VesselDetailsInput
): VesselRow {
  const id = newId();
  const ownershipType = input.ownershipType ?? "owned";
  getDb()
    .insert(vessels)
    .values({
      id,
      name: input.name.trim(),
      type: input.type,
      model: input.model?.trim() || null,
      ownershipType,
      photoUri: input.photoUri ?? null,
      // İsteğe bağlı kimlik alanları (AddVessel aşamalı formu) — şema v1'den
      // beri var; boş bırakılabilir, hiçbir akış zorunlu kılmaz.
      manufacturer: input.manufacturer?.trim() || null,
      modelYear: input.modelYear ?? null,
      lengthM: input.lengthM ?? null,
      engineType: input.engineType?.trim() || null,
      registrationNumber: input.registrationNumber?.trim() || null,
      hullIdentificationNumber: input.hullIdentificationNumber?.trim() || null,
      ...stamps(),
    })
    .run();
  enqueueSync("vessels", id);
  return {
    id,
    name: input.name.trim(),
    type: input.type,
    model: input.model?.trim() || null,
    ownershipType,
    isSample: false,
    photoUri: input.photoUri ?? null,
  };
}

/** Tekne kimlik fotoğrafını ayarlar/değiştirir (örnekler salt okunur). */
export function setVesselPhoto(id: string, photoKey: string): void {
  const [row] = getDb()
    .select({ isSample: vessels.isSample })
    .from(vessels)
    .where(eq(vessels.id, id))
    .limit(1)
    .all();
  if (!row) return;
  if (row.isSample === 1) throw new SampleReadOnlyError(`vessel ${id}`);
  getDb()
    .update(vessels)
    .set({ photoUri: photoKey, updatedAt: new Date().toISOString() })
    .where(eq(vessels.id, id))
    .run();
  enqueueSync("vessels", id);
}

/**
 * Tekneyi yumuşak siler (deletedAt) — cihaz testi bulgusu F3. Satırlar ve
 * tekneye bağlı sefer/denetim geçmişi DB'de kalır; yalnız listelerden ve
 * getVesselById'den düşer (sefer detayı "tekne eksik" gösterir, veri
 * kaybolmaz). Örnek tekneler silinemez (izolasyon kuralı).
 */
export function deleteVessel(id: string): void {
  const [row] = getDb()
    .select({ isSample: vessels.isSample })
    .from(vessels)
    .where(eq(vessels.id, id))
    .limit(1)
    .all();
  if (!row) return;
  if (row.isSample === 1) throw new SampleReadOnlyError(`vessel ${id}`);
  getDb()
    .update(vessels)
    .set({ deletedAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
    .where(eq(vessels.id, id))
    .run();
  enqueueSync("vessels", id);
}

/** Kimlikle erişim her iki kümeye de çalışır (örnek detayına girilebilir). */
export function getVesselById(id: string): VesselRow | null {
  return (
    selectVessels(false).find((v) => v.id === id) ??
    selectVessels(true).find((v) => v.id === id) ??
    null
  );
}
