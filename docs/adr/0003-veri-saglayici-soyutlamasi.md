# ADR-0003: Deneme verisi sağlayıcı arayüzü arkasından gelir

- **Durum:** Kabul
- **Tarih:** 2026-09-26

## Bağlam

Ev içi prototipte deneme sonuçları Okulizyon (OrbimSoft ürünü) üzerinden
alınacak: sunucuda gece çalışan bir script öğrenci hesabıyla giriş yapıp yeni
sonuçları çekiyor. Bu, kendi çocuğunun kendi verisi için savunulabilir bir
çözüm. Ticari ürün için değildir.

## Karar

Deneme verisi uygulamaya **sağlayıcı (provider) arayüzü** arkasından girer.
Okulizyon toplayıcısı bu arayüzün yalnızca bir uygulamasıdır ve yalnızca ev içi
kullanım için vardır. Ticari sürümde veri ya kullanıcıdan gelir (manuel giriş,
karne fotoğrafı okuma) ya da kurumla anlaşma yoluyla gelir.

## Gerekçe

- Binlerce kullanıcının hesap bilgisiyle üçüncü taraf bir sisteme girip veri
  çeken bir ürün satmak kullanım şartlarına takılır, karşı tarafın tek satır
  değişikliğiyle durur ve üzerine şirket kurulacak bir zemin değildir.
- Veriler okullara ait; aracı sistemin sahibi başka bir şirket.
- Soyutlama, prototipten ürüne geçişin en pahalı kısmını baştan çözer: sağlayıcı
  değiştiğinde üst katmanların hiçbiri değişmez.

## Sonuçlar

- Arayüz en az şunları döndürür: deneme kimliği, ad, tarih, ders bazında
  (soru/doğru/yanlış/boş/net), varsa soru bazında (ders, soru no, konu,
  kazanım, verilen cevap, doğru cevap, durum), varsa sıralama.
- **Soru bazlı konu/kazanım verisi en değerli alandır.** Ders bazlı net yalnızca
  "matematik zayıf" der; soru bazlı veri "kesirlerde üç denemedir aynı hata"
  demeyi sağlar. Plan kalitesi buna bağlı.
- Ham yanıt (`raw`) saklanır; yeni bir alana ihtiyaç duyulduğunda kaynağa tekrar
  gidilmeden yeniden ayrıştırılabilir.
- Ev içi toplayıcı için: giriş TC kimlik no ile değil öğrenci no ile yapılır,
  kimlik bilgileri yalnızca sunucuda ortam değişkeninde tutulur, istemciye
  hiçbir koşulda girmez, günde bir kez ve yalnızca kendi hesabı için çalışır.
- Manuel giriş yolu ticari sürümde **birinci sınıf vatandaş** olarak tasarlanır,
  sonradan eklenen bir yedek olarak değil.

## Not (2026-10-02)

Karar değişmedi, kapsam netleşti (ADR-0015): v1'de manuel deneme girişi arayüzün ilk
uygulamasıdır; Okulizyon toplayıcısı v2'ye bırakıldı.
