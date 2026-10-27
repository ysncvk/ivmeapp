/**
 * Veli raporu verisi (ADR-0006/0008): soru kayıtları, plan görevleri, ödev ve deneme tek yerde
 * toplanır, hesap ve metin çekirdekteki saf fonksiyondadır (`weekReport`).
 */
import {
	addDays,
	istanbulDate,
	net,
	type ReportDay,
	type Subject,
	type WeekReport,
	weekLabel as weekLabelOf,
	weekReport,
} from "@ivmeapp/core";
import type { Database } from "@ivmeapp/db";
import {
	type child,
	dailyGoal,
	exam,
	examSubject,
	homework,
	plan,
	planTask,
	questionLog,
} from "@ivmeapp/db/schema/domain";
import { and, asc, desc, eq, gte, lte } from "drizzle-orm";

import { getPlan } from "./plan";

type ChildRow = typeof child.$inferSelect;

export interface ExamPoint {
	id: string;
	name: string;
	date: string;
	netTotal: number;
	subjects: { subject: Subject; net: number }[];
}

const round1 = (n: number) => Math.round(n * 10) / 10;

/** Çocuğun denemeleri, eskiden yeniye; net = doğru − yanlış/3 (ADR-0015). */
export async function examPoints(
	db: Database,
	childId: string,
	limit = 12,
): Promise<ExamPoint[]> {
	const exams = await db
		.select()
		.from(exam)
		.where(eq(exam.childId, childId))
		.orderBy(desc(exam.date))
		.limit(limit);
	const out: ExamPoint[] = [];
	for (const e of exams) {
		const rows = await db
			.select()
			.from(examSubject)
			.where(eq(examSubject.examId, e.id));
		const subjects = rows.map((r) => ({
			subject: r.subject,
			net: round1(net(r.correct, r.wrong)),
		}));
		out.push({
			id: e.id,
			name: e.name,
			date: e.date,
			netTotal: round1(subjects.reduce((n, s) => n + s.net, 0)),
			subjects,
		});
	}
	return out.reverse();
}

export interface WeekReportView extends WeekReport {
	weekStart: string;
	label: string;
	days: (ReportDay & { weekday: number })[];
	subjects: { subject: Subject; goal: number; solved: number }[];
}

