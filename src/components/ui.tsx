import React from "react";
import { Text, View, StyleSheet, Pressable } from "react-native";
import { colors, fonts, radius, spacing, touch } from "../theme";
import { Icon, type IconName } from "./Icon";

/** Bölüm ayracı: ince çizgi, ortada isteğe bağlı etiket. (Eski adı korunuyor.) */
export function RopeDivider({ label }: { label?: string }) {
  return (
    <View style={dividerStyles.row}>
      <View style={dividerStyles.line} />
      {label ? <Text style={dividerStyles.label}>{label}</Text> : null}
      <View style={dividerStyles.line} />
    </View>
  );
}

const dividerStyles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", marginVertical: 12 },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  label: {
    marginHorizontal: 10,
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1,
  },
});

/** Yuvarlak ikon rozeti (tekne kartları). Eski adı korunuyor. */
export function BrassRing({ children, size = 54 }: { children: React.ReactNode; size?: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.bg,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {children}
    </View>
  );
}

/** İlerleme çubuğu — navy dolgu; tamamlanınca yeşil */
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
            full && { backgroundColor: colors.success },
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
    backgroundColor: colors.border,
    overflow: "hidden",
  },
  fill: { height: "100%", backgroundColor: colors.primary },
  label: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.textSecondary,
    minWidth: 76,
    textAlign: "right",
  },
});

/** Küçük etiket rozeti (KRİTİK / FOTOĞRAFLA) — etiket metni dile göre dışarıdan gelir */
export function Tag({ kind, label }: { kind: "critical" | "photo"; label: string }) {
  const critical = kind === "critical";
  const color = critical ? colors.danger : colors.info;
  const bg = critical ? colors.dangerBg : colors.infoBg;
  return (
    <View style={[tagStyles.tag, { backgroundColor: bg }]}>
      <Text style={[tagStyles.text, { color }]}>{label}</Text>
    </View>
  );
}

const tagStyles = StyleSheet.create({
  tag: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 6,
  },
  text: { fontSize: 11, fontWeight: "600", letterSpacing: 0.5 },
});

/**
 * Standart düğme.
 * primary: navy dolgu + beyaz metin · secondary: beyaz + çizgi + navy metin ·
 * gold: altın dolgu + navy metin (tek vurgulu ana aksiyon) ·
 * danger: beyaz + kırmızı çizgi/metin (yıkıcı olmayan uyarı aksiyonları).
 * Yükseklik ≥48dp (dokunma hedefi).
 */
export function Button({
  label,
  onPress,
  variant = "primary",
  icon,
  disabled,
  compact,
}: {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "gold" | "danger";
  icon?: IconName;
  disabled?: boolean;
  compact?: boolean;
}) {
  const fg =
    variant === "primary"
      ? colors.onPrimary
      : variant === "gold"
        ? colors.onGold
        : variant === "danger"
          ? colors.danger
          : colors.primary;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        btnStyles.base,
        compact && btnStyles.compact,
        variant === "primary" && btnStyles.primary,
        variant === "secondary" && btnStyles.secondary,
        variant === "gold" && btnStyles.gold,
        variant === "danger" && btnStyles.danger,
        disabled && btnStyles.disabled,
        pressed && !disabled && { opacity: 0.85 },
      ]}
    >
      {icon ? <Icon name={icon} size={20} color={fg} /> : null}
      <Text style={[btnStyles.label, { color: fg }]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const btnStyles = StyleSheet.create({
  base: {
    minHeight: touch.min,
    borderRadius: radius.control,
    paddingHorizontal: spacing.m,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  compact: { minHeight: 44, alignSelf: "flex-start" },
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  gold: { backgroundColor: colors.gold },
  danger: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.danger },
  disabled: { opacity: 0.4 },
  label: { fontSize: 15, fontWeight: "600" },
});

/** Boş durum: ikon + başlık + açıklama + birincil aksiyon düğmesi */
export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: {
  icon: IconName;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={emptyStyles.wrap}>
      <View style={emptyStyles.iconWrap}>
        <Icon name={icon} size={32} color={colors.textSecondary} />
      </View>
      <Text style={emptyStyles.title}>{title}</Text>
      {description ? <Text style={emptyStyles.desc}>{description}</Text> : null}
      {actionLabel && onAction ? (
        <View style={emptyStyles.action}>
          <Button label={actionLabel} onPress={onAction} />
        </View>
      ) : null}
    </View>
  );
}

const emptyStyles = StyleSheet.create({
  wrap: { alignItems: "center", paddingVertical: spacing.xl, paddingHorizontal: spacing.l },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.m,
  },
  title: { fontSize: 17, fontWeight: "600", color: colors.text, textAlign: "center" },
  desc: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 21,
    marginTop: 6,
  },
  action: { marginTop: spacing.l, alignSelf: "stretch" },
});
