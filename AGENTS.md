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
