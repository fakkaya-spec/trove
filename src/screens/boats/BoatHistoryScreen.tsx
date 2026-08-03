import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  SafeAreaView,
  Alert,
  Image,
} from "react-native";
import { useFocusEffect, useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { and, desc, eq, isNull } from "drizzle-orm";
import { getDb } from "../../db/client";
import { inspections, issues } from "../../db/schema";
import { deleteVessel, getVesselById, setVesselPhoto, VesselRow } from "../../repositories/vessels";
import { VESSEL_STRINGS } from "../../i18n/vessel";
import { capturePhoto, resolveMediaUri } from "../../media/photos";
import { useEntitlement } from "../../entitlement";
import { isDone } from "../../domain/trip";
import type { InspectionStatus } from "../../domain/types";
import { colors, fonts, spacing, radius, touch } from "../../theme";
import { RopeDivider, EmptyState } from "../../components/ui";
import { Icon, type IconName } from "../../components/Icon";
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

const KIND_ICON: Record<string, IconName> = {
  check_in: "clipboard-outline",
  check_out: "swap-horizontal-outline",
  pre_departure: "partly-sunny-outline",
  return_secure: "lock-closed-outline",
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
  const sv = VESSEL_STRINGS[locale];

  const [boat, setBoat] = useState<VesselRow | null>(null);
  const [rows, setRows] = useState<HistoryRow[]>([]);
  const { requestAccess } = useEntitlement();

  async function onPhoto() {
    if (!boat || boat.isSample) return;
    if (!(await requestAccess("gallery_import"))) return;
    const key = await capturePhoto();
    if (!key) return;
    setVesselPhoto(boat.id, key);
    setBoat(getVesselById(boat.id));
  }

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
        {/* Canlılık turu: tekne kimlik fotoğrafı — ekle/değiştir */}
        {!boat.isSample && (
          <Pressable
            onPress={() => void onPhoto()}
            accessibilityRole="button"
            accessibilityLabel={boat.photoUri ? sv.changePhoto : sv.addPhoto}
            style={({ pressed }) => [styles.photoHero, pressed && { opacity: 0.9 }]}
          >
            {boat.photoUri ? (
              <>
                <Image
                  source={{ uri: resolveMediaUri(boat.photoUri) }}
                  style={styles.photoImg}
                  resizeMode="cover"
                />
                <View style={styles.photoBadge}>
                  <Icon name="camera-outline" size={13} color="#FFFFFF" />
                </View>
              </>
            ) : (
              <>
                <Icon name="camera-outline" size={22} color="rgba(255,255,255,0.30)" />
                <Text style={styles.photoHint}>{sv.addPhoto}</Text>
              </>
            )}
          </Pressable>
        )}
        <Text style={styles.subtitle}>
          {boatTypeLabel(si, boat.type)}
          {boat.model ? ` · ${boat.model}` : ""}
        </Text>

        <RopeDivider label={s.historyTitle.toUpperCase()} />

        {rows.length === 0 && <EmptyState icon="document-text-outline" title={s.historyEmpty} />}

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
              <Icon name={KIND_ICON[r.kind] ?? "clipboard-outline"} size={22} color={colors.text} />
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>
                  {kindKey ? (s[kindKey] as string) : r.kind}
                </Text>
                <View style={styles.rowMetaRow}>
                  <Text style={styles.rowMeta}>{new Date(r.startedAt).toLocaleDateString()}</Text>
                  {r.totalIssues > 0 && (
                    <>
                      <Icon name="warning-outline" size={13} color={colors.warning} />
                      <Text style={styles.rowMeta}>{r.totalIssues}</Text>
                    </>
                  )}
                  {r.openIssues > 0 && (
                    <>
                      <Icon name="alert-circle-outline" size={13} color={colors.danger} />
                      <Text style={[styles.rowMeta, { color: colors.danger }]}>{r.openIssues}</Text>
                    </>
                  )}
                </View>
              </View>
              {isDone(r.status) ? (
                <Icon name="checkmark-circle" size={22} color={colors.success} />
              ) : (
                <Icon name="time-outline" size={22} color={colors.warning} />
              )}
            </Pressable>
          );
        })}

        {/* Tekne silme (cihaz testi F3) — yumuşak silme: sefer/denetim
            geçmişi korunur; örnek teknelerde görünmez. */}
        {!boat.isSample && (
          <Pressable
            onPress={() =>
              Alert.alert(sv.deleteVessel, sv.deleteVesselConfirm, [
                { text: s.cancel, style: "cancel" },
                {
                  text: sv.deleteVessel,
                  style: "destructive",
                  onPress: () => {
                    deleteVessel(boat.id);
                    navigation.goBack();
                  },
                },
              ])
            }
            accessibilityRole="button"
            accessibilityLabel={sv.deleteVessel}
            style={({ pressed }) => [styles.deleteBtn, pressed && { opacity: 0.8 }]}
          >
            <Text style={styles.deleteText}>{sv.deleteVessel}</Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.m, paddingBottom: spacing.xl },
  photoHero: {
    height: 148,
    borderRadius: radius.card,
    backgroundColor: "#090C18",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    overflow: "hidden",
    marginBottom: spacing.s,
  },
  photoImg: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  photoBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.45)",
    borderRadius: 6,
    padding: 5,
  },
  photoHint: { fontFamily: fonts.body, fontSize: 12, color: "rgba(255,255,255,0.45)" },
  deleteBtn: {
    minHeight: touch.min,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.l,
  },
  deleteText: { fontFamily: fonts.body, fontSize: 13, fontWeight: "600", color: colors.danger },
  subtitle: { fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary, textAlign: "center" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.card,
    padding: spacing.m,
    marginBottom: spacing.s,
    minHeight: touch.row,
  },
  rowTitle: { fontFamily: fonts.body, fontSize: 15, fontWeight: "600", color: colors.text },
  rowMetaRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 3 },
  rowMeta: { fontFamily: fonts.mono, fontSize: 12, color: colors.textSecondary, marginRight: 6 },
});
