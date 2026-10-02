/** Arka plan işlerinin mantığı (worker çağırır). `db` ve `now` dışarıdan gelir; testlenebilir. */
import {
	addDays,
	hasPlanAccess,
	istanbulDate,
	mondayOf,
	RETAIN_DAYS_AFTER_CANCEL,
} from "@ivmeapp/core";
import type { Database } from "@ivmeapp/db";
import { child, plan, subscription } from "@ivmeapp/db/schema/domain";
import { and, eq, inArray } from "drizzle-orm";

import { ensurePlan } from "./plan";

/**
 * Pazar akşamı: planı erişimi olan çocuklar için gelecek haftanın planını kurar (ADR-0005).
 * Plan zaten varsa dokunmaz; bir çocuğun hatası diğerlerini durdurmaz.
 */
export async function generateUpcomingPlans(
	db: Database,
	now: Date,
	log: (message: string) => void = () => {},
): Promise<{ created: number; skipped: number; failed: number }> {
	const nextWeek = addDays(mondayOf(istanbulDate(now)), 7);
	const rows = await db
		.select({ c: child, sub: subscription })
		.from(child)
		.innerJoin(subscription, eq(subscription.childId, child.id));
	const out = { created: 0, skipped: 0, failed: 0 };
	for (const { c, sub } of rows) {
		if (!hasPlanAccess(sub, now)) {
			out.skipped++;
			continue;
		}
		try {
			const [before] = await db
				.select({ id: plan.id })
				.from(plan)
				.where(and(eq(plan.childId, c.id), eq(plan.weekStart, nextWeek)));
			if (before) {
				out.skipped++;
				continue;
			}
			await ensurePlan(db, c, nextWeek, now);
			out.created++;
		} catch (error) {
			out.failed++;
			log(`plan kurulamadı child=${c.id}: ${(error as Error).message}`);
		}
	}
	return out;
}

/**
 * Saklama süresi dolan plan verisini siler (ADR-0014: iptalden/denemeden 6 ay sonra).
 * Ödev, deneme ve ödül kayıtları ücretsiz katmandadır ve silinmez.
 */
export async function purgeExpiredPlanData(
	db: Database,
	now: Date,
): Promise<{ children: number }> {
	const trialCutoff = new Date(
		now.getTime() - RETAIN_DAYS_AFTER_CANCEL * 86_400_000,
	);
	const subs = await db.select().from(subscription);
	const expired = subs
		.filter((s) => !hasPlanAccess(s, now))
		.filter((s) =>
			s.status === "trial"
				? !!s.trialEndsAt && s.trialEndsAt < trialCutoff
				: !!s.retainUntil && s.retainUntil < now,
		)
		.map((s) => s.childId);
	if (expired.length === 0) return { children: 0 };
	// plan silinince görevleri ve olay kayıtları zincirleme silinir
	await db.delete(plan).where(inArray(plan.childId, expired));
	return { children: expired.length };
}
