// Versiyonlu seed sistemi (seed_versions tablosu ile).
// İçerik UI'a gömülmez: maddeler mevcut 5 dilli kütüphaneden
// (src/data/checklists.*.ts) madde KİMLİĞİ ile derlenir; kimlik bulunamazsa
// sessizce bozulmak yerine hata fırlatılır.
//
// Seed birimleri:
//   tpl_checkin_sailing v1     — Sailing Yacht — Charter Check-in
//   tpl_predeparture_sailing v1— Sailing Yacht — Pre-departure
//   tpl_predeparture_motor v1  — Motor Boat — Pre-departure
//   tpl_return_own v1          — Own Boat — Return & Secure
//   tpl_checkout_charter v1    — Charter — Check-out
//   provision_rules v1         — İkmal kural motoru varsayılanları
import { and, count, eq, isNull } from "drizzle-orm";
import type { Db } from "../client";
import { newId, nowIso, stamps } from "../util";
import {
  inspectionTemplates,
  templateSections,
  templateItems,
  inventoryItems,
  provisionRules,
  seedVersions,
  users,
} from "../schema";
import type { LocalizedText, MeterKind } from "../../domain/types";
import { PROVISION_RULES_VERSION, RULE_SEEDS } from "./provisionRules";
import { VESSELS as TR } from "../../data/checklists";
import { VESSELS as EN } from "../../data/checklists.en";
import { VESSELS as DE } from "../../data/checklists.de";
import { VESSELS as RU } from "../../data/checklists.ru";
import { VESSELS as ES } from "../../data/checklists.es";
import { seedSamples } from "./samples";

// --- Kaynak içerikten 5 dilli madde derleme --------------------------------

interface SourceItem {
  title: LocalizedText;
  tip?: LocalizedText;
  critical: boolean;
  photo: boolean;
}

let lookupCache: Map<string, SourceItem> | null = null;

function buildLookup(): Map<string, SourceItem> {
  if (lookupCache) return lookupCache;
  const locales = { tr: TR, en: EN, de: DE, ru: RU, es: ES } as const;
  const map = new Map<string, SourceItem>();
  for (const [code, vessels] of Object.entries(locales)) {
    for (const vessel of vessels) {
      for (const cat of vessel.categories) {
        for (const item of cat.items) {
          let entry = map.get(item.id);
          if (!entry) {
            entry = { title: {}, critical: !!item.critical, photo: !!item.photo };
            map.set(item.id, entry);
          }
          entry.title[code] = item.text;
          if (item.tip) {
            entry.tip = entry.tip ?? {};
            entry.tip[code] = item.tip;
          }
        }
      }
    }
  }
  lookupCache = map;
  return map;
}

function resolve(id: string): SourceItem {
  const found = buildLookup().get(id);
  if (!found) throw new Error(`Seed error: source item not found: ${id}`);
  return found;
}

// --- Şablon tanım yapıları --------------------------------------------------

type SeedItem =
  | { src: string; critical?: boolean; required?: boolean }
  | { custom: LocalizedText; tip?: LocalizedText; critical?: boolean; required?: boolean };

interface SeedSection {
  icon: string;
  title: LocalizedText;
  items: SeedItem[];
}

const T = (en: string, tr: string, de: string, ru: string, es: string): LocalizedText => ({
  en, tr, de, ru, es,
});

const METER_TITLES: Record<string, LocalizedText> = {
  engine_hours: T("Engine hours", "Motor saati", "Motorstunden", "Моточасы", "Horas de motor"),
  fuel_pct: T("Fuel level", "Yakıt seviyesi", "Kraftstoffstand", "Уровень топлива", "Nivel de combustible"),
  water_pct: T("Fresh water level", "Tatlı su seviyesi", "Frischwasserstand", "Уровень пресной воды", "Nivel de agua dulce"),
  battery_v: T("Battery voltage", "Akü voltajı", "Batteriespannung", "Напряжение АКБ", "Voltaje de baterías"),
  generator_hours: T("Generator hours", "Jeneratör saati", "Generatorstunden", "Часы генератора", "Horas del generador"),
};

