import { describe, expect, it } from "vitest";
import { carryOver, generateWeeklyPlan, moveTask } from "./engine";
import { checkBlockMinutes, checkDailyBudget } from "./limits";
import type { PlanInput, PlanSettings, Subject, WorkItem } from "./types";

const items = (
	subject: Subject,
	prefix: string,
	n: number,
	extra: Partial<WorkItem> = {},
) =>
	Array.from({ length: n }, (_, i) => ({
		id: `${prefix}${i + 1}`,
		subject,
		topic: `${subject}-konu-${Math.floor(i / 3) + 1}`,
		resource: `${subject} kitabı`,
		work: `s.${i + 1} Test ${i + 1}`,
		...extra,
	})) satisfies WorkItem[];

const SUBJECTS: Subject[] = [
	"matematik",
	"turkce",
	"fen",
	"sosyal",
	"ingilizce",
];

const settings = (over: Partial<PlanSettings> = {}): PlanSettings => ({
	weekStart: "2026-10-05",
	studyDays: [1, 2, 3, 4, 5, 6],
	dailyBudgetMinutes: 90,
	blockMinutes: 30,
	subjects: SUBJECTS,
	idleTime: "free",
	...over,
});

const base = (over: Partial<PlanInput> = {}): PlanInput => ({
	settings: settings(),
	weeklyTopics: Object.fromEntries(
		SUBJECTS.map((s) => [s, items(s, `w-${s}-`, 12)]),
	),
	weakTopics: items("matematik", "weak-", 8),
	reviewItems: items("fen", "rev-", 8),
	...over,
});

const allTasks = (p: ReturnType<typeof generateWeeklyPlan>) =>
	p.days.flatMap((d) => d.tasks);

describe("soru hedefi modu (dailyTests)", () => {
	const goal = (
		over: Partial<PlanInput> = {},
		tests = { matematik: 4, fen: 3 },
	) =>
		generateWeeklyPlan(
			base({
				settings: settings({
					subjects: ["matematik", "fen"],
					dailyBudgetMinutes: 210,
					blockMinutes: 30,
					dailyTests: tests,
				}),
				weeklyTopics: {
					matematik: items("matematik", "m-", 60),
					fen: items("fen", "f-", 60),
				},
				weakTopics: [],
				reviewItems: [],
				...over,
			}),
		);
	const perDay = (p: ReturnType<typeof generateWeeklyPlan>, s: Subject) =>
		p.days.map((d) => d.tasks.filter((t) => t.subject === s).length);

	it("her gün her derse tam hedefin test sayısı kadar görev düşer", () => {
		const plan = goal();
		expect(perDay(plan, "matematik")).toEqual([4, 4, 4, 4, 4, 4]);
		expect(perDay(plan, "fen")).toEqual([3, 3, 3, 3, 3, 3]);
	});

	it("kitap sırası korunur: aynı dersin testleri gün gün ilerler", () => {
		const plan = goal();
		const works = plan.days
			.flatMap((d) => d.tasks)
			.filter((t) => t.subject === "matematik")
			.map((t) => t.itemId);
		expect(works).toEqual(Array.from({ length: 24 }, (_, i) => `m-${i + 1}`));
	});

	it("zayıf konu ve tekrar, dersin kendi günlük yuvalarının içinde paylaşılır", () => {
		const plan = goal({
			weakTopics: items("matematik", "weak-", 20),
			reviewItems: items("matematik", "rev-", 20),
		});
		// Günlük yük değişmez
		expect(perDay(plan, "matematik")).toEqual([4, 4, 4, 4, 4, 4]);
		const m = plan.days
			.flatMap((d) => d.tasks)
			.filter((t) => t.subject === "matematik");
		const by = (k: string) => m.filter((t) => t.reason.source === k).length;
		expect(by("weak_topic")).toBe(7); // 24 × %30
		expect(by("spaced_review")).toBe(5); // 24 × %20
		expect(by("weekly_topic")).toBe(12);
	});

	it("okul ödevi yuvalara ek olarak girer; günlük test sayıları değişmez", () => {
		const plan = goal({
			homework: [
				{ id: "h1", day: 2, subject: "fen", topic: "Ödev", work: "s.5" },
				{ id: "h2", day: 2, subject: "sosyal", topic: "Ödev 2", work: "s.9" },
			],
		});
		const day2 = plan.days.find((d) => d.day === 2);
		expect(
			day2?.tasks.filter((t) => t.reason.source === "homework"),
		).toHaveLength(2);
		// 4 + 3 test + 2 ödev
		expect(day2?.tasks).toHaveLength(9);
		expect(perDay(plan, "fen")[1]).toBe(4); // 3 test + 1 ödev
		expect(perDay(plan, "matematik")[1]).toBe(4);
		expect(plan.unplaced).toEqual([]);
		// Diğer günler etkilenmez
		expect(perDay(plan, "matematik")).toEqual([4, 4, 4, 4, 4, 4]);
	});

	it("hedefsiz ders planda yer almaz; aynı girdide aynı plan çıkar", () => {
		const plan = goal({}, { matematik: 2, fen: 0 });
		expect(allTasks(plan).every((t) => t.subject === "matematik")).toBe(true);
		expect(goal()).toEqual(goal());
	});

	it("havuz yetmezse yuva boş kalır, görev uydurulmaz", () => {
		const plan = goal({
			weeklyTopics: {
				matematik: items("matematik", "m-", 5),
				fen: items("fen", "f-", 60),
			},
		});
		expect(
			allTasks(plan).filter((t) => t.subject === "matematik"),
		).toHaveLength(5);
	});
});

