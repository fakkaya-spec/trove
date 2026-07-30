import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  SafeAreaView,
  Alert,
} from "react-native";
import { useFocusEffect, useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  deleteTrip,
  ensureTripInspection,
  getTrip,
  getTripModuleStates,
  setTripBoat,
  TripRow,
  updateTripStatus,
} from "../../repositories/trips";
import { getVesselById, listVessels } from "../../repositories/vessels";
import { generatePlan, getPlanForTrip, planProgress } from "../../repositories/provisioning";
import { nextAction, tripProgress, NextAction, TripModuleStates, isDone } from "../../domain/trip";
import { InspectionStatus } from "../../domain/types";
import { colors, fonts, spacing } from "../../theme";
import { ProgressGauge, RopeDivider } from "../../components/ui";
import { useLocale } from "../../i18n";
import { TRIP_STRINGS, TripStrings } from "../../i18n/trip";
import type { RootStackParamList } from "../../navigation";

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, "TripDetail">;

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

export default function TripDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { locale } = useLocale();
  const s = TRIP_STRINGS[locale];

  const [trip, setTrip] = useState<TripRow | null>(null);
  const [states, setStates] = useState<TripModuleStates | null>(null);
  const [provisionPct, setProvisionPct] = useState<number | null>(null);
  const [showBoatPicker, setShowBoatPicker] = useState(false);

  const refresh = useCallback(() => {
    const t = getTrip(route.params.tripId);
    setTrip(t);
    if (t) {
      setStates(getTripModuleStates(t));
      const plan = getPlanForTrip(t.id);
      setProvisionPct(plan ? planProgress(plan.id).percent : null);
      navigation.setOptions({ title: t.name });
    }
  }, [route.params.tripId, navigation]);

  useFocusEffect(refresh);

  if (!trip || !states) return null;

  const isCharter = trip.ownershipContext === "charter";
  const boat = trip.boatId ? getVesselById(trip.boatId) : null;
  const progress = tripProgress(states, isCharter);
  const action = nextAction(states, isCharter);

  function openChecklist(kind: "check_in" | "check_out" | "pre_departure" | "return_secure") {
    if (!trip) return;
    if (!trip.boatId || !boat) {
      Alert.alert(s.boatMissing, s.chooseBoatFirst);
      setShowBoatPicker(true);
      return;
    }
    const inspectionId = ensureTripInspection(trip, kind, boat.type);
    navigation.navigate("Inspect", { inspectionId });
  }

  function openProvisioning() {
    if (!trip) return;
    generatePlan(trip, locale);
    navigation.navigate("Provisioning", { tripId: trip.id });
  }

  function statusLabel(st: InspectionStatus | null): string {
    if (st === null) return "○";
    if (isDone(st)) return "✓";
    return "…";
  }

  function moduleCard(
    icon: string,
    title: string,
    status: string,
    onPress: () => void,
    extra?: string
  ) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={title}
        style={({ pressed }) => [styles.module, pressed && { opacity: 0.85 }]}
      >
        <Text style={styles.moduleIcon}>{icon}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.moduleTitle}>{title}</Text>
          {extra ? <Text style={styles.moduleExtra}>{extra}</Text> : null}
        </View>
        <Text style={styles.moduleStatus}>{status}</Text>
      </Pressable>
    );
  }

  const statusOptions: { key: TripRow["status"]; label: string }[] = [
    { key: "planning", label: s.planning },
    { key: "active", label: s.active },
    { key: "completed", label: s.completedTrip },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Durum + özet */}
        <View style={styles.summaryCard}>
          <View style={styles.chipRow}>
            {statusOptions.map((o) => (
              <Pressable
                key={o.key}
                onPress={() => {
                  updateTripStatus(trip.id, o.key);
                  refresh();
                }}
                style={[styles.chip, trip.status === o.key && styles.chipActive]}
              >
                <Text style={[styles.chipText, trip.status === o.key && styles.chipTextActive]}>
                  {o.label}
                </Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.meta}>
            ⛵ {boat ? boat.name : s.boatMissing} · 👤 {trip.adults + trip.children} · 🌙{" "}
            {trip.nights}
          </Text>
          <ProgressGauge done={progress.modulesDone} total={progress.modulesTotal} />
          {states.openCriticalIssues > 0 && (
            <Text style={styles.critical}>
              ● {states.openCriticalIssues} {s.criticalOpen}
            </Text>
          )}
          <View style={styles.nextBox}>
            <Text style={styles.nextText}>→ {s[NA_KEY[action]]}</Text>
          </View>
        </View>

        {/* Tekne seçici (eksikse) */}
        {(!boat || showBoatPicker) && (
          <View style={styles.boatPicker}>
            <Text style={styles.fieldLabel}>{s.chooseBoatFirst}</Text>
            <View style={styles.chipRow}>
              {listVessels().map((v) => (
                <Pressable
                  key={v.id}
                  onPress={() => {
                    setTripBoat(trip.id, v.id);
                    setShowBoatPicker(false);
                    refresh();
                  }}
                  style={styles.chip}
                >
                  <Text style={styles.chipText}>⛵ {v.name}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        <RopeDivider />

        {isCharter &&
          moduleCard("📋", s.checkIn, statusLabel(states.checkIn), () => openChecklist("check_in"))}
        {moduleCard("🌤️", s.preDeparture, statusLabel(states.preDeparture), () =>
          openChecklist("pre_departure")
        )}
        {moduleCard(
          "🛒",
          s.provisioning,
          provisionPct === null ? "○" : `${provisionPct}%`,
          openProvisioning
        )}
        {isCharter &&
          moduleCard("🔁", s.checkOut, statusLabel(states.checkOut), () =>
            openChecklist("check_out")
          )}
        {isCharter &&
          states.checkIn !== null &&
          moduleCard("🆚", s.handoverReview, "›", () =>
            navigation.navigate("HandoverReview", { tripId: trip.id })
          )}
        {moduleCard("🔒", s.returnCheck, statusLabel(states.returnCheck), () =>
          openChecklist("return_secure")
        )}

        <RopeDivider />

        <Pressable
          onPress={() =>
            Alert.alert(s.deleteTrip, s.deleteTripConfirm, [
              { text: s.cancel, style: "cancel" },
              {
                text: s.deleteTrip,
                style: "destructive",
                onPress: () => {
                  deleteTrip(trip.id);
                  navigation.goBack();
                },
              },
            ])
          }
          accessibilityRole="button"
          style={({ pressed }) => [styles.deleteBtn, pressed && { opacity: 0.7 }]}
        >
          <Text style={styles.deleteText}>🗑 {s.deleteTrip}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.night },
  scroll: { padding: spacing.m, paddingBottom: spacing.xl },
  summaryCard: { backgroundColor: colors.paper, borderRadius: 10, padding: spacing.m, gap: 10 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: colors.rope,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  chipActive: { backgroundColor: colors.brassDark, borderColor: colors.brassDark },
  chipText: { fontFamily: fonts.body, fontSize: 13, color: colors.inkFaded },
  chipTextActive: { color: colors.paper, fontWeight: "700" },
  meta: { fontFamily: fonts.body, fontSize: 13, color: colors.inkFaded },
  critical: { fontFamily: fonts.body, fontSize: 13, color: colors.signal, fontWeight: "700" },
  nextBox: { backgroundColor: "rgba(201,162,39,0.15)", borderRadius: 8, padding: 10 },
  nextText: { fontFamily: fonts.body, fontSize: 14, color: colors.ink },
  boatPicker: { marginTop: spacing.m },
  fieldLabel: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1,
    color: colors.brass,
    marginBottom: 6,
  },
  module: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.nightDeep,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 10,
    padding: spacing.m,
    marginBottom: spacing.s,
    minHeight: 64,
  },
  moduleIcon: { fontSize: 24 },
  moduleTitle: { fontFamily: fonts.display, fontSize: 16, fontWeight: "700", color: colors.paper },
  moduleExtra: { fontFamily: fonts.body, fontSize: 12, color: colors.fog, marginTop: 2 },
  moduleStatus: { fontFamily: fonts.mono, fontSize: 16, color: colors.brass },
  deleteBtn: { alignItems: "center", paddingVertical: 12 },
  deleteText: { fontFamily: fonts.body, fontSize: 14, color: colors.signal },
});
