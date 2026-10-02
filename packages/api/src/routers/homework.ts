import { istanbulDate } from "@ivmeapp/core";
import { homework } from "@ivmeapp/db/schema/domain";
import { ORPCError } from "@orpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { resolveFamilyChild } from "../authz";
import { SUBJECTS } from "../catalog";
import { clock } from "../context";
import { familyProcedure } from "../index";
import { syncHomeworkTask } from "../services/plan";

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

const view = (h: typeof homework.$inferSelect) => ({
	id: h.id,
	subject: h.subject,
	title: h.title,
	description: h.description,
	dueDate: h.dueDate,
	source: h.source,
	done: h.doneAt !== null,
	doneAt: h.doneAt,
});

/** Ödev takibi ücretsizdir (ADR-0014): öğretmenin verdiği ve veli/çocuğun girdiği ödevler. */
export const homeworkRouter = {
	list: familyProcedure
		.input(
			z.object({
				childId: z.string().optional(),
				includeDone: z.boolean().default(false),
			}),
		)
		.handler(async ({ context, input }) => {
			const { child } = await resolveFamilyChild(context, input.childId);
			const rows = await context.db
				.select()
				.from(homework)
				.where(eq(homework.childId, child.id));
			return rows
				.filter((h) => input.includeDone || h.doneAt === null)
				.sort((a, b) =>
					(a.dueDate ?? "9999").localeCompare(b.dueDate ?? "9999"),
				)
				.map(view);
		}),

	create: familyProcedure
		.input(
			z.object({
				childId: z.string().optional(),
				subject: z.enum(SUBJECTS),
				title: z.string().trim().min(1).max(120),
				description: z.string().trim().max(500).optional(),
				dueDate: isoDate.optional(),
			}),
		)
		.handler(async ({ context, input }) => {
			const { child, viewer } = await resolveFamilyChild(
				context,
				input.childId,
			);
			const [row] = await context.db
				.insert(homework)
				.values({
					childId: child.id,
					subject: input.subject,
					title: input.title,
					description: input.description || null,
					dueDate: input.dueDate ?? null,
					source: viewer.role === "guardian" ? "guardian" : "student",
					createdByUserId: viewer.userId,
				})
				.returning();
			if (!row) throw new Error("ödev kaydedilemedi");
			return view(row);
		}),

	toggle: familyProcedure
		.input(
			z.object({
				childId: z.string().optional(),
				homeworkId: z.string(),
				done: z.boolean(),
			}),
		)
		.handler(async ({ context, input }) => {
			const { child, viewer } = await resolveFamilyChild(
				context,
				input.childId,
			);
			const now = clock(context);
			const [row] = await context.db
				.update(homework)
				.set({
					doneAt: input.done ? now : null,
					doneByUserId: input.done ? viewer.userId : null,
				})
				.where(
					and(
						eq(homework.id, input.homeworkId),
						eq(homework.childId, child.id),
					),
				)
				.returning();
			if (!row) throw new ORPCError("NOT_FOUND");
			await syncHomeworkTask(context.db, row.id, input.done, now);
			return view(row);
		}),

	/** Veli/çocuk yalnızca kendi eklediği ödevi siler; öğretmen ödevi silinemez. */
	remove: familyProcedure
		.input(z.object({ childId: z.string().optional(), homeworkId: z.string() }))
		.handler(async ({ context, input }) => {
			const { child } = await resolveFamilyChild(context, input.childId);
			const [row] = await context.db
				.select()
				.from(homework)
				.where(
					and(
						eq(homework.id, input.homeworkId),
						eq(homework.childId, child.id),
					),
				);
			if (!row) throw new ORPCError("NOT_FOUND");
			if (row.source === "teacher") {
				throw new ORPCError("FORBIDDEN", {
					message: "Öğretmen ödevi silinemez",
				});
			}
			await context.db.delete(homework).where(eq(homework.id, row.id));
			return { ok: true, today: istanbulDate(clock(context)) };
		}),
};
