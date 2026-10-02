import { describe, expect, it } from "vitest";

import { addDays, isoWeekday, mondayOf, weeksBetween } from "./dates";
import { hasPlanAccess, retainUntil, trialEnd } from "./entitlement";

describe("tarih yardımcıları", () => {
	it("hafta günü ve Pazartesi", () => {
		expect(isoWeekday("2026-10-05")).toBe(1); // Pazartesi
		expect(isoWeekday("2026-10-11")).toBe(7); // Pazar
		expect(mondayOf("2026-10-08")).toBe("2026-10-05");
		expect(mondayOf("2026-10-11")).toBe("2026-10-05");
		expect(mondayOf("2026-10-05")).toBe("2026-10-05");
	});

	it("ay ve yıl sınırını geçer", () => {
		expect(addDays("2026-12-30", 3)).toBe("2027-01-02");
		expect(addDays("2027-03-01", -1)).toBe("2027-02-28");
		expect(mondayOf("2027-01-01")).toBe("2026-12-28");
	});

	it("hafta farkı", () => {
		expect(weeksBetween("2026-09-14", "2026-10-05")).toBe(3);
		expect(weeksBetween("2026-10-05", "2026-09-14")).toBe(-3);
	});

	it("geçersiz tarihi reddeder", () => {
		expect(() => addDays("2026-13-45", 1)).toThrow(RangeError);
	});
});

describe("hasPlanAccess", () => {
	const now = new Date("2026-10-05T10:00:00Z");
	const later = new Date("2026-10-10T10:00:00Z");
	const earlier = new Date("2026-10-01T10:00:00Z");

	it("abonelik yoksa plan yok (ödev ve teşhis ücretsiz)", () => {
		expect(hasPlanAccess(undefined, now)).toBe(false);
		expect(hasPlanAccess(null, now)).toBe(false);
	});

	it("deneme süresi içinde erişim var, sonra yok ve otomatik ücretlendirmeye dönmez", () => {
		expect(hasPlanAccess({ status: "trial", trialEndsAt: later }, now)).toBe(
			true,
		);
		expect(hasPlanAccess({ status: "trial", trialEndsAt: earlier }, now)).toBe(
			false,
		);
		expect(hasPlanAccess({ status: "trial", trialEndsAt: null }, now)).toBe(
			false,
		);
	});

	it("aktif abonelik dönem sonuna kadar", () => {
		expect(
			hasPlanAccess({ status: "active", currentPeriodEnd: later }, now),
		).toBe(true);
		expect(
			hasPlanAccess({ status: "active", currentPeriodEnd: earlier }, now),
		).toBe(false);
		expect(hasPlanAccess({ status: "active" }, now)).toBe(true);
	});

	it("iptal edilen abonelik ödenmiş dönemin sonuna kadar sürer", () => {
		expect(
			hasPlanAccess({ status: "canceled", currentPeriodEnd: later }, now),
		).toBe(true);
		expect(
			hasPlanAccess({ status: "canceled", currentPeriodEnd: earlier }, now),
		).toBe(false);
		expect(hasPlanAccess({ status: "canceled" }, now)).toBe(false);
	});

	it("deneme 7 gün, iptal sonrası saklama ~6 ay", () => {
		expect(trialEnd(now).toISOString()).toBe("2026-10-12T10:00:00.000Z");
		const kept = (retainUntil(now).getTime() - now.getTime()) / 86_400_000;
		expect(kept).toBe(183);
	});
});

import { istanbulDate } from "./dates";
import { rewardPeriod } from "./rewards";

describe("istanbulDate", () => {
	it("gece yarısından sonra Türkiye tarihini verir", () => {
		// 2026-10-05 22:30 UTC = 2026-10-06 01:30 İstanbul
		expect(istanbulDate(new Date("2026-10-05T22:30:00Z"))).toBe("2026-10-06");
		expect(istanbulDate(new Date("2026-10-05T20:59:00Z"))).toBe("2026-10-05");
	});
});

describe("rewardPeriod (ADR-0016)", () => {
	const start = "2026-09-14";
	it("günlük: bugün", () => {
		expect(rewardPeriod("daily", "2026-10-07", start)).toEqual({
			key: "2026-10-07",
			start: "2026-10-07",
			end: "2026-10-07",
		});
	});
	it("haftalık: Pazartesi-Pazar, anahtar Pazartesi", () => {
		expect(rewardPeriod("weekly", "2026-10-07", start)).toEqual({
			key: "2026-10-05",
			start: "2026-10-05",
			end: "2026-10-11",
		});
	});
	it("büyük ödül: 4 haftalık bloklar, blok içinde anahtar sabit", () => {
		const a = rewardPeriod("milestone", "2026-09-16", start);
		const b = rewardPeriod("milestone", "2026-10-09", start);
		const c = rewardPeriod("milestone", "2026-10-12", start);
		expect(a.key).toBe("m0");
		expect(b.key).toBe("m0");
		expect(c.key).toBe("m1");
		expect(a.start).toBe("2026-09-14");
		expect(a.end).toBe("2026-10-11");
		expect(c.start).toBe("2026-10-12");
	});
	it("yıl başından önce blok 0'a sabitlenir", () => {
		expect(rewardPeriod("milestone", "2026-09-01", start).key).toBe("m0");
	});
});
