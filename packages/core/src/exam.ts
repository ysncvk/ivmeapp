/**
 * ADR-0006/0015: ücretsiz teşhis. Manuel girilen deneme sonuçlarından ders bazında net, trend ve
 * "kaç denemedir zayıf" bilgisi üretir. Saf fonksiyonlar.
 */
import type { Subject } from "./types";

/** 3 yanlış 1 doğruyu götürür (LGS/deneme usulü). */
export function net(correct: number, wrong: number): number {
	return Math.round((correct - wrong / 3) * 100) / 100;
}

export interface ExamSubjectInput {
	subject: Subject;
	questions: number;
	correct: number;
	wrong: number;
}

/** Giriş hatalarını yakalar: boş dizi geçerli demektir. Boş sayısı türetilir. */
export function validateExamSubject(s: ExamSubjectInput): string[] {
	const errors: string[] = [];
	for (const [key, value] of Object.entries({
		questions: s.questions,
		correct: s.correct,
		wrong: s.wrong,
	})) {
		if (!Number.isInteger(value) || value < 0)
			errors.push(`${s.subject}: ${key} geçersiz`);
	}
	if (s.questions === 0) errors.push(`${s.subject}: soru sayısı sıfır olamaz`);
	if (s.correct + s.wrong > s.questions) {
		errors.push(`${s.subject}: doğru + yanlış soru sayısını aşıyor`);
	}
	return errors;
}

export interface ExamSubjectResult extends ExamSubjectInput {
	blank: number;
	net: number;
}

export function subjectResult(s: ExamSubjectInput): ExamSubjectResult {
	return {
		...s,
		blank: s.questions - s.correct - s.wrong,
		net: net(s.correct, s.wrong),
	};
}

export interface ExamSummary {
	id: string;
	name: string;
	/** YYYY-MM-DD */
	date: string;
	subjects: ExamSubjectResult[];
	weakTopics: { subject: Subject; topic: string }[];
}

export interface WeakTopicStat {
	subject: Subject;
	topic: string;
	/** Bu konunun zayıf işaretlendiği deneme sayısı. */
	exams: number;
	lastDate: string;
}

export interface Diagnosis {
	latest?: ExamSummary;
	/** Ders başına tarih sıralı net serisi. */
	trend: Partial<Record<Subject, { date: string; net: number }[]>>;
	/** Zayıf konular: çok denemede tekrar edenler önde. */
	weakTopics: WeakTopicStat[];
}

export function analyzeExams(exams: readonly ExamSummary[]): Diagnosis {
	const sorted = [...exams].sort(
		(a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id),
	);
	const trend: Diagnosis["trend"] = {};
	const weak = new Map<string, WeakTopicStat>();
	for (const exam of sorted) {
		for (const s of exam.subjects) {
			(trend[s.subject] ??= []).push({ date: exam.date, net: s.net });
		}
		for (const w of exam.weakTopics) {
			const key = `${w.subject}\u0000${w.topic.toLocaleLowerCase("tr")}`;
			const prev = weak.get(key);
			weak.set(key, {
				subject: w.subject,
				topic: prev?.topic ?? w.topic,
				exams: (prev?.exams ?? 0) + 1,
				lastDate: exam.date,
			});
		}
	}
	return {
		latest: sorted.at(-1),
		trend,
		weakTopics: [...weak.values()].sort(
			(a, b) =>
				b.exams - a.exams ||
				b.lastDate.localeCompare(a.lastDate) ||
				a.topic.localeCompare(b.topic, "tr"),
		),
	};
}
