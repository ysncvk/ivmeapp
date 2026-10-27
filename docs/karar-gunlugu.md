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

### K-013: Erişim kaydı yalnızca öğretmen/admin görüntülemelerinde ✅
- **Ne:** `access_log` öğretmenin grup listesi görüntülemesinde yazılır. Veli/çocuğun kendi
  verisine erişimi kaydedilmez (kendi verisi).
- **Neden:** ADR-0010 erişim şeffaflığı; kendi verisini görmek denetim konusu değil.

### K-014: Plan yeniden kurma yalnızca ilerleme yokken ✅
- **Ne:** `plan.rebuild` bu haftada işaretlenmiş görev varsa `CONFLICT (has_progress)` döner.
  Ayar değişikliği ilerleyen haftalara (`effectiveFrom`) uygulanır.
- **Neden:** Çocuğun yaptığı işin kaybolmaması; ADR-0013 "ayar değişikliği geleceğe işler".

### K-015: Ödevin plana düştüğü gün ✅
- **Ne:** Teslim tarihi varsa teslimden önceki son çalışma günü, yoksa en yakın çalışma günü
  (`homeworkDay`). Ödev hiçbir zaman düşmez; yer yoksa `unplaced` olarak veliye bildirilir.

### K-016: MEB ders kitabı verisi olmayan derslerde haftalık kalem üretilmez ✅
- **Ne:** Kaynak seçilmemiş/müfredat bulunmayan ders (Sosyal, İngilizce) için plan görevi
  oluşmaz; yalnızca ödevler plana girer. Veri geldikçe kütüphaneye eklenir (K-008).

### K-017: Oran sınırı bellek içi, çocuk şifresi en az 6 karakter ✅💬
- **Ne:** Better Auth oran sınırı tek süreç belleğinde (v1 tek sunucu). Çocuk şifresi 6–64
  (11 yaşındaki çocuğun hatırlayabilmesi); veli şifresi en az 8. Çok sunuculu dağıtımda
  oran sınırı ikincil depoya taşınmalı.

### K-018: Web rotaları ve rol yönlendirmesi ✅
- **Ne:** `/giris` (veli/öğretmen e-posta, öğrenci kullanıcı adı), `/kayit` (veli ya da öğretmen),
  `/veli`, `/ogretmen`, `/ogrenci`, `/katil/:kod`. Her rota `requireRole` ile korunur; yanlış rol
  kendi ana ekranına yönlenir. Yetkilendirme asıl olarak API'dedir (ADR-0010), rota koruması yalnızca UX.
- **Davet:** oturum yoksa `/kayit?next=/katil/KOD` — veli kayıt olunca gruba katılma ekranına döner.

### K-019: Saklama süresi temizliği yalnızca plan verisini siler ✅
- **Ne:** Erişimi bitmiş aboneliklerde (iptalden `retainUntil`, bitmemiş denemede deneme bitişinden
  183 gün sonra) `plan` kayıtları silinir. Ödev, deneme ve ödül kayıtları ücretsiz katmandadır
  ve kalır. Pazar 18:00 (İstanbul) işi yalnızca erişimi olan çocuklar için gelecek haftayı kurar.

## Basit mod

### K-020: "Günlük soru hedefi" planın yanında, ondan bağımsız çalışan basit moddur ✅💬
- **Ne:** Veli ders başına günlük soru hedefi koyar (`daily_goal`), çocuk (ya da veli) her gün her
  derste çözülen soru sayısını yazar (`question_log`, mutlak değer; son 7 güne geri dönük
  düzeltilebilir). Veli ekranında haftalık toplam ve gün gün çubuklar, çocuk ekranında ders başına
  ilerleme çubuğu görünür. Çocuğun seçtiği kitap varsa hedef "yaklaşık N test" olarak da yazılır
  (hedef ÷ kitabın test başına soru sayısı).
- **Neden:** Evde pilotun sorusu "çocuk her gün çalışıyor mu, veli görebiliyor mu"; bunu yıllık plan,
  kitap eşlemesi ya da abonelik olmadan yanıtlar. İçerik (yıllık plan, kitap içindekileri)
  olmadan da diğer sınıflarda çalışır.
- **Kapsam dışı (bilinçli):** Hangi testten devam edileceğini izleme (imleç), doğru/yanlış sayısı,
  süre. Abonelik şartı yoktur, her zaman açıktır.
- **Plan ile ilişkisi:** Plan ve ödevler olduğu gibi çalışır. Hedef tanımlıysa öğrenci ekranında
  görev kartlarının üstünde, plan yoksa tek başına görünür.
- **Tartışılacak:** Pilot sonrası plan motoru ile birleştirme (hedefi test sırasına çevirmek) ya da
  planı arayüzde tamamen gizlemek.

### K-021: Soru hedefi ve koçluk birleşti: hedef ücretsiz, koçluk "hangi test"i söyler ✅💬
- **Ne:** Günlük soru hedefi (K-020) ücretsiz kalır. Ücretli koçluk açıkken aynı hedef günlük test
  sayısına çevrilir (`testsPerDay`, yukarı yuvarlar: 50 soru, test başına 12 soru → 5 test) ve motor
  her çalışma günü her hedefli derse tam o kadar test koyar (`PlanSettings.dailyTests`). Hedef varken
  günlük süre ayarı kullanılmaz, yük hedeften türer. Test işaretlemek o günün soru sayacına testin
  soru sayısını ekler, geri almak düşer (tek ilerleme ölçüsü çözülen sorudur). Okul ödevi bu yuvalara
  **ek** girer, hiçbir testi düşürmez. Hedef değişince işaretlenmemiş plan yeniden kurulur.
- **Ödül:** Plan görevi olmayan (ücretsiz) çocukta günlük hedefi tutturmak ödülü besler; planı olan
  çocukta görevler zaten hedefin karşılığı olduğu için çift sayılmaz.
- **Neden yukarı yuvarlama:** Çocuk önerilen testlerin hepsini bitirdiğinde hedef de tutmalı. Bedeli:
  hedefin en fazla bir test kadar (≈12 soru) üstünde yük.
- **Tartışılacak:** Ödevin yük sayılıp sayılmaması (şimdi ek), test başına soru sayısı bilinmeyen
  kitapta 12 varsayımı.

### K-022: Ödev geçmiş güne planlanmaz ✅
- **Ne:** `homeworkDay` bugünü bilir: bu haftaysa bugünden önceki günleri eler, teslim geçmişse bugüne
  koyar. Plana bağlı ama geçmiş güne düşüp yapılmamış ödev açık ödev listesinde kalır.
- **Neden:** Teslim tarihsiz ödev haftanın ilk gününe konuyor ve çocuğun ekranında hiç görünmüyordu
  (ADR-0013 madde 7: hafta içinde girilen ödev girildiği günden itibaren plana girer).

### K-023: Veli raporu ücretsiz; konu haritası ücretli ✅
- **Ne:** Haftalık özet (soru, çalışılan gün, hedef oranı, önceki haftayla fark, ödev, deneme), 8 haftalık
  gidişat, deneme trendi ve zayıf konular ücretsiz ("ne oldu", ADR-0006). Önümüzdeki 4 haftanın konu
  haritası ücretli (ADR-0013 madde 8, ADR-0014). Özet düz metin olarak paylaşılır/kopyalanır
  (e-posta/WhatsApp sağlayıcısı olmadığı için). Seri (streak) gösterilmez (ADR-0016).
- **Cümleler sayıya ek getirmez:** Türkçe ek uyumu (3'ünde/3'inde) sayıya bağlıdır; metinler ek
  gerektirmeyecek biçimde kurulur.
