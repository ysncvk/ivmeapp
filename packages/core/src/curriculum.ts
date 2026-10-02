/**
 * ADR-0004/0013: müfredat (yıllık plan) ayrı bir veri kümesidir. Bir ders için tema/ünite
 * sırası ve konuları tutar; motor "bu haftanın konusu" için bunu kitap konularıyla eşler.
 */
import type { Subject, WorkItem } from "./types";

export interface CurriculumTopic {
	title: string;
	/**
	 * Kitap konu adlarıyla eşleşme ifadeleri. Küçük harf ve aksan farkı gözetilmeden
	 * "içerir" olarak karşılaştırılır. Boşsa bu konu için kitapta eşleşme yoktur.
	 */
	match?: string[];
}

export interface CurriculumUnit {
	id: string;
	/** Yıl içindeki sıra, 1'den başlar. */
	order: number;
	title: string;
	/** Ünitenin ders saati (programda belirtilmişse). */
	hours?: number;
	topics: CurriculumTopic[];
}

export interface CurriculumOutcome {
	/** Kazanım kodu, örn. "FB.6.2.1.1". */
	code: string;
	title: string;
}

export interface CurriculumWeek {
	/** Eğitim yılı içindeki hafta numarası, 1'den başlar. */
	week: number;
	/** Pazartesi, YYYY-MM-DD. */
	start: string;
	/** Cuma, YYYY-MM-DD. */
	end: string;
	/** Ders saati, programdaki gibi (örn. "4", "2+2"). */
	hours: string;
	/** Haftada işlenen üniteler (genellikle bir, ünite geçişinde iki). */
	unitIds: string[];
	/** Ünite konularından (`CurriculumTopic.title`) bu hafta işlenenler. */
	topics: string[];
	outcomes: CurriculumOutcome[];
	/** Okul temelli planlamaya ayrılan saat. */
	otpHours?: number;
	note?: string;
}

/** Tarih aralığı: tatil, bayram ya da sınav dönemi (uçlar dahil). */
export interface CurriculumPeriod {
	title: string;
	start: string;
	end: string;
}

export interface Curriculum {
	id: string;
	subject: Subject;
	grade: number;
	/** Eğitim yılı, örn. "2026-2027". */
	year: string;
	source: string;
	/** Haftalık ders saati (programda belirtilmişse). */
	weeklyHours?: number;
	/** Okul temelli planlamaya ayrılan saat; ünitelere dahil değildir. */
	schoolBasedHours?: number;
	units: CurriculumUnit[];
	/** Hafta hafta yıllık plan (varsa). Tatil haftaları listede yoktur. */
	weeks?: CurriculumWeek[];
	/** Ara tatiller ve bayramlar. */
	breaks?: CurriculumPeriod[];
	/** Okul sınav dönemleri. */
	examPeriods?: CurriculumPeriod[];
}

const FOLD: Record<string, string> = {
	ç: "c",
	ğ: "g",
	ı: "i",
	ö: "o",
	ş: "s",
	ü: "u",
	â: "a",
	î: "i",
	û: "u",
};

/** Türkçe küçük harfe çevirir ve aksanları kaldırır: "Hikâye Unsurları" -> "hikaye unsurlari". */
export function normalizeTr(text: string): string {
	return text
		.toLocaleLowerCase("tr")
		.replace(/[çğıöşüâîû]/g, (ch) => FOLD[ch] ?? ch);
}

/**
 * Konu ifadeleri ve parantez içinde ünite başlığı: kitaplardaki "Bağlam Temelli Sorular
 * (Ünite Başlığı)" testleri başlığı parantez içinde taşır. Başlık serbest ifade olarak
 * kullanılmaz, aksi halde başka ünitenin konusuna yanlış eşleşir.
 */
function phrases(unit: CurriculumUnit): string[] {
	return [`(${unit.title})`, ...unit.topics.flatMap((t) => t.match ?? [])].map(
		normalizeTr,
	);
}

/** Ünitenin yaklaşık süresi, hafta olarak (ders saati ve haftalık saat varsa). */
export function unitWeeks(
	curriculum: Curriculum,
	unit: CurriculumUnit,
): number | undefined {
	if (!unit.hours || !curriculum.weeklyHours) return undefined;
	return unit.hours / curriculum.weeklyHours;
}

export interface WeeklyPool {
	/** Ünitenin konularıyla eşleşen işler, kitap sırasıyla. */
	matched: WorkItem[];
	/** Eşleşmeyen işler, kitap sırasıyla. */
	others: WorkItem[];
	/** Motora verilecek havuz: önce eşleşenler, sonra kalanlar. */
	items: WorkItem[];
}

/**
 * Bir ünite için haftalık havuz: ünite konularıyla eşleşen kitap işleri öne alınır,
 * eşleşmeyenler ders-içi tekrar/beceri çalışması olarak arkada sıralanır. Hiçbir iş
 * düşürülmez (kitabın tümü kullanılabilir kalır).
 */
