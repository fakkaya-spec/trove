# TROVE — Gerçek Cihaz Doğrulama Listesi

_Teknik olmayan ürün sahibi için yazılmıştır. Her testte: ön koşul → adımlar → beklenen sonuç → SONUÇ kutusu → kanıt._
_Kanıt = ekran görüntüsü veya kısa ekran videosu; dosya adını grup+numara ile kaydet (ör. `B3.png`)._
_Bir test BAŞARISIZ olursa: durma, notu yaz, kanıtı al, sonraki teste geç. Önem: **P0** = veri kaybı/çökme (beta durdurur) · **P1** = ciddi ama beta durdurmyaz · **P2** = kozmetik._

Kurulum: `eas build --profile preview --platform android` (APK'yı telefona kur) veya iOS için `--platform ios` + TestFlight internal.

---

## GRUP A — Temiz Kurulum

**A1. İlk açılış** · Ön koşul: uygulama bu cihaza HİÇ kurulmamış.
Adım: Kur → aç. Beklenen: 3 sn içinde TROVE ana ekranı; hata yok; "Start a Trip / Inspect a Charter Boat / Prepare My Boat" kartları görünür. SONUÇ: ☐ Geçti ☐ Kaldı (P0) · Kanıt: A1

**A2. Şablonlar bir kez seed'lendi** · Adım: Library sekmesi. Beklenen: tam **5 şablon** (Check-in, 2× Pre-departure, Return, Check-out) — ne eksik ne çift. SONUÇ: ☐ ☐ (P0) · Kanıt: A2

**A3. Öldür-aç, çift seed yok** · Adım: Uygulamayı görev yöneticisinden tamamen kapat → aç → Library. Beklenen: hâlâ 5 şablon. SONUÇ: ☐ ☐ (P0)

**A4. Geliştirici kalıntısı yok** · Adım: Tüm sekmeleri gez. Beklenen: "DEV:" yazan hiçbir düğme, debug menüsü, reklam veya "Premium" girişi YOK (beta yapılandırması). SONUÇ: ☐ ☐ (P1) · Kanıt: A4

## GRUP B — Tekne Sahibi Akışı (uçtan uca)

**B1.** Home → "Prepare My Boat" → tekne adı gir (ör. "S/Y Test"), tip seç → sefer bilgileri (hafta sonu, 2 gece, 2 yetişkin 1 çocuk) → kullanım profili (sıcak iklim seç!) → "Create trip & plan". Beklenen: TripDetail açılır; modül kartları görünür. SONUÇ: ☐ ☐ (P0) · Kanıt: B1

**B2. İkmal** · TripDetail → Provisioning. Beklenen: kategorili liste geldi; **su miktarı sıcak iklim nedeniyle artmış**; üstte alerji/tahmin notu. Bir kalemde ⓘ'ye bas → hesap açıklaması anlaşılır mı? Bir miktarı değiştir, "gemide" değeri gir → "alınacak" düşer. Özel kalem ekle, sonra sil (onay sorar). 3-4 kalemi 🛒 işaretle. SONUÇ: ☐ ☐ (P0) · Kanıt: B2a-c

**B3. Yola çıkış kontrolü** · TripDetail → Pre-departure. Bir bölümü "No problems found in this section" ile onayla → **kritik maddelerin (kırmızı ● etiketli) işaretlenmeden kaldığını** doğrula. Bir maddeyi "Not working" yap → açılan pencerede not yaz + **fotoğraf çek** + önem seç → kaydet. Kritik bir maddeyi "Not working" yapınca güvenlik tavsiyesi çıkmalı ("inform the charter company" dili — suçlama değil). SONUÇ: ☐ ☐ (P0) · Kanıt: B3a-b

**B4. Sayaçlar** · Meters sekmesi: motor saati, yakıt %, su % gir. SONUÇ: ☐ ☐ (P0)

**B5. Öldür-aç-devam** · Uygulamayı tamamen kapat → aç → Home'da "Resume Draft" veya trip kartı → aynı denetime dön. Beklenen: **tüm işaretler, not, foto, sayaçlar duruyor**. SONUÇ: ☐ ☐ (**P0 — veri kaybı**) · Kanıt: B5

**B6. Tamamlama koruması** · Summary → Complete dene. Beklenen: kritik maddeler işaretlenmeden **engellenir ve eksikler listelenir**; kritikleri işaretleyince (uyarıyla) tamamlanır; ✓ damgası görünür. SONUÇ: ☐ ☐ (P0) · Kanıt: B6

**B7. Dönüş listesi + geçmiş** · TripDetail → Return & secure'u tamamla → Boats sekmesi → tekneye dokun. Beklenen: **Durum geçmişinde 2 kayıt** (pre-departure ✓, return ✓); kayda dokununca özet açılır. SONUÇ: ☐ ☐ (P1) · Kanıt: B7

## GRUP C — Charter Akışı

**C1.** Home → "Inspect a Charter Boat" → yeni tekne (charter) → sefer oluştur → TripDetail'de **Check-in** kartı → başlat. Motor saati + yakıt gir, 3+ foto çek (sorunlu maddelere), mevcut hasar gözlemi kaydet ("existing damage" notuyla), check-in'i tamamla. SONUÇ: ☐ ☐ (P0) · Kanıt: C1

**C2. Öldür-aç** → aynı trip → **Check-out** başlat. SONUÇ: ☐ ☐ (P0)

**C3. Teslim incelemesi** · TripDetail → Handover review. Beklenen: check-in fotoğrafları solda; "Re-take this angle" ile aynı açıyı çek → sağa yerleşir. Check-out'ta yeni sayaç değerleri gir → tabloda **Δ doğru** (motor saati farkı artı, yakıt düşüşü kırmızı eksi). Bir çifti "Needs review" işaretle. SONUÇ: ☐ ☐ (P0) · Kanıt: C3a-b

**C4. Rapor** · "Share handover summary" → e-posta/nota paylaş. Beklenen: sayaç karşılaştırmaları, gözlemler, çift sayıları VAR; **"yeni hasar", "sorumlu", "kiracı yaptı" gibi hiçbir suçlama cümlesi YOK**; sonda olgu feragati var. SONUÇ: ☐ ☐ (P0) · Kanıt: C4 (paylaşılan metnin kopyası)

**C5. Tek oturum** · TripDetail'e dön → check-in/check-out kartlarına tekrar gir-çık. Beklenen: aynı kayıtlar açılıyor, **çift oturum/çift denetim oluşmuyor**. SONUÇ: ☐ ☐ (P0)

## GRUP D — Kamera İzinleri

**D1. İzin verildi**: ilk foto isteğinde izin diyaloğu → metin anlaşılır mı, cihaz dilinde mi? İzin ver → foto çekilir. ☐ ☐ (P0)
**D2. İzin reddedildi**: (Ayarlar→uygulama→izinler→kamera kapat) foto çekmeyi dene. Beklenen: çökme YOK; galeri seçici açılır (fallback). ☐ ☐ (P0) · Kanıt: D2
**D3. Kalıcı red + sonradan açma**: Ayarlardan izni geri aç → foto çekimi çalışır. ☐ ☐ (P1)
**D4. Çekimi iptal**: kamera açıkken vazgeç. Beklenen: sorun penceresi açık kalır, veri kaybolmaz. ☐ ☐ (P1)
**D5. Çekim sırasında arka plan**: kamera açıkken Home tuşu → geri dön. Beklenen: çökme yok; gerekirse yeniden çek. ☐ ☐ (P1)
**D6. (Pratikse) düşük depolama**: dolu cihazda foto → anlaşılır davranış, sessiz kayıp yok. ☐ ☐ (P1)

## GRUP E — Uçak Modu (tamamen çevrimdışı)

Ön koşul: **uçak modunu açtıktan SONRA** uygulamayı başlat.
Adımlar: tekne oluştur → sefer oluştur → ikmal üret + kalem işaretle → checklist bölümü onayla → foto çek → sorun ekle → uygulamayı öldür → **hâlâ uçak modunda** aç → devam et → denetimi tamamla → özet aç → listeyi paylaş (yerel paylaşım hedefi, ör. Notlar).
Beklenen: hiçbir adım ağ beklemez, hiçbir sonsuz spinner yok, hata yok. SONUÇ: ☐ ☐ (**P0**) · Kanıt: E1 (video önerilir)

## GRUP F — Dosya Kalıcılığı (P0)

**F1.** Bir denetimde **10+ foto** çek → uygulamayı öldür → aç → tüm fotolar görünür. ☐ ☐ (P0)
**F2.** **Cihazı yeniden başlat** → uygulamayı aç → aynı fotolar + eski denetimlerdekiler görünür. ☐ ☐ (P0) · Kanıt: F2
**F3.** Handover review'da eski çiftler dahil tüm görseller çözülüyor (kırık görsel yok). ☐ ☐ (P0)

## GRUP G — Uygulama Güncelleme Kalıcılığı (P0)

Manuel adımlar (aynı imza anahtarıyla!):
1. **Build N**: `eas build --profile preview --platform android` → kur → tekne+sefer+denetim oluştur, 5+ foto çek, sayaç ve sorun kaydet, dili Almanca yap.
2. `app.json` → android `versionCode` 2 yap (iOS testinde `buildNumber` "2") → **Build N+1** al.
3. N+1'i **silmeden üzerine** kur (Android: aynı APK imzası; iOS: TestFlight otomatik günceller).
4. Aç → mevcut trip'i aç.
Beklenen: veritabanı aynen duruyor; **TÜM fotoğraflar görünüyor** (göreli yol düzeltmesinin saha teyidi); Library'de hâlâ 5 şablon (çift seed yok); dil hâlâ Almanca. SONUÇ: ☐ ☐ (**P0**) · Kanıt: G1 önce/sonra ekranları

## GRUP H — Çökme/Kesinti Kurtarma

Her birinde: işlemi yap → uygulamayı görev yöneticisinden ANINDA öldür → aç → kaldığın yerde misin, iş kayıp mı?
**H1** ikmal miktarı düzenlerken ☐ ☐ · **H2** checklist işaretlerken ☐ ☐ · **H3** foto çektikten hemen sonra ☐ ☐ · **H4** check-in bitmeden ☐ ☐ · **H5** check-in ile check-out arasında ☐ ☐ · **H6** cihaz yeniden başlatma sonrası ☐ ☐ — hepsi (**P0**)

## GRUP I — Dil Kalite Turu (9 dil)

Profil → her dil için sırayla: Home, sihirbaz, Inspect, Provisioning, Handover review, Boats/History ekranlarını gez.
Kontrol: kesilen/taşan metin ☐ · eksik anahtar (İngilizce sızıntısı — **şablon maddeleri HR/IT/EL/FR'de bilinçli İngilizcedir, hata değildir**) ☐ · ham enum ("sailing", "engine_hours") ☐ · tarih biçimi ☐ · rapor çıktısı seçili dilde ☐ · izin diyaloğu metni ☐ · doğal olmayan çeviri (not al) ☐
Dil başına SONUÇ: EN ☐ · TR ☐ · DE ☐ · RU ☐ · ES ☐ · HR ☐ · IT ☐ · EL ☐ · FR ☐ (kesme/taşma P1, ham enum P1, çeviri kalitesi P2) · Kanıt: dil başına 1-2 ekran

## GRUP J — 7 Dakika Hedefi

Temiz teknede charter check-in'i **acele etmeden** yap; kronometre + tur sonunda not:
- Tekne oluşturma/seçme süresi: ___ · Denetime başlama: ___ · Checklist tamamlama: ___ · Zorunlu fotolar: ___ · **TOPLAM: ___ dk**
- Toplam dokunuş (yaklaşık): ___ · Duraksadığın yerler: ___ · Gereksiz gidip-gelme: ___ · Yavaş ekran: ___
Hedef ≤ 7 dk. Aşarsa: nedenleri not et — hedefi tutturmak için testi eğip bükme. SONUÇ: ___ dk ☐ ☐ (P1)

## GRUP K — Performans (gerçek telefon)

Ölçülebilenler (kronometre yeterli): soğuk açılış ___ sn (hedef <3) · sıcak açılış ___ sn (<1) · kamera açılma ___ sn (<2) · foto kaydetme ___ sn (<1) · Inspect'te 100+ maddeli şablonda bölüm geçişi anlık mı ☐ · 50 fotoluk handover review kaydırması akıcı mı ☐ · çok denetimli Boat History açılışı ☐ · paylaşım sayfası gecikmesi ☐.
Öznel izlenimleri "his" olarak ayrı yaz. SONUÇ: ☐ ☐ (P1) · Kanıt: K1 notları

---

## Sonuç Tablosu Şablonu

| Grup | Geçti/Kaldı | Notlar |
|---|---|---|
| A Temiz kurulum | | |
| B Sahip akışı | | |
| C Charter akışı | | |
| D Kamera | | |
| E Uçak modu | | |
| F Dosya kalıcılığı | | |
| G Güncelleme | | |
| H Kurtarma | | |
| I Diller | | |
| J 7 dakika | ___ dk | |
| K Performans | | |

**GO ancak şu şartla verilebilir:** A, B, C, D1-D2, E, F, G, H'nin tamamı geçti; bilinen veri kaybı yok; engelleyici çökme yok.
