import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, SafeAreaView } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { listTrips, TripRow } from "../../repositories/trips";
import { isDbReady } from "../../db/state";
import { colors, fonts, spacing } from "../../theme";
import { RopeDivider } from "../../components/ui";
import { useLocale } from "../../i18n";
import { TRIP_STRINGS } from "../../i18n/trip";
import type { RootStackParamList } from "../../navigation";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function TripsScreen() {
  const navigation = useNavigation<Nav>();
  const { locale } = useLocale();
  const s = TRIP_STRINGS[locale];
  const [trips, setTrips] = useState<TripRow[]>([]);

  useFocusEffect(
    useCallback(() => {
      if (isDbReady()) setTrips(listTrips());
    }, [])
  );

  function group(title: string, rows: TripRow[]) {
    if (rows.length === 0) return null;
    return (
      <View key={title}>
        <RopeDivider label={title.toUpperCase()} />
        {rows.map((t) => (
          <Pressable
            key={t.id}
            onPress={() => navigation.navigate("TripDetail", { tripId: t.id })}
            accessibilityRole="button"
            style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
          >
            <Text style={styles.cardIcon}>⛵</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{t.name}</Text>
              <Text style={styles.cardSub}>
                {t.startAt ?? "—"} · 👤 {t.adults + t.children} · 🌙 {t.nights}
              </Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        ))}
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Pressable
          onPress={() => navigation.navigate("TripWizard")}
          accessibilityRole="button"
          style={({ pressed }) => [styles.primary, pressed && { opacity: 0.85 }]}
        >
          <Text style={styles.primaryText}>＋ {s.startTrip}</Text>
        </Pressable>
        {group(s.active, trips.filter((t) => t.status === "active"))}
        {group(s.planning, trips.filter((t) => t.status === "planning"))}
        {group(s.completedTrip, trips.filter((t) => t.status === "completed"))}
        {trips.length === 0 && <Text style={styles.empty}>{s.noTripYet}</Text>}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.night },
  scroll: { padding: spacing.m, paddingBottom: spacing.xl },
  primary: {
    backgroundColor: colors.brass,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: "center",
  },
  primaryText: { fontFamily: fonts.display, fontSize: 16, fontWeight: "700", color: colors.night },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.paper,
    borderRadius: 8,
    padding: spacing.m,
    marginBottom: spacing.s,
  },
  cardIcon: { fontSize: 22 },
  cardTitle: { fontFamily: fonts.display, fontSize: 16, fontWeight: "700", color: colors.ink },
  cardSub: { fontFamily: fonts.body, fontSize: 12, color: colors.inkFaded, marginTop: 2 },
  chevron: { fontSize: 24, color: colors.brassDark },
  empty: {
    fontFamily: fonts.body,
    fontStyle: "italic",
    fontSize: 13,
    color: colors.fog,
    textAlign: "center",
    marginTop: spacing.xl,
  },
});
