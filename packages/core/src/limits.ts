/** ADR-0009: çalışma yükü sınırları. */
export const LIMITS = {
	defaultDailyBudgetMinutes: 90,
	warnAboveMinutes: 120,
	/** ADR "çok yüksek değerlerde daha açık uyarı" der, eşik belirtmez. Geçici değer. */
	strongWarnAboveMinutes: 180,
	maxStudyDaysPerWeek: 5,
	maxTasksPerDay: 3,
	blockMinutes: { min: 20, max: 30 },
	block3Minutes: { min: 20, max: 25 },
	minMathAndTurkishDaysPerWeek: 3,
} as const;

export type BudgetLevel = "ok" | "warn" | "strong_warn" | "invalid";

export interface BudgetCheck {
	level: BudgetLevel;
	minutes: number;
}

/** Veli ayar ekranı için korkuluk: engellemez, uyarı seviyesi döner. */
export function checkDailyBudget(minutes: number): BudgetCheck {
	if (!Number.isFinite(minutes) || minutes <= 0) {
		return { level: "invalid", minutes };
	}
	if (minutes > LIMITS.strongWarnAboveMinutes) {
		return { level: "strong_warn", minutes };
	}
	if (minutes > LIMITS.warnAboveMinutes) {
		return { level: "warn", minutes };
	}
	return { level: "ok", minutes };
}
