import {
	type RewardProgress,
	type RewardTier,
	rewardPeriod,
	rewardProgress,
} from "@ivmeapp/core";
import type { Database } from "@ivmeapp/db";
import { reward, rewardGrant } from "@ivmeapp/db/schema/domain";
import { and, eq } from "drizzle-orm";

import { SCHOOL_START } from "../catalog";
import { completionStats } from "./plan";

export interface RewardView {
	id: string;
	tier: RewardTier;
	title: string;
	threshold: number;
	periodKey: string;
	periodStart: string;
	periodEnd: string;
	progress: RewardProgress;
	granted: boolean;
}

/** Çocuğun ödülleri ve bugünkü ilerlemeleri (ADR-0016: hedef tamamlama oranı). */
export async function rewardOverview(
	db: Database,
	childId: string,
	today: string,
): Promise<RewardView[]> {
	const rows = await db
		.select()
		.from(reward)
		.where(and(eq(reward.childId, childId), eq(reward.active, true)));
	const order: RewardTier[] = ["daily", "weekly", "milestone"];
	const out: RewardView[] = [];
	for (const r of rows.sort(
		(a, b) => order.indexOf(a.tier) - order.indexOf(b.tier),
	)) {
		const period = rewardPeriod(r.tier, today, SCHOOL_START);
		const stats = await completionStats(db, childId, period.start, period.end);
		const progress = rewardProgress({
			completed: Math.min(stats.done, stats.total),
			total: stats.total,
			threshold: r.threshold,
		});
		const [grant] = await db
			.select({ id: rewardGrant.id })
			.from(rewardGrant)
			.where(
				and(
					eq(rewardGrant.rewardId, r.id),
					eq(rewardGrant.periodKey, period.key),
				),
			);
		out.push({
			id: r.id,
			tier: r.tier,
			title: r.title,
			threshold: r.threshold,
			periodKey: period.key,
			periodStart: period.start,
			periodEnd: period.end,
			progress,
			granted: !!grant,
		});
	}
	return out;
}
