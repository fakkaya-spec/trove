import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { getIap } from "./iap";
import { premiumStore } from "./premiumState";

// ---------------------------------------------------------------------------
// Premium abonelik (reklamsız kullanım).
//
// YAYINA ALMADAN ÖNCE:
// 1. App Store Connect ve Google Play Console'da aşağıdaki kimliklerle iki
//    "auto-renewing subscription" ürünü oluşturun (fiyatları mağazada belirleyin):
//      - marincheck_premium_monthly  (aylık)
//      - marincheck_premium_yearly   (yıllık)
// 2. Google Play'de her aboneliğe bir "base plan" ekleyin.
// 3. Gerçek doğrulama için satın alma makbuzlarını sunucuda doğrulamak en
//    sağlıklısıdır; bu sürüm cihaz üstü (client-side) doğrulama yapar.
//
// Yerel modül (react-native-iap) Expo Go'da/web'de yoktur; o ortamlarda
// satın alma ekranı bilgilendirme gösterir, uygulama reklamlı çalışır.
// ---------------------------------------------------------------------------

export const SKU_MONTHLY = "marincheck_premium_monthly";
export const SKU_YEARLY = "marincheck_premium_yearly";
const SKUS = [SKU_MONTHLY, SKU_YEARLY];

const STORAGE_KEY = "marincheck:premium";

export interface PriceInfo {
  monthly?: string;
  yearly?: string;
}

interface PremiumCtx {
  isPremium: boolean;
  storeAvailable: boolean;
  prices: PriceInfo;
  busy: boolean;
  /** true dönerse satın alma akışı başladı; sonuç listener ile gelir */
  purchase: (sku: string) => Promise<boolean>;
  restore: () => Promise<boolean>;
  /** Yalnızca __DEV__ derlemede çalışır: mağazasız premium simülasyonu */
  devToggle: () => void;
}

const Ctx = createContext<PremiumCtx>({
  isPremium: false,
  storeAvailable: false,
  prices: {},
  busy: false,
  purchase: async () => false,
  restore: async () => false,
  devToggle: () => {},
});

/* eslint-disable @typescript-eslint/no-explicit-any */

function extractPrice(product: any): string | undefined {
  return (
    product?.displayPrice ??
    product?.localizedPrice ??
    product?.price?.toString?.()
  );
}

export function PremiumProvider({ children }: { children: React.ReactNode }) {
  const [isPremium, setIsPremium] = useState(false);
  const [storeAvailable, setStoreAvailable] = useState(false);
  const [prices, setPrices] = useState<PriceInfo>({});
  const [busy, setBusy] = useState(false);
  const [products, setProducts] = useState<any[]>([]);

  function markPremium(value: boolean) {
    setIsPremium(value);
    premiumStore.set(value);
    AsyncStorage.setItem(STORAGE_KEY, value ? "1" : "0").catch(() => {});
  }

  useEffect(() => {
    // Kayıtlı durumu hemen yükle (çevrimdışı açılışta reklamsızlık korunur).
    AsyncStorage.getItem(STORAGE_KEY).then((v) => {
      if (v === "1") {
        setIsPremium(true);
        premiumStore.set(true);
      }
    });

    const iap = getIap();
    if (!iap) return;

    let purchaseSub: any;
    let errorSub: any;
    let mounted = true;

    (async () => {
      try {
        await iap.initConnection();
        if (!mounted) return;
        setStoreAvailable(true);

        purchaseSub = iap.purchaseUpdatedListener(async (purchase: any) => {
          try {
            const id = purchase?.productId ?? purchase?.id;
            if (SKUS.includes(id)) {
              await iap.finishTransaction({ purchase, isConsumable: false });
              markPremium(true);
            }
          } catch {
            // finishTransaction hatası aboneliği düşürmez
          } finally {
            setBusy(false);
          }
        });
        errorSub = iap.purchaseErrorListener(() => setBusy(false));

        // Fiyatları çek
        try {
          const fetched = await iap.fetchProducts({ skus: SKUS, type: "subs" });
          if (mounted && Array.isArray(fetched)) {
            setProducts(fetched);
            const monthly = fetched.find(
              (p: any) => (p.productId ?? p.id) === SKU_MONTHLY
            );
            const yearly = fetched.find(
              (p: any) => (p.productId ?? p.id) === SKU_YEARLY
            );
            setPrices({
              monthly: extractPrice(monthly),
              yearly: extractPrice(yearly),
            });
          }
        } catch {
          // ürünler mağazada tanımlı değilse fiyatsız devam
        }

        // Mevcut abonelik var mı? (uygulama yeniden kurulduysa geri kazan)
        try {
          const owned = await iap.getAvailablePurchases();
          if (
            mounted &&
            Array.isArray(owned) &&
            owned.some((p: any) => SKUS.includes(p?.productId ?? p?.id))
          ) {
            markPremium(true);
          }
        } catch {
          // sessiz geç
        }
      } catch {
        // mağaza bağlantısı yoksa satış kapalı, uygulama normal çalışır
      }
    })();

    return () => {
      mounted = false;
      try {
        purchaseSub?.remove?.();
        errorSub?.remove?.();
        iap.endConnection?.();
      } catch {
        // yok say
      }
    };
  }, []);

  const value = useMemo<PremiumCtx>(
    () => ({
      isPremium,
      storeAvailable,
      prices,
      busy,
      purchase: async (sku: string) => {
        const iap = getIap();
        if (!iap || !storeAvailable) return false;
        setBusy(true);
        try {
          const product = products.find((p: any) => (p.productId ?? p.id) === sku);
          const offers =
            product?.subscriptionOfferDetailsAndroid?.map((o: any) => ({
              sku,
              offerToken: o?.offerToken,
            })) ??
            product?.subscriptionOfferDetails?.map((o: any) => ({
              sku,
              offerToken: o?.offerToken,
            })) ??
            [{ sku }];
          await iap.requestPurchase({
            type: "subs",
            request: Platform.select({
              ios: { apple: { sku } },
              default: { google: { skus: [sku], subscriptionOffers: offers } },
            }),
          });
          return true; // sonuç purchaseUpdatedListener'a düşer
        } catch {
          setBusy(false);
          return false;
        }
      },
      restore: async () => {
        const iap = getIap();
        if (!iap || !storeAvailable) return false;
        setBusy(true);
        try {
          const owned = await iap.getAvailablePurchases();
          const has =
            Array.isArray(owned) &&
            owned.some((p: any) => SKUS.includes(p?.productId ?? p?.id));
          if (has) markPremium(true);
          return has;
        } catch {
          return false;
        } finally {
          setBusy(false);
        }
      },
      devToggle: () => {
        if (__DEV__) markPremium(!isPremium);
      },
    }),
    [isPremium, storeAvailable, prices, busy, products]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePremium(): PremiumCtx {
  return useContext(Ctx);
}
