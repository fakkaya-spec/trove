import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { T, TSH, TICON, spacing, touch } from "../../theme";
import { Icon } from "../../components/Icon";
import type { RootStackParamList } from "../../navigation";
import type { LogEntryType, Severity } from "./LogScreen";

type Nav = NativeStackNavigationProp<RootStackParamList>;

const TYPES: { key: LogEntryType; label: string; icon: string }[] = [
  { key: "observation", label: "Observation", icon: "warning-outline" },
  { key: "note",        label: "Note",        icon: "create-outline"  },
  { key: "photo",       label: "Photo",       icon: "camera-outline"  },
];

const SEVERITIES: { key: Severity; label: string; color: string; bg: string }[] = [
  { key: "minor",    label: "Minor",    color: T.green, bg: T.greenL },
  { key: "moderate", label: "Moderate", color: T.amber, bg: T.amberL },
  { key: "serious",  label: "Serious",  color: T.red,   bg: T.redL   },
];

export default function AddLogScreen() {
  const navigation = useNavigation<Nav>();
  const [type, setType] = useState<LogEntryType>("observation");
  const [severity, setSeverity] = useState<Severity>("minor");
  const [description, setDescription] = useState("");

  function handleSave() {
    // ⚠️ EKSİK — kayıt HENÜZ KALICI DEĞİL (Faz 5): log repository +
    // sync kuyruğu bağlanana dek bu ekran görsel prototiptir. Foto kutusu da
    // no-op; gerçek çekim entitlement kapısından (log_photo) geçecek.
    navigation.goBack();
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [styles.navBtn, pressed && { opacity: 0.6 }]}
            accessibilityRole="button"
            accessibilityLabel="Cancel"
            hitSlop={8}
          >
            <Icon name="close" size={TICON.md} color={T.ink1} />
          </Pressable>
          <Text style={styles.headerTitle}>Add to log</Text>
          <Pressable
            onPress={handleSave}
            style={({ pressed }) => [styles.navBtn, styles.navBtnRight, pressed && { opacity: 0.6 }]}
            accessibilityRole="button"
            accessibilityLabel="Save log entry"
          >
            <Text style={[styles.saveLabel, !description && { color: T.ink3 }]}>Save</Text>
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Type picker */}
          <Text style={styles.sectionLabel}>TYPE</Text>
          <View style={styles.typeRow}>
            {TYPES.map((t) => {
              const on = type === t.key;
              return (
                <Pressable
                  key={t.key}
                  onPress={() => setType(t.key)}
                  style={[styles.typeBtn, on && styles.typeBtnOn]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: on }}
                >
                  <Icon name={t.icon as any} size={TICON.sm} color={on ? "#FFF" : T.ink2} />
                  <Text style={[styles.typeBtnLabel, on && styles.typeBtnLabelOn]}>
                    {t.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Camera viewfinder */}
          <Pressable
            style={styles.photoBox}
            accessibilityRole="button"
            accessibilityLabel="Add photo"
          >
            <Icon name="camera-outline" size={TICON.xl} color="rgba(255,255,255,0.22)" />
            <Text style={styles.photoHint}>Tap to capture</Text>
            <View style={styles.photoTimestampWrap}>
              <Text style={styles.photoTimestamp}>
                {new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
              </Text>
            </View>
          </Pressable>

          {/* Description */}
          <Text style={styles.sectionLabel}>DESCRIPTION</Text>
          <View style={[styles.card, styles.inputWrap]}>
            <TextInput
              style={styles.input}
              multiline
              numberOfLines={4}
              placeholder="What happened?"
              placeholderTextColor={T.ink3}
              value={description}
              onChangeText={setDescription}
              textAlignVertical="top"
            />
          </View>

          {/* Severity (observations only) */}
          {type === "observation" && (
            <>
              <Text style={styles.sectionLabel}>SEVERITY</Text>
              <View style={styles.severityRow}>
                {SEVERITIES.map((s) => {
                  const on = severity === s.key;
                  return (
                    <Pressable
                      key={s.key}
                      onPress={() => setSeverity(s.key)}
                      style={[
                        styles.severityBtn,
                        on && { borderColor: s.color, backgroundColor: s.bg },
                      ]}
                      accessibilityRole="button"
                      accessibilityState={{ selected: on }}
                    >
                      <Text style={[styles.severityLabel, on && { color: s.color }]}>
                        {s.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </>
          )}

          {/* Location row */}
          <View style={[styles.card, styles.locationRow]}>
            <Icon name="navigate-outline" size={TICON.sm} color={T.ink2} />
            <Text style={styles.locationText}>Current location</Text>
          </View>

          {/* Save */}
          <Pressable
            onPress={handleSave}
            disabled={!description}
            style={({ pressed }) => [
              styles.primaryBtn,
              !description && styles.primaryBtnDisabled,
              pressed && { opacity: 0.85 },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Save log entry"
          >
            <Text style={styles.primaryBtnLabel}>Save to logbook</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.bg },
  flex: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.s,
    paddingVertical: 6,
    backgroundColor: T.surface,
    borderBottomWidth: 1,
    borderBottomColor: T.rule,
  },
  navBtn: {
    minWidth: touch.min,
    minHeight: touch.min,
    alignItems: "flex-start",
    justifyContent: "center",
    paddingHorizontal: spacing.s,
  },
  navBtnRight: { alignItems: "flex-end" },
  headerTitle: { fontSize: 15, fontWeight: "700", color: T.ink0 },
  saveLabel: { fontSize: 15, fontWeight: "600", color: T.blue },
  scroll: { padding: spacing.m, paddingBottom: 48 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    color: T.ink2,
    marginBottom: 8,
    marginTop: spacing.m,
  },
  typeRow: { flexDirection: "row", gap: 6, marginBottom: 0 },
  typeBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 11,
    borderRadius: T.r3,
    backgroundColor: T.surfaceEl,
    minHeight: touch.min,
  },
  typeBtnOn: { backgroundColor: T.ink0 },
  typeBtnLabel: { fontSize: 12, fontWeight: "600", color: T.ink2 },
  typeBtnLabelOn: { color: "#FFF" },
  photoBox: {
    height: 160,
    backgroundColor: T.vessel,
    borderRadius: T.r,
    marginTop: spacing.m,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  photoHint: { fontSize: 12, color: "rgba(255,255,255,0.34)", marginTop: 6 },
  photoTimestampWrap: { position: "absolute", bottom: 8, right: 12 },
  photoTimestamp: {
    fontSize: 9,
    color: "rgba(255,255,255,0.28)",
    fontFamily: T.mono,
  },
  card: {
    backgroundColor: T.surface,
    borderRadius: T.r2,
    borderWidth: 1,
    borderColor: T.rule,
    ...TSH.sh0,
  },
  inputWrap: { padding: 12 },
  input: {
    fontSize: 14,
    color: T.ink0,
    lineHeight: 20,
    minHeight: 96,
  },
  severityRow: { flexDirection: "row", gap: 6 },
  severityBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: T.r2,
    borderWidth: 1.5,
    borderColor: T.rule,
    backgroundColor: T.surface,
    alignItems: "center",
    justifyContent: "center",
    minHeight: touch.min,
  },
  severityLabel: { fontSize: 12, fontWeight: "600", color: T.ink2 },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    marginTop: spacing.m,
  },
  locationText: { fontSize: 13, color: T.ink1 },
  primaryBtn: {
    backgroundColor: T.blue,
    borderRadius: T.r,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    minHeight: touch.min,
    marginTop: spacing.l,
  },
  primaryBtnDisabled: { backgroundColor: T.surfaceEl },
  primaryBtnLabel: { fontSize: 14, fontWeight: "600", color: "#FFF" },
});
