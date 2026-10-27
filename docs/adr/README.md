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
| [0005](0005-kural-tabanli-motor.md) | Plan kural tabanlı motorla üretilir, elle yazılmaz | Kabul (kısmen değiştirildi: 0013) |
| [0006](0006-ucretsiz-ucretli-sinir.md) | Ücretsiz "ne oldu", ücretli "ne yapmalı" | Kabul (kısmen değiştirildi: 0014) |
| [0007](0007-odeyen-taraf-veli.md) | Ödeyen taraf veli; öğretmen ücretsiz dağıtım kanalı | Kabul (kısmen değiştirildi: 0014) |
| [0008](0008-rol-platform-dagilimi.md) | Öğrenci/veli mobil öncelikli, öğretmen/admin web öncelikli | Kabul |
| [0009](0009-calisma-yuku-sinirlari.md) | Günlük yük üst sınırı motorun aşamayacağı bir kısıttır | Kabul (kısmen değiştirildi: 0013) |
| [0010](0010-cocuk-verisi-ve-erisim.md) | Çocuk verisi ve erişim kontrolü ilkeleri | Kabul |
| [0011](0011-teknoloji-yigini.md) | Teknoloji yığını ve repo yapısı | Kabul |
| [0012](0012-kimlik-ve-oturum-modeli.md) | Kimlik ve oturum modeli | Kabul |
| [0013](0013-plan-ayarlari-ve-dinamik-plan.md) | Plan ayarları ve dinamik plan kuralları (0005/0009'u kısmen değiştirir) | Kabul (kısmen değiştirildi: 0017) |
| [0014](0014-katman-siniri-ve-odev-akisi.md) | Katman sınırı, ödev akışı ve öğretmen görünürlüğü (0006/0007'yi kısmen değiştirir) | Kabul |
| [0015](0015-v1-kapsami-deneme-ve-yapay-zeka.md) | v1 kapsamı: manuel deneme girişi; Okulizyon ve yapay zekâ v2 | Kabul |
| [0016](0016-odul-sistemi.md) | Ödül sistemi: ödülleri veli tanımlar, hedefi çocuk tamamlama ile açar | Kabul |
| [0017](0017-soru-hedefi-ve-kocluk.md) | Günlük soru hedefi ve koçluk planı tek modelde birleşir | Kabul |

## Açık kalanlar

- Marka adı **İvme** (`ivmeapp.com`) olarak kullanılıyor. TÜRKPATENT sınıf 9 ve 41
  araması hâlâ yapılmadı, yayından önce yapılmalı. Yedek: Rahvan. Çocuk tarafındaki
  karakter adı ayrı bir karar (öneri: Sofya).
- İkincil veli: aynı çocuğu birden fazla veli görebilsin mi (ADR-0012, v1'de tek veli).
- Ücretli katman fiyatı (300-500 TL aralığı konuşuldu, karar verilmedi).
