import { Category, ChecklistItem, Vessel } from "./types";

// ---------------------------------------------------------------------------
// Madde fabrikası: kısa yazım için. id'ler kategori kurulurken atanır.
// ---------------------------------------------------------------------------
type ItemDraft = Omit<ChecklistItem, "id">;

function i(text: string, opts?: Partial<Omit<ItemDraft, "text">>): ItemDraft {
  return { text, ...opts };
}

function cat(id: string, title: string, icon: string, drafts: ItemDraft[]): Category {
  return {
    id,
    title,
    icon,
    items: drafts.map((d, idx) => ({ ...d, id: `${id}-${idx}` })),
  };
}

// ---------------------------------------------------------------------------
// Ortak kategori blokları (büyük tekneler için)
// ---------------------------------------------------------------------------

const evrak = (id: string): Category =>
  cat(id, "Evrak & Sözleşme", "📜", [
    i("Kiralama sözleşmesini satır satır oku, imzalamadan önce", { critical: true }),
    i("Depozito tutarı, iade koşulları ve muafiyet (franchise) netleşti"),
    i("Tekne ruhsatı / bağlama kütüğü belgesi teknede mevcut"),
    i("Sigorta poliçesi ve kapsamı görüldü (üçüncü şahıs + kasko)", { critical: true }),
    i("Kaptan ehliyeti / ICC belgesi kabul edildi, kayda geçti"),
    i("Envanter listesi tek tek sayılarak imzalandı", { photo: true, tip: "İade sırasında eksik çıkan her kalem depozitodan kesilir." }),
    i("Mevcut hasarlar check-in formuna yazıldı ve fotoğraflandı", { critical: true, photo: true }),
    i("Yakıt ve su politikası netleşti (dolu al / dolu bırak?)"),
    i("Acil durum telefonları kaydedildi (işletme, marina, sahil güvenlik 158)"),
    i("İade saati, yeri ve gecikme cezası netleşti"),
  ]);

const govde = (id: string, extra: ItemDraft[] = []): Category =>
  cat(id, "Gövde & Dış Aksam", "🛥️", [
    i("Gövdeyi çepeçevre dolaş: çizik, çatlak, jelkot hasarı fotoğrafla", { critical: true, photo: true, tip: "En çok ihtilaf çıkan konu gövde çizikleridir. Videoyla tur atmak en garantisi." }),
    i("Baş ve kıç bodoslamada çarpma izi var mı bak", { photo: true }),
    i("Vardevele telleri gergin, deliksiz; pulpit ve pushpit sağlam"),
    i("Güverte kaymaz yüzeyi ve teak'te hasar var mı", { photo: true }),
    i("Koçboynuzları (kleat) ve mapalar sağlam"),
    i("Ambar kapakları ve lombozlar açılıp kapanıyor, camlarda çatlak yok", { photo: true, tip: "Çatlak lomboz camı klasik bir depozito kesintisidir." }),
    i("Seyir fenerleri çalışıyor (yeşil/kırmızı/pupa/silyon)", { critical: true }),
    i("Dümen boşluğu kontrol edildi, dümen dolaşımı rahat"),
    i("Merdiven / platform mekanizması çalışıyor"),
    ...extra,
  ]);

const motorBlok = (id: string, opts?: { cift?: boolean }): Category =>
  cat(id, "Motor & Makine", "⚙️", [
    i(`Motor saatini fotoğrafla ve forma yazdır${opts?.cift ? " (her iki motor)" : ""}`, { photo: true }),
    i("Yağ seviyesi çubukla kontrol edildi", { critical: true }),
    i("Soğutma suyu / antifriz seviyesi kontrol edildi"),
    i("Kayışlar gergin, çatlaksız"),
    i("Deniz suyu filtresi temiz, kapağı sızdırmıyor"),
    i("Motor çalıştırıldı: egzozdan su atıyor mu bak", { critical: true, tip: "Su atmıyorsa impeller arızalı olabilir; motor kısa sürede ısınır." }),
    i("Rölantide ve gazda anormal ses/titreşim yok"),
    i("Yakıt seviyesi göstergesi fotoğraflandı", { photo: true }),
    i("Motor kaputu altında yakıt/yağ kaçağı izi yok"),
    i("Sintine kuru; otomatik ve manuel sintine pompaları test edildi", { critical: true }),
    i("Vites ileri/geri/boş geçişleri yumuşak"),
    i("Gösterge paneli alarmsız (yağ basıncı, hararet, şarj)"),
    i("Yedek parça ve alet çantasının yeri öğrenildi (impeller, kayış, sigorta)"),
    i("Seyir devri, saatlik tüketim ve depo kapasitesi not edildi", { tip: "Menzil hesabı için: depo (lt) ÷ tüketim (lt/saat) × sürat." }),
  ]);

