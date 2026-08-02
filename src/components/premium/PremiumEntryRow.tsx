import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { T, TSH, touch } from "../../theme";
import { useEntitlement } from "../../entitlement";
import {
  isInActiveFlow,
  isModuleDismissed,
  subscribeSession,
} from "../../entitlement/session";
import { useLocale } from "../../i18n";
import { PREMIUM_STRINGS, type UpgradeModule } from "../../i18n/premium";
import type { RootStackParamList } from "../../navigation";

// Premium giriş satırı — "ufuk, kapı değil" (premium-design-system.md §1):
// ücretsiz sonucun ALTINDA, standart içerik satırıyla AYNI görsel ağırlıkta
// bir davet. Görünmez olduğu durumlar: kullanıcı zaten yetkili · aktif akış
// sürüyor (PROTECT-1; akışın kendi yüzeyi withinOwnFlow ile muaf) · modülün
// sayfası bu oturumda kapatıldı (ENTRY-2). Dokunma = açık kullanıcı isteği →
// yükseltme sayfası her zaman açılır (§3 "user explicitly requests").

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function PremiumEntryRow({
  module,
  title,
  pill,
  withinOwnFlow = false,
  mt = 12,
}: {
  module: UpgradeModule;
  title: string;
  pill: string;
  /** Akışın kendi kapı-açıklama yüzeyi: inActiveFlow kontrolünden muaf. */
  withinOwnFlow?: boolean;
  mt?: number;
}) {
  const navigation = useNavigation<Nav>();
  const { premiumActive } = useEntitlement();
  const [, setTick] = useState(0);

  useEffect(() => subscribeSession(() => setTick((n) => n + 1)), []);

  // GERÇEK Premium sahibi yükseltme daveti görmez; beta tam erişimde
  // yüzeyler tasarım doğrulaması için görünür kalır (spec §9).
  if (premiumActive) return null;
  if (!withinOwnFlow && isInActiveFlow()) return null;
  if (isModuleDismissed(module)) return null;

  return (
    <Pressable
      onPress={() => navigation.navigate("Upgrade", { module })}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={({ pressed }) => [styles.row, { marginTop: mt }, pressed && { opacity: 0.85 }]}
    >
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.pill}>
        <Text style={styles.pillText}>{pill}</Text>
      </View>
    </Pressable>
  );
}

/** Rapor yüzeyi için koyu (T.vessel) CTA varyantı (implementation-audit ENTRY-1 #5). */
export function PremiumReportCta({ mt = 12 }: { mt?: number }) {
  const navigation = useNavigation<Nav>();
  const { premiumActive } = useEntitlement();
  const { locale } = useLocale();
  const m = PREMIUM_STRINGS[locale];
  const [, setTick] = useState(0);

  useEffect(() => subscribeSession(() => setTick((n) => n + 1)), []);

  if (premiumActive) return null;
  if (isInActiveFlow()) return null;
  if (isModuleDismissed("report")) return null;

  return (
    <Pressable
      onPress={() => navigation.navigate("Upgrade", { module: "report" })}
      accessibilityRole="button"
      accessibilityLabel={m.entryReportCta}
      style={({ pressed }) => [styles.reportCta, { marginTop: mt }, pressed && { opacity: 0.85 }]}
    >
      <Text style={styles.reportCtaText}>{m.entryReportCta}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    backgroundColor: T.surface,
    borderRadius: T.r2,
    borderWidth: 1,
    borderColor: T.rule,
    paddingHorizontal: 14,
    minHeight: touch.min,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    ...TSH.sh0,
  },
  title: { flex: 1, fontSize: 13, color: T.ink1 },
  pill: {
    backgroundColor: T.blueL,
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pillText: { fontSize: 11, fontWeight: "700", color: T.blue },
  reportCta: {
    backgroundColor: T.vessel,
    borderRadius: T.r,
    minHeight: touch.min,
    alignItems: "center",
    justifyContent: "center",
  },
  reportCtaText: { fontSize: 14, fontWeight: "700", color: "#FFFFFF", letterSpacing: -0.2 },
});
