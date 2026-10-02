/**
 * ADR-0005 + ADR-0013: deterministik, kural tabanlı haftalık plan motoru.
 * Saf fonksiyon: aynı girdi her zaman aynı çıktıyı verir, dış durum okumaz.
 *
 * Yuva sayısı sabit değil, hesaplanır: gün sayısı × (günlük bütçe / blok süresi).
 * Motor görev eklemez; yuvaları ağırlıklara göre doldurur, sığmayanı kapsama raporuna yazar.
 */
import { LIMITS } from "./limits";
import type {
	Coverage,
	CoverageWarning,
	DayPlan,
	Homework,
	PlanInput,
	PlanSettings,
	PlanTask,
	Subject,
	TaskSource,
	UnplacedHomework,
	WeeklyPlan,
	WorkItem,
} from "./types";

const SUBJECT_ORDER: readonly Subject[] = [
	"matematik",
	"turkce",
	"fen",
	"sosyal",
	"ingilizce",
];
/** Beceri dersleri bilgi derslerinden sık (ADR-0005). */
const SUBJECT_WEIGHT: Record<Subject, number> = {
	matematik: 3,
	turkce: 3,
	fen: 2,
	sosyal: 2,
	ingilizce: 2,
};
const SKILL_SUBJECTS: readonly Subject[] = ["matematik", "turkce"];
/** ADR-0005: %50 haftanın konusu, %30 zayıf konu, %20 aralıklı tekrar. */
const POOL_WEIGHTS = [5, 3, 2] as const;

const KIND_ORDER: Record<TaskSource, number> = {
	homework: 0,
	weekly_topic: 1,
	weak_topic: 2,
	spaced_review: 3,
};

const sum = (xs: readonly number[]) => xs.reduce((a, b) => a + b, 0);

/** En büyük kalan yöntemi: toplamı tam korur, eşitlikte düşük indeks kazanır. */
function apportion(total: number, weights: readonly number[]): number[] {
	const w = sum(weights);
	if (total <= 0 || w <= 0) return weights.map(() => 0);
	const exact = weights.map((x) => (x / w) * total);
	const out = exact.map(Math.floor);
	let rest = total - sum(out);
	const order = exact
		.map((e, i) => ({ i, frac: e - Math.floor(e) }))
		.sort((a, b) => b.frac - a.frac || a.i - b.i);
	for (const { i } of order) {
		if (rest <= 0) break;
		out[i] = (out[i] ?? 0) + 1;
		rest--;
	}
	return out;
}

/** Üst sınırlı paylaştırma: dolan kalemin fazlası diğerlerine ağırlıkla dağıtılır. */
function apportionCapped(
	total: number,
	weights: readonly number[],
	caps: readonly number[],
): number[] {
	const result = weights.map(() => 0);
	let remaining = Math.min(total, sum(caps));
	let active = weights
		.map((w, i) => (w > 0 && (caps[i] ?? 0) > 0 ? i : -1))
		.filter((i) => i >= 0);
	while (remaining > 0 && active.length > 0) {
		const shares = apportion(
			remaining,
			active.map((i) => weights[i] ?? 0),
		);
		let allocated = 0;
		const next: number[] = [];
		active.forEach((idx, k) => {
			const room = (caps[idx] ?? 0) - (result[idx] ?? 0);
			const take = Math.min(shares[k] ?? 0, room);
			result[idx] = (result[idx] ?? 0) + take;
			allocated += take;
			if ((result[idx] ?? 0) < (caps[idx] ?? 0)) next.push(idx);
		});
		if (allocated === 0) break;
		remaining -= allocated;
		active = next;
	}
	return result;
}

/** Geçen haftadan kalanlar kendi havuzunda öne alınır (sıra korunur). */
function prioritized(items: readonly WorkItem[]): WorkItem[] {
	return [
		...items.filter((i) => i.carriedOver),
		...items.filter((i) => !i.carriedOver),
	];
}

