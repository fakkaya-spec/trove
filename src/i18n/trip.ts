// Trip + ikmal akışlarının arayüz metinleri (5 dil).
import type { Locale } from "./strings";

export interface TripStrings {
  tabHome: string;
  tabTrips: string;
  tabBoats: string;
  tabLibrary: string;
  tabProfile: string;
  // Home
  noTripYet: string;
  startTrip: string;
  inspectCharter: string;
  prepareOwnBoat: string;
  resumeDraft: string;
  nextStep: string;
  criticalOpen: string;
  shoppingProgress: string;
  na_start_check_in: string;
  na_start_pre_departure: string;
  na_continue_pre_departure: string;
  na_generate_provisions: string;
  na_continue_shopping: string;
  na_review_critical_issues: string;
  na_start_return_check: string;
  na_continue_return_check: string;
  na_trip_complete: string;
  // Wizard
  newTrip: string;
  whichBoat: string;
  ownBoat: string;
  charterBoat: string;
  decideLater: string;
  tripName: string;
  tripDates: string;
  dateHint: string;
  departure: string;
  destination: string;
  tripType: string;
  tt_short_day_trip: string;
  tt_full_day_trip: string;
  tt_weekend: string;
  tt_multi_day_coastal: string;
  tt_offshore_passage: string;
  nights: string;
  crew: string;
  adults: string;
  children: string;
  infants: string;
  pets: string;
  skipperName: string;
  usageProfile: string;
  mooring: string;
  m_marina: string;
  m_mixed: string;
  m_anchor: string;
  mealsAboard: string;
  breakfasts: string;
  lunches: string;
  dinners: string;
  snacksQ: string;
  shopAccess: string;
  sa_easy: string;
  sa_limited: string;
  sa_none: string;
  watermaker: string;
  refrigerator: string;
  freezer: string;
  climate: string;
  c_cool: string;
  c_moderate: string;
  c_hot: string;
  styleLabel: string;
  st_essential: string;
  st_balanced: string;
  st_comfortable: string;
  allergies: string;
  allergyWarn: string;
  createTrip: string;
  // Trip detail
  preDeparture: string;
  returnCheck: string;
  checkIn: string;
  checkOut: string;
  provisioning: string;
  tripSummary: string;
  planning: string;
  active: string;
  completedTrip: string;
  deleteTrip: string;
  deleteTripConfirm: string;
  boatMissing: string;
  chooseBoatFirst: string;
  // Provisioning
  provEstimateNote: string;
  toBuy: string;
  onboardLabel: string;
  purchased: string;
  packed: string;
  skipped: string;
  addItem: string;
  itemName: string;
  quantity: string;
  unit: string;
  deleteItemConfirm: string;
  shareList: string;
  whyThis: string;
  reserve: string;
  people: string;
  days: string;
  meals: string;
  allDone: string;
  // Kategoriler
  cat_drinking_water: string;
  cat_beverages: string;
  cat_breakfast: string;
  cat_lunch: string;
  cat_dinner: string;
  cat_snacks: string;
  cat_fruit_veg: string;
  cat_pantry: string;
  cat_condiments: string;
  cat_coffee_tea: string;
  cat_children: string;
  cat_hygiene: string;
  cat_cleaning: string;
  cat_paper: string;
  cat_waste_storage: string;
  cat_medical_comfort: string;
  cat_ice: string;
  cat_emergency_reserve: string;
  cat_pet: string;
  // Boats & Library & Profile
  myBoats: string;
  charterBoatsUsed: string;
  addBoat: string;
  templatesLib: string;
  legacyChecklists: string;
  language: string;
  about: string;
  // Ortak
  cancel: string;
  save: string;
  next: string;
  back: string;
}

