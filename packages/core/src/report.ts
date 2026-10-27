/**
 * Veli haftalık raporu (ADR-0006/0008): ücretsiz katmandaki "ne oldu" özeti. Saf fonksiyon: girdi
 * haftanın günlük kayıtları, çıktı sayılar ve veliye okunacak/paylaşılacak Türkçe metin. Süre
 * ölçü değildir (ADR-0009); çalışılan gün ve çözülen soru öndedir. Seri (streak) yoktur
 * (ADR-0016: kaçırılan günü cezalandırır).
 */
import { addDays } from "./dates";
import type { Subject } from "./types";

export interface ReportDay {
	date: string;
	/** Çocuğun çalışma günü mü (ayar). Çalışma günü olmayan gün hedefe sayılmaz. */
	studyDay: boolean;
	/** O günün soru hedefi (ders hedeflerinin toplamı). */
	goal: number;
	solved: number;
	/** Koçluk planındaki test görevleri (ödev hariç). */
	tasksDone: number;
	tasksTotal: number;
}

export interface ReportSubject {
	subject: Subject;
	/** Bugüne kadarki (bugün dahil) hedef toplamı. */
	goal: number;
	solved: number;
}

export interface WeekReportInput {
	name: string;
	/** Haftanın Pazartesi'si. */
	weekStart: string;
	today: string;
	/** Haftanın 7 günü, Pazartesi'den. */
	days: readonly ReportDay[];
	subjects: readonly ReportSubject[];
	/** Önceki haftanın toplam çözülen sorusu; kayıt yoksa null. */
	previousSolved: number | null;
	homework: { done: number; open: number; overdue: number };
	exam?: { name: string; netTotal: number; netDelta: number | null };
}

export type ReportLevel = "none" | "starting" | "good" | "on_target";

export interface WeekReport {
	/** Bugüne kadar geçen (bugün dahil) çalışma günü sayısı. */
	studyDaysSoFar: number;
	/** Bugüne kadar en az bir soru ya da test kaydı olan gün sayısı. */
	activeDays: number;
	solved: number;
	/** Bugüne kadarki hedef toplamı. */
	goalSoFar: number;
	/** Bugüne kadarki hedefin tamamlanma oranı, 0..1+ (hedef yoksa null). */
	ratio: number | null;
	deltaVsPrevious: number | null;
	tasksDone: number;
	tasksTotal: number;
	strongest?: Subject;
	weakest?: Subject;
	level: ReportLevel;
	headline: string;
	lines: string[];
	/** WhatsApp ya da e-postaya yapıştırılabilir düz metin. */
	shareText: string;
}

const MONTHS = [
	"Ocak",
	"Şubat",
	"Mart",
	"Nisan",
	"Mayıs",
	"Haziran",
	"Temmuz",
	"Ağustos",
	"Eylül",
	"Ekim",
	"Kasım",
	"Aralık",
];
const SUBJECT_LABEL: Record<Subject, string> = {
	matematik: "Matematik",
	turkce: "Türkçe",
	fen: "Fen Bilimleri",
	sosyal: "Sosyal Bilgiler",
	ingilizce: "İngilizce",
};

/** "5 Ekim – 11 Ekim" biçimi. */
export function weekLabel(weekStart: string): string {
	const fmt = (iso: string) => {
		const [, m, d] = iso.split("-");
		return `${Number(d)} ${MONTHS[Number(m) - 1] ?? ""}`;
	};
	return `${fmt(weekStart)} – ${fmt(addDays(weekStart, 6))}`;
}

const pct = (r: number) => `%${Math.round(r * 100)}`;
const signed = (n: number) => (n > 0 ? `+${n}` : `${n}`);