describe("generateWeeklyPlan", () => {
	it("aynı girdide aynı çıktıyı verir", () => {
		expect(generateWeeklyPlan(base())).toEqual(generateWeeklyPlan(base()));
	});

	it("yuva sayısı bütçe ve blok süresinden türer (günde 3 madde sınırı yok)", () => {
		const count = (budget: number, block: number) =>
			generateWeeklyPlan(
				base({
					settings: settings({
						dailyBudgetMinutes: budget,
						blockMinutes: block,
					}),
				}),
			).days[0]?.tasks.length;
		expect(count(90, 30)).toBe(3);
		expect(count(180, 30)).toBe(6);
		expect(count(120, 20)).toBe(6);
		expect(count(60, 25)).toBe(2);
	});

	it("bütçeyi hiçbir ayarda aşmaz", () => {
		for (const budget of [15, 30, 45, 60, 90, 120, 180, 240]) {
			for (const block of [10, 20, 25, 30, 45]) {
				for (const studyDays of [
					[1],
					[1, 3, 5],
					[1, 2, 3, 4, 5, 6],
					[1, 2, 3, 4, 5, 6, 7],
				]) {
					const plan = generateWeeklyPlan(
						base({
							settings: settings({
								dailyBudgetMinutes: budget,
								blockMinutes: block,
								studyDays,
							}),
						}),
					);
					for (const d of plan.days) {
						expect(d.totalMinutes).toBeLessThanOrEqual(budget);
						expect(d.idleMinutes).toBe(budget - d.totalMinutes);
					}
				}
			}
		}
	});

	it("her görev somut iş, süre ve gerekçe taşır", () => {
		for (const t of allTasks(generateWeeklyPlan(base()))) {
			expect(t.work.length).toBeGreaterThan(0);
			expect(t.resource.length).toBeGreaterThan(0);
			expect(t.minutes).toBe(30);
			expect(t.reason.detail.length).toBeGreaterThan(0);
		}
	});

	it("havuz oranı ~%50 konu / %30 zayıf / %20 tekrar", () => {
		const tasks = allTasks(generateWeeklyPlan(base()));
		const by = (s: string) => tasks.filter((t) => t.reason.source === s).length;
		expect(tasks).toHaveLength(18);
		expect(by("weekly_topic")).toBe(9);
		expect(by("weak_topic")).toBe(5);
		expect(by("spaced_review")).toBe(4);
	});

	it("matematik ve türkçe en az 3 gün çalışılır, hedef tutar", () => {
		const plan = generateWeeklyPlan(base());
		expect(plan.coverage.subjectDays.matematik).toBeGreaterThanOrEqual(3);
		expect(plan.coverage.subjectDays.turkce).toBeGreaterThanOrEqual(3);
		expect(plan.coverage.warnings.some((w) => w.code === "target_missed")).toBe(
			false,
		);
	});

	it("aynı ders aynı güne yığılmaz (yeterli çeşit varken)", () => {
		const plan = generateWeeklyPlan(base());
		for (const d of plan.days) {
			const weekly = d.tasks.filter((t) => t.reason.source === "weekly_topic");
			expect(new Set(weekly.map((t) => t.subject)).size).toBe(weekly.length);
		}
	});

	it("okul ödevi yerleşir, sığmayan sessizce düşmez", () => {
		const hw = (n: number) => ({
			day: 2,
			subject: "fen" as const,
			topic: `K${n}`,
			work: `Ödev ${n}`,
		});
		const ok = generateWeeklyPlan(base({ homework: [hw(1)] }));
		const day2 = ok.days.find((d) => d.day === 2);
		expect(day2?.tasks[0]?.reason.source).toBe("homework");
		expect(ok.unplaced).toHaveLength(0);

		const over = generateWeeklyPlan(
			base({ homework: [hw(1), hw(2), hw(3), hw(4)] }),
		);
		expect(
			over.days
				.find((d) => d.day === 2)
				?.tasks.filter((t) => t.reason.source === "homework"),
		).toHaveLength(3);
		expect(over.unplaced).toHaveLength(1);
		expect(over.unplaced[0]?.why).toBe("no_capacity");
		expect(over.coverage.warnings).toContainEqual({
			code: "homework_unplaced",
			count: 1,
		});
	});

	it("çalışma günü olmayan güne düşen ödev görünür kalır", () => {
		const plan = generateWeeklyPlan(
			base({
				settings: settings({ studyDays: [1, 2, 3] }),
				homework: [{ day: 5, subject: "fen", topic: "K", work: "Ödev" }],
			}),
		);
		expect(plan.unplaced[0]?.why).toBe("not_study_day");
	});

	it("geçen haftadan kalan iş kısıtlı kapasitede öncelik alır", () => {
		const carried = {
			...items("matematik", "c-", 1)[0],
			id: "carried-1",
			carriedOver: true,
		} as WorkItem;
		const plan = generateWeeklyPlan(
			base({
				settings: settings({ studyDays: [1] }),
				weakTopics: [...items("matematik", "weak-", 8), carried],
			}),
		);
		const weak = allTasks(plan).filter((t) => t.reason.source === "weak_topic");
		expect(weak[0]?.itemId).toBe("carried-1");
		expect(weak[0]?.carriedOver).toBe(true);
		expect(plan.coverage.cut.some((c) => c.item.id === "carried-1")).toBe(
			false,
		);
	});

	it("az gün seçilince kapsama raporunda kesilenler ve uyarı görünür", () => {
		const plan = generateWeeklyPlan(
			base({ settings: settings({ studyDays: [1, 3] }) }),
		);
		expect(plan.coverage.cut.length).toBeGreaterThan(0);
		expect(plan.coverage.warnings.some((w) => w.code === "items_cut")).toBe(
			true,
		);
		expect(plan.coverage.warnings.some((w) => w.code === "target_missed")).toBe(
			true,
		);
	});

	it("kapalı ders plana girmez; matematik/türkçe kapalıysa uyarı verir", () => {
		const plan = generateWeeklyPlan(
			base({
				settings: settings({
					subjects: ["fen", "sosyal", "ingilizce", "turkce"],
				}),
			}),
		);
		expect(allTasks(plan).some((t) => t.subject === "matematik")).toBe(false);
		expect(plan.coverage.warnings).toContainEqual({
			code: "subject_off",
			subject: "matematik",
		});
	});

	it("7 gün seçilirse boş gün kalmadığı uyarılır, engellenmez", () => {
		const plan = generateWeeklyPlan(
			base({ settings: settings({ studyDays: [1, 2, 3, 4, 5, 6, 7] }) }),
		);
		expect(plan.days).toHaveLength(7);
		expect(plan.coverage.warnings).toContainEqual({ code: "no_rest_day" });
	});

	it("bütçe blok süresinden küçükse tek kısa görev, uyarıyla", () => {
		const plan = generateWeeklyPlan(
			base({
				settings: settings({ dailyBudgetMinutes: 20, blockMinutes: 30 }),
			}),
		);
		expect(plan.days[0]?.tasks).toHaveLength(1);
		expect(plan.days[0]?.tasks[0]?.minutes).toBe(20);
		expect(plan.coverage.warnings).toContainEqual({
			code: "budget_below_block",
		});
	});

	it("havuz tükenince boş kalan süre veli tercihine göre işaretlenir", () => {
		const few = base({
			weeklyTopics: { matematik: items("matematik", "m-", 2) },
			weakTopics: [],
			reviewItems: [],
		});
		const free = generateWeeklyPlan({
			...few,
			settings: settings({ idleTime: "free" }),
		});
		const reading = generateWeeklyPlan({
			...few,
			settings: settings({ idleTime: "reading" }),
		});
		const review = generateWeeklyPlan({
			...few,
			settings: settings({ idleTime: "review" }),
		});
		expect(free.days.every((d) => d.idle === undefined)).toBe(true);
		expect(reading.days.some((d) => d.idle === "reading")).toBe(true);
		expect(review.days.some((d) => d.idle === "review_needed")).toBe(true);
		// Motor boşluğu görev uydurarak doldurmaz.
		expect(allTasks(free)).toHaveLength(2);
	});

	it("geçersiz ayarı reddeder", () => {
		expect(() =>
			generateWeeklyPlan(base({ settings: settings({ studyDays: [] }) })),
		).toThrow(RangeError);
		expect(() =>
			generateWeeklyPlan(base({ settings: settings({ studyDays: [1, 1] }) })),
		).toThrow(RangeError);
		expect(() =>
			generateWeeklyPlan(base({ settings: settings({ studyDays: [8] }) })),
		).toThrow(RangeError);
		expect(() =>
			generateWeeklyPlan(
				base({ settings: settings({ dailyBudgetMinutes: 0 }) }),
			),
		).toThrow(RangeError);
		expect(() =>
			generateWeeklyPlan(base({ settings: settings({ blockMinutes: 0 }) })),
		).toThrow(RangeError);
	});
});

