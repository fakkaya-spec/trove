import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, SafeAreaView } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { T, TSH, TICON } from "../../../theme";
import { LIcon, type LIconName } from "../../../components/LIcon";
import { Bar, KeelLine, Pill, TDivider } from "../../../components/trove/primitives";
import {
  getTripModuleStates,
  updateTripStatus,
  TripRow,
} from "../../../repositories/trips";
import { getVesselById } from "../../../repositories/vessels";
import { getPlanForTrip, planProgress } from "../../../repositories/provisioning";
import { isDone, TripModuleStates } from "../../../domain/trip";
import type { ShoppingProgress } from "../../../domain/provisioning";
import { tripChecklistProgress, ChecklistProgress } from "./checklistData";
import { useLocale } from "../../../i18n";
import { TRIP_STRINGS } from "../../../i18n/trip";
import { PREPARE_STRINGS } from "../../../i18n/prepare";
import type { RootStackParamList } from "../../../navigation";

type Nav = NativeStackNavigationProp<RootStackParamList>;

// trip_plan — hazırlık hub'ı (onaylı tasarım: design-reference TripPlanScreen).
// TripHome'un "gerçek sefer var" içeriğidir; modül durumları mevcut
// domain/tripProgress verisinden değil, hazırlık kartlarının kendi done
// kümesinden hesaplanır (tasarımdaki "Ready to depart X of N").

interface SetupCard {
  key: string;
  icon: LIconName;
  label: string;
  sub: string;
  done: boolean;
  onPress: () => void;
}

