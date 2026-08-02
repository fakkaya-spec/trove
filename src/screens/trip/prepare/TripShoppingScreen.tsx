import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  SafeAreaView,
  Share,
  TextInput,
} from "react-native";
import { useFocusEffect, useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { T, TICON } from "../../../theme";
import { LIcon } from "../../../components/LIcon";
import { Bar } from "../../../components/trove/primitives";
import { SampleBanner } from "../../../components/trove/SampleBanner";
import { getTrip, TripRow } from "../../../repositories/trips";
import {
  addCustomItem,
  generatePlan,
  listPlanItems,
  ProvisionItemRow,
  updateItem,
} from "../../../repositories/provisioning";
import { quantityToBuy, shoppingListText, shoppingProgress } from "../../../domain/provisioning";
import { useLocale } from "../../../i18n";
import { TRIP_STRINGS, TripStrings } from "../../../i18n/trip";
import { PREPARE_STRINGS } from "../../../i18n/prepare";
import type { RootStackParamList } from "../../../navigation";

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, "TripShopping">;

// trip_shopping — onaylı tasarım: renkli kategori başlıkları, daire işaretli
// check-off satırları, üstte ilerleme çubuğu, paylaşım. Durum modeli motorda:
// suggested ↔ purchased (updateItem); ilerleme shoppingProgress ile.

// Kategori vurgu renkleri (tasarımdaki bölüm renklendirmesinin karşılığı).
const CATEGORY_COLORS: Record<string, string> = {
  fruit_veg: T.green,
  breakfast: T.green,
  pantry: T.amber,
  snacks: T.amber,
  condiments: T.amber,
  lunch: T.blue,
  dinner: T.blue,
  children: T.blue,
  medical_comfort: T.blue,
};

export default function TripShoppingScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { locale } = useLocale();
  const s = TRIP_STRINGS[locale];
  const p = PREPARE_STRINGS[locale];

  const [trip, setTrip] = useState<TripRow | null>(null);
  const [planId, setPlanId] = useState<string | null>(null);
  const [items, setItems] = useState<ProvisionItemRow[]>([]);
  const [newName, setNewName] = useState("");

  const load = useCallback(() => {
    const t = getTrip(route.params.tripId);
    setTrip(t);
    if (t) {
      const pl = generatePlan(t, locale);
      setPlanId(pl.id);
      setItems(listPlanItems(pl.id));
    }
  }, [route.params.tripId, locale]);

  useFocusEffect(load);

  const catLabel = useCallback(
    (c: string) => (s[(`cat_${c}`) as keyof TripStrings] as string) ?? c,
    [s]
  );

  // Alınacak kalemler (skipped değil, alınacak miktarı > 0)
  const sections = useMemo(() => {
    const byCat = new Map<string, ProvisionItemRow[]>();
    for (const item of items) {
      if (item.state === "skipped") continue;
      if (quantityToBuy(item.finalQty, item.onboardQty) <= 0) continue;
      const list = byCat.get(item.category) ?? [];
      list.push(item);
      byCat.set(item.category, list);
    }
    return [...byCat.entries()];
  }, [items]);

  if (!trip || !planId) return <SafeAreaView style={styles.safe} />;

  const progress = shoppingProgress(items);
  const complete = progress.percent === 100;

  function toggle(item: ProvisionItemRow) {
    const bought = item.state === "purchased" || item.state === "packed";
    updateItem(item.id, { state: bought ? "suggested" : "purchased" });
    load();
  }

  function addItem() {
    if (!planId || !newName.trim()) return;
    addCustomItem(planId, { name: newName, category: "pantry", unit: "pcs", finalQty: 1 });
    setNewName("");
    load();
  }

  async function share() {
    const labels = Object.fromEntries(
      [...new Set(items.map((i) => i.category))].map((c) => [c, catLabel(c)])
    );
    const text = shoppingListText(`${trip!.name} — ${p.shoppingList}`, items, labels);
    await Share.share({ message: text });
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Üst ilerleme şeridi */}
      <View style={styles.progressWrap}>
        <View style={styles.progressRow}>
          <Text style={styles.progressText}>
            {progress.purchasedOrPacked} {p.ofWord} {progress.toBuyItems}
          </Text>
          <Pressable
            onPress={share}
            accessibilityRole="button"
            accessibilityLabel={s.shareList}
            style={({ pressed }) => [styles.shareBtn, pressed && { opacity: 0.8 }]}
          >
            <LIcon name="share-2" size={TICON.sm} color={T.ink1} />
            <Text style={styles.shareText}>{s.shareList}</Text>
          </Pressable>
        </View>
        <Bar pct={progress.percent} h={3} color={complete ? T.green : T.blue} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        {trip.isSample && (
          <SampleBanner onCreate={() => navigation.navigate("Tabs", { screen: "VesselTab" })} />
        )}
        {complete && <Text style={styles.allDone}>{s.allDone}</Text>}

        {sections.map(([cat, catItems]) => {
          const color = CATEGORY_COLORS[cat] ?? T.ink2;
          return (
            <View key={cat} style={{ marginBottom: 16 }}>
              <Text style={[styles.sectionTitle, { color }]}>
                {catLabel(cat).toUpperCase()}
              </Text>
              {catItems.map((item) => {
                const on = item.state === "purchased" || item.state === "packed";
                const buy = quantityToBuy(item.finalQty, item.onboardQty);
                return (
                  <Pressable
                    key={item.id}
                    onPress={() => toggle(item)}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: on }}
                    accessibilityLabel={item.name}
                    style={({ pressed }) => [styles.itemRow, pressed && { opacity: 0.7 }]}
                  >
                    <View
                      style={[
                        styles.checkCircle,
                        on && { backgroundColor: T.green, borderColor: T.green },
                      ]}
                    >
                      {on && <LIcon name="check" size={10} color="#FFFFFF" />}
                    </View>
                    <Text
                      style={[
                        styles.itemText,
                        on && { color: T.ink3, textDecorationLine: "line-through" },
                      ]}
                    >
                      {item.name} × {buy} {item.unit}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          );
        })}

        {!trip.isSample && (
          <View style={styles.addRow}>
            <TextInput
              value={newName}
              onChangeText={setNewName}
              placeholder={s.addItem}
              placeholderTextColor={T.ink3}
              style={styles.addInput}
              returnKeyType="done"
              onSubmitEditing={addItem}
            />
            <Pressable
              onPress={addItem}
              accessibilityRole="button"
              accessibilityLabel={s.addItem}
              style={({ pressed }) => [styles.addBtn, pressed && { opacity: 0.8 }]}
            >
              <LIcon name="plus" size={TICON.md} color={T.blue} />
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.bg },
  progressWrap: {
    backgroundColor: T.surface,
    borderBottomWidth: 1,
    borderBottomColor: T.rule,
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 10,
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressText: { fontFamily: T.mono, fontSize: 11, color: T.ink2 },
  shareBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: T.surfaceEl,
    borderRadius: T.r3,
    paddingHorizontal: 12,
    minHeight: 36,
  },
  shareText: { fontSize: 11, fontWeight: "600", color: T.ink1 },
  allDone: { fontSize: 13, fontWeight: "600", color: T.green, marginBottom: 12 },
  sectionTitle: { fontSize: 11, fontWeight: "700", letterSpacing: 0.3, marginBottom: 4 },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: T.rule,
    minHeight: 44,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: T.ruleStr,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  itemText: { flex: 1, fontSize: 13, color: T.ink0 },
  addRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
  addInput: {
    flex: 1,
    fontSize: 13,
    color: T.ink0,
    backgroundColor: T.surface,
    borderRadius: T.r2,
    borderWidth: 1,
    borderColor: T.ruleStr,
    paddingHorizontal: 14,
    minHeight: 44,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: T.r2,
    backgroundColor: T.blueL,
    alignItems: "center",
    justifyContent: "center",
  },
});
