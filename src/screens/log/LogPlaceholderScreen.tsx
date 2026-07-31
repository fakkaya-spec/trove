import React from "react";
import { View, Text, StyleSheet, SafeAreaView } from "react-native";
import { colors, fonts, spacing } from "../../theme";
import { Icon } from "../../components/Icon";
import { useLocale } from "../../i18n";
import { TRIP_STRINGS } from "../../i18n/trip";

// Log sekmesi — Faz 5'te gelecek seyir defterinin yer tutucusu.
// ÜRETİM KALİTESİNDE boş durum: sahte veri yok, ölü uç yok; ne olduğunu ve
// ne zaman geleceğini açıkça söyler. Veritabanı/kayıt akışı burada YOKTUR.
export default function LogPlaceholderScreen() {
  const { locale } = useLocale();
  const s = TRIP_STRINGS[locale];

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.center}>
        <View style={styles.iconWrap}>
          <Icon name="create-outline" size={32} color={colors.textSecondary} />
        </View>
        <Text style={styles.title}>{s.logbookTitle}</Text>
        <Text style={styles.body}>{s.logbookComingBody}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },
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
  title: { fontFamily: fonts.body, fontSize: 20, fontWeight: "600", color: colors.text },
  body: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 21,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing.s,
    maxWidth: 300,
  },
});
