import React, { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import {
  DefaultTheme,
  NavigationContainer,
  createNavigationContainerRef,
  useNavigation,
} from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import TripHomeScreen from "./src/screens/trip/TripHomeScreen";
import TripsScreen from "./src/screens/trip/TripsScreen";
import TripWizardScreen from "./src/screens/trip/TripWizardScreen";
import TripDetailScreen from "./src/screens/trip/TripDetailScreen";
import ProvisioningScreen from "./src/screens/trip/ProvisioningScreen";
import HandoverReviewScreen from "./src/screens/trip/HandoverReviewScreen";
import BoatsScreen from "./src/screens/boats/BoatsScreen";
import BoatHistoryScreen from "./src/screens/boats/BoatHistoryScreen";
import LibraryScreen from "./src/screens/LibraryScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import NewInspectionScreen from "./src/screens/inspection/NewInspectionScreen";
import InspectScreen from "./src/screens/inspection/InspectScreen";
import SummaryScreen from "./src/screens/inspection/SummaryScreen";
import HomeScreen from "./src/screens/HomeScreen";
import ChecklistScreen from "./src/screens/ChecklistScreen";
import GuideScreen from "./src/screens/GuideScreen";
import PremiumScreen from "./src/screens/PremiumScreen";
import LogScreen from "./src/screens/log/LogScreen";
import AddLogScreen from "./src/screens/log/AddLogScreen";
import { colors, fonts } from "./src/theme";
import { Icon, type IconName } from "./src/components/Icon";
import { TroveMark } from "./src/components/brand/TroveMark";
import { TroveWordmark } from "./src/components/brand/TroveWordmark";
import { initAds } from "./src/ads";
import { LocaleProvider, useLocale } from "./src/i18n";
import { INSPECTION_STRINGS } from "./src/i18n/inspection";
import { TRIP_STRINGS } from "./src/i18n/trip";
import { PREPARE_STRINGS } from "./src/i18n/prepare";
import TripCrewScreen from "./src/screens/trip/prepare/TripCrewScreen";
import TripProvisionsScreen from "./src/screens/trip/prepare/TripProvisionsScreen";
import TripShoppingScreen from "./src/screens/trip/prepare/TripShoppingScreen";
import TripChecklistScreen from "./src/screens/trip/prepare/TripChecklistScreen";
import TripCompleteScreen from "./src/screens/trip/complete/TripCompleteScreen";
import { PremiumProvider } from "./src/premium";
import { EntitlementProvider, type PaywallContext } from "./src/entitlement";
import PaywallScreen from "./src/screens/PaywallScreen";
import { initDb } from "./src/db/client";
import { markDbReady } from "./src/db/state";
import { features } from "./src/config/features";
import type { RootStackParamList, TabParamList } from "./src/navigation";

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// Entitlement servisi paywall'ı ekran ağacının dışından açar (kural 7:
// ekranlar abonelik değil kapasite sorar; kapıyı servis yönetir).
const navigationRef = createNavigationContainerRef<RootStackParamList>();

function openPaywall(context: PaywallContext) {
  if (navigationRef.isReady()) navigationRef.navigate("Paywall", { context });
}

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.bg,
    card: colors.surface,
    text: colors.text,
    primary: colors.primary,
    border: colors.border,
  },
};

/** Trip başlığı: sol "tüm seferler", orta TROVE kilidi, sağ Ayarlar dişlisi. */
function TripHeaderButton({
  icon,
  label,
  onPress,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={4}
      style={({ pressed }) => [
        {
          minWidth: 44,
          minHeight: 44,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 6,
        },
        pressed && { opacity: 0.6 },
      ]}
    >
      <Icon name={icon} size={22} color={colors.text} />
    </Pressable>
  );
}

function TroveHeaderTitle() {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      <TroveMark size={20} color={colors.text} />
      <TroveWordmark height={13} color={colors.text} />
    </View>
  );
}

function Tabs() {
  const { locale } = useLocale();
  const s = TRIP_STRINGS[locale];
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const icon =
    (name: IconName) =>
    ({ color }: { color: string }) =>
      <Icon name={name} size={24} color={color} />;
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTitleStyle: { fontFamily: fonts.body, fontWeight: "600", color: colors.text },
        headerShadowVisible: false,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: { fontFamily: fonts.body, fontSize: 11 },
      }}
    >
      <Tab.Screen
        name="TripTab"
        component={TripHomeScreen}
        options={{
          title: s.tabTrip,
          tabBarIcon: icon("compass-outline"),
          headerTitle: () => <TroveHeaderTitle />,
          headerTitleAlign: "center",
          headerLeft: () => (
            <TripHeaderButton
              icon="list-outline"
              label={s.allTrips}
              onPress={() => navigation.navigate("Trips")}
            />
          ),
          headerRight: () => (
            <TripHeaderButton
              icon="settings-outline"
              label={s.settings}
              onPress={() => navigation.navigate("Settings")}
            />
          ),
        }}
      />
      <Tab.Screen
        name="LogTab"
        component={LogScreen}
        options={{
          title: s.tabLog,
          tabBarIcon: icon("create-outline"),
          // LogScreen kendi başlığını çizer
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="VesselTab"
        component={BoatsScreen}
        options={{
          title: s.tabVessel,
          tabBarIcon: icon("boat-outline"),
          headerTitle: s.tabVessel,
        }}
      />
    </Tab.Navigator>
  );
}

