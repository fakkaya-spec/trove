import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  SafeAreaView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { T, TSH, TICON, touch } from "../../theme";
import { LIcon } from "../../components/LIcon";
import { createVessel } from "../../repositories/vessels";
import type { BoatType } from "../../domain/types";
import { useLocale } from "../../i18n";
import { TRIP_STRINGS } from "../../i18n/trip";
import { boatTypeLabel, INSPECTION_STRINGS } from "../../i18n/inspection";
import { VESSEL_STRINGS } from "../../i18n/vessel";
import type { RootStackParamList } from "../../navigation";

// Tekne ekleme — Faz 8 "ilk beş dakika" (sprint G3). Aşamalı açılım:
// zorunlu yalnız AD + TÜR + MÜLKİYET; kimlik ayrıntıları (üretici, yıl,
// boy, sicil, HIN, motor) isteğe bağlı ve katlanır. Kirli form geri
// tuşunda sorar (Android donanım geri dahil); doğrulama sakin ve yerinde.
// Repository değişmedi — isteğe bağlı alanlar v1 şemasına yazılır.

type Nav = NativeStackNavigationProp<RootStackParamList>;

const BOAT_TYPES: BoatType[] = ["sailing", "catamaran", "motor", "rib", "gulet"];

export default function AddVesselScreen() {
  const navigation = useNavigation<Nav>();
  const { locale } = useLocale();
  const s = TRIP_STRINGS[locale];
  const si = INSPECTION_STRINGS[locale];
  const v = VESSEL_STRINGS[locale];

  const [name, setName] = useState("");
  const [type, setType] = useState<BoatType>("sailing");
  const [charter, setCharter] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [manufacturer, setManufacturer] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [loa, setLoa] = useState("");
  const [engine, setEngine] = useState("");
  const [registration, setRegistration] = useState("");
  const [hin, setHin] = useState("");
  const [nameError, setNameError] = useState(false);
  const savedRef = useRef(false);

  const dirty =
    name.trim().length > 0 ||
    manufacturer.length > 0 ||
    model.length > 0 ||
    year.length > 0 ||
    loa.length > 0 ||
    engine.length > 0 ||
    registration.length > 0 ||
    hin.length > 0;

  useEffect(() => {
    const sub = navigation.addListener("beforeRemove", (e) => {
      if (!dirty || savedRef.current) return;
      e.preventDefault();
      Alert.alert(v.discardTitle, v.discardBody, [
        { text: v.keepEditing, style: "cancel" },
        {
          text: v.discardConfirm,
          style: "destructive",
          onPress: () => navigation.dispatch(e.data.action),
        },
      ]);
    });
    return sub;
  }, [navigation, dirty, v]);

  function save() {
    if (!name.trim()) {
      setNameError(true);
      return;
    }
    const yearNum = year.trim() ? Number(year.trim()) : undefined;
    if (yearNum !== undefined && (!Number.isInteger(yearNum) || yearNum < 1900 || yearNum > 2100)) {
      Alert.alert(v.year, v.yearInvalid);
      return;
    }
    const loaNum = loa.trim() ? Number(loa.trim().replace(",", ".")) : undefined;
    if (loaNum !== undefined && (!Number.isFinite(loaNum) || loaNum <= 0 || loaNum > 200)) {
      Alert.alert(v.loa, v.loaInvalid);
      return;
    }
    createVessel({
      name,
      type,
      ownershipType: charter ? "chartered" : "owned",
      model: model || undefined,
      manufacturer: manufacturer || undefined,
      modelYear: yearNum,
      lengthM: loaNum,
      engineType: engine || undefined,
      registrationNumber: registration || undefined,
      hullIdentificationNumber: hin || undefined,
    });
    savedRef.current = true;
    navigation.goBack();
  }

  const detailField = (
    label: string,
    value: string,
    setValue: (t: string) => void,
    opts?: { keyboard?: "numeric" | "decimal-pad"; mono?: boolean }
  ) => (
    <View style={styles.detailRow} key={label}>
      <Text style={styles.detailLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={setValue}
        keyboardType={opts?.keyboard}
        style={[styles.detailInput, opts?.mono && { fontFamily: T.mono }]}
        placeholderTextColor={T.ink3}
        accessibilityLabel={label}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Zorunlu: ad */}
          <Text style={styles.sectionLabel}>{v.nameLabel}</Text>
          <TextInput
            value={name}
            onChangeText={(t) => {
              setName(t);
              if (t.trim()) setNameError(false);
            }}
            placeholder={v.namePlaceholder}
            placeholderTextColor={T.ink3}
            style={[styles.input, nameError && { borderColor: T.red }]}
            accessibilityLabel={v.nameLabel}
            returnKeyType="done"
          />
          {nameError && <Text style={styles.errorText}>{v.nameRequired}</Text>}

          {/* Zorunlu: tür */}
          <Text style={styles.sectionLabel}>{v.typeLabel}</Text>
          <View style={styles.chipRow}>
            {BOAT_TYPES.map((b) => {
              const on = type === b;
              return (
                <Pressable
                  key={b}
                  onPress={() => setType(b)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: on }}
                  accessibilityLabel={boatTypeLabel(si, b)}
                  style={[styles.chip, on && styles.chipOn]}
                >
                  <Text style={[styles.chipText, on && styles.chipTextOn]}>
                    {boatTypeLabel(si, b)}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Zorunlu: mülkiyet */}
          <Text style={styles.sectionLabel}>{v.ownershipLabel}</Text>
          <View style={styles.chipRow}>
            {(
              [
                [false, s.ownBoat],
                [true, s.charterBoat],
              ] as const
            ).map(([val, label]) => {
              const on = charter === val;
              return (
                <Pressable
                  key={label}
                  onPress={() => setCharter(val)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: on }}
                  accessibilityLabel={label}
                  style={[styles.chip, on && styles.chipOn]}
                >
                  <Text style={[styles.chipText, on && styles.chipTextOn]}>{label}</Text>
                </Pressable>
              );
            })}
          </View>

          {/* İsteğe bağlı ayrıntılar — katlanır */}
          <Pressable
            onPress={() => setShowDetails((x) => !x)}
            accessibilityRole="button"
            accessibilityState={{ expanded: showDetails }}
            accessibilityLabel={v.detailsOptional}
            style={styles.detailsToggle}
          >
            <Text style={styles.sectionLabelInline}>{v.detailsOptional}</Text>
            <LIcon
              name={showDetails ? "chevron-down" : "chevron-right"}
              size={TICON.sm}
              color={T.ink3}
            />
          </Pressable>
          {showDetails ? (
            <View style={styles.detailsCard}>
              {detailField(v.manufacturer, manufacturer, setManufacturer)}
              {detailField(v.model, model, setModel)}
              {detailField(v.year, year, setYear, { keyboard: "numeric", mono: true })}
              {detailField(v.loa, loa, setLoa, { keyboard: "decimal-pad", mono: true })}
              {detailField(v.engine, engine, setEngine)}
              {detailField(v.registration, registration, setRegistration, { mono: true })}
              {detailField(v.hin, hin, setHin, { mono: true })}
            </View>
          ) : (
            <Text style={styles.detailsHint}>{v.detailsHint}</Text>
          )}

          {/* Kaydet */}
          <Pressable
            onPress={save}
            accessibilityRole="button"
            accessibilityLabel={v.saveVessel}
            style={({ pressed }) => [styles.cta, pressed && { opacity: 0.85 }]}
          >
            <Text style={styles.ctaText}>{v.saveVessel}</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.bg },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: T.ink2,
    letterSpacing: 0.4,
    marginTop: 18,
    marginBottom: 8,
  },
  sectionLabelInline: {
    fontSize: 11,
    fontWeight: "600",
    color: T.ink2,
    letterSpacing: 0.4,
  },
  input: {
    backgroundColor: T.surface,
    borderWidth: 1,
    borderColor: T.ruleStr,
    borderRadius: T.r2,
    color: T.ink0,
    fontSize: 15,
    minHeight: touch.min,
    paddingHorizontal: 14,
  },
  errorText: { fontSize: 12, color: T.red, marginTop: 6 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    minHeight: touch.min,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: T.rule,
    backgroundColor: T.surface,
    borderRadius: 99,
    paddingHorizontal: 14,
  },
  chipOn: { backgroundColor: T.ink0, borderColor: T.ink0 },
  chipText: { fontSize: 13, color: T.ink1 },
  chipTextOn: { color: "#FFFFFF", fontWeight: "600" },
  detailsToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: touch.min,
    marginTop: 14,
  },
  detailsHint: { fontSize: 12, color: T.ink3 },
  detailsCard: {
    backgroundColor: T.surface,
    borderRadius: T.r2,
    borderWidth: 1,
    borderColor: T.rule,
    paddingHorizontal: 14,
    ...TSH.sh0,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    minHeight: touch.min,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: T.rule,
  },
  detailLabel: { fontSize: 13, color: T.ink1, flexShrink: 0 },
  detailInput: {
    flex: 1,
    fontSize: 13,
    color: T.ink0,
    textAlign: "right",
    minHeight: touch.min,
  },
  cta: {
    backgroundColor: T.blue,
    borderRadius: T.r,
    minHeight: touch.min,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
  },
  ctaText: { fontSize: 15, fontWeight: "700", color: "#FFFFFF", letterSpacing: -0.2 },
});
