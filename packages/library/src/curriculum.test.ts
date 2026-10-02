import {
	bookWorkItems,
	normalizeTr,
	unitWeeks,
	validateCurriculum,
	weeklyPool,
} from "@ivmeapp/core";
import { describe, expect, it } from "vitest";

import {
	curricula,
	fenomen6MatematikA,
	fenomen6ParagrafA,
	fenomen6ParagrafB,
	matematik6,
	turkce6,
} from "./index";

const paragraf = [
	...bookWorkItems(fenomen6ParagrafA),
	...bookWorkItems(fenomen6ParagrafB),
];
const unit = (id: string) => {
	const u = turkce6.units.find((x) => x.id === id);
	if (!u) throw new Error(`ünite yok: ${id}`);
	return u;
};

describe("normalizeTr", () => {
	it("küçük harfe çevirir ve aksanları kaldırır", () => {
		expect(normalizeTr("Hikâye Unsurları, İŞLEM")).toBe(
			"hikaye unsurlari, islem",
		);
		expect(normalizeTr("ÇÖZÜM Üretme")).toBe("cozum uretme");
	});
});

describe("müfredat verisi", () => {
	it.each(curricula.map((c) => [c.id, c] as const))(
		"%s veri hatası içermez",
		(_id, c) => {
			expect(validateCurriculum(c)).toEqual([]);
		},
	);

	it("6. sınıf Türkçe: 6 tema, kaynak metindeki sırayla", () => {
		expect(turkce6.units.map((u) => u.title)).toEqual([
			"Dilimizin Zenginliği",
			"Bağımsızlık Yolu",
			"Farklı Dünyalar",
			"İletişim ve Sosyal İlişkiler",
			"Bilim ve Teknoloji",
			"Lider Ruhlar",
		]);
		expect(turkce6.units.map((u) => u.topics.length)).toEqual([
			9, 9, 9, 10, 9, 10,
		]);
	});
});

describe("weeklyPool: tema konuları kitap konularıyla eşleşir", () => {
	it("Tema 2: ana düşünce ve yardımcı düşünce testleri öne alınır", () => {
		const pool = weeklyPool(unit("tema-2"), paragraf);
		const matchedTopics = new Set(pool.matched.map((i) => i.topic));
		expect(matchedTopics.has("Paragrafta Ana Düşünce")).toBe(true);
		expect(matchedTopics.has("Paragrafta Yardımcı Düşünce")).toBe(true);
		// Ana düşünce testleri Paragraf A'da Test 6-8 (s.13, 15, 17)
		expect(pool.matched.some((i) => i.work === "s.13 Test 6")).toBe(true);
		// Eşleşmeyenler düşmez, arkada sıralanır
		expect(pool.items).toHaveLength(paragraf.length);
		expect(pool.items.slice(0, pool.matched.length)).toEqual(pool.matched);
	});

	it("Tema 4: eşleşen az, kitap yine de tümüyle kullanılabilir kalır", () => {
		const pool = weeklyPool(unit("tema-4"), paragraf);
		expect(pool.items).toHaveLength(paragraf.length);
		expect(pool.matched.length).toBeLessThan(pool.others.length);
	});

	it("eşleşmeyi aksan ve büyük/küçük harften bağımsız yapar", () => {
		const pool = weeklyPool(unit("tema-3"), paragraf);
		expect(
			pool.matched.some((i) =>
				normalizeTr(i.topic).includes("gorsel yorumlama"),
			),
		).toBe(true);
	});
});

describe("matematik müfredatı", () => {
	const mat = bookWorkItems(fenomen6MatematikA);
	const mUnit = (id: string) => {
		const u = matematik6.units.find((x) => x.id === id);
		if (!u) throw new Error(`ünite yok: ${id}`);
		return u;
	};

	it("ders saatleri toplamı 180, haftalık 5 saat", () => {
		const total =
			matematik6.units.reduce((sum, u) => sum + (u.hours ?? 0), 0) +
			(matematik6.schoolBasedHours ?? 0);
		expect(total).toBe(180);
		expect(matematik6.weeklyHours).toBe(5);
		expect(unitWeeks(matematik6, mUnit("tema-1a"))).toBe(3);
	});

	it("müfredat sırası kitap sırasından farklıdır, eşleşme konuyla yapılır", () => {
		// Müfredatta Geometrik Şekiller 4. ünite; kitapta 5. tema. Eşleşme konu adıyladır.
		const pool = weeklyPool(mUnit("tema-3"), mat);
		expect(pool.matched.length).toBeGreaterThan(0);
		expect(pool.matched.every((i) => i.id.includes(":tema-5"))).toBe(true);
	});

	it("Sayılar ve Nicelikler (1): çarpan/asal/bölünebilme testleri ve bağlam testleri eşleşir", () => {
		const pool = weeklyPool(mUnit("tema-1a"), mat);
		const topics = new Set(pool.matched.map((i) => i.topic));
		expect(topics.has("Asal Sayılar")).toBe(true);
		expect(topics.has("Bölünebilme Kuralları")).toBe(true);
		// Bağlam Temelli testler ünite başlığıyla eşleşir ve yalnızca bu üniteden gelir
		const baglam = pool.matched.filter((i) =>
			i.id.endsWith(":tema-1-baglam:t1"),
		);
		expect(baglam).toHaveLength(1);
		// Başka ünitenin konuları (olasılık) eşleşmez
		expect(pool.matched.some((i) => i.topic === "Deneysel Olasılık")).toBe(
			false,
		);
	});

	it("(1) ve (2) karışmaz: kesir testleri yalnızca (2)'de öne alınır", () => {
		const one = new Set(
			weeklyPool(mUnit("tema-1a"), mat).matched.map((i) => i.id),
		);
		const two = new Set(
			weeklyPool(mUnit("tema-1b"), mat).matched.map((i) => i.id),
		);
		const kesir = mat.find((i) => i.topic === "İki Kesrin Çarpımı");
		expect(kesir).toBeDefined();
		expect(one.has(kesir?.id ?? "")).toBe(false);
		expect(two.has(kesir?.id ?? "")).toBe(true);
	});

	it("Veriden Olasılığa: deneysel olasılık ve bağlam testleri öne alınır", () => {
		const pool = weeklyPool(mUnit("tema-6"), mat);
		expect(pool.matched.some((i) => i.topic === "Deneysel Olasılık")).toBe(
			true,
		);
		expect(pool.matched.some((i) => i.id.includes("tema-2-baglam"))).toBe(true);
	});
});