// En çok ihtilaf çıkan bölüm: tender (bot) ve dıştan takma motoru.
// Bareboat sigorta taleplerinin 1 numarası botun/motorun kaybı ve pervane hasarı.
const tender = (id: string): Category =>
  cat(id, "Tender & Dıştan Takma", "🚣", [
    i("Bot şişik ve sağlam; tüpler ve taban fotoğraflandı", { photo: true }),
    i("Dıştan takma motor çalıştırıldı, soğutma suyu fışkırıyor", { critical: true }),
    i("Dıştan takma pervanesi yakın plan fotoğraflandı", { critical: true, photo: true, tip: "Pervane hasarı, iade sırasında en sık suçlanan kalemdir." }),
    i("Kill cord (öldürme kordonu) botta ve çalışıyor", { critical: true }),
    i("Kürekler, pompa, parima halatı ve kilit teli botta"),
    i("Motor bota kilitli, emniyet halatı bağlı", { tip: "Motorun denize düşmesi en yaygın bareboat sigorta talebidir." }),
    i("Bot mataforası / kaldırma sistemi gösterildi"),
  ]);

const elektrik = (id: string, extra: ItemDraft[] = []): Category =>
  cat(id, "Elektrik & Navigasyon", "🧭", [
    i("Akü voltajları kontrol edildi (servis + motor aküsü ayrı mı?)"),
    i("Aküler motor çalışırken şarj oluyor (voltaj yükseliyor)"),
    i("GPS / harita plotter açılıyor, güncel harita yüklü", { critical: true }),
    i("Derinlik göstergesi çalışıyor ve makul değer veriyor", { critical: true, tip: "Salmadan mı su hattından mı ölçtüğünü mutlaka sor." }),
    i("VHF telsiz testi yapıldı (Kanal 16 dinleme + telsiz kontrolü)", { critical: true, tip: "Acil durumda tek güvenilir iletişim aracınız VHF'tir." }),
    i("Otopilot devreye girip yön tutuyor"),
    i("İç aydınlatma ve okuma lambaları çalışıyor"),
    i("12V / USB prizler ve varsa invertör (220V) çalışıyor"),
    i("Sahil elektriği kablosu ve şarj cihazı teknede"),
    i("Korna / sis düdüğü çalışıyor"),
    ...extra,
  ]);

const yelkenArma = (id: string): Category =>
  cat(id, "Yelken & Arma", "⛵", [
    i("Ana yelken açılıp kapatıldı: yırtık, dikiş atması, UV hasarı yok", { photo: true }),
    i("Cenova/flok sarma (furling) sistemi rahat dönüyor", { tip: "Sarma sistemi tutukluk yapıyorsa denizde yelken toplamak kabusa döner." }),
    i("Mandarlar (ana, cenova, balon) sağlam ve makaralarda"),
    i("Iskotalar ve halatlar yıpranmamış, uçları sağlam"),
    i("Vinçler dönüyor, kilitleri tutuyor; vinç kolları sayıldı (en az 2)"),
    i("Camadan (reef) sistemi tanıtıldı ve çalışıyor", { critical: true, tip: "Sert havada camadan alamamak en büyük risklerden." }),
    i("Çarmıhlar, ıstralyalar gergin; liftin uskurları emniyetli"),
    i("Bumba, vang ve mapalar sağlam; bumba boşluğu normal"),
    i("Stoperler (jammer) tutuyor, etiketleri okunuyor"),
    i("Lazy-jack / lazy-bag fermuarı ve dikişleri sağlam"),
  ]);

const guvenlik = (id: string, extra: ItemDraft[] = []): Category =>
  cat(id, "Güvenlik Ekipmanı", "🛟", [
    i("Kişi sayısı kadar can yeleği (çocuklar için çocuk boyu)", { critical: true }),
    i("Can salı yerinde, sertifika/revizyon tarihi geçerli", { critical: true, photo: true, tip: "Tarihi geçmiş can salı denizde açılmayabilir. Etiketi fotoğrafla." }),
    i("Can simidi + ışıklı şamandıra kokpitten erişilebilir", { critical: true }),
    i("İşaret fişekleri tam ve son kullanma tarihi geçerli", { critical: true, photo: true }),
    i("Yangın söndürücüler: adet, basınç ibresi yeşil, tarihleri geçerli", { critical: true, photo: true }),
    i("Yangın battaniyesi mutfakta"),
    i("İlk yardım çantası tam ve güncel"),
    i("EPIRB / PLB varsa test düğmesiyle kontrol edildi"),
    i("El feneri + yedek piller"),
    i("Emniyet kemerleri (harness) ve yaşam hatları (jackline)"),
    i("Acil dümen yekesi yeri gösterildi, takılıp denendi", { critical: true }),
    i("Kinistin (deniz suyu vanaları) yerleri ve tahta tapalar gösterildi", { critical: true }),
    i("Gaz dedektörü / alarmı çalışıyor"),
    ...extra,
  ]);

const demirPalamar = (id: string): Category =>
  cat(id, "Demir & Palamar", "⚓", [
    i("Ana demir ve zincir uzunluğu öğrenildi (kaç metre?)", { tip: "Demirleme derinliğin en az 3-5 katı kaloma gerektirir." }),
    i("Irgat (çapa vinci) indirip kaldırıyor; uzaktan kumandası çalışıyor", { critical: true }),
    i("Zincir bağlantısı ve zincir kilidi kontrol edildi"),
    i("Yedek demir ve halatı teknede"),
    i("Usturmaçalar sayıldı ve durumu iyi (en az 6 adet)", { photo: true }),
    i("Palamar halatları yeterli (4-6 adet, yıpranmamış)"),
    i("Kıçtankara için uzun halat (~50 m) teknede", { tip: "Akdeniz'de koylara kıçtankara bağlamak için şarttır." }),
    i("Tonoz/şamandıra kancası (boat hook) teknede"),
  ]);

