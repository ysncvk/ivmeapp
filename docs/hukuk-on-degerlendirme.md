# Hukuki ön değerlendirme (doğrulanmamış)

Kaynak: başka bir yapay zekâ ile yapılan değerlendirmenin özeti (2026-10-02).
**Bu bir hukuki görüş değildir ve içindeki rakam/süre/oran ifadeleri
doğrulanmamıştır.** Amaç, `hukuk-sorulari.md` brifini avukata götürürken elde bir
başlangıç noktası olması ve hangi iddiaların kontrol edileceğini işaretlemek.
Ürün kararları ADR'lerde; buradaki hiçbir madde tek başına ADR kararı değildir.

## ADR'lerle uyumlu, tasarıma işlenenler

| İddia | Durum |
|---|---|
| Çocuk için rıza yetkisi velide; çocuğun kullanıcı adı/şifreyle girmesi sorun değil, şifre sıfırlama velide | ADR-0012 ile aynı |
| Çocuğa ilk girişte yaşa uygun, sade, görsel destekli aydınlatma | ADR-0012'ye işlendi |
| Öğretmen bireysel kullanıcıdır, okul adına değil | ADR-0014 ile uyumlu |
| Veli, linkle gelip çocuğunu kendisi bağlıyor → öğretmen görünürlüğünün dayanağı velinin onayı | ADR-0012 ile aynı |
| Öğretmen abonelik durumunu görmemeli | ADR-0014 madde 5 |
| Ücretsiz katman kart istemez; ücretli satın alma aşamasında ön bilgilendirme + mesafeli satış sözleşmesi | ADR-0014 madde 6-7 |
| Erişim logu tutulmalı ve aydınlatmada belirtilmeli | ADR-0010 |
| Ticari sürümde okul sistemi scraping yok | ADR-0003 |
| Öğretmene hazır davet mesajı ("ödev takibi ücretsiz, kart gerekmez") | ADR-0014'e işlendi |
| Arayüzde "sınıf" yerine "çalışma grubu" dili | ADR-0014'e işlendi (arayüz terimi) |

## Özetin ADR'lerden saptığı yerler

- **Ücretsiz katman daraltılmış.** Özet, ücretsiz veliye "temel deneme netleri"
  veriyor. ADR-0006 ise grafikler, ders/konu bazında doğru-yanlış dağılımı ve zayıf
  konu teşhisini ücretsiz tutar; satış cümlesi buradan doğar ("kesirlerde zayıf
  görünüyor, program oluştur"). **ADR-0006 geçerli kalır.**
- **Ücretli katman dar tarif edilmiş.** Özet, ücretliyi "kendi seçtiği yardımcı
  kitaplara göre plan" olarak yazıyor. ADR-0014'e göre MEB kitabına göre kurulan
  plan dahil **tüm gün gün plan** ücretlidir.
- **Hesap silme.** Özet "silinir/anonimleşir" diyor. ADR-0010 madde 3 silmeyi ve
  "pasife almanın silme sayılmadığını" söyler. Anonimleştirme ancak hukuk teyidiyle
  ve ADR-0010 güncellenerek kabul edilir; şimdilik silme geçerli.

## Avukata/kaynağa doğrulatılacak iddialar

- "Ücretsiz öğretmen paneli MEB disiplin riskini %80+ düşürür": **dayanaksız
  kesinlik**, rakam doğrulanamaz. Risk düşer, sıfırlanmaz.
- VERBİS muafiyet eşikleri (çalışan sayısı, bilanço) ve bunların "ve/veya"
  ilişkisi.
- Yurt dışı barındırma için standart sözleşme ve Kurum'a bildirim süreleri
  (güncel mevzuat).
- 5651 kapsamında log saklama süresi ("2 yıl") ve bu ürüne uygulanıp uygulanmadığı
  (yer sağlayıcı olup olmadığımız).
- Mali kayıtlar için saklama süresi ("10 yıl").
- Ücretsiz denemeden ücretliye geçişte "en az 3 gün önce bilgilendirme"
  yükümlülüğü ve kaynağı. Bizim kurgumuzda deneme otomatik ücretlendirmeye
  dönmez (ADR-0014 madde 6), bu yükümlülük bu durumda doğar mı?
- "Ödev/ders durumu özeti hizmet bildirimi sayılır; reklam eklenirse ticari
  elektronik ileti izni gerekir." Haftalık özet içine üst pakete geçiş önerisi
  konup konmayacağı buna bağlı.
- "Takma ad/kullanıcı adı dolaylı kişisel veridir": ihtiyatlı tarafta kalmak için
  öyle ele alıyoruz (ADR-0012).

## Avukata sipariş edilecek metinler

1. Veli aydınlatma metni ve açık rıza formu
2. Çocuk aydınlatma metni (sade, görsel destekli)
3. Mesafeli satış sözleşmesi ve ön bilgilendirme formu (ücretli plan)
4. Kişisel veri saklama ve imha politikası
5. Öğretmen davet mesajı şablonunun MEB/okul açısından kontrolü
6. Yurt dışı barındırma seçilirse ilgili standart sözleşme metni
