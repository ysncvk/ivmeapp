# Bulutta deneme kurulumu (Render + Neon)

Pilot öncesi hızlı deneme içindir: uygulama Render'ın ücretsiz web servisinde, veritabanı Neon'un
ücretsiz Postgres'inde çalışır. Kalıcı kurulum için `docs/kurulum-linux.md` (evde) geçerlidir.

> **Yalnızca sahte test verisi gir.** Çocuk verisini ücretsiz bir bulut sağlayıcıda tutmak veri
> konumu, yedekleme ve KVKK açısından ayrı bir karardır (ADR-0010 madde 7, `docs/hukuk-*.md`).
> Gerçek çocuk adı, gerçek soru sayıları vb. bu ortama girilmez.

Ücretsiz katman koşulları sık değişir; kullanmadan önce sağlayıcının kendi fiyat sayfasına bak.
Mimari: tek Node süreci hem API'yi hem derlenmiş web arayüzünü sunar (`render.yaml`).

## 1. Neon: veritabanı
1. neon.com → proje oluştur. Bölge: **AWS Frankfurt (eu-central-1)**, Render ile aynı bölge.
2. **Connect** penceresinde **doğrudan (direct, pooled OLMAYAN)** bağlantı dizesini kopyala:
   `postgres://KULLANICI:ŞİFRE@ep-....eu-central-1.aws.neon.tech/neondb?sslmode=require`.
   Migration (DDL) havuzlayıcı üzerinden sorun çıkarabilir; trafik küçük olduğundan doğrudan
   adres hem migration hem uygulama için yeterlidir.
3. Bu dizeyi sohbete yazma; yalnızca 2. adımda Render paneline gir.

## 2. Render: servis
1. render.yaml dosyası repoda. render.com → **New → Blueprint** → GitHub'dan `ysncvk/ivmeapp`
   reposunu bağla, dal olarak `claude/keen-clarke-sgusrp` (birleştirildiyse `main`) seç.
2. Render, istenen değişkenleri sorar:
   - `DATABASE_URL`: Neon'dan kopyaladığın doğrudan dize.
   - `BETTER_AUTH_URL`, `CORS_ORIGIN`, `VITE_SERVER_URL`: üçüne de aynı değer, servisin adresi:
     `https://ivme.onrender.com`. Ad başkasında kullanılıyorsa Render sonuna rastgele ek koyar;
     gerçek adres servis sayfasının en üstünde yazar. **Üçü de adresle birebir aynı olmalı**
     (https dahil, sonda `/` yok).
   - `BETTER_AUTH_SECRET` kendiliğinden üretilir.
3. İlk derleme birkaç dakika sürer. Derleme sırasında migration da çalışır.
4. İlk deploy'da adres tahminden farklı çıktıysa: servis → **Environment** → üç değişkeni gerçek
   adresle güncelle, kaydet. Render yeniden derler (web adresi derlemede gömülür).

## 3. Dene
- Tarayıcıda servis adresini aç. Uykudaysa ilk açılış yaklaşık bir dakika sürer.
- `/kayit` → **Veliyim** → rıza → çocuk ekle (kullanıcı adı + şifre) → ayarlardan en az bir kitap seç.
- **Günlük soru hedefi** kartından ders başına hedef belirle.
- Başka bir tarayıcı/telefonda `/giris` → **Öğrenci** → çocuğun kullanıcı adı ve şifresi.
- Haftalık plan için velinin ekranındaki **deneme** düğmesi bir haftalık plan erişimi açar
  (ücretsiz planda `pnpm sub:activate` için kabuk erişimi yoktur, gerekmez).
- Seed hesapları (`veli@ivme.test` vb.) bu ortamda kurulu değildir; hesapları kayıt ekranından aç.

## Bilmen gerekenler
- **Uyku:** Ücretsiz servis 15 dakika istek almazsa uyur. Çocuk ilk açışta bir dakika bekler.
- **Zamanlanmış işler (worker) çalışmaz.** Pazar akşamı plan üretimi ve saklama süresi temizliği
  yok. Planlar ilk açılışta kurulur, günlük soru hedefi bundan etkilenmez.
- **Oran sınırı bellek içidir** (K-017): servis her uyanışta sıfırlanır.
- **Neon da uyur** (5 dk boşta): ilk sorgu birkaç saniye geç gelir.
- **Veri sınırı:** ücretsiz planda 0,5 GB depolama; pilot için fazlasıyla yeter.
- **Güncelleme:** dala push edince Render otomatik derler ve migration'ları uygular.
- **Evdeki makineye geçiş** her zaman mümkündür: `docs/kurulum-linux.md`. Veriyi taşımak için
  `pg_dump "$NEON_URL" | gzip` ile alıp yeni veritabanına `psql` ile yüklersin.

## Sorun giderme
- **Giriş yapılamıyor / çerez kaydolmuyor:** `BETTER_AUTH_URL` ve `CORS_ORIGIN` tam adresle aynı mı?
- **Sayfa açılıyor ama veri gelmiyor:** `VITE_SERVER_URL` yanlış adresle derlenmiş olabilir;
  değiştirip yeniden deploy et.
- **Derleme migration'da düşüyor:** `DATABASE_URL` sonunda `?sslmode=require` var mı, havuzlayıcı
  (`-pooler`) adresi değil doğrudan adres mi?
- **Loglar:** Render servis sayfasında **Logs**.
