import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  SafeAreaView,
  ListRenderItem,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { T, TSH, TICON, spacing, touch, radius } from "../../theme";
import { LIcon, type LIconName } from "../../components/LIcon";
import { isDbReady } from "../../db/state";
import { currentTrip, TripRow } from "../../repositories/trips";
import {
  countLogMediaByEntry,
  listLogEntries,
  LogEntryRow,
  pendingLogSyncIds,
} from "../../repositories/log";
import { formatOccurredAt, logSyncState, LogEntryType, LogSyncState } from "../../domain/log";
import { features } from "../../config/features";
import { useLocale } from "../../i18n";
import { LOG_STRINGS, LogStrings } from "../../i18n/log";
import type { RootStackParamList } from "../../navigation";

type Nav = NativeStackNavigationProp<RootStackParamList>;

// Log sekmesi — aktif seferin kronolojik kaydı. Repository-destekli (Faz 5):
// kayıtlar SQLite'tan gelir, yerel-önce yazılır; senkron durumu KİLİTLİ dille
// gösterilir (bekleyen iş asla "başarısız" değildir). Görsel yapı onaylı
// tasarımın zaman çizelgesi düzenidir; yeniden tasarlanmadı.

const ENTRY_CFG: Record<LogEntryType, { icon: LIconName; color: string; bg: string }> = {
  observation: { icon: "alert-triangle", color: T.amber, bg: T.amberL },
  note: { icon: "pencil", color: T.blue, bg: T.blueL },
  photo: { icon: "camera", color: T.ink2, bg: T.surfaceEl },
  anchorage: { icon: "anchor", color: T.blue, bg: T.blueL },
  incident: { icon: "zap", color: T.red, bg: T.redL },
  defect: { icon: "alert-triangle", color: T.red, bg: T.redL },
  general: { icon: "book-open", color: T.green, bg: T.greenL },
};

const SYNC_LABEL: Record<LogSyncState, keyof LogStrings> = {
  saved_device: "savedDevice",
  waiting_sync: "waitingSync",
  synced: "synced",
};

