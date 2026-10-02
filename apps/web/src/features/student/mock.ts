import type { PlanTask } from "@ivmeapp/core";

/** Tasarım önizlemesi için örnek veri. `core`'un gerçek PlanTask tipini kullanır. */
export const mockStudent = { name: "Ada" };

const reason = {
	source: "weekly_topic",
	detail: "Bu haftanın konusu",
} as const;

export const mockToday: PlanTask[] = [
	{
		id: "t1",
		day: 3,
		block: 1,
		minutes: 25,
		subject: "sosyal",
		topic: "Harita bilgisi",
		resource: "Okul ödevi",
		work: "s.58 soruları",
		reason: { source: "homework", detail: "Okul ödevi" },
	},
	{
		id: "t2",
		day: 3,
		block: 2,
		minutes: 30,
		subject: "matematik",
		topic: "Kesirler",
		resource: "Karekök Matematik",
		work: "s.84 Test 12",
		reason,
	},
	{
		id: "t3",
		day: 3,
		block: 2,
		minutes: 25,
		subject: "fen",
		topic: "Kuvvet ve hareket",
		resource: "MEB Fen Bilimleri",
		work: "s.42-44",
		reason,
	},
	{
		id: "t4",
		day: 3,
		block: 3,
		minutes: 20,
		subject: "turkce",
		topic: "Paragraf",
		resource: "Soru bankası",
		work: "Test 5",
		reason: { source: "weak_topic", detail: "Son denemede zayıf konu" },
	},
];

/** Haftalık ödül (ADR-0016): veli tanımlar, hedef tamamlama oranıdır. */
export const mockWeek = {
	totalTasks: 22,
	completedBeforeToday: 9,
	threshold: 0.8,
	rewardTitle: "McDonald's menüsü",
};
