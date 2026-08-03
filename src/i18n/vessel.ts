// Tekne listesi + tekne ekleme metinleri (Faz 8 — ilk beş dakika).
// en+tr tam; diğer 7 dil İngilizce'ye düşer (belgeli çeviri borcu).
import type { Locale } from "./strings";

export interface VesselStrings {
  vesselsTitle: string;
  addVessel: string;
  addVesselSub: string;
  emptyTitle: string;
  emptyBody: string;
  nameLabel: string;
  namePlaceholder: string;
  typeLabel: string;
  ownershipLabel: string;
  detailsOptional: string;
  detailsHint: string;
  manufacturer: string;
  model: string;
  year: string;
  loa: string;
  engine: string;
  registration: string;
  hin: string;
  saveVessel: string;
  nameRequired: string;
  yearInvalid: string;
  loaInvalid: string;
  discardTitle: string;
  discardBody: string;
  keepEditing: string;
  discardConfirm: string;
  historyHint: string;
  deleteVessel: string;
  deleteVesselConfirm: string;
  photoOptional: string;
  addPhoto: string;
  changePhoto: string;
}

const en: VesselStrings = {
  vesselsTitle: "Vessels",
  addVessel: "Add vessel",
  addVesselSub: "Name and type are enough — details can wait.",
  emptyTitle: "No vessels yet",
  emptyBody: "Add your boat — or a charter boat — to start keeping its record.",
  nameLabel: "VESSEL NAME",
  namePlaceholder: "S/Y Meltemi",
  typeLabel: "TYPE",
  ownershipLabel: "OWNERSHIP",
  detailsOptional: "DETAILS (OPTIONAL)",
  detailsHint: "Everything here can be added later.",
  manufacturer: "Manufacturer",
  model: "Model",
  year: "Year",
  loa: "LOA (m)",
  engine: "Engine",
  registration: "Registration",
  hin: "HIN",
  saveVessel: "Add vessel",
  nameRequired: "Give the vessel a name to continue.",
  yearInvalid: "Year doesn't look right.",
  loaInvalid: "Length doesn't look right.",
  discardTitle: "Discard this vessel?",
  discardBody: "What you typed here won't be saved.",
  keepEditing: "Keep editing",
  discardConfirm: "Discard",
  historyHint: "Open a vessel to see its trip and inspection history.",
  deleteVessel: "Delete vessel",
  deleteVesselConfirm:
    "The vessel is removed from your lists. Trips and inspections that reference it keep their records.",
  photoOptional: "PHOTO (OPTIONAL)",
  addPhoto: "Add a photo of the boat",
  changePhoto: "Change photo",
};

const tr: VesselStrings = {
  vesselsTitle: "Tekneler",
  addVessel: "Tekne ekle",
  addVesselSub: "İsim ve tür yeter — ayrıntılar bekleyebilir.",
  emptyTitle: "Henüz tekne yok",
  emptyBody: "Kaydını tutmaya başlamak için teknenizi — veya bir charter teknesini — ekleyin.",
  nameLabel: "TEKNE ADI",
  namePlaceholder: "S/Y Meltemi",
  typeLabel: "TÜR",
  ownershipLabel: "MÜLKİYET",
  detailsOptional: "AYRINTILAR (İSTEĞE BAĞLI)",
  detailsHint: "Buradaki her şey sonra da eklenebilir.",
  manufacturer: "Üretici",
  model: "Model",
  year: "Yıl",
  loa: "Boy (m)",
  engine: "Motor",
  registration: "Sicil",
  hin: "HIN",
  saveVessel: "Tekne ekle",
  nameRequired: "Devam etmek için tekneye bir ad ver.",
  yearInvalid: "Yıl doğru görünmüyor.",
  loaInvalid: "Boy doğru görünmüyor.",
  discardTitle: "Bu tekne atılsın mı?",
  discardBody: "Buraya yazdıkların kaydedilmeyecek.",
  keepEditing: "Düzenlemeye devam",
  discardConfirm: "At",
  historyHint: "Sefer ve denetim geçmişini görmek için bir tekne aç.",
  deleteVessel: "Tekneyi sil",
  deleteVesselConfirm:
    "Tekne listelerinden kaldırılır. Ona bağlı sefer ve denetim kayıtları korunur.",
  photoOptional: "FOTOĞRAF (İSTEĞE BAĞLI)",
  addPhoto: "Teknenin bir fotoğrafını ekle",
  changePhoto: "Fotoğrafı değiştir",
};

const de: VesselStrings = { ...en };
const ru: VesselStrings = { ...en };
const es: VesselStrings = { ...en };
const hr: VesselStrings = { ...en };
const it: VesselStrings = { ...en };
const el: VesselStrings = { ...en };
const fr: VesselStrings = { ...en };

export const VESSEL_STRINGS: Record<Locale, VesselStrings> = {
  en, tr, de, ru, es, hr, it, el, fr,
};