const suTesisat = (id: string): Category =>
  cat(id, "Su & Sıhhi Tesisat", "🚿", [
    i("Tatlı su tankları dolu; kapasite öğrenildi", { photo: true }),
    i("Hidrofor çalışıyor, musluklardan düzenli su geliyor"),
    i("Sıcak su (boyler) motor çalışınca/elektrikle ısıtıyor"),
    i("Tuvaletler (WC) pompa/vakum testi yapıldı", { critical: true, tip: "Tıkalı tuvalet tatili zehir eder; her kabini tek tek dene." }),
    i("Pis su (siyah su) tankı boş; tahliye vanası gösterildi"),
    i("Duşlar ve duş tahliye pompaları çalışıyor"),
    i("Güverte duşu çalışıyor"),
    i("Su kaçağı izi var mı: dolap dipleri, tank çevresi kuru"),
  ]);

const mutfakYasam = (id: string, extra: ItemDraft[] = []): Category =>
  cat(id, "Mutfak & Yaşam Alanı", "🍳", [
    i("Ocak/fırın yakıldı; tüp doluluk ve yedek tüp kontrol edildi", { critical: true }),
    i("Gaz vanası yeri gösterildi; hortum ve kelepçeler sağlam", { critical: true }),
    i("Buzdolabı soğutuyor (teslimden önce açtırıp bekle)"),
    i("Tencere, tabak, çatal-bıçak envanterle eşleşiyor"),
    i("Nevresim, çarşaf, havlu kişi sayısınca teslim alındı"),
    i("Kamaralar, döşemeler, minderler: leke/yırtık fotoğrafla", { photo: true }),
    i("Kapı, dolap kilitleri ve menteşeler çalışıyor"),
    i("Bimini ve sprayhood sağlam, fermuarları çalışıyor", { photo: true }),
    i("Kokpit masası ve minderleri tam"),
    i("Sineklikler ve kapı/ambar contaları sağlam"),
    ...extra,
  ]);

const sonKontrol = (id: string, extra: ItemDraft[] = []): Category =>
  cat(id, "Teslim Öncesi Son Adımlar", "✅", [
    i("Tüm tekneyi video ile turlayarak kaydet (tarih görünsün)", { critical: true, photo: true }),
    i("Yakıt, su seviyesi ve motor saati forma yazıldı", { photo: true }),
    i("Teknik brifingi telefonla videoya çek (özellikle elektrik paneli)", { tip: "ASA'nın 1 numaralı tavsiyesi: brifingi kaydet, sonra hatırlamak imkansız." }),
    i("Brifing alındı: marina çıkışı, yasak bölgeler, hava durumu"),
    i("Arıza durumunda kimi arayacağın ve müdahale süreci öğrenildi"),
    i("Demirleme yerleri ve rota önerileri soruldu"),
    i("İade prosedürü netleşti (dalgıç kontrolü var mı?)"),
    i("Check-in formunun bir kopyası sende kaldı", { critical: true }),
    ...extra,
  ]);

// ---------------------------------------------------------------------------
// TEKNE TİPLERİ
// ---------------------------------------------------------------------------

const yelkenli: Vessel = {
  id: "yelkenli",
  name: "Yelkenli",
  subtitle: "Bareboat yelkenli kiralaması",
  icon: "⛵",
  duration: "60-90 dk",
  group: "kiralik",
  categories: [
    evrak("ye-evrak"),
    govde("ye-govde"),
    motorBlok("ye-motor"),
    elektrik("ye-elektrik", [i("Rüzgar göstergesi (anemometre) çalışıyor")]),
    yelkenArma("ye-yelken"),
    guvenlik("ye-guvenlik", [i("Radar reflektörü direkte asılı")]),
    demirPalamar("ye-demir"),
    tender("ye-tender"),
    suTesisat("ye-su"),
    mutfakYasam("ye-mutfak"),
    sonKontrol("ye-son"),
  ],
};

const motoryat: Vessel = {
  id: "motoryat",
  name: "Motoryat",
  subtitle: "Motorlu yat / flybridge",
  icon: "🛥️",
  duration: "45-75 dk",
  group: "kiralik",
  categories: [
    evrak("mo-evrak"),
    govde("mo-govde", [
      i("Flybridge merdiveni ve korkulukları sağlam"),
      i("Trim flapları (tab) çalışıyor"),
      i("Hidrolik platform / pasarella çalışıyor"),
    ]),
    motorBlok("mo-motor", { cift: true }),
    cat("mo-jenerator", "Jeneratör & Konfor", "🔌", [
      i("Jeneratör çalıştırıldı, yük altında denendi (klima + boyler açıkken)"),
      i("Klima her kabinde soğutuyor/ısıtıyor"),
      i("Baş/kıç itici (bow thruster) test edildi", { critical: true }),
      i("Yakıt su ayırıcı filtre (Racor) kabı temiz, yeri öğrenildi"),
      i("Ön cam silecekleri ve yıkama suyu çalışıyor"),
      i("Projektör / arama ışığı varsa çalışıyor"),
      i("Tatlı su yapıcı (watermaker) varsa kullanımı öğrenildi"),
    ]),
    elektrik("mo-elektrik", [i("Radar açılıyor ve görüntü veriyor")]),
    guvenlik("mo-guvenlik", [
      i("Makine dairesi otomatik yangın söndürme sistemi ibresi yeşil", { critical: true }),
    ]),
    demirPalamar("mo-demir"),
    tender("mo-tender"),
    suTesisat("mo-su"),
    mutfakYasam("mo-mutfak"),
    sonKontrol("mo-son"),
  ],
};