// --- 1) Charter Check-in (Faz 0'dan taşınan tanım) --------------------------

const CHECKIN_SECTIONS: SeedSection[] = [
  {
    icon: "🛥️",
    title: T("Exterior", "Dış Aksam", "Außenbereich", "Корпус и внешний вид", "Exterior"),
    items: [
      { src: "ye-govde-0" }, { src: "ye-govde-1" }, { src: "ye-govde-3" },
      { src: "ye-govde-5" }, { src: "ye-govde-6" }, { src: "ye-govde-8" },
      { src: "ye-demir-0", critical: true },
      { src: "ye-demir-1" }, { src: "ye-demir-2" }, { src: "ye-demir-3" },
      { src: "ye-demir-4" }, { src: "ye-demir-5" }, { src: "ye-demir-6" }, { src: "ye-demir-7" },
      { src: "ye-tender-0" }, { src: "ye-tender-1" }, { src: "ye-tender-2" },
      { src: "ye-tender-3" }, { src: "ye-tender-4" }, { src: "ye-tender-5" }, { src: "ye-tender-6" },
    ],
  },
  {
    icon: "🪢",
    title: T("Deck & Rig", "Güverte & Arma", "Deck & Rigg", "Палуба и такелаж", "Cubierta y jarcia"),
    items: [
      { src: "ye-govde-2" }, { src: "ye-govde-4" },
      { src: "ye-govde-7", critical: true },
      { src: "ye-yelken-0" }, { src: "ye-yelken-1" }, { src: "ye-yelken-2" },
      { src: "ye-yelken-3" }, { src: "ye-yelken-4" }, { src: "ye-yelken-5" },
      { src: "ye-yelken-6" }, { src: "ye-yelken-7" }, { src: "ye-yelken-8" }, { src: "ye-yelken-9" },
      { src: "ye-mutfak-7" }, { src: "ye-mutfak-8" },
    ],
  },
  {
    icon: "⚙️",
    title: T("Engine", "Motor", "Motor", "Двигатель", "Motor"),
    items: [
      { src: "ye-motor-1" }, { src: "ye-motor-2" }, { src: "ye-motor-3" },
      { src: "ye-motor-4" }, { src: "ye-motor-5" }, { src: "ye-motor-6" },
      { src: "ye-motor-8" }, { src: "ye-motor-9" }, { src: "ye-motor-10" },
      { src: "ye-motor-11" }, { src: "ye-motor-12" }, { src: "ye-motor-13" },
      { src: "ye-elektrik-1" },
    ],
  },
  {
    icon: "🧭",
    title: T("Navigation", "Navigasyon", "Navigation", "Навигация", "Navegación"),
    items: [
      { src: "ye-elektrik-2" }, { src: "ye-elektrik-3" }, { src: "ye-elektrik-4" },
      { src: "ye-elektrik-5" }, { src: "ye-elektrik-9" }, { src: "ye-elektrik-10" },
      {
        custom: T(
          "Compass readable and light working",
          "Pusula okunuyor, aydınlatması çalışıyor",
          "Kompass ablesbar, Beleuchtung funktioniert",
          "Компас читается, подсветка работает",
          "Compás legible y su luz funciona"
        ),
      },
      {
        custom: T(
          "AIS transmitting/receiving (if fitted)",
          "AIS alıp veriyor (varsa)",
          "AIS sendet/empfängt (falls vorhanden)",
          "AIS передаёт/принимает (если установлен)",
          "AIS transmite/recibe (si lo hay)"
        ),
        required: false,
      },
      {
        custom: T(
          "Radar powers up and paints targets (if fitted)",
          "Radar açılıyor ve hedef gösteriyor (varsa)",
          "Radar startet und zeigt Ziele (falls vorhanden)",
          "Радар включается и показывает цели (если есть)",
          "El radar arranca y muestra ecos (si lo hay)"
        ),
        required: false,
      },
    ],
  },
  {
    icon: "🛋️",
    title: T("Interior", "İç Mekan", "Innenraum", "Интерьер", "Interior"),
    items: [
      { src: "ye-elektrik-6" }, { src: "ye-elektrik-7" }, { src: "ye-elektrik-8" },
      { src: "ye-su-0" }, { src: "ye-su-1" }, { src: "ye-su-2" }, { src: "ye-su-3" },
      { src: "ye-su-4" }, { src: "ye-su-5" }, { src: "ye-su-6" }, { src: "ye-su-7" },
      { src: "ye-mutfak-0" }, { src: "ye-mutfak-1" }, { src: "ye-mutfak-2" },
      { src: "ye-mutfak-3" }, { src: "ye-mutfak-6" }, { src: "ye-mutfak-9" },
      {
        custom: T(
          "Air conditioning cools in every cabin (if fitted)",
          "Klima her kabinde soğutuyor (varsa)",
          "Klimaanlage kühlt in jeder Kabine (falls vorhanden)",
          "Кондиционер охлаждает каждую каюту (если есть)",
          "El aire acondicionado enfría todos los camarotes (si lo hay)"
        ),
        required: false,
      },
    ],
  },
  {
    icon: "🛟",
    title: T("Safety", "Güvenlik", "Sicherheit", "Безопасность", "Seguridad"),
    items: [
      { src: "ye-guvenlik-0" }, { src: "ye-guvenlik-1" }, { src: "ye-guvenlik-2" },
      { src: "ye-guvenlik-3" }, { src: "ye-guvenlik-4" }, { src: "ye-guvenlik-5" },
      { src: "ye-guvenlik-6" }, { src: "ye-guvenlik-7" }, { src: "ye-guvenlik-8" },
      { src: "ye-guvenlik-9" }, { src: "ye-guvenlik-10" }, { src: "ye-guvenlik-11" },
      { src: "ye-guvenlik-12" }, { src: "ye-guvenlik-13" },
    ],
  },
  {
    icon: "📜",
    title: T(
      "Documents & Handover", "Evrak & Teslim", "Papiere & Übergabe",
      "Документы и приёмка", "Documentos y entrega"
    ),
    items: [
      { src: "ye-evrak-0" }, { src: "ye-evrak-1" }, { src: "ye-evrak-2" },
      { src: "ye-evrak-3" }, { src: "ye-evrak-4" }, { src: "ye-evrak-5" },
      { src: "ye-evrak-6" }, { src: "ye-evrak-7" }, { src: "ye-evrak-8" }, { src: "ye-evrak-9" },
      { src: "ye-son-0" }, { src: "ye-son-2" }, { src: "ye-son-3" },
      { src: "ye-son-4" }, { src: "ye-son-6" }, { src: "ye-son-7" },
    ],
  },
];

