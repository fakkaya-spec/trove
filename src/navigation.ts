import type { NavigatorScreenParams } from "@react-navigation/native";
import type { PaywallContext } from "./entitlement/policy";
import type { UpgradeModule } from "./i18n/premium";

export type RootStackParamList = {
  /** Alt sekmeler (Trip / Log / Vessel) — KİLİTLİ TROVE navigasyonu */
  Tabs: NavigatorScreenParams<TabParamList> | undefined;
  /** Tüm seferler listesi (Trip sekmesi başlığından erişilir) */
  Trips: undefined;
  TripWizard: { ownership?: "own" | "charter" } | undefined;
  /** Teknenin boylamsal durum geçmişi (ürünün uzun vadeli çekirdek değeri) */
  BoatHistory: { boatId: string };
  AddVessel: undefined;
  TripDetail: { tripId: string };
  Provisioning: { tripId: string };
  HandoverReview: { tripId: string };
  /** Şablon kütüphanesi (Ayarlar'dan erişilir; artık sekme değil) */
  Library: undefined;
  /** Ayarlar (eski Profil ekranı) — Trip başlığındaki dişliden açılır */
  Settings: undefined;
  /** Bağımsız hızlı charter check-in girişi */
  NewInspection: undefined;
  Inspect: { inspectionId: string };
  InspectionSummary: { inspectionId: string };
  /** Legacy checklist tarama modu (feature flag arkasında) */
  Checklists: undefined;
  Checklist: { vesselId: string };
  Guide: undefined;
  Premium: undefined;
  /** Premium foto kanıtı kapısı — bağlam takibiyle açılır (MONETIZATION 2/9) */
  Paywall: { context: PaywallContext };
  Upgrade: { module: UpgradeModule };
  /** Faz 4 — Trip Prepare ekranları (onaylı TROVE tasarımı) */
  TripCrew: { tripId: string };
  TripProvisions: { tripId: string };
  TripShopping: { tripId: string };
  TripPredep: { tripId: string };
  TripCheckin: { tripId: string };
  /** Faz 6 — dönüş & kapatma listesi (TripChecklistScreen yeniden kullanımı) */
  TripReturn: { tripId: string };
  /** Faz 7 — rehberli sefer kapanışı + charter check-out */
  TripComplete: { tripId: string };
  TripCheckout: { tripId: string };
  /** Seyir defteri — yeni kayıt ekleme (modal; yerel-önce kalıcı) */
  AddLog: undefined;
};

export type TabParamList = {
  TripTab: undefined;
  LogTab: undefined;
  VesselTab: undefined;
};
