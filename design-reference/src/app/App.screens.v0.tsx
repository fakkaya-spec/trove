import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  CheckCircle, Camera, AlertTriangle, ChevronRight, Anchor,
  ArrowLeft, ArrowRight, Download, Check, MapPin,
  Wifi, Battery, User, FileText, Shield, Clock, Plus,
  MoreHorizontal, Zap, Calendar, Users, ShoppingCart,
  BookOpen, Sailboat, Sun, Wind, Droplets, ChevronDown,
  List, Utensils, Star, Waves
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// PHOTOS
// ─────────────────────────────────────────────────────────────────────────────
const PH = {
  hull:     "https://images.unsplash.com/photo-1561728130-afd430af0493?auto=format&w=400&q=75",
  deck:     "https://images.unsplash.com/photo-1520670255513-79161a36e39c?auto=format&w=400&q=75",
  winch:    "https://images.unsplash.com/photo-1656580209495-d8bb64b4aaa3?auto=format&w=400&q=75",
  engine:   "https://images.unsplash.com/photo-1552656967-7a0991a13906?auto=format&w=400&q=75",
  safety:   "https://images.unsplash.com/photo-1732071194919-736858247dd3?auto=format&w=400&q=75",
  sea:      "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&w=800&q=75",
  serenity: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&w=400&q=75",
  aurora:   "https://images.unsplash.com/photo-1605281317010-fe5ffe798166?auto=format&w=400&q=75",
  nomad:    "https://images.unsplash.com/photo-1473116763249-2faaef81ccda?auto=format&w=400&q=75",
};

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN TOKENS
// ─────────────────────────────────────────────────────────────────────────────
export const T = {
  bg:       "#F5F5F8",
  surface:  "#FFFFFF",
  surfaceEl:"#EAEAEF",

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

  vessel:  "#090C18",

  sh0: "0 1px 2px rgba(0,0,0,0.04)",
  sh1: "0 1px 3px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)",
  sh2: "0 4px 20px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)",

  r:  "14px", r2: "10px", r3: "7px",

  mono: "'IBM Plex Mono', 'Courier New', monospace",
};

export const ICON = { xs: 10, sm: 13, md: 15, lg: 20, xl: 22 } as const;

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN KEY — journey-organized
// ─────────────────────────────────────────────────────────────────────────────
export type ScreenKey =
  // Onboarding
  | "welcome"         // First-launch: no boats yet
  // Trip tab — phase-aware
  | "trip_plan"       // Planning: full setup hub
  | "trip_crew"       // Crew & guests
  | "trip_provisions" // Provisioning calculator
  | "trip_shopping"   // Shopping list
  | "trip_predep"     // Pre-departure checklist
  | "trip_checkin"    // Check-in inspection
  | "trip_underway"   // Underway: daily companion
  | "trip_checkout"   // Check-out inspection
  | "trip_handover"   // Handover comparison
  | "trip_report"     // Generated report
  // Log tab
  | "log"             // Logbook — observations + notes
  | "log_add"         // Add entry
  // Vessel tab
  | "vessel"          // Vessel overview + past trips
  | "vessel_detail";  // Vessel particulars

// ─────────────────────────────────────────────────────────────────────────────
// PHOTO STORE
// ─────────────────────────────────────────────────────────────────────────────
const photoStore: Record<string, string> = {};
const photoListeners: Set<() => void> = new Set();
export function setPhoto(slot: string, url: string) {
  photoStore[slot] = url;
  photoListeners.forEach(fn => fn());
}
export function usePhotoStore() {
  const [, tick] = useState(0);
  useEffect(() => {
    const fn = () => tick(n => n + 1);
    photoListeners.add(fn);
    return () => { photoListeners.delete(fn); };
  }, []);
  return photoStore;
}

// ────���────────────────────────────────────────────────────────────────────────
// CORE COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
export function KeelLine() {
  return <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 2, background: T.blue, borderRadius: "2px 0 0 2px" }} />;
}

export function BackButton({ onClick, dark = false }: { onClick?: () => void; dark?: boolean }) {
  return (
    <button onClick={onClick} style={{ width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", cursor: "pointer", flexShrink: 0 }}>
      <div style={{ width: 32, height: 32, background: dark ? "rgba(255,255,255,0.10)" : T.surfaceEl, borderRadius: 99, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <ArrowLeft size={ICON.md} style={{ color: dark ? "rgba(255,255,255,0.70)" : T.ink1 }} />
      </div>
    </button>
  );
}

export function Card({ children, p = "14px 16px", mb = 8, keel = false, style }: {
  children: React.ReactNode; p?: string; mb?: number; keel?: boolean; style?: React.CSSProperties;
}) {
  return (
    <div style={{ background: T.surface, borderRadius: T.r, boxShadow: T.sh1, padding: p, marginBottom: mb, position: "relative", overflow: "hidden", ...style }}>
      {keel && <KeelLine />}
      {children}
    </div>
  );
}

export function SLabel({ children, mt = 16, action, onAction }: {
  children: React.ReactNode; mt?: number; action?: string; onAction?: () => void;
}) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, marginTop: mt }}>
      <p style={{ fontSize: 11, fontWeight: 600, color: T.ink2, letterSpacing: "0.4px", textTransform: "uppercase" }}>{children}</p>
      {action && <button onClick={onAction} style={{ fontSize: 11, color: T.blue, background: "none", border: "none", cursor: "pointer", padding: "4px 0", minHeight: 36 }}>{action}</button>}
    </div>
  );
}

export function Pill({ text, type }: { text: string; type: "ok" | "warn" | "err" | "info" | "ghost" | "neutral" }) {
  const m: Record<string, [string, string]> = {
    ok:      [T.greenL, T.green],
    warn:    [T.amberL, T.amber],
    err:     [T.redL,   T.red],
    info:    [T.blueL,  T.blue],
    ghost:   ["rgba(255,255,255,0.12)", "rgba(255,255,255,0.70)"],
    neutral: [T.surfaceEl, T.ink2],
  };
  const [bg, color] = m[type];
  return <span style={{ background: bg, color, borderRadius: 99, fontSize: 10, fontWeight: 700, padding: "3px 8px", whiteSpace: "nowrap" }}>{text}</span>;
}

export function Bar({ pct, color, h = 2 }: { pct: number; color?: string; h?: number }) {
  return (
    <div style={{ background: T.rule, borderRadius: 99, height: h, overflow: "hidden" }}>
      <div style={{ background: color || T.blue, width: `${Math.min(pct, 100)}%`, height: "100%", borderRadius: 99 }} />
    </div>
  );
}

export function Divider({ my = 20 }: { my?: number }) {
  return <div style={{ height: 1, background: T.rule, margin: `${my}px 0` }} />;
}

export function RowItem({ label, value, mono, bold, color, onPress, last = false }: {
  label: string; value?: string; mono?: boolean; bold?: boolean; color?: string;
  onPress?: () => void; last?: boolean;
}) {
  const el = (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 0", borderBottom: last ? "none" : `1px solid ${T.rule}`, cursor: onPress ? "pointer" : "default" }}>
      <span style={{ fontSize: 13, color: T.ink1 }}>{label}</span>
      {value && <span style={{ fontSize: 13, color: color ?? T.ink0, fontFamily: mono ? T.mono : "inherit", fontWeight: bold ? 600 : 400 }}>{value}</span>}
      {onPress && !value && <ChevronRight size={ICON.sm} style={{ color: T.ink3 }} />}
    </div>
  );
  if (onPress) return <button onClick={onPress} style={{ width: "100%", background: "none", border: "none", padding: 0, textAlign: "left" }}>{el}</button>;
  return el;
}

