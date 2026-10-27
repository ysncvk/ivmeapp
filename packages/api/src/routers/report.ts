import { istanbulDate, mondayOf } from "@ivmeapp/core";
import { z } from "zod";

import { resolveGuardianChild } from "../authz";
import { clock } from "../context";
import { guardianProcedure } from "../index";
import { buildWeekReport, examPoints, weeklyHistory } from "../services/report";

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

/**
 * Veli raporları (ADR-0006/0008): haftalık özet, soru ve test gidişatı, deneme trendi. Ücretsiz
 * katman: bunlar "ne oldu" tarafıdır (teşhis), "ne yapmalı" (konu haritası, plan) ücretlidir.
 */
export const reportRouter = {
	week: guardianProcedure
		.input(z.object({ childId: z.string(), weekStart: isoDate.optional() }))
		.handler(async ({ context, input }) => {
			const child = await resolveGuardianChild(context, input.childId);
			const now = clock(context);
			const weekStart = mondayOf(input.weekStart ?? istanbulDate(now));
			return buildWeekReport(context.db, child, weekStart, now);
		}),

	history: guardianProcedure
		.input(z.object({ childId: z.string() }))
		.handler(async ({ context, input }) => {
			const child = await resolveGuardianChild(context, input.childId);
			const now = clock(context);
			const today = istanbulDate(now);
			return {
				weeks: await weeklyHistory(context.db, child, mondayOf(today), today),
				exams: await examPoints(context.db, child.id),
			};
		}),
};
