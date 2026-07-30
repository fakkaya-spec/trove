import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  SafeAreaView,
  TextInput,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { getActiveTemplate } from "../../repositories/templates";
import { createVessel, listVessels, VesselRow } from "../../repositories/vessels";
import { createCheckInInspection } from "../../repositories/inspections";
import { lt } from "../../domain/inspection";
import type { BoatType } from "../../domain/types";
import { colors, fonts, spacing } from "../../theme";
import { RopeDivider } from "../../components/ui";
import { useLocale } from "../../i18n";
import { INSPECTION_STRINGS } from "../../i18n/inspection";
import type { RootStackParamList } from "../../navigation";

type Nav = NativeStackNavigationProp<RootStackParamList, "NewInspection">;

// Faz 0'da yalnızca yelkenli şablonu seed'li; diğer tipler şablon bulunamazsa
// yelkenli şablonuna düşer (şablon çoğaltma Faz 1 işi).
const BOAT_TYPES: { type: BoatType; icon: string; key: keyof (typeof INSPECTION_STRINGS)["en"] }[] = [
  { type: "sailing", icon: "⛵", key: "btSailing" },
  { type: "catamaran", icon: "⛵", key: "btCatamaran" },
  { type: "motor", icon: "🛥️", key: "btMotor" },
  { type: "rib", icon: "🚤", key: "btRib" },
  { type: "jetski", icon: "🌊", key: "btJetski" },
  { type: "gulet", icon: "⚓", key: "btGulet" },
];

export default function NewInspectionScreen() {
  const navigation = useNavigation<Nav>();
  const { locale } = useLocale();
  const s = INSPECTION_STRINGS[locale];

  const saved = useMemo(() => listVessels(), []);
  const [selectedVessel, setSelectedVessel] = useState<VesselRow | null>(null);
  const [name, setName] = useState("");
  const [model, setModel] = useState("");
  const [boatType, setBoatType] = useState<BoatType>("sailing");

  const template = useMemo(
    () => getActiveTemplate(boatType) ?? getActiveTemplate("sailing"),
    [boatType]
  );

  const canStart = !!template && (selectedVessel !== null || name.trim().length > 0);

  function start() {
    if (!template) return;
    const vessel =
      selectedVessel ??
      createVessel({ name: name.trim(), type: boatType, model: model.trim() || undefined });
    const inspection = createCheckInInspection({
      vesselId: vessel.id,
      templateId: template.id,
      templateVersion: template.version,
      locale,
    });
    navigation.replace("Inspect", { inspectionId: inspection.id });
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {saved.length > 0 && (
          <>
            <Text style={styles.label}>{s.savedVessels}</Text>
            <View style={styles.chipRow}>
              {saved.map((v) => (
                <Pressable
                  key={v.id}
                  onPress={() => setSelectedVessel(selectedVessel?.id === v.id ? null : v)}
                  style={[styles.chip, selectedVessel?.id === v.id && styles.chipActive]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      selectedVessel?.id === v.id && styles.chipTextActive,
                    ]}
                  >
                    {v.name}
                  </Text>
                </Pressable>
              ))}
            </View>
            <RopeDivider label={s.newVessel.toUpperCase()} />
          </>
        )}

        {!selectedVessel && (
          <>
            <Text style={styles.label}>{s.vesselName}</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              style={styles.input}
              placeholder="S/Y Meltemi"
              placeholderTextColor={colors.fog}
              autoCapitalize="words"
            />
            <Text style={styles.label}>{s.vesselModel}</Text>
            <TextInput
              value={model}
              onChangeText={setModel}
              style={styles.input}
              placeholder="Oceanis 46.1"
              placeholderTextColor={colors.fog}
            />
            <Text style={styles.label}>{s.boatType}</Text>
            <View style={styles.chipRow}>
              {BOAT_TYPES.map((bt) => (
                <Pressable
                  key={bt.type}
                  onPress={() => setBoatType(bt.type)}
                  style={[styles.chip, boatType === bt.type && styles.chipActive]}
                >
                  <Text style={[styles.chipText, boatType === bt.type && styles.chipTextActive]}>
                    {bt.icon} {s[bt.key]}
                  </Text>
                </Pressable>
              ))}
            </View>
          </>
        )}

        {template && (
          <View style={styles.templateBox}>
            <Text style={styles.templateLabel}>{s.template}</Text>
            <Text style={styles.templateName}>{lt(template.name, locale)}</Text>
            <Text style={styles.templateMeta}>
              {template.sections.length} × ⚓ ·{" "}
              {template.sections.reduce(
                (n, sec) => n + sec.items.filter((i) => i.inputKind === "status").length,
                0
              )}{" "}
              {s.itemsLabel}
            </Text>
          </View>
        )}

        <Pressable
          onPress={start}
          disabled={!canStart}
          style={({ pressed }) => [
            styles.primary,
            (!canStart || pressed) && { opacity: canStart ? 0.85 : 0.4 },
          ]}
        >
          <Text style={styles.primaryText}>{s.start}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.night },
  scroll: { padding: spacing.m, paddingBottom: spacing.xl },
  label: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1,
    color: colors.brass,
    marginTop: spacing.m,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.nightDeep,
    borderWidth: 1,
    borderColor: colors.rope,
    borderRadius: 8,
    color: colors.paper,
    fontFamily: fonts.body,
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: colors.rope,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  chipActive: { backgroundColor: colors.brass, borderColor: colors.brass },
  chipText: { fontFamily: fonts.body, fontSize: 14, color: colors.fog },
  chipTextActive: { color: colors.night, fontWeight: "700" },
  templateBox: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    padding: spacing.m,
    marginTop: spacing.l,
    backgroundColor: colors.nightDeep,
  },
  templateLabel: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1, color: colors.fog },
  templateName: {
    fontFamily: fonts.display,
    fontSize: 17,
    fontWeight: "700",
    color: colors.paper,
    marginTop: 4,
  },
  templateMeta: { fontFamily: fonts.body, fontSize: 12, color: colors.fog, marginTop: 4 },
  primary: {
    backgroundColor: colors.brass,
    borderRadius: 10,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: spacing.l,
  },
  primaryText: { fontFamily: fonts.display, fontSize: 18, fontWeight: "700", color: colors.night },
});
