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
type Route = RouteProp<RootStackParamList, "Crew">;

const SAMPLE_CREW = [
  { id: "1", name: "Marco Rossi",   role: "Skipper",    initial: "M", you: true  },
  { id: "2", name: "Lucia Moretti", role: "First mate", initial: "L", you: false },
  { id: "3", name: "Tom Andersson", role: "Crew",       initial: "T", you: false },
  { id: "4", name: "Sara Kim",      role: "Crew",       initial: "S", you: false },
];

const SAMPLE_GUESTS = [
  { id: "1", name: "James Peterson",  note: "Dietary: none"       },
  { id: "2", name: "Claire Peterson", note: "Dietary: vegetarian" },
];

export default function CrewScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionLabel}>CREW</Text>
        {SAMPLE_CREW.map((c) => (
          <View key={c.id} style={styles.card}>
            <View style={[styles.avatar, c.you && styles.avatarYou]}>
              <Text style={[styles.avatarText, c.you && styles.avatarTextYou]}>{c.initial}</Text>
            </View>
            <View style={styles.cardBody}>
              <View style={styles.nameRow}>
                <Text style={styles.name}>{c.name}</Text>
                {c.you && <View style={styles.youTag}><Text style={styles.youTagText}>You</Text></View>}
              </View>
              <Text style={styles.role}>{c.role}</Text>
            </View>
            <Pressable
              style={({ pressed }) => [styles.editBtn, pressed && { opacity: 0.7 }]}
              accessibilityRole="button"
              accessibilityLabel={`Edit ${c.name}`}
            >
              <Text style={styles.editBtnLabel}>Edit</Text>
            </Pressable>
          </View>
        ))}
        <Pressable
          style={({ pressed }) => [styles.addRow, pressed && { opacity: 0.7 }]}
          accessibilityRole="button"
          accessibilityLabel="Invite crew member"
        >
          <View style={styles.addIcon}>
            <Icon name="add" size={TICON.md} color={T.blue} />
          </View>
          <Text style={styles.addLabel}>Invite crew member</Text>
        </Pressable>

        <Text style={[styles.sectionLabel, { marginTop: spacing.l }]}>GUESTS</Text>
        {SAMPLE_GUESTS.map((g) => (
          <View key={g.id} style={styles.card}>
            <View style={styles.avatar}>
              <Icon name="person-outline" size={TICON.sm} color={T.ink3} />
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.name}>{g.name}</Text>
              <Text style={styles.role}>{g.note}</Text>
            </View>
          </View>
        ))}
        <Pressable
          style={({ pressed }) => [styles.addRow, pressed && { opacity: 0.7 }]}
          accessibilityRole="button"
          accessibilityLabel="Add guest"
        >
          <View style={styles.addIcon}>
            <Icon name="add" size={TICON.md} color={T.blue} />
          </View>
          <Text style={styles.addLabel}>Add guest</Text>
        </Pressable>

        <View style={styles.note}>
          <Icon name="information-circle-outline" size={TICON.sm} color={T.ink2} />
          <Text style={styles.noteText}>
            Guests are counted in provisioning calculations but do not have TROVE access unless invited as crew.
          </Text>
        </View>
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
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: T.surface,
    borderRadius: T.r2,
    borderWidth: 1,
    borderColor: T.rule,
    padding: 12,
    marginBottom: 6,
    gap: 12,
    ...TSH.sh0,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: T.surfaceEl,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  avatarYou: { backgroundColor: T.blue },
  avatarText: { fontSize: 13, fontWeight: "700", color: T.ink2 },
  avatarTextYou: { color: "#FFF" },
  cardBody: { flex: 1 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  name: { fontSize: 13, fontWeight: "600", color: T.ink0 },
  youTag: {
    backgroundColor: T.blueL,
    borderRadius: 99,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  youTagText: { fontSize: 10, fontWeight: "700", color: T.blue },
  role: { fontSize: 11, color: T.ink2, marginTop: 2 },
  editBtn: {
    backgroundColor: T.surfaceEl,
    borderRadius: T.r3,
    paddingHorizontal: 10,
    paddingVertical: 6,
    minHeight: 36,
    justifyContent: "center",
  },
  editBtnLabel: { fontSize: 10, fontWeight: "600", color: T.ink2 },
  addRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 4,
    minHeight: touch.min,
  },
  addIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: T.blueL,
    alignItems: "center",
    justifyContent: "center",
  },
  addLabel: { fontSize: 13, fontWeight: "600", color: T.blue },
  note: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: T.surfaceEl,
    borderRadius: T.r,
    padding: 12,
    marginTop: spacing.m,
  },
  noteText: { flex: 1, fontSize: 12, color: T.ink2, lineHeight: 17 },
});
