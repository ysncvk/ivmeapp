import { hasPlanAccess } from "@ivmeapp/core";
import { deleteGuardianAccount } from "@ivmeapp/db/account";
import { user } from "@ivmeapp/db/schema/auth";
import { child, consent, subscription } from "@ivmeapp/db/schema/domain";
import { ORPCError } from "@orpc/server";
import { and, desc, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { clock } from "../context";
import { protectedProcedure } from "../index";

const CONSENT_KINDS = [
	"privacy_notice",
	"parental_consent",
	"child_notice",
	"marketing",
] as const;

export const accountRouter = {
	/** Oturumdaki kullanıcı; veliyse çocukları, çocuksa kendi profili. */
	me: protectedProcedure.handler(async ({ context }) => {
		const u = context.session.user;
		const role = u.role as string;
		const now = clock(context);
		const withAccess = async (rows: (typeof child.$inferSelect)[]) => {
			const out = [];
			for (const c of rows) {
				const [sub] = await context.db
					.select()
					.from(subscription)
					.where(eq(subscription.childId, c.id));
				out.push({
					id: c.id,
					displayName: c.displayName,
					grade: c.grade,
					hasPlanAccess: hasPlanAccess(sub, now),
					subscriptionStatus: sub?.status ?? null,
				});
			}
			return out;
		};
		let children: Awaited<ReturnType<typeof withAccess>> = [];
		if (role === "guardian") {
			children = await withAccess(
				await context.db
					.select()
					.from(child)
					.where(eq(child.guardianId, u.id))
					.orderBy(child.createdAt),
			);
		} else if (role === "student") {
			children = await withAccess(
				await context.db.select().from(child).where(eq(child.userId, u.id)),
			);
		}
		const consents = await context.db
			.select({
				kind: consent.kind,
				version: consent.version,
				grantedAt: consent.grantedAt,
			})
			.from(consent)
			.where(and(eq(consent.userId, u.id), isNull(consent.revokedAt)))
			.orderBy(desc(consent.grantedAt));
		return {
			user: {
				id: u.id,
				name: u.name,
				role,
				username: (u as { username?: string | null }).username ?? null,
			},
			children,
			consents,
		};
	}),

	/**
	 * Aydınlatma metni ve açık rıza kaydı (ADR-0010 madde 4). Çocuk yalnızca kendi sade aydınlatma
	 * onayını (`child_notice`, ADR-0012) verebilir; açık rıza velinindir. Aynı sürüm tekrar kaydedilmez.
	 */
	acceptConsent: protectedProcedure
		.input(
			z.object({
				kind: z.enum(CONSENT_KINDS),
				version: z.string().min(1).max(40),
			}),
		)
		.handler(async ({ context, input }) => {
			const role = context.session.user.role as string;
			if (role === "admin") throw new ORPCError("FORBIDDEN");
			if (role === "student" && input.kind !== "child_notice")
				throw new ORPCError("FORBIDDEN");
			if (input.kind === "child_notice" && role !== "student")
				throw new ORPCError("FORBIDDEN");
			if (input.kind === "parental_consent" && role !== "guardian")
				throw new ORPCError("FORBIDDEN");
			const userId = context.session.user.id;
			const [active] = await context.db
				.select({ id: consent.id })
				.from(consent)
				.where(
					and(
						eq(consent.userId, userId),
						eq(consent.kind, input.kind),
						eq(consent.version, input.version),
						isNull(consent.revokedAt),
					),
				);
			if (!active) {
				await context.db.insert(consent).values({
					userId,
					kind: input.kind,
					version: input.version,
				});
			}
			return { ok: true };
		}),

	/** Pazarlama onayı geri alınabilir (ADR-0014 madde 8); hizmet için gerekli rızalar buradan çekilmez. */
	revokeMarketing: protectedProcedure.handler(async ({ context }) => {
		await context.db
			.update(consent)
			.set({ revokedAt: clock(context) })
			.where(
				and(
					eq(consent.userId, context.session.user.id),
					eq(consent.kind, "marketing"),
					isNull(consent.revokedAt),
				),
			);
		return { ok: true };
	}),

	/** Silme hakkı (ADR-0010 madde 3): veli hesabı silince çocuğa ait tüm veri silinir. */
	deleteAccount: protectedProcedure
		.input(z.object({ confirm: z.literal("SİL") }))
		.handler(async ({ context }) => {
			const u = context.session.user;
			const role = u.role as string;
			if (role === "guardian") {
				await deleteGuardianAccount(context.db, u.id);
			} else if (role === "teacher") {
				await context.db.delete(user).where(eq(user.id, u.id));
			} else {
				throw new ORPCError("FORBIDDEN", {
					message: "Çocuk hesabını velisi siler",
				});
			}
			return { ok: true };
		}),
};
