import React, { useEffect, useRef, useState } from "react";
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
  Alert,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { T, TSH, TICON, spacing, touch } from "../../theme";
import { LIcon, type LIconName } from "../../components/LIcon";
import { currentTrip } from "../../repositories/trips";
import { addLogMedia, createLogEntry } from "../../repositories/log";
import { deriveTitle, LogEntryType, LogSeverity } from "../../domain/log";
import { capturePhoto, resolveMediaUri } from "../../media/photos";
import { useEntitlement } from "../../entitlement";
import { useLocale } from "../../i18n";
import { LOG_STRINGS, typeLabel } from "../../i18n/log";
import type { RootStackParamList } from "../../navigation";

type Nav = NativeStackNavigationProp<RootStackParamList>;

// AddLog — gerçek kayıt oluşturur (Faz 5). KİLİTLİ kurallar:
//  - Metin kaydı HERKESE açık; yalnız foto çekimi entitlement kapısından
//    (log_photo) geçer. Paywall modal olarak üste açılır; yazılan metin
//    ekran state'inde KORUNUR — satın alma sonrası aynı akışa dönülür.
//  - Kayıt yerel-önce yazılır (SQLite + sync kuyruğu); ağ beklenmez.

const TYPE_OPTIONS: { key: LogEntryType; icon: LIconName }[] = [
  { key: "observation", icon: "alert-triangle" },
  { key: "note", icon: "pencil" },
  { key: "photo", icon: "camera" },
];

