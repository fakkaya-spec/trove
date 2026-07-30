# MarinCheck 2.0 — Product Requirements Document

**"The digital standard for yacht handover inspections."**

| | |
|---|---|
| Version | 1.0 (draft for review) |
| Date | 2026-07-30 |
| Status | Proposal — supersedes the v1 "checklist app" scope |
| Current codebase | `marincheck/` Expo app (5 languages, 545-item checklist content, AdMob + subscription) |

---

## 1. Executive Summary

MarinCheck v1 is a content app: excellent multilingual checklists, no data capture. The vision described in the brief is a **workflow + evidence platform**: structured inspections that produce signed, timestamped, photo-backed handover reports which reduce deposit disputes, improve safety, and give charter fleets operational data.

The single most important strategic decision: **we are not selling checklists — we are selling defensible evidence and faster turnarounds.** The renter wants their deposit back; the operator wants Saturday changeovers without arguments; the insurer wants documentation. The checklist is merely the capture instrument.

This PRD critically evaluates the brief, cuts scope where it hurts the product, and defines an MVP that one small team can ship, with a staged path to the fleet/enterprise business.

---

## 2. Critical Evaluation of the Brief (assumption challenges)

The brief is directionally right and commercially promising. These points need correction before they become expensive mistakes:

### 2.1 "5–10 minutes" and "unlimited photos/videos/voice/annotations per item" contradict each other
A 100+ item checklist where every item offers status + comment + photo + video + voice note is a 45-minute inspection. Nobody on a hot dock will do it.
**Resolution — exception-based inspection:** every item defaults to ✅ Working. The inspector only *touches* items that are ⚠/❌/N/A. The fast path is: walk the boat following the section order, tap only exceptions, batch-capture photos per section (not per item). Rich evidence (video, voice, annotation) is attached only to *issues*. This is how aviation and rental-car inspections actually work. Target: **guided flow ≤ 7 minutes for a clean boat, +45–90 seconds per issue found.**

### 2.2 Automatic before/after photo comparison is oversold
Pixel-level "highlight new scratches" on boats is unreliable: different light, angle, wet surfaces, moving water background. Shipping this as an automatic claim ("app detected new damage") creates liability and false accusations.
**Resolution:** *guided re-capture + side-by-side review*. Check-out reuses the check-in shot list ("stand here, photograph the port bow again"), then presents paired photos for **human** confirmation, with AI as an assistant that flags "these two photos look different — review". The output says "reviewed and confirmed by both parties", not "AI detected". Same value, defensible.

