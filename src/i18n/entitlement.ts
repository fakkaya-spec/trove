// Paywall + entitlement arayüz metinleri. Kilitli fayda metni:
// docs/MONETIZATION.md kural 2. Eksik diller İngilizce'ye düşer.
import type { Locale } from "./strings";
import type { PaywallContext } from "../entitlement/policy";

export interface EntitlementStrings {
  paywallTitle: string;
  /** Kilitli fayda cümlesi (kural 2) */
  paywallBenefit: string;
  /** Bağlam başına "neden buradayım" satırı */
  ctx_inspection_photo: string;
  ctx_log_photo: string;
  ctx_handover_pair: string;
  ctx_gallery_import: string;
  ctx_report_photo: string;
  featTimestamped: string;
  featComparePairs: string;
  featVisualRecord: string;
  featEvidenceKept: string;
  monthly: string;
  yearly: string;
  restore: string;
  /** Kural 1: metin kaydı asla engellenmez — kapı bunu açıkça söyler */
  continueTextOnly: string;
  storeUnavailable: string;
  restoreDone: string;
  restoreNone: string;
}

const en: EntitlementStrings = {
  paywallTitle: "Photo evidence is a Premium feature",
  paywallBenefit:
    "Add timestamped photo evidence, compare check-in and check-out, and keep a visual record of your boat.",
  ctx_inspection_photo: "You tapped the camera on an inspection item.",
  ctx_log_photo: "You tapped the camera on a log entry.",
  ctx_handover_pair: "Guided photo pairs document handover condition.",
  ctx_gallery_import: "You tried to import a photo from the gallery.",
  ctx_report_photo: "You tried to add photo evidence to a report.",
  featTimestamped: "Timestamped photo evidence on inspections and issues",
  featComparePairs: "Guided check-in / check-out photo pairs",
  featVisualRecord: "A visual condition record of your boat over time",
  featEvidenceKept: "Your existing photos always stay readable — even if Premium ends",
  monthly: "Monthly",
  yearly: "Yearly",
  restore: "Restore purchases",
  continueTextOnly: "Continue without photos — text records are always free",
  storeUnavailable: "The store is not available in this build. Text records keep working.",
  restoreDone: "Premium restored.",
  restoreNone: "No previous purchase found.",
};

const tr: EntitlementStrings = {
  paywallTitle: "Foto kanıtı bir Premium özelliğidir",
  paywallBenefit:
    "Zaman damgalı foto kanıtı ekle, check-in ile check-out'u karşılaştır ve teknenin görsel kaydını tut.",
  ctx_inspection_photo: "Bir denetim maddesinde kameraya dokundun.",
  ctx_log_photo: "Bir jurnal kaydında kameraya dokundun.",
  ctx_handover_pair: "Rehberli foto çiftleri teslim durumunu belgeler.",
  ctx_gallery_import: "Galeriden fotoğraf içe aktarmayı denedin.",
  ctx_report_photo: "Rapora foto kanıtı eklemeyi denedin.",
  featTimestamped: "Denetim ve sorunlarda zaman damgalı foto kanıtı",
  featComparePairs: "Rehberli check-in / check-out foto çiftleri",
  featVisualRecord: "Teknenin zaman içindeki görsel durum kaydı",
  featEvidenceKept: "Mevcut fotoğrafların daima okunur kalır — Premium bitse bile",
  monthly: "Aylık",
  yearly: "Yıllık",
  restore: "Satın alımları geri yükle",
  continueTextOnly: "Fotoğrafsız devam et — metin kayıtları her zaman ücretsiz",
  storeUnavailable: "Bu derlemede mağaza yok. Metin kayıtları çalışmaya devam eder.",
  restoreDone: "Premium geri yüklendi.",
  restoreNone: "Önceki satın alım bulunamadı.",
};

const de: EntitlementStrings = { ...en };
const ru: EntitlementStrings = { ...en };
const es: EntitlementStrings = { ...en };
const hr: EntitlementStrings = { ...en };
const it: EntitlementStrings = { ...en };
const el: EntitlementStrings = { ...en };
const fr: EntitlementStrings = { ...en };

export const ENTITLEMENT_STRINGS: Record<Locale, EntitlementStrings> = {
  en, tr, de, ru, es, hr, it, el, fr,
};

export function contextLine(s: EntitlementStrings, context: PaywallContext): string {
  return s[`ctx_${context}` as keyof EntitlementStrings];
}
