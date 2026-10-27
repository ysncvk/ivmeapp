/**
 * Soru hedefi (basit mod) ile kitap testlerinin köprüsü: günlük soru hedefi, kitabın test başına
 * soru sayısıyla günlük test sayısına çevrilir. Plan motoru bu sayıyı ders ağırlığı olarak kullanır
 * (`PlanSettings.subjectWeights`), veli ve çocuk ekranı aynı sayıyı "yaklaşık N test" diye gösterir.
 */

/** Test başına soru sayısı bilinmiyorsa kullanılan varsayılan (Fenomen kitapları 12). */
export const DEFAULT_QUESTIONS_PER_TEST = 12;

/**
 * Günlük soru hedefini karşılayan test sayısı (en az 1). Yukarı yuvarlanır: çocuk önerilen testlerin
 * hepsini bitirdiğinde hedef de tutmuş olur (50 soru, test başına 12 soru → 5 test = 60 soru).
 */
export function testsPerDay(
	goalQuestions: number,
	questionsPerTest: number = DEFAULT_QUESTIONS_PER_TEST,
): number {
	if (!(goalQuestions > 0)) return 0;
	const per =
		questionsPerTest > 0 ? questionsPerTest : DEFAULT_QUESTIONS_PER_TEST;
	return Math.max(1, Math.ceil(goalQuestions / per - 1e-9));
}