const katamaran: Vessel = {
  id: "katamaran",
  name: "Katamaran",
  subtitle: "Çift gövdeli yelkenli",
  icon: "⛵",
  duration: "75-100 dk",
  group: "kiralik",
  categories: [
    evrak("ka-evrak"),
    govde("ka-govde", [
      i("Her iki gövdeyi ayrı ayrı turla, dört 'köşeyi' fotoğrafla", { photo: true, tip: "Katamaranlar en çok köşelerden iskele hasarı alır." }),
      i("Trambolin ağı ve bağlantıları sağlam, fotoğraflandı", { critical: true, photo: true }),
      i("Köprü altı (bridgedeck) çarpma/slamming izi var mı"),
      i("Gövde içi kaçış ambarları (escape hatch) açılıyor ve sızdırmıyor", { critical: true }),
    ]),
    motorBlok("ka-motor", { cift: true }),
    elektrik("ka-elektrik", [
      i("Her iki gövdedeki akü grupları kontrol edildi"),
      i("Güneş panelleri şarj veriyor"),
    ]),
    yelkenArma("ka-yelken"),
    guvenlik("ka-guvenlik", [
      i("İki gövdedeki sintine pompaları ayrı ayrı test edildi", { critical: true }),
      i("Can salının yeri soruldu (trambolin altı mı, kıç mı?)", { critical: true }),
    ]),
    demirPalamar("ka-demir"),
    cat("ka-bridle", "Katamarana Özel", "🪢", [
      i("Demir bridle'ı (çatal palamar) teknede ve kullanımı gösterildi", { critical: true, tip: "Katamaranda bridle olmadan demirde yatmak zincire zarar verir." }),
      i("Bot mataforası (davit) kaldır/indir gösterildi"),
      i("Elektrikli vinç kullanımı ve manuel alternatifi öğrenildi"),
      i("Çift motorla dümensiz manevra brifingi alındı"),
      i("Camadan brifingi alındı: katamaran yatmaz, arma yükü artar", { critical: true, tip: "Katamaran krengelmediği için aşırı yükü fark etmek zordur; erken camadan şart." }),
    ]),
    tender("ka-tender"),
    suTesisat("ka-su"),
    mutfakYasam("ka-mutfak"),
    sonKontrol("ka-son", [i("Marina/geçiş yüksekliği ve genişlik kısıtları soruldu (geniş tekne!)")]),
  ],
};

const gulet: Vessel = {
  id: "gulet",
  name: "Gulet",
  subtitle: "Mürettebatlı mavi yolculuk",
  icon: "⚓",
  duration: "30-45 dk",
  group: "kiralik",
  categories: [
    cat("gu-evrak", "Sözleşme & Kapsam", "📜", [
      i("Sözleşmede rota, gece sayısı ve limanlar yazıyor", { critical: true }),
      i("Yemek planı (tam pansiyon / yarım) ve içecek politikası net"),
      i("Mürettebat sayısı ve görevleri öğrenildi"),
      i("Yakıt, liman ücretleri, transitlog kime ait, netleşti"),
      i("APA / ekstra masa avansı koşulları anlaşıldı"),
      i("Mürettebat bahşişi geleneği öğrenildi (genelde %5-10)"),
      i("Sigorta ve yolcu kapasitesi belgesi görüldü", { critical: true }),
    ]),
    cat("gu-kamara", "Kamara & Konfor", "🛏️", [
      i("Kamaralar gezildi: yatak, klima, banyo çalışıyor"),
      i("Klima ve jeneratör çalışma saatleri yazılı olarak alındı", { tip: "Birçok gulet klimayı günde birkaç saat çalıştırır; sözde kalmasın." }),
      i("Sözleşmede vaat edilen deniz oyuncakları gerçekten teknede", { photo: true }),
      i("Nevresim ve havlular temiz, kişi başı yeterli"),
      i("Sıcak su tüm banyolarda akıyor"),
      i("Güneşlenme minderleri ve gölgelikler tam", { photo: true }),
      i("Jeneratör saatleri öğrenildi (gece çalışıyor mu?)"),
    ]),
    cat("gu-guvenlik", "Güvenlik", "🛟", [
      i("Can yelekleri gösterildi (çocuk boyu dahil)", { critical: true }),
      i("Can salı ve toplanma yeri brifingi alındı", { critical: true }),
      i("Yangın söndürücüler ve kaçış yolları gösterildi", { critical: true }),
      i("İlk yardım çantası ve en yakın sağlık noktası öğrenildi"),
      i("Tender/bot ile karaya çıkış kuralları öğrenildi"),
    ]),
    cat("gu-son", "Yola Çıkmadan", "✅", [
      i("Ortak alanlar fotoğraflandı (mevcut hasarlar)", { photo: true }),
      i("Rota ve hava durumu kaptanla konuşuldu"),
      i("Deniz oyuncakları (SUP, şnorkel) envanteri alındı"),
      i("İletişim: teknede telefon/wifi var mı, acil numaralar kayıtlı"),
    ]),
  ],
};

