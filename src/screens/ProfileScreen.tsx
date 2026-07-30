import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, SafeAreaView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { PRODUCT_NAME, PRODUCT_POSITIONING } from "../config/product";
import { features } from "../config/features";
import { colors, fonts, spacing } from "../theme";
import { RopeDivider } from "../components/ui";
import { LOCALES, useLocale } from "../i18n";
import { TRIP_STRINGS } from "../i18n/trip";
import type { RootStackParamList } from "../navigation";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function ProfileScreen() {
  const navigation = useNavigation<Nav>();
  const { locale, setLocale, t } = useLocale();
  const s = TRIP_STRINGS[locale];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.compass}>☸</Text>
          <Text style={styles.title}>{PRODUCT_NAME}</Text>
          <Text style={styles.positioning}>{PRODUCT_POSITIONING}</Text>
        </View>

        <RopeDivider label={s.language.toUpperCase()} />
        <View style={styles.langRow}>
          {LOCALES.map((l) => (
            <Pressable
              key={l.code}
              onPress={() => setLocale(l.code)}
              accessibilityRole="button"
              accessibilityLabel={l.label}
              style={[styles.langBtn, locale === l.code && styles.langBtnActive]}
            >
              <Text style={[styles.langText, locale === l.code && styles.langTextActive]}>
                {l.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {features.legacyChecklists && (
          <>
            <RopeDivider />
            <Pressable
              onPress={() => navigation.navigate("Premium")}
              accessibilityRole="button"
              style={({ pressed }) => [styles.linkCard, pressed && { opacity: 0.8 }]}
            >
              <Text style={styles.linkText}>⭐ {t.premiumCardTitle} ›</Text>
            </Pressable>
          </>
        )}

        <RopeDivider label={s.about.toUpperCase()} />
        <Text style={styles.about}>
          {PRODUCT_NAME} v1.0 — offline-first. {"\n"}
          {s.provEstimateNote}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.night },
  scroll: { padding: spacing.m, paddingBottom: spacing.xl },
  header: { alignItems: "center", marginVertical: spacing.l },
  compass: { fontSize: 36, color: colors.brass, marginBottom: 2 },
  title: { fontFamily: fonts.display, fontSize: 28, color: colors.paper, fontWeight: "700" },
  positioning: {
    fontFamily: fonts.body,
    fontStyle: "italic",
    fontSize: 13,
    color: colors.fog,
    marginTop: 6,
    textAlign: "center",
  },
  langRow: { flexDirection: "row", justifyContent: "center", gap: 10 },
  langBtn: {
    borderWidth: 1,
    borderColor: colors.rope,
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  langBtnActive: { backgroundColor: colors.brass, borderColor: colors.brass },
  langText: { fontFamily: fonts.mono, fontSize: 13, letterSpacing: 1, color: colors.fog },
  langTextActive: { color: colors.night, fontWeight: "700" },
  linkCard: { paddingVertical: 12, alignItems: "center" },
  linkText: { fontFamily: fonts.body, fontSize: 14, color: colors.brass },
  about: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.fog,
    lineHeight: 18,
    textAlign: "center",
  },
});
