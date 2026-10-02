/** Kütüphane ve müfredat erişimi (K-008: v1'de kodda). */
import type { Curriculum, SourceBook, Subject } from "@ivmeapp/core";
import { books, curricula } from "@ivmeapp/library";

export const SUBJECTS = [
	"matematik",
	"turkce",
	"fen",
	"sosyal",
	"ingilizce",
] as const;

/** Eğitim yılının ilk Pazartesi'si (büyük ödül blokları ve plan başlangıcı). */
export const SCHOOL_START = "2026-09-14";
export const SCHOOL_END = "2027-06-25";

export function allBooks(): readonly SourceBook[] {
	return books;
}

export function bookById(id: string): SourceBook | undefined {
	return books.find((b) => b.id === id);
}

export function booksForSubject(subject: Subject, grade: number): SourceBook[] {
	return books.filter((b) => b.subject === subject && b.grade === grade);
}

export function curriculumFor(
	subject: Subject,
	grade: number,
): Curriculum | undefined {
	return curricula.find((c) => c.subject === subject && c.grade === grade);
}
