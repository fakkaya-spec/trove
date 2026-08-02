import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  CheckCircle, Camera, AlertTriangle, ChevronRight, Anchor,
  ArrowLeft, ArrowRight, Download, Check, MapPin,
  Wifi, Battery, User, FileText, Shield, Clock, Plus,
  MoreHorizontal, Zap, Calendar, Users, ShoppingCart,
  BookOpen, Sailboat, Sun, Wind, Droplets, ChevronDown,
  List, Utensils, Star, Waves
} from "lucide-react";

// PHOTOS
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

// DESIGN TOKENS — source of truth for TROVE visual language
export const T = {
  bg:       "#F5F5F8",    // page background
  surface:  "#FFFFFF",
  surfaceEl:"#EAEAEF",
  ink0: "#0C0C14",        // primary text
  ink1: "#3C3C4E",
  ink2: "#7A7A90",
  ink3: "#ABABC0",
  rule:    "rgba(0,0,0,0.06)",
  ruleStr: "rgba(0,0,0,0.12)",
  blue:   "#005FCC",      // interactive
  blueL:  "#EBF1FF",
  green:  "#00875A",      // success
  greenL: "#E6F7F1",
  amber:  "#C96A00",      // warning
  amberL: "#FFF4E0",
  red:    "#C82222",
  redL:   "#FEF0F0",
  vessel:  "#090C18",     // dark vessel surfaces
  sh0: "0 1px 2px rgba(0,0,0,0.04)",
  sh1: "0 1px 3px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)",
  sh2: "0 4px 20px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)",
  r:  "14px", r2: "10px", r3: "7px",
  mono: "'IBM Plex Mono', 'Courier New', monospace",
};

export const ICON = { xs: 10, sm: 13, md: 15, lg: 20, xl: 22 } as const;

// SCREEN KEY
export type ScreenKey =
  | "welcome"
  | "trip_plan" | "trip_crew" | "trip_provisions" | "trip_shopping"
  | "trip_predep" | "trip_checkin" | "trip_underway"
  | "trip_checkout" | "trip_handover" | "trip_report"
  | "log" | "log_add"
  | "vessel" | "vessel_detail";

// PHOTO STORE
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

// PRIMITIVES
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
      <div style={{ position: "absolute", bottom: 5, left: 5, right: 5 }}>
        <p style={{ color: "#FFF", fontSize: 9, fontWeight: 700, lineHeight: 1.2 }}>{label}</p>
        {time && <p style={{ fontFamily: T.mono, fontSize: 9, color: "rgba(255,255,255,0.72)" }}>{time}</p>}
      </div>
    </div>
  );
}

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
    <div style={{ background: "rgba(255,255,255,0.94)", borderTop: `1px solid ${T.rule}`, display: "flex", justifyContent: "space-around", padding: "8px 0 20px", flexShrink: 0 }}>
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

// NOTE: Full screen implementations (WelcomeScreen, TripPlanScreen, CrewScreen,
// ProvisioningScreen, ShoppingScreen, PreDepartureScreen, CheckInScreen,
// UnderwayScreen, LogScreen, AddLogScreen, CheckoutScreen, TripReportScreen,
// VesselScreen) are in the full App.tsx in Figma Make.
// This reference file documents the token system, primitives and architecture.

export default function App() {
  return <div>TROVE Design Reference — see design-reference/src/app/App.tsx for full implementation</div>;
}
