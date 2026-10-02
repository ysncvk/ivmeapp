# Karar günlüğü (otonom çalışma)

Kullanıcı yokken alınan, ADR kadar büyük olmayan ya da ADR'lerin boşluğunu dolduran
kararlar burada tutulur. Her kayıt: **ne, neden, alternatif, tartışılacak mı**. Büyük ya da
geri dönüşü pahalı kararlar ayrıca ADR olur. Kullanıcı gözden geçirdiğinde kayıtlar
onaylanır ya da değiştirilir.

Durum: ✅ uygulandı · 💬 tartışılacak · 🔁 geri alınabilir

---

## Müfredat verisi

### K-001: Yıllık plan dosyaları kodla içe aktarılır, elle yazılmaz ✅
- **Ne:** Excel/Word yıllık planlar `packages/library/scripts/` altındaki betiklerle TypeScript
  veriye dönüştürülür (`*.weeks.ts`, "otomatik üretildi" başlıklı). Elle yazılan dosya yalnızca
  ünite/konu tanımı ve kitap eşleşme ifadelerini (`match`) taşır.
- **Neden:** Hafta, tarih, kazanım kodu gibi çok sayıda satırı elle girmek hata üretir; betik
  tekrar çalıştırılabilir (yeni yıl, yeni ders). Doğrulama (`validateCurriculum`) ve testler
  veri kalitesini yakalar.
- **Alternatif:** Elle aktarım (hata riski), veritabanına doğrudan yükleme (admin ekranı henüz yok).
- **Tartışılacak:** Evet, admin ekranı gelince bu betikler admin içe aktarmasına dönüşebilir.

### K-002: Matematik tema sırası özetteki sıra değil, yıllık plandaki sıradır ✅
- **Ne:** Önceki özetteki sıra (Olasılık sonda) yanlıştı. Gerçek plan: Sayılar (1) → Veriden
  Olasılığa → Sayılar (2) → İstatistik → Geometrik Şekiller → Cebirsel → Geometrik Nicelikler.
  `matematik6` buna göre yeniden yazıldı, kitap sırasıyla da uyumlu.
- **Neden:** Resmî yıllık plan dosyası özetten daha güvenilir.

### K-003: Kitap-müfredat eşleşmesi konu adı ifadeleriyle yapılır (`match`) ✅🔁
- **Ne:** Müfredat konusu ↔ kitap konusu eşleşmesi küçük harf/aksansız "içerir" ifadeleriyle.
  Ünite başlığı yalnızca `(Başlık)` biçiminde eşleşir (serbest eşleşme yanlış pozitif verdi).
- **Neden:** Kitap yayınevlerinin konu adlandırması farklıdır; kazanım kodu eşleşmesi kitaplarda
  yok. İfadeler görünür ve düzeltilebilir. Eşleşmeyen testler düşmez, havuzun arkasında kalır.
- **Alternatif:** Kazanım kodu eşleşmesi (kitaplarda kod yok), embedding/yapay zekâ eşleşmesi (v2).
- **Tartışılacak:** Evet: `match` ifadelerini ben önerdim, bir alan uzmanı doğrulamalı.

### K-004: Türkçe planı dönem tabanlı, haftaya türetilerek kullanılır ✅
- **Ne:** Türkçe yıllık planı hafta değil dönem (~8 ders saati, bir tema + bir metin) bazlı.
  İçe aktarıcı, her takvim haftasını (tatil haftaları hariç) o haftayla en çok iş günü kesişen
  dönem(ler)e bağlar; en az 2 iş günü kesişen dönemler de eklenir (dönem geçişi haftası iki
  metin taşır). Dönemler arası boşlukta önceki dönem sürer.
- **Neden:** Motor ve ekranlar tek bir "hafta" modeliyle çalışır; üç ders de aynı arayüzle
  (`weekFor`, `weekPool`) tüketilir.
- **Varsayım:** Türkçe haftalık ders saati 6 alındı (8 saatlik dönem ≈ 9 gün). Planda yazmıyor.
- **Tartışılacak:** Evet, haftalık süre ve dönem-hafta eşlemesi doğrulanmalı.

