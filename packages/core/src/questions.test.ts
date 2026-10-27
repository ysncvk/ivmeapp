import { describe, expect, it } from "vitest";
import { DEFAULT_QUESTIONS_PER_TEST, testsPerDay } from "./questions";

describe("testsPerDay", () => {
	it("hedefi karşılayan test sayısını verir (yukarı yuvarlar)", () => {
		expect(testsPerDay(50, 12)).toBe(5);
		expect(testsPerDay(30, 12)).toBe(3);
		expect(testsPerDay(36, 12)).toBe(3);
		expect(testsPerDay(100, 12)).toBe(9);
	});

	it("küçük hedefte bile en az 1 test", () => {
		expect(testsPerDay(5, 12)).toBe(1);
	});

	it("hedef yoksa 0; soru sayısı bilinmiyorsa varsayılan kullanılır", () => {
		expect(testsPerDay(0, 12)).toBe(0);
		expect(testsPerDay(24)).toBe(24 / DEFAULT_QUESTIONS_PER_TEST);
		expect(testsPerDay(24, 0)).toBe(2);
	});
});
