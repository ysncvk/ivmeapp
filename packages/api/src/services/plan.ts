/**
 * Haftalık plan servisi: çocuğun ayarlarını, kitaplarını, müfredattaki haftasını, önceki
 * haftadan kalanları, deneme zayıf konularını ve ödevleri toplayıp çekirdek motora (`core`) verir,
 * sonucu kalıcı saklar. Motor saf kalır; veritabanı bilgisi yalnızca burada.
 */
import {
	addDays,
	bookWorkItems,
	type Coverage,
	carryOver,
	type Homework as EngineHomework,
	generateWeeklyPlan,
	hasPlanAccess,
	isoWeekday,
	istanbulDate,
	moveTask,
	normalizeTr,
	type PlanSettings,
	type PlanTask,
	type SourceBook,
	type Subject,
	testsPerDay,
	type UnplacedHomework,
	type WeeklyPlan,
	type WorkItem,
	weekFor,
	weekPool,
} from "@ivmeapp/core";
import type { Database } from "@ivmeapp/db";
import {
	type child,
	childSource,
	childSubject,
	child as childTable,
	dailyGoal,
	exam,
	examWeakTopic,
	homework,
	plan,
	planEvent,
	planTask,
	questionLog,
	subscription,
} from "@ivmeapp/db/schema/domain";
import { and, asc, eq, isNotNull, isNull, sql } from "drizzle-orm";

import {
	bookById,
	curriculumFor,
	questionsForItem,
	SUBJECTS,
} from "../catalog";

type ChildRow = typeof child.$inferSelect;

export interface StoredTask extends PlanTask {
	doneAt: Date | null;
}

export interface StoredPlan {
	id: string;
	childId: string;
	weekStart: string;
	settings: PlanSettings;
	coverage: Coverage;
	unplaced: UnplacedHomework[];
	generatedAt: Date;
	tasks: StoredTask[];
}

/** Çocuğun ücretli plan yetkisi (ADR-0014 madde 9: katman kontrolü tek noktadan). */
export async function childHasPlanAccess(
	db: Database,
	childId: string,
	now: Date,
): Promise<boolean> {
	const [sub] = await db
		.select()
		.from(subscription)
		.where(eq(subscription.childId, childId));
	return hasPlanAccess(sub, now);
}

export async function getPlan(
	db: Database,
	childId: string,
	weekStart: string,
): Promise<StoredPlan | null> {
	const [row] = await db
		.select()
		.from(plan)
		.where(and(eq(plan.childId, childId), eq(plan.weekStart, weekStart)));
	if (!row) return null;
	const rows = await db
		.select()
		.from(planTask)
		.where(eq(planTask.planId, row.id))
		.orderBy(asc(planTask.day), asc(planTask.block));
	return {
		id: row.id,
		childId: row.childId,
		weekStart: row.weekStart,
		settings: row.settings as PlanSettings,
		coverage: row.coverage as Coverage,
		unplaced: row.unplaced as UnplacedHomework[],
		generatedAt: row.generatedAt,
		tasks: rows.map(toStoredTask),
	};
}

function toStoredTask(r: typeof planTask.$inferSelect): StoredTask {
	return {
		id: r.id,
		itemId: r.itemId ?? undefined,
		day: r.day,
		block: r.block,
		minutes: r.minutes,
		subject: r.subject,
		topic: r.topic,
		resource: r.resource,
		work: r.work,
		reason: { source: r.reasonSource, detail: r.reasonDetail },
		...(r.carriedOver ? { carriedOver: true } : {}),
		doneAt: r.doneAt,
	};
}

