import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  SafeAreaView,
  TextInput,
  Switch,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { createVessel, listVessels, VesselRow } from "../../repositories/vessels";
import { createTrip } from "../../repositories/trips";
import { generatePlan } from "../../repositories/provisioning";
import {
  BoatType,
  ClimateProfile,
  DEFAULT_TRIP_PROFILE,
  MooringProfile,
  OwnershipContext,
  ProvisioningStyle,
  ShopAccess,
  TripType,
} from "../../domain/types";
import { nightsBetween } from "../../domain/trip";
import { CalendarSheet } from "../../components/trove/CalendarSheet";
import { T, TSH, TICON, touch } from "../../theme";
import { LIcon } from "../../components/LIcon";
import { useLocale } from "../../i18n";
import { TRIP_STRINGS, TripStrings } from "../../i18n/trip";
import { boatTypeLabel, INSPECTION_STRINGS } from "../../i18n/inspection";
import { VESSEL_STRINGS } from "../../i18n/vessel";
import { PREPARE_STRINGS } from "../../i18n/prepare";
import type { RootStackParamList } from "../../navigation";

// Sefer sihirbazı — Faz 8 TROVE görünümü (sprint G4). Motor/veri davranışı
// DEĞİŞMEDİ: aynı state, aynı createTrip/createVessel/generatePlan akışı.
// Yenilenen: T token'ları, net adım sırası (tekne → kişiler → sefer →
// kullanım profili), zorunlu/isteğe bağlı ayrımı (yalnız tekne seçimi +
// ≥1 yetişkin zorunlu), uzun kullanım profili varsayılanlarıyla katlanır,
// kirli formda geri koruması, klavye kaçınma.

type Nav = NativeStackNavigationProp<RootStackParamList>;
type WizardRoute = RouteProp<RootStackParamList, "TripWizard">;

const TRIP_TYPES: TripType[] = [
  "short_day_trip",
  "full_day_trip",
  "weekend",
  "multi_day_coastal",
  "offshore_passage",
];

const BOAT_TYPES: BoatType[] = ["sailing", "catamaran", "motor", "rib", "gulet"];

function Stepper(props: {
  label: string;
  value: number;
  min?: number;
  onChange: (v: number) => void;
}) {
  const min = props.min ?? 0;
  return (
    <View style={styles.stepperRow}>
      <Text style={styles.fieldText}>{props.label}</Text>
      <View style={styles.stepper}>
        <Pressable
          onPress={() => props.onChange(Math.max(min, props.value - 1))}
          accessibilityRole="button"
          accessibilityLabel={`${props.label} −`}
          style={({ pressed }) => [styles.stepBtn, pressed && { opacity: 0.7 }]}
        >
          <Text style={styles.stepGlyph}>−</Text>
        </Pressable>
        <Text style={styles.stepVal}>{props.value}</Text>
        <Pressable
          onPress={() => props.onChange(props.value + 1)}
          accessibilityRole="button"
          accessibilityLabel={`${props.label} +`}
          style={({ pressed }) => [styles.stepBtn, pressed && { opacity: 0.7 }]}
        >
          <LIcon name="plus" size={TICON.md} color={T.ink1} />
        </Pressable>
      </View>
    </View>
  );
}

