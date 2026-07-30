import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { DarkTheme, NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import InspectionHomeScreen from "./src/screens/inspection/InspectionHomeScreen";
import NewInspectionScreen from "./src/screens/inspection/NewInspectionScreen";
import InspectScreen from "./src/screens/inspection/InspectScreen";
import SummaryScreen from "./src/screens/inspection/SummaryScreen";
import HomeScreen from "./src/screens/HomeScreen";
import ChecklistScreen from "./src/screens/ChecklistScreen";
import GuideScreen from "./src/screens/GuideScreen";
import PremiumScreen from "./src/screens/PremiumScreen";
import { colors, fonts } from "./src/theme";
import { initAds } from "./src/ads";
import { LocaleProvider, useLocale } from "./src/i18n";
import { INSPECTION_STRINGS } from "./src/i18n/inspection";
import { PremiumProvider } from "./src/premium";
import { initDb } from "./src/db/client";
import { markDbReady } from "./src/db/state";
import { features } from "./src/config/features";
import type { RootStackParamList } from "./src/navigation";

const Stack = createNativeStackNavigator<RootStackParamList>();

const theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.night,
    card: colors.night,
    text: colors.paper,
    primary: colors.brass,
    border: colors.line,
  },
};

function Root() {
  const { locale, t } = useLocale();
  const si = INSPECTION_STRINGS[locale];
  return (
    <NavigationContainer theme={theme}>
      <StatusBar style="light" />
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.night },
          headerTintColor: colors.brass,
          headerTitleStyle: {
            fontFamily: fonts.display,
            fontWeight: "700",
            color: colors.paper,
          },
          headerBackTitle: t.back,
        }}
      >
        {/* Yeni inspection akışı (reklamsız) */}
        <Stack.Screen name="Home" component={InspectionHomeScreen} options={{ headerShown: false }} />
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
      console.warn("DB init failed; inspection flow disabled:", e);
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