/** Saklanan planı motorun `WeeklyPlan` biçimine çevirir (taşıma gibi saf işlemler için). */
export function toWeeklyPlan(stored: StoredPlan): WeeklyPlan {
	const days = [...stored.settings.studyDays].sort((a, b) => a - b);
	return {
		weekStart: stored.weekStart,
		settings: stored.settings,
		days: days.map((day) => {
			const tasks = stored.tasks
				.filter((t) => t.day === day)
				.sort((a, b) => a.block - b.block)
				.map(({ doneAt: _doneAt, ...t }) => t);
			const totalMinutes = tasks.reduce((sum, t) => sum + t.minutes, 0);
			return {
				day,
				tasks,
				totalMinutes,
				idleMinutes: stored.settings.dailyBudgetMinutes - totalMinutes,
			};
		}),
		unplaced: stored.unplaced,
		coverage: stored.coverage,
	};
}

/** Kitap listelerini dönüşümlü birleştirir: A1, B1, A2, B2 ... (iki kitap da eşit öncelik alır). */
function interleave<T>(lists: readonly (readonly T[])[]): T[] {
	const out: T[] = [];
	const longest = Math.max(0, ...lists.map((l) => l.length));
	for (let i = 0; i < longest; i++) {
		for (const l of lists) {
			const item = l[i];
			if (item !== undefined) out.push(item);
		}
	}
	return out;
}

function selectedBooks(
	subject: Subject,
	grade: number,
	bookIds: readonly string[],
): SourceBook[] {
	return bookIds
		.map(bookById)
		.filter(
			(b): b is SourceBook => !!b && b.subject === subject && b.grade === grade,
		);
}

/**
 * Ödevin hafta içindeki günü (karar günlüğü K-015): teslim tarihinden önceki son çalışma günü;
 * teslim bu haftadan önceyse ilk çalışma günü; tarihsizse ilk çalışma günü; teslim sonraki
 * haftadaysa bu hafta planlanmaz.
 */
export function homeworkDay(
	weekStart: string,
	studyDays: readonly number[],
	dueDate: string | null,
): number | null {
	const days = [...studyDays].sort((a, b) => a - b);
	const first = days[0];
	if (first === undefined) return null;
	if (!dueDate || dueDate < weekStart) return first;
	if (dueDate > addDays(weekStart, 6)) return null;
	const dueWeekday = isoWeekday(dueDate);
	const onOrBefore = days.filter((d) => d <= dueWeekday);
	return onOrBefore.at(-1) ?? first;
}

export interface BuiltInput {
	settings: PlanSettings;
	weeklyTopics: Partial<Record<Subject, WorkItem[]>>;
	weakTopics: WorkItem[];
	reviewItems: WorkItem[];
	homework: EngineHomework[];
}