// --- 2) Pre-departure (yola çıkış) — sahip içeriğinden (yc-*) ---------------

function predepartureSections(motor: boolean): SeedSection[] {
  const deckItems: SeedItem[] = motor
    ? [
        { src: "yc-guverte-2" }, { src: "yc-guverte-3" }, { src: "yc-guverte-4" },
        { src: "yc-guverte-5" }, { src: "yc-guverte-6" },
      ]
    : [
        { src: "yc-guverte-0" }, { src: "yc-guverte-1" }, { src: "yc-guverte-2" },
        { src: "yc-guverte-3" }, { src: "yc-guverte-4" }, { src: "yc-guverte-5" },
        { src: "yc-guverte-6" },
      ];
  return [
    {
      icon: "🌤️",
      title: T("Voyage & Weather", "Rota & Hava", "Törn & Wetter", "Маршрут и погода", "Ruta y meteo"),
      items: [
        { src: "yc-plan-0" }, { src: "yc-plan-1" }, { src: "yc-plan-2" },
        { src: "yc-plan-3" }, { src: "yc-plan-4" }, { src: "yc-plan-5" }, { src: "yc-plan-6" },
      ],
    },
    {
      icon: "⚙️",
      title: T("Boat Systems", "Tekne Sistemleri", "Bootssysteme", "Системы судна", "Sistemas del barco"),
      items: [
        { src: "yc-motor-0" }, { src: "yc-motor-1" }, { src: "yc-motor-2" },
        { src: "yc-motor-3" }, { src: "yc-motor-4" }, { src: "yc-motor-5" },
        { src: "yc-motor-6" }, { src: "yc-motor-7" }, { src: "yc-motor-8" },
        { src: "yc-motor-9" }, { src: "yc-motor-10" },
        { src: "yc-elektrik-0" }, { src: "yc-elektrik-1" }, { src: "yc-elektrik-2" },
        { src: "yc-elektrik-3" }, { src: "yc-elektrik-4" }, { src: "yc-elektrik-5" },
        { src: "yc-elektrik-6" },
      ],
    },
    {
      icon: "🪢",
      title: motor
        ? T("Deck", "Güverte", "Deck", "Палуба", "Cubierta")
        : T("Deck & Rig", "Güverte & Arma", "Deck & Rigg", "Палуба и такелаж", "Cubierta y jarcia"),
      items: deckItems,
    },
    {
      icon: "🛟",
      title: T("Safety", "Emniyet", "Sicherheit", "Безопасность", "Seguridad"),
      items: [
        { src: "yc-emniyet-0" }, { src: "yc-emniyet-1" }, { src: "yc-emniyet-2" },
        { src: "yc-emniyet-3" }, { src: "yc-emniyet-4" }, { src: "yc-emniyet-5" },
        { src: "yc-emniyet-6" }, { src: "yc-emniyet-7" },
      ],
    },
    {
      icon: "🗣️",
      title: T("Crew Briefing", "Mürettebat Brifingi", "Crew-Briefing", "Инструктаж экипажа", "Briefing de tripulación"),
      items: [
        { src: "yc-brifing-0" }, { src: "yc-brifing-1" }, { src: "yc-brifing-2" },
        { src: "yc-brifing-3" }, { src: "yc-brifing-4" }, { src: "yc-brifing-5" },
      ],
    },
    {
      icon: "📜",
      title: T(
        "Documents & Personal", "Evrak & Kişisel", "Papiere & Persönliches",
        "Документы и личное", "Documentos y personal"
      ),
      items: [
        { src: "yc-evrak-0" }, { src: "yc-evrak-1" }, { src: "yc-evrak-2" },
        { src: "yc-evrak-3" }, { src: "yc-evrak-4" },
        {
          custom: T(
            "Medication, sun protection, chargers and payment aboard",
            "İlaçlar, güneş koruması, şarj kabloları ve ödeme aracı teknede",
            "Medikamente, Sonnenschutz, Ladekabel und Zahlungsmittel an Bord",
            "Лекарства, защита от солнца, зарядки и средства оплаты на борту",
            "Medicinas, protección solar, cargadores y medios de pago a bordo"
          ),
        },
      ],
    },
    {
      icon: "✅",
      title: T("Just Before Leaving", "Kalkıştan Hemen Önce", "Kurz vor dem Ablegen", "Перед самым отходом", "Justo antes de zarpar"),
      items: [
        { src: "yc-son-0" }, { src: "yc-son-1" }, { src: "yc-son-2" },
        { src: "yc-son-3" }, { src: "yc-son-4" },
      ],
    },
  ];
}

