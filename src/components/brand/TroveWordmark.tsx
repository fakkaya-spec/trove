import React from "react";
import { Image } from "react-native";
import { brand } from "../../theme";

// TROVE wordmark — KİLİTLİ: DM Sans Medium, büyük harf, 0.18em harf aralığı.
// Metin katmanı DEĞİL: scripts/generate-icons.mjs derleme zamanında DM Sans'tan
// (OFL, assets/brand/fonts/) tint edilebilir varlık üretir; burada boyanır.
const ASSET = require("../../../assets/brand/wordmark.png");
const ASPECT = 993 / 190; // üretilen master varlığın en/boy oranı

type Props = {
  /** Yazı yüksekliği (px). Genişlik orandan hesaplanır. */
  height?: number;
  color?: string;
};

export function TroveWordmark({ height = 18, color = brand.ink }: Props) {
  return (
    <Image
      source={ASSET}
      tintColor={color}
      style={{ height, width: height * ASPECT }}
      accessibilityRole="image"
      accessibilityLabel="TROVE"
    />
  );
}
