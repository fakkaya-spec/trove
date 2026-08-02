# TROVE — çalışma kuralları (her oturum önce bunu okur)

## Expo HAS CHANGED
Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

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
- Fazlar doğrudan `main`'e commit edilir (küçük, anlamlı commit'ler); faz bitince `faz-N` etiketi.
- Riskli/deneysel iş: ayrı dal + PR.
- `design-reference/` salt referanstır; tsc/eslint dışındadır; içine uygulama kodu yazılmaz.
