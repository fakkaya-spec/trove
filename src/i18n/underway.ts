// Faz 6 — Underway ekran metinleri. en+tr tam; kalan diller İngilizce'ye
// düşer (çeviri borcu docs/HANDOFF.md'de). JSX'te sabit metin YOK.
import type { Locale } from "./strings";

export interface UnderwayStrings {
  /** "Day {d} of {t}" — fmtDayOf ile doldurulur */
  dayOf: string;
  returnOverdue: string;
  logSomething: string;
  logSomethingSub: string;
  openObservations: string;
  viewAll: string;
  noOpenItems: string;
  resolveA11y: string;
  shoppingHint: string;
  endTrip: string;
  endTripConfirmTitle: string;
  endTripBodyOwn: string;
  endTripBodyCharter: string;
  endTripGo: string;
  tripCompletedTitle: string;
  tripCompletedBody: string;
  startNewTrip: string;
  openDetail: string;
}

const en: UnderwayStrings = {
  dayOf: "Day {d} of {t}",
  returnOverdue: "Return day has passed",
  logSomething: "Log something",
  logSomethingSub: "Observation · note · photo",
  openObservations: "Open observations",
  viewAll: "View all",
  noOpenItems: "No open items — all clear.",
  resolveA11y: "Mark resolved",
  shoppingHint: "Tap to check off items at the market",
  endTrip: "Ready to end the trip?",
  endTripConfirmTitle: "End the trip?",
  endTripBodyOwn: "The guided close-out walks through the return checklist and your trip record.",
  endTripBodyCharter:
    "The guided close-out walks through check-out, comparison and your trip record.",
  endTripGo: "Continue",
  tripCompletedTitle: "Trip completed",
  tripCompletedBody:
    "Report and handover arrive in an upcoming phase. Your logbook stays readable.",
  startNewTrip: "Plan a new trip",
  openDetail: "Trip details",
};

const tr: UnderwayStrings = {
  dayOf: "Gün {d} / {t}",
  returnOverdue: "Dönüş günü geçti",
  logSomething: "Bir şey kaydet",
  logSomethingSub: "Gözlem · not · fotoğraf",
  openObservations: "Açık gözlemler",
  viewAll: "Tümü",
  noOpenItems: "Açık madde yok — her şey yolunda.",
  resolveA11y: "Çözüldü işaretle",
  shoppingHint: "Markette kalemleri işaretlemek için dokun",
  endTrip: "Seferi bitirmeye hazır mısın?",
  endTripConfirmTitle: "Sefer bitirilsin mi?",
  endTripBodyOwn: "Rehberli kapanış: dönüş listesi ve sefer kaydın.",
  endTripBodyCharter:
    "Rehberli kapanış: check-out, karşılaştırma ve sefer kaydın.",
  endTripGo: "Devam",
  tripCompletedTitle: "Sefer tamamlandı",
  tripCompletedBody:
    "Rapor ve teslim önümüzdeki fazda geliyor. Seyir defterin okunur kalır.",
  startNewTrip: "Yeni sefer planla",
  openDetail: "Sefer detayı",
};

const de: UnderwayStrings = { ...en };
const ru: UnderwayStrings = { ...en };
const es: UnderwayStrings = { ...en };
const hr: UnderwayStrings = { ...en };
const it: UnderwayStrings = { ...en };
const el: UnderwayStrings = { ...en };
const fr: UnderwayStrings = { ...en };

export const UNDERWAY_STRINGS: Record<Locale, UnderwayStrings> = {
  en, tr, de, ru, es, hr, it, el, fr,
};

export function fmtDayOf(s: UnderwayStrings, day: number, total: number): string {
  return s.dayOf.replace("{d}", String(day)).replace("{t}", String(total));
}
