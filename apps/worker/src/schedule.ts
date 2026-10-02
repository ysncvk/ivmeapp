/**
 * Saf zamanlama mantığı: `now` dışarıdan verilir, saat okunmaz (test edilebilir).
 * Tüm saatler UTC. Yerel saat (Europe/Istanbul) dönüşümü işin kendi sorumluluğundadır.
 */
export type Schedule =
	| { every: "minutes"; n: number }
	| { daily: `${number}:${number}` }
	| { weekly: { day: number; at: `${number}:${number}` } };

const MINUTE = 60_000;
const DAY = 24 * 60 * MINUTE;

function parseTime(at: string): number {
	const [h, m] = at.split(":").map(Number);
	if (
		h === undefined ||
		m === undefined ||
		!Number.isInteger(h) ||
		!Number.isInteger(m) ||
		h < 0 ||
		h > 23 ||
		m < 0 ||
		m > 59
	) {
		throw new RangeError(`Geçersiz saat: ${at}`);
	}
	return (h * 60 + m) * MINUTE;
}

/** `after`'dan KESİNLİKLE sonraki ilk çalışma zamanı (ms, epoch). */
export function nextRun(schedule: Schedule, after: number): number {
	if ("every" in schedule) {
		if (!(schedule.n > 0)) throw new RangeError("n pozitif olmalı");
		const step = schedule.n * MINUTE;
		return (Math.floor(after / step) + 1) * step;
	}
	if ("daily" in schedule) {
		const offset = parseTime(schedule.daily);
		const dayStart = Math.floor(after / DAY) * DAY;
		const today = dayStart + offset;
		return today > after ? today : today + DAY;
	}
	const { day, at } = schedule.weekly;
	if (!Number.isInteger(day) || day < 0 || day > 6) {
		throw new RangeError("day 0 (Pazar) ile 6 (Cumartesi) arası olmalı");
	}
	const offset = parseTime(at);
	const dayStart = Math.floor(after / DAY) * DAY;
	// 1970-01-01 Perşembe (4): epoch gününden hafta günü.
	const weekdayOf = (dayStartMs: number) =>
		(Math.floor(dayStartMs / DAY) + 4) % 7;
	for (let i = 0; i <= 7; i++) {
		const start = dayStart + i * DAY;
		if (weekdayOf(start) !== day) continue;
		const candidate = start + offset;
		if (candidate > after) return candidate;
	}
	throw new Error("ulaşılamaz");
}