// --- 3) Return & Secure (kendi teknen) — kp-* içeriğinden -------------------

const RETURN_OWN_SECTIONS: SeedSection[] = [
  {
    icon: "⚙️",
    title: T("Engine & Valves", "Motor & Vanalar", "Motor & Ventile", "Двигатель и клапаны", "Motor y válvulas"),
    items: [
      { src: "kp-motor-0" }, { src: "kp-motor-1" }, { src: "kp-motor-2" }, { src: "kp-motor-3" },
    ],
  },
  {
    icon: "🔋",
    title: T("Electrical", "Elektrik", "Elektrik", "Электрика", "Eléctrico"),
    items: [
      { src: "kp-elektrik-0" }, { src: "kp-elektrik-1" }, { src: "kp-elektrik-2" }, { src: "kp-elektrik-3" },
    ],
  },
  {
    icon: "⚓",
    title: T("Deck & Mooring", "Güverte & Bağlama", "Deck & Festmachen", "Палуба и швартовка", "Cubierta y amarre"),
    items: [
      { src: "kp-guverte-0" }, { src: "kp-guverte-1" }, { src: "kp-guverte-2" },
      { src: "kp-guverte-3" }, { src: "kp-guverte-4" }, { src: "kp-guverte-5" }, { src: "kp-guverte-6" },
    ],
  },
  {
    icon: "🔒",
    title: T("Interior & Lock-up", "İç Mekan & Kilit", "Innenraum & Abschließen", "Интерьер и закрытие", "Interior y cierre"),
    items: [
      { src: "kp-icmekan-0" }, { src: "kp-icmekan-1" }, { src: "kp-icmekan-2" },
      { src: "kp-icmekan-3" }, { src: "kp-icmekan-4" }, { src: "kp-icmekan-5" }, { src: "kp-icmekan-6" },
    ],
  },
];

