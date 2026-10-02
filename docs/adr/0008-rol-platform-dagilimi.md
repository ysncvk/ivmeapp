# ADR-0008: Öğrenci/veli mobil öncelikli, öğretmen/admin web öncelikli

- **Durum:** Kabul
- **Tarih:** 2026-09-26

## Bağlam

Tek kod tabanı var (ADR-0001), dolayısıyla her rol her cihazdan erişebiliyor.
Soru erişim değil, **hangi rolün hangi cihazda ne yapabildiği**.

## Karar

Dört rol, iki öncelik:

| Rol | Öncelik | Not |
|---|---|---|
| Öğrenci | Mobil | Tek ekran: bugünün görevleri, tikleme, puan |
| Veli | Mobil | İlerleme, teşhis, haftalık özet |
| Öğretmen | Web | Mobilde "bak ve onayla", webde "kur ve yönet" |
| Admin | Web | Kütüphane besleme, yıllık plan, kullanıcı yönetimi |

Erişim hiçbir rol için cihaza göre kısıtlanmaz; **tasarım önceliği** farklıdır.

## Gerekçe

- 30 öğrencili bir sınıfı telefondan yönetmek kullanılabilir değil. Öğretmenin
  kurulum işleri (sınıf oluşturma, davet, kaynak seçimi) web'e ait.
- Kütüphane besleme ekranı en çok saat harcanacak yer (ADR-0004); masaüstünde
  hızlı olması gerekiyor. Web tarafı "küçük bir admin paneli" değil.
- Çocuk ve veli ekranları farklı işler yapar: biri kısa ve ödüllü, diğeri kanıt
  gösteren. Aynı ekranı iki role sıkıştırmak ikisini de bozar (ADR-0007 riski).

## Sonuçlar

- Öğrencinin gördüğü ekranda **süre manşet metrik değildir** (ADR-0009); görev
  sayısı ve bitirme durumu öndedir.
- Aynı ekranı iki yere sıkıştırma girişimi reddedilir: öğretmenin mobil görünümü
  webin küçültülmüş hali değil, ayrı ve dar kapsamlı bir görünümdür.
- Öğretmenin mobilde yapabileceklerinin tam listesi henüz netleşmedi; ekran
  tasarımı sırasında karara bağlanacak.

## Not (2026-10-02)

Karar değişmedi, açıklık getirildi: "mobil öncelikli" öğrenci ve veli ekranlarının
masaüstünde eksik çalışacağı anlamına gelmez. Dört rolün tamamı her cihazda tam
çalışır; fark yalnızca tasarım önceliğidir. Bu, ADR-0011'de "tüm roller
responsive" şartı olarak yazıldı.

Öğretmenin mobilde yapabileceklerinin ayrı bir sınırı yoktur: öğretmen her işi hem
webden hem mobilden yapabilir. "Mobilde bak ve onayla, webde kur ve yönet" yalnızca
tasarım önceliğidir; hiçbir işlev cihaza göre kısıtlanmaz. Bu nedenle ADR-0008'in
önceki "tam liste netleşmedi" maddesi kapanmıştır.