export function weeklyPool(
	unit: CurriculumUnit,
	items: readonly WorkItem[],
): WeeklyPool {
	return poolFrom(phrases(unit), items);
}

/** İfade listesine göre havuzu böler: eşleşenler öne, kalanlar arkaya, hiçbiri düşmez. */
function poolFrom(
	keys: readonly string[],
	items: readonly WorkItem[],
): WeeklyPool {
	const matched: WorkItem[] = [];
	const others: WorkItem[] = [];
	for (const item of items) {
		const topic = normalizeTr(item.topic);
		(keys.some((k) => topic.includes(k)) ? matched : others).push(item);
	}
	return { matched, others, items: [...matched, ...others] };
}

/** Veri girişi hatalarını yakalar: boş dizi geçerli demektir. */
export function validateCurriculum(c: Curriculum): string[] {
	const errors: string[] = [];
	const ids = new Set<string>();
	c.units.forEach((u, i) => {
		if (ids.has(u.id)) errors.push(`Tekrarlanan ünite: ${u.id}`);
		ids.add(u.id);
		if (u.order !== i + 1)
			errors.push(`${u.id}: sıra ${u.order}, beklenen ${i + 1}`);
		if (u.topics.length === 0) errors.push(`${u.id}: konu yok`);
	});
	const unitIds = new Set(c.units.map((u) => u.id));
	(c.weeks ?? []).forEach((w, i) => {
		if (w.week !== i + 1)
			errors.push(`Hafta ${w.week}: sıra ${i + 1} bekleniyordu`);
		if (w.start > w.end)
			errors.push(`Hafta ${w.week}: başlangıç bitişten sonra`);
		if (i > 0 && (c.weeks?.[i - 1]?.end ?? "") >= w.start) {
			errors.push(`Hafta ${w.week}: önceki haftayla çakışıyor`);
		}
		if (w.unitIds.length === 0) errors.push(`Hafta ${w.week}: ünite yok`);
		if (w.outcomes.length === 0) errors.push(`Hafta ${w.week}: kazanım yok`);
		for (const id of w.unitIds) {
			if (!unitIds.has(id))
				errors.push(`Hafta ${w.week}: bilinmeyen ünite ${id}`);
		}
		for (const title of w.topics) {
			const known = c.units
				.filter((u) => w.unitIds.includes(u.id))
				.some((u) =>
					u.topics.some((t) => normalizeTr(t.title) === normalizeTr(title)),
				);
			if (!known)
				errors.push(`Hafta ${w.week}: ünite konularında yok: ${title}`);
		}
	});
	const hours =
		c.units.reduce((sum, u) => sum + (u.hours ?? 0), 0) +
		(c.schoolBasedHours ?? 0);
	if (c.units.every((u) => u.hours !== undefined) && hours === 0) {
		errors.push("Ders saatleri toplamı sıfır");
	}
	return errors;
}

function addDays(iso: string, n: number): string {
	const d = new Date(`${iso}T00:00:00Z`);
	d.setUTCDate(d.getUTCDate() + n);
	return d.toISOString().slice(0, 10);
}

/** Tarihe (YYYY-MM-DD) denk gelen hafta; hafta sonu da o haftaya sayılır. Tatilde yoktur. */
export function weekFor(
	c: Curriculum,
	date: string,
): CurriculumWeek | undefined {
	return c.weeks?.find((w) => w.start <= date && date <= addDays(w.end, 2));
}

/** Tarih verilen dönemlerden birindeyse o dönem (tatil, sınav haftası). */
export function periodFor(
	periods: readonly CurriculumPeriod[] | undefined,
	date: string,
): CurriculumPeriod | undefined {
	return periods?.find((p) => p.start <= date && date <= p.end);
}

/** Bir ünitenin işlendiği son hafta; ünite sonu "Bağlam Temelli" testler için. */
function lastWeekOf(c: Curriculum, unitId: string): number | undefined {
	const weeks = (c.weeks ?? []).filter((w) => w.unitIds.includes(unitId));
	return weeks.length > 0 ? Math.max(...weeks.map((w) => w.week)) : undefined;
}

/**
 * Haftanın konularına göre kitap havuzu: haftanın konularıyla eşleşen testler öne alınır;
 * ünitenin son haftasında ünite sonu "Bağlam Temelli" testler de eşleşir.
 */
export function weekPool(
	c: Curriculum,
	week: CurriculumWeek,
	items: readonly WorkItem[],
): WeeklyPool {
	const keys: string[] = [];
	for (const title of week.topics) {
		const t = normalizeTr(title);
		for (const unit of c.units) {
			for (const topic of unit.topics) {
				if (normalizeTr(topic.title) === t) keys.push(...(topic.match ?? []));
			}
		}
	}
	for (const id of week.unitIds) {
		const unit = c.units.find((u) => u.id === id);
		if (unit && lastWeekOf(c, id) === week.week) keys.push(`(${unit.title})`);
	}
	return poolFrom(keys.map(normalizeTr), items);
}
