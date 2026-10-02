import {
	analyzeExams,
	type ExamSummary,
	type Subject,
	subjectResult,
	validateExamSubject,
} from "@ivmeapp/core";
import { exam, examSubject, examWeakTopic } from "@ivmeapp/db/schema/domain";
import { ORPCError } from "@orpc/server";
import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";

import { resolveGuardianChild } from "../authz";
import { allBooks, curriculumFor, SUBJECTS } from "../catalog";
import { guardianProcedure } from "../index";

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

async function loadExams(
	db: Parameters<typeof resolveGuardianChild>[0]["db"],
	childId: string,
): Promise<ExamSummary[]> {
	const exams = await db.select().from(exam).where(eq(exam.childId, childId));
	if (exams.length === 0) return [];
	const ids = exams.map((e) => e.id);
	const subjects = await db
		.select()
		.from(examSubject)
		.where(inArray(examSubject.examId, ids));
	const weak = await db
		.select()
		.from(examWeakTopic)
		.where(inArray(examWeakTopic.examId, ids));
	return exams.map((e) => ({
		id: e.id,
		name: e.name,
		date: e.date,
		subjects: subjects
			.filter((s) => s.examId === e.id)
			.map((s) =>
				subjectResult({
					subject: s.subject,
					questions: s.questions,
					correct: s.correct,
					wrong: s.wrong,
				}),
			),
		weakTopics: weak
			.filter((w) => w.examId === e.id)
			.map((w) => ({ subject: w.subject as Subject, topic: w.topic })),
	}));
}

/**
 * Manuel deneme girişi ve ücretsiz teşhis (ADR-0006, ADR-0015): ders bazında net, trend ve
 * "kaç denemedir zayıf" konular.
 */
export const examRouter = {
	create: guardianProcedure
		.input(
			z.object({
				childId: z.string(),
				name: z.string().trim().min(1).max(80),
				date: isoDate,
				subjects: z
					.array(
						z.object({
							subject: z.enum(SUBJECTS),
							questions: z.number().int().min(1).max(200),
							correct: z.number().int().min(0),
							wrong: z.number().int().min(0),
						}),
					)
					.min(1)
					.refine(
						(s) => new Set(s.map((x) => x.subject)).size === s.length,
						"Ders tekrarlanamaz",
					),
				weakTopics: z
					.array(
						z.object({
							subject: z.enum(SUBJECTS),
							topic: z.string().trim().min(1).max(120),
						}),
					)
					.max(30)
					.default([]),
			}),
		)
		.handler(async ({ context, input }) => {
			const child = await resolveGuardianChild(context, input.childId);
			const errors = input.subjects.flatMap(validateExamSubject);
			if (errors.length > 0)
				throw new ORPCError("BAD_REQUEST", { message: errors.join("; ") });

			const id = await context.db.transaction(async (tx) => {
				const [e] = await tx
					.insert(exam)
					.values({
						childId: child.id,
						name: input.name,
						date: input.date,
						enteredByUserId: context.session.user.id,
					})
					.returning();
				if (!e) throw new Error("deneme kaydedilemedi");
				await tx.insert(examSubject).values(
					input.subjects.map((s) => {
						const r = subjectResult(s);
						return {
							examId: e.id,
							subject: s.subject,
							questions: s.questions,
							correct: s.correct,
							wrong: s.wrong,
							blank: r.blank,
						};
					}),
				);
				const unique = new Map(
					input.weakTopics.map((w) => [
						`${w.subject}|${w.topic.toLocaleLowerCase("tr")}`,
						w,
					]),
				);
				if (unique.size > 0) {
					await tx.insert(examWeakTopic).values(
						[...unique.values()].map((w) => ({
							examId: e.id,
							subject: w.subject,
							topic: w.topic,
						})),
					);
				}
				return e.id;
			});
			return { id };
		}),

	list: guardianProcedure
		.input(z.object({ childId: z.string() }))
		.handler(async ({ context, input }) => {
			const child = await resolveGuardianChild(context, input.childId);
			return (await loadExams(context.db, child.id)).sort((a, b) =>
				b.date.localeCompare(a.date),
			);
		}),

	diagnosis: guardianProcedure
		.input(z.object({ childId: z.string() }))
		.handler(async ({ context, input }) => {
			const child = await resolveGuardianChild(context, input.childId);
			return analyzeExams(await loadExams(context.db, child.id));
		}),

	remove: guardianProcedure
		.input(z.object({ childId: z.string(), examId: z.string() }))
		.handler(async ({ context, input }) => {
			const child = await resolveGuardianChild(context, input.childId);
			const res = await context.db
				.delete(exam)
				.where(and(eq(exam.id, input.examId), eq(exam.childId, child.id)))
				.returning({ id: exam.id });
			if (res.length === 0) throw new ORPCError("NOT_FOUND");
			return { ok: true };
		}),

	/** Zayıf konu seçimi için müfredat ve kitap konuları (veli listeden işaretler, ADR-0015). */
	topics: guardianProcedure
		.input(z.object({ childId: z.string(), subject: z.enum(SUBJECTS) }))
		.handler(async ({ context, input }) => {
			const child = await resolveGuardianChild(context, input.childId);
			const fromCurriculum =
				curriculumFor(input.subject, child.grade)?.units.flatMap((u) =>
					u.topics.map((t) => t.title),
				) ?? [];
			const fromBooks = allBooks()
				.filter((b) => b.subject === input.subject && b.grade === child.grade)
				.flatMap((b) => b.sections.flatMap((s) => s.units.map((u) => u.topic)));
			const seen = new Set<string>();
			const topics: string[] = [];
			for (const t of [...fromCurriculum, ...fromBooks]) {
				const key = t.toLocaleLowerCase("tr");
				if (!seen.has(key)) {
					seen.add(key);
					topics.push(t);
				}
			}
			return topics;
		}),
};
