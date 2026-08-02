# TROVE Premium System — Implementation Audit
## Design System v1.0 vs GitHub Repository (fakkaya-spec/trove, main, August 2026)

---

## Audit Scope

**Design reference:** TROVE Premium Design System v1.0 (frozen)
**Web reference:** `design-reference/src/app/App.full.tsx` (Figma Make mockup, not production)
**Production codebase:** `fakkaya-spec/trove`, branch `main`

**Production files examined:**
- `src/premium.tsx` — IAP provider
- `src/premiumState.ts` — external entitlement store
- `src/iap.ts` / `src/iap.web.ts` — IAP abstraction
- `src/screens/PremiumScreen.tsx` — paywall screen
- `src/screens/trip/` — all trip screens
- `src/screens/inspection/` — inspection screens
- `src/screens/log/` — log screens

---

## Summary

| Category | Status |
|---|---|
| IAP infrastructure | ✅ Substantially complete |
| Entitlement state management | ✅ Exists, partially aligned |
| Paywall screen (design) | ⚠️ Exists, significantly misaligned |
| Paywall copy | ❌ Not implemented |
| Module upgrade sheets | ❌ Not implemented |
| Premium entry points on feature screens | ❌ Not implemented |
| Session frequency protection | ❌ Not implemented |
| inActiveFlow protection | ❌ Not implemented |
| KeelLine semantic fix (amber for observations) | ❌ Not applied in RN codebase |
| Success confirmation bar | ❌ Not implemented |
| Entitlement states screen | ❌ Not implemented |
| Usage guide screen | ❌ Not implemented |

---

## Detailed Findings

### IAP-1 · SKU Naming
**Design section:** §5 — IAP infrastructure

**Current status:** `src/premium.tsx` has a full `PremiumProvider` with `react-native-iap` integration. Handles purchase, restore, offline caching via AsyncStorage, price loading, `devToggle`.

**Gap:** SKU identifiers are `marincheck_premium_monthly` / `marincheck_premium_yearly` — the old app name prefix. The product is now TROVE.

**Priority:** Medium
**Effort:** 30 minutes — rename SKU constants, update App Store Connect / Google Play Console product IDs.
**Phase:** 3 (before monetization activation)

---

### IAP-2 · Cached State Badge
**Design section:** §5 — Offline state / §2 — Badge semantics

**Current status:** `premiumState.ts` correctly preserves entitlement across offline sessions via AsyncStorage.

**Gap:** No UI indicator for the cached/offline state. Design specifies a `"✦ Cached"` badge in T.ink2 in Settings when last verification was offline.

**Priority:** Medium
**Effort:** 2 hours — add entitlement source tracking (live vs cached) to `premium.tsx`. Surface "Last verified [date]" in Settings.
**Phase:** 3

---

### PAYWALL-1 · Paywall Screen Visual Design
**Design section:** §5 — Full-screen paywall

**Current status:** `src/screens/PremiumScreen.tsx` is functional but uses the old `colors.*` token system (colors.brass, colors.seafoam, colors.night) rather than T tokens.

**Specific misalignments:**
- Star emoji ⭐ header instead of T.vessel dark header with wordmark
- No "More capable. More professional." headline
- No "A smarter version of the same TROVE." subline
- Benefit list uses ✓ checkmarks instead of 2px T.blue left accent bars
- Side-by-side monthly/yearly pricing cards — design specifies single CTA with inline price
- No FREE VS PREMIUM comparison table
- No "Not now" secondary dismiss action
- `ActivityIndicator` spinner for loading — design specifies left-to-right fill inside button
- Uses system `Alert.alert` for error — design specifies inline T.red text

**Priority:** High
**Effort:** 1 day — rebuild PremiumScreen.tsx UI layer. IAP logic (usePremium hook) is reusable.
**Phase:** 2

---

### PAYWALL-2 · Approved Copy Library
**Design section:** §6 — Upgrade Copy Library

**Current status:** PremiumScreen.tsx uses i18n keys from `useLocale()` hook. Strings predate the approved copy library.

**Gap:** All premium-related i18n strings must be replaced with approved copy. Missing: module headlines, benefit lines, explanation copy, entitlement state messages, legal copy, comparison table prose.

**Priority:** High — prerequisite for all upgrade surface work
**Effort:** 4 hours — audit i18n file, replace all premium strings, add missing keys.
**Phase:** 2 (first task in sequence)

---

