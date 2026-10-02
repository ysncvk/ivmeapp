import type { Curriculum, CurriculumTopic } from "@ivmeapp/core";

import { breaks, texts, weeks } from "./turkce-6.weeks";

/**
 * 6. sınıf Türkçe, 2026-2027 ünitelendirilmiş yıllık planı (kullanıcının sağladığı Word
 * dosyası). Plan hafta değil DÖNEM (~8 ders saati) ve METİN tabanlıdır; her takvim haftası,
 * o haftayla en çok iş günü kesişen dönem(ler)e bağlandı (`turkce-6.weeks.ts`,
 * `scripts/import_yillik_plan_turkce.py`). Kazanım kodları ders becerisine göredir
 * (T.D dinleme, T.K konuşma, T.O okuma, T.Y yazma).
 *
 * Fenomen Paragraf kitapları metne değil paragraf becerisine göre kurulu olduğu için kitap
 * eşleşmesi tema düzeyindedir: her temanın içerik çerçevesindeki kavramlara karşılık gelen
 * kitap konuları `match` ile önerilmiştir (yorum içerir, doğrulanmadı). Eşleşmeyen testler
 * düşmez, havuzun arkasında sırayla kalır.
 */
const TEMA_MATCH: Record<string, string[]> = {
	// Türkçenin söz varlığı, anlam ve anlatım gücü, anahtar kelime, yüzey anlam
	"tema-1": ["dil ve anlatım", "paragrafta konu", "başlık", "anahtar sözcük"],
	// Metin içi/metinler arası karşılaştırma, özetleme, sınıflandırma, duygu, empati
	"tema-2": [
		"ana düşünce",
		"yardımcı düşünce",
		"metin karşılaştırma",
		"metin içi karşılaştırma",
		"özetleme",
		"duyular, duygular",
	],
	// Çıkarım, karşılaştırma, düşünceyi geliştirme yolları, özetleme, tartışma
	"tema-3": [
		"metin karşılaştırma",
		"tahmin etme",
		"niyet",
		"düşünceyi geliştirme yolları",
		"özetleme",
		"görsel yorumlama",
	],
	// Metin yapıları, yorumlama, özetleme, yazım ve noktalama
	"tema-4": [
		"metnin yapısı",
		"metni ikiye bölme",
		"özetleme",
		"dil ve anlatım",
	],
	// Bilim, teknoloji, söz sanatları, açık ve örtük ifade, tartışma
	"tema-5": [
		"dil ve anlatım",
		"paragraf türleri",
		"düşünceyi geliştirme yolları",
	],
	// Örnek kişilikler, değerlendirme, eleştirme, probleme çözüm üretme
	"tema-6": [
		"kişilik özellikleri",
		"çözüm üretme",
		"niyet",
		"yazarın eleştirdiği",
	],
};

const TEMALAR: { id: string; title: string }[] = [
	{ id: "tema-1", title: "Dilimizin Zenginliği" },
	{ id: "tema-2", title: "Bağımsızlık Yolu" },
	{ id: "tema-3", title: "Farklı Dünyalar" },
	{ id: "tema-4", title: "İletişim ve Sosyal İlişkiler" },
	{ id: "tema-5", title: "Bilim ve Teknoloji" },
	{ id: "tema-6", title: "Lider Ruhlar" },
];

export const turkce6: Curriculum = {
	id: "turkce-6-2026-2027",
	subject: "turkce",
	grade: 6,
	year: "2026-2027",
	source:
		"Kullanıcı sağladı: 6. Sınıf Türkçe Ünitelendirilmiş Yıllık Plan 2026-2027 (Word)",
	// Dönemler ~8 ders saati / ~9 gün; haftalık süre buradan türetilmiştir (varsayım).
	weeklyHours: 6,
	schoolBasedHours: 10,
	units: TEMALAR.map((t, i) => ({
		id: t.id,
		order: i + 1,
		title: t.title,
		topics: (texts[t.id] ?? []).map(
			(title): CurriculumTopic => ({ title, match: TEMA_MATCH[t.id] ?? [] }),
		),
	})),
	weeks,
	breaks,
};
