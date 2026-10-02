/**
 * ADR-0016: ödül hedefi görev tamamlama oranına bağlıdır (doğru sayısı, net ya da süre
 * değil). Saf fonksiyon: girdi tamamlama durumu, çıktı ödül ilerlemesi.
 */
export interface RewardProgressInput {
	completed: number;
	total: number;
	/** Gereken tamamlama oranı, (0, 1]. Örn. 0.8 = görevlerin %80'i. */
	threshold: number;
}

export interface RewardProgress {
	/** Ödülün açılması için tamamlanması gereken görev sayısı. */
	target: number;
	completed: number;
	/** Ödüle kalan görev sayısı. */
	remaining: number;
	/** 0..1, çubuk için. */
	ratio: number;
	unlocked: boolean;
}

export function rewardProgress(input: RewardProgressInput): RewardProgress {
	const { completed, total, threshold } = input;
	if (!(threshold > 0 && threshold <= 1)) {
		throw new RangeError("threshold (0, 1] aralığında olmalı");
	}
	if (completed < 0 || total < 0 || completed > total) {
		throw new RangeError("0 <= completed <= total olmalı");
	}
	// Görev yoksa ödül de açılmaz: boş hafta bedava ödül vermez.
	if (total === 0) {
		return { target: 0, completed, remaining: 0, ratio: 0, unlocked: false };
	}
	const target = Math.max(1, Math.ceil(total * threshold));
	return {
		target,
		completed,
		remaining: Math.max(0, target - completed),
		ratio: Math.min(1, completed / target),
		unlocked: completed >= target,
	};
}