// --- 4) Charter Check-out (kompakt) ----------------------------------------

const CHECKOUT_SECTIONS: SeedSection[] = [
  {
    icon: "⛽",
    title: T("Fuel & Levels", "Yakıt & Seviyeler", "Kraftstoff & Füllstände", "Топливо и уровни", "Combustible y niveles"),
    items: [
      {
        custom: T(
          "Fuel refilled according to the charter policy (take full / return full)",
          "Yakıt, sözleşme politikasına göre dolduruldu (dolu al / dolu bırak)",
          "Kraftstoff gemäß Charter-Vereinbarung aufgefüllt (voll übernehmen / voll zurück)",
          "Топливо долито согласно договору (полный бак при сдаче)",
          "Combustible repostado según la política del chárter (lleno/lleno)"
        ),
        critical: true,
      },
      {
        custom: T(
          "Final fuel, water and engine-hour readings recorded with photos",
          "Son yakıt, su ve motor saati değerleri fotoğrafla kaydedildi",
          "End-Werte für Kraftstoff, Wasser und Motorstunden mit Fotos erfasst",
          "Итоговые показания топлива, воды и моточасов записаны с фото",
          "Lecturas finales de combustible, agua y horas registradas con fotos"
        ),
        critical: true,
      },
    ],
  },
  {
    icon: "📦",
    title: T("Inventory & Condition", "Envanter & Durum", "Inventar & Zustand", "Инвентарь и состояние", "Inventario y estado"),
    items: [
      {
        custom: T(
          "Important inventory recounted against the check-in list",
          "Önemli envanter, check-in listesine göre yeniden sayıldı",
          "Wichtiges Inventar gegen die Check-in-Liste nachgezählt",
          "Основной инвентарь пересчитан по чек-ин списку",
          "Inventario importante recontado contra la lista de check-in"
        ),
      },
      {
        custom: T(
          "New observations noted and photographed (facts only, no conclusions)",
          "Yeni gözlemler not edildi ve fotoğraflandı (yalnız olgular, sonuç değil)",
          "Neue Beobachtungen notiert und fotografiert (nur Fakten)",
          "Новые наблюдения записаны и сфотографированы (только факты)",
          "Nuevas observaciones anotadas y fotografiadas (solo hechos)"
        ),
      },
      {
        custom: T(
          "Check-in photos available for side-by-side review",
          "Check-in fotoğrafları yan yana inceleme için hazır",
          "Check-in-Fotos für den direkten Vergleich verfügbar",
          "Фото чек-ина доступны для сравнения",
          "Fotos del check-in disponibles para comparar"
        ),
      },
      {
        custom: T(
          "Waste removed, boat left clean",
          "Çöpler çıkarıldı, tekne temiz bırakıldı",
          "Müll entsorgt, Boot sauber hinterlassen",
          "Мусор вынесен, лодка оставлена чистой",
          "Basura retirada, barco limpio"
        ),
      },
    ],
  },
  {
    icon: "🔑",
    title: T("Handover", "Teslim", "Übergabe", "Сдача", "Entrega"),
    items: [
      {
        custom: T(
          "Personal belongings removed from all cabins and lockers",
          "Kişisel eşyalar tüm kabin ve dolaplardan toplandı",
          "Persönliche Sachen aus allen Kabinen und Schränken entfernt",
          "Личные вещи забраны из всех кают и рундуков",
          "Pertenencias personales retiradas de camarotes y armarios"
        ),
      },
      {
        custom: T(
          "Keys and documents returned; check-out form copy kept",
          "Anahtarlar ve evrak teslim edildi; check-out formunun kopyası sende",
          "Schlüssel und Papiere zurückgegeben; Kopie des Check-out-Formulars behalten",
          "Ключи и документы возвращены; копия акта у вас",
          "Llaves y documentos devueltos; conserva copia del check-out"
        ),
        critical: true,
      },
    ],
  },
];

