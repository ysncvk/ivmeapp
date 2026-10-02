import { describe, expect, it } from "vitest";
import { nextRun } from "./schedule";

const utc = (iso: string) => Date.parse(iso);

describe("nextRun", () => {
	it("every: bir sonraki dakika sınırı, kesinlikle sonrası", () => {
		expect(
			nextRun({ every: "minutes", n: 5 }, utc("2026-10-05T10:02:00Z")),
		).toBe(utc("2026-10-05T10:05:00Z"));
		expect(
			nextRun({ every: "minutes", n: 5 }, utc("2026-10-05T10:05:00Z")),
		).toBe(utc("2026-10-05T10:10:00Z"));
	});

	it("daily: bugün geçmediyse bugün, geçtiyse yarın", () => {
		const s = { daily: "02:30" } as const;
		expect(nextRun(s, utc("2026-10-05T01:00:00Z"))).toBe(
			utc("2026-10-05T02:30:00Z"),
		);
		expect(nextRun(s, utc("2026-10-05T02:30:00Z"))).toBe(
			utc("2026-10-06T02:30:00Z"),
		);
		expect(nextRun(s, utc("2026-10-05T23:59:00Z"))).toBe(
			utc("2026-10-06T02:30:00Z"),
		);
	});

	it("weekly: Pazar 18:00 (2026-10-05 Pazartesi)", () => {
		const s = { weekly: { day: 0, at: "18:00" } } as const;
		expect(nextRun(s, utc("2026-10-05T10:00:00Z"))).toBe(
			utc("2026-10-11T18:00:00Z"),
		);
		// Pazar günü saatten önce: aynı gün
		expect(nextRun(s, utc("2026-10-11T09:00:00Z"))).toBe(
			utc("2026-10-11T18:00:00Z"),
		);
		// Pazar günü saatten sonra: bir sonraki hafta
		expect(nextRun(s, utc("2026-10-11T18:00:00Z"))).toBe(
			utc("2026-10-18T18:00:00Z"),
		);
	});

	it("geçersiz girdileri reddeder", () => {
		expect(() => nextRun({ daily: "25:00" }, 0)).toThrow(RangeError);
		expect(() => nextRun({ every: "minutes", n: 0 }, 0)).toThrow(RangeError);
		expect(() => nextRun({ weekly: { day: 7, at: "10:00" } }, 0)).toThrow(
			RangeError,
		);
	});
});
