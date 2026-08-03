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
  listTripInspections,
  setTripBoat,
  TripRow,
  updateTripStatus,
} from "../../repositories/trips";
import { getVesselById, listVessels } from "../../repositories/vessels";
import { generatePlan, getPlanForTrip, planProgress } from "../../repositories/provisioning";
import { nextAction, tripProgress, NextAction, TripModuleStates, isDone } from "../../domain/trip";
import { InspectionStatus } from "../../domain/types";
import { T, TSH, TICON, touch } from "../../theme";
import { LIcon, type LIconName } from "../../components/LIcon";
import { Bar, SLabel, TDivider } from "../../components/trove/primitives";
import { SampleBanner } from "../../components/trove/SampleBanner";
import { useLocale } from "../../i18n";
import { TRIP_STRINGS, TripStrings } from "../../i18n/trip";
import type { RootStackParamList } from "../../navigation";

// Sefer detayı — Faz 8 TROVE görünümü (sprint G5). İKİNCİL bilgi/yönetim
// ekranı: operasyonel yüzeylerle YARIŞMAZ (planlama→PrepareHub,
// seyir→Underway, kapanış→TripComplete Trip sekmesinde yaşar). Buradaki
// modül satırları o akışlara BAĞLANTIDIR, kopya değil. Davranış aynen
// korundu (H1 dahil): örnekler salt okunur — durum çipi gösterim, tekne
// seçici yok, silme yok; denetimler örnekte asla oluşturulmaz.

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
    // Örnek keşfi SALT OKUNUR (H1): var olan örnek denetim açılır, yeni
    // denetim asla oluşturulmaz (repository de ayrıca reddeder).
    if (trip.isSample) {
      const existing = listTripInspections(trip.id).find((i) => i.kind === kind);
      if (existing) navigation.navigate("Inspect", { inspectionId: existing.id });
      return;
    }
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
    // Cihaz testi bulgusu: yeni akış TROVE ikmal ekranına gider (eski
    // Provisioning'in açıklamasız sepet/küp ikonları kafa karıştırıyordu;
    // kalem ekleme TROVE alışveriş listesinde zaten var).
    navigation.navigate("TripProvisions", { tripId: trip.id });
  }

  // Cihaz testi bulgusu F1: "sıradaki adım" kutusu artık BASILABİLİR —
  // gösterilen eylemin ekranını açar.
  function onNextAction() {
    if (!trip) return;
    switch (action) {
      case "start_check_in":
        openChecklist("check_in");
        break;
      case "start_pre_departure":
      case "continue_pre_departure":
        openChecklist("pre_departure");
        break;
      case "generate_provisions":
        openProvisioning();
        break;
      case "continue_shopping":
        navigation.navigate("TripShopping", { tripId: trip.id });
        break;
      case "review_critical_issues":
        openChecklist(isCharter ? "check_in" : "pre_departure");
        break;
      case "start_return_check":
      case "continue_return_check":
        openChecklist("return_secure");
        break;
      case "trip_complete":
        navigation.navigate("TripComplete", { tripId: trip.id });
        break;
    }
  }

  // Modül durumu: renk + ikon birlikte (yalnız renge güvenilmez).
  function statusIcon(st: InspectionStatus | null) {
    if (st === null) return <LIcon name="chevron-right" size={TICON.sm} color={T.ink3} />;
    if (isDone(st)) return <LIcon name="check-circle" size={TICON.lg} color={T.green} />;
    return <LIcon name="clock" size={TICON.lg} color={T.amber} />;
  }

  function moduleRow(
    icon: LIconName,
    title: string,
    status: React.ReactNode,
    onPress: () => void,
    last = false
  ) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={title}
        style={({ pressed }) => [
          styles.moduleRow,
          !last && styles.moduleRowRule,
          pressed && { opacity: 0.8 },
        ]}
      >
        <View style={styles.moduleIcon}>
          <LIcon name={icon} size={TICON.md} color={T.ink1} />
        </View>
        <Text style={styles.moduleTitle}>{title}</Text>
        {status}
      </Pressable>
    );
  }

  const statusOptions: { key: TripRow["status"]; label: string }[] = [
    { key: "planning", label: s.planning },
    { key: "active", label: s.active },
    { key: "completed", label: s.completedTrip },
  ];

  const crewSummary = [
    trip.adults > 0 ? `${trip.adults} ${s.adults.toLowerCase()}` : null,
    trip.children > 0 ? `${trip.children} ${s.children.toLowerCase()}` : null,
    trip.skipperName,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {trip.isSample && (
          <SampleBanner onCreate={() => navigation.navigate("Tabs", { screen: "VesselTab" })} />
        )}

        {/* Özet kartı — durum, tekne, tarihler, kişiler */}
        <View style={styles.summaryCard}>
          <View style={styles.chipRow}>
            {trip.isSample ? (
              /* H1: örneklerde durum SALT GÖSTERİM */
              <View style={[styles.chip, styles.chipOn]}>
                <Text style={[styles.chipText, styles.chipTextOn]}>
                  {statusOptions.find((o) => o.key === trip.status)?.label ?? trip.status}
                </Text>
              </View>
            ) : (
              statusOptions.map((o) => (
                <Pressable
                  key={o.key}
                  onPress={() => {
                    updateTripStatus(trip.id, o.key);
                    refresh();
                  }}
                  accessibilityRole="button"
                  accessibilityState={{ selected: trip.status === o.key }}
                  style={[styles.chip, trip.status === o.key && styles.chipOn]}
                >
                  <Text style={[styles.chipText, trip.status === o.key && styles.chipTextOn]}>
                    {o.label}
                  </Text>
                </Pressable>
              ))
            )}
          </View>

          <View style={styles.metaCol}>
            <View style={styles.metaRow}>
              <LIcon name="sailboat" size={TICON.sm} color={T.ink2} />
              <Text style={styles.meta}>{boat ? boat.name : s.boatMissing}</Text>
            </View>
            {trip.startAt || trip.endAt ? (
              <View style={styles.metaRow}>
                <LIcon name="calendar" size={TICON.sm} color={T.ink2} />
                <Text style={[styles.meta, styles.metaMono]}>
                  {[trip.startAt, trip.endAt].filter(Boolean).join(" – ")}
                </Text>
              </View>
            ) : null}
            {crewSummary ? (
              <View style={styles.metaRow}>
                <LIcon name="users" size={TICON.sm} color={T.ink2} />
                <Text style={styles.meta}>{crewSummary}</Text>
              </View>
            ) : null}
            {trip.nights > 0 ? (
              <View style={styles.metaRow}>
                <LIcon name="clock" size={TICON.sm} color={T.ink2} />
                <Text style={styles.meta}>
                  {trip.nights} {s.nights.toLowerCase()}
                </Text>
              </View>
            ) : null}
          </View>

          <Bar
            pct={progress.modulesTotal > 0 ? (progress.modulesDone / progress.modulesTotal) * 100 : 0}
            h={3}
            color={progress.modulesDone === progress.modulesTotal ? T.green : T.blue}
          />
          {states.openCriticalIssues > 0 && (
            <View style={styles.criticalRow}>
              <LIcon name="alert-triangle" size={TICON.sm} color={T.red} />
              <Text style={styles.critical}>
                {states.openCriticalIssues} {s.criticalOpen}
              </Text>
            </View>
          )}
          <Pressable
            onPress={onNextAction}
            accessibilityRole="button"
            accessibilityLabel={s[NA_KEY[action]]}
            style={({ pressed }) => [styles.nextBox, pressed && { opacity: 0.85 }]}
          >
            <Text style={styles.nextText}>{s[NA_KEY[action]]}</Text>
            <LIcon name="arrow-right" size={TICON.sm} color="#FFFFFF" />
          </Pressable>
        </View>

        {/* Tekne seçici (eksikse; örneklerde asla — setTripBoat mutasyondur) */}
        {!trip.isSample && (!boat || showBoatPicker) && (
          <View style={{ marginTop: 16 }}>
            <SLabel mt={0}>{s.chooseBoatFirst}</SLabel>
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
                  accessibilityLabel={v.name}
                  style={styles.chip}
                >
                  <Text style={styles.chipText}>{v.name}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Yönetim bağlantıları — operasyon ekranlarına GEÇİŞ, kopya değil */}
        <View style={[styles.moduleCard, { marginTop: 20 }]}>
          {isCharter &&
            moduleRow("list", s.checkIn, statusIcon(states.checkIn), () =>
              openChecklist("check_in")
            )}
          {moduleRow("sun", s.preDeparture, statusIcon(states.preDeparture), () =>
            openChecklist("pre_departure")
          )}
          {moduleRow(
            "shopping-cart",
            s.provisioning,
            provisionPct === null ? (
              <LIcon name="chevron-right" size={TICON.sm} color={T.ink3} />
            ) : (
              <Text style={styles.modulePct}>{provisionPct}%</Text>
            ),
            openProvisioning
          )}
          {isCharter &&
            moduleRow("arrow-right", s.checkOut, statusIcon(states.checkOut), () =>
              openChecklist("check_out")
            )}
          {isCharter &&
            states.checkIn !== null &&
            moduleRow(
              "shield",
              s.handoverReview,
              <LIcon name="chevron-right" size={TICON.sm} color={T.ink3} />,
              () => navigation.navigate("HandoverReview", { tripId: trip.id })
            )}
          {moduleRow(
            "check-circle",
            s.returnCheck,
            statusIcon(states.returnCheck),
            () => openChecklist("return_secure"),
            true
          )}
        </View>

        {/* Tehlikeli bölge — yalnız gerçek seferler */}
        {!trip.isSample && (
          <>
            <TDivider />
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
              accessibilityLabel={s.deleteTrip}
              style={({ pressed }) => [styles.deleteBtn, pressed && { opacity: 0.8 }]}
            >
              <Text style={styles.deleteText}>{s.deleteTrip}</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.bg },
  scroll: { padding: 16, paddingBottom: 32 },
  summaryCard: {
    backgroundColor: T.surface,
    borderWidth: 1,
    borderColor: T.rule,
    borderRadius: T.r,
    padding: 16,
    gap: 12,
    ...TSH.sh1,
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    minHeight: touch.min,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: T.rule,
    backgroundColor: T.surface,
    borderRadius: 99,
    paddingHorizontal: 14,
  },
  chipOn: { backgroundColor: T.ink0, borderColor: T.ink0 },
  chipText: { fontSize: 13, color: T.ink1 },
  chipTextOn: { color: "#FFFFFF", fontWeight: "600" },
  metaCol: { gap: 6 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  meta: { fontSize: 13, color: T.ink1, flexShrink: 1 },
  metaMono: { fontFamily: T.mono, fontSize: 12 },
  criticalRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  critical: { fontSize: 13, color: T.red, fontWeight: "600" },
  nextBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: T.blue,
    borderRadius: T.r2,
    paddingHorizontal: 14,
    minHeight: touch.min,
  },
  nextText: { flex: 1, fontSize: 14, fontWeight: "600", color: "#FFFFFF" },
  moduleCard: {
    backgroundColor: T.surface,
    borderRadius: T.r,
    borderWidth: 1,
    borderColor: T.rule,
    paddingHorizontal: 14,
    ...TSH.sh0,
  },
  moduleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: touch.row,
    paddingVertical: 6,
  },
  moduleRowRule: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: T.rule },
  moduleIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: T.surfaceEl,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  moduleTitle: { flex: 1, fontSize: 14, fontWeight: "500", color: T.ink0 },
  modulePct: { fontFamily: T.mono, fontSize: 14, color: T.ink0, fontWeight: "600" },
  deleteBtn: { minHeight: touch.min, alignItems: "center", justifyContent: "center" },
  deleteText: { fontSize: 13, fontWeight: "600", color: T.red },
});
