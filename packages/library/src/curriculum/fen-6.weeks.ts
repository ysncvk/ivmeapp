// Otomatik üretildi: packages/library/scripts/import_yillik_plan.py. Elle düzenlemeyin.
import type { CurriculumPeriod, CurriculumWeek } from "@ivmeapp/core";

export const weeks: CurriculumWeek[] = [
	{
		week: 1,
		start: "2026-09-14",
		end: "2026-09-18",
		hours: "4",
		unitIds: ["unite-1"],
		topics: ["Güneş Sistemi"],
		outcomes: [
			{
				code: "FB.6.1.1.1",
				title:
					"Güneş sistemindeki gezegenleri niteliklerine göre sınıflandırabilme",
			},
		],
		note: "Ek açıklama kodu: 6-01 İlköğretim Haftası",
	},
	{
		week: 2,
		start: "2026-09-21",
		end: "2026-09-25",
		hours: "2+2",
		unitIds: ["unite-1"],
		topics: ["Güneş Sistemi", "Güneş ve Ay Tutulmaları"],
		outcomes: [
			{
				code: "FB.6.1.1.2",
				title: "Güneş sistemi ile ilgili bilimsel model oluşturabilme",
			},
			{
				code: "FB.6.1.2.1",
				title: "Güneş ve Ay tutulması ile ilgili bilimsel çıkarım yapabilme",
			},
		],
		note: "15 Temmuz Demokrasi ve Millî Birlik Günü",
	},
	{
		week: 3,
		start: "2026-09-28",
		end: "2026-10-02",
		hours: "2+2",
		unitIds: ["unite-1"],
		topics: ["Güneş ve Ay Tutulmaları"],
		outcomes: [
			{
				code: "FB.6.1.2.1",
				title: "Güneş ve Ay tutulması ile ilgili bilimsel çıkarım yapabilme",
			},
			{
				code: "FB.6.1.2.2",
				title: "Güneş ve Ay tutulması ile ilgili bilimsel model oluşturabilme",
			},
		],
	},
	{
		week: 4,
		start: "2026-10-05",
		end: "2026-10-09",
		hours: "4",
		unitIds: ["unite-2"],
		topics: ["Bileşke Kuvvet"],
		outcomes: [
			{
				code: "FB.6.2.1.1",
				title:
					"Bir cisme etki eden aynı doğrultudaki kuvvetler arasındaki ilişkileri açıklayarak bileşke kuvveti yapılandırabilme",
			},
		],
		note: "Ek açıklama kodu: 6-04",
	},
	{
		week: 5,
		start: "2026-10-12",
		end: "2026-10-16",
		hours: "4",
		unitIds: ["unite-2"],
		topics: ["Bileşke Kuvvet"],
		outcomes: [
			{
				code: "FB.6.2.1.2",
				title:
					"Dengelenmiş ve dengelenmemiş kuvvetlerin etkisi altındaki bir cismin hareketine yönelik deney yapabilme",
			},
		],
	},
	{
		week: 6,
		start: "2026-10-19",
		end: "2026-10-23",
		hours: "4",
		unitIds: ["unite-2"],
		topics: ["Sabit Süratli ve Sabit Hızlı Hareket"],
		outcomes: [
			{
				code: "FB.6.2.2.1",
				title: "Sürat ve hız kavramlarını karşılaştırabilme",
			},
		],
	},
	{
		week: 7,
		start: "2026-10-26",
		end: "2026-10-30",
		hours: "2+2",
		unitIds: ["unite-2", "unite-3"],
		topics: [
			"Sabit Süratli ve Sabit Hızlı Hareket",
			"Bitki ve Hayvanlarda Üreme, Büyüme ve Gelişme",
		],
		outcomes: [
			{
				code: "FB.6.2.2.1",
				title: "Sürat ve hız kavramlarını karşılaştırabilme",
			},
			{
				code: "FB.6.3.1.1",
				title: "Eşeyli ve eşeysiz üremeyi karşılaştırabilme",
			},
		],
		note: "Cumhuriyet Bayramı (29 Ekim)",
	},
	{
		week: 8,
		start: "2026-11-02",
		end: "2026-11-06",
		hours: "2 + 2 OTP",
		unitIds: ["unite-3"],
		topics: ["Bitki ve Hayvanlarda Üreme, Büyüme ve Gelişme"],
		outcomes: [
			{
				code: "FB.6.3.1.2",
				title:
					"Bitkilerde üreme, büyüme ve gelişme hakkında bilimsel çıkarım yapabilme",
			},
		],
		otpHours: 2,
		note: "Bu haftanın 2 saati Okul Temelli Planlama için ayrılmıştır. Ek açıklama kodu: 6-08",
	},
	{
		week: 9,
		start: "2026-11-09",
		end: "2026-11-13",
		hours: "4",
		unitIds: ["unite-3"],
		topics: ["Bitki ve Hayvanlarda Üreme, Büyüme ve Gelişme"],
		outcomes: [
			{
				code: "FB.6.3.1.3",
				title:
					"Tohumun çimlenmesine etki eden faktörlere ilişkin hipotez oluşturabilme",
			},
		],
		note: "Atatürk Haftası (10–16 Kasım)",
	},
	{
		week: 10,
		start: "2026-11-23",
		end: "2026-11-27",
		hours: "2+2",
		unitIds: ["unite-3"],
		topics: ["Bitki ve Hayvanlarda Üreme, Büyüme ve Gelişme"],
		outcomes: [
			{
				code: "FB.6.3.1.4",
				title:
					"Hayvanlarda üreme, büyüme ve gelişme hakkında bilimsel çıkarım yapabilme",
			},
			{
				code: "FB.6.3.1.5",
				title:
					"İnsanda üremeyi sağlayan yapı ve organlar arasındaki ilişkileri çözümleyebilme",
			},
		],
		note: "Ek açıklama kodu: 6-10 Öğretmenler Günü (24 Kasım)",
	},
	{
		week: 11,
		start: "2026-11-30",
		end: "2026-12-04",
		hours: "4",
		unitIds: ["unite-3"],
		topics: ["Denetleyici ve Düzenleyici Sistemler"],
		outcomes: [
			{
				code: "FB.6.3.2.1",
				title: "Sinir sisteminin görevlerini model üzerinde gözlemleyebilme",
			},
		],
		note: "Dünya Engelliler Günü (3 Aralık)",
	},
	{
		week: 12,
		start: "2026-12-07",
		end: "2026-12-11",
		hours: "1+3",
		unitIds: ["unite-3"],
		topics: ["Denetleyici ve Düzenleyici Sistemler"],
		outcomes: [
			{
				code: "FB.6.3.2.2",
				title: "İç salgı bezlerinin vücut için önemini yapılandırabilme",
			},
			{
				code: "FB.6.3.2.3",
				title:
					"Çocukluktan ergenliğe geçişte oluşan bedensel ve ruhsal değişimleri genelleyebilme",
			},
		],
	},
	{
		week: 13,
		start: "2026-12-14",
		end: "2026-12-18",
		hours: "2+2",
		unitIds: ["unite-3", "unite-4"],
		topics: ["Denetleyici ve Düzenleyici Sistemler", "Işığın Yansıması"],
		outcomes: [
			{
				code: "FB.6.3.2.4",
				title:
					"Denetleyici ve düzenleyici sistemlerin sağlığı için yapılması gerekenlerle ilgili bilgi toplayabilme",
			},
			{
				code: "FB.6.4.1.1",
				title:
					"Işığın farklı yüzeylerdeki yansıma olaylarına ilişkin bilimsel çıkarım yapabilme",
			},
		],
		note: "Tutum, Yatırım ve Türk Malları Haftası (12–18 Aralık)",
	},
	{
		week: 14,
		start: "2026-12-21",
		end: "2026-12-25",
		hours: "4",
		unitIds: ["unite-4"],
		topics: ["Işığın Yansıması"],
		outcomes: [
			{
				code: "FB.6.4.1.2",
				title:
					"Işığın yansımasında gelen ışın, yansıyan ışın ve yüzeyin normali arasındaki ilişkiyi kanıt kullanarak açıklayabilme",
			},
		],
		note: "Ek açıklama kodu: 6-14",
	},
	{
		week: 15,
		start: "2026-12-28",
		end: "2027-01-01",
		hours: "4",
		unitIds: ["unite-4"],
		topics: ["Aynalar"],
		outcomes: [
			{
				code: "FB.6.4.2.1",
				title:
					"Günlük hayattaki ayna çeşitlerine ilişkin bilimsel çıkarım yapabilme",
			},
		],
	},
	{
		week: 16,
		start: "2027-01-04",
		end: "2027-01-08",
		hours: "2 + 2 OTP",
		unitIds: ["unite-4"],
		topics: ["Işığın Soğurulması"],
		outcomes: [
			{
				code: "FB.6.4.3.1",
				title:
					"Işığın madde ile etkileşimi sonucunda soğurulabileceğini gözlemleyebilme",
			},
		],
		otpHours: 2,
		note: "Bu haftanın 2 saati Okul Temelli Planlama için ayrılmıştır. Ek açıklama kodu: 6-16",
	},
	{
		week: 17,
		start: "2027-01-11",
		end: "2027-01-15",
		hours: "4",
		unitIds: ["unite-4"],
		topics: ["Işığın Soğurulması"],
		outcomes: [
			{
				code: "FB.6.4.3.2",
				title:
					"Beyaz ışığın tüm ışık renklerinin bileşiminden oluştuğuna ilişkin bilimsel çıkarım yapabilme",
			},
		],
	},
	{
		week: 18,
		start: "2027-01-18",
		end: "2027-01-22",
		hours: "4",
		unitIds: ["unite-4"],
		topics: ["Işığın Soğurulması"],
		outcomes: [
			{
				code: "FB.6.4.3.3",
				title:
					"Cisimlerin siyah, beyaz ve renkli görünmesinin nedenini gözlem verileriyle açıklayabilme",
			},
		],
	},
	{
		week: 19,
		start: "2027-02-08",
		end: "2027-02-12",
		hours: "2+2",
		unitIds: ["unite-4", "unite-5"],
		topics: ["Işığın Soğurulması", "Genleşme ve Büzülme"],
		outcomes: [
			{
				code: "FB.6.4.3.4",
				title:
					"Güneş enerjisinin günlük hayat ve teknolojideki yenilikçi uygulamalarına ilişkin eleştirel düşünebilme",
			},
			{
				code: "FB.6.5.1.1",
				title:
					"Isı etkisiyle maddelerin genleşip büzüleceğine yönelik bilimsel gözleme dayalı tahmin edebilme",
			},
		],
		note: "Ek açıklama kodu: 6-19",
	},
	{
		week: 20,
		start: "2027-02-15",
		end: "2027-02-19",
		hours: "4",
		unitIds: ["unite-5"],
		topics: ["Genleşme ve Büzülme"],
		outcomes: [
			{
				code: "FB.6.5.1.1",
				title:
					"Isı etkisiyle maddelerin genleşip büzüleceğine yönelik bilimsel gözleme dayalı tahmin edebilme",
			},
		],
	},
	{
		week: 21,
		start: "2027-02-22",
		end: "2027-02-26",
		hours: "4",
		unitIds: ["unite-5"],
		topics: ["Maddenin Hâl Değişim Noktaları"],
		outcomes: [
			{
				code: "FB.6.5.2.1",
				title:
					"Maddelerin erime, donma ve kaynama noktasını gösteren deney yapabilme",
			},
		],
	},
	{
		week: 22,
		start: "2027-03-01",
		end: "2027-03-05",
		hours: "4",
		unitIds: ["unite-5"],
		topics: ["Maddenin Hâl Değişim Noktaları"],
		outcomes: [
			{
				code: "FB.6.5.2.1",
				title:
					"Maddelerin erime, donma ve kaynama noktasını gösteren deney yapabilme",
			},
		],
	},
	{
		week: 23,
		start: "2027-03-15",
		end: "2027-03-19",
		hours: "4",
		unitIds: ["unite-5"],
		topics: ["Yoğunluk"],
		outcomes: [
			{
				code: "FB.6.5.3.1",
				title:
					"Yoğunluğa ilişkin hesaplamalar yaparak bilimsel veriye dayalı tahmin edebilme",
			},
		],
		note: "Ek açıklama kodu: 6-23 18 Mart Çanakkale Zaferi ve Şehitleri Anma Günü Türk Dünyası ve Toplulukları Haftası",
	},
	{
		week: 24,
		start: "2027-03-22",
		end: "2027-03-26",
		hours: "4",
		unitIds: ["unite-5"],
		topics: ["Yoğunluk"],
		outcomes: [
			{
				code: "FB.6.5.3.1",
				title:
					"Yoğunluğa ilişkin hesaplamalar yaparak bilimsel veriye dayalı tahmin edebilme",
			},
		],
	},
	{
		week: 25,
		start: "2027-03-29",
		end: "2027-04-02",
		hours: "3+1",
		unitIds: ["unite-5"],
		topics: ["Yoğunluk"],
		outcomes: [
			{
				code: "FB.6.5.3.2",
				title:
					"Deneyler sonucunda çeşitli maddelerin yoğunluklarına ilişkin tümdengelimsel akıl yürütebilme",
			},
		],
		otpHours: 1,
		note: "Bu haftanın 1 saati Okul Temelli Planlama için ayrılmıştır. Ek açıklama kodu: 6-25",
	},
	{
		week: 26,
		start: "2027-04-05",
		end: "2027-04-09",
		hours: "4",
		unitIds: ["unite-5"],
		topics: ["Yoğunluk"],
		outcomes: [
			{
				code: "FB.6.5.3.3",
				title:
					"Suyun katı ve sıvı hâllerine ait yoğunlukları karşılaştırarak bu durumun canlılar için önemi hakkında bilimsel çıkarımlar yapabilme",
			},
		],
	},
	{
		week: 27,
		start: "2027-04-12",
		end: "2027-04-16",
		hours: "3+1",
		unitIds: ["unite-5", "unite-6"],
		topics: ["Yoğunluk", "Elektriğin İletimi"],
		outcomes: [
			{
				code: "FB.6.5.3.4",
				title: "Yoğunluk ile ilgili bilimsel model oluşturabilme",
			},
			{
				code: "FB.6.6.1.1",
				title:
					"Maddelerin elektriği iletme durumlarını gösteren deney yapabilme",
			},
		],
		note: "Ek açıklama kodu: 6-27",
	},
	{
		week: 28,
		start: "2027-04-19",
		end: "2027-04-23",
		hours: "4",
		unitIds: ["unite-6"],
		topics: ["Elektriğin İletimi"],
		outcomes: [
			{
				code: "FB.6.6.1.1",
				title:
					"Maddelerin elektriği iletme durumlarını gösteren deney yapabilme",
			},
		],
		note: "Ek açıklama kodu: 6-28 Ulusal Egemenlik ve Çocuk Bayramı (23 Nisan)",
	},
	{
		week: 29,
		start: "2027-04-26",
		end: "2027-04-30",
		hours: "4",
		unitIds: ["unite-6"],
		topics: ["Elektriksel Direnç ve Bağlı Olduğu Faktörler"],
		outcomes: [
			{
				code: "FB.6.6.2.1",
				title:
					"Elektrik devresindeki ampulün parlaklığının bağlı olduğu değişkenleri belirlemeye yönelik deney yapabilme",
			},
		],
		note: "Kût’ül Amâre Zaferi (29 Nisan) Emek ve Dayanışma Günü (1 Mayıs)",
	},
	{
		week: 30,
		start: "2027-05-03",
		end: "2027-05-07",
		hours: "4",
		unitIds: ["unite-6"],
		topics: ["Elektriksel Direnç ve Bağlı Olduğu Faktörler"],
		outcomes: [
			{
				code: "FB.6.6.2.1",
				title:
					"Elektrik devresindeki ampulün parlaklığının bağlı olduğu değişkenleri belirlemeye yönelik deney yapabilme",
			},
		],
	},
	{
		week: 31,
		start: "2027-05-10",
		end: "2027-05-14",
		hours: "4",
		unitIds: ["unite-6"],
		topics: ["Elektriksel Direnç ve Bağlı Olduğu Faktörler"],
		outcomes: [
			{
				code: "FB.6.6.2.2",
				title:
					"Ayarlanabilir direncin ampulün parlaklığına etkilerine yönelik bilimsel çıkarım yapabilme",
			},
		],
	},
	{
		week: 32,
		start: "2027-05-24",
		end: "2027-05-28",
		hours: "1+3",
		unitIds: ["unite-6", "unite-7"],
		topics: ["Elektriksel Direnç ve Bağlı Olduğu Faktörler", "Biyoçeşitlilik"],
		outcomes: [
			{
				code: "FB.6.6.2.2",
				title:
					"Ayarlanabilir direncin ampulün parlaklığına etkilerine yönelik bilimsel çıkarım yapabilme",
			},
			{
				code: "FB.6.7.1.1",
				title: "Biyoçeşitliliğin doğal yaşam için önemini sorgulayabilme",
			},
		],
		note: "Ek açıklama kodu: 6-32 İstanbul’un Fethi (29 Mayıs)",
	},
	{
		week: 33,
		start: "2027-05-31",
		end: "2027-06-04",
		hours: "2+2",
		unitIds: ["unite-7"],
		topics: ["Biyoçeşitlilik"],
		outcomes: [
			{
				code: "FB.6.7.1.1",
				title: "Biyoçeşitliliğin doğal yaşam için önemini sorgulayabilme",
			},
			{
				code: "FB.6.7.1.2",
				title:
					"Biyoçeşitliliği tehdit eden faktörleri araştırma verilerine dayalı tahmin edebilme",
			},
		],
		note: "Ek açıklama kodu: 6-33",
	},
	{
		week: 34,
		start: "2027-06-07",
		end: "2027-06-11",
		hours: "3+1",
		unitIds: ["unite-7"],
		topics: ["Biyoçeşitlilik"],
		outcomes: [
			{
				code: "FB.6.7.1.2",
				title:
					"Biyoçeşitliliği tehdit eden faktörleri araştırma verilerine dayalı tahmin edebilme",
			},
		],
		otpHours: 1,
		note: "Bu haftanın 1 saati Okul Temelli Planlama için ayrılmıştır. Ek açıklama kodu: 6-34",
	},
	{
		week: 35,
		start: "2027-06-14",
		end: "2027-06-18",
		hours: "4",
		unitIds: ["unite-7"],
		topics: ["İnsan ve Çevre Etkileşimi"],
		outcomes: [
			{
				code: "FB.6.7.2.1",
				title:
					"Isınma amaçlı yakıt kullanımının insan ve çevre üzerine etkilerini tartışabilme",
			},
		],
		note: "Ek açıklama kodu: 6-35",
	},
	{
		week: 36,
		start: "2027-06-21",
		end: "2027-06-25",
		hours: "4",
		unitIds: ["unite-7"],
		topics: ["İnsan ve Çevre Etkileşimi"],
		outcomes: [
			{
				code: "FB.6.7.2.2",
				title:
					"Yakın çevresindeki veya ülkemizdeki bir çevre problemine ilişkin çözüm üretebilme",
			},
		],
	},
];

export const breaks: CurriculumPeriod[] = [
	{
		title: "1. DÖNEM ARA TATİLİ",
		start: "2026-11-16",
		end: "2026-11-20",
	},
	{
		title: "YARIYIL TATİLİ",
		start: "2027-01-25",
		end: "2027-02-05",
	},
	{
		title: "2. DÖNEM ARA TATİLİ",
		start: "2027-03-08",
		end: "2027-03-12",
	},
	{
		title: "Kurban Bayramı",
		start: "2027-05-16",
		end: "2027-05-19",
	},
];

export const examPeriods: CurriculumPeriod[] = [
	{
		title: "Sınav haftaları",
		start: "2026-11-02",
		end: "2026-11-13",
	},
	{
		title: "Sınav haftaları",
		start: "2026-12-28",
		end: "2027-01-08",
	},
	{
		title: "Sınav haftaları",
		start: "2027-04-05",
		end: "2027-04-16",
	},
	{
		title: "Sınav haftaları",
		start: "2027-05-31",
		end: "2027-06-11",
	},
];
