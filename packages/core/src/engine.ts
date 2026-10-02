/**
 * ADR-0005: deterministik, kural tabanlı haftalık plan motoru.
 * ADR-0009: bütçe aşılamaz kısıttır; motor görev eklemez, önceliklendirip keser.
 * Saf fonksiyon: aynı girdi her zaman aynı çıktıyı verir, dış durum okumaz.
 */
import { LIMITS } from "./limits";
import type {
	DayPlan,
	Homework,
	PlanInput,
	PlanTask,
	Subject,
	Unplaced,
	WeeklyPlan,
	WorkItem,
} from "./types";

const DEFAULT_STUDY_DAYS = [1, 2, 3, 4, 5] as const;

/** Blok 1 dönüşümü: bugün işlenen konu. Fen/Sosyal/İngilizce burada, Türkçe bir gün destek alır. */
const BLOCK1_ROTATION: readonly Subject[] = [
	"fen",
	"sosyal",
	"ingilizce",
	"fen",
	"turkce",
];
/** Blok 2 dönüşümü: beceri dersleri dönüşümlü. */
const BLOCK2_ROTATION: readonly Subject[] = [
	"matematik",
	"turkce",
	"matematik",
	"turkce",
	"matematik",
];
/** Blok 3: %30 zayıf / %20 aralıklı tekrar oranı (3:2). */
const BLOCK3_ROTATION = ["weak", "weak", "review", "weak", "review"] as const;

const round5 = (n: number) => Math.round(n / 5) * 5;
const clamp = (n: number, min: number, max: number) =>
	Math.min(max, Math.max(min, n));

interface BlockBudget {
	b1: number;
	b2: number;
	b3: number;
}

/** Bütçeye göre blok süreleri. Küçük bütçede önce Blok 3, sonra Blok 2 düşer; Blok 1 asla. */
export function allocateBlocks(budget: number): BlockBudget {
	const { blockMinutes, block3Minutes } = LIMITS;
	const b1 = clamp(round5(budget * 0.32), blockMinutes.min, blockMinutes.max);
	const b2 = clamp(round5(budget * 0.32), blockMinutes.min, blockMinutes.max);
	const b3 = clamp(round5(budget * 0.26), block3Minutes.min, block3Minutes.max);
	if (b1 + b2 + b3 <= budget) return { b1, b2, b3 };
	if (b1 + b2 <= budget) return { b1, b2, b3: 0 };
	return { b1: Math.min(b1, budget), b2: 0, b3: 0 };
}

/** Geçen haftadan kalanlar kendi havuzunda öne alınır (sıra korunur). */
function prioritized(items: readonly WorkItem[]): WorkItem[] {
	return [
		...items.filter((i) => i.carriedOver),
		...items.filter((i) => !i.carriedOver),
	];
}

function validate(input: PlanInput, days: readonly number[]) {
	if (!(input.dailyBudgetMinutes > 0)) {
		throw new RangeError("dailyBudgetMinutes pozitif olmalı");
	}
	if (days.length > LIMITS.maxStudyDaysPerWeek) {
		throw new RangeError(
			`Haftada en fazla ${LIMITS.maxStudyDaysPerWeek} çalışma günü olabilir`,
		);
	}
	if (new Set(days).size !== days.length || days.some((d) => d < 1 || d > 5)) {
		throw new RangeError("studyDays: 1-5 arası, tekrarsız hafta içi günleri");
	}
}

