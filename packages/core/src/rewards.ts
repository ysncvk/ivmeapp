/**
 * ADR-0016: ödül dönemleri. Günlük: bugün; haftalık: bu hafta (Pazartesi-Pazar); büyük ödül:
 * eğitim yılı başından itibaren 4 haftalık bloklar. Dönem anahtarı, ödülün aynı dönem için
 * ikinci kez verilmemesini sağlar.
 */
import { addDays, mondayOf, weeksBetween } from "./dates";

export type RewardTier = "daily" | "weekly" | "milestone";

export const MILESTONE_WEEKS = 4;

export interface RewardPeriod {
	/** Aynı dönemi tanımlayan kararlı anahtar. */
	key: string;
	/** Dönemin ilk ve son günü (uçlar dahil, ISO). */
	start: string;
	end: string;
}

/**
 * @param today Bugünün ISO tarihi
 * @param schoolStart Eğitim yılının ilk Pazartesi'si (büyük ödül blokları buradan sayılır)
 */
export function rewardPeriod(
	tier: RewardTier,
	today: string,
	schoolStart: string,
): RewardPeriod {
	if (tier === "daily") return { key: today, start: today, end: today };
	const monday = mondayOf(today);
	if (tier === "weekly")
		return { key: monday, start: monday, end: addDays(monday, 6) };
	const weeks = Math.max(0, weeksBetween(mondayOf(schoolStart), monday));
	const block = Math.floor(weeks / MILESTONE_WEEKS);
	const start = addDays(mondayOf(schoolStart), block * MILESTONE_WEEKS * 7);
	return {
		key: `m${block}`,
		start,
		end: addDays(start, MILESTONE_WEEKS * 7 - 1),
	};
}
