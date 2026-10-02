# ADR-0002: Plan motoru, veri modeli ve API kabuktan bağımsızdır

- **Durum:** Kabul
- **Tarih:** 2026-09-26

## Bağlam

İstemci kabuğu kararı (ADR-0001) ileride değişebilir: PWA bugün, Capacitor
yarın, teorik olarak native sonra. Ürünün değeri kabukta değil, "bu çocuk bugün
ne yapmalı?" sorusunu cevaplayan mantıkta.

## Karar

Plan motoru, veri modeli ve API katmanı istemci teknolojisinden tamamen bağımsız
yazılır. Çekirdek hiçbir yerde DOM, tarayıcı API'si, React ya da herhangi bir
istemci kütüphanesine bağımlı olmaz. İstemci yalnızca API tüketir.

## Gerekçe

- Kabuk kararını **geri alınabilir** hale getirir. Bu, PWA/native tartışmasının
  maliyetini düşüren tek şey.
- Aynı çekirdek dört rolün arayüzünü birden besler.
- Motor saf fonksiyon olarak test edilebilir: girdi (bütçe, müfredat konumu,
  kaynaklar, zayıf konular, geçen hafta) → çıktı (görev listesi). Tarayıcı
  gerektirmeyen testler hızlı ve güvenilirdir.

## Sonuçlar

- Çekirdek kendi paketinde durur; istemci ona `import` ile değil API üzerinden
  erişir (ya da paylaşılan bir paket olarak, ama tarayıcıya özgü hiçbir şey
  içermeden).
- Motorun kararları açıklanabilir olmalı: bir görevin neden üretildiği
  (haftanın konusu / zayıf konu / aralıklı tekrar) veride taşınır. Hem hata
  ayıklama hem veliye gösterme için gerekli.
- Bu ADR ihlal edilirse kabuk değiştirme maliyeti birkaç günden birkaç aya çıkar.
  Kod incelemesinde bakılacak ilk şey budur.
