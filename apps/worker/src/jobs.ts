import {
	generateUpcomingPlans,
	purgeExpiredPlanData,
} from "@ivmeapp/api/services/maintenance";
import { createDb } from "@ivmeapp/db";

import type { Schedule } from "./schedule";

export interface JobContext {
	/** Çalıştırma anı (epoch ms). İşler `Date.now()` çağırmaz. */
	now: number;
	log: (message: string) => void;
}

export interface Job {
	name: string;
	schedule: Schedule;
	run: (ctx: JobContext) => Promise<void>;
}

let db: ReturnType<typeof createDb> | undefined;
function database() {
	const url = process.env.DATABASE_URL;
	if (!url) throw new Error("DATABASE_URL tanımlı değil");
	db ??= createDb({ DATABASE_URL: url });
	return db;
}

/**
 * Tüm saatler UTC. Pazar 18:00 İstanbul = 15:00 UTC.
 *  - weekly-plan:    Pazar akşamı gelecek haftanın planı (ADR-0005, hafta içinde değişmez)
 *  - retention:      gece, saklama süresi dolan plan verisinin silinmesi (ADR-0014)
 * provider-sync (ADR-0003) v2'de, deneme sağlayıcısı geldiğinde eklenir.
 */
export const jobs: readonly Job[] = [
	{
		name: "weekly-plan",
		schedule: { weekly: { day: 0, at: "15:00" } },
		run: async ({ now, log }) => {
			const r = await generateUpcomingPlans(database(), new Date(now), log);
			log(
				`weekly-plan: ${r.created} kuruldu, ${r.skipped} atlandı, ${r.failed} hata`,
			);
		},
	},
	{
		name: "retention",
		schedule: { daily: "00:30" },
		run: async ({ now, log }) => {
			const r = await purgeExpiredPlanData(database(), new Date(now));
			log(`retention: ${r.children} çocuğun plan verisi silindi`);
		},
	},
];