function validate(settings: PlanSettings, days: readonly number[]) {
	if (!(settings.dailyBudgetMinutes > 0)) {
		throw new RangeError("dailyBudgetMinutes pozitif olmalı");
	}
	if (!(settings.blockMinutes > 0)) {
		throw new RangeError("blockMinutes pozitif olmalı");
	}
	if (
		days.length === 0 ||
		new Set(days).size !== days.length ||
		days.some((d) => !Number.isInteger(d) || d < 1 || d > 7)
	) {
		throw new RangeError(
			"studyDays: 1-7 arası, tekrarsız ve boş olmayan günler",
		);
	}
}

interface Pending {
	kind: TaskSource;
	seq: number;
	subject: Subject;
	topic: string;
	resource: string;
	work: string;
	item?: WorkItem;
	/** Ödev görevlerinde çağıranın ödev kimliği. */
	itemId?: string;
}

export function generateWeeklyPlan(input: PlanInput): WeeklyPlan {
	const { settings } = input;
	validate(settings, settings.studyDays);
	const days = [...settings.studyDays].sort((a, b) => a - b);

	const budget = settings.dailyBudgetMinutes;
	const slotsPerDay = Math.max(1, Math.floor(budget / settings.blockMinutes));
	const taskMinutes = Math.min(settings.blockMinutes, budget);
	const enabled = new Set(settings.subjects);

	const pending = new Map<number, Pending[]>(days.map((d) => [d, []]));
	let seq = 0;
	const room = (d: number) => slotsPerDay - (pending.get(d)?.length ?? 0);
	const has = (d: number, s: Subject) =>
		(pending.get(d) ?? []).some((p) => p.subject === s);
	const add = (d: number, p: Omit<Pending, "seq">): Pending => {
		const entry: Pending = { ...p, seq: seq++ };
		pending.get(d)?.push(entry);
		return entry;
	};

	// 1) Okul ödevi asla düşmez: yer yoksa sessizce atılmaz, `unplaced`'e yazılır.
	const unplaced: UnplacedHomework[] = [];
	const hwSorted: Homework[] = [...(input.homework ?? [])].sort(
		(a, b) => a.day - b.day,
	);
	for (const hw of hwSorted) {
		if (!days.includes(hw.day)) {
			unplaced.push({ homework: hw, why: "not_study_day" });
		} else if (room(hw.day) <= 0) {
			unplaced.push({ homework: hw, why: "no_capacity" });
		} else {
			add(hw.day, {
				kind: "homework",
				subject: hw.subject,
				topic: hw.topic,
				resource: "Okul ödevi",
				work: hw.work,
				itemId: hw.id ? `hw:${hw.id}` : undefined,
			});
		}
	}

	// 2) Havuzlar. Aynı iş iki havuzda geçerse bir kez kullanılır.
	const used = new Set<string>();
	const claim = (items: readonly WorkItem[]): WorkItem[] => {
		const out: WorkItem[] = [];
		for (const item of prioritized(items)) {
			if (used.has(item.id)) continue;
			used.add(item.id);
			out.push(item);
		}
		return out;
	};
	const weekly = new Map<Subject, WorkItem[]>();
	for (const s of SUBJECT_ORDER) {
		if (enabled.has(s)) weekly.set(s, claim(input.weeklyTopics[s] ?? []));
	}
	const weak = claim(input.weakTopics.filter((i) => enabled.has(i.subject)));
	const review = claim(input.reviewItems.filter((i) => enabled.has(i.subject)));

	const totalFree = sum(days.map(room));
	const weeklyLens = SUBJECT_ORDER.map((s) => weekly.get(s)?.length ?? 0);
	const [weeklyTarget = 0, weakTarget = 0, reviewTarget = 0] = apportionCapped(
		totalFree,
		POOL_WEIGHTS,
		[sum(weeklyLens), weak.length, review.length],
	);

	// 3) Ders kotaları: önce tüm derslere ağırlıkla; sonra beceri derslerine hedef gün
	// güvencesi, en büyük kotalı dersten devredilerek (toplam değişmez).
	const quota = new Map<Subject, number>();
	const weighted = apportionCapped(
		weeklyTarget,
		SUBJECT_ORDER.map((s) => SUBJECT_WEIGHT[s]),
		weeklyLens,
	);
	SUBJECT_ORDER.forEach((s, i) => {
		quota.set(s, weighted[i] ?? 0);
	});
	const floorOf = (s: Subject) =>
		SKILL_SUBJECTS.includes(s)
			? Math.min(
					LIMITS.minMathAndTurkishDaysPerWeek,
					days.length,
					weekly.get(s)?.length ?? 0,
				)
			: 0;
	for (const s of SKILL_SUBJECTS) {
		while ((quota.get(s) ?? 0) < floorOf(s)) {
			let donor: Subject | undefined;
			let best = 0;
			for (const o of SUBJECT_ORDER) {
				const q = quota.get(o) ?? 0;
				if (o !== s && q > floorOf(o) && q > best) {
					best = q;
					donor = o;
				}
			}
			if (!donor) break;
			quota.set(donor, (quota.get(donor) ?? 0) - 1);
			quota.set(s, (quota.get(s) ?? 0) + 1);
		}
	}

	// 4) Haftanın konusu: dersler günlere yayılır, aynı ders aynı güne yığılmaz.
	const D = days.length;
	const subjectsByCount = SUBJECT_ORDER.filter(
		(s) => (quota.get(s) ?? 0) > 0,
	).sort((a, b) => (quota.get(b) ?? 0) - (quota.get(a) ?? 0));
	const pickDay = (start: number, s: Subject): number | undefined => {
		for (const pass of [0, 1]) {
			for (let j = 0; j < D; j++) {
				const d = days[(start + j) % D];
				if (d === undefined || room(d) <= 0) continue;
				if (pass === 0 && has(d, s)) continue;
				return d;
			}
		}
		return undefined;
	};
	subjectsByCount.forEach((s, k) => {
		const c = quota.get(s) ?? 0;
		const slots: { d: number; p: Pending }[] = [];
		for (let i = 0; i < c; i++) {
			const start = (k + Math.floor((i * D) / c)) % D;
			const d = pickDay(start, s);
			if (d === undefined) break;
			// Yeri hemen ayır; iş aşağıda gün sırasıyla atanır (kitap sırası korunur).
			slots.push({
				d,
				p: add(d, {
					kind: "weekly_topic",
					subject: s,
					topic: "",
					resource: "",
					work: "",
				}),
			});
		}
		slots.sort((a, b) => a.d - b.d || a.p.seq - b.p.seq);
		const list = weekly.get(s) ?? [];
		for (const { p } of slots) {
			const item = list.shift();
			if (!item) break;
			p.topic = item.topic;
			p.resource = item.resource;
			p.work = item.work;
			p.item = item;
		}
	});

	// 5) Zayıf konu ve aralıklı tekrar: 3:2 oranında dönüşümlü, en boş güne.
	const kinds: ("weak" | "review")[] = [];
	let wPlaced = 0;
	for (let i = 0; i < weakTarget + reviewTarget; i++) {
		const expectedW = Math.round(
			((i + 1) * weakTarget) / (weakTarget + reviewTarget),
		);
		const rPlaced = i - wPlaced;
		if (
			(wPlaced < expectedW || rPlaced >= reviewTarget) &&
			wPlaced < weakTarget
		) {
			kinds.push("weak");
			wPlaced++;
		} else kinds.push("review");
	}
	for (const kind of kinds) {
		const item = (kind === "weak" ? weak : review).shift();
		if (!item) continue;
		const open = days.filter((d) => room(d) > 0);
		const ranked = [...open].sort((a, b) => room(b) - room(a) || a - b);
		const d = ranked.find((x) => !has(x, item.subject)) ?? ranked[0];
		if (d === undefined) {
			(kind === "weak" ? weak : review).unshift(item);
			break;
		}
		add(d, {
			kind: kind === "weak" ? "weak_topic" : "spaced_review",
			subject: item.subject,
			topic: item.topic,
			resource: item.resource,
			work: item.work,
			item,
		});
	}

	// 6) Günleri kur: ödev, haftanın konusu, zayıf/tekrar sırasıyla.
	const dayPlans: DayPlan[] = days.map((day) => {
		const list = (pending.get(day) ?? [])
			.filter((p) => p.kind === "homework" || p.item !== undefined)
			.sort((a, b) => KIND_ORDER[a.kind] - KIND_ORDER[b.kind] || a.seq - b.seq);
		const tasks: PlanTask[] = list.map((p, i) =>
			toTask(settings, day, i + 1, taskMinutes, p),
		);
		return finishDay(settings, day, tasks, slotsPerDay);
	});

	// 7) Kapsama raporu.
	const cut: Coverage["cut"] = [
		...[...weekly.values()]
			.flat()
			.map((item) => ({ item, pool: "weekly_topic" as const })),
		...weak.map((item) => ({ item, pool: "weak_topic" as const })),
		...review.map((item) => ({ item, pool: "spaced_review" as const })),
	];
	const subjectDays = countSubjectDays(dayPlans);
	const warnings: CoverageWarning[] = [];
	for (const s of SKILL_SUBJECTS) {
		if (!enabled.has(s)) {
			warnings.push({ code: "subject_off", subject: s });
		} else if (
			(subjectDays[s] ?? 0) < LIMITS.minMathAndTurkishDaysPerWeek &&
			(weeklyLens[SUBJECT_ORDER.indexOf(s)] ?? 0) > 0
		) {
			warnings.push({
				code: "target_missed",
				subject: s,
				days: subjectDays[s] ?? 0,
				target: LIMITS.minMathAndTurkishDaysPerWeek,
			});
		}
	}
	if (cut.length > 0) warnings.push({ code: "items_cut", count: cut.length });
	if (unplaced.length > 0) {
		warnings.push({ code: "homework_unplaced", count: unplaced.length });
	}
	if (days.length >= 7) warnings.push({ code: "no_rest_day" });
	if (budget < settings.blockMinutes)
		warnings.push({ code: "budget_below_block" });

	return {
		weekStart: settings.weekStart,
		settings,
		days: dayPlans,
		unplaced,
		coverage: { cut, subjectDays, warnings },
	};
}

