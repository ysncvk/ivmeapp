import {
	bookWorkItems,
	periodFor,
	validateCurriculum,
	weekFor,
	weekPool,
} from "@ivmeapp/core";
import { describe, expect, it } from "vitest";

import { fen6, fenomen6FenA } from "./index";

const fen = bookWorkItems(fenomen6FenA);
const week = (n: number) => {
	const w = fen6.weeks?.find((x) => x.week === n);
	if (!w) throw new Error(`hafta yok: ${n}`);
	return w;
};

describe("Fen yıllık planı", () => {
	it("veri hatası içermez (hafta sırası, ünite ve konu bağları, kazanımlar)", () => {
		expect(validateCurriculum(fen6)).toEqual([]);
	});

	it("36 hafta, 4 tatil, 4 sınav dönemi, 6 saat okul temelli planlama", () => {
		expect(fen6.weeks).toHaveLength(36);
		expect(fen6.breaks).toHaveLength(4);
		expect(fen6.examPeriods).toHaveLength(4);
		expect(fen6.schoolBasedHours).toBe(6);
		expect(week(1).start).toBe("2026-09-14");
		expect(week(36).end).toBe("2027-06-25");
	});

	it("her hafta kazanım kodu taşır ve kodlar biçimlidir", () => {
		for (const w of fen6.weeks ?? []) {
			expect(w.outcomes.length).toBeGreaterThan(0);
			for (const o of w.outcomes) expect(o.code).toMatch(/^FB\.6\.\d\.\d\.\d$/);
		}
	});

	it("tarihten hafta bulur; hafta sonu o haftaya sayılır, tatilde yoktur", () => {
		expect(weekFor(fen6, "2026-10-05")?.week).toBe(4);
		expect(weekFor(fen6, "2026-10-03")?.week).toBe(3); // Cumartesi
		expect(weekFor(fen6, "2026-09-01")).toBeUndefined(); // dönem öncesi
		expect(weekFor(fen6, "2026-11-17")).toBeUndefined(); // ara tatil
		expect(periodFor(fen6.breaks, "2026-11-17")?.title).toBe(
			"1. DÖNEM ARA TATİLİ",
		);
		expect(periodFor(fen6.examPeriods, "2026-11-03")).toBeDefined();
		expect(periodFor(fen6.examPeriods, "2026-12-30")).toBeDefined(); // yıl sınırı
	});

	it("4. hafta (Bileşke Kuvvet): kitabın Bileşke Kuvvet testleri öne alınır", () => {
		const pool = weekPool(fen6, week(4), fen);
		expect(week(4).topics).toEqual(["Bileşke Kuvvet"]);
		expect(pool.matched.map((i) => i.work).slice(0, 2)).toEqual([
			"2. Ünite · s.35 Test 1",
			"2. Ünite · s.38 Test 2",
		]);
		expect(pool.matched.every((i) => i.topic === "Bileşke Kuvvet")).toBe(true);
		expect(pool.items).toHaveLength(fen.length);
	});

	it("7. hafta iki konu işler: ikisinin de testleri eşleşir", () => {
		const topics = new Set(
			weekPool(fen6, week(7), fen).matched.map((i) => i.topic),
		);
		expect(topics.has("Sabit Süratli ve Sabit Hızlı Hareket")).toBe(true);
		expect(topics.has("Eşeyli ve Eşeysiz Üreme")).toBe(true);
	});

	it("ünitenin son haftasında konu eşleşmesi dışında kalan kitap testleri de kaybolmaz", () => {
		// 3. hafta Güneş ve Ay Tutulmaları ve 1. ünitenin son haftası: Bağlam testi dahil
		const pool = weekPool(fen6, week(3), fen);
		expect(
			pool.matched.some((i) => i.id === "fenomen-6-fen-a:unite-1:t11"),
		).toBe(true);
	});
});
