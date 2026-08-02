// Kurucu kilometre taşı MOTORU — SAF, yeniden kullanılabilir; tek seferlik
// "100 kullanıcı" kontrolü DEĞİL. Hiçbir kilometre taşı ürün davranışını
// OTOMATİK DEĞİŞTİRMEZ (Premium açılmaz, limit konmaz) — sistem yalnız
// kurucuya "karar verecek kadar gerçek veri birikti" hatırlatması yapar.
// Normal kullanıcı bu sistemi ASLA görmez (yalnız Founder Mode).

export const MILESTONE_THRESHOLDS = [10, 25, 50, 100, 250, 500, 1000] as const;

export const METRIC_KEYS = [
  "activated_users",
  "real_trips",
  "completed_trips",
  "provisioning_plans",
  "inspections",
  "check_ins",
  "check_outs",
  "reports",
  "log_entries",
  "photo_evidence",
  "returning_days",
] as const;

export type MetricKey = (typeof METRIC_KEYS)[number];

export type FounderMetrics = Record<MetricKey, number>;

export interface Milestone {
  /** Kararlı kimlik — kapatma (dismiss) kaydı buna bağlanır. */
  id: string;
  metric: MetricKey;
  threshold: number;
  /** Para kazanma incelemesi gerektiren eşik (yalnız hatırlatma; otomasyon YOK). */
  monetizationReview: boolean;
}

/** Eşik listesi metrik başına genişletilebilir; v1'de kullanıcı eşikleri izlenir. */
export const TRACKED_MILESTONES: readonly Milestone[] = MILESTONE_THRESHOLDS.map(
  (threshold) => ({
    id: `activated_users_${threshold}`,
    metric: "activated_users" as MetricKey,
    threshold,
    monetizationReview: threshold >= 100,
  })
);

/** Değeri eşiği geçmiş tüm kilometre taşları (deterministik, saf). */
export function reachedMilestones(
  metrics: Partial<FounderMetrics>,
  tracked: readonly Milestone[] = TRACKED_MILESTONES
): Milestone[] {
  return tracked.filter((m) => (metrics[m.metric] ?? 0) >= m.threshold);
}

/**
 * Kapatılana dek görünür kalacak uyarılar: ulaşılmış − kapatılmış.
 * Kapatma kalıcıdır (kimlikle saklanır); yeni eşik aşımı yeni uyarı üretir.
 */
export function pendingAlerts(
  metrics: Partial<FounderMetrics>,
  dismissedIds: readonly string[],
  tracked: readonly Milestone[] = TRACKED_MILESTONES
): Milestone[] {
  const dismissed = new Set(dismissedIds);
  return reachedMilestones(metrics, tracked).filter((m) => !dismissed.has(m.id));
}