const en: TripStrings = {
  tabHome: "Home", tabTrips: "Trips", tabBoats: "Boats", tabLibrary: "Library", tabProfile: "Profile",
  noTripYet: "No trip yet. Plan your next voyage.",
  startTrip: "Start a Trip",
  inspectCharter: "Inspect a Charter Boat",
  prepareOwnBoat: "Prepare My Boat",
  resumeDraft: "Resume Draft",
  nextStep: "Next step",
  criticalOpen: "critical items unresolved",
  shoppingProgress: "Shopping",
  na_start_check_in: "Start the charter check-in",
  na_start_pre_departure: "Start the pre-departure check",
  na_continue_pre_departure: "Continue the pre-departure check",
  na_generate_provisions: "Generate the provisioning list",
  na_continue_shopping: "Continue shopping",
  na_review_critical_issues: "Review unresolved critical items",
  na_start_return_check: "Start the return checklist",
  na_continue_return_check: "Continue the return checklist",
  na_trip_complete: "Trip preparation complete — fair winds!",
  newTrip: "New Trip",
  whichBoat: "Which boat will you use?",
  ownBoat: "My own boat",
  charterBoat: "A charter boat",
  decideLater: "Add or select later",
  tripName: "Trip name",
  tripDates: "Dates",
  dateHint: "YYYY-MM-DD",
  departure: "Departure location",
  destination: "Destination / route",
  tripType: "Trip type",
  tt_short_day_trip: "Short day trip",
  tt_full_day_trip: "Full day",
  tt_weekend: "Weekend",
  tt_multi_day_coastal: "Multi-day coastal",
  tt_offshore_passage: "Offshore passage",
  nights: "Nights aboard",
  crew: "Crew",
  adults: "Adults",
  children: "Children",
  infants: "Infants",
  pets: "Pets",
  skipperName: "Skipper name",
  usageProfile: "Usage profile",
  mooring: "Mostly marina or anchoring?",
  m_marina: "Marina",
  m_mixed: "Mixed",
  m_anchor: "Anchoring",
  mealsAboard: "Meals aboard (count)",
  breakfasts: "Breakfasts",
  lunches: "Lunches",
  dinners: "Dinners",
  snacksQ: "Snacks aboard",
  shopAccess: "Shops during trip",
  sa_easy: "Easy",
  sa_limited: "Limited",
  sa_none: "None",
  watermaker: "Watermaker",
  refrigerator: "Refrigerator",
  freezer: "Freezer",
  climate: "Expected climate",
  c_cool: "Cool",
  c_moderate: "Moderate",
  c_hot: "Hot",
  styleLabel: "Provisioning style",
  st_essential: "Essential",
  st_balanced: "Balanced",
  st_comfortable: "Comfortable",
  allergies: "Allergies (prominently shown)",
  allergyWarn: "ALLERGY NOTE",
  createTrip: "Create trip & plan",
  preDeparture: "Pre-departure check",
  returnCheck: "Return & secure",
  checkIn: "Charter check-in",
  checkOut: "Charter check-out",
  provisioning: "Provisioning",
  tripSummary: "Trip summary",
  planning: "Planning",
  active: "Active",
  completedTrip: "Completed",
  deleteTrip: "Delete trip",
  deleteTripConfirm: "Delete this trip and its local data?",
  boatMissing: "No boat selected for this trip yet.",
  chooseBoatFirst: "Select a boat to start checklists.",
  provEstimateNote:
    "Quantities are editable planning estimates, not guarantees. Tap a row to adjust; tap ⓘ to see the reasoning.",
  toBuy: "To buy",
  onboardLabel: "On board",
  purchased: "Purchased",
  packed: "Packed",
  skipped: "Skipped",
  addItem: "Add item",
  itemName: "Item name",
  quantity: "Quantity",
  unit: "Unit",
  deleteItemConfirm: "Delete this item?",
  shareList: "Share list",
  whyThis: "Why this amount?",
  reserve: "reserve",
  people: "people",
  days: "days",
  meals: "meals",
  allDone: "All purchases done!",
  cat_drinking_water: "Drinking water",
  cat_beverages: "Beverages",
  cat_breakfast: "Breakfast",
  cat_lunch: "Lunch",
  cat_dinner: "Dinner",
  cat_snacks: "Snacks",
  cat_fruit_veg: "Fruit & vegetables",
  cat_pantry: "Pantry",
  cat_condiments: "Condiments & spices",
  cat_coffee_tea: "Coffee & tea",
  cat_children: "Children",
  cat_hygiene: "Hygiene",
  cat_cleaning: "Cleaning",
  cat_paper: "Paper products",
  cat_waste_storage: "Waste & storage",
  cat_medical_comfort: "Medical & comfort",
  cat_ice: "Ice",
  cat_emergency_reserve: "Emergency reserve",
  cat_pet: "Pet supplies",
  myBoats: "My boats",
  charterBoatsUsed: "Charter boats used",
  addBoat: "Add boat",
  templatesLib: "Checklist templates",
  legacyChecklists: "Classic checklists",
  language: "Language",
  about: "About",
  cancel: "Cancel",
  save: "Save",
  next: "Next",
  back: "Back",
};

