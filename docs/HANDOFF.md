# TROVE — Devir-Teslim / Güncel Durum

_Son güncelleme: 2026-08-02 (Faz 6 — Underway) · Dal: claude/trove-integration_

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

- **Faz 5 (Log dikey dilimi)** — Seyir defteri uçtan uca:
  - Migration 5: `log_entries` + `media_assets` yeniden kurulumu
    (inspection_id nullable, log_entry_id); migration runner artık standart
    SQLite prosedürüyle FK'yı yeniden kurulum sırasında kapatır (cihazda
    handover_pairs bağımlı satırları varken DROP patlamasın diye — testli).
  - `src/domain/log.ts` + `src/repositories/log.ts` (izolasyon repository
    katmanında; örnek kayda gerçek-yol mutasyonu SampleReadOnlyError;
    örnekler sync kuyruğuna asla girmez) · seed v2: Serenity'ye 5 örnek kayıt.
  - LogTab → LogScreen (repository-destekli, senkron dili 'bu cihazda
    kayıtlı/senkron bekliyor'), AddLog modal (taslak koruması, foto
    `log_photo` kapısıyla `useEntitlement.requestAccess` üstünden;
    çekim mevcut medya hattıyla addLogMedia'ya bağlanır).
  - `tests/log.test.ts` (9. paket): 4→5 migration + yeniden başlatma
    kalıcılığı + izolasyon + kapı sözleşmesi + i18n bütünlüğü.

- **Faz 6 (Underway)** — Trip sekmesi tam faz-farkındalı:
  planning→PrepareHub · active→**UnderwayScreen** · completed→TripCompleteState.
  - Migration 6: `log_entries.resolved_at` (açık gözlem izleme listesi;
    çöz/yeniden aç, örnek korumalı, sync kuyruklu).
  - UnderwayScreen: Gün X/Y (domain/tripDayOf, yerel takvim, kıskaçlı,
    "dönüş günü geçti" sakin notu) → varış → hızlı kayıt → açık gözlemler
    (✓ çözüldü) → alışveriş ilerlemesi (plan varsa) → mürettebat → seferi
    bitir. Hava durumu BİLİNÇLİ yok (sahte veri yasak; hero genişleme noktası).
  - Bitirme: kendi tekne → `TripReturn` (TripChecklistScreen yeniden
    kullanımı, return_secure) → status completed; charter → Faz 7'ye dek
    TripDetail'deki check-out/handover akışı.
  - Hub "Begin trip" artık gerçek geçiş (uyarı kalktı).
  - AGENTS.md'ye KALICI ÜRÜN İLKELERİ eklendi (kaptan-bugün süzgeci,
    3 sn/10 sn Underway hedefi, MVP disiplini).

## Sıradaki: FAZ 7 — Complete/handover/rapor (TROVE görünümü + expo-print PDF)
Ardından: foto hattı (sıkıştırma/thumbnail) · çeviri borcu · cihaz doğrulama.

## Bilinmesi gerekenler
- Eski repo `fakkaya-spec/koskoraporweb` ARŞİV; oraya push yok. PR #3 kapatılacak.
- `npm test` = 10 paket (entitlement + log + underway eklendi); beklenen
  çıktılar birebir korunmalı (repos/trip-flow satırları).
- Faz 4-6 ekran metinleri (`src/i18n/prepare.ts`, `entitlement.ts`, `log.ts`,
  `underway.ts`)
  şimdilik en+tr; diğer 7 dil İngilizce'ye düşer — çeviri borcu P8 öncesi
  kapanmalı.
- Foto sıkıştırma/thumbnail YOK (Faz 10 borcu); log foto akışı mevcut hattı
  (EXIF kapalı, göreli anahtar) kullanır. Native cihaz doğrulaması (kamera,
  yeniden başlatma, IAP derlemesi) hâlâ bekliyor.
- `origin/main`'de diğer ajanın commit'leri var (e432242 alındı; 868131b
  ALINMADI — Faz 4 ekranlarının mükerrer kopyaları, birleştirilmeyecek).
- Örnek seferler karşılamadan hâlâ TripDetail'e açılır (eski görünüm);
  hub'a taşınmaları sonraki fazların işi. Hub yalnız gerçek seferlerde.
- Örnek fotoğraflar `assets/samples/` (yerel, çevrimdışı); Unsplash URL'leri yalnız
  design-reference içinde kalır.
- react-native-iap RN 0.86 native derlemesi HENÜZ doğrulanmadı — entitlement fazında
  ilk iş compile testi.
- Cihaz test protokolü: `docs/store/DEVICE-TEST.md` (adlar TROVE'a güncellenmiş durumda).
