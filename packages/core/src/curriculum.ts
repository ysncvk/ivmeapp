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
	const keys = phrases(unit);
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
	const hours =
		c.units.reduce((sum, u) => sum + (u.hours ?? 0), 0) +
		(c.schoolBasedHours ?? 0);
	if (c.units.every((u) => u.hours !== undefined) && hours === 0) {
		errors.push("Ders saatleri toplamı sıfır");
	}
	return errors;
}