const tr: TripStrings = {
  ...en,
  tabHome: "Ana Sayfa", tabTrips: "Seferler", tabBoats: "Tekneler", tabLibrary: "Kitaplık", tabProfile: "Profil",
  noTripYet: "Henüz sefer yok. Bir sonraki seyrini planla.",
  startTrip: "Sefer Başlat",
  inspectCharter: "Kiralık Tekneyi Denetle",
  prepareOwnBoat: "Teknemi Hazırla",
  resumeDraft: "Taslağa Devam Et",
  nextStep: "Sonraki adım",
  criticalOpen: "kritik madde çözülmedi",
  shoppingProgress: "Alışveriş",
  na_start_check_in: "Charter check-in'i başlat",
  na_start_pre_departure: "Yola çıkış kontrolünü başlat",
  na_continue_pre_departure: "Yola çıkış kontrolüne devam et",
  na_generate_provisions: "İkmal listesini oluştur",
  na_continue_shopping: "Alışverişe devam et",
  na_review_critical_issues: "Çözülmemiş kritik maddeleri incele",
  na_start_return_check: "Dönüş kontrolünü başlat",
  na_continue_return_check: "Dönüş kontrolüne devam et",
  na_trip_complete: "Sefer hazırlığı tamam — iyi seyirler!",
  newTrip: "Yeni Sefer",
  whichBoat: "Hangi tekneyi kullanacaksın?",
  ownBoat: "Kendi teknem",
  charterBoat: "Kiralık tekne",
  decideLater: "Sonra ekle/seç",
  tripName: "Sefer adı",
  tripDates: "Tarihler",
  dateHint: "YYYY-AA-GG",
  departure: "Kalkış yeri",
  destination: "Varış / rota",
  tripType: "Sefer tipi",
  tt_short_day_trip: "Kısa günübirlik",
  tt_full_day_trip: "Tam gün",
  tt_weekend: "Hafta sonu",
  tt_multi_day_coastal: "Çok günlü kıyı",
  tt_offshore_passage: "Açık deniz geçişi",
  nights: "Teknede gece",
  crew: "Mürettebat",
  adults: "Yetişkin",
  children: "Çocuk",
  infants: "Bebek",
  pets: "Evcil hayvan",
  skipperName: "Kaptan adı",
  usageProfile: "Kullanım profili",
  mooring: "Çoğunlukla marina mı demir mi?",
  m_marina: "Marina",
  m_mixed: "Karma",
  m_anchor: "Demirde",
  mealsAboard: "Teknede yemek (adet)",
  breakfasts: "Kahvaltı",
  lunches: "Öğle",
  dinners: "Akşam",
  snacksQ: "Atıştırmalık olsun",
  shopAccess: "Rotada market",
  sa_easy: "Kolay",
  sa_limited: "Sınırlı",
  sa_none: "Yok",
  watermaker: "Watermaker",
  refrigerator: "Buzdolabı",
  freezer: "Dondurucu",
  climate: "Beklenen iklim",
  c_cool: "Serin",
  c_moderate: "Ilıman",
  c_hot: "Sıcak",
  styleLabel: "İkmal tarzı",
  st_essential: "Temel",
  st_balanced: "Dengeli",
  st_comfortable: "Konforlu",
  allergies: "Alerjiler (belirgin gösterilir)",
  allergyWarn: "ALERJİ NOTU",
  createTrip: "Seferi oluştur & planla",
  preDeparture: "Yola çıkış kontrolü",
  returnCheck: "Dönüş & kapatma",
  checkIn: "Charter check-in",
  checkOut: "Charter check-out",
  provisioning: "İkmal",
  tripSummary: "Sefer özeti",
  planning: "Planlanıyor",
  active: "Aktif",
  completedTrip: "Tamamlandı",
  deleteTrip: "Seferi sil",
  deleteTripConfirm: "Bu sefer ve yerel verileri silinsin mi?",
  boatMissing: "Bu sefer için henüz tekne seçilmedi.",
  chooseBoatFirst: "Kontrol listeleri için önce tekne seç.",
  provEstimateNote:
    "Miktarlar düzenlenebilir planlama tahminleridir, garanti değildir. Ayarlamak için satıra, gerekçe için ⓘ simgesine dokun.",
  toBuy: "Alınacak",
  onboardLabel: "Gemide",
  purchased: "Alındı",
  packed: "Yerleşti",
  skipped: "Atlandı",
  addItem: "Kalem ekle",
  itemName: "Kalem adı",
  quantity: "Miktar",
  unit: "Birim",
  deleteItemConfirm: "Bu kalem silinsin mi?",
  shareList: "Listeyi paylaş",
  whyThis: "Bu miktar neden?",
  reserve: "rezerv",
  people: "kişi",
  days: "gün",
  meals: "öğün",
  allDone: "Tüm alışveriş tamam!",
  cat_drinking_water: "İçme suyu",
  cat_beverages: "İçecekler",
  cat_breakfast: "Kahvaltı",
  cat_lunch: "Öğle yemeği",
  cat_dinner: "Akşam yemeği",
  cat_snacks: "Atıştırmalık",
  cat_fruit_veg: "Meyve & sebze",
  cat_pantry: "Kiler",
  cat_condiments: "Baharat & sos",
  cat_coffee_tea: "Kahve & çay",
  cat_children: "Çocuk",
  cat_hygiene: "Hijyen",
  cat_cleaning: "Temizlik",
  cat_paper: "Kağıt ürünleri",
  cat_waste_storage: "Çöp & saklama",
  cat_medical_comfort: "Sağlık & konfor",
  cat_ice: "Buz",
  cat_emergency_reserve: "Acil rezerv",
  cat_pet: "Evcil hayvan",
  myBoats: "Teknelerim",
  charterBoatsUsed: "Kullanılan kiralık tekneler",
  addBoat: "Tekne ekle",
  templatesLib: "Kontrol listesi şablonları",
  legacyChecklists: "Klasik kontrol listeleri",
  language: "Dil",
  about: "Hakkında",
  cancel: "Vazgeç",
  save: "Kaydet",
  next: "İleri",
  back: "Geri",
};

