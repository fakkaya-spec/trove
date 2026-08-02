# TROVE implementation roadmap

_Locked product model: trip companion — **Prepare → Underway → Complete**;
navigation **Trip · Log · Vessel**. Brand locked: C0 symbol + DM Sans wordmark
(`src/components/brand/`). See `docs/MONETIZATION.md` for the locked premium
model (photo evidence = Premium)._

| Phase | Scope | Monetization hooks | Status |
|---|---|---|---|
| **P1** | Brand rename, C0 `TroveMark`, wordmark asset, bundle IDs `com.kosko.trove`, slug `trove` | — | ✅ `bf76471` |
| **P2** | 3-tab navigation Trip · Log · Vessel; Settings via gear in Trip header (decision: no 4th tab); all legacy routes preserved as stack screens | — | ✅ |
| **P3** | First-launch welcome + bundled sample trips (Serenity/Aurora/Nomad), `is_sample` isolation + tests | Sample photos visible to everyone (rule 5); never copied into real records | ✅ |
| **P4** | Trip Prepare experience (crew, provisioning, shopping, checklist, check-in) | **Entitlement service + paywall land here** (context `inspection_photo`); IAP vendor decision (Option A default — see MONETIZATION audit); TROVE SKUs | ✅ `2f11f88` |
| **P5** | Underway + Log (log DB migration, capture flow) | Context `log_photo`; text-only entries always free (rule 1) | pending |
| **P6** | Complete: check-out, handover, sign-off, **PDF report via expo-print** (approved) | Contexts `handover_pair`, `report_photo`; expired-premium photos stay readable in reports | pending |
| **P7** | Photo pipeline: compression + thumbnails via expo-image-manipulator (approved), offline queue, retention config | Context `gallery_import`; offline entitlement grace (rule 6); pipeline never loses local evidence (rule 10) | pending |
| **P8** | Tests (incl. entitlement gates + sample isolation), typecheck/lint/migrations, device validation | Paywall context tracking verified | pending |

Pre-public-beta requirements (release blockers, not phases):
- **"Select and configure a privacy-safe centralized analytics solution
  capable of measuring activated users and triggering the 100-user founder
  milestone."** Contract & activation rule: `docs/ANALYTICS-EVENTS.md`.
  The founder milestone system is a release-planning dependency, NOT a
  mobile feature — no fake local counters in the consumer app; the alert
  lives in a founder dashboard/email channel outside the app. Provider is
  deliberately unchosen; no tracking code before consent UX exists.

Standing decisions:
- Settings = existing Profile screen as a stack page behind a gear icon in the
  Trip header. Never a bottom tab.
- Report is an output of a trip, never a navigation destination.
- Offline is a sync state, not a screen.
- No new billing dependency without explicit approval (MONETIZATION rule 8).
