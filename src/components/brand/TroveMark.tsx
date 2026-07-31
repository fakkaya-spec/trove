import React from "react";
import { View } from "react-native";
import { brand } from "../../theme";

// TROVE sembolü — C0 (KİLİTLİ, yeniden tasarlanmaz).
// 48×48 birim tuvalde dört ortalanmış yatay katman; kavis/gölge/degrade yok.
// Geometri saf dikdörtgen olduğundan SVG gerekmez: View'larla gerçek vektör,
// her ölçekte keskin.
const CANVAS = 48;
const BARS = [
  { width: 20, height: 2.5 },
  { width: 30, height: 4.5 },
  { width: 40, height: 7 },
  { width: 48, height: 10.5 },
] as const;
const GAPS = [7.5, 6, 4] as const; // bar1–2, bar2–3, bar3–4
// İçerik yüksekliği 42 birim; 48'lik tuvalde dikey ortalanır (üst/alt 3'er birim).

type Props = {
  /** Tuval kenarı (px). Sembol bu karenin içine ortalanır. */
  size?: number;
  color?: string;
};

export function TroveMark({ size = 48, color = brand.ink }: Props) {
  const u = size / CANVAS;
  return (
    <View
      style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}
      accessibilityElementsHidden
      importantForAccessibility="no"
    >
      {BARS.map((bar, i) => (
        <View
          key={i}
          style={{
            width: bar.width * u,
            height: bar.height * u,
            backgroundColor: color,
            marginTop: i === 0 ? 0 : GAPS[i - 1] * u,
          }}
        />
      ))}
    </View>
  );
}