// Uploadable photo
export function Photo({ src: def, label, time, slot, w = 80, h = 80, r = 10 }: {
  src?: string; label: string; time?: string; slot?: string; w?: number; h?: number; r?: number;
}) {
  const store = usePhotoStore();
  const src = (slot && store[slot]) ? store[slot] : def;
  const ref = useRef<HTMLInputElement>(null);
  const click = useCallback(() => { if (slot) ref.current?.click(); }, [slot]);
  const change = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f || !slot) return;
    const r2 = new FileReader();
    r2.onload = ev => { if (ev.target?.result) setPhoto(slot, ev.target.result as string); };
    r2.readAsDataURL(f); e.target.value = "";
  }, [slot]);
  return (
    <div onClick={click} style={{ width: w, height: h, borderRadius: r, overflow: "hidden", position: "relative", flexShrink: 0, boxShadow: "0 2px 8px rgba(0,0,0,0.12)", cursor: slot ? "pointer" : "default" }}>
      {slot && <input ref={ref} type="file" accept="image/*" onChange={change} style={{ position: "absolute", inset: 0, opacity: 0, pointerEvents: "none" }} />}
      {src
        ? <img src={src} alt={label} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        : <div style={{ position: "absolute", inset: 0, background: T.vessel, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Camera size={ICON.sm} style={{ color: "rgba(255,255,255,0.22)" }} />
          </div>
      }
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.72) 0%, transparent 55%)" }} />
      {slot && (
        <div style={{ position: "absolute", top: 5, right: 5, background: "rgba(0,0,0,0.46)", borderRadius: 4, padding: "2px 5px" }}>
          <Camera size={7} style={{ color: "rgba(255,255,255,0.70)" }} />
        </div>
      )}
      <div style={{ position: "absolute", bottom: 5, left: 5, right: 5 }}>
        <p style={{ color: "#FFF", fontSize: 9, fontWeight: 700, lineHeight: 1.2 }}>{label}</p>
        {time && <p style={{ fontFamily: T.mono, fontSize: 9, color: "rgba(255,255,255,0.72)" }}>{time}</p>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CHROME
// ─────────────────────────────────────────────────────────────────────────────
export function StatusBar({ dark = false }: { dark?: boolean }) {
  const c = dark ? "rgba(255,255,255,0.44)" : T.ink3;
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 22px 6px", flexShrink: 0 }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: dark ? "rgba(255,255,255,0.80)" : T.ink0 }}>9:41</span>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <Wifi size={ICON.xs} style={{ color: c }} />
        <Battery size={ICON.sm} style={{ color: c }} />
      </div>
    </div>
  );
}

// 3-tab nav — Trip · Log · Vessel
type TabKey = "trip" | "log" | "vessel";
const NAV: { key: TabKey; icon: React.ElementType; label: string }[] = [
  { key: "trip",   icon: Anchor,   label: "Trip"   },
  { key: "log",    icon: BookOpen, label: "Log"    },
  { key: "vessel", icon: Sailboat, label: "Vessel" },
];

const SCREEN_TO_TAB: Partial<Record<ScreenKey, TabKey>> = {
  welcome: "trip",
  trip_plan: "trip", trip_crew: "trip", trip_provisions: "trip",
  trip_shopping: "trip", trip_predep: "trip", trip_checkin: "trip",
  trip_underway: "trip", trip_checkout: "trip", trip_handover: "trip",
  trip_report: "trip",
  log: "log", log_add: "log",
  vessel: "vessel", vessel_detail: "vessel",
};

export function BottomNav({ screen, onScreen }: { screen: ScreenKey; onScreen: (s: ScreenKey) => void }) {
  const active = SCREEN_TO_TAB[screen] ?? "trip";
  const tabScreen: Record<TabKey, ScreenKey> = { trip: "welcome", log: "log", vessel: "vessel" };
  return (
    <div style={{ background: "rgba(255,255,255,0.94)", borderTop: `1px solid ${T.rule}`, display: "flex", justifyContent: "space-around", padding: "8px 0 20px", flexShrink: 0, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}>
      {NAV.map(({ key, icon: Icon, label }) => {
        const on = active === key;
        return (
          <button key={key} onClick={() => onScreen(tabScreen[key])}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, background: "none", border: "none", cursor: "pointer", minWidth: 44, minHeight: 44, justifyContent: "center" }}>
            <Icon size={ICON.lg} style={{ color: on ? T.blue : T.ink3, strokeWidth: on ? 2 : 1.5 }} />
            <span style={{ fontSize: 9.5, fontWeight: on ? 700 : 400, color: on ? T.blue : T.ink3 }}>{label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// WELCOME — first-launch onboarding
// ─────────────────────────────────────────────────────────────────────────────
function WelcomeScreen({ onScreen }: { onScreen: (s: ScreenKey) => void }) {
  const samples: { photo: string; icon: React.ElementType; name: string; type: string; trip: string; dest: string }[] = [
    { photo: PH.serenity, icon: Sailboat, name: "Serenity",  type: "Bavaria 51 · 15.4 m",  trip: "7-day Croatia charter",   dest: "Kornati Islands"     },
    { photo: PH.aurora,   icon: Anchor,   name: "Aurora",    type: "Azimut 48 · 14.8 m",   trip: "Weekend family trip",      dest: "Amalfi Coast"        },
    { photo: PH.nomad,    icon: Waves,    name: "Nomad",     type: "Jeanneau 40 · 11.9 m",  trip: "Day cruise",               dest: "Côte d'Azur"         },
  ];

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: T.bg, overflowY: "auto" }}>

      {/* Hero — dark, welcoming */}
      <div style={{ background: T.vessel, padding: "12px 24px 32px", flexShrink: 0 }}>
        {/* Brand */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 36 }}>
          <span style={{ fontSize: 15, fontWeight: 800, color: "#FFF", letterSpacing: "0.10em" }}>TROVE</span>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <User size={ICON.sm} style={{ color: "rgba(255,255,255,0.40)" }} />
          </div>
        </div>

        {/* Greeting */}
        <div style={{ marginBottom: 6 }}>
          <div style={{ width: 36, height: 2, background: T.blue, borderRadius: 99, marginBottom: 18 }} />
          <h1 style={{ fontSize: 30, fontWeight: 700, color: "#FFF", letterSpacing: "-0.8px", lineHeight: 1.1, marginBottom: 12 }}>
            Welcome aboard.
          </h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.44)", lineHeight: 1.6, maxWidth: 280 }}>
            Explore how TROVE works with a sample boat, or add your own and start planning your next trip.
          </p>
        </div>
      </div>

      <div style={{ padding: "24px 16px 40px" }}>

        {/* YOUR BOATS */}
        <p style={{ fontSize: 10, fontWeight: 700, color: T.ink3, letterSpacing: "0.55px", textTransform: "uppercase", marginBottom: 10 }}>
          Your boats
        </p>
        <button
          style={{ width: "100%", background: T.surface, border: `1.5px dashed ${T.ruleStr}`, borderRadius: T.r, padding: "20px 18px", marginBottom: 28, cursor: "pointer", display: "flex", alignItems: "center", gap: 14, textAlign: "left" }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: T.blueL, border: `1.5px dashed rgba(0,95,204,0.25)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Plus size={ICON.md} style={{ color: T.blue }} />
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: T.blue, marginBottom: 2 }}>Add your first boat</p>
            <p style={{ fontSize: 12, color: T.ink3 }}>Name, type, length and registration</p>
          </div>
        </button>

        {/* EXPLORE TROVE */}
        <p style={{ fontSize: 10, fontWeight: 700, color: T.ink3, letterSpacing: "0.55px", textTransform: "uppercase", marginBottom: 10 }}>
          Explore TROVE
        </p>
        <p style={{ fontSize: 12, color: T.ink2, marginBottom: 14, lineHeight: 1.5 }}>
          Try a demo trip with sample data to see how preparation, provisioning and the logbook work.
        </p>

        {samples.map((s, i) => (
          <button key={i} onClick={() => onScreen("trip_plan")}
            style={{ width: "100%", background: T.surface, borderRadius: T.r, boxShadow: T.sh1, border: `1px solid ${T.rule}`, marginBottom: 10, display: "flex", overflow: "hidden", cursor: "pointer", textAlign: "left" }}>
            {/* Photo */}
            <div style={{ width: 88, height: 88, flexShrink: 0, position: "relative" }}>
              <img src={s.photo} alt={s.name}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, transparent 60%, rgba(255,255,255,0.06))" }} />
              {/* Boat type badge */}
              <div style={{ position: "absolute", bottom: 7, left: 7, background: "rgba(9,12,24,0.72)", borderRadius: 5, padding: "3px 6px", display: "flex", alignItems: "center", gap: 3 }}>
                <s.icon size={8} style={{ color: "rgba(255,255,255,0.70)" }} />
              </div>
            </div>
            {/* Content */}
            <div style={{ flex: 1, padding: "14px 14px 14px 16px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 2 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: T.ink0, letterSpacing: "-0.3px" }}>{s.name}</p>
                <ChevronRight size={ICON.sm} style={{ color: T.ink3, flexShrink: 0, marginTop: 2 }} />
              </div>
              <p style={{ fontSize: 11, color: T.ink2 }}>{s.type}</p>
              <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ background: T.blueL, color: T.blue, fontSize: 10, fontWeight: 700, borderRadius: 5, padding: "3px 7px" }}>{s.trip}</span>
                <span style={{ fontSize: 10, color: T.ink3 }}>{s.dest}</span>
              </div>
            </div>
          </button>
        ))}

        {/* Subtle footer note */}
        <p style={{ fontSize: 11, color: T.ink3, textAlign: "center", marginTop: 8, lineHeight: 1.6 }}>
          Sample data is read-only and never saved.{"\n"}Your real trips are stored on this device.
        </p>

      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TRIP TAB — PLANNING PHASE
// ─────────────────────────────────────────────────────────────────────────────
function TripPlanScreen({ onScreen }: { onScreen: (s: ScreenKey) => void }) {
  const setup = [
    { key: "trip_crew",       icon: Users,       label: "Crew & guests",        sub: "4 crew · 2 guests",    done: true  },
    { key: "trip_provisions", icon: Utensils,    label: "Provisioning",          sub: "7 days calculated",    done: true  },
    { key: "trip_shopping",   icon: ShoppingCart,label: "Shopping list",         sub: "12 items · not done",  done: false },
    { key: "trip_predep",     icon: CheckCircle, label: "Pre-departure checklist",sub: "8 of 14 items",       done: false },
    { key: "trip_checkin",    icon: Shield,      label: "Check-in inspection",   sub: "Not started",          done: false },
  ];

  const ready = setup.filter(s => s.done).length;
  const pct = (ready / setup.length) * 100;

  return (
    <div style={{ flex: 1, overflowY: "auto", background: T.bg }}>

      {/* Trip hero */}
      <div style={{ position: "relative", height: 200, flexShrink: 0 }}>
        <img src={PH.sea} alt="trip" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(9,12,24,0.92) 0%, rgba(9,12,24,0.20) 60%, transparent)" }} />
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px 0" }}>
          <span style={{ fontSize: 15, fontWeight: 800, color: "#FFF", letterSpacing: "0.10em" }}>TROVE</span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: T.green }} />
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.50)" }}>Synced</span>
          </div>
        </div>
        <div style={{ position: "absolute", bottom: 16, left: 20, right: 20 }}>
          <Pill text="Planning · Departs in 2 days" type="ghost" />
          <h1 style={{ fontSize: 26, fontWeight: 700, color: "#FFF", letterSpacing: "-0.6px", lineHeight: 1.1, marginTop: 8, marginBottom: 3 }}>Kornati Islands</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.54)" }}>Serenity · Jun 15–22 · 7 nights</p>
        </div>
      </div>

      <div style={{ padding: "16px 16px 40px" }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: T.ink1 }}>Ready to depart</span>
            <span style={{ fontFamily: T.mono, fontSize: 11, color: T.ink2 }}>{ready} of {setup.length}</span>
          </div>
          <Bar pct={pct} h={3} color={pct === 100 ? T.green : T.blue} />
        </div>

        {setup.map(({ key, icon: Icon, label, sub, done }) => (
          <button key={key} onClick={() => onScreen(key as ScreenKey)}
            style={{ width: "100%", background: T.surface, borderRadius: T.r, boxShadow: T.sh0, border: `1px solid ${done ? "rgba(0,135,90,0.16)" : T.rule}`, padding: "13px 14px", marginBottom: 6, display: "flex", gap: 12, alignItems: "center", cursor: "pointer", textAlign: "left", position: "relative", overflow: "hidden" }}>
            {done && <KeelLine />}
            <div style={{ paddingLeft: done ? 6 : 0, display: "flex", gap: 12, alignItems: "center", flex: 1 }}>
              <div style={{ width: 36, height: 36, borderRadius: T.r3, background: done ? T.greenL : T.surfaceEl, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon size={ICON.md} style={{ color: done ? T.green : T.ink2 }} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: T.ink0, marginBottom: 2 }}>{label}</p>
                <p style={{ fontSize: 11, color: done ? T.green : T.ink2 }}>{sub}</p>
              </div>
            </div>
            {done
              ? <Check size={ICON.sm} style={{ color: T.green, flexShrink: 0 }} />
              : <ChevronRight size={ICON.sm} style={{ color: T.ink3, flexShrink: 0 }} />
            }
          </button>
        ))}

        <Divider />

        <button onClick={() => onScreen("trip_underway")}
          style={{ width: "100%", background: pct === 100 ? T.blue : T.surfaceEl, color: pct === 100 ? "#FFF" : T.ink3, border: "none", borderRadius: T.r, padding: "15px", fontSize: 14, fontWeight: 700, cursor: "pointer", letterSpacing: "-0.2px" }}>
          {pct === 100 ? "All set — Begin trip →" : "Complete setup to depart"}
        </button>
        <p style={{ fontSize: 11, color: T.ink3, textAlign: "center", marginTop: 8 }}>Serenity · Bavaria 51 · Jun 15, 09:00</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CREW & GUESTS
// ─────────────────────────────────────────────────────────────────────────────
function CrewScreen({ onScreen }: { onScreen: (s: ScreenKey) => void }) {
  const crew = [
    { name: "Marco Rossi",    role: "Skipper",        initial: "M", you: true  },
    { name: "Lucia Moretti",  role: "First mate",     initial: "L", you: false },
    { name: "Tom Andersson",  role: "Crew",           initial: "T", you: false },
    { name: "Sara Kim",       role: "Crew",           initial: "S", you: false },
  ];
  const guests = [
    { name: "James Peterson",  note: "Dietary: none"     },
    { name: "Claire Peterson", note: "Dietary: vegetarian" },
  ];
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: T.bg }}>
      <div style={{ background: T.surface, borderBottom: `1px solid ${T.rule}`, padding: "0 20px 14px", display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
        <BackButton onClick={() => onScreen("trip_plan")} />
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: T.ink0, letterSpacing: "-0.3px" }}>Crew &amp; guests</h2>
          <p style={{ fontSize: 11, color: T.ink2 }}>Kornati Islands · Jun 15–22</p>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 32px" }}>
        <SLabel mt={0} action="+ Invite" onAction={() => {}}>Crew</SLabel>
        {crew.map((c, i) => (
          <div key={i} style={{ background: T.surface, borderRadius: T.r2, boxShadow: T.sh0, border: `1px solid ${T.rule}`, padding: "11px 14px", marginBottom: 6, display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: c.you ? T.blue : T.surfaceEl, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: c.you ? "#FFF" : T.ink2 }}>{c.initial}</span>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: T.ink0 }}>{c.name} {c.you && <span style={{ fontSize: 10, color: T.blue, fontWeight: 700 }}>· You</span>}</p>
              <p style={{ fontSize: 11, color: T.ink2 }}>{c.role}</p>
            </div>
            <button style={{ background: T.surfaceEl, border: "none", borderRadius: T.r3, padding: "6px 10px", fontSize: 10, fontWeight: 600, color: T.ink2, cursor: "pointer" }}>Edit</button>
          </div>
        ))}

        <SLabel mt={20} action="+ Add guest" onAction={() => {}}>Guests</SLabel>
        {guests.map((g, i) => (
          <div key={i} style={{ background: T.surface, borderRadius: T.r2, boxShadow: T.sh0, border: `1px solid ${T.rule}`, padding: "11px 14px", marginBottom: 6, display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: T.surfaceEl, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <User size={ICON.sm} style={{ color: T.ink3 }} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: T.ink0 }}>{g.name}</p>
              <p style={{ fontSize: 11, color: T.ink2 }}>{g.note}</p>
            </div>
          </div>
        ))}

        <div style={{ background: T.surfaceEl, borderRadius: T.r, padding: "12px 14px", marginTop: 8, display: "flex", gap: 10, alignItems: "flex-start" }}>
          <Users size={ICON.sm} style={{ color: T.ink2, flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 12, color: T.ink2, lineHeight: 1.6 }}>Guests are counted in provisioning calculations but do not have TROVE access unless invited as crew.</p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PROVISIONING
// ─────────────────────────────────────────────────────────────────────────────
function ProvisioningScreen({ onScreen }: { onScreen: (s: ScreenKey) => void }) {
  const days = 7;
  const people = 6;

  const categories = [
    {
      name: "Breakfast",
      items: [
        { name: "Eggs",          qty: `${days * people} eggs`,   note: "" },
        { name: "Bread / rolls", qty: `${days * 2} packs`,       note: "" },
        { name: "Butter",        qty: "3 packs",                 note: "" },
        { name: "Coffee",        qty: "2 packs",                 note: "" },
        { name: "Fruit",         qty: `${days} portions × 6`,   note: "" },
        { name: "Milk / oat",    qty: "4 L",                     note: "1× vegetarian preference" },
      ]
    },
    {
      name: "Lunch",
      items: [
        { name: "Cold cuts",     qty: `${days} × 200 g`,         note: "" },
        { name: "Cheese",        qty: `${days} × 150 g`,         note: "" },
        { name: "Crackers",      qty: "4 boxes",                 note: "" },
        { name: "Salad greens",  qty: `${days} bags`,            note: "" },
      ]
    },
    {
      name: "Dinner",
      items: [
        { name: "Fish (fresh)",  qty: "3 dinners",               note: "Buy locally" },
        { name: "Pasta",         qty: "2 kg",                    note: "" },
        { name: "Tomato sauce",  qty: "4 jars",                  note: "" },
        { name: "Rice",          qty: "1 kg",                    note: "" },
        { name: "Meat (chicken)",qty: "2 kg",                    note: "1× vegetarian alt" },
      ]
    },
    {
      name: "Drinks",
      items: [
        { name: "Water",         qty: `${days * people * 2} L`,  note: "2 L / person / day" },
        { name: "Beer",          qty: "48 cans",                 note: "" },
        { name: "Wine",          qty: "8 bottles",               note: "" },
        { name: "Soft drinks",   qty: "24 cans",                 note: "" },
        { name: "Juice",         qty: "6 L",                     note: "" },
      ]
    },
  ];

  const [open, setOpen] = useState<number | null>(0);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: T.bg }}>
      <div style={{ background: T.surface, borderBottom: `1px solid ${T.rule}`, padding: "0 20px 14px", display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
        <BackButton onClick={() => onScreen("trip_plan")} />
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: T.ink0, letterSpacing: "-0.3px" }}>Provisioning</h2>
          <p style={{ fontSize: 11, color: T.ink2 }}>{days} days · {people} people</p>
        </div>
        <button onClick={() => onScreen("trip_shopping")}
          style={{ background: T.blueL, border: "none", borderRadius: T.r3, padding: "8px 12px", fontSize: 11, fontWeight: 600, color: T.blue, cursor: "pointer", minHeight: 44 }}>
          Shopping list →
        </button>
      </div>

      <div style={{ background: T.surface, borderBottom: `1px solid ${T.rule}`, padding: "12px 20px", display: "flex", gap: 0 }}>
        {[
          { label: "Days", value: String(days) },
          { label: "People", value: String(people) },
          { label: "Meals", value: String(days * 3) },
        ].map(({ label, value }, i) => (
          <React.Fragment key={label}>
            {i > 0 && <div style={{ width: 1, background: T.rule, margin: "0 20px" }} />}
            <div style={{ textAlign: "center" }}>
              <p style={{ fontFamily: T.mono, fontSize: 20, fontWeight: 700, color: T.ink0, lineHeight: 1 }}>{value}</p>
              <p style={{ fontSize: 10, color: T.ink3, marginTop: 4 }}>{label}</p>
            </div>
          </React.Fragment>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px 32px" }}>
        {categories.map((cat, ci) => (
          <div key={ci} style={{ marginBottom: 8 }}>
            <button onClick={() => setOpen(open === ci ? null : ci)}
              style={{ width: "100%", background: T.surface, borderRadius: open === ci ? `${T.r} ${T.r} 0 0` : T.r, boxShadow: T.sh0, border: `1px solid ${T.rule}`, borderBottom: open === ci ? "none" : `1px solid ${T.rule}`, padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", textAlign: "left" }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: T.ink0 }}>{cat.name}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 11, color: T.ink3 }}>{cat.items.length} items</span>
                <ChevronDown size={ICON.sm} style={{ color: T.ink3, transform: open === ci ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
              </div>
            </button>
            {open === ci && (
              <div style={{ background: T.surface, borderRadius: `0 0 ${T.r} ${T.r}`, border: `1px solid ${T.rule}`, borderTop: "none", overflow: "hidden" }}>
                {cat.items.map((item, ii) => (
                  <div key={ii} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderBottom: ii < cat.items.length - 1 ? `1px solid ${T.rule}` : "none" }}>
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 500, color: T.ink0 }}>{item.name}</p>
                      {item.note && <p style={{ fontSize: 10, color: T.amber, marginTop: 1 }}>{item.note}</p>}
                    </div>
                    <span style={{ fontFamily: T.mono, fontSize: 11, color: T.ink2, fontWeight: 500 }}>{item.qty}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        <button onClick={() => onScreen("trip_shopping")}
          style={{ width: "100%", background: T.blue, color: "#FFF", border: "none", borderRadius: T.r, padding: "14px", fontSize: 14, fontWeight: 600, cursor: "pointer", marginTop: 8 }}>
          Generate shopping list →
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SHOPPING LIST
// ─────────────────────────────────────────────────────────────────────────────
function ShoppingScreen({ onScreen }: { onScreen: (s: ScreenKey) => void }) {
  const [checked, setChecked] = useState<string[]>([]);
  const toggle = (id: string) => setChecked(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const sections = [
    { name: "Produce", color: T.green, items: ["Eggs × 42", "Fruit × 7 portions/6", "Salad greens × 7 bags", "Lemons × 10"] },
    { name: "Dry goods", color: T.amber, items: ["Bread/rolls × 14 packs", "Pasta × 2 kg", "Rice × 1 kg", "Crackers × 4 boxes", "Tomato sauce × 4 jars", "Coffee × 2 packs"] },
    { name: "Protein & dairy", color: T.blue, items: ["Eggs × 42", "Cold cuts × 7 × 200g", "Cheese × 7 × 150g", "Chicken × 2 kg", "Butter × 3 packs", "Milk/oat × 4 L"] },
    { name: "Drinks", color: T.ink2, items: ["Water × 84 L", "Beer × 48 cans", "Wine × 8 bottles", "Soft drinks × 24 cans", "Juice × 6 L"] },
    { name: "Sundries", color: T.ink2, items: ["Sunscreen × 4", "Dish soap × 2", "Bin bags × 1 roll", "Kitchen towels × 4"] },
  ];

  const allItems = sections.flatMap(s => s.items.map(it => `${s.name}-${it}`));
  const done = checked.length;
  const total = allItems.length;

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: T.bg }}>
      <div style={{ background: T.surface, borderBottom: `1px solid ${T.rule}`, padding: "0 20px 14px", display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
        <BackButton onClick={() => onScreen("trip_provisions")} />
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: T.ink0, letterSpacing: "-0.3px" }}>Shopping list</h2>
          <p style={{ fontSize: 11, color: T.ink2 }}>{done} of {total} · Kornati trip</p>
        </div>
        <button style={{ background: T.surfaceEl, border: "none", borderRadius: T.r3, padding: "8px 12px", fontSize: 11, fontWeight: 600, color: T.ink1, cursor: "pointer", minHeight: 44 }}>
          Share
        </button>
      </div>
      <div style={{ padding: "6px 20px 8px", background: T.surface, borderBottom: `1px solid ${T.rule}`, flexShrink: 0 }}>
        <Bar pct={(done / total) * 100} h={3} color={done === total ? T.green : T.blue} />
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px 32px" }}>
        {sections.map((sec, si) => (
          <div key={si} style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: sec.color, marginBottom: 8, letterSpacing: "0.3px" }}>{sec.name.toUpperCase()}</p>
            {sec.items.map((item, ii) => {
              const id = `${sec.name}-${item}`;
              const on = checked.includes(id);
              return (
                <button key={ii} onClick={() => toggle(id)}
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderTop: "none", borderLeft: "none", borderRight: "none", borderBottom: `1px solid ${T.rule}`, background: "none", cursor: "pointer", textAlign: "left" }}>
                  <div style={{ width: 22, height: 22, borderRadius: "50%", border: `1.5px solid ${on ? T.green : T.ruleStr}`, background: on ? T.green : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {on && <Check size={10} style={{ color: "#FFF", strokeWidth: 3 }} />}
                  </div>
                  <span style={{ fontSize: 13, color: on ? T.ink3 : T.ink0, textDecoration: on ? "line-through" : "none", fontWeight: 400 }}>{item}</span>
                </button>
              );
            })}
          </div>
        ))}
        <button style={{ width: "100%", background: T.surfaceEl, border: "none", borderRadius: T.r3, padding: "12px", fontSize: 12, fontWeight: 600, color: T.ink2, cursor: "pointer" }}>
          + Add item
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PRE-DEPARTURE CHECKLIST
// ─────────────────────────────────────────────────────────────────────────────
function PreDepartureScreen({ onScreen }: { onScreen: (s: ScreenKey) => void }) {
  const [checked, setChecked] = useState<number[]>([0, 1, 2, 3, 5, 7, 11, 12]);

  const items = [
    { label: "Safety equipment on board and accessible",    cat: "Safety" },
    { label: "Fire extinguishers charged and in date",      cat: "Safety" },
    { label: "Life jackets accessible for all on board",    cat: "Safety" },
    { label: "Emergency flares in date",                    cat: "Safety" },
    { label: "First aid kit stocked",                       cat: "Safety" },
    { label: "Engine checks — oil, coolant, belts",         cat: "Engine" },
    { label: "Fuel level confirmed — min 80% for passage",  cat: "Engine" },
    { label: "Fresh water tanks full",                      cat: "Provisions" },
    { label: "Provisions loaded and stowed",                cat: "Provisions" },
    { label: "Ice / cooling in galley",                     cat: "Provisions" },
    { label: "Dinghy and outboard secured",                 cat: "Equipment" },
    { label: "Anchor and chain deployed and ready",         cat: "Equipment" },
    { label: "Charts and passage plan loaded",              cat: "Navigation" },
    { label: "Weather checked — departure window clear",    cat: "Navigation" },
  ];

  const done = checked.length;
  const pct = (done / items.length) * 100;
  const cats = [...new Set(items.map(i => i.cat))];

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: T.bg }}>
      <div style={{ background: T.surface, borderBottom: `1px solid ${T.rule}`, padding: "0 16px 12px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 10 }}>
          <BackButton onClick={() => onScreen("trip_plan")} />
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: T.ink0, letterSpacing: "-0.3px" }}>Pre-departure checklist</h2>
            <p style={{ fontSize: 11, color: T.ink2 }}>{done} of {items.length} · Serenity</p>
          </div>
          <span style={{ fontFamily: T.mono, fontSize: 13, fontWeight: 600, color: done === items.length ? T.green : T.blue }}>
            {Math.round(pct)}%
          </span>
        </div>
        <Bar pct={pct} h={3} color={done === items.length ? T.green : T.blue} />
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "10px 16px 32px" }}>
        {cats.map(cat => (
          <div key={cat} style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: T.ink3, letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: 6 }}>{cat}</p>
            {items.filter(it => it.cat === cat).map((item) => {
              const i = items.indexOf(item);
              const on = checked.includes(i);
              return (
                <div key={i} style={{ background: T.surface, borderRadius: T.r2, marginBottom: 5, border: `1px solid ${on ? "rgba(0,135,90,0.16)" : T.rule}`, overflow: "hidden", position: "relative" }}>
                  {on && <KeelLine />}
                  <div style={{ display: "flex", alignItems: "center", padding: "4px 12px 4px 9px", gap: 2 }}>
                    <button onClick={() => setChecked(p => p.includes(i) ? p.filter(x => x !== i) : [...p, i])}
                      style={{ minWidth: 44, minHeight: 44, border: "none", background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
                      <div style={{ width: 22, height: 22, borderRadius: "50%", border: `1.5px solid ${on ? T.green : T.ruleStr}`, background: on ? T.green : "transparent", display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                        {on && <Check size={11} style={{ color: "#FFF", strokeWidth: 2.5 }} />}
                      </div>
                    </button>
                    <p style={{ flex: 1, fontSize: 13, fontWeight: 400, color: on ? T.ink3 : T.ink0, textDecoration: on ? "line-through" : "none", paddingTop: 12, paddingBottom: 12, lineHeight: 1.35 }}>{item.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        <button onClick={() => onScreen("trip_checkin")}
          style={{ width: "100%", background: T.blue, color: "#FFF", border: "none", borderRadius: T.r, padding: "14px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
          Continue to check-in inspection →
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CHECK-IN INSPECTION
// ─────────────────────────────────────────────────────────────────────────────
function CheckInScreen({ onScreen }: { onScreen: (s: ScreenKey) => void }) {
  const [checked, setChecked] = useState<number[]>([0, 2, 4]);
  const items = [
    { label: "Hull — no visible damage or deformation",   note: "Both sides, waterline" },
    { label: "Antifouling in good condition",             note: "" },
    { label: "Keel bolts — no rust or weeping",          note: "" },
    { label: "Rudder — full port and starboard travel",  note: "" },
    { label: "Through-hulls closed, sea cocks operable", note: "" },
    { label: "Anchor & chain in good condition",         note: "" },
  ];
  const pct = (checked.length / items.length) * 100;
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: T.bg }}>
      <div style={{ background: T.surface, borderBottom: `1px solid ${T.rule}`, padding: "0 16px 12px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 10 }}>
          <BackButton onClick={() => onScreen("trip_predep")} />
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: T.ink0 }}>Check-in · Hull &amp; Deck</h2>
            <p style={{ fontSize: 11, color: T.ink2 }}>Kornati trip · Section 1 of 5</p>
          </div>
          <span style={{ fontFamily: T.mono, fontSize: 13, fontWeight: 600, color: pct === 100 ? T.green : T.blue }}>
            {checked.length}/{items.length}
          </span>
        </div>
        <Bar pct={pct} h={2} color={pct === 100 ? T.green : T.blue} />
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px" }}>
        {items.map((item, i) => {
          const on = checked.includes(i);
          return (
            <div key={i} style={{ background: T.surface, borderRadius: T.r, marginBottom: 6, border: `1px solid ${on ? "rgba(0,135,90,0.16)" : T.rule}`, overflow: "hidden", position: "relative" }}>
              {on && <KeelLine />}
              <div style={{ display: "flex", alignItems: "flex-start", padding: "4px 12px 4px 9px", gap: 2 }}>
                <button onClick={() => setChecked(p => p.includes(i) ? p.filter(x => x !== i) : [...p, i])}
                  style={{ minWidth: 44, minHeight: 44, border: "none", background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
                  <div style={{ width: 22, height: 22, borderRadius: "50%", border: `1.5px solid ${on ? T.green : T.ruleStr}`, background: on ? T.green : "transparent", display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                    {on && <Check size={11} style={{ color: "#FFF", strokeWidth: 2.5 }} />}
                  </div>
                </button>
                <div style={{ flex: 1, paddingTop: 12, paddingBottom: 12 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: on ? T.ink3 : T.ink0, textDecoration: on ? "line-through" : "none" }}>{item.label}</p>
                  {item.note && <p style={{ fontSize: 11, color: T.ink2, marginTop: 2 }}>{item.note}</p>}
                </div>
                <div style={{ display: "flex", gap: 4, paddingTop: 6 }}>
                  <button onClick={() => onScreen("log_add")} style={{ background: T.amberL, border: "none", borderRadius: T.r3, minWidth: 44, minHeight: 44, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                    <AlertTriangle size={ICON.sm} style={{ color: T.amber }} />
                  </button>
                  <button style={{ background: T.blueL, border: "none", borderRadius: T.r3, minWidth: 44, minHeight: 44, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                    <Camera size={ICON.sm} style={{ color: T.blue }} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ padding: "12px 16px 8px", borderTop: `1px solid ${T.rule}`, background: T.surface, flexShrink: 0 }}>
        <button onClick={() => onScreen("trip_underway")} style={{ width: "100%", background: T.blue, color: "#FFF", border: "none", borderRadius: T.r, padding: "14px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
          Complete check-in &amp; depart →
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// UNDERWAY
// ─────────────────────────────────────────────────────────────────────────────
function UnderwayScreen({ onScreen }: { onScreen: (s: ScreenKey) => void }) {
  const day = 3;
  const total = 7;
  const destination = "Kornati National Park";

  return (
    <div style={{ flex: 1, overflowY: "auto", background: T.bg }}>
      <div style={{ background: T.vessel, padding: "10px 20px 22px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <span style={{ fontSize: 15, fontWeight: 800, color: "rgba(255,255,255,0.90)", letterSpacing: "0.10em" }}>TROVE</span>
          <Pill text={`Day ${day} of ${total}`} type="ghost" />
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "#FFF", letterSpacing: "-0.7px", lineHeight: 1.1, marginBottom: 4 }}>{destination}</h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.44)", marginBottom: 20 }}>Serenity · 4 crew · 2 guests</p>
        <div style={{ display: "flex", gap: 16 }}>
          {[
            { icon: Sun,      val: "27°C",  label: "Air" },
            { icon: Wind,     val: "NE 12", label: "Wind" },
            { icon: Droplets, val: "24°C",  label: "Sea" },
          ].map(({ icon: Icon, val, label }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Icon size={ICON.sm} style={{ color: "rgba(255,255,255,0.36)" }} />
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.80)" }}>{val}</p>
                <p style={{ fontSize: 9, color: "rgba(255,255,255,0.30)" }}>{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "16px 16px 40px" }}>
        <button onClick={() => onScreen("log_add")}
          style={{ width: "100%", background: T.surface, borderRadius: T.r, boxShadow: T.sh1, padding: "14px 16px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12, cursor: "pointer", border: `1px solid ${T.rule}`, textAlign: "left" }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: T.blueL, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Plus size={ICON.md} style={{ color: T.blue }} />
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: T.ink0, marginBottom: 2 }}>Log something</p>
            <p style={{ fontSize: 12, color: T.ink2 }}>Observation · note · photo · issue</p>
          </div>
        </button>

        <SLabel mt={0} action="View all" onAction={() => onScreen("log")}>Open observations</SLabel>
        {[
          { title: "Port winch — grinding noise under load", loc: "Cockpit · Minor", time: "Jun 17 · 10:28" },
          { title: "Navigation light flickering at speed",   loc: "Bow · Minor",    time: "Jun 17 · 14:15" },
        ].map((obs, i) => (
          <button key={i} onClick={() => onScreen("log")}
            style={{ width: "100%", background: T.surface, borderRadius: T.r2, boxShadow: T.sh0, border: `1px solid rgba(201,106,0,0.20)`, padding: "11px 14px", marginBottom: 6, display: "flex", justifyContent: "space-between", alignItems: "flex-start", cursor: "pointer", textAlign: "left", position: "relative", overflow: "hidden" }}>
            <KeelLine />
            <div style={{ paddingLeft: 8, flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: T.ink0, lineHeight: 1.35, marginBottom: 3 }}>{obs.title}</p>
              <p style={{ fontSize: 11, color: T.ink2 }}>{obs.loc}</p>
            </div>
            <p style={{ fontFamily: T.mono, fontSize: 9, color: T.ink3, flexShrink: 0, marginTop: 2 }}>{obs.time}</p>
          </button>
        ))}

        <Divider />

        <SLabel mt={0} action="View" onAction={() => onScreen("trip_shopping")}>Provisions &amp; shopping</SLabel>
        <Card p="12px 16px" mb={16}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <p style={{ fontSize: 13, fontWeight: 500, color: T.ink0 }}>Shopping list</p>
            <Pill text="12 remaining" type="neutral" />
          </div>
          <Bar pct={30} h={2} />
          <p style={{ fontSize: 11, color: T.ink2, marginTop: 8 }}>Tap to check off items at the market</p>
        </Card>

        <SLabel mt={0} action="Manage" onAction={() => onScreen("trip_crew")}>Crew &amp; guests</SLabel>
        <div style={{ display: "flex", gap: 10 }}>
          {[
            { initial: "M", name: "Marco",  role: "Skipper"  },
            { initial: "L", name: "Lucia",  role: "Mate"     },
            { initial: "T", name: "Tom",    role: "Crew"     },
            { initial: "S", name: "Sara",   role: "Crew"     },
            { initial: "J", name: "James",  role: "Guest"    },
            { initial: "C", name: "Claire", role: "Guest"    },
          ].map((p, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: i < 4 ? T.surfaceEl : T.blueL, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 5px" }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: i < 4 ? T.ink1 : T.blue }}>{p.initial}</span>
              </div>
              <p style={{ fontSize: 9, color: T.ink2, fontWeight: 500 }}>{p.name}</p>
            </div>
          ))}
        </div>

        <Divider />

        <button onClick={() => onScreen("trip_checkout")}
          style={{ width: "100%", background: T.ink0, color: "#FFF", border: "none", borderRadius: T.r, padding: "14px", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Ready to end the trip?</span>
          <ArrowRight size={ICON.sm} style={{ color: "rgba(255,255,255,0.44)" }} />
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LOG
// ─────────────────────────────────────────────────────────────────────────────
function LogScreen({ onScreen }: { onScreen: (s: ScreenKey) => void }) {
  const entries = [
    { type: "observation", title: "Port winch — grinding noise",     loc: "Cockpit", time: "Jun 17 · 10:28", severity: "minor",  src: PH.winch  },
    { type: "note",        title: "Anchored in Lojena bay",          loc: "44.1°N 15.2°E", time: "Jun 17 · 14:00", severity: null, src: null },
    { type: "photo",       title: "Sunset over Kornat island",       loc: "44.1°N 15.1°E", time: "Jun 16 · 20:12", severity: null, src: PH.deck  },
    { type: "observation", title: "Navigation light flickering",     loc: "Bow · Port", time: "Jun 16 · 14:15", severity: "minor", src: PH.safety },
    { type: "note",        title: "Fuelled up at Murter marina",     loc: "Murter",    time: "Jun 15 · 11:30", severity: null, src: null },
    { type: "check-in",    title: "Check-in inspection complete",   loc: "Serenity",  time: "Jun 15 · 09:42", severity: null, src: PH.hull  },
  ];

  const typeIcon = (t: string) => ({ observation: AlertTriangle, note: BookOpen, photo: Camera, "check-in": CheckCircle })[t] ?? BookOpen;
  const typeColor = (t: string) => ({ observation: T.amber, note: T.blue, photo: T.ink2, "check-in": T.green })[t] ?? T.ink2;

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: T.bg }}>
      <div style={{ background: T.surface, borderBottom: `1px solid ${T.rule}`, padding: "10px 20px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
        <div>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: T.ink0, letterSpacing: "-0.4px" }}>Logbook</h2>
          <p style={{ fontSize: 11, color: T.ink2, marginTop: 2 }}>Kornati Islands · Jun 15–22</p>
        </div>
        <button onClick={() => onScreen("log_add")}
          style={{ display: "flex", alignItems: "center", gap: 6, background: T.blue, border: "none", borderRadius: T.r2, padding: "9px 14px", cursor: "pointer", minHeight: 44 }}>
          <Plus size={ICON.sm} style={{ color: "#FFF" }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: "#FFF" }}>Log</span>
        </button>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px 32px" }}>
        {entries.map((e, i) => {
          const Icon = typeIcon(e.type);
          const color = typeColor(e.type);
          const isObs = e.type === "observation";
          return (
            <div key={i} style={{ display: "flex", gap: 12, marginBottom: 6 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 8, flexShrink: 0 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: isObs ? T.amberL : T.surfaceEl, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={12} style={{ color }} />
                </div>
                {i < entries.length - 1 && <div style={{ width: 1, flex: 1, background: T.rule, marginTop: 4, minHeight: 16 }} />}
              </div>
              <div style={{ flex: 1, background: T.surface, borderRadius: T.r2, border: `1px solid ${isObs ? "rgba(201,106,0,0.20)" : T.rule}`, padding: "11px 14px", marginBottom: 0, position: "relative", overflow: "hidden" }}>
                {isObs && <KeelLine />}
                <div style={{ paddingLeft: isObs ? 8 : 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: T.ink0, marginBottom: 2, lineHeight: 1.3 }}>{e.title}</p>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <p style={{ fontSize: 11, color: T.ink2 }}>{e.loc}</p>
                    <p style={{ fontFamily: T.mono, fontSize: 9.5, color: T.ink3 }}>{e.time}</p>
                  </div>
                  {e.src && (
                    <div style={{ marginTop: 8, height: 72, borderRadius: T.r3, overflow: "hidden" }}>
                      <img src={e.src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ADD LOG ENTRY
// ─────────────────────────────────────────────────────────────────────────────
function AddLogScreen({ onScreen }: { onScreen: (s: ScreenKey) => void }) {
  const [type, setType] = useState<"observation" | "note" | "photo">("observation");
  const [severity, setSeverity] = useState<"minor" | "moderate" | "serious">("minor");

  return (
    <div style={{ flex: 1, overflowY: "auto", background: T.bg }}>
      <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "0 18px 12px", background: T.surface, borderBottom: `1px solid ${T.rule}` }}>
        <BackButton onClick={() => onScreen("log")} />
        <h2 style={{ fontWeight: 700, fontSize: 15, color: T.ink0, letterSpacing: "-0.3px" }}>Add to log</h2>
      </div>

      <div style={{ background: T.surface, borderBottom: `1px solid ${T.rule}`, padding: "10px 16px", display: "flex", gap: 6 }}>
        {(["observation", "note", "photo"] as const).map(t => (
          <button key={t} onClick={() => setType(t)}
            style={{ flex: 1, padding: "9px 0", borderRadius: T.r3, border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer", background: type === t ? T.ink0 : T.surfaceEl, color: type === t ? "#FFF" : T.ink2 }}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div style={{ margin: "16px 16px 0", borderRadius: T.r, overflow: "hidden", height: 160, background: T.vessel, position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8 }}>
          <Camera size={ICON.xl} style={{ color: "rgba(255,255,255,0.22)" }} />
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.34)" }}>Tap to capture</span>
        </div>
        {(["tl","tr","bl","br"] as const).map(pos => (
          <div key={pos} style={{ position: "absolute", top: pos.startsWith("t") ? 12 : undefined, bottom: pos.startsWith("b") ? 12 : undefined, left: pos.endsWith("l") ? 12 : undefined, right: pos.endsWith("r") ? 12 : undefined, width: 14, height: 14, borderTop: pos.startsWith("t") ? `1.5px solid ${T.blue}` : "none", borderBottom: pos.startsWith("b") ? `1.5px solid ${T.blue}` : "none", borderLeft: pos.endsWith("l") ? `1.5px solid ${T.blue}` : "none", borderRight: pos.endsWith("r") ? `1.5px solid ${T.blue}` : "none" }} />
        ))}
        <div style={{ position: "absolute", bottom: 8, right: 12 }}>
          <span style={{ fontFamily: T.mono, fontSize: 9, color: "rgba(255,255,255,0.28)" }}>Jun 17 · 10:28</span>
        </div>
      </div>

      <div style={{ padding: "14px 16px 32px" }}>
        <Card p="12px 14px" mb={12}>
          <p style={{ fontSize: 11, fontWeight: 600, color: T.ink2, marginBottom: 6 }}>Description</p>
          <p style={{ fontSize: 13, color: T.ink2, lineHeight: 1.55 }}>Port winch making a grinding noise under load…</p>
          <Divider my={10} />
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <MapPin size={ICON.xs} style={{ color: T.ink2 }} />
            <span style={{ fontSize: 12, color: T.ink1 }}>Cockpit · Port side</span>
          </div>
        </Card>

        {type === "observation" && (
          <>
            <p style={{ fontSize: 11, fontWeight: 600, color: T.ink2, marginBottom: 8, letterSpacing: "0.3px", textTransform: "uppercase" }}>Severity</p>
            <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
              {(["minor","moderate","serious"] as const).map(s => {
                const c = { minor: [T.green, T.greenL], moderate: [T.amber, T.amberL], serious: [T.red, T.redL] }[s];
                const on = severity === s;
                return (
                  <button key={s} onClick={() => setSeverity(s)}
                    style={{ flex: 1, padding: "12px 0", borderRadius: T.r2, border: `1.5px solid ${on ? c[0] : T.rule}`, background: on ? c[1] : T.surface, color: on ? c[0] : T.ink2, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                );
              })}
            </div>
          </>
        )}

        <button onClick={() => onScreen("log")} style={{ width: "100%", background: T.blue, color: "#FFF", border: "none", borderRadius: T.r, padding: "14px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
          Save to logbook
        </button>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────��──
// CHECK-OUT + HANDOVER
// ─────────────────────────────────────────────────────────────────────────────
function CheckoutScreen({ onScreen }: { onScreen: (s: ScreenKey) => void }) {
  const rows = [
    { label: "Hull condition",   inn: "Excellent", out: "Good",     delta: "Minor scuff — starboard bow", measured: false },
    { label: "Engine hours",     inn: "1,204 h",   out: "1,219 h",  delta: "+15 hrs",                    measured: true  },
    { label: "Fuel level",       inn: "100%",      out: "82%",      delta: "−18%",                       measured: true  },
    { label: "Water tank",       inn: "Full",      out: "Full",     delta: null,                         measured: false },
    { label: "Safety equipment", inn: "Complete",  out: "Complete", delta: null,                         measured: false },
    { label: "Cleanliness",      inn: "A+",        out: "B+",       delta: "Light cleaning required",    measured: false },
  ];

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <div style={{ background: T.vessel, padding: "0 20px 22px", flexShrink: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 4, marginBottom: 16 }}>
          <BackButton onClick={() => onScreen("trip_underway")} dark />
          <button style={{ width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", cursor: "pointer" }}>
            <MoreHorizontal size={ICON.md} style={{ color: "rgba(255,255,255,0.36)" }} />
          </button>
        </div>
        <Pill text="Completing" type="ghost" />
        <h1 style={{ fontSize: 26, fontWeight: 700, color: "#FFF", letterSpacing: "-0.6px", marginTop: 8, marginBottom: 4 }}>Kornati Islands</h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.42)" }}>Serenity · Jun 15–22 · 7 nights</p>
      </div>

      <div style={{ flex: 1, overflowY: "auto", background: T.bg, padding: "16px 16px 40px" }}>
        {[
          { label: "Check-out inspection",  sub: "6 of 14 items", done: false, action: () => onScreen("trip_checkin")  },
          { label: "Handover comparison",   sub: "Ready to review", done: false, action: () => onScreen("trip_handover") },
          { label: "Sign & generate report", sub: "After handover",  done: false, action: () => onScreen("trip_report")   },
        ].map((s, i) => (
          <button key={i} onClick={s.action}
            style={{ width: "100%", background: T.surface, borderRadius: T.r, boxShadow: T.sh0, border: `1px solid ${T.rule}`, padding: "14px 16px", marginBottom: 8, display: "flex", gap: 12, alignItems: "center", cursor: "pointer", textAlign: "left" }}>
            <div style={{ width: 22, height: 22, borderRadius: "50%", border: `1.5px solid ${T.ruleStr}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {s.done && <Check size={10} style={{ color: T.green, strokeWidth: 3 }} />}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: T.ink0 }}>{s.label}</p>
              <p style={{ fontSize: 11, color: T.ink2, marginTop: 2 }}>{s.sub}</p>
            </div>
            <ChevronRight size={ICON.sm} style={{ color: T.ink3 }} />
          </button>
        ))}

        <Divider />

        <SLabel mt={0}>Check-in vs check-out</SLabel>
        <div style={{ display: "flex", gap: 8, marginBottom: 8, paddingLeft: 110 }}>
          <div style={{ flex: 1, background: T.greenL, borderRadius: T.r3, padding: "6px 8px", textAlign: "center" }}>
            <p style={{ fontSize: 9, fontWeight: 700, color: T.green }}>Check-in</p>
          </div>
          <div style={{ flex: 1, background: T.blueL, borderRadius: T.r3, padding: "6px 8px", textAlign: "center" }}>
            <p style={{ fontSize: 9, fontWeight: 700, color: T.blue }}>Check-out</p>
          </div>
        </div>
        {rows.map((row, i) => {
          const hasDelta = !!row.delta;
          return (
            <div key={i} style={{ background: T.surface, borderRadius: T.r2, padding: "10px 12px", marginBottom: 5, border: `1px solid ${hasDelta ? "rgba(201,106,0,0.18)" : T.rule}`, position: "relative", overflow: "hidden" }}>
              {hasDelta && <KeelLine />}
              <div style={{ paddingLeft: hasDelta ? 8 : 0 }}>
                <p style={{ fontSize: 10, color: T.ink2, marginBottom: 6 }}>{row.label}</p>
                <div style={{ display: "flex", gap: 8 }}>
                  <div style={{ flex: 1, background: T.greenL, borderRadius: T.r3, padding: "5px 8px", textAlign: "center" }}>
                    <span style={{ fontFamily: row.measured ? T.mono : "inherit", fontSize: 11, fontWeight: 600, color: T.green }}>{row.inn}</span>
                  </div>
                  <div style={{ flex: 1, background: hasDelta ? T.amberL : T.blueL, borderRadius: T.r3, padding: "5px 8px", textAlign: "center" }}>
                    <span style={{ fontFamily: row.measured ? T.mono : "inherit", fontSize: 11, fontWeight: 600, color: hasDelta ? T.amber : T.blue }}>{row.out}</span>
                  </div>
                </div>
                {hasDelta && <p style={{ fontSize: 10, color: T.amber, marginTop: 5, fontWeight: 500 }}>△ {row.delta}</p>}
              </div>
            </div>
          );
        })}

        <button onClick={() => onScreen("trip_report")}
          style={{ width: "100%", background: T.blue, color: "#FFF", border: "none", borderRadius: T.r, padding: "14px", fontSize: 14, fontWeight: 600, cursor: "pointer", marginTop: 16 }}>
          Sign off &amp; generate report →
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PDF EXPORT
// ─────────────────────────────────────────────────────────────────────────────
function exportTripPDF() {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>TROVE · Trip Report · Kornati Islands</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:Inter,sans-serif;background:#F5F5F8;color:#0C0C14;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  .page{max-width:720px;margin:0 auto;background:#FFF;min-height:100vh}
  .header{background:#090C18;padding:32px 36px 28px;color:#FFF}
  .brand{font-size:13px;font-weight:800;letter-spacing:0.10em;color:#FFF;margin-bottom:24px}
  .doc-id{font-family:'IBM Plex Mono',monospace;font-size:10px;color:rgba(255,255,255,0.40);margin-bottom:24px;display:block}
  .trip-label{font-size:9px;font-weight:700;letter-spacing:0.6px;text-transform:uppercase;color:#005FCC;margin-bottom:8px}
  .trip-name{font-size:28px;font-weight:700;letter-spacing:-0.6px;margin-bottom:4px}
  .trip-sub{font-size:13px;color:rgba(255,255,255,0.38)}
  .body{padding:32px 36px}
  .status-badge{background:#E6F7F1;color:#00875A;border-radius:8px;padding:14px 18px;display:flex;justify-content:space-between;align-items:center;margin-bottom:28px}
  .status-title{font-size:15px;font-weight:700}
  .status-sub{font-family:'IBM Plex Mono',monospace;font-size:10px;color:#00875A;margin-top:3px}
  .section-label{font-size:10px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;color:#7A7A90;margin-bottom:12px;margin-top:28px}
  table{width:100%;border-collapse:collapse}
  td{padding:9px 0;border-bottom:1px solid rgba(0,0,0,0.06);font-size:12px;vertical-align:top}
  td:first-child{color:#7A7A90;width:140px}
  td:last-child{font-weight:500}
  .mono{font-family:'IBM Plex Mono',monospace}
  .comparison{width:100%;border-collapse:collapse;margin-top:8px}
  .comparison th{font-size:10px;font-weight:700;padding:6px 10px;text-align:left;background:#F5F5F8}
  .comparison td{font-size:12px;padding:8px 10px;border-bottom:1px solid rgba(0,0,0,0.05)}
  .comp-in{color:#00875A;font-weight:600}
  .comp-out-ok{color:#005FCC;font-weight:600}
  .comp-out-warn{color:#C96A00;font-weight:600}
  .delta{color:#C96A00;font-size:10px;margin-top:2px}
  .obs-item{padding:10px 14px;background:#FFF4E0;border-left:3px solid #C96A00;border-radius:0 6px 6px 0;margin-bottom:8px}
  .obs-title{font-size:12px;font-weight:600;color:#0C0C14}
  .obs-meta{font-family:'IBM Plex Mono',monospace;font-size:10px;color:#7A7A90;margin-top:2px}
  .sig-block{display:flex;align-items:center;gap:14px;padding:18px;background:#F5F5F8;border-radius:8px;margin-top:28px}
  .sig-avatar{width:40px;height:40px;border-radius:50%;background:#005FCC;display:flex;align-items:center;justify-content:center;color:#FFF;font-weight:700;font-size:15px;flex-shrink:0}
  .sig-name{font-size:13px;font-weight:600}
  .sig-time{font-family:'IBM Plex Mono',monospace;font-size:10px;color:#7A7A90;margin-top:2px}
  .footer{margin-top:40px;padding:20px 36px;border-top:1px solid rgba(0,0,0,0.07);display:flex;justify-content:space-between;font-size:10px;color:#ABABC0}
  .print-btn{position:fixed;top:20px;right:20px;background:#005FCC;color:#FFF;border:none;border-radius:10px;padding:12px 20px;font-size:13px;font-weight:600;cursor:pointer;font-family:Inter,sans-serif;box-shadow:0 4px 16px rgba(0,95,204,0.30)}
  @media print{.print-btn{display:none}}
</style>
</head>
<body>
<button class="print-btn" onclick="window.print()">⬇ Save as PDF</button>
<div class="page">
  <div class="header">
    <div style="display:flex;justify-content:space-between;align-items:flex-start">
      <div class="brand">TROVE</div>
      <span class="doc-id">MED-2025-0615-001</span>
    </div>
    <div class="trip-label">Trip report</div>
    <div class="trip-name">Kornati Islands</div>
    <div class="trip-sub">Serenity · Jun 15–22, 2025 · 4 crew + 2 guests</div>
  </div>
  <div class="body">
    <div class="status-badge">
      <div>
        <div class="status-title">Trip complete</div>
        <div class="status-sub">7 nights · 96% checklist completion · 2 minor observations</div>
      </div>
      <span style="font-size:20px;opacity:0.6">✓</span>
    </div>
    <div class="section-label">Trip details</div>
    <table>
      <tr><td>Vessel</td><td>Serenity · Bavaria 51 Cruiser · ES-1234-MAL</td></tr>
      <tr><td>Skipper</td><td>Marco Rossi</td></tr>
      <tr><td>Crew</td><td>Lucia Moretti · Tom Andersson · Sara Kim</td></tr>
      <tr><td>Guests</td><td>James Peterson · Claire Peterson (vegetarian)</td></tr>
      <tr><td>Destination</td><td>Kornati National Park, Croatia</td></tr>
      <tr><td>Check-in</td><td class="mono">Jun 15, 2025 · 09:42</td></tr>
      <tr><td>Check-out</td><td class="mono">Jun 22, 2025 · 17:15</td></tr>
      <tr><td>Duration</td><td>7 nights · 168 hours</td></tr>
    </table>
    <div class="section-label">Vessel readings</div>
    <table class="comparison">
      <tr><th>Item</th><th>Check-in</th><th>Check-out</th><th>Delta</th></tr>
      <tr><td>Engine hours</td><td class="comp-in mono">1,204 h</td><td class="comp-out-ok mono">1,219 h</td><td class="mono" style="color:#7A7A90">+15 hrs</td></tr>
      <tr><td>Fuel level</td><td class="comp-in mono">100%</td><td class="comp-out-warn mono">82%</td><td class="mono" style="color:#C96A00">−18%</td></tr>
      <tr><td>Water tank</td><td class="comp-in">Full</td><td class="comp-out-ok">Full</td><td style="color:#7A7A90">—</td></tr>
      <tr><td>Hull condition</td><td class="comp-in">Excellent</td><td class="comp-out-warn">Good</td><td style="color:#C96A00;font-size:11px">Minor scuff — starboard bow</td></tr>
      <tr><td>Safety equipment</td><td class="comp-in">Complete</td><td class="comp-out-ok">Complete</td><td style="color:#7A7A90">—</td></tr>
      <tr><td>Cleanliness</td><td class="comp-in">A+</td><td class="comp-out-warn">B+</td><td style="color:#C96A00;font-size:11px">Light cleaning required</td></tr>
    </table>
    <div class="section-label">Open observations (2)</div>
    <div class="obs-item"><div class="obs-title">Port winch — grinding noise under load</div><div class="obs-meta">Cockpit · Minor · Jun 17, 2025 · 10:28</div></div>
    <div class="obs-item"><div class="obs-title">Navigation light flickering at speed</div><div class="obs-meta">Bow · Port · Minor · Jun 16, 2025 · 14:15</div></div>
    <div class="section-label">Logbook summary</div>
    <table>
      <tr><td>Observations</td><td>2 open (both minor)</td></tr>
      <tr><td>Log entries</td><td>14 total</td></tr>
      <tr><td>Photos captured</td><td>22</td></tr>
      <tr><td>Anchorages</td><td>Lojena Bay, Telašćica, Murter</td></tr>
    </table>
    <div class="sig-block">
      <div class="sig-avatar">M</div>
      <div>
        <div class="sig-name">Signed off by Marco Rossi · Skipper</div>
        <div class="sig-time">Jun 22, 2025 · 17:15 UTC+2</div>
      </div>
    </div>
  </div>
  <div class="footer">
    <span>Generated by TROVE · trove.app</span>
    <span class="mono">MED-2025-0615-001</span>
  </div>
</div>
</body>
</html>`;

  const win = window.open("", "_blank");
  if (win) { win.document.write(html); win.document.close(); }
}

// ─────────────────────────────────────────────────────────────────────────────
// TRIP REPORT
// ─────────────────────────────────────────────────────────────────────────────
function TripReportScreen({ onScreen }: { onScreen: (s: ScreenKey) => void }) {
  return (
    <div style={{ flex: 1, overflowY: "auto", background: T.bg }}>
      <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "0 18px 12px", background: T.surface, borderBottom: `1px solid ${T.rule}` }}>
        <BackButton onClick={() => onScreen("trip_checkout")} />
        <h2 style={{ fontWeight: 700, fontSize: 15, color: T.ink0, flex: 1 }}>Trip report</h2>
        <button onClick={exportTripPDF} style={{ background: T.blue, border: "none", borderRadius: T.r3, padding: "8px 12px", display: "flex", alignItems: "center", gap: 5, cursor: "pointer", minHeight: 44 }}>
          <Download size={ICON.sm} style={{ color: "#FFF" }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: "#FFF" }}>PDF</span>
        </button>
      </div>
      <div style={{ margin: "14px 12px 32px", background: "#FFF", borderRadius: T.r, boxShadow: T.sh2, overflow: "hidden" }}>
        <div style={{ background: T.vessel, padding: "20px 20px 18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18 }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: "#FFF", letterSpacing: "0.10em" }}>TROVE</span>
            <p style={{ fontFamily: T.mono, color: "rgba(255,255,255,0.60)", fontSize: 10 }}>MED-2025-0615-001</p>
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 16 }}>
            <p style={{ fontSize: 9, fontWeight: 700, color: T.blue, letterSpacing: "0.6px", textTransform: "uppercase", marginBottom: 6 }}>Trip report</p>
            <h3 style={{ fontWeight: 700, fontSize: 22, color: "#FFF", letterSpacing: "-0.5px", marginBottom: 3 }}>Kornati Islands</h3>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.38)" }}>Serenity · Jun 15–22, 2025 · 4 crew + 2 guests</p>
          </div>
        </div>
        <div style={{ padding: "18px 20px" }}>
          <div style={{ background: T.greenL, borderRadius: T.r3, padding: "12px 14px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: T.ink0 }}>Trip complete</p>
              <p style={{ fontFamily: T.mono, fontSize: 10, color: T.green, marginTop: 2 }}>7 nights · 96% checklist · 2 minor obs</p>
            </div>
            <Star size={20} style={{ color: T.green, opacity: 0.70 }} />
          </div>
          {[
            ["Vessel",        "Serenity · Bavaria 51 · ES-1234-MAL"],
            ["Skipper",       "Marco Rossi"],
            ["Dates",         "Jun 15–22, 2025"],
            ["Destination",   "Kornati National Park, Croatia"],
            ["Check-in",      "Jun 15 · 09:42"],
            ["Check-out",     "Jun 22 · 17:15"],
            ["Engine hours",  "+15 hrs (1,204 → 1,219)"],
            ["Fuel used",     "−18% (100% → 82%)"],
            ["Observations",  "2 open (minor)"],
            ["Photos",        "22 captured"],
          ].map(([label, value]) => (
            <div key={label} style={{ display: "flex", gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: T.ink2, minWidth: 80, flexShrink: 0 }}>{label}</span>
              <span style={{ fontSize: 11, color: T.ink0 }}>{value}</span>
            </div>
          ))}
          <Divider my={14} />
          <p style={{ fontSize: 10, fontWeight: 600, color: T.ink3, letterSpacing: "0.4px", textTransform: "uppercase", marginBottom: 8 }}>Evidence photos</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 5, marginBottom: 14 }}>
            {[PH.hull, PH.engine, PH.winch, PH.deck, PH.safety, PH.deck].map((src, i) => (
              <div key={i} style={{ height: 70, borderRadius: T.r3, overflow: "hidden" }}>
                <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            ))}
          </div>
          <Divider my={14} />
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 14 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: T.blue, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#FFF" }}>M</span>
            </div>
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, color: T.ink0 }}>Signed — Marco Rossi · Skipper</p>
              <p style={{ fontFamily: T.mono, fontSize: 9, color: T.ink2 }}>Jun 22, 2025 · 17:15</p>
            </div>
          </div>
          <button onClick={exportTripPDF} style={{ width: "100%", background: T.blue, color: "#FFF", border: "none", borderRadius: T.r, padding: "13px", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <Download size={ICON.md} />
            Export as PDF
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// VESSEL TAB
// ─────────────────────────────────────────────────────────────────────────────
function VesselScreen({ onScreen }: { onScreen: (s: ScreenKey) => void }) {
  const past = [
    { name: "Kornati Islands",   dates: "Jun 15–22, 2025", crew: 4, guests: 2, ok: true  },
    { name: "Amalfi Coast",      dates: "Apr 1–8, 2025",   crew: 2, guests: 4, ok: true  },
    { name: "Balearics circuit", dates: "Sep 10–18, 2024", crew: 3, guests: 3, ok: false },
    { name: "Corsica south",     dates: "Jul 5–14, 2024",  crew: 4, guests: 0, ok: true  },
  ];

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <div style={{ background: T.vessel, padding: "10px 20px 22px", flexShrink: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <button style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 99, padding: "6px 12px 6px 14px", cursor: "pointer" }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#FFF" }}>Serenity</span>
            <ChevronDown size={ICON.xs} style={{ color: "rgba(255,255,255,0.40)" }} />
          </button>
          <button style={{ width: 32, height: 32, background: "rgba(255,255,255,0.08)", border: "none", borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Plus size={ICON.sm} style={{ color: "rgba(255,255,255,0.50)" }} />
          </button>
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: "#FFF", letterSpacing: "-0.9px", lineHeight: 1, marginBottom: 4 }}>Serenity</h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.38)", marginBottom: 16 }}>Bavaria 51 Cruiser · 2019 · ES-1234-MAL</p>
        <div style={{ height: 1, background: "rgba(255,255,255,0.07)", marginBottom: 14 }} />
        <div style={{ display: "flex", gap: 0 }}>
          {[["24", "trips"], ["168", "nights"], ["1,219 h", "engine"]].map(([n, l], i) => (
            <React.Fragment key={l}>
              {i > 0 && <div style={{ width: 1, background: "rgba(255,255,255,0.07)", margin: "0 18px" }} />}
              <div>
                <p style={{ fontFamily: T.mono, fontSize: 18, fontWeight: 700, color: "#FFF", lineHeight: 1 }}>{n}</p>
                <p style={{ fontSize: 9.5, color: "rgba(255,255,255,0.28)", marginTop: 4 }}>{l}</p>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", background: T.bg, padding: "16px 16px 40px" }}>
        <SLabel mt={0}>Vessel details</SLabel>
        <Card p="0 16px" mb={20}>
          {[
            { label: "Manufacturer", value: "Bavaria",          mono: false },
            { label: "Model",        value: "51 Cruiser",       mono: false },
            { label: "Year",         value: "2019",              mono: false },
            { label: "LOA",          value: "15.4 m",            mono: true  },
            { label: "Engine",       value: "Volvo Penta 75 hp", mono: false },
            { label: "HIN",          value: "BAVVN51K2001",      mono: true  },
          ].map(({ label, value, mono }, i, arr) => (
            <RowItem key={label} label={label} value={value} mono={mono} last={i === arr.length - 1} />
          ))}
        </Card>

        <SLabel mt={0}>Photos</SLabel>
        <div style={{ display: "flex", gap: 8, overflowX: "auto", marginLeft: -16, paddingLeft: 16, marginRight: -16, paddingRight: 16, paddingBottom: 4, marginBottom: 20 }}>
          {[
            { src: PH.hull,   label: "Hull",   time: "Jun 15", slot: "v-hull"   },
            { src: PH.engine, label: "Engine", time: "Jun 15", slot: "v-engine" },
            { src: PH.winch,  label: "Winch",  time: "Jun 17", slot: "v-winch"  },
            { src: PH.deck,   label: "Deck",   time: "Jun 16", slot: "v-deck"   },
            { src: PH.safety, label: "Safety", time: "Jun 15", slot: "v-safety" },
          ].map((p, i) => (
            <Photo key={i} src={p.src} label={p.label} time={p.time} slot={p.slot} />
          ))}
        </div>

        <SLabel mt={0}>Past trips</SLabel>
        {past.map((t, i) => (
          <div key={i} style={{ background: T.surface, borderRadius: T.r2, boxShadow: T.sh0, border: `1px solid ${T.rule}`, padding: "12px 14px", marginBottom: 6, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: T.ink0, marginBottom: 3 }}>{t.name}</p>
              <p style={{ fontSize: 11, color: T.ink2 }}>{t.dates} · {t.crew} crew{t.guests > 0 ? ` · ${t.guests} guests` : ""}</p>
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <Pill text={t.ok ? "Clear" : "2 obs"} type={t.ok ? "ok" : "warn"} />
              <ChevronRight size={ICON.sm} style={{ color: T.ink3 }} />
            </div>
          </div>
        ))}

        <Divider />
        <button style={{ width: "100%", background: T.surface, border: `1px solid ${T.rule}`, borderRadius: T.r, padding: "13px", fontSize: 13, fontWeight: 500, color: T.ink2, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <Download size={ICON.sm} />
          Export vessel record
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ROUTER
// ─────────────────────────────────────────────────────────────────────────────
function ScreenContent({ screen, onScreen }: { screen: ScreenKey; onScreen: (s: ScreenKey) => void }) {
  switch (screen) {
    case "welcome":         return <WelcomeScreen onScreen={onScreen} />;
    case "trip_plan":       return <TripPlanScreen onScreen={onScreen} />;
    case "trip_crew":       return <CrewScreen onScreen={onScreen} />;
    case "trip_provisions": return <ProvisioningScreen onScreen={onScreen} />;
    case "trip_shopping":   return <ShoppingScreen onScreen={onScreen} />;
    case "trip_predep":     return <PreDepartureScreen onScreen={onScreen} />;
    case "trip_checkin":    return <CheckInScreen onScreen={onScreen} />;
    case "trip_underway":   return <UnderwayScreen onScreen={onScreen} />;
    case "trip_checkout":   return <CheckoutScreen onScreen={onScreen} />;
    case "trip_handover":   return <CheckoutScreen onScreen={onScreen} />;
    case "trip_report":     return <TripReportScreen onScreen={onScreen} />;
    case "log":             return <LogScreen onScreen={onScreen} />;
    case "log_add":         return <AddLogScreen onScreen={onScreen} />;
    case "vessel":          return <VesselScreen onScreen={onScreen} />;
    case "vessel_detail":   return <VesselScreen onScreen={onScreen} />;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PHONE MOCKUP
// ─────────────────────────────────────────────────────────────────────────────
function PhoneMockup({ screen, onScreen }: { screen: ScreenKey; onScreen: (s: ScreenKey) => void }) {
  const darkStatus = ["trip_underway", "trip_checkout", "vessel"].includes(screen);
  return (
    <div id="phone-export" style={{ background: "#0A0A0E", borderRadius: 54, padding: "12px 12px 0", boxShadow: "0 56px 120px rgba(0,0,0,0.56), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.04)" }}>
      <div style={{ height: 28, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 116, height: 10, background: "#050506", borderRadius: 99 }} />
      </div>
      <div style={{ width: 364, height: 700, background: T.bg, overflow: "hidden", display: "flex", flexDirection: "column", borderRadius: "12px 12px 0 0" }}>
        <StatusBar dark={darkStatus} />
        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <ScreenContent screen={screen} onScreen={onScreen} />
        </div>
        <BottomNav screen={screen} onScreen={onScreen} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// APP — Presenter
// ────────────────────────────────────────────────────────────────────────────��
const SCREENS: { key: ScreenKey; label: string; group: string }[] = [
  { key: "welcome",         label: "Welcome",              group: "Welcome"        },
  { key: "trip_plan",       label: "Trip · Planning",     group: "Trip — Prepare" },
  { key: "trip_crew",       label: "Crew & guests",       group: "Trip — Prepare" },
  { key: "trip_provisions", label: "Provisioning",         group: "Trip — Prepare" },
  { key: "trip_shopping",   label: "Shopping list",        group: "Trip — Prepare" },
  { key: "trip_predep",     label: "Pre-departure",        group: "Trip — Prepare" },
  { key: "trip_checkin",    label: "Check-in inspection",  group: "Trip — Prepare" },
  { key: "trip_underway",   label: "Trip · Underway",     group: "Trip — Underway" },
  { key: "log",             label: "Logbook",              group: "Log" },
  { key: "log_add",         label: "Add entry",            group: "Log" },
  { key: "trip_checkout",   label: "Check-out + handover", group: "Trip — Complete" },
  { key: "trip_report",     label: "Trip report",          group: "Trip — Complete" },
  { key: "vessel",          label: "Vessel",               group: "Vessel" },
];

const GROUPS = ["Welcome", "Trip — Prepare", "Trip — Underway", "Log", "Trip — Complete", "Vessel"];

export default function App() {
  const [screen, setScreen] = useState<ScreenKey>("welcome");
  const [group, setGroup] = useState("Welcome");

  const navigate = (s: ScreenKey) => {
    setScreen(s);
    const g = SCREENS.find(x => x.key === s)?.group;
    if (g) setGroup(g);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#E4E4EA", fontFamily: "Inter, -apple-system, sans-serif" }}>
      {/* MARKER-MAKE-KIT-INVOKED */}

      {/* Presenter header */}
      <div style={{ background: "rgba(255,255,255,0.95)", borderBottom: "1px solid rgba(0,0,0,0.07)", padding: "10px 24px", display: "flex", alignItems: "center", gap: 14, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}>
        <span style={{ fontSize: 14, fontWeight: 800, color: "#0C0C14", letterSpacing: "0.10em", flexShrink: 0 }}>TROVE</span>
        <span style={{ fontSize: 10, color: "#ABABC0", borderLeft: "1px solid #E0E0E8", paddingLeft: 14, flexShrink: 0 }}>Trip companion · Prepare → Underway → Complete</span>
        <div style={{ flex: 1 }} />
        {GROUPS.map(g => (
          <button key={g} onClick={() => { setGroup(g); const first = SCREENS.find(s => s.group === g); if (first) setScreen(first.key); }}
            style={{ padding: "5px 10px", borderRadius: 7, border: "none", fontSize: 10.5, fontWeight: 600, cursor: "pointer", background: group === g ? "#0C0C14" : "#EAEAEF", color: group === g ? "#FFF" : "#7A7A90", whiteSpace: "nowrap" }}>
            {g}
          </button>
        ))}
      </div>

      {/* Screen tabs */}
      <div style={{ background: "rgba(240,240,246,0.95)", borderBottom: "1px solid rgba(0,0,0,0.06)", padding: "7px 24px", display: "flex", gap: 4, overflowX: "auto" }}>
        <span style={{ fontSize: 9.5, color: "#ABABC0", fontWeight: 600, marginRight: 6, flexShrink: 0, letterSpacing: "0.4px", textTransform: "uppercase", alignSelf: "center" }}>Screen</span>
        {SCREENS.filter(s => s.group === group).map(({ key, label }) => (
          <button key={key} onClick={() => setScreen(key)}
            style={{ padding: "5px 12px", borderRadius: 7, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 11.5, fontWeight: 600, whiteSpace: "nowrap", background: screen === key ? "#3C3C4E" : "rgba(255,255,255,0.72)", color: screen === key ? "#FFF" : "#7A7A90", boxShadow: screen === key ? "0 2px 8px rgba(0,0,0,0.16)" : "0 1px 2px rgba(0,0,0,0.05)" }}>
            {label}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "center", padding: "40px 32px 64px" }}>
        <PhoneMockup screen={screen} onScreen={navigate} />
      </div>
    </div>
  );
}