const de: TripStrings = {
  ...en,
  tabHome: "Start", tabTrips: "Törns", tabBoats: "Boote", tabLibrary: "Bibliothek", tabProfile: "Profil",
  noTripYet: "Noch kein Törn. Plane deine nächste Fahrt.",
  startTrip: "Törn starten",
  inspectCharter: "Charterboot inspizieren",
  prepareOwnBoat: "Mein Boot vorbereiten",
  resumeDraft: "Entwurf fortsetzen",
  nextStep: "Nächster Schritt",
  criticalOpen: "kritische Punkte offen",
  shoppingProgress: "Einkauf",
  na_start_check_in: "Charter-Check-in starten",
  na_start_pre_departure: "Auslauf-Check starten",
  na_continue_pre_departure: "Auslauf-Check fortsetzen",
  na_generate_provisions: "Proviantliste erstellen",
  na_continue_shopping: "Einkauf fortsetzen",
  na_review_critical_issues: "Offene kritische Punkte prüfen",
  na_start_return_check: "Rückkehr-Checkliste starten",
  na_continue_return_check: "Rückkehr-Checkliste fortsetzen",
  na_trip_complete: "Vorbereitung komplett — gute Fahrt!",
  newTrip: "Neuer Törn",
  whichBoat: "Welches Boot wirst du nutzen?",
  ownBoat: "Mein eigenes Boot",
  charterBoat: "Ein Charterboot",
  decideLater: "Später hinzufügen/wählen",
  tripName: "Törn-Name",
  tripDates: "Daten",
  dateHint: "JJJJ-MM-TT",
  departure: "Starthafen",
  destination: "Ziel / Route",
  tripType: "Törn-Typ",
  tt_short_day_trip: "Kurzer Tagestörn",
  tt_full_day_trip: "Ganztages-Törn",
  tt_weekend: "Wochenende",
  tt_multi_day_coastal: "Mehrtägig küstennah",
  tt_offshore_passage: "Offshore-Passage",
  nights: "Nächte an Bord",
  crew: "Crew",
  adults: "Erwachsene",
  children: "Kinder",
  infants: "Kleinkinder",
  pets: "Haustiere",
  skipperName: "Skipper-Name",
  usageProfile: "Nutzungsprofil",
  mooring: "Meist Marina oder Ankern?",
  m_marina: "Marina",
  m_mixed: "Gemischt",
  m_anchor: "Ankern",
  mealsAboard: "Mahlzeiten an Bord (Anzahl)",
  breakfasts: "Frühstücke",
  lunches: "Mittagessen",
  dinners: "Abendessen",
  snacksQ: "Snacks an Bord",
  shopAccess: "Einkaufsmöglichkeiten unterwegs",
  sa_easy: "Einfach",
  sa_limited: "Begrenzt",
  sa_none: "Keine",
  watermaker: "Watermaker",
  refrigerator: "Kühlschrank",
  freezer: "Gefrierfach",
  climate: "Erwartetes Klima",
  c_cool: "Kühl",
  c_moderate: "Gemäßigt",
  c_hot: "Heiß",
  styleLabel: "Proviant-Stil",
  st_essential: "Essenziell",
  st_balanced: "Ausgewogen",
  st_comfortable: "Komfortabel",
  allergies: "Allergien (deutlich angezeigt)",
  allergyWarn: "ALLERGIE-HINWEIS",
  createTrip: "Törn erstellen & planen",
  preDeparture: "Auslauf-Check",
  returnCheck: "Rückkehr & Sichern",
  checkIn: "Charter-Check-in",
  checkOut: "Charter-Check-out",
  provisioning: "Proviant",
  tripSummary: "Törn-Zusammenfassung",
  planning: "In Planung",
  active: "Aktiv",
  completedTrip: "Abgeschlossen",
  deleteTrip: "Törn löschen",
  deleteTripConfirm: "Diesen Törn und lokale Daten löschen?",
  boatMissing: "Für diesen Törn ist noch kein Boot gewählt.",
  chooseBoatFirst: "Wähle zuerst ein Boot für Checklisten.",
  provEstimateNote:
    "Mengen sind editierbare Planungswerte, keine Garantien. Zeile antippen zum Anpassen; ⓘ zeigt die Begründung.",
  toBuy: "Zu kaufen",
  onboardLabel: "An Bord",
  purchased: "Gekauft",
  packed: "Verstaut",
  skipped: "Übersprungen",
  addItem: "Artikel hinzufügen",
  itemName: "Artikelname",
  quantity: "Menge",
  unit: "Einheit",
  deleteItemConfirm: "Diesen Artikel löschen?",
  shareList: "Liste teilen",
  whyThis: "Warum diese Menge?",
  reserve: "Reserve",
  people: "Personen",
  days: "Tage",
  meals: "Mahlzeiten",
  allDone: "Einkauf komplett!",
  cat_drinking_water: "Trinkwasser",
  cat_beverages: "Getränke",
  cat_breakfast: "Frühstück",
  cat_lunch: "Mittagessen",
  cat_dinner: "Abendessen",
  cat_snacks: "Snacks",
  cat_fruit_veg: "Obst & Gemüse",
  cat_pantry: "Vorräte",
  cat_condiments: "Gewürze & Saucen",
  cat_coffee_tea: "Kaffee & Tee",
  cat_children: "Kinder",
  cat_hygiene: "Hygiene",
  cat_cleaning: "Reinigung",
  cat_paper: "Papierprodukte",
  cat_waste_storage: "Müll & Aufbewahrung",
  cat_medical_comfort: "Medizin & Komfort",
  cat_ice: "Eis",
  cat_emergency_reserve: "Notreserve",
  cat_pet: "Haustierbedarf",
  myBoats: "Meine Boote",
  charterBoatsUsed: "Genutzte Charterboote",
  addBoat: "Boot hinzufügen",
  templatesLib: "Checklisten-Vorlagen",
  legacyChecklists: "Klassische Checklisten",
  language: "Sprache",
  about: "Über",
  cancel: "Abbrechen",
  save: "Speichern",
  next: "Weiter",
  back: "Zurück",
};

