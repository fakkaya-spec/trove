# TROVE — Devir-Teslim / Güncel Durum

_Son güncelleme: 2026-08-02 (Faz 7 — Complete/Rapor) · Dal: claude/trove-integration_

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

- **Faz 7 (Complete/Rapor)** — "güvenilir kayıtla ayrıl" vaadi:
  - Migration 7: `trip_signoffs` (yazılı onay — hukuki iddia dili YOK).
  - `TripComplete` rehberli kapanış: dönüş listesi/check-out (zorunlu) →
    karşılaştırma (charter) → açık maddeler (çözmeye zorlama yok) → onay
    (isteğe bağlı) → rapor + kapanış. Sefer YALNIZ burada `completed` olur.
  - **Temel Kontrol** sunum katmanı (domain/essentialItemIds — kritikler +
    sıraya tamamlama, 12/22; gizli madde asla tamam sayılmaz; kritik
    atlanamaz). Şablon verisi değişmedi.
  - Açık madde okuma modeli: denetim sorunları + log gözlemleri TEK kavram
    (repositories/completion); veri modelleri birleştirilmedi.
  - Rapor motoru: saf model+HTML (domain/report) → yerel PDF (expo-print)
    → native paylaşım (expo-sharing; kural 9 gerekçesi commit 68cb01f'te).
    Çevrimdışı, ağsız, sistem fontlu; foto data-URI (≤6); reports tablosu
    migration'sız yeniden kullanıldı; iptal ≠ hata; üretim hatası veri
    kaybetmez (testli).
  - `tests/complete.test.ts` (11. paket, 23 kapsam maddesi).
  - **Cihaz doğrulaması BEKLEMEDE** — docs/store/DEVICE-TEST.md "FAZ 7 EKİ"
    (R1-R17) koşulmadan faz "tam doğrulandı" sayılmaz.

## İlk-kullanım tasarım borcu (Faz 7 denetimi — Faz 8 önerisi)
Yeni kullanıcının ilk 5 dakikası hâlâ eski görsel dilde: Karşılama →
"İlk tekneni ekle" → **BoatsScreen (eski)** · TripWizard (eski) · hub/hero →
**TripDetailScreen (eski)** · Complete akışında karşılaştırma adımı →
**HandoverReviewScreen (eski)**. Faz 7'de yalnız belgelendi (kapsam şişirilmedi).
**FAZ 8 ÖNERİSİ:** "İlk beş dakika" dikeyi — Karşılama→tekne ekleme→
TripWizard→TripDetail'in TROVE görünümüne taşınması + HandoverReview
tazelenmesi; ardından cihaz doğrulama turu (R1-R17 + eski D listesi).

## Bilinmesi gerekenler
- Eski repo `fakkaya-spec/koskoraporweb` ARŞİV; oraya push yok. PR #3 kapatılacak.
- `npm test` = 11 paket (entitlement + log + underway + complete eklendi);
  beklenen çıktılar birebir korunmalı (repos/trip-flow satırları).
- Faz 4-7 ekran metinleri (`src/i18n/prepare.ts`, `entitlement.ts`, `log.ts`,
  `underway.ts`, `complete.ts`)
  şimdilik en+tr; diğer 7 dil İngilizce'ye düşer — çeviri borcu P8 öncesi
  kapanmalı.
- Foto sıkıştırma/thumbnail YOK (Faz 10 borcu); log foto akışı mevcut hattı
  (EXIF kapalı, göreli anahtar) kullanır. Native cihaz doğrulaması (kamera,
  yeniden başlatma, IAP derlemesi) hâlâ bekliyor.
- `origin/main`'de diğer ajanın commit'leri var (e432242 alındı; 868131b
  ALINMADI — Faz 4 ekranlarının mükerrer kopyaları, birleştirilmeyecek).
- Kurucu Kilometre Taşı Sistemi: uygulama-içi sürüm GERİ ALINDI (kurucu
  kararı — tüketici uygulamasına ait değil; sahte yerel sayaç yasak).
  Sözleşme + aktivasyon tanımı + gelecek mimari: docs/ANALYTICS-EVENTS.md;
  beta öncesi analitik seçimi ROADMAP'te sürüm engeli olarak kayıtlı.
- Örnek seferler karşılamadan hâlâ TripDetail'e açılır (eski görünüm);
  hub'a taşınmaları sonraki fazların işi. Hub yalnız gerçek seferlerde.
- Örnek fotoğraflar `assets/samples/` (yerel, çevrimdışı); Unsplash URL'leri yalnız
  design-reference içinde kalır.
- react-native-iap RN 0.86 native derlemesi HENÜZ doğrulanmadı — entitlement fazında
  ilk iş compile testi.
- Cihaz test protokolü: `docs/store/DEVICE-TEST.md` (adlar TROVE'a güncellenmiş durumda).
