import type { Curriculum } from "@ivmeapp/core";

/**
 * 6. sınıf Türkçe, 2026-2027: altı tema ve konuları (kullanıcının sağladığı özet).
 * Hafta/tarih planı ve kazanım kodları bu özette YOK; hangi temada olunduğunu veli seçer.
 *
 * `match` ifadeleri kitap konu adlarıyla eşleşme için önerilmiştir (yorum içerir,
 * doğrulanmadı). Boş bırakılan konuların Fenomen Paragraf kitaplarında karşılığı yok.
 */
export const turkce6: Curriculum = {
	id: "turkce-6-2026-2027",
	subject: "turkce",
	grade: 6,
	year: "2026-2027",
	source: "Kullanıcı sağladı: 6. Sınıf Türkçe Konuları 2026-2027 özeti",
	units: [
		{
			id: "tema-1",
			order: 1,
			title: "Dilimizin Zenginliği",
			topics: [
				{ title: "Türkçenin söz varlığı" },
				{ title: "Kelimelerin anlam özellikleri" },
				{ title: "Bağlamdan hareketle kelime anlamını belirleme" },
				{ title: "Deyimler ve atasözleri" },
				{ title: "Türkçenin anlatım gücü", match: ["dil ve anlatım"] },
				{ title: "Söz sanatları", match: ["dil ve anlatım"] },
				{
					title: "Metnin anlamını oluşturan unsurlar",
					match: ["hikâye unsurları", "olay örgüsü", "metnin yapısı"],
				},
				{ title: "Okuma ve anlama çalışmaları" },
				{ title: "Sözlü ve yazılı anlatım çalışmaları" },
			],
		},
		{
			id: "tema-2",
			order: 2,
			title: "Bağımsızlık Yolu",
			topics: [
				{ title: "Bağımsızlık ve özgürlük" },
				{ title: "Millî Mücadele" },
				{ title: "Vatan sevgisi" },
				{ title: "Millî birlik ve beraberlik" },
				{ title: "Millî ve manevi değerler" },
				{ title: "Tarihî olay ve şahsiyetler" },
				{
					title: "Metinlerde ana düşünce ve yardımcı düşünceler",
					match: ["ana düşünce", "yardımcı düşünce"],
				},
				{
					title: "Metinler arası ilişki kurma",
					match: ["metin karşılaştırma", "metin içi karşılaştırma"],
				},
				{ title: "Sözlü ve yazılı anlatım çalışmaları" },
			],
		},
		{
			id: "tema-3",
			order: 3,
			title: "Farklı Dünyalar",
			topics: [
				{ title: "Farklı yaşamlar ve kültürler" },
				{ title: "Kültürel çeşitlilik" },
				{ title: "Farklı bakış açıları" },
				{ title: "Hayal ve gerçeklik" },
				{ title: "Merak ve keşif" },
				{
					title: "Metinleri karşılaştırma",
					match: ["metin karşılaştırma", "metin içi karşılaştırma"],
				},
				{
					title: "Metinden çıkarım yapma",
					match: ["tahmin etme", "altında yatan niyet", "çözüm üretme"],
				},
				{ title: "Görsel okuma ve yorumlama", match: ["görsel yorumlama"] },
				{ title: "Yaratıcı konuşma ve yazma çalışmaları" },
			],
		},
		{
			id: "tema-4",
			order: 4,
			title: "İletişim ve Sosyal İlişkiler",
			topics: [
				{ title: "İletişimin önemi" },
				{ title: "Sözlü iletişim" },
				{ title: "Yazılı iletişim" },
				{ title: "Beden dili" },
				{ title: "Dinleme ve konuşma kuralları" },
				{ title: "Empati" },
				{ title: "Saygı ve nezaket" },
				{ title: "Sosyal ilişkiler" },
				{
					title: "İletişim sorunları ve çözüm yolları",
					match: ["çözüm üretme"],
				},
				{ title: "Düşünceleri uygun biçimde ifade etme" },
			],
		},
		{
			id: "tema-5",
			order: 5,
			title: "Bilim ve Teknoloji",
			topics: [
				{ title: "Bilimsel gelişmeler" },
				{ title: "Teknolojik gelişmeler" },
				{ title: "Bilim insanları" },
				{ title: "Teknolojinin günlük yaşama etkileri" },
				{ title: "Dijital dünyada iletişim" },
				{ title: "Bilgiye erişme ve bilgiyi değerlendirme" },
				{ title: "Kaynakların güvenilirliğini sorgulama" },
				{
					title: "Bilgilendirici metinler",
					match: ["paragraf türleri", "düşünceyi geliştirme yolları"],
				},
				{
					title:
						"Bilim ve teknoloji konulu sözlü ve yazılı anlatım çalışmaları",
				},
			],
		},
		{
			id: "tema-6",
			order: 6,
			title: "Lider Ruhlar",
			topics: [
				{ title: "Liderlik" },
				{ title: "Örnek kişilikler", match: ["kişilik özellikleri"] },
				{ title: "Azim ve kararlılık" },
				{ title: "Sorumluluk" },
				{ title: "Başarı ve çalışma" },
				{ title: "Topluma katkı" },
				{ title: "Problem çözme", match: ["çözüm üretme"] },
				{ title: "Karar verme" },
				{ title: "Biyografik metinler" },
				{
					title:
						"Örnek kişilerden hareketle sözlü ve yazılı anlatım çalışmaları",
				},
			],
		},
	],
};
