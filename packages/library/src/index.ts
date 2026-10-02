import type { Curriculum, SourceBook } from "@ivmeapp/core";

import { fenomen6FenA } from "./books/fenomen-6-fen-a";
import { fenomen6MatematikA } from "./books/fenomen-6-matematik-a";
import { fenomen6ParagrafA } from "./books/fenomen-6-paragraf-a";
import { fenomen6ParagrafB } from "./books/fenomen-6-paragraf-b";
import { matematik6 } from "./curriculum/matematik-6";
import { turkce6 } from "./curriculum/turkce-6";

export {
	fenomen6FenA,
	fenomen6MatematikA,
	fenomen6ParagrafA,
	fenomen6ParagrafB,
	matematik6,
	turkce6,
};

/** Kütüphanedeki tüm kitaplar. */
export const books: readonly SourceBook[] = [
	fenomen6ParagrafA,
	fenomen6ParagrafB,
	fenomen6MatematikA,
	fenomen6FenA,
];

/** Kütüphanedeki tüm müfredatlar (yıllık planlar). */
export const curricula: readonly Curriculum[] = [turkce6, matematik6];
