export type Subject = "matematik" | "turkce" | "fen" | "sosyal" | "ingilizce";

/** Planın bir görevi neden ürettiğini veride taşır (ADR-0002, ADR-0005). */
export type TaskSource =
	| "homework"
	| "weekly_topic"
	| "weak_topic"
	| "spaced_review";

export interface Reason {
	source: TaskSource;
	detail: string;
}

/** Kaynak kütüphanesinden (ADR-0004) gelen, motorun yerleştirebileceği somut iş. */
export interface WorkItem {
	id: string;
	subject: Subject;
	topic: string;
	/** Örn. "Karekök" */
	resource: string;
	/** Örn. "s.84 Test 12" */
	work: string;
	/** Geçen haftadan kalan iş: öncelik sırasında öne alınır, görev sayısını artırmaz. */
	carriedOver?: boolean;
}

export interface Homework {
	/** ISO hafta günü: 1 = Pazartesi ... 5 = Cuma */
	day: number;
	subject: Subject;
	topic: string;
	work: string;
}

export interface PlanInput {
	/** Haftanın başlangıç tarihi (YYYY-MM-DD). Motor tarih hesabı yapmaz, taşır. */
	weekStart: string;
	/** Günlük bütçe, dakika. Aşılamaz kısıttır (ADR-0009). */
	dailyBudgetMinutes: number;
	/** ISO hafta günleri, 1-5. Varsayılan [1,2,3,4,5]. */
	studyDays?: readonly number[];
	/** Bu haftanın konusu, derse göre sıralı iş listesi (okulla senkron). */
	weeklyTopics: Partial<Record<Subject, readonly WorkItem[]>>;
	/** Son denemenin zayıf konuları, öncelik sırasıyla. */
	weakTopics: readonly WorkItem[];
	/** Aralıklı tekrar adayları (2-4 hafta öncesi), öncelik sırasıyla. */
	reviewItems: readonly WorkItem[];
	homework?: readonly Homework[];
}

export interface PlanTask {
	id: string;
	day: number;
	block: 1 | 2 | 3;
	minutes: number;
	subject: Subject;
	topic: string;
	resource: string;
	work: string;
	reason: Reason;
}

export interface DayPlan {
	day: number;
	tasks: PlanTask[];
	totalMinutes: number;
}

export interface Unplaced {
	homework: Homework;
	why: string;
}

export interface WeeklyPlan {
	weekStart: string;
	dailyBudgetMinutes: number;
	days: DayPlan[];
	/** Sığmayan okul ödevleri sessizce düşmez, görünür kalır. */
	unplaced: Unplaced[];
}
