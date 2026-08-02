import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, SafeAreaView, Alert } from "react-native";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { T, TICON } from "../theme";
import { LIcon, type LIconName } from "../components/LIcon";
import { TroveMark } from "../components/brand/TroveMark";
import { usePremium, SKU_MONTHLY, SKU_YEARLY } from "../premium";
import { useLocale } from "../i18n";
import { ENTITLEMENT_STRINGS, contextLine } from "../i18n/entitlement";
import type { RootStackParamList } from "../navigation";

// Paywall — docs/MONETIZATION.md KİLİTLİ UX kuralları:
//  (2) kilitli fayda metni aynen; (3) her kapı kendini açıklar;
//  (1) metin kaydı asla engellenmez — kapat düğmesi bunu açıkça söyler.
// Ekran aboneliği kendisi YÖNETMEZ; satın alma/geri yükleme PremiumProvider
// üstünden akar (Seçenek A taşıyıcısı, kural 8).

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, "Paywall">;

export default function PaywallScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { locale } = useLocale();
  const s = ENTITLEMENT_STRINGS[locale];
  const premium = usePremium();

  const features: { icon: LIconName; text: string }[] = [
    { icon: "camera", text: s.featTimestamped },
    { icon: "shield", text: s.featComparePairs },
    { icon: "sailboat", text: s.featVisualRecord },
    { icon: "check-circle", text: s.featEvidenceKept },
  ];

  async function onRestore() {
    const ok = await premium.restore();
    Alert.alert(ok ? s.restoreDone : s.restoreNone);
    if (ok) navigation.goBack();
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Koyu hero */}
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <TroveMark size={20} color="#FFFFFF" />
            <Pressable
              onPress={() => navigation.goBack()}
              accessibilityRole="button"
              hitSlop={8}
              style={styles.closeBtn}
            >
              <LIcon name="x" size={TICON.md} color="rgba(255,255,255,0.70)" />
            </Pressable>
          </View>
          <View style={styles.accent} />
          <Text style={styles.heroTitle}>{s.paywallTitle}</Text>
          <Text style={styles.heroBody}>{s.paywallBenefit}</Text>
          <Text style={styles.heroContext}>{contextLine(s, route.params.context)}</Text>
        </View>

        <View style={{ paddingHorizontal: 16, paddingTop: 20 }}>
          {features.map((f) => (
            <View key={f.icon + f.text} style={styles.featRow}>
              <View style={styles.featIcon}>
                <LIcon name={f.icon} size={TICON.md} color={T.blue} />
              </View>
              <Text style={styles.featText}>{f.text}</Text>
            </View>
          ))}

          {premium.storeAvailable ? (
            <View style={{ marginTop: 20, gap: 8 }}>
              <Pressable
                onPress={() => premium.purchase(SKU_YEARLY)}
                disabled={premium.busy}
                accessibilityRole="button"
                style={({ pressed }) => [styles.buyBtn, (pressed || premium.busy) && { opacity: 0.8 }]}
              >
                <Text style={styles.buyBtnText}>
                  {s.yearly}
                  {premium.prices.yearly ? ` · ${premium.prices.yearly}` : ""}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => premium.purchase(SKU_MONTHLY)}
                disabled={premium.busy}
                accessibilityRole="button"
                style={({ pressed }) => [styles.buyBtnAlt, (pressed || premium.busy) && { opacity: 0.8 }]}
              >
                <Text style={styles.buyBtnAltText}>
                  {s.monthly}
                  {premium.prices.monthly ? ` · ${premium.prices.monthly}` : ""}
                </Text>
              </Pressable>
              <Pressable
                onPress={onRestore}
                disabled={premium.busy}
                accessibilityRole="button"
                style={styles.restoreBtn}
              >
                <Text style={styles.restoreText}>{s.restore}</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.storeNote}>
              <Text style={styles.storeNoteText}>{s.storeUnavailable}</Text>
            </View>
          )}

          {__DEV__ && (
            <Pressable
              onPress={premium.devToggle}
              accessibilityRole="button"
              style={styles.restoreBtn}
            >
              <Text style={styles.restoreText}>DEV: toggle premium</Text>
            </Pressable>
          )}

          {/* Kural 1+3: metin kaydı her zaman ücretsiz; kapı kendini açıklar */}
          <Pressable
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            style={({ pressed }) => [styles.textOnlyBtn, pressed && { opacity: 0.8 }]}
          >
            <Text style={styles.textOnlyText}>{s.continueTextOnly}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.bg },
  hero: { backgroundColor: T.vessel, paddingHorizontal: 24, paddingTop: 12, paddingBottom: 28 },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 28,
  },
  closeBtn: {
    width: 44,
    height: 44,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  accent: { width: 36, height: 2, backgroundColor: T.blue, borderRadius: 99, marginBottom: 16 },
  heroTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.6,
    lineHeight: 28,
    marginBottom: 10,
  },
  heroBody: { fontSize: 14, color: "rgba(255,255,255,0.60)", lineHeight: 21 },
  heroContext: { fontSize: 12, color: "rgba(255,255,255,0.38)", marginTop: 12, lineHeight: 17 },
  featRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  featIcon: {
    width: 34,
    height: 34,
    borderRadius: T.r3,
    backgroundColor: T.blueL,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  featText: { flex: 1, fontSize: 13, color: T.ink1, lineHeight: 18 },
  buyBtn: {
    backgroundColor: T.blue,
    borderRadius: T.r,
    paddingVertical: 15,
    alignItems: "center",
  },
  buyBtnText: { fontSize: 14, fontWeight: "700", color: "#FFFFFF", letterSpacing: -0.2 },
  buyBtnAlt: {
    backgroundColor: T.surface,
    borderWidth: 1,
    borderColor: T.ruleStr,
    borderRadius: T.r,
    paddingVertical: 15,
    alignItems: "center",
  },
  buyBtnAltText: { fontSize: 14, fontWeight: "600", color: T.ink0 },
  restoreBtn: { minHeight: 44, alignItems: "center", justifyContent: "center" },
  restoreText: { fontSize: 12, color: T.blue },
  storeNote: {
    backgroundColor: T.surfaceEl,
    borderRadius: T.r,
    padding: 14,
    marginTop: 20,
  },
  storeNoteText: { fontSize: 12, color: T.ink2, lineHeight: 18 },
  textOnlyBtn: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  textOnlyText: { fontSize: 13, fontWeight: "600", color: T.ink2 },
});
