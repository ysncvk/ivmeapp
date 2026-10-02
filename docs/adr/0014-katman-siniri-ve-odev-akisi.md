# ADR-0014: Katman sınırı, ödev akışı ve öğretmen görünürlüğü

- **Durum:** Kabul
- **Tarih:** 2026-10-02

## Bağlam

ADR-0006 ücretsiz "ne oldu", ücretli "ne yapmalı" sınırını çizdi ve öğretmen
tarafını v1'de minimumda tuttu (ödev atama v1'de yok). ADR-0007 öğretmen
hesabını ücretsiz dağıtım kanalı yaptı. Konuşma sonrası iki netlik geldi: öğretmen
ödevi v1'de olacak, ve "plan" ürünün bütünüyle ücretli parçası.

## Karar

1. **Ücretsiz katman:**
   - Deneme grafikleri, ders/konu bazında doğru-yanlış dağılımı, zayıf konu teşhisi.
   - **Ödev:** öğretmenin atadığı ya da velinin girdiği ödevi veli ve öğrenci görür,
     "tamamlandı" işaretler, takip eder.
   - **Öğretmen paneli tamamen ücretsiz:** sınıf oluşturma, davet, ödev atama,
     kim yaptı/yapmadı.
2. **Ücretli katman: gün gün plan.** Plan üretimi, kaynak seçimi (MEB ders kitabı
   dahil), plan ayarları, kapsama uyarısı, görev taşıma (ADR-0013) ücretlidir.
   Yalnızca MEB kitabına göre kurulan plan da ücretlidir; ayrı bir "temel plan"
   katmanı yoktur.
3. **Öğretmen ödev atama (v1) kapsamı dardır:** başlık, açıklama, ders, teslim
   tarihi, sınıfa atama; öğrenci/veli tamamlama işaretler; öğretmen kim
   tamamladı görür. **v1'de yok:** puanlama, dosya yükleme, mesajlaşma, sınıf
   analitiği (ADR-0006'daki bu sınır korunur).
4. **Atanan ödev plana girer.** Ücretli velinin planında Blok 1'e okul ödevi
   olarak yerleşir (ADR-0013 madde 7); ücretsiz velide liste olarak görünür.
5. **Öğretmen görünürlüğü:** yalnızca ödev tamamlama durumu ve deneme netleri
   (ADR-0010). Öğretmen ne abonelik durumunu ne **plan görevlerini** görür; aksi
   halde ücretli olan çocuk fazladan görevlerinden dolaylı olarak ayırt edilir.
6. **Kartsız kayıt ve kartsız deneme.** Ücretsiz katman ödeme aracı istemez.
   Bir haftalık deneme (ADR-0006) otomatik ücretlendirmeye dönmez; veli aboneliği
   kendisi başlatır.
7. **Paywall şeffaftır:** ücretsiz kısmın ücretsiz kaldığını açıkça söyler
   ("ödev takibi her zaman ücretsizdir"), neyin ücretli olduğunu net yazar.
8. **Pazarlama bildirimi ayrı, isteğe bağlı onaydır.** Üyelik onayından ayrı
   bir kutu; işaretlenmeden pazarlama bildirimi gönderilmez. Haftalık özetin
   (ADR-0009) hizmet bildirimi mi pazarlama mı sayılacağı hukuk sorusudur.
9. **Yetki tek noktada:** katman kontrolü API'de tek bir yetki katmanından geçer
   (ADR-0013 sonucu), sınır değişirse tek yer değişir.

## Gerekçe

- Öğretmenin günlük işine yarayan şey ödev; öğretmen ödev vermiyorsa panele
  girmez, dağıtım kanalı (ADR-0007) çalışmaz. Ödevi ücretsiz tutmak, öğretmenin
  veliden ücret isteyen bir araç yerine ücretsiz ajanda kullanan kişi olmasını
  sağlar.
- Plan tek, net bir ücretli sınır olduğunda satış cümlesi basit kalır:
  "teşhis ve ödev ücretsiz, program ücretli".
- Öğretmenin plan görevlerini görmemesi, hem ayrımcılık algısını hem de
  ADR-0010'daki sınırlı görünürlüğü korur.

## Reddedilen alternatifler

**Öğretmen ödev atamayı v2'ye bırakmak (ADR-0006'nın ilk hali).** Ürünü küçük
tutardı, ama öğretmen kanalı ödev olmadan çekim gücünü kaybeder. Kapsam dar
tutularak (madde 3) maliyet sınırlandı.

