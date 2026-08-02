import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  SafeAreaView,
  TextInput,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { T, TSH, TICON } from "../theme";
import { LIcon } from "../components/LIcon";
import { SLabel } from "../components/trove/primitives";
import { isDbReady } from "../db/state";
import { collectDeviceMetrics } from "../repositories/founderMetrics";
import {
  FounderMetrics,
  METRIC_KEYS,
  Milestone,
  pendingAlerts,
} from "../domain/milestones";
import {
  dismissMilestone,
  loadFounderState,
  setActivatedUsers,
  FounderState,
} from "../founder/store";
import { useLocale } from "../i18n";
import { FOUNDER_STRINGS, metricLabel } from "../i18n/founder";

// Founder Mode ekranı — normal kullanıcı ASLA görmez (Ayarlar'daki gizli
// hareketle açılır). Hiçbir ürün davranışını değiştirmez: Premium açmaz,
// limit koymaz — yalnız "karar verecek kadar gerçek veri birikti"
// hatırlatması ve cihazdaki gerçek kullanım sayıları.

export default function FounderScreen() {
  const { locale } = useLocale();
  const f = FOUNDER_STRINGS[locale];

  const [state, setState] = useState<FounderState | null>(null);
  const [metrics, setMetrics] = useState<FounderMetrics | null>(null);
  const [usersDraft, setUsersDraft] = useState("");

  const load = useCallback(() => {
    void (async () => {
      const st = await loadFounderState();
      setState(st);
      setUsersDraft(String(st.activatedUsers));
      if (isDbReady()) {
        const device = collectDeviceMetrics();
        setMetrics({ ...device, activated_users: st.activatedUsers });
      }
    })();
  }, []);

  useFocusEffect(load);

  if (!state || !metrics) return <SafeAreaView style={styles.safe} />;

  const alerts = pendingAlerts(metrics, state.dismissedMilestoneIds);

  async function onSaveUsers() {
    const n = Number.parseInt(usersDraft, 10) || 0;
    await setActivatedUsers(n);
    load();
  }

  async function onDismiss(m: Milestone) {
    if (!state) return;
    await dismissMilestone(state, m.id);
    load();
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {/* Kilometre taşı uyarıları — kapatılana dek görünür */}
        <SLabel mt={0}>{f.alertsHeading}</SLabel>
        {alerts.length === 0 ? (
          <Text style={styles.quiet}>{f.noAlerts}</Text>
        ) : (
          alerts.map((m) => {
            const title = (m.monetizationReview ? f.monetizationTitle : f.milestoneTitle).replace(
              "{n}",
              String(m.threshold)
            );
            const body = m.monetizationReview ? f.monetizationBody : f.milestoneBody;
            return (
              <View key={m.id} style={styles.alertCard}>
                <View style={styles.alertKeel} />
                <View style={{ flex: 1, paddingLeft: 10 }}>
                  <Text style={styles.alertTitle}>{title}</Text>
                  <Text style={styles.alertBody}>{body}</Text>
                  <Pressable
                    onPress={() => void onDismiss(m)}
                    accessibilityRole="button"
                    accessibilityLabel={f.dismiss}
                    style={({ pressed }) => [styles.dismissBtn, pressed && { opacity: 0.7 }]}
                  >
                    <Text style={styles.dismissText}>{f.dismiss}</Text>
                  </Pressable>
                </View>
              </View>
            );
          })
        )}

        {/* Aktif kullanıcı — elle giriş (telemetri yok; dürüst kaynak) */}
        <SLabel mt={24}>{f.activatedUsersLabel}</SLabel>
        <View style={styles.usersRow}>
          <TextInput
            value={usersDraft}
            onChangeText={setUsersDraft}
            keyboardType="number-pad"
            style={styles.usersInput}
            accessibilityLabel={f.activatedUsersLabel}
          />
          <Pressable
            onPress={() => void onSaveUsers()}
            accessibilityRole="button"
            style={({ pressed }) => [styles.saveBtn, pressed && { opacity: 0.8 }]}
          >
            <LIcon name="check" size={TICON.md} color="#FFFFFF" />
          </Pressable>
        </View>
        <Text style={styles.hint}>{f.activatedUsersHint}</Text>

        {/* Cihaz metrikleri */}
        <SLabel mt={24}>{f.metricsHeading}</SLabel>
        <View style={styles.metricsCard}>
          {METRIC_KEYS.filter((k) => k !== "activated_users").map((key, i, arr) => (
            <View key={key} style={[styles.metricRow, i < arr.length - 1 && styles.metricRule]}>
              <Text style={styles.metricLabel}>{metricLabel(f, key)}</Text>
              <Text style={styles.metricValue}>{metrics[key]}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.hint}>{f.dataSourceNote}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.bg },
  quiet: { fontSize: 12, color: T.ink3, paddingVertical: 4 },
  alertCard: {
    backgroundColor: T.surface,
    borderRadius: T.r,
    borderWidth: 1,
    borderColor: "rgba(201,106,0,0.25)",
    padding: 14,
    marginBottom: 8,
    flexDirection: "row",
    overflow: "hidden",
    ...TSH.sh1,
  },
  alertKeel: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: T.amber,
  },
  alertTitle: { fontSize: 14, fontWeight: "700", color: T.ink0, lineHeight: 19 },
  alertBody: { fontSize: 12, color: T.ink1, lineHeight: 18, marginTop: 6 },
  dismissBtn: {
    alignSelf: "flex-start",
    minHeight: 40,
    justifyContent: "center",
    marginTop: 6,
  },
  dismissText: { fontSize: 12, fontWeight: "600", color: T.blue },
  usersRow: { flexDirection: "row", gap: 8, alignItems: "center" },
  usersInput: {
    flex: 1,
    backgroundColor: T.surface,
    borderRadius: T.r2,
    borderWidth: 1,
    borderColor: T.ruleStr,
    paddingHorizontal: 14,
    minHeight: 44,
    fontSize: 15,
    color: T.ink0,
    fontFamily: T.mono,
  },
  saveBtn: {
    width: 44,
    height: 44,
    borderRadius: T.r2,
    backgroundColor: T.blue,
    alignItems: "center",
    justifyContent: "center",
  },
  hint: { fontSize: 11, color: T.ink3, lineHeight: 16, marginTop: 8 },
  metricsCard: {
    backgroundColor: T.surface,
    borderRadius: T.r2,
    borderWidth: 1,
    borderColor: T.rule,
    paddingHorizontal: 14,
    ...TSH.sh0,
  },
  metricRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  metricRule: { borderBottomWidth: 1, borderBottomColor: T.rule },
  metricLabel: { fontSize: 13, color: T.ink1 },
  metricValue: { fontFamily: T.mono, fontSize: 13, color: T.ink0 },
});
