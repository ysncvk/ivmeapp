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