**MEB kitabına göre temel planı ücretsiz yapmak.** Büyümeyi kolaylaştırırdı ama
ücretli geçiş sebebini azaltır, destek ve işletme yükünü (ADR-0006) artırır.
Sınır da karmaşıklaşırdı.

**Öğretmene abonelik durumunu göstermek.** Satış baskısı ve ayrımcılık algısı
yaratır; ADR-0010'daki aile ayarlarının öğretmene kapalı olması ilkesine de aykırı.

## Sonuçlar

- **Bedel:** ADR-0007'deki "ödeme getirmeyen tarafa ay harcanmaz" ilkesine kısmi
  taviz. Öğretmen tarafının kapsamı madde 3'teki dar sınırda tutulur; sınırı
  genişletmek yeni bir karar gerektirir.
- ADR-0006 ve ADR-0007'nin durumu *"Kabul (kısmen değiştirildi: ADR-0014)"* olur.
- Veri modeli: `assignment` (sınıfa bağlı, teslim tarihli) ile veli/öğrenci
  tarafından girilen ödev aynı yapıda, kaynağı (`teacher` / `guardian` / `student`)
  ile ayrışır.
- Öğretmenin ekranı plan görevi verisini hiçbir sorguda içermez; bu API
  yetkilendirmesinde test edilir (ADR-0010).
- **Arayüz dili:** öğretmen tarafında "sınıf" yerine "çalışma grubu" kullanılır,
  resmi okul algısından kaçınmak için. Veri modelinde ve ADR'lerde terim `class`
  ("sınıf") kalabilir; bu yalnızca arayüz metnidir.
- **Öğretmen davet mesajı:** öğretmene hazır bir davet metni sunulur; ödev
  takibinin ücretsiz olduğunu ve kart bilgisi gerekmediğini belirtir. Metin hukuk
  gözden geçirmesinden geçer.

## Güncelleme (2026-10-02): konu haritası, fiyat birimi, iptal

- **Aylık konu haritası ücretlidir** (ADR-0013 madde 8): "ne çalışmalı" sorusunu
  cevapladığı için plan tarafındadır. Ücretsiz katman: ödev takibi (öğretmen ya da
  veli girer), manuel deneme girişi, grafikler, ders/konu dağılımı ve zayıf konu
  teşhisi. Ücretli: konu haritası ve gün gün plan.
- **Abonelik çocuk başınadır,** aile başına değil. Katman yetkisi çocuk
  profili düzeyinde kontrol edilir (madde 9'daki tek yetki katmanı çocuk bazında
  çalışır). Birden fazla çocuk için indirim ya da paket sonraya kalır.
- **İptal.** Abonelik biterse ücretsiz katmana dönülür, plan üretimi durur.
  Ücretli kullanıma ait veri (plan ayarları, kaynak seçimleri, plan geçmişi, taşıma
  kayıtları) **6 ay saklanır;** bu sürede yeniden abone olunursa kaldığı yerden
  devam edilir, olunmazsa silinir. Ödev, deneme ve profil verisi ücretsiz katmanda
  zaten devam eder. Bu, hesap silme değildir: veli hesabı silerse çocuğa ait tüm
  veri hemen silinir (ADR-0010 madde 3). 6 ay süresi ve aydınlatma metnindeki yeri
  hukuk onayına bağlıdır.
- Fiyat (300-500 TL aralığı konuşuldu) ve yıllık paket indirimi açık kalmaya devam
  eder.
