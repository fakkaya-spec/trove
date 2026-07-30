import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { DarkTheme, NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "./src/screens/HomeScreen";
import ChecklistScreen from "./src/screens/ChecklistScreen";
import GuideScreen from "./src/screens/GuideScreen";
import { colors, fonts } from "./src/theme";
import { initAds } from "./src/ads";
import { LocaleProvider, useLocale } from "./src/i18n";
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
  const { t } = useLocale();
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
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen
          name="Checklist"
          component={ChecklistScreen}
          options={{ title: t.checklistFallbackTitle }}
        />
        <Stack.Screen name="Guide" component={GuideScreen} options={{ title: t.guideScreenTitle }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  useEffect(() => {
    initAds();
  }, []);

  return (
    <LocaleProvider>
      <Root />
    </LocaleProvider>
  );
}