describe("carryOver", () => {
	it("yapılmayan görevleri devreder, ödevi ve yapılanı devretmez", () => {
		const plan = generateWeeklyPlan(
			base({
				homework: [{ day: 1, subject: "fen", topic: "K", work: "Ödev" }],
			}),
		);
		const tasks = allTasks(plan);
		const done = new Set(tasks.slice(0, 5).map((t) => t.id));
		const carried = carryOver(plan, done);
		expect(carried.length).toBe(
			tasks.length -
				5 -
				tasks.slice(5).filter((t) => t.reason.source === "homework").length,
		);
		expect(carried.every((i) => i.carriedOver)).toBe(true);
		expect(carried.some((i) => i.work === "Ödev")).toBe(false);
	});
});

describe("moveTask", () => {
	it("yer varsa taşır ve bütçeyi aşmaz", () => {
		const plan = generateWeeklyPlan(
			base({
				settings: settings({ dailyBudgetMinutes: 90, studyDays: [1, 2] }),
				weakTopics: [],
				reviewItems: [],
				weeklyTopics: { matematik: items("matematik", "m-", 4) },
			}),
		);
		// 2 gün x 3 yuva, yalnızca 4 görev: gün 2'de yer var.
		const from = plan.days[0];
		const task = from?.tasks[0];
		const roomDay = plan.days.find((d) => d.tasks.length < 3);
		expect(task && roomDay).toBeTruthy();
		if (!task || !roomDay || roomDay.day === from?.day) return;
		const res = moveTask(plan, task.id, roomDay.day);
		expect(res.ok).toBe(true);
		if (res.ok) {
			for (const d of res.plan.days)
				expect(d.totalMinutes).toBeLessThanOrEqual(90);
			expect(res.plan.days.flatMap((d) => d.tasks)).toHaveLength(
				plan.days.flatMap((d) => d.tasks).length,
			);
		}
	});

	it("hedef gün doluysa zayıf konu/tekrar görevi havuza düşer", () => {
		const plan = generateWeeklyPlan(base());
		const task = plan.days[0]?.tasks.find(
			(t) => t.reason.source === "weekly_topic",
		);
		const target = plan.days.find((d) => d.day === 2);
		expect(
			task && target?.tasks.some((t) => t.reason.source !== "weekly_topic"),
		).toBeTruthy();
		if (!task) return;
		const res = moveTask(plan, task.id, 2);
		expect(res.ok).toBe(true);
		if (res.ok) {
			expect(res.displaced).toBeDefined();
			expect(res.displaced?.carriedOver).toBe(true);
			const d2 = res.plan.days.find((d) => d.day === 2);
			expect(d2?.tasks.length).toBe(3);
			expect(d2?.totalMinutes).toBeLessThanOrEqual(90);
			expect(
				res.plan.coverage.cut.some((c) => c.item.id === res.displaced?.id),
			).toBe(true);
		}
	});

	it("okul ödevi yerinden edilmez; yalnızca ödevle dolu gün taşımayı reddeder", () => {
		const hw = [1, 2, 3].map((n) => ({
			day: 2,
			subject: "fen" as const,
			topic: `K${n}`,
			work: `Ödev ${n}`,
		}));
		const plan = generateWeeklyPlan(base({ homework: hw }));
		const task = plan.days[0]?.tasks[0];
		if (!task) throw new Error("görev yok");
		const res = moveTask(plan, task.id, 2);
		expect(res).toEqual({ ok: false, reason: "no_capacity" });
	});

	it("bilinmeyen görevi, çalışma günü olmayan günü ve aynı günü reddeder", () => {
		const plan = generateWeeklyPlan(
			base({ settings: settings({ studyDays: [1, 2, 3] }) }),
		);
		const task = plan.days[0]?.tasks[0];
		if (!task) throw new Error("görev yok");
		expect(moveTask(plan, "yok", 2)).toEqual({
			ok: false,
			reason: "unknown_task",
		});
		expect(moveTask(plan, task.id, 6)).toEqual({
			ok: false,
			reason: "not_study_day",
		});
		expect(moveTask(plan, task.id, task.day)).toEqual({
			ok: false,
			reason: "same_day",
		});
	});
});

