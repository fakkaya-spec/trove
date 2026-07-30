import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, SafeAreaView } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { listTrips, TripRow } from "../../repositories/trips";
import { isDbReady } from "../../db/state";
import { colors, fonts, spacing, radius, touch } from "../../theme";
import { RopeDivider, Button, EmptyState } from "../../components/ui";
import { Icon } from "../../components/Icon";
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
            <Icon name="boat-outline" size={22} color={colors.text} />
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{t.name}</Text>
              <View style={styles.subRow}>
                <Text style={styles.cardSub}>{t.startAt ?? "—"}</Text>
                <Icon name="person-outline" size={13} color={colors.textSecondary} />
                <Text style={styles.cardSub}>{t.adults + t.children}</Text>
                <Icon name="time-outline" size={13} color={colors.textSecondary} />
                <Text style={styles.cardSub}>{t.nights}</Text>
              </View>
            </View>
            <Icon name="chevron-forward" size={18} color={colors.textSecondary} />
          </Pressable>
        ))}
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {group(s.active, trips.filter((t) => t.status === "active"))}
        {group(s.planning, trips.filter((t) => t.status === "planning"))}
        {group(s.completedTrip, trips.filter((t) => t.status === "completed"))}
        {trips.length === 0 && (
          <EmptyState
            icon="compass-outline"
            title={s.noTripYet}
            actionLabel={s.startTrip}
            onAction={() => navigation.navigate("TripWizard", {})}
          />
        )}
      </ScrollView>
      {/* Uzun listede birincil aksiyon sabit alt çubukta kalır */}
      {trips.length > 0 && (
        <View style={styles.bottomBar}>
          <Button
            label={s.startTrip}
            icon="add"
            onPress={() => navigation.navigate("TripWizard", {})}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.m, paddingBottom: spacing.xl },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: touch.row,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.card,
    padding: spacing.m,
    marginBottom: spacing.s,
  },
  cardTitle: { fontFamily: fonts.body, fontSize: 17, fontWeight: "600", color: colors.text },
  subRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 3 },
  cardSub: { fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary, marginRight: 6 },
  bottomBar: {
    padding: spacing.m,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