### UPGRADE-1 · Module Upgrade Sheets
**Design section:** §5 — Modal Upgrade Sheet

**Current status:** No upgrade sheet component exists in the RN codebase.

**Gap:** A reusable `UpgradeSheet` component configured per module with handle bar, module icon, benefit-led title, explanation, 2–4 benefit lines with 2px T.blue left accent, optional "Coming later" section, preservation note, primary CTA, "Continue with free" secondary.

Five module configurations required: provisions, inspection, log, crew, report.

**Priority:** Critical
**Effort:** 2 days — build `UpgradeSheet` as RN bottom sheet (using @gorhom/bottom-sheet or equivalent), define five module configs from approved copy library, connect `usePremium` hook to CTA.
**Phase:** 2

---

### ENTRY-1 · Premium Entry Points on Feature Screens
**Design section:** §3 — Global Premium Entry Rules / §4 — Module Specifications

**Current status:** Zero Premium entry points exist on any feature screen in the RN codebase.

**Gap:** Five targeted edits to existing screens:

1. `ProvisioningScreen.tsx` — after generated shopping list: inline row "Personalize for your crew" / "Personalize" pill → navigates to provisions upgrade sheet
2. `CrewScreen.tsx` — after guests section: "Add crew preferences" / "Personalize" pill → crew upgrade sheet
3. `ChecklistScreen.tsx` (check-in) — after check items: "Add photo evidence and condition comparison" / "Add evidence" pill → inspection upgrade sheet
4. Log entry screen — below camera area: "Add photo evidence and richer context" / "Premium" pill → log upgrade sheet
5. `TripReportScreen.tsx` — below document export card: T.vessel background CTA "Create professional report" → report upgrade sheet

**Priority:** Critical
**Effort:** 1 day — five targeted edits to existing screen files.
**Phase:** 2

---

### ENTRY-2 · Session Frequency Protection
**Design section:** §3 — "more than once per session per module"

**Current status:** No session-level tracking of upgrade sheet views.

**Gap:** Once a user dismisses an upgrade sheet for a module, it must not appear again for that module in the session. Requires a session-scoped `dismissedModules` set.

**Priority:** High
**Effort:** 3 hours — add `dismissedModules` set to session context or lightweight hook. Each upgrade sheet checks on mount.
**Phase:** 2

---

### PROTECT-1 · inActiveFlow Safety Flag
**Design section:** §3 — "When Premium Must Never Appear" / §7 — Founder Principle 5

**Current status:** No `inActiveFlow` flag or equivalent protection exists.

**Gap:** Premium entry points must be invisible during: active checklist, log entry in progress, emergency observation logging. Requires a session-level `inActiveFlow` boolean set to `true` during these flows.

**Priority:** Critical (safety-adjacent)
**Effort:** 4 hours — add `inActiveFlow` to session context, wire to screen entry/exit events, condition all entry points on `!inActiveFlow`.
**Phase:** 2 (must precede ENTRY-1)

---

### KEELLINE-1 · Amber Color for Observation Cards (RN)
**Design section:** §2 — KeelLine semantic rule

**Current status:** The web reference (App.full.tsx) is corrected — observation cards use T.amber left bar. RN codebase not yet audited.

**Gap:** In `UnderwayScreen.tsx`, log screens, and `CheckoutScreen.tsx`: any observation or alert card using a blue left border must be corrected to T.amber.

**Priority:** High
**Effort:** 2 hours — audit and correct observation card colors in RN screens.
**Phase:** 1 (pre-beta, design consistency)

---

### KEELLINE-2 · CheckoutScreen Accessibility (Arrow Prefixes)
**Design section:** §2 — CheckoutScreen comparison (design review finding A-4, P0 accessibility)

**Current status:** Web reference corrected with ↑ Check-in / ↓ Check-out arrow prefixes. RN `CheckoutScreen.tsx` not yet audited.

**Gap:** If the comparison table differentiates columns using color only, this is a WCAG AA accessibility failure.

**Priority:** Critical (accessibility)
**Effort:** 1 hour — add directional arrow prefixes to column headers in `CheckoutScreen.tsx`.
**Phase:** 1

---

### CONFIRM-1 · Success Confirmation Bar
**Design section:** §2 — Success state

**Current status:** No success banner component. Post-purchase feedback is limited to rendering the "isPremium" active view on PremiumScreen.

**Gap:** Design requires a top-of-screen confirmation bar: T.greenL background, T.green text, "✦ Premium activated", auto-dismissing after 3 seconds. User returns to previous screen immediately.