const suratTeknesi: Vessel = {
  id: "surat",
  name: "Sürat Teknesi",
  subtitle: "Günlük motorlu tekne",
  icon: "🚤",
  duration: "15-25 dk",
  group: "kiralik",
  categories: [
    cat("su-evrak", "Evrak & Teslim", "📜", [
      i("Sözleşme ve depozito koşulları okundu", { critical: true }),
      i("Ehliyet gereksinimi karşılandı (ADB/ICC)"),
      i("Mevcut çizikler ve hasarlar fotoğraflandı", { critical: true, photo: true }),
      i("Yakıt politikası net (saatlik mi, depo mu?)"),
      i("İade saati ve bölge sınırları öğrenildi"),
    ]),
    cat("su-govde", "Gövde & Motor", "⚙️", [
      i("Gövde ve karina çizikleri fotoğraflandı", { photo: true }),
      i("Pervane hasarı kontrol edildi (bükük kanat?)", { critical: true, photo: true }),
      i("Motor soğuk çalıştırıldı, su fışkırtıyor (telltale)", { critical: true }),
      i("Kill switch (öldürme anahtarı) kordonu takılı ve çalışıyor", { critical: true, tip: "Denize düşerseniz motoru durduran tek şey budur." }),
      i("Trim/tilt çalışıyor"),
      i("Yakıt seviyesi fotoğraflandı", { photo: true }),
      i("Sintine otomatiği çalışıyor, tekne içi kuru"),
      i("Kıç tapası (drain plug) TAKILI", { critical: true, tip: "Takılı değilse tekne yavaş yavaş su alır — klasik ve tehlikeli bir unutma." }),
      i("Dümen ve gaz kolu boşluksuz çalışıyor"),
      i("Döşeme ve minderlerdeki yırtık/lekeler fotoğraflandı", { photo: true }),
    ]),
    cat("su-guvenlik", "Güvenlik", "🛟", [
      i("Kişi sayısınca can yeleği (çocuk boyu dahil)", { critical: true }),
      i("Yangın söndürücü basınçlı ve geçerli", { critical: true }),
      i("Çapa + halat teknede ve tekneye bağlı"),
      i("Atılabilir can simidi / yüzer halat teknede"),
      i("Usturmaçalar yeterli"),
      i("Seyir fenerleri çalışıyor (gün batımı sonrası için)"),
      i("Kürek / manuel pompa teknede"),
      i("Telefon için su geçirmez kılıf / VHF var mı"),
    ]),
    cat("su-son", "Çıkış Öncesi", "✅", [
      i("Yasak/yüzücü bölgeleri ve hız limitleri öğrenildi", { critical: true }),
      i("Hava durumu ve rüzgar tahminine bakıldı; hangi rüzgarda dönmeli soruldu"),
      i("Karaya/plaja bindirme (beaching) yasağı var mı öğrenildi", { tip: "Karina sürtmesi depozitoyu götüren bir numaralı sebeplerdendir." }),
      i("Sığlıklar, kayalıklar ve feribot rotaları haritada gösterildi"),
      i("Acil durum numarası kaydedildi (Sahil Güvenlik 158)"),
      i("Kısa deneme turu işletme temsilcisiyle yapıldı"),
    ]),
  ],
};

const jetski: Vessel = {
  id: "jetski",
  name: "Jet Ski",
  subtitle: "Kişisel deniz aracı",
  icon: "🌊",
  duration: "10-15 dk",
  group: "kiralik",
  categories: [
    cat("je-evrak", "Evrak & Teslim", "📜", [
      i("Sözleşme, depozito ve saat ücreti net", { critical: true }),
      i("Gövdedeki tüm çizikler videoya alındı", { critical: true, photo: true }),
      i("Motor saati / benzin seviyesi fotoğraflandı", { photo: true }),
      i("Kullanım bölgesi haritada gösterildi"),
    ]),
    cat("je-teknik", "Teknik Kontrol", "⚙️", [
      i("Kill cord (güvenlik ipi) bileğe takıldı, test edildi", { critical: true }),
      i("Marş basıyor, motor düzgün rölantide"),
      i("Jet nozülü, emiş ızgarası ve ride plate fotoğraflandı", { photo: true, tip: "Alttaki taş/kaya hasarı en sık ihtilaf konusudur." }),
      i("Direksiyon boşluksuz, sağa-sola sonuna kadar dönüyor"),
      i("Gaz bırakınca kendiliğinden rölantiye dönüyor", { critical: true }),
      i("Geri vites / fren (iBR-RiDE) varsa çalışıyor"),
      i("Aynalar sağlam (çekme sporları için zorunlu olabilir)"),
      i("Torpido gözü kapanıyor, ruhsat su geçirmez kılıfta içinde"),
    ]),
    cat("je-guvenlik", "Güvenlik", "🛟", [
      i("Can yeleği bedene uygun ve sağlam", { critical: true }),
      i("Düdük veya sinyal aracı yelekte"),
      i("Yüzücü alanlarından uzak durma kuralı anlaşıldı", { critical: true }),
      i("Devrilince düzeltme yönü öğrenildi (etikete bak)", { tip: "Yanlış yöne çevirirsen motora su kaçar." }),
      i("Asgari yaş/ehliyet koşulları karşılandı"),
    ]),
  ],
};

