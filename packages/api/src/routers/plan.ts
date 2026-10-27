import { addDays, isoWeekday, istanbulDate, mondayOf } from "@ivmeapp/core";
import { homework, plan, planTask } from "@ivmeapp/db/schema/domain";
import { ORPCError } from "@orpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { resolveFamilyChild, resolveGuardianChild } from "../authz";
import { type Context, clock } from "../context";
import { familyProcedure, guardianProcedure } from "../index";
import {
	childHasPlanAccess,
	ensurePlan,
	getPlan,
	moveTaskPersist,
	rebuildPlan,
	type StoredPlan,
	type StoredTask,
	setTaskDone,
} from "../services/plan";
import { rewardOverview } from "../services/rewards";

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

function access(context: Context, childId: string): Promise<boolean> {
	return childHasPlanAccess(context.db, childId, clock(context));
}

const taskView = (t: StoredTask) => ({
	id: t.id,
	day: t.day,
	block: t.block,
	minutes: t.minutes,
	subject: t.subject,
	topic: t.topic,
	resource: t.resource,
	work: t.work,
	reason: t.reason,
	carriedOver: t.carriedOver ?? false,
	done: t.doneAt !== null,
});

function planView(stored: StoredPlan) {
	const days = [...stored.settings.studyDays].sort((a, b) => a - b);
	return {
		id: stored.id,
		weekStart: stored.weekStart,
		settings: stored.settings,
		days: days.map((day) => ({
			day,
			date: addDays(stored.weekStart, day - 1),
			tasks: stored.tasks.filter((t) => t.day === day).map(taskView),
			idle: undefined,
		})),
		unplaced: stored.unplaced,
		// Kapsama raporu: veliye "bu ayarlarla şu konulara yetişilmeyebilir" uyarısının kaynağı (ADR-0013)
		coverage: {
			cutCount: stored.coverage.cut.length,
			subjectDays: stored.coverage.subjectDays,
			// Soru hedefi varken planda olmayan ders bilinçli bir tercihtir: "ders kapalı" uyarısı gürültü
			warnings: stored.settings.dailyTests
				? stored.coverage.warnings.filter((w) => w.code !== "subject_off")
				: stored.coverage.warnings,
		},
	};
}

