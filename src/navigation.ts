import type { NavigatorScreenParams } from "@react-navigation/native";

export type RootStackParamList = {
  /** Alt sekmeler (Trip / Log / Vessel) — KİLİTLİ TROVE navigasyonu */
  Tabs: NavigatorScreenParams<TabParamList> | undefined;
  /** Tüm seferler listesi (Trip sekmesi başlığından erişilir) */
  Trips: undefined;
  TripWizard: { ownership?: "own" | "charter" } | undefined;
  /** Teknenin boylamsal durum geçmişi (ürünün uzun vadeli çekirdek değeri) */
  BoatHistory: { boatId: string };
  TripDetail: { tripId: string };
  Provisioning: { tripId: string };
  HandoverReview: { tripId: string };
  /** Şablon kütüphanesi (Ayarlar'dan erişilir; artık sekme değil) */
  Library: undefined;
  /** Ayarlar (eski Profil ekranı) — Trip başlığındaki dişiden açılır */
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
  /** Seyir defteri — yeni kaydı ekleme */
  AddLog: undefined;
  /** Gemi ile sefer hazırlığı — TROVE ekranları */
  Crew: { tripId: string };
  Shopping: { tripId: string };
  Underway: { tripId: string };
  Checkout: { tripId: string };
  TripReport: { tripId: string };
};

export type TabParamList = {
  TripTab: undefined;
  LogTab: undefined;
  VesselTab: undefined;
};
