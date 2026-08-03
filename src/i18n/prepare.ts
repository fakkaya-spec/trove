// Faz 4 — Trip Prepare ekran metinleri (trip_plan, trip_crew, trip_provisions,
// trip_shopping, trip_predep, trip_checkin). Eksik diller İngilizce'ye düşer;
// mevcut TRIP_STRINGS anahtarları (provisioning, days, people, meals, addItem,
// shareList, kategori adları) yeniden kullanılır, burada YİNELENMEZ.
import type { Locale } from "./strings";

export interface PrepareStrings {
  // trip_plan hub
  readyToDepart: string;
  /** Sayı kompozisyonu: "8 of 14" / "8 / 14" */
  ofWord: string;
  itemsWord: string;
  crewGuests: string;
  shoppingList: string;
  predepChecklist: string;
  checkinInspection: string;
  notStarted: string;
  notCalculated: string;
  /** "{days} days calculated" son eki */
  calculatedSuffix: string;
  remainingWord: string;
  doneWord: string;
  allSetBegin: string;
  completeToDepart: string;
  beganTitle: string;
  beganBody: string;
  // trip_crew
  crewSection: string;
  guestsSection: string;
  skipperRole: string;
  crewRole: string;
  addCrewName: string;
  crewNamePlaceholder: string;
  skipperPlaceholder: string;
  crewProvisionNote: string;
  removeCrewConfirm: string;
  // trip_provisions
  shoppingListCta: string;
  generateShoppingCta: string;
  // trip_predep / trip_checkin
  sectionWord: string;
  completeChecklistCta: string;
  /** Bölümdeki işaretsiz maddeleri topluca tamam yapar (cihaz testi F5) */
  markRemaining: string;
  /** Bayrak/kamera ikonlarının tek satırlık açıklaması (cihaz testi F7) */
  checklistIconsHint: string;
  /** Takvimden tarih temizleme (cihaz testi F2) */
  clearDate: string;
  continueCheckinCta: string;
  completeCheckinCta: string;
  completedPill: string;
  blockedCriticalTitle: string;
  blockedCriticalBody: string;
  uncheckedWarnTitle: string;
  uncheckedWarnBody: string;
  completeAnyway: string;
  noBoatForChecklist: string;
}

const en: PrepareStrings = {
  readyToDepart: "Ready to depart",
  ofWord: "of",
  itemsWord: "items",
  crewGuests: "Crew & guests",
  shoppingList: "Shopping list",
  predepChecklist: "Pre-departure checklist",
  checkinInspection: "Check-in inspection",
  notStarted: "Not started",
  notCalculated: "Not calculated yet",
  calculatedSuffix: "days calculated",
  remainingWord: "remaining",
  doneWord: "done",
  allSetBegin: "All set — Begin trip →",
  completeToDepart: "Complete setup to depart",
  beganTitle: "Trip started",
  beganBody: "Fair winds! The underway companion arrives in the next phase.",
  crewSection: "Crew",
  guestsSection: "Guests",
  skipperRole: "Skipper",
  crewRole: "Crew",
  addCrewName: "+ Add crew",
  crewNamePlaceholder: "Name",
  skipperPlaceholder: "Skipper name",
  crewProvisionNote:
    "Everyone aboard is counted in provisioning calculations. Adjust adults and children in the trip settings.",
  removeCrewConfirm: "Remove this crew member?",
  shoppingListCta: "Shopping list →",
  generateShoppingCta: "Generate shopping list →",
  sectionWord: "Section",
  completeChecklistCta: "Complete checklist",
  markRemaining: "Mark rest OK",
  checklistIconsHint: "Flag = needs attention · Camera = photo evidence",
  clearDate: "Clear",
  continueCheckinCta: "Continue to check-in inspection →",
  completeCheckinCta: "Complete check-in →",
  completedPill: "Completed",
  blockedCriticalTitle: "Critical items unchecked",
  blockedCriticalBody:
    "Critical items must be confirmed one by one before this checklist can be completed.",
  uncheckedWarnTitle: "Unchecked items remain",
  uncheckedWarnBody: "Some non-critical items are still unchecked. Complete anyway?",
  completeAnyway: "Complete anyway",
  noBoatForChecklist: "Select a boat for this trip first.",
};

const tr: PrepareStrings = {
  readyToDepart: "Yola çıkışa hazırlık",
  ofWord: "/",
  itemsWord: "madde",
  crewGuests: "Mürettebat & misafirler",
  shoppingList: "Alışveriş listesi",
  predepChecklist: "Yola çıkış kontrol listesi",
  checkinInspection: "Check-in denetimi",
  notStarted: "Başlanmadı",
  notCalculated: "Henüz hesaplanmadı",
  calculatedSuffix: "gün hesaplandı",
  remainingWord: "kaldı",
  doneWord: "tamam",
  allSetBegin: "Her şey hazır — Seferi başlat →",
  completeToDepart: "Yola çıkmak için hazırlığı tamamla",
  beganTitle: "Sefer başladı",
  beganBody: "İyi seyirler! Seyir ekranı bir sonraki fazda geliyor.",
  crewSection: "Mürettebat",
  guestsSection: "Misafirler",
  skipperRole: "Kaptan",
  crewRole: "Mürettebat",
  addCrewName: "+ Kişi ekle",
  crewNamePlaceholder: "İsim",
  skipperPlaceholder: "Kaptan adı",
  crewProvisionNote:
    "Teknedeki herkes ikmal hesabına katılır. Yetişkin ve çocuk sayısını sefer ayarlarından değiştir.",
  removeCrewConfirm: "Bu kişi listeden çıkarılsın mı?",
  shoppingListCta: "Alışveriş listesi →",
  generateShoppingCta: "Alışveriş listesini oluştur →",
  sectionWord: "Bölüm",
  completeChecklistCta: "Kontrol listesini tamamla",
  markRemaining: "Kalanı tamam işaretle",
  checklistIconsHint: "Bayrak = dikkat gerektirir · Kamera = foto kanıtı",
  clearDate: "Temizle",
  continueCheckinCta: "Check-in denetimine geç →",
  completeCheckinCta: "Check-in'i tamamla →",
  completedPill: "Tamamlandı",
  blockedCriticalTitle: "Kritik maddeler işaretsiz",
  blockedCriticalBody:
    "Kritik maddeler tek tek onaylanmadan bu kontrol listesi tamamlanamaz.",
  uncheckedWarnTitle: "İşaretsiz maddeler var",
  uncheckedWarnBody: "Kritik olmayan bazı maddeler hâlâ işaretsiz. Yine de tamamlansın mı?",
  completeAnyway: "Yine de tamamla",
  noBoatForChecklist: "Önce bu sefer için tekne seç.",
};

const de: PrepareStrings = { ...en };
const ru: PrepareStrings = { ...en };
const es: PrepareStrings = { ...en };
const hr: PrepareStrings = { ...en };
const it: PrepareStrings = { ...en };
const el: PrepareStrings = { ...en };
const fr: PrepareStrings = { ...en };

export const PREPARE_STRINGS: Record<Locale, PrepareStrings> = {
  en, tr, de, ru, es, hr, it, el, fr,
};
