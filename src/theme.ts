import { Platform } from "react-native";

// AÇIK TEMA (varsayılan) — güneşli güvertede okunabilirlik önceliklidir.
// Kontrastlar WCAG AA+ hedefiyle seçildi (text/bg 15.8:1).
// KURAL: gold (#C9A227) açık zeminde ASLA metin rengi olarak kullanılmaz;
// yalnız dolgu/vurgu alanıdır ve üzerine text (#0B1D33) yazılır.
// Metinde altın ton gerekiyorsa goldText (#7A5F0F) kullanılır.
export const colors = {
  // Zeminler
  bg: "#F6F7F9", // ekran zemini
  surface: "#FFFFFF", // kart zemini
  border: "#DDE2E8", // kart/ayraç çizgisi

  // Metin
  text: "#0B1D33", // birincil metin (navy)
  textSecondary: "#59636F", // ikincil metin
  goldText: "#7A5F0F", // altın tonlu METİN (kontrast-güvenli)

  // Marka / aksiyon
  primary: "#0B1D33", // birincil düğme dolgusu (navy)
  onPrimary: "#FFFFFF", // navy üzeri metin
  gold: "#C9A227", // vurgu DOLGUSU — üzerine daima text rengi
  onGold: "#0B1D33",

  // Durum renkleri (açık zeminde metin olarak da güvenli)
  success: "#14663F",
  warning: "#8A5200",
  danger: "#A32219",
  info: "#0B4F8A",
  // Durum zeminleri (rozet/şerit dolguları)
  successBg: "#E7F2EC",
  warningBg: "#F7EEDD",
  dangerBg: "#F9E9E7",
  infoBg: "#E8F0F8",

  // ---- ESKİ KOYU TEMA ANAHTARLARI (yalnız legacy ekranlar; bayrak kapalı) ----
  // Yeni ekranlarda KULLANMAYIN. features.legacyChecklists=false olduğu sürece
  // bu ekranlar görünmez; anahtarlar derleme uyumluluğu için korunuyor.
  night: "#0B1D33",
  nightDeep: "#071426",
  paper: "#F6EFDC",
  paperShade: "#EAE0C5",
  ink: "#22303F",
  inkFaded: "#6B6250",
  brass: "#C9A227",
  brassDark: "#9A7B1C",
  rope: "#B08D57",
  signal: "#C0392B",
  seafoam: "#7FB5A8",
  fog: "#93A5B8",
  line: "rgba(201, 162, 39, 0.35)",
};

// Arayüz sistem fontu kullanır (San Francisco / Roboto): güverte koşullarında
// en okunaklı seçenek. Serif YALNIZ marka yazısı ("BoatCheck") içindir.
export const fonts = {
  display: Platform.select({ ios: "System", android: "sans-serif", default: "System" })!,
  body: Platform.select({ ios: "System", android: "sans-serif", default: "System" })!,
  mono: Platform.select({ ios: "Courier", android: "monospace", default: "Courier" })!,
  logo: Platform.select({ ios: "Georgia", android: "serif", default: "Georgia" })!,
};

// Tipografi ölçeği: 28/600 ekran başlığı · 20/600 bölüm · 17/600 kart başlığı ·
// 15/400 gövde · 13/400 yardımcı. Gövde satır yüksekliği ≥ 1.4.
export const type = {
  h1: { fontSize: 28, fontWeight: "600" as const, color: colors.text },
  h2: { fontSize: 20, fontWeight: "600" as const, color: colors.text },
  h3: { fontSize: 17, fontWeight: "600" as const, color: colors.text },
  body: { fontSize: 15, fontWeight: "400" as const, color: colors.text, lineHeight: 21 },
  caption: { fontSize: 13, fontWeight: "400" as const, color: colors.textSecondary, lineHeight: 18 },
};

export const spacing = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
};

// Dokunma hedefleri: her etkileşim ≥48dp; kontrol listesi satırları ≥56dp.
export const touch = {
  min: 48,
  row: 56,
};

export const radius = {
  card: 12,
  control: 10,
  pill: 999,
};

// Kart: beyaz zemin + 1px çizgi (çizgi VEYA gölge — ikisi birden değil).
export const cardStyle = {
  backgroundColor: colors.surface,
  borderRadius: radius.card,
  borderWidth: 1,
  borderColor: colors.border,
  padding: spacing.m,
};
