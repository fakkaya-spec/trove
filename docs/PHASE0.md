# Faz 0 — Kod Analizi ve Migration Planı

Ürün kod adı: **BoatCheck** (geçici; merkezi config'ten yönetilir, koda dağıtılmaz).
Konumlandırma: *"Digital yacht handover and inspection platform."*

---

## 1. Mevcut Kod Tabanı Analizi

**Yapı:** Expo SDK 57 + TypeScript (strict açık), React Navigation native-stack, tek modül (`src/`).

| Alan | Durum |
|---|---|
| Klasör yapısı | `src/{components,data,i18n,screens}` + kökte tekil modüller (`ads`, `premium`, `storage`, `theme`) |
| Paketler | expo, react-navigation, async-storage, expo-localization, react-native-google-mobile-ads, react-native-iap, safe-area, screens, web |
| Veri modeli | **Statik içerik**, DB yok: `src/data/checklists.{ts,en,de,ru,es}.ts` — 10 "vessel", 545 madde × 5 dil; tipler `src/data/types.ts` |
| Navigasyon | Stack: Home → Checklist(vesselId) / Guide / Premium |
| Checklist yapısı | Vessel → Category → Item (`critical`, `photo`, `tip` bayrakları); madde id'leri 5 dilde birebir aynı (ilerleme dil bağımsız) |
| State yönetimi | Yerel React state + AsyncStorage (`marincheck:v1:<vesselId>` → `{itemId: boolean}`); Context: Locale, Premium |
| Reklam | `src/ads.tsx` (+`.web` stub): AdMob banner her ekranda, interstitial liste bitince; premium'da gizli |
| Auth | Yok (tamamen yerel, hesapsız) |
| PDF / paylaşım | Yok |
| IAP | react-native-iap v15, aylık/yıllık abonelik iskeleti, cihaz-üstü doğrulama |

## 2. Korunacak Özellikler (yeniden yazılmayacak)

- **545 madde × 5 dil içerik kütüphanesi** → Faz 0 şablon seed'inin kaynağı (en değerli varlık).
- i18n altyapısı (`LocaleProvider`, `strings.ts`, cihaz dili algılama, kalıcı seçim).
- Tema/tasarım sistemi (`theme.ts`, `components/ui.tsx`).
- Mevcut checklist tarama modu (Home→Checklist→Guide) **legacy mod** olarak feature flag arkasında aynen çalışmaya devam eder.
- Premium/IAP ve AdMob kodu **yalnızca legacy modda** kalır (kullanıcı/gelir verisi incelenene dek silinmez).

## 3. Teknik Borç Listesi

1. İçerik UI'a değil ama **koda gömülü** (5 ayrı dosyada paralel diller) → şablonlar DB'ye taşınmalı (Faz 0'da seed ile çözülüyor).
2. AsyncStorage'da yalnızca boolean ilerleme; durum ayrımı (unchecked/na/…), medya, zaman damgası yok.
3. `ads.tsx` içindeki AdMob prod kimlikleri placeholder; ads/premium legacy'e hapsedilmeli (Faz 0'da yapılıyor).
4. Test altyapısı yok → Faz 0'da saf domain mantığına node tabanlı test eklenir.
5. `App.tsx` içinde tema+provider+navigasyon iç içe; büyümeden önce ayrıştırılmalı (Faz 0'da hafifçe).
6. Ürün adı ("MarinCheck") string'lere gömülü → merkezi `config/product.ts`'e alınır.
7. IAP cihaz-üstü doğrulama (sunucu makbuz doğrulaması yok) — legacy'de kabul edilir borç, işaretlendi.

## 4. Önerilen Yeni Klasör Yapısı

```
src/
├── config/            product.ts (ürün adı/sloganı — TEK yer), features.ts (feature flag'ler)
├── domain/            types.ts (enum+entity tipleri), inspection.ts (SAF iş kuralları: bulk onay,
│                      bölüm/denetim tamamlanabilirlik, durum geçişleri — React'siz, test edilir)
├── db/                client.ts (expo-sqlite açılış), migrations.ts (versiyonlu SQL runner),
│                      schema.ts (Drizzle tablo tanımları), seed/ (şablon+envanter seed)
├── repositories/      templates.ts, vessels.ts, inspections.ts (item/issue/meter/media dahil)
│                      — UI yalnızca repository çağırır, SQL görmez
├── screens/
│   ├── inspection/    InspectionHomeScreen, NewInspectionScreen, InspectScreen,
│   │                  IssueSheet, MetersPanel, SummaryScreen   ← YENİ akış (reklamsız)
│   └── (mevcut)       HomeScreen→"Checklists" rotası (legacy), ChecklistScreen, Guide, Premium
├── components/, i18n/, data/ (legacy içerik + seed kaynağı), theme.ts  (yerinde kalır)
└── ads/premium/iap    (yerinde kalır; YENİ ekranlara import edilmez)
```

Katman kuralı: **UI → repository → db**; iş kuralları `domain/` içinde saf fonksiyon. React bileşenlerinde SQL ve iş kuralı yok.

## 5. Yerel Veri Tabanı Şeması (SQLite)

Tüm tablolarda: `id TEXT PK (UUID)`, `created_at`, `updated_at`, `deleted_at` (soft delete), sync için hazır.

```
users                 id, display_name, locale                      (Faz 0: tek yerel kullanıcı satırı)
organizations         id, name, plan                                (Faz 0: boş, iskelet)
vessels               id, org_id?, name, type, model?, hull_number?, photo_uri?
inspection_templates  id, org_id?, boat_type, name_json, version, is_active
template_sections     id, template_id, sort, icon, title_json
template_items        id, section_id, sort, title_json, tip_json?, is_critical, requires_photo_on_issue,
                      required, applicable_types, input_kind('status'|'meter'), meter_kind?, safety_note_json?
handover_sessions     id, vessel_id, org_id?, charterer_name?, skipper_name?, starts_at?, ends_at?,
                      checkin_inspection_id?, checkout_inspection_id?, status('open'|'closed')
inspections           id, session_id?, vessel_id, template_id, template_version, kind('check_in'|'check_out'|
                      'periodic'), status('draft'|'in_progress'|'completed'|'awaiting_signature'|'locked'|
                      'synced'|'archived'), locale, started_at, completed_at?, duration_s?, lat?, lng?
inspection_item_results  inspection_id+template_item_id PK, status('unchecked'|'working'|'needs_attention'|
                      'not_working'|'not_applicable'), note?, updated_at
issues                id, inspection_id, template_item_id?, severity('low'|'medium'|'high'|'critical'),
                      title, description?, reported_to_company, company_response?, resolved
media_assets          id, inspection_id, issue_id?, meter_reading_id?, kind('photo'|'video'|'audio'|'signature'),
                      local_uri, sha256?, taken_at, lat?, lng?, upload_state('pending'|'uploaded'|'failed')
meter_readings        id, inspection_id, meter_kind('engine_hours'|'fuel_pct'|'water_pct'|'battery_v'|
                      'generator_hours'|'waste_pct'), value, unit, ocr_value?, ocr_confidence?, confirmed
inventory_items       id, template_id, sort, name_json, expected_count
inventory_counts      inspection_id+inventory_item_id PK, found_count, note?
equipment             id, vessel_id, kind, label?, expires_on?, service_due_hours?        (iskelet)
signatures            id, inspection_id, role, signer_name, media_id, signed_at           (iskelet)
reports               id, inspection_id, content_hash?, pdf_path?, generated_at?          (iskelet)
sync_queue            id, entity, entity_id, op('upsert'|'delete'), payload_json, queued_at, synced_at?
```

Bilinçli sadeleştirmeler: `charters` yerine tek `handover_sessions`; sayaç başlangıç/bitişi ayrı kolon değil — check-in/out inspection'larının `meter_readings`'i üzerinden türetilir (normalizasyon fazlalığı yok).

## 6. Migration Planı

| Adım | İçerik | Risk |
|---|---|---|
| M1 | Bağımlılıklar: `expo-sqlite`, `drizzle-orm`, `expo-crypto`, `expo-image-picker`, `expo-file-system`, `zod` | düşük |
| M2 | `config/product.ts` + `features.ts`; "MarinCheck" sabit metinleri config'e bağlanır; app.json görünen ad "BoatCheck" | düşük |
| M3 | DB katmanı: client + **versiyonlu SQL migration runner** + Drizzle şeması. *(Karar: drizzle-kit yerine elle SQL migration — babel/metro `.sql` import konfigürasyonu gerektirmez, geri dönüşü kolay. Drizzle sadece tip güvenli sorgu için. Vendor lock-in işareti: Drizzle API'si repository katmanının altında kaldığı için değişimi ucuz.)* | orta |
| M4 | Seed: "Sailing Yacht — Charter Check-in" şablonu; 7 bölüm, maddeler **mevcut 5 dilli yelkenli içeriğinden id ile derlenir**; sayaç maddeleri `input_kind=meter`; temel envanter listesi | orta |
| M5 | Domain katmanı: durum makineleri + istisna-bazlı onay kuralları (saf fonksiyon + test) | düşük |
| M6 | Repository katmanı | düşük |
| M7 | Yeni ekranlar (inspection akışı), navigasyon: Home=InspectionHome; legacy mod "Checklists" rotası feature flag arkasında | orta |
| M8 | Doğrulama: `tsc`, domain testleri, web smoke test *(risk: expo-sqlite web desteği; çalışmazsa doğrulama tsc+test+cihaz notuyla sınırlanır)* | orta |

## 7. Faz 0'da Değişecek Dosyalar

- **Değişir:** `App.tsx` (yeni rotalar, DB açılış/seed), `src/navigation.ts`, `src/i18n/strings.ts` (+~30 anahtar ×5 dil), `src/screens/HomeScreen.tsx` (yalnızca başlıkta config kullanımı; rota adı "Checklists"), `app.json` (ad), `package.json`.
- **Eklenir:** `src/config/*`, `src/domain/*`, `src/db/*`, `src/repositories/*`, `src/screens/inspection/*`, `tests/domain.test.ts`, bu doküman.
- **Silinmez:** hiçbir mevcut dosya. Reklam/premium/iap yeni akışa import edilmez.

## 8. Riskler

1. **expo-sqlite web'de** wasm konfigürasyon isteyebilir → web smoke test başarısız olursa cihaz/emülatör doğrulaması gerekir; akışın tamamı tsc+saf test ile güvence altına alınır. (En kötü durumda bile native derleme etkilenmez.)
2. **Seed ↔ legacy içerik bağı:** seed, `src/data/checklists.*.ts` dosyalarından derlenir; legacy dosyalarda id değişirse seed bozulur → seed derleme anında id bulunamazsa hata fırlatır (sessiz bozulma yok).
3. **Çift ilerleme modeli** (legacy AsyncStorage + yeni SQLite) geçiş döneminde birlikte yaşar — bilinçli; legacy mod kaldırılınca AsyncStorage kodu da emekli edilir.
4. **Şablon çok dilli JSON kolonları** (title_json) sorgulanamaz metin taşır — Faz 0 için doğru ödünleşim; sunucu tarafında Postgres'e taşınırken jsonb olur.
5. Media (foto) kopyalama düşük cihazlarda gecikebilir → kopyalama async, UI bloklamaz, `upload_state` makinesi hazır.

## 9. Faz 0 Kabul Kriterleri

Kullanıcı sırasıyla şunları yapabilmeli (hepsi çevrimdışı, hesapsız):

1. Yeni inspection başlatır (tekne adı+tipi girerek veya kayıtlı tekne seçerek).
2. Şablon otomatik seçilir (Sailing Yacht — Charter Check-in) ve onaylar.
3. 7 bölüm arasında çiplerle ilerler.
4. Bir bölümü "Bu bölümde sorun yok" ile topluca onaylar → bölümün **kritik olmayan** unchecked maddeleri `working` olur; **kritik maddeler toplu onayın dışında kalır**, tek tek onay ister.
5. Herhangi bir maddeyi `needs_attention` / `not_working` / `not_applicable` işaretler; toplu onay sonrası da tek tek değiştirebilir.
6. Sorunlu maddede bottom sheet: açıklama, önem derecesi, fotoğraf, "firmaya bildirildi" ve "giderildi" işaretleri.
7. Sayaç panelinde motor saati, yakıt %, su %, akü V (+jeneratör saati) girer; isterse gösterge fotoğrafı ekler.
8. Uygulamayı kapatıp açınca Home'da taslağı görür, kaldığı bölümden devam eder (her dokunuş anında DB'ye yazılır — ayrı "kaydet" yoktur).
9. Tüm kritik maddeler işaretlenmeden "Tamamla" engellenir ve eksik kritikler açıkça listelenir; kritikler tamamsa unchecked kalanlar uyarıyla geçilebilir.
10. Tamamlanan inspection'ın yerel özetini görür: durum sayıları, sorun listesi, sayaç değerleri, süre.

PDF, imza ve bulut senkronu Faz 0'da **yok** (iskelet tabloları hazır).

## 10. Faz 0 Sonu Kullanıcı Akışı (net tarif)

> Kullanıcı uygulamayı açar → **BoatCheck** ana ekranı: "Yeni Denetim" düğmesi, devam eden denetim kartları, (flag açıksa) "Kontrol Listeleri (eski mod)" bağlantısı. → "Yeni Denetim" → tekne adı + tip girer (veya listeden seçer) → şablon onayı → Denetim ekranı: üstte 7 bölüm çipi, altta madde listesi; her madde `unchecked` başlar. Sorunsuz bölümde tek dokunuş "Sorun yok" → kritik olmayanlar toplanır, kritikler tek tek sorulur. Sorunlu maddeye dokunur → durum seçer → sheet açılır → not + foto + önem → kaydeder; madde kırmızı/amber rozetle listeye döner, kritik ❌ ise güvenlik uyarısı bandı görünür. → "Sayaçlar" çipi → değerleri girer. → "Özet" → eksik kritik yoksa "Denetimi Tamamla" → özet ekranı (sayılar, sorunlar, sayaçlar). Uygulama herhangi bir anda kapatılıp açılsa aynı noktadan sürer. Yeni akışın hiçbir ekranında reklam yoktur.
```
