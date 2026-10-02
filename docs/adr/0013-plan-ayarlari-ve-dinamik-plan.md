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
   - **Çalışma günleri.** Önerilen: haftada **6 gün** (Pazartesi-Cumartesi,
     Pazar boş). Veli azaltabilir.
   - **Günlük bütçe.** Varsayılan 90 dk (ADR-0009 değişmedi).
   - **Dersler.** Her ders plana açılıp kapatılabilir. Matematik veya Türkçe
     kapatılırsa uyarı çıkar, engellenmez.
   - **Kaynaklar.** Kütüphaneden (ADR-0004) seçilir. Hiç seçilmezse MEB ders
     kitabı kullanılır. Motor kaynak sayısından bağımsız çalışır.
   Ayar değişikliği **bir sonraki haftanın** planında geçerli olur.
2. **Korkuluklar ayarla değişmez** (ADR-0009): bütçe aşılamaz, günde en fazla 3
   madde, blok 20-30 dk, okul ödevi düşmez, **haftada en az bir gün tamamen
   boş**. ADR-0009 madde 4'ün "hafta içi 5 gün" kuralı yerine: *haftada en fazla 6
   çalışma günü, en az bir gün tam boş.*
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
   öne alınır. Günlük madde sayısı artmaz (ADR-0005, değişmedi).
6. **Hafta içi taşıma.** Çocuk veya veli bir görevi aynı hafta içinde başka güne
   taşıyabilir. Hedef günde bütçe ve madde kapasitesi varsa taşınır; yoksa hedef
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

**Korkuluksuz, tamamen serbest ayar.** Veli 12 saatlik günlük bütçe girebilirse
ADR-0009'un amacı kalmaz. Ayar serbest, sınırlar sabit.

**Sabit rotasyon tabloları.** 5 güne ve 5 derse göre yazılmış tablo, serbest gün ve
ders seçimiyle çalışmaz.

## Sonuçlar

- `packages/core`: ayar tipleri (`PlanSettings`), kota tabanlı dağıtım, kapsama
  raporu, taşıma kuralı; mevcut rotasyon kodu ve testleri bu karara göre
  güncellenir. Bütçe, madde sınırı ve ödev testleri aynen geçerli kalır.
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