export default function LogScreen() {
  const navigation = useNavigation<Nav>();
  const { locale } = useLocale();
  const s = LOG_STRINGS[locale];

  const [trip, setTrip] = useState<TripRow | null>(null);
  const [entries, setEntries] = useState<LogEntryRow[]>([]);
  const [pending, setPending] = useState<Set<string>>(new Set());
  const [mediaCounts, setMediaCounts] = useState<Map<string, number>>(new Map());
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!isDbReady()) return;
      const t = currentTrip();
      setTrip(t);
      const list = t ? listLogEntries(t.id) : [];
      setEntries(list);
      setPending(pendingLogSyncIds());
      // Tek sorgu (GROUP BY) — kayıt başına ayrı sorgu (N+1) yapılmaz (M3).
      setMediaCounts(t ? countLogMediaByEntry(t.id) : new Map());
    }, [])
  );

  const renderEntry: ListRenderItem<LogEntryRow> = ({ item: e, index }) => {
    const cfg = ENTRY_CFG[e.type];
    const highlight = e.type === "observation" || e.type === "incident" || e.type === "defect";
    const isLast = index === entries.length - 1;
    const expanded = expandedId === e.id;
    const photos = mediaCounts.get(e.id) ?? 0;
    // Karar merkezî: tüketici yokken dürüstçe yalnız "bu cihazda kayıtlı".
    const syncText = s[SYNC_LABEL[logSyncState(pending.has(e.id), features.syncWorker)]];

    return (
      <View style={styles.entryRow}>
        <View style={styles.timelineCol}>
          <View style={[styles.dot, { backgroundColor: cfg.bg }]}>
            <LIcon name={cfg.icon} size={12} color={cfg.color} />
          </View>
          {!isLast && <View style={styles.connector} />}
        </View>
        <Pressable
          onPress={() => setExpandedId(expanded ? null : e.id)}
          accessibilityRole="button"
          accessibilityLabel={e.title}
          style={({ pressed }) => [
            styles.entryCard,
            highlight && styles.entryCardObs,
            pressed && { opacity: 0.85 },
          ]}
        >
          {highlight && <View style={styles.keel} />}
          <View style={{ paddingLeft: highlight ? 10 : 0, flex: 1 }}>
            <Text style={styles.entryTitle} numberOfLines={expanded ? undefined : 2}>
              {e.title}
            </Text>
            {expanded && e.description ? (
              <Text style={styles.entryDesc}>{e.description}</Text>
            ) : null}
            <View style={styles.entryMeta}>
              {e.place ? (
                <Text style={styles.entryLoc} numberOfLines={1}>
                  {e.place}
                </Text>
              ) : (
                <View style={{ flex: 1 }} />
              )}
              {photos > 0 && (
                <View style={styles.mediaBadge}>
                  <LIcon name="camera" size={9} color={T.ink3} />
                  <Text style={styles.mediaCount}>{photos}</Text>
                </View>
              )}
              <Text style={styles.entryTime}>{formatOccurredAt(e.occurredAt, locale)}</Text>
            </View>
            <Text style={styles.syncState}>{syncText}</Text>
          </View>
        </Pressable>
      </View>
    );
  };

  const tripDates =
    trip?.startAt && trip?.endAt ? ` · ${trip.startAt} – ${trip.endAt}` : "";

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View style={{ flex: 1, paddingRight: 8 }}>
          <Text style={styles.headerTitle}>{s.logbook}</Text>
          {trip ? (
            <Text style={styles.headerSub} numberOfLines={1}>
              {trip.name}
              {tripDates}
            </Text>
          ) : null}
        </View>
        <Pressable
          onPress={() => navigation.navigate("AddLog")}
          disabled={!trip}
          style={({ pressed }) => [
            styles.addBtn,
            !trip && { backgroundColor: T.surfaceEl },
            pressed && { opacity: 0.8 },
          ]}
          accessibilityRole="button"
          accessibilityLabel={s.addTitle}
          accessibilityState={{ disabled: !trip }}
        >
          <LIcon name="plus" size={TICON.sm} color={trip ? "#FFFFFF" : T.ink3} />
          <Text style={[styles.addBtnLabel, !trip && { color: T.ink3 }]}>{s.addCta}</Text>
        </Pressable>
      </View>
      <FlatList
        data={entries}
        keyExtractor={(e) => e.id}
        renderItem={renderEntry}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <LIcon name="book-open" size={28} color={T.ink3} />
            </View>
            <Text style={styles.emptyTitle}>{trip ? s.emptyTitle : s.noTripTitle}</Text>
            <Text style={styles.emptyBody}>{trip ? s.emptyBody : s.noTripBody}</Text>
          </View>
        }
        contentContainerStyle={[styles.list, entries.length === 0 && styles.listEmpty]}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.bg },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.m,
    paddingVertical: 12,
    backgroundColor: T.surface,
    borderBottomWidth: 1,
    borderBottomColor: T.rule,
  },
  headerTitle: { fontSize: 17, fontWeight: "700", color: T.ink0, letterSpacing: -0.4 },
  headerSub: { fontSize: 11, color: T.ink2, marginTop: 2 },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: T.blue,
    borderRadius: radius.control,
    paddingHorizontal: 14,
    minHeight: touch.min,
    justifyContent: "center",
  },
  addBtnLabel: { fontSize: 12, fontWeight: "600", color: "#FFFFFF" },
  list: { padding: spacing.m, paddingBottom: 40 },
  listEmpty: { flex: 1 },
  entryRow: { flexDirection: "row", gap: 12, marginBottom: 6 },
  timelineCol: { alignItems: "center", paddingTop: 8, width: 28 },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  connector: { width: 1, flex: 1, backgroundColor: T.rule, marginTop: 4, minHeight: 16 },
  entryCard: {
    flex: 1,
    backgroundColor: T.surface,
    borderRadius: T.r2,
    borderWidth: 1,
    borderColor: T.rule,
    paddingHorizontal: 12,
    paddingVertical: 11,
    overflow: "hidden",
    ...TSH.sh0,
  },
  entryCardObs: { borderColor: "rgba(201,106,0,0.20)" },
  // Tasarım sistemi v1.0: gözlem vurgusu amber (mavi = tamamlanmış işareti).
  keel: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: T.amber,
  },
  entryTitle: { fontSize: 13, fontWeight: "500", color: T.ink0, lineHeight: 18 },
  entryDesc: { fontSize: 12, color: T.ink1, lineHeight: 18, marginTop: 4 },
  entryMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
    gap: 8,
  },
  entryLoc: { fontSize: 11, color: T.ink2, flex: 1 },
  mediaBadge: { flexDirection: "row", alignItems: "center", gap: 3 },
  mediaCount: { fontSize: 10, color: T.ink3, fontFamily: T.mono },
  // Sıradan tarih/saat gösterimi mono DEĞİLDİR (mono yalnız kanıt
  // metaverisinde — ör. foto üstü damga); yerel dilime çevrilmiş metin.
  entryTime: { fontSize: 10, color: T.ink3 },
  syncState: { fontSize: 9, color: T.ink3, marginTop: 3 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: T.surface,
    borderWidth: 1,
    borderColor: T.rule,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.m,
  },
  emptyTitle: { fontSize: 17, fontWeight: "600", color: T.ink0, textAlign: "center" },
  emptyBody: {
    fontSize: 13,
    color: T.ink2,
    textAlign: "center",
    lineHeight: 18,
    marginTop: 6,
    maxWidth: 260,
  },
});
