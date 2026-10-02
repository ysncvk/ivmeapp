# ADR-0001: İstemci PWA olarak yazılır, native kabuk sonraya bırakılır

- **Durum:** Kabul
- **Tarih:** 2026-09-26

## Bağlam

Uygulama dört rol taşıyacak: öğrenci, veli, öğretmen, admin. Öğretmen davetleri
link üzerinden gidecek. Geliştirme tek kişi tarafından yapılıyor. Ev içi ilk
kullanım üç iPhone üzerinde olacak. Mevcut birikim React, Tailwind ve shadcn/ui
üzerine; daha önce üç yıl ayakta kalmış bir PWA yayınlanmış, web push dahil.

## Karar

İstemci tek bir web uygulaması (PWA) olarak yazılır. Mağazaya çıkış gerektiğinde
aynı kod Capacitor ile sarılır. React Native kullanılmaz.

## Gerekçe

- **Öğretmen paneli ve admin paneli her durumda web gerektiriyor.** Gerçek React
  Native'e gidilirse mobil için RN, yönetim için web olmak üzere iki arayüz
  sürekli bakım ister. Tek kişilik ekipte bu en pahalı kalem.
- **Davet hunisi link ile çalışır.** "Uygulamayı indir, hesap aç" adımı eklemek
  öğretmen kanalındaki dönüşümü düşürür. Dağıtım modeli web'i tercih ediyor.
- **shadcn/ui ve Tailwind birikimi DOM'a bağlı.** RN'de kullanılamaz.
- **PWA → Capacitor geçişi yeniden yazım değildir**, aynı kodun sarılmasıdır.
  PWA → RN geçişi ise arayüzün tamamen yeniden yazılması olurdu.
- Bu ortamda (bulut konteyneri) iOS simülatörü ve EAS derlemesi çalıştırılamıyor;
  web'de üretilen arayüz burada açılıp görülebiliyor. Geri bildirim döngüsü
  web'de belirgin biçimde hızlı.

## Reddedilen alternatifler

**React Native + Expo.** Expo Go'nun QR ile anında test imkânı gerçek bir
avantaj. Ancak uzak push bildirimleri Expo Go'da Android'de SDK 53'ten itibaren
çalışmıyor, iOS'ta gerçek push için APNs anahtarı yani ücretli Apple hesabı
gerekiyor. Yani "2 günde kur, bildirimler sorunsuz" paketi mevcut değil.
Maliyet kod yazmakta değil sürüm hattında: EAS derlemeleri, SDK kırılmaları,
sertifika yönetimi, her değişiklikte mağaza süreci, TestFlight'ın 90 günlük
yenilenmesi.

**Baştan mağaza hedefli kurulum.** Ödeme yapan kullanıcı yokken 99 USD/yıl ve
mağaza süreci erken maliyet. Karar ertelenebilir ve ertelemek bedava.

## Sonuçlar

- Mağazaya çıkış kapanmıyor, sıraya giriyor: PWA yayınla → gerçek kullanımla
  doğrula → Apple hesabı → Capacitor → mağaza.
- Capacitor'a geçerken Apple'ın 4.2 "minimum işlevsellik" kuralı gözetilmeli:
  native push, çevrimdışı çalışma ve native geçişler eklenmeli. Siteyi olduğu
  gibi saran uygulamalar reddediliyor.
- Capacitor'da web push değil `@capacitor/push-notifications` üzerinden doğrudan
  APNs kullanılır; service worker push yolu devreye girmez.
- iOS'ta PWA web push için "Ana Ekrana Ekle" şartı var. Öğrenci tarafı için
  kabul edilebilir; veli tarafındaki haftalık özet için WhatsApp/e-posta
  tercih edilir (bkz. ADR-0009 ve ürün notları).