**Priority:** High
**Effort:** 4 hours — build `SuccessBanner` component with Animated.View slide-down, triggered by `justPurchased` state in PremiumProvider.
**Phase:** 3

---

### STATES-1 · Entitlement State Handling
**Design section:** §5 — Entitlement States (9 states)

**Current status:** Functional states exist in `premium.tsx`. Error uses `Alert.alert`. Cancelled has no user-facing feedback. Restore has no success feedback. Cached state has no UI indicator.

**Gap:**
- Error: `Alert.alert` → inline T.red text, no modal
- Cancelled: no feedback → "No changes made." inline
- Cached/offline: no UI → "✦ Cached" badge in Settings
- Restore successful: no feedback → success confirmation bar "✦ Premium restored."
- Expired with existing content: not handled → "Recorded previously" badge on content

**Priority:** High
**Effort:** 1 day — refactor PremiumProvider to expose a richer entitlement state enum, update all UI states to inline copy and T tokens.
**Phase:** 3

---

### TOKENS-1 · T Token System in RN Codebase
**Design section:** §2 — Premium Design Language (tokens)

**Current status:** `src/theme.ts` uses old token system: `colors.brass`, `colors.seafoam`, `colors.night`, etc.

**Gap:** All new Premium UI components must use the T token system. The T tokens must be added to `src/theme.ts` or a new `src/tokens.ts`. Existing screens using `colors.*` are not changed.

**Priority:** Critical — blocks all new component work
**Effort:** 4 hours — add T token object to RN codebase. The canonical values are in `design-reference/tokens.ts`.
**Phase:** 2 (second task in sequence, after PAYWALL-2)

---

### NAV-1 · Premium Screen Navigation Header
**Design section:** §5 — Full-screen paywall (no bottom nav, custom dismiss header)

**Current status:** `PremiumScreen` uses `navigation.setOptions({ title: t.premiumScreenTitle })` — standard RN navigation header.

**Gap:** Premium screens need `headerShown: false` with a custom T.vessel header containing the dismiss X button.

**Priority:** Medium
**Effort:** 3 hours — configure PremiumScreen route with headerShown: false, implement custom header within the component.
**Phase:** 2

---

## Implementation Sequence

### Phase 1 — Pre-beta corrections (no new features)

| # | Task ID | Description | Effort |
|---|---|---|---|
| 1 | KEELLINE-2 | Fix arrow prefixes on CheckoutScreen comparison headers | 1h |
| 2 | KEELLINE-1 | Fix amber color for observation cards in RN screens | 2h |

**Total Phase 1: ~3 hours**

### Phase 2 — Beta preparation (complete before first user)

| # | Task ID | Description | Effort |
|---|---|---|---|
| 3 | PAYWALL-2 | Add complete approved copy library to i18n | 4h |
| 4 | TOKENS-1 | Add T token object to RN theme.ts | 4h |
| 5 | PROTECT-1 | Add inActiveFlow session flag — wire to all active flows | 4h |
| 6 | ENTRY-1 | Add five Premium entry points to feature screens | 1d |
| 7 | UPGRADE-1 | Build reusable UpgradeSheet + five module configurations | 2d |
| 8 | PAYWALL-1 | Rebuild PremiumScreen.tsx visual design | 1d |
| 9 | ENTRY-2 | Add session-level dismissed module tracking | 3h |
| 10 | NAV-1 | Hide bottom nav, implement custom dismiss header | 3h |

**Total Phase 2: ~6 days**

### Phase 3 — Monetization activation (before enabling purchases)

| # | Task ID | Description | Effort |
|---|---|---|---|
| 11 | CONFIRM-1 | Build SuccessBanner component | 4h |
| 12 | STATES-1 | Refactor entitlement state handling — remove Alert patterns | 1d |
| 13 | IAP-2 | Add cached/offline state badge to Settings | 2h |
| 14 | IAP-1 | Rename SKU identifiers from marincheck_ to trove_ prefix | 30m |

**Total Phase 3: ~2.5 days**

### Phase 4 — Post-beta, driven by real user data

- Partner integration surfaces (generic location layer in Underway screen)
- Vessel Premium module (engine log, maintenance scheduler)
- AI feature module shell
- Trial state UI (designed, not yet activated)
- Expired subscription content tagging (data layer decision)
- Promotional pricing mechanics
- Android platform review

---

*Audit complete. Design System frozen. No further design changes before beta-user feedback warrants revision.*
