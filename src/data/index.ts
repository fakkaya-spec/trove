import type { Locale } from "../i18n/strings";
import type { GuideContent, Vessel } from "./types";
import { GUIDE as GUIDE_TR, VESSELS as VESSELS_TR } from "./checklists";
import { GUIDE as GUIDE_EN, VESSELS as VESSELS_EN } from "./checklists.en";
import { GUIDE as GUIDE_DE, VESSELS as VESSELS_DE } from "./checklists.de";
import { GUIDE as GUIDE_RU, VESSELS as VESSELS_RU } from "./checklists.ru";
import { GUIDE as GUIDE_ES, VESSELS as VESSELS_ES } from "./checklists.es";

export { totalItems } from "./checklists";

// hr/it/el/fr: şablon içerikleri henüz çevrilmedi — İngilizceye düşer (fallback).
const VESSELS_BY_LOCALE: Record<Locale, Vessel[]> = {
  tr: VESSELS_TR,
  en: VESSELS_EN,
  de: VESSELS_DE,
  ru: VESSELS_RU,
  es: VESSELS_ES,
  hr: VESSELS_EN,
  it: VESSELS_EN,
  el: VESSELS_EN,
  fr: VESSELS_EN,
};

const GUIDE_BY_LOCALE: Record<Locale, GuideContent> = {
  tr: GUIDE_TR,
  en: GUIDE_EN,
  de: GUIDE_DE,
  ru: GUIDE_RU,
  es: GUIDE_ES,
  hr: GUIDE_EN,
  it: GUIDE_EN,
  el: GUIDE_EN,
  fr: GUIDE_EN,
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
