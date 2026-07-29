import React from "react";

// Web sürümünde reklam yok: react-native-google-mobile-ads yalnızca
// iOS/Android yerel modülüdür. Metro, web derlemesinde bu dosyayı
// otomatik olarak ads.tsx yerine kullanır.

export function initAds(): void {}

export function bannerUnitId(): string {
  return "";
}

export function AdBanner(): React.ReactElement | null {
  return null;
}

export function showInterstitial(): void {}
