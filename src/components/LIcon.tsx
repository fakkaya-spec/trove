import React from "react";
import { Image, type StyleProp, type ImageStyle } from "react-native";
import { T } from "../theme";

// Lucide ikonları (ISC — assets/icons/lucide-svg/LICENSE) — TROVE tasarım
// dilinin ikon seti. Derleme zamanında tint edilebilir PNG'ye çevrilir
// (scripts/generate-ui-icons.mjs). Yeni ikon: SVG'yi lucide-svg/ altına koy,
// script'i çalıştır, haritaya ekle. Eski ekranların Ionicons seti Icon.tsx'te.
const ICONS = {
  "check-circle": require("../../assets/icons/lucide-png/check-circle.png"),
  camera: require("../../assets/icons/lucide-png/camera.png"),
  "alert-triangle": require("../../assets/icons/lucide-png/alert-triangle.png"),
  "chevron-right": require("../../assets/icons/lucide-png/chevron-right.png"),
  anchor: require("../../assets/icons/lucide-png/anchor.png"),
  "arrow-left": require("../../assets/icons/lucide-png/arrow-left.png"),
  "arrow-right": require("../../assets/icons/lucide-png/arrow-right.png"),
  download: require("../../assets/icons/lucide-png/download.png"),
  check: require("../../assets/icons/lucide-png/check.png"),
  "map-pin": require("../../assets/icons/lucide-png/map-pin.png"),
  user: require("../../assets/icons/lucide-png/user.png"),
  shield: require("../../assets/icons/lucide-png/shield.png"),
  plus: require("../../assets/icons/lucide-png/plus.png"),
  "more-horizontal": require("../../assets/icons/lucide-png/more-horizontal.png"),
  users: require("../../assets/icons/lucide-png/users.png"),
  "shopping-cart": require("../../assets/icons/lucide-png/shopping-cart.png"),
  "book-open": require("../../assets/icons/lucide-png/book-open.png"),
  sailboat: require("../../assets/icons/lucide-png/sailboat.png"),
  sun: require("../../assets/icons/lucide-png/sun.png"),
  wind: require("../../assets/icons/lucide-png/wind.png"),
  droplets: require("../../assets/icons/lucide-png/droplets.png"),
  "chevron-down": require("../../assets/icons/lucide-png/chevron-down.png"),
  utensils: require("../../assets/icons/lucide-png/utensils.png"),
  star: require("../../assets/icons/lucide-png/star.png"),
  waves: require("../../assets/icons/lucide-png/waves.png"),
  "file-text": require("../../assets/icons/lucide-png/file-text.png"),
  clock: require("../../assets/icons/lucide-png/clock.png"),
  zap: require("../../assets/icons/lucide-png/zap.png"),
  calendar: require("../../assets/icons/lucide-png/calendar.png"),
  list: require("../../assets/icons/lucide-png/list.png"),
  x: require("../../assets/icons/lucide-png/x.png"),
  pencil: require("../../assets/icons/lucide-png/pencil.png"),
  "share-2": require("../../assets/icons/lucide-png/share-2.png"),
} as const;

export type LIconName = keyof typeof ICONS;

type Props = {
  name: LIconName;
  size?: number;
  color?: string;
  style?: StyleProp<ImageStyle>;
};

export function LIcon({ name, size = 15, color = T.ink1, style }: Props) {
  return (
    <Image
      source={ICONS[name]}
      tintColor={color}
      style={[{ width: size, height: size }, style]}
      accessibilityElementsHidden
      importantForAccessibility="no"
    />
  );
}
