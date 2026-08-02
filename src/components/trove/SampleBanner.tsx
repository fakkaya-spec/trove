import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { T, TICON } from "../../theme";
import { LIcon } from "../LIcon";
import { useLocale } from "../../i18n";
import { TRIP_STRINGS } from "../../i18n/trip";

// Örnek içerik bandı — KİLİTLİ şart: örnek gezilirken ince bir şerit
// "örnek sefer" der ve gerçek tekne oluşturmaya çağırır.
export function SampleBanner({ onCreate }: { onCreate: () => void }) {
  const { locale } = useLocale();
  const s = TRIP_STRINGS[locale];
  return (
    <View style={styles.wrap}>
      <LIcon name="book-open" size={TICON.sm} color={T.blue} />
      <Text style={styles.text} numberOfLines={2}>
        {s.sampleBanner}
      </Text>
      <Pressable onPress={onCreate} accessibilityRole="button" hitSlop={8} style={styles.cta}>
        <Text style={styles.ctaText}>{s.sampleBannerCta}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: T.blueL,
    borderRadius: T.r2,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  text: { flex: 1, fontSize: 12, color: T.blue, lineHeight: 16 },
  cta: { minHeight: 36, justifyContent: "center" },
  ctaText: { fontSize: 12, fontWeight: "700", color: T.blue },
});
