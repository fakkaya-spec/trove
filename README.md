# ⚓ MarinCheck — Kaptanın Teslim Defteri

Tekne kiralayanlar ve tekne sahipleri için **denizci temalı kontrol listesi uygulaması** (iOS + Android).

Kiralık teknede depozitonu, kendi teknende canını ve seyrini korur: teslim alırken neyi kontrol edeceğini, neyi fotoğraflayacağını madde madde söyler.

## Neden?

Araştırma sonucu (ASA, RYA, charter operatörleri check-in prosedürleri):

- Tekne kiralama ihtilaflarının çoğu **teslim anında belgelenmeyen hasarlardan** çıkıyor; 1 numaralı ihtilaf kalemi bot (dinghy) ve dıştan takma motor pervanesi.
- Mevcut uygulamalar (Floatist, SpeedyDock, Boatsetter…) hep **işletme tarafına** çalışıyor; kiracıya bağımsız, tekne tipine özel bir kontrol uygulaması **yok** — Türkçe hiç yok, gulet/sürat teknesi pazarını kapsayan hiç yok.

## Diller

Uygulama **5 dilde** çalışır: 🇬🇧 İngilizce (varsayılan) · 🇹🇷 Türkçe · 🇩🇪 Almanca · 🇷🇺 Rusça · 🇪🇸 İspanyolca

- **Varsayılan dil İngilizce**; cihaz dili destekleniyorsa otomatik ona geçer, ana ekrandan elle değiştirilebilir (seçim kalıcıdır).
- Dil seçimi ilerlemeyi bozmaz: işaretler madde kimliğiyle saklanır, dil değişince aynen korunur.
- Dil dosyaları: `src/data/checklists.ts` (TR, ana kaynak) + `checklists.{en,de,ru,es}.ts`; arayüz metinleri `src/i18n/strings.ts`.
- Neden bu diller? İngilizce evrensel denizcilik dili; Akdeniz charter pazarının en büyük müşteri grubu Almanca konuşanlar; Türkiye kıyılarında Rusça konuşan turist yoğun; İspanyolca hem Balear Adaları (Mallorca/Ibiza — dünyanın en büyük charter merkezlerinden) hem Latin Amerika pazarını açar.

## Özellikler

- **10 hazır kontrol defteri, ~570 madde:**
  - Kiralık: Yelkenli (109), Motoryat (109), Katamaran (121), Gulet (23), Sürat Teknesi (29), Jet Ski (17), Kano/SUP (8)
  - Tekne sahibi: Yola Çıkış / pre-departure — WOBBLE motor kontrolü dahil (56), Sezon Açılışı (51), Tekneden Ayrılırken (22)
- **KRİTİK** ve **📷 FOTOĞRAFLA** rozetleri + madde bazlı ipuçları (neden önemli, neye mal olur)
- **Foto & Depozito Rehberi:** en çok ihtilaf çıkan 12 nokta + 7 altın kural
- İlerleme kalıcı olarak saklanır (AsyncStorage) — marina da internetsiz çalışır
- Liste tamamlanınca "KONTROL TAMAM" damgası
- Özgün "kaptanın seyir defteri" tasarımı: gece laciverti, krem kâğıt, pirinç detaylar, serif tipografi

## Gelir Modeli

İki ayak: **reklam (AdMob)** + **reklamsız Premium abonelik (aylık/yıllık)**.

### 1) Reklamlar (AdMob)

- Her ekranın altında uyarlanabilir **banner** reklam
- Liste tamamlanınca **geçiş (interstitial)** reklamı
- Geliştirmede otomatik olarak Google **test** reklamları gösterilir
- Premium abonelerde tüm reklamlar otomatik gizlenir

