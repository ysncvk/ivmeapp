/**
 * ADR-0004: kaynak kütüphanesi. Yalnızca olgusal yapı tutulur (konu, sayfa, test no,
 * soru sayısı); soru metni, görsel ve çözüm kütüphaneye girmez.
 */
import type { Subject, WorkItem } from "./types";

/** Test türü: izleme, kalıplaşmış ikiz soru, orijinal yeni nesil soru. */
export type TestKind = "izleme" | "ikiz" | "yeni_nesil";

export interface BookTest {
	no: number;
	kind?: TestKind;
	/** Testin başladığı sayfa. */
	page: number;
	/** İçindekilerde yoksa bilinmez. */
	questions?: number;
}

export interface BookUnit {
	topic: string;
	tests: BookTest[];
}

export interface BookSection {
	id: string;
	title: string;
	/** Görev metninde bölümü ayırt eden kısa ad; ilk bölümde genelde boş. */
	label?: string;
	units: BookUnit[];
}

export interface SourceBook {
	id: string;
	title: string;
	publisher?: string;
	subject: Subject;
	grade: number;
	kind: "ders_kitabi" | "yardimci";
	/** Her test için varsayılan soru sayısı; `BookTest.questions` bunu ezer. */
	questionsPerTest?: number;
	sections: BookSection[];
	answerKeyPage?: number;
}

/** Kitabı, kitap sırasıyla ilerleyen somut işlere (WorkItem) çevirir. */
export function bookWorkItems(book: SourceBook): WorkItem[] {
	const items: WorkItem[] = [];
	for (const section of book.sections) {
		const prefix = section.label ? `${section.label} · ` : "";
		for (const unit of section.units) {
			for (const test of unit.tests) {
				items.push({
					id: `${book.id}:${section.id}:t${test.no}`,
					subject: book.subject,
					topic: unit.topic,
					resource: book.title,
					work: `${prefix}s.${test.page} Test ${test.no}`,
				});
			}
		}
	}
	return items;
}

/** Veri girişi hatalarını yakalar: boş dizi geçerli demektir. */
export function validateBook(book: SourceBook): string[] {
	const errors: string[] = [];
	const ids = new Set<string>();
	let lastPage = 0;
	for (const section of book.sections) {
		if (ids.has(section.id)) errors.push(`Tekrarlanan bölüm: ${section.id}`);
		ids.add(section.id);
		let expectedNo = 1;
		for (const unit of section.units) {
			if (unit.tests.length === 0) errors.push(`Testsiz konu: ${unit.topic}`);
			for (const test of unit.tests) {
				if (test.no !== expectedNo) {
					errors.push(
						`${section.id}: test ${test.no} beklenen ${expectedNo} yerine geldi`,
					);
				}
				expectedNo = test.no + 1;
				if (test.page <= lastPage) {
					errors.push(
						`${section.id} test ${test.no}: sayfa ${test.page} artmıyor`,
					);
				}
				lastPage = test.page;
			}
		}
	}
	if (book.answerKeyPage !== undefined && book.answerKeyPage <= lastPage) {
		errors.push("Cevap anahtarı sayfası son testten sonra olmalı");
	}
	return errors;
}