/** Planın girdilerini toplar (veritabanı okur, motoru çağırmaz). */
export async function buildInput(
	db: Database,
	c: ChildRow,
	weekStart: string,
	now: Date,
): Promise<BuiltInput> {
	const subjectRows = await db
		.select()
		.from(childSubject)
		.where(eq(childSubject.childId, c.id));
	const enabledByChild = SUBJECTS.filter(
		(s) => subjectRows.find((r) => r.subject === s)?.enabled ?? true,
	);
	// Soru hedefi varsa plan hedefin test karşılığıdır: yalnızca hedefli dersler planlanır, ders
	// ağırlığı ve günlük yük hedeften türer (ADR-0014: ücretsiz hedef, ücretli "hangi test").
	const goalRows = await db
		.select()
		.from(dailyGoal)
		.where(eq(dailyGoal.childId, c.id));
	const goals = new Map<Subject, number>(
		goalRows.map((g) => [g.subject, g.questions]),
	);
	const goalSubjects = enabledByChild.filter((s) => goals.has(s));
	const goalMode = goalSubjects.length > 0;
	const enabled = goalMode ? goalSubjects : enabledByChild;
	const dayTests: Partial<Record<Subject, number>> = {};
	const offsetOf = (s: Subject) =>
		subjectRows.find((r) => r.subject === s)?.weekOffset ?? 0;

	const sourceRows = await db
		.select()
		.from(childSource)
		.where(eq(childSource.childId, c.id))
		.orderBy(asc(childSource.createdAt), asc(childSource.bookId));
	const bookIds = sourceRows.map((r) => r.bookId);

	// Daha önce tamamlanan işler tekrar planlanmaz
	const doneRows = await db
		.select({
			itemId: planTask.itemId,
			doneAt: planTask.doneAt,
			subject: planTask.subject,
			topic: planTask.topic,
		})
		.from(planTask)
		.where(
			and(
				eq(planTask.childId, c.id),
				isNotNull(planTask.doneAt),
				isNotNull(planTask.itemId),
			),
		);
	const doneIds = new Set(
		doneRows.map((r) => r.itemId).filter((x): x is string => !!x),
	);

	// Geçen haftadan kalanlar (ADR-0005/0013: öncelik alır, görev sayısını artırmaz)
	const prev = await getPlan(db, c.id, addDays(weekStart, -7));
	const carried: WorkItem[] = prev
		? carryOver(
				toWeeklyPlan(prev),
				new Set(prev.tasks.filter((t) => t.doneAt).map((t) => t.id)),
			).filter((i) => !doneIds.has(i.id))
		: [];
	const carriedSource = new Map<string, string>(
		(prev?.tasks ?? [])
			.filter((t) => t.itemId)
			.map((t) => [t.itemId as string, t.reason.source]),
	);
	const carriedIds = new Set(carried.map((i) => i.id));

	const weeklyTopics: Partial<Record<Subject, WorkItem[]>> = {};
	const allItems: Partial<Record<Subject, WorkItem[]>> = {};
	for (const subject of enabled) {
		const books = selectedBooks(subject, c.grade, bookIds);
		const items = interleave(books.map(bookWorkItems));
		allItems[subject] = items;
		const goal = goals.get(subject);
		if (goalMode && goal) {
			dayTests[subject] = testsPerDay(
				goal,
				books.find((b) => b.questionsPerTest)?.questionsPerTest,
			);
		}
		const fresh = items.filter(
			(i) => !doneIds.has(i.id) && !carriedIds.has(i.id),
		);
		const curriculum = curriculumFor(subject, c.grade);
		const shifted = addDays(weekStart, -7 * offsetOf(subject));
		const week = curriculum ? weekFor(curriculum, shifted) : undefined;
		const pooled =
			curriculum && week ? weekPool(curriculum, week, fresh).items : fresh;
		const carriedWeekly = carried.filter(
			(i) =>
				i.subject === subject &&
				(carriedSource.get(i.id) ?? "weekly_topic") === "weekly_topic",
		);
		weeklyTopics[subject] = [...carriedWeekly, ...pooled];
	}

	// Zayıf konular: deneme analizinden, kitaplarda eşleşen yapılmamış testler
	const weakRows = await db
		.select({
			subject: examWeakTopic.subject,
			topic: examWeakTopic.topic,
			date: exam.date,
		})
		.from(examWeakTopic)
		.innerJoin(exam, eq(exam.id, examWeakTopic.examId))
		.where(eq(exam.childId, c.id));
	const weakCount = new Map<
		string,
		{ subject: Subject; topic: string; n: number }
	>();
	for (const r of weakRows) {
		const key = `${r.subject}|${normalizeTr(r.topic)}`;
		const prevEntry = weakCount.get(key);
		weakCount.set(key, {
			subject: r.subject,
			topic: r.topic,
			n: (prevEntry?.n ?? 0) + 1,
		});
	}
	const weak: WorkItem[] = [
		...carried.filter((i) => carriedSource.get(i.id) === "weak_topic"),
	];
	const weakIds = new Set(weak.map((i) => i.id));
	for (const w of [...weakCount.values()].sort((a, b) => b.n - a.n)) {
		if (!enabled.includes(w.subject)) continue;
		const key = normalizeTr(w.topic);
		const matches = (allItems[w.subject] ?? [])
			.filter(
				(i) =>
					!doneIds.has(i.id) &&
					!weakIds.has(i.id) &&
					normalizeTr(i.topic).includes(key),
			)
			.slice(0, 6);
		for (const m of matches) {
			weak.push(m);
			weakIds.add(m.id);
		}
	}

	// Aralıklı tekrar: 2-4 hafta önce çalışılan konuların yapılmamış testleri (yoksa kendisi)
	const from = new Date(now.getTime() - 28 * 86_400_000);
	const to = new Date(now.getTime() - 14 * 86_400_000);
	const reviewRows = doneRows.filter(
		(r) => r.doneAt && r.doneAt >= from && r.doneAt <= to,
	);
	const review: WorkItem[] = carried.filter(
		(i) => carriedSource.get(i.id) === "spaced_review",
	);
	const reviewIds = new Set(review.map((i) => i.id));
	const topicsSeen = new Set<string>();
	for (const r of reviewRows) {
		const key = `${r.subject}|${normalizeTr(r.topic)}`;
		if (topicsSeen.has(key) || !enabled.includes(r.subject)) continue;
		topicsSeen.add(key);
		const items = allItems[r.subject] ?? [];
		const fresh = items
			.filter(
				(i) =>
					!doneIds.has(i.id) &&
					!reviewIds.has(i.id) &&
					normalizeTr(i.topic) === normalizeTr(r.topic),
			)
			.slice(0, 3);
		const picks =
			fresh.length > 0
				? fresh
				: items.filter((i) => i.id === r.itemId).slice(0, 1);
		for (const p of picks) {
			review.push(p);
			reviewIds.add(p.id);
		}
	}

	// Ödevler: açık olanlar hafta içindeki güne yerleşir
	const hwRows = await db
		.select()
		.from(homework)
		.where(and(eq(homework.childId, c.id), isNull(homework.doneAt)));
	const studyDays = c.studyDays;
	const engineHomework: EngineHomework[] = [];
	for (const h of hwRows) {
		const day = homeworkDay(weekStart, studyDays, h.dueDate);
		if (day === null) continue;
		engineHomework.push({
			id: h.id,
			day,
			subject: h.subject,
			topic: h.title,
			work: h.description?.trim() ? h.description : h.title,
		});
	}

	const dayBlocks = Object.values(dayTests).reduce((n, x) => n + (x ?? 0), 0);
	return {
		settings: {
			weekStart,
			studyDays,
			dailyBudgetMinutes: goalMode
				? Math.max(1, dayBlocks) * c.blockMinutes
				: c.dailyBudgetMinutes,
			blockMinutes: c.blockMinutes,
			subjects: enabled,
			idleTime: c.idleTime,
			...(goalMode ? { dailyTests: dayTests } : {}),
		},
		weeklyTopics,
		weakTopics: weak,
		reviewItems: review,
		homework: engineHomework,
	};
}

