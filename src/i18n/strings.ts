export type Locale = "tr" | "en" | "de" | "ru";

export const LOCALES: { code: Locale; label: string }[] = [
  { code: "tr", label: "TR" },
  { code: "en", label: "EN" },
  { code: "de", label: "DE" },
  { code: "ru", label: "RU" },
];

export interface Strings {
  appSubtitle: string;
  tagline: string;
  sectionRent: string;
  sectionOwner: string;
  items: string;
  guideTitle: string;
  guideSub: string;
  guideScreenTitle: string;
  guidePhotoHeader: string;
  guideRulesHeader: string;
  footerHome: string;
  back: string;
  checklistFallbackTitle: string;
  notFound: string;
  reset: string;
  resetTitle: string;
  resetMsg: string;
  resetCancel: string;
  resetConfirm: string;
  stampTitle: string;
  stampSub: string;
  tagCritical: string;
  tagPhoto: string;
}

export const STRINGS: Record<Locale, Strings> = {
  tr: {
    appSubtitle: "KAPTANIN TESLİM DEFTERİ",
    tagline: "Kiralık teknede depozitonu, kendi teknende\ncanını ve seyrini koru — hiçbir şeyi atlama.",
    sectionRent: "⚓ TEKNE Mİ KİRALADIN? ⚓",
    sectionOwner: "☸ TEKNE SAHİBİ MİSİN? ☸",
    items: "madde",
    guideTitle: "Foto & Depozito Rehberi",
    guideSub: "En çok ihtilaf çıkan noktalar ve teslim alırken mutlaka fotoğraflanacaklar",
    guideScreenTitle: "📷 Foto & Depozito Rehberi",
    guidePhotoHeader: "📷 MUTLAKA FOTOĞRAFLA",
    guideRulesHeader: "⚓ ALTIN KURALLAR",
    footerHome: "İyi seyirler! ⛵ Pruvanız neta olsun.",
    back: "Geri",
    checklistFallbackTitle: "Kontrol Listesi",
    notFound: "Tekne bulunamadı.",
    reset: "SIFIRLA",
    resetTitle: "Defteri temizle",
    resetMsg: "Bu teknenin tüm işaretleri silinsin mi?",
    resetCancel: "Vazgeç",
    resetConfirm: "Temizle",
    stampTitle: "✓ KONTROL TAMAM",
    stampSub: "Pruvanız neta, rüzgarınız kolayına olsun!",
    tagCritical: "KRİTİK",
    tagPhoto: "📷 FOTOĞRAFLA",
  },
  en: {
    appSubtitle: "THE CAPTAIN'S HANDOVER LOG",
    tagline: "Protect your deposit on a charter and your\nsafety on your own boat — miss nothing.",
    sectionRent: "⚓ RENTING A BOAT? ⚓",
    sectionOwner: "☸ OWN A BOAT? ☸",
    items: "items",
    guideTitle: "Photo & Deposit Guide",
    guideSub: "The most disputed damage areas and what to photograph at handover",
    guideScreenTitle: "📷 Photo & Deposit Guide",
    guidePhotoHeader: "📷 ALWAYS PHOTOGRAPH",
    guideRulesHeader: "⚓ GOLDEN RULES",
    footerHome: "Fair winds! ⛵ May your bow stay clear.",
    back: "Back",
    checklistFallbackTitle: "Checklist",
    notFound: "Vessel not found.",
    reset: "RESET",
    resetTitle: "Clear the log",
    resetMsg: "Clear all checks for this vessel?",
    resetCancel: "Cancel",
    resetConfirm: "Clear",
    stampTitle: "✓ ALL CHECKS DONE",
    stampSub: "Fair winds and following seas!",
    tagCritical: "CRITICAL",
    tagPhoto: "📷 PHOTOGRAPH",
  },
  de: {
    appSubtitle: "DAS ÜBERGABE-LOGBUCH DES KAPITÄNS",
    tagline: "Schütze deine Kaution beim Charter und deine\nSicherheit auf dem eigenen Boot — nichts vergessen.",
    sectionRent: "⚓ BOOT GECHARTERT? ⚓",
    sectionOwner: "☸ EIGNER? ☸",
    items: "Punkte",
    guideTitle: "Foto- & Kautions-Ratgeber",
    guideSub: "Die häufigsten Streitpunkte und was bei der Übernahme fotografiert werden muss",
    guideScreenTitle: "📷 Foto- & Kautions-Ratgeber",
    guidePhotoHeader: "📷 IMMER FOTOGRAFIEREN",
    guideRulesHeader: "⚓ GOLDENE REGELN",
    footerHome: "Mast- und Schotbruch! ⛵ Immer eine Handbreit Wasser unterm Kiel.",
    back: "Zurück",
    checklistFallbackTitle: "Checkliste",
    notFound: "Boot nicht gefunden.",
    reset: "ZURÜCKSETZEN",
    resetTitle: "Logbuch leeren",
    resetMsg: "Alle Haken für dieses Boot löschen?",
    resetCancel: "Abbrechen",
    resetConfirm: "Löschen",
    stampTitle: "✓ ALLES GEPRÜFT",
    stampSub: "Gute Reise und immer gute Fahrt!",
    tagCritical: "KRITISCH",
    tagPhoto: "📷 FOTOGRAFIEREN",
  },
  ru: {
    appSubtitle: "СУДОВОЙ ЖУРНАЛ ПРИЁМКИ",
    tagline: "Защити депозит на арендованной лодке и свою\nбезопасность на собственной — ничего не упусти.",
    sectionRent: "⚓ АРЕНДУЕТЕ ЛОДКУ? ⚓",
    sectionOwner: "☸ ВЛАДЕЛЕЦ ЛОДКИ? ☸",
    items: "пунктов",
    guideTitle: "Гид по фото и депозиту",
    guideSub: "Самые спорные места и что обязательно сфотографировать при приёмке",
    guideScreenTitle: "📷 Гид по фото и депозиту",
    guidePhotoHeader: "📷 ОБЯЗАТЕЛЬНО СФОТОГРАФИРУЙТЕ",
    guideRulesHeader: "⚓ ЗОЛОТЫЕ ПРАВИЛА",
    footerHome: "Семь футов под килем! ⛵ Попутного ветра.",
    back: "Назад",
    checklistFallbackTitle: "Чек-лист",
    notFound: "Судно не найдено.",
    reset: "СБРОСИТЬ",
    resetTitle: "Очистить журнал",
    resetMsg: "Снять все отметки для этого судна?",
    resetCancel: "Отмена",
    resetConfirm: "Очистить",
    stampTitle: "✓ ПРОВЕРКА ЗАВЕРШЕНА",
    stampSub: "Попутного ветра и спокойного моря!",
    tagCritical: "КРИТИЧНО",
    tagPhoto: "📷 СФОТОГРАФИРУЙТЕ",
  },
};
