# TROVE Design Tokens

Source of truth: `T` object in `src/app/App.tsx`.
These are **inline style values** — not CSS variables.
All components use `T.*` directly.

## Surfaces
| Token | Value | Usage |
|-------|-------|-------|
| T.bg | #F5F5F8 | Page / screen background |
| T.surface | #FFFFFF | Cards, sheets, panels |
| T.surfaceEl | #EAEAEF | Chips, inactive states, secondary buttons |
| T.vessel | #090C18 | Dark vessel headers (Trip Underway, Vessel tab) |

## Ink (text)
| Token | Value | Usage |
|-------|-------|-------|
| T.ink0 | #0C0C14 | Primary text, headings |
| T.ink1 | #3C3C4E | Secondary text |
| T.ink2 | #7A7A90 | Tertiary text, labels, captions |
| T.ink3 | #ABABC0 | Disabled, placeholders, dividers |

## Semantic
| Token | Value | Usage |
|-------|-------|-------|
| T.blue | #005FCC | Interactive: buttons, links, active states |
| T.blueL | #EBF1FF | Blue tinted backgrounds, chips |
| T.green | #00875A | Success, complete, confirmed |
| T.greenL | #E6F7F1 | Success tinted backgrounds |
| T.amber | #C96A00 | Warning, observations, open issues |
| T.amberL | #FFF4E0 | Warning tinted backgrounds |
| T.red | #C82222 | Error, critical, serious severity |
| T.redL | #FEF0F0 | Error tinted backgrounds |

## Rules / dividers
| Token | Value | Usage |
|-------|-------|-------|
| T.rule | rgba(0,0,0,0.06) | Standard dividers, card borders |
| T.ruleStr | rgba(0,0,0,0.12) | Stronger dividers, dashed borders |

## Shadows
| Token | Value | Usage |
|-------|-------|-------|
| T.sh0 | 0 1px 2px rgba(0,0,0,0.04) | Minimal lift |
| T.sh1 | 0 1px 3px + 1px border | Cards, standard elevation |
| T.sh2 | 0 4px 20px + 1px border | Modals, floating elements |

## Border radius
| Token | Value | Usage |
|-------|-------|-------|
| T.r | 14px | Cards, primary containers |
| T.r2 | 10px | Secondary cards, list items |
| T.r3 | 7px | Chips, badges, small buttons |

## Typography
| Token | Value | Usage |
|-------|-------|-------|
| T.mono | IBM Plex Mono | GPS coords, timestamps, document IDs, engine hours, fuel %, measurements ONLY |

## IBM Plex Mono rule
Use ONLY for machine-measured data:
- GPS coordinates: 44.1°N 15.2°E
- Timestamps: Jun 17 · 10:28
- Document IDs: MED-2025-0615-001
- Engine hours: 1,204 h
- Fuel readings: 82%
- Technical measurements: 15.4 m

Do NOT use for human assessments: Excellent, Good, Full, A+, Complete

## Spacing grid
All values multiples of 4. Common: 4, 8, 12, 16, 20, 24, 32.
Minimum touch target: 44px (all interactive elements).

## ICON sizes
```
ICON.xs = 10  — tiny badges
ICON.sm = 13  — list icons, row icons
ICON.md = 15  — button icons, nav icons
ICON.lg = 20  — tab bar icons
ICON.xl = 22  — hero icons
```