Yayına almadan önce:
1. [AdMob](https://admob.google.com) hesabı aç, iOS ve Android uygulamalarını kaydet.
2. `app.json` → `react-native-google-mobile-ads` eklentisindeki `androidAppId` / `iosAppId` değerlerini kendi **Uygulama Kimliklerinle** değiştir (şu an Google'ın test kimlikleri).
3. `src/ads.tsx` içindeki `PROD_BANNER` / `PROD_INTERSTITIAL` değerlerini kendi **Reklam Birimi Kimliklerinle** değiştir.

> ⚠️ Gerçek kimliklerle test tıklaması yapma — AdMob hesabını kapattırır. Geliştirmede `__DEV__` sayesinde hep test reklamı çıkar.

### 2) Premium Abonelik (reklamsız kullanım)

`react-native-iap` ile uygulama içi otomatik yenilenen abonelik. Ürün kimlikleri (`src/premium.tsx`):

| Plan  | Ürün kimliği                  |
|-------|-------------------------------|
| Aylık | `marincheck_premium_monthly`  |
| Yıllık| `marincheck_premium_yearly`   |

Yayına almadan önce:
1. **App Store Connect** → Abonelikler: yukarıdaki iki kimlikle auto-renewing subscription oluştur, fiyatları belirle (öneri: aylık ~$1.99, yıllık ~$9.99 — yıllıkta "2 ay bedava" algısı).
2. **Google Play Console** → Ürünler → Abonelikler: aynı kimliklerle abonelik + base plan oluştur.
3. Fiyatlar uygulamaya mağazadan gelir (`fetchProducts`), kodda fiyat yazmaya gerek yok.
4. İleri seviye: makbuz doğrulamasını sunucuda yapmak istersen RevenueCat entegrasyonu en kolay yoldur; mevcut yapı cihaz üstü doğrulama yapar.

Davranış: satın alma/geri yükleme sonrası tercih cihazda saklanır, banner + interstitial anında kapanır. Ana ekrandaki ⭐ kart Premium ekranına götürür; mağaza olmayan ortamlarda (web/Expo Go) satın alma kapalıdır, `__DEV__` derlemede "premium simüle et" düğmesiyle test edilebilir.

## Geliştirme

```bash
cd marincheck
npm install
npx expo start          # Expo Go ile test (reklamlar görünmez, uygulama reklamsız çalışır)
npx expo run:android    # reklamlar dahil gerçek derleme
npx expo run:ios        # (macOS gerekir)
```

Not: `react-native-google-mobile-ads` yerel modül olduğu için **Expo Go'da ve web'de çalışmaz**; uygulama bu ortamlarda otomatik olarak reklamsız çalışır (`src/ads.web.tsx` + çalışma zamanı kontrolü).

## Mağazalara Yayınlama (Apple + Google)

En kolay yol [EAS Build](https://docs.expo.dev/build/introduction/):

```bash
npm install -g eas-cli
eas login                      # ücretsiz Expo hesabı
eas build:configure
eas build --platform android   # .aab üretir → Google Play Console'a yükle
eas build --platform ios       # .ipa üretir → App Store Connect'e yükle (Apple Developer üyeliği $99/yıl)
eas submit                     # mağazalara otomatik gönderim
```

- Google Play: tek seferlik $25 geliştirici kaydı
- Apple: $99/yıl geliştirici üyeliği
- Paket adları: `com.kosko.marincheck` (app.json içinde)

## Dosya Yapısı

```
marincheck/
├── App.tsx                     # Navigasyon + reklam başlatma
├── app.json                    # Expo yapılandırması + AdMob eklentisi
└── src/
    ├── theme.ts                # Seyir defteri tasarım dili (renk/font)
    ├── navigation.ts           # Ekran tipleri
    ├── storage.ts              # Kalıcı ilerleme (AsyncStorage)
    ├── ads.tsx / ads.web.tsx   # AdMob banner + interstitial (web'de kapalı)
    ├── components/ui.tsx       # Halat ayraç, pirinç rozet, ilerleme, etiketler
    ├── i18n/
    │   ├── strings.ts          # Arayüz metinleri (TR/EN/DE/RU)
    │   └── index.tsx           # Dil algılama + kalıcı seçim (context)
    ├── data/
    │   ├── types.ts            # Veri modeli
    │   ├── index.ts            # Dile göre veri seçici
    │   ├── checklists.ts       # TR ana kaynak: 10 defter, ~570 madde
    │   └── checklists.{en,de,ru}.ts  # Çeviriler (aynı kimlikler)
    └── screens/
        ├── HomeScreen.tsx      # Tekne seçimi (kiralık / sahip) + dil seçici
        ├── ChecklistScreen.tsx # İşaretlenebilir kontrol listesi
        └── GuideScreen.tsx     # Foto & depozito rehberi
```
