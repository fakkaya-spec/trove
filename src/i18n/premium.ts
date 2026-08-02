// Premium onaylı metin kütüphanesi — design-reference/premium-design-system.md §6.
// EN metinleri donmuş spesifikasyondan BİREBİR; TR çevirisi bu depoda yazıldı
// (spec zayıflığı: "copy library is English only"). Diğer 7 dil İngilizce'ye
// düşer (mevcut çeviri borcu deseni). Metin değişikliği = spec değişikliği;
// beta geri bildirimi olmadan yapılmaz.
import type { Locale } from "./strings";

export type UpgradeModule = "provisions" | "inspection" | "log" | "crew" | "report";

export interface PremiumModuleCopy {
  headline: string;
  explanation: string;
  benefits: string[];
  preservationNote?: string;
  comingLater?: string[];
}

export interface PremiumStrings {
  // CTA'lar (§6)
  ctaUpgrade: string;
  ctaContinueFree: string;
  ctaNotNow: string;
  ctaRestore: string;
  ctaSeeWhat: string;
  // Tam ekran paywall (§5)
  paywallHeadline: string;
  paywallSubline: string;
  whatImprovesPremium: string;
  whatImproves: string;
  freeVsPremium: string;
  colFree: string;
  colPremium: string;
  comingLater: string;
  // Karşılaştırma tablosu (§5 — yalnız düzyazı, işaret yok)
  cmpProvisioning: string;
  cmpProvisioningFree: string;
  cmpProvisioningPremium: string;
  cmpInspection: string;
  cmpInspectionFree: string;
  cmpInspectionPremium: string;
  cmpLogbook: string;
  cmpLogbookFree: string;
  cmpLogbookPremium: string;
  cmpCrew: string;
  cmpCrewFree: string;
  cmpCrewPremium: string;
  cmpReports: string;
  cmpReportsFree: string;
  cmpReportsPremium: string;
  // Modül yükseltme sayfaları (§6 + UPGRADE_CFG)
  modules: Record<UpgradeModule, PremiumModuleCopy>;
  // Giriş noktası etiketleri (§6)
  entryProvisionsTitle: string;
  entryCrewTitle: string;
  entryInspectionTitle: string;
  entryLogTitle: string;
  entryReportCta: string;
  pillPersonalize: string;
  pillAddEvidence: string;
  pillPremium: string;
  // Yasal / mağaza (§6)
  legalAutoRenew: string;
  storeUnavailable: string;
  restoreError: string;
  // Entitlement durum metinleri (§5 — Faz 3'te bağlanır)
  stateFree: string;
  statePremium: string;
  stateCached: string;
  statePurchasing: string;
  stateCancelled: string;
  stateError: string;
  stateRestored: string;
  stateExpiredContent: string;
  stateExpiredAction: string;
  badgePremium: string;
  badgeCached: string;
  badgeRestored: string;
  badgeExpiredContent: string;
  successActivated: string;
  successRestored: string;
  lastVerified: string;
}

