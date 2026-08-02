import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  SafeAreaView,
  TextInput,
  Alert,
} from "react-native";
import { useFocusEffect, useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { T, TSH, TICON, touch } from "../../../theme";
import { LIcon } from "../../../components/LIcon";
import { BackBtn, KeelLine, Pill, SLabel, TDivider } from "../../../components/trove/primitives";
import {
  getTrip,
  getTripModuleStates,
  updateTripStatus,
  TripRow,
} from "../../../repositories/trips";
import { getVesselById } from "../../../repositories/vessels";
import { isDone, TripModuleStates } from "../../../domain/trip";
import {
  addSignoff,
  listOpenItems,
  listSignoffs,
  resolveOpenItem,
  SignoffRow,
} from "../../../repositories/completion";
import { OpenItem, SignoffRole } from "../../../domain/completion";
import { formatOccurredAt } from "../../../domain/log";
import { tripChecklistProgress } from "../prepare/checklistData";
import {
  generateTripReport,
  ReportUnavailableError,
  sharePdf,
} from "../../../report/generate";
import { useLocale } from "../../../i18n";
import { TRIP_STRINGS } from "../../../i18n/trip";
import { PREPARE_STRINGS } from "../../../i18n/prepare";
import { UNDERWAY_STRINGS } from "../../../i18n/underway";
import { COMPLETE_STRINGS, roleLabel } from "../../../i18n/complete";
import type { RootStackParamList } from "../../../navigation";

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, "TripComplete">;

// trip_checkout/complete — rehberli sefer kapanışı (onaylı tasarım:
// design-reference CheckoutScreen iskeleti). 8 saniyede iki soruyu yanıtlar:
// "tekneyi düzgün teslim ettik mi?" ve "olanların kaydı nerede?".
// Kâğıt işi hissi YOK: adım başına TEK baskın eylem; açık maddeler çözülmeye
// ZORLANMAZ (açık kalmak meşru ve raporda görünür); onay isteğe bağlı.
// Sefer, ancak buradaki son eylemle 'completed' olur — yerel yazım başarısız
// olursa durum değişmez, veri kaybolmaz.

export default function TripCompleteScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { locale } = useLocale();
  const s = TRIP_STRINGS[locale];
  const p = PREPARE_STRINGS[locale];
  const u = UNDERWAY_STRINGS[locale];
  const c = COMPLETE_STRINGS[locale];

  const [trip, setTrip] = useState<TripRow | null>(null);
  const [states, setStates] = useState<TripModuleStates | null>(null);
  const [open, setOpen] = useState<OpenItem[]>([]);
  const [signoffs, setSignoffs] = useState<SignoffRow[]>([]);
  const [checkProgress, setCheckProgress] = useState<{ done: number; total: number } | null>(null);
  const [signName, setSignName] = useState("");
  const [signRole, setSignRole] = useState<SignoffRole>("skipper");
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    const t = getTrip(route.params.tripId);
    setTrip(t);
    if (!t) return;
    setStates(getTripModuleStates(t));
    setOpen(listOpenItems(t.id));
    setSignoffs(listSignoffs(t.id));
    const kind = t.ownershipContext === "charter" ? "check_out" : "return_secure";
    setCheckProgress(tripChecklistProgress(t.id, kind));
  }, [route.params.tripId]);

  useFocusEffect(load);

  if (!trip || !states) return <SafeAreaView style={styles.safe} />;

  const isCharter = trip.ownershipContext === "charter";
  const boat = trip.boatId ? getVesselById(trip.boatId) : null;
  const checkDone = isCharter ? isDone(states.checkOut) : isDone(states.returnCheck);
  const canComplete = checkDone;

  function onResolve(item: OpenItem) {
    resolveOpenItem(item);
    load();
  }

  function onAddSignoff() {
    if (!trip || !signName.trim()) return;
    addSignoff({ tripId: trip.id, role: signRole, name: signName });
    setSignName("");
    load();
  }

  function onComplete() {
    if (!trip || !canComplete) return;
    updateTripStatus(trip.id, "completed");
    navigation.navigate("Tabs", { screen: "TripTab" });
  }

  // Sıra: rapor yerel üretilir → sefer kapanır → paylaşım sayfası açılır.
  // Paylaşımın iptali başarısızlık DEĞİLDİR; PDF hatasında sefer verisi
  // olduğu gibi kalır ve yeniden denenebilir (sahte başarı mesajı yok).
  async function onGenerateAndComplete() {
    if (!trip || !canComplete || busy) return;
    setBusy(true);
    try {
      const { relPath } = await generateTripReport(trip.id, locale);
      updateTripStatus(trip.id, "completed");
      try {
        await sharePdf(relPath);
      } catch {
        // paylaşım yüzeyi yoksa/iptalse tamamlama geri alınmaz
      }
      navigation.navigate("Tabs", { screen: "TripTab" });
    } catch (e) {
      if (e instanceof ReportUnavailableError) {
        Alert.alert(c.reportFailedTitle, c.reportUnavailable, [
          { text: s.cancel, style: "cancel" },
          { text: c.completeCta, onPress: onComplete },
        ]);
      } else {
        Alert.alert(c.reportFailedTitle, c.reportFailedBody, [
          { text: s.cancel, style: "cancel" },
          { text: c.retry, onPress: () => void onGenerateAndComplete() },
        ]);
      }
    } finally {
      setBusy(false);
    }
  }

  const stepDoneIcon = (done: boolean) => (
    <View style={[styles.stepCircle, done && styles.stepCircleDone]}>
      {done && <LIcon name="check" size={10} color="#FFFFFF" />}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Koyu hero (native başlık kapalı; geri düğmesi hero'da) */}
        <View style={styles.hero}>
          <View style={styles.heroBack}>
            <BackBtn onPress={() => navigation.goBack()} dark />
          </View>
          <Pill text={c.completingPill} type="ghost" />
          <Text style={styles.heroTitle} numberOfLines={2}>
            {trip.destination ?? trip.name}
          </Text>
          <Text style={styles.heroMeta}>
            {[boat?.name, trip.startAt && trip.endAt ? `${trip.startAt} – ${trip.endAt}` : null]
              .filter(Boolean)
              .join(" · ")}
          </Text>
        </View>

        <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
          {/* Adım 1 — dönüş listesi / check-out denetimi (ZORUNLU) */}
          <Pressable
            onPress={() =>
              isCharter
                ? navigation.navigate("TripCheckout", { tripId: trip.id })
                : navigation.navigate("TripReturn", { tripId: trip.id })
            }
            accessibilityRole="button"
            accessibilityLabel={isCharter ? s.checkOut : s.returnCheck}
            style={({ pressed }) => [
              styles.stepCard,
              checkDone && styles.stepCardDone,
              pressed && { opacity: 0.85 },
            ]}
          >
            {checkDone && <KeelLine />}
            <View style={[styles.stepInner, checkDone && { paddingLeft: 6 }]}>
              {stepDoneIcon(checkDone)}
              <View style={{ flex: 1 }}>
                <Text style={styles.stepTitle}>{isCharter ? s.checkOut : s.returnCheck}</Text>
                <Text style={[styles.stepSub, checkDone && { color: T.green }]}>
                  {checkProgress
                    ? `${checkProgress.done} ${p.ofWord} ${checkProgress.total} ${p.itemsWord}`
                    : p.notStarted}
                </Text>
              </View>
              <LIcon
                name={checkDone ? "check" : "chevron-right"}
                size={TICON.sm}
                color={checkDone ? T.green : T.ink3}
              />
            </View>
          </Pressable>

          {/* Adım 2 — charter: check-in / check-out karşılaştırması */}
          {isCharter && states.checkIn !== null && (
            <Pressable
              onPress={() => navigation.navigate("HandoverReview", { tripId: trip.id })}
              accessibilityRole="button"
              accessibilityLabel={s.handoverReview}
              style={({ pressed }) => [styles.stepCard, pressed && { opacity: 0.85 }]}
            >
              <View style={styles.stepInner}>
                {stepDoneIcon(false)}
                <View style={{ flex: 1 }}>
                  <Text style={styles.stepTitle}>{s.handoverReview}</Text>
                  <Text style={styles.stepSub}>{s.metersCompare}</Text>
                </View>
                <LIcon name="chevron-right" size={TICON.sm} color={T.ink3} />
              </View>
            </Pressable>
          )}

          {/* Adım 3 — açık maddeler (İSTEĞE BAĞLI; çözmeye zorlama yok) */}
          <SLabel mt={20}>{c.stepOpenItems}</SLabel>
          {open.length === 0 ? (
            <Text style={styles.allClear}>{c.openItemsNone}</Text>
          ) : (
            <>
              {open.map((item) => (
                <View key={`${item.source}-${item.id}`} style={styles.obsCard}>
                  <View style={styles.obsKeel} />
                  <View style={{ flex: 1, paddingLeft: 8 }}>
                    <Text style={styles.obsTitle} numberOfLines={2}>
                      {item.title}
                    </Text>
                    <Text style={styles.obsMeta} numberOfLines={1}>
                      {[
                        c[`origin_${item.origin}` as keyof typeof c] as string,
                        formatOccurredAt(item.recordedAt, locale),
                      ].join(" · ")}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => onResolve(item)}
                    accessibilityRole="button"
                    accessibilityLabel={`${u.resolveA11y}: ${item.title}`}
                    style={({ pressed }) => [styles.resolveBtn, pressed && { opacity: 0.7 }]}
                  >
                    <View style={styles.resolveCircle}>
                      <LIcon name="check" size={11} color={T.green} />
                    </View>
                  </Pressable>
                </View>
              ))}
              <Text style={styles.note}>{c.openItemsNote}</Text>
            </>
          )}

          {/* Adım 4 — yazılı onay (İSTEĞE BAĞLI; dürüst dil) */}
          <SLabel mt={20}>{c.stepSignoff}</SLabel>
          {signoffs.map((so) => (
            <View key={so.id} style={styles.signRow}>
              <View style={styles.signAvatar}>
                <Text style={styles.signInitial}>{(so.name[0] ?? "?").toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.signName}>
                  {so.name} · {roleLabel(c, so.role)}
                </Text>
                <Text style={styles.signMeta}>
                  {c.recordedAt}: {formatOccurredAt(so.signedAt, locale)}
                </Text>
              </View>
              <LIcon name="check-circle" size={TICON.md} color={T.green} />
            </View>
          ))}
          <View style={styles.signAddRow}>
            <TextInput
              value={signName}
              onChangeText={setSignName}
              placeholder={c.signoffNamePlaceholder}
              placeholderTextColor={T.ink3}
              style={styles.signInput}
              returnKeyType="done"
              onSubmitEditing={onAddSignoff}
            />
            <Pressable
              onPress={onAddSignoff}
              accessibilityRole="button"
              accessibilityLabel={c.addSignoff}
              style={({ pressed }) => [styles.signAddBtn, pressed && { opacity: 0.8 }]}
            >
              <LIcon name="plus" size={TICON.md} color={T.blue} />
            </Pressable>
          </View>
          <View style={styles.roleRow}>
            {(["skipper", "charterer", "base_rep"] as const).map((r) => (
              <Pressable
                key={r}
                onPress={() => setSignRole(r)}
                accessibilityRole="button"
                accessibilityState={{ selected: signRole === r }}
                style={[styles.roleChip, signRole === r && styles.roleChipOn]}
              >
                <Text style={[styles.roleText, signRole === r && styles.roleTextOn]}>
                  {roleLabel(c, r)}
                </Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.note}>{c.signoffOptionalNote}</Text>

          <TDivider />

          {/* Son eylem — rapor + kapanış; sefer ancak burada kapanır */}
          <Pressable
            onPress={() => void onGenerateAndComplete()}
            disabled={!canComplete || busy}
            accessibilityRole="button"
            accessibilityLabel={c.generateReport}
            accessibilityState={{ disabled: !canComplete || busy }}
            style={({ pressed }) => [
              styles.cta,
              { backgroundColor: canComplete && !busy ? T.blue : T.surfaceEl },
              pressed && canComplete && { opacity: 0.85 },
            ]}
          >
            <Text style={[styles.ctaText, { color: canComplete && !busy ? "#FFFFFF" : T.ink3 }]}>
              {c.generateReport}
            </Text>
          </Pressable>
          {!canComplete && <Text style={styles.blockedNote}>{c.completeBlockedNote}</Text>}
          {canComplete && (
            <Pressable
              onPress={onComplete}
              disabled={busy}
              accessibilityRole="button"
              accessibilityLabel={c.completeCta}
              style={({ pressed }) => [styles.skipBtn, pressed && { opacity: 0.7 }]}
            >
              <Text style={styles.skipText}>{c.completeCta}</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.bg },
  hero: { backgroundColor: T.vessel, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 20 },
  heroBack: { marginLeft: -12, marginBottom: 8 },
  heroTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.6,
    lineHeight: 29,
    marginTop: 8,
    marginBottom: 4,
  },
  heroMeta: { fontSize: 13, color: "rgba(255,255,255,0.42)" },
  stepCard: {
    backgroundColor: T.surface,
    borderRadius: T.r,
    borderWidth: 1,
    borderColor: T.rule,
    marginBottom: 8,
    overflow: "hidden",
    ...TSH.sh0,
  },
  stepCardDone: { borderColor: "rgba(0,135,90,0.16)" },
  stepInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: touch.row,
  },
  stepCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: T.ruleStr,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  stepCircleDone: { backgroundColor: T.green, borderColor: T.green },
  stepTitle: { fontSize: 13, fontWeight: "600", color: T.ink0 },
  stepSub: { fontSize: 11, color: T.ink2, marginTop: 2 },
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
  // Tasarım sistemi v1.0: açık madde kartının sol çizgisi amber.
  obsKeel: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: T.amber,
  },
  obsTitle: { fontSize: 13, fontWeight: "500", color: T.ink0, lineHeight: 18, marginBottom: 3 },
  obsMeta: { fontSize: 11, color: T.ink2 },
  resolveBtn: {
    minWidth: touch.min,
    minHeight: touch.min,
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
  note: { fontSize: 11, color: T.ink3, marginTop: 6, lineHeight: 16 },
  signRow: {
    backgroundColor: T.surface,
    borderRadius: T.r2,
    borderWidth: 1,
    borderColor: T.rule,
    paddingVertical: 11,
    paddingHorizontal: 14,
    marginBottom: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    ...TSH.sh0,
  },
  signAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: T.greenL,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  signInitial: { fontSize: 13, fontWeight: "700", color: T.green },
  signName: { fontSize: 13, fontWeight: "600", color: T.ink0 },
  signMeta: { fontSize: 11, color: T.ink2, marginTop: 1 },
  signAddRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  signInput: {
    flex: 1,
    fontSize: 13,
    color: T.ink0,
    backgroundColor: T.surface,
    borderRadius: T.r2,
    borderWidth: 1,
    borderColor: T.ruleStr,
    paddingHorizontal: 14,
    minHeight: touch.min,
  },
  signAddBtn: {
    width: touch.min,
    height: touch.min,
    borderRadius: T.r2,
    backgroundColor: T.blueL,
    alignItems: "center",
    justifyContent: "center",
  },
  roleRow: { flexDirection: "row", gap: 6, marginTop: 8 },
  roleChip: {
    paddingHorizontal: 12,
    minHeight: touch.min,
    justifyContent: "center",
    borderRadius: T.r3,
    backgroundColor: T.surfaceEl,
  },
  roleChipOn: { backgroundColor: T.ink0 },
  roleText: { fontSize: 11, fontWeight: "600", color: T.ink2 },
  roleTextOn: { color: "#FFFFFF" },
  cta: {
    borderRadius: T.r,
    paddingVertical: 15,
    alignItems: "center",
    minHeight: touch.min,
    justifyContent: "center",
  },
  ctaText: { fontSize: 14, fontWeight: "700", letterSpacing: -0.2 },
  blockedNote: { fontSize: 11, color: T.ink3, textAlign: "center", marginTop: 8 },
  skipBtn: { minHeight: touch.min, alignItems: "center", justifyContent: "center", marginTop: 4 },
  skipText: { fontSize: 12, fontWeight: "600", color: T.ink2 },
});