### K-005: Dersler arası hafta numarası eşleşmez, tarihle eşleşir ✅
- **Ne:** Fen planı Kurban Bayramı haftasını (17-21 Mayıs) atlıyor, Matematik ve Türkçe
  planları atlamıyor; bu yüzden 31. haftadan sonra numaralar kayıyor. Hiçbir yerde "N. hafta"
  dersler arası karşılaştırılmaz; her ders `weekFor(tarih)` ile kendi haftasını bulur.
- **Neden:** Kaynaklar farklı (Excel, Word, Word), takvim detayları farklı.

### K-006: Okulun temposu planla örtüşmeyebilir: veli "hangi haftadayız" düzeltmesi yapar 💬
- **Ne:** Yıllık plan MEB çerçevesidir; okullar/öğretmenler kayabilir. Çocuk-ders başına bir
  "hafta kaydırma" (offset) ayarı tutulacak; plan üretiminde `weekFor(tarih - offset)` kullanılır.
  ADR-0004'teki "birkaç haftada bir düzeltme" ihtiyacının karşılığı.
- **Alternatif:** Plana hiç dokunulmaması (okulla senkron ilkesi bozulur).
- **Tartışılacak:** Arayüzü (hafta seç mi, ünite seç mi) tasarım sırasında netleşir.

## Veri modeli ve kimlik

### K-007: Çocuk, Better Auth'ta ayrı bir kullanıcıdır; e-posta alanı yapay bir değerdir ✅
- **Ne:** `user.role = 'student'`, kullanıcı adı + şifre girişi (username eklentisi). Better Auth
  `user.email` zorunlu ve benzersiz olduğu için çocuğa `<id>@cocuk.ivme.invalid` gibi
  çözümlenemeyen bir değer verilir; gerçek e-posta hiçbir yerde tutulmaz (ADR-0012 sonuç notu).
  `child` kaydı velinin hesabına bağlıdır (`guardian_id`), silme zinciri `deleteGuardianAccount`.
- **Neden:** ADR-0012 çocuğun kendi cihazından giriş yapabilmesini ister, e-posta toplamamayı da.
- **Alternatif:** Ayrı bir çocuk kimlik doğrulama sistemi (ikinci oturum mekanizması, bakım yükü).

### K-008: Kütüphane ve müfredat v1'de kodda, veritabanında değil ✅🔁
- **Ne:** Kitaplar ve yıllık planlar `packages/library` içinde TypeScript verisi; DB yalnızca
  kullanıcı verisi ve kimlik (kitap/ünite kimliği) tutar.
- **Neden:** Veri sürümlenir, testlenir, kod incelemesinden geçer; admin ekranı yok; derleme
  zamanında doğrulanır. Admin ekranı gelince DB'ye taşınır (ADR-0004 admin ekranı).
- **Tartışılacak:** Evet, içerik güncellemesi için dağıtım gerektirir.

### K-009: Abonelik tablosu yalnızca yetki durumunu tutar, ödeme entegrasyonu yok ✅💬
- **Ne:** `subscription` (çocuk başına): trial/active/canceled, deneme ve dönem tarihleri,
  iptal sonrası `retain_until` (6 ay). Ödeme sağlayıcısı (iyzico/Stripe vb.) seçimi ve webhook
  henüz yok; `provider`/`provider_ref` alanları hazır.
- **Neden:** Sağlayıcı seçimi hukuk (mesafeli satış, ADR-0014) ve işletme kararı.

### K-010: Admin rolü çocuk verisine erişmez (v1) ✅💬
- **Ne:** Admin yalnızca kütüphane/kullanıcı yönetimi içindir; çocuk verisi API'de admine
  kapalı. Destek için erişim gerekirse ayrı karar ve erişim kaydı ile eklenir.
- **Neden:** ADR-0010 erişim minimizasyonu.

### K-011: Pre-release olduğu için migration'lar tek `init`'e indirildi ✅
- **Ne:** Henüz hiçbir ortamda uygulanmamış migration'lar silinip şema bütünüyle yeniden
  üretildi. Bundan sonra her şema değişikliği yeni migration'dır.

### K-012: Entegrasyon testleri gerçek Postgres kullanır (Docker yoksa geçici küme) ✅
- **Ne:** `createTestDatabase(suite)` (WMS kalıbı): paket başına ayrı DB, commit'li
  migration'lardan kurulur. `scripts/test-pg.sh start` Docker'sız geçici bir Postgres açar;
  CI'da servis konteyneri kullanılır. `TEST_DATABASE_URL` ile taban verilir.
