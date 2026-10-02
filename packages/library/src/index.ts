import type { SourceBook } from "@ivmeapp/core";

import { fenomen6MatematikA } from "./books/fenomen-6-matematik-a";
import { fenomen6ParagrafA } from "./books/fenomen-6-paragraf-a";
import { fenomen6ParagrafB } from "./books/fenomen-6-paragraf-b";

export { fenomen6MatematikA, fenomen6ParagrafA, fenomen6ParagrafB };

/** Kütüphanedeki tüm kitaplar. */
export const books: readonly SourceBook[] = [
	fenomen6ParagrafA,
	fenomen6ParagrafB,
	fenomen6MatematikA,
];