### 2.3 AI damage detection (cracks, corrosion, torn sails) is a Phase-4 feature, not a launch feature
General marine damage CV does not exist off-the-shelf; training it needs the very dataset this app will generate. Promising it at launch risks a credibility gap.
**Resolution:** launch AI where models are already strong today:
- **OCR of gauges/labels** (engine hours, battery voltage, fuel/water levels, extinguisher & flare expiry dates, liferaft service sticker) — multimodal LLM reads these reliably from a photo.
- **AI report summarization** (turn 14 issues into a professional damage summary in the customer's language).
- **Guided troubleshooting suggestions** (LLM with a maritime prompt + disclaimer).
- **Photo QA** (blur/too-dark detection at capture time — cheap, on-device).
Collect labeled photos from day one; train/fine-tune damage detection when we have tens of thousands of annotated images (that dataset itself becomes a moat and an insurance-industry asset).

### 2.4 "One free inspection" free tier is wrong for the growth loop
A renter does 1–2 charters per year. Capping the free tier at one inspection kills the viral wedge: renters showing up with MarinCheck reports is exactly what pressures charter companies to adopt the paid side.
**Resolution:** consumer inspections are **free and generous** (unlimited basic inspections, watermarked PDF, limited photos per inspection). Monetize: (a) consumer Pro for prosumers/professional skippers, (b) **B2B per-boat/per-month SaaS** — that is where the revenue is. See §12.

### 2.5 Ads do not belong in this product
v1 monetizes with AdMob. A banner ad inside a professional inspection report tool destroys the "digital standard" positioning, and the audience is far too small for ad revenue to matter (thousands of users × eCPM ≈ pocket change; one fleet customer ≈ €1–3k/year).
**Resolution:** keep ads only in the legacy free "quick checklist" mode if at all; the inspection product is ad-free at every tier. Sunset ads entirely once B2B revenue starts.

### 2.6 Eight user types is seven too many for launch
Guest / Skipper / Pro Skipper / Surveyor / Charter Company / Fleet Manager / Marina / Insurance Inspector — each implies permissions, UI, and onboarding surface.
**Resolution:** three roles at launch: **Inspector** (does inspections), **Owner/Admin** (manages boats & team — only exists in B2B orgs), **Viewer** (read reports via link, no account needed). Surveyor and insurance are *report consumers* first (shareable locked PDF/web link), dedicated accounts later. Marina is not a launch persona at all.

### 2.7 The 63/100 "Unsafe" score shown to guests is a liability grenade
Publishing "Unsafe 63/100" about a named vessel creates defamation/commercial conflict with the operator, and guests can't calibrate it.
**Resolution:** scoring exists but is **audience-scoped**: fleet dashboard sees scores and trends (that's where scoring creates value — "most problematic boats"); guest-facing report shows factual issue counts by severity ("2 critical issues found") — never a verdict word like "Unsafe". Safety warnings on critical failures are phrased as recommendations to inform the operator (as the brief itself does — keep that wording).

### 2.8 Integration list needs a machete
Apple Health has no plausible connection to yacht handover. Watches, Starlink, PredictWind, NMEA2000/SignalK: all Nice-to-Have Phase 5+, none move adoption. Weather auto-capture (one API call) and Navionics-style deep links are the only cheap wins.

### 2.9 What the brief is missing (added in this PRD)
1. **The charter (booking) as the linking object** — check-in and check-out are two inspections of the *same charter*; without this pairing there is no comparison, no deposit workflow.
2. **Meter readings as first-class data** (fuel %, water %, engine hours, battery V) — the #1 dispute topic is fuel; a photo of a gauge plus a typed value beats a checklist tick.
3. **Two-party session** — operator and guest join the same inspection (QR code), both see items live, both sign. Without this it's a one-sided claim.
4. **Inventory counting** (fenders ×6, winch handles ×2, linens…) — deposit deductions are mostly *missing items*, not damage.
5. **Boat profile / equipment registry with expiry dates** — this is what powers the notifications feature (extinguisher expiry etc.); notifications without a registry are vapor.
6. **Immutable audit trail** — report hash + event log; the credibility of "PDF becomes locked" depends on it.
7. **Report web viewer** — a signed report must be shareable as a link that opens without an app (insurance, agencies).
8. **GDPR** — EU-first market; data residency, deletion, photo retention policy must be designed in, not bolted on.

---

## 3. Personas & Jobs-to-be-Done

| Persona | Job to be done | Success looks like |
|---|---|---|
| **Charter guest / bareboat skipper** | "Protect my deposit and make sure the boat is safe, without looking paranoid." | 7-minute check-in, evidence stored, deposit returned without argument. |
| **Professional skipper** | "Standardize my handovers across many boats; look professional to clients." | Reusable templates, branded PDF, history per boat. |
| **Charter operator (5–50 boats)** | "Turn every boat around on Saturday without disputes; know my fleet's condition." | Both-party signed reports, damage caught at check-out with evidence, fleet dashboard shows recurring failures. |
| **Surveyor** | "Produce a structured condition report faster than Word + photos." | Custom template, professional PDF, client link. |
| **Insurance handler** *(consumer of output, not user)* | "Assess a claim with trustworthy, timestamped evidence." | Locked report with GPS/time/hash; consistent structure. |

---

## 4. Product Principles

1. **Exception-based by default.** Ticking ✅ is free; only problems cost taps.
2. **≤ 7 minutes** for a clean 40-ft monohull with the standard template; measured and tracked as a product KPI.
3. **Offline-first, always.** Every feature works with zero connectivity; sync is invisible.
4. **One-thumb, sunlight-readable.** Big targets (≥ 56 pt), high contrast, bottom-reachable actions, no hamburger menus.
5. **Evidence over opinion.** Photos, values, timestamps, signatures. The app never accuses; it documents.
6. **The report is the product.** Every design decision optimizes the quality and trustworthiness of the final report.
7. **Guest experience sells the B2B product.** Never degrade the free consumer flow to force upgrades.

---

## 5. Information Architecture (simplified)

```
MarinCheck
├── Home
│   ├── Active charter card (resume inspection / start check-out)
│   ├── New Inspection  →  Boat  →  Template  →  Inspect
│   └── History (past reports)
├── Inspect (the core screen)
│   ├── Section rail (Exterior · Deck · Engine · Nav · Interior · Safety · Docs)
│   ├── Item list (status chips) — exception-based
│   ├── Meters panel (fuel / water / hours / volts + gauge photos)
│   └── Issues tray (always visible count → issue list)
├── Issue detail (photo/video/voice, severity, annotation, note)
├── Review & Sign (summary → meters → issues → signatures → lock)
├── Report (web/PDF viewer, share)
├── Boats (profiles, equipment registry, expiry dates)   [Pro/B2B]
├── Fleet dashboard (web app)                            [B2B]
└── Settings (language, org, templates, account)
```

Six checklist sections exactly as the brief defines (Exterior, Deck, Engine, Navigation, Interior, Safety) **plus a seventh: Documents & Meters** (papers aboard, insurance seen, fuel/water/hours/volts). The v1 content library (545 items × 5 languages) is reseeded into these templates — it is an asset, not throwaway.

### Core workflow (check-in)

```
Start → pick boat (or scan operator QR to join their session)
  → template auto-selected by boat type
  → [optional 60-sec hull walkaround video, guided]
  → Section-by-section: tap exceptions only
      ⚠/❌ → mini issue sheet: severity + 1 photo (more optional) + note/voice
      critical ❌ → immediate safety advisory banner (non-blocking)
  → Meters: 4 values + gauge photos (OCR prefills when online)
  → Inventory quick-count (template-defined counted items)
  → Review: issues list + meters + photo count
  → Signatures (guest + operator on same device, or async)
  → Lock → PDF + share link generated (offline: queued)
```

### Check-out adds
```
→ load check-in baseline → guided re-capture of shot list
→ side-by-side pairs flagged for review (AI-assist, human confirm)
→ new-damage list + missing-inventory list → both parties sign → deposit outcome recorded
```

---

## 6. Feature Prioritization (MoSCoW)

### Must Have (MVP, Phases 1–2)
- Inspection engine: sections, items, ✅/⚠/❌/N/A, exception-based defaults
- Issue capture: photos (cap: 20/issue), note, severity; voice note; GPS + timestamp on all media
- Critical-item advisories (engine, steering, bilge pump, VHF, anchor/windlass, nav lights, liferaft, gas)
- Meters panel with gauge photos (fuel, water, engine hours, battery V)
- Inventory counts for template-defined items
- Templates: Sailing Yacht, Catamaran, Motor Yacht, RIB, Jet Ski (+ Gulet — we already have the content; brief forgot its home market)
- Boat profile (name, model, hull no., photo)
- Review & dual digital signature; locked PDF report with all brief-listed fields + hash + QR verify link
- Offline-first storage + background media sync
- Report share link (web viewer, no app required)
- Languages: EN, TR, DE, ES, RU (already built) — FR, IT next
- Free consumer tier per §12

### Should Have (Phases 2–3)
- Charter pairing: check-in ↔ check-out comparison flow (guided re-capture, human confirm)
- Two-party live session via QR (operator device + guest device)
- OCR prefill of meters & expiry dates (online)
- AI report summary in report language
- Equipment registry + expiry notifications (extinguishers, flares, liferaft, insurance, engine service)
- Fleet dashboard v1 (web): inspections list, filters, boat history, CSV export
- Custom templates (org-level editing, versioned)
- Team accounts, roles (Inspector/Admin/Viewer)
- Photo annotation (arrows/circles)
- Greek, Croatian, French, Italian content

### Nice to Have (Phases 4+)
- AI damage suggestion on photo pairs (assist-only)
- Internal fleet scoring & recurring-failure analytics
- Insurance/surveyor report formats; white-label; API
- Weather auto-capture at inspection start; Navionics/Garmin deep links
- Watch app (checklist tick on wrist), NMEA/SignalK engine-hour reads
- Cost estimation on damages; repair history per boat

### Won't Have (explicitly cut)
- Apple Health, Starlink integration (no user job)
- Automatic pixel-diff damage accusation (see §2.2)
- Guest-facing "Unsafe" scores (see §2.7)
- Ads anywhere in the inspection flow (see §2.5)
- Marina persona, 8-role permission matrix at launch

---

## 7. AI Features (what ships, honestly)

| Feature | How | Phase |
|---|---|---|
| Gauge/label OCR (hours, volts, fuel, expiry dates) | Photo → multimodal LLM (cloud) → structured value + confidence; user confirms. Offline: manual entry, photo queued for later verification | 2 |
| Report summarizer | Issues JSON → LLM → professional summary, in report language | 2 |
| Troubleshooting assistant | "Engine hard to start" → causes checklist + "inform operator" advisory; static curated knowledge + LLM fallback, maritime disclaimer | 3 |
| Photo QA | On-device blur/exposure check at capture | 2 |
| Pair-review assist | Check-in/out photo pairs → LLM: "differences worth reviewing?" → flags for human | 3 |
| Damage detection (cracks, corrosion, tears) | Fine-tuned vision model on our own labeled corpus | 4+ (data flywheel starts at launch: every issue photo is labeled by humans in the normal flow) |

All AI outputs are suggestions requiring user confirmation; none auto-populate a signed report. Cloud AI calls go through our backend (API key never in app), are skipped when offline, and never block the flow.

---

## 8. Technology Stack (recommendation)

**Keep the Expo/React Native codebase.** It already carries 5-language content, theming, IAP and store config; the team knows it; Expo dev-builds support everything below.

| Layer | Choice | Why |
|---|---|---|
| App | Expo (RN) + TypeScript + expo-router | existing code, OTA updates (EAS Update), single codebase |
| Local data | **SQLite (expo-sqlite) + Drizzle ORM** | relational inspection data, queryable offline, migrations |
| Media | expo-camera / expo-av; files in app storage; upload queue with resumable uploads | offline-first evidence |
| Sync/backend | **Supabase** (Postgres + Auth + Storage + Edge Functions + Realtime) | fastest path for a small team; Postgres schema below maps 1:1; Realtime powers two-party sessions; EU region for GDPR |
| Sync strategy | Per-entity `updated_at`/`revision` push-pull queue; inspections are effectively single-writer (or section-partitioned in two-party mode) so LWW per field suffices — no CRDT complexity | avoids over-engineering |
| PDF | Server-side (Edge Function + Typst or Puppeteer) for the canonical locked PDF; on-device expo-print fallback for offline preview | consistent professional output |
| AI | Backend Edge Function → Anthropic API (claude-sonnet-5 for OCR/summaries; claude-haiku-4-5 for cheap QA classification) | multimodal OCR + summarization without ML team |
| Payments | RevenueCat (consumer subs, replaces raw react-native-iap) + Stripe (B2B invoicing) | receipt validation solved, web dashboard billing |
| Web (report viewer + fleet dashboard) | Next.js on Vercel, same Supabase | shared types, fast |
| Analytics/crash | PostHog + Sentry | funnel: start→complete→sign→share |

**Signature & lock integrity:** on lock, serialize report JSON → SHA-256 hash → store hash in `reports` + embed in PDF + QR links to `verify/{report_id}` which recomputes and compares. Signature images + signer identity + device + GPS + time in `signatures`. This is "tamper-evident", which is what insurers actually need; qualified e-signatures (eIDAS) only if enterprise customers demand them later.

---

## 9. Database Schema (Postgres; SQLite mirrors it)

```sql
-- Identity & tenancy -------------------------------------------------
create table orgs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text,
  plan text not null default 'free',        -- free | pro | fleet | enterprise
  locale text not null default 'en',
  created_at timestamptz not null default now()
);

create table users (
  id uuid primary key,                       -- = auth.users.id
  display_name text not null,
  email text unique,
  locale text not null default 'en',
  created_at timestamptz not null default now()
);

create table org_members (
  org_id uuid references orgs on delete cascade,
  user_id uuid references users on delete cascade,
  role text not null check (role in ('admin','inspector','viewer')),
  primary key (org_id, user_id)
);

-- Boats & equipment registry ----------------------------------------
create table boats (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references orgs,               -- null = personal boat
  owner_user_id uuid references users,
  name text not null,
  type text not null,                        -- sailing|catamaran|motor|rib|jetski|gulet|fishing
  model text, hull_number text, flag text, home_port text,
  photo_url text,
  created_at timestamptz not null default now()
);

create table equipment (                     -- powers expiry notifications
  id uuid primary key default gen_random_uuid(),
  boat_id uuid not null references boats on delete cascade,
  kind text not null,                        -- extinguisher|flares|liferaft|epirb|first_aid|insurance|engine_service|gas_hose|...
  label text,
  expires_on date,
  service_due_hours int,                     -- for engine service
  meta jsonb not null default '{}'
);

-- Templates ----------------------------------------------------------
create table templates (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references orgs,               -- null = built-in
  boat_type text not null,
  name text not null,
  version int not null default 1,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table template_sections (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references templates on delete cascade,
  sort int not null,
  icon text,
  title jsonb not null                       -- {"en":"Engine","tr":"Motor",...}
);

create table template_items (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references template_sections on delete cascade,
  sort int not null,
  title jsonb not null,
  tip jsonb,
  is_critical boolean not null default false,
  wants_photo boolean not null default false,
  count_expected int,                        -- inventory items: fenders=6 …
  meter text                                 -- fuel|water|engine_hours|battery_v (renders in meters panel)
);

-- Charters & inspections ---------------------------------------------
create table charters (                      -- links check-in ↔ check-out
  id uuid primary key default gen_random_uuid(),
  boat_id uuid not null references boats,
  org_id uuid references orgs,
  guest_name text, guest_email text,
  starts_on date, ends_on date,
  deposit_amount numeric, deposit_currency text,
  status text not null default 'open'        -- open | closed | disputed
);

create table inspections (
  id uuid primary key default gen_random_uuid(),
  charter_id uuid references charters,
  boat_id uuid not null references boats,
  template_id uuid not null references templates,
  template_version int not null,
  kind text not null check (kind in ('check_in','check_out','periodic','survey')),
  status text not null default 'draft',      -- draft | in_review | signed | locked
  inspector_user_id uuid not null references users,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  lat double precision, lng double precision,
  weather jsonb,                             -- captured at start when online
  locale text not null,
  duration_seconds int,
  revision int not null default 0            -- sync
);

create table inspection_items (
  inspection_id uuid references inspections on delete cascade,
  template_item_id uuid references template_items,
  status text not null default 'ok'          -- ok | attention | fail | na
    check (status in ('ok','attention','fail','na')),
  count_found int,
  note text,
  updated_at timestamptz not null default now(),
  primary key (inspection_id, template_item_id)
);

create table meter_readings (
  id uuid primary key default gen_random_uuid(),
  inspection_id uuid not null references inspections on delete cascade,
  meter text not null,                       -- fuel|water|engine_hours|battery_v
  value numeric not null,
  unit text not null,
  ocr_confidence numeric,                    -- null = manual entry
  media_id uuid                              -- gauge photo
);

-- Issues & evidence ---------------------------------------------------
create table issues (
  id uuid primary key default gen_random_uuid(),
  inspection_id uuid not null references inspections on delete cascade,
  template_item_id uuid references template_items,
  severity text not null check (severity in ('low','medium','high','critical')),
  title text not null,
  description text,
  is_preexisting boolean not null default true,   -- check-in: existing damage; check-out: new
  created_at timestamptz not null default now()
);

create table media (
  id uuid primary key default gen_random_uuid(),
  inspection_id uuid not null references inspections on delete cascade,
  issue_id uuid references issues on delete set null,
  kind text not null check (kind in ('photo','video','audio','signature','walkaround')),
  storage_path text,                          -- null until uploaded
  local_uri text,                             -- device-side
  sha256 text,
  taken_at timestamptz not null,
  lat double precision, lng double precision,
  annotations jsonb,                          -- arrows/circles overlay data
  shot_key text,                              -- e.g. 'port_bow' → enables check-out re-capture pairing
  upload_state text not null default 'pending'
);

-- Sign-off, reports, comparison ---------------------------------------
create table signatures (
  id uuid primary key default gen_random_uuid(),
  inspection_id uuid not null references inspections on delete cascade,
  role text not null check (role in ('guest','operator','inspector','witness')),
  signer_name text not null,
  media_id uuid not null references media,    -- the signature image
  signed_at timestamptz not null,
  device_info jsonb
);

create table reports (
  id uuid primary key default gen_random_uuid(),
  inspection_id uuid not null unique references inspections,
  pdf_path text,
  content_hash text not null,                 -- sha256 of canonical JSON
  public_slug text unique,                    -- share/verify link
  generated_at timestamptz not null default now()
);

create table comparisons (                    -- check-out vs check-in
  id uuid primary key default gen_random_uuid(),
  charter_id uuid not null references charters,
  checkin_inspection_id uuid not null references inspections,
  checkout_inspection_id uuid not null references inspections,
  new_issue_ids uuid[] not null default '{}',
  missing_item_ids uuid[] not null default '{}',
  outcome text,                               -- deposit_returned | partial | withheld | disputed
  notes text
);

create table audit_log (
  id bigint generated always as identity primary key,
  entity text not null, entity_id uuid not null,
  action text not null,
  actor_user_id uuid,
  at timestamptz not null default now(),
  detail jsonb
);
```

Row-Level Security: org members see org rows; personal users see own rows; `reports.public_slug` grants tokenized read-only access to the report view. Media in Supabase Storage with signed URLs.

---

## 10. API Structure (REST via Supabase/PostgREST + Edge Functions)

CRUD comes free from PostgREST with RLS. Custom Edge Functions:

```
POST /inspections/{id}/lock          → validate completeness, freeze rows,
                                       compute hash, render PDF, create report
POST /inspections/{id}/session       → create two-party session (QR payload)
POST /ai/ocr                         → {media_id, kind:'gauge'|'expiry'} → value+confidence
POST /ai/summarize                   → {inspection_id, locale} → summary text
POST /ai/pair-review                 → {media_id_a, media_id_b} → differences[]
POST /charters/{id}/comparison       → build check-in/out comparison skeleton
GET  /verify/{slug}                  → public: report metadata + hash validity
POST /billing/webhook                → RevenueCat / Stripe events → orgs.plan
GET  /fleet/stats?org=…              → dashboard aggregates (scores, recurring failures)
```

Sync (mobile): pull `?updated_after=cursor` per table; push queued mutations with `revision` optimistic concurrency; media via resumable upload to Storage, `upload_state` machine (`pending → uploading → done → failed`). Conflicts: field-level LWW; two-party sessions partition writes by section via Realtime presence, so real conflicts are rare by construction.

---

## 11. UX Specification

- **Inspect screen:** section rail as horizontal chips (large, iconic); items as full-width rows; single tap cycles nothing — tap opens a 4-button status sheet ONLY for exceptions (✅ is default, long-press to bulk-confirm a section). Sticky bottom bar: photo shutter + issue tray + Next section. All primary actions in bottom 40% of screen.
- **Status colors:** ✅ subtle (default, not celebratory), ⚠ amber, ❌ signal red, N/A gray. Color-blind-safe icons accompany color.
- **Critical failure advisory:** slide-up banner, red, factual: *"Windlass not working. Anchoring may be unsafe. We recommend informing the charter company before departure."* One button: "Add to report" (already added — button acknowledges). Non-blocking.
- **Sunlight/dark:** existing navy/brass identity kept for brand surfaces (home, reports); the Inspect screen gets a **high-contrast utility mode** (near-white on near-black, no texture) — instrument, not logbook. Auto light/dark.
- **One-thumb:** no top-corner actions during inspection; back = swipe.
- **Empty states = teaching:** first run drops user into a 6-item demo inspection of a fictional boat ("Meltemi") ending with a real PDF — the aha moment is the report, deliver it in minute one.
- **Performance budgets:** cold start < 2 s, shutter-to-saved < 300 ms, zero spinners during inspection (all local writes).

Screen flow (mobile):

```
Onboarding(demo) → Home ─┬─ New Inspection → BoatPicker → TemplateConfirm
                         │      → [Walkaround] → Inspect ⇄ IssueSheet
                         │      → Meters → Inventory → Review → Sign → Locked ✓ → Share
                         ├─ Resume draft → Inspect …
                         ├─ Start Check-out(charter) → GuidedRecapture → PairReview
                         │      → NewDamageList → Sign(both) → Comparison report
                         ├─ History → ReportViewer → Share/Verify
                         └─ Boats → BoatProfile → Equipment(expiries) → Notifications
```

---

## 12. Business Model (revised)

| Tier | Who | Price (anchor) | Includes |
|---|---|---|---|
| **Free** | Guests, casual skippers | €0 | Unlimited basic inspections, 30 photos/inspection, watermarked PDF, 90-day history, all languages |
| **Pro** | Professional skippers, surveyors, owners | €9/mo or €69/yr | Unlimited photos & video, custom templates, branded PDF (no watermark), full history, OCR + AI summary, priority sync |
| **Fleet** | Charter companies | **€15–25 / boat / mo** (volume-tiered) | Everything in Pro + org accounts & roles, two-party sessions, check-in/out comparison & deposit workflow, fleet dashboard, expiry notifications, CSV export |
| **Enterprise** | Large fleets, insurers | Custom | API, white-label, SSO, analytics, DPA/SLA, custom report formats |

Rationale: value scales with boats, not with seats — price per boat. A 20-boat operator paying €400/mo is saving one disputed deposit per month. The consumer app is the free top-of-funnel that makes fleets adopt ("guests arrive with it anyway"). Migration: current AdMob/€-subscription users grandfather into Free/Pro; ads sunset per §2.5.

**North-star metric:** signed reports per month. Guardrails: median inspection duration ≤ 7 min; % inspections completed offline that sync successfully ≥ 99%.

---

## 13. Development Roadmap

| Phase | Duration | Scope | Exit criteria |
|---|---|---|---|
| **0 — Foundation** | 2 wk | Restructure current app: expo-router, SQLite+Drizzle, Supabase project, auth, seed 6-section templates from existing 545-item × 5-language content; remove ads from new flow | Template data driven from DB; existing checklist mode still works |
| **1 — Inspection MVP** | 6 wk | Inspect screen (exception-based), issues + photo/voice, meters, inventory, critical advisories, boat profiles, local PDF, offline storage | 10 pilot users complete real check-ins ≤ 10 min; PDF praised |
| **2 — Trust layer** | 5 wk | Signatures + lock + hash + verify link, server PDF, share web viewer, sync + media upload queue, OCR prefill, AI summary, RevenueCat tiers | First deposit dispute resolved using a MarinCheck report |
| **3 — Two-sided** | 6 wk | Charters, check-out guided re-capture + pair review, two-party QR sessions, equipment registry + expiry notifications, FR/IT/EL/HR content, Pro tier launch | 3 charter operators piloting Fleet tier |
| **4 — Fleet** | 6 wk | Web dashboard (Next.js): inspections, filters, boat history, recurring failures, internal scoring, CSV; org roles; Stripe B2B billing | First paying fleet customer |
| **5 — Moat** | ongoing | Damage-detection model training on accumulated corpus, insurer report formats, API/white-label, integrations (weather, Navionics deep links) | Insurance partnership LOI |

Team assumption: 2 mobile/full-stack devs + 1 designer (+ founder doing sales from Phase 3). AI is API-based; no ML hires before Phase 5.

**Top risks:** (1) two-party adoption chicken-and-egg → mitigate: single-party reports are already valuable; (2) media storage costs → mitigate: client-side compression, tiered retention; (3) seasonality (Med Apr–Oct) → time B2B launch for winter boat-show season (METS, Boot Düsseldorf); (4) legal weight of signatures varies by country → position as evidence, not contract, until counsel review.

---

## 14. Open Questions (for product owner)

1. Brand: keep **MarinCheck** or rename for the "standard" positioning? (Domain/trademark check needed either way.)
2. First B2B market: Türkiye (home advantage, gulet segment untouched) or Croatia/Greece (largest bareboat fleets)?
3. Do we keep the legacy free checklist mode (with ads) as a separate lightweight app, or fold it into Free tier and drop ads immediately?
4. Pilot partners: which 2–3 charter operators can we sign for Phase 3 pilots before building the dashboard?
```
