import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, SafeAreaView, Alert } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { T, TSH, TICON } from "../../../theme";
import { LIcon } from "../../../components/LIcon";
import { Bar, Pill, SLabel, TCard, TDivider } from "../../../components/trove/primitives";
import { TripRow } from "../../../repositories/trips";
import { getVesselById } from "../../../repositories/vessels";
import { getPlanForTrip, planProgress } from "../../../repositories/provisioning";
import {
  listOpenObservations,
  LogEntryRow,
  resolveLogEntry,
} from "../../../repositories/log";
import { tripDayOf, tripDays, TripDayInfo } from "../../../domain/trip";
import { formatOccurredAt } from "../../../domain/log";
import type { ShoppingProgress } from "../../../domain/provisioning";
import { useLocale } from "../../../i18n";
import { TRIP_STRINGS } from "../../../i18n/trip";
import { PREPARE_STRINGS } from "../../../i18n/prepare";
import { UNDERWAY_STRINGS, fmtDayOf } from "../../../i18n/underway";
import type { RootStackParamList } from "../../../navigation";

type Nav = NativeStackNavigationProp<RootStackParamList>;

// trip_underway — seyir hâlindeki seferin yoldaş yüzeyi (onaylı tasarım:
// design-reference UnderwayScreen). 3 saniyede "şu an neye dikkat etmeliyim?"
// sorusunu yanıtlar; tüm etkileşim 10 saniyede biter (Aç→Anla→Kaydet→Kapat).
// Kompozisyon yüzeyidir: yeni veri girişi yolu YOK (tek yakalama yolu Log);
// tamamen yerel okuma, ağ çağrısı yok. Hiyerarşi: bugünün seferi ÖNCE,
// sorunlar sonra. Hava durumu bilinçli olarak YOK (sahte veri yasak) —
// hero altı gelecekteki hava/rota modülünün genişleme noktasıdır.

