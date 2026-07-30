import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  SafeAreaView,
  TextInput,
} from "react-native";
import { useFocusEffect , useNavigation } from "@react-navigation/native";
import { createVessel, listVessels, VesselRow } from "../../repositories/vessels";
import { isDbReady } from "../../db/state";
import type { BoatType } from "../../domain/types";
import { colors, fonts, spacing } from "../../theme";
import { RopeDivider } from "../../components/ui";
import { useLocale } from "../../i18n";
import { TRIP_STRINGS } from "../../i18n/trip";
import { boatTypeLabel, INSPECTION_STRINGS } from "../../i18n/inspection";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation";

const BOAT_TYPES: { type: BoatType; icon: string }[] = [
  { type: "sailing", icon: "⛵" },
  { type: "catamaran", icon: "⛵" },
  { type: "motor", icon: "🛥️" },
  { type: "rib", icon: "🚤" },
  { type: "gulet", icon: "⚓" },
];

export default function BoatsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { locale } = useLocale();
  const s = TRIP_STRINGS[locale];
  const si = INSPECTION_STRINGS[locale];
  const [boats, setBoats] = useState<VesselRow[]>([]);
  const [name, setName] = useState("");
  const [type, setType] = useState<BoatType>("sailing");
  const [charter, setCharter] = useState(false);

  const refresh = useCallback(() => {
    if (isDbReady()) setBoats(listVessels());
  }, []);
  useFocusEffect(refresh);

  function add() {
    if (!name.trim()) return;
    createVessel({ name: name.trim(), type, ownershipType: charter ? "chartered" : "owned" });
    setName("");
    refresh();
  }

  function row(v: VesselRow) {
    return (
      <Pressable
        key={v.id}
        onPress={() => navigation.navigate("BoatHistory", { boatId: v.id })}
        accessibilityRole="button"
        accessibilityLabel={`${v.name} — ${s.historyTitle}`}
        style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
      >
        <Text style={styles.cardIcon}>{BOAT_TYPES.find((b) => b.type === v.type)?.icon ?? "⛵"}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{v.name}</Text>
          <Text style={styles.cardSub}>
            {boatTypeLabel(si, v.type)}
            {v.model ? ` · ${v.model}` : ""}
          </Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </Pressable>
    );
  }

  const own = boats.filter((b) => b.ownershipType === "owned");
  const chartered = boats.filter((b) => b.ownershipType !== "owned");

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Hızlı ekleme — teknik detaylar sonradan (progressive disclosure) */}
        <Text style={styles.fieldLabel}>{s.addBoat}</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          style={styles.input}
          placeholder="S/Y Meltemi"
          placeholderTextColor={colors.fog}
        />
        <View style={styles.chipRow}>
          {BOAT_TYPES.map((b) => (
            <Pressable
              key={b.type}
              onPress={() => setType(b.type)}
              style={[styles.chip, type === b.type && styles.chipActive]}
            >
              <Text style={[styles.chipText, type === b.type && styles.chipTextActive]}>
                {b.icon} {boatTypeLabel(si, b.type)}
              </Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.chipRow}>
          <Pressable
            onPress={() => setCharter(false)}
            style={[styles.chip, !charter && styles.chipActive]}
          >
            <Text style={[styles.chipText, !charter && styles.chipTextActive]}>⚓ {s.ownBoat}</Text>
          </Pressable>
          <Pressable
            onPress={() => setCharter(true)}
            style={[styles.chip, charter && styles.chipActive]}
          >
            <Text style={[styles.chipText, charter && styles.chipTextActive]}>
              📋 {s.charterBoat}
            </Text>
          </Pressable>
        </View>
        <Pressable
          onPress={add}
          disabled={!name.trim()}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.primary,
            (!name.trim() || pressed) && { opacity: name.trim() ? 0.85 : 0.4 },
          ]}
        >
          <Text style={styles.primaryText}>＋ {s.addBoat}</Text>
        </Pressable>

        {own.length > 0 && (
          <>
            <RopeDivider label={s.myBoats.toUpperCase()} />
            {own.map(row)}
          </>
        )}
        {chartered.length > 0 && (
          <>
            <RopeDivider label={s.charterBoatsUsed.toUpperCase()} />
            {chartered.map(row)}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.night },
  scroll: { padding: spacing.m, paddingBottom: spacing.xl },
  fieldLabel: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1,
    color: colors.brass,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.nightDeep,
    borderWidth: 1,
    borderColor: colors.rope,
    borderRadius: 8,
    color: colors.paper,
    fontFamily: fonts.body,
    fontSize: 15,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  chip: {
    borderWidth: 1,
    borderColor: colors.rope,
    borderRadius: 20,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  chipActive: { backgroundColor: colors.brass, borderColor: colors.brass },
  chipText: { fontFamily: fonts.body, fontSize: 13, color: colors.fog },
  chipTextActive: { color: colors.night, fontWeight: "700" },
  primary: {
    backgroundColor: colors.brass,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: spacing.m,
  },
  primaryText: { fontFamily: fonts.display, fontSize: 15, fontWeight: "700", color: colors.night },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.paper,
    borderRadius: 8,
    padding: spacing.m,
    marginBottom: spacing.s,
  },
  cardIcon: { fontSize: 22 },
  cardTitle: { fontFamily: fonts.display, fontSize: 16, fontWeight: "700", color: colors.ink },
  cardSub: { fontFamily: fonts.body, fontSize: 12, color: colors.inkFaded, marginTop: 2 },
  chevron: { fontSize: 24, color: colors.brassDark },
});
