import React, { useCallback, useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, SafeAreaView } from "react-native";
import { useFocusEffect, useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { T, TSH, TICON } from "../../../theme";
import { LIcon } from "../../../components/LIcon";
import { SampleBanner } from "../../../components/trove/SampleBanner";
import { getTrip, TripRow } from "../../../repositories/trips";
import {
  generatePlan,
  listPlanItems,
  ProvisionItemRow,
  ProvisionPlanRow,
} from "../../../repositories/provisioning";
import { useLocale } from "../../../i18n";
import { TRIP_STRINGS, TripStrings } from "../../../i18n/trip";
import { PREPARE_STRINGS } from "../../../i18n/prepare";
import type { RootStackParamList } from "../../../navigation";

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, "TripProvisions">;

// trip_provisions — mevcut ikmal motoru/planı üstüne onaylı TROVE görünümü:
// mono istatistik şeridi (Days/People/Meals), kategori akordeonu, mono
// miktarlar. Hesap ve düzenleme motoru DEĞİŞMEDİ (repositories/provisioning);
// ayrıntılı düzenleme eski Provisioning ekranında yaşamaya devam eder.

export default function TripProvisionsScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { locale } = useLocale();
  const s = TRIP_STRINGS[locale];
  const p = PREPARE_STRINGS[locale];

  const [trip, setTrip] = useState<TripRow | null>(null);
  const [plan, setPlan] = useState<ProvisionPlanRow | null>(null);
  const [items, setItems] = useState<ProvisionItemRow[]>([]);
  const [open, setOpen] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      const t = getTrip(route.params.tripId);
      setTrip(t);
      if (t) {
        // İdempotent: plan varsa döner, yoksa üretir (mevcut motor).
        const pl = generatePlan(t, locale);
        setPlan(pl);
        setItems(listPlanItems(pl.id));
      }
    }, [route.params.tripId, locale])
  );

  const catLabel = useCallback(
    (c: string) => (s[(`cat_${c}`) as keyof TripStrings] as string) ?? c,
    [s]
  );

  const categories = useMemo(() => {
    const byCat = new Map<string, ProvisionItemRow[]>();
    for (const item of items) {
      if (item.state === "skipped") continue;
      const list = byCat.get(item.category) ?? [];
      list.push(item);
      byCat.set(item.category, list);
    }
    return [...byCat.entries()];
  }, [items]);

  if (!trip || !plan) return <SafeAreaView style={styles.safe} />;

  const inputs = plan.inputs;
  const days = inputs?.days ?? 0;
  const people = trip.adults + trip.children;
  const meals = inputs
    ? inputs.profile.breakfastsAboard + inputs.profile.lunchesAboard + inputs.profile.dinnersAboard
    : 0;

  const stats: [string, number][] = [
    [s.days, days],
    [s.people, people],
    [s.meals, meals],
  ];

  return (
    <SafeAreaView style={styles.safe}>
      {/* Mono istatistik şeridi */}
      <View style={styles.statsRow}>
        {stats.map(([label, value], i) => (
          <React.Fragment key={label}>
            {i > 0 && <View style={styles.statRule} />}
            <View style={styles.stat}>
              <Text style={styles.statValue}>{value}</Text>
              <Text style={styles.statLabel}>{label}</Text>
            </View>
          </React.Fragment>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        {trip.isSample && (
          <SampleBanner onCreate={() => navigation.navigate("Tabs", { screen: "VesselTab" })} />
        )}
        <Text style={styles.estimateNote}>{s.provEstimateNote}</Text>

        {categories.map(([cat, catItems]) => {
          const isOpen = open === cat;
          return (
            <View key={cat} style={{ marginBottom: 8 }}>
              <Pressable
                onPress={() => setOpen(isOpen ? null : cat)}
                accessibilityRole="button"
                accessibilityLabel={catLabel(cat)}
                style={({ pressed }) => [
                  styles.catHeader,
                  isOpen && styles.catHeaderOpen,
                  pressed && { opacity: 0.85 },
                ]}
              >
                <Text style={styles.catName}>{catLabel(cat)}</Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Text style={styles.catCount}>
                    {catItems.length} {p.itemsWord}
                  </Text>
                  <LIcon
                    name="chevron-down"
                    size={TICON.sm}
                    color={T.ink3}
                    style={isOpen ? { transform: [{ rotate: "180deg" }] } : undefined}
                  />
                </View>
              </Pressable>
              {isOpen && (
                <View style={styles.catBody}>
                  {catItems.map((item, ii) => (
                    <View
                      key={item.id}
                      style={[styles.itemRow, ii < catItems.length - 1 && styles.itemRowRule]}
                    >
                      <View style={{ flex: 1, paddingRight: 12 }}>
                        <Text style={styles.itemName}>{item.name}</Text>
                        {item.note ? <Text style={styles.itemNote}>{item.note}</Text> : null}
                      </View>
                      <Text style={styles.itemQty}>
                        {item.finalQty} {item.unit}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })}

        <Pressable
          onPress={() => navigation.navigate("TripShopping", { tripId: trip.id })}
          accessibilityRole="button"
          accessibilityLabel={p.generateShoppingCta}
          style={({ pressed }) => [styles.cta, pressed && { opacity: 0.85 }]}
        >
          <Text style={styles.ctaText}>{p.generateShoppingCta}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.bg },
  statsRow: {
    backgroundColor: T.surface,
    borderBottomWidth: 1,
    borderBottomColor: T.rule,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "center",
  },
  statRule: { width: 1, backgroundColor: T.rule, marginHorizontal: 20 },
  stat: { alignItems: "center", minWidth: 56 },
  statValue: { fontFamily: T.monoSemiBold, fontSize: 20, color: T.ink0, lineHeight: 22 },
  statLabel: { fontSize: 10, color: T.ink3, marginTop: 4 },
  estimateNote: { fontSize: 11, color: T.ink3, lineHeight: 16, marginBottom: 12 },
  catHeader: {
    backgroundColor: T.surface,
    borderRadius: T.r,
    borderWidth: 1,
    borderColor: T.rule,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    ...TSH.sh0,
  },
  catHeaderOpen: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomWidth: 0,
  },
  catName: { fontSize: 13, fontWeight: "600", color: T.ink0 },
  catCount: { fontSize: 11, color: T.ink3 },
  catBody: {
    backgroundColor: T.surface,
    borderBottomLeftRadius: T.r,
    borderBottomRightRadius: T.r,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: T.rule,
    overflow: "hidden",
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  itemRowRule: { borderBottomWidth: 1, borderBottomColor: T.rule },
  itemName: { fontSize: 12, fontWeight: "500", color: T.ink0 },
  itemNote: { fontSize: 10, color: T.amber, marginTop: 1 },
  itemQty: { fontFamily: T.monoMedium, fontSize: 11, color: T.ink2 },
  cta: {
    backgroundColor: T.blue,
    borderRadius: T.r,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
    minHeight: 48,
    justifyContent: "center",
  },
  ctaText: { fontSize: 14, fontWeight: "600", color: "#FFFFFF" },
});
