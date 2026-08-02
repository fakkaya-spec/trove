import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  SafeAreaView,
  ListRenderItem,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { T, TSH, TICON, spacing, touch, radius } from "../../theme";
import { Icon, type IconName } from "../../components/Icon";
import type { RootStackParamList } from "../../navigation";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export type LogEntryType = "observation" | "note" | "photo" | "check_in";
export type Severity = "minor" | "moderate" | "serious";

export interface LogEntry {
  id: string;
  type: LogEntryType;
  title: string;
  location?: string;
  /** IBM Plex Mono: machine timestamp */
  timestamp: string;
  severity?: Severity;
  photoUri?: string;
}

// Placeholder entries — replaced by log repository (Phase 5)
const PLACEHOLDER_ENTRIES: LogEntry[] = [
  { id: "1", type: "observation", title: "Port winch — grinding noise under load", location: "Cockpit", timestamp: "Jun 17 · 10:28", severity: "minor" },
  { id: "2", type: "note",        title: "Anchored in Lojena bay",                 location: "44.1°N 15.2°E", timestamp: "Jun 17 · 14:00" },
  { id: "3", type: "observation", title: "Navigation light flickering at speed",   location: "Bow · Port",    timestamp: "Jun 16 · 14:15", severity: "minor" },
  { id: "4", type: "note",        title: "Fuelled up at Murter marina",            location: "Murter",        timestamp: "Jun 15 · 11:30" },
  { id: "5", type: "check_in",    title: "Check-in inspection complete",           location: "Serenity",      timestamp: "Jun 15 · 09:42" },
];

const ENTRY_CFG: Record<LogEntryType, { icon: IconName; color: string; bg: string }> = {
  observation: { icon: "warning-outline",  color: T.amber, bg: T.amberL    },
  note:        { icon: "create-outline",   color: T.blue,  bg: T.blueL     },
  photo:       { icon: "camera-outline",   color: T.ink2,  bg: T.surfaceEl },
  check_in:    { icon: "checkmark-circle", color: T.green, bg: T.greenL    },
};

export default function LogScreen() {
  const navigation = useNavigation<Nav>();
  const entries = PLACEHOLDER_ENTRIES;

  const renderEntry: ListRenderItem<LogEntry> = ({ item: e, index }) => {
    const cfg = ENTRY_CFG[e.type];
    const isObs = e.type === "observation";
    const isLast = index === entries.length - 1;

    return (
      <View style={styles.entryRow}>
        <View style={styles.timelineCol}>
          <View style={[styles.dot, { backgroundColor: cfg.bg }]}>
            <Icon name={cfg.icon} size={12} color={cfg.color} />
          </View>
          {!isLast && <View style={styles.connector} />}
        </View>
        <View style={[styles.entryCard, isObs && styles.entryCardObs]}>
          {isObs && <View style={styles.keel} />}
          <View style={{ paddingLeft: isObs ? 10 : 0, flex: 1 }}>
            <Text style={styles.entryTitle} numberOfLines={2}>{e.title}</Text>
            <View style={styles.entryMeta}>
              {e.location ? <Text style={styles.entryLoc}>{e.location}</Text> : <View />}
              <Text style={styles.entryTime}>{e.timestamp}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Logbook</Text>
          <Text style={styles.headerSub}>Kornati Islands · Jun 15–22</Text>
        </View>
        <Pressable
          onPress={() => navigation.navigate("AddLog")}
          style={({ pressed }) => [styles.addBtn, pressed && { opacity: 0.8 }]}
          accessibilityRole="button"
          accessibilityLabel="Add log entry"
        >
          <Icon name="add" size={TICON.sm} color="#FFF" />
          <Text style={styles.addBtnLabel}>Log</Text>
        </Pressable>
      </View>
      <FlatList
        data={entries}
        keyExtractor={(e) => e.id}
        renderItem={renderEntry}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Icon name="create-outline" size={28} color={T.ink3} />
            </View>
            <Text style={styles.emptyTitle}>No log entries yet</Text>
            <Text style={styles.emptyBody}>
              Record observations, notes and photos as you go.
            </Text>
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
  addBtnLabel: { fontSize: 12, fontWeight: "600", color: "#FFF" },
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
  keel: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: T.blue,
  },
  entryTitle: { fontSize: 13, fontWeight: "500", color: T.ink0, lineHeight: 18 },
  entryMeta: { flexDirection: "row", justifyContent: "space-between", marginTop: 4, gap: 8 },
  entryLoc: { fontSize: 11, color: T.ink2, flex: 1 },
  entryTime: { fontSize: 10, color: T.ink3, fontFamily: T.mono },
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
