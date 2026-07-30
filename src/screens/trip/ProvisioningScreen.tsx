import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  Pressable,
  SafeAreaView,
  Modal,
  TextInput,
  Alert,
  Share,
  ScrollView,
} from "react-native";
import { useFocusEffect, useRoute, RouteProp } from "@react-navigation/native";
import { getTrip, TripRow } from "../../repositories/trips";
import {
  addCustomItem,
  deleteItem,
  generatePlan,
  listPlanItems,
  ProvisionItemRow,
  updateItem,
} from "../../repositories/provisioning";
import { quantityToBuy, shoppingListText, shoppingProgress } from "../../domain/provisioning";
import type { ProvisionCategory, ProvisionItemState } from "../../domain/types";
import { colors, fonts, spacing } from "../../theme";
import { ProgressGauge } from "../../components/ui";
import { useLocale } from "../../i18n";
import { TRIP_STRINGS, TripStrings } from "../../i18n/trip";
import type { RootStackParamList } from "../../navigation";

type Route = RouteProp<RootStackParamList, "Provisioning">;

const STATE_ICON: Record<ProvisionItemState, string> = {
  suggested: "○",
  already_onboard: "⚓",
  purchased: "🛒",
  packed: "📦",
  skipped: "⏭",
};

export default function ProvisioningScreen() {
  const route = useRoute<Route>();
  const { locale } = useLocale();
  const s = TRIP_STRINGS[locale];

  const [trip, setTrip] = useState<TripRow | null>(null);
  const [planId, setPlanId] = useState<string | null>(null);
  const [items, setItems] = useState<ProvisionItemRow[]>([]);
  const [editing, setEditing] = useState<ProvisionItemRow | null>(null);
  const [adding, setAdding] = useState(false);

  const refresh = useCallback(() => {
    const t = getTrip(route.params.tripId);
    setTrip(t);
    if (t) {
      const plan = generatePlan(t, locale);
      setPlanId(plan.id);
      setItems(listPlanItems(plan.id));
    }
  }, [route.params.tripId, locale]);

  useFocusEffect(refresh);

  const catLabel = useCallback(
    (c: string) => (s[(`cat_${c}`) as keyof TripStrings] as string) ?? c,
    [s]
  );

  const sections = useMemo(() => {
    const byCat = new Map<string, ProvisionItemRow[]>();
    for (const item of items) {
      const list = byCat.get(item.category) ?? [];
      list.push(item);
      byCat.set(item.category, list);
    }
    return [...byCat.entries()].map(([cat, data]) => ({ title: catLabel(cat), data }));
  }, [items, catLabel]);

  const progress = useMemo(() => shoppingProgress(items), [items]);

  if (!trip || !planId) return null;

  function cycleState(item: ProvisionItemRow) {
    // Hızlı tek parmak akışı: ○ → 🛒 alındı → 📦 yerleşti → ○
    const next: ProvisionItemState =
      item.state === "purchased" ? "packed" : item.state === "packed" ? "suggested" : "purchased";
    updateItem(item.id, { state: next });
    refresh();
  }

  async function shareList() {
    const text = shoppingListText(
      `🛒 ${trip!.name} — ${s.provisioning}`,
      items,
      Object.fromEntries(
        [...new Set(items.map((i) => i.category))].map((c) => [c, catLabel(c)])
      )
    );
    try {
      await Share.share({ message: text });
    } catch {
      // kullanıcı paylaşımı iptal etti — sorun değil
    }
  }

  function explanationText(item: ProvisionItemRow): string {
    const e = item.explanation;
    if (!e) return "";
    const parts: string[] = [];
    parts.push(`${e.base} ${item.unit}`);
    if (e.people > 0) parts.push(`× ${e.people} ${s.people}`);
    if (e.multiplier > 1 || e.multiplierLabel !== "trip") {
      const label = e.multiplierLabel === "meals" ? s.meals : s.days;
      parts.push(`× ${e.multiplier} ${label}`);
    }
    for (const m of e.modifiers) parts.push(`× ${m.factor} (${m.label})`);
    if (e.reservePct > 0) parts.push(`+ %${e.reservePct} ${s.reserve}`);
    return `${parts.join(" ")} = ${e.raw} → ${e.rounded} ${item.unit}`;
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Üst bilgi */}
      <View style={styles.top}>
        <Text style={styles.topMeta}>
          👤 {trip.adults + trip.children} · 🌙 {trip.nights} ·{" "}
          {s[(`st_${trip.profile.style}`) as keyof TripStrings]}
        </Text>
        <ProgressGauge done={progress.purchasedOrPacked} total={progress.toBuyItems} />
        {trip.profile.allergies ? (
          <View style={styles.allergy}>
            <Text style={styles.allergyText}>
              ⚠ {s.allergyWarn}: {trip.profile.allergies}
            </Text>
          </View>
        ) : null}
        <Text style={styles.note}>{s.provEstimateNote}</Text>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(i) => i.id}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={styles.list}
        renderSectionHeader={({ section }) => (
          <Text style={styles.sectionHeader}>{section.title}</Text>
        )}
        renderItem={({ item }) => {
          const buy = quantityToBuy(item.finalQty, item.onboardQty);
          const inactive = item.state === "skipped" || buy <= 0;
          return (
            <View style={[styles.itemRow, inactive && { opacity: 0.45 }]}>
              <Pressable
                onPress={() => cycleState(item)}
                hitSlop={6}
                accessibilityRole="button"
                accessibilityLabel={`${item.name}: ${item.state}`}
                style={styles.stateBtn}
              >
                <Text style={styles.stateIcon}>{STATE_ICON[item.state]}</Text>
              </Pressable>
              <Pressable style={{ flex: 1 }} onPress={() => setEditing(item)}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemMeta}>
                  {s.toBuy}: {buy} {item.unit}
                  {item.onboardQty > 0 ? `  ·  ${s.onboardLabel}: ${item.onboardQty}` : ""}
                </Text>
              </Pressable>
              {item.explanation && (
                <Pressable
                  onPress={() => Alert.alert(s.whyThis, explanationText(item))}
                  hitSlop={8}
                  accessibilityLabel={s.whyThis}
                >
                  <Text style={styles.infoBtn}>ⓘ</Text>
                </Pressable>
              )}
            </View>
          );
        }}
        ListFooterComponent={
          progress.toBuyItems > 0 && progress.percent === 100 ? (
            <Text style={styles.allDone}>✓ {s.allDone}</Text>
          ) : null
        }
      />

      {/* Alt bar */}
      <View style={styles.bottomBar}>
        <Pressable onPress={() => setAdding(true)} style={styles.barBtn} accessibilityRole="button">
          <Text style={styles.barBtnText}>＋ {s.addItem}</Text>
        </Pressable>
        <Pressable onPress={shareList} style={styles.barBtn} accessibilityRole="button">
          <Text style={styles.barBtnText}>📤 {s.shareList}</Text>
        </Pressable>
      </View>

      {editing && (
        <ItemEditSheet
          item={editing}
          s={s}
          onClose={(changed) => {
            setEditing(null);
            if (changed) refresh();
          }}
        />
      )}
      {adding && (
        <AddItemSheet
          planId={planId}
          s={s}
          catLabel={catLabel}
          onClose={(changed) => {
            setAdding(false);
            if (changed) refresh();
          }}
        />
      )}
    </SafeAreaView>
  );
}

