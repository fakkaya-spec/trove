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
import { colors, fonts, spacing, radius, touch } from "../../theme";
import { ProgressGauge, RopeDivider, Button } from "../../components/ui";
import { SampleBanner } from "../../components/trove/SampleBanner";
import { Icon, type IconName } from "../../components/Icon";
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

  // Modül durumu: renk + ikon birlikte (yalnız renge güvenilmez).
  function statusIcon(st: InspectionStatus | null) {
    if (st === null) return <Icon name="ellipse-outline" size={20} color={colors.textSecondary} />;
    if (isDone(st)) return <Icon name="checkmark-circle" size={22} color={colors.success} />;
    return <Icon name="time-outline" size={22} color={colors.warning} />;
  }

  function moduleCard(
    icon: IconName,
    title: string,
    status: React.ReactNode,
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
        <Icon name={icon} size={24} color={colors.text} />
        <View style={{ flex: 1 }}>
          <Text style={styles.moduleTitle}>{title}</Text>
          {extra ? <Text style={styles.moduleExtra}>{extra}</Text> : null}
        </View>
        {status}
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
        {trip.isSample && (
          <SampleBanner onCreate={() => navigation.navigate("Tabs", { screen: "VesselTab" })} />
        )}
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
                accessibilityRole="button"
                style={[styles.chip, trip.status === o.key && styles.chipActive]}
              >
                <Text style={[styles.chipText, trip.status === o.key && styles.chipTextActive]}>
                  {o.label}
                </Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.metaRow}>
            <Icon name="boat-outline" size={15} color={colors.textSecondary} />
            <Text style={styles.meta}>{boat ? boat.name : s.boatMissing}</Text>
            <Icon name="person-outline" size={15} color={colors.textSecondary} />
            <Text style={styles.meta}>{trip.adults + trip.children}</Text>
            <Icon name="time-outline" size={15} color={colors.textSecondary} />
            <Text style={styles.meta}>{trip.nights}</Text>
          </View>
          <ProgressGauge done={progress.modulesDone} total={progress.modulesTotal} />
          {states.openCriticalIssues > 0 && (
            <View style={styles.criticalRow}>
              <Icon name="warning-outline" size={16} color={colors.danger} />
              <Text style={styles.critical}>
                {states.openCriticalIssues} {s.criticalOpen}
              </Text>
            </View>
          )}
          <View style={styles.nextBox}>
            <Text style={styles.nextText}>{s[NA_KEY[action]]}</Text>
            <Icon name="arrow-forward" size={18} color={colors.onGold} />
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
                  accessibilityRole="button"
                  style={styles.chip}
                >
                  <Text style={styles.chipText}>{v.name}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        <RopeDivider />

        {isCharter &&
          moduleCard("clipboard-outline", s.checkIn, statusIcon(states.checkIn), () =>
            openChecklist("check_in")
          )}
        {moduleCard("partly-sunny-outline", s.preDeparture, statusIcon(states.preDeparture), () =>
          openChecklist("pre_departure")
        )}
        {moduleCard(
          "cart-outline",
          s.provisioning,
          provisionPct === null ? (
            <Icon name="ellipse-outline" size={20} color={colors.textSecondary} />
          ) : (
            <Text style={styles.modulePct}>{provisionPct}%</Text>
          ),
          openProvisioning
        )}
        {isCharter &&
          moduleCard("swap-horizontal-outline", s.checkOut, statusIcon(states.checkOut), () =>
            openChecklist("check_out")
          )}
        {isCharter &&
          states.checkIn !== null &&
          moduleCard(
            "git-compare-outline",
            s.handoverReview,
            <Icon name="chevron-forward" size={18} color={colors.textSecondary} />,
            () => navigation.navigate("HandoverReview", { tripId: trip.id })
          )}
        {moduleCard("lock-closed-outline", s.returnCheck, statusIcon(states.returnCheck), () =>
          openChecklist("return_secure")
        )}

        <RopeDivider />

        {!trip.isSample && (
        <Button
          label={s.deleteTrip}
          variant="danger"
          icon="close"
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
        />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.m, paddingBottom: spacing.xl },
  summaryCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.card,
    padding: spacing.m,
    gap: 10,
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
    paddingVertical: 8,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontFamily: fonts.body, fontSize: 13, color: colors.text },
  chipTextActive: { color: colors.onPrimary, fontWeight: "600" },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 4, flexWrap: "wrap" },
  meta: { fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary, marginRight: 8 },
  criticalRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  critical: { fontFamily: fonts.body, fontSize: 14, color: colors.danger, fontWeight: "600" },
  nextBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.gold,
    borderRadius: radius.control,
    padding: 12,
    minHeight: touch.min,
  },
  nextText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 15,
    fontWeight: "600",
    color: colors.onGold,
  },
  boatPicker: { marginTop: spacing.m },
  fieldLabel: {
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  module: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.card,
    padding: spacing.m,
    marginBottom: spacing.s,
    minHeight: 64,
  },
  moduleTitle: { fontFamily: fonts.body, fontSize: 17, fontWeight: "600", color: colors.text },
  moduleExtra: { fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  modulePct: { fontFamily: fonts.mono, fontSize: 15, color: colors.text, fontWeight: "600" },
});