const en: PremiumStrings = {
  ctaUpgrade: "Upgrade to Premium",
  ctaContinueFree: "Continue with free",
  ctaNotNow: "Not now",
  ctaRestore: "Restore Premium",
  ctaSeeWhat: "See what improves",

  paywallHeadline: "More capable. More professional.",
  paywallSubline: "A smarter version of the same TROVE.",
  whatImprovesPremium: "WHAT IMPROVES WITH PREMIUM",
  whatImproves: "WHAT IMPROVES",
  freeVsPremium: "FREE VS PREMIUM",
  colFree: "Free",
  colPremium: "Premium",
  comingLater: "COMING LATER",

  cmpProvisioning: "Provisioning",
  cmpProvisioningFree: "Quantities per group",
  cmpProvisioningPremium: "Personalized per person",
  cmpInspection: "Inspection",
  cmpInspectionFree: "Core check items",
  cmpInspectionPremium: "Evidence and comparison",
  cmpLogbook: "Logbook",
  cmpLogbookFree: "Text observations",
  cmpLogbookPremium: "Text and photo evidence",
  cmpCrew: "Crew",
  cmpCrewFree: "Names and roles",
  cmpCrewPremium: "Profiles and preferences",
  cmpReports: "Reports",
  cmpReportsFree: "Trip summary",
  cmpReportsPremium: "Report with photo evidence",

  modules: {
    provisions: {
      headline: "Build a plan for the people onboard",
      explanation:
        "Free provisioning calculates quantities for your group. Premium personalizes for the people and the way you actually travel.",
      benefits: [
        "Per-person dietary needs and allergies",
        "Adult and child portion sizing",
        "Meal-by-meal planning",
        "Anchorage and marina assumptions",
      ],
      preservationNote: "Your current provisioning list will remain here.",
    },
    // Dürüstlük kuralı (sprint D1-D5): benefits YALNIZ bugün gerçekten var
    // olan Premium davranışı anlatır; henüz kodlanmamış derinlik
    // comingLater'a iner. Metin değişikliği spec §6 kütüphanesinden türetildi.
    inspection: {
      headline: "Create a richer condition record",
      explanation:
        "Basic inspection covers what matters. Premium helps you build a complete evidence record with professional comparison.",
      benefits: [
        "Photo evidence linked to each check item",
        "Check-in vs check-out condition comparison",
        "Photo evidence included in the trip report",
      ],
      comingLater: ["Missing evidence guidance"],
    },
    log: {
      headline: "Capture more context",
      explanation:
        "Your entry will be saved. Premium adds richer tools to build a more complete trip record.",
      benefits: [
        "Photo evidence per log entry",
        "Your photos stay readable even if Premium ends",
      ],
      comingLater: ["Intelligent entry categorization", "Trip history and full-text search"],
      preservationNote: "This entry will be saved with the free version.",
    },
    crew: {
      headline: "Prepare for the people onboard",
      explanation:
        "Free records names and roles. Premium stores what actually matters for everyone's experience.",
      benefits: [
        "Dietary preferences and allergy information",
        "Emergency contact details",
        "Personal notes and preferences",
        "Richer individual profiles",
      ],
      preservationNote: "Current crew information will remain.",
    },
    report: {
      headline: "Turn your trip record into a professional document",
      explanation:
        "Free generates a useful trip summary. Premium creates a shareable, professional-quality record.",
      benefits: [
        "Photo evidence included in the report",
        "Guided check-in / check-out photo pairs",
      ],
      comingLater: ["Digital signatures", "Multilingual output", "Shareable web package"],
    },
  },

  entryProvisionsTitle: "Personalize for your crew",
  entryCrewTitle: "Add crew preferences",
  entryInspectionTitle: "Add photo evidence and condition comparison",
  entryLogTitle: "Add photo evidence and richer context",
  entryReportCta: "Create professional report",
  pillPersonalize: "Personalize",
  pillAddEvidence: "Add evidence",
  pillPremium: "Premium",

  legalAutoRenew: "Subscriptions renew automatically until cancelled.",
  storeUnavailable: "Store unavailable. You can upgrade when you're back online.",
  restoreError: "Could not restore. Check your Apple ID and try again.",

  stateFree: "All core features available.",
  statePremium: "All features available. Thank you.",
  stateCached: "Working offline. Premium features available from last sync.",
  statePurchasing: "Completing purchase…",
  stateCancelled: "No changes made.",
  stateError: "Something went wrong. Please try again.",
  stateRestored: "Premium restored. Welcome back.",
  stateExpiredContent:
    "You can read this record. New Premium actions require an active subscription.",
  stateExpiredAction: "This feature requires an active Premium subscription.",
  badgePremium: "✦ Premium",
  badgeCached: "✦ Cached",
  badgeRestored: "✦ Restored",
  badgeExpiredContent: "Recorded previously",
  successActivated: "✦ Premium activated",
  successRestored: "✦ Premium restored.",
  lastVerified: "Last verified",
};

