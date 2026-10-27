import {
	createStudentUser,
	resetStudentPassword,
	validateChildPassword,
} from "@ivmeapp/auth";
import {
	addDays,
	checkBlockMinutes,
	checkDailyBudget,
	istanbulDate,
	mondayOf,
	type Subject,
} from "@ivmeapp/core";
import { session, user } from "@ivmeapp/db/schema/auth";
import {
	accessLog,
	child,
	childSource,
	childSubject,
	consent,
} from "@ivmeapp/db/schema/domain";
import { ORPCError } from "@orpc/server";
import { and, desc, eq, isNull } from "drizzle-orm";
import { z } from "zod";

import { resolveGuardianChild } from "../authz";
import { allBooks, bookById, SUBJECTS } from "../catalog";
import { clock } from "../context";
import { guardianProcedure } from "../index";

const ANIMALS = [
	"kaplan",
	"aslan",
	"tilki",
	"kartal",
	"yunus",
	"panda",
	"kurt",
	"ceylan",
	"puma",
	"baykus",
];

/** Okunabilir, tahmini zor kullanıcı adı önerisi: hayvan + 4 haneli sayı. */
export async function suggestUsername(
	exists: (username: string) => Promise<boolean>,
): Promise<string> {
	for (let i = 0; i < 20; i++) {
		const animal =
			ANIMALS[Math.floor(Math.random() * ANIMALS.length)] ?? "kaplan";
		const candidate = `${animal}-${1000 + Math.floor(Math.random() * 9000)}`;
		if (!(await exists(candidate))) return candidate;
	}
	return `ogrenci-${crypto.randomUUID().slice(0, 8)}`;
}

const childView = (c: typeof child.$inferSelect, username: string | null) => ({
	id: c.id,
	displayName: c.displayName,
	grade: c.grade,
	username,
});

const settingsInput = z.object({
	childId: z.string(),
	dailyBudgetMinutes: z.number().int().min(10).max(600).optional(),
	blockMinutes: z.number().int().min(5).max(120).optional(),
	studyDays: z
		.array(z.number().int().min(1).max(7))
		.min(1)
		.max(7)
		.refine((d) => new Set(d).size === d.length, "Günler tekrarlanamaz")
		.optional(),
	idleTime: z.enum(["review", "reading", "free"]).optional(),
	subjects: z
		.array(
			z.object({
				subject: z.enum(SUBJECTS),
				enabled: z.boolean(),
				weekOffset: z.number().int().min(-20).max(20),
			}),
		)
		.optional(),
	sources: z.array(z.string()).max(30).optional(),
});

async function readSettings(
	db: Parameters<typeof resolveGuardianChild>[0]["db"],
	c: typeof child.$inferSelect,
) {
	const subjects = await db
		.select()
		.from(childSubject)
		.where(eq(childSubject.childId, c.id));
	const sources = await db
		.select()
		.from(childSource)
		.where(eq(childSource.childId, c.id));
	return {
		dailyBudgetMinutes: c.dailyBudgetMinutes,
		blockMinutes: c.blockMinutes,
		studyDays: [...c.studyDays].sort((a, b) => a - b),
		idleTime: c.idleTime,
		subjects: SUBJECTS.map((s) => {
			const row = subjects.find((r) => r.subject === s);
			return {
				subject: s as Subject,
				enabled: row?.enabled ?? true,
				weekOffset: row?.weekOffset ?? 0,
			};
		}),
		sources: sources.map((r) => r.bookId),
	};
}

