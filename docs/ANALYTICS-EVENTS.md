# TROVE — Analitik Olay Sözleşmesi ve Kurucu Kilometre Taşı Mimarisi

_Durum: YALNIZ DOKÜMANTASYON (2026-08-02). Kod yok, sağlayıcı yok, SDK yok.
Kurucu Kilometre Taşı Sistemi bir **sürüm-planlama bağımlılığıdır**, mevcut
bir mobil özellik değildir. Uygulama içinde sahte/yerel bir küresel sayaç
ASLA uygulanmaz._

## 1. Mevcut durum denetimi (2026-08-02, kod taramasıyla doğrulandı)

| Soru | Cevap |
|---|---|
| Analitik/merkezî olay taşıma var mı? | **YOK.** Hiçbir analitik SDK'sı yok; `sync_queue` yereldir ve tüketicisi yoktur; AdMob bayrak arkasında ölü. |
| Hesap veya kararlı anonim kurulum kimliği var mı? | **YOK.** Kimlik doğrulama yok; `users` tablosu şemada var ama kullanılmıyor; kurulum UUID'si üretilmiyor. |
| Olaylar cihazlar arası toplanabilir mi? | **HAYIR.** Ağ taşıma katmanı hiç yok. |
| Onay/gizlilik beyanı/silme mekanizması var mı? | **YOK.** Onay UI'ı yok; beta duruşu "veri toplanmıyor" (BETA-READINESS); uzak silme kavramı yok. |
| Örnek/dev/test etkinliği güvenilir dışlanabilir mi? | **EVET.** `is_sample` + `smp-` önekleri repository katmanında (testli); `__DEV__` derleme bayrağı mevcut; testler izole DB kullanır. |

**Sonuç:** Küresel "aktif kullanıcı" sayımı bugün DÜRÜSTÇE mümkün değildir.
Her kurulum yalnız kendini bilir. Mevcut tek gerçek kaynak mağaza konsollarıdır
(TestFlight/Play Console kurulum sayıları — "aktivasyon" değil).

## 2. Aktivasyon tanımı (öneri — kilitlenecek tek kural)

> **Aktif kullanıcı:** Bir kurulumda (a) en az bir GERÇEK tekne veya GERÇEK
> sefer oluşturulmuş VE (b) en az bir anlamlı iş akışı tamamlanmış olmalıdır:
> ikmal planı üretimi · kontrol listesi tamamlama (yola çıkış/check-in/
> check-out/dönüş) · seyir kaydı oluşturma · rapor üretimi.
> `activation` olayı kurulum başına BİR KEZ ateşlenir.

Dışlamalar (zorunlu): örnek mod ve seed verisi (`is_sample`/`smp-`) ·
geliştirme derlemeleri (`__DEV__`) · otomatik testler · yinelenen gönderimler
(olay, kurulum kimliği + olay adıyla sunucu tarafında idempotent).

Gerekçe: kurulum ≠ aktivasyon; onboarding ≠ aktivasyon. Kural, "gerçek
denizcilik davranışı" eşiğini ölçer ve ilk-100 kilometre taşına uygundur.

## 3. Sağlayıcı-bağımsız olay sözleşmesi

**Tüm olaylar için ortak zorunlu özellikler:** `event_name` · `install_id`
(anonim UUID; ilk ONAYLI açılışta üretilir) · `app_version` · `platform`
(ios/android) · `occurred_at` (UTC ISO) · `build_type` (dev/beta/prod).

**Tüm olaylar için YASAK içerik:** isimler (kişi/tekne/kaptan) · serbest
metin (not, açıklama, başlık) · fotoğraf içeriği veya dosya yolları · konum/
GPS · sağlık/diyet/alerji bilgisi · tescil no/HIN · e-posta/telefon · rapor
içeriği. Analitik yalnız SAYAR; içerik taşımaz.

