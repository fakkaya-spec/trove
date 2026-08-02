import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { usePremium } from "../premium";
import {
  Capabilities,
  capabilitiesFor,
  CONTEXT_CAPABILITY,
  PaywallContext,
  trackContext,
} from "./policy";

// ---------------------------------------------------------------------------
// Merkezî entitlement servisi (docs/MONETIZATION.md kural 7):
// ekranlar aboneliği ASLA doğrudan sormaz; kapasite bayrağı ister ya da
// requestAccess(context) çağırır. requestAccess yetki yoksa paywall'ı
// verilen bağlamla açar ve bağlamı yerelde sayar (kural 9).
// Taşıyıcı: mevcut react-native-iap PremiumProvider (Seçenek A — kural 8).
// ---------------------------------------------------------------------------

const VERIFIED_AT_KEY = "trove:entitlement:lastVerifiedAt";
const CONTEXTS_KEY = "trove:paywall:contexts";

interface EntitlementCtx {
  capabilities: Capabilities;
  /** Yetki varsa true döner; yoksa bağlamı kaydedip paywall'ı açar, false döner. */
  requestAccess: (context: PaywallContext) => Promise<boolean>;
}

const DENIED: Capabilities = {
  canCapturePhoto: false,
  canImportPhoto: false,
  canAttachPhoto: false,
  canCreatePhotoPair: false,
  canSyncNewPhotos: false,
};

const Ctx = createContext<EntitlementCtx>({
  capabilities: DENIED,
  requestAccess: async () => false,
});

export function EntitlementProvider({
  onPaywall,
  children,
}: {
  /** Paywall'ı verilen bağlamla açar (App.tsx navigasyon ref'i bağlar). */
  onPaywall: (context: PaywallContext) => void;
  children: React.ReactNode;
}) {
  const premium = usePremium();
  const [snapshot, setSnapshot] = useState<{
    lastVerifiedAt: string | null;
    capabilities: Capabilities;
  }>({ lastVerifiedAt: null, capabilities: DENIED });
  const countsRef = useRef<Partial<Record<PaywallContext, number>>>({});

  // Önbelleği yükle + mağaza bu oturumda erişilebilirken Premium doğrulandıysa
  // damgayı tazele. Çevrimdışı açılışta (storeAvailable=false) damga
  // TAZELENMEZ; önbellekteki değer grace penceresini belirler (kural 6).
  // __DEV__ mağazasız simülasyonda devToggle damgayı da simüle eder.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      let verifiedAt: string | null = null;
      try {
        const [[, storedAt], [, storedContexts]] = await AsyncStorage.multiGet([
          VERIFIED_AT_KEY,
          CONTEXTS_KEY,
        ]);
        verifiedAt = storedAt;
        if (storedContexts) {
          try {
            countsRef.current = JSON.parse(storedContexts) as Partial<
              Record<PaywallContext, number>
            >;
          } catch {
            countsRef.current = {};
          }
        }
      } catch {
        // önbellek okunamazsa güvenli varsayılan: doğrulanmamış
      }
      if (premium.isPremium && (premium.storeAvailable || __DEV__)) {
        verifiedAt = new Date().toISOString();
        AsyncStorage.setItem(VERIFIED_AT_KEY, verifiedAt).catch(() => {});
      }
      if (!cancelled) {
        setSnapshot({
          lastVerifiedAt: verifiedAt,
          capabilities: capabilitiesFor(
            { isPremium: premium.isPremium, lastVerifiedAt: verifiedAt },
            Date.now()
          ),
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [premium.isPremium, premium.storeAvailable]);

  const requestAccess = useCallback(
    async (context: PaywallContext): Promise<boolean> => {
      // Karar çağrı anında verilir: grace penceresi ekran açıkken dolsa bile
      // bayat bir snapshot yetki sızdırmaz.
      const caps = capabilitiesFor(
        { isPremium: premium.isPremium, lastVerifiedAt: snapshot.lastVerifiedAt },
        Date.now()
      );
      if (caps[CONTEXT_CAPABILITY[context]]) return true;
      const next = trackContext(countsRef.current, context);
      countsRef.current = next;
      AsyncStorage.setItem(CONTEXTS_KEY, JSON.stringify(next)).catch(() => {});
      onPaywall(context);
      return false;
    },
    [premium.isPremium, snapshot.lastVerifiedAt, onPaywall]
  );

  const value = useMemo<EntitlementCtx>(
    () => ({ capabilities: snapshot.capabilities, requestAccess }),
    [snapshot.capabilities, requestAccess]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useEntitlement(): EntitlementCtx {
  return useContext(Ctx);
}

export type { PaywallContext, Capabilities };
