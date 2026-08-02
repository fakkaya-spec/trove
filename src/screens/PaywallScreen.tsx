import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, SafeAreaView, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { T, TSH, touch, TICON } from "../theme";
import { LIcon } from "../components/LIcon";
import { TroveMark } from "../components/brand/TroveMark";
import { usePremium, SKU_YEARLY } from "../premium";
import { useLocale } from "../i18n";
import { PREMIUM_STRINGS } from "../i18n/premium";
import { ENTITLEMENT_STRINGS } from "../i18n/entitlement";
import type { RootStackParamList } from "../navigation";

// Tam ekran paywall — premium-design-system.md §5 "Full-Screen Paywall".
// Yalnız gönüllü keşif girişinden açılır (Ayarlar); kapı bağlamları modül
// yükseltme sayfasına gider. Yapı spec'ten BİREBİR: T.vessel başlık +
// wordmark + X + 28×2 mavi aksan + başlık/alt başlık → NELER GELİŞİR (5
// modül başlığı, 2px mavi sol vurgu) → ayraç → ÜCRETSİZ VE PREMIUM düzyazı
// tablosu (işaret yok) → CTA + fiyat notu (yalnız mağazadan) + Geri yükle +
// Şimdi değil + yasal dip not. Aciliyet/sayaç/sosyal kanıt YOK (§1).
// Sabit fiyat kodlanmaz (MONETIZATION); fiyat yalnız mağazadan gelirse yazılır.

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function PaywallScreen() {
  const navigation = useNavigation<Nav>();
  const { locale } = useLocale();
  const m = PREMIUM_STRINGS[locale];
  const e = ENTITLEMENT_STRINGS[locale];
  const premium = usePremium();

  // Dürüstlük kuralı (sprint D/C): yalnız BUGÜN gerçekten var olan Premium
  // davranışı anlatılır — kilitli fayda metinleri (MONETIZATION kural 2)
  // tam da bu kümedir. İkmal/mürettebat derinliği kodlanınca satırları
  // spec §5-6 kütüphanesinden geri eklenir.
  const improves = [e.featTimestamped, e.featComparePairs, e.featVisualRecord, e.featEvidenceKept];

  const comparison: { feature: string; free: string; pro: string }[] = [
    { feature: m.cmpInspection, free: m.cmpInspectionFree, pro: m.cmpInspectionPremium },
    { feature: m.cmpLogbook, free: m.cmpLogbookFree, pro: m.cmpLogbookPremium },
    { feature: m.cmpReports, free: m.cmpReportsFree, pro: m.cmpReportsPremium },
  ];

  async function onRestore() {
    const ok = await premium.restore();
    if (ok) {
      navigation.goBack();
    } else {
      // §5 durumu: geri yükleme hatası — inline yerine mevcut mesaj yüzeyi;
      // Faz 3 (STATES-1) Alert desenlerini inline kopyaya taşıyacak.
      Alert.alert(m.restoreError);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        {/* 1. Koyu başlık */}
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <TroveMark size={20} color="#FFFFFF" />
            <Pressable
              onPress={() => navigation.goBack()}
              accessibilityRole="button"
              accessibilityLabel={m.ctaNotNow}
              hitSlop={8}
              style={styles.closeWrap}
            >
              <View style={styles.closeBtn}>
                <LIcon name="x" size={TICON.md} color="rgba(255,255,255,0.70)" />
              </View>
            </Pressable>
          </View>
          <View style={styles.accent} />
          <Text style={styles.heroTitle}>{m.paywallHeadline}</Text>
          <Text style={styles.heroSub}>{m.paywallSubline}</Text>
        </View>

        <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
          {/* 2. Neler gelişir — 5 modül, 2px mavi sol vurgu */}
          <Text style={styles.sectionLabel}>{m.whatImprovesPremium}</Text>
          {improves.map((line) => (
            <View key={line} style={styles.improveRow}>
              <View style={styles.improveAccent} />
              <Text style={styles.improveText}>{line}</Text>
            </View>
          ))}

          <View style={styles.divider} />

          {/* 4. Ücretsiz ve Premium — yalnız düzyazı, işaret yok */}
          <Text style={styles.sectionLabel}>{m.freeVsPremium}</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHead]}>
              <Text style={[styles.tableCellFeature, styles.tableHeadText]} />
              <Text style={[styles.tableCell, styles.tableHeadText]}>{m.colFree}</Text>
              <Text style={[styles.tableCell, styles.tableHeadText]}>{m.colPremium}</Text>
            </View>
            {comparison.map((row, i) => (
              <View
                key={row.feature}
                style={[styles.tableRow, i < comparison.length - 1 && styles.tableRowRule]}
              >
                <Text style={styles.tableCellFeature}>{row.feature}</Text>
                <Text style={styles.tableCell}>{row.free}</Text>
                <Text style={[styles.tableCell, { color: T.ink0, fontWeight: "500" }]}>
                  {row.pro}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.divider} />

          {/* 6. CTA + bağlantılar + yasal dip not */}
          {premium.storeAvailable ? (
            <>
              <Pressable
                onPress={() => premium.purchase(SKU_YEARLY)}
                disabled={premium.busy}
                accessibilityRole="button"
                accessibilityLabel={m.ctaUpgrade}
                style={({ pressed }) => [
                  styles.cta,
                  (pressed || premium.busy) && { opacity: 0.85 },
                ]}
              >
                <Text style={styles.ctaText}>
                  {premium.busy
                    ? m.statePurchasing
                    : `${m.ctaUpgrade}${premium.prices.yearly ? ` · ${premium.prices.yearly}` : ""}`}
                </Text>
              </Pressable>
              <Text style={styles.legal}>{m.legalAutoRenew}</Text>
            </>
          ) : (
            <Text style={styles.storeNote}>{m.storeUnavailable}</Text>
          )}

          <View style={styles.linksRow}>
            <Pressable
              onPress={() => void onRestore()}
              disabled={premium.busy}
              accessibilityRole="button"
              style={styles.linkBtn}
            >
              <Text style={styles.linkText}>{m.ctaRestore}</Text>
            </Pressable>
            <Pressable
              onPress={() => navigation.goBack()}
              accessibilityRole="button"
              style={styles.linkBtn}
            >
              <Text style={styles.linkTextMuted}>{m.ctaNotNow}</Text>
            </Pressable>
          </View>

          {__DEV__ && (
            <Pressable onPress={premium.devToggle} accessibilityRole="button" style={styles.linkBtn}>
              <Text style={styles.linkTextMuted}>DEV: toggle premium</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.bg },
  hero: { backgroundColor: T.vessel, paddingHorizontal: 20, paddingTop: 14, paddingBottom: 28 },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  closeWrap: { width: touch.min, height: touch.min, alignItems: "flex-end", justifyContent: "center" },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 99,
    backgroundColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },
  accent: { width: 28, height: 2, backgroundColor: T.blue, borderRadius: 99, marginBottom: 14 },
  heroTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.6,
    lineHeight: 30,
    marginBottom: 8,
  },
  heroSub: { fontSize: 13, color: "rgba(255,255,255,0.50)", lineHeight: 19 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: T.ink3,
    letterSpacing: 0.4,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  improveRow: { flexDirection: "row", gap: 10, marginBottom: 8 },
  improveAccent: { width: 2, borderRadius: 1, backgroundColor: T.blue },
  improveText: { flex: 1, fontSize: 13, color: T.ink0, lineHeight: 20 },
  divider: { height: 1, backgroundColor: T.rule, marginVertical: 20 },
  table: {
    backgroundColor: T.surface,
    borderRadius: T.r2,
    borderWidth: 1,
    borderColor: T.rule,
    paddingHorizontal: 14,
    ...TSH.sh0,
  },
  tableRow: { flexDirection: "row", paddingVertical: 10, gap: 8 },
  tableRowRule: { borderBottomWidth: 1, borderBottomColor: T.rule },
  tableHead: { borderBottomWidth: 1, borderBottomColor: T.ruleStr },
  tableHeadText: { fontSize: 11, fontWeight: "600", color: T.ink2, textTransform: "uppercase" },
  tableCellFeature: { flex: 1, fontSize: 12, fontWeight: "600", color: T.ink1 },
  tableCell: { flex: 1.2, fontSize: 12, color: T.ink2, lineHeight: 17 },
  cta: {
    backgroundColor: T.blue,
    borderRadius: T.r,
    minHeight: touch.min,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaText: { fontSize: 15, fontWeight: "700", color: "#FFFFFF", letterSpacing: -0.2 },
  legal: { fontSize: 10, color: T.ink3, textAlign: "center", lineHeight: 16, marginTop: 8 },
  storeNote: { fontSize: 12, color: T.ink2, textAlign: "center", lineHeight: 18 },
  linksRow: { flexDirection: "row", justifyContent: "center", gap: 24, marginTop: 8 },
  linkBtn: { minHeight: 44, alignItems: "center", justifyContent: "center" },
  linkText: { fontSize: 13, fontWeight: "500", color: T.blue },
  linkTextMuted: { fontSize: 13, fontWeight: "500", color: T.ink2 },
});
