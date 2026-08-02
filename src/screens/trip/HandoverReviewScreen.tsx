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
import { useEntitlement } from "../../entitlement";
import { PRODUCT_NAME } from "../../config/product";
import { colors, fonts, spacing, radius } from "../../theme";
import { RopeDivider, Button, EmptyState } from "../../components/ui";
import { Icon } from "../../components/Icon";
import { useLocale } from "../../i18n";
import { TRIP_STRINGS, TripStrings } from "../../i18n/trip";
import type { RootStackParamList } from "../../navigation";

type Route = RouteProp<RootStackParamList, "HandoverReview">;

export default function HandoverReviewScreen() {
  const route = useRoute<Route>();
  const { locale } = useLocale();
  const s = TRIP_STRINGS[locale];
  const { requestAccess } = useEntitlement();

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
          <EmptyState icon="git-compare-outline" title={s.noCheckinYet} />
        </View>
      </SafeAreaView>
    );
  }

  const { session, status, checkInIssues, checkOutIssues, meters, pairs, checkOut } = data;

  async function retake(pair: PairRow, sess: HandoverSessionRow) {
    if (!checkOut) return; // check-out denetimi açılmadan yeniden çekim yok
    // KİLİTLİ kural: foto çifti Premium; kapı bağlamı handover_pair.
    if (!(await requestAccess("handover_pair"))) return;
    const uri = await capturePhoto();
    if (!uri) return;
    const mediaId = addMedia(checkOut, { localUri: uri });
    setPairCheckoutMedia(pair.id, mediaId);
    void sess;
    refresh();
  }

  async function shareReport() {
    const meterNames: Record<string, string> = Object.fromEntries(
      ["engine_hours", "fuel_pct", "water_pct", "battery_v", "generator_hours", "waste_pct"].map(
        (k) => [k, s[(`meter_${k}`) as keyof TripStrings] as string]
      )
    );
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
          <View style={styles.statusPill}>
            <Icon name="git-compare-outline" size={15} color={colors.info} />
            <Text style={styles.statusText}>{statusLabel}</Text>
          </View>
        </View>

        {/* Sayaç karşılaştırması */}
        {meters.length > 0 && (
          <>
            <RopeDivider label={s.metersCompare.toUpperCase()} />
            <View style={styles.meterHead}>
              <Text style={[styles.meterCell, styles.meterHeadText]}></Text>
              <Text style={[styles.meterCell, styles.meterHeadText]}>{s.checkIn}</Text>
              <Text style={[styles.meterCell, styles.meterHeadText]}>{s.checkOut}</Text>
              <Text style={[styles.meterCell, styles.meterHeadText]}>Δ</Text>
            </View>
            {meters.map((m: MeterComparisonRow) => (
              <View key={m.kind} style={styles.meterRow}>
                <Text style={[styles.meterCell, styles.meterName]}>
                  {s[(`meter_${m.kind}`) as keyof TripStrings] as string}
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
            <RopeDivider label={`${s.existingObservations.toUpperCase()} (${checkInIssues.length})`} />
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
            <RopeDivider label={`${s.newObservations.toUpperCase()} (${checkOutIssues.length})`} />
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
            <RopeDivider label={`${s.photoPairs.toUpperCase()} (${pairs.length})`} />
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
                        <Icon name="camera-outline" size={22} color={colors.info} />
                        <Text style={styles.retakeText}>{s.retakePhoto}</Text>
                      </Pressable>
                    )}
                  </View>
                </View>
                <View style={styles.reviewRow}>
                  <View style={styles.reviewLabelRow}>
                    <Icon name="warning-outline" size={16} color={colors.warning} />
                    <Text style={styles.reviewLabel}>{s.requiresReviewLabel}</Text>
                  </View>
                  <Switch
                    value={pair.requiresReview}
                    onValueChange={(v) => {
                      setPairReview(pair.id, v);
                      refresh();
                    }}
                    trackColor={{ true: colors.gold }}
                  />
                </View>
              </View>
            ))}
          </>
        )}

        <Text style={styles.disclaimer}>{s.factsDisclaimer}</Text>

        <Button label={s.shareReport} icon="share-outline" onPress={shareReport} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.m, paddingBottom: spacing.xl },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.l },
  statusRow: { alignItems: "center", marginBottom: spacing.s },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.infoBg,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  statusText: {
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.5,
    color: colors.info,
  },
  meterHead: { flexDirection: "row", paddingVertical: 4 },
  meterHeadText: {
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: "600",
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  meterRow: {
    flexDirection: "row",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  meterCell: { flex: 1, fontFamily: fonts.mono, fontSize: 13, color: colors.text },
  meterName: { textTransform: "capitalize", fontFamily: fonts.body },
  issueLine: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.text,
    paddingVertical: 3,
    lineHeight: 20,
  },
  pairCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.card,
    padding: spacing.m,
    marginBottom: spacing.m,
  },
  pairLabel: { fontFamily: fonts.body, fontSize: 14, fontWeight: "600", color: colors.text, marginBottom: 6 },
  pairImages: { flexDirection: "row", gap: 8 },
  pairSide: { flex: 1 },
  pairSideLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: "600",
    color: colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  pairImage: { width: "100%", aspectRatio: 4 / 3, borderRadius: 8, backgroundColor: colors.border },
  retakeBtn: {
    width: "100%",
    aspectRatio: 4 / 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.info,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    padding: 8,
  },
  retakeText: { fontFamily: fonts.body, fontSize: 12, color: colors.info, textAlign: "center" },
  reviewRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    minHeight: 44,
  },
  reviewLabelRow: { flexDirection: "row", alignItems: "center", gap: 6, flex: 1 },
  reviewLabel: { fontFamily: fonts.body, fontSize: 14, color: colors.text },
  disclaimer: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 17,
    marginVertical: spacing.m,
    textAlign: "center",
  },
});
