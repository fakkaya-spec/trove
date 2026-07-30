// Yeni inspection akışının arayüz metinleri (5 dil).
// Legacy ekran metinleri strings.ts'te kalır; bu modül yalnızca yeni akış içindir.
import type { Locale } from "./strings";

export interface InspectionStrings {
  newInspection: string;
  inProgress: string;
  completed: string;
  legacyLink: string;
  notAvailable: string;
  resume: string;
  vesselName: string;
  vesselModel: string;
  boatType: string;
  savedVessels: string;
  newVessel: string;
  template: string;
  start: string;
  approveSection: string;
  sectionClear: string;
  criticalNeedTap: string;
  statusWorking: string;
  statusAttention: string;
  statusNotWorking: string;
  statusNa: string;
  statusUnchecked: string;
  issue: string;
  severity: string;
  sevLow: string;
  sevMedium: string;
  sevHigh: string;
  sevCritical: string;
  note: string;
  addPhoto: string;
  photoAdded: string;
  reportedToCompany: string;
  resolved: string;
  save: string;
  cancel: string;
  meters: string;
  inventory: string;
  expected: string;
  summary: string;
  complete: string;
  completeBlockedTitle: string;
  completeWarnTitle: string;
  completeWarnBody: string;
  completeAnyway: string;
  safetyWarnTitle: string;
  safetyWarnBody: string;
  doneTitle: string;
  duration: string;
  issuesLabel: string;
  itemsLabel: string;
  checkIn: string;
  btSailing: string;
  btCatamaran: string;
  btMotor: string;
  btRib: string;
  btJetski: string;
  btGulet: string;
}

