# ADR-0005: Plan kural tabanlı motorla üretilir, elle yazılmaz

- **Durum:** Kabul (kısmen değiştirildi: ADR-0013)
- **Tarih:** 2026-09-27

## Bağlam

Planların elle hazırlanması konuşuldu. Elle hazırlanan plan abonelik değil
danışmanlıktır ve 50 müşteride tıkanır. Yapay zekâ ile üretim de masadaydı;
ilk sürüm için ne gerekli ne öngörülebilir.

## Karar

Haftalık/günlük plan kural tabanlı bir motorla üretilir. Motor deterministiktir
ve her görevin neden üretildiği veride taşınır. Elle plan yazılmaz. Yapay zekâ
ilk sürümde plan üretmez.

## Girdiler

1. Haftalık bütçe ve çalışma günleri (veli belirler, bkz. ADR-0009)
2. Sınıfın müfredattaki konumu (yıllık plan → bu hafta hangi konu)
3. Öğrencinin seçtiği kaynaklar (ADR-0004)
4. Son denemenin zayıf konuları (ADR-0003)
5. Geçen hafta ne yapıldı, ne yapılmadı

## Çıktı

Gün başına 2-3 madde (90 dk bütçede; sayı bütçeden türer, bkz. Güncelleme). Her madde: ders + konu + kaynak + somut iş (sayfa/test) +
tahmini süre + üretim gerekçesi.

## Kurallar

Günlük şablon (90 dakikalık bütçe için):

| Blok | Süre | İçerik |
|---|---|---|
| 1 | 25-30 dk | Okul ödevi / bugün işlenen konu |
| 2 | 25-30 dk | Matematik veya Türkçe (dönüşümlü; haftalık gün hedefi için bkz. Güncelleme) |
| 3 | 20-25 dk | Zayıf konu **veya** aralıklı tekrar (2-4 hafta öncesi) |

Fen, Sosyal ve İngilizce her gün değil; Blok 1 veya 2'de dönüşümlü (haftalık
sayı için bkz. Güncelleme). Matematik ve Türkçe beceri dersi olduğu için sık; diğerleri bilgi
dersi olduğu için aralıklı tekrara daha uygun.

Ağırlık dağılımı:

- **%50** bu haftanın konusu (okulla senkron — sınıfta taze işlenen en kolay pekişir)
- **%30** zayıf konu (denemeden)
- **%20** aralıklı tekrar

Kesme kuralları:

- Bütçe küçükse **önce Blok 3 düşer**. Okul ödevi asla düşmez.
- Yapılmayan görev **birikmez**. Havuza döner, gelecek haftanın öncelik sırasına
  girer; günlük bütçe aşılmaz.
- Motorun işi görev **eklemek değil, önceliklendirip kesmek**.

## Gerekçe

- Maliyet öngörülebilir, 1 öğrenci ile 10.000 öğrenci aynı maliyette çalışır.
- Çıktı açıklanabilir: bir görevin neden geldiği her zaman gösterilebilir.
- Kütüphane ve yıllık plan beslendiği sürece insan müdahalesi gerekmez.

## Sonuçlar

- Plan **haftalık sabittir**, her hafta başında yenilenir ve hafta içinde
  değişmez. Planı gün içinde değişen uygulama güven kaybeder.
- Döngü: deneme → yanlış analizi → yeni hafta kurulur → 5 gün uygulama → deneme.
  Cumartesi analizi, gelecek haftanın girdisi.
- Yapay zekâ ileride yalnızca haftalık değerlendirme/yorum için eklenebilir;
  plan üretimi kural motorunda kalır.

## Güncelleme (2026-10-02, ADR-0013)

Bu ADR'nin ilk hali 5 çalışma günü ve sabit bir ders rotasyonu varsayıyordu. Bu
varsayım, matematik ≥3 gün + Türkçe ≥3 gün + Fen/Sosyal/İngilizce'nin her biri
2-3 kez kurallarını 10 yuvaya sığdırmaya çalıştığı için kendi içinde çelişiyordu
(en az 12 yuva gerekiyor). Aşağıdaki kurallar yukarıdakilerin yerine geçer:

- **Yuva sayısı sabit değildir, hesaplanır:** çalışma günü sayısı × günlük blok
  sayısı. Gün sayısı ve bütçe veli ayarıdır (ADR-0013); haftada en fazla 6 gün.
- **Günde en fazla 3 madde sınırı kalktı** (ADR-0013). Günlük blok ve madde sayısı
  velinin verdiği bütçeden türer. Bütçe velinin kararıdır; uygulama tavsiye ve
  uyarı verir, engellemez. Motor velinin verdiği bütçeyi aşmaz.
- **Blok süresi çocuğa özeldir** (ADR-0013): tablodaki 25-30 dk varsayılandır,
  veli çocuğun dikkat süresine göre belirler.
- Yuva sayısı bu yüzden gün sayısına olduğu kadar bütçeye de bağlıdır: gün ya da
  bütçe artınca yuva artar.
- **Ders dağılımı kota tabanlıdır, sabit rotasyon değildir.** Seçili derslerin
  haftalık kotası müfredattaki konuma ve veli seçimine göre hesaplanır.
- **Matematik ve Türkçe öncelikli, "≥3 gün" bir hedeftir, garanti değil.** Yuva
  yetmezse hedef düşer ve neyin kesildiği *kapsama raporuna* yazılır; motor yine
  görev eklemez, yalnızca önceliklendirip keser.
- **Fen, Sosyal ve İngilizce için sabit "2-3 kez" kuralı kalktı.** Haftalık
  sayıları kalan yuvalara ve müfredattaki konuma göre kota belirler; Blok 3'teki
  zayıf konu ve aralıklı tekrar bu derslerin eksik kalan kısmını tamamlar.
- Diğer kurallar (ağırlık dağılımı, kesme kuralları, birikmeme, haftalık sabitlik)
  ADR-0013'teki istisnalarla birlikte geçerlidir.