const ru: TripStrings = {
  ...en,
  tabHome: "Главная", tabTrips: "Походы", tabBoats: "Лодки", tabLibrary: "Библиотека", tabProfile: "Профиль",
  noTripYet: "Походов пока нет. Спланируйте следующий выход.",
  startTrip: "Начать поход",
  inspectCharter: "Осмотреть чартерную лодку",
  prepareOwnBoat: "Подготовить свою лодку",
  resumeDraft: "Продолжить черновик",
  nextStep: "Следующий шаг",
  criticalOpen: "критичных пунктов не решено",
  shoppingProgress: "Закупка",
  na_start_check_in: "Начать чек-ин чартера",
  na_start_pre_departure: "Начать предвыходную проверку",
  na_continue_pre_departure: "Продолжить предвыходную проверку",
  na_generate_provisions: "Создать список провизии",
  na_continue_shopping: "Продолжить закупку",
  na_review_critical_issues: "Проверить критичные пункты",
  na_start_return_check: "Начать чек-лист возвращения",
  na_continue_return_check: "Продолжить чек-лист возвращения",
  na_trip_complete: "Подготовка завершена — попутного ветра!",
  newTrip: "Новый поход",
  whichBoat: "Какую лодку будете использовать?",
  ownBoat: "Своя лодка",
  charterBoat: "Чартерная лодка",
  decideLater: "Добавить/выбрать позже",
  tripName: "Название похода",
  tripDates: "Даты",
  dateHint: "ГГГГ-ММ-ДД",
  departure: "Порт отправления",
  destination: "Назначение / маршрут",
  tripType: "Тип похода",
  tt_short_day_trip: "Короткий дневной",
  tt_full_day_trip: "Полный день",
  tt_weekend: "Выходные",
  tt_multi_day_coastal: "Многодневный прибрежный",
  tt_offshore_passage: "Морской переход",
  nights: "Ночей на борту",
  crew: "Экипаж",
  adults: "Взрослые",
  children: "Дети",
  infants: "Младенцы",
  pets: "Питомцы",
  skipperName: "Имя шкипера",
  usageProfile: "Профиль использования",
  mooring: "В основном марина или якорь?",
  m_marina: "Марина",
  m_mixed: "Смешанно",
  m_anchor: "Якорь",
  mealsAboard: "Приёмы пищи на борту (кол-во)",
  breakfasts: "Завтраки",
  lunches: "Обеды",
  dinners: "Ужины",
  snacksQ: "Снеки на борту",
  shopAccess: "Магазины по маршруту",
  sa_easy: "Легко",
  sa_limited: "Ограниченно",
  sa_none: "Нет",
  watermaker: "Опреснитель",
  refrigerator: "Холодильник",
  freezer: "Морозилка",
  climate: "Ожидаемый климат",
  c_cool: "Прохладно",
  c_moderate: "Умеренно",
  c_hot: "Жарко",
  styleLabel: "Стиль провизии",
  st_essential: "Минимальный",
  st_balanced: "Сбалансированный",
  st_comfortable: "Комфортный",
  allergies: "Аллергии (показываются заметно)",
  allergyWarn: "АЛЛЕРГИЯ",
  createTrip: "Создать поход и план",
  preDeparture: "Предвыходная проверка",
  returnCheck: "Возвращение и консервация",
  checkIn: "Чек-ин чартера",
  checkOut: "Чек-аут чартера",
  provisioning: "Провизия",
  tripSummary: "Итог похода",
  planning: "Планируется",
  active: "Активен",
  completedTrip: "Завершён",
  deleteTrip: "Удалить поход",
  deleteTripConfirm: "Удалить поход и локальные данные?",
  boatMissing: "Для похода ещё не выбрана лодка.",
  chooseBoatFirst: "Сначала выберите лодку.",
  provEstimateNote:
    "Количества — редактируемые оценки для планирования, не гарантии. Нажмите строку для изменения; ⓘ — объяснение.",
  toBuy: "Купить",
  onboardLabel: "На борту",
  purchased: "Куплено",
  packed: "Уложено",
  skipped: "Пропущено",
  addItem: "Добавить позицию",
  itemName: "Название",
  quantity: "Количество",
  unit: "Ед.",
  deleteItemConfirm: "Удалить позицию?",
  shareList: "Поделиться списком",
  whyThis: "Почему столько?",
  reserve: "резерв",
  people: "чел.",
  days: "дней",
  meals: "приёмов",
  allDone: "Все покупки сделаны!",
  cat_drinking_water: "Питьевая вода",
  cat_beverages: "Напитки",
  cat_breakfast: "Завтрак",
  cat_lunch: "Обед",
  cat_dinner: "Ужин",
  cat_snacks: "Снеки",
  cat_fruit_veg: "Фрукты и овощи",
  cat_pantry: "Базовые продукты",
  cat_condiments: "Специи и соусы",
  cat_coffee_tea: "Кофе и чай",
  cat_children: "Детям",
  cat_hygiene: "Гигиена",
  cat_cleaning: "Уборка",
  cat_paper: "Бумажные изделия",
  cat_waste_storage: "Мусор и хранение",
  cat_medical_comfort: "Аптечка и комфорт",
  cat_ice: "Лёд",
  cat_emergency_reserve: "Аварийный запас",
  cat_pet: "Для питомцев",
  myBoats: "Мои лодки",
  charterBoatsUsed: "Чартерные лодки",
  addBoat: "Добавить лодку",
  templatesLib: "Шаблоны чек-листов",
  legacyChecklists: "Классические чек-листы",
  language: "Язык",
  about: "О приложении",
  cancel: "Отмена",
  save: "Сохранить",
  next: "Далее",
  back: "Назад",
};

