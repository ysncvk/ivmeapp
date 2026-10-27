# ADR-0017: Günlük soru hedefi ve koçluk planı tek modelde birleşir

- **Durum:** Kabul
- **Tarih:** 2026-10-28

## Bağlam

Evde pilot için ürün sadeleştirildi: veli ders başına "günde kaç soru" hedefi koyar, çocuk çözdüğü
soru sayısını yazar (K-020). Bu, ADR-0005/0013'teki gün gün plan ile yan yana durunca iki ayrı ilerleme
ölçüsü çıktı: çocuğun ekranında hem "3 görev" hem "50 soru", veli iki ayrı yüzdeyi görüyor, plan
dakikayla, hedef soru sayısıyla çalışıyordu. Plandaki testi bitiren çocuğun soru sayacı 0 kalıyordu.

## Karar

1. **Ücretsiz katman:** ders başına günlük soru hedefi, soru sayacı, haftalık özet ve raporlar
   (ADR-0006 "ne oldu" tarafı). Ödev takibi ve teşhis gibi ücretsizdir.
2. **Ücretli katman:** koçluk, aynı hedefi "hangi kitaptan hangi test" önerisine çevirir (ADR-0006 "ne
   yapmalı" tarafı) ve aylık konu haritasını açar (ADR-0013 madde 8, ADR-0014).
3. **Tek ilerleme ölçüsü çözülen sorudur.** Plandaki testi işaretlemek o günün sayacına testin soru
   sayısını ekler, geri almak düşer. Elle yazılan sayı aynı sayaçtır.
4. **Hedef plana test sayısı olarak girer:** hedef ÷ kitabın test başına soru sayısı, **yukarı
   yuvarlanır** (50 soru, 12 soru/test → 5 test). Böylece önerilen testlerin hepsi bitince hedef de
   tutar. Motor her çalışma günü her hedefli derse tam o kadar test koyar (`dailyTests`); haftanın konusu,
   zayıf konu ve tekrar (%50/%30/%20) dersin kendi günlük yuvaları içinde paylaşılır.
5. **Hedef varken günlük süre/bütçe ayarı kullanılmaz;** yük hedeften türer (ADR-0013 madde 1'in
   günlük bütçesi hedefsiz çocuklar için geçerli kalır).
6. **Okul ödevi bu yuvalara ek girer** ve hiçbir testi düşürmez; geçmiş güne konmaz.
7. **Görev taşıma kapasiteyle reddedilmez** (ADR-0013 madde 6'nın hedef kipindeki karşılığı): taşıma
   çocuğun açık tercihidir, sayaç gerçekte çözüleni izler.
8. **Ödül:** planı olmayan çocukta günlük hedefi tutturmak ödülü besler (ADR-0016); planı olanda
   görevler zaten hedefin karşılığıdır, çift sayılmaz.

## Reddedilen alternatifler

**İki sistemi yan yana bırakmak.** Çelişkili ölçüler, çocuğa iki kez işlem.

**Yalnızca ekranı birleştirmek.** Arka planda iki ilerleme kalır; tutarsızlık sürer.

**Test sayısını yuvarlamak (4,17 → 4).** Tüm testleri bitiren çocuğun hedefi tutmaması ("plana
uydum ama hedef tamam değil") kötü deneyimdir. Bedeli: hedefin en fazla bir test kadar üstünde yük.

## Sonuçlar

- `core`: `PlanSettings.dailyTests`, `testsPerDay`, `weekReport` (veli raporu, saf fonksiyon).
- API: `questions.*`, `report.*`, `library.topicMap`; test işaretleme sayaç günceller.
- ADR-0013'ün durumu *"Kabul (kısmen değiştirildi: ADR-0017)"* olur.
- Karar günlüğü K-020 … K-023.
