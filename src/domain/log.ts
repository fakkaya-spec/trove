// Seyir defteri (log) saf iş kuralları — React'siz, DB'siz, test edilebilir.
// Ürün kuralı (KİLİTLİ): metin kaydı HERKESE açıktır; yalnız foto kanıtı
// Premium'dur (docs/MONETIZATION.md — bağlam: log_photo).

export const LOG_ENTRY_TYPES = [
  "observation",
  "note",
  "photo",
  "anchorage",
  "incident",
  "defect",
  "general",
] as const;

export type LogEntryType = (typeof LOG_ENTRY_TYPES)[number];

export const LOG_SEVERITIES = ["minor", "moderate", "serious"] as const;

export type LogSeverity = (typeof LOG_SEVERITIES)[number];

/**
 * Başlık türetme: kullanıcı ayrı başlık yazmaz (hareketli teknede minimum
 * yazı); açıklamanın ilk satırından kırpılır.
 */
export function deriveTitle(description: string, maxLen = 80): string {
  const firstLine = description.trim().split(/\r?\n/, 1)[0]?.trim() ?? "";
  if (firstLine.length <= maxLen) return firstLine;
  return `${firstLine.slice(0, maxLen - 1).trimEnd()}…`;
}

/** Kronolojik sıralama: en yeni üstte (occurredAt ISO karşılaştırması). */
export function compareLogEntriesDesc(
  a: { occurredAt: string },
  b: { occurredAt: string }
): number {
  return b.occurredAt.localeCompare(a.occurredAt);
}

/**
 * Senkron durum dili (KİLİTLİ çevrimdışı kuralları): kuyruktaki iş asla
 * "başarısız" DEĞİLDİR. synced_at yoksa "senkron bekliyor"; kuyrukta hiç
 * kaydı kalmamışsa "senkronlandı"; kuyruk özelliği yoksa "bu cihazda kayıtlı".
 */
export type LogSyncState = "saved_device" | "waiting_sync" | "synced";
