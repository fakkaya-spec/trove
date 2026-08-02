import React from "react";
import { View, Text, Pressable, Image, StyleSheet, type ViewStyle } from "react-native";
import { T, TSH, TICON } from "../../theme";
import { LIcon } from "../LIcon";

// ---------------------------------------------------------------------------
// TROVE primitive bileşenleri — birebir kaynak:
// design-reference/src/app/App.full.tsx (onaylı görsel dil).
// Web CSS → RN çevirisi dışında hiçbir görsel karar değiştirilmedi.
// ---------------------------------------------------------------------------

/** 2px mavi sol kenar çizgisi — tamamlanmış/doğrulanmış öğe işareti. */
export function KeelLine() {
  return (
    <View
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        bottom: 0,
        width: 2,
        backgroundColor: T.blue,
        borderTopLeftRadius: 2,
        borderBottomLeftRadius: 2,
      }}
    />
  );
}

/** 44×44 dokunma alanı, 32×32 görsel daire. */
export function BackBtn({ onPress, dark = false }: { onPress?: () => void; dark?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}
    >
      <View
        style={[
          styles.backBtnCircle,
          { backgroundColor: dark ? "rgba(255,255,255,0.10)" : T.surfaceEl },
        ]}
      >
        <LIcon name="arrow-left" size={TICON.md} color={dark ? "rgba(255,255,255,0.70)" : T.ink1} />
      </View>
    </Pressable>
  );
}

/** Beyaz yüzey + sh1 gölge kartı. keel=true tamamlanmış işareti ekler. */
export function TCard({
  children,
  pv = 14,
  ph = 16,
  mb = 8,
  keel = false,
  style,
}: {
  children: React.ReactNode;
  pv?: number;
  ph?: number;
  mb?: number;
  keel?: boolean;
  style?: ViewStyle;
}) {
  return (
    <View
      style={[
        {
          backgroundColor: T.surface,
          borderRadius: T.r,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: "rgba(0,0,0,0.04)",
          paddingVertical: pv,
          paddingHorizontal: ph,
          marginBottom: mb,
          overflow: "hidden",
        },
        TSH.sh1,
        style,
      ]}
    >
      {keel && <KeelLine />}
      {children}
    </View>
  );
}

/** Bölüm başlığı: 11px, 600, ink2, büyük harf + isteğe bağlı aksiyon. */
export function SLabel({
  children,
  mt = 16,
  action,
  onAction,
}: {
  children: string;
  mt?: number;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <View style={[styles.slabelRow, { marginTop: mt }]}>
      <Text style={styles.slabelText}>{children.toUpperCase()}</Text>
      {action ? (
        <Pressable onPress={onAction} hitSlop={10} accessibilityRole="button" style={styles.slabelAction}>
          <Text style={styles.slabelActionText}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export type PillType = "ok" | "warn" | "err" | "info" | "ghost" | "neutral";
const PILL_COLORS: Record<PillType, [string, string]> = {
  ok: [T.greenL, T.green],
  warn: [T.amberL, T.amber],
  err: [T.redL, T.red],
  info: [T.blueL, T.blue],
  ghost: ["rgba(255,255,255,0.12)", "rgba(255,255,255,0.70)"],
  neutral: [T.surfaceEl, T.ink2],
};

/** Durum rozeti. ghost yalnız koyu zeminde. */
export function Pill({ text, type }: { text: string; type: PillType }) {
  const [bg, color] = PILL_COLORS[type];
  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      <Text style={[styles.pillText, { color }]} numberOfLines={1}>
        {text}
      </Text>
    </View>
  );
}

/** İlerleme çubuğu. Varsayılan mavi; %100'de çağıran yeşile çevirir. */
export function Bar({ pct, color, h = 2 }: { pct: number; color?: string; h?: number }) {
  return (
    <View style={{ backgroundColor: T.rule, borderRadius: 99, height: h, overflow: "hidden" }}>
      <View
        style={{
          backgroundColor: color ?? T.blue,
          width: `${Math.min(pct, 100)}%`,
          height: "100%",
          borderRadius: 99,
        }}
      />
    </View>
  );
}

export function TDivider({ my = 20 }: { my?: number }) {
  return <View style={{ height: 1, backgroundColor: T.rule, marginVertical: my }} />;
}

/** Etiket + değer satırı (detay tabloları). mono yalnız ölçüm değerlerinde. */
export function RowItem({
  label,
  value,
  mono,
  bold,
  color,
  onPress,
  last = false,
}: {
  label: string;
  value?: string;
  mono?: boolean;
  bold?: boolean;
  color?: string;
  onPress?: () => void;
  last?: boolean;
}) {
  const inner = (
    <View style={[styles.rowItem, !last && styles.rowItemBorder]}>
      <Text style={styles.rowItemLabel}>{label}</Text>
      {value ? (
        <Text
          style={{
            fontSize: 13,
            color: color ?? T.ink0,
            fontFamily: mono ? T.mono : undefined,
            fontWeight: bold ? "600" : "400",
          }}
        >
          {value}
        </Text>
      ) : onPress ? (
        <LIcon name="chevron-right" size={TICON.sm} color={T.ink3} />
      ) : null}
    </View>
  );
  if (onPress)
    return (
      <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => pressed && { opacity: 0.7 }}>
        {inner}
      </Pressable>
    );
  return inner;
}

/**
 * Kanıt/tekne fotoğrafı — SALT GÖSTERİM (etiket + mono zaman overlay'i).
 * Çekim/galeri yükleme Faz 4+ işi ve KİLİTLİ premium kapısından geçecek
 * (docs/MONETIZATION.md); bu bileşen kasıtlı olarak yakalama içermez.
 */
export function TrovePhoto({
  source,
  label,
  time,
  w = 80,
  h = 80,
  r = 10,
}: {
  source: ReturnType<typeof require> | { uri: string };
  label: string;
  time?: string;
  w?: number;
  h?: number;
  r?: number;
}) {
  return (
    <View style={[styles.photo, { width: w, height: h, borderRadius: r }]}>
      <Image source={source} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
      <View style={styles.photoScrim} />
      <View style={styles.photoCaption}>
        <Text style={styles.photoLabel} numberOfLines={1}>
          {label}
        </Text>
        {time ? <Text style={styles.photoTime}>{time}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backBtn: { width: 44, height: 44, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  backBtnCircle: {
    width: 32,
    height: 32,
    borderRadius: 99,
    alignItems: "center",
    justifyContent: "center",
  },
  slabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  slabelText: { fontSize: 11, fontWeight: "600", color: T.ink2, letterSpacing: 0.4 },
  slabelAction: { minHeight: 36, justifyContent: "center" },
  slabelActionText: { fontSize: 11, color: T.blue },
  pill: {
    borderRadius: 99,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: "flex-start",
  },
  pillText: { fontSize: 10, fontWeight: "700" },
  rowItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 11,
  },
  rowItemBorder: { borderBottomWidth: 1, borderBottomColor: T.rule },
  rowItemLabel: { fontSize: 13, color: T.ink1 },
  photo: {
    overflow: "hidden",
    flexShrink: 0,
    ...TSH.sh1,
  },
  photoScrim: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "55%",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  photoCaption: { position: "absolute", bottom: 5, left: 5, right: 5 },
  photoLabel: { color: "#FFFFFF", fontSize: 9, fontWeight: "700", lineHeight: 11 },
  photoTime: { fontFamily: T.mono, fontSize: 9, color: "rgba(255,255,255,0.72)" },
});
