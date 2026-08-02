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
import { T, TSH, TICON, touch } from "../../theme";
import { LIcon } from "../../components/LIcon";
import { Pill, SLabel } from "../../components/trove/primitives";
import { useLocale } from "../../i18n";
import { TRIP_STRINGS, TripStrings } from "../../i18n/trip";
import type { RootStackParamList } from "../../navigation";

// Teslim karşılaştırması — Faz 8 TROVE görünümü (sprint G6). Veri/davranış
// aynen: sayaç karşılaştırması, check-in/out gözlemleri, foto çiftleri,
// yeniden çekim (handover_pair kapısından), inceleme bayrağı, metin rapor
// paylaşımı. Erişilebilirlik: sütunlar ↑/↓ ok + metin etiketli (yalnız
// renk değil); negatif delta amber (dikkat) — kırmızı yalnız gerçek hata.
// Hukuki/sigorta iddiası YOK (factsDisclaimer aynen).

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
          <View style={styles.emptyIcon}>
            <LIcon name="shield" size={TICON.xl} color={T.ink3} />
          </View>
          <Text style={styles.emptyTitle}>{s.noCheckinYet}</Text>
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

  const issueLine = (i: { id: string; severity: string; title: string }) => (
    <View key={i.id} style={styles.issueRow}>
      <View style={styles.issueAccent} />
      <Text style={styles.issueText}>
        [{i.severity}] {i.title}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.statusRow}>
          <Pill text={statusLabel} type="info" />
        </View>

        {/* Sayaç karşılaştırması */}
        {meters.length > 0 && (
          <>
            <SLabel mt={16}>{s.metersCompare}</SLabel>
            <View style={styles.meterCard}>
              <View style={[styles.meterRow, styles.meterHeadRow]}>
                <Text style={[styles.meterCell, styles.meterHeadText]}></Text>
                {/* Tasarım sistemi v1.0 (A-4): sütunlar yalnız renkle değil
                    yön okuyla da ayrışır (WCAG AA). */}
                <Text style={[styles.meterCell, styles.meterHeadText]}>{`↑ ${s.checkIn}`}</Text>
                <Text style={[styles.meterCell, styles.meterHeadText]}>{`↓ ${s.checkOut}`}</Text>
                <Text style={[styles.meterCell, styles.meterHeadText]}>Δ</Text>
              </View>
              {meters.map((m: MeterComparisonRow, idx) => (
                <View
                  key={m.kind}
                  style={[styles.meterRow, idx < meters.length - 1 && styles.meterRowRule]}
                >
                  <Text style={[styles.meterCell, styles.meterName]}>
                    {s[(`meter_${m.kind}`) as keyof TripStrings] as string}
                  </Text>
                  <Text style={[styles.meterCell, styles.meterMono]}>
                    {m.checkIn !== null ? `${m.checkIn}` : "—"}
                  </Text>
                  <Text style={[styles.meterCell, styles.meterMono]}>
                    {m.checkOut !== null ? `${m.checkOut}` : "—"}
                  </Text>
                  <Text
                    style={[
                      styles.meterCell,
                      styles.meterMono,
                      m.delta !== null && m.delta < 0 && { color: T.amber, fontWeight: "600" },
                    ]}
                  >
                    {m.delta !== null ? `${m.delta > 0 ? "+" : ""}${m.delta}` : "—"}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Check-in gözlemleri */}
        {checkInIssues.length > 0 && (
          <>
            <SLabel mt={20}>{`${s.existingObservations} (${checkInIssues.length})`}</SLabel>
            {checkInIssues.map(issueLine)}
          </>
        )}

        {/* Check-out gözlemleri */}
        {checkOutIssues.length > 0 && (
          <>
            <SLabel mt={20}>{`${s.newObservations} (${checkOutIssues.length})`}</SLabel>
            {checkOutIssues.map(issueLine)}
          </>
        )}

        {/* Foto eşleştirmeleri */}
        {pairs.length > 0 && (
          <>
            <SLabel mt={20}>{`${s.photoPairs} (${pairs.length})`}</SLabel>
            {pairs.map((pair) => (
              <View key={pair.id} style={styles.pairCard}>
                {pair.label ? <Text style={styles.pairLabel}>{pair.label}</Text> : null}
                <View style={styles.pairImages}>
                  <View style={styles.pairSide}>
                    <Text style={styles.pairSideLabel}>{`↑ ${s.checkIn}`}</Text>
                    <Image
                      source={{ uri: pair.checkinUri }}
                      style={styles.pairImage}
                      accessibilityLabel={`${s.checkIn}: ${pair.label ?? ""}`}
                    />
                  </View>
                  <View style={styles.pairSide}>
                    <Text style={styles.pairSideLabel}>{`↓ ${s.checkOut}`}</Text>
                    {pair.checkoutUri ? (
                      <Image
                        source={{ uri: pair.checkoutUri }}
                        style={styles.pairImage}
                        accessibilityLabel={`${s.checkOut}: ${pair.label ?? ""}`}
                      />
                    ) : (
                      <Pressable
                        onPress={() => retake(pair, session)}
                        disabled={!checkOut}
                        accessibilityRole="button"
                        accessibilityLabel={s.retakePhoto}
                        accessibilityState={{ disabled: !checkOut }}
                        style={({ pressed }) => [
                          styles.retakeBtn,
                          (!checkOut || pressed) && { opacity: checkOut ? 0.8 : 0.4 },
                        ]}
                      >
                        <LIcon name="camera" size={TICON.lg} color={T.blue} />
                        <Text style={styles.retakeText}>{s.retakePhoto}</Text>
                      </Pressable>
                    )}
                  </View>
                </View>
                <View style={styles.reviewRow}>
                  <View style={styles.reviewLabelRow}>
                    <LIcon name="alert-triangle" size={TICON.md} color={T.amber} />
                    <Text style={styles.reviewLabel}>{s.requiresReviewLabel}</Text>
                  </View>
                  <Switch
                    value={pair.requiresReview}
                    onValueChange={(v) => {
                      setPairReview(pair.id, v);
                      refresh();
                    }}
                    accessibilityLabel={s.requiresReviewLabel}
                    trackColor={{ true: T.blue }}
                  />
                </View>
              </View>
            ))}
          </>
        )}

        <Text style={styles.disclaimer}>{s.factsDisclaimer}</Text>

        <Pressable
          onPress={() => void shareReport()}
          accessibilityRole="button"
          accessibilityLabel={s.shareReport}
          style={({ pressed }) => [styles.shareBtn, pressed && { opacity: 0.85 }]}
        >
          <LIcon name="share-2" size={TICON.md} color="#FFFFFF" />
          <Text style={styles.shareText}>{s.shareReport}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.bg },
  scroll: { padding: 16, paddingBottom: 32 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: T.surfaceEl,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  emptyTitle: { fontSize: 14, color: T.ink2, textAlign: "center" },
  statusRow: { alignItems: "center" },
  meterCard: {
    backgroundColor: T.surface,
    borderRadius: T.r2,
    borderWidth: 1,
    borderColor: T.rule,
    paddingHorizontal: 14,
    ...TSH.sh0,
  },
  meterRow: { flexDirection: "row", paddingVertical: 10, alignItems: "center" },
  meterHeadRow: { borderBottomWidth: 1, borderBottomColor: T.ruleStr },
  meterRowRule: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: T.rule },
  meterHeadText: { fontSize: 10, fontWeight: "600", color: T.ink2, letterSpacing: 0.3 },
  meterCell: { flex: 1, fontSize: 13, color: T.ink0 },
  meterMono: { fontFamily: T.mono, fontSize: 12 },
  meterName: { color: T.ink1 },
  issueRow: {
    flexDirection: "row",
    backgroundColor: T.surface,
    borderRadius: T.r3,
    borderWidth: 1,
    borderColor: T.rule,
    marginBottom: 6,
    overflow: "hidden",
  },
  issueAccent: { width: 2, backgroundColor: T.amber },
  issueText: {
    flex: 1,
    fontSize: 13,
    color: T.ink0,
    lineHeight: 19,
    paddingVertical: 9,
    paddingHorizontal: 12,
  },
  pairCard: {
    backgroundColor: T.surface,
    borderWidth: 1,
    borderColor: T.rule,
    borderRadius: T.r,
    padding: 14,
    marginBottom: 10,
    ...TSH.sh0,
  },
  pairLabel: { fontSize: 13, fontWeight: "600", color: T.ink0, marginBottom: 8 },
  pairImages: { flexDirection: "row", gap: 8 },
  pairSide: { flex: 1 },
  pairSideLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: T.ink2,
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  pairImage: {
    width: "100%",
    aspectRatio: 4 / 3,
    borderRadius: T.r3,
    backgroundColor: T.surfaceEl,
  },
  retakeBtn: {
    width: "100%",
    aspectRatio: 4 / 3,
    borderRadius: T.r3,
    borderWidth: 1,
    borderColor: "rgba(0,95,204,0.4)",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    padding: 8,
    backgroundColor: T.blueL,
  },
  retakeText: { fontSize: 12, color: T.blue, textAlign: "center", fontWeight: "500" },
  reviewRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    minHeight: touch.min,
  },
  reviewLabelRow: { flexDirection: "row", alignItems: "center", gap: 6, flex: 1 },
  reviewLabel: { fontSize: 13, color: T.ink0 },
  disclaimer: {
    fontSize: 11,
    color: T.ink3,
    lineHeight: 17,
    marginVertical: 16,
    textAlign: "center",
  },
  shareBtn: {
    backgroundColor: T.blue,
    borderRadius: T.r,
    minHeight: touch.min,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  shareText: { fontSize: 15, fontWeight: "700", color: "#FFFFFF", letterSpacing: -0.2 },
});
