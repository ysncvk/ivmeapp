import { istanbulDate, subjectResult } from "@ivmeapp/core";
import { user } from "@ivmeapp/db/schema/auth";
import {
	assignment,
	child,
	exam,
	examSubject,
	groupMember,
	homework,
	studyGroup,
} from "@ivmeapp/db/schema/domain";
import { ORPCError } from "@orpc/server";
import { and, desc, eq, gte, inArray, isNull, or } from "drizzle-orm";
import { z } from "zod";

import {
	logAccess,
	requireOwnGroup,
	resolveFamilyChild,
	resolveGuardianChild,
	viewerOf,
} from "../authz";
import { SUBJECTS } from "../catalog";
import { clock } from "../context";
import { familyProcedure, guardianProcedure, teacherProcedure } from "../index";

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // karışan harfler (I, O, 0, 1) yok

function newJoinCode(length = 8): string {
	const bytes = crypto.getRandomValues(new Uint8Array(length));
	return [...bytes]
		.map((b) => CODE_ALPHABET[b % CODE_ALPHABET.length])
		.join("");
}

const normalizeCode = (code: string) => code.trim().toUpperCase();

/**
 * Öğretmen tarafı ücretsizdir (ADR-0014). Öğretmen yalnızca kendi grubundaki çocuğun ÖDEV
 * tamamlama durumunu ve deneme netlerini görür; plan görevlerini, ayarları, ödülleri,
 * zayıf konuları ve abonelik durumunu ASLA görmez (ADR-0010, ADR-0014 madde 5).
 */
