import React, { useCallback, useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, SafeAreaView, Alert } from "react-native";
import { useFocusEffect, useRoute, RouteProp } from "@react-navigation/native";
import {
  completeInspection,
  getInspection,
  getItemResults,
  listIssues,
  listMeters,
  InspectionRow,
  IssueRow,
  MeterRow,
} from "../../repositories/inspections";
import { getTemplateById } from "../../repositories/templates";
import { checkCompletion, lt, summarize, toResultMap } from "../../domain/inspection";
import { colors, fonts, spacing, radius, touch } from "../../theme";
import { RopeDivider } from "../../components/ui";
import { Icon } from "../../components/Icon";
import { useLocale } from "../../i18n";
import { INSPECTION_STRINGS } from "../../i18n/inspection";
import { TRIP_STRINGS, TripStrings } from "../../i18n/trip";
import type { RootStackParamList } from "../../navigation";

type Route = RouteProp<RootStackParamList, "InspectionSummary">;

const SEV_COLOR: Record<string, string> = {
  low: colors.textSecondary,
  medium: colors.warning,
  high: colors.danger,
  critical: colors.danger,
};

export default function SummaryScreen() {
  const route = useRoute<Route>();
  const { locale } = useLocale();
  const s = INSPECTION_STRINGS[locale];
  const ts = TRIP_STRINGS[locale];

  const [inspection, setInspection] = useState<InspectionRow | null>(null);
  const [issues, setIssues] = useState<IssueRow[]>([]);
  const [meters, setMeters] = useState<MeterRow[]>([]);
  const [resultsVersion, setResultsVersion] = useState(0);

  useFocusEffect(
    useCallback(() => {
      const insp = getInspection(route.params.inspectionId);
      setInspection(insp);
      if (insp) {
        setIssues(listIssues(insp.id));
        setMeters(listMeters(insp.id));
        setResultsVersion((v) => v + 1);
      }
    }, [route.params.inspectionId])
  );

  const template = useMemo(
    () => (inspection ? getTemplateById(inspection.templateId) : null),
    [inspection]
  );
  const resultMap = useMemo(
    () => (inspection ? toResultMap(getItemResults(inspection.id)) : new Map()),
    [inspection, resultsVersion] // eslint-disable-line react-hooks/exhaustive-deps
  );

  if (!inspection || !template) return null;

  const summary = summarize(template.sections, resultMap);
  const completion = checkCompletion(template.sections, resultMap);
  const isDone = inspection.status === "completed";

  function doComplete() {
    if (!inspection) return;
    completeInspection(inspection.id);
    setInspection(getInspection(inspection.id));
  }

  function onComplete() {
    if (!completion.canComplete) {
      Alert.alert(
        s.completeBlockedTitle,
        completion.blockingItems.map((i) => `- ${lt(i.title, locale)}`).join("\n")
      );
      return;
    }
    if (completion.warningItems.length > 0) {
      Alert.alert(s.completeWarnTitle, s.completeWarnBody, [
        { text: s.cancel, style: "cancel" },
        { text: s.completeAnyway, style: "destructive", onPress: doComplete },
      ]);
      return;
    }
    doComplete();
  }

  const stat = (label: string, value: number, color?: string) => (
    <View style={styles.stat}>
      <Text style={[styles.statValue, color ? { color } : null]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {isDone && (
          <View style={styles.doneStamp}>
            <Icon name="checkmark-circle" size={22} color={colors.success} />
            <Text style={styles.doneStampText}>{s.doneTitle}</Text>
          </View>
        )}

        <View style={styles.statRow}>
          {stat(s.statusWorking, summary.working, colors.success)}
          {stat(s.statusAttention, summary.needsAttention, colors.warning)}
          {stat(s.statusNotWorking, summary.notWorking, colors.danger)}
          {stat(s.statusNa, summary.notApplicable)}
          {stat(s.statusUnchecked, summary.unchecked, colors.textSecondary)}
        </View>

        {meters.length > 0 && (
          <>
            <RopeDivider label={s.meters.toUpperCase()} />
            {meters.map((m) => (
              <View key={m.id} style={styles.meterRow}>
                <Text style={styles.meterKind}>{ts[(`meter_${m.kind}`) as keyof TripStrings] as string}</Text>
                <Text style={styles.meterValue}>
                  {m.value} {m.unit}
                </Text>
              </View>
            ))}
          </>
        )}

        {issues.length > 0 && (
          <>
            <RopeDivider label={`${s.issuesLabel.toUpperCase()} (${issues.length})`} />
            {issues.map((i) => (
              <View key={i.id} style={styles.issueRow}>
                <View style={[styles.sevDot, { backgroundColor: SEV_COLOR[i.severity] }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.issueTitle}>{i.title}</Text>
                  {i.description ? <Text style={styles.issueDesc}>{i.description}</Text> : null}
                  <View style={styles.issueMetaRow}>
                    {i.reportedToCompany ? (
                      <Icon name="mail-outline" size={13} color={colors.textSecondary} />
                    ) : null}
                    {i.resolved ? (
                      <Icon name="checkmark-circle" size={13} color={colors.success} />
                    ) : null}
                    <Text style={[styles.issueMeta, { color: SEV_COLOR[i.severity] }]}>
                      {i.severity.toUpperCase()}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </>
        )}

        {isDone && inspection.completedAt && (
          <Text style={styles.duration}>
            {s.duration}:{" "}
            {Math.max(
              1,
              Math.round(
                (Date.parse(inspection.completedAt) - Date.parse(inspection.startedAt)) / 60000
              )
            )}{" "}
            min
          </Text>
        )}

        {!isDone && (
          <Pressable
            onPress={onComplete}
            accessibilityRole="button"
            accessibilityLabel={s.complete}
            style={({ pressed }) => [
              styles.completeBtn,
              !completion.canComplete && styles.completeBtnBlocked,
              pressed && { opacity: 0.85 },
            ]}
          >
            <Icon
              name={completion.canComplete ? "checkmark-circle-outline" : "alert-circle-outline"}
              size={20}
              color={completion.canComplete ? colors.onPrimary : colors.danger}
            />
            <Text
              style={[
                styles.completeBtnText,
                !completion.canComplete && { color: colors.danger },
              ]}
            >
              {completion.canComplete
                ? s.complete
                : `${completion.blockingItems.length} — ${s.completeBlockedTitle}`}
            </Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.m, paddingBottom: spacing.xl },
  doneStamp: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: colors.success,
    borderRadius: radius.card,
    padding: spacing.m,
    marginBottom: spacing.m,
    backgroundColor: colors.successBg,
  },
  doneStampText: {
    fontFamily: fonts.body,
    fontSize: 17,
    fontWeight: "600",
    color: colors.success,
    letterSpacing: 0.5,
  },
  statRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "center" },
  stat: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.control,
    paddingVertical: 10,
    paddingHorizontal: 14,
    minWidth: 62,
  },
  statValue: { fontFamily: fonts.body, fontSize: 22, fontWeight: "600", color: colors.text },
  statLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
    textAlign: "center",
  },
  meterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  meterKind: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textSecondary,
    textTransform: "capitalize",
  },
  meterValue: { fontFamily: fonts.mono, fontSize: 15, color: colors.text },
  issueRow: { flexDirection: "row", gap: 10, paddingVertical: 10, alignItems: "flex-start" },
  sevDot: { width: 10, height: 10, borderRadius: 5, marginTop: 6 },
  issueTitle: { fontFamily: fonts.body, fontSize: 14, color: colors.text, lineHeight: 20 },
  issueDesc: { fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  issueMetaRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 4 },
  issueMeta: { fontFamily: fonts.body, fontSize: 11, fontWeight: "600", letterSpacing: 0.5 },
  duration: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing.l,
  },
  completeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: radius.control,
    minHeight: touch.min,
    paddingVertical: 15,
    marginTop: spacing.l,
  },
  completeBtnBlocked: {
    backgroundColor: colors.dangerBg,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  completeBtnText: { fontFamily: fonts.body, fontSize: 16, fontWeight: "600", color: colors.onPrimary },
});
