// Feature flag'ler. Derleme zamanı sabitleri; ileride uzaktan konfigürasyona
// taşınabilir. Kural: YENİ inspection akışı reklam ve IAP kodu import ETMEZ.
export const features = {
  /**
   * Eski checklist tarama modu (reklamlı + premium). Kaldırılması ayrı bir
   * ürün kararıdır: önce kullanım/gelir verisi incelenecek (bkz. docs/PHASE0.md).
   *
   * BETA KARARI (docs/store/BETA-READINESS.md): TestFlight betasında KAPALI —
   * beta reklamsız/IAP'siz çıkar, "veri toplanmıyor" beyanı temiz kalır.
   * NOT: AdMob/IAP SDK'ları binary'de durur; mağaza gizlilik formunu buna göre
   * doldur VEYA üretim öncesi paketleri kaldır (adımlar BETA-READINESS'ta).
   */
  legacyChecklists: false,

  /** Reklamlar yalnızca legacy modda yaşar. Yeni akışta asla. */
  adsInLegacyOnly: true,

  /**
   * Bulut senkron tüketicisi (Faz 11). false iken UI DÜRÜSTTÜR: yalnız
   * "bu cihazda kayıtlı" gösterilir; sync_queue yazımları içeride sürer.
   * true yapılınca domain/log.logSyncState bekliyor/senkronlandı ayrımını açar.
   */
  syncWorker: false,
} as const;
