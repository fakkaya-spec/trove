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