export default function AddLogScreen() {
  const navigation = useNavigation<Nav>();
  const { locale } = useLocale();
  const s = LOG_STRINGS[locale];
  const { requestAccess } = useEntitlement();

  const [type, setType] = useState<LogEntryType>("observation");
  const [severity, setSeverity] = useState<LogSeverity>("minor");
  const [description, setDescription] = useState("");
  const [place, setPlace] = useState("");
  const [photoKey, setPhotoKey] = useState<string | null>(null);
  const savedRef = useRef(false);

  const severityOptions: { key: LogSeverity; label: string; color: string; bg: string }[] = [
    { key: "minor", label: s.sev_minor, color: T.green, bg: T.greenL },
    { key: "moderate", label: s.sev_moderate, color: T.amber, bg: T.amberL },
    { key: "serious", label: s.sev_serious, color: T.red, bg: T.redL },
  ];

  const dirty = description.trim().length > 0 || photoKey !== null;

  // Taslak koruması: geri/iptal (Android donanım geri dahil) kirli taslakta
  // önce sorar; kayıt sonrası serbest bırakır.
  useEffect(() => {
    const sub = navigation.addListener("beforeRemove", (e) => {
      if (!dirty || savedRef.current) return;
      e.preventDefault();
      Alert.alert(s.discardTitle, s.discardBody, [
        { text: s.keepEditing, style: "cancel" },
        {
          text: s.discardConfirm,
          style: "destructive",
          onPress: () => navigation.dispatch(e.data.action),
        },
      ]);
    });
    return sub;
  }, [navigation, dirty, s]);

  async function onPhoto() {
    // KİLİTLİ kapı: foto = Premium (bağlam log_photo). Yetki yoksa paywall
    // açılır; bu ekran ve yazılmış metin altta aynen durur.
    if (!(await requestAccess("log_photo"))) return;
    const key = await capturePhoto();
    if (key) setPhotoKey(key);
  }

  function handleSave() {
    const trip = currentTrip();
    if (!trip || !description.trim()) return;
    const entry = createLogEntry({
      tripId: trip.id,
      vesselId: trip.boatId,
      type,
      title: deriveTitle(description),
      description: description.trim(),
      place: place.trim() || undefined,
      severity: type === "observation" ? severity : undefined,
    });
    if (photoKey) addLogMedia(entry.id, photoKey);
    savedRef.current = true;
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
            accessibilityLabel={s.discardTitle}
            hitSlop={8}
          >
            <LIcon name="x" size={TICON.md} color={T.ink1} />
          </Pressable>
          <Text style={styles.headerTitle}>{s.addTitle}</Text>
          <Pressable
            onPress={handleSave}
            disabled={!description.trim()}
            style={({ pressed }) => [styles.navBtn, styles.navBtnRight, pressed && { opacity: 0.6 }]}
            accessibilityRole="button"
            accessibilityLabel={s.save}
            accessibilityState={{ disabled: !description.trim() }}
          >
            <Text style={[styles.saveLabel, !description.trim() && { color: T.ink3 }]}>
              {s.addCta}
            </Text>
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Tür seçici */}
          <Text style={styles.sectionLabel}>{s.typeLabel.toUpperCase()}</Text>
          <View style={styles.typeRow}>
            {TYPE_OPTIONS.map((t) => {
              const on = type === t.key;
              return (
                <Pressable
                  key={t.key}
                  onPress={() => setType(t.key)}
                  style={[styles.typeBtn, on && styles.typeBtnOn]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: on }}
                  accessibilityLabel={typeLabel(s, t.key)}
                >
                  <LIcon name={t.icon} size={TICON.sm} color={on ? "#FFFFFF" : T.ink2} />
                  <Text style={[styles.typeBtnLabel, on && styles.typeBtnLabelOn]}>
                    {typeLabel(s, t.key)}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Foto — Premium kapılı (log_photo); metin kaydı asla engellenmez */}
          <Pressable
            onPress={onPhoto}
            style={styles.photoBox}
            accessibilityRole="button"
            accessibilityLabel={photoKey ? s.photoAttached : s.tapToCapture}
          >
            {photoKey ? (
              <>
                <Image
                  source={{ uri: resolveMediaUri(photoKey) }}
                  style={StyleSheet.absoluteFill}
                  resizeMode="cover"
                />
                <View style={styles.photoBadge}>
                  <LIcon name="check" size={10} color="#FFFFFF" />
                  <Text style={styles.photoBadgeText}>{s.photoAttached}</Text>
                </View>
              </>
            ) : (
              <>
                <LIcon name="camera" size={TICON.xl} color="rgba(255,255,255,0.22)" />
                <Text style={styles.photoHint}>{s.tapToCapture}</Text>
              </>
            )}
          </Pressable>

          {/* Açıklama */}
          <Text style={styles.sectionLabel}>{s.descriptionLabel.toUpperCase()}</Text>
          <View style={[styles.card, styles.inputWrap]}>
            <TextInput
              style={styles.input}
              multiline
              numberOfLines={4}
              placeholder={s.descriptionPlaceholder}
              placeholderTextColor={T.ink3}
              value={description}
              onChangeText={setDescription}
              textAlignVertical="top"
            />
          </View>

          {/* Önem (yalnız gözlem) */}
          {type === "observation" && (
            <>
              <Text style={styles.sectionLabel}>{s.severityLabel.toUpperCase()}</Text>
              <View style={styles.severityRow}>
                {severityOptions.map((o) => {
                  const on = severity === o.key;
                  return (
                    <Pressable
                      key={o.key}
                      onPress={() => setSeverity(o.key)}
                      style={[
                        styles.severityBtn,
                        on && { borderColor: o.color, backgroundColor: o.bg },
                      ]}
                      accessibilityRole="button"
                      accessibilityState={{ selected: on }}
                      accessibilityLabel={o.label}
                    >
                      <Text style={[styles.severityLabel, on && { color: o.color }]}>
                        {o.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </>
          )}

          {/* Yer (isteğe bağlı) */}
          <View style={[styles.card, styles.locationRow]}>
            <LIcon name="map-pin" size={TICON.sm} color={T.ink2} />
            <TextInput
              style={styles.locationInput}
              placeholder={s.placePlaceholder}
              placeholderTextColor={T.ink3}
              value={place}
              onChangeText={setPlace}
              returnKeyType="done"
            />
          </View>

          {/* Kaydet */}
          <Pressable
            onPress={handleSave}
            disabled={!description.trim()}
            style={({ pressed }) => [
              styles.primaryBtn,
              !description.trim() && styles.primaryBtnDisabled,
              pressed && { opacity: 0.85 },
            ]}
            accessibilityRole="button"
            accessibilityLabel={s.save}
            accessibilityState={{ disabled: !description.trim() }}
          >
            <Text
              style={[styles.primaryBtnLabel, !description.trim() && { color: T.ink3 }]}
            >
              {s.save}
            </Text>
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
  typeBtnLabelOn: { color: "#FFFFFF" },
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
  photoBadge: {
    position: "absolute",
    bottom: 8,
    left: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  photoBadgeText: { fontSize: 10, fontWeight: "600", color: "#FFFFFF" },
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
    paddingHorizontal: 12,
    marginTop: spacing.m,
    minHeight: touch.min,
  },
  locationInput: { flex: 1, fontSize: 13, color: T.ink0, paddingVertical: 10 },
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
  primaryBtnLabel: { fontSize: 14, fontWeight: "600", color: "#FFFFFF" },
});
