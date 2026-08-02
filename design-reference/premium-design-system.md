# TROVE Premium Design System v1.0
## FROZEN — August 2026

*This document is the approved implementation reference. No changes may be made without real beta-user feedback justifying the revision. All future Premium decisions are evaluated against the principles stated here.*

---

## 1. Core Philosophy

### Free vs Premium Philosophy

Premium TROVE does not unlock what was hidden. It deepens the same workflow. The free user completes a full, responsible trip. The Premium user completes the same trip with greater personalization, richer evidence, and more professional outputs.

The free experience must never feel like a deliberate reduction. It must feel like a complete product. Premium must feel like the same complete product — with more capability layered on top of it.

The test for every feature decision: can a free user finish this workflow responsibly and without frustration? If no, the gating is wrong. Fix it.

### The Horizon, Not Gate Principle

A gate stops you and demands payment before you proceed. A horizon shows you what is possible and invites you toward it.

Every Premium entry point in TROVE must feel like a horizon. The user sees what Premium offers in the context of work they have already done. The free result is visible. The premium enhancement is shown as a natural continuation — not as a wall.

In practice: when the user generates a basic provisioning plan, they see the result. Below it, calmly: "Personalize for your crew's dietary needs." The free plan remains. The premium invitation is additional, not conditional.

The gate says: "Pay or you cannot pass." The horizon says: "Here is where you are. Here is where you could go."

### Professional, Not Luxurious

Luxury is decorative. It signals status. Professional is functional. It signals capability. It produces outputs that justify themselves.

TROVE Premium must always feel professional, never luxurious.

Every Premium enhancement must answer: "Does this produce a demonstrably better outcome?" If the answer is only "it looks nicer," it is not a Premium feature — it is a design polish issue that should be fixed in the free version.

### Calm, Trustworthy, Notebook Feeling

TROVE's visual language is derived from the physical logbook. Deliberate. Quiet. A record that will be read later by someone who was not there.

No celebration animations. No confetti. No fanfare. A quiet confirmation. A small check. A return to work.

Urgency, scarcity, and countdown timers are categorically incompatible with this product.

### Never Interrupt the User During Stressful Moments

Protected flows where Premium must never appear:
- Any checklist item during pre-departure
- Any check-in or check-out inspection item
- Any log entry in progress
- Any navigation or weather context screen during underway phase
- Any emergency or observation logging

Premium invitations appear only at natural resting points: after a flow is complete, at the beginning of a new flow, or at contextual moments when the user has paused.

---

## 2. Premium Design Language

### Colors

No new colors. The existing TROVE T token system with specific semantic assignments.