/** Planı üretir ve saklar. O hafta için plan varsa dokunmaz (hafta içinde plan sabittir, ADR-0005). */
export async function ensurePlan(
	db: Database,
	c: ChildRow,
	weekStart: string,
	now: Date,
): Promise<StoredPlan> {
	const existing = await getPlan(db, c.id, weekStart);
	if (existing) return existing;

	const input = await buildInput(db, c, weekStart, now);
	const result = generateWeeklyPlan(input);

	await db.transaction(async (tx) => {
		const [row] = await tx
			.insert(plan)
			.values({
				childId: c.id,
				weekStart,
				settings: result.settings,
				coverage: result.coverage,
				unplaced: result.unplaced,
			})
			.onConflictDoNothing()
			.returning();
		if (!row) return; // başka bir istek aynı planı kurdu
		const tasks = result.days.flatMap((d) => d.tasks);
		if (tasks.length > 0) {
			await tx.insert(planTask).values(
				tasks.map((t) => ({
					planId: row.id,
					childId: c.id,
					day: t.day,
					block: t.block,
					minutes: t.minutes,
					subject: t.subject,
					topic: t.topic,
					resource: t.resource,
					work: t.work,
					reasonSource: t.reason.source,
					reasonDetail: t.reason.detail,
					itemId: t.itemId ?? null,
					carriedOver: t.carriedOver ?? false,
				})),
			);
		}
	});
	const stored = await getPlan(db, c.id, weekStart);
	if (!stored) throw new Error("Plan kaydedilemedi");
	return stored;
}

