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

/**
 * DÜRÜSTLÜK KURALI: gerçek bir senkron tüketicisi yokken "senkron bekliyor"
 * asla gösterilmez — olmayacak bir senkron vaat etmek yanıltıcıdır. Karar
 * TEK buradadır; satır başına elle kurulmaz. Kuyruk yazımları gelecekteki
 * tüketici için içeride sürer (features.syncWorker Faz 11'de açılır).
 */
export function logSyncState(
  hasPendingQueueRow: boolean,
  syncWorkerActive: boolean
): LogSyncState {
  if (!syncWorkerActive) return "saved_device";
  return hasPendingQueueRow ? "waiting_sync" : "synced";
}

/**
 * Görüntüleme zamanı: damga UTC ISO olarak SAKLANIR (sıralama bunun
 * üstünden); yalnız gösterim cihazın yerel saat dilimine ve diline çevrilir.
 * Bozuk damga ham döner — yanıltıcı bir dönüşüm uydurulmaz.
 * timeZone parametresi test içindir; cihazda verilmez (yerel dilim).
 */
export function formatOccurredAt(iso: string, locale: string, timeZone?: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  try {
    return d.toLocaleString(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone,
    });
  } catch {
    return iso;
  }
}
