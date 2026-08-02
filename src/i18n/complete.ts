// Faz 7 — Complete/rapor ekran metinleri. en+tr tam; kalan diller İngilizce'ye
// düşer (belgeli borç). Dil kuralı (KİLİTLİ): "Signed by / Recorded at" gibi
// dikkatli ifadeler; ASLA "legally certified / court-proof / insurer
// approved / tamper-proof" gibi desteklenmeyen iddialar YOK.
import type { Locale } from "./strings";
import type { ReviewCategory, SignoffRole } from "../domain/completion";

export interface CompleteStrings {
  completingPill: string;
  stepOpenItems: string;
  stepSignoff: string;
  stepReport: string;
  /** "{n}" yer tutuculu */
  showFullList: string;
  showEssentialList: string;
  essentialLabel: string;
  fullLabel: string;
  /** Rapor beyanı: "{done} / {total}" */
  itemsReviewed: string;
  openItemsNone: string;
  openItemsNote: string;
  cat_resolved_during_trip: string;
  cat_still_open: string;
  cat_new_at_checkout: string;
  cat_present_at_checkin: string;
  origin_check_in: string;
  origin_trip: string;
  origin_check_out: string;
  signedBy: string;
  recordedAt: string;
  addSignoff: string;
  signoffNamePlaceholder: string;
  role_skipper: string;
  role_charterer: string;
  role_base_rep: string;
  signoffOptionalNote: string;
  completeCta: string;
  completeBlockedNote: string;
  generateReport: string;
  regenerateReport: string;
  reportReady: string;
  shareReportCta: string;
  reportFailedTitle: string;
  reportFailedBody: string;
  retry: string;
  reportUnavailable: string;
  localOriginNote: string;
  reportIdLabel: string;
  generatedAtLabel: string;
  openItemsHeading: string;
  metersHeading: string;
  signoffsHeading: string;
  checkInHeading: string;
  checkOutHeading: string;
  crewHeading: string;
  photosHeading: string;
  returnedLabel: string;
  newIssuesLabel: string;
  noneWord: string;
  yesWord: string;
}

const en: CompleteStrings = {
  completingPill: "Completing",
  stepOpenItems: "Open items",
  stepSignoff: "Sign-off",
  stepReport: "Trip report",
  showFullList: "Show full checklist ({n})",
  showEssentialList: "Show essential only ({n})",
  essentialLabel: "Essential check",
  fullLabel: "Full check",
  itemsReviewed: "{done} of {total} items reviewed",
  openItemsNone: "No open items — all clear.",
  openItemsNote: "Open items are not lost — they appear clearly in the report.",
  cat_resolved_during_trip: "Resolved during trip",
  cat_still_open: "Still open",
  cat_new_at_checkout: "New at check-out",
  cat_present_at_checkin: "Already present at check-in",
  origin_check_in: "Check-in",
  origin_trip: "During trip",
  origin_check_out: "Check-out",
  signedBy: "Signed by",
  recordedAt: "Recorded at",
  addSignoff: "Add sign-off",
  signoffNamePlaceholder: "Name",
  role_skipper: "Skipper",
  role_charterer: "Charterer",
  role_base_rep: "Base representative",
  signoffOptionalNote:
    "Optional — your record is complete even if the other side does not sign.",
  completeCta: "Mark trip completed",
  completeBlockedNote: "Finish the checklist above first.",
  generateReport: "Generate trip report",
  regenerateReport: "Regenerate report",
  reportReady: "Report ready",
  shareReportCta: "Share report",
  reportFailedTitle: "Report could not be generated",
  reportFailedBody: "Nothing was lost — your trip record is intact. You can retry.",
  retry: "Retry",
  reportUnavailable: "Report generation is not available in this environment.",
  localOriginNote: "Generated on device from locally recorded trip data.",
  reportIdLabel: "Report",
  generatedAtLabel: "Generated",
  openItemsHeading: "Observations & issues",
  metersHeading: "Meters — check-in vs check-out",
  signoffsHeading: "Sign-off",
  checkInHeading: "Check-in",
  checkOutHeading: "Check-out / return",
  crewHeading: "Crew & guests",
  photosHeading: "Photo evidence",
  returnedLabel: "Boat returned",
  newIssuesLabel: "New issues at check-out",
  noneWord: "None",
  yesWord: "Yes",
};

