import React from "react";
import { Image, type StyleProp, type ImageStyle } from "react-native";

// Ionicons glifleri — @expo/vector-icons SDK 57'de expo ile gelmediği ve
// package.json'a yeni bağımlılık eklenmediği için resmi Ionicons SVG'lerinden
// (MIT) derleme zamanında üretilen tint edilebilir PNG'ler kullanılır.
// Yeni ikon eklemek için: SVG'yi assets/icons/ionicons-svg/ altına koy,
// `node scripts/generate-ui-icons.mjs` çalıştır, aşağıdaki haritaya ekle.
// (Metro statik require ister; harita bu yüzden elle yazılır.)
const ICONS = {
  "home-outline": require("../../assets/icons/png/home-outline.png"),
  "compass-outline": require("../../assets/icons/png/compass-outline.png"),
  "boat-outline": require("../../assets/icons/png/boat-outline.png"),
  "library-outline": require("../../assets/icons/png/library-outline.png"),
  "person-outline": require("../../assets/icons/png/person-outline.png"),
  "navigate-outline": require("../../assets/icons/png/navigate-outline.png"),
  "clipboard-outline": require("../../assets/icons/png/clipboard-outline.png"),
  "construct-outline": require("../../assets/icons/png/construct-outline.png"),
  play: require("../../assets/icons/png/play.png"),
  "play-outline": require("../../assets/icons/png/play-outline.png"),
  "play-skip-forward-outline": require("../../assets/icons/png/play-skip-forward-outline.png"),
  "partly-sunny-outline": require("../../assets/icons/png/partly-sunny-outline.png"),
  "cart-outline": require("../../assets/icons/png/cart-outline.png"),
  "swap-horizontal-outline": require("../../assets/icons/png/swap-horizontal-outline.png"),
  "lock-closed-outline": require("../../assets/icons/png/lock-closed-outline.png"),
  "git-compare-outline": require("../../assets/icons/png/git-compare-outline.png"),
  "speedometer-outline": require("../../assets/icons/png/speedometer-outline.png"),
  "document-text-outline": require("../../assets/icons/png/document-text-outline.png"),
  "cube-outline": require("../../assets/icons/png/cube-outline.png"),
  "list-outline": require("../../assets/icons/png/list-outline.png"),
  "calendar-outline": require("../../assets/icons/png/calendar-outline.png"),
  "time-outline": require("../../assets/icons/png/time-outline.png"),
  "image-outline": require("../../assets/icons/png/image-outline.png"),
  "water-outline": require("../../assets/icons/png/water-outline.png"),
  "flag-outline": require("../../assets/icons/png/flag-outline.png"),
  "settings-outline": require("../../assets/icons/png/settings-outline.png"),
  "ellipse-outline": require("../../assets/icons/png/ellipse-outline.png"),
  checkmark: require("../../assets/icons/png/checkmark.png"),
  "checkmark-circle": require("../../assets/icons/png/checkmark-circle.png"),
  "checkmark-circle-outline": require("../../assets/icons/png/checkmark-circle-outline.png"),
  "warning-outline": require("../../assets/icons/png/warning-outline.png"),
  close: require("../../assets/icons/png/close.png"),
  "close-circle-outline": require("../../assets/icons/png/close-circle-outline.png"),
  "remove-outline": require("../../assets/icons/png/remove-outline.png"),
  "alert-circle-outline": require("../../assets/icons/png/alert-circle-outline.png"),
  "information-circle-outline": require("../../assets/icons/png/information-circle-outline.png"),
  "refresh-outline": require("../../assets/icons/png/refresh-outline.png"),
  "camera-outline": require("../../assets/icons/png/camera-outline.png"),
  "share-outline": require("../../assets/icons/png/share-outline.png"),
  "mail-outline": require("../../assets/icons/png/mail-outline.png"),
  "create-outline": require("../../assets/icons/png/create-outline.png"),
  "chevron-forward": require("../../assets/icons/png/chevron-forward.png"),
  "arrow-forward": require("../../assets/icons/png/arrow-forward.png"),
  add: require("../../assets/icons/png/add.png"),
  "trash-outline": require("../../assets/icons/png/trash-outline.png"),
} as const;

export type IconName = keyof typeof ICONS;

type Props = {
  name: IconName;
  size?: number;
  color?: string;
  style?: StyleProp<ImageStyle>;
};

export function Icon({ name, size = 24, color = "#0B1D33", style }: Props) {
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
