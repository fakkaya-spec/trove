import React, { useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { colors, fonts, spacing } from "../theme";
import { RopeDivider } from "../components/ui";
import { AdBanner } from "../ads";
import { getGuide } from "../data";
import { useLocale } from "../i18n";

export default function GuideScreen() {
  const navigation = useNavigation();
  const { locale, t } = useLocale();
  const guide = getGuide(locale);

  useEffect(() => {
    navigation.setOptions({ title: t.guideScreenTitle });
  }, [locale]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.lead}>{guide.lead}</Text>

        <RopeDivider label={t.guidePhotoHeader} />
        {guide.photoSpots.map((s, idx) => (
          <View key={idx} style={styles.card}>
            <Text style={styles.cardNo}>{String(idx + 1).padStart(2, "0")}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{s.title}</Text>
              <Text style={styles.cardWhy}>{s.why}</Text>
            </View>
          </View>
        ))}

        <RopeDivider label={t.guideRulesHeader} />
        {guide.rules.map((r, idx) => (
          <View key={idx} style={styles.rule}>
            <Text style={styles.ruleTitle}>☞ {r.title}</Text>
            <Text style={styles.ruleBody}>{r.body}</Text>
          </View>
        ))}

        <Text style={styles.footer}>{guide.footer}</Text>
      </ScrollView>
      <AdBanner />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  scroll: { padding: spacing.m, paddingBottom: spacing.xl },
  lead: {
    fontFamily: fonts.body,
    fontStyle: "italic",
    fontSize: 14,
    lineHeight: 21,
    color: colors.ink,
    marginBottom: spacing.s,
  },
  card: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.paperShade,
  },
  cardNo: {
    fontFamily: fonts.mono,
    fontSize: 16,
    color: colors.brassDark,
    fontWeight: "700",
    marginTop: 1,
  },
  cardTitle: { fontFamily: fonts.display, fontSize: 15, fontWeight: "700", color: colors.ink },
  cardWhy: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.inkFaded,
    marginTop: 3,
    lineHeight: 19,
  },
  rule: {
    backgroundColor: "rgba(176, 141, 87, 0.1)",
    borderLeftWidth: 3,
    borderLeftColor: colors.brass,
    borderRadius: 4,
    padding: spacing.m,
    marginBottom: spacing.s,
  },
  ruleTitle: { fontFamily: fonts.display, fontSize: 15, fontWeight: "700", color: colors.ink },
  ruleBody: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.ink,
    marginTop: 4,
    lineHeight: 19,
  },
  footer: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.signal,
    textAlign: "center",
    marginTop: spacing.l,
    letterSpacing: 1,
  },
});
