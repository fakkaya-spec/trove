# TROVE Monetization — LOCKED product requirement

## Decision record — monetization philosophy (LOCKED 2026-08-02)

_Frozen until real beta data, new user research, or an explicit owner request
reopens it. Recorded here so no session re-debates it._

1. **Free must be genuinely useful.** Every important module (trips,
   provisioning, shopping, checklists, inspections, text log, crew, basic
   trip record) works end-to-end without paying. TROVE never monetizes by
   making the free product useless.
2. **Premium is the professional version, not a locked door.** It improves
   intelligence, detail, speed, convenience, confidence, professional
   quality, automation or security of the SAME experience.
3. **Each module has its own natural upgrade moment** — shown when the user
   asks for a meaningfully better result, never interrupting basic work.
   Benefit-led copy; no dark patterns, countdowns or fake urgency.
4. **Metering unit and limits are deliberately undecided** (free photo
   count, trip/inspection/report metering, Trip Pass, prices, rewarded ads,
   cloud/AI quotas). No arbitrary limits or prices may be coded before beta
   evidence. Store prices come only from the store.
5. Current v1 gate: photo evidence capture/import/attach via the central
   entitlement service (contexts below + `settings` discovery entry).
   Reading existing records is never gated.

### Alignment update (owner decision, 2026-08-02)

6. **Premium is DEPTH, not features.** Every major workflow is complete and
   genuinely useful for free; Premium makes the SAME workflow deeper,
   smarter, more professional — never replaces it. Applies consistently:
   provisioning (free: days+people→complete list · premium: dietary/allergy/
   children profiles, meal planning, marina re-supply, budget), reports
   (free: complete report · premium: professional formatting, multilingual,
   richer evidence, signatures), inspection (free: complete · premium:
   richer evidence, comparisons, better documentation).
7. **Beta = no monetization.** The first ~100 real beta users experience the
   complete product with NO monetization, to observe real behaviour before
   deciding what becomes Premium and where upgrade moments belong.
   _Implementation note (deferred, one-line thanks to the central seam):
   before the beta build ships, the entitlement policy gets a beta-full-
   access switch so the existing photo gate does not fire for beta users.
   Not implemented yet — beta-readiness item._
8. **Partner openness.** Architecture stays open for future integrations
   (Boatsy, Click&Boat, SamBoat, Borrow A Boat, marina reservation,
   insurance partners) — long-term business options, NOT MVP features.
   Satisfied today by the platform-capability discipline (pure engines +
   typed repositories, UI-detachable); no partner UI/code before a partner
   exists.


_Status: locked by product owner (2026-07-31). Applies from the photo/entitlement
phases onward (Roadmap P4–P8). Nothing here is implemented in Phase 1._

## Core decision

**Photo evidence is a Premium feature.**

### Free users can

- create vessels and trips
- use trip planning
- manage crew and guests
- generate provisioning and shopping lists
- use checklists
- create **text-only** observations and log entries
- view bundled sample photos
- view photos they previously created while Premium
- open and share existing reports according to the eventual plan limits

### Premium is required to

- open the camera from TROVE
- capture a new photo
- import a photo from the gallery
- attach photos to inspections, issues, log entries or handovers
- create guided check-in/check-out photo pairs
- store and synchronize new photo evidence
- include newly captured photo evidence in reports

## UX rules (locked)

1. **Never block saving.** An issue or safety observation must always be savable
   as a text-only record, regardless of plan. The photo attachment is gated —
   the record is not.
2. When a free user taps a camera, gallery or photo-evidence action, open a
   clear Premium paywall explaining the practical benefit:
   _“Add timestamped photo evidence, compare check-in and check-out, and keep a
   visual record of your boat.”_
3. No generic errors, no silently disabled camera buttons. Every gate explains
   itself.
4. **Evidence is never held hostage.** Existing photos remain readable after
   Premium expires; expiry only removes the ability to capture/import/attach
   new ones.
