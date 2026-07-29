import { Platform } from "react-native";

// "Kaptanın Seyir Defteri" tasarım dili:
// koyu lacivert gece denizi, krem kâğıt, pirinç (brass) aksan, sinyal kırmızısı.
export const colors = {
  night: "#0B1D33", // ana zemin — gece denizi
  nightDeep: "#071426", // daha koyu zemin
  paper: "#F6EFDC", // krem seyir defteri kâğıdı
  paperShade: "#EAE0C5", // kâğıt gölgesi / çizgiler
  ink: "#22303F", // kâğıt üstü mürekkep
  inkFaded: "#6B6250", // solmuş mürekkep
  brass: "#C9A227", // pirinç / altın aksan
  brassDark: "#9A7B1C",
  rope: "#B08D57", // halat rengi
  signal: "#C0392B", // sinyal kırmızısı (kritik maddeler)
  seafoam: "#7FB5A8", // deniz köpüğü yeşili (tamamlandı)
  fog: "#93A5B8", // sis grisi (ikincil metin, koyu zeminde)
  line: "rgba(201, 162, 39, 0.35)",
};

// Sistem serif fontları: iOS'ta Georgia, Android'de serif ailesi.
// Ek font dosyası gerektirmez, "eski deniz haritası" havası verir.
export const fonts = {
  display: Platform.select({ ios: "Georgia", android: "serif", default: "Georgia" })!,
  body: Platform.select({ ios: "Georgia", android: "serif", default: "Georgia" })!,
  mono: Platform.select({ ios: "Courier", android: "monospace", default: "Courier" })!,
};

export const spacing = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
};
