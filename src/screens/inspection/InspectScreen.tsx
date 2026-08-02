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
import { useEntitlement } from "../../entitlement";
import { colors, fonts, spacing, radius, touch } from "../../theme";
import { Icon, type IconName } from "../../components/Icon";
import { Tag } from "../../components/ui";
import { useLocale } from "../../i18n";
import { INSPECTION_STRINGS, InspectionStrings } from "../../i18n/inspection";
import type { RootStackParamList } from "../../navigation";

type Route = RouteProp<RootStackParamList, "Inspect">;
type Nav = NativeStackNavigationProp<RootStackParamList, "Inspect">;

// Durum: renk + ikon birlikte (yalnız renge güvenilmez — güneşte/renk körlüğünde ayırt edilir).
const STATUS_META: Record<
  ItemStatus,
  { icon: IconName; color: string; labelKey: keyof InspectionStrings }
> = {
  unchecked: { icon: "ellipse-outline", color: colors.textSecondary, labelKey: "statusUnchecked" },
  working: { icon: "checkmark-circle", color: colors.success, labelKey: "statusWorking" },
  needs_attention: { icon: "warning-outline", color: colors.warning, labelKey: "statusAttention" },
  not_working: { icon: "close-circle-outline", color: colors.danger, labelKey: "statusNotWorking" },
  not_applicable: { icon: "remove-outline", color: colors.textSecondary, labelKey: "statusNa" },
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
        accessibilityRole="button"
        accessibilityLabel={`${lt(item.title, locale)} — ${s[meta.labelKey]}`}
        style={({ pressed }) => [styles.itemRow, pressed && { opacity: 0.7 }]}
      >
        <View style={[styles.statusDot, { borderColor: meta.color }]}>
          <Icon name={meta.icon} size={18} color={meta.color} />
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
            <View style={styles.criticalTagRow}>
              <Tag kind="critical" label={s.sevCritical.toUpperCase()} />
            </View>
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
            let chipIcon: IconName | null = null;
            let badge: string | null = null;
            let complete = false;
            if (t.kind === "section") {
              label = lt(t.section.title, locale);
              const prog = sectionProgress(t.section, resultMap);
              complete = prog.complete;
              badge = prog.complete ? null : `${prog.total - prog.unchecked}/${prog.total}`;
            } else if (t.kind === "meters") {
              label = s.meters;
              chipIcon = "speedometer-outline";
            } else {
              label = s.inventory;
              chipIcon = "cube-outline";
            }
            const fg = active ? colors.onPrimary : colors.text;
            return (
              <Pressable
                key={idx}
                onPress={() => setTabIndex(idx)}
                accessibilityRole="tab"
                accessibilityLabel={label}
                accessibilityState={{ selected: active }}
                style={[styles.chip, active && styles.chipActive]}
              >
                {chipIcon ? <Icon name={chipIcon} size={15} color={fg} /> : null}
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {label}
                  {badge ? `  ${badge}` : ""}
                </Text>
                {complete ? (
                  <Icon name="checkmark-circle" size={15} color={active ? colors.onPrimary : colors.success} />
                ) : null}
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
          accessibilityRole="button"
          accessibilityLabel={s.summary}
          style={({ pressed }) => [styles.summaryBtn, pressed && { opacity: 0.85 }]}
        >
          <Icon name="document-text-outline" size={20} color={colors.onPrimary} />
          <Text style={styles.summaryBtnText}>{s.summary}</Text>
        </Pressable>
      </View>

      {/* Durum seçici */}
      <Modal visible={!!sheetItem} transparent animationType="slide" onRequestClose={() => setSheetItem(null)}>
        <Pressable style={styles.backdrop} onPress={() => setSheetItem(null)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            {sheetItem && (
              <>
                <Text style={styles.sheetTitle}>{lt(sheetItem.title, locale)}</Text>
                {sheetItem.tip && <Text style={styles.sheetTip}>{lt(sheetItem.tip, locale)}</Text>}
                {(["working", "needs_attention", "not_working", "not_applicable"] as ItemStatus[]).map(
                  (st) => {
                    const meta = STATUS_META[st];
                    return (
                      <Pressable
                        key={st}
                        onPress={() => applyStatus(sheetItem, st)}
                        accessibilityRole="button"
                        accessibilityLabel={s[meta.labelKey]}
                        style={({ pressed }) => [styles.statusBtn, pressed && { opacity: 0.7 }]}
                      >
                        <Icon name={meta.icon} size={24} color={meta.color} />
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
            accessibilityRole="button"
            accessibilityLabel={s.approveSection}
            style={({ pressed }) => [styles.approveBtn, pressed && { opacity: 0.85 }]}
          >
            <Icon name="checkmark-circle-outline" size={20} color={colors.success} />
            <Text style={styles.approveBtnText}>{s.approveSection}</Text>
          </Pressable>
        ) : prog.complete ? (
          <View style={styles.sectionDoneRow}>
            <Icon name="checkmark-circle" size={18} color={colors.success} />
            <Text style={styles.sectionDone}>{s.sectionClear}</Text>
          </View>
        ) : null}
        {prog.criticalUnchecked > 0 && (
          <View style={styles.criticalHintRow}>
            <Icon name="alert-circle-outline" size={15} color={colors.danger} />
            <Text style={styles.criticalHint}>
              {prog.criticalUnchecked} {s.criticalNeedTap}
            </Text>
          </View>
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
  const { requestAccess } = useEntitlement();
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
    // KİLİTLİ kural (MONETIZATION 1): foto kapılı, metin kaydı asla değil.
    if (!(await requestAccess("inspection_photo"))) return;
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
            <View style={styles.sheetTitleRow}>
              <Icon
                name={STATUS_META[status].icon}
                size={22}
                color={STATUS_META[status].color}
              />
              <Text style={styles.sheetTitle}>{lt(item.title, locale)}</Text>
            </View>

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
              placeholderTextColor={colors.textSecondary}
            />

            <Pressable
              onPress={onAddPhoto}
              style={({ pressed }) => [styles.photoBtn, pressed && { opacity: 0.8 }]}
            >
              <Icon name="camera-outline" size={20} color={colors.info} />
              <Text style={styles.photoBtnText}>
                {s.addPhoto}
                {photoCount > 0 ? `  ·  ${photoCount} ${s.photoAdded}` : ""}
              </Text>
            </Pressable>
            {item.requiresPhotoOnIssue && photoCount === 0 && (
              <View style={styles.photoHintRow}>
                <Icon name="camera-outline" size={15} color={colors.danger} />
                <Text style={styles.photoHint}>{s.addPhoto}</Text>
              </View>
            )}

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>{s.reportedToCompany}</Text>
              <Switch value={reported} onValueChange={setReported} trackColor={{ true: colors.gold }} />
            </View>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>{s.resolved}</Text>
              <Switch value={resolved} onValueChange={setResolved} trackColor={{ true: colors.gold }} />
            </View>

            <View style={styles.sheetActions}>
              <Pressable onPress={() => props.onClose(false)} hitSlop={8} style={styles.cancelBtn}>
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
                placeholderTextColor={colors.textSecondary}
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
              <Text style={[styles.invExpected, missing && { color: colors.danger }]}>
                {def.expectedCount} {s.expected}
              </Text>
            </View>
            <View style={styles.stepper}>
              <Pressable onPress={() => setCount(def, (found ?? def.expectedCount) - 1)} hitSlop={6}>
                <Text style={styles.stepBtn}>−</Text>
              </Pressable>
              <Text style={[styles.stepValue, missing && { color: colors.danger }]}>
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
  safe: { flex: 1, backgroundColor: colors.bg },
  chipBar: { paddingHorizontal: spacing.m, paddingVertical: 10, gap: 8 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    minHeight: 44,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontFamily: fonts.body, fontSize: 13, color: colors.text },
  chipTextActive: { color: colors.onPrimary, fontWeight: "600" },
  list: { paddingHorizontal: spacing.m, paddingBottom: 90 },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: touch.row,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  statusDot: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  itemText: { fontFamily: fonts.body, fontSize: 15, lineHeight: 21, color: colors.text },
  itemDone: { color: colors.textSecondary },
  itemNa: { color: colors.textSecondary, textDecorationLine: "line-through" },
  criticalTagRow: { flexDirection: "row", marginTop: 4 },
  sectionFooter: { paddingHorizontal: spacing.m, paddingBottom: 74, gap: 6 },
  approveBtn: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.successBg,
    borderWidth: 1,
    borderColor: colors.success,
    borderRadius: radius.control,
    minHeight: touch.min,
    paddingVertical: 13,
    alignItems: "center",
  },
  approveBtnText: { fontFamily: fonts.body, fontSize: 15, fontWeight: "600", color: colors.success },
  sectionDoneRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
  },
  sectionDone: { fontFamily: fonts.body, fontSize: 14, fontWeight: "600", color: colors.success },
  criticalHintRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  criticalHint: { fontFamily: fonts.body, fontSize: 13, color: colors.danger },
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: spacing.s,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  summaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: touch.min,
    backgroundColor: colors.primary,
    borderRadius: radius.control,
    paddingVertical: 10,
  },
  summaryBtnText: { fontFamily: fonts.body, fontSize: 16, fontWeight: "600", color: colors.onPrimary },
  backdrop: { flex: 1, backgroundColor: "rgba(11,29,51,0.5)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: spacing.l,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  sheetTitleRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  sheetTitle: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 17,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 6,
  },
  sheetTip: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 8,
  },
  statusBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    minHeight: touch.row,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  statusBtnText: { fontFamily: fonts.body, fontSize: 16, color: colors.text },
  fieldLabel: {
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
    color: colors.textSecondary,
    marginTop: spacing.m,
    marginBottom: 6,
  },
  sevRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  sevChip: {
    minHeight: 44,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  sevChipActive: { backgroundColor: colors.danger, borderColor: colors.danger },
  sevText: { fontFamily: fonts.body, fontSize: 13, color: colors.text },
  sevTextActive: { color: colors.onPrimary, fontWeight: "600" },
  input: {
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.control,
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: 15,
    paddingHorizontal: 12,
    paddingVertical: 10,
    textAlignVertical: "top",
  },
  photoBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: colors.info,
    borderStyle: "dashed",
    borderRadius: radius.control,
    minHeight: touch.min,
    paddingVertical: 13,
    marginTop: spacing.m,
  },
  photoBtnText: { fontFamily: fonts.body, fontSize: 14, fontWeight: "600", color: colors.info },
  photoHintRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    marginTop: 6,
  },
  photoHint: { fontFamily: fonts.body, fontSize: 12, color: colors.danger },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 44,
    marginTop: spacing.m,
  },
  switchLabel: { flex: 1, fontFamily: fonts.body, fontSize: 14, color: colors.text, marginRight: 10 },
  sheetActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.l,
  },
  cancelBtn: { minHeight: touch.min, justifyContent: "center", paddingHorizontal: 8 },
  cancelText: { fontFamily: fonts.body, fontSize: 15, color: colors.textSecondary },
  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.control,
    minHeight: touch.min,
    justifyContent: "center",
    paddingHorizontal: 28,
    paddingVertical: 12,
  },
  saveBtnText: { fontFamily: fonts.body, fontSize: 16, fontWeight: "600", color: colors.onPrimary },
  meterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: touch.row,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  meterLabel: { flex: 1, fontFamily: fonts.body, fontSize: 15, color: colors.text, marginRight: 10 },
  meterInputWrap: { flexDirection: "row", alignItems: "center", gap: 6 },
  meterInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.control,
    color: colors.text,
    fontFamily: fonts.mono,
    fontSize: 17,
    minHeight: touch.min,
    paddingHorizontal: 12,
    paddingVertical: 9,
    minWidth: 90,
    textAlign: "right",
  },
  meterUnit: { fontFamily: fonts.mono, fontSize: 13, color: colors.textSecondary, width: 22 },
  invRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: touch.row,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  invExpected: { fontFamily: fonts.body, fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  stepper: { flexDirection: "row", alignItems: "center", gap: 14 },
  stepBtn: {
    fontSize: 24,
    color: colors.text,
    fontWeight: "600",
    width: touch.min,
    height: touch.min,
    textAlign: "center",
    lineHeight: 46,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: touch.min / 2,
    overflow: "hidden",
  },
  stepValue: { fontFamily: fonts.mono, fontSize: 18, color: colors.text, minWidth: 34, textAlign: "center" },
});
