// Oturum-içi Premium yüzey koruması — SAF modül, React'siz, kalıcılık YOK
// (bilinçli: her uygulama açılışı temiz başlar; spec §3 "that session").
//
// PROTECT-1 (spec §3 + §7 kurucu ilkesi 5): aktif bir iş akışı sürerken
// (kontrol listesi, jurnal girişi) Premium giriş noktaları GÖRÜNMEZ.
// Akışın KENDİ kapı-açıklama yüzeyi (ör. jurnal ekranındaki kamera satırı)
// bu bayraktan muaftır — o satır kapının kendini açıklamasıdır
// (MONETIZATION UX kural 3), kesinti değil.
//
// ENTRY-2 (spec §3 "once dismissed per module"): kullanıcı bir modülün
// yükseltme sayfasını kapattıysa o modülün giriş satırı bu oturumda bir
// daha görünmez. Kapılı eylem dokunuşları (kamera) yine açıklar — kullanıcı
// isteği her zaman yanıtlanır, sessiz devre dışı düğme olmaz.

import type { UpgradeModule } from "../i18n/premium";

let activeFlows = 0;
const dismissed = new Set<UpgradeModule>();
const listeners = new Set<() => void>();

function notify(): void {
  listeners.forEach((fn) => fn());
}

/** Aktif akış başlangıcı/bitişi (iç içe akışlar için sayaç). */
export function enterActiveFlow(): void {
  activeFlows += 1;
  notify();
}

export function exitActiveFlow(): void {
  activeFlows = Math.max(0, activeFlows - 1);
  notify();
}

export function isInActiveFlow(): boolean {
  return activeFlows > 0;
}

/** Modülün yükseltme sayfası bu oturumda kapatıldı olarak işaretlenir. */
export function dismissModule(module: UpgradeModule): void {
  dismissed.add(module);
  notify();
}

export function isModuleDismissed(module: UpgradeModule): boolean {
  return dismissed.has(module);
}

/** Yalnız test için: oturum durumunu sıfırlar. */
export function __resetSessionForTests(): void {
  activeFlows = 0;
  dismissed.clear();
  notify();
}

/** Giriş satırları görünürlük değişimini dinler (foto-store deseni). */
export function subscribeSession(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