// --- Düzenleme sheet'i -----------------------------------------------------

function ItemEditSheet(props: {
  item: ProvisionItemRow;
  s: TripStrings;
  onClose: (changed: boolean) => void;
}) {
  const { item, s } = props;
  const [name, setName] = useState(item.name);
  const [finalQty, setFinalQty] = useState(String(item.finalQty));
  const [onboard, setOnboard] = useState(String(item.onboardQty));
  const [note, setNote] = useState(item.note ?? "");

  function save() {
    const fq = parseFloat(finalQty.replace(",", "."));
    const ob = parseFloat(onboard.replace(",", "."));
    updateItem(item.id, {
      name: name.trim() || item.name,
      finalQty: Number.isFinite(fq) && fq >= 0 ? fq : item.finalQty,
      onboardQty: Number.isFinite(ob) && ob >= 0 ? ob : item.onboardQty,
      note: note.trim() || null,
      state:
        Number.isFinite(ob) && ob >= (Number.isFinite(fq) ? fq : item.finalQty) && ob > 0
          ? "already_onboard"
          : item.state,
    });
    props.onClose(true);
  }

  function setState(state: ProvisionItemState) {
    updateItem(item.id, { state });
    props.onClose(true);
  }

  return (
    <Modal visible transparent animationType="slide" onRequestClose={() => props.onClose(false)}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <ScrollView keyboardShouldPersistTaps="handled">
            <TextInput value={name} onChangeText={setName} style={styles.input} />
            <View style={styles.row2}>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>
                  {s.quantity} ({item.unit})
                </Text>
                <TextInput
                  value={finalQty}
                  onChangeText={setFinalQty}
                  keyboardType="decimal-pad"
                  style={styles.input}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>{s.onboardLabel}</Text>
                <TextInput
                  value={onboard}
                  onChangeText={setOnboard}
                  keyboardType="decimal-pad"
                  style={styles.input}
                />
              </View>
            </View>
            <TextInput
              value={note}
              onChangeText={setNote}
              style={styles.input}
              placeholder="…"
              placeholderTextColor={colors.fog}
            />
            <View style={styles.stateRow}>
              {(
                [
                  ["purchased", s.purchased],
                  ["packed", s.packed],
                  ["skipped", s.skipped],
                ] as [ProvisionItemState, string][]
              ).map(([st, label]) => (
                <Pressable key={st} onPress={() => setState(st)} style={styles.stateChip}>
                  <Text style={styles.stateChipText}>
                    {STATE_ICON[st]} {label}
                  </Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.sheetActions}>
              <Pressable
                onPress={() =>
                  Alert.alert(s.deleteItemConfirm, "", [
                    { text: s.cancel, style: "cancel" },
                    {
                      text: "🗑",
                      style: "destructive",
                      onPress: () => {
                        deleteItem(item.id);
                        props.onClose(true);
                      },
                    },
                  ])
                }
                hitSlop={8}
              >
                <Text style={{ color: colors.signal, fontSize: 16 }}>🗑</Text>
              </Pressable>
              <Pressable onPress={() => props.onClose(false)} hitSlop={8}>
                <Text style={styles.cancelText}>{s.cancel}</Text>
              </Pressable>
              <Pressable onPress={save} style={styles.saveBtn}>
                <Text style={styles.saveBtnText}>{s.save}</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// --- Yeni kalem sheet'i ----------------------------------------------------

const ADD_CATEGORIES: ProvisionCategory[] = [
  "pantry",
  "beverages",
  "fruit_veg",
  "snacks",
  "hygiene",
  "cleaning",
  "children",
  "medical_comfort",
];

function AddItemSheet(props: {
  planId: string;
  s: TripStrings;
  catLabel: (c: string) => string;
  onClose: (changed: boolean) => void;
}) {
  const { s } = props;
  const [name, setName] = useState("");
  const [qty, setQty] = useState("1");
  const [unit, setUnit] = useState("pcs");
  const [category, setCategory] = useState<ProvisionCategory>("pantry");

  function save() {
    const q = parseFloat(qty.replace(",", "."));
    if (!name.trim() || !Number.isFinite(q) || q < 0) return;
    addCustomItem(props.planId, { name: name.trim(), category, unit: unit.trim() || "pcs", finalQty: q });
    props.onClose(true);
  }

  return (
    <Modal visible transparent animationType="slide" onRequestClose={() => props.onClose(false)}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.sheetTitle}>＋ {s.addItem}</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            style={styles.input}
            placeholder={s.itemName}
            placeholderTextColor={colors.fog}
            autoFocus
          />
          <View style={styles.row2}>
            <TextInput
              value={qty}
              onChangeText={setQty}
              keyboardType="decimal-pad"
              style={[styles.input, { flex: 1 }]}
              placeholder={s.quantity}
              placeholderTextColor={colors.fog}
            />
            <TextInput
              value={unit}
              onChangeText={setUnit}
              style={[styles.input, { flex: 1 }]}
              placeholder={s.unit}
              placeholderTextColor={colors.fog}
            />
          </View>
          <View style={styles.stateRow}>
            {ADD_CATEGORIES.map((c) => (
              <Pressable
                key={c}
                onPress={() => setCategory(c)}
                style={[styles.stateChip, category === c && { backgroundColor: colors.brass }]}
              >
                <Text
                  style={[styles.stateChipText, category === c && { color: colors.night }]}
                >
                  {props.catLabel(c)}
                </Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.sheetActions}>
            <Pressable onPress={() => props.onClose(false)} hitSlop={8}>
              <Text style={styles.cancelText}>{s.cancel}</Text>
            </Pressable>
            <Pressable onPress={save} style={styles.saveBtn}>
              <Text style={styles.saveBtnText}>{s.save}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.night },
  top: { padding: spacing.m, gap: 8 },
  topMeta: { fontFamily: fonts.body, fontSize: 13, color: colors.fog },
  allergy: {
    backgroundColor: "rgba(192,57,43,0.18)",
    borderWidth: 1,
    borderColor: colors.signal,
    borderRadius: 8,
    padding: 10,
  },
  allergyText: { fontFamily: fonts.body, fontSize: 13, color: colors.signal, fontWeight: "700" },
  note: { fontFamily: fonts.body, fontStyle: "italic", fontSize: 11, color: colors.fog, lineHeight: 16 },
  list: { paddingHorizontal: spacing.m, paddingBottom: 90 },
  sectionHeader: {
    fontFamily: fonts.display,
    fontSize: 15,
    fontWeight: "700",
    color: colors.brass,
    marginTop: spacing.m,
    marginBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    paddingBottom: 4,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 9,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(147,165,184,0.2)",
  },
  stateBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: colors.rope,
    alignItems: "center",
    justifyContent: "center",
  },
  stateIcon: { fontSize: 17 },
  itemName: { fontFamily: fonts.body, fontSize: 15, color: colors.paper },
  itemMeta: { fontFamily: fonts.mono, fontSize: 11, color: colors.fog, marginTop: 2 },
  infoBtn: { fontSize: 18, color: colors.seafoam, paddingHorizontal: 4 },
  allDone: {
    fontFamily: fonts.display,
    fontSize: 15,
    color: colors.seafoam,
    textAlign: "center",
    marginVertical: spacing.l,
  },
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    backgroundColor: colors.nightDeep,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  barBtn: { flex: 1, alignItems: "center", paddingVertical: 14 },
  barBtnText: { fontFamily: fonts.display, fontSize: 15, fontWeight: "700", color: colors.brass },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: colors.nightDeep,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: spacing.l,
    borderTopWidth: 1,
    borderTopColor: colors.brass,
    maxHeight: "85%",
  },
  sheetTitle: { fontFamily: fonts.display, fontSize: 17, fontWeight: "700", color: colors.paper },
  input: {
    backgroundColor: colors.night,
    borderWidth: 1,
    borderColor: colors.rope,
    borderRadius: 8,
    color: colors.paper,
    fontFamily: fonts.body,
    fontSize: 15,
    paddingHorizontal: 12,
    paddingVertical: 11,
    marginTop: 8,
  },
  row2: { flexDirection: "row", gap: 8 },
  fieldLabel: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 1,
    color: colors.brass,
    marginTop: 10,
  },
  stateRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: spacing.m },
  stateChip: {
    borderWidth: 1,
    borderColor: colors.rope,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  stateChipText: { fontFamily: fonts.body, fontSize: 13, color: colors.paper },
  sheetActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.l,
    gap: 16,
  },
  cancelText: { fontFamily: fonts.body, fontSize: 15, color: colors.fog },
  saveBtn: { backgroundColor: colors.brass, borderRadius: 8, paddingHorizontal: 26, paddingVertical: 12 },
  saveBtnText: { fontFamily: fonts.display, fontSize: 15, fontWeight: "700", color: colors.night },
});
