# ADR-0013: Plan ayarları ve dinamik plan kuralları

- **Durum:** Kabul
- **Tarih:** 2026-10-02

## Bağlam

ADR-0005 motoru sabit bir rotasyon ve 5 çalışma günü varsayarak tarif etti;
ADR-0009 hafta içi 5 gün dedi. Uygulamada iki sorun çıktı:

1. **Yuva çelişkisi.** Günde 2 ders bloğu × 5 gün = 10 yuva. ADR-0005 ise
   matematik ≥3 + Türkçe ≥3 gün ve Fen/Sosyal/İngilizce'nin her biri haftada 2-3
   kez istiyor: en az 12 yuva. Kurallar birlikte sağlanamıyor.
2. **Aileler farklı.** Veli kaç gün çalışılacağını, hangi derslerin planda olacağını
   ve hangi kaynakların kullanılacağını kendisi bilir (bazı aileler İngilizce'yi
   kursta alıyor, bazıları hiç soru bankası almamış). Çocuk bir gün çalışamayabilir.

## Karar

1. **Plan ayarlarını veli belirler:**
   - **Çalışma günleri ve boş gün.** Önerilen: haftada **6 gün**
     (Pazartesi-Cumartesi), en az bir tam boş gün (Pazar). Veli azaltabilir ya da
     artırabilir; hiç boş gün bırakmazsa uyarı çıkar, engel yoktur.
   - **Günlük bütçe.** Varsayılan 90 dk (ADR-0009 değişmedi).
   - **Blok süresi.** Çocuğa özeldir. Çocuk profili eklenirken veliye sorulur:
     "Kesintisiz kaç dakika dikkatli çalışabiliyor?" Uygulama 25-30 dk tavsiye
     eder, veli seçer. Çok kısa ya da çok uzun değerlerde uyarı çıkar, engel
     yoktur (eşikler uygulama sırasında belirlenir).
   - **Boş zaman tercihi.** Çocuk profili eklenirken veliye sorulur: plan günlük
     bütçeyi doldurmadan biterse (haftanın konusu ve zayıf konu işleri tükendi ya
     da kaynak az) kalan süre ne olsun? Seçenekler: **genel tekrar** (aralıklı
     tekrar havuzundan, varsayılan), **ek kitap okuma** (ADR-0009 madde 6'daki
     günlük 30 dk'ya ek; çocuk seçer, sınanmaz) ya da **boş kalsın**. Süre bu
     şekilde artınca ayrıca "yeni kaynak eklemek ister misiniz?" önerisi gösterilir
     (ADR-0004). Motor boşluğu yeni görev uydurarak doldurmaz: ya havuzdaki
     işlerden çeker ya da boş bırakır (ADR-0005).
   - **Dersler.** Her ders plana açılıp kapatılabilir. Matematik veya Türkçe
     kapatılırsa uyarı çıkar, engellenmez.
   - **Kaynaklar.** Kütüphaneden (ADR-0004) seçilir. Hiç seçilmezse MEB ders
     kitabı kullanılır. Motor kaynak sayısından bağımsız çalışır.
   Ayar değişikliği **bir sonraki haftanın** planında geçerli olur.
2. **Yük velinin kararıdır, uygulama tavsiye verir.** Günde en fazla 3 madde gibi
   sabit bir madde sınırı **yoktur**; günlük madde sayısı velinin verdiği bütçeden
   türer (örn. 90 dk ≈ 3 blok, 180 dk ≈ 6 blok). Bütçe için ADR-0009'daki uyarı
   seviyeleri (2 saat üstü uyarı, çok yüksekte daha açık uyarı) **tavsiyedir,
   engel değildir**. Motor yine velinin verdiği bütçeyi aşmaz ve görev eklemez.
   **Okul ödevi düşmez** (sabit kural, ayar değildir): bütçe daralınca önce zayıf
   konu/tekrar düşer; ödev bütçeye sığmazsa gizlenmez, velinin önüne uyarıyla
   çıkar. ADR-0009 madde 4'ün "hafta içi 5 gün, en az bir tam boş gün" kuralı
   yerine: *tavsiye haftada 6 gün ve en az bir tam boş gün; veli değiştirebilir.*
   Sabit kalan tek şey: okul ödevi düşmez, motor velinin verdiği bütçeyi aşmaz ve
   görev uydurmaz.
3. **Motor kota tabanlıdır.** Seçili derslerin haftalık yuva kotası (müfredattaki
   konum ve veli seçimine göre) hesaplanır, yuvalar günlere yayılır; aynı ders art
   arda günlere yığılmaz. Matematik ve Türkçe açıksa hedef haftada 3 gün; yuva yetmezse
   hedef düşer ve kapsama raporuna yazılır (ADR-0005 güncellemesi). Rotasyon
   tabloları kalkar.
4. **Kapsama uyarısı.** Seçilen gün ve ders sayısıyla müfredata yetişilemiyorsa
   motor hangi konuların kapsam dışı kaldığını bir *kapsama raporu* olarak döner;
   veliye "bu ayarlarla şu konulara yetişilmeyebilir" uyarısı bundan üretilir.
   Motor yine görev eklemez, yalnızca neyin kesildiğini gösterir.
5. **Devir.** Yapılmayan görev havuza döner ve gelecek haftanın öncelik sırasında
   öne alınır. Devreden iş günlük bütçeyi aşmaz; görev eklemek değil, sıralamada
   öne almaktır.
6. **Hafta içi taşıma.** Çocuk veya veli bir görevi aynı hafta içinde başka güne
   taşıyabilir. Hedef günde bütçe kapasitesi varsa taşınır; yoksa hedef
   günün Blok 3 görevi havuza düşer; o da yeterli değilse taşıma reddedilir ve görev
   havuza döner. **Motor hafta içinde kendiliğinden yeniden planlamaz.** Taşıma bir
   kullanıcı eylemidir ve kayıt altına alınır.
7. **Okul ödevi hafta içinde girilebilir.** Girilen gün Blok 1'i alır; yerindeki
   görev havuza döner. Bu, ADR-0005'teki "plan hafta içinde değişmez" kuralının
   tek tanımlı istisnasıdır (ödev planın dışından gelen bir gerçektir).
8. **Aylık görünüm, haftalık detay.** Veliye, yıllık plandan gelen en fazla 4
   haftalık *konu haritası* (hangi hafta hangi konu) gösterilir. Somut görevler
   (kaynak, sayfa, test no) her hafta başında, son denemeye göre üretilir.
9. **Cumartesi:** deneme yapılan hafta Cumartesi deneme + yanlış analizi günüdür
   (ADR-0009 madde 5), bütçe aşılmadan çalışma görevlerinin yerini alır; deneme
   olmayan haftada normal çalışma günüdür.
10. **Kitap okuma** günde 30 dk bütçe dışı kalır (ADR-0009 madde 6, değişmedi).
11. **Proje ödevi:** v1'de teslim tarihli bir ödev türüdür, hatırlatma olarak
    görünür. Parçalara bölüp haftalara yaymak sonraya bırakılır.

## Gerekçe

- 6 gün önerisi yuva çelişkisini çözer (6 × 2 = 12 yuva) ve ADR-0009'un kendi
  gerekçesiyle uyumludur: neti yükselten şey **kaç gün** çalışıldığı; günde az, çok
  gün sürdürülebilir.
- Dinamiklik girdilerde, motorda değil: motor yine bir saf fonksiyon, her görev
  gerekçe taşır (ADR-0002). Dinamik ama açıklanabilir.
- Taşımanın kullanıcı eylemi olması, planın güvenini korur (ADR-0005): uygulama
  planı kendi kendine değiştirmez, aile değiştirir.

## Reddedilen alternatifler

**Bir aylık detaylı görev planı.** Görevler denemeden çıkan zayıf konulara bağlı;
bir ay önceden üretilen plan eskimiş veriye dayanır ve "deneme → analiz → yeni
hafta" döngüsünü (ADR-0005) bozar. Yerine konu haritası görünümü.

**Motorun hafta içinde otomatik yeniden planlaması.** Planı gün içinde değişen
uygulama güven kaybeder (ADR-0005). Yalnızca kullanıcı eylemiyle değişir.

**Sert üst sınırlar (günde en fazla 3 madde, bütçe tavanı).** Ailenin kendi
çocuğu için yükü belirlemesini engellerdi. Yerine tavsiye ve uyarı konur, karar
velide kalır. Bedeli: çok yüksek bütçe seçen bir veli, ADR-0009'un anlattığı
bırakma riskini üstlenir; bunu varsayılan değer (90 dk), uyarılar ve kapsama
raporu hafifletir, engellemez.

**Sabit rotasyon tabloları.** 5 güne ve 5 derse göre yazılmış tablo, serbest gün ve
ders seçimiyle çalışmaz.

## Sonuçlar

- `packages/core`: ayar tipleri (`PlanSettings`), kota tabanlı dağıtım, kapsama
  raporu, taşıma kuralı; mevcut rotasyon kodu ve testleri bu karara göre
  güncellenir. Bütçe, madde sınırı ve ödev testleri aynen geçerli kalır.
- Veri modeli: çocuk profilinde blok süresi (dikkat süresi) alanı; plan üretimi
  için gereken veridir, ADR-0010 madde 1'e uygundur.
- Veri modeli: görev taşıma geçmişi (kim, ne zaman, hangi günden hangi güne)
  tutulur (erişim kaydı ilkesi, ADR-0010).
- Kabul edildiğinde ADR-0005 ve ADR-0009'un durumu *"Kabul (kısmen değiştirildi:
  ADR-0013)"* olarak güncellenir.
- **Ücretli/ücretsiz sınırı bu ADR'de çizilmedi** (ADR-0006 geçerli: ücretsiz
  "ne oldu", ücretli "ne yapmalı"). Hangi ayarın hangi katmanda olacağı sonra
  belirlenecek. Bunu ucuz tutmak için plan özelliklerinin (gün/ders/kaynak ayarı,
  taşıma, proje ödevi bölme, plan üretimi) erişimi API'de **tek bir yetki
  kontrolünden** geçer; sınır değişirse tek yer değişir.
- Ders önceliği (normal/yüksek) v1 dışında bırakıldı.
