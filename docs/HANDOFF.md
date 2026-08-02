# TROVE — Devir-Teslim / Güncel Durum

_Son güncelleme: 2026-08-02 · Taşıma: koskoraporweb → trove (geçmiş korunarak)_

## Tamamlanan fazlar
- **Faz 1** — TROVE marka geçişi: C0 `TroveMark`, DM Sans wordmark varlığı, app.json
  (name TROVE, slug trove, com.kosko.trove), uygulama ikonu/splash.
- **Faz 2** — KİLİTLİ navigasyon: Trip · Log · Vessel; Settings=dişli; eski ekranlar
  stack rotası olarak korunuyor; `tests/navigation.test.ts` sözleşmeyi kilitler.
- **Faz 3** — Tasarım katmanı (`T` tokenları, IBM Plex Mono, lucide `LIcon`,
  `src/components/trove/` primitives) · Migration 4 (`is_sample`) · Serenity/Aurora/
  Nomad örnekleri (`src/db/seed/samples.ts`) · izolasyon testleri · Karşılama ekranı
  (`src/screens/WelcomeScreen.tsx`, gerçek tekne yokken Trip sekmesi içeriği) ·
  örnek bandı (`SampleBanner`).

## Sıradaki: FAZ 4 — Trip Prepare deneyimi
Onaylı tasarımdan (design-reference/src/app/App.full.tsx) birebir RN'e:
1. `trip_plan` — foto hero + hazırlık listesi + "Begin trip" CTA (TripHome/TripDetail
   mantığının üstüne; mevcut domain/tripProgress + nextAction yeniden kullanılır)
2. `trip_crew` — trips.crewNamesJson + skipperName üzerine ekran
3. `trip_provisions` + `trip_shopping` — mevcut provisioning motoru/planı üstüne
   yeni görünüm (akordeon, mono miktarlar, renkli kategori başlıkları)
4. `trip_predep` + `trip_checkin` — mevcut denetim motoru üstüne yeni görünüm
   (KeelLine tamamlanma işaretleri, madde başına bayrak+kamera düğmeleri)
5. **Entitlement servisi + paywall** (`src/entitlement/`): kapasite bayrakları
   (canCapturePhoto…), bağlam takibi (inspection_photo…), Option A = mevcut
   react-native-iap PremiumProvider taşıyıcı. MONETIZATION.md kuralları KİLİTLİ.
Ardından: P5 Underway+Log (log_entries migration'ı) · P6 Complete+expo-print PDF ·
P7 foto hattı (expo-image-manipulator) · P8 testler+cihaz doğrulama.

## Bilinmesi gerekenler
- Eski repo `fakkaya-spec/koskoraporweb` ARŞİV; oraya push yok. PR #3 kapatılacak.
- `npm test` = 7 paket; beklenen çıktılar birebir korunmalı (repos/trip-flow satırları).
- Örnek fotoğraflar `assets/samples/` (yerel, çevrimdışı); Unsplash URL'leri yalnız
  design-reference içinde kalır.
- react-native-iap RN 0.86 native derlemesi HENÜZ doğrulanmadı — entitlement fazında
  ilk iş compile testi.
- Cihaz test protokolü: `docs/store/DEVICE-TEST.md` (adlar TROVE'a güncellenmiş durumda).
