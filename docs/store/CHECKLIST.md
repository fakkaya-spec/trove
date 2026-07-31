# Yayın Kontrol Listesi (App Store + Google Play)

Sıralı, işaretlenebilir. ☐ = yapılacak · ⚠ = karar gerektirir.

## 0. Kararlar (koddan önce)
- ☐ ⚠ **Marka adı**: "TROVE" ile mi çıkılıyor? Ad, domain ve marka tescil taraması yapılmadan mağazaya AD yazılmamalı. Paket kimlikleri `com.kosko.trove` olarak ayarlandı — **ilk yüklemeden sonra değiştirilemez**; addan bağımsız kalıcı olduğuna karar ver.
- ☐ ⚠ **Reklam kararı**: İlk sürüm reklamlı mı? Reklamsız çıkış = "No data collected" beyanı (çok daha temiz inceleme). Reklamsız çıkılacaksa: `features.adsInLegacyOnly` yetmez — app.json'dan `react-native-google-mobile-ads` plugin'ini kaldır + `npm uninstall react-native-google-mobile-ads` (SDK binary'de kalmasın). Kararın iki yönü de PRIVACY.md'de hazır.
- ☐ ⚠ **IAP kararı**: Reklamsız çıkılırsa "reklam kaldırma" aboneliğinin anlamı kalmaz → Premium'u ilk sürümden çıkar veya reklamlı çık.

## 1. Hesaplar
- ☐ Google Play Console geliştirici hesabı ($25, tek seferlik) — kimlik doğrulama 1-3 gün sürebilir
- ☐ Apple Developer Program ($99/yıl) — D-U-N-S gerekmez (bireysel)
- ☐ Expo hesabı (ücretsiz) + `npm i -g eas-cli && eas login`
- ☐ (Reklamlı çıkışta) AdMob hesabı + uygulama kayıtları

## 2. Kimlikler ve konfig
- ☐ (Reklamlı çıkışta) app.json'daki AdMob **test** kimliklerini gerçek Uygulama Kimlikleriyle değiştir; `src/ads.tsx` PROD_BANNER/PROD_INTERSTITIAL birimlerini doldur
- ☐ (IAP'li çıkışta) App Store Connect + Play Console'da abonelikler: `marincheck_premium_monthly`, `marincheck_premium_yearly`
- ☑ Sürümler: iOS buildNumber "1", Android versionCode 1 (EAS `autoIncrement` açık)
- ☑ Kamera/foto izin metinleri (app.json → expo-image-picker plugin)
- ☑ Splash + ikonlar (`node scripts/generate-icons.mjs` ile yeniden üretilebilir)
- ☑ `ITSAppUsesNonExemptEncryption: false` (standart şifreleme muafiyeti)

## 3. Gizlilik
- ☐ PRIVACY.md'yi herkese açık URL'de yayınla (en kolayı: GitHub Pages veya repo raw linki değil — Pages önerilir) ve iki mağazadaki "Privacy Policy URL" alanına yaz
- ☐ Play "Data safety" formunu PRIVACY.md'deki dahili rehbere göre doldur
- ☐ iOS "App Privacy" bölümünü aynı rehbere göre doldur
- ☐ Play "Ads" beyanı: reklam var/yok kararına göre

## 4. Derleme ve test
- ☐ `cd marincheck && npm run typecheck && npm run lint && npm test` (hepsi temiz olmalı)
- ☐ `eas build --profile preview --platform android` → APK'yı gerçek cihazda test et:
  - ☐ Uçak modunda tam akış (sefer → denetim → ikmal → dönüş)
  - ☐ Kamera izni ver/reddet iki senaryo
  - ☐ 5 dilde ekranlar (Profil → dil değiştir)
  - ☐ Uygulamayı öldür-aç: taslak kaldığı yerden sürüyor
  - ☐ Temiz teknede pre-departure ≤ 7 dk ölçümü
- ☐ iOS: `eas build --profile preview --platform ios` → TestFlight internal test

## 5. Mağaza kayıtları
- ☐ LISTINGS.md'den 5 dilde ad/alt başlık/açıklamaları gir (EN birincil; TR, DE, RU, ES yerelleştirme olarak)
- ☐ Ekran görüntüleri: LISTINGS.md'deki 6'lık çekim listesi, cihazdan (iOS 6.7" zorunlu; Play telefon + 7" + 10")
- ☐ Play "Feature graphic" 1024×500 (ikon motifi + slogan; `scripts/generate-icons.mjs` genişletilebilir)
- ☐ Kategori: iOS **Sports** (ya da Utilities); Play **Maps & Navigation** yerine **Auto & Vehicles/Sports** — öneri: iOS Sports, Play Sports
- ☐ Yaş sınıflandırması anketleri (şiddet yok, kullanıcı içeriği paylaşımı yok → 4+/PEGI 3)
- ☐ İnceleme notları alanına PRIVACY.md sonundaki hazır metni yapıştır

## 6. Gönderim
- ☐ `eas build --profile production --platform all`
- ☐ `eas submit --platform android` (ilk gönderim: Play Console'a manuel AAB yükleme gerekebilir)
- ☐ `eas submit --platform ios`
- ☐ Play: önce **Internal testing** kanalı → sonra Production'a terfi (ilk yayında 20 test kullanıcısı/14 gün kuralı kişisel hesaplarda geçerli olabilir — Console uyarısına bak)
- ☐ İnceleme süreleri: Apple ~1-3 gün, Play ilk uygulama ~2-7 gün

## 7. Yayın sonrası
- ☐ Mağaza konsollarında çökme/ANR takibi (Sentry Faz 4'te eklenecek)
- ☐ İlk kullanıcı yorumlarına yanıt planı
- ☐ Marka adı kesinleşince: app.json `name` + LISTINGS.md adları + ikon scripti (gerekirse) — paket kimliği DEĞİŞMEZ
