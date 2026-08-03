// Trip düzeyi saf iş kuralları: süre, ilerleme, sonraki önerilen adım.
import { InspectionStatus, TripType } from "./types";

/** Gün sayısı: gece + 1; günübirlik geziler 1 gün. */
export function tripDays(tripType: TripType, nights: number): number {
  if (tripType === "short_day_trip" || tripType === "full_day_trip") return 1;
  return Math.max(nights, 0) + 1;
}

export interface TripModuleStates {
  /** null = modül henüz oluşturulmadı */
  preDeparture: InspectionStatus | null;
  provisioningPercent: number | null;
  returnCheck: InspectionStatus | null;
  checkIn: InspectionStatus | null; // yalnız charter
  checkOut: InspectionStatus | null; // yalnız charter
  openCriticalIssues: number;
}

export type NextAction =
  | "start_check_in"
  | "start_pre_departure"
  | "continue_pre_departure"
  | "generate_provisions"
  | "continue_shopping"
  | "review_critical_issues"
  | "start_return_check"
  | "continue_return_check"
  | "trip_complete";

const DONE: InspectionStatus[] = ["completed", "awaiting_signature", "locked", "synced", "archived"];

export function isDone(status: InspectionStatus | null): boolean {
  return status !== null && DONE.includes(status);
}

/**
 * Basit, öngörülebilir öneri sırası: (charter ise check-in) → yola çıkış
 * kontrolü → ikmal → kritik sorunlar → dönüş kontrolü → tamam.
 * UI bu öneriyi "sonraki adım" kartı olarak gösterir; zorlamaz.
 */
export function nextAction(states: TripModuleStates, isCharter: boolean): NextAction {
  if (isCharter && !isDone(states.checkIn)) {
    return "start_check_in";
  }
  if (!isDone(states.preDeparture)) {
    return states.preDeparture === null ? "start_pre_departure" : "continue_pre_departure";
  }
  if (states.provisioningPercent === null) return "generate_provisions";
  if (states.provisioningPercent < 100) return "continue_shopping";
  if (states.openCriticalIssues > 0) return "review_critical_issues";
  if (!isDone(states.returnCheck)) {
    return states.returnCheck === null ? "start_return_check" : "continue_return_check";
  }
  return "trip_complete";
}

// --- Underway günü (Faz 6) --------------------------------------------------

export interface TripDayInfo {
  /** 1..totalDays aralığına kıskaçlı gün */
  day: number;
  totalDays: number;
  /** Dönüş günü geçti (kıskaç öncesi gün > toplam) — sakin bilgi, alarm değil */
  overdue: boolean;
}

/**
 * "Gün X / Y" — yerel takvim günü üstünden (saat dilimi kaymaları gün
 * hesabını bozmasın diye iki yerel gece yarısının yuvarlanmış farkı).
 * startAt yok/bozuksa null: UI gün pilini gizler, sahte değer göstermez.
 */
export function tripDayOf(
  startAt: string | null,
  totalDays: number,
  todayIso: string
): TripDayInfo | null {
  if (!startAt || totalDays < 1) return null;
  const start = Date.parse(`${startAt.slice(0, 10)}T00:00:00`);
  const today = Date.parse(`${todayIso.slice(0, 10)}T00:00:00`);
  if (!Number.isFinite(start) || !Number.isFinite(today)) return null;
  const raw = Math.round((today - start) / 86400000) + 1;
  return {
    day: Math.min(Math.max(raw, 1), totalDays),
    totalDays,
    overdue: raw > totalDays,
  };
}

export interface TripProgress {
  /** 0-100: tamamlanan modül oranı */
  percent: number;
  modulesTotal: number;
  modulesDone: number;
}

export function tripProgress(states: TripModuleStates, isCharter: boolean): TripProgress {
  const parts: boolean[] = [];
  if (isCharter) parts.push(isDone(states.checkIn));
  parts.push(isDone(states.preDeparture));
  if (states.provisioningPercent !== null) parts.push(states.provisioningPercent >= 100);
  parts.push(isDone(states.returnCheck));
  const done = parts.filter(Boolean).length;
  return {
    percent: parts.length === 0 ? 0 : Math.round((done / parts.length) * 100),
    modulesTotal: parts.length,
    modulesDone: done,
  };
}

/**
 * İki YYYY-MM-DD tarihi arasındaki gece sayısı (cihaz testi F2 — takvimden
 * seçilince otomatik hesap). Geçersiz biçim veya dönüş < kalkış → null;
 * aynı gün → 0. Saf takvim aritmetiği — saat dilimi etkisi yok (UTC gün).
 */
export function nightsBetween(startISO: string, endISO: string): number | null {
  const re = /^\d{4}-\d{2}-\d{2}$/;
  if (!re.test(startISO) || !re.test(endISO)) return null;
  const start = Date.parse(`${startISO}T00:00:00Z`);
  const end = Date.parse(`${endISO}T00:00:00Z`);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return null;
  return Math.round((end - start) / 86_400_000);
}
