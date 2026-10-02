/**
 * ADR-0014: gün gün plan ücretlidir; ödev takibi ve teşhis ücretsizdir. Abonelik çocuk
 * başınadır. Kartsız bir haftalık deneme otomatik ücretlendirmeye dönmez.
 */
export const TRIAL_DAYS = 7;
/** İptalden sonra plan verisinin tutulacağı süre (ADR-0014 güncellemesi), gün olarak. */
export const RETAIN_DAYS_AFTER_CANCEL = 183;

export interface SubscriptionState {
	status: "trial" | "active" | "canceled";
	trialEndsAt?: Date | null;
	currentPeriodEnd?: Date | null;
}

/** Plan özelliklerine (plan üretimi, taşıma, ayarlar) erişim var mı? */
export function hasPlanAccess(
	sub: SubscriptionState | null | undefined,
	now: Date,
): boolean {
	if (!sub) return false;
	switch (sub.status) {
		case "trial":
			return !!sub.trialEndsAt && sub.trialEndsAt > now;
		case "active":
			// Dönem sonu bilinmiyorsa (örn. sağlayıcı henüz bildirmedi) aktif sayılır.
			return !sub.currentPeriodEnd || sub.currentPeriodEnd > now;
		case "canceled":
			// İptal edilen abonelik, ödenmiş dönemin sonuna kadar sürer.
			return !!sub.currentPeriodEnd && sub.currentPeriodEnd > now;
	}
}

/** Kartsız deneme bitiş tarihi. */
export function trialEnd(start: Date): Date {
	return new Date(start.getTime() + TRIAL_DAYS * 86_400_000);
}

/** İptal sonrası verinin tutulacağı son tarih. */
export function retainUntil(canceledAt: Date): Date {
	return new Date(canceledAt.getTime() + RETAIN_DAYS_AFTER_CANCEL * 86_400_000);
}
