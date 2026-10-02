import {
	bookWorkItems,
	periodFor,
	validateCurriculum,
	weekFor,
	weekPool,
} from "@ivmeapp/core";
import { describe, expect, it } from "vitest";

import { fenomen6MatematikA, matematik6 } from "./index";

const mat = bookWorkItems(fenomen6MatematikA);
const week = (n: number) => {
	const w = matematik6.weeks?.find((x) => x.week === n);
	if (!w) throw new Error(`hafta yok: ${n}`);
	return w;
};

describe("Matematik yıllık planı", () => {
	it("veri hatası içermez", () => {
		expect(validateCurriculum(matematik6)).toEqual([]);
	});

	it("tema sırası planın gerçek sırasıdır (olasılık 2., istatistik 4.)", () => {
		expect(matematik6.units.map((u) => u.title)).toEqual([
			"Sayılar ve Nicelikler (1)",
			"Veriden Olasılığa",
			"Sayılar ve Nicelikler (2)",
			"İstatistiksel Araştırma Süreci",
			"Geometrik Şekiller",
			"İşlemlerle Cebirsel Düşünme ve Değişimler",
			"Geometrik Nicelikler",
		]);
		expect(week(4).unitIds).toEqual(["tema-6"]);
		expect(week(5).unitIds).toEqual(["tema-6", "tema-1b"]);
		expect(week(23).unitIds).toEqual(["tema-2"]);
	});

	it("36 hafta, haftalık 5 saat, 8 saat okul temelli planlama, 4 dönem (3 tatil + etkinlik)", () => {
		expect(matematik6.weeks).toHaveLength(36);
		expect(matematik6.weeklyHours).toBe(5);
		expect(matematik6.schoolBasedHours).toBe(8);
		expect(matematik6.breaks?.map((b) => b.title)).toEqual([
			"1. Ara Tatil",
			"Şubat Tatili",
			"2. Ara Tatil",
			"Sosyal Etkinlik Haftası",
		]);
		const total =
			(matematik6.units.reduce((s, u) => s + (u.hours ?? 0), 0) ?? 0) +
			(matematik6.schoolBasedHours ?? 0);
		expect(total).toBe(180);
	});

	it("kazanım kodları MAT.6.x.y biçiminde, saatler haftanın 5 saatini aşmaz", () => {
		for (const w of matematik6.weeks ?? []) {
			for (const o of w.outcomes) expect(o.code).toMatch(/^MAT\.6\.\d\.\d+$/);
			const hours =
				w.outcomes.reduce((s, o) => s + (o.hours ?? 0), 0) + (w.otpHours ?? 0);
			expect(hours).toBeLessThanOrEqual(5);
		}
		expect(week(5).outcomes.map((o) => o.hours)).toEqual([4, 1]);
	});

	it("tarihten hafta bulur", () => {
		expect(weekFor(matematik6, "2026-10-05")?.week).toBe(4);
		expect(weekFor(matematik6, "2026-11-17")).toBeUndefined();
		expect(periodFor(matematik6.breaks, "2026-11-17")?.title).toBe(
			"1. Ara Tatil",
		);
		expect(periodFor(matematik6.breaks, "2027-06-22")?.title).toBe(
			"Sosyal Etkinlik Haftası",
		);
	});

	it("4. hafta (Deneysel Olasılık): kitabın olasılık testleri öne alınır", () => {
		const pool = weekPool(matematik6, week(4), mat);
		expect(pool.matched.length).toBeGreaterThan(0);
		expect(pool.matched.every((i) => i.topic === "Deneysel Olasılık")).toBe(
			true,
		);
		// Kitapta olasılık 2. tema (s.49'dan), planda ise 4. hafta
		expect(pool.matched[0]?.work).toBe("2. Tema · s.49 Test 1");
	});

	it("5. hafta iki temayı birden işler: olasılık ve ondalık gösterimler", () => {
		const topics = new Set(
			weekPool(matematik6, week(5), mat).matched.map((i) => i.topic),
		);
		expect(topics.has("Deneysel Olasılık")).toBe(true);
		expect([...topics].some((t) => t.startsWith("Ondalık Gösterimlerde"))).toBe(
			true,
		);
	});

	it("Geometrik Şekiller haftaları kitabın 5. temasındaki testleri bulur", () => {
		const pool = weekPool(matematik6, week(19), mat);
		expect(pool.matched.length).toBeGreaterThan(0);
		expect(pool.matched.every((i) => i.id.includes(":tema-5"))).toBe(true);
	});

	it("her hafta için kitaptan en az bir eşleşen test vardır (kapsama)", () => {
		const empty = (matematik6.weeks ?? [])
			.filter((w) => weekPool(matematik6, w, mat).matched.length === 0)
			.map((w) => w.week);
		expect(empty).toEqual([]);
	});
});
