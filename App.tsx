import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { DefaultTheme, NavigationContainer } from "@react-navigation/native";
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
import { colors, fonts } from "./src/theme";
import { Icon, type IconName } from "./src/components/Icon";
import { initAds } from "./src/ads";
import { LocaleProvider, useLocale } from "./src/i18n";
import { INSPECTION_STRINGS } from "./src/i18n/inspection";
import { TRIP_STRINGS } from "./src/i18n/trip";
import { PremiumProvider } from "./src/premium";
import { initDb } from "./src/db/client";
import { markDbReady } from "./src/db/state";
import { features } from "./src/config/features";
import type { RootStackParamList, TabParamList } from "./src/navigation";

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

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

function Tabs() {
  const { locale } = useLocale();
  const s = TRIP_STRINGS[locale];
  const icon =
    (name: IconName) =>
    ({ color }: { color: string }) =>
      <Icon name={name} size={24} color={color} />;
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: { fontFamily: fonts.body, fontSize: 11 },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={TripHomeScreen}
        options={{ title: s.tabHome, tabBarIcon: icon("home-outline") }}
      />
      <Tab.Screen
        name="TripsTab"
        component={TripsScreen}
        options={{ title: s.tabTrips, tabBarIcon: icon("compass-outline") }}
      />
      <Tab.Screen
        name="BoatsTab"
        component={BoatsScreen}
        options={{ title: s.tabBoats, tabBarIcon: icon("boat-outline") }}
      />
      <Tab.Screen
        name="LibraryTab"
        component={LibraryScreen}
        options={{ title: s.tabLibrary, tabBarIcon: icon("library-outline") }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{ title: s.tabProfile, tabBarIcon: icon("person-outline") }}
      />
    </Tab.Navigator>
  );
}

function Root() {
  const { locale, t } = useLocale();
  const si = INSPECTION_STRINGS[locale];
  const s = TRIP_STRINGS[locale];
  return (
    <NavigationContainer theme={theme}>
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

  return (
    <LocaleProvider>
      <PremiumProvider>
        <Root />
      </PremiumProvider>
    </LocaleProvider>
  );
}
