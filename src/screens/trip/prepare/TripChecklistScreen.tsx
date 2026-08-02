import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, SafeAreaView, Alert } from "react-native";
import { useFocusEffect, useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { T, TICON } from "../../../theme";
import { LIcon } from "../../../components/LIcon";
import { Bar, KeelLine, Pill } from "../../../components/trove/primitives";
import { SampleBanner } from "../../../components/trove/SampleBanner";
import {
  ensureTripInspection,
  getTrip,
  listTripInspections,
  updateTripStatus,
  TripRow,
} from "../../../repositories/trips";
import { getVesselById } from "../../../repositories/vessels";
import {
  addMedia,
  completeInspection,
  getItemResults,
  listIssues,
  removeIssueForItem,
  setItemStatus,
  upsertIssueForItem,
} from "../../../repositories/inspections";
import { checkCompletion, lt, statusOf, toResultMap } from "../../../domain/inspection";
import { isDone as inspectionDone } from "../../../domain/trip";
import { loadChecklist, ChecklistData } from "./checklistData";
import { capturePhoto } from "../../../media/photos";
import { useEntitlement } from "../../../entitlement";
import { useLocale } from "../../../i18n";
import { TRIP_STRINGS } from "../../../i18n/trip";
import { PREPARE_STRINGS } from "../../../i18n/prepare";
import type { RootStackParamList } from "../../../navigation";
import type { ItemResult } from "../../../domain/types";

type Nav = NativeStackNavigationProp<RootStackParamList>;

// trip_predep + trip_checkin — mevcut denetim motoru üstüne onaylı TROVE
// görünümü: KeelLine tamamlanma işaretleri, madde başına bayrak + kamera
// düğmeleri (kamera KİLİTLİ premium kapısından geçer: inspection_photo).
// Motor değişmedi: durumlar/sorunlar/medya repositories/inspections'ta.
// Ayrıntılı akış (önem derecesi, notlar, sayaçlar) InspectScreen'de yaşar.

export default function TripChecklistScreen() {
  const navigation = useNavigation<Nav>();
  const route =
    useRoute<RouteProp<RootStackParamList, "TripPredep" | "TripCheckin" | "TripReturn">>();
  const kind =
    route.name === "TripCheckin"
      ? "check_in"
      : route.name === "TripReturn"
        ? "return_secure"
        : "pre_departure";
  const { locale } = useLocale();
  const s = TRIP_STRINGS[locale];
  const p = PREPARE_STRINGS[locale];
  const { requestAccess } = useEntitlement();

  const [trip, setTrip] = useState<TripRow | null>(null);
  const [data, setData] = useState<ChecklistData | null>(null);
  const [results, setResults] = useState<ItemResult[]>([]);
  const [flagged, setFlagged] = useState<Set<string>>(new Set());

  const load = useCallback(() => {
    const t = getTrip(route.params.tripId);
    setTrip(t);
    if (!t) return;
    // Örnek seferlerde ASLA denetim oluşturulmaz (izolasyon: yeni satır
    // "smp-" öneki taşımaz ve gerçek listelere sızardı). Varsa gösterilir.
    let inspectionId: string | null = null;
    if (t.isSample) {
      inspectionId = listTripInspections(t.id).find((i) => i.kind === kind)?.id ?? null;
    } else if (t.boatId) {
      const boat = getVesselById(t.boatId);
      if (boat) inspectionId = ensureTripInspection(t, kind, boat.type);
    }
    if (!inspectionId) {
      setData(null);
      return;
    }
    const loaded = loadChecklist(inspectionId);
    setData(loaded);
    if (loaded) {
      setResults(getItemResults(inspectionId));
      setFlagged(
        new Set(
          listIssues(inspectionId)
            .map((i) => i.templateItemId)
            .filter((id): id is string => id !== null)
        )
      );
    }
  }, [route.params.tripId, kind]);

  useFocusEffect(load);

  if (!trip) return <SafeAreaView style={styles.safe} />;

  if (!data) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={{ padding: 16 }}>
          {trip.isSample ? (
            <SampleBanner onCreate={() => navigation.navigate("Tabs", { screen: "VesselTab" })} />
          ) : (
            <Text style={styles.emptyText}>{p.noBoatForChecklist}</Text>
          )}
        </View>
      </SafeAreaView>
    );
  }

  const { inspection, sections } = data;
  const readOnly = trip.isSample;
  const completed = inspectionDone(inspection.status);
  const resultMap = toResultMap(results);

  const statusSections = sections
    .map((sec) => ({
      section: sec,
      items: sec.items.filter((i) => i.inputKind === "status"),
    }))
    .filter((x) => x.items.length > 0);
  const allItems = statusSections.flatMap((x) => x.items);
  const doneCount = allItems.filter((i) => statusOf(resultMap, i) !== "unchecked").length;
  const pct = allItems.length === 0 ? 0 : (doneCount / allItems.length) * 100;

  function refresh() {
    if (!data) return;
    setResults(getItemResults(data.inspection.id));
    setFlagged(
      new Set(
        listIssues(data.inspection.id)
          .map((i) => i.templateItemId)
          .filter((id): id is string => id !== null)
      )
    );
  }

  function toggleItem(itemId: string, current: string) {
    if (readOnly || !data) return;
    setItemStatus(data.inspection, itemId, current === "unchecked" ? "working" : "unchecked");
    refresh();
  }

  function toggleFlag(itemId: string, title: string) {
    if (readOnly || !data) return;
    if (flagged.has(itemId)) {
      removeIssueForItem(data.inspection.id, itemId);
      setItemStatus(data.inspection, itemId, "unchecked");
    } else {
      setItemStatus(data.inspection, itemId, "needs_attention");
      upsertIssueForItem(data.inspection, {
        templateItemId: itemId,
        severity: "medium",
        title,
      });
    }
    refresh();
  }

  async function addPhoto(itemId: string, title: string) {
    if (readOnly || !data) return;
    // KİLİTLİ kural (MONETIZATION 1/2): foto kapılı, metin kaydı asla değil.
    if (!(await requestAccess("inspection_photo"))) return;
    const uri = await capturePhoto();
    if (!uri) return;
    const issueId = flagged.has(itemId)
      ? listIssues(data.inspection.id).find((i) => i.templateItemId === itemId)?.id
      : upsertIssueForItem(data.inspection, {
          templateItemId: itemId,
          severity: "low",
          title,
        });
    addMedia(data.inspection, { localUri: uri, issueId });
    refresh();
  }

  function complete() {
    if (readOnly || !data || completed) return;
    const check = checkCompletion(sections, resultMap);
    if (!check.canComplete) {
      Alert.alert(p.blockedCriticalTitle, p.blockedCriticalBody);
      return;
    }
    const finish = () => {
      completeInspection(data.inspection.id);
      if (kind === "pre_departure" && trip?.ownershipContext === "charter") {
        navigation.replace("TripCheckin", { tripId: trip.id });
      } else if (kind === "return_secure" && trip) {
        // Dönüş listesi seferi kapatır; Trip sekmesi tamamlandı durumunu çizer.
        updateTripStatus(trip.id, "completed");
        navigation.goBack();
      } else {
        navigation.goBack();
      }
    };
    if (check.warningItems.length > 0) {
      Alert.alert(p.uncheckedWarnTitle, p.uncheckedWarnBody, [
        { text: s.cancel, style: "cancel" },
        { text: p.completeAnyway, onPress: finish },
      ]);
    } else {
      finish();
    }
  }

  const ctaLabel =
    kind === "check_in"
      ? p.completeCheckinCta
      : kind === "return_secure"
        ? p.completeChecklistCta
        : trip.ownershipContext === "charter"
          ? p.continueCheckinCta
          : p.completeChecklistCta;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Üst ilerleme şeridi */}
      <View style={styles.progressWrap}>
        <View style={styles.progressRow}>
          <Text style={styles.progressText}>
            {doneCount} {p.ofWord} {allItems.length} {p.itemsWord}
          </Text>
          {completed ? (
            <Pill text={p.completedPill} type="ok" />
          ) : (
            <Text style={[styles.progressPct, pct === 100 && { color: T.green }]}>
              {Math.round(pct)}%
            </Text>
          )}
        </View>
        <Bar pct={pct} h={3} color={pct === 100 ? T.green : T.blue} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
        {readOnly && (
          <SampleBanner onCreate={() => navigation.navigate("Tabs", { screen: "VesselTab" })} />
        )}

        {statusSections.map(({ section, items }) => (
          <View key={section.id} style={{ marginBottom: 16 }}>
            <Text style={styles.sectionTitle}>{lt(section.title, locale).toUpperCase()}</Text>
            {items.map((item) => {
              const st = statusOf(resultMap, item);
              const on = st !== "unchecked" && st !== "not_applicable";
              const isFlagged = flagged.has(item.id);
              const title = lt(item.title, locale);
              return (
                <View
                  key={item.id}
                  style={[
                    styles.itemCard,
                    on && !isFlagged && styles.itemCardDone,
                    isFlagged && styles.itemCardFlagged,
                  ]}
                >
                  {on && <KeelLine />}
                  <View style={styles.itemInner}>
                    <Pressable
                      onPress={() => toggleItem(item.id, st)}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: on }}
                      accessibilityLabel={title}
                      style={styles.checkTouch}
                    >
                      <View
                        style={[
                          styles.checkCircle,
                          on && !isFlagged && { backgroundColor: T.green, borderColor: T.green },
                          isFlagged && { backgroundColor: T.amber, borderColor: T.amber },
                        ]}
                      >
                        {on &&
                          (isFlagged ? (
                            <LIcon name="alert-triangle" size={10} color="#FFFFFF" />
                          ) : (
                            <LIcon name="check" size={11} color="#FFFFFF" />
                          ))}
                      </View>
                    </Pressable>
                    <Text
                      style={[
                        styles.itemLabel,
                        on && !isFlagged && { color: T.ink3, textDecorationLine: "line-through" },
                      ]}
                    >
                      {title}
                      {item.isCritical ? " *" : ""}
                    </Text>
                    {!readOnly && (
                      <View style={styles.actions}>
                        <Pressable
                          onPress={() => toggleFlag(item.id, title)}
                          accessibilityRole="button"
                          accessibilityLabel={s.requiresReviewLabel}
                          style={({ pressed }) => [
                            styles.actionBtn,
                            { backgroundColor: T.amberL },
                            pressed && { opacity: 0.7 },
                          ]}
                        >
                          <LIcon name="alert-triangle" size={TICON.sm} color={T.amber} />
                        </Pressable>
                        <Pressable
                          onPress={() => addPhoto(item.id, title)}
                          accessibilityRole="button"
                          accessibilityLabel={s.photoPairs}
                          style={({ pressed }) => [
                            styles.actionBtn,
                            { backgroundColor: T.blueL },
                            pressed && { opacity: 0.7 },
                          ]}
                        >
                          <LIcon name="camera" size={TICON.sm} color={T.blue} />
                        </Pressable>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        ))}
      </ScrollView>

      {!readOnly && !completed && (
        <View style={styles.footer}>
          <Pressable
            onPress={complete}
            accessibilityRole="button"
            accessibilityLabel={ctaLabel}
            style={({ pressed }) => [styles.cta, pressed && { opacity: 0.85 }]}
          >
            <Text style={styles.ctaText}>{ctaLabel}</Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.bg },
  emptyText: { fontSize: 13, color: T.ink2 },
  progressWrap: {
    backgroundColor: T.surface,
    borderBottomWidth: 1,
    borderBottomColor: T.rule,
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 10,
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressText: { fontSize: 11, color: T.ink2 },
  progressPct: { fontFamily: T.monoSemiBold, fontSize: 13, color: T.blue },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "700",
    color: T.ink3,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  itemCard: {
    backgroundColor: T.surface,
    borderRadius: T.r2,
    borderWidth: 1,
    borderColor: T.rule,
    marginBottom: 5,
    overflow: "hidden",
  },
  itemCardDone: { borderColor: "rgba(0,135,90,0.16)" },
  itemCardFlagged: { borderColor: "rgba(201,106,0,0.20)" },
  itemInner: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingLeft: 9,
    paddingRight: 12,
    gap: 2,
  },
  checkTouch: {
    minWidth: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: T.ruleStr,
    alignItems: "center",
    justifyContent: "center",
  },
  itemLabel: {
    flex: 1,
    fontSize: 13,
    color: T.ink0,
    lineHeight: 18,
    paddingVertical: 12,
  },
  actions: { flexDirection: "row", gap: 4, marginLeft: 4 },
  actionBtn: {
    minWidth: 44,
    minHeight: 44,
    borderRadius: T.r3,
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    backgroundColor: T.surface,
    borderTopWidth: 1,
    borderTopColor: T.rule,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  cta: {
    backgroundColor: T.blue,
    borderRadius: T.r,
    paddingVertical: 14,
    alignItems: "center",
    minHeight: 48,
    justifyContent: "center",
  },
  ctaText: { fontSize: 14, fontWeight: "700", color: "#FFFFFF" },
});
