import {
	bookWorkItems,
	periodFor,
	validateCurriculum,
	weekFor,
	weekPool,
} from "@ivmeapp/core";
import { describe, expect, it } from "vitest";

import {
	fen6,
	fenomen6ParagrafA,
	fenomen6ParagrafB,
	matematik6,
	turkce6,
} from "./index";

const paragraf = [
	...bookWorkItems(fenomen6ParagrafA),
	...bookWorkItems(fenomen6ParagrafB),
];
const week = (n: number) => {
	const w = turkce6.weeks?.find((x) => x.week === n);
	if (!w) throw new Error(`hafta yok: ${n}`);
	return w;
};

describe("Türkçe yıllık planı", () => {
	it("veri hatası içermez", () => {
		expect(validateCurriculum(turkce6)).toEqual([]);
	});

	it("36 hafta (tatiller hariç), 24 metin, 5 dönem (4 tatil + etkinlik haftası)", () => {
		expect(turkce6.weeks).toHaveLength(36);
		expect(turkce6.units.flatMap((u) => u.topics)).toHaveLength(24);
		expect(turkce6.breaks?.map((b) => b.title)).toEqual([
			"1. Dönem Ara Tatili",
			"Yarıyıl Tatili",
			"2. Dönem Ara Tatili",
			"Kurban Bayramı",
			"Sosyal Etkinlik Haftası",
		]);
		expect(week(1).start).toBe("2026-09-14");
		expect(week(36).end).toBe("2027-06-18");
	});

	it("her hafta bir tema, en az bir metin ve kazanım kodu taşır", () => {
		for (const w of turkce6.weeks ?? []) {
			expect(w.unitIds.length).toBeGreaterThan(0);
			expect(w.topics.length).toBeGreaterThan(0);
			expect(w.outcomes.length).toBeGreaterThan(0);
			for (const o of w.outcomes) expect(o.code).toMatch(/^T\.[A-Z]\.6\.\d+$/);
		}
	});

	it("temalar sırayla ilerler ve geri dönmez", () => {
		const order = (turkce6.weeks ?? []).map((w) => w.unitIds[0]);
		const firstIdx = (id: string) => order.indexOf(id);
		const ids = ["tema-1", "tema-2", "tema-3", "tema-4", "tema-5", "tema-6"];
		expect(ids.map(firstIdx)).toEqual(
			[...ids.map(firstIdx)].sort((a, b) => a - b),
		);
		expect(order.indexOf("tema-6")).toBeGreaterThan(
			order.lastIndexOf("tema-5") - 1,
		);
	});

	it("tatil haftaları yoktur; tarihten hafta bulunur", () => {
		expect(weekFor(turkce6, "2026-11-17")).toBeUndefined();
		expect(weekFor(turkce6, "2027-02-02")).toBeUndefined();
		expect(weekFor(turkce6, "2026-10-05")?.topics).toEqual([
			"Türküz, Türkçe Konuşuruz",
		]);
		expect(periodFor(turkce6.breaks, "2027-05-18")?.title).toBe(
			"Kurban Bayramı",
		);
	});

	it("dönem geçişi olan hafta iki metni birden taşır", () => {
		const w = weekFor(turkce6, "2026-09-22");
		expect(w?.topics).toEqual(["Bir Kelime Seyyahı", "Türkçenin Beyliği"]);
	});

	it("Bağımsızlık Yolu haftasında paragraf kitaplarından ana düşünce testleri öne alınır", () => {
		const pool = weekPool(turkce6, week(7), paragraf);
		expect(week(7).unitIds).toEqual(["tema-2"]);
		const topics = new Set(pool.matched.map((i) => i.topic));
		expect(topics.has("Paragrafta Ana Düşünce")).toBe(true);
		expect(pool.items).toHaveLength(paragraf.length);
	});

	it("her hafta için kitaptan eşleşen test vardır", () => {
		const empty = (turkce6.weeks ?? [])
			.filter((w) => weekPool(turkce6, w, paragraf).matched.length === 0)
			.map((w) => w.week);
		expect(empty).toEqual([]);
	});

	it("üretim zamanı ve özel gün notları okunur biçimdedir", () => {
		expect(week(5).note).toBe("Üretim zamanı (yazma ve konuşma): 21-23 Ekim");
		expect(week(7).note).toBe("29 Ekim Cumhuriyet Bayramı");
	});
});

describe("üç ders birlikte", () => {
	it("aynı tarih için üç dersin de haftası vardır (okul haftası)", () => {
		for (const date of [
			"2026-09-16",
			"2026-10-05",
			"2027-01-13",
			"2027-04-07",
			"2027-06-09",
		]) {
			expect(weekFor(turkce6, date)).toBeDefined();
			expect(weekFor(matematik6, date)).toBeDefined();
			expect(weekFor(fen6, date)).toBeDefined();
		}
	});

	it("tatillerde üç ders de hafta bulmaz", () => {
		for (const date of ["2026-11-17", "2027-01-27", "2027-03-10"]) {
			expect(weekFor(turkce6, date)).toBeUndefined();
			expect(weekFor(matematik6, date)).toBeUndefined();
			expect(weekFor(fen6, date)).toBeUndefined();
		}
	});
});
