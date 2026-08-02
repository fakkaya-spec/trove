import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  SafeAreaView,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { T, TSH, TICON, spacing, touch, radius } from "../../theme";
import { Icon } from "../../components/Icon";
import type { RootStackParamList } from "../../navigation";

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, "Underway">;

const OBSERVATIONS = [
  { title: "Port winch — grinding noise under load", loc: "Cockpit · Minor", time: "Jun 17 · 10:28" },
  { title: "Navigation light flickering at speed",   loc: "Bow · Minor",    time: "Jun 17 · 14:15" },
];

const CREW = [
  { initial: "M", name: "Marco",  guest: false },
  { initial: "L", name: "Lucia",  guest: false },
  { initial: "T", name: "Tom",    guest: false },
  { initial: "S", name: "Sara",   guest: false },
  { initial: "J", name: "James",  guest: true  },
  { initial: "C", name: "Claire", guest: true  },
];

const WEATHER = [
  { icon: "sunny-outline",       val: "27°C",  label: "Air"  },
  { icon: "thunderstorm-outline", val: "NE 12", label: "Wind" },
  { icon: "water-outline",       val: "24°C",  label: "Sea"  },
] as const;

export default function UnderwayScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Dark hero */}
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <Text style={styles.brand}>TROVE</Text>
            <View style={styles.dayPill}>
              <Text style={styles.dayPillLabel}>Day 3 of 7</Text>
            </View>
          </View>
          <Text style={styles.heroTitle}>Kornati National Park</Text>
          <Text style={styles.heroSub}>Serenity · 4 crew · 2 guests</Text>
          <View style={styles.weatherRow}>
            {WEATHER.map(({ icon, val, label }) => (
              <View key={label} style={styles.weatherItem}>
                <Icon name={icon} size={TICON.sm} color="rgba(255,255,255,0.36)" />
                <View>
                  <Text style={styles.weatherVal}>{val}</Text>
                  <Text style={styles.weatherLabel}>{label}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.body}>
          {/* Quick log */}
          <Pressable
            onPress={() => navigation.navigate("AddLog")}
            style={({ pressed }) => [styles.logBtn, pressed && { opacity: 0.85 }]}
            accessibilityRole="button"
            accessibilityLabel="Log something"
          >
            <View style={styles.logBtnIcon}>
              <Icon name="add" size={TICON.md} color={T.blue} />
            </View>
            <View>
              <Text style={styles.logBtnTitle}>Log something</Text>
              <Text style={styles.logBtnSub}>Observation · note · photo · issue</Text>
            </View>
          </Pressable>

          {/* Open observations */}
          {OBSERVATIONS.length > 0 && (
            <>
              <Text style={styles.sectionLabel}>OPEN OBSERVATIONS</Text>
              {OBSERVATIONS.map((obs, i) => (
                <View key={i} style={styles.obsCard}>
                  <View style={styles.obsKeel} />
                  <View style={{ paddingLeft: 10, flex: 1 }}>
                    <Text style={styles.obsTitle} numberOfLines={2}>{obs.title}</Text>
                    <View style={styles.obsMeta}>
                      <Text style={styles.obsLoc}>{obs.loc}</Text>
                      <Text style={styles.obsTime}>{obs.time}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </>
          )}

          <View style={styles.divider} />

          {/* Crew */}
          <Text style={styles.sectionLabel}>ON BOARD</Text>
          <View style={styles.crewRow}>
            {CREW.map((p, i) => (
              <View key={i} style={styles.crewItem}>
                <View style={[styles.crewAvatar, p.guest && styles.crewAvatarGuest]}>
                  <Text style={[styles.crewInitial, p.guest && styles.crewInitialGuest]}>
                    {p.initial}
                  </Text>
                </View>
                <Text style={styles.crewName}>{p.name}</Text>
              </View>
            ))}
          </View>

          <View style={styles.divider} />

          {/* End trip */}
          <Pressable
            onPress={() => navigation.navigate("Checkout", { tripId: route.params.tripId })}
            style={({ pressed }) => [styles.endBtn, pressed && { opacity: 0.85 }]}
            accessibilityRole="button"
            accessibilityLabel="End the trip"
          >
            <Text style={styles.endBtnLabel}>Ready to end the trip?</Text>
            <Icon name="arrow-forward" size={TICON.sm} color="rgba(255,255,255,0.44)" />
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.bg },
  scroll: { paddingBottom: 48 },
  hero: { backgroundColor: T.vessel, padding: spacing.m, paddingBottom: 24 },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  brand: { fontSize: 15, fontWeight: "800", color: "rgba(255,255,255,0.90)", letterSpacing: 1.5 },
  dayPill: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  dayPillLabel: { fontSize: 11, fontWeight: "600", color: "rgba(255,255,255,0.70)" },
  heroTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFF",
    letterSpacing: -0.7,
    lineHeight: 33,
    marginBottom: 4,
  },
  heroSub: { fontSize: 13, color: "rgba(255,255,255,0.44)", marginBottom: 20 },
  weatherRow: { flexDirection: "row", gap: 20 },
  weatherItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  weatherVal: { fontSize: 12, fontWeight: "600", color: "rgba(255,255,255,0.80)" },
  weatherLabel: { fontSize: 9, color: "rgba(255,255,255,0.30)" },
  body: { padding: spacing.m },
  logBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: T.surface,
    borderRadius: T.r,
    borderWidth: 1,
    borderColor: T.rule,
    padding: 14,
    marginBottom: spacing.m,
    ...TSH.sh1,
  },
  logBtnIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: T.blueL,
    alignItems: "center",
    justifyContent: "center",
  },
  logBtnTitle: { fontSize: 14, fontWeight: "600", color: T.ink0, marginBottom: 2 },
  logBtnSub: { fontSize: 12, color: T.ink2 },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
    color: T.ink3,
    marginBottom: 8,
  },
  obsCard: {
    backgroundColor: T.surface,
    borderRadius: T.r2,
    borderWidth: 1,
    borderColor: "rgba(201,106,0,0.20)",
    paddingHorizontal: 12,
    paddingVertical: 11,
    marginBottom: 6,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    ...TSH.sh0,
  },
  obsKeel: { position: "absolute", left: 0, top: 0, bottom: 0, width: 2, backgroundColor: T.blue },
  obsTitle: { fontSize: 13, fontWeight: "500", color: T.ink0, lineHeight: 18 },
  obsMeta: { flexDirection: "row", justifyContent: "space-between", marginTop: 4 },
  obsLoc: { fontSize: 11, color: T.ink2, flex: 1 },
  obsTime: { fontSize: 10, color: T.ink3, fontFamily: T.mono },
  divider: { height: 1, backgroundColor: T.rule, marginVertical: 20 },
  crewRow: { flexDirection: "row", gap: 14, flexWrap: "wrap" },
  crewItem: { alignItems: "center", gap: 4 },
  crewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: T.surfaceEl,
    alignItems: "center",
    justifyContent: "center",
  },
  crewAvatarGuest: { backgroundColor: T.blueL },
  crewInitial: { fontSize: 14, fontWeight: "700", color: T.ink1 },
  crewInitialGuest: { color: T.blue },
  crewName: { fontSize: 9, color: T.ink2 },
  endBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: T.ink0,
    borderRadius: T.r,
    padding: 14,
    minHeight: touch.min,
  },
  endBtnLabel: { fontSize: 14, fontWeight: "600", color: "#FFF" },
});