// --- Seed altyapısı ---------------------------------------------------------

function getSeedVersion(db: Db, key: string): number {
  const [row] = db.select().from(seedVersions).where(eq(seedVersions.seedKey, key)).all();
  return row?.version ?? 0;
}

function setSeedVersion(db: Db, key: string, version: number): void {
  const existing = getSeedVersion(db, key);
  if (existing === 0) {
    db.insert(seedVersions).values({ seedKey: key, version, appliedAt: nowIso() }).run();
  } else {
    db.update(seedVersions)
      .set({ version, appliedAt: nowIso() })
      .where(eq(seedVersions.seedKey, key))
      .run();
  }
}

interface TemplateSeedSpec {
  seedKey: string;
  version: number;
  kind: string;
  boatType: string;
  name: LocalizedText;
  sections: SeedSection[];
  meters: MeterKind[];
  inventory?: { name: LocalizedText; expected: number }[];
}

function seedTemplate(db: Db, spec: TemplateSeedSpec): void {
  if (getSeedVersion(db, spec.seedKey) >= spec.version) return;

  const templateId = newId();
  db.insert(inspectionTemplates)
    .values({
      id: templateId,
      orgId: null,
      boatType: spec.boatType,
      kind: spec.kind,
      nameJson: JSON.stringify(spec.name),
      version: spec.version,
      isActive: 1,
      ...stamps(),
    })
    .run();

  spec.sections.forEach((section, sIdx) => {
    const sectionId = newId();
    db.insert(templateSections)
      .values({
        id: sectionId,
        templateId,
        sort: sIdx,
        icon: section.icon,
        titleJson: JSON.stringify(section.title),
        ...stamps(),
      })
      .run();

    section.items.forEach((def, iIdx) => {
      let title: LocalizedText;
      let tip: LocalizedText | undefined;
      let critical = false;
      let photo = false;
      if ("src" in def) {
        const src = resolve(def.src);
        title = src.title;
        tip = src.tip;
        critical = def.critical ?? src.critical;
        photo = src.photo;
      } else {
        title = def.custom;
        tip = def.tip;
        critical = def.critical ?? false;
      }
      db.insert(templateItems)
        .values({
          id: newId(),
          sectionId,
          sort: iIdx,
          titleJson: JSON.stringify(title),
          tipJson: tip ? JSON.stringify(tip) : null,
          isCritical: critical ? 1 : 0,
          requiresPhotoOnIssue: photo ? 1 : 0,
          required: def.required === false ? 0 : 1,
          applicableTypes: JSON.stringify([spec.boatType]),
          inputKind: "status",
          ...stamps(),
        })
        .run();
    });

    if (sIdx === spec.sections.length - 1) {
      spec.meters.forEach((meterKind, mIdx) => {
        db.insert(templateItems)
          .values({
            id: newId(),
            sectionId,
            sort: 1000 + mIdx,
            titleJson: JSON.stringify(METER_TITLES[meterKind]),
            isCritical: 0,
            requiresPhotoOnIssue: 0,
            required: 1,
            applicableTypes: JSON.stringify([spec.boatType]),
            inputKind: "meter",
            meterKind,
            ...stamps(),
          })
          .run();
      });
    }
  });

  (spec.inventory ?? []).forEach((inv, idx) => {
    db.insert(inventoryItems)
      .values({
        id: newId(),
        templateId,
        sort: idx,
        nameJson: JSON.stringify(inv.name),
        expectedCount: inv.expected,
        ...stamps(),
      })
      .run();
  });

  setSeedVersion(db, spec.seedKey, spec.version);
}

