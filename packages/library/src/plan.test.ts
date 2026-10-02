import { bookWorkItems, generateWeeklyPlan } from "@ivmeapp/core";
import { describe, expect, it } from "vitest";

import {
	fenomen6MatematikA,
	fenomen6ParagrafA,
	fenomen6ParagrafB,
} from "./index";

const turkceOnly = {
	weekStart: "2026-10-05",
	studyDays: [1, 2, 3, 4, 5, 6],
	dailyBudgetMinutes: 90,
	blockMinutes: 30,
	subjects: ["turkce"] as const,
	idleTime: "free" as const,
};

describe("gerçek kitaplarla plan", () => {
	it("Fenomen A'dan kitap sırasıyla, sayfa ve test numarasıyla görev üretir", () => {
		const plan = generateWeeklyPlan({
			settings: turkceOnly,
			weeklyTopics: { turkce: bookWorkItems(fenomen6ParagrafA) },
			weakTopics: [],
			reviewItems: [],
		});
		const tasks = plan.days.flatMap((d) => d.tasks);
		expect(tasks).toHaveLength(18);
		expect(tasks[0]?.work).toBe("s.3 Test 1");
		expect(tasks[0]?.resource).toBe("Fenomen 6 Paragraf A Soru Bankası");
		expect(tasks[17]?.work).toBe("s.37 Test 18");
		for (const d of plan.days) expect(d.totalMinutes).toBeLessThanOrEqual(90);
	});

	it("iki kitap birlikte seçilince ikisinin de işleri havuza girer", () => {
		const a = bookWorkItems(fenomen6ParagrafA).slice(0, 5);
		const b = bookWorkItems(fenomen6ParagrafB).slice(0, 5);
		const plan = generateWeeklyPlan({
			settings: { ...turkceOnly, studyDays: [1, 2], dailyBudgetMinutes: 60 },
			weeklyTopics: {
				turkce: [a[0], b[0], a[1], b[1]].filter((x) => x !== undefined),
			},
			weakTopics: [],
			reviewItems: [],
		});
		const resources = new Set(
			plan.days.flatMap((d) => d.tasks).map((t) => t.resource),
		);
		expect(resources.size).toBe(2);
	});

	it("matematik ve türkçe kitaplarıyla haftalık plan: her iki ders en az 3 gün", () => {
		const plan = generateWeeklyPlan({
			settings: {
				weekStart: "2026-10-05",
				studyDays: [1, 2, 3, 4, 5, 6],
				dailyBudgetMinutes: 90,
				blockMinutes: 30,
				subjects: ["matematik", "turkce"],
				idleTime: "free",
			},
			weeklyTopics: {
				matematik: bookWorkItems(fenomen6MatematikA),
				turkce: [
					...bookWorkItems(fenomen6ParagrafA),
					...bookWorkItems(fenomen6ParagrafB),
				],
			},
			weakTopics: [],
			reviewItems: [],
		});
		const tasks = plan.days.flatMap((d) => d.tasks);
		expect(tasks).toHaveLength(18);
		expect(plan.coverage.subjectDays.matematik).toBeGreaterThanOrEqual(3);
		expect(plan.coverage.subjectDays.turkce).toBeGreaterThanOrEqual(3);
		const resources = new Set(tasks.map((t) => t.resource));
		expect(resources.has("Fenomen 6 Matematik A Soru Bankası")).toBe(true);
		expect(resources.has("Fenomen 6 Paragraf A Soru Bankası")).toBe(true);
	});
});
