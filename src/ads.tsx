import React, { useSyncExternalStore } from "react";
import { Platform, View } from "react-native";
import { premiumStore } from "./premiumState";

// ---------------------------------------------------------------------------
// AdMob entegrasyonu.
//
// ÖNEMLİ — YAYINA ALMADAN ÖNCE:
// 1. https://admob.google.com adresinden hesap açıp uygulamayı kaydedin.
// 2. app.json içindeki androidAppId / iosAppId değerlerini kendi AdMob
//    Uygulama Kimliklerinizle değiştirin (şu an Google'ın TEST kimlikleri).
// 3. Aşağıdaki PROD_BANNER / PROD_INTERSTITIAL kimliklerini kendi reklam
//    birimi kimliklerinizle değiştirin.
//
// Geliştirme sırasında (__DEV__) her zaman Google test reklamları gösterilir;
// gerçek kimliklerle test reklamı göstermek hesabınızın kapanmasına yol açar.
//
// Not: Reklam modülü yerel (native) kod içerdiğinden Expo Go'da çalışmaz;
// "npx expo run:android|ios" veya EAS build gerekir. Modül yoksa uygulama
// reklamsız çalışmaya devam eder.
// ---------------------------------------------------------------------------

const PROD_BANNER = Platform.select({
  ios: "ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY", // TODO: kendi iOS banner kimliğiniz
  android: "ca-app-pub-XXXXXXXXXXXXXXXX/ZZZZZZZZZZ", // TODO: kendi Android banner kimliğiniz
  default: "",
})!;

const PROD_INTERSTITIAL = Platform.select({
  ios: "ca-app-pub-XXXXXXXXXXXXXXXX/IIIIIIIIII", // TODO
  android: "ca-app-pub-XXXXXXXXXXXXXXXX/JJJJJJJJ", // TODO
  default: "",
})!;

type AdsModule = typeof import("react-native-google-mobile-ads");

let ads: AdsModule | null = null;
try {
  // Expo Go / web ortamında yerel modül bulunmaz; uygulama reklamsız sürer.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  ads = require("react-native-google-mobile-ads");
} catch {
  ads = null;
}

export function initAds(): void {
  if (!ads) return;
  ads.default().initialize().catch(() => {});
}

export function bannerUnitId(): string {
  if (!ads) return "";
  return __DEV__ ? ads.TestIds.ADAPTIVE_BANNER : PROD_BANNER;
}

/** Ekran altına yerleşen uyarlanabilir banner. Premium'da veya modül yoksa hiç yer kaplamaz. */
export function AdBanner(): React.ReactElement | null {
  const isPremium = useSyncExternalStore(
    premiumStore.subscribe,
    premiumStore.get,
    premiumStore.get
  );
  if (!ads || isPremium) return null;
  const { BannerAd, BannerAdSize } = ads;
  return (
    <View style={{ alignItems: "center" }}>
      <BannerAd unitId={bannerUnitId()} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />
    </View>
  );
}

/**
 * Geçiş reklamı: kontrol listesi tamamlandığında gösterilir.
 * Modül yoksa veya reklam yüklenemezse sessizce devam eder.
 */
export function showInterstitial(): void {
  if (!ads || premiumStore.get()) return;
  const { InterstitialAd, AdEventType, TestIds } = ads;
  const unitId = __DEV__ ? TestIds.INTERSTITIAL : PROD_INTERSTITIAL;
  const interstitial = InterstitialAd.createForAdRequest(unitId);
  const unsubscribe = interstitial.addAdEventListener(AdEventType.LOADED, () => {
    interstitial.show().catch(() => {});
    unsubscribe();
  });
  interstitial.load();
}
