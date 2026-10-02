import { hasPlanAccess, retainUntil, trialEnd } from "@ivmeapp/core";
import type { Database } from "@ivmeapp/db";
import { subscription } from "@ivmeapp/db/schema/domain";
import { ORPCError } from "@orpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { resolveGuardianChild } from "../authz";
import { clock } from "../context";
import { guardianProcedure } from "../index";

const view = (
	sub: typeof subscription.$inferSelect | undefined,
	now: Date,
) => ({
	status: sub?.status ?? null,
	hasPlanAccess: hasPlanAccess(sub, now),
	trialEndsAt: sub?.trialEndsAt ?? null,
	currentPeriodEnd: sub?.currentPeriodEnd ?? null,
	canceledAt: sub?.canceledAt ?? null,
	retainUntil: sub?.retainUntil ?? null,
	// Kartsız deneme bir kez; bitince otomatik ücretlendirme yoktur (ADR-0014 madde 6)
	canStartTrial: !sub,
});

/** Ödeme sağlayıcısı entegrasyonu için iç kapı (webhook, seed): aboneliği etkinleştirir. */
export async function activateSubscription(
	db: Database,
	childId: string,
	periodEnd: Date,
	provider?: { name: string; ref: string },
): Promise<void> {
	await db
		.insert(subscription)
		.values({
			childId,
			status: "active",
			currentPeriodEnd: periodEnd,
			provider: provider?.name ?? null,
			providerRef: provider?.ref ?? null,
		})
		.onConflictDoUpdate({
			target: subscription.childId,
			set: {
				status: "active",
				currentPeriodEnd: periodEnd,
				canceledAt: null,
				retainUntil: null,
				provider: provider?.name ?? null,
				providerRef: provider?.ref ?? null,
			},
		});
}

export const subscriptionRouter = {
	status: guardianProcedure
		.input(z.object({ childId: z.string() }))
		.handler(async ({ context, input }) => {
			const child = await resolveGuardianChild(context, input.childId);
			const [sub] = await context.db
				.select()
				.from(subscription)
				.where(eq(subscription.childId, child.id));
			return view(sub, clock(context));
		}),

	/** Kartsız bir haftalık deneme (ADR-0014): çocuk başına bir kez, otomatik ücretlendirmeye dönmez. */
	startTrial: guardianProcedure
		.input(z.object({ childId: z.string() }))
		.handler(async ({ context, input }) => {
			const child = await resolveGuardianChild(context, input.childId);
			const now = clock(context);
			const [existing] = await context.db
				.select()
				.from(subscription)
				.where(eq(subscription.childId, child.id));
			if (existing)
				throw new ORPCError("CONFLICT", { message: "trial_already_used" });
			const [row] = await context.db
				.insert(subscription)
				.values({
					childId: child.id,
					status: "trial",
					trialStartedAt: now,
					trialEndsAt: trialEnd(now),
				})
				.returning();
			return view(row, now);
		}),

	/** İptal: ödenmiş dönemin sonuna kadar erişim sürer, plan verisi 6 ay saklanır (ADR-0014). */
	cancel: guardianProcedure
		.input(z.object({ childId: z.string() }))
		.handler(async ({ context, input }) => {
			const child = await resolveGuardianChild(context, input.childId);
			const now = clock(context);
			const [sub] = await context.db
				.select()
				.from(subscription)
				.where(eq(subscription.childId, child.id));
			if (!sub || sub.status === "canceled")
				throw new ORPCError("BAD_REQUEST", { message: "nothing_to_cancel" });
			const [row] = await context.db
				.update(subscription)
				.set({
					status: "canceled",
					canceledAt: now,
					currentPeriodEnd: sub.currentPeriodEnd ?? sub.trialEndsAt ?? now,
					retainUntil: retainUntil(now),
				})
				.where(eq(subscription.id, sub.id))
				.returning();
			return view(row, now);
		}),
};