5. Sample vessels may contain bundled demonstration photos visible to everyone.
   Sample photos must never be copied into real user records.
6. **Offline entitlement:** if Premium was verified previously, photo capture
   works offline for a cached entitlement grace period. Media is queued locally
   and entitlement is revalidated when connectivity returns. If revalidation
   later fails, evidence already captured is **never deleted or hidden**.
7. **One centralized entitlement service/hook.** Screens never check the
   subscription directly; they ask the entitlement layer for a capability
   (e.g. `canCapturePhoto`). No scattered plan checks.
8. No new billing dependency may be added without first presenting the existing
   IAP system and migration implications (see audit below).
9. Paywall entry context is tracked (locally for now, analytics layer later):
   `inspection_photo` · `log_photo` · `handover_pair` · `gallery_import` ·
   `report_photo`.
10. Photo compression and thumbnail generation are Premium infrastructure, but
    the storage pipeline must never silently lose local evidence.

## Existing IAP implementation — audit (rule 8 deliverable)

What the repository already contains:

| Piece | State |
|---|---|
| `react-native-iap` **v15.6.2** (OpenIAP API) | In `package.json`. Loaded lazily via `src/iap.ts` (`getIap()` returns `null` when the native module is absent — Expo Go/web keep working). Web stub: `iap.web.ts`. |
| `src/premium.tsx` — `PremiumProvider` / `usePremium()` | Working client-side flow: `initConnection`, purchase + error listeners, `fetchProducts`, `requestPurchase` (iOS/Android request shapes), `getAvailablePurchases` restore, `finishTransaction`, `__DEV__` toggle. |
| Entitlement cache | `AsyncStorage` key `marincheck:premium` (`"1"`/`"0"`), loaded at startup — offline launches keep the entitlement. **No timestamp / grace window yet.** |
| `src/premiumState.ts` | Non-React accessor used by the legacy ads layer. |
| SKUs | `marincheck_premium_monthly` / `marincheck_premium_yearly` — **never created in any store console**, so they can be renamed to `trove_*` freely at implementation time. |
| Validation | Client-side only. No server receipt validation. |
| Current purpose | Legacy “remove ads” (whole flow hidden behind `features.legacyChecklists = false`). |
| Native-build status | **Unverified on RN 0.86.** The ads native module is known not to compile on 0.86; `react-native-iap` must be compile-tested in a native build before the entitlement phase relies on it. |

### Options and migration implications

**Option A — keep `react-native-iap` (default, no new dependency):**
reuse `PremiumProvider` as the transport; add on top: entitlement service with
capability flags, `lastVerifiedAt` + grace window in the cache, TROVE SKUs,
paywall contexts. Cost: client-side validation only; cross-device entitlement
and refund handling stay weak until a server exists. Risk: RN 0.86 compile must
be proven.

**Option B — RevenueCat (`react-native-purchases`):** server-side receipt
validation, entitlement caching with built-in grace, cross-platform entitlement,
paywall analytics — at the cost of a **new native dependency + external account
+ vendor coupling**. Per rule 8 this requires explicit approval before being
added; it is _not_ approved yet.

**Recommendation:** implement the entitlement service interface first (it hides
the vendor), start on Option A, and revisit Option B only if receipt-validation
weaknesses become real. The decision point is the start of Roadmap P4.

### Planned architecture (for the entitlement phase)

- `src/entitlement/` — single service + hook exposing capabilities
  (`canCapturePhoto`, `canImportPhoto`, `canAttachPhoto`, …), cached
  verification state `{ isPremium, lastVerifiedAt }`, offline grace policy, and
  `requestAccess(context)` which either resolves (entitled) or opens the paywall
  with the given context. Screens call **only** this.
- Paywall screen: single component, receives context, shows the locked benefit
  copy above, uses `usePremium().purchase/restore` underneath.
- Media queue: capture writes locally first (existing behavior), sync/upload
  state stays in `media_assets.upload_state` — entitlement failures never touch
  local files.
