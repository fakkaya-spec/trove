import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, SafeAreaView } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { TroveMark } from "../../components/brand/TroveMark";
import { TroveWordmark } from "../../components/brand/TroveWordmark";
import { isDbReady } from "../../db/state";
import { listTrips, getTripModuleStates, TripRow } from "../../repositories/trips";
import { listInspections } from "../../repositories/inspections";
import { nextAction, tripProgress, NextAction, TripModuleStates } from "../../domain/trip";
import { colors, fonts, spacing, radius, touch } from "../../theme";
import { ProgressGauge, EmptyState } from "../../components/ui";
import { Icon, type IconName } from "../../components/Icon";
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

  function quick(
    label: string,
    icon: IconName,
    onPress: () => void,
    opts: { disabled?: boolean; accent?: boolean } = {}
  ) {
    return (
      <Pressable
        key={label}
        onPress={onPress}
        disabled={opts.disabled}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={({ pressed }) => [
          styles.quick,
          opts.accent && styles.quickAccent,
          pressed && { opacity: 0.85 },
          opts.disabled && { opacity: 0.4 },
        ]}
      >
        <Icon name={icon} size={26} color={colors.text} />
        <Text style={styles.quickText}>{label}</Text>
      </Pressable>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Üst yarı: yalnız bilgi */}
        <View style={styles.brandRow}>
          <TroveMark size={22} color={colors.text} />
          <TroveWordmark height={14} color={colors.text} />
        </View>

        {!dbReady && (
          <View style={styles.notice}>
            <Icon name="alert-circle-outline" size={20} color={colors.warning} />
            <Text style={styles.noticeText}>{si.notAvailable}</Text>
          </View>
        )}

        {dbReady && trip && states && progress && action && (
          <Pressable
            onPress={() => navigation.navigate("TripDetail", { tripId: trip.id })}
            accessibilityRole="button"
            style={({ pressed }) => [styles.tripCard, pressed && { opacity: 0.9 }]}
          >
            <View style={styles.tripNameRow}>
              <Icon name="boat-outline" size={22} color={colors.text} />
              <Text style={styles.tripName} numberOfLines={1}>
                {trip.name}
              </Text>
              <Icon name="chevron-forward" size={18} color={colors.textSecondary} />
            </View>
            <View style={styles.metaRow}>
              <Icon name="person-outline" size={15} color={colors.textSecondary} />
              <Text style={styles.tripMeta}>{trip.adults + trip.children}</Text>
              <Icon name="time-outline" size={15} color={colors.textSecondary} />
              <Text style={styles.tripMeta}>{trip.nights}</Text>
              <Text style={styles.tripMeta}>
                · {s[(`tt_${trip.tripType}`) as keyof TripStrings]}
              </Text>
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
              <View style={{ flex: 1 }}>
                <Text style={styles.nextLabel}>{s.nextStep.toUpperCase()}</Text>
                <Text style={styles.nextText}>{s[NA_KEY[action]]}</Text>
              </View>
              <Icon name="arrow-forward" size={20} color={colors.onGold} />
            </View>
          </Pressable>
        )}

        {dbReady && !trip && (
          <EmptyState
            icon="boat-outline"
            title={s.noTripYet}
            actionLabel={s.startTrip}
            onAction={() => navigation.navigate("TripWizard", {})}
          />
        )}

        {/* Boşluk: aksiyonları alt yarıya iter (başparmak bölgesi) */}
        <View style={styles.spacer} />

        <View style={styles.quickGrid}>
          {draftInspectionId
            ? quick(
                s.resumeDraft,
                "play",
                () => navigation.navigate("Inspect", { inspectionId: draftInspectionId }),
                { accent: true }
              )
            : null}
          {quick(s.startTrip, "navigate-outline", () => navigation.navigate("TripWizard", {}), {
            disabled: !dbReady,
          })}
          {quick(
            s.inspectCharter,
            "clipboard-outline",
            () => navigation.navigate("TripWizard", { ownership: "charter" }),
            { disabled: !dbReady }
          )}
          {quick(
            s.prepareOwnBoat,
            "construct-outline",
            () => navigation.navigate("TripWizard", { ownership: "own" }),
            { disabled: !dbReady }
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.m, paddingBottom: spacing.l, flexGrow: 1 },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginVertical: spacing.s,
  },
  notice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.warningBg,
    borderRadius: radius.card,
    padding: spacing.m,
    marginBottom: spacing.m,
  },
  noticeText: { flex: 1, fontFamily: fonts.body, fontSize: 14, lineHeight: 20, color: colors.warning },
  tripCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.m,
    gap: 10,
  },
  tripNameRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  tripName: {
    flex: 1,
    fontFamily: fonts.display,
    fontSize: 20,
    fontWeight: "600",
    color: colors.text,
  },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  tripMeta: { fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary, marginRight: 8 },
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
    marginTop: 2,
  },
  nextLabel: { fontFamily: fonts.body, fontSize: 10, letterSpacing: 1, color: colors.onGold, opacity: 0.7 },
  nextText: { fontFamily: fonts.body, fontSize: 15, fontWeight: "600", color: colors.onGold, marginTop: 1 },
  spacer: { flexGrow: 1, minHeight: spacing.l },
  quickGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  quick: {
    flexBasis: "47%",
    flexGrow: 1,
    minHeight: touch.min,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.card,
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.s,
    alignItems: "center",
    gap: 8,
  },
  quickAccent: { backgroundColor: colors.gold, borderColor: colors.gold },
  quickText: {
    fontFamily: fonts.body,
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    textAlign: "center",
    paddingHorizontal: 4,
  },
});