/** Hiç görev işaretlenmemiş planı silip yeniden kurar (ayarlar değiştiyse; karar günlüğü K-014). */
export async function rebuildPlan(
	db: Database,
	c: ChildRow,
	weekStart: string,
	now: Date,
): Promise<StoredPlan | "has_progress"> {
	const existing = await getPlan(db, c.id, weekStart);
	if (existing?.tasks.some((t) => t.doneAt)) return "has_progress";
	if (existing) await db.delete(plan).where(eq(plan.id, existing.id));
	return ensurePlan(db, c, weekStart, now);
}

/** Görevi işaretler; ödev görevi ise ödev kaydını da eşitler. */
export async function setTaskDone(
	db: Database,
	childId: string,
	task: StoredTask,
	planId: string,
	done: boolean,
	actorUserId: string,
	now: Date,
): Promise<void> {
	await db.transaction(async (tx) => {
		await tx
			.update(planTask)
			.set({ doneAt: done ? now : null })
			.where(eq(planTask.id, task.id));
		// Test işaretlenince testin soru sayısı o günün sayacına eklenir, geri alınınca düşer
		// (tek ilerleme ölçüsü çözülen sorudur). İki kez işaretlemek ikinci kez eklemez.
		const questions = questionsForItem(task.itemId);
		if (questions && done !== (task.doneAt !== null)) {
			const day = istanbulDate(done ? now : (task.doneAt ?? now));
			if (done) {
				await tx
					.insert(questionLog)
					.values({
						childId: childId,
						subject: task.subject,
						day,
						solved: Math.min(1000, questions),
						loggedByUserId: actorUserId,
					})
					.onConflictDoUpdate({
						target: [questionLog.childId, questionLog.subject, questionLog.day],
						set: {
							solved: sql`least(1000, ${questionLog.solved} + ${questions})`,
							loggedByUserId: actorUserId,
						},
					});
			} else {
				await tx
					.update(questionLog)
					.set({
						solved: sql`greatest(0, ${questionLog.solved} - ${questions})`,
					})
					.where(
						and(
							eq(questionLog.childId, childId),
							eq(questionLog.subject, task.subject),
							eq(questionLog.day, day),
						),
					);
			}
		}
		if (task.itemId?.startsWith("hw:")) {
			await tx
				.update(homework)
				.set({
					doneAt: done ? now : null,
					doneByUserId: done ? actorUserId : null,
				})
				.where(eq(homework.id, task.itemId.slice(3)));
		}
		await tx.insert(planEvent).values({
			planId,
			taskId: task.id,
			kind: done ? "done" : "undone",
			actorUserId,
		});
	});
}

/** Ödev işaretlenince, plandaki bağlı görevi de eşitler. */
export async function syncHomeworkTask(
	db: Database,
	homeworkId: string,
	done: boolean,
	now: Date,
): Promise<void> {
	await db
		.update(planTask)
		.set({ doneAt: done ? now : null })
		.where(eq(planTask.itemId, `hw:${homeworkId}`));
}

export type MovePersistResult =
	| { ok: true; displacedTaskId?: string }
	| {
			ok: false;
			reason: "no_capacity" | "not_study_day" | "same_day" | "unknown_task";
	  };

