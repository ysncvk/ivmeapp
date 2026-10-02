# ADR-0005: Plan kural tabanlı motorla üretilir, elle yazılmaz

- **Durum:** Kabul
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

Gün başına 2-3 madde. Her madde: ders + konu + kaynak + somut iş (sayfa/test) +
tahmini süre + üretim gerekçesi.

## Kurallar

Günlük şablon (90 dakikalık bütçe için):

| Blok | Süre | İçerik |
|---|---|---|
| 1 | 25-30 dk | Okul ödevi / bugün işlenen konu |
| 2 | 25-30 dk | Matematik veya Türkçe (dönüşümlü, ikisi de haftada ≥3 gün) |
| 3 | 20-25 dk | Zayıf konu **veya** aralıklı tekrar (2-4 hafta öncesi) |

Fen, Sosyal ve İngilizce her gün değil; haftada 2-3 kez Blok 1 veya 2'de
dönüşümlü. Matematik ve Türkçe beceri dersi olduğu için sık; diğerleri bilgi
dersi olduğu için aralıklı tekrara daha uygun.

Ağırlık dağılımı:

- **%50** bu haftanın konusu (okulla senkron — sınıfta taze işlenen en kolay pekişir)
- **%30** zayıf konu (denemeden)
- **%20** aralıklı tekrar

Kesme kuralları:

- Bütçe küçükse **önce Blok 3 düşer**. Okul ödevi asla düşmez.
- Yapılmayan görev **birikmez**. Havuza döner, gelecek haftanın öncelik sırasına
  girer; günlük madde sayısı hiçbir koşulda artmaz.
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