function toTask(
	settings: PlanSettings,
	day: number,
	block: number,
	minutes: number,
	p: Pending,
): PlanTask {
	const carried = p.item?.carriedOver === true;
	const suffix = carried ? " · geçen haftadan kalan" : "";
	const detail: Record<TaskSource, string> = {
		homework: "Okul ödevi",
		weekly_topic: `Bu haftanın konusu (${p.topic}), okulla senkron`,
		weak_topic: `Son denemede zayıf konu (${p.topic})`,
		spaced_review: `Aralıklı tekrar (${p.topic})`,
	};
	return {
		id: `${settings.weekStart}:d${day}:b${block}`,
		itemId: p.item?.id ?? p.itemId,
		day,
		block,
		minutes,
		subject: p.subject,
		topic: p.topic,
		resource: p.resource,
		work: p.work,
		reason: { source: p.kind, detail: detail[p.kind] + suffix },
		...(carried ? { carriedOver: true } : {}),
	};
}

function finishDay(
	settings: PlanSettings,
	day: number,
	tasks: PlanTask[],
	slotsPerDay: number,
): DayPlan {
	const totalMinutes = sum(tasks.map((t) => t.minutes));
	const emptySlots = slotsPerDay - tasks.length;
	const idle =
		emptySlots > 0 && settings.idleTime !== "free"
			? settings.idleTime === "reading"
				? ("reading" as const)
				: ("review_needed" as const)
			: undefined;
	return {
		day,
		tasks,
		totalMinutes,
		idleMinutes: settings.dailyBudgetMinutes - totalMinutes,
		...(idle ? { idle } : {}),
	};
}

