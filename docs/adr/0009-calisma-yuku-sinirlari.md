# ADR-0009: Günlük yük üst sınırı motorun aşamayacağı bir kısıttır

- **Durum:** Kabul (kısmen değiştirildi: ADR-0013)
- **Tarih:** 2026-09-27

## Bağlam

6. sınıf (11 yaş) için uygun günlük çalışma süresi araştırıldı. Yaygın kabul
gören "10 dakika kuralı" sınıf başına 10 dakika ödev öngörüyor — 6. sınıf için
60 dakika. Harris Cooper'ın ödev meta-analizleri ortaokulda faydanın 90 dakika
civarında düzleştiğini, sonrasında ek kazanç olmadığını gösteriyor. Bu ölçütler
ABD kaynaklı; Türkiye'de okul saatleri daha uzun olduğundan aralığın alt ucu
daha uygun.

Ayrıca: Türk velisi "günde 1,5 saat" ifadesini hafif bulma eğiliminde. Bu pazar
gerçeği, ama rakamı şişirmek ürünü çalışmaz hale getirir ve iptal üretir.

## Karar

1. Hafta içi varsayılan bütçe **90 dakika, okul ödevi dahil**. Veli
   değiştirebilir; 2 saatin üstünde uyarı gösterilir.
2. Bütçe motor için bir hedef değil **aşılamaz kısıttır**. Motor görev ekleyemez,
   yalnızca önceliklendirip keser (ADR-0005).
3. Bloklar 20-30 dakika, aralarda mola. 11 yaşında kesintisiz odak süresi bu
   civarda.
4. Hafta içi **5 gün**; haftada en az **bir gün tamamen boş**.
5. Hafta sonu uzatma yalnızca **farklı iş** için: cumartesi 60-90 dk deneme +
   30-40 dk yanlış analizi. "Hafta içi yapılamayanı tamamlama günü" değildir.
6. **Kitap okuma günde 30 dk, bütçe dışı.** Çocuk kitabı kendi seçer, yatmadan
   önce, okuduğu sınanmaz.
7. **Süre kullanıcıya gösterilen manşet metrik değildir.** Ekranda görev sayısı
   ve konu adı durur ("Bugün 4 görev — kesirler, paragraf"), dakika durmaz.
8. Pazarlamada **haftalık** rakam kullanılır (~13-14 saat/hafta), üründe günlük
   plan uygulanır. Aynı yük, doğru çerçeveleme.

## Gerekçe

- Neti yükselten iki şey: **kaç gün** çalışıldığı ve **yanlış analizinin
  kalitesi**. Günde 30 dk × 6 gün, günde 2 saat × 2 günü döver. Bir okul yılında
  sürdürülebilir plan (~270 saat) çöken iddialı planı (~100 saat) 2,5 katla geçer.
- Her gün bitirilemeyen liste, bırakma sebebidir. Piyasadaki uygulamaların çoğu
  toplar, hiç çıkarmaz. "Bugün bu kadar" diyebilmek ürünün farkıdır.
- 6. sınıf sınav yılı değil (LGS 8'de). Şimdiki hedef alışkanlık ve temel;
  çocuğu şimdi yormak 8. sınıftaki kapasiteyi harcar.
- Bu yaşta 9-11 saat uyku gerekiyor ve öğrenilen orada pekişiyor. Uykudan kısan
  plan net olarak zararlıdır.

## Sonuçlar

- Veliye sunulan ayar ekranı korkuluklu: varsayılan 90 dk, 2 saat üstü uyarı
  metni, çok yüksek değerlerde daha açık uyarı. Çoğu veli varsayılanı değiştirmez
  ama değiştirebildiğini görmek kontrol ihtiyacını karşılar.
- Veli araştırmasında sorular **davranış** üzerine kurulur, temenni üzerine değil:
  "kesintisiz kaç dakika oturabiliyor", "son programı üst üste kaç gün
  uygulayabildiniz", "ödev fiilen ne kadar sürüyor", "en son hangi hafta hiç
  çalışmadı".
- Veliye haftalık özet için WhatsApp/e-posta tercih edilir; iOS'ta PWA push
  kısıtları (Ana Ekrana Ekle şartı) nedeniyle de, açılma oranı nedeniyle de.
  Retansiyonu koruyan bildirim veliye gidendir, çocuğa gideni değil.

## Güncelleme (2026-10-02, ADR-0013)

Karar 2 ("bütçe aşılamaz kısıt") velinin **kendi verdiği bütçe** için geçerlidir.
Veli bütçeyi serbestçe belirler; 2 saat üstü ve çok yüksek değerlerdeki uyarılar
(karar 1) tavsiyedir, engel değildir. Günde en fazla 3 madde gibi sabit bir madde
sınırı yoktur, madde sayısı bütçeden türer. Blok süresi (karar 3) çocuğa özeldir: veli çocuk profilinde "kesintisiz kaç dakika
dikkatli çalışıyor" sorusunu yanıtlar, uygulama 25-30 dk tavsiye eder, 20-30 dk
aralığı artık tavsiyedir, sabit sınır değil. Değişmeyenler: haftada
en az bir tam boş gün (haftada en fazla 6 çalışma günü), kitap okumanın bütçe dışı
olması, süre manşet metrik olmaması.
