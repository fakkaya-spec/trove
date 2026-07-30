import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  SafeAreaView,
  TextInput,
  Switch,
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
import { colors, fonts, spacing, radius, touch } from "../../theme";
import { RopeDivider, Button } from "../../components/ui";
import { useLocale } from "../../i18n";
import { TRIP_STRINGS, TripStrings } from "../../i18n/trip";
import { boatTypeLabel, INSPECTION_STRINGS } from "../../i18n/inspection";
import type { RootStackParamList } from "../../navigation";

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
          hitSlop={8}
          accessibilityLabel={`${props.label} -`}
        >
          <Text style={styles.stepBtn}>−</Text>
        </Pressable>
        <Text style={styles.stepVal}>{props.value}</Text>
        <Pressable
          onPress={() => props.onChange(props.value + 1)}
          hitSlop={8}
          accessibilityLabel={`${props.label} +`}
        >
          <Text style={styles.stepBtn}>＋</Text>
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
      {props.options.map((o) => (
        <Pressable
          key={o.key}
          onPress={() => props.onChange(o.key)}
          accessibilityRole="button"
          accessibilityLabel={o.label}
          style={[styles.chip, props.value === o.key && styles.chipActive]}
        >
          <Text style={[styles.chipText, props.value === o.key && styles.chipTextActive]}>
            {o.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

export default function TripWizardScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<WizardRoute>();
  const { locale } = useLocale();
  const s = TRIP_STRINGS[locale];
  const si = INSPECTION_STRINGS[locale];

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

  // 4) Kullanım profili
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

  function setNights(n: number) {
    setNightsRaw(n);
    if (!mealsTouched) {
      // Kullanıcı dokunmadıysa makul başlangıç: gece sayısına göre öneri
      setBreakfasts(n);
      setDinners(n);
      setLunches(n + 1);
    }
  }

  const dayTrip = tripType === "short_day_trip" || tripType === "full_day_trip";
  const canCreate =
    (selectedBoat !== null || newBoatName.trim().length > 0 || ownership === "undecided") &&
    adults + children >= 1;

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
    navigation.replace("TripDetail", { tripId: trip.id });
  }

  const ownBoats = saved.filter((v) =>
    ownership === "charter" ? v.ownershipType !== "owned" : v.ownershipType === "owned"
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* 1 — Tekne */}
        <RopeDivider label={`1 · ${s.whichBoat.toUpperCase()}`} />
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
                {ownBoats.map((v) => (
                  <Pressable
                    key={v.id}
                    onPress={() => setSelectedBoat(selectedBoat?.id === v.id ? null : v)}
                    style={[styles.chip, selectedBoat?.id === v.id && styles.chipActive]}
                  >
                    <Text
                      style={[styles.chipText, selectedBoat?.id === v.id && styles.chipTextActive]}
                    >
                      {v.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
            {!selectedBoat && (
              <>
                <TextInput
                  value={newBoatName}
                  onChangeText={setNewBoatName}
                  style={styles.input}
                  placeholder={`${s.addBoat}: S/Y Meltemi`}
                  placeholderTextColor={colors.textSecondary}
                />
                <Chips
                  options={BOAT_TYPES.map((b) => ({ key: b, label: boatTypeLabel(si, b) }))}
                  value={newBoatType}
                  onChange={setNewBoatType}
                />
              </>
            )}
          </>
        )}

        {/* 2 — Detaylar */}
        <RopeDivider label={`2 · ${s.newTrip.toUpperCase()}`} />
        <TextInput
          value={name}
          onChangeText={setName}
          style={styles.input}
          placeholder={s.tripName}
          placeholderTextColor={colors.textSecondary}
        />
        <View style={styles.row2}>
          <TextInput
            value={startAt}
            onChangeText={setStartAt}
            style={[styles.input, { flex: 1 }]}
            placeholder={`${s.tripDates}: ${s.dateHint}`}
            placeholderTextColor={colors.textSecondary}
          />
          <TextInput
            value={endAt}
            onChangeText={setEndAt}
            style={[styles.input, { flex: 1 }]}
            placeholder={s.dateHint}
            placeholderTextColor={colors.textSecondary}
          />
        </View>
        <View style={styles.row2}>
          <TextInput
            value={departure}
            onChangeText={setDeparture}
            style={[styles.input, { flex: 1 }]}
            placeholder={s.departure}
            placeholderTextColor={colors.textSecondary}
          />
          <TextInput
            value={destination}
            onChangeText={setDestination}
            style={[styles.input, { flex: 1 }]}
            placeholder={s.destination}
            placeholderTextColor={colors.textSecondary}
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
        {!dayTrip && <Stepper label={s.nights} value={nights} onChange={setNights} />}

        {/* 3 — Mürettebat */}
        <RopeDivider label={`3 · ${s.crew.toUpperCase()}`} />
        <Stepper label={s.adults} value={adults} min={0} onChange={setAdults} />
        <Stepper label={s.children} value={children} onChange={setChildren} />
        <Stepper label={s.infants} value={infants} onChange={setInfants} />
        <Stepper label={s.pets} value={pets} onChange={setPets} />
        <TextInput
          value={skipper}
          onChangeText={setSkipper}
          style={styles.input}
          placeholder={s.skipperName}
          placeholderTextColor={colors.textSecondary}
        />

        {/* 4 — Kullanım profili */}
        <RopeDivider label={`4 · ${s.usageProfile.toUpperCase()}`} />
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
          <Switch value={snacks} onValueChange={setSnacks} trackColor={{ true: colors.gold }} />
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
        <View style={styles.switchRow}>
          <Text style={styles.fieldText}>{s.watermaker}</Text>
          <Switch value={watermaker} onValueChange={setWatermaker} trackColor={{ true: colors.gold }} />
        </View>
        <View style={styles.switchRow}>
          <Text style={styles.fieldText}>{s.refrigerator}</Text>
          <Switch value={fridge} onValueChange={setFridge} trackColor={{ true: colors.gold }} />
        </View>
        <View style={styles.switchRow}>
          <Text style={styles.fieldText}>{s.freezer}</Text>
          <Switch value={freezer} onValueChange={setFreezer} trackColor={{ true: colors.gold }} />
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
          placeholderTextColor={colors.textSecondary}
        />

      </ScrollView>
      {/* Uzun formda birincil aksiyon sabit alt çubukta kalır */}
      <View style={styles.bottomBar}>
        <Button label={s.createTrip} onPress={create} disabled={!canCreate} icon="checkmark" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.m, paddingBottom: spacing.xl },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    minHeight: 44,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontFamily: fonts.body, fontSize: 14, color: colors.text },
  chipTextActive: { color: colors.onPrimary, fontWeight: "600" },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.control,
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: 15,
    minHeight: touch.min,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginTop: 8,
  },
  row2: { flexDirection: "row", gap: 8 },
  fieldLabel: {
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
    color: colors.textSecondary,
    marginTop: spacing.m,
    marginBottom: 6,
  },
  fieldText: { fontFamily: fonts.body, fontSize: 15, color: colors.text, flex: 1 },
  stepperRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  stepper: { flexDirection: "row", alignItems: "center", gap: 14 },
  stepBtn: {
    fontSize: 22,
    color: colors.text,
    fontWeight: "600",
    width: touch.min,
    height: touch.min,
    textAlign: "center",
    lineHeight: 46,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: touch.min / 2,
    overflow: "hidden",
  },
  stepVal: { fontFamily: fonts.mono, fontSize: 17, color: colors.text, minWidth: 28, textAlign: "center" },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: touch.min,
    paddingVertical: 8,
  },
  bottomBar: {
    padding: spacing.m,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
