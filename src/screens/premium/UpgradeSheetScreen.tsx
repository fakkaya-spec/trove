import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Easing,
  useWindowDimensions,
} from "react-native";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { T, TSH, TICON, touch } from "../../theme";
import { LIcon } from "../../components/LIcon";
import { usePremium, SKU_YEARLY } from "../../premium";
import { dismissModule } from "../../entitlement/session";
import { UPGRADE_VISUALS } from "../../entitlement/upgrades";
import { useLocale } from "../../i18n";
import { PREMIUM_STRINGS } from "../../i18n/premium";
import type { RootStackParamList } from "../../navigation";

// Modül yükseltme sayfası — premium-design-system.md §5 "Modal Upgrade Sheet".
// Ufuk, kapı değil (§1): ücretsiz sonuç ekranda kalır; bu sayfa yalnız
// kullanıcı dokunuşuyla açılır, hiçbir akışı KESMEZ. Kapatma tek jest
// (§3): aşağı kaydırma ≥120px, arka plana dokunma veya "ücretsizle devam".
// Her kapanış modülü oturum için işaretler (ENTRY-2). Hareket §2: giriş
// 280ms cubic-bezier(0.32,0.72,0,1), arka plan 200ms; çıkış 220ms.
// Kutlama animasyonu YOK.

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, "Upgrade">;

const ENTER_MS = 280;
const EXIT_MS = 220;