const es: TripStrings = {
  ...en,
  tabHome: "Inicio", tabTrips: "Travesías", tabBoats: "Barcos", tabLibrary: "Biblioteca", tabProfile: "Perfil",
  noTripYet: "Aún no hay travesías. Planifica tu próxima salida.",
  startTrip: "Iniciar travesía",
  inspectCharter: "Inspeccionar barco de chárter",
  prepareOwnBoat: "Preparar mi barco",
  resumeDraft: "Continuar borrador",
  nextStep: "Siguiente paso",
  criticalOpen: "puntos críticos sin resolver",
  shoppingProgress: "Compra",
  na_start_check_in: "Iniciar el check-in del chárter",
  na_start_pre_departure: "Iniciar la revisión previa a zarpar",
  na_continue_pre_departure: "Continuar la revisión previa",
  na_generate_provisions: "Generar la lista de provisiones",
  na_continue_shopping: "Continuar la compra",
  na_review_critical_issues: "Revisar puntos críticos pendientes",
  na_start_return_check: "Iniciar la lista de regreso",
  na_continue_return_check: "Continuar la lista de regreso",
  na_trip_complete: "Preparación completa — ¡buen viento!",
  newTrip: "Nueva travesía",
  whichBoat: "¿Qué barco usarás?",
  ownBoat: "Mi propio barco",
  charterBoat: "Un barco de chárter",
  decideLater: "Añadir o elegir después",
  tripName: "Nombre de la travesía",
  tripDates: "Fechas",
  dateHint: "AAAA-MM-DD",
  departure: "Puerto de salida",
  destination: "Destino / ruta",
  tripType: "Tipo de travesía",
  tt_short_day_trip: "Salida corta de día",
  tt_full_day_trip: "Día completo",
  tt_weekend: "Fin de semana",
  tt_multi_day_coastal: "Costera de varios días",
  tt_offshore_passage: "Travesía de altura",
  nights: "Noches a bordo",
  crew: "Tripulación",
  adults: "Adultos",
  children: "Niños",
  infants: "Bebés",
  pets: "Mascotas",
  skipperName: "Nombre del patrón",
  usageProfile: "Perfil de uso",
  mooring: "¿Sobre todo marina o fondeo?",
  m_marina: "Marina",
  m_mixed: "Mixto",
  m_anchor: "Fondeo",
  mealsAboard: "Comidas a bordo (número)",
  breakfasts: "Desayunos",
  lunches: "Almuerzos",
  dinners: "Cenas",
  snacksQ: "Aperitivos a bordo",
  shopAccess: "Tiendas durante la ruta",
  sa_easy: "Fácil",
  sa_limited: "Limitado",
  sa_none: "Ninguna",
  watermaker: "Potabilizadora",
  refrigerator: "Nevera",
  freezer: "Congelador",
  climate: "Clima esperado",
  c_cool: "Fresco",
  c_moderate: "Moderado",
  c_hot: "Caluroso",
  styleLabel: "Estilo de aprovisionamiento",
  st_essential: "Esencial",
  st_balanced: "Equilibrado",
  st_comfortable: "Confortable",
  allergies: "Alergias (se muestran de forma destacada)",
  allergyWarn: "NOTA DE ALERGIA",
  createTrip: "Crear travesía y plan",
  preDeparture: "Revisión previa a zarpar",
  returnCheck: "Regreso y cierre",
  checkIn: "Check-in del chárter",
  checkOut: "Check-out del chárter",
  provisioning: "Provisiones",
  tripSummary: "Resumen de la travesía",
  planning: "En planificación",
  active: "Activa",
  completedTrip: "Completada",
  deleteTrip: "Eliminar travesía",
  deleteTripConfirm: "¿Eliminar esta travesía y sus datos locales?",
  boatMissing: "Aún no hay barco para esta travesía.",
  chooseBoatFirst: "Elige un barco para las listas.",
  provEstimateNote:
    "Las cantidades son estimaciones editables, no garantías. Toca una fila para ajustar; ⓘ muestra el razonamiento.",
  toBuy: "Comprar",
  onboardLabel: "A bordo",
  purchased: "Comprado",
  packed: "Estibado",
  skipped: "Omitido",
  addItem: "Añadir artículo",
  itemName: "Nombre del artículo",
  quantity: "Cantidad",
  unit: "Unidad",
  deleteItemConfirm: "¿Eliminar este artículo?",
  shareList: "Compartir lista",
  whyThis: "¿Por qué esta cantidad?",
  reserve: "reserva",
  people: "personas",
  days: "días",
  meals: "comidas",
  allDone: "¡Compra completa!",
  cat_drinking_water: "Agua potable",
  cat_beverages: "Bebidas",
  cat_breakfast: "Desayuno",
  cat_lunch: "Almuerzo",
  cat_dinner: "Cena",
  cat_snacks: "Aperitivos",
  cat_fruit_veg: "Fruta y verdura",
  cat_pantry: "Despensa",
  cat_condiments: "Condimentos y especias",
  cat_coffee_tea: "Café y té",
  cat_children: "Niños",
  cat_hygiene: "Higiene",
  cat_cleaning: "Limpieza",
  cat_paper: "Productos de papel",
  cat_waste_storage: "Basura y almacenaje",
  cat_medical_comfort: "Botiquín y confort",
  cat_ice: "Hielo",
  cat_emergency_reserve: "Reserva de emergencia",
  cat_pet: "Mascotas",
  myBoats: "Mis barcos",
  charterBoatsUsed: "Barcos de chárter usados",
  addBoat: "Añadir barco",
  templatesLib: "Plantillas de listas",
  legacyChecklists: "Listas clásicas",
  language: "Idioma",
  about: "Acerca de",
  cancel: "Cancelar",
  save: "Guardar",
  next: "Siguiente",
  back: "Atrás",
};

export const TRIP_STRINGS: Record<Locale, TripStrings> = { en, tr, de, ru, es };
