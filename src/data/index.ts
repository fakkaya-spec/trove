import type { Locale } from "../i18n/strings";
import type { GuideContent, Vessel } from "./types";
import { GUIDE as GUIDE_TR, VESSELS as VESSELS_TR } from "./checklists";
import { GUIDE as GUIDE_EN, VESSELS as VESSELS_EN } from "./checklists.en";
// GEÇİCİ: DE/RU çevirileri hazırlanana kadar İngilizce'ye düşer (bir sonraki commit'te gerçek dosyalar gelecek).
const VESSELS_DE = VESSELS_EN;
const VESSELS_RU = VESSELS_EN;
const GUIDE_DE = GUIDE_EN;
const GUIDE_RU = GUIDE_EN;

export { totalItems } from "./checklists";

const VESSELS_BY_LOCALE: Record<Locale, Vessel[]> = {
  tr: VESSELS_TR,
  en: VESSELS_EN,
  de: VESSELS_DE,
  ru: VESSELS_RU,
};

const GUIDE_BY_LOCALE: Record<Locale, GuideContent> = {
  tr: GUIDE_TR,
  en: GUIDE_EN,
  de: GUIDE_DE,
  ru: GUIDE_RU,
};

export function getVessels(locale: Locale): Vessel[] {
  return VESSELS_BY_LOCALE[locale] ?? VESSELS_EN;
}

export function getVessel(locale: Locale, id: string): Vessel | undefined {
  return getVessels(locale).find((v) => v.id === id);
}

export function getGuide(locale: Locale): GuideContent {
  return GUIDE_BY_LOCALE[locale] ?? GUIDE_EN;
}
