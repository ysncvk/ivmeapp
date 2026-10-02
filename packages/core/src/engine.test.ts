import { describe, expect, it } from "vitest";
import { allocateBlocks, generateWeeklyPlan } from "./engine";
import { checkDailyBudget, LIMITS } from "./limits";
import type { PlanInput, Subject, WorkItem } from "./types";

const item = (
	id: string,
	subject: Subject,
	topic: string,
	extra: Partial<WorkItem> = {},
): WorkItem => ({
	id,
	subject,
	topic,
	resource: "Kaynak",
	work: `s.${id}`,
	...extra,
});

const base = (over: Partial<PlanInput> = {}): PlanInput => ({
	weekStart: "2026-10-05",
	dailyBudgetMinutes: 90,
	weeklyTopics: {
		matematik: [
			item("m1", "matematik", "Kesirler"),
			item("m2", "matematik", "Kesirler"),
		],
		turkce: [
			item("t1", "turkce", "Paragraf"),
			item("t2", "turkce", "Paragraf"),
		],
		fen: [item("f1", "fen", "Kuvvet")],
		sosyal: [item("s1", "sosyal", "Harita")],
		ingilizce: [item("i1", "ingilizce", "Unit 2")],
	},
	weakTopics: [
		item("w1", "matematik", "Oran-orantı"),
		item("w2", "turkce", "Cümle"),
	],
	reviewItems: [item("r1", "fen", "Madde"), item("r2", "sosyal", "Kültür")],
	...over,
});

