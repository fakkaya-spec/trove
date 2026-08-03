import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, SafeAreaView, Image } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { listVessels, VesselRow } from "../../repositories/vessels";
import { resolveMediaUri } from "../../media/photos";
import { isDbReady } from "../../db/state";
import { T, TSH, TICON, touch } from "../../theme";
import { LIcon, type LIconName } from "../../components/LIcon";
import { SLabel } from "../../components/trove/primitives";
import { useLocale } from "../../i18n";
import { TRIP_STRINGS } from "../../i18n/trip";
import { boatTypeLabel, INSPECTION_STRINGS } from "../../i18n/inspection";
import { VESSEL_STRINGS } from "../../i18n/vessel";
import type { RootStackParamList } from "../../navigation";

// Vessel sekmesi — Faz 8 TROVE görünümü (sprint G2). Liste + boş durum +
// tek net birincil eylem (Tekne ekle → AddVessel aşamalı formu). Ekleme
// formu buradan çıkarıldı: liste listedir, form formdur. Satır → tekne
// geçmişi (BoatHistory). Örnek tekneler burada GÖRÜNMEZ (izolasyon:
// listVessels yalnız gerçek) — keşif karşılama ekranındadır.

type Nav = NativeStackNavigationProp<RootStackParamList>;

const TYPE_ICON: Record<string, LIconName> = {
  sailing: "sailboat",
  catamaran: "sailboat",
  motor: "anchor",
  rib: "waves",
  gulet: "sailboat",
};

export default function BoatsScreen() {
  const navigation = useNavigation<Nav>();
  const { locale } = useLocale();
  const s = TRIP_STRINGS[locale];
  const si = INSPECTION_STRINGS[locale];
  const v = VESSEL_STRINGS[locale];
  const [boats, setBoats] = useState<VesselRow[]>([]);

  const refresh = useCallback(() => {
    if (isDbReady()) setBoats(listVessels());
  }, []);
  useFocusEffect(refresh);

  const own = boats.filter((b) => b.ownershipType === "owned");
  const chartered = boats.filter((b) => b.ownershipType !== "owned");

  const row = (b: VesselRow) => (
    <Pressable
      key={b.id}
      onPress={() => navigation.navigate("BoatHistory", { boatId: b.id })}
      accessibilityRole="button"
      accessibilityLabel={`${b.name} — ${s.historyTitle}`}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
    >
      {b.photoUri ? (
        <Image source={{ uri: resolveMediaUri(b.photoUri) }} style={styles.cardPhoto} />
      ) : (
        <View style={styles.cardIcon}>
          <LIcon name={TYPE_ICON[b.type] ?? "sailboat"} size={TICON.lg} color={T.blue} />
        </View>
      )}
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {b.name}
        </Text>
        <Text style={styles.cardSub} numberOfLines={1}>
          {boatTypeLabel(si, b.type)}
          {b.model ? ` · ${b.model}` : ""}
        </Text>
      </View>
      <LIcon name="chevron-right" size={TICON.sm} color={T.ink3} />
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        {boats.length === 0 ? (
          /* Boş durum — öğretici, tek eylem */
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <LIcon name="sailboat" size={TICON.xl} color={T.ink3} />
            </View>
            <Text style={styles.emptyTitle}>{v.emptyTitle}</Text>
            <Text style={styles.emptyBody}>{v.emptyBody}</Text>
          </View>
        ) : (
          <>
            {own.length > 0 && (
              <>
                <SLabel mt={0}>{s.myBoats}</SLabel>
                {own.map(row)}
              </>
            )}
            {chartered.length > 0 && (
              <>
                <SLabel mt={own.length > 0 ? 16 : 0}>{s.charterBoatsUsed}</SLabel>
                {chartered.map(row)}
              </>
            )}
            <Text style={styles.hint}>{v.historyHint}</Text>
          </>
        )}

        {/* Tek birincil eylem */}
        <Pressable
          onPress={() => navigation.navigate("AddVessel")}
          accessibilityRole="button"
          accessibilityLabel={v.addVessel}
          style={({ pressed }) => [styles.addBtn, pressed && { opacity: 0.85 }]}
        >
          <LIcon name="plus" size={TICON.md} color="#FFFFFF" />
          <Text style={styles.addText}>{v.addVessel}</Text>
        </Pressable>
        <Text style={styles.addSub}>{v.addVesselSub}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.bg },
  empty: { alignItems: "center", paddingVertical: 36 },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: T.surfaceEl,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: T.ink0, marginBottom: 6 },
  emptyBody: {
    fontSize: 13,
    color: T.ink2,
    textAlign: "center",
    lineHeight: 19,
    maxWidth: 260,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: touch.row,
    backgroundColor: T.surface,
    borderWidth: 1,
    borderColor: T.rule,
    borderRadius: T.r,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
    ...TSH.sh0,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: T.blueL,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  cardPhoto: { width: 44, height: 44, borderRadius: T.r2, flexShrink: 0 },
  cardTitle: { fontSize: 15, fontWeight: "600", color: T.ink0, letterSpacing: -0.2 },
  cardSub: { fontSize: 12, color: T.ink2, marginTop: 2 },
  hint: { fontSize: 11, color: T.ink3, marginTop: 4 },
  addBtn: {
    backgroundColor: T.blue,
    borderRadius: T.r,
    minHeight: touch.min,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 20,
  },
  addText: { fontSize: 15, fontWeight: "700", color: "#FFFFFF", letterSpacing: -0.2 },
  addSub: { fontSize: 11, color: T.ink3, textAlign: "center", marginTop: 8 },
});
