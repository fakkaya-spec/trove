import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  Pressable,
  SafeAreaView,
  Modal,
  TextInput,
  Alert,
  Switch,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  getInspection,
  getItemResults,
  setItemStatus,
  approveSection,
  upsertIssueForItem,
  removeIssueForItem,
  listIssues,
  addMedia,
  listMedia,
  listMeters,
  upsertMeter,
  upsertInventoryCount,
  listInventoryCounts,
  InspectionRow,
} from "../../repositories/inspections";
import { getInventoryDefs, getTemplateById, InventoryItemDef } from "../../repositories/templates";
import {
  isCriticalFailure,
  lt,
  needsIssueSheet,
  sectionProgress,
  toResultMap,
} from "../../domain/inspection";
import type {
  IssueSeverity,
  ItemResult,
  ItemStatus,
  MeterKind,
  TemplateItemDef,
  TemplateSectionDef,
} from "../../domain/types";
import { capturePhoto } from "../../media/photos";
import { colors, fonts, spacing } from "../../theme";
import { useLocale } from "../../i18n";
import { INSPECTION_STRINGS, InspectionStrings } from "../../i18n/inspection";
import type { RootStackParamList } from "../../navigation";

type Route = RouteProp<RootStackParamList, "Inspect">;
type Nav = NativeStackNavigationProp<RootStackParamList, "Inspect">;

const STATUS_META: Record<
  ItemStatus,
  { icon: string; color: string; labelKey: keyof InspectionStrings }
> = {
  unchecked: { icon: "○", color: colors.fog, labelKey: "statusUnchecked" },
  working: { icon: "✓", color: "#3E7466", labelKey: "statusWorking" },
  needs_attention: { icon: "⚠", color: "#B7791F", labelKey: "statusAttention" },
  not_working: { icon: "✕", color: colors.signal, labelKey: "statusNotWorking" },
  not_applicable: { icon: "–", color: colors.fog, labelKey: "statusNa" },
};

type Tab = { kind: "section"; section: TemplateSectionDef } | { kind: "meters" } | { kind: "inventory" };

