# TROVE Screens — Reference

> **Source files (design handoff, Aug 2026):**
> `src/app/App.full.tsx` — canonical: frozen tokens, primitives and the
> Premium system data structures (screen bodies omitted by the design
> session; the full interactive build lives in its Figma Make sandbox).
> `src/app/App.screens.v0.tsx` — byte-exact copy of the last complete
> screen export (all 15 core screens, pre-Premium revision). Use it for
> screen layout reference; where the two disagree, App.full.tsx +
> `../premium-design-system.md` win.

## Navigation tabs
3 tabs: **Trip · Log · Vessel**

## Trip tab — phase-aware
Adapts to journey phase automatically:

### welcome
First-launch onboarding. Dark vessel header + "Welcome aboard." + YOUR BOATS empty state + EXPLORE TROVE sample boats (Serenity, Aurora, Nomad).

### trip_plan (Planning phase hub)
Photo hero + trip identity pill + readiness progress bar + setup checklist (crew, provisioning, shopping, pre-departure, check-in). Depart CTA lights up at 100%.

### trip_crew
Crew list with roles + avatar initials. Guest list. Invite action.

### trip_provisions
Days × people calculator. Accordion categories: Breakfast, Lunch, Dinner, Drinks. IBM Plex Mono quantities. → Shopping list button.

### trip_shopping
Checkable list by category. Progress bar. Share button.

### trip_predep
Pre-departure checklist grouped by: Safety, Engine, Provisions, Equipment, Navigation. Checkboxes with KeelLine on completed.

### trip_checkin
Check-in inspection. Amber flag + camera per item. → Complete check-in & depart.

### trip_underway (Underway phase)
Dark vessel header with day counter + destination + weather. Quick Log button (primary action). Open observations with KeelLine. Provisions snapshot. Crew avatars. End trip CTA.

### trip_checkout
Dark header. Completion steps (check-out, handover, report). Check-in vs check-out comparison table with KeelLine on deltas.

### trip_report
Generated report card. Dark TROVE header + document ID. Summary badge. Key facts. Evidence photo grid. Skipper sign-off. PDF export (window.open with printable HTML).

## Log tab
### log
Timeline logbook. Entry types: observation (amber KeelLine), note (blue), photo, check-in (green). Each entry: title + location + timestamp + optional photo strip.

### log_add
Type selector (Observation / Note / Photo). Camera viewfinder area. Description card. Severity selector (Minor / Moderate / Serious) for observations.

## Vessel tab
### vessel
Dark header: boat selector + stats (24 trips, 168 nights, 1219h engine). Vessel detail table (IBM Plex Mono for LOA, HIN). Horizontal photo strip (uploadable). Past trips list with Pill status.
