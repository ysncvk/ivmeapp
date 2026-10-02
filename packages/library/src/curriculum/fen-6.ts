import type { Curriculum } from "@ivmeapp/core";

import { breaks, examPeriods, weeks } from "./fen-6.weeks";

/**
 * 6. sınıf Fen Bilimleri, 2026-2027 yıllık planı (kullanıcının sağladığı Excel dosyası).
 * Hafta hafta tarih, ünite, konu ve kazanım kodları dosyadan ayrıştırıldı
 * (`fen-6.weeks.ts`, `scripts/import_yillik_plan.py`). Okulun kendi temposu farklı
 * olabilir; hangi haftada olunduğunu veli düzeltebilir.
 *
 * `match` ifadeleri Fenomen Fen A kitabının konu adlarıyla eşleşme için kazanımlara
 * bakılarak önerilmiştir (yorum içerir, doğrulanmadı).
 */
export const fen6: Curriculum = {
	id: "fen-6-2026-2027",
	subject: "fen",
	grade: 6,
	year: "2026-2027",
	source:
		"Kullanıcı sağladı: 6. Sınıf Fen Bilimleri Yıllık Planı 2026-2027 (Excel)",
	weeklyHours: 4,
	schoolBasedHours: weeks.reduce((sum, w) => sum + (w.otpHours ?? 0), 0),
	units: [
		{
			id: "unite-1",
			order: 1,
			title: "Güneş Sistemi ve Tutulmalar",
			topics: [
				{ title: "Güneş Sistemi", match: ["güneş sistemi"] },
				{
					title: "Güneş ve Ay Tutulmaları",
					match: ["güneş ve ay tutulmaları"],
				},
			],
		},
		{
			id: "unite-2",
			order: 2,
			title: "Kuvvetin Etkisinde Hareket",
			topics: [
				{ title: "Bileşke Kuvvet", match: ["bileşke kuvvet"] },
				{
					title: "Sabit Süratli ve Sabit Hızlı Hareket",
					match: ["sabit süratli"],
				},
			],
		},
		{
			id: "unite-3",
			order: 3,
			title: "Canlılarda Sistemler",
			topics: [
				{
					title: "Bitki ve Hayvanlarda Üreme, Büyüme ve Gelişme",
					match: [
						"eşeyli ve eşeysiz",
						"bitkilerde üreme",
						"hayvanlarda üreme",
						"insanlarda üremeyi",
					],
				},
				{
					title: "Denetleyici ve Düzenleyici Sistemler",
					match: ["denetleyici ve düzenleyici"],
				},
			],
		},
		{
			id: "unite-4",
			order: 4,
			title: "Işığın Yansıması ve Renkler",
			topics: [
				{ title: "Işığın Yansıması", match: ["ışığın yansıması"] },
				{ title: "Aynalar", match: ["aynalar"] },
				{ title: "Işığın Soğurulması", match: ["ışığın soğurulması"] },
			],
		},
		{
			id: "unite-5",
			order: 5,
			title: "Maddenin Ayırt Edici Özellikleri",
			topics: [
				{ title: "Genleşme ve Büzülme", match: ["genleşme ve büzülme"] },
				{
					title: "Maddenin Hâl Değişim Noktaları",
					match: ["hâl değişim noktaları"],
				},
				{ title: "Yoğunluk", match: ["yoğunluk"] },
			],
		},
		{
			id: "unite-6",
			order: 6,
			title: "Elektriğin İletimi ve Direnç",
			topics: [
				{ title: "Elektriğin İletimi", match: ["elektriğin iletimi"] },
				{
					title: "Elektriksel Direnç ve Bağlı Olduğu Faktörler",
					match: ["elektriksel direnç"],
				},
			],
		},
		{
			id: "unite-7",
			order: 7,
			title: "Sürdürülebilir Yaşam ve Etkileşim",
			topics: [
				{ title: "Biyoçeşitlilik", match: ["biyoçeşitlilik"] },
				{
					title: "İnsan ve Çevre Etkileşimi",
					match: ["insan ve çevre etkileşimi"],
				},
			],
		},
	],
	weeks,
	breaks,
	examPeriods,
};
