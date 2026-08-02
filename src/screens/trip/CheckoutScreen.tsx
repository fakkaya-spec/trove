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
type Route = RouteProp<RootStackParamList, "Checkout">;

const COMPARISON = [
  { label: "Hull condition",   inn: "Excellent", out: "Good",     delta: "Minor scuff — starboard bow", measured: false },
  { label: "Engine hours",     inn: "1,204 h",   out: "1,219 h",  delta: "+15 hrs",                    measured: true  },
  { label: "Fuel level",       inn: "100%",      out: "82%",      delta: "−18%",                       measured: true  },
  { label: "Water tank",       inn: "Full",      out: "Full",     delta: null,                         measured: false },
  { label: "Safety equipment", inn: "Complete",  out: "Complete", delta: null,                         measured: false },
  { label: "Cleanliness",      inn: "A+",        out: "B+",       delta: "Light cleaning required",    measured: false },
];

export default function CheckoutScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { tripId } = route.params;

  const steps = [
    {
      label: "Check-out inspection",
      sub: "6 of 14 items",
      done: false,
      onPress: () => navigation.navigate("Inspect", { inspectionId: tripId }),
    },
    {
      label: "Handover comparison",
      sub: "Ready to review",
      done: false,
      onPress: () => navigation.navigate("HandoverReview", { tripId }),
    },
    {
      label: "Sign & generate report",
      sub: "After handover",
      done: false,
      onPress: () => navigation.navigate("TripReport", { tripId }),
    },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Steps */}
        <Text style={styles.sectionLabel}>STEPS</Text>
        {steps.map((s, i) => (
          <Pressable
            key={i}
            onPress={s.onPress}
            style={({ pressed }) => [styles.stepCard, pressed && { opacity: 0.85 }]}
            accessibilityRole="button"
          >
            <View style={[styles.stepCheck, s.done && styles.stepCheckDone]}>
              {s.done && <Icon name="checkmark" size={10} color="#FFF" />}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.stepLabel}>{s.label}</Text>
              <Text style={styles.stepSub}>{s.sub}</Text>
            </View>
            <Icon name="chevron-forward" size={TICON.sm} color={T.ink3} />
          </Pressable>
        ))}

        <View style={styles.divider} />

        {/* Check-in vs Check-out */}
        <Text style={styles.sectionLabel}>CHECK-IN VS CHECK-OUT</Text>
        <View style={styles.compHeader}>
          <View style={{ flex: 1 }} />
          <View style={[styles.compHeaderCell, { backgroundColor: T.greenL }]}>
            <Text style={[styles.compHeaderLabel, { color: T.green }]}>Check-in</Text>
          </View>
          <View style={[styles.compHeaderCell, { backgroundColor: T.blueL }]}>
            <Text style={[styles.compHeaderLabel, { color: T.blue }]}>Check-out</Text>
          </View>
        </View>
        {COMPARISON.map((row, i) => {
          const hasDelta = !!row.delta;
          return (
            <View key={i} style={[styles.compRow, hasDelta && styles.compRowDelta]}>
              {hasDelta && <View style={styles.keel} />}
              <View style={{ paddingLeft: hasDelta ? 10 : 0, flex: 1 }}>
                <Text style={styles.compRowLabel}>{row.label}</Text>
                <View style={styles.compCells}>
                  <View style={[styles.compCell, { backgroundColor: T.greenL }]}>
                    <Text
                      style={[
                        styles.compCellVal,
                        { color: T.green, fontFamily: row.measured ? T.mono : undefined },
                      ]}
                    >
                      {row.inn}
                    </Text>
                  </View>
                  <View style={[styles.compCell, { backgroundColor: hasDelta ? T.amberL : T.blueL }]}>
                    <Text
                      style={[
                        styles.compCellVal,
                        { color: hasDelta ? T.amber : T.blue, fontFamily: row.measured ? T.mono : undefined },
                      ]}
                    >
                      {row.out}
                    </Text>
                  </View>
                </View>
                {hasDelta && <Text style={styles.compDelta}>△ {row.delta}</Text>}
              </View>
            </View>
          );
        })}

        <View style={styles.divider} />

        <Pressable
          onPress={() => navigation.navigate("TripReport", { tripId })}
          style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.85 }]}
          accessibilityRole="button"
          accessibilityLabel="Sign off and generate report"
        >
          <Text style={styles.primaryBtnLabel}>Sign off & generate report</Text>
          <Icon name="arrow-forward" size={TICON.sm} color="#FFF" />
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.bg },
  scroll: { padding: spacing.m, paddingBottom: 48 },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
    color: T.ink3,
    marginBottom: 8,
  },
  stepCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: T.surface,
    borderRadius: T.r,
    borderWidth: 1,
    borderColor: T.rule,
    padding: 14,
    marginBottom: 8,
    ...TSH.sh0,
  },
  stepCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: T.ruleStr,
    alignItems: "center",
    justifyContent: "center",
  },
  stepCheckDone: { backgroundColor: T.green, borderColor: T.green },
  stepLabel: { fontSize: 13, fontWeight: "600", color: T.ink0 },
  stepSub: { fontSize: 11, color: T.ink2, marginTop: 2 },
  divider: { height: 1, backgroundColor: T.rule, marginVertical: 20 },
  compHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 },
  compHeaderCell: { flex: 1, borderRadius: T.r3, paddingVertical: 5, alignItems: "center" },
  compHeaderLabel: { fontSize: 9, fontWeight: "700" },
  compRow: {
    backgroundColor: T.surface,
    borderRadius: T.r2,
    borderWidth: 1,
    borderColor: T.rule,
    padding: 10,
    marginBottom: 5,
    overflow: "hidden",
  },
  compRowDelta: { borderColor: "rgba(201,106,0,0.18)" },
  keel: { position: "absolute", left: 0, top: 0, bottom: 0, width: 2, backgroundColor: T.blue },
  compRowLabel: { fontSize: 10, color: T.ink2, marginBottom: 6 },
  compCells: { flexDirection: "row", gap: 6 },
  compCell: { flex: 1, borderRadius: T.r3, paddingVertical: 5, alignItems: "center" },
  compCellVal: { fontSize: 11, fontWeight: "600" },
  compDelta: { fontSize: 10, color: T.amber, marginTop: 5, fontWeight: "500" },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: T.blue,
    borderRadius: T.r,
    paddingVertical: 15,
    minHeight: touch.min,
  },
  primaryBtnLabel: { fontSize: 14, fontWeight: "600", color: "#FFF" },
});
