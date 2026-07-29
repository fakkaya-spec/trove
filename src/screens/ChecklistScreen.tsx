import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  Pressable,
  SafeAreaView,
  Alert,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { getVessel, totalItems } from "../data/checklists";
import type { ChecklistItem } from "../data/types";
import { CheckState, clearChecks, loadChecks, saveChecks } from "../storage";
import { colors, fonts, spacing } from "../theme";
import { ProgressGauge, Tag } from "../components/ui";
import { AdBanner, showInterstitial } from "../ads";
import type { RootStackParamList } from "../navigation";

type Route = RouteProp<RootStackParamList, "Checklist">;

export default function ChecklistScreen() {
  const route = useRoute<Route>();
  const navigation = useNavigation();
  const vessel = getVessel(route.params.vesselId);
  const [checks, setChecks] = useState<CheckState>({});
  const [loaded, setLoaded] = useState(false);
  const celebrated = useRef(false);

  useEffect(() => {
    if (!vessel) return;
    navigation.setOptions({ title: `${vessel.icon} ${vessel.name}` });
    loadChecks(vessel.id).then((s) => {
      setChecks(s);
      celebrated.current =
        Object.values(s).filter(Boolean).length === totalItems(vessel);
      setLoaded(true);
    });
  }, [vessel?.id]);

  const sections = useMemo(
    () =>
      (vessel?.categories ?? []).map((c) => ({
        id: c.id,
        title: c.title,
        icon: c.icon,
        data: c.items,
      })),
    [vessel]
  );

  if (!vessel) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.missing}>Tekne bulunamadı.</Text>
      </SafeAreaView>
    );
  }

  const total = totalItems(vessel);
  const done = Object.values(checks).filter(Boolean).length;
  const complete = loaded && done === total;

  function toggle(item: ChecklistItem) {
    if (!vessel) return;
    const vesselId = vessel.id;
    setChecks((prev) => {
      const next = { ...prev, [item.id]: !prev[item.id] };
      saveChecks(vesselId, next);
      const doneNow = Object.values(next).filter(Boolean).length;
      if (doneNow === total && !celebrated.current) {
        celebrated.current = true;
        // Liste tamamlanınca geçiş reklamı — gelir modelinin ikinci ayağı.
        showInterstitial();
      }
      if (doneNow < total) celebrated.current = false;
      return next;
    });
  }

  function resetAll() {
    if (!vessel) return;
    const vesselId = vessel.id;
    Alert.alert("Defteri temizle", "Bu teknenin tüm işaretleri silinsin mi?", [
      { text: "Vazgeç", style: "cancel" },
      {
        text: "Temizle",
        style: "destructive",
        onPress: () => {
          celebrated.current = false;
          setChecks({});
          clearChecks(vesselId);
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.gaugeBar}>
        <ProgressGauge done={done} total={total} />
        <Pressable onPress={resetAll} hitSlop={8}>
          <Text style={styles.reset}>SIFIRLA</Text>
        </Pressable>
      </View>

      {complete && (
        <View style={styles.stamp}>
          <Text style={styles.stampText}>✓ KONTROL TAMAM</Text>
          <Text style={styles.stampSub}>Pruvanız neta, rüzgarınız kolayına olsun!</Text>
        </View>
      )}

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={styles.list}
        renderSectionHeader={({ section }) => {
          const secDone = section.data.filter((it) => checks[it.id]).length;
          return (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>{section.icon}</Text>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <Text style={styles.sectionCount}>
                {secDone}/{section.data.length}
              </Text>
            </View>
          );
        }}
        renderItem={({ item }) => {
          const checked = !!checks[item.id];
          return (
            <Pressable
              onPress={() => toggle(item)}
              style={({ pressed }) => [styles.item, pressed && { opacity: 0.7 }]}
            >
              <View style={[styles.box, checked && styles.boxChecked]}>
                {checked && <Text style={styles.boxTick}>✓</Text>}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.itemText, checked && styles.itemTextDone]}>
                  {item.text}
                </Text>
                {(item.critical || item.photo) && !checked && (
                  <View style={styles.tags}>
                    {item.critical && <Tag kind="critical" />}
                    {item.photo && <Tag kind="photo" />}
                  </View>
                )}
                {item.tip && !checked && <Text style={styles.tip}>☞ {item.tip}</Text>}
              </View>
            </Pressable>
          );
        }}
      />
      <AdBanner />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  missing: { margin: 24, fontFamily: fonts.body, color: colors.ink },
  gaugeBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: spacing.m,
    paddingVertical: 10,
    backgroundColor: colors.night,
  },
  reset: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1,
    color: colors.signal,
  },
  stamp: {
    margin: spacing.m,
    marginBottom: 0,
    borderWidth: 2,
    borderColor: colors.seafoam,
    borderRadius: 6,
    padding: spacing.m,
    alignItems: "center",
    transform: [{ rotate: "-1deg" }],
    backgroundColor: "rgba(127, 181, 168, 0.12)",
  },
  stampText: {
    fontFamily: fonts.display,
    fontSize: 20,
    fontWeight: "700",
    color: "#3E7466",
    letterSpacing: 2,
  },
  stampSub: { fontFamily: fonts.body, fontStyle: "italic", fontSize: 12, color: "#3E7466", marginTop: 2 },
  list: { padding: spacing.m, paddingBottom: spacing.xl },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: spacing.l,
    marginBottom: spacing.s,
    borderBottomWidth: 2,
    borderBottomColor: colors.rope,
    paddingBottom: 6,
  },
  sectionIcon: { fontSize: 18 },
  sectionTitle: {
    flex: 1,
    fontFamily: fonts.display,
    fontSize: 18,
    fontWeight: "700",
    color: colors.ink,
  },
  sectionCount: { fontFamily: fonts.mono, fontSize: 12, color: colors.inkFaded },
  item: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.paperShade,
    alignItems: "flex-start",
  },
  box: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: colors.brassDark,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
    backgroundColor: colors.paper,
  },
  boxChecked: { backgroundColor: colors.brass, borderColor: colors.brassDark },
  boxTick: { color: colors.night, fontWeight: "700", fontSize: 15 },
  itemText: { fontFamily: fonts.body, fontSize: 15, color: colors.ink, lineHeight: 21 },
  itemTextDone: {
    color: colors.inkFaded,
    textDecorationLine: "line-through",
    textDecorationColor: colors.brassDark,
  },
  tags: { flexDirection: "row", marginTop: 4 },
  tip: {
    fontFamily: fonts.body,
    fontStyle: "italic",
    fontSize: 12,
    color: colors.inkFaded,
    marginTop: 4,
    lineHeight: 17,
  },
});