export const planRouter = {
	/** Haftalık plan. Ücretli yetki yoksa kilitli döner (ödev takibi ve teşhis ücretsizdir, ADR-0014). */
	week: familyProcedure
		.input(
			z.object({
				childId: z.string().optional(),
				weekStart: isoDate.optional(),
			}),
		)
		.handler(async ({ context, input }) => {
			const { child } = await resolveFamilyChild(context, input.childId);
			const now = clock(context);
			const weekStart = mondayOf(input.weekStart ?? istanbulDate(now));
			if (!(await access(context, child.id))) {
				return { weekStart, locked: true as const, plan: null };
			}
			const stored = await ensurePlan(context.db, child, weekStart, now);
			return { weekStart, locked: false as const, plan: planView(stored) };
		}),

	/** Öğrencinin "bugünün görevleri" ekranı: görevler + ödevler + ödül ilerlemesi. */
	today: familyProcedure
		.input(z.object({ childId: z.string().optional() }))
		.handler(async ({ context, input }) => {
			const { child } = await resolveFamilyChild(context, input.childId);
			const now = clock(context);
			const today = istanbulDate(now);
			const weekStart = mondayOf(today);
			const paid = await access(context, child.id);

			let tasks: ReturnType<typeof taskView>[] = [];
			let linkedHomework = new Set<string>();
			if (paid) {
				const stored = await ensurePlan(context.db, child, weekStart, now);
				const weekday = isoWeekday(today);
				tasks = stored.tasks.filter((t) => t.day === weekday).map(taskView);
				linkedHomework = new Set(
					stored.tasks
						.filter((t) => t.itemId?.startsWith("hw:"))
						.map((t) => (t.itemId as string).slice(3)),
				);
			}
			const hwRows = await context.db
				.select()
				.from(homework)
				.where(eq(homework.childId, child.id));
			const open = hwRows
				.filter((h) => !linkedHomework.has(h.id))
				.filter((h) => h.doneAt === null || (h.dueDate ?? "") >= today)
				.sort((a, b) =>
					(a.dueDate ?? "9999").localeCompare(b.dueDate ?? "9999"),
				);
			return {
				date: today,
				weekday: isoWeekday(today),
				child: { id: child.id, displayName: child.displayName },
				locked: !paid,
				tasks,
				homework: open.map((h) => ({
					id: h.id,
					subject: h.subject,
					title: h.title,
					description: h.description,
					dueDate: h.dueDate,
					source: h.source,
					done: h.doneAt !== null,
				})),
				rewards: await rewardOverview(context.db, child.id, today),
			};
		}),

	toggleTask: familyProcedure
		.input(
			z.object({
				childId: z.string().optional(),
				taskId: z.string(),
				done: z.boolean(),
			}),
		)
		.handler(async ({ context, input }) => {
			const { child, viewer } = await resolveFamilyChild(
				context,
				input.childId,
			);
			const [row] = await context.db
				.select()
				.from(planTask)
				.where(
					and(eq(planTask.id, input.taskId), eq(planTask.childId, child.id)),
				);
			if (!row) throw new ORPCError("NOT_FOUND");
			const stored = await getPlanById(context, row.planId, child.id);
			const task = stored?.tasks.find((t) => t.id === row.id);
			if (!stored || !task) throw new ORPCError("NOT_FOUND");
			await setTaskDone(
				context.db,
				child.id,
				task,
				stored.id,
				input.done,
				viewer.userId,
				clock(context),
			);
			return { ok: true, done: input.done };
		}),

	/** Hafta içi taşıma (ADR-0013 madde 6): çocuk ya da veli, yalnızca ücretli planda. */
	moveTask: familyProcedure
		.input(
			z.object({
				childId: z.string().optional(),
				taskId: z.string(),
				toDay: z.number().int().min(1).max(7),
			}),
		)
		.handler(async ({ context, input }) => {
			const { child, viewer } = await resolveFamilyChild(
				context,
				input.childId,
			);
			if (!(await access(context, child.id))) {
				throw new ORPCError("PAYMENT_REQUIRED", { message: "plan_locked" });
			}
			const [row] = await context.db
				.select()
				.from(planTask)
				.where(
					and(eq(planTask.id, input.taskId), eq(planTask.childId, child.id)),
				);
			if (!row) throw new ORPCError("NOT_FOUND");
			if (row.doneAt)
				throw new ORPCError("BAD_REQUEST", { message: "task_done" });
			const stored = await getPlanById(context, row.planId, child.id);
			if (!stored) throw new ORPCError("NOT_FOUND");
			const result = await moveTaskPersist(
				context.db,
				stored,
				input.taskId,
				input.toDay,
				viewer.userId,
			);
			if (!result.ok)
				throw new ORPCError("BAD_REQUEST", { message: result.reason });
			return { ok: true, displacedTaskId: result.displacedTaskId ?? null };
		}),

	/** Ayarlar değiştiyse ve hiçbir görev işaretlenmediyse bu haftanın planını yeniden kurar. */
	rebuild: guardianProcedure
		.input(z.object({ childId: z.string(), weekStart: isoDate.optional() }))
		.handler(async ({ context, input }) => {
			const child = await resolveGuardianChild(context, input.childId);
			if (!(await access(context, child.id))) {
				throw new ORPCError("PAYMENT_REQUIRED", { message: "plan_locked" });
			}
			const now = clock(context);
			const weekStart = mondayOf(input.weekStart ?? istanbulDate(now));
			const result = await rebuildPlan(context.db, child, weekStart, now);
			if (result === "has_progress") {
				throw new ORPCError("CONFLICT", { message: "has_progress" });
			}
			return { ok: true, weekStart };
		}),
};

async function getPlanById(context: Context, planId: string, childId: string) {
	const [p] = await context.db
		.select({ weekStart: plan.weekStart })
		.from(plan)
		.where(and(eq(plan.id, planId), eq(plan.childId, childId)));
	if (!p) return null;
	return getPlan(context.db, childId, p.weekStart);
}