export function weekReport(input: WeekReportInput): WeekReport {
	const { name, today } = input;
	const sofar = input.days.filter((d) => d.date <= today);
	const studySofar = sofar.filter((d) => d.studyDay);
	const solved = sofar.reduce((n, d) => n + d.solved, 0);
	const goalSoFar = studySofar.reduce((n, d) => n + d.goal, 0);
	const activeDays = sofar.filter(
		(d) => d.solved > 0 || d.tasksDone > 0,
	).length;
	const tasksDone = input.days.reduce((n, d) => n + d.tasksDone, 0);
	const tasksTotal = input.days.reduce((n, d) => n + d.tasksTotal, 0);
	const ratio = goalSoFar > 0 ? solved / goalSoFar : null;
	const deltaVsPrevious =
		input.previousSolved === null ? null : solved - input.previousSolved;

	// Ders kıyası yalnızca en az iki hedefli ders varsa anlamlıdır
	const ranked = input.subjects
		.filter((s) => s.goal > 0)
		.map((s) => ({ subject: s.subject, r: s.solved / s.goal }))
		.sort((a, b) => b.r - a.r);
	const top = ranked[0];
	const bottom = ranked.at(-1);
	// Oranlar birbirine yakınsa ders kıyası gürültüdür: en az 15 puan fark ararız
	const compare =
		ranked.length >= 2 && top && bottom && top.r - bottom.r >= 0.15;
	const strongest = compare ? top : undefined;
	const weakest = compare ? bottom : undefined;

	const level: ReportLevel =
		ratio === null && tasksTotal === 0
			? "none"
			: ratio !== null && ratio >= 0.9
				? "on_target"
				: ratio !== null && ratio >= 0.6
					? "good"
					: "starting";

	// Sayılara ek getirmeyen cümleler: Türkçe ek uyumu (3'ünde / 3'inde, %50'si / %50'i) sayıya bağlı
	const headline =
		solved === 0 && activeDays === 0
			? `${name} için bu hafta henüz çalışma kaydı yok.`
			: `${name} bu hafta ${activeDays} gün çalıştı (bugüne kadar ${studySofar.length} çalışma günü), ${solved} soru çözdü.`;

	const lines: string[] = [];
	if (ratio !== null) {
		lines.push(
			`Bugüne kadarki hedefin tamamlanma oranı: ${pct(ratio)} (${solved}/${goalSoFar} soru).`,
		);
	}
	if (deltaVsPrevious !== null) {
		lines.push(
			deltaVsPrevious === 0
				? "Geçen haftayla aynı tempoda."
				: `Geçen haftaya göre ${signed(deltaVsPrevious)} soru.`,
		);
	}
	if (strongest && weakest && strongest.subject !== weakest.subject) {
		lines.push(
			`En çok ilerleyen ders: ${SUBJECT_LABEL[strongest.subject]} (${pct(strongest.r)}). Geride kalan: ${SUBJECT_LABEL[weakest.subject]} (${pct(weakest.r)}).`,
		);
	}
	if (tasksTotal > 0) {
		lines.push(`Önerilen testlerden ${tasksDone}/${tasksTotal} yapıldı.`);
	}
	const hw = input.homework;
	if (hw.done + hw.open > 0) {
		lines.push(
			`Ödev: ${hw.done} tamamlandı, ${hw.open} açık${hw.overdue > 0 ? `, ${hw.overdue} gecikmiş` : ""}.`,
		);
	}
	if (input.exam) {
		const d = input.exam.netDelta;
		lines.push(
			`Son deneme (${input.exam.name}): toplam net ${input.exam.netTotal}${d === null ? "" : ` (öncekine göre ${signed(d)})`}.`,
		);
	}
	// Tavsiye: yargılamadan, sürdürülebilirlik odaklı (ADR-0009)
	if (level === "starting" && goalSoFar > 0) {
		lines.push(
			"Hedef yüksek geliyorsa günlük soru sayısını biraz azaltmak, her gün çalışmayı kolaylaştırır: önemli olan kaç gün çalışıldığı.",
		);
	} else if (level === "on_target") {
		lines.push("Tempo çok iyi, hedefi şimdilik sabit tutabilirsiniz.");
	}

	const shareText = [
		`İvme haftalık özet (${weekLabel(input.weekStart)})`,
		headline,
		...lines,
	].join("\n");

	return {
		studyDaysSoFar: studySofar.length,
		activeDays,
		solved,
		goalSoFar,
		ratio,
		deltaVsPrevious,
		tasksDone,
		tasksTotal,
		strongest: strongest?.subject,
		weakest: weakest?.subject,
		level,
		headline,
		lines,
		shareText,
	};
}