export const teacherRouter = {
	groups: {
		create: teacherProcedure
			.input(z.object({ name: z.string().trim().min(1).max(60) }))
			.handler(async ({ context, input }) => {
				const teacherId = context.session.user.id;
				for (let i = 0; i < 5; i++) {
					const [row] = await context.db
						.insert(studyGroup)
						.values({ teacherId, name: input.name, joinCode: newJoinCode() })
						.onConflictDoNothing()
						.returning();
					if (row)
						return { id: row.id, name: row.name, joinCode: row.joinCode };
				}
				throw new Error("Davet kodu üretilemedi");
			}),

		list: teacherProcedure.handler(async ({ context }) => {
			const groups = await context.db
				.select()
				.from(studyGroup)
				.where(eq(studyGroup.teacherId, context.session.user.id))
				.orderBy(desc(studyGroup.createdAt));
			const ids = groups.map((g) => g.id);
			const members = ids.length
				? await context.db
						.select()
						.from(groupMember)
						.where(inArray(groupMember.groupId, ids))
				: [];
			return groups.map((g) => ({
				id: g.id,
				name: g.name,
				joinCode: g.joinCode,
				memberCount: members.filter((m) => m.groupId === g.id).length,
				archived: g.archivedAt !== null,
			}));
		}),

		archive: teacherProcedure
			.input(z.object({ groupId: z.string() }))
			.handler(async ({ context, input }) => {
				const group = await requireOwnGroup(context, input.groupId);
				await context.db
					.update(studyGroup)
					.set({ archivedAt: clock(context) })
					.where(eq(studyGroup.id, group.id));
				return { ok: true };
			}),

		/** Davet için hazır mesaj: ödev takibinin ücretsiz ve kartsız olduğunu açıkça söyler. */
		invite: teacherProcedure
			.input(z.object({ groupId: z.string() }))
			.handler(async ({ context, input }) => {
				const group = await requireOwnGroup(context, input.groupId);
				const path = `/katil/${group.joinCode}`;
				return {
					joinCode: group.joinCode,
					joinPath: path,
					message:
						`Merhaba, "${group.name}" çalışma grubu için ödev takibinde İvme'yi kullanıyorum. ` +
						"Ödev takibi tamamen ücretsizdir, kart bilgisi gerekmez. " +
						"Katılmak için bağlantıya tıklayıp çocuğunuzu gruba ekleyebilirsiniz: ",
				};
			}),

		/** Grup listesi: çocuğun adı, ödev tamamlama özeti ve son deneme netleri. Erişim kaydı tutulur. */
		roster: teacherProcedure
			.input(z.object({ groupId: z.string() }))
			.handler(async ({ context, input }) => {
				const group = await requireOwnGroup(context, input.groupId);
				const viewer = viewerOf(context);
				const today = istanbulDate(clock(context));
				const members = await context.db
					.select({ childId: child.id, displayName: child.displayName })
					.from(groupMember)
					.innerJoin(child, eq(child.id, groupMember.childId))
					.where(eq(groupMember.groupId, group.id))
					.orderBy(child.displayName);
				const out = [];
				for (const m of members) {
					await logAccess(context, viewer, m.childId, "teacher_view_roster");
					const hw = await context.db
						.select({
							doneAt: homework.doneAt,
							dueDate: homework.dueDate,
						})
						.from(homework)
						.innerJoin(assignment, eq(assignment.id, homework.assignmentId))
						.where(
							and(
								eq(homework.childId, m.childId),
								eq(assignment.groupId, group.id),
							),
						);
					const [latest] = await context.db
						.select()
						.from(exam)
						.where(eq(exam.childId, m.childId))
						.orderBy(desc(exam.date))
						.limit(1);
					const nets = latest
						? (
								await context.db
									.select()
									.from(examSubject)
									.where(eq(examSubject.examId, latest.id))
							).map((s) => ({
								subject: s.subject,
								net: subjectResult({
									subject: s.subject,
									questions: s.questions,
									correct: s.correct,
									wrong: s.wrong,
								}).net,
							}))
						: [];
					out.push({
						childId: m.childId,
						displayName: m.displayName,
						homework: {
							total: hw.length,
							done: hw.filter((h) => h.doneAt !== null).length,
							overdue: hw.filter(
								(h) =>
									h.doneAt === null && h.dueDate !== null && h.dueDate < today,
							).length,
						},
						latestExam: latest
							? { name: latest.name, date: latest.date, nets }
							: null,
					});
				}
				return { group: { id: group.id, name: group.name }, members: out };
			}),
	},

	assignments: {
		/** Gruba ödev: her üye çocuk için bir ödev kaydı oluşur. v1 kapsamı dardır (ADR-0014 madde 3). */
		create: teacherProcedure
			.input(
				z.object({
					groupId: z.string(),
					subject: z.enum(SUBJECTS),
					title: z.string().trim().min(1).max(120),
					description: z.string().trim().max(500).optional(),
					dueDate: isoDate.optional(),
				}),
			)
			.handler(async ({ context, input }) => {
				const group = await requireOwnGroup(context, input.groupId);
				const teacherId = context.session.user.id;
				return context.db.transaction(async (tx) => {
					const [a] = await tx
						.insert(assignment)
						.values({
							groupId: group.id,
							teacherId,
							subject: input.subject,
							title: input.title,
							description: input.description || null,
							dueDate: input.dueDate ?? null,
						})
						.returning();
					if (!a) throw new Error("ödev kaydedilemedi");
					const members = await tx
						.select()
						.from(groupMember)
						.where(eq(groupMember.groupId, group.id));
					if (members.length > 0) {
						await tx.insert(homework).values(
							members.map((m) => ({
								childId: m.childId,
								subject: input.subject,
								title: input.title,
								description: input.description || null,
								dueDate: input.dueDate ?? null,
								source: "teacher" as const,
								createdByUserId: teacherId,
								assignmentId: a.id,
							})),
						);
					}
					return { id: a.id, assigned: members.length };
				});
			}),

		list: teacherProcedure
			.input(z.object({ groupId: z.string() }))
			.handler(async ({ context, input }) => {
				const group = await requireOwnGroup(context, input.groupId);
				const rows = await context.db
					.select()
					.from(assignment)
					.where(eq(assignment.groupId, group.id))
					.orderBy(desc(assignment.createdAt));
				const hw = rows.length
					? await context.db
							.select({
								assignmentId: homework.assignmentId,
								doneAt: homework.doneAt,
							})
							.from(homework)
							.where(
								inArray(
									homework.assignmentId,
									rows.map((r) => r.id),
								),
							)
					: [];
				return rows.map((a) => ({
					id: a.id,
					subject: a.subject,
					title: a.title,
					dueDate: a.dueDate,
					total: hw.filter((h) => h.assignmentId === a.id).length,
					done: hw.filter((h) => h.assignmentId === a.id && h.doneAt !== null)
						.length,
				}));
			}),

		/** Kim yaptı, kim yapmadı. */
		status: teacherProcedure
			.input(z.object({ assignmentId: z.string() }))
			.handler(async ({ context, input }) => {
				const [a] = await context.db
					.select()
					.from(assignment)
					.where(eq(assignment.id, input.assignmentId));
				if (!a) throw new ORPCError("NOT_FOUND");
				await requireOwnGroup(context, a.groupId);
				const viewer = viewerOf(context);
				const rows = await context.db
					.select({
						childId: child.id,
						displayName: child.displayName,
						doneAt: homework.doneAt,
					})
					.from(homework)
					.innerJoin(child, eq(child.id, homework.childId))
					.where(eq(homework.assignmentId, a.id))
					.orderBy(child.displayName);
				for (const r of rows)
					await logAccess(
						context,
						viewer,
						r.childId,
						"teacher_view_assignment_status",
					);
				return {
					assignment: {
						id: a.id,
						title: a.title,
						subject: a.subject,
						dueDate: a.dueDate,
					},
					children: rows.map((r) => ({
						childId: r.childId,
						displayName: r.displayName,
						done: r.doneAt !== null,
						doneAt: r.doneAt,
					})),
				};
			}),
	},
};

