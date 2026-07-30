export type RootStackParamList = {
  /** Alt sekmeler (Home / Trips / Boats / Library / Profile) */
  Tabs: undefined;
  TripWizard: { ownership?: "own" | "charter" } | undefined;
  /** Teknenin boylamsal durum geçmişi (ürünün uzun vadeli çekirdek değeri) */
  BoatHistory: { boatId: string };
  TripDetail: { tripId: string };
  Provisioning: { tripId: string };
  HandoverReview: { tripId: string };
  /** Bağımsız hızlı charter check-in girişi */
  NewInspection: undefined;
  Inspect: { inspectionId: string };
  InspectionSummary: { inspectionId: string };
  /** Legacy checklist tarama modu (feature flag arkasında) */
  Checklists: undefined;
  Checklist: { vesselId: string };
  Guide: undefined;
  Premium: undefined;
};

export type TabParamList = {
  HomeTab: undefined;
  TripsTab: undefined;
  BoatsTab: undefined;
  LibraryTab: undefined;
  ProfileTab: undefined;
};
