// Founder Mode metinleri (yalnız kurucu görür; en+tr).
import type { Locale } from "./strings";
import type { MetricKey } from "../domain/milestones";

export interface FounderStrings {
  title: string;
  enabledToast: string;
  disabledToast: string;
  activatedUsersLabel: string;
  activatedUsersHint: string;
  metricsHeading: string;
  alertsHeading: string;
  noAlerts: string;
  dismiss: string;
  /** {n} yer tutuculu genel eşik başlığı */
  milestoneTitle: string;
  milestoneBody: string;
  /** 100+ eşiği: para kazanma incelemesi */
  monetizationTitle: string;
  monetizationBody: string;
  dataSourceNote: string;
  m_activated_users: string;
  m_real_trips: string;
  m_completed_trips: string;
  m_provisioning_plans: string;
  m_inspections: string;
  m_check_ins: string;
  m_check_outs: string;
  m_reports: string;
  m_log_entries: string;
  m_photo_evidence: string;
  m_returning_days: string;
}

const en: FounderStrings = {
  title: "Founder",
  enabledToast: "Founder Mode enabled",
  disabledToast: "Founder Mode disabled",
  activatedUsersLabel: "Activated users",
  activatedUsersHint:
    "Entered manually from App Store / Play Console until telemetry exists. The milestone engine reads this value.",
  metricsHeading: "This device — real usage",
  alertsHeading: "Milestone alerts",
  noAlerts: "No pending milestones.",
  dismiss: "Dismiss",
  milestoneTitle: "TROVE has reached {n} activated users.",
  milestoneBody: "Milestone recorded. No product behavior changed automatically.",
  monetizationTitle: "TROVE has reached {n} activated users.",
  monetizationBody:
    "Monetization review is now due. Premium has NOT been enabled automatically. Review the Monetization Roadmap (docs/MONETIZATION.md) before enabling Premium.",
  dataSourceNote:
    "Device metrics count only real records on this device (samples excluded). Fleet-wide counts require telemetry, which does not exist yet.",
  m_activated_users: "Activated users",
  m_real_trips: "Real trips",
  m_completed_trips: "Completed trips",
  m_provisioning_plans: "Provisioning plans",
  m_inspections: "Inspections",
  m_check_ins: "Check-ins",
  m_check_outs: "Check-outs",
  m_reports: "Reports",
  m_log_entries: "Log entries",
  m_photo_evidence: "Photo evidence",
  m_returning_days: "Active days (returning use)",
};

const tr: FounderStrings = {
  title: "Kurucu",
  enabledToast: "Kurucu Modu açıldı",
  disabledToast: "Kurucu Modu kapandı",
  activatedUsersLabel: "Aktif kullanıcı",
  activatedUsersHint:
    "Telemetri olana dek App Store / Play Console'dan elle girilir. Kilometre taşı motoru bu değeri okur.",
  metricsHeading: "Bu cihaz — gerçek kullanım",
  alertsHeading: "Kilometre taşı uyarıları",
  noAlerts: "Bekleyen kilometre taşı yok.",
  dismiss: "Kapat",
  milestoneTitle: "TROVE {n} aktif kullanıcıya ulaştı.",
  milestoneBody: "Kilometre taşı kaydedildi. Hiçbir ürün davranışı otomatik değişmedi.",
  monetizationTitle: "TROVE {n} aktif kullanıcıya ulaştı.",
  monetizationBody:
    "Para kazanma incelemesi zamanı geldi. Premium OTOMATİK AÇILMADI. Premium'u açmadan önce Para Kazanma Yol Haritası'nı (docs/MONETIZATION.md) incele.",
  dataSourceNote:
    "Cihaz metrikleri yalnız bu cihazdaki gerçek kayıtları sayar (örnekler hariç). Filo geneli sayım, henüz var olmayan telemetriyi gerektirir.",
  m_activated_users: "Aktif kullanıcı",
  m_real_trips: "Gerçek sefer",
  m_completed_trips: "Tamamlanan sefer",
  m_provisioning_plans: "İkmal planı",
  m_inspections: "Denetim",
  m_check_ins: "Check-in",
  m_check_outs: "Check-out",
  m_reports: "Rapor",
  m_log_entries: "Seyir kaydı",
  m_photo_evidence: "Foto kanıtı",
  m_returning_days: "Aktif gün (geri dönen kullanım)",
};

const de: FounderStrings = { ...en };
const ru: FounderStrings = { ...en };
const es: FounderStrings = { ...en };
const hr: FounderStrings = { ...en };
const it: FounderStrings = { ...en };
const el: FounderStrings = { ...en };
const fr: FounderStrings = { ...en };

export const FOUNDER_STRINGS: Record<Locale, FounderStrings> = {
  en, tr, de, ru, es, hr, it, el, fr,
};

export function metricLabel(s: FounderStrings, key: MetricKey): string {
  return s[`m_${key}` as keyof FounderStrings];
}
