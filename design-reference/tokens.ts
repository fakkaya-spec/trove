// TROVE Design Tokens — frozen August 2026
// Source of truth: design-reference/src/app/App.full.tsx
// This file is a standalone export of canonical token values.
// For React Native: import { T, ICON } from "./tokens";

export const T = {
  bg:        "#F5F5F8",
  surface:   "#FFFFFF",
  surfaceEl: "#EAEAEF",

  ink0: "#0C0C14",
  ink1: "#3C3C4E",
  ink2: "#7A7A90",
  ink3: "#ABABC0",

  rule:    "rgba(0,0,0,0.06)",
  ruleStr: "rgba(0,0,0,0.12)",

  blue:   "#005FCC",
  blueL:  "#EBF1FF",
  green:  "#00875A",
  greenL: "#E6F7F1",
  amber:  "#C96A00",
  amberL: "#FFF4E0",
  red:    "#C82222",
  redL:   "#FEF0F0",

  vessel: "#090C18",

  sh0: "0 1px 2px rgba(0,0,0,0.04)",
  sh1: "0 1px 3px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)",
  sh2: "0 4px 20px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)",

  r:  "14px",
  r2: "10px",
  r3: "7px",

  mono: "'IBM Plex Mono', 'Courier New', monospace",
} as const;

export const ICON = {
  xs: 10,
  sm: 13,
  md: 15,
  lg: 20,
  xl: 22,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// SEMANTIC TOKEN RULES
// These are design constraints enforced in code review, not at runtime.
// ─────────────────────────────────────────────────────────────────────────────

// T.blue    Primary interactive, CTA, KeelLine on COMPLETED/VERIFIED items
// T.amber   Left bar on UNRESOLVED OBSERVATION cards — never use T.blue for obs
// T.green   Success, confirmed, cleared state
// T.red     Purchase error and critical alerts ONLY — never for subscription expiry
// T.vessel  Dark surface: Premium header, screen backgrounds, report headers
// T.ink0    Primary text (headings, values)
// T.ink1    Secondary text (labels, list items)
// T.ink2    Tertiary text (subtitles, placeholders)
// T.ink3    Disabled / ghost text

// IBM Plex Mono (T.mono): ONLY for machine-measured data.
//   Correct uses:  timestamps, GPS coordinates, document IDs,
//                  engine hours, fuel percentages, LOA/dimensions
//   Forbidden:     marketing copy, benefit descriptions, UI labels,
//                  human assessments, any non-numeric UI string

// ─────────────────────────────────────────────────────────────────────────────
// PREMIUM BADGE SEMANTICS
// ─────────────────────────────────────────────────────────────────────────────

// Active Premium:     background T.blue,     text #FFF,      label "✶ Premium"
// Trial:             background T.amberL,   text T.amber,   label "✶ Trial"
// Cached / Offline:  background T.surfaceEl, text T.ink2,    label "✶ Cached"
// Restored:          background T.greenL,   text T.green,   label "✶ Restored"
// Expired content:   background T.amberL,   text T.amber,   label "Recorded previously"
// Purchase error:    background T.redL,     text T.red,     (no ✶)
// Free state:        NO BADGE — absence of a Premium badge IS the free indicator

// The ✶ (U+2736 SIX POINTED BLACK STAR) character is the sole visual mark
// of Premium status. It is used inline in badge text only.
// Never use it in headings, body copy, or as a decorative element.

export type TokenKey = keyof typeof T;
export type IconSize = keyof typeof ICON;
