# TROVE — Devir-Teslim / Güncel Durum

_Son güncelleme: 2026-08-02 (Faz 4) · Taşıma: koskoraporweb → trove (geçmiş korunarak)_

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

- **Faz 4** — Trip Prepare deneyimi:
  - `src/entitlement/` — merkezî entitlement servisi (kapasite bayrakları,
    14 gün çevrimdışı grace, bağlam takibi) + `PaywallScreen` (kilitli fayda
    metni). SKU'lar `trove_premium_monthly/yearly`. InspectScreen +
    HandoverReview kamera noktaları kapıdan geçer.
  - `trip_plan` hub'ı (`src/screens/trip/prepare/TripPrepareHub.tsx`) — gerçek
    sefer planning/active iken Trip sekmesi içeriği; "Ready to depart X/N" +
    Begin trip CTA (status → active; seyir ekranı Faz 5).
  - `trip_crew` (updateTripCrew) · `trip_provisions` + `trip_shopping` (mevcut
    ikmal motoru üstüne akordeon/check-off görünümleri) · `trip_predep` +
    `trip_checkin` (tek `TripChecklistScreen`; bayrak+kamera düğmeleri, kritik
    maddeler tamamlamayı bloklar; örnek seferlerde denetim OLUŞTURULMAZ).

## Sıradaki: FAZ 5 — Underway + Log
- `log_entries` migration'ı (yalnız YENİ migration ID; eskiler değişmez),
  `trip_underway` ekranı, `log` + `log_add` (metin her zaman ücretsiz;
  foto `log_photo` bağlamıyla kapılı).
Ardından: P6 Complete+expo-print PDF · P7 foto hattı (expo-image-manipulator) ·
P8 testler+cihaz doğrulama.

## Bilinmesi gerekenler
- Eski repo `fakkaya-spec/koskoraporweb` ARŞİV; oraya push yok. PR #3 kapatılacak.
- `npm test` = 8 paket (entitlement.test.ts eklendi); beklenen çıktılar birebir
  korunmalı (repos/trip-flow satırları).
- Faz 4 ekran metinleri (`src/i18n/prepare.ts`, `entitlement.ts`) şimdilik
  en+tr; diğer 7 dil İngilizce'ye düşer — çeviri borcu P8 öncesi kapanmalı.
- Örnek seferler karşılamadan hâlâ TripDetail'e açılır (eski görünüm);
  hub'a taşınmaları sonraki fazların işi. Hub yalnız gerçek seferlerde.
- Örnek fotoğraflar `assets/samples/` (yerel, çevrimdışı); Unsplash URL'leri yalnız
  design-reference içinde kalır.
- react-native-iap RN 0.86 native derlemesi HENÜZ doğrulanmadı — entitlement fazında
  ilk iş compile testi.
- Cihaz test protokolü: `docs/store/DEVICE-TEST.md` (adlar TROVE'a güncellenmiş durumda).
