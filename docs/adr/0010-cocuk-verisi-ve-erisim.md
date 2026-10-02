# ADR-0010: Çocuk verisi ve erişim kontrolü ilkeleri

- **Durum:** Kabul
- **Tarih:** 2026-09-26

## Bağlam

Uygulama 11 yaşındaki çocukların sınav sonuçlarını, zayıf konularını ve günlük
çalışma davranışını işliyor. Ev içi prototipte veri kendi sunucumuzda; ticari
sürümde başka ailelerin çocuklarının verisi olacak. KVKK'da çocuk verisi ve veli
rızası ayrı bir hassasiyet alanı.

## Karar

Aşağıdaki ilkeler baştan kurulur, sonradan eklenmez:

1. **Veri minimizasyonu.** Yalnızca plan üretmek için gereken veri tutulur.
   Çocuğun adı dışında kimlik bilgisi, TC kimlik no, doğum tarihi tutulmaz.
   Okul/sınıf bilgisi gerekiyorsa en kaba düzeyde tutulur.
2. **Hesap velinin, profil çocuğun.** Hesap sahibi ve rıza veren taraf veli.
   Çocuk profili velinin hesabı altında yaşar.
3. **Silme hakkı işler durumda olmalı.** Veli hesabı sildiğinde çocuğa ait tüm
   veri silinir; "pasife alma" silme sayılmaz.
4. **Aydınlatma metni ve açık rıza** yayına çıkmanın önkoşulu, sonraki iş değil.
5. **Prototip erişimi kapalı.** Ev içi sürüm herkese açık bırakılmaz: Cloudflare
   Tunnel ile dışa port açılmadan yayınlanır, önüne Cloudflare Access konur ve
   yalnızca aile üyelerinin e-postaları yetkilendirilir.
6. **Kimlik bilgileri yalnızca sunucuda.** Üçüncü taraf sağlayıcı kimlik
   bilgileri (ADR-0003) ortam değişkeninde durur, istemciye hiçbir koşulda
   girmez, repoya girmez.
7. **Veri konumu.** Ticari sürüm ev sunucusunda çalıştırılmaz. Yedekleme,
   erişim kaydı ve olay müdahalesi gerektiren bir yükümlülük var; barındırma
   bu yükümlülüğü karşılayabilecek bir ortamda olmalı.

## Gerekçe

- Ücretsiz kullanıcı için de yükümlülük aynı (ADR-0006); "ödeme yok, sorumluluk
  yok" diye bir şey yok.
- Bu ilkeler sonradan eklenirse veri modelinin ve barındırmanın yeniden
  kurulması gerekir. Baştan uyulması ucuz, sonradan uyulması pahalı.

## Sonuçlar

- Çocuğa ait veriyi gösteren her ekran, o veriyi görmeye yetkili rolün
  (veli, öğretmeni, kendisi) kontrolünden geçer. Yetkilendirme API katmanında
  yapılır, istemcide gizlemekle yetinilmez.
- Öğretmenin gördüğü veri sınırlıdır: kendi sınıfındaki öğrencinin görev
  tamamlama durumu ve deneme netleri. Veliye özel notlar ve aile ayarları
  öğretmene açılmaz.
- Erişim kayıtları (kim hangi çocuğun verisine baktı) tutulur.
- Yayına çıkmadan önce bir hukuk gözden geçirmesi yapılmalı. Bu ADR hukuki görüş
  değil, mühendislik kısıtlarının listesidir.
