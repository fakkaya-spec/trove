import React from "react";
import { Text, View, StyleSheet } from "react-native";
import { colors, fonts } from "../theme";

/** Halat görünümlü bölüm ayracı: ── ⚓ ── */
export function RopeDivider({ label }: { label?: string }) {
  return (
    <View style={dividerStyles.row}>
      <View style={dividerStyles.line} />
      <Text style={dividerStyles.anchor}>{label ?? "⚓"}</Text>
      <View style={dividerStyles.line} />
    </View>
  );
}

const dividerStyles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", marginVertical: 10 },
  line: { flex: 1, height: 1, backgroundColor: colors.rope, opacity: 0.5 },
  anchor: { marginHorizontal: 10, color: colors.rope, fontSize: 13 },
});

/** Pirinç çerçeveli yuvarlak rozet (tekne ikonu için) */
export function BrassRing({ children, size = 54 }: { children: React.ReactNode; size?: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 2,
        borderColor: colors.brass,
        backgroundColor: colors.nightDeep,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {children}
    </View>
  );
}

/** İlerleme çubuğu — pirinç dolgu, halat zemin */
export function ProgressGauge({ done, total }: { done: number; total: number }) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  const full = done === total && total > 0;
  return (
    <View style={gaugeStyles.wrap}>
      <View style={gaugeStyles.track}>
        <View
          style={[
            gaugeStyles.fill,
            { width: `${pct}%` },
            full && { backgroundColor: colors.seafoam },
          ]}
        />
      </View>
      <Text style={gaugeStyles.label}>
        {done}/{total} · %{pct}
      </Text>
    </View>
  );
}

const gaugeStyles = StyleSheet.create({
  wrap: { flexDirection: "row", alignItems: "center", gap: 8 },
  track: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(176, 141, 87, 0.25)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.rope,
    overflow: "hidden",
  },
  fill: { height: "100%", backgroundColor: colors.brass },
  label: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.fog,
    minWidth: 76,
    textAlign: "right",
  },
});

/** Küçük etiket rozeti (KRİTİK / FOTOĞRAFLA) */
export function Tag({ kind }: { kind: "critical" | "photo" }) {
  const critical = kind === "critical";
  return (
    <View
      style={[
        tagStyles.tag,
        { borderColor: critical ? colors.signal : colors.brassDark },
      ]}
    >
      <Text style={[tagStyles.text, { color: critical ? colors.signal : colors.brassDark }]}>
        {critical ? "KRİTİK" : "📷 FOTOĞRAFLA"}
      </Text>
    </View>
  );
}

const tagStyles = StyleSheet.create({
  tag: {
    borderWidth: 1,
    borderRadius: 3,
    paddingHorizontal: 5,
    paddingVertical: 1,
    marginRight: 6,
  },
  text: { fontSize: 9, letterSpacing: 1, fontFamily: fonts.mono },
});
