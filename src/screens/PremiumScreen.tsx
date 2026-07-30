import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { colors, fonts, spacing } from "../theme";
import { RopeDivider } from "../components/ui";
import { useLocale } from "../i18n";
import { SKU_MONTHLY, SKU_YEARLY, usePremium } from "../premium";

export default function PremiumScreen() {
  const navigation = useNavigation();
  const { t } = useLocale();
  const { isPremium, storeAvailable, prices, busy, purchase, restore, devToggle } =
    usePremium();

  useEffect(() => {
    navigation.setOptions({ title: t.premiumScreenTitle });
  }, [t]);

  async function buy(sku: string) {
    const started = await purchase(sku);
    if (!started) {
      Alert.alert(t.premiumErrorTitle, t.premiumErrorMsg);
    }
  }

  if (isPremium) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.activeTitle}>{t.premiumActiveTitle}</Text>
          <Text style={styles.activeSub}>{t.premiumActiveSub}</Text>
          {__DEV__ && (
            <Pressable onPress={devToggle} style={styles.devBtn}>
              <Text style={styles.devBtnText}>DEV: premium kapat</Text>
            </Pressable>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.star}>⭐</Text>
        <Text style={styles.lead}>{t.premiumLead}</Text>

        <RopeDivider />

        {[t.premiumBenefit1, t.premiumBenefit2, t.premiumBenefit3].map((b, i) => (
          <View key={i} style={styles.benefit}>
            <Text style={styles.benefitTick}>✓</Text>
            <Text style={styles.benefitText}>{b}</Text>
          </View>
        ))}

        <RopeDivider />

        <View style={styles.planRow}>
          <Pressable
            onPress={() => buy(SKU_MONTHLY)}
            disabled={busy || !storeAvailable}
            style={({ pressed }) => [
              styles.plan,
              (pressed || busy) && { opacity: 0.7 },
              !storeAvailable && styles.planDisabled,
            ]}
          >
            <Text style={styles.planName}>{t.premiumMonthly}</Text>
            <Text style={styles.planPrice}>{prices.monthly ?? "—"}</Text>
          </Pressable>

          <Pressable
            onPress={() => buy(SKU_YEARLY)}
            disabled={busy || !storeAvailable}
            style={({ pressed }) => [
              styles.plan,
              styles.planBest,
              (pressed || busy) && { opacity: 0.7 },
              !storeAvailable && styles.planDisabled,
            ]}
          >
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{t.premiumYearlyBadge}</Text>
            </View>
            <Text style={[styles.planName, { color: colors.night }]}>
              {t.premiumYearly}
            </Text>
            <Text style={[styles.planPrice, { color: colors.night }]}>
              {prices.yearly ?? "—"}
            </Text>
          </Pressable>
        </View>

        {busy && <ActivityIndicator color={colors.brass} style={{ marginTop: 12 }} />}

        {!storeAvailable && (
          <Text style={styles.unavailable}>{t.premiumUnavailable}</Text>
        )}

        <Pressable onPress={restore} disabled={busy || !storeAvailable} hitSlop={8}>
          <Text style={styles.restore}>{t.premiumRestore}</Text>
        </Pressable>

        <Text style={styles.note}>{t.premiumNote}</Text>

        {__DEV__ && (
          <Pressable onPress={devToggle} style={styles.devBtn}>
            <Text style={styles.devBtnText}>DEV: premium simüle et</Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.night },
  scroll: { padding: spacing.l, paddingBottom: spacing.xl },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.l },
  star: { fontSize: 44, textAlign: "center", marginBottom: spacing.s },
  lead: {
    fontFamily: fonts.body,
    fontStyle: "italic",
    fontSize: 15,
    lineHeight: 22,
    color: colors.paper,
    textAlign: "center",
  },
  benefit: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
    marginBottom: spacing.s,
  },
  benefitTick: { color: colors.seafoam, fontSize: 16, fontWeight: "700" },
  benefitText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: colors.fog,
  },
  planRow: { flexDirection: "row", gap: 12, marginTop: spacing.s },
  plan: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.brass,
    borderRadius: 8,
    padding: spacing.m,
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.nightDeep,
  },
  planBest: { backgroundColor: colors.brass },
  planDisabled: { opacity: 0.4 },
  badge: {
    position: "absolute",
    top: -10,
    backgroundColor: colors.signal,
    borderRadius: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 1,
    color: colors.paper,
    fontWeight: "700",
  },
  planName: {
    fontFamily: fonts.display,
    fontSize: 16,
    fontWeight: "700",
    color: colors.paper,
    marginTop: 6,
  },
  planPrice: { fontFamily: fonts.mono, fontSize: 15, color: colors.brass },
  unavailable: {
    fontFamily: fonts.body,
    fontStyle: "italic",
    fontSize: 12,
    lineHeight: 18,
    color: colors.fog,
    textAlign: "center",
    marginTop: spacing.m,
  },
  restore: {
    fontFamily: fonts.mono,
    fontSize: 12,
    letterSpacing: 1,
    color: colors.seafoam,
    textAlign: "center",
    marginTop: spacing.l,
  },
  note: {
    fontFamily: fonts.body,
    fontSize: 11,
    lineHeight: 16,
    color: colors.fog,
    textAlign: "center",
    marginTop: spacing.m,
    opacity: 0.8,
  },
  activeTitle: {
    fontFamily: fonts.display,
    fontSize: 24,
    fontWeight: "700",
    color: colors.brass,
  },
  activeSub: {
    fontFamily: fonts.body,
    fontStyle: "italic",
    fontSize: 14,
    color: colors.fog,
    marginTop: spacing.s,
    textAlign: "center",
  },
  devBtn: {
    marginTop: spacing.l,
    alignSelf: "center",
    borderWidth: 1,
    borderColor: colors.fog,
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  devBtnText: { fontFamily: fonts.mono, fontSize: 10, color: colors.fog },
});