export default function UpgradeSheetScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { locale } = useLocale();
  const m = PREMIUM_STRINGS[locale];
  const premium = usePremium();
  const { height } = useWindowDimensions();

  const module = route.params.module;
  const copy = m.modules[module];
  const visual = UPGRADE_VISUALS[module];

  // Lint (react-hooks/refs): render sırasında ref.current yerine tembel
  // useState başlatıcıları — değerler bileşen ömrü boyunca sabittir.
  const [slide] = useState(() => new Animated.Value(height));
  const [backdrop] = useState(() => new Animated.Value(0));
  const closingRef = useRef(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slide, {
        toValue: 0,
        duration: ENTER_MS,
        easing: Easing.bezier(0.32, 0.72, 0, 1),
        useNativeDriver: true,
      }),
      Animated.timing(backdrop, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [slide, backdrop]);

  const close = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    dismissModule(module);
    Animated.parallel([
      Animated.timing(slide, {
        toValue: height,
        duration: EXIT_MS,
        easing: Easing.bezier(0.4, 0, 1, 1),
        useNativeDriver: true,
      }),
      Animated.timing(backdrop, { toValue: 0, duration: EXIT_MS, useNativeDriver: true }),
    ]).start(() => navigation.goBack());
  }, [module, slide, backdrop, height, navigation]);

  // Premium bu oturumda etkinleşirse sayfanın işi bitti — sessizce kapan.
  useEffect(() => {
    if (premium.isPremium && !closingRef.current) close();
  }, [premium.isPremium, close]);

  // Her kaldırılma yolu (Android donanım geri dahil) modülü oturum için
  // işaretler — animasyonlu close atlanmış olsa bile ENTRY-2 tutarlı kalır.
  useEffect(() => {
    const sub = navigation.addListener("beforeRemove", () => dismissModule(module));
    return sub;
  }, [navigation, module]);

  // Kaydırarak kapatma bilinçli olarak yok (bağımlılıksız sade kapanış):
  // arka plana dokunma, "ücretsizle devam" ve donanım geri yeterli.

  return (
    <View style={styles.root}>
      <Animated.View style={[styles.backdrop, { opacity: backdrop }]}>
        <Pressable style={{ flex: 1 }} accessibilityLabel={m.ctaContinueFree} onPress={close} />
      </Animated.View>

      <Animated.View style={[styles.sheet, { transform: [{ translateY: slide }] }]}>
        {/* 1. Tutamaç (§5: 32×3, T.surfaceEl, 12px üstten) */}
        <View style={styles.handle} />

        {/* 2. Modül ikonu */}
        <View style={[styles.icon, { backgroundColor: visual.bgColor }]}>
          <LIcon name={visual.icon} size={TICON.lg} color={visual.color} />
        </View>

        {/* 3-4. Fayda-dilli başlık + tek cümle açıklama */}
        <Text style={styles.title}>{copy.headline}</Text>
        <Text style={styles.explanation}>{copy.explanation}</Text>

        {/* 5-6. NELER GELİŞİR + 2px mavi sol vurgulu fayda satırları */}
        <Text style={styles.sectionLabel}>{m.whatImproves}</Text>
        {copy.benefits.map((b) => (
          <View key={b} style={styles.benefitRow}>
            <View style={styles.benefitAccent} />
            <Text style={styles.benefitText}>{b}</Text>
          </View>
        ))}

        {/* 7. Daha sonra gelecek (isteğe bağlı; T.surfaceEl vurgu, ink3) */}
        {copy.comingLater && copy.comingLater.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>{m.comingLater}</Text>
            {copy.comingLater.map((b) => (
              <View key={b} style={styles.benefitRow}>
                <View style={[styles.benefitAccent, { backgroundColor: T.surfaceEl }]} />
                <Text style={[styles.benefitText, { color: T.ink3 }]}>{b}</Text>
              </View>
            ))}
          </>
        )}

        {/* 8. Koruma notu (uygun modüllerde) */}
        {copy.preservationNote ? (
          <Text style={styles.preservation}>{copy.preservationNote}</Text>
        ) : null}

        {/* 9. Birincil CTA — yüzey başına TEK mavi eylem (§3) */}
        {premium.storeAvailable ? (
          <>
            <Pressable
              onPress={() => premium.purchase(SKU_YEARLY)}
              disabled={premium.busy}
              accessibilityRole="button"
              accessibilityLabel={m.ctaUpgrade}
              style={({ pressed }) => [styles.cta, (pressed || premium.busy) && { opacity: 0.85 }]}
            >
              <Text style={styles.ctaText}>{premium.busy ? m.statePurchasing : m.ctaUpgrade}</Text>
            </Pressable>
            <Text style={styles.legal}>{m.legalAutoRenew}</Text>
          </>
        ) : (
          <Text style={styles.storeNote}>{m.storeUnavailable}</Text>
        )}

        {/* 10. "Ücretsizle devam" — tek kabul edilebilir ifade (§6) */}
        <Pressable
          onPress={close}
          accessibilityRole="button"
          accessibilityLabel={m.ctaContinueFree}
          style={({ pressed }) => [styles.freeBtn, pressed && { opacity: 0.7 }]}
        >
          <Text style={styles.freeText}>{m.ctaContinueFree}</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: "flex-end" },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.40)",
  },
  sheet: {
    backgroundColor: T.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 32,
    ...TSH.sh2,
  },
  handle: {
    alignSelf: "center",
    width: 32,
    height: 3,
    borderRadius: 99,
    backgroundColor: T.surfaceEl,
    marginTop: 12,
    marginBottom: 16,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: T.r2,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  title: { fontSize: 19, fontWeight: "700", color: T.ink0, letterSpacing: -0.4, marginBottom: 6 },
  explanation: { fontSize: 13, color: T.ink2, lineHeight: 19, marginBottom: 4 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: T.ink3,
    letterSpacing: 0.4,
    textTransform: "uppercase",
    marginTop: 16,
    marginBottom: 8,
  },
  benefitRow: { flexDirection: "row", gap: 10, marginBottom: 8 },
  benefitAccent: { width: 2, borderRadius: 1, backgroundColor: T.blue },
  benefitText: { flex: 1, fontSize: 13, color: T.ink0, lineHeight: 20 },
  preservation: { fontSize: 12, fontStyle: "italic", color: T.ink2, marginTop: 12 },
  cta: {
    backgroundColor: T.blue,
    borderRadius: T.r,
    minHeight: touch.min,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
  },
  ctaText: { fontSize: 15, fontWeight: "700", color: "#FFFFFF", letterSpacing: -0.2 },
  legal: { fontSize: 10, color: T.ink3, textAlign: "center", lineHeight: 16, marginTop: 8 },
  storeNote: { fontSize: 12, color: T.ink2, textAlign: "center", marginTop: 18, lineHeight: 18 },
  freeBtn: {
    minHeight: touch.min,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  freeText: { fontSize: 13, fontWeight: "500", color: T.ink2 },
});
