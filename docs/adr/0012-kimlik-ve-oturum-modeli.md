# ADR-0012: Kimlik ve oturum modeli

- **Durum:** Kabul
- **Tarih:** 2026-10-02

## Bağlam

ADR-0010 hesabın velinin, profilin çocuğun olduğunu söyler. Çocuk (11 yaş)
uygulamaya kendi tabletinden, telefonundan ya da bilgisayarından girebilmeli. Veli
ve öğretmen kendi hesaplarıyla girer. Öğretmen davetleri link üzerinden gider
(ADR-0001). Çocuğun e-postası olmaz (ADR-0010 madde 1, veri minimizasyonu).

## Karar

- **Veli** e-posta + şifre ile üye olur. Aydınlatma metni ve açık rıza üyelik
  adımının parçasıdır (ADR-0010 madde 4).
- **Çocuk profilini veli oluşturur.** Profilde ad (takma ad olabilir), kullanıcı adı
  ve şifre vardır; e-posta, TC kimlik no, doğum tarihi yoktur. Profil velinin
  hesabına bağlıdır ve veli silindiğinde birlikte silinir (ADR-0010 madde 3).
- **Çocuk, kendi cihazından kullanıcı adı + şifre ile girer.** Oturumu yalnızca
  öğrenci ekranlarına ve yalnızca kendi verisine yetkilidir.
- **Çocuğun şifresini yalnızca veli sıfırlar.** Çocuğun e-postası olmadığı için
  başka yol yoktur. Veli, çocuğun tüm açık oturumlarını sonlandırabilir.
- **Öğretmen** e-posta ile üye olur, sınıf oluşturur ve **sınıf davet linki**
  üretir. Linki velilere kendisi iletir (WhatsApp vb.); uygulama velilerin iletişim
  bilgisini öğretmenden almaz ve saklamaz.
- **Veli linkle gelir:** üye olur ya da giriş yapar, çocuğunu sınıfa bağlar
  (mevcut profil ya da yeni profil). Çocuğun sınıfa bağlanması velinin rızasıdır;
  öğretmen çocuğun verisini ancak bu andan sonra, ADR-0010'daki sınırlı kapsamla
  görür. Veli çocuğu sınıftan çıkarabilir.
- Veli, öğretmen daveti olmadan da çocuklarını ekleyip kullanabilir (ücretsiz
  katman, ADR-0006).
- Roller: `student`, `guardian`, `teacher`, `admin`. Hepsi Better Auth üzerinde.

## Gerekçe

- Çocuğun kendi cihazından girebilmesi, ürünün çocuk tarafını (ADR-0007: çocuk
  sevmezse açmaz) kolaylaştırır; her seferinde velinin cihazına bağımlı olmak
  kullanımı düşürür.
- Sıfırlamayı veliye vermek, e-posta toplamadan hesap sahipliğini (ADR-0010
  madde 2) korur.
- Davetin sınıf düzeyinde link olması, veli iletişim verisi toplamayı gerektirmez
  ve ADR-0001'deki "link ile huni" ilkesine uyar.

## Reddedilen alternatifler

**Yalnızca veli oturumunda profil geçişi.** Veri minimizasyonu açısından en sade,
ama çocuk her seferinde velinin cihazına bağlı kalır. Çocuğun kendi cihazı
gereksinimini karşılamıyor. Aynı cihazda hızlı geçiş ileride eklenebilir.

**Çocuğa e-posta hesabı.** 11 yaşında e-posta toplamak ADR-0010 madde 1'e aykırı;
şifre sıfırlama ve hesap sahipliği de karmaşıklaşır.

**Öğretmenin veliye e-posta/telefonla doğrudan davet göndermesi.** Velinin
iletişim bilgisini bizim tutmamızı gerektirir ve gereksiz KVKK yükü getirir.

## Sonuçlar

- **Doğrulanacak:** Better Auth'ta `user.email` zorunlu ve benzersiz. Çocuk
  hesapları için e-posta alanı nasıl doldurulacak (ör. kullanılmayan, çözümlenemeyen
  yapay bir değer) ya da kullanıcı adı eklentisi yeterli mi, uygulama sırasında
  denenip bu ADR'ye not düşülecek. Çocuk için gerçek e-posta tutulmayacak.
- Çocuk girişi tahmin edilebilir bir yüzey: kullanıcı adı sistem tarafından
  önerilir, oran sınırlama (giriş denemesi) ve hesap kilitleme baştan konur.
- Yetkilendirme API'de çocuk ↔ veli ↔ sınıf ilişkisi üzerinden yapılır, her
  çağrıda. Erişim kaydı (ADR-0010) hangi oturumun hangi çocuğa baktığını tutar.
- Çocuk ilk girişte, yaşa uygun, sade ve görsel destekli bir aydınlatma ekranı
  görür (ADR-0010 madde 4'ün çocuk tarafı). Metnin içeriği hukuk gözden
  geçirmesinden çıkar.
- Açık kalan: **ikincil veli** (anne ve baba aynı çocuğu görsün mü). v1'de bir
  çocuk profili tek veli hesabına bağlıdır; ikinci veli ayrı bir karar.