export function TripPrepareHub({
  trip,
  onChanged,
}: {
  trip: TripRow;
  /** Sefer durumu değişince ebeveyni (faz yönlendirmesi) tazeler. */
  onChanged?: () => void;
}) {
  const navigation = useNavigation<Nav>();
  const { locale } = useLocale();
  const s = TRIP_STRINGS[locale];
  const p = PREPARE_STRINGS[locale];

  const [states, setStates] = useState<TripModuleStates | null>(null);
  const [shopping, setShopping] = useState<ShoppingProgress | null>(null);
  const [planDays, setPlanDays] = useState<number | null>(null);
  const [predep, setPredep] = useState<ChecklistProgress | null>(null);
  const [checkin, setCheckin] = useState<ChecklistProgress | null>(null);

  useFocusEffect(
    useCallback(() => {
      setStates(getTripModuleStates(trip));
      const plan = getPlanForTrip(trip.id);
      setShopping(plan ? planProgress(plan.id) : null);
      setPlanDays(plan?.inputs?.days ?? null);
      setPredep(tripChecklistProgress(trip.id, "pre_departure"));
      setCheckin(tripChecklistProgress(trip.id, "check_in"));
    }, [trip])
  );

  if (!states) return <SafeAreaView style={styles.safe} />;

  const isCharter = trip.ownershipContext === "charter";
  const boat = trip.boatId ? getVesselById(trip.boatId) : null;

  const crewCount = (trip.skipperName ? 1 : 0) + trip.crewNames.length;
  const guestCount = Math.max(trip.adults + trip.children - crewCount, 0);

  const cards: SetupCard[] = [
    {
      key: "crew",
      icon: "users",
      label: p.crewGuests,
      sub:
        crewCount > 0
          ? `${crewCount} ${p.crewSection.toLowerCase()} · ${guestCount} ${p.guestsSection.toLowerCase()}`
          : p.notStarted,
      done: crewCount > 0,
      onPress: () => navigation.navigate("TripCrew", { tripId: trip.id }),
    },
    {
      key: "provisions",
      icon: "utensils",
      label: s.provisioning,
      sub: planDays !== null ? `${planDays} ${p.calculatedSuffix}` : p.notCalculated,
      done: planDays !== null,
      onPress: () => navigation.navigate("TripProvisions", { tripId: trip.id }),
    },
    {
      key: "shopping",
      icon: "shopping-cart",
      label: p.shoppingList,
      sub: shopping
        ? shopping.percent === 100
          ? `${shopping.toBuyItems} ${p.itemsWord} · ${p.doneWord}`
          : `${shopping.toBuyItems} ${p.itemsWord} · ${
              shopping.toBuyItems - shopping.purchasedOrPacked
            } ${p.remainingWord}`
        : p.notStarted,
      done: shopping !== null && shopping.percent === 100,
      onPress: () =>
        shopping
          ? navigation.navigate("TripShopping", { tripId: trip.id })
          : navigation.navigate("TripProvisions", { tripId: trip.id }),
    },
    {
      key: "predep",
      icon: "check-circle",
      label: p.predepChecklist,
      sub: predep ? `${predep.done} ${p.ofWord} ${predep.total} ${p.itemsWord}` : p.notStarted,
      done: isDone(states.preDeparture),
      onPress: () => navigation.navigate("TripPredep", { tripId: trip.id }),
    },
  ];
  if (isCharter) {
    cards.push({
      key: "checkin",
      icon: "shield",
      label: p.checkinInspection,
      sub: checkin
        ? `${checkin.done} ${p.ofWord} ${checkin.total} ${p.itemsWord}`
        : p.notStarted,
      done: isDone(states.checkIn),
      onPress: () => navigation.navigate("TripCheckin", { tripId: trip.id }),
    });
  }

  const ready = cards.filter((c) => c.done).length;
  const pct = (ready / cards.length) * 100;
  const complete = pct === 100;

  const dates =
    trip.startAt && trip.endAt ? `${trip.startAt} – ${trip.endAt}` : (trip.startAt ?? "");
  const heroMeta = [boat?.name, dates].filter(Boolean).join(" · ");
  const statusLabel = trip.status === "active" ? s.active : s.planning;

  // Gerçek geçiş (Faz 6): sefer aktifleşir, Trip sekmesi Underway'i çizer.
  function beginTrip() {
    updateTripStatus(trip.id, "active");
    onChanged?.();
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Koyu sefer hero'su — dokununca sefer detayı (durum/sil) */}
        <Pressable
          onPress={() => navigation.navigate("TripDetail", { tripId: trip.id })}
          accessibilityRole="button"
          accessibilityLabel={trip.name}
          style={({ pressed }) => [styles.hero, pressed && { opacity: 0.92 }]}
        >
          <Pill text={statusLabel} type="ghost" />
          <Text style={styles.heroTitle} numberOfLines={2}>
            {trip.destination ?? trip.name}
          </Text>
          {heroMeta ? <Text style={styles.heroMeta}>{heroMeta}</Text> : null}
        </Pressable>

        <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
          {/* Ready to depart */}
          <View style={{ marginBottom: 20 }}>
            <View style={styles.readyRow}>
              <Text style={styles.readyLabel}>{p.readyToDepart}</Text>
              <Text style={styles.readyCount}>
                {ready} {p.ofWord} {cards.length}
              </Text>
            </View>
            <Bar pct={pct} h={3} color={complete ? T.green : T.blue} />
          </View>

          {cards.map((c) => (
            <Pressable
              key={c.key}
              onPress={c.onPress}
              accessibilityRole="button"
              accessibilityLabel={c.label}
              style={({ pressed }) => [
                styles.card,
                c.done && styles.cardDone,
                pressed && { opacity: 0.85 },
              ]}
            >
              {c.done && <KeelLine />}
              <View style={[styles.cardInner, c.done && { paddingLeft: 6 }]}>
                <View style={[styles.cardIcon, c.done && { backgroundColor: T.greenL }]}>
                  <LIcon name={c.icon} size={TICON.md} color={c.done ? T.green : T.ink2} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardLabel}>{c.label}</Text>
                  <Text style={[styles.cardSub, c.done && { color: T.green }]}>{c.sub}</Text>
                </View>
                <LIcon
                  name={c.done ? "check" : "chevron-right"}
                  size={TICON.sm}
                  color={c.done ? T.green : T.ink3}
                />
              </View>
            </Pressable>
          ))}

          <TDivider />

          <Pressable
            onPress={beginTrip}
            disabled={!complete}
            accessibilityRole="button"
            accessibilityLabel={complete ? p.allSetBegin : p.completeToDepart}
            style={({ pressed }) => [
              styles.cta,
              { backgroundColor: complete ? T.blue : T.surfaceEl },
              pressed && { opacity: 0.85 },
            ]}
          >
            <Text style={[styles.ctaText, { color: complete ? "#FFFFFF" : T.ink3 }]}>
              {complete ? p.allSetBegin : p.completeToDepart}
            </Text>
          </Pressable>
          {boat ? (
            <Text style={styles.footNote}>
              {[boat.name, boat.model, trip.startAt].filter(Boolean).join(" · ")}
            </Text>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.bg },
  hero: { backgroundColor: T.vessel, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 },
  heroTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.6,
    lineHeight: 29,
    marginTop: 8,
    marginBottom: 3,
  },
  heroMeta: { fontSize: 13, color: "rgba(255,255,255,0.54)" },
  readyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 7,
  },
  readyLabel: { fontSize: 12, fontWeight: "600", color: T.ink1 },
  readyCount: { fontFamily: T.mono, fontSize: 11, color: T.ink2 },
  card: {
    backgroundColor: T.surface,
    borderRadius: T.r,
    borderWidth: 1,
    borderColor: T.rule,
    marginBottom: 6,
    overflow: "hidden",
    ...TSH.sh0,
  },
  cardDone: { borderColor: "rgba(0,135,90,0.16)" },
  cardInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 13,
    paddingHorizontal: 14,
  },
  cardIcon: {
    width: 36,
    height: 36,
    borderRadius: T.r3,
    backgroundColor: T.surfaceEl,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  cardLabel: { fontSize: 13, fontWeight: "600", color: T.ink0, marginBottom: 2 },
  cardSub: { fontSize: 11, color: T.ink2 },
  cta: {
    borderRadius: T.r,
    paddingVertical: 15,
    alignItems: "center",
    minHeight: 48,
    justifyContent: "center",
  },
  ctaText: { fontSize: 14, fontWeight: "700", letterSpacing: -0.2 },
  footNote: { fontSize: 11, color: T.ink3, textAlign: "center", marginTop: 8 },
});
