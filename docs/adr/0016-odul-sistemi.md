# ADR-0016: Ödül sistemi: ödülleri veli tanımlar, hedefi çocuk tamamlama ile açar

- **Durum:** Kabul
- **Tarih:** 2026-10-02

## Bağlam

ADR-0007 ödeyen ile kullananın ayrı kişi olduğunu, çocuğun ekranının "kısa, bitebilir,
ödüllü" olması gerektiğini söyledi (çocuk sevmezse açmaz, veli sonuç görmezse ödemez).
ADR-0008 öğrenci ekranında puandan söz etti ama ödülün ne olduğunu tanımlamadı.

## Karar

1. **Ödülü veli tanımlar ve verir.** Ödül gerçek dünyadadır ve velinin seçimidir
   (örn. sinema, bisiklet gezisi, bir oyun saati). Uygulama ödülü kendisi üretmez,
   sanal para ya da mağaza yoktur.
2. **Üç seviye:** günlük (küçük), haftalık, büyük (uzun vadeli; örn. dört haftalık).
   Veli her seviyeye bir ödül yazar; uygulama örnek öneriler sunar (örn. sevdiği
   menüde yemek, bir saat ek oyun konsolu/TV süresi, sevdiği maça gitmek ya da
   izlemek).
3. **Hedefi tamamlama belirler.** Bir ödülün açılma ölçütü *görev tamamlama oranı*dır
   (örn. haftanın görevlerinin %80'i). Doğru sayısı, net ya da süre ölçüt değildir;
   süre zaten manşet metrik olmaz (ADR-0009). Varsayılan eşikleri uygulama önerir,
   veli değiştirebilir.
4. **Ödülü veli teslim eder.** Hedef tamamlanınca veliye bildirim gider, veli
   "verildi" diye işaretler. Bu aynı zamanda tamamlama dürüstlüğünün doğal kontrolüdür.
5. **Çocuk ekranı ilerlemeyi gösterir:** "Haftalık ödülüne 2 görev kaldı." Kısa ve
   bitebilir; ödüle yaklaşma çubuğu, kutlama ekranı.
6. **Hedefler ödev ve planı kapsar.** Ödev tamamlama ücretsiz katmanda, plan
   görevleri ücretli katmanda çalıştığı için hedef bu kaynaklardan beslenir.

## Gerekçe

- Ödülü veli seçtiği için ailenin değerleriyle çelişmez, uygulama bir "ödül
  ekonomisi" kurmaz ve çocuk için karar yükü getirmez.
- Tamamlama ölçütü, çocuğu başarıya değil sürece yöneltir; düşük netli bir çocuk da
  ödülünü kazanabilir.
- Veli teslimi, sistemi sahte tiklemeye karşı korur ve velinin çocukla ilişkisini
  uygulamanın içine değil dışına taşır.

## Reddedilen alternatifler

**Seri (streak).** Alışkanlık için popüler, ama kaçırılan günü ve ADR-0009'un zorunlu
tuttuğu tam boş günü cezalandırır; bırakma sebebidir. Haftalık hedef kullanılır.

**Sıralama, rozet yarışı, çocuklar arası karşılaştırma.** Başka çocuğun verisini
göstermek ADR-0010'a aykırı; yarışma baskısı da 11 yaş için sağlıklı değil.

**Uygulama içi sanal para, mağaza, rastgele ödül (loot).** Çocuğa yönelik üründe
kumar benzeri mekanikler ve uygulamada harcama alışkanlığı istemeyiz.

**Performans (net/doğru sayısı) bazlı ödül.** Baskı ve kopya teşviki yaratır.

## Sonuçlar

- Çekirdekte: hedef ilerlemesini hesaplayan **saf fonksiyon** (`packages/core`,
  ADR-0002): girdi görev tamamlama durumu, çıktı ödül ilerlemesi.
- Veri modeli: `reward` (veli tanımlı serbest metin, seviye, hedef eşiği, teslim
  durumu). Veli hesabı silinirse birlikte silinir (ADR-0010 madde 3). Ödül metni
  çocuğu tanımlayan veri içermemelidir; arayüz bunu hatırlatır.
- Öğretmen ödülleri görmez (ADR-0010: aile ayarları öğretmene açılmaz).
- Veli ayar ekranı korkuluklu ve tavsiyelidir (ADR-0009 tarzı): ödülün "kutlama"
  olarak çerçevelenmesi, çok sık/çok büyük ödüle karşı öneri. Metinler sonra yazılır.
- **Açık:** ödül sisteminin katmanı. Önerim: ödev tamamlamaya bağlı ödül ücretsiz
  (çocuğun uygulamayı açma sebebi, dağıtım kanalı), plan görevlerine bağlı hedefler
  ücretli. Karar ADR-0014 çerçevesinde verilecek.