const kanoSup: Vessel = {
  id: "kanosup",
  name: "Kano / SUP",
  subtitle: "Kürekli araçlar",
  icon: "🛶",
  duration: "5-10 dk",
  group: "kiralik",
  categories: [
    cat("kn-teslim", "Teslim", "📜", [
      i("Gövdede çatlak/delik var mı kontrol et", { photo: true }),
      i("SUP ise hava basıncı yeterli (sertliğini kontrol et)"),
      i("Kürek sağlam, ayarlanabilir kilit çalışıyor"),
      i("Leash (bağlantı ipi) sağlam", { critical: true }),
    ]),
    cat("kn-guvenlik", "Güvenlik", "🛟", [
      i("Can yeleği alındı ve giyildi", { critical: true }),
      i("Rüzgar yönü ve akıntı soruldu (kıyıdan esen rüzgara dikkat!)", { critical: true, tip: "Kıyıdan esen rüzgar seni açığa sürükler; dönüş çok zorlaşır." }),
      i("İzinli alan ve dönüş saati net"),
      i("Telefon su geçirmez kılıfta yanında"),
    ]),
  ],
};

// ---------------------------------------------------------------------------
// TEKNE SAHİBİ LİSTELERİ — kendi teknen için rutin kontroller
// ---------------------------------------------------------------------------

const sahipYolaCikis: Vessel = {
  id: "sahip-yolacikis",
  name: "Yola Çıkış Kontrolü",
  subtitle: "Her seyirden önce (pre-departure)",
  icon: "🧭",
  duration: "30-45 dk",
  group: "sahip",
  categories: [
    cat("yc-plan", "Plan & Hava", "🌤️", [
      i("Hava tahmini kontrol edildi: rüzgar, hamle, dalga, görüş", { critical: true, tip: "Tek kaynağa güvenme; en az iki tahmin kaynağına bak." }),
      i("Denizcilere ilanlar / bölgesel uyarılar kontrol edildi"),
      i("Rota planlandı: mesafe, süre, yakıt ihtiyacı hesaplandı"),
      i("Sığınılacak alternatif liman/koylar belirlendi"),
      i("Seyir planı karadaki birine bildirildi (float plan)", { critical: true, tip: "Nereye gittiğini ve dönüş saatini bilen biri olsun; gecikince arasın." }),
      i("Gün ışığı yeterli mi — varışta hava kararmayacak"),
      i("Gelgit/akıntı bilgisi kontrol edildi (gerekliyse)"),
    ]),
    cat("yc-evrak", "Evrak", "📜", [
      i("Tekne ruhsatı / bağlama kütüğü belgesi teknede"),
      i("Sigorta poliçesi geçerli ve teknede"),
      i("Ehliyet (ADB/ICC) yanında"),
      i("Mürettebat/yolcu listesi hazır (gerekliyse)"),
      i("Telsiz ruhsatı teknede"),
    ]),
    cat("yc-motor", "Motor (WOBBLE Kontrolü)", "⚙️", [
      i("W — Su: soğutma suyu seviyesi + deniz suyu filtresi temiz", { critical: true }),
      i("O — Yağ: motor ve şanzıman yağ seviyeleri çubukla bakıldı", { critical: true }),
      i("B — Kayışlar: gerginlik ~1,5 cm esneme, çatlak yok"),
      i("B — Sintine: kuru; pompa otomatiği çalışıyor", { critical: true }),
      i("L — Kaçak: motor altında yağ/yakıt/su izi yok"),
      i("E — Egzoz: motor çalışınca egzozdan su atıyor", { critical: true }),
      i("S — Ses: rölantide anormal ses/titreşim yok"),
      i("Yakıt 1/3 kuralına göre yeterli (gidiş + dönüş + yedek)", { critical: true }),
      i("Yakıt su ayırıcı (Racor) kabında su/tortu yok"),
      i("Yedek impeller, kayış, yağ ve alet çantası teknede"),
      i("Soğutma suyu kinistini AÇIK", { critical: true, tip: "Kapalı kinistinle çalışan motor birkaç dakikada impeller yakar." }),
    ]),
    cat("yc-elektrik", "Elektrik & Cihazlar", "🔋", [
      i("Akü voltajları tam, şalterler doğru konumda"),
      i("VHF açık, Kanal 16'da; telsiz kontrolü yapıldı", { critical: true }),
      i("Plotter açık, rota yüklendi; telefonda yedek navigasyon var"),
      i("Seyir fenerleri çalışıyor (gece dönüş ihtimaline karşı)"),
      i("Otopilot test edildi"),
      i("Telefonlar şarjda, powerbank dolu"),
      i("Sahil elektriği kablosu SÖKÜLDÜ", { critical: true, tip: "Kabloyla kalkış her marinada görülen klasik kazadır." }),
    ]),
    cat("yc-guverte", "Güverte & Arma", "⛵", [
      i("Yelkenler seyre hazır, camadan donanımı takılı"),
      i("Halatlar neta, mandarlar direğe vurmuyor"),
      i("Demir kilitli ve ırgat devresi açık; demir hazır"),
      i("Ambar kapakları ve lombozlar kapalı, kilitli", { critical: true }),
      i("Güvertede serbest eşya yok; her şey bağlı/istiflenmiş"),
      i("Usturmaçalar ve palamarlar kalkışa hazır düzende"),
      i("Tender bağlı/mataforada emniyette; motoru kilitli"),
    ]),
    cat("yc-emniyet", "Emniyet", "🛟", [
      i("Can yelekleri kişi başı hazır; çocuklara giydirildi", { critical: true }),
      i("Can salı yerinde, hidrostatik kilit kurulu"),
      i("İşaret fişekleri ve söndürücüler yerlerinde, tarihleri geçerli", { critical: true }),
      i("İlk yardım çantası ve deniz tutması ilaçları teknede"),
      i("EPIRB/PLB yerinde; MOB butonunun yeri biliniyor"),
      i("Gaz tüpü vanası kullanım dışında KAPALI"),
      i("Manuel sintine pompası kolu yerinde"),
      i("Tahta tapalar kinistin yanlarında asılı"),
    ]),
    cat("yc-brifing", "Mürettebat Brifingi", "🗣️", [
      i("MOB (denize adam düştü) prosedürü anlatıldı", { critical: true }),
      i("Can yeleği ve can salı yerleri gösterildi"),
      i("VHF ile MAYDAY çağrısı nasıl yapılır anlatıldı", { critical: true, tip: "Kaptan devre dışı kalırsa mürettebattan biri yardım çağırabilmeli." }),
      i("Yangın söndürücü yerleri ve gaz vanası gösterildi"),
      i("Bumba çarpması uyarısı yapıldı; kokpit dışına çıkış kuralları"),
      i("Tuvalet kullanımı anlatıldı (kağıt kuralı!)"),
    ]),
    cat("yc-son", "Kalkıştan Hemen Önce", "✅", [
      i("Motor 5-10 dk ısındı, göstergeler normal"),
      i("Dümen sağa-sola tam dönüyor"),
      i("Palamar çözme sırası planlandı, herkes görevini biliyor"),
      i("Marina çıkış kanalı/kuralları hatırlandı"),
      i("Son hava kontrolü yapıldı — vazgeçmek de denizciliktir", { tip: "Limanda kalmayı bilmek, en iyi kaptanların özelliğidir." }),
    ]),
  ],
};