const tr: PremiumStrings = {
  ctaUpgrade: "Premium'a yükselt",
  ctaContinueFree: "Ücretsizle devam et",
  ctaNotNow: "Şimdi değil",
  ctaRestore: "Premium'u geri yükle",
  ctaSeeWhat: "Nelerin geliştiğini gör",

  paywallHeadline: "Daha yetenekli. Daha profesyonel.",
  paywallSubline: "Aynı TROVE'un daha akıllı hâli.",
  whatImprovesPremium: "PREMIUM İLE NELER GELİŞİR",
  whatImproves: "NELER GELİŞİR",
  freeVsPremium: "ÜCRETSİZ VE PREMIUM",
  colFree: "Ücretsiz",
  colPremium: "Premium",
  comingLater: "DAHA SONRA GELECEK",

  cmpProvisioning: "İkmal",
  cmpProvisioningFree: "Grup başına miktarlar",
  cmpProvisioningPremium: "Kişi başına kişiselleştirilmiş",
  cmpInspection: "Denetim",
  cmpInspectionFree: "Temel kontrol maddeleri",
  cmpInspectionPremium: "Kanıt ve karşılaştırma",
  cmpLogbook: "Jurnal",
  cmpLogbookFree: "Metin gözlemleri",
  cmpLogbookPremium: "Metin ve foto kanıtı",
  cmpCrew: "Mürettebat",
  cmpCrewFree: "İsimler ve roller",
  cmpCrewPremium: "Profiller ve tercihler",
  cmpReports: "Raporlar",
  cmpReportsFree: "Sefer özeti",
  cmpReportsPremium: "Foto kanıtlı rapor",

  modules: {
    provisions: {
      headline: "Gemidekilere göre bir plan kur",
      explanation:
        "Ücretsiz ikmal, grubun için miktarları hesaplar. Premium, gemideki insanlara ve gerçek seyahat tarzına göre kişiselleştirir.",
      benefits: [
        "Kişi başına beslenme ihtiyaçları ve alerjiler",
        "Yetişkin ve çocuk porsiyonlama",
        "Öğün öğün yemek planı",
        "Demirleme ve marina varsayımları",
      ],
      preservationNote: "Mevcut ikmal listen burada kalacak.",
    },
    inspection: {
      headline: "Daha zengin bir durum kaydı oluştur",
      explanation:
        "Temel denetim önemli olanı kapsar. Premium, profesyonel karşılaştırmayla eksiksiz bir kanıt kaydı kurmana yardım eder.",
      benefits: [
        "Her kontrol maddesine bağlı foto kanıtı",
        "Check-in ile check-out durum karşılaştırması",
        "Sefer raporuna gömülü foto kanıtı",
      ],
      comingLater: ["Eksik kanıt yönlendirmesi"],
    },
    log: {
      headline: "Daha fazla bağlam yakala",
      explanation:
        "Kaydın kaydedilecek. Premium, daha eksiksiz bir sefer kaydı için daha zengin araçlar ekler.",
      benefits: [
        "Kayıt başına foto kanıtı",
        "Fotoğrafların Premium bitse bile okunur kalır",
      ],
      comingLater: ["Akıllı kayıt sınıflandırması", "Sefer geçmişi ve tam metin arama"],
      preservationNote: "Bu kayıt ücretsiz sürümle kaydedilecek.",
    },
    crew: {
      headline: "Gemidekiler için hazırlan",
      explanation:
        "Ücretsiz sürüm isim ve rolleri tutar. Premium, herkesin deneyimi için gerçekten önemli olanı saklar.",
      benefits: [
        "Beslenme tercihleri ve alerji bilgisi",
        "Acil durum iletişim bilgileri",
        "Kişisel notlar ve tercihler",
        "Daha zengin bireysel profiller",
      ],
      preservationNote: "Mevcut mürettebat bilgileri kalacak.",
    },
    report: {
      headline: "Sefer kaydını profesyonel bir belgeye dönüştür",
      explanation:
        "Ücretsiz sürüm kullanışlı bir sefer özeti üretir. Premium, paylaşılabilir, profesyonel kalitede bir kayıt oluşturur.",
      benefits: [
        "Rapora gömülü foto kanıtı",
        "Rehberli check-in / check-out foto çiftleri",
      ],
      comingLater: ["Dijital imzalar", "Çok dilli çıktı", "Paylaşılabilir web paketi"],
    },
  },

  entryProvisionsTitle: "Mürettebatına göre kişiselleştir",
  entryCrewTitle: "Mürettebat tercihleri ekle",
  entryInspectionTitle: "Foto kanıtı ve durum karşılaştırması ekle",
  entryLogTitle: "Foto kanıtı ve daha zengin bağlam ekle",
  entryReportCta: "Profesyonel rapor oluştur",
  pillPersonalize: "Kişiselleştir",
  pillAddEvidence: "Kanıt ekle",
  pillPremium: "Premium",

  legalAutoRenew: "Abonelikler iptal edilene dek otomatik yenilenir.",
  storeUnavailable: "Mağaza kullanılamıyor. Tekrar çevrimiçi olduğunda yükseltebilirsin.",
  restoreError: "Geri yüklenemedi. Apple kimliğini kontrol edip tekrar dene.",

  stateFree: "Tüm temel özellikler kullanılabilir.",
  statePremium: "Tüm özellikler kullanılabilir. Teşekkürler.",
  stateCached: "Çevrimdışı çalışıyor. Premium özellikler son eşitlemeden geçerli.",
  statePurchasing: "Satın alma tamamlanıyor…",
  stateCancelled: "Değişiklik yapılmadı.",
  stateError: "Bir şeyler ters gitti. Lütfen tekrar dene.",
  stateRestored: "Premium geri yüklendi. Tekrar hoş geldin.",
  stateExpiredContent:
    "Bu kaydı okuyabilirsin. Yeni Premium eylemler etkin abonelik gerektirir.",
  stateExpiredAction: "Bu özellik etkin bir Premium aboneliği gerektirir.",
  badgePremium: "✦ Premium",
  badgeCached: "✦ Önbellek",
  badgeRestored: "✦ Geri yüklendi",
  badgeExpiredContent: "Önceden kaydedildi",
  successActivated: "✦ Premium etkinleştirildi",
  successRestored: "✦ Premium geri yüklendi.",
  lastVerified: "Son doğrulama",
};

const de: PremiumStrings = { ...en };
const ru: PremiumStrings = { ...en };
const es: PremiumStrings = { ...en };
const hr: PremiumStrings = { ...en };
const it: PremiumStrings = { ...en };
const el: PremiumStrings = { ...en };
const fr: PremiumStrings = { ...en };

export const PREMIUM_STRINGS: Record<Locale, PremiumStrings> = {
  en, tr, de, ru, es, hr, it, el, fr,
};
