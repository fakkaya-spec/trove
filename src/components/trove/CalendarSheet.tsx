import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, Modal } from "react-native";
import { T, TSH, TICON, touch } from "../../theme";
import { LIcon } from "../LIcon";
import type { Locale } from "../../i18n/strings";

// Takvim seçici — cihaz testi bulgusu F2: tarih elle yazılmaz, takvimden
// seçilir. BİLİNÇLİ bağımlılıksız: saf JS ay ızgarası, çevrimdışı, tema
// T token'ları. Tek tarih seçer; aralık mantığı (gece hesabı) çağırandadır.
// Hafta Pazartesi başlar (denizci takvimi alışkanlığı; yerelden bağımsız
// sabit — karmaşık yerel hafta kuralları bilinçli dışarıda).

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

function toISO(y: number, m: number, d: number): string {
  return `${y}-${pad(m + 1)}-${pad(d)}`;
}

function monthLabel(y: number, m: number, locale: Locale): string {
  try {
    return new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(
      new Date(Date.UTC(y, m, 1))
    );
  } catch {
    const en = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    return `${en[m]} ${y}`;
  }
}

function weekdayInitials(locale: Locale): string[] {
  try {
    const fmt = new Intl.DateTimeFormat(locale, { weekday: "narrow", timeZone: "UTC" });
    // 2024-01-01 Pazartesi — hafta Pazartesi başlar
    return Array.from({ length: 7 }, (_, i) =>
      fmt.format(new Date(Date.UTC(2024, 0, 1 + i)))
    );
  } catch {
    return ["M", "T", "W", "T", "F", "S", "S"];
  }
}

interface CalendarProps {
  visible: boolean;
  title: string;
  /** Mevcut seçim (YYYY-MM-DD) — takvim bu aya açılır. */
  selectedISO: string | null;
  /** Seçim yokken açılacak ay (çağıran, dokunma anında bugünü verir). */
  initialISO: string;
  /** Bu tarihten öncesi seçilemez (ör. dönüş ≥ kalkış). */
  minISO?: string | null;
  locale: Locale;
  clearLabel: string;
  onSelect: (iso: string) => void;
  onClear: () => void;
  onClose: () => void;
}

export function CalendarSheet(props: CalendarProps) {
  // Gövde yalnız görünürken mount edilir → ay imleci mount'ta bir kez,
  // saf prop'lardan kurulur (effect'te setState yok; render'da Date yok).
  if (!props.visible) return null;
  return <CalendarBody {...props} />;
}

function CalendarBody({
  title,
  selectedISO,
  initialISO,
  minISO,
  locale,
  clearLabel,
  onSelect,
  onClear,
  onClose,
}: CalendarProps) {
  const openISO =
    selectedISO && /^\d{4}-\d{2}-\d{2}$/.test(selectedISO) ? selectedISO : initialISO;
  const [cursor, setCursor] = useState<{ y: number; m: number }>(() => ({
    y: Number(openISO.slice(0, 4)),
    m: Number(openISO.slice(5, 7)) - 1,
  }));

  const { y, m } = cursor;
  const first = new Date(Date.UTC(y, m, 1));
  const daysInMonth = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  // Pazartesi=0 ... Pazar=6
  const leadEmpty = (first.getUTCDay() + 6) % 7;
  const minMs = minISO && /^\d{4}-\d{2}-\d{2}$/.test(minISO)
    ? Date.parse(`${minISO}T00:00:00Z`)
    : null;

  const cells: (number | null)[] = [
    ...Array.from({ length: leadEmpty }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const prevMonth = () => setCursor(m === 0 ? { y: y - 1, m: 11 } : { y, m: m - 1 });
  const nextMonth = () => setCursor(m === 11 ? { y: y + 1, m: 0 } : { y, m: m + 1 });

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={styles.backdrop} accessibilityLabel={title} onPress={onClose} />
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.monthRow}>
            <Pressable
              onPress={prevMonth}
              accessibilityRole="button"
              accessibilityLabel="‹"
              style={({ pressed }) => [styles.navBtn, pressed && { opacity: 0.7 }]}
            >
              <LIcon name="arrow-left" size={TICON.md} color={T.ink1} />
            </Pressable>
            <Text style={styles.monthLabel}>{monthLabel(y, m, locale)}</Text>
            <Pressable
              onPress={nextMonth}
              accessibilityRole="button"
              accessibilityLabel="›"
              style={({ pressed }) => [styles.navBtn, pressed && { opacity: 0.7 }]}
            >
              <LIcon name="arrow-right" size={TICON.md} color={T.ink1} />
            </Pressable>
          </View>

          <View style={styles.weekRow}>
            {weekdayInitials(locale).map((w, i) => (
              <Text key={`${w}-${i}`} style={styles.weekday}>
                {w}
              </Text>
            ))}
          </View>

          <View style={styles.grid}>
            {cells.map((d, i) => {
              if (d === null) return <View key={i} style={styles.cell} />;
              const iso = toISO(y, m, d);
              const ms = Date.parse(`${iso}T00:00:00Z`);
              const disabled = minMs !== null && ms < minMs;
              const selected = selectedISO === iso;
              return (
                <Pressable
                  key={i}
                  onPress={() => {
                    if (!disabled) onSelect(iso);
                  }}
                  disabled={disabled}
                  accessibilityRole="button"
                  accessibilityLabel={iso}
                  accessibilityState={{ selected, disabled }}
                  style={({ pressed }) => [
                    styles.cell,
                    selected && styles.cellSelected,
                    pressed && !disabled && { opacity: 0.7 },
                  ]}
                >
                  <Text
                    style={[
                      styles.cellText,
                      disabled && { color: T.ink3 },
                      selected && styles.cellTextSelected,
                    ]}
                  >
                    {d}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.footerRow}>
            {selectedISO ? (
              <Pressable
                onPress={onClear}
                accessibilityRole="button"
                accessibilityLabel={clearLabel}
                style={({ pressed }) => [styles.footerBtn, pressed && { opacity: 0.7 }]}
              >
                <Text style={styles.footerText}>{clearLabel}</Text>
              </Pressable>
            ) : (
              <View />
            )}
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="✕"
              style={({ pressed }) => [styles.footerBtn, pressed && { opacity: 0.7 }]}
            >
              <LIcon name="x" size={TICON.md} color={T.ink2} />
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: "center", padding: 24 },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.40)",
  },
  card: {
    backgroundColor: T.surface,
    borderRadius: T.r,
    padding: 16,
    ...TSH.sh2,
  },
  title: {
    fontSize: 11,
    fontWeight: "600",
    color: T.ink2,
    letterSpacing: 0.4,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  monthRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  navBtn: {
    width: touch.min,
    height: touch.min,
    alignItems: "center",
    justifyContent: "center",
  },
  monthLabel: { fontSize: 15, fontWeight: "700", color: T.ink0, letterSpacing: -0.2 },
  weekRow: { flexDirection: "row", marginBottom: 4 },
  weekday: {
    flex: 1,
    textAlign: "center",
    fontSize: 10,
    fontWeight: "600",
    color: T.ink3,
  },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  cell: {
    width: `${100 / 7}%`,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: T.r3,
  },
  cellSelected: { backgroundColor: T.blue },
  cellText: { fontFamily: T.mono, fontSize: 14, color: T.ink0 },
  cellTextSelected: { color: "#FFFFFF", fontWeight: "700" },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
  },
  footerBtn: {
    minHeight: touch.min,
    minWidth: touch.min,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  footerText: { fontSize: 13, fontWeight: "500", color: T.ink2 },
});