const sahipSezonAcilis: Vessel = {
  id: "sahip-sezon",
  name: "Sezon Açılışı",
  subtitle: "Kışlamadan sonra tekneye dönüş",
  icon: "🔧",
  duration: "Yarım-1 gün",
  group: "sahip",
  categories: [
    cat("sz-karina", "Karina & Su Altı", "🐚", [
      i("Zehirli boya (antifouling) durumu kontrol edildi/yenilendi"),
      i("Tutyalar (anot) kontrol edildi — %50'den fazla yenmişse değiştir", { critical: true, tip: "Biten anot, pervane ve şaftın yenmesi demektir." }),
      i("Pervane, şaft ve yatak boşlukları kontrol edildi"),
      i("Kinistin ızgaraları temiz, vanalar açılıp kapanıyor", { critical: true }),
      i("Dümen yatakları boşluksuz"),
      i("Gövdede ozmoz kabarcığı / darbe izi var mı bakıldı", { photo: true }),
      i("Şaft salmastrası (keçe) kontrol edildi; suya inince damlama normal mi"),
    ]),
    cat("sz-motor", "Motor Servisi", "⚙️", [
      i("Motor yağı ve filtresi değişti"),
      i("İmpeller değişti (sezonda bir)", { critical: true }),
      i("Yakıt filtreleri (motor + ayırıcı) değişti"),
      i("Antifriz/soğutma suyu yenilendi"),
      i("Kayışlar kontrol edildi/değişti"),
      i("Hortumlar ve kelepçeler kontrol edildi (çift kelepçe sualtı bağlantılarda)"),
      i("Egzoz dirseği/su kilidi kontrol edildi"),
      i("Motor kulakları (takoz) çatlaksız"),
      i("Şanzıman yağı kontrol edildi/değişti"),
      i("Motor ilk çalıştırmada egzozdan su attı, kaçak yok", { critical: true }),
    ]),
    cat("sz-elektrik", "Elektrik", "🔋", [
      i("Aküler şarj edildi, yük testi yapıldı; ömrü bitene yenisi"),
      i("Akü terminalleri temizlendi, vazelin sürüldü"),
      i("Tüm seyir fenerleri ve güverte aydınlatması test edildi"),
      i("Kaçak akım / sigorta paneli kontrol edildi"),
      i("VHF, plotter, derinlik, rüzgar cihazları test edildi"),
    ]),
    cat("sz-arma", "Arma & Yelken", "⛵", [
      i("Durgun arma gözle ve elle kontrol edildi (tel kopması, çatlak terminal)", { critical: true }),
      i("Gurcata bağlantıları ve direk dibi kontrol edildi"),
      i("Mandarlar ve halatlar aşınma için elden geçirildi; uçlar örüldü"),
      i("Yelkenler servisten alındı / kontrol edildi (dikiş, UV şeridi)"),
      i("Vinçler açılıp temizlendi, yağlandı"),
      i("Makaralar ve arabalar tuzdan arındırıldı, sessiz çalışıyor"),
    ]),
    cat("sz-emniyet", "Emniyet Yenileme", "🛟", [
      i("Can salı servis tarihi kontrol edildi — geçtiyse servise gönder", { critical: true }),
      i("İşaret fişekleri son kullanma tarihleri kontrol edildi", { critical: true }),
      i("Yangın söndürücüler tartıldı/servis edildi, ibreler yeşil", { critical: true }),
      i("Şişme can yeleklerinin gaz kartuşları ve tetikleri kontrol edildi"),
      i("İlk yardım çantası tazelendi (tarihi geçen ilaçlar)"),
      i("EPIRB/PLB batarya tarihi kontrol edildi, kayıt güncel"),
      i("Gaz dedektörü ve duman alarmı pilleri değişti"),
    ]),
    cat("sz-tesisat", "Su, Gaz & WC", "🚿", [
      i("Tatlı su tankları dezenfekte edildi, sistemden temiz su geçirildi"),
      i("Su hortumları ve kelepçeler kontrol edildi"),
      i("WC bakımı yapıldı (joker valf, contalar); pompa rahat çalışıyor"),
      i("Pis su tankı vanaları ve hortumları kontrol edildi"),
      i("Gaz hortumu üretim/değişim tarihi kontrol edildi", { critical: true, tip: "Gaz hortumlarının ömrü sınırlıdır; tarihi hortumun üstünde yazar." }),
      i("Hidrofor ve boyler çalıştırıldı, kaçak yok"),
    ]),
    cat("sz-evrak", "Evrak & Sigorta", "📜", [
      i("Sigorta poliçesi yenilendi", { critical: true }),
      i("Bağlama kütüğü vizesi yapıldı"),
      i("Ruhsat ve ehliyet geçerlilikleri kontrol edildi"),
      i("Telsiz ruhsatı güncel"),
      i("Marina sözleşmesi ve iletişim bilgileri güncel"),
    ]),
    cat("sz-icmekan", "İç Mekan", "🛏️", [
      i("Küf/rutubet kontrolü yapıldı, iç mekan havalandırıldı"),
      i("Döşemeler ve şilteler kontrol edildi, güneşlendirildi"),
      i("Sintineler temizlendi ve kurulandı"),
      i("Ambar ve lomboz contaları kontrol edildi (sızıntı izi?)"),
      i("Kışlık örtüler kaldırıldı, güverte yıkandı"),
    ]),
  ],
};

