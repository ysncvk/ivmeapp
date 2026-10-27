# Eksikler ve açık sorular

Bu liste yayına çıkmadan önce kapanması gerekenleri toplar. Hukuki konular yalnızca kaydedilir;
doğrulama `docs/hukuk-sorulari.md` üzerinden yapılır.

## Veri
- **Sosyal Bilgiler ve İngilizce:** kitap içeriği ve yıllık plan yok. K-016 gereği bu derslerde
  yalnızca ödevler plana girer.
- **MEB ders kitabı içindekiler:** yok; "ders kitabı sayfa aralığı" görevleri üretilemiyor.
- **Paragraf A/B soru sayıları** varsayıma dayanıyor (test başı 12 soru); kitaplardan doğrulanmalı.
- **`match` ifadeleri** (kitap testi ↔ müfredat haftası) örnekleme ile doğrulandı, tüm kitaplar için
  insan gözüyle taranmalı.
- **Türkçe haftalık ders saati** 6 varsayıldı (K-004).

## Ürün / işletme
- **Ödeme sağlayıcısı yok** (K-009): abonelik yalnızca giriş hakkı; ücretli abonelik başlatma
  ekranı yok, deneme bitince "yakında" mesajı çıkar. Sağlayıcı seçilince webhook →
  `activateSubscription` bağlanacak.
- **Barındırma** ve alan adı kararı yok; tek sunucu varsayımıyla yazıldı (oran sınırı bellek içi, K-017).
- **Marka/tescil** kontrolü ("İvme") yapılmadı.
- **E-posta:** şifre sıfırlama/doğrulama e-postası yok (veli şifresini unutursa kurtarma akışı eksik).
- **Öğretmen/veli parola sıfırlama** ve e-posta doğrulama sağlayıcı seçimine bağlı.

## Hukuk (doğrulanmadı)
- Aydınlatma metni ve açık rıza metni **taslak** (`CONSENT_VERSION = "taslak-1"`).
- Mesafeli satış, 12 yaş altı çocuk verisi, öğretmenin sınıf verisi görme kapsamı ve saklama süresi
  (183 gün) hukuki incelemeden geçmeli.

## Teknik
- Öğrenci/veli ekranlarında çevrimdışı kullanım (PWA önbelleği yalnızca kabuk).
- Erişilebilirlik ve **gerçek cihaz testi** (iOS Safari PWA, Android Chrome) yapılmadı; ekranlar telefon
  boyutunu taklit eden bir tarayıcıda 320-390 px genişlikte denendi, yatay taşma yok.
- Web için otomatik uçtan uca test yok; akışlar elle Playwright betikleriyle doğrulandı.
- Oran sınırı bellek içi (K-017); ücretsiz bulut denemesinde (Render) servis uyuyunca sıfırlanır.
- Worker (Pazar akşamı plan üretimi, saklama temizliği) ücretsiz bulut denemesinde çalışmaz; planlar ilk
  açılışta kurulur.

## ADR'lerde olup yapılmayanlar
- **Admin ekranı** (kütüphane besleme, yıllık plan, kullanıcı yönetimi; ADR-0004/0008): yok. İçerik kodda
  (K-008), güncelleme dağıtım gerektirir.
- **İkincil veli** (anne ve baba aynı çocuğu görsün): karar açık (ADR-0012).
- **Veliye haftalık özet bildirimi** (e-posta/WhatsApp, ADR-0009): sağlayıcı yok. Özet uygulamada
  görünür ve düz metin olarak paylaşılır/kopyalanır.
- **Yapay zekâ yorumu ve Okulizyon toplayıcısı** (ADR-0015): bilinçli olarak v2.
- **Proje ödevini parçalara bölüp haftalara yaymak** (ADR-0013 madde 11): v1'de yalnızca teslim tarihli ödev.
- **Kitap okuma günde 30 dk, bütçe dışı** (ADR-0009 madde 6): ayrı bir öğe olarak gösterilmiyor; "boş kalan
  zaman: kitap okuma" tercihi var.
- **Ücretli katman fiyatı ve ödeme sağlayıcısı** (ADR-0014): açık.
- **İçerik:** 5-12. sınıflar, 6. sınıf Sosyal Bilgiler ve İngilizce kitap/yıllık plan. Resmî öğretim programları
  `mufredat.meb.gov.tr` üzerinden alınabiliyor (ünite ve ders saati); haftalık yıllık plan ve ders kitabı
  içindekileri ayrıca bulunmalı.

## Fikir havuzu (v2+, kapsam dışı)
- **Test mağazası:** yayınevlerinden parça parça test satın alma, uygulamada online çözme, komisyon
  geliri. Gerektirir: soru içeriği ve çözme ekranı, sunucu tarafında cevap anahtarı, ödeme
  sağlayıcısı, yayınevi sözleşmesi, hukuk incelemesi (lisans, vergi, 12 yaş altına satış).
  İlke: ödev takibi ücretsiz kalır (ADR-0014); plana giren kitap seçimi komisyondan etkilenmez.
