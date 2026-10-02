# Mimari Karar Kayıtları (ADR)

Bu klasör, projede verilen kalıcı kararları ve **gerekçelerini** tutar. Amaç üç ay
sonra "biz bunu neden böyle yapmıştık?" sorusuna bakılacak tek bir yer olması.

Kurallar:

- Bir karar değiştiğinde ADR silinmez. Yeni bir ADR yazılır, eskisinin durumu
  `Geçersiz (ADR-00XX ile değiştirildi)` olarak güncellenir.
- Her ADR bir karardır, bir tasarım dokümanı değildir. Kısa olması iyidir.
- Tartışmalı kararlarda "Reddedilen alternatifler" bölümü zorunludur; en çok
  o bölüm işe yarıyor.

| No | Karar | Durum |
|---|---|---|
| [0001](0001-pwa-secimi.md) | İstemci PWA olarak yazılır, native kabuk sonraya bırakılır | Kabul |
| [0002](0002-kabuktan-bagimsiz-cekirdek.md) | Plan motoru, veri modeli ve API kabuktan bağımsızdır | Kabul |
| [0003](0003-veri-saglayici-soyutlamasi.md) | Deneme verisi sağlayıcı arayüzü arkasından gelir | Kabul |
| [0004](0004-kaynak-kutuphanesi.md) | Kaynak kütüphanesini biz kurarız, kullanıcı yalnızca seçer | Kabul |
| [0005](0005-kural-tabanli-motor.md) | Plan kural tabanlı motorla üretilir, elle yazılmaz | Kabul |
| [0006](0006-ucretsiz-ucretli-sinir.md) | Ücretsiz "ne oldu", ücretli "ne yapmalı" | Kabul |
| [0007](0007-odeyen-taraf-veli.md) | Ödeyen taraf veli; öğretmen ücretsiz dağıtım kanalı | Kabul |
| [0008](0008-rol-platform-dagilimi.md) | Öğrenci/veli mobil öncelikli, öğretmen/admin web öncelikli | Kabul |
| [0009](0009-calisma-yuku-sinirlari.md) | Günlük yük üst sınırı motorun aşamayacağı bir kısıttır | Kabul |
| [0010](0010-cocuk-verisi-ve-erisim.md) | Çocuk verisi ve erişim kontrolü ilkeleri | Kabul |
| [0011](0011-teknoloji-yigini.md) | Teknoloji yığını ve repo yapısı | Kabul |
| [0012](0012-kimlik-ve-oturum-modeli.md) | Kimlik ve oturum modeli | Kabul |
| [0013](0013-plan-ayarlari-ve-dinamik-plan.md) | Plan ayarları ve dinamik plan kuralları (0005/0009'u kısmen değiştirir) | Önerildi |

## Açık kalanlar

- Marka adı. `ivmeapp.com` müsait, TÜRKPATENT sınıf 9 ve 41 araması yapılmadı.
  Yedek: Rahvan. Çocuk tarafındaki karakter adı ayrı bir karar (öneri: Sofya).
- Öğretmenin mobilde yapabileceklerinin tam sınırı (ADR-0008'de çerçeve var,
  ekran bazında netleşmedi).
- İkincil veli: aynı çocuğu birden fazla veli görebilsin mi (ADR-0012, v1'de tek veli).
- Ücretli katman fiyatı (300-500 TL aralığı konuşuldu, karar verilmedi).
