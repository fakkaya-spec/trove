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
import { colors, fonts, spacing } from "../../theme";
import { RopeDivider } from "../../components/ui";
import { useLocale } from "../../i18n";
import { INSPECTION_STRINGS } from "../../i18n/inspection";
import type { RootStackParamList } from "../../navigation";

type Route = RouteProp<RootStackParamList, "InspectionSummary">;

const SEV_COLOR: Record<string, string> = {
  low: colors.fog,
  medium: "#B7791F",
  high: colors.signal,
  critical: colors.signal,
};

export default function SummaryScreen() {
  const route = useRoute<Route>();
  const { locale } = useLocale();
  const s = INSPECTION_STRINGS[locale];

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
        completion.blockingItems.map((i) => `● ${lt(i.title, locale)}`).join("\n")
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
            <Text style={styles.doneStampText}>✓ {s.doneTitle}</Text>
          </View>
        )}

        <View style={styles.statRow}>
          {stat(s.statusWorking, summary.working, "#3E7466")}
          {stat(s.statusAttention, summary.needsAttention, "#B7791F")}
          {stat(s.statusNotWorking, summary.notWorking, colors.signal)}
          {stat(s.statusNa, summary.notApplicable)}
          {stat(s.statusUnchecked, summary.unchecked, colors.fog)}
        </View>

        {meters.length > 0 && (
          <>
            <RopeDivider label={`⛽ ${s.meters.toUpperCase()}`} />
            {meters.map((m) => (
              <View key={m.id} style={styles.meterRow}>
                <Text style={styles.meterKind}>{m.kind.replace(/_/g, " ")}</Text>
                <Text style={styles.meterValue}>
                  {m.value} {m.unit}
                </Text>
              </View>
            ))}
          </>
        )}

        {issues.length > 0 && (
          <>
            <RopeDivider label={`⚠ ${s.issuesLabel.toUpperCase()} (${issues.length})`} />
            {issues.map((i) => (
              <View key={i.id} style={styles.issueRow}>
                <View style={[styles.sevDot, { backgroundColor: SEV_COLOR[i.severity] }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.issueTitle}>{i.title}</Text>
                  {i.description ? <Text style={styles.issueDesc}>{i.description}</Text> : null}
                  <Text style={styles.issueMeta}>
                    {i.reportedToCompany ? "📣 " : ""}
                    {i.resolved ? "✓ " : ""}
                    {i.severity.toUpperCase()}
                  </Text>
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
            style={({ pressed }) => [
              styles.completeBtn,
              !completion.canComplete && styles.completeBtnBlocked,
              pressed && { opacity: 0.85 },
            ]}
          >
            <Text
              style={[
                styles.completeBtnText,
                !completion.canComplete && { color: colors.signal },
              ]}
            >
              {completion.canComplete
                ? `✓ ${s.complete}`
                : `● ${completion.blockingItems.length} — ${s.completeBlockedTitle}`}
            </Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.night },
  scroll: { padding: spacing.m, paddingBottom: spacing.xl },
  doneStamp: {
    borderWidth: 2,
    borderColor: colors.seafoam,
    borderRadius: 8,
    padding: spacing.m,
    alignItems: "center",
    transform: [{ rotate: "-1deg" }],
    marginBottom: spacing.m,
    backgroundColor: "rgba(127,181,168,0.1)",
  },
  doneStampText: {
    fontFamily: fonts.display,
    fontSize: 18,
    fontWeight: "700",
    color: colors.seafoam,
    letterSpacing: 1,
  },
  statRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "center" },
  stat: {
    alignItems: "center",
    backgroundColor: colors.nightDeep,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    minWidth: 62,
  },
  statValue: { fontFamily: fonts.display, fontSize: 22, fontWeight: "700", color: colors.paper },
  statLabel: { fontFamily: fonts.body, fontSize: 10, color: colors.fog, marginTop: 2, textAlign: "center" },
  meterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(147,165,184,0.2)",
  },
  meterKind: { fontFamily: fonts.body, fontSize: 14, color: colors.fog, textTransform: "capitalize" },
  meterValue: { fontFamily: fonts.mono, fontSize: 15, color: colors.paper },
  issueRow: { flexDirection: "row", gap: 10, paddingVertical: 10, alignItems: "flex-start" },
  sevDot: { width: 10, height: 10, borderRadius: 5, marginTop: 6 },
  issueTitle: { fontFamily: fonts.body, fontSize: 14, color: colors.paper, lineHeight: 20 },
  issueDesc: { fontFamily: fonts.body, fontSize: 13, fontStyle: "italic", color: colors.fog, marginTop: 2 },
  issueMeta: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1, color: colors.fog, marginTop: 4 },
  duration: { fontFamily: fonts.mono, fontSize: 12, color: colors.fog, textAlign: "center", marginTop: spacing.l },
  completeBtn: {
    backgroundColor: colors.brass,
    borderRadius: 10,
    paddingVertical: 17,
    alignItems: "center",
    marginTop: spacing.l,
  },
  completeBtnBlocked: { backgroundColor: "transparent", borderWidth: 1, borderColor: colors.signal },
  completeBtnText: { fontFamily: fonts.display, fontSize: 16, fontWeight: "700", color: colors.night },
});
