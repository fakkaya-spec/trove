import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, SafeAreaView } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { PRODUCT_NAME } from "../../config/product";
import { features } from "../../config/features";
import { isDbReady } from "../../db/state";
import { listInspections, InspectionRow } from "../../repositories/inspections";
import { listVessels } from "../../repositories/vessels";
import { colors, fonts, spacing } from "../../theme";
import { RopeDivider } from "../../components/ui";
import { LOCALES, useLocale } from "../../i18n";
import { INSPECTION_STRINGS } from "../../i18n/inspection";
import type { RootStackParamList } from "../../navigation";

type Nav = NativeStackNavigationProp<RootStackParamList, "Home">;

export default function InspectionHomeScreen() {
  const navigation = useNavigation<Nav>();
  const { locale, setLocale } = useLocale();
  const s = INSPECTION_STRINGS[locale];
  const dbReady = isDbReady();
  const [inspections, setInspections] = useState<(InspectionRow & { vesselName?: string })[]>([]);
  const [vesselNames, setVesselNames] = useState<Map<string, string>>(new Map());

  useFocusEffect(
    useCallback(() => {
      if (!dbReady) return;
      setInspections(listInspections());
      setVesselNames(new Map(listVessels().map((v) => [v.id, v.name])));
    }, [dbReady])
  );

  const active = inspections.filter((i) => i.status === "draft" || i.status === "in_progress");
  const done = inspections.filter((i) => i.status === "completed");

  function inspectionCard(i: InspectionRow, resume: boolean) {
    return (
      <Pressable
        key={i.id}
        onPress={() =>
          resume
            ? navigation.navigate("Inspect", { inspectionId: i.id })
            : navigation.navigate("InspectionSummary", { inspectionId: i.id })
        }
        style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
      >
        <Text style={styles.cardIcon}>{resume ? "🧭" : "✅"}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{vesselNames.get(i.vesselId) ?? "—"}</Text>
          <Text style={styles.cardSub}>
            {s.checkIn} · {new Date(i.startedAt).toLocaleDateString()}
          </Text>
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
              <Text style={[styles.langText, locale === l.code && styles.langTextActive]}>
                {l.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.header}>
          <Text style={styles.compass}>☸</Text>
          <Text style={styles.title}>{PRODUCT_NAME}</Text>
        </View>

        {dbReady ? (
          <Pressable
            onPress={() => navigation.navigate("NewInspection")}
            style={({ pressed }) => [styles.primary, pressed && { opacity: 0.85 }]}
          >
            <Text style={styles.primaryText}>＋ {s.newInspection}</Text>
          </Pressable>
        ) : (
          <View style={styles.notice}>
            <Text style={styles.noticeText}>{s.notAvailable}</Text>
          </View>
        )}

        {active.length > 0 && (
          <>
            <RopeDivider label={s.inProgress.toUpperCase()} />
            {active.map((i) => inspectionCard(i, true))}
          </>
        )}

        {done.length > 0 && (
          <>
            <RopeDivider label={s.completed.toUpperCase()} />
            {done.map((i) => inspectionCard(i, false))}
          </>
        )}

        {features.legacyChecklists && (
          <>
            <RopeDivider />
            <Pressable
              onPress={() => navigation.navigate("Checklists")}
              style={({ pressed }) => [styles.legacyLink, pressed && { opacity: 0.7 }]}
            >
              <Text style={styles.legacyText}>📋 {s.legacyLink} ›</Text>
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
  langRow: { flexDirection: "row", justifyContent: "flex-end", gap: 8, marginTop: spacing.s },
  langBtn: {
    borderWidth: 1,
    borderColor: colors.rope,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  langBtnActive: { backgroundColor: colors.brass, borderColor: colors.brass },
  langText: { fontFamily: fonts.mono, fontSize: 11, letterSpacing: 1, color: colors.fog },
  langTextActive: { color: colors.night, fontWeight: "700" },
  header: { alignItems: "center", marginVertical: spacing.l },
  compass: { fontSize: 40, color: colors.brass, marginBottom: 4 },
  title: { fontFamily: fonts.display, fontSize: 32, color: colors.paper, fontWeight: "700" },
  primary: {
    backgroundColor: colors.brass,
    borderRadius: 10,
    paddingVertical: 18,
    alignItems: "center",
    marginBottom: spacing.m,
  },
  primaryText: { fontFamily: fonts.display, fontSize: 19, fontWeight: "700", color: colors.night },
  notice: {
    borderWidth: 1,
    borderColor: colors.rope,
    borderRadius: 8,
    padding: spacing.m,
    marginBottom: spacing.m,
  },
  noticeText: { fontFamily: fonts.body, fontSize: 13, color: colors.fog, textAlign: "center" },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.paper,
    borderRadius: 8,
    padding: spacing.m,
    marginBottom: spacing.s,
  },
  cardIcon: { fontSize: 24 },
  cardTitle: { fontFamily: fonts.display, fontSize: 17, fontWeight: "700", color: colors.ink },
  cardSub: { fontFamily: fonts.body, fontSize: 12, color: colors.inkFaded, marginTop: 2 },
  chevron: { fontSize: 26, color: colors.brassDark, fontFamily: fonts.display },
  legacyLink: { alignItems: "center", paddingVertical: spacing.s },
  legacyText: { fontFamily: fonts.body, fontSize: 13, color: colors.fog },
});
