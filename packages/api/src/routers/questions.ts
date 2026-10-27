import { addDays, istanbulDate, mondayOf, type Subject } from "@ivmeapp/core";
import { childSource, dailyGoal, questionLog } from "@ivmeapp/db/schema/domain";
import { ORPCError } from "@orpc/server";
import { and, eq, gte, lte } from "drizzle-orm";
import { z } from "zod";

import { resolveFamilyChild, resolveGuardianChild } from "../authz";
import { bookById, SUBJECTS } from "../catalog";
import { type Context, clock } from "../context";
import { familyProcedure, guardianProcedure } from "../index";

const subject = z.enum(SUBJECTS);
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

/** Geriye dönük düzeltme penceresi: bir hafta öncesine kadar işaretlenebilir. */
const BACKFILL_DAYS = 6;

/**
 * Basit mod: veli ders başına günlük soru hedefi koyar, çocuk (ya da veli) o gün çözülen soru
 * sayısını yazar. Ücretli plandan bağımsızdır ve her zaman açıktır. Çocuğun seçtiği kitap
 * varsa hedef, kitabın test başına soru sayısından "yaklaşık kaç test" olarak da gösterilir.
 */
export const questionsRouter = {
	overview: familyProcedure
		.input(z.object({ childId: z.string().optional() }))
		.handler(async ({ context, input }) => {
			const { child } = await resolveFamilyChild(context, input.childId);
			const today = istanbulDate(clock(context));
			const weekStart = mondayOf(today);
			const weekEnd = addDays(weekStart, 6);

			const goalRows = await context.db
				.select()
				.from(dailyGoal)
				.where(eq(dailyGoal.childId, child.id));
			const logRows = await context.db
				.select()
				.from(questionLog)
				.where(
					and(
						eq(questionLog.childId, child.id),
						gte(questionLog.day, weekStart),
						lte(questionLog.day, weekEnd),
					),
				);
			const sources = await context.db
				.select()
				.from(childSource)
				.where(eq(childSource.childId, child.id));

			const goalOf = new Map<Subject, number>(
				goalRows.map((g) => [g.subject, g.questions]),
			);
			const testSize = (s: Subject): number | null => {
				for (const src of sources) {
					const book = bookById(src.bookId);
					if (book?.subject === s && book.questionsPerTest) {
						return book.questionsPerTest;
					}
				}
				return null;
			};

			const subjects = SUBJECTS.filter((s) => goalOf.has(s)).map((s) => {
				const goal = goalOf.get(s) ?? 0;
				const size = testSize(s);
				return {
					subject: s,
					goal,
					solvedToday:
						logRows.find((l) => l.subject === s && l.day === today)?.solved ??
						0,
					tests: size ? Math.ceil(goal / size) : null,
				};
			});

			const goalTotal = subjects.reduce((n, s) => n + s.goal, 0);
			const studyDays = new Set(child.studyDays);
			const days = Array.from({ length: 7 }, (_, i) => {
				const date = addDays(weekStart, i);
				const studyDay = studyDays.has(i + 1);
				return {
					day: i + 1,
					date,
					studyDay,
					goal: studyDay ? goalTotal : 0,
					// Hedef gününe sayılmayan günde çözülen soru da toplama girer
					solved: logRows
						.filter((l) => l.day === date)
						.reduce((n, l) => n + l.solved, 0),
				};
			});

			return {
				date: today,
				weekStart,
				subjects,
				days,
				week: {
					goal: days.reduce((n, d) => n + d.goal, 0),
					solved: days.reduce((n, d) => n + d.solved, 0),
				},
			};
		}),

	/** Veli: ders başına günlük hedefi belirler. 0 hedefi kaldırır. */
	setGoals: guardianProcedure
		.input(
			z.object({
				childId: z.string(),
				goals: z
					.array(
						z.object({ subject, questions: z.number().int().min(0).max(500) }),
					)
					.max(SUBJECTS.length),
			}),
		)
		.handler(async ({ context, input }) => {
			const child = await resolveGuardianChild(context, input.childId);
			await context.db.transaction(async (tx) => {
				for (const g of input.goals) {
					if (g.questions === 0) {
						await tx
							.delete(dailyGoal)
							.where(
								and(
									eq(dailyGoal.childId, child.id),
									eq(dailyGoal.subject, g.subject),
								),
							);
					} else {
						await tx
							.insert(dailyGoal)
							.values({
								childId: child.id,
								subject: g.subject,
								questions: g.questions,
							})
							.onConflictDoUpdate({
								target: [dailyGoal.childId, dailyGoal.subject],
								set: { questions: g.questions },
							});
					}
				}
			});
			return { ok: true };
		}),

	/** Çocuk ya da veli: bir günde bir derste çözülen soru sayısını yazar (toplama değil, değiştirme). */
	log: familyProcedure
		.input(
			z.object({
				childId: z.string().optional(),
				subject,
				solved: z.number().int().min(0).max(1000),
				date: isoDate.optional(),
			}),
		)
		.handler(async ({ context, input }) => {
			const { child, viewer } = await resolveFamilyChild(
				context,
				input.childId,
			);
			const today = istanbulDate(clock(context));
			const day = input.date ?? today;
			if (day > today || day < addDays(today, -BACKFILL_DAYS)) {
				throw new ORPCError("BAD_REQUEST", { message: "date_out_of_range" });
			}
			await assertHasGoal(context, child.id, input.subject);
			await context.db
				.insert(questionLog)
				.values({
					childId: child.id,
					subject: input.subject,
					day,
					solved: input.solved,
					loggedByUserId: viewer.userId,
				})
				.onConflictDoUpdate({
					target: [questionLog.childId, questionLog.subject, questionLog.day],
					set: { solved: input.solved, loggedByUserId: viewer.userId },
				});
			return { ok: true, solved: input.solved };
		}),
};

/** Hedefi olmayan derse kayıt yazılmaz; arayüz zaten yalnızca hedefli dersleri gösterir. */
async function assertHasGoal(context: Context, childId: string, s: Subject) {
	const [row] = await context.db
		.select({ questions: dailyGoal.questions })
		.from(dailyGoal)
		.where(and(eq(dailyGoal.childId, childId), eq(dailyGoal.subject, s)));
	if (!row) throw new ORPCError("BAD_REQUEST", { message: "no_goal" });
}
