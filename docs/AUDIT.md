# BoatCheck — Beta Öncesi Ürün Denetimi

_Tarih: 2026-07-30 · Kapsam: tüm kod tabanı, tüm ekranlar, tüm akışlar_
_Ortam notu: denetim kod + web smoke + gerçek-SQLite testleriyle yapıldı; render/bellek/jest-hissi ölçümleri **cihaz gerektirir** ve ayrıca işaretlendi._

---

## FAZ 1 — UX Denetimi

| Alan | Bulgu | Durum |
|---|---|---|
| Navigasyon | 5 sekme + kök stack tutarlı; Inspect/Summary/Provisioning her giriş noktasından aynı davranıyor | ✅ |
| Ham enum sızıntısı | 5 ekranda çevrilmemiş enum ("sailing", "engine_hours") kullanıcıya gösteriliyordu | ✅ **düzeltildi** — `boatTypeLabel()` yardımcı + `meter_*` anahtarları (9 dil) |
| Tipografi/renk | Tek tema dosyası (`theme.ts`), tüm ekranlar aynı ölçek; sapma bulunamadı | ✅ |
| Dokunma hedefleri | Ana eylemler ≥56pt; durum noktası 30pt ama satırın tamamı basılabilir; stepper'lar 42pt | ✅ |
| Erişilebilirlik | Inspect/Summary ekranlarında SIFIR a11y etiketi vardı | ✅ **düzeltildi** — madde satırları, durum seçici, bölüm onayı, sekme çipleri (role+state), tamamla düğmesi etiketlendi |
| Dil seçici | 9 dile çıkınca taşacaktı | ✅ **düzeltildi** — flexWrap |
| Karanlık mod | Uygulama bilinçli olarak tek (koyu) temadır; legacy checklist "kâğıt" ekranı istisna ve markanın parçası | ✅ bilinçli karar |
| Yatay/Tablet | Portre kilitli; iPad'de letterbox çalışır. Tablet yerleşimi optimize değil | ⚠ P2 (aşağıda) |
| Animasyon/geçiş | Native stack varsayılan geçişleri; modal'lar slide. Özel animasyon yok — sade ve hızlı | ✅ bilinçli sadelik |
| Yükleme durumları | Tüm veri senkron SQLite → spinner gerekmiyor; tek istisna IAP (ActivityIndicator var) | ✅ |

## FAZ 2 — Ürün Denetimi (akış yürüyüşleri)

| Bulgu | Durum |
|---|---|
| **Boats sekmesi çıkmaz sokaktı** — satırlar basılamıyordu; pazar araştırmasının "tekne başına boylamsal durum geçmişi" çekirdek değeri UI'da hiç yoktu | ✅ **düzeltildi** — `BoatHistoryScreen`: teknenin tüm denetimleri (tür, tarih, sorun sayıları, ✓/…) kronolojik; satır → InspectionSummary |
| "Prepare My Boat" ve "Start a Trip" aynı yere gidiyordu (yinelenen eylem); "Inspect a Charter Boat" ise trip sisteminin DIŞINDA öksüz denetim açıyordu | ✅ **düzeltildi** — üç hızlı eylem de sihirbaza gider, sahiplik ön seçimiyle (`TripWizard {ownership}`) |
| Yıkıcı eylemler | Trip silme, kalem silme, liste sıfırlama onaylı ✅; başarı geri bildirimi: damga, %100 "allDone", sonraki-adım kartı ✅ |
| Boş durumlar | Home/Trips/BoatHistory boş durumları öğretici metinli ✅ (BoatHistory yenisi dahil) |
| Foto zorunlu maddeler | `requiresPhotoOnIssue` yalnızca görsel uyarı, engel değil — güneşte kullanıcıyı kilitlememe bilinçli kararı; rapora not | ✅ bilinçli |
| `NewInspection` rotası artık hiçbir yerden bağlanmıyor (öksüz rota, zararsız) | ⚠ P2 temizlik |

## FAZ 3 — Performans

| Bulgu | Durum |
|---|---|
| **`listPairs` TÜM medya tablosunu çekip JS'te filtreliyordu** (foto sayısıyla lineer büyüme) | ✅ **düzeltildi** — `inArray` ile hedefli sorgu |
| Inspect listesi | Bölüm başına ≤25 satır (sekmeli bölümler) + FlatList windowing → 150 maddelik şablon sorunsuz; ölçüm cihazda teyit edilmeli | ✅ / 📱 |
| BoatHistory sorgusu denetim başına issue sorgusu (N+1) — tekne başına denetim sayısı düşük | ⚠ P2 |
| Açılış: senkron migrate+seed; ilk kurulumda seed ~5 şablon; hızlı. Soğuk açılış ölçümü cihaz işi | 📱 |
| Foto: quality 0.6, EXIF kapalı; sınırsız/sıkıştırmasız medya yok | ✅ |

## FAZ 4 — Çevrimdışı Güvenilirlik

