import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  SafeAreaView,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { T, TSH, TICON, spacing, touch, radius } from "../../theme";
import { Icon } from "../../components/Icon";
import type { RootStackParamList } from "../../navigation";

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, "Shopping">;

const SECTIONS: { name: string; color: string; items: string[] }[] = [
  { name: "Produce",         color: T.green, items: ["Eggs × 42", "Fruit × 7 portions/6", "Salad greens × 7 bags", "Lemons × 10"] },
  { name: "Dry goods",       color: T.amber, items: ["Bread/rolls × 14 packs", "Pasta × 2 kg", "Rice × 1 kg", "Crackers × 4 boxes", "Tomato sauce × 4 jars", "Coffee × 2 packs"] },
  { name: "Protein & dairy", color: T.blue,  items: ["Cold cuts × 7×200g", "Cheese × 7×150g", "Chicken × 2 kg", "Butter × 3 packs", "Milk/oat × 4 L"] },
  { name: "Drinks",          color: T.ink2,  items: ["Water × 84 L", "Beer × 48 cans", "Wine × 8 bottles", "Soft drinks × 24 cans", "Juice × 6 L"] },
  { name: "Sundries",        color: T.ink2,  items: ["Sunscreen × 4", "Dish soap × 2", "Bin bags × 1 roll", "Kitchen towels × 4"] },
];

export default function ShoppingScreen() {
  const navigation = useNavigation<Nav>();
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const toggle = (id: string) =>
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const total = SECTIONS.reduce((n, s) => n + s.items.length, 0);
  const done = checked.size;
  const pct = total > 0 ? (done / total) * 100 : 0;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: `${pct}%` as any, backgroundColor: done === total ? T.green : T.blue },
          ]}
        />
      </View>

      {/* Sub-header */}
      <View style={styles.subHeader}>
        <Text style={styles.subHeaderText}>
          {done} of {total} items
        </Text>
        <Pressable
          style={({ pressed }) => [styles.shareBtn, pressed && { opacity: 0.7 }]}
          accessibilityRole="button"
          accessibilityLabel="Share shopping list"
        >
          <Icon name="share-outline" size={TICON.sm} color={T.ink1} />
          <Text style={styles.shareBtnLabel}>Share</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {SECTIONS.map((sec) => (
          <View key={sec.name} style={{ marginBottom: spacing.l }}>
            <Text style={[styles.sectionLabel, { color: sec.color }]}>
              {sec.name.toUpperCase()}
            </Text>
            {sec.items.map((item) => {
              const id = `${sec.name}::${item}`;
              const on = checked.has(id);
              return (
                <Pressable
                  key={id}
                  onPress={() => toggle(id)}
                  style={styles.itemRow}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: on }}
                >
                  <View style={[styles.checkBox, on && styles.checkBoxOn]}>
                    {on && <Icon name="checkmark" size={10} color="#FFF" />}
                  </View>
                  <Text style={[styles.itemLabel, on && styles.itemLabelDone]}>{item}</Text>
                </Pressable>
              );
            })}
          </View>
        ))}

        <Pressable
          style={({ pressed }) => [styles.addRow, pressed && { opacity: 0.7 }]}
          accessibilityRole="button"
          accessibilityLabel="Add item"
        >
          <Icon name="add-circle-outline" size={TICON.md} color={T.ink2} />
          <Text style={styles.addLabel}>Add item</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.bg },
  progressTrack: { height: 3, backgroundColor: T.rule },
  progressFill: { height: 3, borderRadius: 2 },
  subHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.m,
    paddingVertical: 6,
    backgroundColor: T.surface,
    borderBottomWidth: 1,
    borderBottomColor: T.rule,
  },
  subHeaderText: { fontSize: 12, color: T.ink2 },
  shareBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    minHeight: touch.min,
    paddingHorizontal: 8,
  },
  shareBtnLabel: { fontSize: 12, fontWeight: "600", color: T.ink1 },
  scroll: { padding: spacing.m, paddingBottom: 48 },
  sectionLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 0.3, marginBottom: 8 },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: T.rule,
    minHeight: touch.min,
  },
  checkBox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: T.ruleStr,
    alignItems: "center",
    justifyContent: "center",
  },
  checkBoxOn: { backgroundColor: T.green, borderColor: T.green },
  itemLabel: { fontSize: 13, color: T.ink0, flex: 1 },
  itemLabelDone: { color: T.ink3, textDecorationLine: "line-through" },
  addRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    minHeight: touch.min,
  },
  addLabel: { fontSize: 13, color: T.ink2 },
});
