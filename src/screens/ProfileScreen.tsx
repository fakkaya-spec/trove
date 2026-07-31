import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, SafeAreaView, Linking, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { APP_VERSION, PRODUCT_NAME, PRODUCT_POSITIONING, SUPPORT_EMAIL } from "../config/product";
import { features } from "../config/features";
import { colors, fonts, spacing, radius, touch } from "../theme";
import { RopeDivider } from "../components/ui";
import { Icon } from "../components/Icon";
import { TroveMark } from "../components/brand/TroveMark";
import { TroveWordmark } from "../components/brand/TroveWordmark";
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
          <TroveMark size={44} color={colors.text} />
          <View style={styles.wordmarkWrap}>
            <TroveWordmark height={20} color={colors.text} />
          </View>
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
              <Text style={styles.linkText}>{t.premiumCardTitle}</Text>
              <Icon name="chevron-forward" size={18} color={colors.textSecondary} />
            </Pressable>
          </>
        )}

        <RopeDivider label={s.about.toUpperCase()} />
        <Pressable
          onPress={() => {
            // Yalnızca cihaz/uygulama meta verisi; denetim içeriği veya foto ASLA gönderilmez.
            const subject = encodeURIComponent(`${PRODUCT_NAME} beta feedback`);
            const body = encodeURIComponent(
              `\n\n---\n${PRODUCT_NAME} v${APP_VERSION} · ${Platform.OS} ${Platform.Version} · ${locale}`
            );
            Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`).catch(() => {});
          }}
          accessibilityRole="button"
          accessibilityLabel={s.feedbackBeta}
          style={({ pressed }) => [styles.linkCard, pressed && { opacity: 0.8 }]}
        >
          <View style={styles.linkLeft}>
            <Icon name="mail-outline" size={20} color={colors.text} />
            <Text style={styles.linkText}>{s.feedbackBeta}</Text>
          </View>
          <Icon name="chevron-forward" size={18} color={colors.textSecondary} />
        </Pressable>
        <Text style={styles.about}>
          {PRODUCT_NAME} v1.0 — offline-first. {"\n"}
          {s.provEstimateNote}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.m, paddingBottom: spacing.xl },
  header: { alignItems: "center", marginVertical: spacing.l },
  wordmarkWrap: { marginTop: spacing.s },
  positioning: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 6,
    textAlign: "center",
    lineHeight: 18,
  },
  langRow: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 10 },
  langBtn: {
    minHeight: 44,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radius.control,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  langBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  langText: { fontFamily: fonts.body, fontSize: 13, color: colors.text },
  langTextActive: { color: colors.onPrimary, fontWeight: "600" },
  linkCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: touch.min,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.card,
    paddingHorizontal: spacing.m,
    paddingVertical: 12,
  },
  linkLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  linkText: { fontFamily: fonts.body, fontSize: 15, fontWeight: "600", color: colors.text },
  about: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
    textAlign: "center",
    marginTop: spacing.m,
  },
});