function countSubjectDays(days: readonly DayPlan[]): Record<Subject, number> {
	const out = Object.fromEntries(SUBJECT_ORDER.map((s) => [s, 0])) as Record<
		Subject,
		number
	>;
	for (const d of days) {
		for (const s of new Set(d.tasks.map((t) => t.subject))) out[s] += 1;
	}
	return out;
}

/** Yapılmayan görevleri gelecek haftanın havuzuna döndürür (ödev hariç, ADR-0005/0013). */
export function carryOver(
	plan: WeeklyPlan,
	doneTaskIds: ReadonlySet<string>,
): WorkItem[] {
	return plan.days
		.flatMap((d) => d.tasks)
		.filter((t) => !doneTaskIds.has(t.id) && t.reason.source !== "homework")
		.map(taskToItem);
}

function taskToItem(t: PlanTask): WorkItem {
	return {
		id: t.itemId ?? t.id,
		subject: t.subject,
		topic: t.topic,
		resource: t.resource,
		work: t.work,
		carriedOver: true,
	};
}

export type MoveResult =
	| { ok: true; plan: WeeklyPlan; displaced?: WorkItem }
	| {
			ok: false;
			reason: "unknown_task" | "not_study_day" | "same_day" | "no_capacity";
	  };

/**
 * Hafta içi taşıma (ADR-0013 madde 6): kullanıcı eylemidir, motor kendiliğinden yapmaz.
 * Hedef günde yer yoksa o günün zayıf konu/tekrar görevi havuza düşer; yoksa reddedilir.
 * Okul ödevi hiçbir koşulda yerinden edilmez.
 */
