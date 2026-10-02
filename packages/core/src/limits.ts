/** ADR-0009 ve ADR-0013: varsayılanlar ve tavsiye eşikleri. Bunlar engel değil, tavsiyedir. */
export const LIMITS = {
	defaultDailyBudgetMinutes: 90,
	warnAboveMinutes: 120,
	/** ADR "çok yüksek değerlerde daha açık uyarı" der, eşik belirtmez. Geçici değer. */
	strongWarnAboveMinutes: 180,
	/** Tavsiye edilen çalışma günü sayısı (Pazartesi-Cumartesi). */
	recommendedStudyDays: 6,
	/** Tavsiye edilen blok (kesintisiz dikkat) süresi aralığı. */
	recommendedBlockMinutes: { min: 25, max: 30 },
	defaultBlockMinutes: 30,
	/** ADR eşik belirtmez; uyarı için geçici sınırlar. */
	blockWarn: { below: 10, above: 45 },
	/** Matematik ve Türkçe için haftalık gün hedefi (garanti değil). */
	minMathAndTurkishDaysPerWeek: 3,
} as const;

export type AdviceLevel = "ok" | "warn" | "strong_warn" | "invalid";

export interface Advice {
	level: AdviceLevel;
	value: number;
}

/** Veli ayar ekranı korkuluğu: engellemez, uyarı seviyesi döner. */
export function checkDailyBudget(minutes: number): Advice {
	if (!Number.isFinite(minutes) || minutes <= 0) {
		return { level: "invalid", value: minutes };
	}
	if (minutes > LIMITS.strongWarnAboveMinutes) {
		return { level: "strong_warn", value: minutes };
	}
	if (minutes > LIMITS.warnAboveMinutes) {
		return { level: "warn", value: minutes };
	}
	return { level: "ok", value: minutes };
}

/** Çocuğun dikkat süresi için tavsiye. Çok kısa ya da çok uzun değerlerde uyarı, engel yok. */
export function checkBlockMinutes(minutes: number): Advice {
	if (!Number.isFinite(minutes) || minutes <= 0) {
		return { level: "invalid", value: minutes };
	}
	if (minutes < LIMITS.blockWarn.below || minutes > LIMITS.blockWarn.above) {
		return { level: "warn", value: minutes };
	}
	return { level: "ok", value: minutes };
}