describe("tavsiye kontrolleri", () => {
	it("bütçe ve blok süresi için engel değil, uyarı seviyesi döner", () => {
		expect(checkDailyBudget(90).level).toBe("ok");
		expect(checkDailyBudget(121).level).toBe("warn");
		expect(checkDailyBudget(181).level).toBe("strong_warn");
		expect(checkDailyBudget(0).level).toBe("invalid");
		expect(checkBlockMinutes(30).level).toBe("ok");
		expect(checkBlockMinutes(5).level).toBe("warn");
		expect(checkBlockMinutes(60).level).toBe("warn");
	});
});

describe("ödev kimliği", () => {
	it("ödev görevinin itemId'si hw:<id> olur", () => {
		const plan = generateWeeklyPlan(
			base({
				homework: [
					{ id: "abc", day: 1, subject: "fen", topic: "K", work: "Ödev" },
				],
			}),
		);
		const hw = plan.days
			.flatMap((d) => d.tasks)
			.find((t) => t.reason.source === "homework");
		expect(hw?.itemId).toBe("hw:abc");
	});

	it("taşıma görev kimliğini korur", () => {
		const plan = generateWeeklyPlan(base());
		const task = plan.days[0]?.tasks.find(
			(t) => t.reason.source === "weekly_topic",
		);
		if (!task) throw new Error("görev yok");
		const res = moveTask(plan, task.id, 2);
		if (!res.ok) throw new Error("taşınamadı");
		const moved = res.plan.days
			.flatMap((d) => d.tasks)
			.find((t) => t.id === task.id);
		expect(moved?.day).toBe(2);
	});
});