export function UnderwayScreen({ trip }: { trip: TripRow }) {
  const navigation = useNavigation<Nav>();
  const { locale } = useLocale();
  const u = UNDERWAY_STRINGS[locale];
  const p = PREPARE_STRINGS[locale];
  const s = TRIP_STRINGS[locale];

  const [dayInfo, setDayInfo] = useState<TripDayInfo | null>(null);
  const [open, setOpen] = useState<LogEntryRow[]>([]);
  const [shopping, setShopping] = useState<ShoppingProgress | null>(null);

  const load = useCallback(() => {
    setDayInfo(tripDayOf(trip.startAt, tripDays(trip.tripType, trip.nights), new Date().toISOString()));
    setOpen(listOpenObservations(trip.id));
    const plan = getPlanForTrip(trip.id);
    setShopping(plan ? planProgress(plan.id) : null);
  }, [trip]);

  useFocusEffect(load);

  const boat = trip.boatId ? getVesselById(trip.boatId) : null;
  const crewCount = (trip.skipperName ? 1 : 0) + trip.crewNames.length;
  const guestCount = Math.max(trip.adults + trip.children - crewCount, 0);
  const heroMeta = [
    boat?.name,
    crewCount > 0 ? `${crewCount} ${p.crewSection.toLowerCase()}` : null,
    guestCount > 0 ? `${guestCount} ${p.guestsSection.toLowerCase()}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const people = [
    ...(trip.skipperName ? [trip.skipperName] : []),
    ...trip.crewNames,
  ].slice(0, 6);

  function onResolve(entry: LogEntryRow) {
    resolveLogEntry(entry.id);
    load();
  }

  function onEndTrip() {
    const isCharter = trip.ownershipContext === "charter";
    Alert.alert(u.endTripConfirmTitle, isCharter ? u.endTripBodyCharter : u.endTripBodyOwn, [
      { text: s.cancel, style: "cancel" },
      {
        text: u.endTripGo,
        onPress: () =>
          isCharter
            ? navigation.navigate("TripDetail", { tripId: trip.id })
            : navigation.navigate("TripReturn", { tripId: trip.id }),
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Koyu hero: önce bugünün seferi — dokununca sefer detayı */}
        <Pressable
          onPress={() => navigation.navigate("TripDetail", { tripId: trip.id })}
          accessibilityRole="button"
          accessibilityLabel={trip.name}
          style={({ pressed }) => [styles.hero, pressed && { opacity: 0.92 }]}
        >
          <View style={styles.heroTop}>
            {dayInfo ? (
              <Pill text={fmtDayOf(u, dayInfo.day, dayInfo.totalDays)} type="ghost" />
            ) : (
              <View />
            )}
            {dayInfo?.overdue ? <Text style={styles.overdue}>{u.returnOverdue}</Text> : null}
          </View>
          <Text style={styles.heroTitle} numberOfLines={2}>
            {trip.destination ?? trip.name}
          </Text>
          {heroMeta ? <Text style={styles.heroMeta}>{heroMeta}</Text> : null}
          {/* Genişleme noktası: hava/rota modülü (gelecek faz; sahte veri yok) */}
        </Pressable>

        <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
          {/* Birincil eylem: hızlı kayıt */}
          <Pressable
            onPress={() => navigation.navigate("AddLog")}
            accessibilityRole="button"
            accessibilityLabel={u.logSomething}
            style={({ pressed }) => [styles.logCard, pressed && { opacity: 0.85 }]}
          >
            <View style={styles.logIcon}>
              <LIcon name="plus" size={TICON.md} color={T.blue} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.logTitle}>{u.logSomething}</Text>
              <Text style={styles.logSub}>{u.logSomethingSub}</Text>
            </View>
          </Pressable>

          {/* Açık gözlemler — sakin izleme listesi */}
          <SLabel
            mt={20}
            action={u.viewAll}
            onAction={() => navigation.navigate("Tabs", { screen: "LogTab" })}
          >
            {u.openObservations}
          </SLabel>
          {open.length === 0 ? (
            <Text style={styles.allClear}>{u.noOpenItems}</Text>
          ) : (
            open.map((e) => (
              <View key={e.id} style={styles.obsCard}>
                <View style={styles.obsKeel} />
                <View style={{ flex: 1, paddingLeft: 8 }}>
                  <Text style={styles.obsTitle} numberOfLines={2}>
                    {e.title}
                  </Text>
                  <Text style={styles.obsMeta} numberOfLines={1}>
                    {[e.place, formatOccurredAt(e.occurredAt, locale)].filter(Boolean).join(" · ")}
                  </Text>
                </View>
                <Pressable
                  onPress={() => onResolve(e)}
                  accessibilityRole="button"
                  accessibilityLabel={`${u.resolveA11y}: ${e.title}`}
                  style={({ pressed }) => [styles.resolveBtn, pressed && { opacity: 0.7 }]}
                >
                  <View style={styles.resolveCircle}>
                    <LIcon name="check" size={11} color={T.green} />
                  </View>
                </Pressable>
              </View>
            ))
          )}

          {/* İkmal & alışveriş (yalnız plan varsa — sahte kart yok) */}
          {shopping && (
            <>
              <SLabel
                mt={20}
                action={u.viewAll}
                onAction={() => navigation.navigate("TripShopping", { tripId: trip.id })}
              >
                {p.shoppingList}
              </SLabel>
              <Pressable
                onPress={() => navigation.navigate("TripShopping", { tripId: trip.id })}
                accessibilityRole="button"
                accessibilityLabel={p.shoppingList}
              >
                <TCard pv={12} ph={16} mb={0}>
                  <View style={styles.shopRow}>
                    <Text style={styles.shopTitle}>{p.shoppingList}</Text>
                    <Pill
                      text={
                        shopping.percent === 100
                          ? p.doneWord
                          : `${shopping.toBuyItems - shopping.purchasedOrPacked} ${p.remainingWord}`
                      }
                      type={shopping.percent === 100 ? "ok" : "neutral"}
                    />
                  </View>
                  <Bar pct={shopping.percent} h={2} color={shopping.percent === 100 ? T.green : T.blue} />
                  <Text style={styles.shopHint}>{u.shoppingHint}</Text>
                </TCard>
              </Pressable>
            </>
          )}

          {/* Mürettebat */}
          {people.length > 0 && (
            <>
              <SLabel
                mt={20}
                action={u.viewAll}
                onAction={() => navigation.navigate("TripCrew", { tripId: trip.id })}
              >
                {p.crewGuests}
              </SLabel>
              <View style={styles.crewRow}>
                {people.map((name, i) => (
                  <View key={`${name}-${i}`} style={styles.crewItem}>
                    <View style={[styles.crewAvatar, i === 0 && { backgroundColor: T.blue }]}>
                      <Text style={[styles.crewInitial, i === 0 && { color: "#FFFFFF" }]}>
                        {(name.trim()[0] ?? "?").toUpperCase()}
                      </Text>
                    </View>
                    <Text style={styles.crewName} numberOfLines={1}>
                      {name.split(" ")[0]}
                    </Text>
                  </View>
                ))}
              </View>
            </>
          )}

          <TDivider />

          {/* Sefer sonu girişi */}
          <Pressable
            onPress={onEndTrip}
            accessibilityRole="button"
            accessibilityLabel={u.endTrip}
            style={({ pressed }) => [styles.endBtn, pressed && { opacity: 0.85 }]}
          >
            <Text style={styles.endText}>{u.endTrip}</Text>
            <LIcon name="arrow-right" size={TICON.sm} color="rgba(255,255,255,0.44)" />
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.bg },
  hero: { backgroundColor: T.vessel, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20 },
  heroTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  overdue: { fontSize: 11, color: T.amber },
  heroTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.7,
    lineHeight: 31,
    marginTop: 10,
    marginBottom: 4,
  },
  heroMeta: { fontSize: 13, color: "rgba(255,255,255,0.44)" },
  logCard: {
    backgroundColor: T.surface,
    borderRadius: T.r,
    borderWidth: 1,
    borderColor: T.rule,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: 64,
    ...TSH.sh1,
  },
  logIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: T.blueL,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  logTitle: { fontSize: 14, fontWeight: "600", color: T.ink0, marginBottom: 2 },
  logSub: { fontSize: 12, color: T.ink2 },
  allClear: { fontSize: 12, color: T.ink3, paddingVertical: 4 },
  obsCard: {
    backgroundColor: T.surface,
    borderRadius: T.r2,
    borderWidth: 1,
    borderColor: "rgba(201,106,0,0.20)",
    paddingVertical: 11,
    paddingLeft: 14,
    paddingRight: 6,
    marginBottom: 6,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
    ...TSH.sh0,
  },
  obsKeel: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: T.blue,
  },
  obsTitle: { fontSize: 13, fontWeight: "500", color: T.ink0, lineHeight: 18, marginBottom: 3 },
  obsMeta: { fontSize: 11, color: T.ink2 },
  resolveBtn: {
    minWidth: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  resolveCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: "rgba(0,135,90,0.45)",
    backgroundColor: T.greenL,
    alignItems: "center",
    justifyContent: "center",
  },
  shopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  shopTitle: { fontSize: 13, fontWeight: "500", color: T.ink0 },
  shopHint: { fontSize: 11, color: T.ink2, marginTop: 8 },
  crewRow: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  crewItem: { alignItems: "center", width: 48 },
  crewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: T.surfaceEl,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 5,
  },
  crewInitial: { fontSize: 14, fontWeight: "700", color: T.ink1 },
  crewName: { fontSize: 9, color: T.ink2, fontWeight: "500" },
  endBtn: {
    backgroundColor: T.ink0,
    borderRadius: T.r,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 48,
  },
  endText: { fontSize: 14, fontWeight: "600", color: "#FFFFFF" },
});
