# Hukuki araştırma brifi

Bu dosya, ürünü hukuk açısından araştıracak kişiye ya da araca olduğu gibi
verilmek üzere yazıldı. Bir hukuki görüş değildir. Karar kayıtları: `docs/adr/`
(özellikle ADR-0010 ve ADR-0012).

## Ürün özeti

Türkiye'de 6. sınıf (11 yaş) öğrencileri için haftalık/günlük çalışma planı
üreten bir web uygulaması (PWA). Dört rol var: öğrenci, veli, öğretmen, admin.

- **Veli** e-posta ile üye olur, ödeyen taraftır. Çocuğunu ekler.
- **Çocuk profilini veli oluşturur**: ad (takma ad olabilir), kullanıcı adı, şifre.
  E-posta, TC kimlik no, doğum tarihi **tutulmaz**. Çocuk kendi cihazından
  (tablet, telefon, bilgisayar) kullanıcı adı ve şifreyle girer. Şifreyi yalnızca
  veli sıfırlar.
- **Öğretmen** e-posta ile üye olur, sınıf oluşturur, **sınıf davet linki**
  üretir ve linki velilere kendisi iletir (WhatsApp vb.). Uygulama velilerin
  iletişim bilgisini öğretmenden almaz. Veli linkle gelir, çocuğunu sınıfa
  kendisi bağlar. Öğretmen çocuğun yalnızca görev tamamlama durumunu ve deneme
  netlerini görür.
- **İşlenen veri**: çocuğun adı/takma adı, deneme sınavı sonuçları (ders ve
  konu bazında doğru/yanlış), zayıf konular, günlük görev tamamlama davranışı,
  sınıf bağlantısı.
- **Barındırma**: ticari sürümde yönetilen bir bulut ortamı (yer henüz seçilmedi).
  Ev içi prototip yalnızca aile içi, kapalı erişimli.
- **Ücret**: ücretsiz katman (teşhis, ödev takibi) ve ücretli katman (somut
  program). Ödeyen taraf veli.
- **Üçüncü taraf veri**: ev içi prototipte bir okul sistemi hesabından (kendi
  çocuğunun kendi verisi) veri çekilir; ticari sürümde bu yok, veri kullanıcıdan
  gelir (manuel giriş, karne fotoğrafı) veya kurum anlaşmasıyla.

## Sorular

Her soru için: ilgili mevzuat maddesi/kurul kararı, kısa sonuç, ve belirsiz
kalan nokta ayrı ayrı yazılsın. Kesin olmayan yerde bunun belirtilmesi istenir.

1. **Çocuk verisi için rıza.**
   - 18 yaş altı için rıza kimden, hangi biçimde alınmalı?
   - Çocuğun kendi cihazında kullanıcı adı/şifreyle girmesi, rızayı veli verdiği
     sürece sorun mu?
   - Aydınlatma metni kime ve nasıl sunulmalı (veli, çocuk, ikisi)? Çocuğa yönelik
     sade bir versiyon gerekir mi?
2. **Öğretmenin hukuki konumu.**
   - Öğretmen bu uygulamada kendi adına mı, okul adına mı hareket etmiş sayılır?
   - Öğretmenin sınıf oluşturup öğrenci davet etmesi, okul/MEB mevzuatı açısından
     (öğrenci verisinin üçüncü taraf uygulamalarda işlenmesi) bir kısıt doğurur mu?
   - Çocuğu sınıfa bağlama kararını velinin vermesi, öğretmenin görünürlüğü için
     yeterli dayanak mı?
3. **Veri sorumlusu yükümlülükleri.** VERBİS kaydı ne zaman ve hangi eşikte
   gerekir? Bu ürün için gerekir mi?
4. **Yurt dışı barındırma.** Sunucu yurt dışında olursa aktarım şartları nedir?
   Türkiye'de barındırmak zorunlu mu, tercih mi?
5. **Saklama, silme ve imha.** Veli hesabı silindiğinde çocuk verisinin tamamı
   silinir. Yedeklerdeki veri, kayıt/erişim logları ve yasal saklama süreleri
   bununla nasıl uzlaşır? İmha politikası gerekir mi, nasıl yazılır?