| Bulgu | Durum |
|---|---|
| **P0: Fotoğraflar MUTLAK yolla saklanıyordu.** iOS her uygulama güncellemesinde konteyner UUID'sini değiştirir → tüm kanıt fotoğrafları kaybolurdu ("uygulama asla kullanıcı işini kaybetmemeli" ilkesinin doğrudan ihlali) | ✅ **düzeltildi** — DB'de göreli anahtar (`media/<id>.jpg`); `resolveMediaUri()` gösterim anında çözer; eski mutlak kayıtlar geriye uyumlu |
| Her dokunuş anında DB'ye yazma (taslak kaybı imkânsız), WAL modu, migration idempotent (testli), seed versiyonlu (testli) | ✅ |
| DB açılamazsa: çökme yok, akışlar kapalı + bilgi mesajı, legacy mod çalışır | ✅ |
| Sync kuyruğu her mutasyonda doluyor (Faz 4 bulut için hazır); kuyruk temizliği bulutla gelecek | ✅ iskelet |
| Uçak modu: veri katmanı ağ ÇAĞRISI içermiyor (yalnız IAP/AdMob legacy'de, hataları yutuluyor) — kodla doğrulandı; uçtan uca cihaz teyidi gerekli | ✅ / 📱 |

## FAZ 5 — Uluslararasılaştırma

- Mimari zaten anahtar-tabanlı (üç strings modülü + LocalizedText içerik + `lt()` EN fallback). Sabit kodlu kullanıcı metni taraması yapıldı; kalanlar yalnızca `__DEV__` düğmeleri ve placeholder örnek adı ("S/Y Meltemi" — marka örneği, bilinçli).
- **8 dil hedefi:** EN, TR, DE, RU, ES (mevcut) + **HR, IT, EL, FR eklendi** (bu denetim turunda; tüm UI anahtarları tam çeviri). Şablon İÇERİĞİ (denetim maddeleri) 5 dilde; yeni 4 dilde İngilizce'ye düşer — beta için kabul edilebilir, tam içerik çevirisi P1.
- RTL: hedeflenen 8 dilin hiçbiri RTL değil; layout'lar flex tabanlı (mutlak konum yok) — RTL dili eklendiğinde büyük engel beklenmiyor. Şimdi iş yapılmadı (bilinçli).

## FAZ 6-7 — Beta Kalitesi & Kod Kalitesi

- `tsc --strict` 0 hata, `expo lint` 0 hata/0 uyarı, 5 test paketi (gerçek SQLite) yeşil.
- Katman disiplini korunuyor: UI → repository → DB; iş kuralları `domain/` saf fonksiyonlarda (testli). Reklam/IAP kodu yeni akışların hiçbirinde import edilmiyor (grep'le teyitli).
- Kalan bilinçli borçlar aşağıdaki öncelik listesinde.

---

## Öncelik Listesi

### P0 — Beta'dan önce ZORUNLU (hepsi kapatıldı ✅)
1. ~~Mutlak medya yolu (iOS güncellemesinde foto kaybı)~~ → göreli anahtar + resolver.
2. ~~Boats sekmesi çıkmaz sokak / durum geçmişi yok~~ → BoatHistoryScreen.
3. ~~Ham enum etiketleri (5 ekran)~~ → yerelleştirildi.
4. ~~listPairs tüm-tablo taraması~~ → inArray.
5. ~~Çekirdek ekranlarda sıfır erişilebilirlik~~ → etiketlendi.

### P0 — Beta'dan önce, CİHAZDA yapılmalı (kod hazır, doğrulama bende mümkün değil) 📱
- Gerçek telefonda tam akış: foto çekimi (izin ver/reddet), uçak modunda sefer+denetim+ikmal, öldür-aç devam, 5+9 dilde ekran turu, temiz teknede ≤7 dk ölçümü.
- iOS'ta bir TestFlight güncellemesi simülasyonu: build N'de foto çek → build N+1 yükle → fotolar görünüyor mu (göreli yol düzeltmesinin saha teyidi).

### P1 — Beta sırasında
- Şablon içeriğinin HR/IT/EL/FR çevirisi (UI çevrildi; maddeler EN fallback).
- Tarih alanlarına takvim seçici (şimdilik metin — çalışıyor ama premium hissi değil).
- Crash raporlama (Sentry) — beta geri bildirimi için neredeyse şart.
- IssueSheet'e video/sesli not (şema hazır).
- `NewInspection` öksüz rotasının kaldırılması veya Library'ye bağlanması.

### P2 — Beta sonrası
- Tablet/yatay yerleşim optimizasyonu.
- BoatHistory N+1 sorgu birleştirme; Inspect satırı `React.memo`.
- Issue silinince öksüz foto dosyası temizliği (depolama hijyeni).
- Legacy modun kaderi (kullanım verisiyle karar — feature flag hazır).

---

## Go / No-Go — TestFlight Beta

**Karar: KOŞULLU GO.**

Kod tabanı beta kalitesinde: P0 kod sorunlarının tamamı bu denetimde kapatıldı, katmanlar disiplinli, veri kaybı vektörleri kapalı, 9 dil, testler yeşil. Ancak bu depoda hiçbir yapı gerçek cihazda çalıştırılamadı — kamera, dosya sistemi ve mağaza katmanı yalnızca kod düzeyinde doğrulandı.

**GO şartı:** Yukarıdaki 📱 cihaz listesi tek bir `eas build --profile preview` üzerinde bir kez koşulmalı (tahmini yarım gün). O turda kritik bulgu çıkmazsa TestFlight'a gönderilebilir. Bu tur atlanarak gönderim **önerilmez** — riskin tamamı kamera/FS entegrasyonunda, yani tam da masa başında test edilemeyen katmanda.
