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