describe("generateWeeklyPlan", () => {
	it("aynı girdide aynı çıktıyı verir", () => {
		expect(generateWeeklyPlan(base())).toEqual(generateWeeklyPlan(base()));
	});

	it("bütçeyi hiçbir koşulda aşmaz ve günde en fazla 3 görev üretir", () => {
		for (let budget = 5; budget <= 240; budget += 5) {
			const plan = generateWeeklyPlan(base({ dailyBudgetMinutes: budget }));
			for (const d of plan.days) {
				expect(d.totalMinutes).toBeLessThanOrEqual(budget);
				expect(d.tasks.length).toBeLessThanOrEqual(LIMITS.maxTasksPerDay);
			}
		}
	});

	it("90 dk bütçede günde 3 blok üretir, süreler ADR aralığında", () => {
		const plan = generateWeeklyPlan(
			base({
				weakTopics: ["a", "b", "c"].map((id) => item(id, "matematik", "X")),
				reviewItems: ["d", "e"].map((id) => item(id, "fen", "Y")),
			}),
		);
		expect(plan.days).toHaveLength(5);
		for (const d of plan.days) {
			expect(d.tasks.map((t) => t.block)).toEqual([1, 2, 3]);
			for (const t of d.tasks) {
				expect(t.minutes).toBeGreaterThanOrEqual(20);
				expect(t.minutes).toBeLessThanOrEqual(30);
			}
		}
	});

	it("her görev üretim gerekçesi taşır", () => {
		const plan = generateWeeklyPlan(base());
		for (const t of plan.days.flatMap((d) => d.tasks)) {
			expect(t.reason.detail.length).toBeGreaterThan(0);
		}
	});

	it("matematik ve türkçe haftada en az 3 gün çalışılır", () => {
		const tasks = generateWeeklyPlan(base()).days.flatMap((d) => d.tasks);
		const daysOf = (s: Subject) =>
			new Set(tasks.filter((t) => t.subject === s).map((t) => t.day)).size;
		expect(daysOf("matematik")).toBeGreaterThanOrEqual(3);
		expect(daysOf("turkce")).toBeGreaterThanOrEqual(3);
	});

	it("küçük bütçede önce Blok 3 düşer, Blok 1 asla", () => {
		expect(allocateBlocks(90).b3).toBeGreaterThan(0);
		const small = allocateBlocks(50);
		expect(small.b3).toBe(0);
		expect(small.b1).toBeGreaterThan(0);
		expect(small.b2).toBeGreaterThan(0);
		const tiny = allocateBlocks(25);
		expect(tiny.b1).toBeGreaterThan(0);
		expect(tiny.b2).toBe(0);
		expect(tiny.b3).toBe(0);
	});

	it("blok 3: %60 zayıf / %40 tekrar oranını uygular", () => {
		const plan = generateWeeklyPlan(
			base({
				weakTopics: ["a", "b", "c"].map((id) => item(id, "matematik", "X")),
				reviewItems: ["d", "e"].map((id) => item(id, "fen", "Y")),
			}),
		);
		const b3 = plan.days.flatMap((d) => d.tasks).filter((t) => t.block === 3);
		expect(b3.filter((t) => t.reason.source === "weak_topic")).toHaveLength(3);
		expect(b3.filter((t) => t.reason.source === "spaced_review")).toHaveLength(
			2,
		);
	});

	it("havuz boşsa Blok 3 görev eklemez, ekstra görev uydurmaz", () => {
		const plan = generateWeeklyPlan(base({ weakTopics: [], reviewItems: [] }));
		for (const d of plan.days)
			expect(d.tasks.map((t) => t.block)).toEqual([1, 2]);
	});

	it("geçen haftadan kalan iş öne alınır ama görev sayısı artmaz", () => {
		const carried = item("c1", "matematik", "Geçen hafta", {
			carriedOver: true,
		});
		const withCarry = generateWeeklyPlan(
			base({ weakTopics: [item("w1", "matematik", "Yeni"), carried] }),
		);
		const first = withCarry.days[0]?.tasks.find((t) => t.block === 3);
		expect(first?.topic).toBe("Geçen hafta");
		const without = generateWeeklyPlan(base());
		const count = (p: typeof without) => p.days.flatMap((d) => d.tasks).length;
		expect(count(withCarry)).toBe(count(without));
	});

	it("okul ödevi Blok 1'e girer ve bütçe küçülünce bile düşmez", () => {
		const homework = [
			{ day: 2, subject: "fen" as const, topic: "Kuvvet", work: "Ödev s.40" },
		];
		for (const budget of [25, 50, 90]) {
			const plan = generateWeeklyPlan(
				base({ dailyBudgetMinutes: budget, homework }),
			);
			const t = plan.days.find((d) => d.day === 2)?.tasks[0];
			expect(t?.block).toBe(1);
			expect(t?.reason.source).toBe("homework");
		}
	});

	it("sığmayan ödev sessizce düşmez, unplaced'a yazılır", () => {
		const homework = [1, 2, 3].map((n) => ({
			day: 1,
			subject: "fen" as const,
			topic: `K${n}`,
			work: `Ödev ${n}`,
		}));
		const plan = generateWeeklyPlan(base({ homework }));
		expect(plan.unplaced).toHaveLength(1);
		expect(plan.days[0]?.tasks.length).toBeLessThanOrEqual(3);
	});

	it("haftada 5 günden fazla çalışma gününü reddeder", () => {
		expect(() =>
			generateWeeklyPlan(base({ studyDays: [1, 2, 3, 4, 5, 6] })),
		).toThrow(RangeError);
	});

	it("daha az çalışma günüyle de plan kurar", () => {
		const plan = generateWeeklyPlan(base({ studyDays: [1, 3, 5] }));
		expect(plan.days.map((d) => d.day)).toEqual([1, 3, 5]);
	});
});

describe("checkDailyBudget", () => {
	it("korkuluk seviyelerini döner", () => {
		expect(checkDailyBudget(90).level).toBe("ok");
		expect(checkDailyBudget(120).level).toBe("ok");
		expect(checkDailyBudget(121).level).toBe("warn");
		expect(checkDailyBudget(181).level).toBe("strong_warn");
		expect(checkDailyBudget(0).level).toBe("invalid");
	});
});
