import React from "react";
import { View, Text, StyleSheet, Pressable, SafeAreaView, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { T, TSH, TICON } from "../../../theme";
import { LIcon } from "../../../components/LIcon";
import { Pill } from "../../../components/trove/primitives";
import { TripRow } from "../../../repositories/trips";
import { useLocale } from "../../../i18n";
import { UNDERWAY_STRINGS } from "../../../i18n/underway";
import type { RootStackParamList } from "../../../navigation";

type Nav = NativeStackNavigationProp<RootStackParamList>;

// Sefer tamamlandı durumu — kompakt, dürüst kapanış: rapor/teslim sonraki
// fazda; seyir defteri okunur kalır; yeni sefer buradan başlar. Ölü uç yok.

export function TripCompleteState({ trip }: { trip: TripRow }) {
  const navigation = useNavigation<Nav>();
  const { locale } = useLocale();
  const u = UNDERWAY_STRINGS[locale];

  const dates = trip.startAt && trip.endAt ? `${trip.startAt} – ${trip.endAt}` : "";

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <LIcon name="check-circle" size={26} color={T.green} />
          </View>
          <Pill text={u.tripCompletedTitle} type="ok" />
          <Text style={styles.title} numberOfLines={2}>
            {trip.destination ?? trip.name}
          </Text>
          {dates ? <Text style={styles.dates}>{dates}</Text> : null}
          <Text style={styles.body}>{u.tripCompletedBody}</Text>
        </View>

        <Pressable
          onPress={() => navigation.navigate("TripWizard", {})}
          accessibilityRole="button"
          accessibilityLabel={u.startNewTrip}
          style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.85 }]}
        >
          <Text style={styles.primaryText}>{u.startNewTrip}</Text>
        </Pressable>
        <Pressable
          onPress={() => navigation.navigate("TripDetail", { tripId: trip.id })}
          accessibilityRole="button"
          accessibilityLabel={u.openDetail}
          style={({ pressed }) => [styles.secondaryBtn, pressed && { opacity: 0.8 }]}
        >
          <Text style={styles.secondaryText}>{u.openDetail}</Text>
          <LIcon name="chevron-right" size={TICON.sm} color={T.ink3} />
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.bg },
  scroll: { padding: 16, paddingTop: 24, paddingBottom: 40 },
  card: {
    backgroundColor: T.surface,
    borderRadius: T.r,
    borderWidth: 1,
    borderColor: T.rule,
    padding: 20,
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 16,
    ...TSH.sh1,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: T.greenL,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  title: { fontSize: 22, fontWeight: "700", color: T.ink0, letterSpacing: -0.5 },
  dates: { fontSize: 12, color: T.ink2 },
  body: { fontSize: 13, color: T.ink2, lineHeight: 19, marginTop: 4 },
  primaryBtn: {
    backgroundColor: T.blue,
    borderRadius: T.r,
    paddingVertical: 15,
    alignItems: "center",
    minHeight: 48,
    justifyContent: "center",
    marginBottom: 8,
  },
  primaryText: { fontSize: 14, fontWeight: "700", color: "#FFFFFF" },
  secondaryBtn: {
    backgroundColor: T.surface,
    borderRadius: T.r,
    borderWidth: 1,
    borderColor: T.rule,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 48,
  },
  secondaryText: { fontSize: 13, fontWeight: "600", color: T.ink1 },
});
