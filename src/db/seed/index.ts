// İlk şablonun seed'i: "Sailing Yacht — Charter Check-in".
// İçerik UI'a gömülmez: maddeler mevcut 5 dilli kütüphaneden
// (src/data/checklists.*.ts) madde KİMLİĞİ ile derlenir; kimlik bulunamazsa
// sessizce bozulmak yerine hata fırlatılır (docs/PHASE0.md risk #2).
import { count, isNull, and } from "drizzle-orm";
import type { Db } from "../client";
import { newId, stamps } from "../util";
import {
  inspectionTemplates,
  templateSections,
  templateItems,
  inventoryItems,
  users,
} from "../schema";
import type { LocalizedText, MeterKind } from "../../domain/types";
import { VESSELS as TR } from "../../data/checklists";
import { VESSELS as EN } from "../../data/checklists.en";
import { VESSELS as DE } from "../../data/checklists.de";
import { VESSELS as RU } from "../../data/checklists.ru";
import { VESSELS as ES } from "../../data/checklists.es";

// --- Kaynak içerikten 5 dilli madde derleme --------------------------------

interface SourceItem {
  title: LocalizedText;
  tip?: LocalizedText;
  critical: boolean;
  photo: boolean;
}

function buildLookup(): Map<string, SourceItem> {
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
  return map;
}

// --- Şablon tanımı ----------------------------------------------------------

type SeedItem =
  | { src: string; critical?: boolean; required?: boolean } // kütüphaneden, opsiyonel override
  | { custom: LocalizedText; tip?: LocalizedText; critical?: boolean; required?: boolean };

interface SeedSection {
  icon: string;
  title: LocalizedText;
  items: SeedItem[];
}

const T = (en: string, tr: string, de: string, ru: string, es: string): LocalizedText => ({
  en, tr, de, ru, es,
});

const SECTIONS: SeedSection[] = [
  {
    icon: "🛥️",
    title: T("Exterior", "Dış Aksam", "Außenbereich", "Корпус и внешний вид", "Exterior"),
    items: [
      { src: "ye-govde-0" }, { src: "ye-govde-1" }, { src: "ye-govde-3" },
      { src: "ye-govde-5" }, { src: "ye-govde-6" }, { src: "ye-govde-8" },
      { src: "ye-demir-0", critical: true }, // demir: kullanıcı kararıyla kritik listede
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
      { src: "ye-govde-7", critical: true }, // dümen: kritik (ürün kararı)
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

// Sayaçlar: ayrı panelde toplanır (input_kind='meter'); son bölüme bağlanır.
const METERS: { kind: MeterKind; title: LocalizedText; required: boolean }[] = [
  { kind: "engine_hours", required: true, title: T("Engine hours", "Motor saati", "Motorstunden", "Моточасы", "Horas de motor") },
  { kind: "fuel_pct", required: true, title: T("Fuel level", "Yakıt seviyesi", "Kraftstoffstand", "Уровень топлива", "Nivel de combustible") },
  { kind: "water_pct", required: true, title: T("Fresh water level", "Tatlı su seviyesi", "Frischwasserstand", "Уровень пресной воды", "Nivel de agua dulce") },
  { kind: "battery_v", required: true, title: T("Battery voltage", "Akü voltajı", "Batteriespannung", "Напряжение АКБ", "Voltaje de baterías") },
  { kind: "generator_hours", required: false, title: T("Generator hours", "Jeneratör saati", "Generatorstunden", "Часы генератора", "Horas del generador") },
];

const INVENTORY: { name: LocalizedText; expected: number }[] = [
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

export const SAILING_CHECKIN_TEMPLATE_NAME: LocalizedText = T(
  "Sailing Yacht — Charter Check-in",
  "Yelkenli — Kiralama Check-in",
  "Segelyacht — Charter-Check-in",
  "Парусная яхта — приёмка в чартер",
  "Velero — Check-in de chárter"
);

// --- Seed çalıştırıcı -------------------------------------------------------

export function seedIfNeeded(db: Db): void {
  const [row] = db
    .select({ n: count() })
    .from(inspectionTemplates)
    .where(and(isNull(inspectionTemplates.orgId), isNull(inspectionTemplates.deletedAt)))
    .all();
  if ((row?.n ?? 0) > 0) return;

  const lookup = buildLookup();
  const resolve = (id: string): SourceItem => {
    const found = lookup.get(id);
    if (!found) throw new Error(`Seed error: source item not found: ${id}`);
    return found;
  };

  const templateId = newId();
  db.insert(inspectionTemplates)
    .values({
      id: templateId,
      orgId: null,
      boatType: "sailing",
      nameJson: JSON.stringify(SAILING_CHECKIN_TEMPLATE_NAME),
      version: 1,
      isActive: 1,
      ...stamps(),
    })
    .run();

  SECTIONS.forEach((section, sIdx) => {
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
          applicableTypes: JSON.stringify(["sailing"]),
          inputKind: "status",
          ...stamps(),
        })
        .run();
    });

    // Sayaç maddeleri son bölüme eklenir; UI ayrı panelde gösterir.
    if (sIdx === SECTIONS.length - 1) {
      METERS.forEach((meter, mIdx) => {
        db.insert(templateItems)
          .values({
            id: newId(),
            sectionId,
            sort: 1000 + mIdx,
            titleJson: JSON.stringify(meter.title),
            isCritical: 0,
            requiresPhotoOnIssue: 0,
            required: meter.required ? 1 : 0,
            applicableTypes: JSON.stringify(["sailing"]),
            inputKind: "meter",
            meterKind: meter.kind,
            ...stamps(),
          })
          .run();
      });
    }
  });

  INVENTORY.forEach((inv, idx) => {
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

  // Yerel tek kullanıcı (auth Faz 0'da yok)
  const [u] = db.select({ n: count() }).from(users).all();
  if ((u?.n ?? 0) === 0) {
    db.insert(users)
      .values({ id: newId(), displayName: "Skipper", locale: "en", ...stamps() })
      .run();
  }
}
