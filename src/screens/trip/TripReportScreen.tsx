import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  SafeAreaView,
  Share,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { T, TSH, TICON, spacing, touch, radius } from "../../theme";
import { Icon } from "../../components/Icon";
import type { RootStackParamList } from "../../navigation";

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, "TripReport">;

const DETAILS: [string, string, boolean?][] = [
  ["Vessel",       "Serenity · Bavaria 51 · ES-1234-MAL"],
  ["Skipper",      "Marco Rossi"],
  ["Dates",        "Jun 15–22, 2025"],
  ["Destination",  "Kornati National Park, Croatia"],
  ["Check-in",     "Jun 15 · 09:42",  true],
  ["Check-out",    "Jun 22 · 17:15",  true],
  ["Engine hours", "+15 hrs (1,204 → 1,219)", true],
  ["Fuel used",    "−18% (100% → 82%)",       true],
  ["Observations", "2 open (minor)"],
  ["Photos",       "22 captured"],
];

const OPEN_OBS = [
  { title: "Port winch — grinding noise under load", meta: "Cockpit · Minor · Jun 17 · 10:28" },
  { title: "Navigation light flickering at speed",   meta: "Bow · Port · Minor · Jun 16 · 14:15" },
];

export default function TripReportScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();

  async function handleExport() {
    try {
      await Share.share({
        title: "TROVE Trip Report · Kornati Islands",
        message:
          "TROVE Trip Report · Kornati Islands · Jun 15–22, 2025\n" +
          "Vessel: Serenity (Bavaria 51 · ES-1234-MAL)\n" +
          "Skipper: Marco Rossi\n" +
          "Engine: +15 hrs · Fuel: −18%\n" +
          "2 minor observations open.\n" +
          "Doc: MED-2025-0615-001",
      });
    } catch {
      // user cancelled
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={[styles.docCard, TSH.sh2]}>
          {/* Dark document header */}
          <View style={styles.docHeader}>
            <View style={styles.docHeaderTop}>
              <Text style={styles.docBrand}>TROVE</Text>
              <Text style={styles.docId}>MED-2025-0615-001</Text>
            </View>
            <Text style={styles.docTypeLabel}>Trip report</Text>
            <Text style={styles.docTitle}>Kornati Islands</Text>
            <Text style={styles.docSub}>Serenity · Jun 15–22, 2025 · 4 crew + 2 guests</Text>
          </View>

          <View style={styles.docBody}>
            {/* Status badge */}
            <View style={styles.statusBadge}>
              <View>
                <Text style={styles.statusTitle}>Trip complete</Text>
                <Text style={styles.statusMono}>7 nights · 96% checklist · 2 minor obs</Text>
              </View>
              <Icon name="checkmark-circle" size={TICON.xl} color={T.green} />
            </View>

            {/* Details */}
            <Text style={styles.tableLabel}>TRIP DETAILS</Text>
            {DETAILS.map(([label, value, mono]) => (
              <View key={label} style={styles.tableRow}>
                <Text style={styles.tableLabel2}>{label}</Text>
                <Text
                  style={[
                    styles.tableValue,
                    mono && { fontFamily: T.mono, fontSize: 10 },
                  ]}
                >
                  {value}
                </Text>
              </View>
            ))}

            <View style={styles.divider} />

            {/* Observations */}
            <Text style={styles.tableLabel}>OPEN OBSERVATIONS ({OPEN_OBS.length})</Text>
            {OPEN_OBS.map((obs, i) => (
              <View key={i} style={styles.obsCard}>
                <View style={styles.obsKeel} />
                <View style={{ paddingLeft: 10 }}>
                  <Text style={styles.obsTitle}>{obs.title}</Text>
                  <Text style={styles.obsMeta}>{obs.meta}</Text>
                </View>
              </View>
            ))}

            <View style={styles.divider} />

            {/* Sign-off */}
            <View style={styles.signRow}>
              <View style={styles.signAvatar}>
                <Text style={styles.signInitial}>M</Text>
              </View>
              <View>
                <Text style={styles.signName}>Signed — Marco Rossi · Skipper</Text>
                <Text style={styles.signTime}>Jun 22, 2025 · 17:15</Text>
              </View>
            </View>

            {/* Export */}
            <Pressable
              onPress={handleExport}
              style={({ pressed }) => [styles.exportBtn, pressed && { opacity: 0.85 }]}
              accessibilityRole="button"
              accessibilityLabel="Export trip report"
            >
              <Icon name="share-outline" size={TICON.md} color="#FFF" />
              <Text style={styles.exportBtnLabel}>Export / Share report</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.bg },
  scroll: { padding: spacing.m, paddingBottom: 48 },
  docCard: { backgroundColor: T.surface, borderRadius: T.r, overflow: "hidden" },
  docHeader: { backgroundColor: T.vessel, padding: 20, paddingBottom: 18 },
  docHeaderTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  docBrand: { fontSize: 14, fontWeight: "800", color: "#FFF", letterSpacing: 1.4 },
  docId: { fontSize: 10, color: "rgba(255,255,255,0.40)", fontFamily: T.mono },
  docTypeLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: T.blue,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  docTitle: { fontSize: 22, fontWeight: "700", color: "#FFF", letterSpacing: -0.5, marginBottom: 3 },
  docSub: { fontSize: 12, color: "rgba(255,255,255,0.38)" },
  docBody: { padding: 20 },
  statusBadge: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: T.greenL,
    borderRadius: T.r3,
    padding: 12,
    marginBottom: spacing.m,
  },
  statusTitle: { fontSize: 14, fontWeight: "700", color: T.ink0 },
  statusMono: { fontSize: 10, color: T.green, fontFamily: T.mono, marginTop: 2 },
  tableLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
    color: T.ink3,
    marginBottom: 8,
  },
  tableRow: {
    flexDirection: "row",
    gap: 10,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: T.rule,
  },
  tableLabel2: { fontSize: 11, color: T.ink2, width: 88, flexShrink: 0 },
  tableValue: { fontSize: 11, color: T.ink0, flex: 1 },
  divider: { height: 1, backgroundColor: T.rule, marginVertical: 16 },
  obsCard: {
    backgroundColor: T.amberL,
    borderRadius: 6,
    paddingVertical: 10,
    paddingRight: 14,
    paddingLeft: 14,
    marginBottom: 8,
    overflow: "hidden",
  },
  obsKeel: { position: "absolute", left: 0, top: 0, bottom: 0, width: 3, backgroundColor: T.amber },
  obsTitle: { fontSize: 12, fontWeight: "600", color: T.ink0 },
  obsMeta: { fontSize: 10, color: T.ink2, fontFamily: T.mono, marginTop: 2 },
  signRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: spacing.m,
  },
  signAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: T.blue,
    alignItems: "center",
    justifyContent: "center",
  },
  signInitial: { fontSize: 12, fontWeight: "700", color: "#FFF" },
  signName: { fontSize: 12, fontWeight: "600", color: T.ink0 },
  signTime: { fontSize: 9, color: T.ink2, fontFamily: T.mono, marginTop: 2 },
  exportBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: T.blue,
    borderRadius: T.r,
    paddingVertical: 14,
    minHeight: touch.min,
  },
  exportBtnLabel: { fontSize: 14, fontWeight: "600", color: "#FFF" },
});
