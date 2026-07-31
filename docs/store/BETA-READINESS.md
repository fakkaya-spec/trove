# TROVE — TestFlight Beta Hazırlık Raporu

_Tarih: 2026-07-30 · Kapsam: depo/derleme denetimi, cihaz test planı, gözlemlenebilirlik, metadata, nihai karar_

---

## 1. Derleme/Konfigürasyon Denetimi (Adım 1) — bulgular ve yapılan değişiklikler

| Öğe | Durum | Yapılan |
|---|---|---|
| `npx expo-doctor` | **20/20 temiz** | — |
| Bundle ID / paket adı | `com.kosko.trove` (iOS+Android) — ilk mağaza yüklemesinden sonra değişmez; onay bekliyor | dokümante |
| Sürüm/build | 1.0.0 · iOS buildNumber "1" · Android versionCode 1 · EAS autoIncrement açık | ✅ |
| OTA/güncelleme | `expo-updates` **bilinçli olarak yok** — beta'da OTA kullanılmayacak; her değişiklik yeni build. runtimeVersion bu yüzden gereksiz | karar dokümante |
| Kamera/foto izin metinleri | Mevcut ve amaca özel | ✅ |
| **Kullanılmayan RECORD_AUDIO izni** | expo-image-picker video için ekliyordu; uygulama video/ses kaydetmiyor | ✅ **düzeltildi** — plugin `microphonePermission:false` + Android `blockedPermissions` |
| **Beta'da reklam/IAP görünürlüğü** | Legacy mod (AdMob+Premium) açıktı; AdMob TEST kimlikleri binary'e girecekti | ✅ **düzeltildi** — `features.legacyChecklists=false`: beta reklamsız/IAP'siz. **NOT:** SDK'lar binary'de durur (kod korunuyor); App Privacy formunu buna göre doldur **veya** mağaza üretimi öncesi kaldır: `app.json`'dan `react-native-google-mobile-ads` plugin'ini sil + `npm uninstall react-native-google-mobile-ads react-native-iap` (ads/iap modülleri lazy-require ile zaten yokluğa dayanıklı) |
| Üretim loglaması | Tek `console.warn` (DB açılış hatası; hassas içerik yok). `console.log` sızıntısı YOK (grep'le doğrulandı) | ✅ |
| Geliştirici arayüzü | Tüm DEV düğmeleri `__DEV__` korumalı; release build'de derlenmez | ✅ |
| Sırlar | Repo'da sır yok; AdMob kimlikleri Google'ın herkese açık TEST kimlikleri | ✅ |
| SQLite | WAL + foreign_keys, migration idempotent (testli), seed versiyonlu (testli) | ✅ |
| Şifreleme beyanı | `ITSAppUsesNonExemptEncryption:false` | ✅ |
| Beta geri bildirimi | Profil'e mailto linki eklendi (yalnız sürüm/OS/dil meta verisi; denetim içeriği/foto ASLA eklenmez) | ✅ eklendi |

## 2. Kesin Komutlar (Adım 2)

```bash
cd marincheck

# 1 Bağımlılıklar          
npm install
# 2-5 Doğrulama üçlüsü + testler
npm run typecheck && npm run lint && npm test
# 6 Expo Doctor
npx expo-doctor
# 7 Yerel iOS (yalnız macOS+Xcode): 
npx expo run:ios --configuration Release
#   Yerel Android (Android Studio/SDK varsa):
npx expo run:android --variant release
# 8 EAS preview (cihaz testi için — Android APK üretir)
npm i -g eas-cli && eas login
eas build --profile preview --platform android
eas build --profile preview --platform ios     # internal distribution (cihaz UDID kaydı ister)
# 9 TestFlight/üretim
eas build --profile production --platform ios
eas submit --platform ios
# 10 Android preview zaten 8'de; Play üretimi:
eas build --profile production --platform android
```

Güncelleme (Grup G) testi için build numarası artırma: `app.json` → `android.versionCode: 2` / `ios.buildNumber: "2"` → aynı preview komutunu tekrar çalıştır → **silmeden üzerine kur**.

## 3. Cihaz Test Planı (Adım 3)
→ **`docs/store/DEVICE-TEST.md`** — A-K grupları, teknik olmayan kullanıcı için adım/beklenen/sonuç/kanıt/önem alanlarıyla. GO kapısı tablo altında tanımlı.

## 4. Cihaza-özgü sorunlar (Adım 4)
Bu ortamda gerçek cihaz YOK; bu turda **öngörülebilir** cihaz sorunları kapatıldı (RECORD_AUDIO, mutlak medya yolu [önceki denetim], izin metinleri, kamera iptal/başarısızlık fallback'i kodda mevcut). Cihaz koşusunda çıkacak her bulgu için süreç: yeniden üret → kök neden → en küçük güvenilir düzeltme → mümkünse regresyon testi → yeniden koş → önce/sonra kaydet. Bulgular bu dosyanın sonundaki tabloya işlenir.

## 5. Gözlemlenebilirlik (Adım 5) — Sentry kararı

**Karar: beta için ŞİMDİ EKLENMEDİ; TestFlight gönderiminden önce eklenmesi P1 önerisidir.**
Gerekçe: `@sentry/react-native` native modüldür ve **DSN (hesap) olmadan işlevsizdir** — sırsız repo'ya kör kurulum yalnız risk ekler. Kod tarafında engel yok. Hesap açıldığında uygulama adımları (≈30 dk):
```bash
npx expo install @sentry/react-native && npx @sentry/wizard@latest -i reactNative
```
Kurulum ilkeleri (uygulanacak): `enableAutoSessionTracking`, release/build etiketi (`1.0.0+<buildNumber>`), `environment: "beta"`, `beforeSend` içinde: kullanıcı kimliği YOK, dosya yolu/foto URI'si maskeleme, breadcrumb'lar yalnız ekran adı/aksiyon türü; denetim metni, rapor içeriği, foto **asla** gönderilmez. Kaynak haritaları EAS ile otomatik yüklenir (wizard yapılandırır).
Geri bildirim mekanizması: Profil'deki mailto linkiyle karşılandı (veri toplamadan) — kapsam genişletilmedi.

## 6. TestFlight Metadata Denetimi (Adım 6)

| Öğe | Durum |
|---|---|
| Ad/alt başlık/açıklama/anahtar kelimeler (9 pazar için 5 dil hazır) | ✅ `LISTINGS.md` |
| İkon + splash | ✅ üretildi (`scripts/generate-icons.mjs`) |
| İzin metinleri | ✅ app.json |
| Şifreleme/export compliance | ✅ beyan edildi |
| Yaş sınıfı | 4+/PEGI 3 (anket cevapları basit: şiddet yok, UGC paylaşımı yok) |
| İnceleme notları + beta test yönergesi | ✅ `PRIVACY.md` sonunda hazır metin; beta yönergesi = `DEVICE-TEST.md` B ve C grupları |
| **Eksik DIŞ varlıklar (benim üretemeyeceklerim)** | ⛔ Apple Developer hesabı ($99) · ⛔ gizlilik politikası **yayınlanmış URL** (metin hazır: `PRIVACY.md`; barındırma önerisi GitHub Pages) · ⛔ destek URL'si (geçici: mailto/GitHub repo sayfası — **uydurma URL yazılmadı**) · ⛔ cihazdan ekran görüntüleri (çekim listesi `LISTINGS.md`) · ⛔ Sentry DSN (opsiyonel P1) |

## 7. Nihai Rapor

1. **Kullanılan build:** Bu ortamda cihaz build'i alınamadı (EAS hesabı yok). Kod doğrulaması: commit `HEAD` üzerinde tsc strict 0/0, lint 0/0, 5 test paketi (gerçek SQLite) yeşil, expo-doctor 20/20, web smoke 9 dilde hatasız.
2. **Test edilen cihaz/OS:** — (cihaz koşusu ürün sahibinde; plan: `DEVICE-TEST.md`)
3-4. **Yapılan testler / geçti-kaldı:** masa başı katmanı yukarıda; **A-K cihaz grupları BEKLEMEDE** — hiçbiri "geçti" olarak İŞARETLENMEDİ.
5. **P0/P1/P2:** P0 kod bulguları önceki denetimde kapatıldı; bu turda ek P0 konfig bulgusu (RECORD_AUDIO, beta'da reklam görünürlüğü) kapatıldı. Açık P0'lar yalnızca *cihazda doğrulanacaklar* (F/G/E/H grupları). P1: Sentry, şablon içeriği HR/IT/EL/FR, takvim seçici. P2: tablet, N+1, öksüz foto temizliği.
6. **Tamamlanan düzeltmeler:** bkz. bölüm 1 + `docs/AUDIT.md`.
7. **Kalan riskler:** kamera/dosya sistemi/güncelleme davranışı yalnız kodla doğrulandı; çeviri doğallığı (HR/IT/EL/FR) ana dil konuşuru görmedi.
8. **Gerekli kanıtlar:** `DEVICE-TEST.md` içindeki kanıt alanları (özellikle F2, G1, C4, E1).
9. **Gönderim listesi:** `CHECKLIST.md` + bölüm 6'daki eksik dış varlıklar.
10. **KARAR: CONDITIONAL GO** — değişmedi ve cihaz koşusu olmadan değişemez. GO'nun ön şartları (veri kaybı yok, güncelleme kalıcılığı, çevrimdışı akış, kamera akışı, migration, çekirdek akışlar, çökme yok) tanım gereği **yalnızca gerçek cihazda kanıtlanabilir**. Yeşil birim testleri yeterli kanıt DEĞİLDİR. Tek preview build ile `DEVICE-TEST.md` koşusu (~yarım gün) temiz geçerse karar **GO**'ya döner; F veya G'de tek bir başarısızlık **NO-GO**'dur.
