# ADR-0004: Kaynak kütüphanesini biz kurarız, kullanıcı yalnızca seçer

- **Durum:** Kabul
- **Tarih:** 2026-09-27

## Bağlam

Ücretli özelliğin işe yaraması için planın somut olması gerekiyor: "30 dakika
matematik" değil, "Karekök s.84 Test 12 — kesirler". Bu da elde bir kaynak
haritası olmasını gerektiriyor: konu → ders kitabı sayfaları → yardımcı
kaynaktaki testler (test no, sayfa, soru sayısı) → kazanım.

Ödeyen taraf veli (ADR-0007). Veli bu veriyi girmez.

## Karar

Kaynak kütüphanesini biz kurar ve besleriz. Kullanıcı yalnızca "şu kaynakları
kullanıyoruz" diye listeden seçer. Kütüphanede kitabın **yapısal/olgusal**
bilgisi tutulur: konu adı, sayfa aralığı, test numarası, soru sayısı, kazanım
eşleşmesi.

## Gerekçe

- Veliden veri girişi beklemek ücretli özelliği öldürür. Aylık ücret ödeyip
  üstüne yüzlerce satır veri girecek kullanıcı yoktur.
- Kütüphane aynı zamanda **savunulabilir tek varlık**. Kod kopyalanır; 200
  yayınevi kaynağının konu-sayfa-test haritası kopyalanmaz.
- Bir kitap bir kez haritalanır, binlerce öğrenci kullanır. Maliyet ölçeklenmez.

## Sonuçlar

- **Kapsam disiplini:** yayına çıkmak için 60 kitap haritalamak gerekmez.
  MEB ders kitabı herkeste var ve ücretsiz — temel plan onunla kurulabilir.
  Üstüne en yaygın 3-4 soru bankası eklenir. Listede olmayan kaynak için
  "kaynak eklenmesini iste" akışı konur, talebe göre büyütülür.
- Kütüphane içeriği **taşınmaz**: soru metinleri, görseller, çözümler
  kütüphaneye girmez. Yalnızca konu/sayfa/test/soru sayısı gibi olgusal veri
  tutulur. Bu sınır korunursa telif açısından rahat kalınır ve yayınevleriyle
  ileride iş birliği yolu açık kalır.
- Yıllık plan (hangi hafta hangi konu) ayrı bir veri kümesidir. Önce standart
  MEB planıyla kurulur, sınıfın gerçek temposuna göre birkaç haftada bir
  düzeltilir. Okuldan ünitelendirilmiş yıllık plan alınabilirse en doğrusu o.
- Kütüphaneyi besleyen admin ekranı hızlı olmalı; en çok saat buraya gidecek.
  Bu ekranın ergonomisi "küçük bir admin işi" değildir.
- İlk kapsam: yalnızca 6. sınıf. Velinin cüzdanı 8. sınıfta açılıyor; 6'da
  kazanılan veli iki yıl sonra en değerli müşteri.