export const childrenRouter = {
	list: guardianProcedure.handler(async ({ context }) => {
		const rows = await context.db
			.select({ c: child, username: user.username })
			.from(child)
			.innerJoin(user, eq(user.id, child.userId))
			.where(eq(child.guardianId, context.session.user.id))
			.orderBy(child.createdAt);
		return rows.map((r) => childView(r.c, r.username));
	}),

	suggestUsername: guardianProcedure.handler(async ({ context }) => {
		const username = await suggestUsername(async (u) => {
			const [row] = await context.db
				.select({ id: user.id })
				.from(user)
				.where(eq(user.username, u));
			return !!row;
		});
		return { username };
	}),

	/** Çocuk profili: ad + kullanıcı adı + şifre. E-posta, TC, doğum tarihi alınmaz (ADR-0010). */
	create: guardianProcedure
		.input(
			z.object({
				displayName: z.string().trim().min(1).max(40),
				username: z.string().optional(),
				password: z.string(),
			}),
		)
		.handler(async ({ context, input }) => {
			const guardianId = context.session.user.id;
			// Açık rıza yayına çıkışın önkoşuludur (ADR-0010 madde 4)
			const [consented] = await context.db
				.select({ id: consent.id })
				.from(consent)
				.where(
					and(
						eq(consent.userId, guardianId),
						eq(consent.kind, "parental_consent"),
						isNull(consent.revokedAt),
					),
				);
			if (!consented) {
				throw new ORPCError("PRECONDITION_FAILED", {
					message: "consent_required",
				});
			}
			const passwordError = validateChildPassword(input.password);
			if (passwordError)
				throw new ORPCError("BAD_REQUEST", { message: passwordError });
			const username =
				input.username?.trim() ||
				(await suggestUsername(async (u) => {
					const [row] = await context.db
						.select({ id: user.id })
						.from(user)
						.where(eq(user.username, u));
					return !!row;
				}));

			let created: { userId: string; username: string };
			try {
				created = await createStudentUser(context.auth, {
					name: input.displayName,
					username,
					password: input.password,
				});
			} catch (error) {
				if (error instanceof RangeError) {
					throw new ORPCError("BAD_REQUEST", { message: error.message });
				}
				throw error;
			}
			try {
				const row = await context.db.transaction(async (tx) => {
					const [c] = await tx
						.insert(child)
						.values({
							guardianId,
							userId: created.userId,
							displayName: input.displayName,
						})
						.returning();
					if (!c) throw new Error("çocuk kaydı oluşmadı");
					await tx
						.insert(childSubject)
						.values(SUBJECTS.map((subject) => ({ childId: c.id, subject })));
					return c;
				});
				return childView(row, created.username);
			} catch (error) {
				// Yarım kalan giriş kaydı bırakılmaz
				await context.db.delete(user).where(eq(user.id, created.userId));
				throw error;
			}
		}),

	update: guardianProcedure
		.input(
			z.object({
				childId: z.string(),
				displayName: z.string().trim().min(1).max(40),
			}),
		)
		.handler(async ({ context, input }) => {
			const c = await resolveGuardianChild(context, input.childId);
			await context.db
				.update(child)
				.set({ displayName: input.displayName })
				.where(eq(child.id, c.id));
			await context.db
				.update(user)
				.set({ name: input.displayName })
				.where(eq(user.id, c.userId));
			return { ok: true };
		}),

	/** Çocuğun şifresini yalnızca veli sıfırlar (ADR-0012). Açık oturumlar sonlanır. */
	resetPassword: guardianProcedure
		.input(z.object({ childId: z.string(), password: z.string() }))
		.handler(async ({ context, input }) => {
			const c = await resolveGuardianChild(context, input.childId);
			try {
				await resetStudentPassword(context.auth, c.userId, input.password);
			} catch (error) {
				if (error instanceof RangeError) {
					throw new ORPCError("BAD_REQUEST", { message: error.message });
				}
				throw error;
			}
			await context.db.delete(session).where(eq(session.userId, c.userId));
			return { ok: true };
		}),

	signOutEverywhere: guardianProcedure
		.input(z.object({ childId: z.string() }))
		.handler(async ({ context, input }) => {
			const c = await resolveGuardianChild(context, input.childId);
			await context.db.delete(session).where(eq(session.userId, c.userId));
			return { ok: true };
		}),

	/**
	 * Erişim şeffaflığı (ADR-0010): çocuğun verisine kimlerin baktığı. Veli kendi çocuğunun kaydını görür;
	 * kendi (ve çocuğun) erişimleri kaydedilmez (K-013), bu yüzden liste yalnızca öğretmen/yönetici
	 * erişimlerini içerir.
	 */
	accessLog: guardianProcedure
		.input(z.object({ childId: z.string() }))
		.handler(async ({ context, input }) => {
			const c = await resolveGuardianChild(context, input.childId);
			return context.db
				.select({
					action: accessLog.action,
					actorRole: accessLog.actorRole,
					actorName: user.name,
					createdAt: accessLog.createdAt,
				})
				.from(accessLog)
				.leftJoin(user, eq(user.id, accessLog.actorUserId))
				.where(eq(accessLog.childId, c.id))
				.orderBy(desc(accessLog.createdAt))
				.limit(30);
		}),

	remove: guardianProcedure
		.input(z.object({ childId: z.string(), confirm: z.literal("SİL") }))
		.handler(async ({ context, input }) => {
			const c = await resolveGuardianChild(context, input.childId);
			// Çocuğun kullanıcı kaydı silinince profil ve tüm veri zincirleme silinir (ADR-0010)
			await context.db.delete(user).where(eq(user.id, c.userId));
			return { ok: true };
		}),

	settings: {
		get: guardianProcedure
			.input(z.object({ childId: z.string() }))
			.handler(async ({ context, input }) => {
				const c = await resolveGuardianChild(context, input.childId);
				return readSettings(context.db, c);
			}),

		/** Uygulama tavsiye eder, engellemez (ADR-0013): sonuçta uyarı seviyeleri döner. */
		update: guardianProcedure
			.input(settingsInput)
			.handler(async ({ context, input }) => {
				const c = await resolveGuardianChild(context, input.childId);

				if (input.sources) {
					for (const id of input.sources) {
						const book = bookById(id);
						if (!book || book.grade !== c.grade) {
							throw new ORPCError("BAD_REQUEST", {
								message: `Bilinmeyen kaynak: ${id}`,
							});
						}
					}
				}
				await context.db.transaction(async (tx) => {
					const patch: Partial<typeof child.$inferInsert> = {};
					if (input.dailyBudgetMinutes !== undefined)
						patch.dailyBudgetMinutes = input.dailyBudgetMinutes;
					if (input.blockMinutes !== undefined)
						patch.blockMinutes = input.blockMinutes;
					if (input.studyDays !== undefined) patch.studyDays = input.studyDays;
					if (input.idleTime !== undefined) patch.idleTime = input.idleTime;
					if (Object.keys(patch).length > 0) {
						await tx.update(child).set(patch).where(eq(child.id, c.id));
					}
					for (const s of input.subjects ?? []) {
						await tx
							.insert(childSubject)
							.values({
								childId: c.id,
								subject: s.subject,
								enabled: s.enabled,
								weekOffset: s.weekOffset,
							})
							.onConflictDoUpdate({
								target: [childSubject.childId, childSubject.subject],
								set: { enabled: s.enabled, weekOffset: s.weekOffset },
							});
					}
					if (input.sources) {
						await tx.delete(childSource).where(eq(childSource.childId, c.id));
						// Seçim sırası korunur (createdAt sıralaması için ayrı zaman damgası verilir)
						const base = Date.now();
						for (const [i, bookId] of input.sources.entries()) {
							await tx
								.insert(childSource)
								.values({
									childId: c.id,
									bookId,
									createdAt: new Date(base + i),
								})
								.onConflictDoNothing();
						}
					}
				});
				const [fresh] = await context.db
					.select()
					.from(child)
					.where(eq(child.id, c.id));
				const settings = await readSettings(context.db, fresh ?? c);
				const today = istanbulDate(clock(context));
				return {
					settings,
					advice: {
						budget: checkDailyBudget(settings.dailyBudgetMinutes).level,
						block: checkBlockMinutes(settings.blockMinutes).level,
						noRestDay: settings.studyDays.length >= 7,
					},
					// Plan haftalıktır; yeni ayarlar bir sonraki haftada geçerlidir (ADR-0013)
					effectiveFrom: addDays(mondayOf(today), 7),
				};
			}),
	},

	/** Kaynak seçimi için kütüphane: ders kitapları ve yardımcı kaynaklar. */
	books: guardianProcedure
		.input(z.object({ childId: z.string() }))
		.handler(async ({ context, input }) => {
			const c = await resolveGuardianChild(context, input.childId);
			return allBooks()
				.filter((b) => b.grade === c.grade)
				.map((b) => ({
					id: b.id,
					title: b.title,
					subject: b.subject,
					kind: b.kind,
					testCount: b.sections.reduce(
						(n, s) => n + s.units.reduce((m, u) => m + u.tests.length, 0),
						0,
					),
				}));
		}),
};
