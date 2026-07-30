# Privacy Policy — BoatCheck

_Last updated: 2026-07-30_
_(Türkçe özet en altta. Bu metin yayından önce herkese açık bir URL'de barındırılmalıdır — bkz. CHECKLIST.md.)_

## Summary

BoatCheck is a **local-first** app. Your inspections, trips, photos and shopping lists are stored **only on your device**. We do not operate accounts, we do not run analytics, and we do not upload your data to any server.

## Data we do NOT collect

- No account, name, e-mail or phone number is required or collected.
- No usage analytics or crash tracking.
- **No location data.** Photos taken in the app are saved without EXIF location metadata.
- Inspection records, boat details, trip plans, provisioning lists and photos never leave your device unless **you** share them (e.g. via the system share sheet).

## Data stored on your device

Checklists, trips, boats, meter readings, issues, provisioning lists and photos are stored in a local database and the app's private storage. Deleting a trip removes its data; uninstalling the app removes everything. You can also delete individual photos and items in the app.

## Camera and photos

The camera and photo-library permissions are used solely to attach photos to your own inspection records. Photos are stored locally and are only shared when you choose to share them.

## Advertising (classic checklist mode only)

The optional "classic checklists" section shows advertising served by **Google AdMob**. In that mode Google may process your device's advertising identifier to serve and measure ads, subject to [Google's Privacy Policy](https://policies.google.com/privacy). On iOS, the app asks for tracking permission first; you may decline and the mode still works with non-personalized ads. The professional inspection, trip and provisioning features contain **no advertising** and load no ad code.

## Purchases

The optional ad-free subscription is processed entirely by Apple App Store / Google Play. We receive no payment details.

## Your rights (GDPR/KVKK)

Because your data stays on your device, you exercise access, correction and deletion directly in the app. For any privacy question contact: **fakkaya@gmail.com**.

## Children

BoatCheck is not directed at children under 13 and collects no data from any user.

## Changes

We will update this page when the policy changes and update the date above.

---

## Türkçe Özet

BoatCheck **yerel-öncelikli** bir uygulamadır: denetimler, seferler, fotoğraflar ve listeler **yalnızca cihazınızda** saklanır. Hesap yoktur; analitik yoktur; **konum verisi toplanmaz** (fotoğraflar EXIF konumu olmadan kaydedilir). Veriler yalnızca siz paylaşırsanız cihazdan çıkar. Kamera izni yalnızca kendi denetim kayıtlarınıza fotoğraf eklemek içindir. İsteğe bağlı "klasik listeler" bölümünde Google AdMob reklamları gösterilir (Google'ın gizlilik politikası geçerlidir); profesyonel denetim/sefer/ikmal akışlarında hiçbir reklam yoktur. Abonelik ödemeleri tamamen App Store / Google Play üzerinden işlenir. Sorular için: **fakkaya@gmail.com**.

---

# Mağaza Veri Beyanı Cevapları (dahili rehber — yayınlanmaz)

## Google Play "Data safety" formu

Mevcut yapı (legacy reklamlar AÇIK) için:
- **Veri toplanıyor mu?** Evet → yalnızca **Device or other IDs → Advertising ID**.
  - Toplayan: üçüncü taraf (Google AdMob SDK) · Amaç: Advertising or marketing
  - Paylaşım: Evet (Google ile) · İşlem sırasında şifreli: Evet · Silme talebi: reklam kimliği sıfırlama ile
- Fotoğraflar/denetim verileri **cihaz dışına gönderilmediği için** Play tanımına göre "toplanmıyor" sayılır — beyan edilmez.
- Konum: Toplanmıyor.

**Alternatif (önerilir, karar bekliyor):** `features.legacyChecklists=false` ile ilk sürümü reklamsız çıkmak → form tamamen **"No data collected"** olur; inceleme ve güven açısından çok daha temiz. AdMob SDK binary'de kaldığı sürece Play yine reklam kimliği beyanı isteyebilir — reklamsız çıkılacaksa SDK da build'den çıkarılmalı (app.json'dan plugin'i kaldır + paketi kaldır).

## Apple "App Privacy" bölümü

Mevcut yapı için:
- **Identifiers → Device ID**: Used for Third-Party Advertising · Not linked to identity · Not used for tracking'e "tracking" olarak işaretlenir (ATT istendiği için "used for tracking: YES" seçilir; kullanıcı reddederse kişiselleştirilmemiş reklam).
- Diğer tüm kategoriler: Not collected.
- Reklamsız çıkışta: **"Data Not Collected"** tek satır.

## App Store / Play inceleme notları (Review Notes alanına)

> The app works fully offline without an account. To test: open the app → "Start a Trip" → create a boat → complete a pre-departure checklist section with "No problems found in this section" → open Provisioning to see the generated shopping list. The optional classic-checklist mode (Library tab) shows AdMob test/production ads; the professional flows contain no ads. Subscriptions only remove ads in classic mode.
