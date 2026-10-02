import {
	addDays,
	istanbulDate,
	mondayOf,
	periodFor,
	type Subject,
	weekFor,
} from "@ivmeapp/core";
import { childSubject } from "@ivmeapp/db/schema/domain";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { resolveFamilyChild } from "../authz";
import { allBooks, curriculumFor, SUBJECTS } from "../catalog";
import { clock } from "../context";
import { familyProcedure, protectedProcedure } from "../index";

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