/** Hafta içi taşıma (ADR-0013 madde 6): kullanıcı eylemi, geçmişe yazılır. */
export async function moveTaskPersist(
	db: Database,
	stored: StoredPlan,
	taskId: string,
	toDay: number,
	actorUserId: string,
): Promise<MovePersistResult> {
	const task = stored.tasks.find((t) => t.id === taskId);
	const result = moveTask(toWeeklyPlan(stored), taskId, toDay);
	if (!result.ok) return result;

	const kept = new Set(
		result.plan.days.flatMap((d) => d.tasks.map((t) => t.id)),
	);
	const displacedId = stored.tasks.find((t) => !kept.has(t.id))?.id;
	await db.transaction(async (tx) => {
		for (const d of result.plan.days) {
			for (const t of d.tasks) {
				await tx
					.update(planTask)
					.set({ day: t.day, block: t.block })
					.where(eq(planTask.id, t.id));
			}
		}
		if (displacedId) {
			await tx.delete(planTask).where(eq(planTask.id, displacedId));
			await tx.insert(planEvent).values({
				planId: stored.id,
				taskId: displacedId,
				kind: "displaced",
				actorUserId,
				fromDay: toDay,
			});
		}
		await tx
			.update(plan)
			.set({ coverage: result.plan.coverage })
			.where(eq(plan.id, stored.id));
		await tx.insert(planEvent).values({
			planId: stored.id,
			taskId,
			kind: "move",
			actorUserId,
			fromDay: task?.day ?? null,
			toDay,
		});
	});
	return { ok: true, displacedTaskId: displacedId };
}

/** Bir dönemdeki tamamlama sayıları: plan görevleri (ödev hariç) + ödevler (ADR-0016). */
export async function completionStats(
	db: Database,
	childId: string,
	start: string,
	end: string,
): Promise<{ done: number; total: number }> {
	const taskDate = sql`(${plan.weekStart} + (${planTask.day} - 1))`;
	const [tasks] = await db
		.select({
			total: sql<number>`count(*)::int`,
			done: sql<number>`count(${planTask.doneAt})::int`,
		})
		.from(planTask)
		.innerJoin(plan, eq(plan.id, planTask.planId))
		.where(
			and(
				eq(planTask.childId, childId),
				sql`${planTask.reasonSource} <> 'homework'`,
				sql`${taskDate} between ${start}::date and ${end}::date`,
			),
		);
	const hwDate = sql`coalesce(${homework.dueDate}, (${homework.createdAt})::date)`;
	const [hw] = await db
		.select({
			total: sql<number>`count(*)::int`,
			done: sql<number>`count(${homework.doneAt})::int`,
		})
		.from(homework)
		.where(
			and(
				eq(homework.childId, childId),
				sql`${hwDate} between ${start}::date and ${end}::date`,
			),
		);
	let done = (tasks?.done ?? 0) + (hw?.done ?? 0);
	let total = (tasks?.total ?? 0) + (hw?.total ?? 0);
	// Planı olmayan (ücretsiz) çocukta ödül, günlük soru hedefini tutturmaktan beslenir: hedefli her
	// ders-gün bir birimdir, o gün çözülen soru hedefe ulaştıysa tamamlanmıştır. Plan varken
	// görevler zaten hedefin test karşılığıdır, çift sayılmasın diye hedef birimleri eklenmez.
	if ((tasks?.total ?? 0) === 0) {
		const goal = await goalCompletion(db, childId, start, end);
		done += goal.done;
		total += goal.total;
	}
	return { done, total };
}

async function goalCompletion(
	db: Database,
	childId: string,
	start: string,
	end: string,
): Promise<{ done: number; total: number }> {
	const goals = await db
		.select()
		.from(dailyGoal)
		.where(eq(dailyGoal.childId, childId));
	if (goals.length === 0) return { done: 0, total: 0 };
	const [kid] = await db
		.select({ studyDays: childTable.studyDays })
		.from(childTable)
		.where(eq(childTable.id, childId));
	const studyDays = new Set(kid?.studyDays ?? [1, 2, 3, 4, 5, 6]);
	const logs = await db
		.select()
		.from(questionLog)
		.where(
			and(
				eq(questionLog.childId, childId),
				sql`${questionLog.day} between ${start}::date and ${end}::date`,
			),
		);
	let done = 0;
	let total = 0;
	for (let d = start; d <= end; d = addDays(d, 1)) {
		if (!studyDays.has(isoWeekday(d))) continue;
		for (const g of goals) {
			total++;
			const solved =
				logs.find((l) => l.day === d && l.subject === g.subject)?.solved ?? 0;
			if (solved >= g.questions) done++;
		}
	}
	return { done, total };
}