const CHECKIN_INVENTORY = [
  { name: T("Life jackets", "Can yeleği", "Rettungswesten", "Спасательные жилеты", "Chalecos salvavidas"), expected: 8 },
  { name: T("Fenders", "Usturmaça", "Fender", "Кранцы", "Defensas"), expected: 6 },
  { name: T("Dock lines", "Bağlama halatı", "Festmacherleinen", "Швартовы", "Amarras"), expected: 6 },
  { name: T("Winch handles", "Vinç kolu", "Winschkurbeln", "Ручки лебёдок", "Manivelas de winche"), expected: 2 },
  { name: T("Bed linen sets", "Nevresim seti", "Bettwäsche-Sets", "Комплекты белья", "Juegos de sábanas"), expected: 8 },
  { name: T("Towels", "Havlu", "Handtücher", "Полотенца", "Toallas"), expected: 8 },
  { name: T("Snorkel sets", "Şnorkel seti", "Schnorchel-Sets", "Наборы для снорклинга", "Equipos de esnórquel"), expected: 4 },
  { name: T("Outboard fuel tank", "Tender yakıt tankı", "Außenborder-Tank", "Бак подвесного мотора", "Depósito del fueraborda"), expected: 1 },
  { name: T("Outboard key/kill cord", "Dıştan takma anahtarı/kill cord", "Außenborder-Schlüssel/Notstopp", "Ключ/чека мотора", "Llave/cordón del fueraborda"), expected: 1 },
];

function seedProvisionRulesUnit(db: Db): void {
  if (getSeedVersion(db, "provision_rules") >= PROVISION_RULES_VERSION) return;
  RULE_SEEDS.forEach((r, idx) => {
    db.insert(provisionRules)
      .values({
        id: newId(),
        ruleKey: r.ruleKey,
        category: r.category,
        nameJson: JSON.stringify(r.name),
        unit: r.unit,
        mode: r.mode,
        baseQty: r.baseQty,
        adultFactor: r.adultFactor ?? 1,
        childFactor: r.childFactor ?? 0.6,
        meal: r.meal ?? null,
        hotClimateFactor: r.hotClimateFactor ?? 1,
        anchorFactor: r.anchorFactor ?? 1,
        styleFactorsJson: JSON.stringify(
          r.styleFactors ?? { essential: 1, balanced: 1, comfortable: 1 }
        ),
        reservePct: r.reservePct ?? 0,
        minQty: r.minQty ?? 0,
        roundTo: r.roundTo ?? 1,
        requiresJson: JSON.stringify(r.requires ?? {}),
        sort: idx,
        active: 1,
        version: PROVISION_RULES_VERSION,
        ...stamps(),
      })
      .run();
  });
  setSeedVersion(db, "provision_rules", PROVISION_RULES_VERSION);
}

