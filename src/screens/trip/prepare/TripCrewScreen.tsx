import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  SafeAreaView,
  TextInput,
  Alert,
} from "react-native";
import { useFocusEffect, useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { T, TSH, TICON } from "../../../theme";
import { LIcon } from "../../../components/LIcon";
import { SLabel } from "../../../components/trove/primitives";
import { SampleBanner } from "../../../components/trove/SampleBanner";
import { getTrip, updateTripCrew, TripRow } from "../../../repositories/trips";
import { useLocale } from "../../../i18n";
import { TRIP_STRINGS } from "../../../i18n/trip";
import { PREPARE_STRINGS } from "../../../i18n/prepare";
import type { RootStackParamList } from "../../../navigation";

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, "TripCrew">;

// trip_crew — trips.skipperName + crewNamesJson üzerine ekran (onaylı tasarım
// CrewScreen). Misafir ayrımı veri modelinde yok: adults/children sayıları
// ikmal girdisidir; isimli liste mürettebattır. Örnek seferler salt okunur.

export default function TripCrewScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { locale } = useLocale();
  const s = TRIP_STRINGS[locale];
  const p = PREPARE_STRINGS[locale];

  const [trip, setTrip] = useState<TripRow | null>(null);
  const [newName, setNewName] = useState("");
  const [skipperDraft, setSkipperDraft] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setTrip(getTrip(route.params.tripId));
  }, [route.params.tripId]);

  useFocusEffect(refresh);

  if (!trip) return <SafeAreaView style={styles.safe} />;
  const readOnly = trip.isSample;

  function saveSkipper() {
    if (!trip || skipperDraft === null) return;
    updateTripCrew(trip.id, { skipperName: skipperDraft, crewNames: trip.crewNames });
    setSkipperDraft(null);
    refresh();
  }

  function addCrew() {
    if (!trip || !newName.trim()) return;
    updateTripCrew(trip.id, {
      skipperName: trip.skipperName,
      crewNames: [...trip.crewNames, newName],
    });
    setNewName("");
    refresh();
  }

  function removeCrew(index: number) {
    if (!trip) return;
    Alert.alert(p.crewGuests, p.removeCrewConfirm, [
      { text: s.cancel, style: "cancel" },
      {
        text: s.deleteShort,
        style: "destructive",
        onPress: () => {
          updateTripCrew(trip.id, {
            skipperName: trip.skipperName,
            crewNames: trip.crewNames.filter((_, i) => i !== index),
          });
          refresh();
        },
      },
    ]);
  }

  const initial = (name: string) => (name.trim()[0] ?? "?").toUpperCase();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        {readOnly && (
          <SampleBanner onCreate={() => navigation.navigate("Tabs", { screen: "VesselTab" })} />
        )}

        {/* Kaptan */}
        <SLabel mt={0}>{p.skipperRole}</SLabel>
        <View style={styles.personCard}>
          <View style={[styles.avatar, { backgroundColor: T.blue }]}>
            <Text style={[styles.avatarText, { color: "#FFFFFF" }]}>
              {trip.skipperName ? initial(trip.skipperName) : "?"}
            </Text>
          </View>
          {readOnly ? (
            <View style={{ flex: 1 }}>
              <Text style={styles.personName}>{trip.skipperName ?? "—"}</Text>
              <Text style={styles.personRole}>{p.skipperRole}</Text>
            </View>
          ) : (
            <TextInput
              value={skipperDraft ?? trip.skipperName ?? ""}
              onChangeText={setSkipperDraft}
              onBlur={saveSkipper}
              onSubmitEditing={saveSkipper}
              placeholder={p.skipperPlaceholder}
              placeholderTextColor={T.ink3}
              style={styles.nameInput}
              returnKeyType="done"
            />
          )}
        </View>

        {/* Mürettebat */}
        <SLabel mt={20}>{p.crewSection}</SLabel>
        {trip.crewNames.map((name, i) => (
          <View key={`${name}-${i}`} style={styles.personCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initial(name)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.personName}>{name}</Text>
              <Text style={styles.personRole}>{p.crewRole}</Text>
            </View>
            {!readOnly && (
              <Pressable
                onPress={() => removeCrew(i)}
                accessibilityRole="button"
                accessibilityLabel={s.deleteShort}
                hitSlop={8}
                style={styles.removeBtn}
              >
                <LIcon name="x" size={TICON.sm} color={T.ink3} />
              </Pressable>
            )}
          </View>
        ))}

        {!readOnly && (
          <View style={styles.addRow}>
            <TextInput
              value={newName}
              onChangeText={setNewName}
              placeholder={p.crewNamePlaceholder}
              placeholderTextColor={T.ink3}
              style={[styles.nameInput, styles.addInput]}
              returnKeyType="done"
              onSubmitEditing={addCrew}
            />
            <Pressable
              onPress={addCrew}
              accessibilityRole="button"
              accessibilityLabel={p.addCrewName}
              style={({ pressed }) => [styles.addBtn, pressed && { opacity: 0.8 }]}
            >
              <LIcon name="plus" size={TICON.md} color={T.blue} />
            </Pressable>
          </View>
        )}

        {/* Kişi sayıları (ikmal girdisi) */}
        <SLabel mt={20}>{p.guestsSection}</SLabel>
        <View style={styles.countsCard}>
          {(
            [
              [s.adults, trip.adults],
              [s.children, trip.children],
              [s.infants, trip.infants],
              [s.pets, trip.pets],
            ] as const
          ).map(([label, count], i, arr) => (
            <View key={label} style={[styles.countRow, i < arr.length - 1 && styles.countRowRule]}>
              <Text style={styles.countLabel}>{label}</Text>
              <Text style={styles.countValue}>{count}</Text>
            </View>
          ))}
        </View>

        <View style={styles.note}>
          <LIcon name="users" size={TICON.sm} color={T.ink2} style={{ marginTop: 1 }} />
          <Text style={styles.noteText}>{p.crewProvisionNote}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.bg },
  personCard: {
    backgroundColor: T.surface,
    borderRadius: T.r2,
    borderWidth: 1,
    borderColor: T.rule,
    paddingVertical: 11,
    paddingHorizontal: 14,
    marginBottom: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    ...TSH.sh0,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: T.surfaceEl,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  avatarText: { fontSize: 13, fontWeight: "700", color: T.ink2 },
  personName: { fontSize: 13, fontWeight: "600", color: T.ink0 },
  personRole: { fontSize: 11, color: T.ink2, marginTop: 1 },
  nameInput: { flex: 1, fontSize: 13, fontWeight: "600", color: T.ink0, paddingVertical: 6 },
  removeBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  addRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 2 },
  addInput: {
    backgroundColor: T.surface,
    borderRadius: T.r2,
    borderWidth: 1,
    borderColor: T.ruleStr,
    paddingHorizontal: 14,
    minHeight: 44,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: T.r2,
    backgroundColor: T.blueL,
    alignItems: "center",
    justifyContent: "center",
  },
  countsCard: {
    backgroundColor: T.surface,
    borderRadius: T.r2,
    borderWidth: 1,
    borderColor: T.rule,
    paddingHorizontal: 14,
    ...TSH.sh0,
  },
  countRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 11,
  },
  countRowRule: { borderBottomWidth: 1, borderBottomColor: T.rule },
  countLabel: { fontSize: 13, color: T.ink1 },
  countValue: { fontFamily: T.mono, fontSize: 13, color: T.ink0 },
  note: {
    backgroundColor: T.surfaceEl,
    borderRadius: T.r,
    padding: 14,
    marginTop: 8,
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },
  noteText: { flex: 1, fontSize: 12, color: T.ink2, lineHeight: 19 },
});
