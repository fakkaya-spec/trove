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
import { VESSELS, totalItems } from "../data/checklists";
import { loadChecks } from "../storage";
import { colors, fonts, spacing } from "../theme";
import { BrassRing, ProgressGauge, RopeDivider } from "../components/ui";
import { AdBanner } from "../ads";
import type { RootStackParamList } from "../navigation";

type Nav = NativeStackNavigationProp<RootStackParamList, "Home">;

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const [progress, setProgress] = useState<Record<string, number>>({});

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        const entries = await Promise.all(
          VESSELS.map(async (v) => {
            const state = await loadChecks(v.id);
            return [v.id, Object.values(state).filter(Boolean).length] as const;
          })
        );
        if (active) setProgress(Object.fromEntries(entries));
      })();
      return () => {
        active = false;
      };
    }, [])
  );

  function renderCard(v: (typeof VESSELS)[number], idx: number) {
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
            {v.subtitle} · {total} madde · {v.duration}
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
        <View style={styles.header}>
          <Text style={styles.compass}>☸</Text>
          <Text style={styles.title}>MarinCheck</Text>
          <Text style={styles.subtitle}>KAPTANIN TESLİM DEFTERİ</Text>
          <Text style={styles.tagline}>
            Kiralık teknede depozitonu, kendi teknende{"\n"}canını ve seyrini koru — hiçbir şeyi atlama.
          </Text>
        </View>

        <RopeDivider label="⚓ TEKNE Mİ KİRALADIN? ⚓" />
        {VESSELS.filter((v) => v.group === "kiralik").map((v, idx) => renderCard(v, idx))}

        <RopeDivider label="☸ TEKNE SAHİBİ MİSİN? ☸" />
        {VESSELS.filter((v) => v.group === "sahip").map((v, idx) => renderCard(v, idx))}

        <RopeDivider />

        <Pressable
          onPress={() => navigation.navigate("Guide")}
          style={({ pressed }) => [styles.guideCard, pressed && { opacity: 0.85 }]}
        >
          <Text style={styles.guideIcon}>📷</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.guideTitle}>Foto & Depozito Rehberi</Text>
            <Text style={styles.guideSub}>
              En çok ihtilaf çıkan noktalar ve teslim alırken mutlaka fotoğraflanacaklar
            </Text>
          </View>
          <Text style={[styles.chevron, { color: colors.brass }]}>›</Text>
        </Pressable>

        <Text style={styles.footer}>İyi seyirler! ⛵ Pruvanız neta olsun.</Text>
      </ScrollView>
      <AdBanner />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.night },
  scroll: { padding: spacing.m, paddingBottom: spacing.xl },
  header: { alignItems: "center", marginTop: spacing.m, marginBottom: spacing.s },
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
