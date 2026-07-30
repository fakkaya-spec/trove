export type RootStackParamList = {
  /** Yeni ana ekran: inspection akışı */
  Home: undefined;
  NewInspection: undefined;
  Inspect: { inspectionId: string };
  InspectionSummary: { inspectionId: string };
  /** Legacy checklist tarama modu (feature flag arkasında) */
  Checklists: undefined;
  Checklist: { vesselId: string };
  Guide: undefined;
  Premium: undefined;
};