6. **Takma ad ve kullanıcı adı.** Çocuğun takma adı ve sistemin önerdiği
   kullanıcı adı kişisel veri sayılır mı?
7. **Erişim kaydı.** Kim hangi çocuğun verisine baktı kaydı tutulacak. Bu kaydın
   kendisi için saklama süresi ve aydınlatma gerekir mi?
8. **Ödeme ve tüketici hukuku.** Çocuğa yönelik bir ürünü veli satın alıyor.
   Mesafeli satış, abonelik, cayma hakkı ve "bir hafta ücretsiz deneme sonrası
   otomatik ücretlendirme" için hangi bilgilendirme ve onay biçimi gerekir?
9. **Okul sistemi verisi (yalnızca prototip).** Kendi çocuğunun kendi hesabıyla
   okul sistemine girip veri çekmek kullanım şartları ve mevzuat açısından nasıl
   değerlendirilir? Ticari sürüme taşınmayacağı varsayımı doğru mu?
10. **Pazarlama.** Veliye WhatsApp/e-posta ile haftalık özet göndermek için ayrı
    bir ticari elektronik ileti izni gerekir mi, yoksa hizmet bildirimi sayılır mı?

11. **Öğretmenin ücretsiz araç olarak konumu.** Öğretmen sınıfa ödev atayıp
    velilere davet linki gönderiyor; uygulamanın bir ücretli katmanı var ama
    öğretmen ve ödev takibi ücretsiz, öğretmen ücretli planı satmıyor ve ücretli
    kullanıcıları göremiyor. Bu kurgu okul/MEB mevzuatı ve ticari yönlendirme
    açısından yeterli mi? Öğretmenin veli gruplarına atacağı davet metninde
    "ödev ve görev takibi ücretsizdir" vurgusu uygun mu?
12. **Mesafeli satış ve ön bilgilendirme.** Yalnızca ücretli plan satın alınırken
    devreye giren sözleşme ve ön bilgilendirme metinleri hangi unsurları taşımalı?
    Kartsız bir haftalık deneme ve sonrasında veli kendi başlatırsa abonelik
    kurgusu için ek yükümlülük var mı?
13. **Ücretsiz ve ücretli katmanda işlenen verinin kategorileri.** Ücretsizde
    ödev takibi ve deneme verisi, ücretlide ek olarak seçilen kaynaklar ve
    ayrıntılı ders analizi işleniyor. Aydınlatma metninde bu iki katman ayrı
    kategorize edilmeli mi?
14. **Pazarlama bildirimi için ayrı onay.** Üyelikten ayrı, isteğe bağlı bir onay
    kutusuyla alınan e-posta/SMS onayı (çocuğa yönelik çalışma planı önerileri ve
    kampanyalar) yeterli mi? Haftalık özet bildirimi bu onaydan bağımsız bir hizmet
    bildirimi sayılır mı (bkz. 10)?

15. **Yapay zekâ (v2).** Çocuğun toplulaştırılmış verisinden (ad ve serbest metin
    olmadan) velinin göreceği haftalık yorum üretmek için bir dil modeli sağlayıcısı
    kullanılırsa: yurt dışı aktarım şartları, sağlayıcıyla eğitimde kullanılmama ve
    saklama süresi sözleşmesi, aydınlatma metnine ekleme ve açık rıza gerekir mi?

> Not: Bu soruların bir kısmı başka bir yapay zekâ ile yapılan ön
> değerlendirmeden geldi; o değerlendirmedeki "risk neredeyse sıfır" gibi
> ifadeler kesin hüküm değildir ve avukat teyidi gerektirir.

## Beklenen çıktı

- Soru başına: ilgili mevzuat, kısa sonuç, belirsizlik.
- Ürün tasarımında **değişmesi gereken** noktaların ayrı listesi.
- Yayına çıkmadan **bir avukata mutlaka sorulacaklar** listesi. Bir yapay zekâ
  çıktısı hukuk gözden geçirmesinin yerini tutmaz (ADR-0010).
