import type { Curriculum } from "@ivmeapp/core";

/**
 * 6. sınıf Matematik, 2026-2027, Türkiye Yüzyılı Maarif Modeli (kullanıcının sağladığı özet).
 * Haftalık 5 saat, yıllık 180 saat; ünite saatleri ve okul temelli planlama özette var.
 * Hafta/tarih planı ve kazanım kodları YOK; hangi ünitede olunduğunu veli seçer.
 *
 * `match` ifadeleri Fenomen Matematik A kitabının konu adlarıyla eşleşme için
 * önerilmiştir (yorum içerir, doğrulanmadı). Ünite başlığı da otomatik ifade sayılır.
 */
export const matematik6: Curriculum = {
	id: "matematik-6-2026-2027",
	subject: "matematik",
	grade: 6,
	year: "2026-2027",
	source:
		"Kullanıcı sağladı: 6. Sınıf Matematik Konuları 2026-2027 özeti (MEB programı)",
	weeklyHours: 5,
	schoolBasedHours: 8,
	units: [
		{
			id: "tema-1a",
			order: 1,
			title: "Sayılar ve Nicelikler (1)",
			hours: 15,
			topics: [
				{
					title: "Bir doğal sayının çarpanları ve katları",
					match: ["çarpanları ve katları", "çarpanlar ve katlar"],
				},
				{ title: "Bölünebilme kriterleri", match: ["bölünebilme"] },
				{
					title: "2, 3, 4, 5, 6, 9 ve 10 ile bölünebilme",
					match: ["bölünebilme"],
				},
				{ title: "Asal sayılar", match: ["asal sayılar"] },
				{ title: "Asal çarpanlar", match: ["asal çarpanlar"] },
				{ title: "Ortak bölen", match: ["ortak bölen"] },
				{ title: "Ortak kat", match: ["ortak kat"] },
				{ title: "Aralarında asal sayılar", match: ["aralarında asal"] },
			],
		},
		{
			id: "tema-1b",
			order: 2,
			title: "Sayılar ve Nicelikler (2)",
			hours: 38,
			topics: [
				{
					title: "Kesirlerle işlemler",
					match: ["kesirlerle", "kesrin", "kesir ile"],
				},
				{
					title: "Ondalık gösterimleri çözümleme",
					match: ["ondalık gösterim"],
				},
				{ title: "Kesir-bölme ilişkisi", match: ["kesir ile bölme"] },
				{ title: "Kesirlerle dört işlem", match: ["dört işlem"] },
				{ title: "Kesirlerle problem çözme", match: ["problem çözme"] },
				{
					title: "Standart uzunluk ölçme birimleri",
					match: ["uzunluk ölçme birimleri"],
				},
				{ title: "Uzunluk ölçme", match: ["uzunluk ölçme"] },
			],
		},
		{
			id: "tema-2",
			order: 3,
			title: "İşlemlerle Cebirsel Düşünme ve Değişimler",
			hours: 33,
			topics: [
				{ title: "Bilinmeyen nicelikler", match: ["cebirsel ifadeler"] },
				{ title: "Değişken kavramı", match: ["cebirsel ifadeler"] },
				{ title: "Örüntüler", match: ["örüntüler", "çokgenler"] },
				{ title: "Cebirsel ifadeler", match: ["cebirsel ifadeler"] },
				{ title: "Terim", match: ["sabit terim"] },
				{ title: "Katsayı", match: ["katsayı"] },
				{ title: "Sabit terim", match: ["sabit terim"] },
				{ title: "Cebirsel ifadeler ve algoritma", match: ["algoritma"] },
			],
		},
		{
			id: "tema-3",
			order: 4,
			title: "Geometrik Şekiller",
			hours: 20,
			topics: [
				{
					title: "İki paralel doğrunun bir kesen ile oluşturduğu açılar",
					match: ["paralel iki doğru"],
				},
				{ title: "Yöndeş açılar", match: ["paralel iki doğru"] },
				{ title: "İç ters açılar", match: ["paralel iki doğru"] },
				{ title: "Dış ters açılar", match: ["paralel iki doğru"] },
				{ title: "Üçgenin açıları", match: ["üçgende açılar"] },
				{ title: "Yamuk", match: ["dörtgen"] },
				{ title: "Paralelkenar", match: ["dörtgen"] },
				{ title: "Eşkenar dörtgen", match: ["dörtgen"] },
				{ title: "Dikdörtgen", match: ["dörtgen"] },
				{ title: "Kare", match: ["dörtgen"] },
				{
					title: "Dörtgenlerin kenar, açı ve köşegen özellikleri",
					match: ["dörtgen", "köşegen"],
				},
			],
		},
		{
			id: "tema-4",
			order: 5,
			title: "Geometrik Nicelikler",
			hours: 33,
			topics: [
				{
					title: "Uzunluk ölçme birimleri arasındaki ilişkiler",
					match: ["uzunluk ölçme birimleri"],
				},
				{
					title: "Alan ölçme birimleri arasındaki ilişkiler",
					match: ["alan ölçme birimleri"],
				},
				{
					title: "Paralelkenarın alanı",
					match: ["paralelkenarın yüksekliği ve alanı", "paralelkenar"],
				},
				{
					title: "Üçgenin alanı",
					match: ["üçgenin yüksekliği ve alanı", "üçgen alanı"],
				},
				{ title: "Çember", match: ["çember"] },
				{ title: "Çemberin uzunluğu", match: ["çember"] },
				{
					title: "Çap ve çember uzunluğu arasındaki ilişki",
					match: ["çapın uzunlukları"],
				},
				{ title: "Merkez açı", match: ["merkez açı"] },
				{ title: "Yay uzunluğu", match: ["yay uzunluğu"] },
				{
					title: "Merkez açı ile gördüğü yay arasındaki ilişki",
					match: ["merkez açı"],
				},
			],
		},
		{
			id: "tema-5",
			order: 6,
			title: "İstatistiksel Araştırma Süreci",
			hours: 24,
			topics: [
				{ title: "Kategorik veri", match: ["veriye dayalı araştırma"] },
				{ title: "Nicel kesikli veri", match: ["veriye dayalı araştırma"] },
				{
					title: "İstatistiksel araştırma sorusu oluşturma",
					match: ["araştırma sorusu"],
				},
				{ title: "Veri toplama" },
				{ title: "Veriyi düzenleme" },
				{ title: "Veriyi görselleştirme", match: ["veri görselleştirme"] },
				{ title: "Veri dağılımları", match: ["veri özetleme"] },
				{ title: "Aritmetik ortalama", match: ["aritmetik ortalama"] },
				{ title: "Ortanca", match: ["ortanca"] },
				{ title: "Tepe değer", match: ["tepe değer"] },
				{ title: "Kök-yaprak gösterimi", match: ["kök - yaprak"] },
				{
					title: "İstatistiksel sonuçları yorumlama",
					match: ["sonuçları yorumlama"],
				},
				{
					title: "Hatalı veya yanlı istatistiksel yorumları değerlendirme",
					match: ["özetleme aracı"],
				},
			],
		},
		{
			id: "tema-6",
			order: 7,
			title: "Veriden Olasılığa",
			hours: 9,
			topics: [
				{ title: "Deneysel olasılık", match: ["deneysel olasılık"] },
				{ title: "Deney ve çıktı" },
				{ title: "Deneyin tekrar sayısı" },
				{ title: "Göreli sıklık" },
				{ title: "Deney sonuçlarından olasılık tahmini" },
				{ title: "Olasılık değerini yorumlama" },
			],
		},
	],
};
