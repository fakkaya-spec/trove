// Feature flag'ler. Derleme zamanı sabitleri; ileride uzaktan konfigürasyona
// taşınabilir. Kural: YENİ inspection akışı reklam ve IAP kodu import ETMEZ.
export const features = {
  /**
   * Eski checklist tarama modu (reklamlı + premium). Kaldırılması ayrı bir
   * ürün kararıdır: önce kullanım/gelir verisi incelenecek (bkz. docs/PHASE0.md).
   */
  legacyChecklists: true,

  /** Reklamlar yalnızca legacy modda yaşar. Yeni akışta asla. */
  adsInLegacyOnly: true,
} as const;
