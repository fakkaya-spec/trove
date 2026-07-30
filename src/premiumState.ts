// Küçük harici durum deposu: premium bilgisini hem React bileşenleri
// (useSyncExternalStore ile) hem de bileşen dışı kod (showInterstitial)
// döngüsel import olmadan okuyabilsin diye.
let premium = false;
const listeners = new Set<() => void>();

export const premiumStore = {
  get(): boolean {
    return premium;
  },
  set(value: boolean): void {
    if (premium === value) return;
    premium = value;
    listeners.forEach((l) => l());
  },
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
