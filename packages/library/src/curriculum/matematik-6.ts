import type { Curriculum } from "@ivmeapp/core";

import { breaks, weeks } from "./matematik-6.weeks";

/**
 * 6. sınıf Matematik, 2026-2027, Türkiye Yüzyılı Maarif Modeli yıllık planı
 * (kullanıcının sağladığı Word dosyası). Hafta hafta tarih, tema, içerik çerçevesi ve
 * kazanım kodları dosyadan ayrıştırıldı (`matematik-6.weeks.ts`,
 * `scripts/import_yillik_plan_docx.py`). Ünite saatleri MEB programından.
 *
 * Tema SIRASI planın gerçek sırasıdır: Sayılar (1), Veriden Olasılığa, Sayılar (2),
 * İstatistik, Geometrik Şekiller, Cebirsel Düşünme, Geometrik Nicelikler. Tema numaraları
 * MEB programının numaralarıdır ve yıl içindeki sıradan farklıdır.
 *
 * `match` ifadeleri Fenomen Matematik A kitabının konu adlarıyla eşleşme için önerilmiştir
 * (yorum içerir, doğrulanmadı). Ünite başlığı parantez içinde otomatik eşleşir
 * ("Bağlam Temelli Sorular (Ünite)" testleri ünitenin son haftasında).
 */
export const matematik6: Curriculum = {
	id: "matematik-6-2026-2027",
	subject: "matematik",
	grade: 6,
	year: "2026-2027",
	source:
		"Kullanıcı sağladı: 6. Sınıf Matematik Yıllık Planı 2026-2027 (TYMM, Word)",
	weeklyHours: 5,
	schoolBasedHours: weeks.reduce((sum, w) => sum + (w.otpHours ?? 0), 0),
	units: [
		{
			id: "tema-1a",
			order: 1,
			title: "Sayılar ve Nicelikler (1)",
			hours: 15,
			topics: [
				{
					title: "Bir Doğal Sayının Çarpanları ve Katları",
					match: [
						"çarpanları ve katları",
						"çarpanlar ve katlar",
						"ortak kat",
						"ortak bölen",
						"aralarında asal",
					],
				},
				{ title: "Bölünebilme Kriterleri", match: ["bölünebilme"] },
				{
					title: "Asal Sayılar ve Asal Çarpanlar",
					match: ["asal sayılar", "asal çarpanlar"],
				},
			],
		},
		{
			id: "tema-6",
			order: 2,
			title: "Veriden Olasılığa",
			hours: 9,
			topics: [{ title: "Deneysel Olasılık", match: ["deneysel olasılık"] }],
		},
		{
			id: "tema-1b",
			order: 3,
			title: "Sayılar ve Nicelikler (2)",
			hours: 38,
			topics: [
				{
					title: "Ondalık Gösterimleri Çözümleme",
					match: ["ondalık gösterim"],
				},
				{ title: "Kesir-Bölme İlişkisi", match: ["kesir ile bölme"] },
				{
					title: "Kesirlerle Dört İşlem İçeren Problem Çözme",
					match: ["kesirlerle", "kesrin", "kesre"],
				},
				{ title: "Uzunluk Ölçme", match: ["uzunluk ölçme birimleri"] },
			],
		},
		{
			id: "tema-5",
			order: 4,
			title: "İstatistiksel Araştırma Süreci",
			hours: 24,
			topics: [
				{
					title: "Kategorik ve Nicel (Kesikli) Veri Dağılımları",
					match: [
						"veriye dayalı araştırma",
						"araştırma sorusu",
						"veri görselleştirme",
						"veri özetleme",
						"özetleme aracı",
						"sonuçları yorumlama",
						"istatistiksel araştırma süreci",
					],
				},
			],
		},
		{
			id: "tema-3",
			order: 5,
			title: "Geometrik Şekiller",
			hours: 20,
			topics: [
				{
					title: "İki Paralel Doğrunun Bir Kesen ile Oluşturduğu Açılar",
					match: ["paralel iki doğru"],
				},
				{ title: "Üçgenin Açıları", match: ["üçgende açılar"] },
				{
					title:
						"Yamuk, Paralelkenar, Eşkenar Dörtgen, Dikdörtgen ve Karenin Kenar, Açı ve Köşegen Özellikleri",
					match: ["dörtgen", "köşegen"],
				},
			],
		},
		{
			id: "tema-2",
			order: 6,
			title: "İşlemlerle Cebirsel Düşünme ve Değişimler",
			hours: 33,
			topics: [
				{ title: "Bilinmeyen Nicelikler", match: ["cebirsel ifade"] },
				{ title: "Örüntü", match: ["örüntüler", "çokgenler"] },
				{ title: "Cebirsel İfadeler ve Algoritma", match: ["algoritma"] },
			],
		},
		{
			id: "tema-4",
			order: 7,
			title: "Geometrik Nicelikler",
			hours: 33,
			topics: [
				{
					title: "Uzunluk ve Alan Ölçme Birimleri Arasındaki İlişki",
					match: ["alan ölçme birimleri", "uzunluk ölçme birimleri"],
				},
				{
					title: "Paralelkenar ve Üçgenin Alanı",
					match: [
						"paralelkenarın yüksekliği",
						"üçgenin yüksekliği",
						"üçgen alanı",
						"alanlarıyla ilgili",
					],
				},
				{
					title: "Çemberin ve Çapın Uzunlukları Arasındaki İlişki",
					match: ["çemberin ve çapın"],
				},
				{
					title: "Çemberde Merkez Açı ve Gördüğü Yay Uzunluğu",
					match: ["merkez açı"],
				},
			],
		},
	],
	weeks,
	breaks,
};
