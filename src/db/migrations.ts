import type { SQLiteDatabase } from "expo-sqlite";

// Versiyonlu, elle yazılmış SQL migration'ları.
// Karar (docs/PHASE0.md M3): drizzle-kit yerine bu runner — ek build
// konfigürasyonu gerektirmez. Drizzle yalnızca tip güvenli sorgu katmanı.
// KURAL: yayımlanmış bir migration asla değiştirilmez; yeni id eklenir.

interface Migration {
  id: number;
  sql: string;
}

const COMMON = `created_at TEXT NOT NULL, updated_at TEXT NOT NULL, deleted_at TEXT`;

const MIGRATIONS: Migration[] = [
  {
    id: 1,
    sql: `
CREATE TABLE users (
  id TEXT PRIMARY KEY, display_name TEXT NOT NULL, locale TEXT NOT NULL DEFAULT 'en', ${COMMON}
);
CREATE TABLE organizations (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, plan TEXT NOT NULL DEFAULT 'free', ${COMMON}
);
CREATE TABLE vessels (
  id TEXT PRIMARY KEY, org_id TEXT, name TEXT NOT NULL, type TEXT NOT NULL,
  model TEXT, hull_number TEXT, photo_uri TEXT, ${COMMON}
);
CREATE TABLE inspection_templates (
  id TEXT PRIMARY KEY, org_id TEXT, boat_type TEXT NOT NULL, name_json TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1, is_active INTEGER NOT NULL DEFAULT 1, ${COMMON}
);
CREATE TABLE template_sections (
  id TEXT PRIMARY KEY, template_id TEXT NOT NULL REFERENCES inspection_templates(id),
  sort INTEGER NOT NULL, icon TEXT NOT NULL DEFAULT '', title_json TEXT NOT NULL, ${COMMON}
);
CREATE TABLE template_items (
  id TEXT PRIMARY KEY, section_id TEXT NOT NULL REFERENCES template_sections(id),
  sort INTEGER NOT NULL, title_json TEXT NOT NULL, tip_json TEXT,
  is_critical INTEGER NOT NULL DEFAULT 0,
  requires_photo_on_issue INTEGER NOT NULL DEFAULT 0,
  required INTEGER NOT NULL DEFAULT 1,
  applicable_types TEXT NOT NULL DEFAULT '[]',
  input_kind TEXT NOT NULL DEFAULT 'status',
  meter_kind TEXT, safety_note_json TEXT, ${COMMON}
);
CREATE TABLE handover_sessions (
  id TEXT PRIMARY KEY, vessel_id TEXT NOT NULL REFERENCES vessels(id), org_id TEXT,
  charterer_name TEXT, skipper_name TEXT, starts_at TEXT, ends_at TEXT,
  checkin_inspection_id TEXT, checkout_inspection_id TEXT,
  status TEXT NOT NULL DEFAULT 'open', ${COMMON}
);
CREATE TABLE inspections (
  id TEXT PRIMARY KEY, session_id TEXT REFERENCES handover_sessions(id),
  vessel_id TEXT NOT NULL REFERENCES vessels(id),
  template_id TEXT NOT NULL REFERENCES inspection_templates(id),
  template_version INTEGER NOT NULL,
  kind TEXT NOT NULL DEFAULT 'check_in',
  status TEXT NOT NULL DEFAULT 'draft',
  locale TEXT NOT NULL DEFAULT 'en',
  started_at TEXT NOT NULL, completed_at TEXT, duration_s INTEGER,
  lat REAL, lng REAL, ${COMMON}
);
CREATE TABLE inspection_item_results (
  inspection_id TEXT NOT NULL REFERENCES inspections(id),
  template_item_id TEXT NOT NULL REFERENCES template_items(id),
  status TEXT NOT NULL DEFAULT 'unchecked',
  note TEXT, ${COMMON},
  PRIMARY KEY (inspection_id, template_item_id)
);
CREATE TABLE issues (
  id TEXT PRIMARY KEY, inspection_id TEXT NOT NULL REFERENCES inspections(id),
  template_item_id TEXT,
  severity TEXT NOT NULL DEFAULT 'medium',
  title TEXT NOT NULL, description TEXT,
  reported_to_company INTEGER NOT NULL DEFAULT 0,
  company_response TEXT,
  resolved INTEGER NOT NULL DEFAULT 0, ${COMMON}
);
CREATE TABLE media_assets (
  id TEXT PRIMARY KEY, inspection_id TEXT NOT NULL REFERENCES inspections(id),
  issue_id TEXT, meter_reading_id TEXT,
  kind TEXT NOT NULL DEFAULT 'photo',
  local_uri TEXT NOT NULL, sha256 TEXT,
  taken_at TEXT NOT NULL, lat REAL, lng REAL,
  upload_state TEXT NOT NULL DEFAULT 'pending', ${COMMON}
);
CREATE TABLE meter_readings (
  id TEXT PRIMARY KEY, inspection_id TEXT NOT NULL REFERENCES inspections(id),
  meter_kind TEXT NOT NULL, value REAL NOT NULL, unit TEXT NOT NULL,
  ocr_value REAL, ocr_confidence REAL,
  confirmed INTEGER NOT NULL DEFAULT 1, ${COMMON}
);
CREATE TABLE inventory_items (
  id TEXT PRIMARY KEY, template_id TEXT NOT NULL REFERENCES inspection_templates(id),
  sort INTEGER NOT NULL, name_json TEXT NOT NULL, expected_count INTEGER NOT NULL, ${COMMON}
);
CREATE TABLE inventory_counts (
  inspection_id TEXT NOT NULL REFERENCES inspections(id),
  inventory_item_id TEXT NOT NULL REFERENCES inventory_items(id),
  found_count INTEGER NOT NULL, note TEXT, ${COMMON},
  PRIMARY KEY (inspection_id, inventory_item_id)
);
CREATE TABLE equipment (
  id TEXT PRIMARY KEY, vessel_id TEXT NOT NULL REFERENCES vessels(id),
  kind TEXT NOT NULL, label TEXT, expires_on TEXT, service_due_hours INTEGER, ${COMMON}
);
CREATE TABLE signatures (
  id TEXT PRIMARY KEY, inspection_id TEXT NOT NULL REFERENCES inspections(id),
  role TEXT NOT NULL, signer_name TEXT NOT NULL,
  media_id TEXT NOT NULL, signed_at TEXT NOT NULL, ${COMMON}
);
CREATE TABLE reports (
  id TEXT PRIMARY KEY, inspection_id TEXT NOT NULL REFERENCES inspections(id),
  content_hash TEXT, pdf_path TEXT, generated_at TEXT, ${COMMON}
);
CREATE TABLE sync_queue (
  id TEXT PRIMARY KEY, entity TEXT NOT NULL, entity_id TEXT NOT NULL,
  op TEXT NOT NULL DEFAULT 'upsert', payload_json TEXT,
  queued_at TEXT NOT NULL, synced_at TEXT, ${COMMON}
);
CREATE INDEX idx_inspections_status ON inspections(status);
CREATE INDEX idx_results_inspection ON inspection_item_results(inspection_id);
CREATE INDEX idx_issues_inspection ON issues(inspection_id);
CREATE INDEX idx_media_inspection ON media_assets(inspection_id);
CREATE INDEX idx_meters_inspection ON meter_readings(inspection_id);
CREATE INDEX idx_sections_template ON template_sections(template_id);
CREATE INDEX idx_items_section ON template_items(section_id);
`,
  },
  {
    // Faz 1-2: Trip merkezli model + ikmal (provisioning) + tekne genişletmesi.
    id: 2,
    sql: `
CREATE TABLE trips (
  id TEXT PRIMARY KEY,
  boat_id TEXT REFERENCES vessels(id),
  name TEXT NOT NULL,
  trip_type TEXT NOT NULL DEFAULT 'weekend',
  ownership_context TEXT NOT NULL DEFAULT 'undecided',
  status TEXT NOT NULL DEFAULT 'planning',
  start_at TEXT, end_at TEXT,
  departure_location TEXT, destination TEXT,
  nights INTEGER NOT NULL DEFAULT 0,
  adults INTEGER NOT NULL DEFAULT 2,
  children INTEGER NOT NULL DEFAULT 0,
  infants INTEGER NOT NULL DEFAULT 0,
  pets INTEGER NOT NULL DEFAULT 0,
  skipper_name TEXT,
  crew_names_json TEXT NOT NULL DEFAULT '[]',
  profile_json TEXT NOT NULL DEFAULT '{}',
  ${COMMON}
);
CREATE INDEX idx_trips_status ON trips(status);

CREATE TABLE provision_rules (
  id TEXT PRIMARY KEY,
  rule_key TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  name_json TEXT NOT NULL,
  unit TEXT NOT NULL,
  mode TEXT NOT NULL,
  base_qty REAL NOT NULL,
  adult_factor REAL NOT NULL DEFAULT 1,
  child_factor REAL NOT NULL DEFAULT 0.6,
  meal TEXT,
  hot_climate_factor REAL NOT NULL DEFAULT 1,
  anchor_factor REAL NOT NULL DEFAULT 1,
  style_factors_json TEXT NOT NULL DEFAULT '{"essential":1,"balanced":1,"comfortable":1}',
  reserve_pct REAL NOT NULL DEFAULT 0,
  min_qty REAL NOT NULL DEFAULT 0,
  round_to REAL NOT NULL DEFAULT 1,
  requires_json TEXT NOT NULL DEFAULT '{}',
  sort INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1,
  version INTEGER NOT NULL DEFAULT 1,
  ${COMMON}
);

CREATE TABLE provision_plans (
  id TEXT PRIMARY KEY,
  trip_id TEXT NOT NULL REFERENCES trips(id),
  rules_version INTEGER NOT NULL DEFAULT 1,
  inputs_json TEXT NOT NULL DEFAULT '{}',
  ${COMMON}
);
CREATE INDEX idx_provision_plans_trip ON provision_plans(trip_id);

CREATE TABLE provision_items (
  id TEXT PRIMARY KEY,
  plan_id TEXT NOT NULL REFERENCES provision_plans(id),
  rule_id TEXT,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  unit TEXT NOT NULL,
  calculated_qty REAL,
  final_qty REAL NOT NULL DEFAULT 0,
  onboard_qty REAL NOT NULL DEFAULT 0,
  purchased_qty REAL,
  state TEXT NOT NULL DEFAULT 'suggested',
  note TEXT,
  explanation_json TEXT,
  sort INTEGER NOT NULL DEFAULT 0,
  ${COMMON}
);
CREATE INDEX idx_provision_items_plan ON provision_items(plan_id);

CREATE TABLE seed_versions (
  seed_key TEXT PRIMARY KEY,
  version INTEGER NOT NULL,
  applied_at TEXT NOT NULL
);

ALTER TABLE inspection_templates ADD COLUMN kind TEXT NOT NULL DEFAULT 'charter_check_in';

ALTER TABLE vessels ADD COLUMN ownership_type TEXT NOT NULL DEFAULT 'owned';
ALTER TABLE vessels ADD COLUMN manufacturer TEXT;
ALTER TABLE vessels ADD COLUMN model_year INTEGER;
ALTER TABLE vessels ADD COLUMN length_m REAL;
ALTER TABLE vessels ADD COLUMN beam_m REAL;
ALTER TABLE vessels ADD COLUMN registration_number TEXT;
ALTER TABLE vessels ADD COLUMN hull_identification_number TEXT;
ALTER TABLE vessels ADD COLUMN home_marina TEXT;
ALTER TABLE vessels ADD COLUMN fuel_capacity_l REAL;
ALTER TABLE vessels ADD COLUMN fresh_water_capacity_l REAL;
ALTER TABLE vessels ADD COLUMN black_water_capacity_l REAL;
ALTER TABLE vessels ADD COLUMN engine_count INTEGER;
ALTER TABLE vessels ADD COLUMN engine_type TEXT;
ALTER TABLE vessels ADD COLUMN refrigerator_available INTEGER NOT NULL DEFAULT 1;
ALTER TABLE vessels ADD COLUMN freezer_available INTEGER NOT NULL DEFAULT 0;
ALTER TABLE vessels ADD COLUMN watermaker_available INTEGER NOT NULL DEFAULT 0;
ALTER TABLE vessels ADD COLUMN generator_available INTEGER NOT NULL DEFAULT 0;
ALTER TABLE vessels ADD COLUMN dinghy_available INTEGER NOT NULL DEFAULT 0;
ALTER TABLE vessels ADD COLUMN outboard_available INTEGER NOT NULL DEFAULT 0;
ALTER TABLE vessels ADD COLUMN notes TEXT;

ALTER TABLE inspections ADD COLUMN trip_id TEXT REFERENCES trips(id);
ALTER TABLE handover_sessions ADD COLUMN trip_id TEXT REFERENCES trips(id);
ALTER TABLE issues ADD COLUMN trip_id TEXT;
ALTER TABLE issues ADD COLUMN source_type TEXT NOT NULL DEFAULT 'inspection';
ALTER TABLE meter_readings ADD COLUMN trip_id TEXT;
ALTER TABLE meter_readings ADD COLUMN boat_id TEXT;
ALTER TABLE meter_readings ADD COLUMN reading_stage TEXT NOT NULL DEFAULT 'ad_hoc';
CREATE INDEX idx_inspections_trip ON inspections(trip_id);
CREATE INDEX idx_meters_trip ON meter_readings(trip_id);
`,
  },
  {
    // Faz 3: check-in ↔ check-out foto eşleştirme (rehberli yeniden çekim +
    // insan onaylı inceleme; otomatik hasar kararı YOK — yalnız olgular).
    id: 3,
    sql: `
CREATE TABLE handover_pairs (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES handover_sessions(id),
  checkin_media_id TEXT NOT NULL REFERENCES media_assets(id),
  checkout_media_id TEXT REFERENCES media_assets(id),
  label TEXT,
  requires_review INTEGER NOT NULL DEFAULT 0,
  note TEXT,
  ${COMMON}
);
CREATE INDEX idx_pairs_session ON handover_pairs(session_id);
`,
  },
];

export function migrate(db: SQLiteDatabase): void {
  db.execSync(
    `CREATE TABLE IF NOT EXISTS schema_migrations (id INTEGER PRIMARY KEY, applied_at TEXT NOT NULL);`
  );
  const appliedRows = db.getAllSync<{ id: number }>(`SELECT id FROM schema_migrations`);
  const applied = new Set(appliedRows.map((r) => r.id));
  for (const m of MIGRATIONS) {
    if (applied.has(m.id)) continue;
    db.withTransactionSync(() => {
      db.execSync(m.sql);
      db.runSync(`INSERT INTO schema_migrations (id, applied_at) VALUES (?, ?)`, [
        m.id,
        new Date().toISOString(),
      ]);
    });
  }
}
