import type { SourceBook } from "@ivmeapp/core";

/**
 * İçindekiler sayfasından aktarıldı. Test numaraları her ünitede yeniden başlar; her
 * ünitenin son testi "Bağlam Temelli" testtir ve aynı sırada numaralanır. Test başına
 * 12 soru kullanıcı bilgisidir.
 */
export const fenomen6FenA: SourceBook = {
	id: "fenomen-6-fen-a",
	title: "Fenomen 6 Fen Bilimleri A Soru Bankası",
	subject: "fen",
	grade: 6,
	kind: "yardimci",
	questionsPerTest: 12,
	answerKeyPage: 287,
	sections: [
		{
			id: "unite-1",
			title: "1. Ünite: Güneş Sistemi ve Tutulmalar",
			label: "1. Ünite",
			units: [
				{
					topic: "Güneş Sistemi",
					tests: [
						{ no: 1, kind: "kavram", page: 5 },
						{ no: 2, kind: "izleme", page: 7 },
						{ no: 3, kind: "izleme", page: 9 },
						{ no: 4, kind: "ikiz", page: 11 },
						{ no: 5, kind: "yeni_nesil", page: 14 },
					],
				},
				{
					topic: "Güneş ve Ay Tutulmaları",
					tests: [
						{ no: 6, kind: "kavram", page: 19 },
						{ no: 7, kind: "izleme", page: 21 },
						{ no: 8, kind: "izleme", page: 24 },
						{ no: 9, kind: "ikiz", page: 26 },
						{ no: 10, kind: "yeni_nesil", page: 29 },
						{ no: 11, kind: "baglam", page: 33 },
					],
				},
			],
		},
		{
			id: "unite-2",
			title: "2. Ünite: Kuvvetin Etkisinde Hareket",
			label: "2. Ünite",
			units: [
				{
					topic: "Bileşke Kuvvet",
					tests: [
						{ no: 1, kind: "kavram", page: 35 },
						{ no: 2, kind: "izleme", page: 38 },
						{ no: 3, kind: "izleme", page: 41 },
						{ no: 4, kind: "ikiz", page: 44 },
						{ no: 5, kind: "yeni_nesil", page: 47 },
					],
				},
				{
					topic: "Sabit Süratli ve Sabit Hızlı Hareket",
					tests: [
						{ no: 6, kind: "kavram", page: 51 },
						{ no: 7, kind: "izleme", page: 54 },
						{ no: 8, kind: "izleme", page: 57 },
						{ no: 9, kind: "ikiz", page: 59 },
						{ no: 10, kind: "yeni_nesil", page: 62 },
						{ no: 11, kind: "baglam", page: 67 },
					],
				},
			],
		},
		{
			id: "unite-3",
			title: "3. Ünite: Canlılarda Sistemler",
			label: "3. Ünite",
			units: [
				{
					topic: "Eşeyli ve Eşeysiz Üreme",
					tests: [
						{ no: 1, kind: "kavram", page: 69 },
						{ no: 2, kind: "izleme", page: 71 },
						{ no: 3, kind: "ikiz", page: 73 },
						{ no: 4, kind: "yeni_nesil", page: 76 },
					],
				},
				{
					topic: "Bitkilerde Üreme, Büyüme, Gelişme ve Tohumun Çimlenmesi",
					tests: [
						{ no: 5, kind: "kavram", page: 79 },
						{ no: 6, kind: "izleme", page: 82 },
						{ no: 7, kind: "ikiz", page: 85 },
						{ no: 8, kind: "yeni_nesil", page: 88 },
					],
				},
				{
					topic: "Hayvanlarda Üreme, Büyüme ve Gelişme",
					tests: [
						{ no: 9, kind: "kavram", page: 91 },
						{ no: 10, kind: "izleme", page: 93 },
						{ no: 11, kind: "ikiz", page: 95 },
						{ no: 12, kind: "yeni_nesil", page: 98 },
					],
				},
				{
					topic: "İnsanlarda Üremeyi Sağlayan Yapı ve Organlar",
					tests: [
						{ no: 13, kind: "kavram", page: 101 },
						{ no: 14, kind: "izleme", page: 103 },
						{ no: 15, kind: "ikiz", page: 106 },
						{ no: 16, kind: "yeni_nesil", page: 108 },
					],
				},
				{
					topic: "Denetleyici ve Düzenleyici Sistemler",
					tests: [
						{ no: 17, kind: "kavram", page: 111 },
						{ no: 18, kind: "izleme", page: 114 },
						{ no: 19, kind: "izleme", page: 116 },
						{ no: 20, kind: "ikiz", page: 118 },
						{ no: 21, kind: "yeni_nesil", page: 121 },
					],
				},
				{
					topic: "Ergenlik, Denetleyici ve Düzenleyici Sistemlerin Sağlığı",
					tests: [
						{ no: 22, kind: "kavram", page: 125 },
						{ no: 23, kind: "izleme", page: 127 },
						{ no: 24, kind: "ikiz", page: 129 },
						{ no: 25, kind: "yeni_nesil", page: 131 },
						{ no: 26, kind: "baglam", page: 133 },
					],
				},
			],
		},
		{
			id: "unite-4",
			title: "4. Ünite: Işığın Yansıması ve Renkler",
			label: "4. Ünite",
			units: [
				{
					topic: "Işığın Yansıması",
					tests: [
						{ no: 1, kind: "kavram", page: 137 },
						{ no: 2, kind: "izleme", page: 139 },
						{ no: 3, kind: "izleme", page: 141 },
						{ no: 4, kind: "ikiz", page: 144 },
						{ no: 5, kind: "yeni_nesil", page: 147 },
					],
				},
				{
					topic: "Aynalar",
					tests: [
						{ no: 6, kind: "kavram", page: 151 },
						{ no: 7, kind: "izleme", page: 154 },
						{ no: 8, kind: "izleme", page: 156 },
						{ no: 9, kind: "ikiz", page: 158 },
						{ no: 10, kind: "yeni_nesil", page: 161 },
					],
				},
				{
					topic: "Işığın Soğurulması",
					tests: [
						{ no: 11, kind: "kavram", page: 165 },
						{ no: 12, kind: "izleme", page: 168 },
						{ no: 13, kind: "izleme", page: 170 },
						{ no: 14, kind: "ikiz", page: 173 },
						{ no: 15, kind: "yeni_nesil", page: 176 },
						{ no: 16, kind: "baglam", page: 181 },
					],
				},
			],
		},
		{
			id: "unite-5",
			title: "5. Ünite: Maddenin Ayırt Edici Özellikleri",
			label: "5. Ünite",
			units: [
				{
					topic: "Genleşme ve Büzülme",
					tests: [
						{ no: 1, kind: "kavram", page: 183 },
						{ no: 2, kind: "izleme", page: 185 },
						{ no: 3, kind: "izleme", page: 187 },
						{ no: 4, kind: "ikiz", page: 190 },
						{ no: 5, kind: "yeni_nesil", page: 193 },
					],
				},
				{
					topic: "Maddenin Hâl Değişim Noktaları",
					tests: [
						{ no: 6, kind: "kavram", page: 197 },
						{ no: 7, kind: "izleme", page: 200 },
						{ no: 8, kind: "izleme", page: 202 },
						{ no: 9, kind: "ikiz", page: 204 },
						{ no: 10, kind: "yeni_nesil", page: 207 },
					],
				},
				{
					topic: "Yoğunluk",
					tests: [
						{ no: 11, kind: "kavram", page: 211 },
						{ no: 12, kind: "izleme", page: 214 },
						{ no: 13, kind: "izleme", page: 216 },
						{ no: 14, kind: "ikiz", page: 219 },
						{ no: 15, kind: "yeni_nesil", page: 222 },
						{ no: 16, kind: "baglam", page: 227 },
					],
				},
			],
		},
		{
			id: "unite-6",
			title: "6. Ünite: Elektriğin İletimi ve Direnç",
			label: "6. Ünite",
			units: [
				{
					topic: "Elektriğin İletimi",
					tests: [
						{ no: 1, kind: "kavram", page: 229 },
						{ no: 2, kind: "izleme", page: 231 },
						{ no: 3, kind: "ikiz", page: 234 },
						{ no: 4, kind: "yeni_nesil", page: 237 },
					],
				},
				{
					topic: "Elektriksel Direnç ve Bağlı Olduğu Faktörler",
					tests: [
						{ no: 5, kind: "kavram", page: 241 },
						{ no: 6, kind: "izleme", page: 243 },
						{ no: 7, kind: "izleme", page: 246 },
						{ no: 8, kind: "ikiz", page: 248 },
						{ no: 9, kind: "yeni_nesil", page: 251 },
						{ no: 10, kind: "baglam", page: 255 },
					],
				},
			],
		},
		{
			id: "unite-7",
			title: "7. Ünite: Sürdürülebilir Yaşam ve Etkileşim",
			label: "7. Ünite",
			units: [
				{
					topic: "Biyoçeşitlilik",
					tests: [
						{ no: 1, kind: "kavram", page: 257 },
						{ no: 2, kind: "izleme", page: 259 },
						{ no: 3, kind: "ikiz", page: 261 },
						{ no: 4, kind: "yeni_nesil", page: 264 },
					],
				},
				{
					topic: "İnsan ve Çevre Etkileşimi (Yakıtlar)",
					tests: [
						{ no: 5, kind: "kavram", page: 267 },
						{ no: 6, kind: "izleme", page: 269 },
						{ no: 7, kind: "ikiz", page: 271 },
						{ no: 8, kind: "yeni_nesil", page: 273 },
					],
				},
				{
					topic: "İnsan ve Çevre Etkileşimi (Çevre Sorunları)",
					tests: [
						{ no: 9, kind: "kavram", page: 275 },
						{ no: 10, kind: "izleme", page: 277 },
						{ no: 11, kind: "ikiz", page: 279 },
						{ no: 12, kind: "yeni_nesil", page: 282 },
						{ no: 13, kind: "baglam", page: 285 },
					],
				},
			],
		},
	],
};
