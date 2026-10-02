# ADR-0015: v1 kapsamı: manuel deneme girişi; Okulizyon ve yapay zekâ v2

- **Durum:** Kabul
- **Tarih:** 2026-10-02

## Bağlam

ADR-0003 deneme verisini sağlayıcı arayüzü arkasına koydu; Okulizyon toplayıcısı ev
içi prototip için. ADR-0006 ücretsiz katmanın çekirdeğini deneme grafikleri ve zayıf
konu teşhisi olarak çizdi, ADR-0005 planın %30'unu zayıf konulara bağladı. İlk
sürümü küçük tutmak gerekiyor; hangi parçaların ertelenebileceği netleşmeliydi.

## Karar

1. **v1'de deneme verisi manuel girilir.** Veli deneme sonucunu elle girer: ders
   bazında net ve zorlandığı konular (müfredat listesinden işaretleme). Soru bazlı
   giriş v1'de yoktur. Teşhis ve zayıf konu bu veriden beslenir; ADR-0006 ve
   ADR-0005'teki rolleri değişmez.
2. **Manuel giriş `ExamProvider` arayüzünün ilk uygulamasıdır** (ADR-0003: manuel
   giriş birinci sınıf vatandaş). Arayüz v1'de yerindedir, böylece sağlayıcılar
   sonradan eklenir.
3. **Okulizyon toplayıcısı v2'ye bırakılır.** Yalnızca ev içi prototip için
   (ADR-0003, ADR-0010 madde 5-6); v1 ticari kapsamında yoktur.
4. **Yapay zekâ v2'ye bırakılır.** Eklendiğinde ADR-0005'teki sınır geçerlidir: plan
   üretimi kural motorunda kalır, yapay zekâ yalnızca haftalık değerlendirme/yorum
   üretir. Eklenmeden önce uyulacak ilkeler aşağıdadır.

### Yapay zekâ eklenirken ilkeler (v2 ön kaydı)

- **Mimari:** `core` saf kalır. Çağrı `packages/integrations` altında bir sağlayıcı
  olarak, **worker'da asenkron** yapılır, istek yolunda değil. Çıktı plan
  görevlerini değiştirmez; ayrı bir yorum kaydı olarak saklanır.
- **Veri minimizasyonu:** sağlayıcıya ad ve serbest metin gitmez; takma kimlik ve
  toplulaştırılmış veri gider (ADR-0010 madde 1).
- **Hukuk önkoşulu:** çocuk verisinin bir dil modeli sağlayıcısına gönderilmesi
  (olası yurt dışı aktarım, eğitimde kullanılmama, saklama süresi, aydınlatma
  metni güncellemesi) avukat onayından geçmeden açılmaz.
- **Muhatap veli:** çıktı veliye gider; çocuğa doğrudan sohbet yoktur. Yorum
  sayısal olgulara bağlıdır, psikolojik ya da tıbbi çıkarım içermez.
- **İşletme:** çocuk başına çağrı sınırı (maliyet), her çağrının kaydı (girdi
  özeti, model sürümü, çıktı), hata durumunda şablon metne düşme.
- **Katman:** yorumun ücretli mi ücretsiz mi olacağı o zaman ADR-0006 çerçevesinde
  kararlaştırılır.

## Gerekçe

- v1 küçük kalır, ama ürünün satış cümlesi ("kesirlerde zayıf, program oluştur")
  manuel girişle de korunur.
- Sağlayıcı arayüzü baştan olduğu için Okulizyon ve ileride kurumsal veri kaynakları
  üst katmanları değiştirmeden eklenir.
- Yapay zekâ en çok hukuk yükü taşıyan eklenti; v1'de olmaması yayın önkoşullarını
  (ADR-0010) hafifletir.

## Reddedilen alternatifler

**Tüm deneme verisini v2'ye bırakmak.** v1 yalnızca ödev + plan olurdu: ücretsiz
katman teşhis kancasını (ADR-0006) kaybeder, plan zayıf konu girdisini kaybederdi.

**v1'de Okulizyon toplayıcısını ticari ürüne dahil etmek.** ADR-0003'te gerekçesi
yazılı: üçüncü taraf sisteme kullanıcı hesabıyla girmek ticari ürünün zemini değil.

## Sonuçlar

- Zayıf konu tespiti v1'de **konu düzeyindedir** (veli işaretlemesi); soru bazlı
  konu/kazanım verisi (ADR-0003'ün en değerli alanı) v1'de yoktur ve Okulizyon ya da
  başka bir sağlayıcı geldiğinde zenginleşir.
- **Risk:** manuel giriş velinin emeğine yaslanır (ADR-0004: veliden veri girişi
  beklemek ücretli özelliği öldürür). Deneme sıklığı düşük olduğu için (aylık/iki
  haftalık) kabul edilebilir; giriş ekranı kısa ve hızlı tutulur, tahmini birkaç
  dakika. Pratikte çok zahmetli çıkarsa bu karar yeniden açılır.
- Veri modelinde `raw` alanı (ADR-0003) v1'de de tutulur; sonradan yeniden
  ayrıştırma mümkün kalır.
- ADR-0003'e v1 kapsamı notu eklenir.
