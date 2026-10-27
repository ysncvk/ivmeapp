import {
	addDays,
	istanbulDate,
	mondayOf,
	periodFor,
	type Subject,
	weekFor,
} from "@ivmeapp/core";
import { bookRequest, childSubject } from "@ivmeapp/db/schema/domain";
import { ORPCError } from "@orpc/server";
import { count, eq } from "drizzle-orm";
import { z } from "zod";
import {
	resolveFamilyChild,
	resolveGuardianChild as resolveOwnChild,
} from "../authz";
import { allBooks, curriculumFor, SUBJECTS } from "../catalog";
import { clock } from "../context";
import {
	familyProcedure,
	guardianProcedure,
	protectedProcedure,
} from "../index";
import { childHasPlanAccess } from "../services/plan";

export const libraryRouter = {
	/** Kütüphanedeki kaynaklar (yalnızca olgusal yapı, ADR-0004). */
	catalog: protectedProcedure.handler(() =>
		allBooks().map((b) => ({
			id: b.id,
			title: b.title,
			subject: b.subject,
			grade: b.grade,
			kind: b.kind,
			testCount: b.sections.reduce(
				(n, s) => n + s.units.reduce((m, u) => m + u.tests.length, 0),
				0,
			),
		})),
	),

	/** "Okulda şu an neredeyiz": ders başına müfredattaki hafta (okulun temposuna göre kaydırılmış). */
	curriculumStatus: familyProcedure
		.input(
			z.object({ childId: z.string().optional(), date: z.string().optional() }),
		)
		.handler(async ({ context, input }) => {
			const { child } = await resolveFamilyChild(context, input.childId);
			const rows = await context.db
				.select()
				.from(childSubject)
				.where(eq(childSubject.childId, child.id));
			const date = mondayOf(input.date ?? istanbulDate(clock(context)));
			return SUBJECTS.map((subject) => {
				const curriculum = curriculumFor(subject as Subject, child.grade);
				const offset = rows.find((r) => r.subject === subject)?.weekOffset ?? 0;
				if (!curriculum) return { subject, hasCurriculum: false as const };
				const shifted = addDays(date, -7 * offset);
				const week = weekFor(curriculum, shifted);
				const onBreak = periodFor(curriculum.breaks, shifted);
				return {
					subject,
					hasCurriculum: true as const,
					weekOffset: offset,
					week: week
						? {
								number: week.week,
								start: week.start,
								end: week.end,
								unitTitles: week.unitIds
									.map((id) => curriculum.units.find((u) => u.id === id)?.title)
									.filter((t): t is string => !!t),
								topics: week.topics,
								outcomes: week.outcomes.map((o) => ({
									code: o.code,
									title: o.title,
								})),
							}
						: null,
					onBreak: onBreak?.title ?? null,
				};
			});
		}),
};

/**
 * Aylık konu haritası (ADR-0013 madde 8, ücretli): önümüzdeki 4 haftanın konuları, ders başına.
 * Somut görevler (kaynak, sayfa, test) haritada yoktur; her hafta başında son denemeye göre üretilir.
 */
export const topicMapRouter = {
	topicMap: guardianProcedure
		.input(z.object({ childId: z.string() }))
		.handler(async ({ context, input }) => {
			const child = await resolveOwnChild(context, input.childId);
			const now = clock(context);
			if (!(await childHasPlanAccess(context.db, child.id, now))) {
				return { locked: true as const, weeks: [] };
			}
			const rows = await context.db
				.select()
				.from(childSubject)
				.where(eq(childSubject.childId, child.id));
			const monday = mondayOf(istanbulDate(now));
			const weeks = Array.from({ length: 4 }, (_, i) => {
				const weekStart = addDays(monday, 7 * i);
				const subjects = SUBJECTS.flatMap((subject) => {
					const row = rows.find((r) => r.subject === subject);
					if (row && !row.enabled) return [];
					const curriculum = curriculumFor(subject as Subject, child.grade);
					if (!curriculum) return [];
					const shifted = addDays(weekStart, -7 * (row?.weekOffset ?? 0));
					const week = weekFor(curriculum, shifted);
					const onBreak = periodFor(curriculum.breaks, shifted);
					return [
						{
							subject,
							topics: week?.topics ?? [],
							units: (week?.unitIds ?? []).flatMap((id) => {
								const u = curriculum.units.find((x) => x.id === id);
								return u ? [u.title] : [];
							}),
							onBreak: onBreak?.title ?? null,
						},
					];
				});
				return { weekStart, subjects };
			});
			return { locked: false as const, weeks };
		}),
};

/** "Kaynak eklenmesini iste" (ADR-0004): talebe göre kütüphane büyür. Kullanıcı başına sınırlıdır. */
export const bookRequestRouter = {
	requestBook: guardianProcedure
		.input(
			z.object({
				title: z.string().trim().min(2).max(120),
				subject: z.enum(SUBJECTS).optional(),
				note: z.string().trim().max(300).optional(),
			}),
		)
		.handler(async ({ context, input }) => {
			const userId = context.session.user.id;
			const [row] = await context.db
				.select({ n: count() })
				.from(bookRequest)
				.where(eq(bookRequest.userId, userId));
			if ((row?.n ?? 0) >= 20) {
				throw new ORPCError("BAD_REQUEST", { message: "too_many_requests" });
			}
			await context.db.insert(bookRequest).values({
				userId,
				title: input.title,
				subject: input.subject ?? null,
				note: input.note || null,
			});
			return { ok: true };
		}),
};
