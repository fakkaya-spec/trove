// Faz 5 — Seyir defteri (Log) ekran metinleri. en+tr tam; kalan diller
// İngilizce'ye düşer (çeviri borcu docs/HANDOFF.md'de). JSX'te sabit metin YOK.
import type { Locale } from "./strings";
import type { LogEntryType, LogSeverity } from "../domain/log";

export interface LogStrings {
  logbook: string;
  addCta: string;
  addTitle: string;
  typeLabel: string;
  type_observation: string;
  type_note: string;
  type_photo: string;
  type_anchorage: string;
  type_incident: string;
  type_defect: string;
  type_general: string;
  severityLabel: string;
  sev_minor: string;
  sev_moderate: string;
  sev_serious: string;
  descriptionLabel: string;
  descriptionPlaceholder: string;
  placePlaceholder: string;
  tapToCapture: string;
  photoAttached: string;
  save: string;
  emptyTitle: string;
  emptyBody: string;
  noTripTitle: string;
  noTripBody: string;
  /** KİLİTLİ çevrimdışı dili — kuyruktaki iş asla "başarısız" değildir */
  savedDevice: string;
  waitingSync: string;
  synced: string;
  discardTitle: string;
  discardBody: string;
  discardConfirm: string;
  keepEditing: string;
  descriptionRequired: string;
}

const en: LogStrings = {
  logbook: "Logbook",
  addCta: "Log",
  addTitle: "Add to log",
  typeLabel: "Type",
  type_observation: "Observation",
  type_note: "Note",
  type_photo: "Photo",
  type_anchorage: "Anchorage",
  type_incident: "Incident",
  type_defect: "Defect",
  type_general: "Entry",
  severityLabel: "Severity",
  sev_minor: "Minor",
  sev_moderate: "Moderate",
  sev_serious: "Serious",
  descriptionLabel: "Description",
  descriptionPlaceholder: "What happened?",
  placePlaceholder: "Place (optional)",
  tapToCapture: "Tap to capture",
  photoAttached: "Photo attached",
  save: "Save to logbook",
  emptyTitle: "No log entries yet",
  emptyBody: "Record observations, notes and photos as you go.",
  noTripTitle: "No active trip",
  noTripBody: "Start a trip to keep its running log here.",
  savedDevice: "Saved on this device",
  waitingSync: "Waiting to sync",
  synced: "Synced",
  discardTitle: "Discard this entry?",
  discardBody: "Your text has not been saved yet.",
  discardConfirm: "Discard",
  keepEditing: "Keep editing",
  descriptionRequired: "Write a short description first.",
};

const tr: LogStrings = {
  logbook: "Seyir defteri",
  addCta: "Kayıt",
  addTitle: "Deftere ekle",
  typeLabel: "Tür",
  type_observation: "Gözlem",
  type_note: "Not",
  type_photo: "Fotoğraf",
  type_anchorage: "Demir yeri",
  type_incident: "Olay",
  type_defect: "Arıza",
  type_general: "Kayıt",
  severityLabel: "Önem",
  sev_minor: "Hafif",
  sev_moderate: "Orta",
  sev_serious: "Ciddi",
  descriptionLabel: "Açıklama",
  descriptionPlaceholder: "Ne oldu?",
  placePlaceholder: "Yer (isteğe bağlı)",
  tapToCapture: "Çekmek için dokun",
  photoAttached: "Fotoğraf eklendi",
  save: "Deftere kaydet",
  emptyTitle: "Henüz kayıt yok",
  emptyBody: "Gözlemleri, notları ve fotoğrafları seyir sırasında kaydet.",
  noTripTitle: "Aktif sefer yok",
  noTripBody: "Seyir defterini burada tutmak için bir sefer başlat.",
  savedDevice: "Bu cihazda kayıtlı",
  waitingSync: "Senkron bekliyor",
  synced: "Senkronlandı",
  discardTitle: "Kayıt silinsin mi?",
  discardBody: "Metnin henüz kaydedilmedi.",
  discardConfirm: "Vazgeç ve sil",
  keepEditing: "Yazmaya devam et",
  descriptionRequired: "Önce kısa bir açıklama yaz.",
};

const de: LogStrings = { ...en };
const ru: LogStrings = { ...en };
const es: LogStrings = { ...en };
const hr: LogStrings = { ...en };
const it: LogStrings = { ...en };
const el: LogStrings = { ...en };
const fr: LogStrings = { ...en };

export const LOG_STRINGS: Record<Locale, LogStrings> = {
  en, tr, de, ru, es, hr, it, el, fr,
};

export function typeLabel(s: LogStrings, type: LogEntryType): string {
  return s[`type_${type}` as keyof LogStrings];
}

export function severityLabel(s: LogStrings, sev: LogSeverity): string {
  return s[`sev_${sev}` as keyof LogStrings];
}
