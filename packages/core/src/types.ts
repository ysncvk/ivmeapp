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
	/** Örn. "Karekök Matematik" */
	resource: string;
	/** Örn. "s.84 Test 12" */
	work: string;
	/** Geçen haftadan kalan iş: öncelik sırasında öne alınır, bütçeyi aşmaz (ADR-0013). */
	carriedOver?: boolean;
}

export interface Homework {
	/** Çağıranın ödev kimliği; görevin `itemId`'sine `hw:<id>` olarak geçer. */
	id?: string;
	/** ISO hafta günü: 1 = Pazartesi ... 7 = Pazar */
	day: number;
	subject: Subject;
	topic: string;
	work: string;
}

/** Boş kalan süre için veli tercihi (ADR-0013). */
export type IdleTime = "review" | "reading" | "free";

/** Veli ve çocuk profilinden gelen ayarlar (ADR-0013). */
export interface PlanSettings {
	/** Haftanın başlangıç tarihi (YYYY-MM-DD). Motor tarih hesabı yapmaz, taşır. */
	weekStart: string;
	/** ISO hafta günleri, 1-7. Tavsiye: Pazartesi-Cumartesi. */
	studyDays: readonly number[];
	/** Günlük bütçe, dakika. Motor bunu aşmaz. */
	dailyBudgetMinutes: number;
	/** Çocuğun kesintisiz dikkat süresi: bir görevin süresi (ADR-0013). */
	blockMinutes: number;
	/** Plana açık dersler. */
	subjects: readonly Subject[];
	/**
	 * Ders başına günlük test sayısı (soru hedefinin test karşılığı). Verilirse her çalışma günü her
	 * derse tam bu kadar yuva ayrılır; haftanın konusu / zayıf konu / tekrar bu yuvaların içinde
	 * ağırlıkla (%50/%30/%20) paylaşılır. Okul ödevi yuvadan düşmez, yuvasını aynı dersten ya da en
	 * kalabalık dersten alır.
	 */
	dailyTests?: Partial<Record<Subject, number>>;
	idleTime: IdleTime;
}

export interface PlanInput {
	settings: PlanSettings;
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
	/** Görevin geldiği kütüphane işinin kimliği (ödevde yok). Devir ve taşımada kullanılır. */
	itemId?: string;
	day: number;
	/** Gün içindeki sıra, 1'den başlar. */
	block: number;
	minutes: number;
	subject: Subject;
	topic: string;
	resource: string;
	work: string;
	reason: Reason;
	carriedOver?: boolean;
}

export interface DayPlan {
	day: number;
	tasks: PlanTask[];
	totalMinutes: number;
	/** Bütçeden artan dakika. */
	idleMinutes: number;
	/** Boş kalan süre için tercih edilen davranış (ADR-0013); yoksa boş bırakılır. */
	idle?: "reading" | "review_needed";
}

export type UnplacedReason = "no_capacity" | "not_study_day";

export interface UnplacedHomework {
	homework: Homework;
	why: UnplacedReason;
}

export type CutPool = "weekly_topic" | "weak_topic" | "spaced_review";

export type CoverageWarning =
	| { code: "subject_off"; subject: Subject }
	| { code: "target_missed"; subject: Subject; days: number; target: number }
	| { code: "items_cut"; count: number }
	| { code: "homework_unplaced"; count: number }
	| { code: "no_rest_day" }
	| { code: "budget_below_block" };

/** Kapsama raporu: plana sığmayanlar ve veliye gösterilecek uyarıların kaynağı (ADR-0013). */
export interface Coverage {
	/** Plana sığmayan işler, havuz bilgisiyle. */
	cut: { item: WorkItem; pool: CutPool }[];
	/** Ders başına görevli gün sayısı. */
	subjectDays: Record<Subject, number>;
	warnings: CoverageWarning[];
}

export interface WeeklyPlan {
	weekStart: string;
	settings: PlanSettings;
	days: DayPlan[];
	/** Sığmayan okul ödevleri sessizce düşmez, görünür kalır. */
	unplaced: UnplacedHomework[];
	coverage: Coverage;
}
