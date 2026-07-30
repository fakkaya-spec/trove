// Drizzle tablo tanımları — migrations.ts içindeki SQL ile birebir aynı olmalı.
// (Şema değişikliği = yeni migration + burada güncelleme.)
import { integer, real, sqliteTable, text, primaryKey } from "drizzle-orm/sqlite-core";

const common = {
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
  deletedAt: text("deleted_at"),
};

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  displayName: text("display_name").notNull(),
  locale: text("locale").notNull().default("en"),
  ...common,
});

export const organizations = sqliteTable("organizations", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  plan: text("plan").notNull().default("free"),
  ...common,
});

export const vessels = sqliteTable("vessels", {
  id: text("id").primaryKey(),
  orgId: text("org_id"),
  name: text("name").notNull(),
  type: text("type").notNull(),
  model: text("model"),
  hullNumber: text("hull_number"),
  photoUri: text("photo_uri"),
  ...common,
});

export const inspectionTemplates = sqliteTable("inspection_templates", {
  id: text("id").primaryKey(),
  orgId: text("org_id"),
  boatType: text("boat_type").notNull(),
  nameJson: text("name_json").notNull(),
  version: integer("version").notNull().default(1),
  isActive: integer("is_active").notNull().default(1),
  ...common,
});

export const templateSections = sqliteTable("template_sections", {
  id: text("id").primaryKey(),
  templateId: text("template_id").notNull(),
  sort: integer("sort").notNull(),
  icon: text("icon").notNull().default(""),
  titleJson: text("title_json").notNull(),
  ...common,
});

export const templateItems = sqliteTable("template_items", {
  id: text("id").primaryKey(),
  sectionId: text("section_id").notNull(),
  sort: integer("sort").notNull(),
  titleJson: text("title_json").notNull(),
  tipJson: text("tip_json"),
  isCritical: integer("is_critical").notNull().default(0),
  requiresPhotoOnIssue: integer("requires_photo_on_issue").notNull().default(0),
  required: integer("required").notNull().default(1),
  applicableTypes: text("applicable_types").notNull().default("[]"),
  inputKind: text("input_kind").notNull().default("status"),
  meterKind: text("meter_kind"),
  safetyNoteJson: text("safety_note_json"),
  ...common,
});

export const handoverSessions = sqliteTable("handover_sessions", {
  id: text("id").primaryKey(),
  vesselId: text("vessel_id").notNull(),
  orgId: text("org_id"),
  chartererName: text("charterer_name"),
  skipperName: text("skipper_name"),
  startsAt: text("starts_at"),
  endsAt: text("ends_at"),
  checkinInspectionId: text("checkin_inspection_id"),
  checkoutInspectionId: text("checkout_inspection_id"),
  status: text("status").notNull().default("open"),
  ...common,
});

export const inspections = sqliteTable("inspections", {
  id: text("id").primaryKey(),
  sessionId: text("session_id"),
  vesselId: text("vessel_id").notNull(),
  templateId: text("template_id").notNull(),
  templateVersion: integer("template_version").notNull(),
  kind: text("kind").notNull().default("check_in"),
  status: text("status").notNull().default("draft"),
  locale: text("locale").notNull().default("en"),
  startedAt: text("started_at").notNull(),
  completedAt: text("completed_at"),
  durationS: integer("duration_s"),
  lat: real("lat"),
  lng: real("lng"),
  ...common,
});

export const inspectionItemResults = sqliteTable(
  "inspection_item_results",
  {
    inspectionId: text("inspection_id").notNull(),
    templateItemId: text("template_item_id").notNull(),
    status: text("status").notNull().default("unchecked"),
    note: text("note"),
    ...common,
  },
  (t) => [primaryKey({ columns: [t.inspectionId, t.templateItemId] })]
);

export const issues = sqliteTable("issues", {
  id: text("id").primaryKey(),
  inspectionId: text("inspection_id").notNull(),
  templateItemId: text("template_item_id"),
  severity: text("severity").notNull().default("medium"),
  title: text("title").notNull(),
  description: text("description"),
  reportedToCompany: integer("reported_to_company").notNull().default(0),
  companyResponse: text("company_response"),
  resolved: integer("resolved").notNull().default(0),
  ...common,
});

export const mediaAssets = sqliteTable("media_assets", {
  id: text("id").primaryKey(),
  inspectionId: text("inspection_id").notNull(),
  issueId: text("issue_id"),
  meterReadingId: text("meter_reading_id"),
  kind: text("kind").notNull().default("photo"),
  localUri: text("local_uri").notNull(),
  sha256: text("sha256"),
  takenAt: text("taken_at").notNull(),
  lat: real("lat"),
  lng: real("lng"),
  uploadState: text("upload_state").notNull().default("pending"),
  ...common,
});

export const meterReadings = sqliteTable("meter_readings", {
  id: text("id").primaryKey(),
  inspectionId: text("inspection_id").notNull(),
  meterKind: text("meter_kind").notNull(),
  value: real("value").notNull(),
  unit: text("unit").notNull(),
  ocrValue: real("ocr_value"),
  ocrConfidence: real("ocr_confidence"),
  confirmed: integer("confirmed").notNull().default(1),
  ...common,
});

export const inventoryItems = sqliteTable("inventory_items", {
  id: text("id").primaryKey(),
  templateId: text("template_id").notNull(),
  sort: integer("sort").notNull(),
  nameJson: text("name_json").notNull(),
  expectedCount: integer("expected_count").notNull(),
  ...common,
});

export const inventoryCounts = sqliteTable(
  "inventory_counts",
  {
    inspectionId: text("inspection_id").notNull(),
    inventoryItemId: text("inventory_item_id").notNull(),
    foundCount: integer("found_count").notNull(),
    note: text("note"),
    ...common,
  },
  (t) => [primaryKey({ columns: [t.inspectionId, t.inventoryItemId] })]
);

export const equipment = sqliteTable("equipment", {
  id: text("id").primaryKey(),
  vesselId: text("vessel_id").notNull(),
  kind: text("kind").notNull(),
  label: text("label"),
  expiresOn: text("expires_on"),
  serviceDueHours: integer("service_due_hours"),
  ...common,
});

export const signatures = sqliteTable("signatures", {
  id: text("id").primaryKey(),
  inspectionId: text("inspection_id").notNull(),
  role: text("role").notNull(),
  signerName: text("signer_name").notNull(),
  mediaId: text("media_id").notNull(),
  signedAt: text("signed_at").notNull(),
  ...common,
});

export const reports = sqliteTable("reports", {
  id: text("id").primaryKey(),
  inspectionId: text("inspection_id").notNull(),
  contentHash: text("content_hash"),
  pdfPath: text("pdf_path"),
  generatedAt: text("generated_at"),
  ...common,
});

export const syncQueue = sqliteTable("sync_queue", {
  id: text("id").primaryKey(),
  entity: text("entity").notNull(),
  entityId: text("entity_id").notNull(),
  op: text("op").notNull().default("upsert"),
  payloadJson: text("payload_json"),
  queuedAt: text("queued_at").notNull(),
  syncedAt: text("synced_at"),
  ...common,
});