function Chips<T extends string>(props: {
  options: { key: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <View style={styles.chipRow}>
      {props.options.map((o) => {
        const on = props.value === o.key;
        return (
          <Pressable
            key={o.key}
            onPress={() => props.onChange(o.key)}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            accessibilityLabel={o.label}
            style={[styles.chip, on && styles.chipOn]}
          >
            <Text style={[styles.chipText, on && styles.chipTextOn]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function SectionLabel({ children, mt = 22 }: { children: string; mt?: number }) {
  return <Text style={[styles.sectionLabel, { marginTop: mt }]}>{children}</Text>;
}

export default function TripWizardScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<WizardRoute>();
  const { locale } = useLocale();
  const s = TRIP_STRINGS[locale];
  const si = INSPECTION_STRINGS[locale];
  const sv = VESSEL_STRINGS[locale];
  const p = PREPARE_STRINGS[locale];

  // 1) Tekne (Home hızlı aksiyonları sahiplik ön seçimi geçebilir)
  const [ownership, setOwnership] = useState<OwnershipContext>(
    route.params?.ownership ?? "own"
  );
  const saved = useMemo(() => listVessels(), []);
  const [selectedBoat, setSelectedBoat] = useState<VesselRow | null>(null);
  const [newBoatName, setNewBoatName] = useState("");
  const [newBoatType, setNewBoatType] = useState<BoatType>("sailing");

  // 2) Detaylar
  const [name, setName] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [pickerFor, setPickerFor] = useState<"start" | "end" | null>(null);
  const [pickerInit, setPickerInit] = useState("2026-01-01");

  // Takvim, dokunma ANINDA bugünden açılır (render'da tarih hesabı yok).
  function openPicker(which: "start" | "end") {
    setPickerInit(new Date().toISOString().slice(0, 10));
    setPickerFor(which);
  }
  const [departure, setDeparture] = useState("");
  const [destination, setDestination] = useState("");
  const [tripType, setTripType] = useState<TripType>("weekend");
  const [nights, setNightsRaw] = useState(2);
  const [mealsTouched, setMealsTouched] = useState(false);

  // 3) Mürettebat
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [pets, setPets] = useState(0);
  const [skipper, setSkipper] = useState("");

  // 4) Kullanım profili (varsayılanlar makul — katlanır bölüm)
  const [showProfile, setShowProfile] = useState(false);
  const [mooring, setMooring] = useState<MooringProfile>("mixed");
  const [breakfasts, setBreakfasts] = useState(2);
  const [lunches, setLunches] = useState(3);
  const [dinners, setDinners] = useState(2);
  const [snacks, setSnacks] = useState(true);
  const [shopAccess, setShopAccess] = useState<ShopAccess>("limited");
  const [watermaker, setWatermaker] = useState(false);
  const [fridge, setFridge] = useState(true);
  const [freezer, setFreezer] = useState(false);
  const [climate, setClimate] = useState<ClimateProfile>("moderate");
  const [style, setStyle] = useState<ProvisioningStyle>("balanced");
  const [allergies, setAllergies] = useState("");
  const savedTripRef = useRef(false);

  function setNights(n: number) {
    setNightsRaw(n);
    if (!mealsTouched) {
      // Kullanıcı dokunmadıysa makul başlangıç: gece sayısına göre öneri
      setBreakfasts(n);
      setDinners(n);
      setLunches(n + 1);
    }
  }

  // Takvim seçimi: tarih atanır; iki tarih de doluysa gece sayısı otomatik
  // hesaplanır (mealsTouched mantığına saygılı — setNights önerileri günceller).
  function onPickDate(iso: string) {
    const nextStart = pickerFor === "start" ? iso : startAt;
    const nextEnd = pickerFor === "end" ? iso : endAt;
    if (pickerFor === "start") {
      setStartAt(iso);
      // Kalkış dönüşün ötesine alındıysa dönüş temizlenir (geçersiz aralık olmaz)
      if (nextEnd && nightsBetween(iso, nextEnd) === null) setEndAt("");
    } else if (pickerFor === "end") {
      setEndAt(iso);
    }
    setPickerFor(null);
    const n = nightsBetween(nextStart, nextEnd);
    if (n !== null && n > 0) setNights(n);
  }

  const dayTrip = tripType === "short_day_trip" || tripType === "full_day_trip";
  const canCreate =
    (selectedBoat !== null || newBoatName.trim().length > 0 || ownership === "undecided") &&
    adults + children >= 1;

  // Kirli sihirbaz geri tuşunda sorar (Android donanım geri dahil).
  const dirty =
    selectedBoat !== null ||
    newBoatName.trim().length > 0 ||
    name.trim().length > 0 ||
    startAt.trim().length > 0 ||
    destination.trim().length > 0;
  useEffect(() => {
    const sub = navigation.addListener("beforeRemove", (e) => {
      if (!dirty || savedTripRef.current) return;
      e.preventDefault();
      Alert.alert(sv.discardTitle, sv.discardBody, [
        { text: sv.keepEditing, style: "cancel" },
        {
          text: sv.discardConfirm,
          style: "destructive",
          onPress: () => navigation.dispatch(e.data.action),
        },
      ]);
    });
    return sub;
  }, [navigation, dirty, sv]);

  function create() {
    let boatId: string | undefined = selectedBoat?.id;
    if (!boatId && newBoatName.trim()) {
      boatId = createVessel({
        name: newBoatName.trim(),
        type: newBoatType,
        ownershipType: ownership === "charter" ? "chartered" : "owned",
      }).id;
    }
    const tripName =
      name.trim() || destination.trim() || `${s.newTrip} ${startAt || new Date().toISOString().slice(0, 10)}`;
    const trip = createTrip({
      name: tripName,
      tripType,
      ownershipContext: ownership,
      boatId,
      startAt: startAt.trim() || undefined,
      endAt: endAt.trim() || undefined,
      departureLocation: departure.trim() || undefined,
      destination: destination.trim() || undefined,
      nights: dayTrip ? 0 : nights,
      adults,
      children,
      infants,
      pets,
      skipperName: skipper.trim() || undefined,
      profile: {
        ...DEFAULT_TRIP_PROFILE,
        mooring,
        breakfastsAboard: dayTrip ? Math.min(breakfasts, 1) : breakfasts,
        lunchesAboard: dayTrip ? Math.min(lunches, 1) : lunches,
        dinnersAboard: dayTrip ? Math.min(dinners, 1) : dinners,
        snacks,
        shopAccess,
        watermaker,
        refrigerator: fridge,
        freezer,
        climate,
        style,
        allergies: allergies.trim() || undefined,
      },
    });
    // Hazırlık planının ikmal ayağını hemen üret (denetimler modül açılınca oluşur)
    generatePlan(trip, locale);
    savedTripRef.current = true;
    navigation.replace("TripDetail", { tripId: trip.id });
  }

  const ownBoats = saved.filter((v) =>
    ownership === "charter" ? v.ownershipType !== "owned" : v.ownershipType === "owned"
  );

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* 1 — Tekne (zorunlu) */}
          <SectionLabel mt={0}>{s.whichBoat.toUpperCase()}</SectionLabel>
          <Chips
            options={[
              { key: "own", label: s.ownBoat },
              { key: "charter", label: s.charterBoat },
              { key: "undecided", label: s.decideLater },
            ]}
            value={ownership}
            onChange={(v) => {
              setOwnership(v);
              setSelectedBoat(null);
            }}
          />
          {ownership !== "undecided" && (
            <>
              {ownBoats.length > 0 && (
                <View style={[styles.chipRow, { marginTop: 8 }]}>
                  {ownBoats.map((v) => {
                    const on = selectedBoat?.id === v.id;
                    return (
                      <Pressable
                        key={v.id}
                        onPress={() => setSelectedBoat(on ? null : v)}
                        accessibilityRole="button"
                        accessibilityState={{ selected: on }}
                        accessibilityLabel={v.name}
                        style={[styles.chip, on && styles.chipBlue]}
                      >
                        <Text style={[styles.chipText, on && styles.chipTextOn]}>{v.name}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              )}
              {!selectedBoat && (
                <>
                  <TextInput
                    value={newBoatName}
                    onChangeText={setNewBoatName}
                    style={styles.input}
                    placeholder={`${s.addBoat}: ${sv.namePlaceholder}`}
                    placeholderTextColor={T.ink3}
                    accessibilityLabel={s.addBoat}
                  />
                  {newBoatName.trim().length > 0 && (
                    <View style={{ marginTop: 8 }}>
                      <Chips
                        options={BOAT_TYPES.map((b) => ({ key: b, label: boatTypeLabel(si, b) }))}
                        value={newBoatType}
                        onChange={setNewBoatType}
                      />
                    </View>
                  )}
                </>
              )}
            </>
          )}

          {/* 2 — Kişiler (zorunlu: en az 1 yetişkin/çocuk) */}
          <SectionLabel>{s.crew.toUpperCase()}</SectionLabel>
          <View style={styles.card}>
            <Stepper label={s.adults} value={adults} min={0} onChange={setAdults} />
            <Stepper label={s.children} value={children} onChange={setChildren} />
            <Stepper label={s.infants} value={infants} onChange={setInfants} />
            <Stepper label={s.pets} value={pets} onChange={setPets} />
          </View>
          <TextInput
            value={skipper}
            onChangeText={setSkipper}
            style={styles.input}
            placeholder={s.skipperName}
            placeholderTextColor={T.ink3}
            accessibilityLabel={s.skipperName}
          />

          {/* 3 — Sefer (hepsi isteğe bağlı; sonradan da doldurulur) */}
          <SectionLabel>{s.newTrip.toUpperCase()}</SectionLabel>
          <Text style={styles.optionalHint}>{sv.detailsHint}</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            style={styles.input}
            placeholder={s.tripName}
            placeholderTextColor={T.ink3}
            accessibilityLabel={s.tripName}
          />
          {/* Tarihler — cihaz testi F2: elle yazım yerine takvim; iki tarih
              seçilince gece sayısı otomatik hesaplanır. */}
          <View style={styles.row2}>
            <Pressable
              onPress={() => openPicker("start")}
              accessibilityRole="button"
              accessibilityLabel={s.tripDates}
              style={[styles.input, styles.dateField, { flex: 1 }]}
            >
              <LIcon name="calendar" size={TICON.sm} color={T.ink2} />
              <Text style={[styles.dateText, !startAt && { color: T.ink3 }]}>
                {startAt || s.dateHint}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => openPicker("end")}
              accessibilityRole="button"
              accessibilityLabel={s.dateHint}
              style={[styles.input, styles.dateField, { flex: 1 }]}
            >
              <LIcon name="calendar" size={TICON.sm} color={T.ink2} />
              <Text style={[styles.dateText, !endAt && { color: T.ink3 }]}>
                {endAt || s.dateHint}
              </Text>
            </Pressable>
          </View>
          <View style={styles.row2}>
            <TextInput
              value={departure}
              onChangeText={setDeparture}
              style={[styles.input, { flex: 1 }]}
              placeholder={s.departure}
              placeholderTextColor={T.ink3}
              accessibilityLabel={s.departure}
            />
            <TextInput
              value={destination}
              onChangeText={setDestination}
              style={[styles.input, { flex: 1 }]}
              placeholder={s.destination}
              placeholderTextColor={T.ink3}
              accessibilityLabel={s.destination}
            />
          </View>
          <Text style={styles.fieldLabel}>{s.tripType}</Text>
          <Chips
            options={TRIP_TYPES.map((t) => ({
              key: t,
              label: s[(`tt_${t}`) as keyof TripStrings] as string,
            }))}
            value={tripType}
            onChange={setTripType}
          />
          {!dayTrip && (
            <View style={[styles.card, { marginTop: 10 }]}>
              <Stepper label={s.nights} value={nights} onChange={setNights} />
            </View>
          )}

          {/* 4 — Kullanım profili (katlanır; varsayılanlar makul) */}
          <Pressable
            onPress={() => setShowProfile((x) => !x)}
            accessibilityRole="button"
            accessibilityState={{ expanded: showProfile }}
            accessibilityLabel={s.usageProfile}
            style={styles.profileToggle}
          >
            <Text style={styles.sectionLabelInline}>{s.usageProfile.toUpperCase()}</Text>
            <LIcon
              name={showProfile ? "chevron-down" : "chevron-right"}
              size={TICON.sm}
              color={T.ink3}
            />
          </Pressable>
          {showProfile && (
            <>
              <Text style={styles.fieldLabel}>{s.mooring}</Text>
              <Chips
                options={[
                  { key: "marina", label: s.m_marina },
                  { key: "mixed", label: s.m_mixed },
                  { key: "anchor", label: s.m_anchor },
                ]}
                value={mooring}
                onChange={setMooring}
              />
              <Text style={styles.fieldLabel}>{s.mealsAboard}</Text>
              <View style={styles.card}>
                <Stepper
                  label={s.breakfasts}
                  value={breakfasts}
                  onChange={(v) => {
                    setMealsTouched(true);
                    setBreakfasts(v);
                  }}
                />
                <Stepper
                  label={s.lunches}
                  value={lunches}
                  onChange={(v) => {
                    setMealsTouched(true);
                    setLunches(v);
                  }}
                />
                <Stepper
                  label={s.dinners}
                  value={dinners}
                  onChange={(v) => {
                    setMealsTouched(true);
                    setDinners(v);
                  }}
                />
                <View style={styles.switchRow}>
                  <Text style={styles.fieldText}>{s.snacksQ}</Text>
                  <Switch value={snacks} onValueChange={setSnacks} trackColor={{ true: T.blue }} />
                </View>
              </View>
              <Text style={styles.fieldLabel}>{s.shopAccess}</Text>
              <Chips
                options={[
                  { key: "easy", label: s.sa_easy },
                  { key: "limited", label: s.sa_limited },
                  { key: "none", label: s.sa_none },
                ]}
                value={shopAccess}
                onChange={setShopAccess}
              />
              <View style={[styles.card, { marginTop: 10 }]}>
                <View style={styles.switchRow}>
                  <Text style={styles.fieldText}>{s.watermaker}</Text>
                  <Switch
                    value={watermaker}
                    onValueChange={setWatermaker}
                    trackColor={{ true: T.blue }}
                  />
                </View>
                <View style={styles.switchRow}>
                  <Text style={styles.fieldText}>{s.refrigerator}</Text>
                  <Switch value={fridge} onValueChange={setFridge} trackColor={{ true: T.blue }} />
                </View>
                <View style={styles.switchRow}>
                  <Text style={styles.fieldText}>{s.freezer}</Text>
                  <Switch value={freezer} onValueChange={setFreezer} trackColor={{ true: T.blue }} />
                </View>
              </View>
              <Text style={styles.fieldLabel}>{s.climate}</Text>
              <Chips
                options={[
                  { key: "cool", label: s.c_cool },
                  { key: "moderate", label: s.c_moderate },
                  { key: "hot", label: s.c_hot },
                ]}
                value={climate}
                onChange={setClimate}
              />
              <Text style={styles.fieldLabel}>{s.styleLabel}</Text>
              <Chips
                options={[
                  { key: "essential", label: s.st_essential },
                  { key: "balanced", label: s.st_balanced },
                  { key: "comfortable", label: s.st_comfortable },
                ]}
                value={style}
                onChange={setStyle}
              />
              <TextInput
                value={allergies}
                onChangeText={setAllergies}
                style={styles.input}
                placeholder={s.allergies}
                placeholderTextColor={T.ink3}
                accessibilityLabel={s.allergies}
              />
            </>
          )}
        </ScrollView>
        {/* Uzun formda birincil aksiyon sabit alt çubukta kalır */}
        <View style={styles.bottomBar}>
          <Pressable
            onPress={create}
            disabled={!canCreate}
            accessibilityRole="button"
            accessibilityLabel={s.createTrip}
            accessibilityState={{ disabled: !canCreate }}
            style={({ pressed }) => [
              styles.cta,
              !canCreate && { backgroundColor: T.surfaceEl },
              pressed && canCreate && { opacity: 0.85 },
            ]}
          >
            <Text style={[styles.ctaText, !canCreate && { color: T.ink3 }]}>{s.createTrip}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      <CalendarSheet
        visible={pickerFor !== null}
        title={s.tripDates}
        selectedISO={(pickerFor === "start" ? startAt : endAt) || null}
        initialISO={pickerInit}
        minISO={pickerFor === "end" ? startAt || null : null}
        locale={locale}
        clearLabel={p.clearDate}
        onSelect={onPickDate}
        onClear={() => {
          if (pickerFor === "start") setStartAt("");
          else if (pickerFor === "end") setEndAt("");
          setPickerFor(null);
        }}
        onClose={() => setPickerFor(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.bg },
  scroll: { padding: 16, paddingBottom: 32 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: T.ink2,
    letterSpacing: 0.4,
    marginBottom: 8,
  },
  sectionLabelInline: { fontSize: 11, fontWeight: "600", color: T.ink2, letterSpacing: 0.4 },
  optionalHint: { fontSize: 12, color: T.ink3, marginBottom: 8, marginTop: -2 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    minHeight: touch.min,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: T.rule,
    backgroundColor: T.surface,
    borderRadius: 99,
    paddingHorizontal: 14,
  },
  chipOn: { backgroundColor: T.ink0, borderColor: T.ink0 },
  chipBlue: { backgroundColor: T.blue, borderColor: T.blue },
  chipText: { fontSize: 13, color: T.ink1 },
  chipTextOn: { color: "#FFFFFF", fontWeight: "600" },
  input: {
    backgroundColor: T.surface,
    borderWidth: 1,
    borderColor: T.ruleStr,
    borderRadius: T.r2,
    color: T.ink0,
    fontSize: 15,
    minHeight: touch.min,
    paddingHorizontal: 14,
    marginTop: 8,
  },
  inputMono: { fontFamily: T.mono, fontSize: 13 },
  dateField: { flexDirection: "row", alignItems: "center", gap: 8 },
  dateText: { fontFamily: T.mono, fontSize: 13, color: T.ink0 },
  row2: { flexDirection: "row", gap: 8 },
  card: {
    backgroundColor: T.surface,
    borderRadius: T.r2,
    borderWidth: 1,
    borderColor: T.rule,
    paddingHorizontal: 14,
    ...TSH.sh0,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: T.ink2,
    letterSpacing: 0.4,
    marginTop: 16,
    marginBottom: 8,
  },
  fieldText: { fontSize: 14, color: T.ink0, flex: 1 },
  stepperRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  stepper: { flexDirection: "row", alignItems: "center", gap: 12 },
  stepBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: T.rule,
    backgroundColor: T.surfaceEl,
    alignItems: "center",
    justifyContent: "center",
  },
  stepGlyph: { fontSize: 20, fontWeight: "600", color: T.ink1, lineHeight: 22 },
  stepVal: { fontFamily: T.mono, fontSize: 16, color: T.ink0, minWidth: 28, textAlign: "center" },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: touch.min,
    paddingVertical: 4,
  },
  profileToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: touch.min,
    marginTop: 18,
  },
  bottomBar: {
    padding: 16,
    backgroundColor: T.surface,
    borderTopWidth: 1,
    borderTopColor: T.rule,
  },
  cta: {
    backgroundColor: T.blue,
    borderRadius: T.r,
    minHeight: touch.min,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaText: { fontSize: 15, fontWeight: "700", color: "#FFFFFF", letterSpacing: -0.2 },
});
