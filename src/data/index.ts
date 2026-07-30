import type { Locale } from "../i18n/strings";
import type { GuideContent, Vessel } from "./types";
import { GUIDE as GUIDE_TR, VESSELS as VESSELS_TR } from "./checklists";
import { GUIDE as GUIDE_EN, VESSELS as VESSELS_EN } from "./checklists.en";
import { GUIDE as GUIDE_DE, VESSELS as VESSELS_DE } from "./checklists.de";
import { GUIDE as GUIDE_RU, VESSELS as VESSELS_RU } from "./checklists.ru";

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
