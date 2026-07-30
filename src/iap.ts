// react-native-iap (yerel modül) erişimi. Expo Go / eksik yerel derlemede
// modül yüklenemezse null döner; uygulama abonelik satışı olmadan çalışır.
// Web tarafı için karşılığı: iap.web.ts (Metro otomatik seçer).

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getIap(): any | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require("react-native-iap");
  } catch {
    return null;
  }
}
