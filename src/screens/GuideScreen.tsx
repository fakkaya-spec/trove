import React from "react";
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from "react-native";
import { colors, fonts, spacing } from "../theme";
import { RopeDivider } from "../components/ui";
import { AdBanner } from "../ads";

// Araştırma kaynağı: ASA, RYA, yacht charter check-in prosedürleri ve
// kiralama operatörlerinin hasar/ihtilaf istatistikleri.
const PHOTO_SPOTS: { title: string; why: string }[] = [
  {
    title: "Dıştan takma motor pervanesi (bot + ana motor)",
    why: "İade sırasında en sık suçlanan kalem. Botun motorunun denize düşmesi bareboat sigorta taleplerinin 1 numarasıdır.",
  },
  {
    title: "Gövdenin baş ve kıç omuzlukları",
    why: "İskele yanaşma çizikleri en çok burada oluşur; eski çizikler size fatura edilmesin.",
  },
  {
    title: "Bot (dinghy) tüpleri ve tabanı",
    why: "Kumsala çekilen botların altı çizilir; teslim öncesi durumu belgeleyin.",
  },
  {
    title: "Yakıt göstergesi, su göstergesi ve motor saati",
    why: "'Dolu aldın' tartışmasının tek panzehiri tarihli fotoğraftır.",
  },
  {
    title: "Salma ve dümen (mümkünse)",
    why: "Karaya oturma suçlamalarına karşı. İadede dalgıç kontrolü varsa çıkıştaki dalgıç raporunu isteyin.",
  },
  {
    title: "Yelkenler açık halde",
    why: "Mevcut yırtık, UV hasarı ve dikiş atmaları sizin döneminize yazılmasın.",
  },
  {
    title: "Döşemeler, minderler, şilteler",
    why: "Leke ve yırtıklar standart depozito kesintisidir.",
  },
  {
    title: "Vardevele, pulpit ve bükük demir aksam",
    why: "Küçük bükülmeler genelde önceki kiracıdan kalır; belgeleyin.",
  },
  {
    title: "Ambar kapakları ve lomboz camları",
    why: "Çatlak akrilik cam klasik bir kesinti kalemidir.",
  },
  {
    title: "Tuvaletler (çalışırken)",
    why: "Tıkalı WC standart ücret kesintisidir; teslim aldığınızda çalıştığını kaydedin.",
  },
  {
    title: "Trambolin bağlantıları (katamaran)",
    why: "Pahalıdır ve sık ihtilaf konusudur.",
  },
  {
    title: "Jet ski: karina altı, emiş ızgarası, sele",
    why: "Taş/kaya hasarı ve sele yırtığı en yaygın kesinti sebepleridir.",
  },
];

const RULES: { title: string; body: string }[] = [
  {
    title: "Videoyla tur at",
    body: "Teslim almadan önce teknenin tamamını tek seferde videoya çek; tarih ve saat görünsün. ASA'nın tavsiyesi: teknik brifingi de videoya al — özellikle elektrik panelini.",
  },
  {
    title: "İmzalamadan önce yazdır",
    body: "Kırık, eksik, çizik ne varsa check-in formuna yazılmadan imza atma. İmzadan sonra her şey senin sorumluluğundadır.",
  },
  {
    title: "Envanteri kendin say",
    body: "Listeye 'tamam' deme; usturmaça, vinç kolu, çatal-bıçak dahil tek tek say. Eksik çıkan her kalem depozitodan düşülür.",
  },
  {
    title: "Bagajları sonra yükle",
    body: "Büyük operatörlerin kuralı: envanter kontrolü bitmeden valizleri tekneye alma — dolapların içini görmen gerekir.",
  },
  {
    title: "Son kullanma tarihlerini fotoğrafla",
    body: "Can salı servis etiketi, işaret fişekleri ve yangın söndürücü tarihlerini fotoğrafla. Tarihi geçmiş ekipmanla denize çıkma.",
  },
  {
    title: "Yakıt politikasını yazılı al",
    body: "Standart kural 'dolu al, dolu bırak'tır. Göstergeyi fotoğrafla, en yakın yakıt istasyonunu ve çalışma saatlerini öğren.",
  },
  {
    title: "Depozito sigortası ekstralarına dikkat",
    body: "Depozito sigortaları çoğu zaman bot, dıştan takma motor, karaya oturma ve pervaneyi kapsamaz — yani en riskli kalemleri. Kapsamı mutlaka oku.",
  },
];

export default function GuideScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.lead}>
          Tekne kiralamada ihtilafların çoğu teslim anında belgelenmeyen hasarlardan çıkar.
          Bu rehber, depozitonu korumak için nereyi fotoğraflayacağını ve hangi kurallara
          dikkat edeceğini anlatır.
        </Text>

        <RopeDivider label="📷 MUTLAKA FOTOĞRAFLA" />
        {PHOTO_SPOTS.map((s, idx) => (
          <View key={idx} style={styles.card}>
            <Text style={styles.cardNo}>{String(idx + 1).padStart(2, "0")}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{s.title}</Text>
              <Text style={styles.cardWhy}>{s.why}</Text>
            </View>
          </View>
        ))}

        <RopeDivider label="⚓ ALTIN KURALLAR" />
        {RULES.map((r, idx) => (
          <View key={idx} style={styles.rule}>
            <Text style={styles.ruleTitle}>☞ {r.title}</Text>
            <Text style={styles.ruleBody}>{r.body}</Text>
          </View>
        ))}

        <Text style={styles.footer}>
          Acil durumda: Sahil Güvenlik 158 · VHF Kanal 16
        </Text>
      </ScrollView>
      <AdBanner />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  scroll: { padding: spacing.m, paddingBottom: spacing.xl },
  lead: {
    fontFamily: fonts.body,
    fontStyle: "italic",
    fontSize: 14,
    lineHeight: 21,
    color: colors.ink,
    marginBottom: spacing.s,
  },
  card: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.paperShade,
  },
  cardNo: {
    fontFamily: fonts.mono,
    fontSize: 16,
    color: colors.brassDark,
    fontWeight: "700",
    marginTop: 1,
  },
  cardTitle: { fontFamily: fonts.display, fontSize: 15, fontWeight: "700", color: colors.ink },
  cardWhy: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.inkFaded,
    marginTop: 3,
    lineHeight: 19,
  },
  rule: {
    backgroundColor: "rgba(176, 141, 87, 0.1)",
    borderLeftWidth: 3,
    borderLeftColor: colors.brass,
    borderRadius: 4,
    padding: spacing.m,
    marginBottom: spacing.s,
  },
  ruleTitle: { fontFamily: fonts.display, fontSize: 15, fontWeight: "700", color: colors.ink },
  ruleBody: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.ink,
    marginTop: 4,
    lineHeight: 19,
  },
  footer: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.signal,
    textAlign: "center",
    marginTop: spacing.l,
    letterSpacing: 1,
  },
});
