/**
 * ADR-0003: deneme verisi sağlayıcı arayüzü arkasından gelir.
 * Okulizyon toplayıcısı bu arayüzün yalnızca bir uygulamasıdır ve yalnızca ev içi
 * kullanım içindir. Ticari sürümde manuel giriş birinci sınıf bir uygulamadır.
 */
import type { Subject } from "./types";

export interface SubjectResult {
	subject: Subject;
	questions: number;
	correct: number;
	wrong: number;
	blank: number;
	net: number;
}

export type QuestionStatus = "correct" | "wrong" | "blank";

/** Soru bazlı konu/kazanım verisi en değerli alandır: plan kalitesi buna bağlı. */
export interface QuestionResult {
	subject: Subject;
	number: number;
	topic?: string;
	outcome?: string;
	givenAnswer?: string;
	correctAnswer?: string;
	status: QuestionStatus;
}

export interface ExamResult {
	id: string;
	name: string;
	/** YYYY-MM-DD */
	date: string;
	subjects: SubjectResult[];
	questions?: QuestionResult[];
	rank?: number;
	/** Yeniden ayrıştırma için ham yanıt, kaynağa tekrar gitmeden. */
	raw?: unknown;
}

export interface ExamProvider {
	readonly id: string;
	/** `since` (YYYY-MM-DD) sonrasındaki yeni sonuçlar. */
	fetchResults(since?: string): Promise<ExamResult[]>;
}
