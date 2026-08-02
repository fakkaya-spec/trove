# TROVE — çalışma kuralları (her oturum önce bunu okur)

## Expo HAS CHANGED
Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

## KALICI ÜRÜN İLKELERİ (her implementasyon önce bu soruyu geçer)
> **"Gerçek bir kaptan bunu bugün, gerçek bir seferde kullanır mı?"**
> Yanıt hayırsa, HENÜZ yapma.

- Önce aktif seferde günlük değer üreten işler; kurumsal (enterprise) iş
  akışları ASLA günlük denizciliğin önüne geçmez.
- TROVE bir **Sefer Yoldaşıdır** — sigorta platformu, filo yönetimi veya
  kurumsal pano DEĞİLDİR. Aktif sefer daima ürünün merkezidir.
- **Underway hedefi:** ekran 3 saniyede tek soruyu yanıtlar — "şu an neye
  dikkat etmeliyim?" Tüm etkileşim 10 saniyede biter: Aç → Anla → Kaydet →
  Kapat. His: pano değil, kaptanın yanında oturan güvenilir yoldaş. Bilgi
  hiyerarşisi önce bugünün seferi, sonra sorunlar (Gün X/Y → varış → durum →
  hızlı kayıt → açık gözlemler → ikmal → mürettebat → hava yer tutucusu).
- **MVP disiplini:** sahte veri yok · çevrimiçi bağımlılık yok · çevrimdışı
  çalışamayan özellik yok · hava durumu gelecek genişleme noktası ·
  bulut-önce varsayım yok · gereksiz ayar yok.

### Ürün felsefesi (kalıcı — Faz 6 sonrası reset + misyon güncellemesi)
- **Misyon:** TROVE denizciliği her seferden önce, sefer sırasında ve sonra
  daha kolay, daha sakin ve daha keyifli yapar. Denetim yalnız bir andır;
  TROVE denetim/filo/sigorta/ERP/uyumluluk yazılımı DEĞİLDİR. Denizciliği
  iyileştirmeyen özellik sorgulanır.
