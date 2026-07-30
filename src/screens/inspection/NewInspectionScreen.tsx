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
import { colors, fonts, spacing, radius, touch } from "../../theme";
import { RopeDivider, Button } from "../../components/ui";
import { useLocale } from "../../i18n";
import { INSPECTION_STRINGS } from "../../i18n/inspection";
import type { RootStackParamList } from "../../navigation";

type Nav = NativeStackNavigationProp<RootStackParamList, "NewInspection">;

// Faz 0'da yalnızca yelkenli şablonu seed'li; diğer tipler şablon bulunamazsa
// yelkenli şablonuna düşer (şablon çoğaltma Faz 1 işi).
const BOAT_TYPES: { type: BoatType; key: keyof (typeof INSPECTION_STRINGS)["en"] }[] = [
  { type: "sailing", key: "btSailing" },
  { type: "catamaran", key: "btCatamaran" },
  { type: "motor", key: "btMotor" },
  { type: "rib", key: "btRib" },
  { type: "jetski", key: "btJetski" },
  { type: "gulet", key: "btGulet" },
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
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="words"
            />
            <Text style={styles.label}>{s.vesselModel}</Text>
            <TextInput
              value={model}
              onChangeText={setModel}
              style={styles.input}
              placeholder="Oceanis 46.1"
              placeholderTextColor={colors.textSecondary}
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
                    {s[bt.key]}
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
              {template.sections.length} ·{" "}
              {template.sections.reduce(
                (n, sec) => n + sec.items.filter((i) => i.inputKind === "status").length,
                0
              )}{" "}
              {s.itemsLabel}
            </Text>
          </View>
        )}

        <View style={{ marginTop: spacing.l }}>
          <Button label={s.start} icon="play" onPress={start} disabled={!canStart} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.m, paddingBottom: spacing.xl },
  label: {
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
    color: colors.textSecondary,
    marginTop: spacing.m,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.control,
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: 16,
    minHeight: touch.min,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    minHeight: 44,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontFamily: fonts.body, fontSize: 14, color: colors.text },
  chipTextActive: { color: colors.onPrimary, fontWeight: "600" },
  templateBox: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.card,
    padding: spacing.m,
    marginTop: spacing.l,
    backgroundColor: colors.surface,
  },
  templateLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.5,
    color: colors.textSecondary,
  },
  templateName: {
    fontFamily: fonts.body,
    fontSize: 17,
    fontWeight: "600",
    color: colors.text,
    marginTop: 4,
  },
  templateMeta: { fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary, marginTop: 4 },
});
