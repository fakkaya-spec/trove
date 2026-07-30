import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  SafeAreaView,
  Image,
  Share,
  Switch,
} from "react-native";
import { useRoute, RouteProp } from "@react-navigation/native";
import { getTrip, TripRow } from "../../repositories/trips";
import {
  ensurePairsForSession,
  getSessionForTrip,
  listPairs,
  PairRow,
  setPairCheckoutMedia,
  setPairReview,
  HandoverSessionRow,
} from "../../repositories/handover";
import { addMedia, getInspection, listIssues, listMeters } from "../../repositories/inspections";
import { getVesselById } from "../../repositories/vessels";
import {
  buildHandoverReportText,
  compareMeters,
  deriveHandoverStatus,
  MeterComparisonRow,
} from "../../domain/handover";
import { capturePhoto } from "../../media/photos";
import { PRODUCT_NAME } from "../../config/product";
import { colors, fonts, spacing } from "../../theme";
import { RopeDivider } from "../../components/ui";
import { useLocale } from "../../i18n";
import { TRIP_STRINGS, TripStrings } from "../../i18n/trip";
import type { RootStackParamList } from "../../navigation";

type Route = RouteProp<RootStackParamList, "HandoverReview">;

export default function HandoverReviewScreen() {
  const route = useRoute<Route>();
  const { locale } = useLocale();
  const s = TRIP_STRINGS[locale];

  const [version, setVersion] = useState(0);
  const refresh = useCallback(() => setVersion((v) => v + 1), []);

  const trip = useMemo<TripRow | null>(
    () => getTrip(route.params.tripId),
    // 'version' bilinçli yenileme bağımlılığı
    [route.params.tripId, version] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const data = useMemo(() => {
    if (!trip) return null;
    const session = getSessionForTrip(trip.id);
    if (!session?.checkinInspectionId) return { session: null } as const;
    // Eşleştirme kayıtlarını check-in fotoğraflarından üret (idempotent)
    const checkInIssues = listIssues(session.checkinInspectionId);
    ensurePairsForSession(
      session,
      new Map(checkInIssues.map((i) => [i.id, i.title]))
    );
    const checkIn = getInspection(session.checkinInspectionId);
    const checkOut = session.checkoutInspectionId
      ? getInspection(session.checkoutInspectionId)
      : null;
    return {
      session,
      status: deriveHandoverStatus(checkIn?.status ?? null, checkOut?.status ?? null),
      checkInIssues,
      checkOutIssues: session.checkoutInspectionId ? listIssues(session.checkoutInspectionId) : [],
      meters: compareMeters(
        listMeters(session.checkinInspectionId),
        session.checkoutInspectionId ? listMeters(session.checkoutInspectionId) : []
      ),
      pairs: listPairs(session.id),
      checkOut,
    } as const;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trip, version]);

  if (!trip || !data) return null;

  if (!data.session) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.notice}>{s.noCheckinYet}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const { session, status, checkInIssues, checkOutIssues, meters, pairs, checkOut } = data;

  async function retake(pair: PairRow, sess: HandoverSessionRow) {
    if (!checkOut) return; // check-out denetimi açılmadan yeniden çekim yok
    const uri = await capturePhoto();
    if (!uri) return;
    const mediaId = addMedia(checkOut, { localUri: uri });
    setPairCheckoutMedia(pair.id, mediaId);
    void sess;
    refresh();
  }

  async function shareReport() {
    const meterNames: Record<string, string> = {
      engine_hours: "⏱", fuel_pct: "⛽", water_pct: "💧",
      battery_v: "🔋", generator_hours: "🔌", waste_pct: "🚽",
    };
    const text = buildHandoverReportText({
      productName: PRODUCT_NAME,
      tripName: trip!.name,
      boatName: trip!.boatId ? (getVesselById(trip!.boatId)?.name ?? "—") : "—",
      dates: `${trip!.startAt ?? "—"} → ${trip!.endAt ?? "—"}`,
      meters,
      checkInIssues,
      checkOutIssues,
      reviewFlaggedPairs: pairs.filter((p) => p.requiresReview).length,
      totalPairs: pairs.length,
      labels: {
        checkIn: s.checkIn,
        checkOut: s.checkOut,
        delta: s.deltaLabel,
        existingObservations: s.existingObservations,
        newObservations: s.newObservations,
        photoPairs: s.photoPairs,
        flaggedForReview: s.flaggedForReview,
        factsDisclaimer: s.factsDisclaimer,
        meterNames,
      },
    });
    try {
      await Share.share({ message: text });
    } catch {
      // paylaşım iptal edildi
    }
  }

  const statusLabel = s[(`hs_${status}`) as keyof TripStrings] as string;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.statusRow}>
          <Text style={styles.statusText}>⚓ {statusLabel}</Text>
        </View>

        {/* Sayaç karşılaştırması */}
        {meters.length > 0 && (
          <>
            <RopeDivider label={`⛽ ${s.metersCompare.toUpperCase()}`} />
            <View style={styles.meterHead}>
              <Text style={[styles.meterCell, styles.meterHeadText]}></Text>
              <Text style={[styles.meterCell, styles.meterHeadText]}>{s.checkIn}</Text>
              <Text style={[styles.meterCell, styles.meterHeadText]}>{s.checkOut}</Text>
              <Text style={[styles.meterCell, styles.meterHeadText]}>Δ</Text>
            </View>
            {meters.map((m: MeterComparisonRow) => (
              <View key={m.kind} style={styles.meterRow}>
                <Text style={[styles.meterCell, styles.meterName]}>
                  {m.kind.replace(/_/g, " ")}
                </Text>
                <Text style={styles.meterCell}>
                  {m.checkIn !== null ? `${m.checkIn}` : "—"}
                </Text>
                <Text style={styles.meterCell}>
                  {m.checkOut !== null ? `${m.checkOut}` : "—"}
                </Text>
                <Text
                  style={[
                    styles.meterCell,
                    m.delta !== null && m.delta < 0 ? { color: colors.signal } : null,
                  ]}
                >
                  {m.delta !== null ? `${m.delta > 0 ? "+" : ""}${m.delta}` : "—"}
                </Text>
              </View>
            ))}
          </>
        )}

        {/* Check-in gözlemleri */}
        {checkInIssues.length > 0 && (
          <>
            <RopeDivider label={`📋 ${s.existingObservations.toUpperCase()} (${checkInIssues.length})`} />
            {checkInIssues.map((i) => (
              <Text key={i.id} style={styles.issueLine}>
                • [{i.severity}] {i.title}
              </Text>
            ))}
          </>
        )}

        {/* Check-out gözlemleri */}
        {checkOutIssues.length > 0 && (
          <>
            <RopeDivider label={`🔁 ${s.newObservations.toUpperCase()} (${checkOutIssues.length})`} />
            {checkOutIssues.map((i) => (
              <Text key={i.id} style={styles.issueLine}>
                • [{i.severity}] {i.title}
              </Text>
            ))}
          </>
        )}

        {/* Foto eşleştirmeleri */}
        {pairs.length > 0 && (
          <>
            <RopeDivider label={`📷 ${s.photoPairs.toUpperCase()} (${pairs.length})`} />
            {pairs.map((pair) => (
              <View key={pair.id} style={styles.pairCard}>
                {pair.label ? <Text style={styles.pairLabel}>{pair.label}</Text> : null}
                <View style={styles.pairImages}>
                  <View style={styles.pairSide}>
                    <Text style={styles.pairSideLabel}>{s.checkIn}</Text>
                    <Image source={{ uri: pair.checkinUri }} style={styles.pairImage} />
                  </View>
                  <View style={styles.pairSide}>
                    <Text style={styles.pairSideLabel}>{s.checkOut}</Text>
                    {pair.checkoutUri ? (
                      <Image source={{ uri: pair.checkoutUri }} style={styles.pairImage} />
                    ) : (
                      <Pressable
                        onPress={() => retake(pair, session)}
                        disabled={!checkOut}
                        accessibilityRole="button"
                        accessibilityLabel={s.retakePhoto}
                        style={({ pressed }) => [
                          styles.retakeBtn,
                          (!checkOut || pressed) && { opacity: checkOut ? 0.8 : 0.4 },
                        ]}
                      >
                        <Text style={styles.retakeText}>📷 {s.retakePhoto}</Text>
                      </Pressable>
                    )}
                  </View>
                </View>
                <View style={styles.reviewRow}>
                  <Text style={styles.reviewLabel}>⚠ {s.requiresReviewLabel}</Text>
                  <Switch
                    value={pair.requiresReview}
                    onValueChange={(v) => {
                      setPairReview(pair.id, v);
                      refresh();
                    }}
                    trackColor={{ true: colors.signal }}
                  />
                </View>
              </View>
            ))}
          </>
        )}

        <Text style={styles.disclaimer}>{s.factsDisclaimer}</Text>

        <Pressable
          onPress={shareReport}
          accessibilityRole="button"
          style={({ pressed }) => [styles.shareBtn, pressed && { opacity: 0.85 }]}
        >
          <Text style={styles.shareText}>📤 {s.shareReport}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.night },
  scroll: { padding: spacing.m, paddingBottom: spacing.xl },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.l },
  notice: { fontFamily: fonts.body, fontSize: 14, color: colors.fog, textAlign: "center" },
  statusRow: { alignItems: "center", marginBottom: spacing.s },
  statusText: {
    fontFamily: fonts.mono,
    fontSize: 12,
    letterSpacing: 1,
    color: colors.brass,
    borderWidth: 1,
    borderColor: colors.brass,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  meterHead: { flexDirection: "row", paddingVertical: 4 },
  meterHeadText: { fontFamily: fonts.mono, fontSize: 10, color: colors.fog, letterSpacing: 1 },
  meterRow: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(147,165,184,0.2)",
  },
  meterCell: { flex: 1, fontFamily: fonts.mono, fontSize: 13, color: colors.paper },
  meterName: { textTransform: "capitalize", fontFamily: fonts.body },
  issueLine: { fontFamily: fonts.body, fontSize: 13, color: colors.paper, paddingVertical: 3, lineHeight: 19 },
  pairCard: {
    backgroundColor: colors.nightDeep,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 10,
    padding: spacing.s,
    marginBottom: spacing.m,
  },
  pairLabel: { fontFamily: fonts.body, fontSize: 13, color: colors.paper, marginBottom: 6 },
  pairImages: { flexDirection: "row", gap: 8 },
  pairSide: { flex: 1 },
  pairSideLabel: { fontFamily: fonts.mono, fontSize: 10, color: colors.fog, marginBottom: 4 },
  pairImage: { width: "100%", aspectRatio: 4 / 3, borderRadius: 6, backgroundColor: colors.night },
  retakeBtn: {
    width: "100%",
    aspectRatio: 4 / 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.brass,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
  },
  retakeText: { fontFamily: fonts.body, fontSize: 12, color: colors.brass, textAlign: "center" },
  reviewRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  reviewLabel: { fontFamily: fonts.body, fontSize: 13, color: colors.paper },
  disclaimer: {
    fontFamily: fonts.body,
    fontStyle: "italic",
    fontSize: 11,
    color: colors.fog,
    lineHeight: 16,
    marginTop: spacing.m,
    textAlign: "center",
  },
  shareBtn: {
    backgroundColor: colors.brass,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: spacing.m,
  },
  shareText: { fontFamily: fonts.display, fontSize: 16, fontWeight: "700", color: colors.night },
});
