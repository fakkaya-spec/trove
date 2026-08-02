# TROVE

**Your boating trip companion.** Prepare → Underway → Complete.

Offline-first trip planning, provisioning, inspections, logbook and handover
evidence for skippers, charterers and boat owners. iOS + Android (Expo /
React Native).

## Product model (locked)

- Navigation: **Trip · Log · Vessel** (3 tabs; Settings via gear in the Trip header)
- Trip tab is phase-aware; inspection/handover/report live inside trip phases,
  never as navigation destinations
- Offline is a sync state, not a screen
- Photo evidence is Premium — see `docs/MONETIZATION.md` (locked rules)
- Roadmap and phase status: `docs/TROVE-ROADMAP.md`

## Brand (locked — never redesign)

C0 symbol (four centred strata) + "TROVE" wordmark in DM Sans Medium, 0.18em
tracking. Source of truth: `src/components/brand/` + `scripts/generate-icons.mjs`.
Colours: Ink `#111110` · Paper `#F8F7F4` · Depth `#1B3A4B`.

## Design source of truth

`design-reference/` contains the approved Figma Make export: the `T` token
set, the primitive components and the full 13-screen reference
(`design-reference/src/app/App.full.tsx`). UI tokens live in `src/theme.ts`
(`T`, `TSH`, `TICON`); TROVE primitives in `src/components/trove/`.

## Stack

Expo SDK 57 · React Native 0.86 · TypeScript strict · SQLite (expo-sqlite) +
Drizzle ORM · hand-written versioned migrations · versioned seeds · 9-language
i18n (en default) · offline-first writes with a sync queue skeleton.

## Development

```bash
npm install
npm run typecheck && npm run lint && npm test   # 7 suites on real SQLite
npx expo start
```

Rules that keep this codebase safe:

- Published migrations are never edited — new IDs only (`src/db/migrations.ts`)
- Sample data (Serenity/Aurora/Nomad) is isolated via `is_sample` at the
  repository layer and proven by `tests/samples.test.ts`
- IBM Plex Mono is used ONLY for machine-measured values (timestamps, GPS,
  meters, document IDs) — never for human assessments
- The product name lives in `src/config/product.ts` — never hardcode it

## History

This repository was extracted (with full history) from
`fakkaya-spec/koskoraporweb` — the app previously lived in its `marincheck/`
folder under the working name BoatCheck. That repo remains as an archive.
