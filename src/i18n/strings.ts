export type Locale = "en" | "tr" | "de" | "ru" | "es";

// İlk sırada İngilizce: uygulamanın ana/varsayılan dili.
export const LOCALES: { code: Locale; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "tr", label: "TR" },
  { code: "de", label: "DE" },
  { code: "ru", label: "RU" },
  { code: "es", label: "ES" },
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
  // Premium / abonelik
  premiumCardTitle: string;
  premiumCardSub: string;
  premiumScreenTitle: string;
  premiumLead: string;
  premiumBenefit1: string;
  premiumBenefit2: string;
  premiumBenefit3: string;
  premiumMonthly: string;
  premiumYearly: string;
  premiumYearlyBadge: string;
  premiumRestore: string;
  premiumActiveTitle: string;
  premiumActiveSub: string;
  premiumNote: string;
  premiumUnavailable: string;
  premiumErrorTitle: string;
  premiumErrorMsg: string;
}

export const STRINGS: Record<Locale, Strings> = {
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
    premiumCardTitle: "Premium",
    premiumCardSub: "Remove all ads — monthly or yearly subscription",
    premiumScreenTitle: "⭐ Premium",
    premiumLead: "Sail without distractions. Premium removes every ad from the app.",
    premiumBenefit1: "All ads removed — banners and full-screen",
    premiumBenefit2: "Nothing between you and your checklist at sea",
    premiumBenefit3: "You support the development of new checklists",
    premiumMonthly: "Monthly",
    premiumYearly: "Yearly",
    premiumYearlyBadge: "BEST VALUE",
    premiumRestore: "Restore purchases",
    premiumActiveTitle: "⭐ Premium active",
    premiumActiveSub: "Thank you, captain! The app is ad-free.",
    premiumNote: "Prices are shown by the store at checkout. Cancel anytime in your store subscriptions.",
    premiumUnavailable: "The store is not available in this build. Subscriptions work in the app installed from the App Store / Google Play.",
    premiumErrorTitle: "Purchase failed",
    premiumErrorMsg: "The purchase could not be completed. Please try again.",
  },
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
    premiumCardTitle: "Premium",
    premiumCardSub: "Tüm reklamları kaldır — aylık veya yıllık abonelik",
    premiumScreenTitle: "⭐ Premium",
    premiumLead: "Dikkatin dağılmadan seyret. Premium, uygulamadaki tüm reklamları kaldırır.",
    premiumBenefit1: "Tüm reklamlar kalkar — banner ve tam ekran",
    premiumBenefit2: "Denizde seninle listen arasına hiçbir şey girmez",
    premiumBenefit3: "Yeni kontrol listelerinin gelişimini desteklersin",
    premiumMonthly: "Aylık",
    premiumYearly: "Yıllık",
    premiumYearlyBadge: "EN AVANTAJLI",
    premiumRestore: "Satın alımları geri yükle",
    premiumActiveTitle: "⭐ Premium aktif",
    premiumActiveSub: "Teşekkürler kaptan! Uygulama reklamsız.",
    premiumNote: "Fiyatlar ödeme sırasında mağaza tarafından gösterilir. Mağaza aboneliklerinden istediğin an iptal edebilirsin.",
    premiumUnavailable: "Bu derlemede mağaza kullanılamıyor. Abonelikler App Store / Google Play'den kurulan uygulamada çalışır.",
    premiumErrorTitle: "Satın alma başarısız",
    premiumErrorMsg: "Satın alma tamamlanamadı. Lütfen tekrar dene.",
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
    premiumCardTitle: "Premium",
    premiumCardSub: "Alle Werbung entfernen — Monats- oder Jahresabo",
    premiumScreenTitle: "⭐ Premium",
    premiumLead: "Segeln ohne Ablenkung. Premium entfernt jede Werbung aus der App.",
    premiumBenefit1: "Alle Werbung entfernt — Banner und Vollbild",
    premiumBenefit2: "Auf See steht nichts zwischen dir und deiner Checkliste",
    premiumBenefit3: "Du unterstützt die Entwicklung neuer Checklisten",
    premiumMonthly: "Monatlich",
    premiumYearly: "Jährlich",
    premiumYearlyBadge: "BESTER PREIS",
    premiumRestore: "Käufe wiederherstellen",
    premiumActiveTitle: "⭐ Premium aktiv",
    premiumActiveSub: "Danke, Kapitän! Die App ist werbefrei.",
    premiumNote: "Preise werden beim Kauf vom Store angezeigt. Jederzeit in den Store-Abos kündbar.",
    premiumUnavailable: "Der Store ist in diesem Build nicht verfügbar. Abos funktionieren in der App aus dem App Store / Google Play.",
    premiumErrorTitle: "Kauf fehlgeschlagen",
    premiumErrorMsg: "Der Kauf konnte nicht abgeschlossen werden. Bitte erneut versuchen.",
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
    premiumCardTitle: "Premium",
    premiumCardSub: "Убрать всю рекламу — подписка на месяц или год",
    premiumScreenTitle: "⭐ Premium",
    premiumLead: "Ходите под парусом без отвлечений. Premium убирает всю рекламу из приложения.",
    premiumBenefit1: "Вся реклама удалена — баннеры и полноэкранная",
    premiumBenefit2: "В море ничто не встанет между вами и чек-листом",
    premiumBenefit3: "Вы поддерживаете разработку новых чек-листов",
    premiumMonthly: "Месяц",
    premiumYearly: "Год",
    premiumYearlyBadge: "ВЫГОДНЕЕ",
    premiumRestore: "Восстановить покупки",
    premiumActiveTitle: "⭐ Premium активен",
    premiumActiveSub: "Спасибо, капитан! Приложение без рекламы.",
    premiumNote: "Цены показывает магазин при оплате. Отменить можно в любой момент в подписках магазина.",
    premiumUnavailable: "Магазин недоступен в этой сборке. Подписки работают в приложении из App Store / Google Play.",
    premiumErrorTitle: "Покупка не удалась",
    premiumErrorMsg: "Не удалось завершить покупку. Попробуйте ещё раз.",
  },
  es: {
    appSubtitle: "EL CUADERNO DE ENTREGA DEL CAPITÁN",
    tagline: "Protege tu fianza en el chárter y tu\nseguridad en tu propio barco — sin olvidar nada.",
    sectionRent: "⚓ ¿ALQUILAS UN BARCO? ⚓",
    sectionOwner: "☸ ¿TIENES BARCO PROPIO? ☸",
    items: "puntos",
    guideTitle: "Guía de fotos y fianza",
    guideSub: "Las zonas de daños más disputadas y qué fotografiar en la entrega",
    guideScreenTitle: "📷 Guía de fotos y fianza",
    guidePhotoHeader: "📷 FOTOGRAFÍA SIEMPRE",
    guideRulesHeader: "⚓ REGLAS DE ORO",
    footerHome: "¡Buen viento! ⛵ Y buena mar.",
    back: "Atrás",
    checklistFallbackTitle: "Lista de control",
    notFound: "Embarcación no encontrada.",
    reset: "REINICIAR",
    resetTitle: "Vaciar el cuaderno",
    resetMsg: "¿Borrar todas las marcas de esta embarcación?",
    resetCancel: "Cancelar",
    resetConfirm: "Borrar",
    stampTitle: "✓ TODO REVISADO",
    stampSub: "¡Buen viento y buena mar!",
    tagCritical: "CRÍTICO",
    tagPhoto: "📷 FOTOGRAFIAR",
    premiumCardTitle: "Premium",
    premiumCardSub: "Elimina toda la publicidad — suscripción mensual o anual",
    premiumScreenTitle: "⭐ Premium",
    premiumLead: "Navega sin distracciones. Premium elimina toda la publicidad de la app.",
    premiumBenefit1: "Sin anuncios — ni banners ni pantalla completa",
    premiumBenefit2: "En el mar, nada se interpone entre tú y tu lista",
    premiumBenefit3: "Apoyas el desarrollo de nuevas listas de control",
    premiumMonthly: "Mensual",
    premiumYearly: "Anual",
    premiumYearlyBadge: "MEJOR PRECIO",
    premiumRestore: "Restaurar compras",
    premiumActiveTitle: "⭐ Premium activo",
    premiumActiveSub: "¡Gracias, capitán! La app está libre de anuncios.",
    premiumNote: "Los precios los muestra la tienda al pagar. Cancela cuando quieras en las suscripciones de tu tienda.",
    premiumUnavailable: "La tienda no está disponible en esta compilación. Las suscripciones funcionan en la app instalada desde App Store / Google Play.",
    premiumErrorTitle: "Compra fallida",
    premiumErrorMsg: "No se pudo completar la compra. Inténtalo de nuevo.",
  },
};