export function seedIfNeeded(db: Db): void {
  // Faz 0'dan kalan check-in şablonunu seed_versions'a "evlat edin":
  // şablon zaten varsa yeniden oluşturma, yalnızca sürüm kaydı düş.
  if (getSeedVersion(db, "tpl_checkin_sailing") === 0) {
    const [existing] = db
      .select({ n: count() })
      .from(inspectionTemplates)
      .where(
        and(
          isNull(inspectionTemplates.orgId),
          eq(inspectionTemplates.boatType, "sailing"),
          eq(inspectionTemplates.kind, "charter_check_in"),
          isNull(inspectionTemplates.deletedAt)
        )
      )
      .all();
    if ((existing?.n ?? 0) > 0) setSeedVersion(db, "tpl_checkin_sailing", 1);
  }

  seedTemplate(db, {
    seedKey: "tpl_checkin_sailing",
    version: 1,
    kind: "charter_check_in",
    boatType: "sailing",
    name: T(
      "Sailing Yacht — Charter Check-in",
      "Yelkenli — Kiralama Check-in",
      "Segelyacht — Charter-Check-in",
      "Парусная яхта — приёмка в чартер",
      "Velero — Check-in de chárter"
    ),
    sections: CHECKIN_SECTIONS,
    meters: ["engine_hours", "fuel_pct", "water_pct", "battery_v", "generator_hours"],
    inventory: CHECKIN_INVENTORY,
  });

  seedTemplate(db, {
    seedKey: "tpl_predeparture_sailing",
    version: 1,
    kind: "pre_departure",
    boatType: "sailing",
    name: T(
      "Sailing Yacht — Pre-departure",
      "Yelkenli — Yola Çıkış Kontrolü",
      "Segelyacht — Auslauf-Check",
      "Парусная яхта — перед выходом",
      "Velero — Antes de zarpar"
    ),
    sections: predepartureSections(false),
    meters: ["engine_hours", "fuel_pct", "water_pct", "battery_v"],
  });

  seedTemplate(db, {
    seedKey: "tpl_predeparture_motor",
    version: 1,
    kind: "pre_departure",
    boatType: "motor",
    name: T(
      "Motor Boat — Pre-departure",
      "Motorlu Tekne — Yola Çıkış Kontrolü",
      "Motorboot — Auslauf-Check",
      "Моторная лодка — перед выходом",
      "Barco a motor — Antes de zarpar"
    ),
    sections: predepartureSections(true),
    meters: ["engine_hours", "fuel_pct", "water_pct", "battery_v"],
  });

  seedTemplate(db, {
    seedKey: "tpl_return_own",
    version: 1,
    kind: "return_secure",
    boatType: "sailing",
    name: T(
      "Own Boat — Return & Secure",
      "Kendi Teknen — Dönüş & Kapatma",
      "Eigenes Boot — Rückkehr & Sichern",
      "Своя лодка — возвращение и консервация",
      "Barco propio — Regreso y cierre"
    ),
    sections: RETURN_OWN_SECTIONS,
    meters: ["engine_hours", "fuel_pct", "water_pct"],
  });

  seedTemplate(db, {
    seedKey: "tpl_checkout_charter",
    version: 1,
    kind: "charter_check_out",
    boatType: "sailing",
    name: T(
      "Charter — Check-out",
      "Kiralama — Check-out (İade)",
      "Charter — Check-out (Rückgabe)",
      "Чартер — чек-аут (сдача)",
      "Chárter — Check-out (devolución)"
    ),
    sections: CHECKOUT_SECTIONS,
    meters: ["engine_hours", "fuel_pct", "water_pct"],
  });

  seedProvisionRulesUnit(db);

  // Yerel tek kullanıcı (auth yok)
  const [u] = db.select({ n: count() }).from(users).all();
  if ((u?.n ?? 0) === 0) {
    db.insert(users)
      .values({ id: newId(), displayName: "Skipper", locale: "en", ...stamps() })
      .run();
  }

  // TROVE örnek verileri (Serenity/Aurora/Nomad) — şablon seed'lerinden SONRA
  // (check-in denetimi mevcut şablona bağlanır). İzolasyon: samples.ts.
  seedSamples(db);
}

export const SAILING_CHECKIN_TEMPLATE_NAME = T(
  "Sailing Yacht — Charter Check-in",
  "Yelkenli — Kiralama Check-in",
  "Segelyacht — Charter-Check-in",
  "Парусная яхта — приёмка в чартер",
  "Velero — Check-in de chárter"
);
