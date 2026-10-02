/**
 * Tarih yardımcıları: ISO tarih metinleri (YYYY-MM-DD) üzerinde, saat dilimi ve yerel saatten
 * bağımsız (UTC) hesap. Motor tarih hesabı yapmaz; çağıran taraf bunları kullanır.
 */

function toDate(iso: string): Date {
	const d = new Date(`${iso}T00:00:00Z`);
	if (Number.isNaN(d.getTime())) throw new RangeError(`Geçersiz tarih: ${iso}`);
	return d;
}

export function addDays(iso: string, n: number): string {
	const d = toDate(iso);
	d.setUTCDate(d.getUTCDate() + n);
	return d.toISOString().slice(0, 10);
}

/** ISO hafta günü: 1 = Pazartesi ... 7 = Pazar. */
export function isoWeekday(iso: string): number {
	const d = toDate(iso).getUTCDay();
	return d === 0 ? 7 : d;
}

/** Tarihin içinde bulunduğu haftanın Pazartesi'si. */
export function mondayOf(iso: string): string {
	return addDays(iso, -(isoWeekday(iso) - 1));
}

/** İki tarih arasındaki tam hafta sayısı (b - a). */
export function weeksBetween(a: string, b: string): number {
	return Math.round(
		(toDate(b).getTime() - toDate(a).getTime()) / (7 * 86_400_000),
	);
}

/** Date nesnesini UTC ISO tarih metnine çevirir. */
export function isoDate(d: Date): string {
	return d.toISOString().slice(0, 10);
}

/** Türkiye saati (UTC+3, yaz saati uygulaması yok) ile bugünün ISO tarihi. */
export function istanbulDate(now: Date): string {
	return isoDate(new Date(now.getTime() + 3 * 3_600_000));
}
