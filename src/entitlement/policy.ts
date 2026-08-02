// Entitlement politikası — SAF fonksiyonlar, React'siz, DB'siz, test edilebilir.
// Kaynak kurallar: docs/MONETIZATION.md (KİLİTLİ).
//  - Foto kanıtı Premium'dur; METİN KAYDI ASLA ENGELLENMEZ (kural 1).
//  - Mevcut fotoğraflar süre bitince de OKUNUR kalır (kural 4) — bu katman
//    yalnız YENİ çekim/içe aktarma/ekleme yetkilerini yönetir; okuma için
//    hiçbir ekran yetki sormaz.
//  - Çevrimdışı grace: Premium daha önce mağazadan doğrulandıysa çekim,
//    doğrulama zamanından itibaren grace penceresi boyunca çevrimdışı çalışır
//    (kural 6). Pencere dışına düşmek kanıtı silmez/gizlemez.

/** Paywall'a giriş bağlamları (kural 9) — yerel takip, ileride analitik.
 *  `settings`: kapı reddi değil, Ayarlar'daki gönüllü keşif girişi. */
export const PAYWALL_CONTEXTS = [
  "inspection_photo",
  "log_photo",
  "handover_pair",
  "gallery_import",
  "report_photo",
  "settings",
] as const;

export type PaywallContext = (typeof PAYWALL_CONTEXTS)[number];

export interface EntitlementState {
  /** Önbellekten veya mağazadan bilinen Premium durumu. */
  isPremium: boolean;
  /** Son BAŞARILI mağaza doğrulaması (ISO). null = hiç doğrulanmadı. */
  lastVerifiedAt: string | null;
}

/** Çevrimdışı entitlement grace penceresi (gün). */
export const OFFLINE_GRACE_DAYS = 14;

const DAY_MS = 24 * 60 * 60 * 1000;

export function withinGrace(lastVerifiedAt: string | null, nowMs: number): boolean {
  if (!lastVerifiedAt) return false;
  const verified = Date.parse(lastVerifiedAt);
  if (!Number.isFinite(verified)) return false;
  // Saat geriye alınmış olabilir; gelecekteki damga pencere içinde sayılır.
  return nowMs - verified <= OFFLINE_GRACE_DAYS * DAY_MS;
}

/**
 * Kapasite bayrakları (kural 7): ekranlar aboneliği DEĞİL bu bayrakları sorar.
 * Faz 4'te tüm foto kapasiteleri aynı koşula bağlıdır; ayrı bayraklar API
 * sözleşmesidir — ileride bağımsız ayarlanabilir (ör. plan limitleri).
 */
export interface Capabilities {
  canCapturePhoto: boolean;
  canImportPhoto: boolean;
  canAttachPhoto: boolean;
  canCreatePhotoPair: boolean;
  canSyncNewPhotos: boolean;
}

export function capabilitiesFor(state: EntitlementState, nowMs: number): Capabilities {
  const entitled = state.isPremium && withinGrace(state.lastVerifiedAt, nowMs);
  return {
    canCapturePhoto: entitled,
    canImportPhoto: entitled,
    canAttachPhoto: entitled,
    canCreatePhotoPair: entitled,
    canSyncNewPhotos: entitled,
  };
}

/** Bağlam → istenen kapasite eşlemesi (requestAccess bu kapasiteye bakar). */
export const CONTEXT_CAPABILITY: Record<PaywallContext, keyof Capabilities> = {
  inspection_photo: "canCapturePhoto",
  log_photo: "canCapturePhoto",
  handover_pair: "canCreatePhotoPair",
  gallery_import: "canImportPhoto",
  report_photo: "canAttachPhoto",
  settings: "canCapturePhoto",
};

/** Bağlam sayaçlarını artırır (saf: yeni nesne döner; saklama çağıranda). */
export function trackContext(
  counts: Partial<Record<PaywallContext, number>>,
  context: PaywallContext
): Record<PaywallContext, number> {
  const next = {} as Record<PaywallContext, number>;
  for (const key of PAYWALL_CONTEXTS) next[key] = counts[key] ?? 0;
  next[context] += 1;
  return next;
}
