import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getLocales } from "expo-localization";
import { Locale, LOCALES, Strings, STRINGS } from "./strings";

export type { Locale } from "./strings";
export { LOCALES } from "./strings";

const STORAGE_KEY = "marincheck:locale";

function deviceLocale(): Locale {
  try {
    const code = getLocales()[0]?.languageCode?.toLowerCase();
    if (code && LOCALES.some((l) => l.code === code)) return code as Locale;
  } catch {
    // cihaz dili okunamazsa İngilizce'ye düş
  }
  return "en";
}

interface LocaleCtx {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: Strings;
}

const Ctx = createContext<LocaleCtx>({
  locale: "en",
  setLocale: () => {},
  t: STRINGS.en,
});

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(deviceLocale());

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (saved && LOCALES.some((l) => l.code === saved)) {
        setLocaleState(saved as Locale);
      }
    });
  }, []);

  const value = useMemo<LocaleCtx>(
    () => ({
      locale,
      setLocale: (l: Locale) => {
        setLocaleState(l);
        AsyncStorage.setItem(STORAGE_KEY, l).catch(() => {});
      },
      t: STRINGS[locale],
    }),
    [locale]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLocale(): LocaleCtx {
  return useContext(Ctx);
}
