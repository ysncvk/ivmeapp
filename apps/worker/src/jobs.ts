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

/**
 * İş kaydı. Şimdilik boş: gerçek işler veri modeli gelince eklenir.
 * Planlananlar:
 *  - provider-sync: gece, ExamProvider (ADR-0003) üzerinden yeni deneme sonuçları
 *  - weekly-plan:   Pazar akşamı, gelecek haftanın planı (ADR-0005, hafta içinde değişmez)
 */
export const jobs: readonly Job[] = [];
