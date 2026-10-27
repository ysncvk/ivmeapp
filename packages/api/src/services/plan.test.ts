import { describe, expect, it } from "vitest";
import { homeworkDay } from "./plan";

// 2026-10-26 Pazartesi
const WEEK = "2026-10-26";
const DAYS = [1, 2, 3, 4, 5, 6];

describe("homeworkDay", () => {
	it("teslimsiz ödev bugünden itibaren ilk çalışma gününe konur (geçmişe değil)", () => {
		expect(homeworkDay(WEEK, DAYS, null, "2026-10-26")).toBe(1);
		expect(homeworkDay(WEEK, DAYS, null, "2026-10-27")).toBe(2);
		expect(homeworkDay(WEEK, DAYS, null, "2026-10-29")).toBe(4);
	});

	it("teslimden önceki son uygun gün; teslim geçmişse bugün", () => {
		expect(homeworkDay(WEEK, DAYS, "2026-10-30", "2026-10-27")).toBe(5);
		expect(homeworkDay(WEEK, DAYS, "2026-10-26", "2026-10-28")).toBe(3);
		expect(homeworkDay(WEEK, DAYS, "2026-10-01", "2026-10-28")).toBe(3);
	});

	it("çalışma günü olmayan günler elenir", () => {
		// Pazar (7) çalışma günü değil: Cumartesi'den sonra uygun gün kalmaz
		expect(homeworkDay(WEEK, DAYS, null, "2026-11-01")).toBeNull();
		expect(homeworkDay(WEEK, [2, 4], "2026-10-29", "2026-10-26")).toBe(4);
		expect(homeworkDay(WEEK, [2, 4], null, "2026-10-27")).toBe(2);
	});

	it("teslim sonraki haftadaysa bu hafta planlanmaz; gelecek haftanın planı hafta başından bakar", () => {
		expect(homeworkDay(WEEK, DAYS, "2026-11-04", "2026-10-27")).toBeNull();
		// Gelecek hafta için (bugün bu haftada): minimum gün 1
		expect(homeworkDay("2026-11-02", DAYS, "2026-11-04", "2026-10-27")).toBe(3);
		expect(homeworkDay("2026-11-02", DAYS, null, "2026-10-27")).toBe(1);
	});
});