const sahipKapama: Vessel = {
  id: "sahip-kapama",
  name: "Tekneden Ayrılırken",
  subtitle: "Her seyir sonu kapatma rutini",
  icon: "🔒",
  duration: "15-20 dk",
  group: "sahip",
  categories: [
    cat("kp-motor", "Motor & Vanalar", "⚙️", [
      i("Motor soğutma kinistini kapatıldı (politikana göre)", { tip: "Kapatıyorsan dümene 'KİNİSTİN KAPALI' notu bırak — bir dahaki çalıştırmada unutma." }),
      i("Gaz tüpü vanası kapatıldı", { critical: true }),
      i("WC ve lavabo kinistinleri kapatıldı", { critical: true, tip: "Teknelerin batma sebebi 1 numara: açık unutulan kinistin ve patlayan hortum." }),
      i("Yakıt vanası kapatıldı (uzun ayrılıklarda)"),
    ]),
    cat("kp-elektrik", "Elektrik", "🔋", [
      i("Akü şalterleri kapatıldı — sintine otomatiği HARİÇ", { critical: true }),
      i("Sahil elektriği bağlandı, şarj cihazı çalışıyor (kalacaksa)"),
      i("Buzdolabı boşaltıldı, kapağı aralık bırakıldı"),
      i("Tüm ışıklar ve cihazlar kapatıldı"),
    ]),
    cat("kp-guverte", "Güverte & Bağlama", "⚓", [
      i("Palamarlar çift ve kılıflı (fırtına ihtimaline göre)", { critical: true }),
      i("Usturmaçalar doğru yükseklikte, yeterli sayıda"),
      i("Yelken örtüsü/UV koruması kapatıldı; cenova sarımı emniyette"),
      i("Mandarlar direkten uzaklaştırıldı (şıngırtı + aşınma önlenir)"),
      i("Bimini/tente toplandı veya emniyete alındı"),
      i("Tender ve dıştan takma kilitli"),
      i("Güvertede uçabilecek eşya kalmadı"),
    ]),
    cat("kp-icmekan", "İç Mekan & Kilit", "🔒", [
      i("Sintine kuru, otomatik pompa devrede", { critical: true }),
      i("Yiyecekler ve çöp tekneden çıkarıldı"),
      i("Islak çamaşır/havlu kalmadı (küf yapar)"),
      i("Havalandırma sağlandı (mantar havalandırıcılar açık)"),
      i("Ambarlar, lombozlar ve giriş kapağı kilitlendi"),
      i("Marina ofisine ulaşılabilir telefon bırakıldı"),
      i("Ayrılırken teknenin son hali fotoğraflandı", { photo: true, tip: "Fırtına hasarı/sigorta durumunda 'son sağlam hali' kanıtın olur." }),
    ]),
  ],
};

export const VESSELS: Vessel[] = [
  yelkenli,
  motoryat,
  katamaran,
  gulet,
  suratTeknesi,
  jetski,
  kanoSup,
  sahipYolaCikis,
  sahipSezonAcilis,
  sahipKapama,
];

export function getVessel(id: string): Vessel | undefined {
  return VESSELS.find((v) => v.id === id);
}

export function totalItems(v: Vessel): number {
  return v.categories.reduce((sum, c) => sum + c.items.length, 0);
}