export async function buildWeekReport(
	db: Database,
	c: ChildRow,
	weekStart: string,
	now: Date,
): Promise<WeekReportView> {
	const today = istanbulDate(now);
	const weekEnd = addDays(weekStart, 6);
	const prevStart = addDays(weekStart, -7);

	const goals = await db
		.select()
		.from(dailyGoal)
		.where(eq(dailyGoal.childId, c.id));
	const goalTotal = goals.reduce((n, g) => n + g.questions, 0);
	const logs = await db
		.select()
		.from(questionLog)
		.where(
			and(
				eq(questionLog.childId, c.id),
				gte(questionLog.day, prevStart),
				lte(questionLog.day, weekEnd),
			),
		);
	const stored = await getPlan(db, c.id, weekStart);
	const studyDays = new Set(c.studyDays);

	const days = Array.from({ length: 7 }, (_, i) => {
		const date = addDays(weekStart, i);
		const studyDay = studyDays.has(i + 1);
		const tasks = (stored?.tasks ?? []).filter(
			(t) => t.day === i + 1 && t.reason.source !== "homework",
		);
		return {
			weekday: i + 1,
			date,
			studyDay,
			goal: studyDay ? goalTotal : 0,
			solved: logs
				.filter((l) => l.day === date)
				.reduce((n, l) => n + l.solved, 0),
			tasksDone: tasks.filter((t) => t.doneAt).length,
			tasksTotal: tasks.length,
		};
	});

	const studySoFar = days.filter((d) => d.studyDay && d.date <= today).length;
	const subjects = goals.map((g) => ({
		subject: g.subject,
		goal: g.questions * studySoFar,
		solved: logs
			.filter(
				(l) =>
					l.subject === g.subject &&
					l.day >= weekStart &&
					l.day <= weekEnd &&
					l.day <= today,
			)
			.reduce((n, l) => n + l.solved, 0),
	}));

	const prevRows = logs.filter((l) => l.day < weekStart);
	const previousSolved =
		prevRows.length > 0 ? prevRows.reduce((n, l) => n + l.solved, 0) : null;

	const hwRows = await db
		.select()
		.from(homework)
		.where(eq(homework.childId, c.id));
	const weekStartMs =
		new Date(`${weekStart}T00:00:00Z`).getTime() - 3 * 3_600_000;
	const weekEndMs = weekStartMs + 7 * 86_400_000;
	const hw = {
		done: hwRows.filter(
			(h) =>
				h.doneAt &&
				h.doneAt.getTime() >= weekStartMs &&
				h.doneAt.getTime() < weekEndMs,
		).length,
		open: hwRows.filter((h) => !h.doneAt).length,
		overdue: hwRows.filter((h) => !h.doneAt && h.dueDate && h.dueDate < today)
			.length,
	};

	const points = await examPoints(db, c.id, 2);
	const last = points.at(-1);
	const before = points.at(-2);

	const report = weekReport({
		name: c.displayName,
		weekStart,
		today,
		days,
		subjects,
		previousSolved,
		homework: hw,
		exam: last
			? {
					name: last.name,
					netTotal: last.netTotal,
					netDelta: before ? round1(last.netTotal - before.netTotal) : null,
				}
			: undefined,
	});
	return {
		...report,
		weekStart,
		label: weekLabelOf(weekStart),
		days,
		subjects,
	};
}

export interface HistoryWeek {
	weekStart: string;
	solved: number;
	goal: number;
	tasksDone: number;
	tasksTotal: number;
}

/** Son N haftanın soru ve test toplamları, eskiden yeniye (güncel hafta bugüne kadar). */
export async function weeklyHistory(
	db: Database,
	c: ChildRow,
	currentWeekStart: string,
	today: string,
	weeks = 8,
): Promise<HistoryWeek[]> {
	const first = addDays(currentWeekStart, -7 * (weeks - 1));
	const end = addDays(currentWeekStart, 6);
	const goals = await db
		.select()
		.from(dailyGoal)
		.where(eq(dailyGoal.childId, c.id));
	const goalTotal = goals.reduce((n, g) => n + g.questions, 0);
	const logs = await db
		.select()
		.from(questionLog)
		.where(
			and(
				eq(questionLog.childId, c.id),
				gte(questionLog.day, first),
				lte(questionLog.day, end),
			),
		);
	const tasks = await db
		.select({
			weekStart: plan.weekStart,
			doneAt: planTask.doneAt,
			source: planTask.reasonSource,
		})
		.from(planTask)
		.innerJoin(plan, eq(plan.id, planTask.planId))
		.where(
			and(
				eq(planTask.childId, c.id),
				gte(plan.weekStart, first),
				lte(plan.weekStart, end),
			),
		)
		.orderBy(asc(plan.weekStart));
	const studyDays = new Set(c.studyDays);
	return Array.from({ length: weeks }, (_, k) => {
		const weekStart = addDays(first, 7 * k);
		const weekTasks = tasks.filter(
			(t) => t.weekStart === weekStart && t.source !== "homework",
		);
		let goal = 0;
		for (let i = 0; i < 7; i++) {
			const date = addDays(weekStart, i);
			if (studyDays.has(i + 1) && date <= today) goal += goalTotal;
		}
		return {
			weekStart,
			solved: logs
				.filter((l) => l.day >= weekStart && l.day <= addDays(weekStart, 6))
				.reduce((n, l) => n + l.solved, 0),
			goal,
			tasksDone: weekTasks.filter((t) => t.doneAt).length,
			tasksTotal: weekTasks.length,
		};
	});
}
