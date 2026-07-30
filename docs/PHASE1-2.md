# Faz 1-2 — Trip Merkezli Mimari + İkmal (Provisioning) Motoru

Konumlandırma: *"One app to inspect the boat, prepare the voyage and provision the crew."*
Ürün kod adı **BoatCheck** (`src/config/product.ts` — tek kaynak).

## Mimari kararlar

1. **Trip merkezi varlıktır.** Denetimler (`inspections.trip_id`), ikmal planı, sayaçlar ve
   sorunlar aynı Trip'e bağlanır. Check-in/out `handover_sessions` üzerinden eşleşir (Faz 3'te
   session Trip'e bağlanacak; kolon hazır).
2. **Bilinçli denormalizasyon:** `trips.profile_json` (kullanım profili) ve
   `trips.crew_names_json` JSON snapshot'tır — mobil okuma hızı ve form basitliği için.
   `provision_plans.inputs_json` ve `provision_items.explanation_json` hesap girdilerinin
   kalıcı kanıtıdır ("neden bu miktar" sorusu sonradan yanıtlanabilir).
3. **İkmal kuralları veridir, kod değil:** `provision_rules` tablosu + `RULE_SEEDS` (v1, 22 kural).
   Hesap motoru `src/domain/provisioning.ts` içinde saf fonksiyondur; UI hiçbir miktar kuralı içermez.
4. **Güvenlik kuralları (madde 26):** watermaker içme suyunu yalnızca azaltır (×0.5), asla
   sıfırlamaz ve `emergency_reserve` kategorisine hiç dokunmaz; mağaza erişimi "none" ise rezervli
   kalemler ×1.25; alerjiler ikmal ekranında belirgin bantla gösterilir; tüm miktarlar
   düzenlenebilir ve "tahmin" olarak etiketlenir.
5. **Şablon türleri:** `inspection_templates.kind`
   (charter_check_in | charter_check_out | pre_departure | return_secure); tekne tipi için birebir
   şablon yoksa yelkenliye düşülür (`getBestTemplate`).
6. **Seed versiyonlama:** `seed_versions` tablosu; her seed birimi (5 şablon + kurallar)
   ayrı anahtarla idempotent. Faz 0 şablonu "evlat edinme" ile migre edilir.
7. **Navigasyon:** 5 sekme (Home/Trips/Boats/Library/Profile) + kök stack. Reklam/IAP yalnızca
   legacy modda (Library ve Profile'dan erişilir, feature flag).
8. **Zustand/RHF/i18next eklenmedi:** mevcut Context + kontrollü formlar + kendi i18n çözümümüz
   ihtiyacı karşılıyor; gereksiz bağımlılık eklenmedi (madde 10 mimari kuralı).

## Veri şeması (migration 2 ile eklenenler)

- `trips` — sefer: tip, sahiplik bağlamı, durum (planning|active|completed|archived),
  tarih/rota, mürettebat sayıları, profil JSON
- `provision_rules` — kural motoru varsayılanları (mode, çarpanlar, rezerv, yuvarlama, koşullar)
- `provision_plans` — Trip başına plan + girdi snapshot'ı + kural sürümü
- `provision_items` — kalemler: calculated/final/onboard/purchased miktarları, durum
  (suggested|already_onboard|purchased|packed|skipped), açıklama JSON
- `seed_versions` — versiyonlu seed kaydı
- `vessels` +21 kolon (ownership_type, kapasiteler, ekipman bayrakları, HIN…)
- `inspections.trip_id`, `handover_sessions.trip_id`, `issues.trip_id/source_type`,
  `meter_readings.trip_id/boat_id/reading_stage`, `inspection_templates.kind`

## Şablonlar (seed v1)

| Seed anahtarı | Tür | Madde |
|---|---|---|
| tpl_checkin_sailing | charter_check_in | 106 + 5 sayaç + 9 envanter |
| tpl_predeparture_sailing | pre_departure | 57 + 4 sayaç |
| tpl_predeparture_motor | pre_departure | 55 + 4 sayaç |
| tpl_return_own | return_secure | 22 + 3 sayaç |
| tpl_checkout_charter | charter_check_out | 8 + 3 sayaç |

Pre-departure ve return içerikleri mevcut 5 dilli kütüphaneden (yc-*/kp-* kimlikleri) derlenir.

## Bilinen sınırlar / sonraki faz

- Charter handover (Faz 3): iki taraflı oturum, yan yana foto karşılaştırma, kilitli rapor —
  şema hazır, UI yok. Check-out şablonu ve modül kartı mevcut (temel akış çalışır).
- Sayaç fotoğraf kanıtı MetersView'da henüz bağlanmadı (media_assets.meter_reading_id hazır).
- Envanter sayımı yalnızca check-in şablonunda tanımlı.
- Web'de SQLite yok (COOP/COEP) → sekmeler açılır, veri akışları cihaz gerektirir.
- Kullanılabilir ama emekli edilen dosya yok; `InspectionHomeScreen` TripHome ile değiştirilip
  silindi (işlevi Home sekmesine taşındı).

## Komutlar

```bash
cd marincheck
npm install
npm run typecheck   # tsc --noEmit
npm run lint        # expo lint
npm test            # 4 test paketi (tsx, better-sqlite3 üzerinde gerçek SQLite)
npx expo start      # dev (Expo Go: reklamsız/IAP'siz çalışır)
npx expo run:android|ios  # tam yerel derleme
```

Migration'lar uygulama açılışında otomatik uygulanır (`initDb` → versiyonlu runner);
testlerde tekrar çalıştırılabilirlik doğrulanır (`migrate` iki kez çağrılır).