- **Çift test:** her özellik hem (a) günlük kullanıcı değeri (bugün teknede
  işe yarar mı? insan bunun için TROVE'u açar mı?) hem (b) şirket değeri
  (tutundurma / ağ etkisi / özmülk veri / yinelenen gelir / savunulabilirlik)
  testinden geçer. Yalnız birinden geçiyorsa OTOMATİK YAPILMAZ — önce
  kullanıcıyla tartışılır.
- **Sadelik kuralları:** 8 SANİYE — marinada, parlak güneşte, tek elle açan
  biri anında "neredeyim / ne önemli / sırada ne var?" sorularını
  yanıtlayabilmeli; gerisi gürültüdür. 30 SANİYE — yeni kullanıcı her
  ekranı 30 saniyede kavrar, kavrayamıyorsa sadeleştir. 10 SANİYE — her
  ekranın birincil işi 10 saniyede biter; "tamamlanmış görünsün" diye iş
  akışı üretilmez. Bir şey ÇIKARabilir miyiz sorusu her zaman sorulur.
- **Defter kuralı:** TROVE güzel bir defteri açmak gibi hissettirir —
  Apple Notes / Things / Linear / Notion; sakin, minimal, kendinden emin.
  ASLA SAP/ERP/filo/sigorta hissi değil. Bir kez fazla ileri gidildi
  (denetim→operasyon→sigorta→filo sürüklenmesi); bir daha OLMAYACAK.
- **Pano sendromu yok:** "47 Sefer · 821 Foto" tarzı istatistik kartları
  yok — insanlar TROVE'u sayı seyretmek için değil bir şey YAPMAK için açar.
- **Bilgi hiyerarşisi:** her ekran önce en önemli soruyu yanıtlar; her şeye
  eşit görsel ağırlık verilmez — TEK şey baskındır, gerisi onu destekler.
- **Underway felsefesi:** pano değil, teknenden gelen SABAH BRİFİNGİ.
  Kullanıcı her şeyi zaten planladı; şimdi güvence ister. Ekran yalnız şunu
  yanıtlar: nereye gidiyoruz · gün kaç · ters giden var mı · kimler gemide ·
  kaydedecek bir şey var mı. Fazlası eklenmez.
- **Küresel ürün:** yalnız Akdeniz değil — Karayipler, ABD/Kanada,
  Avustralya/YZ, İskandinavya, UK, Asya. Yalnız Hırvatistan/Yunanistan'da
  anlamlı varsayım yapılmaz (birimler, tarih biçimleri, sezon varsayımları).
- **12 ay kullanım:** yalnız 1 haftalık charter müşterisi yetmez; tekne
  sahibi, hafta sonu denizcisi, balıkçı, motoryat, aile, profesyonel kaptan
  ve tekneyi kışın da yaşatan kullanıcı düşünülür.
- **Para kazanma (hipotez, KODLANMAZ):** gelir önemli, büyüme daha önemli;
  ilk deneyim güven inşa eder. Metin daima ücretsiz. Premium, TROVE'a
  gerçekten maliyet üreten yetenekleri açar (bulut depolama, AI, gelişmiş
  rapor, büyük kanıt paketleri, işbirliği) — keyfî kısıt asla. Fiyat
  hipotezi (~$14.99 ay / ~$39 çeyrek / ~$55 6 ay (tartışmada) / ~$99 yıl;
  yıllık bariz seçim hissetmeli) UYGULANMAZ, sürekli sorgulanır. Sıralama:
  gelir önemli < büyüme daha önemli < GÜVEN en önemli. Bu bölüm
  MONETIZATION.md'nin kilitli kurallarını değiştirmez; değişiklik ürün
  sahibi onayı ister.
- **Figma politikası:** sürekli piksel doğrulaması YAPILMAZ (kredi pahalı).
  Figma yalnız şunlarda: tamamen yeni ekran · büyük UX kararı doğrulaması ·
  belirsizlik çözümü. Varsayılan kaynak: onaylı tasarım sistemi
  (design-reference + src/theme T tokenları + trove primitives).
- **Her faz öncesi iç sorular:** Jobs bunu tutar mıydı? Linear bunu
  gemiye alır mıydı? Notion sadeleştirir miydi? Airbnb ekranın yarısını
  çıkarır mıydı? Bu, birine TROVE'u tavsiye ettirir mi? Hayırsa: kod
  yazmadan önce dur ve özelliğe itiraz et.

## Durum ve yol haritası
- Mevcut durum + sonraki faz: `docs/HANDOFF.md` (ÖNCE BUNU OKU)
- Faz planı: `docs/TROVE-ROADMAP.md` · Para kazanma (KİLİTLİ): `docs/MONETIZATION.md`
- Onaylı tasarım kaynağı: `design-reference/` (tam ekranlar: `design-reference/src/app/App.full.tsx`)

## Kilitli kurallar (ihlal = işi geçersiz kılar)
1. Marka ASLA yeniden tasarlanmaz: C0 sembol + DM Sans wordmark (`src/components/brand/`).
2. Navigasyon: Trip · Log · Vessel (3 sekme). Settings = Trip başlığındaki dişli. Rapor/denetim sekme OLMAZ.
3. Yayımlanmış migration değiştirilmez — yalnız yeni ID eklenir (`src/db/migrations.ts`).
4. Örnek veri izolasyonu bozulamaz: `is_sample` + repository filtreleri (`tests/samples.test.ts` kanıtlar).
5. Foto kanıt = Premium (kilitli erişim/UX kuralları MONETIZATION.md'de). Metin kaydı ASLA engellenmez.
6. IBM Plex Mono YALNIZ makine-ölçümü verilerde (saat, GPS, sayaç, belge no).
7. Yeni TROVE ekranları yalnız `T`/`TSH`/`TICON` tokenlarını (src/theme.ts) ve `src/components/trove/` primitive'lerini kullanır; ikonlar `LIcon` (lucide). Eski ekranlar `colors` + `Icon` (Ionicons) ile kalır, faz geldikçe taşınır.
8. `src/ads.tsx` try/catch ve `ads = null` olduğu gibi kalır; AdMob yeniden etkinleştirilmez.
9. Yeni bağımlılık eklemeden önce gerekçe sun (onaylılar: expo-print P6, expo-image-manipulator P7).
10. Her faz sonunda: `npm run typecheck && npm run lint && npm test` (7 paket) + `npx expo-doctor` yeşil olmadan commit yok.

## Çalışma düzeni
- Fazlar doğrudan `main`'e commit edilir (küçük, anlamlı commit'ler); faz sınırı commit mesajında "Faz N" ile işaretlenir (git tag push'u oturum proxy'sinde desteklenmiyor — etiket gerekiyorsa Mac'ten atılır).
- Riskli/deneysel iş: ayrı dal + PR.
- `design-reference/` salt referanstır; tsc/eslint dışındadır; içine uygulama kodu yazılmaz.
