import { bookWorkItems, validateBook } from "@ivmeapp/core";
import { describe, expect, it } from "vitest";

import {
	books,
	fenomen6FenA,
	fenomen6MatematikA,
	fenomen6ParagrafA,
	fenomen6ParagrafB,
} from "./index";

describe("kütüphane verisi", () => {
	it.each(books.map((b) => [b.id, b] as const))(
		"%s veri hatası içermez",
		(_id, book) => {
			expect(validateBook(book)).toEqual([]);
		},
	);

	it("Fenomen 6 Paragraf A içindekiler ile uyumlu", () => {
		const items = bookWorkItems(fenomen6ParagrafA);
		// 105 + 12 + 8 test
		expect(items).toHaveLength(125);
		const byId = (id: string) => items.find((i) => i.id === id);
		expect(byId("fenomen-6-paragraf-a:paragrafta-anlam:t1")?.work).toBe(
			"s.3 Test 1",
		);
		expect(byId("fenomen-6-paragraf-a:paragrafta-anlam:t22")?.work).toBe(
			"s.45 Test 22",
		);
		expect(byId("fenomen-6-paragraf-a:paragrafta-anlam:t105")?.work).toBe(
			"s.211 Test 105",
		);
		expect(byId("fenomen-6-paragraf-a:sozel-mantik:t12")?.work).toBe(
			"Sözel Mantık · s.235 Test 12",
		);
		expect(byId("fenomen-6-paragraf-a:baglam-temelli:t8")?.work).toBe(
			"Bağlam Temelli · s.251 Test 8",
		);
	});

	it("konu eşleşmesi: Test 12 Metni İkiye Bölme konusunda", () => {
		const items = bookWorkItems(fenomen6ParagrafA);
		expect(
			items.find((i) => i.id.endsWith("paragrafta-anlam:t12"))?.topic,
		).toBe("Metni İkiye Bölme, Akışı Bozan Cümle");
		expect(
			items.find((i) => i.id.endsWith("paragrafta-anlam:t50"))?.topic,
		).toBe("Paragraf Karma Test");
	});

	it("Fenomen 6 Paragraf B içindekiler ile uyumlu (test = 4 sayfa)", () => {
		const items = bookWorkItems(fenomen6ParagrafB);
		expect(items).toHaveLength(58);
		const work = (n: number) =>
			items.find((i) => i.id === `fenomen-6-paragraf-b:testler:t${n}`)?.work;
		expect(work(1)).toBe("s.3 Test 1");
		expect(work(12)).toBe("s.47 Test 12");
		expect(work(20)).toBe("s.79 Test 20");
		expect(work(58)).toBe("s.231 Test 58");
		expect(fenomen6ParagrafB.questionsPerTest).toBe(12);
	});

	it("Fenomen 6 Matematik A içindekiler ile uyumlu", () => {
		const items = bookWorkItems(fenomen6MatematikA);
		const sectionTests = (id: string) =>
			fenomen6MatematikA.sections
				.filter((s) => s.id === id)
				.flatMap((s) => s.units.flatMap((u) => u.tests)).length;
		// Ana testler: 21 + 4 + 43 + 16 + 18 + 17 + 18 = 137; bağlam: 2 + 2 + 4 + 2 + 2 + 2 + 2 = 16
		expect(items).toHaveLength(153);
		expect(sectionTests("tema-1")).toBe(21);
		expect(sectionTests("tema-3")).toBe(43);
		expect(sectionTests("tema-3-baglam")).toBe(4);
		const work = (id: string) => items.find((i) => i.id === id)?.work;
		expect(work("fenomen-6-matematik-a:tema-1:t1")).toBe(
			"1. Tema · s.5 Test 1",
		);
		expect(work("fenomen-6-matematik-a:tema-3:t36")).toBe(
			"3. Tema · s.131 Test 36",
		);
		expect(work("fenomen-6-matematik-a:tema-6:t16")).toBe(
			"6. Tema · s.266 Test 16",
		);
		expect(work("fenomen-6-matematik-a:tema-7-baglam:t2")).toBe(
			"7. Tema · Bağlam Temelli · s.315 Test 2",
		);
		expect(fenomen6MatematikA.answerKeyPage).toBe(316);
		const kinds = fenomen6MatematikA.sections
			.flatMap((s) => s.units.flatMap((u) => u.tests))
			.filter((t) => t.kind === "yeni_nesil").length;
		// Orijinal Yeni Nesil testleri: 3 + 1 + 7 + 1 + 2 + 2 + 3
		expect(kinds).toBe(19);
	});

	it("Fenomen 6 Fen Bilimleri A içindekiler ile uyumlu", () => {
		const items = bookWorkItems(fenomen6FenA);
		// Ünite başına test sayıları: 11 + 11 + 26 + 16 + 16 + 10 + 13
		expect(items).toHaveLength(103);
		const work = (id: string) => items.find((i) => i.id === id)?.work;
		expect(work("fenomen-6-fen-a:unite-1:t1")).toBe("1. Ünite · s.5 Test 1");
		expect(work("fenomen-6-fen-a:unite-3:t26")).toBe(
			"3. Ünite · s.133 Test 26",
		);
		expect(work("fenomen-6-fen-a:unite-7:t13")).toBe(
			"7. Ünite · s.285 Test 13",
		);
		expect(fenomen6FenA.answerKeyPage).toBe(287);
		const baglam = fenomen6FenA.sections
			.flatMap((s) => s.units.flatMap((u) => u.tests))
			.filter((t) => t.kind === "baglam");
		// Her ünitenin son testi bağlam temelli
		expect(baglam).toHaveLength(7);
	});
});
