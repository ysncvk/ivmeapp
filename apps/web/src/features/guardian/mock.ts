import type { ExamResult, Subject } from "@ivmeapp/core";

/** Tasarım önizlemesi için örnek veri. Deneme için `core`'un ExamResult tipini kullanır. */

export interface DayStat {
	label: string;
	done: number;
	total: number;
	state: "past" | "today" | "future";
}

export interface WeakTopic {
	subject: Subject;
	topic: string;
	/** Kaç denemedir aynı konuda zorlanıyor. */
	exams: number;
}

export interface HomeworkItem {
	id: string;
	subject: Subject;
	title: string;
	due: string;
	source: "teacher" | "guardian";
	done: boolean;
}

export interface RewardTier {
	tier: "daily" | "weekly" | "milestone";
	title: string;
	completed: number;
	total: number;
	threshold: number;
	given?: boolean;
}

export interface ChildData {
	id: string;
	name: string;
	week: { done: number; total: number; days: DayStat[] };
	exam: ExamResult;
	weakTopics: WeakTopic[];
	homework: HomeworkItem[];
	rewards: RewardTier[];
}

const subj = (
	subject: Subject,
	questions: number,
	correct: number,
	wrong: number,
) => ({
	subject,
	questions,
	correct,
	wrong,
	blank: questions - correct - wrong,
	net: Math.round((correct - wrong / 3) * 10) / 10,
});

export const mockChildren: ChildData[] = [
	{
		id: "ada",
		name: "Ada",
		week: {
			done: 9,
			total: 22,
			days: [
				{ label: "Pzt", done: 4, total: 4, state: "past" },
				{ label: "Sal", done: 3, total: 4, state: "past" },
				{ label: "Çar", done: 2, total: 4, state: "today" },
				{ label: "Per", done: 0, total: 4, state: "future" },
				{ label: "Cum", done: 0, total: 3, state: "future" },
				{ label: "Cmt", done: 0, total: 3, state: "future" },
			],
		},
		exam: {
			id: "e3",
			name: "Eylül Denemesi 3",
			date: "2026-09-26",
			subjects: [
				subj("matematik", 20, 13, 5),
				subj("turkce", 20, 16, 2),
				subj("fen", 20, 14, 4),
				subj("sosyal", 10, 8, 1),
				subj("ingilizce", 10, 9, 1),
			],
		},
		weakTopics: [
			{ subject: "matematik", topic: "Kesirler", exams: 3 },
			{ subject: "matematik", topic: "Oran-orantı", exams: 2 },
			{ subject: "turkce", topic: "Paragraf", exams: 1 },
		],
		homework: [
			{
				id: "h1",
				subject: "sosyal",
				title: "Harita bilgisi, s.58 soruları",
				due: "Bugün",
				source: "teacher",
				done: true,
			},
			{
				id: "h2",
				subject: "turkce",
				title: "Kitap özeti (1 sayfa)",
				due: "Cuma",
				source: "teacher",
				done: false,
			},
			{
				id: "h3",
				subject: "matematik",
				title: "Karekök Test 12",
				due: "Perşembe",
				source: "guardian",
				done: false,
			},
		],
		rewards: [
			{
				tier: "daily",
				title: "Akşam 1 saat PlayStation",
				completed: 2,
				total: 4,
				threshold: 1,
			},
			{
				tier: "weekly",
				title: "McDonald's menüsü",
				completed: 9,
				total: 22,
				threshold: 0.8,
			},
			{
				tier: "milestone",
				title: "Sevdiği maça gitmek",
				completed: 61,
				total: 88,
				threshold: 0.75,
			},
		],
	},
	{
		id: "mert",
		name: "Mert",
		week: {
			done: 17,
			total: 22,
			days: [
				{ label: "Pzt", done: 4, total: 4, state: "past" },
				{ label: "Sal", done: 4, total: 4, state: "past" },
				{ label: "Çar", done: 4, total: 4, state: "today" },
				{ label: "Per", done: 3, total: 4, state: "future" },
				{ label: "Cum", done: 2, total: 3, state: "future" },
				{ label: "Cmt", done: 0, total: 3, state: "future" },
			],
		},
		exam: {
			id: "e3",
			name: "Eylül Denemesi 3",
			date: "2026-09-26",
			subjects: [
				subj("matematik", 20, 17, 2),
				subj("turkce", 20, 15, 3),
				subj("fen", 20, 18, 1),
				subj("sosyal", 10, 9, 0),
				subj("ingilizce", 10, 8, 2),
			],
		},
		weakTopics: [
			{ subject: "turkce", topic: "Anlatım bozuklukları", exams: 2 },
		],
		homework: [
			{
				id: "m1",
				subject: "fen",
				title: "Kuvvet ve hareket, s.42-44",
				due: "Yarın",
				source: "teacher",
				done: false,
			},
		],
		rewards: [
			{
				tier: "daily",
				title: "Akşam 1 saat TV",
				completed: 4,
				total: 4,
				threshold: 1,
			},
			{
				tier: "weekly",
				title: "Sinema",
				completed: 17,
				total: 22,
				threshold: 0.8,
			},
			{
				tier: "milestone",
				title: "Yeni oyun",
				completed: 70,
				total: 88,
				threshold: 0.75,
			},
		],
	},
];