export const INSPECTION_STRINGS: Record<Locale, InspectionStrings> = {
  en: {
    newInspection: "New Inspection",
    inProgress: "In progress",
    completed: "Completed",
    legacyLink: "Checklists (classic mode)",
    notAvailable: "Inspections are not available on this platform yet. Please use the mobile app.",
    resume: "Resume",
    vesselName: "Boat name",
    vesselModel: "Model (optional)",
    boatType: "Boat type",
    savedVessels: "Saved boats",
    newVessel: "New boat",
    template: "Template",
    start: "Start inspection",
    approveSection: "No issues in this section",
    sectionClear: "Section complete",
    criticalNeedTap: "critical items need individual confirmation",
    statusWorking: "Working",
    statusAttention: "Needs attention",
    statusNotWorking: "Not working",
    statusNa: "Not applicable",
    statusUnchecked: "Not checked",
    issue: "Issue",
    severity: "Severity",
    sevLow: "Low",
    sevMedium: "Medium",
    sevHigh: "High",
    sevCritical: "Critical",
    note: "Note",
    addPhoto: "Add photo",
    photoAdded: "photo(s) attached",
    reportedToCompany: "Reported to the charter company",
    resolved: "Resolved",
    save: "Save",
    cancel: "Cancel",
    meters: "Meters",
    inventory: "Inventory",
    expected: "expected",
    summary: "Summary",
    complete: "Complete inspection",
    completeBlockedTitle: "Critical items not checked yet",
    completeWarnTitle: "Unchecked items remain",
    completeWarnBody: "Some non-critical items are still unchecked. Complete anyway?",
    completeAnyway: "Complete anyway",
    safetyWarnTitle: "Safety warning",
    safetyWarnBody:
      "This issue may make the boat unsafe. We recommend informing the charter company before departure.",
    doneTitle: "Inspection completed",
    duration: "Duration",
    issuesLabel: "Issues",
    itemsLabel: "items",
    checkIn: "Check-in",
    btSailing: "Sailing yacht",
    btCatamaran: "Catamaran",
    btMotor: "Motor yacht",
    btRib: "RIB / Speedboat",
    btJetski: "Jet ski",
    btGulet: "Gulet",
  },
  tr: {
    newInspection: "Yeni Denetim",
    inProgress: "Devam eden",
    completed: "Tamamlanan",
    legacyLink: "Kontrol Listeleri (klasik mod)",
    notAvailable: "Denetimler bu platformda henüz kullanılamıyor. Lütfen mobil uygulamayı kullanın.",
    resume: "Devam et",
    vesselName: "Tekne adı",
    vesselModel: "Model (opsiyonel)",
    boatType: "Tekne tipi",
    savedVessels: "Kayıtlı tekneler",
    newVessel: "Yeni tekne",
    template: "Şablon",
    start: "Denetimi başlat",
    approveSection: "Bu bölümde sorun yok",
    sectionClear: "Bölüm tamamlandı",
    criticalNeedTap: "kritik madde tek tek onay bekliyor",
    statusWorking: "Çalışıyor",
    statusAttention: "İlgi gerekiyor",
    statusNotWorking: "Çalışmıyor",
    statusNa: "Uygulanamaz",
    statusUnchecked: "Kontrol edilmedi",
    issue: "Sorun",
    severity: "Önem",
    sevLow: "Düşük",
    sevMedium: "Orta",
    sevHigh: "Yüksek",
    sevCritical: "Kritik",
    note: "Not",
    addPhoto: "Fotoğraf ekle",
    photoAdded: "fotoğraf eklendi",
    reportedToCompany: "Charter firmasına bildirildi",
    resolved: "Giderildi",
    save: "Kaydet",
    cancel: "Vazgeç",
    meters: "Sayaçlar",
    inventory: "Envanter",
    expected: "beklenen",
    summary: "Özet",
    complete: "Denetimi tamamla",
    completeBlockedTitle: "Kontrol edilmemiş kritik maddeler var",
    completeWarnTitle: "Kontrol edilmemiş maddeler var",
    completeWarnBody: "Bazı kritik olmayan maddeler hâlâ işaretlenmedi. Yine de tamamlansın mı?",
    completeAnyway: "Yine de tamamla",
    safetyWarnTitle: "Güvenlik uyarısı",
    safetyWarnBody:
      "Bu sorun tekneyi güvensiz hale getirebilir. Yola çıkmadan önce charter firmasına bildirmenizi öneririz.",
    doneTitle: "Denetim tamamlandı",
    duration: "Süre",
    issuesLabel: "Sorunlar",
    itemsLabel: "madde",
    checkIn: "Check-in",
    btSailing: "Yelkenli",
    btCatamaran: "Katamaran",
    btMotor: "Motoryat",
    btRib: "RIB / Sürat teknesi",
    btJetski: "Jet ski",
    btGulet: "Gulet",
  },
  de: {
    newInspection: "Neue Inspektion",
    inProgress: "In Bearbeitung",
    completed: "Abgeschlossen",
    legacyLink: "Checklisten (klassischer Modus)",
    notAvailable: "Inspektionen sind auf dieser Plattform noch nicht verfügbar. Bitte die Mobile-App nutzen.",
    resume: "Fortsetzen",
    vesselName: "Bootsname",
    vesselModel: "Modell (optional)",
    boatType: "Bootstyp",
    savedVessels: "Gespeicherte Boote",
    newVessel: "Neues Boot",
    template: "Vorlage",
    start: "Inspektion starten",
    approveSection: "Keine Mängel in diesem Abschnitt",
    sectionClear: "Abschnitt abgeschlossen",
    criticalNeedTap: "kritische Punkte einzeln bestätigen",
    statusWorking: "Funktioniert",
    statusAttention: "Beobachten",
    statusNotWorking: "Defekt",
    statusNa: "Entfällt",
    statusUnchecked: "Nicht geprüft",
    issue: "Mangel",
    severity: "Schweregrad",
    sevLow: "Gering",
    sevMedium: "Mittel",
    sevHigh: "Hoch",
    sevCritical: "Kritisch",
    note: "Notiz",
    addPhoto: "Foto hinzufügen",
    photoAdded: "Foto(s) angehängt",
    reportedToCompany: "Dem Vercharterer gemeldet",
    resolved: "Behoben",
    save: "Speichern",
    cancel: "Abbrechen",
    meters: "Zähler",
    inventory: "Inventar",
    expected: "erwartet",
    summary: "Zusammenfassung",
    complete: "Inspektion abschließen",
    completeBlockedTitle: "Kritische Punkte noch nicht geprüft",
    completeWarnTitle: "Ungeprüfte Punkte vorhanden",
    completeWarnBody: "Einige nicht-kritische Punkte sind noch offen. Trotzdem abschließen?",
    completeAnyway: "Trotzdem abschließen",
    safetyWarnTitle: "Sicherheitswarnung",
    safetyWarnBody:
      "Dieser Mangel kann das Boot unsicher machen. Wir empfehlen, den Vercharterer vor dem Ablegen zu informieren.",
    doneTitle: "Inspektion abgeschlossen",
    duration: "Dauer",
    issuesLabel: "Mängel",
    itemsLabel: "Punkte",
    checkIn: "Check-in",
    btSailing: "Segelyacht",
    btCatamaran: "Katamaran",
    btMotor: "Motoryacht",
    btRib: "RIB / Motorboot",
    btJetski: "Jetski",
    btGulet: "Gulet",
  },
  ru: {
    newInspection: "Новая инспекция",
    inProgress: "В процессе",
    completed: "Завершено",
    legacyLink: "Чек-листы (классический режим)",
    notAvailable: "Инспекции пока недоступны на этой платформе. Используйте мобильное приложение.",
    resume: "Продолжить",
    vesselName: "Название лодки",
    vesselModel: "Модель (необязательно)",
    boatType: "Тип судна",
    savedVessels: "Сохранённые лодки",
    newVessel: "Новая лодка",
    template: "Шаблон",
    start: "Начать инспекцию",
    approveSection: "В этом разделе проблем нет",
    sectionClear: "Раздел завершён",
    criticalNeedTap: "критичные пункты требуют отдельного подтверждения",
    statusWorking: "Исправно",
    statusAttention: "Требует внимания",
    statusNotWorking: "Не работает",
    statusNa: "Неприменимо",
    statusUnchecked: "Не проверено",
    issue: "Проблема",
    severity: "Серьёзность",
    sevLow: "Низкая",
    sevMedium: "Средняя",
    sevHigh: "Высокая",
    sevCritical: "Критичная",
    note: "Заметка",
    addPhoto: "Добавить фото",
    photoAdded: "фото прикреплено",
    reportedToCompany: "Сообщено чартерной компании",
    resolved: "Устранено",
    save: "Сохранить",
    cancel: "Отмена",
    meters: "Счётчики",
    inventory: "Инвентарь",
    expected: "ожидается",
    summary: "Итог",
    complete: "Завершить инспекцию",
    completeBlockedTitle: "Критичные пункты ещё не проверены",
    completeWarnTitle: "Остались непроверенные пункты",
    completeWarnBody: "Некоторые некритичные пункты не отмечены. Всё равно завершить?",
    completeAnyway: "Завершить всё равно",
    safetyWarnTitle: "Предупреждение о безопасности",
    safetyWarnBody:
      "Эта проблема может сделать судно небезопасным. Рекомендуем сообщить чартерной компании до выхода.",
    doneTitle: "Инспекция завершена",
    duration: "Длительность",
    issuesLabel: "Проблемы",
    itemsLabel: "пунктов",
    checkIn: "Приёмка",
    btSailing: "Парусная яхта",
    btCatamaran: "Катамаран",
    btMotor: "Моторная яхта",
    btRib: "RIB / катер",
    btJetski: "Гидроцикл",
    btGulet: "Гулет",
  },
  es: {
    newInspection: "Nueva inspección",
    inProgress: "En curso",
    completed: "Completadas",
    legacyLink: "Listas de control (modo clásico)",
    notAvailable: "Las inspecciones aún no están disponibles en esta plataforma. Usa la app móvil.",
    resume: "Continuar",
    vesselName: "Nombre del barco",
    vesselModel: "Modelo (opcional)",
    boatType: "Tipo de barco",
    savedVessels: "Barcos guardados",
    newVessel: "Barco nuevo",
    template: "Plantilla",
    start: "Iniciar inspección",
    approveSection: "Sin problemas en esta sección",
    sectionClear: "Sección completada",
    criticalNeedTap: "puntos críticos requieren confirmación individual",
    statusWorking: "Funciona",
    statusAttention: "Requiere atención",
    statusNotWorking: "No funciona",
    statusNa: "No aplica",
    statusUnchecked: "Sin revisar",
    issue: "Problema",
    severity: "Gravedad",
    sevLow: "Baja",
    sevMedium: "Media",
    sevHigh: "Alta",
    sevCritical: "Crítica",
    note: "Nota",
    addPhoto: "Añadir foto",
    photoAdded: "foto(s) adjunta(s)",
    reportedToCompany: "Informado a la empresa de chárter",
    resolved: "Resuelto",
    save: "Guardar",
    cancel: "Cancelar",
    meters: "Medidores",
    inventory: "Inventario",
    expected: "esperado",
    summary: "Resumen",
    complete: "Completar inspección",
    completeBlockedTitle: "Puntos críticos sin revisar",
    completeWarnTitle: "Quedan puntos sin revisar",
    completeWarnBody: "Algunos puntos no críticos siguen sin marcar. ¿Completar de todos modos?",
    completeAnyway: "Completar igualmente",
    safetyWarnTitle: "Aviso de seguridad",
    safetyWarnBody:
      "Este problema puede hacer que el barco no sea seguro. Recomendamos informar a la empresa antes de zarpar.",
    doneTitle: "Inspección completada",
    duration: "Duración",
    issuesLabel: "Problemas",
    itemsLabel: "puntos",
    checkIn: "Check-in",
    btSailing: "Velero",
    btCatamaran: "Catamarán",
    btMotor: "Yate a motor",
    btRib: "RIB / lancha",
    btJetski: "Moto de agua",
    btGulet: "Goleta",
  },
};