/** Veli tarafı: davet koduyla çalışma grubuna katılma (çocuğu sınıfa bağlama velinin rızasıdır). */
export const groupsRouter = {
	preview: guardianProcedure
		.input(z.object({ code: z.string().min(4).max(20) }))
		.handler(async ({ context, input }) => {
			const [row] = await context.db
				.select({ name: studyGroup.name, teacherName: user.name })
				.from(studyGroup)
				.innerJoin(user, eq(user.id, studyGroup.teacherId))
				.where(
					and(
						eq(studyGroup.joinCode, normalizeCode(input.code)),
						isNull(studyGroup.archivedAt),
					),
				);
			if (!row)
				throw new ORPCError("NOT_FOUND", { message: "Davet bulunamadı" });
			return { groupName: row.name, teacherName: row.teacherName };
		}),

	join: guardianProcedure
		.input(z.object({ code: z.string().min(4).max(20), childId: z.string() }))
		.handler(async ({ context, input }) => {
			const c = await resolveGuardianChild(context, input.childId);
			const [group] = await context.db
				.select()
				.from(studyGroup)
				.where(
					and(
						eq(studyGroup.joinCode, normalizeCode(input.code)),
						isNull(studyGroup.archivedAt),
					),
				);
			if (!group)
				throw new ORPCError("NOT_FOUND", { message: "Davet bulunamadı" });
			const today = istanbulDate(clock(context));
			await context.db.transaction(async (tx) => {
				const inserted = await tx
					.insert(groupMember)
					.values({ groupId: group.id, childId: c.id })
					.onConflictDoNothing()
					.returning();
				if (inserted.length === 0) return; // zaten üye
				// Henüz süresi geçmemiş ödevler çocuğa da atanır
				const open = await tx
					.select()
					.from(assignment)
					.where(
						and(
							eq(assignment.groupId, group.id),
							or(isNull(assignment.dueDate), gte(assignment.dueDate, today)),
						),
					);
				if (open.length > 0) {
					await tx.insert(homework).values(
						open.map((a) => ({
							childId: c.id,
							subject: a.subject,
							title: a.title,
							description: a.description,
							dueDate: a.dueDate,
							source: "teacher" as const,
							createdByUserId: a.teacherId,
							assignmentId: a.id,
						})),
					);
				}
			});
			return { groupId: group.id, groupName: group.name };
		}),

	leave: guardianProcedure
		.input(z.object({ childId: z.string(), groupId: z.string() }))
		.handler(async ({ context, input }) => {
			const c = await resolveGuardianChild(context, input.childId);
			await context.db
				.delete(groupMember)
				.where(
					and(
						eq(groupMember.groupId, input.groupId),
						eq(groupMember.childId, c.id),
					),
				);
			return { ok: true };
		}),

	forChild: familyProcedure
		.input(z.object({ childId: z.string().optional() }))
		.handler(async ({ context, input }) => {
			const { child: c } = await resolveFamilyChild(context, input.childId);
			return context.db
				.select({ groupId: studyGroup.id, name: studyGroup.name })
				.from(groupMember)
				.innerJoin(studyGroup, eq(studyGroup.id, groupMember.groupId))
				.where(eq(groupMember.childId, c.id));
		}),
};
