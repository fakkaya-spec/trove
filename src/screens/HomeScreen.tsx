import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  SafeAreaView,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { getVessels, totalItems } from "../data";
import type { Vessel } from "../data/types";
import { loadChecks } from "../storage";
import { colors, fonts, spacing } from "../theme";
import { BrassRing, ProgressGauge, RopeDivider } from "../components/ui";
import { AdBanner } from "../ads";
import { LOCALES, useLocale } from "../i18n";
import { usePremium } from "../premium";
import { PRODUCT_NAME } from "../config/product";
import type { RootStackParamList } from "../navigation";

type Nav = NativeStackNavigationProp<RootStackParamList, "Home">;

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { locale, setLocale, t } = useLocale();
  const { isPremium } = usePremium();
  const [progress, setProgress] = useState<Record<string, number>>({});
  const vessels = getVessels(locale);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        const entries = await Promise.all(
          vessels.map(async (v) => {
            const state = await loadChecks(v.id);
            return [v.id, Object.values(state).filter(Boolean).length] as const;
          })
        );
        if (active) setProgress(Object.fromEntries(entries));
      })();
      return () => {
        active = false;
      };
    }, [locale])
  );

  function renderCard(v: Vessel, idx: number) {
    const total = totalItems(v);
    const done = progress[v.id] ?? 0;
    return (
      <Pressable
        key={v.id}
        onPress={() => navigation.navigate("Checklist", { vesselId: v.id })}
        style={({ pressed }) => [
          styles.card,
          { transform: [{ rotate: idx % 2 === 0 ? "-0.5deg" : "0.5deg" }] },
          pressed && { opacity: 0.85 },
        ]}
      >
        <BrassRing>
          <Text style={{ fontSize: 26 }}>{v.icon}</Text>
        </BrassRing>
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle}>{v.name}</Text>
          <Text style={styles.cardSub}>
            {v.subtitle} · {total} {t.items} · {v.duration}
          </Text>
          <ProgressGauge done={done} total={total} />
        </View>
        <Text style={styles.chevron}>›</Text>
      </Pressable>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.langRow}>
          {LOCALES.map((l) => (
            <Pressable
              key={l.code}
              onPress={() => setLocale(l.code)}
              style={[styles.langBtn, locale === l.code && styles.langBtnActive]}
              hitSlop={6}
            >
              <Text
                style={[
                  styles.langText,
                  locale === l.code && styles.langTextActive,
                ]}
              >
                {l.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.header}>
          <Text style={styles.compass}>☸</Text>
          <Text style={styles.title}>{PRODUCT_NAME}</Text>
          <Text style={styles.subtitle}>{t.appSubtitle}</Text>
          <Text style={styles.tagline}>{t.tagline}</Text>
        </View>

        <RopeDivider label={t.sectionRent} />
        {vessels.filter((v) => v.group === "kiralik").map((v, idx) => renderCard(v, idx))}

        <RopeDivider label={t.sectionOwner} />
        {vessels.filter((v) => v.group === "sahip").map((v, idx) => renderCard(v, idx))}

        <RopeDivider />

        <Pressable
          onPress={() => navigation.navigate("Guide")}
          style={({ pressed }) => [styles.guideCard, pressed && { opacity: 0.85 }]}
        >
          <Text style={styles.guideIcon}>📷</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.guideTitle}>{t.guideTitle}</Text>
            <Text style={styles.guideSub}>{t.guideSub}</Text>
          </View>
          <Text style={[styles.chevron, { color: colors.brass }]}>›</Text>
        </Pressable>

        <Pressable
          onPress={() => navigation.navigate("Premium")}
          style={({ pressed }) => [styles.premiumCard, pressed && { opacity: 0.85 }]}
        >
          <Text style={styles.guideIcon}>⭐</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.guideTitle, { color: colors.brass }]}>
              {isPremium ? t.premiumActiveTitle : t.premiumCardTitle}
            </Text>
            <Text style={styles.guideSub}>
              {isPremium ? t.premiumActiveSub : t.premiumCardSub}
            </Text>
          </View>
          <Text style={[styles.chevron, { color: colors.brass }]}>›</Text>
        </Pressable>

        <Text style={styles.footer}>{t.footerHome}</Text>
      </ScrollView>
      <AdBanner />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.night },
  scroll: { padding: spacing.m, paddingBottom: spacing.xl },
  langRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: spacing.s,
  },
  langBtn: {
    borderWidth: 1,
    borderColor: colors.rope,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  langBtnActive: { backgroundColor: colors.brass, borderColor: colors.brass },
  langText: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1,
    color: colors.fog,
  },
  langTextActive: { color: colors.night, fontWeight: "700" },
  header: { alignItems: "center", marginTop: spacing.s, marginBottom: spacing.s },
  compass: { fontSize: 42, color: colors.brass, marginBottom: 4 },
  title: {
    fontFamily: fonts.display,
    fontSize: 34,
    color: colors.paper,
    fontWeight: "700",
  },
  subtitle: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 4,
    color: colors.brass,
    marginTop: 4,
    textAlign: "center",
  },
  tagline: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.fog,
    textAlign: "center",
    marginTop: spacing.s,
    lineHeight: 19,
    fontStyle: "italic",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.paper,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.brassDark,
    padding: spacing.m,
    marginBottom: spacing.m,
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  cardBody: { flex: 1, gap: 4 },
  cardTitle: { fontFamily: fonts.display, fontSize: 20, color: colors.ink, fontWeight: "700" },
  cardSub: { fontFamily: fonts.body, fontSize: 12, color: colors.inkFaded },
  chevron: { fontSize: 30, color: colors.brassDark, fontFamily: fonts.display },
  guideCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.nightDeep,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.brass,
    borderStyle: "dashed",
    padding: spacing.m,
    marginBottom: spacing.m,
  },
  premiumCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.nightDeep,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.brass,
    padding: spacing.m,
    marginBottom: spacing.m,
  },
  guideIcon: { fontSize: 28 },
  guideTitle: { fontFamily: fonts.display, fontSize: 17, color: colors.paper, fontWeight: "700" },
  guideSub: { fontFamily: fonts.body, fontSize: 12, color: colors.fog, marginTop: 2 },
  footer: {
    fontFamily: fonts.body,
    fontStyle: "italic",
    fontSize: 13,
    color: colors.fog,
    textAlign: "center",
    marginTop: spacing.s,
  },
});