export default function InspectScreen() {
  const route = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const { locale } = useLocale();
  const s = INSPECTION_STRINGS[locale];

  // Veri senkron SQLite'tan okunur; state yerine sürüm sayacı + memo kullanılır
  // (effect içinde senkron setState kaskadını önler).
  const [version, setVersion] = useState(0);
  const [tabIndex, setTabIndex] = useState(0);
  const [sheetItem, setSheetItem] = useState<TemplateItemDef | null>(null);
  const [issueItem, setIssueItem] = useState<{ item: TemplateItemDef; status: ItemStatus } | null>(
    null
  );

  const inspection = useMemo(
    () => getInspection(route.params.inspectionId),
    // 'version' bilinçli: refresh() sürümü artırarak DB'den yeniden okutur
    [route.params.inspectionId, version] // eslint-disable-line react-hooks/exhaustive-deps
  );
  const results = useMemo<ItemResult[]>(
    () => (inspection ? getItemResults(inspection.id) : []),
    [inspection]
  );

  const template = useMemo(
    () => (inspection ? getTemplateById(inspection.templateId) : null),
    [inspection]
  );

  const tabs: Tab[] = useMemo(() => {
    if (!template) return [];
    const sectionTabs: Tab[] = template.sections
      .filter((sec) => sec.items.some((i) => i.inputKind === "status"))
      .map((sec) => ({ kind: "section", section: sec }));
    return [...sectionTabs, { kind: "meters" }, { kind: "inventory" }];
  }, [template]);

  const resultMap = useMemo(() => toResultMap(results), [results]);

  const refresh = useCallback(() => setVersion((v) => v + 1), []);

  useEffect(() => {
    if (template && inspection) {
      navigation.setOptions({ title: lt(template.name, locale) });
    }
  }, [template, inspection, locale, navigation]);

  if (!inspection || !template || tabs.length === 0) return null;

  const tab = tabs[Math.min(tabIndex, tabs.length - 1)];

  function applyStatus(item: TemplateItemDef, status: ItemStatus) {
    if (!inspection) return;
    if (needsIssueSheet(status)) {
      setSheetItem(null);
      setIssueItem({ item, status });
      return;
    }
    setItemStatus(inspection, item.id, status);
    if (status === "working" || status === "not_applicable") {
      removeIssueForItem(inspection.id, item.id);
    }
    setSheetItem(null);
    refresh();
  }

  function renderItem({ item }: { item: TemplateItemDef }) {
    const status = resultMap.get(item.id)?.status ?? "unchecked";
    const meta = STATUS_META[status];
    return (
      <Pressable
        onPress={() => setSheetItem(item)}
        style={({ pressed }) => [styles.itemRow, pressed && { opacity: 0.7 }]}
      >
        <View style={[styles.statusDot, { borderColor: meta.color }]}>
          <Text style={[styles.statusDotText, { color: meta.color }]}>{meta.icon}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={[
              styles.itemText,
              status === "working" && styles.itemDone,
              status === "not_applicable" && styles.itemNa,
            ]}
          >
            {lt(item.title, locale)}
          </Text>
          {item.isCritical && status === "unchecked" && (
            <Text style={styles.criticalTag}>● {s.sevCritical.toUpperCase()}</Text>
          )}
        </View>
      </Pressable>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Bölüm çipleri */}
      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipBar}
        >
          {tabs.map((t, idx) => {
            const active = idx === tabIndex;
            let label: string;
            let badge: string | null = null;
            if (t.kind === "section") {
              label = `${t.section.icon} ${lt(t.section.title, locale)}`;
              const prog = sectionProgress(t.section, resultMap);
              badge = prog.complete ? "✓" : `${prog.total - prog.unchecked}/${prog.total}`;
            } else if (t.kind === "meters") {
              label = `⛽ ${s.meters}`;
            } else {
              label = `📦 ${s.inventory}`;
            }
            return (
              <Pressable
                key={idx}
                onPress={() => setTabIndex(idx)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {label}
                  {badge ? `  ${badge}` : ""}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* İçerik */}
      {tab.kind === "section" && (
        <SectionView
          key={tab.section.id}
          section={tab.section}
          inspection={inspection}
          resultMapVersion={results}
          renderItem={renderItem}
          onApprove={() => {
            approveSection(inspection, tab.section);
            refresh();
          }}
          s={s}
          resultMap={resultMap}
        />
      )}
      {tab.kind === "meters" && <MetersView inspection={inspection} s={s} locale={locale} template={template} />}
      {tab.kind === "inventory" && <InventoryView inspection={inspection} s={s} locale={locale} />}

      {/* Alt bar: Özet */}
      <View style={styles.bottomBar}>
        <Pressable
          onPress={() => navigation.navigate("InspectionSummary", { inspectionId: inspection.id })}
          style={({ pressed }) => [styles.summaryBtn, pressed && { opacity: 0.85 }]}
        >
          <Text style={styles.summaryBtnText}>{s.summary} ›</Text>
        </Pressable>
      </View>

      {/* Durum seçici */}
      <Modal visible={!!sheetItem} transparent animationType="slide" onRequestClose={() => setSheetItem(null)}>
        <Pressable style={styles.backdrop} onPress={() => setSheetItem(null)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            {sheetItem && (
              <>
                <Text style={styles.sheetTitle}>{lt(sheetItem.title, locale)}</Text>
                {sheetItem.tip && <Text style={styles.sheetTip}>☞ {lt(sheetItem.tip, locale)}</Text>}
                {(["working", "needs_attention", "not_working", "not_applicable"] as ItemStatus[]).map(
                  (st) => {
                    const meta = STATUS_META[st];
                    return (
                      <Pressable
                        key={st}
                        onPress={() => applyStatus(sheetItem, st)}
                        style={({ pressed }) => [styles.statusBtn, pressed && { opacity: 0.7 }]}
                      >
                        <Text style={[styles.statusBtnIcon, { color: meta.color }]}>{meta.icon}</Text>
                        <Text style={styles.statusBtnText}>{s[meta.labelKey]}</Text>
                      </Pressable>
                    );
                  }
                )}
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      {/* Sorun kaydı */}
      {issueItem && (
        <IssueSheet
          inspection={inspection}
          item={issueItem.item}
          status={issueItem.status}
          locale={locale}
          s={s}
          onClose={(saved) => {
            setIssueItem(null);
            if (saved) refresh();
          }}
        />
      )}
    </SafeAreaView>
  );
}

// --- Bölüm görünümü ---------------------------------------------------------

function SectionView(props: {
  section: TemplateSectionDef;
  inspection: InspectionRow;
  resultMap: Map<string, ItemResult>;
  resultMapVersion: unknown;
  renderItem: ({ item }: { item: TemplateItemDef }) => React.ReactElement;
  onApprove: () => void;
  s: InspectionStrings;
}) {
  const { section, resultMap, s } = props;
  const prog = sectionProgress(section, resultMap);
  const statusItems = section.items.filter((i) => i.inputKind === "status");
  const canBulk = statusItems.some(
    (i) => !i.isCritical && (resultMap.get(i.id)?.status ?? "unchecked") === "unchecked"
  );
  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={statusItems}
        keyExtractor={(i) => i.id}
        renderItem={props.renderItem}
        extraData={props.resultMapVersion}
        contentContainerStyle={styles.list}
        initialNumToRender={16}
        windowSize={7}
      />
      <View style={styles.sectionFooter}>
        {canBulk ? (
          <Pressable
            onPress={props.onApprove}
            style={({ pressed }) => [styles.approveBtn, pressed && { opacity: 0.85 }]}
          >
            <Text style={styles.approveBtnText}>✓ {s.approveSection}</Text>
          </Pressable>
        ) : prog.complete ? (
          <Text style={styles.sectionDone}>✓ {s.sectionClear}</Text>
        ) : null}
        {prog.criticalUnchecked > 0 && (
          <Text style={styles.criticalHint}>
            ● {prog.criticalUnchecked} {s.criticalNeedTap}
          </Text>
        )}
      </View>
    </View>
  );
}

// --- Sorun sheet'i ----------------------------------------------------------

function IssueSheet(props: {
  inspection: InspectionRow;
  item: TemplateItemDef;
  status: ItemStatus;
  locale: string;
  s: InspectionStrings;
  onClose: (saved: boolean) => void;
}) {
  const { inspection, item, status, locale, s } = props;
  const existingIssue = useMemo(
    () => listIssues(inspection.id).find((i) => i.templateItemId === item.id),
    [inspection.id, item.id]
  );
  const [note, setNote] = useState(existingIssue?.description ?? "");
  const [severity, setSeverity] = useState<IssueSeverity>(
    existingIssue?.severity ?? (item.isCritical ? "critical" : "medium")
  );
  const [reported, setReported] = useState(existingIssue?.reportedToCompany ?? false);
  const [resolved, setResolved] = useState(existingIssue?.resolved ?? false);
  const [photoCount, setPhotoCount] = useState(
    () => (existingIssue ? listMedia(inspection.id, existingIssue.id).length : 0)
  );
  const [savedIssueId, setSavedIssueId] = useState<string | null>(existingIssue?.id ?? null);

  function persistIssue(): string {
    setItemStatus(inspection, item.id, status, note || undefined);
    const id = upsertIssueForItem(inspection, {
      templateItemId: item.id,
      severity,
      title: lt(item.title, locale),
      description: note || undefined,
      reportedToCompany: reported,
      resolved,
    });
    setSavedIssueId(id);
    return id;
  }

  async function onAddPhoto() {
    const uri = await capturePhoto();
    if (!uri) return;
    const issueId = savedIssueId ?? persistIssue();
    addMedia(inspection, { localUri: uri, issueId });
    setPhotoCount((n) => n + 1);
  }

  function onSave() {
    persistIssue();
    if (isCriticalFailure(item, status)) {
      Alert.alert(s.safetyWarnTitle, s.safetyWarnBody);
    }
    props.onClose(true);
  }

  const sevOptions: { key: IssueSeverity; label: string }[] = [
    { key: "low", label: s.sevLow },
    { key: "medium", label: s.sevMedium },
    { key: "high", label: s.sevHigh },
    { key: "critical", label: s.sevCritical },
  ];

  return (
    <Modal visible transparent animationType="slide" onRequestClose={() => props.onClose(false)}>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { maxHeight: "88%" }]}>
          <ScrollView keyboardShouldPersistTaps="handled">
            <Text style={styles.sheetTitle}>
              {STATUS_META[status].icon} {lt(item.title, locale)}
            </Text>

            <Text style={styles.fieldLabel}>{s.severity}</Text>
            <View style={styles.sevRow}>
              {sevOptions.map((o) => (
                <Pressable
                  key={o.key}
                  onPress={() => setSeverity(o.key)}
                  style={[styles.sevChip, severity === o.key && styles.sevChipActive]}
                >
                  <Text style={[styles.sevText, severity === o.key && styles.sevTextActive]}>
                    {o.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.fieldLabel}>{s.note}</Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              style={[styles.input, { minHeight: 70 }]}
              multiline
              placeholder="…"
              placeholderTextColor={colors.fog}
            />

            <Pressable
              onPress={onAddPhoto}
              style={({ pressed }) => [styles.photoBtn, pressed && { opacity: 0.8 }]}
            >
              <Text style={styles.photoBtnText}>
                📷 {s.addPhoto}
                {photoCount > 0 ? `  ·  ${photoCount} ${s.photoAdded}` : ""}
              </Text>
            </Pressable>
            {item.requiresPhotoOnIssue && photoCount === 0 && (
              <Text style={styles.photoHint}>📷 !</Text>
            )}

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>{s.reportedToCompany}</Text>
              <Switch value={reported} onValueChange={setReported} trackColor={{ true: colors.brass }} />
            </View>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>{s.resolved}</Text>
              <Switch value={resolved} onValueChange={setResolved} trackColor={{ true: colors.brass }} />
            </View>

            <View style={styles.sheetActions}>
              <Pressable onPress={() => props.onClose(false)} hitSlop={8}>
                <Text style={styles.cancelText}>{s.cancel}</Text>
              </Pressable>
              <Pressable
                onPress={onSave}
                style={({ pressed }) => [styles.saveBtn, pressed && { opacity: 0.85 }]}
              >
                <Text style={styles.saveBtnText}>{s.save}</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// --- Sayaçlar ---------------------------------------------------------------

function MetersView(props: {
  inspection: InspectionRow;
  s: InspectionStrings;
  locale: string;
  template: NonNullable<ReturnType<typeof getTemplateById>>;
}) {
  const { inspection, locale } = props;
  const meterItems = useMemo(
    () =>
      props.template.sections
        .flatMap((sec) => sec.items)
        .filter((i) => i.inputKind === "meter" && i.meterKind),
    [props.template]
  );
  const [values, setValues] = useState<Map<MeterKind, string>>(() => {
    const existing = listMeters(inspection.id);
    return new Map(existing.map((m) => [m.kind, String(m.value)]));
  });

  function commit(kind: MeterKind, text: string) {
    const v = parseFloat(text.replace(",", "."));
    if (Number.isFinite(v) && v >= 0) {
      upsertMeter(inspection, kind, v);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.list}>
      {meterItems.map((item) => {
        const kind = item.meterKind!;
        const unit =
          kind === "engine_hours" || kind === "generator_hours" ? "h" : kind === "battery_v" ? "V" : "%";
        return (
          <View key={item.id} style={styles.meterRow}>
            <Text style={styles.meterLabel}>{lt(item.title, locale)}</Text>
            <View style={styles.meterInputWrap}>
              <TextInput
                value={values.get(kind) ?? ""}
                onChangeText={(t) => setValues(new Map(values).set(kind, t))}
                onEndEditing={(e) => commit(kind, e.nativeEvent.text)}
                keyboardType="decimal-pad"
                style={styles.meterInput}
                placeholder="—"
                placeholderTextColor={colors.fog}
              />
              <Text style={styles.meterUnit}>{unit}</Text>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

// --- Envanter ---------------------------------------------------------------

function InventoryView(props: { inspection: InspectionRow; s: InspectionStrings; locale: string }) {
  const { inspection, locale, s } = props;
  const [defs] = useState<InventoryItemDef[]>(() => getInventoryDefs(inspection.templateId));
  const [counts, setCounts] = useState<Map<string, number>>(() =>
    listInventoryCounts(inspection.id)
  );

  function setCount(def: InventoryItemDef, next: number) {
    const clamped = Math.max(0, next);
    upsertInventoryCount(inspection, def.id, clamped);
    setCounts(new Map(counts).set(def.id, clamped));
  }

  return (
    <ScrollView contentContainerStyle={styles.list}>
      {defs.map((def) => {
        const found = counts.get(def.id);
        const missing = found !== undefined && found < def.expectedCount;
        return (
          <View key={def.id} style={styles.invRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.meterLabel}>{lt(def.name, locale)}</Text>
              <Text style={[styles.invExpected, missing && { color: colors.signal }]}>
                {def.expectedCount} {s.expected}
              </Text>
            </View>
            <View style={styles.stepper}>
              <Pressable onPress={() => setCount(def, (found ?? def.expectedCount) - 1)} hitSlop={6}>
                <Text style={styles.stepBtn}>−</Text>
              </Pressable>
              <Text style={[styles.stepValue, missing && { color: colors.signal }]}>
                {found ?? "—"}
              </Text>
              <Pressable onPress={() => setCount(def, (found ?? def.expectedCount - 1) + 1)} hitSlop={6}>
                <Text style={styles.stepBtn}>＋</Text>
              </Pressable>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

// --- Stiller ----------------------------------------------------------------

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.night },
  chipBar: { paddingHorizontal: spacing.m, paddingVertical: 10, gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: colors.rope,
    borderRadius: 18,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  chipActive: { backgroundColor: colors.brass, borderColor: colors.brass },
  chipText: { fontFamily: fonts.body, fontSize: 13, color: colors.fog },
  chipTextActive: { color: colors.night, fontWeight: "700" },
  list: { paddingHorizontal: spacing.m, paddingBottom: 90 },
  itemRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(147,165,184,0.25)",
  },
  statusDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  statusDotText: { fontSize: 15, fontWeight: "700" },
  itemText: { fontFamily: fonts.body, fontSize: 15, lineHeight: 21, color: colors.paper },
  itemDone: { color: colors.fog },
  itemNa: { color: colors.fog, textDecorationLine: "line-through" },
  criticalTag: {
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 1,
    color: colors.signal,
    marginTop: 3,
  },
  sectionFooter: { paddingHorizontal: spacing.m, paddingBottom: 66, gap: 6 },
  approveBtn: {
    backgroundColor: "rgba(127,181,168,0.15)",
    borderWidth: 1,
    borderColor: colors.seafoam,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  approveBtnText: { fontFamily: fonts.display, fontSize: 16, fontWeight: "700", color: colors.seafoam },
  sectionDone: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.seafoam,
    textAlign: "center",
    paddingVertical: 10,
  },
  criticalHint: { fontFamily: fonts.body, fontSize: 12, color: colors.signal, textAlign: "center" },
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: spacing.s,
    backgroundColor: colors.nightDeep,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  summaryBtn: { alignItems: "center", paddingVertical: 10 },
  summaryBtnText: { fontFamily: fonts.display, fontSize: 16, fontWeight: "700", color: colors.brass },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: colors.nightDeep,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: spacing.l,
    borderTopWidth: 1,
    borderTopColor: colors.brass,
  },
  sheetTitle: {
    fontFamily: fonts.display,
    fontSize: 17,
    fontWeight: "700",
    color: colors.paper,
    marginBottom: 6,
  },
  sheetTip: { fontFamily: fonts.body, fontStyle: "italic", fontSize: 12, color: colors.fog, marginBottom: 8 },
  statusBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(147,165,184,0.2)",
  },
  statusBtnIcon: { fontSize: 20, fontWeight: "700", width: 26, textAlign: "center" },
  statusBtnText: { fontFamily: fonts.body, fontSize: 16, color: colors.paper },
  fieldLabel: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 1,
    color: colors.brass,
    marginTop: spacing.m,
    marginBottom: 6,
  },
  sevRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  sevChip: {
    borderWidth: 1,
    borderColor: colors.rope,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  sevChipActive: { backgroundColor: colors.signal, borderColor: colors.signal },
  sevText: { fontFamily: fonts.body, fontSize: 13, color: colors.fog },
  sevTextActive: { color: colors.paper, fontWeight: "700" },
  input: {
    backgroundColor: colors.night,
    borderWidth: 1,
    borderColor: colors.rope,
    borderRadius: 8,
    color: colors.paper,
    fontFamily: fonts.body,
    fontSize: 15,
    paddingHorizontal: 12,
    paddingVertical: 10,
    textAlignVertical: "top",
  },
  photoBtn: {
    borderWidth: 1,
    borderColor: colors.brass,
    borderStyle: "dashed",
    borderRadius: 8,
    paddingVertical: 13,
    alignItems: "center",
    marginTop: spacing.m,
  },
  photoBtnText: { fontFamily: fonts.body, fontSize: 14, color: colors.brass },
  photoHint: { fontFamily: fonts.body, fontSize: 12, color: colors.signal, marginTop: 4, textAlign: "center" },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.m,
  },
  switchLabel: { flex: 1, fontFamily: fonts.body, fontSize: 14, color: colors.paper, marginRight: 10 },
  sheetActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.l,
  },
  cancelText: { fontFamily: fonts.body, fontSize: 15, color: colors.fog },
  saveBtn: {
    backgroundColor: colors.brass,
    borderRadius: 8,
    paddingHorizontal: 28,
    paddingVertical: 12,
  },
  saveBtnText: { fontFamily: fonts.display, fontSize: 16, fontWeight: "700", color: colors.night },
  meterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(147,165,184,0.25)",
  },
  meterLabel: { flex: 1, fontFamily: fonts.body, fontSize: 15, color: colors.paper, marginRight: 10 },
  meterInputWrap: { flexDirection: "row", alignItems: "center", gap: 6 },
  meterInput: {
    backgroundColor: colors.nightDeep,
    borderWidth: 1,
    borderColor: colors.rope,
    borderRadius: 8,
    color: colors.paper,
    fontFamily: fonts.mono,
    fontSize: 17,
    paddingHorizontal: 12,
    paddingVertical: 9,
    minWidth: 90,
    textAlign: "right",
  },
  meterUnit: { fontFamily: fonts.mono, fontSize: 13, color: colors.fog, width: 22 },
  invRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(147,165,184,0.25)",
  },
  invExpected: { fontFamily: fonts.body, fontSize: 12, color: colors.fog, marginTop: 2 },
  stepper: { flexDirection: "row", alignItems: "center", gap: 16 },
  stepBtn: {
    fontSize: 24,
    color: colors.brass,
    fontWeight: "700",
    width: 40,
    height: 40,
    textAlign: "center",
    lineHeight: 38,
    borderWidth: 1,
    borderColor: colors.rope,
    borderRadius: 20,
    overflow: "hidden",
  },
  stepValue: { fontFamily: fonts.mono, fontSize: 18, color: colors.paper, minWidth: 34, textAlign: "center" },
});