- **T.vessel (#090C18)** — Premium headers, dark surfaces
- **T.blue (#005FCC)** — Single primary CTA per upgrade surface. One use per surface.
- **T.green / T.greenL** — Successful purchase, restored entitlement, active badge
- **T.amber / T.amberL** — Expired subscription with existing content. Never for purchase error.
- **T.red / T.redL** — Purchase error only. Never for subscription expiry.
- **Premium badge (active):** T.blue background, white text
- **Free state:** No badge. Absence of badge IS the free indicator.

Never used: gold, gradients not already in the approved system, new colors, silver, purple.

### Typography

- **Upgrade headings:** fontSize 19–26, fontWeight 700, letterSpacing -0.4 to -0.6px
- **Benefit text:** fontSize 13, fontWeight 400, color T.ink0, lineHeight 1.55
- **Section labels:** fontSize 11, fontWeight 600, color T.ink3, letterSpacing 0.4px, uppercase
- **Legal / footer:** fontSize 10, color T.ink3, centered, lineHeight 1.6 — never smaller than 10px
- **CTA button:** fontSize 14–15, fontWeight 700, letterSpacing -0.2px
- **Secondary action:** fontSize 13, fontWeight 500, color T.ink2
- **IBM Plex Mono:** Only for machine-measured values (price, timestamps, doc IDs). Never for marketing copy.
- **✦ mark (U+2736):** Sole visual indicator of Premium status in badges. Never decorative.

### Spacing

- Sheet padding: 20px horizontal, 4px top (below handle), 32px bottom safe area
- Between benefit lines: 8px bottom margin
- Handle bar: 32px wide × 3px tall, T.surfaceEl, borderRadius 99, centered
- Sheet border radius: 20px top corners only, flush bottom
- Between primary and secondary CTA: 10px
- Paywall header padding: 14px top, 20px horizontal, 28px bottom

### The ✦ Badge Variants

| State | Background | Text | Label |
|---|---|---|---|
| Active Premium | T.blue | #FFF | ✦ Premium |
| Trial | T.amberL | T.amber | ✦ Trial |
| Cached / Offline | T.surfaceEl | T.ink2 | ✦ Cached |
| Restored | T.greenL | T.green | ✦ Restored |
| Expired content | T.amberL | T.amber | Recorded previously |
| Purchase error | T.redL | T.red | Unable to complete |
| Free | — | — | No badge |

### Motion (Design Intent, Ship Static)

- **Sheet entry:** slide up 280ms, cubic-bezier(0.32, 0.72, 0, 1). Backdrop fades 200ms.
- **Sheet exit:** slide down 220ms, cubic-bezier(0.4, 0, 1, 1)
- **Badge on success:** fade in 180ms. No pop, no scale.
- **Never:** confetti, celebration particles, pulsing upgrade buttons, dramatic reveals.

### Success State

No full-screen success. A small confirmation bar slides down from top:
`T.greenL background, T.green text, "✦ Premium activated"`
Auto-dismisses after 3 seconds or on tap. User returns to previous screen.

---

## 3. Global Premium Entry Rules

### When Premium Can Appear

1. After a flow completes — free result visible, upgrade below it
2. At the start of a new flow, before any work begins
3. When the user explicitly requests a Premium-only output
4. At natural section boundaries within a screen
5. From Settings or Profile screen — always available, never intrusive

### When Premium Must Never Appear

1. During any active checklist
2. During log entry — from tap to save or cancel
3. During emergency observation logging
4. Immediately after a purchase error
5. More than once per session per module
6. After explicit dismissal in the current session
7. On Welcome screen or first-launch flow
8. During Underway phase in any operational context

### Copy Tone Requirements

- **Honest:** The claim must be true.
- **Specific:** "Per-person dietary needs and allergies" — never "Better experience"
- **Calm:** No exclamation marks. No urgency. No "Limited time."
- **Respectful of free choice:** "Continue with free" — never "Give up" or "Decline"
- **Outcome-focused:** Describe what improves, not what feature enables it.

### Visual Hierarchy

Exactly one primary action (T.blue filled button) and one secondary action (text, T.ink2) per upgrade surface. No social proof. No testimonials. No ratings.

### Interaction Rules

- **Swipe to dismiss:** 120px downward travel
- **Backdrop tap to dismiss:** same as "Continue with free"
- **Session behavior:** Once dismissed per module, does not appear again that session
- **No confirm-to-dismiss:** One gesture, dismissed
- **Restore purchase:** Always present as text link. Works offline.

---

## 4. Module Specifications

### Inspection

**Free:** Complete inspection checklist. Every item markable. Observations flaggable. Basic camera capture. Check-in and check-out both fully functional.

**Premium:** Photo evidence slot per check item linked to that item. Check-in vs check-out comparison with photos. Discrepancies automatically flagged. Missing evidence indicator. Professional condition report with photo evidence by section.

**Must remain free forever:** Complete checklist. Observation flagging. Timestamps. Basic inspection record.

**Must never become Premium:** Ability to mark safety-critical items. Ability to flag emergencies.

### Log

**Free:** Unlimited text log entries. Basic photo capture. Automatic timestamps. Location capture. Full logbook searchable by date.

**Premium:** Multiple photo attachments per entry with captions. Audio note with transcription. Intelligent categorization. Cross-trip searchable history. Auto-generated daily log summary.

**Must remain free forever:** All text entry. Basic photo capture. Location tagging. Severity flagging. Complete logbook. Export.

**Must never become Premium:** Saving a log entry. Flagging an emergency.

### Provisioning

**Free:** People count + days + complete provisioning list by category. Quantities per person per day. The free plan is accurate and genuinely useful.

**Premium:** Per-person dietary profiles. Vegetarian/child/allergy adjustments. Meal planning by day and meal. Anchorage re-supply assumptions. Budget and storage constraints.

**Must remain free forever:** Basic provisioning calculation. Shopping list. Check-off. Share.

**Must never become Premium:** Water quantity calculation. Safety supply tracking.

### Crew

**Free:** Name, role, trip participation, TROVE access, single dietary note.

**Premium:** Full dietary profile, allergies (linked to provisioning), emergency contact, personal preferences, notes. Crew summary sheet. Provisioning calculator integration.

**Resolution:** Allergy information is free. Automatic provisioning integration is Premium.

**Must remain free forever:** Names and roles. Trip participation. Basic dietary note. TROVE invitation.

### Reports

**Free:** Trip summary with vessel details, dates, crew, timestamps, key readings, open observations, logbook summary, skipper sign-off. Exportable via native share. A genuinely useful document — not a degraded version of the Premium report.

**Premium:** Condition comparison with photos. Digital signature. Multilingual output. Professional PDF with proper page structure. Verifiable document ID. Future: shareable web package.

**Must remain free forever:** Trip summary. Observation list. Basic export. Sign-off by name. Data export in any format.

**Must never become Premium:** Exporting a record of the trip at all. A trip record is the user's data.

### Vessel

**Free:** Full vessel profile — name, type, manufacturer, model, year, LOA, engine, HIN, registration. Photo strip. Past trip history. Basic statistics.

**Premium:** Engine log with hours per trip chart. Maintenance scheduler with reminders. Document storage (survey, registration, insurance). Condition trend across multiple trips.

**Must remain free forever:** Complete vessel profile. All identification information. Past trip history.

### AI Features (Future)

AI features are Premium-native. Never retrofitted to the free tier with artificial limits. If an AI feature exists, it is fully functional for Premium users or absent entirely. No "3 AI suggestions per month" caps.

Future AI modules: Provisioning AI, Log AI (voice + pattern recognition), Inspection AI (photo degradation comparison), Weather AI (passage recommendations), Marina AI (reservation pre-fill).

---

## 5. Paywall System

### Modal Upgrade Sheet — Structure

1. Handle bar — 32×3px, T.surfaceEl, centered, 12px from top
2. Module icon — 44×44 container, specific feature icon
3. Benefit-led title — fontSize 19, fontWeight 700
4. One-sentence explanation — fontSize 13, T.ink2
5. "WHAT IMPROVES" section label
6. 2–4 benefit lines — each with 2px T.blue left accent
7. "Coming later" section (optional) — 2px T.surfaceEl left accent, T.ink3 text
8. Preservation note (where applicable) — fontSize 12, italic, T.ink2
9. Primary CTA — T.blue filled, full width
10. "Continue with free" — fontSize 13, T.ink2, text button, full width

### Full-Screen Paywall — Structure

1. T.vessel header
   - TROVE wordmark — fontSize 15, fontWeight 800, white
   - Dismiss button — X icon, 32×32, rgba(255,255,255,0.10) bg
   - 28×2px T.blue accent line
   - Headline: "More capable. More professional." — fontSize 26, fontWeight 700
   - Subline: "A smarter version of the same TROVE." — fontSize 13, rgba(255,255,255,0.50)
2. "WHAT IMPROVES WITH PREMIUM" — 5 items with 2px T.blue left accents
3. Divider
4. "FREE VS PREMIUM" comparison table — prose only, no checkmarks
5. Divider
6. Upgrade CTA — T.blue button, price note, Restore + Not now links, legal footer

### Comparison Table (Prose Only)

| Feature | Free | Premium |
|---|---|---|
| Provisioning | Quantities per group | Personalized per person |
| Inspection | Core check items | Evidence and comparison |
| Logbook | Text observations | Text, photos, and history |
| Crew | Names and roles | Profiles and preferences |
| Reports | Trip summary | Professional document |

### Entitlement States

| State | Visual | Copy |
|---|---|---|
| Free | No badge | "All core features available." |
| Premium active | ✦ Premium (T.blue) | "All features available. Thank you." |
| Cached/offline | ✦ Cached (T.ink2) | "Working offline. Premium features available from last sync." |
| Purchase loading | Progress in CTA | "Completing purchase…" |
| Purchase cancelled | No badge | "No changes made." |
| Purchase error | T.red inline | "Something went wrong. Please try again." |
| Restore successful | ✦ Restored (T.green) | "Premium restored. Welcome back." |
| Expired + content | Recorded previously (T.amber) | "You can read this record. New Premium actions require an active subscription." |
| Expired + new action | No badge | "This feature requires an active Premium subscription." |

### Offline Behavior

Entitlement is cached locally after first successful validation.

- **With cached entitlement:** All Premium features remain available. Badge: ✦ Cached.
- **Without cached entitlement:** App behaves as free. Store unavailable copy: "Store unavailable. You can upgrade when you're back online."

---

## 6. Upgrade Copy Library

### Primary CTAs
- `"Upgrade to Premium"` — standard
- `"Start Premium"` — if trial not yet started
- `"Continue with Premium"` — returning after expiry
- `"Restore Premium"` — restore action
- `"See what improves"` — softer entry point, navigates to upgrade sheet

### Secondary Actions
- `"Continue with free"` — ONLY acceptable phrasing. Not "No thanks." Not "Dismiss."
- `"Not now"` — full-screen paywall only
- `"Back"` — upgrade sheet as full screen

### Module Headlines
- `"Build a plan for the people onboard"` — Provisioning
- `"Create a richer condition record"` — Inspection
- `"Capture more context"` — Log
- `"Prepare for the people onboard"` — Crew
- `"Turn your trip record into a professional document"` — Reports
- `"A more complete vessel history"` — Vessel (future)

### Paywall Headlines
- Primary: `"More capable. More professional."`
- Subline: `"A smarter version of the same TROVE."`

### Explanation Copy
- Provisioning: `"Free provisioning calculates quantities for your group. Premium personalizes for the people and the way you actually travel."`
- Inspection: `"Basic inspection covers what matters. Premium helps you build a complete evidence record with professional comparison."`
- Log: `"Your entry will be saved. Premium adds richer tools to build a more complete trip record."`
- Crew: `"Free records names and roles. Premium stores what actually matters for everyone's experience."`
- Reports: `"Free generates a useful trip summary. Premium creates a shareable, professional-quality record."`

### Preservation Notes
- `"Your current provisioning list will remain here."` — Provisioning
- `"This entry will be saved with the free version."` — Log
- `"Current crew information will remain."` — Crew

### Entry Point Labels
- `"Personalize"` — crew and provisioning pills
- `"Add evidence"` — inspection and log pills
- `"Professional report"` — report export

### Legal Copy
- `"Subscriptions renew automatically until cancelled."` — below all purchase CTAs
- `"Store unavailable. You can upgrade when you're back online."` — offline, unreachable
- `"Could not restore. Check your Apple ID and try again."` — restore error

---

## 7. Founder Principles

**Never charge for basic boating.** A skipper must be able to plan, check in, sail, log, check out, and record a complete trip — safely — without paying. If basic boating requires Premium, the product has failed.

**Charge for better boating.** Premium features must demonstrably improve the trip, save significant time, or increase the skipper's confidence. The test: would a professional skipper pay for this as a standalone tool?

**Never charge for truth.** All user data must always be exportable and accessible regardless of subscription status. A trip record belongs to the skipper who created it.

**Charge for professional workflows.** Outputs appropriate for commercial, legal, or insurance contexts — digital signatures, verifiable document IDs, multilingual reports, photo-linked evidence — are legitimately Premium.

**Never interrupt critical workflows.** A skipper in pre-departure, active inspection, emergency observation, or underway operational context is not available for commercial interaction. The `inActiveFlow` flag enforces this technically.

**Premium should save time, increase confidence, or produce better outputs.** If a feature does none of these three things, it belongs in the free tier.

**Free users must always complete a real trip successfully.** If any limit is introduced, it is evaluated at the start of a flow — never mid-flow.

---

## 8. Future Expansion

### Partner Integrations

Partner integrations (reservation platforms, charter operators, marina networks, insurance partners) are a future business opportunity, not an MVP feature. No specific partner is named in the product design. No integration is built until the business arrangement is confirmed.

The designed integration surface: a generic location layer — a marina details row in the Underway and Trip Planning screens. When a partner integration exists, that row gains live availability and a reservation entry point. Until then, the row shows static information or is absent.

Partner integrations enter through existing screen surfaces, never through new dedicated screens. The product does not name partners in its UI.

### AI

AI features are Premium-native. They replace human cognitive effort, not data input. They are not retrofitted to the free tier with artificial limits. The upgrade sheet for AI features adds one line: `"Results are suggestions. You always decide."`

### Cloud Sync

The sync indicator in the trip header supports three states. Premium cloud sync adds a Settings entry for sync preferences. The free tier stores data locally — a complete experience for solo skippers.

### Voice

Log module extension. The Add Log screen gains a voice recording button conditioned on Premium entitlement.

---

## 9. Beta Strategy

### The First ~100 Users

The first approximately 100 users receive the complete TROVE experience — all Premium features — without a paywall. The onboarding copy says nothing about Premium or paid features during beta. No monetization gate is enabled during beta.

The Premium entry points are visible — they are part of the design system being validated — but they flow through without a purchase requirement. The commercial activation decision follows the beta observation period.

### What to Observe

- Which entry points are tapped most frequently?
- Which modules generate the most upgrade sheet views?
- Which benefit lines correlate with continuing vs dismissing?
- Average log entries per trip, average crew count
- Does the provisioning personalization entry get tapped before or after the shopping list is generated?

### Feature Limits (If Introduced)

Any limit must: be evaluated at the beginning of a flow only (never mid-flow), be communicated clearly before the user starts, not be retroactively applied to existing work, and not be enforced in any context where it would affect safety.

---

## 10. Final Design Review

### Strengths

- The philosophy is coherent and defensible. The horizon principle and seven founder rules are internally consistent.
- The free tier is genuinely good. Users upgrade out of aspiration, not frustration.
- The visual language is stable. No new components, colors, or patterns. Full T-token compliance.
- Entry points are calibrated correctly. Five entry points. Natural rest points only. Same visual weight as standard content rows.
- Copy is specific throughout. Every benefit line is a concrete, verifiable promise.
- The safety principle is non-negotiable. The `inActiveFlow` rule is a genuine competitive differentiator.

### Weaknesses

- Premium value not yet validated by usage data.
- The comparison table is abstract — users who have never experienced dietary-linked provisioning cannot evaluate its value.
- No social or community features — gap for charter operators and coordinated crews.
- AI module is intentionally underspecified (future).
- Copy library is English only.

### Risks

- Users object to freemium categorically regardless of implementation quality. Mitigation: free tier must remain genuinely excellent.
- "Never interrupt" rule circumvented under commercial pressure. Mitigation: this specification is the defense.
- Premium features not valuable enough. Mitigation: beta observation strategy captures this data.
- Trial decision delayed too long. Mitigation: trial state is fully designed, ready to activate.

### Beta Validation Items

1. Are entry points discovered organically, or do users need directing?
2. At which point in the upgrade sheet do users close it?
3. Does "Continue with free" feel adequate or frustrating?
4. Is the benefit copy understood — can users paraphrase it?
5. Does the preservation note reduce anxiety?
6. Which module produces the highest conversion intent?
7. Are there Premium features that feel like they should be free?
8. Does the paywall feel trustworthy as a purchasing surface?

### Intentionally Postponed

- Trial period activation (designed, decision pending)
- Pricing (set after beta observation)
- Specific feature limits (decided by beta usage patterns)
- Team/fleet Premium tier (charter operators)
- Insurance partnership copy (requires specific insurer partnership)
- Localised copy (English validated first)
- Promotional pricing mechanics
- Android platform review (Google Play mechanics differ)

---

*TROVE Premium Design System v1.0 — Frozen August 2026*
*Status: Beta-ready. Monetization activation: pending beta observation.*
*No further design changes without real beta-user feedback.*
