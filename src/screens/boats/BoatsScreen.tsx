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
import { colors, fonts, spacing, radius, touch } from "../../theme";
import { RopeDivider, Button } from "../../components/ui";
import { Icon } from "../../components/Icon";
import { useLocale } from "../../i18n";
import { TRIP_STRINGS } from "../../i18n/trip";
import { boatTypeLabel, INSPECTION_STRINGS } from "../../i18n/inspection";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation";

const BOAT_TYPES: BoatType[] = ["sailing", "catamaran", "motor", "rib", "gulet"];

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
        <Icon name="boat-outline" size={22} color={colors.text} />
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{v.name}</Text>
          <Text style={styles.cardSub}>
            {boatTypeLabel(si, v.type)}
            {v.model ? ` · ${v.model}` : ""}
          </Text>
        </View>
        <Icon name="chevron-forward" size={18} color={colors.textSecondary} />
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
          placeholderTextColor={colors.textSecondary}
        />
        <View style={styles.chipRow}>
          {BOAT_TYPES.map((b) => (
            <Pressable
              key={b}
              onPress={() => setType(b)}
              accessibilityRole="button"
              style={[styles.chip, type === b && styles.chipActive]}
            >
              <Text style={[styles.chipText, type === b && styles.chipTextActive]}>
                {boatTypeLabel(si, b)}
              </Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.chipRow}>
          <Pressable
            onPress={() => setCharter(false)}
            style={[styles.chip, !charter && styles.chipActive]}
          >
            <Text style={[styles.chipText, !charter && styles.chipTextActive]}>{s.ownBoat}</Text>
          </Pressable>
          <Pressable
            onPress={() => setCharter(true)}
            style={[styles.chip, charter && styles.chipActive]}
          >
            <Text style={[styles.chipText, charter && styles.chipTextActive]}>
              {s.charterBoat}
            </Text>
          </Pressable>
        </View>
        <View style={{ marginTop: spacing.m }}>
          <Button label={s.addBoat} icon="add" onPress={add} disabled={!name.trim()} />
        </View>

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
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.m, paddingBottom: spacing.xl },
  fieldLabel: {
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.control,
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: 15,
    minHeight: touch.min,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  chip: {
    minHeight: 44,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontFamily: fonts.body, fontSize: 13, color: colors.text },
  chipTextActive: { color: colors.onPrimary, fontWeight: "600" },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: touch.row,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.card,
    padding: spacing.m,
    marginBottom: spacing.s,
  },
  cardTitle: { fontFamily: fonts.body, fontSize: 17, fontWeight: "600", color: colors.text },
  cardSub: { fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary, marginTop: 2 },
});
