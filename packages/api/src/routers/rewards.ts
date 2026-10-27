import { istanbulDate } from "@ivmeapp/core";
import { reward, rewardGrant } from "@ivmeapp/db/schema/domain";
import { ORPCError } from "@orpc/server";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";

import { resolveFamilyChild, resolveGuardianChild } from "../authz";
import { clock } from "../context";
import { familyProcedure, guardianProcedure } from "../index";
import { rewardOverview } from "../services/rewards";

const tier = z.enum(["daily", "weekly", "milestone"]);

/**
 * ADR-0016: ödülü veli tanımlar ve teslim eder; hedef görev tamamlama oranıdır. Ödev tamamlama
 * ücretsiz katmanda çalışır (ADR-0014), plan görevleri ücretli plan varken sayılır.
 */
export const rewardsRouter = {
	list: familyProcedure
		.input(z.object({ childId: z.string().optional() }))
		.handler(async ({ context, input }) => {
			const { child } = await resolveFamilyChild(context, input.childId);
			return rewardOverview(context.db, child.id, istanbulDate(clock(context)));
		}),

	upsert: guardianProcedure
		.input(
			z.object({
				childId: z.string(),
				tier,
				title: z.string().trim().min(1).max(60),
				threshold: z.number().min(0.1).max(1).default(0.8),
			}),
		)
		.handler(async ({ context, input }) => {
			const child = await resolveGuardianChild(context, input.childId);
			await context.db
				.insert(reward)
				.values({
					childId: child.id,
					tier: input.tier,
					title: input.title,
					threshold: input.threshold,
					active: true,
				})
				.onConflictDoUpdate({
					target: [reward.childId, reward.tier],
					set: { title: input.title, threshold: input.threshold, active: true },
				});
			return { ok: true };
		}),

	remove: guardianProcedure
		.input(z.object({ childId: z.string(), tier }))
		.handler(async ({ context, input }) => {
			const child = await resolveGuardianChild(context, input.childId);
			await context.db
				.delete(reward)
				.where(and(eq(reward.childId, child.id), eq(reward.tier, input.tier)));
			return { ok: true };
		}),

	/** Teslim edilen ödüllerin geçmişi (ADR-0016 madde 4): son 12 teslim, yeniden eskiye. */
	history: guardianProcedure
		.input(z.object({ childId: z.string() }))
		.handler(async ({ context, input }) => {
			const child = await resolveGuardianChild(context, input.childId);
			return context.db
				.select({
					tier: reward.tier,
					title: reward.title,
					periodKey: rewardGrant.periodKey,
					grantedAt: rewardGrant.grantedAt,
				})
				.from(rewardGrant)
				.innerJoin(reward, eq(reward.id, rewardGrant.rewardId))
				.where(eq(reward.childId, child.id))
				.orderBy(desc(rewardGrant.grantedAt))
				.limit(12);
		}),

	/** Veli ödülü teslim edildi olarak işaretler; yalnızca hedefe ulaşıldıysa. */
	grant: guardianProcedure
		.input(z.object({ childId: z.string(), tier }))
		.handler(async ({ context, input }) => {
			const child = await resolveGuardianChild(context, input.childId);
			const today = istanbulDate(clock(context));
			const view = (await rewardOverview(context.db, child.id, today)).find(
				(r) => r.tier === input.tier,
			);
			if (!view) throw new ORPCError("NOT_FOUND");
			if (!view.progress.unlocked)
				throw new ORPCError("BAD_REQUEST", { message: "not_unlocked" });
			await context.db
				.insert(rewardGrant)
				.values({
					rewardId: view.id,
					periodKey: view.periodKey,
					grantedByUserId: context.session.user.id,
				})
				.onConflictDoNothing();
			return { ok: true };
		}),

	ungrant: guardianProcedure
		.input(z.object({ childId: z.string(), tier }))
		.handler(async ({ context, input }) => {
			const child = await resolveGuardianChild(context, input.childId);
			const today = istanbulDate(clock(context));
			const view = (await rewardOverview(context.db, child.id, today)).find(
				(r) => r.tier === input.tier,
			);
			if (!view) throw new ORPCError("NOT_FOUND");
			await context.db
				.delete(rewardGrant)
				.where(
					and(
						eq(rewardGrant.rewardId, view.id),
						eq(rewardGrant.periodKey, view.periodKey),
					),
				);
			return { ok: true };
		}),
};