export function generateWeeklyPlan(input: PlanInput): WeeklyPlan {
	const days = [...(input.studyDays ?? DEFAULT_STUDY_DAYS)].sort(
		(a, b) => a - b,
	);
	validate(input, days);

	const blocks = allocateBlocks(input.dailyBudgetMinutes);
	const weeklyCursor = new Map<Subject, number>();
	const weak = prioritized(input.weakTopics);
	const review = prioritized(input.reviewItems);
	const used = new Set<string>();
	const unplaced: Unplaced[] = [];

	const nextWeekly = (subject: Subject): WorkItem | undefined => {
		const list = input.weeklyTopics[subject];
		if (!list || list.length === 0) return undefined;
		const i = weeklyCursor.get(subject) ?? 0;
		weeklyCursor.set(subject, i + 1);
		return list[i % list.length];
	};
	type Pool = "weak" | "review";
	const takeFrom = (
		pool: WorkItem[],
		kind: Pool,
	): { item: WorkItem; kind: Pool } | undefined => {
		const idx = pool.findIndex((i) => !used.has(i.id));
		if (idx < 0) return undefined;
		const [item] = pool.splice(idx, 1);
		if (!item) return undefined;
		used.add(item.id);
		return { item, kind };
	};

	const dayPlans: DayPlan[] = days.map((day, di) => {
		const tasks: PlanTask[] = [];
		const make = (
			block: 1 | 2 | 3,
			minutes: number,
			p: Pick<PlanTask, "subject" | "topic" | "resource" | "work" | "reason">,
		): PlanTask => ({
			id: `${input.weekStart}:d${day}:b${block}`,
			day,
			block,
			minutes,
			...p,
		});

		// Okul ödevi asla düşmez: Blok 1, sığmazsa Blok 2'ye geçer, o da dolduysa `unplaced`.
		const hw: Homework[] = (input.homework ?? []).filter((h) => h.day === day);
		const hwSlots: Array<1 | 2> = [];
		if (blocks.b1 > 0) hwSlots.push(1);
		if (blocks.b2 > 0) hwSlots.push(2);
		const taken = new Set<1 | 2>();
		hw.forEach((h, i) => {
			const block = hwSlots[i];
			if (!block) {
				unplaced.push({ homework: h, why: "Günlük görev sayısı/bütçe doldu" });
				return;
			}
			taken.add(block);
			tasks.push(
				make(block, block === 1 ? blocks.b1 : blocks.b2, {
					subject: h.subject,
					topic: h.topic,
					resource: "Okul ödevi",
					work: h.work,
					reason: { source: "homework", detail: "Okul ödevi" },
				}),
			);
		});

		const weeklyTask = (
			block: 1 | 2,
			subject: Subject,
		): PlanTask | undefined => {
			const item = nextWeekly(subject);
			if (!item) return undefined;
			return make(block, block === 1 ? blocks.b1 : blocks.b2, {
				subject: item.subject,
				topic: item.topic,
				resource: item.resource,
				work: item.work,
				reason: {
					source: "weekly_topic",
					detail: `Bu haftanın konusu (${item.topic}), okulla senkron`,
				},
			});
		};

		const b1Subject = BLOCK1_ROTATION[di % BLOCK1_ROTATION.length] as Subject;
		const b2Subject = BLOCK2_ROTATION[di % BLOCK2_ROTATION.length] as Subject;
		if (blocks.b1 > 0 && !taken.has(1)) {
			const t = weeklyTask(1, b1Subject);
			if (t) tasks.push(t);
		}
		if (blocks.b2 > 0 && !taken.has(2)) {
			const t = weeklyTask(2, b2Subject);
			if (t) tasks.push(t);
		}

		if (blocks.b3 > 0) {
			const kind = BLOCK3_ROTATION[di % BLOCK3_ROTATION.length];
			const picked =
				kind === "weak"
					? (takeFrom(weak, "weak") ?? takeFrom(review, "review"))
					: (takeFrom(review, "review") ?? takeFrom(weak, "weak"));
			if (picked) {
				const { item } = picked;
				const isWeak = picked.kind === "weak";
				tasks.push(
					make(3, blocks.b3, {
						subject: item.subject,
						topic: item.topic,
						resource: item.resource,
						work: item.work,
						reason: isWeak
							? {
									source: "weak_topic",
									detail: `Son denemede zayıf konu (${item.topic})`,
								}
							: {
									source: "spaced_review",
									detail: `Aralıklı tekrar (${item.topic})`,
								},
					}),
				);
			}
		}

		tasks.sort((a, b) => a.block - b.block);
		return {
			day,
			tasks,
			totalMinutes: tasks.reduce((s, t) => s + t.minutes, 0),
		};
	});

	return {
		weekStart: input.weekStart,
		dailyBudgetMinutes: input.dailyBudgetMinutes,
		days: dayPlans,
		unplaced,
	};
}
