import { describe, expect, it } from "vitest";
import { rewardProgress } from "./reward";

describe("rewardProgress", () => {
	it("hedefi yukarı yuvarlar ve kalan görevi verir", () => {
		const p = rewardProgress({ completed: 3, total: 10, threshold: 0.8 });
		expect(p.target).toBe(8);
		expect(p.remaining).toBe(5);
		expect(p.unlocked).toBe(false);
		expect(p.ratio).toBeCloseTo(3 / 8);
	});

	it("hedefe ulaşınca açılır, oran 1'i geçmez", () => {
		const p = rewardProgress({ completed: 10, total: 10, threshold: 0.8 });
		expect(p.unlocked).toBe(true);
		expect(p.remaining).toBe(0);
		expect(p.ratio).toBe(1);
	});

	it("görev yoksa ödül açılmaz", () => {
		const p = rewardProgress({ completed: 0, total: 0, threshold: 0.8 });
		expect(p.unlocked).toBe(false);
		expect(p.target).toBe(0);
	});

	it("tek görevli listede hedef en az 1", () => {
		expect(
			rewardProgress({ completed: 0, total: 1, threshold: 0.1 }).target,
		).toBe(1);
	});

	it("geçersiz girdiyi reddeder", () => {
		expect(() =>
			rewardProgress({ completed: 0, total: 5, threshold: 0 }),
		).toThrow(RangeError);
		expect(() =>
			rewardProgress({ completed: 0, total: 5, threshold: 1.1 }),
		).toThrow(RangeError);
		expect(() =>
			rewardProgress({ completed: 6, total: 5, threshold: 0.5 }),
		).toThrow(RangeError);
	});
});
