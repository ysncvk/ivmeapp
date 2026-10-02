import type { SourceBook } from "@ivmeapp/core";

/**
 * İçindekiler sayfasından aktarıldı. Test numaraları her temada yeniden başlar ve her
 * temanın sonunda ayrı numaralanan "Bağlam Temelli Sorular" bölümü vardır; bu yüzden her
 * tema ve her bağlam bölümü ayrı bölüm olarak tutulur. Test başına 12 soru kullanıcı
 * bilgisidir.
 */
export const fenomen6MatematikA: SourceBook = {
	id: "fenomen-6-matematik-a",
	title: "Fenomen 6 Matematik A Soru Bankası",
	subject: "matematik",
	grade: 6,
	kind: "yardimci",
	questionsPerTest: 12,
	answerKeyPage: 316,
	sections: [
		{
			id: "tema-1",
			title: "1. Tema: Sayılar ve Nicelikler (1)",
			label: "1. Tema",
			units: [
				{
					topic: "Bir Doğal Sayının Çarpanları ve Katları",
					tests: [
						{ no: 1, kind: "izleme", page: 5 },
						{ no: 2, kind: "izleme", page: 7 },
						{ no: 3, kind: "izleme", page: 9 },
					],
				},
				{
					topic: "Bölünebilme Kuralları",
					tests: [
						{ no: 4, kind: "izleme", page: 11 },
						{ no: 5, kind: "izleme", page: 13 },
						{ no: 6, kind: "izleme", page: 15 },
					],
				},
				{
					topic: "Çarpanlar ve Katlar / Bölünebilme Kuralları",
					tests: [
						{ no: 7, kind: "ikiz", page: 17 },
						{ no: 8, kind: "yeni_nesil", page: 19 },
					],
				},
				{
					topic: "Asal Sayılar",
					tests: [
						{ no: 9, kind: "izleme", page: 21 },
						{ no: 10, kind: "izleme", page: 23 },
					],
				},
				{
					topic: "Asal Çarpanlar",
					tests: [
						{ no: 11, kind: "izleme", page: 25 },
						{ no: 12, kind: "izleme", page: 27 },
					],
				},
				{
					topic: "Asal Sayılar ve Asal Çarpanlar",
					tests: [
						{ no: 13, kind: "ikiz", page: 29 },
						{ no: 14, kind: "yeni_nesil", page: 31 },
					],
				},
				{
					topic: "Ortak Katlar",
					tests: [{ no: 15, kind: "izleme", page: 33 }],
				},
				{
					topic: "Ortak Bölenler",
					tests: [{ no: 16, kind: "izleme", page: 35 }],
				},
				{
					topic: "Ortak Bölenler ve Ortak Katlar",
					tests: [{ no: 17, kind: "izleme", page: 37 }],
				},
				{
					topic: "Aralarında Asal Sayılar",
					tests: [
						{ no: 18, kind: "izleme", page: 39 },
						{ no: 19, kind: "izleme", page: 41 },
					],
				},
				{
					topic: "Ortak Kat ve Ortak Bölen / Aralarında Asal Sayılar",
					tests: [
						{ no: 20, kind: "ikiz", page: 43 },
						{ no: 21, kind: "yeni_nesil", page: 45 },
					],
				},
			],
		},
		{
			id: "tema-1-baglam",
			title: "1. Tema: Bağlam Temelli Sorular",
			label: "1. Tema · Bağlam Temelli",
			units: [
				{
					topic: "Bağlam Temelli Sorular (Sayılar ve Nicelikler (1))",
					tests: [
						{ no: 1, page: 47 },
						{ no: 2, page: 48 },
					],
				},
			],
		},
		{
			id: "tema-2",
			title: "2. Tema: Veriden Olasılığa",
			label: "2. Tema",
			units: [
				{
					topic: "Deneysel Olasılık",
					tests: [
						{ no: 1, kind: "izleme", page: 49 },
						{ no: 2, kind: "izleme", page: 51 },
						{ no: 3, kind: "ikiz", page: 53 },
						{ no: 4, kind: "yeni_nesil", page: 55 },
					],
				},
			],
		},
		{
			id: "tema-2-baglam",
			title: "2. Tema: Bağlam Temelli Sorular",
			label: "2. Tema · Bağlam Temelli",
			units: [
				{
					topic: "Bağlam Temelli Sorular (Veriden Olasılığa)",
					tests: [
						{ no: 1, page: 57 },
						{ no: 2, page: 58 },
					],
				},
			],
		},
		{
			id: "tema-3",
			title: "3. Tema: Sayılar ve Nicelikler (2)",
			label: "3. Tema",
			units: [
				{
					topic: "Ondalık Gösterimlerde Basamak Değeri",
					tests: [{ no: 1, kind: "izleme", page: 59 }],
				},
				{
					topic: "Ondalık Gösterimleri Çözümleme",
					tests: [{ no: 2, kind: "izleme", page: 61 }],
				},
				{
					topic: "Ondalık Gösterimlerde Yuvarlama",
					tests: [
						{ no: 3, kind: "izleme", page: 63 },
						{ no: 4, kind: "izleme", page: 65 },
					],
				},
				{
					topic: "Ondalık Gösterimleri Çözümleme",
					tests: [
						{ no: 5, kind: "ikiz", page: 67 },
						{ no: 6, kind: "yeni_nesil", page: 69 },
					],
				},
				{
					topic: "Kesir ile Bölme İşlemi İlişkisi",
					tests: [
						{ no: 7, kind: "izleme", page: 71 },
						{ no: 8, kind: "izleme", page: 73 },
						{ no: 9, kind: "ikiz", page: 75 },
						{ no: 10, kind: "yeni_nesil", page: 77 },
					],
				},
				{
					topic: "Kesirlerle Toplama ve Çıkarma İşlemi",
					tests: [
						{ no: 11, kind: "izleme", page: 79 },
						{ no: 12, kind: "izleme", page: 81 },
					],
				},
				{
					topic:
						"Kesirlerle Toplama ve Çıkarma İşlemi Gerektiren Problem Çözme",
					tests: [
						{ no: 13, kind: "izleme", page: 83 },
						{ no: 14, kind: "izleme", page: 85 },
					],
				},
				{
					topic: "Kesirlerle Toplama ve Çıkarma İşlemi",
					tests: [
						{ no: 15, kind: "ikiz", page: 87 },
						{ no: 16, kind: "yeni_nesil", page: 89 },
					],
				},
				{
					topic: "Bir Doğal Sayı ile Bir Kesrin Çarpımı",
					tests: [{ no: 17, kind: "izleme", page: 91 }],
				},
				{
					topic: "İki Kesrin Çarpımı",
					tests: [{ no: 18, kind: "izleme", page: 93 }],
				},
				{
					topic: "Bir Doğal Sayı ile Bir Kesrin Bölümü",
					tests: [{ no: 19, kind: "izleme", page: 95 }],
				},
				{
					topic: "Bir Kesrin Bir Kesre Bölümü",
					tests: [{ no: 20, kind: "izleme", page: 97 }],
				},
				{
					topic: "Kesirlerle Dört İşlem İçeren Problem Çözme",
					tests: [
						{ no: 21, kind: "izleme", page: 99 },
						{ no: 22, kind: "izleme", page: 101 },
						{ no: 23, kind: "ikiz", page: 103 },
						{ no: 24, kind: "yeni_nesil", page: 105 },
					],
				},
				{
					topic: "Ondalık Gösterimlerle Toplama ve Çıkarma İşlemi",
					tests: [
						{ no: 25, kind: "izleme", page: 107 },
						{ no: 26, kind: "izleme", page: 109 },
						{ no: 27, kind: "ikiz", page: 111 },
						{ no: 28, kind: "yeni_nesil", page: 113 },
					],
				},
				{
					topic: "Ondalık Gösterimlerle Çarpma İşlemi",
					tests: [{ no: 29, kind: "izleme", page: 115 }],
				},
				{
					topic: "Ondalık Gösterimlerle Kısa Yoldan Çarpma İşlemi",
					tests: [{ no: 30, kind: "izleme", page: 117 }],
				},
				{
					topic: "Ondalık Gösterimlerle Bölme İşlemi",
					tests: [{ no: 31, kind: "izleme", page: 119 }],
				},
				{
					topic: "Ondalık Gösterimlerle Kısa Yoldan Bölme İşlemi",
					tests: [{ no: 32, kind: "izleme", page: 121 }],
				},
				{
					topic: "Ondalık Gösterimlerle İşlem Yapmayı Gerektiren Problem Çözme",
					tests: [
						{ no: 33, kind: "izleme", page: 123 },
						{ no: 34, kind: "izleme", page: 125 },
						{ no: 35, kind: "ikiz", page: 127 },
						{ no: 36, kind: "yeni_nesil", page: 131 },
					],
				},
				{
					topic: "Bir Çokluğun Belli Bir Yüzdesini Hesaplama",
					tests: [
						{ no: 37, kind: "izleme", page: 133 },
						{ no: 38, kind: "izleme", page: 135 },
						{ no: 39, kind: "izleme", page: 137 },
					],
				},
				{
					topic: "Uzunluk Ölçme Birimleri",
					tests: [
						{ no: 40, kind: "izleme", page: 139 },
						{ no: 41, kind: "izleme", page: 141 },
					],
				},
				{
					topic:
						"Bir Çokluğun Belli Bir Yüzdesini Hesaplama ve Uzunluk Ölçme Birimleri",
					tests: [
						{ no: 42, kind: "ikiz", page: 143 },
						{ no: 43, kind: "yeni_nesil", page: 145 },
					],
				},
			],
		},
		{
			id: "tema-3-baglam",
			title: "3. Tema: Bağlam Temelli Sorular",
			label: "3. Tema · Bağlam Temelli",
			units: [
				{
					topic: "Bağlam Temelli Sorular (Sayılar ve Nicelikler (2))",
					tests: [
						{ no: 1, page: 147 },
						{ no: 2, page: 148 },
						{ no: 3, page: 149 },
						{ no: 4, page: 150 },
					],
				},
			],
		},
		{
			id: "tema-4",
			title: "4. Tema: İstatistiksel Araştırma Süreci",
			label: "4. Tema",
			units: [
				{
					topic:
						"Kategorik veya Nicel (Kesikli) Veriye Dayalı Araştırma Sorusu Oluşturma",
					tests: [
						{ no: 1, kind: "izleme", page: 151 },
						{ no: 2, kind: "izleme", page: 153 },
					],
				},
				{
					topic: "Veri Görselleştirme / Sütun Grafikleri",
					tests: [{ no: 3, kind: "izleme", page: 155 }],
				},
				{
					topic: "Veri Görselleştirme / Kök - Yaprak Gösterimi",
					tests: [
						{ no: 4, kind: "izleme", page: 157 },
						{ no: 5, kind: "izleme", page: 159 },
					],
				},
				{
					topic: "Veri Özetleme / Bir Veri Grubuna Ait Açıklık",
					tests: [{ no: 6, kind: "izleme", page: 161 }],
				},
				{
					topic: "Veri Özetleme / Bir Veri Grubuna Ait Aritmetik Ortalama",
					tests: [
						{ no: 7, kind: "izleme", page: 163 },
						{ no: 8, kind: "izleme", page: 165 },
						{ no: 9, kind: "izleme", page: 167 },
					],
				},
				{
					topic: "Veri Özetleme / Bir Veri Grubuna Ait Ortanca ve Tepe Değer",
					tests: [
						{ no: 10, kind: "izleme", page: 169 },
						{ no: 11, kind: "izleme", page: 171 },
					],
				},
				{
					topic: "Veri Gruplarında Özetleme Aracı Seçme",
					tests: [{ no: 12, kind: "izleme", page: 173 }],
				},
				{
					topic: "Sonuçları Yorumlama ve Tartışma",
					tests: [
						{ no: 13, kind: "izleme", page: 175 },
						{ no: 14, kind: "izleme", page: 177 },
					],
				},
				{
					topic: "İstatistiksel Araştırma Süreci Aşamaları",
					tests: [
						{ no: 15, kind: "ikiz", page: 179 },
						{ no: 16, kind: "yeni_nesil", page: 183 },
					],
				},
			],
		},
		{
			id: "tema-4-baglam",
			title: "4. Tema: Bağlam Temelli Sorular",
			label: "4. Tema · Bağlam Temelli",
			units: [
				{
					topic: "Bağlam Temelli Sorular (İstatistiksel Araştırma Süreci)",
					tests: [
						{ no: 1, page: 187 },
						{ no: 2, page: 188 },
					],
				},
			],
		},
		{
			id: "tema-5",
			title: "5. Tema: Geometrik Şekiller",
			label: "5. Tema",
			units: [
				{
					topic:
						"Düzlemde Paralel İki Doğru ve En Az Bir Kesenin Oluşturduğu Açılar",
					tests: [
						{ no: 1, kind: "izleme", page: 189 },
						{ no: 2, kind: "izleme", page: 191 },
						{ no: 3, kind: "izleme", page: 193 },
						{ no: 4, kind: "ikiz", page: 195 },
						{ no: 5, kind: "yeni_nesil", page: 197 },
					],
				},
				{
					topic: "Paralel İki Doğru ve İki Kesenin Oluşturduğu Şekiller",
					tests: [
						{ no: 6, kind: "izleme", page: 199 },
						{ no: 7, kind: "izleme", page: 201 },
					],
				},
				{
					topic: "Üçgende Açılar",
					tests: [
						{ no: 8, kind: "izleme", page: 203 },
						{ no: 9, kind: "izleme", page: 205 },
					],
				},
				{
					topic: "Dörtgenlerin Açı ve Kenar Özellikleri",
					tests: [
						{ no: 10, kind: "izleme", page: 207 },
						{ no: 11, kind: "izleme", page: 209 },
					],
				},
				{
					topic: "Köşegenleri Birbirini Ortalayan Dörtgenler",
					tests: [
						{ no: 12, kind: "izleme", page: 211 },
						{ no: 13, kind: "izleme", page: 213 },
						{ no: 14, kind: "izleme", page: 215 },
					],
				},
				{
					topic: "Dörtgenlerde Açı Problemleri",
					tests: [
						{ no: 15, kind: "izleme", page: 217 },
						{ no: 16, kind: "izleme", page: 219 },
					],
				},
				{
					topic: "Üçgen ve Dörtgenlerde Açı Problemleri / Köşegen Özellikleri",
					tests: [
						{ no: 17, kind: "ikiz", page: 221 },
						{ no: 18, kind: "yeni_nesil", page: 225 },
					],
				},
			],
		},
		{
			id: "tema-5-baglam",
			title: "5. Tema: Bağlam Temelli Sorular",
			label: "5. Tema · Bağlam Temelli",
			units: [
				{
					topic: "Bağlam Temelli Sorular (Geometrik Şekiller)",
					tests: [
						{ no: 1, page: 229 },
						{ no: 2, page: 230 },
					],
				},
			],
		},
		{
			id: "tema-6",
			title: "6. Tema: İşlemlerle Cebirsel Düşünme ve Değişimler",
			label: "6. Tema",
			units: [
				{
					topic: "Cebirsel İfadeler",
					tests: [
						{ no: 1, kind: "izleme", page: 231 },
						{ no: 2, kind: "izleme", page: 233 },
						{ no: 3, kind: "izleme", page: 235 },
					],
				},
				{
					topic: "Cebirsel İfadelerde Sabit Terim ve Katsayı",
					tests: [{ no: 4, kind: "izleme", page: 237 }],
				},
				{
					topic: "Cebirsel İfadelerin Değeri",
					tests: [{ no: 5, kind: "izleme", page: 239 }],
				},
				{
					topic: "Cebirsel İfadeler",
					tests: [
						{ no: 6, kind: "izleme", page: 241 },
						{ no: 7, kind: "izleme", page: 243 },
						{ no: 8, kind: "ikiz", page: 245 },
						{ no: 9, kind: "yeni_nesil", page: 249 },
					],
				},
				{
					topic: "Örüntüler",
					tests: [
						{ no: 10, kind: "izleme", page: 251 },
						{ no: 11, kind: "izleme", page: 253 },
						{ no: 12, kind: "izleme", page: 255 },
					],
				},
				{
					topic: "Çokgenler",
					tests: [
						{ no: 13, kind: "izleme", page: 257 },
						{ no: 14, kind: "izleme", page: 259 },
					],
				},
				{
					topic: "Cebirsel İfadeler ve Algoritma",
					tests: [{ no: 15, kind: "izleme", page: 261 }],
				},
				{
					topic: "Örüntüler, Çokgenler ve Algoritma",
					tests: [
						{ no: 16, kind: "ikiz", page: 266 },
						{ no: 17, kind: "yeni_nesil", page: 270 },
					],
				},
			],
		},
		{
			id: "tema-6-baglam",
			title: "6. Tema: Bağlam Temelli Sorular",
			label: "6. Tema · Bağlam Temelli",
			units: [
				{
					topic:
						"Bağlam Temelli Sorular (İşlemlerle Cebirsel Düşünme ve Değişimler)",
					tests: [
						{ no: 1, page: 273 },
						{ no: 2, page: 274 },
					],
				},
			],
		},
		{
			id: "tema-7",
			title: "7. Tema: Geometrik Nicelikler",
			label: "7. Tema",
			units: [
				{
					topic: "Alan Ölçme Birimleri",
					tests: [
						{ no: 1, kind: "izleme", page: 275 },
						{ no: 2, kind: "izleme", page: 277 },
					],
				},
				{
					topic: "Paralelkenarın Yüksekliği ve Alanı",
					tests: [
						{ no: 3, kind: "izleme", page: 279 },
						{ no: 4, kind: "izleme", page: 281 },
					],
				},
				{
					topic: "Üçgenin Yüksekliği ve Alanı",
					tests: [
						{ no: 5, kind: "izleme", page: 283 },
						{ no: 6, kind: "izleme", page: 285 },
						{ no: 7, kind: "izleme", page: 287 },
					],
				},
				{
					topic:
						"Geometrik Şekillerin Alanlarıyla İlgili Gerçek Yaşam Problemleri Çözme",
					tests: [{ no: 8, kind: "izleme", page: 289 }],
				},
				{
					topic: "Alan Ölçme Birimleri, Paralelkenar ve Üçgen Alanı",
					tests: [
						{ no: 9, kind: "ikiz", page: 291 },
						{ no: 10, kind: "yeni_nesil", page: 295 },
					],
				},
				{
					topic: "Çemberin ve Çapın Uzunlukları Arasındaki İlişki",
					tests: [
						{ no: 11, kind: "izleme", page: 297 },
						{ no: 12, kind: "izleme", page: 299 },
						{ no: 13, kind: "ikiz", page: 301 },
						{ no: 14, kind: "yeni_nesil", page: 303 },
					],
				},
				{
					topic: "Çemberde Merkez Açı ve Gördüğü Yay Uzunluğu",
					tests: [
						{ no: 15, kind: "izleme", page: 307 },
						{ no: 16, kind: "izleme", page: 309 },
						{ no: 17, kind: "ikiz", page: 311 },
						{ no: 18, kind: "yeni_nesil", page: 313 },
					],
				},
			],
		},
		{
			id: "tema-7-baglam",
			title: "7. Tema: Bağlam Temelli Sorular",
			label: "7. Tema · Bağlam Temelli",
			units: [
				{
					topic: "Bağlam Temelli Sorular (Geometrik Nicelikler)",
					tests: [
						{ no: 1, page: 314 },
						{ no: 2, page: 315 },
					],
				},
			],
		},
	],
};