export function moveTask(
	plan: WeeklyPlan,
	taskId: string,
	toDay: number,
): MoveResult {
	const from = plan.days.find((d) => d.tasks.some((t) => t.id === taskId));
	const task = from?.tasks.find((t) => t.id === taskId);
	if (!from || !task) return { ok: false, reason: "unknown_task" };
	const to = plan.days.find((d) => d.day === toDay);
	if (!to) return { ok: false, reason: "not_study_day" };
	if (to.day === from.day) return { ok: false, reason: "same_day" };

	const { settings } = plan;
	const slotsPerDay = Math.max(
		1,
		Math.floor(settings.dailyBudgetMinutes / settings.blockMinutes),
	);
	let displaced: PlanTask | undefined;
	if (to.tasks.length >= slotsPerDay) {
		const victims = to.tasks.filter(
			(t) =>
				t.reason.source === "spaced_review" || t.reason.source === "weak_topic",
		);
		displaced =
			victims.findLast((t) => t.reason.source === "spaced_review") ??
			victims.findLast((t) => t.reason.source === "weak_topic");
		if (!displaced) return { ok: false, reason: "no_capacity" };
	}

	const rebuild = (day: DayPlan, tasks: PlanTask[]): DayPlan => {
		const sorted = [...tasks].sort(
			(a, b) =>
				KIND_ORDER[a.reason.source] - KIND_ORDER[b.reason.source] ||
				a.block - b.block,
		);
		// Görev kimliği kalıcıdır (veritabanı satırı); yalnızca gün ve sıra güncellenir.
		const renumbered = sorted.map((t, i) => ({
			...t,
			day: day.day,
			block: i + 1,
		}));
		return finishDay(settings, day.day, renumbered, slotsPerDay);
	};

	const days = plan.days.map((d) => {
		if (d.day === from.day)
			return rebuild(
				d,
				d.tasks.filter((t) => t.id !== taskId),
			);
		if (d.day === to.day) {
			const kept = displaced
				? d.tasks.filter((t) => t.id !== displaced?.id)
				: d.tasks;
			return rebuild(d, [...kept, task]);
		}
		return d;
	});

	const cut = displaced
		? [
				...plan.coverage.cut,
				{
					item: taskToItem(displaced),
					pool: displaced.reason.source as "weak_topic" | "spaced_review",
				},
			]
		: plan.coverage.cut;
	const subjectDays = countSubjectDays(days);
	const warnings = plan.coverage.warnings
		.filter(
			(w) =>
				!(
					w.code === "target_missed" &&
					(subjectDays[w.subject] ?? 0) >= w.target
				) && w.code !== "items_cut",
		)
		.concat(
			cut.length > 0 ? [{ code: "items_cut" as const, count: cut.length }] : [],
		);

	return {
		ok: true,
		plan: { ...plan, days, coverage: { cut, subjectDays, warnings } },
		displaced: displaced ? taskToItem(displaced) : undefined,
	};
}
