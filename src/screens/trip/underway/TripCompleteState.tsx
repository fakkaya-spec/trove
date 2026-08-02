import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, Pressable, SafeAreaView, ScrollView, Alert } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { T, TSH, TICON, touch } from "../../../theme";
import { LIcon } from "../../../components/LIcon";
import { Pill } from "../../../components/trove/primitives";
import { TripRow } from "../../../repositories/trips";
import { listOpenItems } from "../../../repositories/completion";
import { getReportForTrip, ReportRecord } from "../../../repositories/report";
import {
  generateTripReport,
  ReportUnavailableError,
  sharePdf,
} from "../../../report/generate";
import { useLocale } from "../../../i18n";
import { UNDERWAY_STRINGS } from "../../../i18n/underway";
import { COMPLETE_STRINGS } from "../../../i18n/complete";
import { PremiumReportCta } from "../../../components/premium/PremiumEntryRow";
import type { RootStackParamList } from "../../../navigation";

type Nav = NativeStackNavigationProp<RootStackParamList>;

// Sefer tamamlandı durumu — sakin, dürüst kapanış: "sefer kapandı, kaydım
// güvende ve anlaşılır." Konfeti/rozet/oyunlaştırma YOK. Rapor buradan
// paylaşılır ve gerekirse yeniden üretilir; seyir defteri okunur kalır.

export function TripCompleteState({ trip }: { trip: TripRow }) {
  const navigation = useNavigation<Nav>();
  const { locale } = useLocale();
  const u = UNDERWAY_STRINGS[locale];
  const c = COMPLETE_STRINGS[locale];

  const [openCount, setOpenCount] = useState(0);
  const [report, setReport] = useState<ReportRecord | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    setOpenCount(listOpenItems(trip.id).length);
    setReport(getReportForTrip(trip.id));
  }, [trip.id]);

  useFocusEffect(load);

  async function onShare() {
    if (!report?.pdfPath) return;
    try {
      await sharePdf(report.pdfPath);
    } catch {
      Alert.alert(c.reportFailedTitle, c.reportUnavailable);
    }
  }

  async function onGenerate() {
    if (busy) return;
    setBusy(true);
    try {
      const { relPath } = await generateTripReport(trip.id, locale);
      load();
      try {
        await sharePdf(relPath);
      } catch {
        // paylaşım yüzeyi yoksa sessiz — rapor yerelde hazır
      }
    } catch (e) {
      Alert.alert(
        c.reportFailedTitle,
        e instanceof ReportUnavailableError ? c.reportUnavailable : c.reportFailedBody
      );
    } finally {
      setBusy(false);
    }
  }

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
          {openCount > 0 && (
            <Text style={styles.openNote}>
              {openCount} · {c.cat_still_open}
            </Text>
          )}
          {report?.generatedAt ? (
            <Text style={styles.reportNote}>
              {c.reportReady} · {c.generatedAtLabel}: {report.generatedAt.slice(0, 10)}
            </Text>
          ) : null}
          <Text style={styles.body}>{u.tripCompletedBody}</Text>
        </View>

        {report?.pdfPath ? (
          <>
            <Pressable
              onPress={() => void onShare()}
              accessibilityRole="button"
              accessibilityLabel={c.shareReportCta}
              style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.85 }]}
            >
              <Text style={styles.primaryText}>{c.shareReportCta}</Text>
            </Pressable>
            <Pressable
              onPress={() => void onGenerate()}
              disabled={busy}
              accessibilityRole="button"
              accessibilityLabel={c.regenerateReport}
              style={({ pressed }) => [styles.linkBtn, pressed && { opacity: 0.7 }]}
            >
              <Text style={styles.linkText}>{c.regenerateReport}</Text>
            </Pressable>
          </>
        ) : (
          <Pressable
            onPress={() => void onGenerate()}
            disabled={busy}
            accessibilityRole="button"
            accessibilityLabel={c.generateReport}
            style={({ pressed }) => [
              styles.primaryBtn,
              busy && { backgroundColor: T.surfaceEl },
              pressed && { opacity: 0.85 },
            ]}
          >
            <Text style={[styles.primaryText, busy && { color: T.ink3 }]}>
              {c.generateReport}
            </Text>
          </Pressable>
        )}

        {/* Ufuk girişi (ENTRY-1 #5): rapor/dışa aktarma kartının altında,
            koyu T.vessel CTA — ücretsiz rapor yukarıda eksiksiz durur. */}
        <PremiumReportCta />

        <Pressable
          onPress={() => navigation.navigate("TripWizard", {})}
          accessibilityRole="button"
          accessibilityLabel={u.startNewTrip}
          style={({ pressed }) => [styles.secondaryBtn, pressed && { opacity: 0.8 }]}
        >
          <Text style={styles.secondaryText}>{u.startNewTrip}</Text>
          <LIcon name="arrow-right" size={TICON.sm} color={T.ink3} />
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
  openNote: { fontSize: 12, color: T.amber, fontWeight: "600" },
  reportNote: { fontSize: 12, color: T.green, fontWeight: "600" },
  body: { fontSize: 13, color: T.ink2, lineHeight: 19, marginTop: 4 },
  primaryBtn: {
    backgroundColor: T.blue,
    borderRadius: T.r,
    paddingVertical: 15,
    alignItems: "center",
    minHeight: touch.min,
    justifyContent: "center",
    marginBottom: 8,
  },
  primaryText: { fontSize: 14, fontWeight: "700", color: "#FFFFFF" },
  linkBtn: { minHeight: touch.min, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  linkText: { fontSize: 12, color: T.blue },
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
    minHeight: touch.min,
    marginBottom: 8,
  },
  secondaryText: { fontSize: 13, fontWeight: "600", color: T.ink1 },
});