const tr: CompleteStrings = {
  completingPill: "Tamamlanıyor",
  stepOpenItems: "Açık maddeler",
  stepSignoff: "Onay",
  stepReport: "Sefer raporu",
  showFullList: "Tam listeyi göster ({n})",
  showEssentialList: "Yalnız temel maddeler ({n})",
  essentialLabel: "Temel kontrol",
  fullLabel: "Tam kontrol",
  itemsReviewed: "{done} / {total} madde gözden geçirildi",
  openItemsNone: "Açık madde yok — her şey yolunda.",
  openItemsNote: "Açık maddeler kaybolmaz — raporda açıkça görünür.",
  cat_resolved_during_trip: "Sefer sırasında çözüldü",
  cat_still_open: "Hâlâ açık",
  cat_new_at_checkout: "Check-out'ta yeni",
  cat_present_at_checkin: "Check-in'de zaten mevcuttu",
  origin_check_in: "Check-in",
  origin_trip: "Sefer sırasında",
  origin_check_out: "Check-out",
  signedBy: "İmzalayan",
  recordedAt: "Kayıt zamanı",
  addSignoff: "Onay ekle",
  signoffNamePlaceholder: "İsim",
  role_skipper: "Kaptan",
  role_charterer: "Kiracı",
  role_base_rep: "Üs temsilcisi",
  signoffOptionalNote:
    "İsteğe bağlı — karşı taraf imzalamasa da kaydın eksiksizdir.",
  completeCta: "Seferi tamamlandı olarak işaretle",
  completeBlockedNote: "Önce yukarıdaki kontrol listesini tamamla.",
  generateReport: "Sefer raporunu oluştur",
  regenerateReport: "Raporu yeniden oluştur",
  reportReady: "Rapor hazır",
  shareReportCta: "Raporu paylaş",
  reportFailedTitle: "Rapor oluşturulamadı",
  reportFailedBody: "Hiçbir şey kaybolmadı — sefer kaydın olduğu gibi duruyor. Yeniden deneyebilirsin.",
  retry: "Yeniden dene",
  reportUnavailable: "Bu ortamda rapor üretimi kullanılamıyor.",
  localOriginNote: "Cihazda, yerel kayıtlı sefer verisinden üretildi.",
  reportIdLabel: "Rapor",
  generatedAtLabel: "Üretildi",
  openItemsHeading: "Gözlemler & sorunlar",
  metersHeading: "Sayaçlar — check-in / check-out",
  signoffsHeading: "Onay",
  checkInHeading: "Check-in",
  checkOutHeading: "Check-out / dönüş",
  crewHeading: "Mürettebat & misafirler",
  photosHeading: "Foto kanıtı",
  returnedLabel: "Tekne teslim edildi",
  newIssuesLabel: "Check-out'ta yeni sorun",
  noneWord: "Yok",
  yesWord: "Evet",
};

const de: CompleteStrings = { ...en };
const ru: CompleteStrings = { ...en };
const es: CompleteStrings = { ...en };
const hr: CompleteStrings = { ...en };
const it: CompleteStrings = { ...en };
const el: CompleteStrings = { ...en };
const fr: CompleteStrings = { ...en };

export const COMPLETE_STRINGS: Record<Locale, CompleteStrings> = {
  en, tr, de, ru, es, hr, it, el, fr,
};

export function categoryLabel(s: CompleteStrings, c: ReviewCategory): string {
  return s[`cat_${c}` as keyof CompleteStrings];
}

export function roleLabel(s: CompleteStrings, r: SignoffRole): string {
  return s[`role_${r}` as keyof CompleteStrings];
}

export function fmt(template: string, values: Record<string, string | number>): string {
  return Object.entries(values).reduce(
    (acc, [k, v]) => acc.replace(`{${k}}`, String(v)),
    template
  );
}
