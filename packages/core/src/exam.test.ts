import { describe, expect, it } from "vitest";

import {
	analyzeExams,
	type ExamSummary,
	net,
	subjectResult,
	validateExamSubject,
} from "./exam";

describe("net", () => {
	it("3 yanlış 1 doğruyu götürür, iki ondalığa yuvarlar", () => {
		expect(net(13, 5)).toBe(11.33);
		expect(net(20, 0)).toBe(20);
		expect(net(0, 6)).toBe(-2);
	});
});

describe("validateExamSubject", () => {
	it("geçerli girişte hata yok, boş türetilir", () => {
		const s = {
			subject: "matematik" as const,
			questions: 20,
			correct: 13,
			wrong: 5,
		};
		expect(validateExamSubject(s)).toEqual([]);
		expect(subjectResult(s)).toMatchObject({ blank: 2, net: 11.33 });
	});
	it("doğru + yanlış soru sayısını aşamaz; negatif ve kesirli sayı olmaz", () => {
		expect(
			validateExamSubject({
				subject: "fen",
				questions: 20,
				correct: 15,
				wrong: 6,
			}),
		).not.toEqual([]);
		expect(
			validateExamSubject({
				subject: "fen",
				questions: 20,
				correct: -1,
				wrong: 0,
			}),
		).not.toEqual([]);
		expect(
			validateExamSubject({
				subject: "fen",
				questions: 20,
				correct: 1.5,
				wrong: 0,
			}),
		).not.toEqual([]);
		expect(
			validateExamSubject({
				subject: "fen",
				questions: 0,
				correct: 0,
				wrong: 0,
			}),
		).not.toEqual([]);
	});
});

const exam = (
	id: string,
	date: string,
	mat: [number, number],
	weak: string[],
): ExamSummary => ({
	id,
	name: id,
	date,
	subjects: [
		subjectResult({
			subject: "matematik",
			questions: 20,
			correct: mat[0],
			wrong: mat[1],
		}),
	],
	weakTopics: weak.map((topic) => ({ subject: "matematik" as const, topic })),
});

describe("analyzeExams", () => {
	it("deneme yoksa boş sonuç", () => {
		expect(analyzeExams([])).toEqual({
			latest: undefined,
			trend: {},
			weakTopics: [],
		});
	});

	it("en son denemeyi bulur ve trendi tarih sırasıyla verir", () => {
		const d = analyzeExams([
			exam("b", "2026-10-10", [14, 3], []),
			exam("a", "2026-09-26", [12, 5], []),
		]);
		expect(d.latest?.id).toBe("b");
		expect(d.trend.matematik?.map((x) => x.date)).toEqual([
			"2026-09-26",
			"2026-10-10",
		]);
	});

	it("zayıf konuyu 'kaç denemedir' diye sayar, çok tekrar edeni öne alır", () => {
		const d = analyzeExams([
			exam("e1", "2026-09-12", [10, 5], ["Kesirler", "Oran-orantı"]),
			exam("e2", "2026-09-26", [12, 4], ["Kesirler"]),
			exam("e3", "2026-10-10", [13, 4], ["kesirler", "Paragraf"]),
		]);
		expect(d.weakTopics[0]).toMatchObject({
			topic: "Kesirler",
			exams: 3,
			lastDate: "2026-10-10",
		});
		expect(d.weakTopics.map((w) => w.topic)).toEqual([
			"Kesirler",
			"Paragraf",
			"Oran-orantı",
		]);
	});
});
