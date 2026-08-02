import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Image, SafeAreaView } from "react-native";
import { useNavigation, type CompositeNavigationProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { T, TSH, TICON } from "../theme";
import { LIcon, type LIconName } from "../components/LIcon";
import { TroveMark } from "../components/brand/TroveMark";
import { TroveWordmark } from "../components/brand/TroveWordmark";
import { listSampleTrips } from "../repositories/trips";
import { isDbReady } from "../db/state";
import { useLocale } from "../i18n";
import { TRIP_STRINGS } from "../i18n/trip";
import type { RootStackParamList, TabParamList } from "../navigation";

type Nav = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, "TripTab">,
  NativeStackNavigationProp<RootStackParamList>
>;

// İlk açılış karşılama ekranı — KİLİTLİ ürün şartı + onaylı tasarım
// (design-reference App.full.tsx WelcomeScreen). Gerçek tekne yokken Trip
// sekmesinin içeriği budur; örnekler keşfe açılır, gerçek veriye karışmaz.

const SAMPLE_META: Record<
  string,
  { photo: ReturnType<typeof require>; icon: LIconName; label: string }
> = {
  "smp-trip-kornati": {
    photo: require("../../assets/samples/serenity.jpg"),
    icon: "sailboat",
    label: "7-day Croatia charter",
  },
  "smp-trip-amalfi": {
    photo: require("../../assets/samples/aurora.jpg"),
    icon: "anchor",
    label: "Weekend family trip",
  },
  "smp-trip-cotedazur": {
    photo: require("../../assets/samples/nomad.jpg"),
    icon: "waves",
    label: "Day cruise",
  },
};

const SAMPLE_TYPE: Record<string, string> = {
  "smp-trip-kornati": "Bavaria 51 · 15.4 m",
  "smp-trip-amalfi": "Azimut 48 · 14.8 m",
  "smp-trip-cotedazur": "Jeanneau 40 · 11.9 m",
};

const SAMPLE_BOAT_NAME: Record<string, string> = {
  "smp-trip-kornati": "Serenity",
  "smp-trip-amalfi": "Aurora",
  "smp-trip-cotedazur": "Nomad",
};

export default function WelcomeScreen() {
  const navigation = useNavigation<Nav>();
  const { locale } = useLocale();
  const s = TRIP_STRINGS[locale];
  const samples = isDbReady() ? listSampleTrips() : [];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Koyu hero */}
        <View style={styles.hero}>
          <View style={styles.brandRow}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <TroveMark size={20} color="#FFFFFF" />
              <TroveWordmark height={12} color="#FFFFFF" />
            </View>
            <View style={styles.userCircle}>
              <LIcon name="user" size={TICON.sm} color="rgba(255,255,255,0.40)" />
            </View>
          </View>
          <View style={styles.accent} />
          <Text style={styles.heroTitle}>{s.welcomeTitle}</Text>
          <Text style={styles.heroBody}>{s.welcomeBody}</Text>
        </View>

        <View style={{ paddingHorizontal: 16, paddingTop: 24 }}>
          {/* YOUR BOATS */}
          <Text style={styles.overline}>{s.yourBoats.toUpperCase()}</Text>
          <Pressable
            onPress={() => navigation.navigate("VesselTab")}
            accessibilityRole="button"
            accessibilityLabel={s.addFirstBoat}
            style={({ pressed }) => [styles.addCard, pressed && { opacity: 0.8 }]}
          >
            <View style={styles.addCircle}>
              <LIcon name="plus" size={TICON.md} color={T.blue} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.addTitle}>{s.addFirstBoat}</Text>
              <Text style={styles.addSub}>{s.addFirstBoatSub}</Text>
            </View>
          </Pressable>

          {/* EXPLORE TROVE */}
          <Text style={styles.overline}>{s.exploreTrove.toUpperCase()}</Text>
          <Text style={styles.exploreBody}>{s.exploreTroveBody}</Text>

          {samples.map((trip) => {
            const meta = SAMPLE_META[trip.id];
            if (!meta) return null;
            return (
              <Pressable
                key={trip.id}
                onPress={() => navigation.navigate("TripDetail", { tripId: trip.id })}
                accessibilityRole="button"
                accessibilityLabel={SAMPLE_BOAT_NAME[trip.id]}
                style={({ pressed }) => [styles.sampleCard, pressed && { opacity: 0.85 }]}
              >
                <View style={styles.samplePhotoWrap}>
                  <Image source={meta.photo} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
                  <View style={styles.sampleBadge}>
                    <LIcon name={meta.icon} size={9} color="rgba(255,255,255,0.70)" />
                  </View>
                </View>
                <View style={styles.sampleContent}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <Text style={styles.sampleName}>{SAMPLE_BOAT_NAME[trip.id]}</Text>
                    <LIcon name="chevron-right" size={TICON.sm} color={T.ink3} style={{ marginTop: 2 }} />
                  </View>
                  <Text style={styles.sampleType}>{SAMPLE_TYPE[trip.id]}</Text>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6 }}>
                    <View style={styles.sampleChip}>
                      <Text style={styles.sampleChipText}>{meta.label}</Text>
                    </View>
                    <Text style={styles.sampleDest} numberOfLines={1}>
                      {trip.destination}
                    </Text>
                  </View>
                </View>
              </Pressable>
            );
          })}

          <Text style={styles.footNote}>{s.sampleNote}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.bg },
  hero: { backgroundColor: T.vessel, paddingHorizontal: 24, paddingTop: 12, paddingBottom: 32 },
  brandRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 36,
  },
  userCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.07)",
    alignItems: "center",
    justifyContent: "center",
  },
  accent: { width: 36, height: 2, backgroundColor: T.blue, borderRadius: 99, marginBottom: 18 },
  heroTitle: {
    fontSize: 30,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.8,
    lineHeight: 33,
    marginBottom: 12,
  },
  heroBody: { fontSize: 14, color: "rgba(255,255,255,0.44)", lineHeight: 22, maxWidth: 280 },
  overline: {
    fontSize: 10,
    fontWeight: "700",
    color: T.ink3,
    letterSpacing: 0.55,
    marginBottom: 10,
  },
  addCard: {
    backgroundColor: T.surface,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: T.ruleStr,
    borderRadius: T.r,
    paddingVertical: 20,
    paddingHorizontal: 18,
    marginBottom: 28,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  addCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: T.blueL,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "rgba(0,95,204,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  addTitle: { fontSize: 14, fontWeight: "600", color: T.blue, marginBottom: 2 },
  addSub: { fontSize: 12, color: T.ink3 },
  exploreBody: { fontSize: 12, color: T.ink2, marginBottom: 14, lineHeight: 18 },
  sampleCard: {
    backgroundColor: T.surface,
    borderRadius: T.r,
    borderWidth: 1,
    borderColor: T.rule,
    marginBottom: 10,
    flexDirection: "row",
    overflow: "hidden",
    ...TSH.sh1,
  },
  samplePhotoWrap: { width: 88, height: 88, flexShrink: 0 },
  sampleBadge: {
    position: "absolute",
    bottom: 7,
    left: 7,
    backgroundColor: "rgba(9,12,24,0.72)",
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  sampleContent: { flex: 1, paddingVertical: 14, paddingLeft: 16, paddingRight: 14, justifyContent: "center" },
  sampleName: { fontSize: 15, fontWeight: "700", color: T.ink0, letterSpacing: -0.3 },
  sampleType: { fontSize: 11, color: T.ink2, marginTop: 2 },
  sampleChip: {
    backgroundColor: T.blueL,
    borderRadius: 5,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  sampleChipText: { fontSize: 10, fontWeight: "700", color: T.blue },
  sampleDest: { fontSize: 10, color: T.ink3, flexShrink: 1 },
  footNote: {
    fontSize: 11,
    color: T.ink3,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 18,
  },
});
