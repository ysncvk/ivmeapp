# ADR-0007: Ödeyen taraf veli; öğretmen ücretsiz dağıtım kanalı

- **Durum:** Kabul
- **Tarih:** 2026-09-27

## Bağlam

Üç seçenek değerlendirildi: yalnızca veli, yalnızca öğretmen/kurs, ikisi birden.

Öğretmen/kurs modelinin ekonomisi daha iyi görünüyor: 30 öğrencili bir öğretmene
satmak, 30 veliye tek tek satmaktan az müşteriyle aynı geliri üretir, iptal oranı
düşüktür (iş aracı), ve ödeyen taraf zaten dağıtım kanalıdır. Buna karşılık kurs
"kendi föyümü kullanacağım" der ve kaynak tanımlama yetkisi istemeye başlar.

## Karar

İlk sürümde **ödeyen taraf veli**. Ücretli özellik: detaylı, konu bazında
(örn. kesirler) program üretimi. Öğretmen hesabı ücretsizdir ve dağıtım kanalı
olarak çalışır.

## Gerekçe

- Kütüphane kontrolü bizde kalır (ADR-0004). Kurs modeli kaynak tanımlama yetkisi
  gerektirir, bu da kütüphanenin bir kısmının kontrolünü dışarı verir.
- Tek satın alma akışı, tek fiyatlandırma, tek destek hattı. İki modeli birden
  kurmak ilk sürümde ikisini de yarım bırakır.

## Bilinen riskler

- **Huni büyüklüğü:** tüketici freemium'da ücretliye dönüşüm tipik olarak %2-5.
  2.000 ödeyen kullanıcı için 40-70 bin aktif ücretsiz kullanıcı gerekir. Zor
  olan kısım 2.000 değil, o 40 bin.
- **Öğretmen kanalı hesabı:** öğretmen başına ~25 öğrenci ise 40 bin öğrenci için
  ~1.600 öğretmen kazanmak gerekiyor.
- **Ödeyen ile kullanan ayrı kişi.** Çocuk sevmezse açmaz, veli sonuç görmezse
  ödemez. Tüketici eğitim ürünlerinin çoğu buradan ölüyor. Çözüm ADR-0008'de:
  çocuğun ekranı kısa/bitebilir/ödüllü, velinin ekranı kanıt gösteren. Aynı veri,
  iki ayrı arayüz, baştan böyle kurulur.

## Sonuçlar

- Faturalandırma **eğitim yılı** (Eylül-Haziran) üzerinden kurulur; aylık seçenek
  yanında indirimli yıl paketi. Veli bütçesini okul yılına göre yapıyor ve yazın
  bırakıyor.
- Öğretmen tarafı v1'de yalnızca: sınıf oluştur, öğrenci davet et, kim yaptı kim
  yapmadı gör. Ödeme getirmeyen tarafa ay harcanmaz.
- Kurs/özel öğretmen modeli kapatılmıyor, **sonraya bırakılıyor.** O yola
  girildiğinde kaynak tanımlama yetkisi ayrı bir ADR konusudur.
