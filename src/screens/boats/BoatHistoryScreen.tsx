import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, SafeAreaView } from "react-native";
import { useFocusEffect, useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { and, desc, eq, isNull } from "drizzle-orm";
import { getDb } from "../../db/client";
import { inspections, issues } from "../../db/schema";
import { getVesselById, VesselRow } from "../../repositories/vessels";
import { isDone } from "../../domain/trip";
import type { InspectionStatus } from "../../domain/types";
import { colors, fonts, spacing } from "../../theme";
import { RopeDivider } from "../../components/ui";
import { useLocale } from "../../i18n";
import { boatTypeLabel, INSPECTION_STRINGS } from "../../i18n/inspection";
import { TRIP_STRINGS, TripStrings } from "../../i18n/trip";
import type { RootStackParamList } from "../../navigation";

type Route = RouteProp<RootStackParamList, "BoatHistory">;
type Nav = NativeStackNavigationProp<RootStackParamList>;

interface HistoryRow {
  id: string;
  kind: string;
  status: InspectionStatus;
  startedAt: string;
  openIssues: number;
  totalIssues: number;
}

const KIND_ICON: Record<string, string> = {
  check_in: "📋",
  check_out: "🔁",
  pre_departure: "🌤️",
  return_secure: "🔒",
};

// Denetim türü → mevcut modül etiketi (yeni anahtar üretmeden yeniden kullanım)
const KIND_LABEL: Record<string, keyof TripStrings> = {
  check_in: "checkIn",
  check_out: "checkOut",
  pre_departure: "preDeparture",
  return_secure: "returnCheck",
};

export default function BoatHistoryScreen() {
  const route = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const { locale } = useLocale();
  const s = TRIP_STRINGS[locale];
  const si = INSPECTION_STRINGS[locale];

  const [boat, setBoat] = useState<VesselRow | null>(null);
  const [rows, setRows] = useState<HistoryRow[]>([]);

  useFocusEffect(
    useCallback(() => {
      const v = getVesselById(route.params.boatId);
      setBoat(v);
      if (!v) return;
      navigation.setOptions({ title: v.name });
      const db = getDb();
      const inspectionRows = db
        .select()
        .from(inspections)
        .where(and(eq(inspections.vesselId, v.id), isNull(inspections.deletedAt)))
        .orderBy(desc(inspections.startedAt))
        .all();
      const history: HistoryRow[] = inspectionRows.map((r) => {
        const issueRows = db
          .select({ severity: issues.severity, resolved: issues.resolved })
          .from(issues)
          .where(and(eq(issues.inspectionId, r.id), isNull(issues.deletedAt)))
          .all();
        return {
          id: r.id,
          kind: r.kind,
          status: r.status as InspectionStatus,
          startedAt: r.startedAt,
          openIssues: issueRows.filter((i) => i.resolved === 0).length,
          totalIssues: issueRows.length,
        };
      });
      setRows(history);
    }, [route.params.boatId, navigation])
  );

  if (!boat) return null;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.subtitle}>
          {boatTypeLabel(si, boat.type)}
          {boat.model ? ` · ${boat.model}` : ""}
        </Text>

        <RopeDivider label={`📖 ${s.historyTitle.toUpperCase()}`} />

        {rows.length === 0 && <Text style={styles.empty}>{s.historyEmpty}</Text>}

        {rows.map((r) => {
          const kindKey = KIND_LABEL[r.kind];
          return (
            <Pressable
              key={r.id}
              onPress={() => navigation.navigate("InspectionSummary", { inspectionId: r.id })}
              accessibilityRole="button"
              accessibilityLabel={kindKey ? (s[kindKey] as string) : r.kind}
              style={({ pressed }) => [styles.row, pressed && { opacity: 0.85 }]}
            >
              <Text style={styles.rowIcon}>{KIND_ICON[r.kind] ?? "📋"}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>
                  {kindKey ? (s[kindKey] as string) : r.kind}
                </Text>
                <Text style={styles.rowMeta}>
                  {new Date(r.startedAt).toLocaleDateString()}
                  {r.totalIssues > 0 ? `  ·  ⚠ ${r.totalIssues}` : ""}
                  {r.openIssues > 0 ? `  ·  ● ${r.openIssues}` : ""}
                </Text>
              </View>
              <Text style={[styles.rowStatus, isDone(r.status) && { color: colors.seafoam }]}>
                {isDone(r.status) ? "✓" : "…"}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.night },
  scroll: { padding: spacing.m, paddingBottom: spacing.xl },
  subtitle: { fontFamily: fonts.body, fontSize: 13, color: colors.fog, textAlign: "center" },
  empty: {
    fontFamily: fonts.body,
    fontStyle: "italic",
    fontSize: 13,
    lineHeight: 19,
    color: colors.fog,
    textAlign: "center",
    marginTop: spacing.l,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.nightDeep,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 10,
    padding: spacing.m,
    marginBottom: spacing.s,
    minHeight: 60,
  },
  rowIcon: { fontSize: 22 },
  rowTitle: { fontFamily: fonts.display, fontSize: 15, fontWeight: "700", color: colors.paper },
  rowMeta: { fontFamily: fonts.mono, fontSize: 11, color: colors.fog, marginTop: 3 },
  rowStatus: { fontFamily: fonts.mono, fontSize: 18, color: colors.brass },
});
