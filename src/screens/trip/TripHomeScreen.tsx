import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, SafeAreaView } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { PRODUCT_NAME } from "../../config/product";
import { isDbReady } from "../../db/state";
import { listTrips, getTripModuleStates, TripRow } from "../../repositories/trips";
import { listInspections } from "../../repositories/inspections";
import { nextAction, tripProgress, NextAction, TripModuleStates } from "../../domain/trip";
import { colors, fonts, spacing } from "../../theme";
import { ProgressGauge } from "../../components/ui";
import { useLocale } from "../../i18n";
import { TRIP_STRINGS, TripStrings } from "../../i18n/trip";
import { INSPECTION_STRINGS } from "../../i18n/inspection";
import type { RootStackParamList } from "../../navigation";

type Nav = NativeStackNavigationProp<RootStackParamList>;

const NA_KEY: Record<NextAction, keyof TripStrings> = {
  start_check_in: "na_start_check_in",
  start_pre_departure: "na_start_pre_departure",
  continue_pre_departure: "na_continue_pre_departure",
  generate_provisions: "na_generate_provisions",
  continue_shopping: "na_continue_shopping",
  review_critical_issues: "na_review_critical_issues",
  start_return_check: "na_start_return_check",
  continue_return_check: "na_continue_return_check",
  trip_complete: "na_trip_complete",
};

export default function TripHomeScreen() {
  const navigation = useNavigation<Nav>();
  const { locale } = useLocale();
  const s = TRIP_STRINGS[locale];
  const si = INSPECTION_STRINGS[locale];
  const dbReady = isDbReady();

  const [trip, setTrip] = useState<TripRow | null>(null);
  const [states, setStates] = useState<TripModuleStates | null>(null);
  const [draftInspectionId, setDraftInspectionId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!dbReady) return;
      const trips = listTrips().filter((t) => t.status !== "archived");
      const primary =
        trips.find((t) => t.status === "active") ??
        trips.find((t) => t.status === "planning") ??
        trips[0] ??
        null;
      setTrip(primary);
      setStates(primary ? getTripModuleStates(primary) : null);
      const draft = listInspections().find(
        (i) => i.status === "draft" || i.status === "in_progress"
      );
      setDraftInspectionId(draft?.id ?? null);
    }, [dbReady])
  );

  const isCharter = trip?.ownershipContext === "charter";
  const progress = states && trip ? tripProgress(states, isCharter) : null;
  const action = states && trip ? nextAction(states, isCharter) : null;

  function quick(label: string, icon: string, onPress: () => void, disabled = false) {
    return (
      <Pressable
        key={label}
        onPress={onPress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={({ pressed }) => [styles.quick, pressed && { opacity: 0.8 }, disabled && { opacity: 0.4 }]}
      >
        <Text style={styles.quickIcon}>{icon}</Text>
        <Text style={styles.quickText}>{label}</Text>
      </Pressable>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.compass}>☸</Text>
          <Text style={styles.title}>{PRODUCT_NAME}</Text>
        </View>

        {!dbReady && (
          <View style={styles.notice}>
            <Text style={styles.noticeText}>{si.notAvailable}</Text>
          </View>
        )}

        {dbReady && trip && states && progress && action && (
          <Pressable
            onPress={() => navigation.navigate("TripDetail", { tripId: trip.id })}
            accessibilityRole="button"
            style={({ pressed }) => [styles.tripCard, pressed && { opacity: 0.9 }]}
          >
            <Text style={styles.tripName}>⛵ {trip.name}</Text>
            <Text style={styles.tripMeta}>
              {trip.adults + trip.children} 👤 · {trip.nights} 🌙 ·{" "}
              {s[
                (`tt_${trip.tripType}`) as keyof TripStrings
              ]}
            </Text>
            <ProgressGauge done={progress.modulesDone} total={progress.modulesTotal} />
            {states.openCriticalIssues > 0 && (
              <Text style={styles.critical}>
                ● {states.openCriticalIssues} {s.criticalOpen}
              </Text>
            )}
            <View style={styles.nextBox}>
              <Text style={styles.nextLabel}>{s.nextStep}</Text>
              <Text style={styles.nextText}>→ {s[NA_KEY[action]]}</Text>
            </View>
          </Pressable>
        )}

        {dbReady && !trip && (
          <View style={styles.notice}>
            <Text style={styles.noticeText}>{s.noTripYet}</Text>
          </View>
        )}

        <View style={styles.quickGrid}>
          {quick(s.startTrip, "🧭", () => navigation.navigate("TripWizard", {}), !dbReady)}
          {quick(
            s.inspectCharter,
            "📋",
            () => navigation.navigate("TripWizard", { ownership: "charter" }),
            !dbReady
          )}
          {quick(
            s.prepareOwnBoat,
            "⚙️",
            () => navigation.navigate("TripWizard", { ownership: "own" }),
            !dbReady
          )}
          {draftInspectionId
            ? quick(s.resumeDraft, "▶️", () =>
                navigation.navigate("Inspect", { inspectionId: draftInspectionId })
              )
            : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.night },
  scroll: { padding: spacing.m, paddingBottom: spacing.xl },
  header: { alignItems: "center", marginVertical: spacing.m },
  compass: { fontSize: 36, color: colors.brass, marginBottom: 2 },
  title: { fontFamily: fonts.display, fontSize: 30, color: colors.paper, fontWeight: "700" },
  notice: {
    borderWidth: 1,
    borderColor: colors.rope,
    borderRadius: 8,
    padding: spacing.m,
    marginBottom: spacing.m,
  },
  noticeText: { fontFamily: fonts.body, fontSize: 13, color: colors.fog, textAlign: "center" },
  tripCard: {
    backgroundColor: colors.paper,
    borderRadius: 10,
    padding: spacing.m,
    gap: 8,
    marginBottom: spacing.m,
  },
  tripName: { fontFamily: fonts.display, fontSize: 20, fontWeight: "700", color: colors.ink },
  tripMeta: { fontFamily: fonts.body, fontSize: 13, color: colors.inkFaded },
  critical: { fontFamily: fonts.body, fontSize: 13, color: colors.signal, fontWeight: "700" },
  nextBox: {
    backgroundColor: "rgba(201,162,39,0.15)",
    borderRadius: 8,
    padding: 10,
    marginTop: 2,
  },
  nextLabel: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1, color: colors.brassDark },
  nextText: { fontFamily: fonts.body, fontSize: 14, color: colors.ink, marginTop: 2 },
  quickGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  quick: {
    flexBasis: "47%",
    flexGrow: 1,
    backgroundColor: colors.nightDeep,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 10,
    paddingVertical: 18,
    alignItems: "center",
    gap: 6,
  },
  quickIcon: { fontSize: 26 },
  quickText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.paper,
    textAlign: "center",
    paddingHorizontal: 6,
  },
});
