import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, SafeAreaView } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { listTemplates, TemplateListRow } from "../repositories/templates";
import { isDbReady } from "../db/state";
import { features } from "../config/features";
import { lt } from "../domain/inspection";
import { colors, fonts, spacing } from "../theme";
import { RopeDivider } from "../components/ui";
import { useLocale } from "../i18n";
import { TRIP_STRINGS } from "../i18n/trip";
import { boatTypeLabel, INSPECTION_STRINGS } from "../i18n/inspection";
import type { RootStackParamList } from "../navigation";

type Nav = NativeStackNavigationProp<RootStackParamList>;

const KIND_ICON: Record<string, string> = {
  charter_check_in: "📋",
  charter_check_out: "🔁",
  pre_departure: "🌤️",
  return_secure: "🔒",
};

export default function LibraryScreen() {
  const navigation = useNavigation<Nav>();
  const { locale, t } = useLocale();
  const s = TRIP_STRINGS[locale];
  const si = INSPECTION_STRINGS[locale];
  const [templates, setTemplates] = useState<TemplateListRow[]>([]);

  useFocusEffect(
    useCallback(() => {
      if (isDbReady()) setTemplates(listTemplates());
    }, [])
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <RopeDivider label={s.templatesLib.toUpperCase()} />
        {templates.map((tpl) => (
          <View key={tpl.id} style={styles.card}>
            <Text style={styles.cardIcon}>{KIND_ICON[tpl.kind] ?? "📋"}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{lt(tpl.name, locale)}</Text>
              <Text style={styles.cardSub}>
                {boatTypeLabel(si, tpl.boatType)} · {tpl.itemCount} ✓
              </Text>
            </View>
          </View>
        ))}

        {features.legacyChecklists && (
          <>
            <RopeDivider />
            <Pressable
              onPress={() => navigation.navigate("Checklists")}
              accessibilityRole="button"
              style={({ pressed }) => [styles.linkCard, pressed && { opacity: 0.8 }]}
            >
              <Text style={styles.linkText}>📋 {s.legacyChecklists} ›</Text>
            </Pressable>
            <Pressable
              onPress={() => navigation.navigate("Guide")}
              accessibilityRole="button"
              style={({ pressed }) => [styles.linkCard, pressed && { opacity: 0.8 }]}
            >
              <Text style={styles.linkText}>📷 {t.guideTitle} ›</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.night },
  scroll: { padding: spacing.m, paddingBottom: spacing.xl },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.nightDeep,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    padding: spacing.m,
    marginBottom: spacing.s,
  },
  cardIcon: { fontSize: 22 },
  cardTitle: { fontFamily: fonts.display, fontSize: 15, fontWeight: "700", color: colors.paper },
  cardSub: { fontFamily: fonts.body, fontSize: 12, color: colors.fog, marginTop: 2 },
  linkCard: { paddingVertical: 12, alignItems: "center" },
  linkText: { fontFamily: fonts.body, fontSize: 14, color: colors.brass },
});