**Onay:** TÜM olaylar açık kullanıcı onayı (opt-in) gerektirir; onay yoksa
hiçbir olay üretilmez (kuyruklanmaz da). Onay geri çekilirse üretim durur ve
`install_id` sunucudan silinebilir olmalıdır (GDPR silme hakkı).

| Olay | Ne zaman ateşlenir | Ek özellik | Kişisel veri | Aktivasyona katkı |
|---|---|---|---|---|
| `app_first_open` | Onay sonrası ilk açılış (kurulum başına 1) | — | Hayır | Ön koşul (sayılmaz) |
| `real_vessel_created` | İlk GERÇEK tekne kaydı (örnek hariç) | — | Hayır | Koşul (a) |
| `real_trip_created` | GERÇEK sefer oluşturma | `trip_type` (enum) | Hayır | Koşul (a) |
| `provisioning_generated` | Gerçek sefer için plan üretimi | `days`,`people` (sayı) | Hayır | Koşul (b) |
| `shopping_list_used` | İlk kalem işaretleme | — | Hayır | Koşul (b) |
| `predeparture_completed` | Yola çıkış listesi tamamlama | `depth` (essential/full) | Hayır | Koşul (b) |
| `checkin_completed` | Check-in denetimi tamamlama | `depth` | Hayır | Koşul (b) |
| `checkout_completed` | Check-out/dönüş tamamlama | `depth` | Hayır | Koşul (b) |
| `trip_completed` | Sefer `completed` durumuna geçiş | `open_items` (sayı) | Hayır | Koşul (b) |
| `log_entry_created` | Gerçek seyir kaydı (tür sayılır, İÇERİK ASLA) | `entry_type` (enum) | Hayır | Koşul (b) |
| `photo_evidence_created` | Foto kanıt kaydı (SAYI; içerik/yol asla) | `context` (enum) | Hayır | Hayır (yoğunluk sinyali) |
| `report_generated` | PDF üretimi | `has_photos` (bool) | Hayır | Koşul (b) |
| `report_shared` | Paylaşım sayfası AÇILDI (sonuç bilinmez, iddia edilmez) | — | Hayır | Hayır (viral sinyal) |
| `app_returned_after_7_days` | İlk açılıştan ≥7 gün sonra ilk dönüş (1 kez) | — | Hayır | Hayır (tutundurma) |
| `app_returned_after_30_days` | ≥30 gün sonra ilk dönüş (1 kez) | — | Hayır | Hayır (tutundurma) |
| `activation` | Bölüm 2 kuralı ilk kez sağlandığında (1 kez) | `via` (hangi b-koşulu) | Hayır | **Sayılan olay** |

Örnek/dev/test dışlaması her olay için aynıdır (bölüm 2 dışlamaları) ve
İSTEMCİDE uygulanır — kirli olay hiç üretilmez.

## 4. Gelecek kilometre taşı mimarisi (hedef sistem)

```
Mobil uygulama (onaylı, anonim, içeriksiz olaylar)
  → merkezî olay deposu (gizlilik-güvenli sağlayıcı; SEÇİLMEDİ)
  → yalnız-kurucu pano / uyarı servisi (tüketici uygulamasının DIŞINDA)
  → kilometre taşı değerlendirmesi (eşikler: 10 · 25 · 50 · 100 · 250 · 500 · 1000)
  → kurucu bildirimi (pano kartı / e-posta / özel kanal)
```

100 eşiğinde bildirim metni:

> "TROVE has reached 100 activated users.
> Monetization review is now due.
> No paywall has been enabled automatically."

Kurallar: hiçbir eşik ürün davranışını OTOMATİK değiştirmez (Premium açılmaz) ·
uyarı, kurucu incelemeyi ONAYLAYANA dek çözülmemiş kalır · uyarı tüketici
uygulamasında DEĞİL, kurucu panosu/e-posta/özel bildirim kanalında yaşar ·
ilk 100 gerçek aktif kullanıcı para kazanmayla kesintiye uğratılmaz ·
Free→Premium eşikleri ancak gerçek kullanım verisi incelendikten sonra seçilir.