function Root() {
  const { locale, t } = useLocale();
  const si = INSPECTION_STRINGS[locale];
  const s = TRIP_STRINGS[locale];
  const sp = PREPARE_STRINGS[locale];
  return (
    <NavigationContainer ref={navigationRef} theme={theme}>
      <StatusBar style="dark" />
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
          headerTitleStyle: {
            fontFamily: fonts.display,
            fontWeight: "600",
            color: colors.text,
          },
          headerBackTitle: t.back,
        }}
      >
        <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
        <Stack.Screen name="Trips" component={TripsScreen} options={{ title: s.allTrips }} />
        <Stack.Screen name="Library" component={LibraryScreen} options={{ title: s.templatesLib }} />
        <Stack.Screen name="Settings" component={ProfileScreen} options={{ title: s.settings }} />
        <Stack.Screen name="TripWizard" component={TripWizardScreen} options={{ title: s.newTrip }} />
        <Stack.Screen name="TripDetail" component={TripDetailScreen} options={{ title: "" }} />
        <Stack.Screen
          name="Provisioning"
          component={ProvisioningScreen}
          options={{ title: s.provisioning }}
        />
        <Stack.Screen
          name="HandoverReview"
          component={HandoverReviewScreen}
          options={{ title: s.handoverReview }}
        />
        <Stack.Screen name="BoatHistory" component={BoatHistoryScreen} options={{ title: "" }} />
        <Stack.Screen
          name="NewInspection"
          component={NewInspectionScreen}
          options={{ title: si.newInspection }}
        />
        <Stack.Screen name="Inspect" component={InspectScreen} options={{ title: "" }} />
        <Stack.Screen
          name="InspectionSummary"
          component={SummaryScreen}
          options={{ title: si.summary }}
        />
        <Stack.Screen
          name="Paywall"
          component={PaywallScreen}
          options={{ headerShown: false, presentation: "modal" }}
        />
        <Stack.Screen
          name="AddLog"
          component={AddLogScreen}
          options={{ headerShown: false, presentation: "modal" }}
        />
        {/* Faz 4 — Trip Prepare ekranları */}
        <Stack.Screen
          name="TripCrew"
          component={TripCrewScreen}
          options={{ title: sp.crewGuests }}
        />
        <Stack.Screen
          name="TripProvisions"
          component={TripProvisionsScreen}
          options={{ title: s.provisioning }}
        />
        <Stack.Screen
          name="TripShopping"
          component={TripShoppingScreen}
          options={{ title: sp.shoppingList }}
        />
        <Stack.Screen
          name="TripPredep"
          component={TripChecklistScreen}
          options={{ title: sp.predepChecklist }}
        />
        <Stack.Screen
          name="TripCheckin"
          component={TripChecklistScreen}
          options={{ title: sp.checkinInspection }}
        />
        <Stack.Screen
          name="TripReturn"
          component={TripChecklistScreen}
          options={{ title: s.returnCheck }}
        />
        <Stack.Screen
          name="TripCheckout"
          component={TripChecklistScreen}
          options={{ title: s.checkOut }}
        />
        <Stack.Screen
          name="TripComplete"
          component={TripCompleteScreen}
          options={{ headerShown: false }}
        />

        {/* Legacy checklist modu (feature flag) */}
        {features.legacyChecklists && (
          <>
            <Stack.Screen name="Checklists" component={HomeScreen} options={{ title: "" }} />
            <Stack.Screen
              name="Checklist"
              component={ChecklistScreen}
              options={{ title: t.checklistFallbackTitle }}
            />
            <Stack.Screen name="Guide" component={GuideScreen} options={{ title: t.guideScreenTitle }} />
            <Stack.Screen
              name="Premium"
              component={PremiumScreen}
              options={{ title: t.premiumScreenTitle }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  // IBM Plex Mono — TROVE tasarım dilinin ölçüm fontu (OFL, assets/fonts/).
  // Aile adları theme.T.mono* ile birebir aynı anahtarlardır.
  const [fontsLoaded] = useFonts({
    IBMPlexMono_400Regular: require("./assets/fonts/IBMPlexMono_400Regular.ttf"),
    IBMPlexMono_500Medium: require("./assets/fonts/IBMPlexMono_500Medium.ttf"),
    IBMPlexMono_600SemiBold: require("./assets/fonts/IBMPlexMono_600SemiBold.ttf"),
  });

  // DB açılışı senkron; başarısızsa (ör. web'de sqlite yapılandırılmadıysa)
  // uygulama çökmez, yeni akış "kullanılamıyor" bildirimi gösterir.
  useState(() => {
    try {
      initDb();
      markDbReady(true);
    } catch (e) {
      console.warn("DB init failed; trip/inspection flows disabled:", e);
      markDbReady(false);
    }
    return null;
  });

  useEffect(() => {
    initAds(); // yalnızca legacy mod ekranları banner gösterir
  }, []);

  // Splash, fontlar hazır olana dek ekranda kalır (mono ölçüm değerlerinin
  // sistem fontuyla "zıplamaması" için).
  if (!fontsLoaded) return null;

  return (
    <LocaleProvider>
      <PremiumProvider>
        <EntitlementProvider onPaywall={openPaywall}>
          <Root />
        </EntitlementProvider>
      </PremiumProvider>
    </LocaleProvider>
  );
}
