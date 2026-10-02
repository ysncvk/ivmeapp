# ADR-0006: Ücretsiz "ne oldu", ücretli "ne yapmalı"

- **Durum:** Kabul
- **Tarih:** 2026-09-27

## Bağlam

Ücretsiz katman olmadan ücretli kullanıcı bulunamaz; dağıtım kanalı ücretsiz
katmandan geçiyor (ADR-0007). Ama ücretsiz katman çok dolu olursa kimse ödemez,
çok boş olursa kimse kalmaz.

## Karar

Sınır işlev bazında çizilir:

- **Ücretsiz:** veli çocuğunun deneme grafiklerini, ders ve konu bazında
  doğru/yanlış dağılımını, zayıf konu teşhisini görür. Manuel ödev girişi ve
  takibi yapar. Öğretmen sınıf oluşturur, öğrenci davet eder, kim yaptı kim
  yapmadı görür.
- **Ücretli:** o teşhis günlük/haftalık somut programa dönüşür — kaynak, sayfa,
  test numarasıyla (ADR-0005).

Yani ücretsiz katman **problemi gösterir**, ücretli katman **çözümü verir**.

## Gerekçe

- Satış cümlesi kullanıcının kendi verisinden doğuyor: *"Kesirlerde ve
  oran-orantıda zayıf görünüyor. Bu konular için haftalık program oluştur."*
  Veli o noktada ikna olmuş oluyor, çünkü sorunu kendisi gördü.
- Ücretsiz katman pazarlama bütçesi yerine geçiyor.

## Sonuçlar

- Ücretli özellik **bir hafta bedava denenebilir**. Plan işe yarıyorsa veli
  kalır; yaramıyorsa ücret alınmamalı.
- Ücretsiz katman ucuz değildir: destek yükü ve KVKK yükümlülüğü ödeyen ve
  ödemeyen kullanıcı için aynı (ADR-0010). Kodu birkaç günde yazılabilir,
  işletmesi süreklidir.
- Ücretsiz katmanı daraltma disiplini: veli çocuğunu ekler, ödev girer, tikler,
  ilerlemeyi ve teşhisi görür. Bunun ötesi ücretsiz katmana girmez.
- Öğretmen tarafı v1'de minimumda tutulur (ADR-0007/0008): ödev atama, sınıf
  analitiği, mesajlaşma v1'de yok.
