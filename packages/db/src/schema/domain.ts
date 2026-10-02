/**
 * Alan modeli: aile, çocuk, plan, ödev, çalışma grubu, deneme, ödül, kayıtlar.
 * ADR-0010: silme hakkı işler durumda (veli silinince çocuğa ait her şey zincirleme silinir;
 * çocuğun kendi kullanıcı kaydı uygulama katmanında önce silinir), erişim kaydı ve rıza kaydı
 * şemanın parçasıdır. ADR-0012: çocuk velinin hesabına bağlıdır.
 * Kütüphane ve müfredat kodda (`@ivmeapp/library`), burada yalnızca kimlikleri tutulur.
 */
import { sql } from "drizzle-orm";
import {
	boolean,
	check,
	date,
	index,
	integer,
	jsonb,
	pgEnum,
	pgTable,
	primaryKey,
	real,
	text,
	timestamp,
	unique,
} from "drizzle-orm/pg-core";

import { user } from "./auth";

const id = () =>
	text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID());

const createdAt = () => timestamp("created_at").defaultNow().notNull();

export const subjectEnum = pgEnum("subject", [
	"matematik",
	"turkce",
	"fen",
	"sosyal",
	"ingilizce",
]);
export const idleTimeEnum = pgEnum("idle_time", ["review", "reading", "free"]);
export const taskSourceEnum = pgEnum("task_source", [
	"homework",
	"weekly_topic",
	"weak_topic",
	"spaced_review",
]);
export const homeworkSourceEnum = pgEnum("homework_source", [
	"teacher",
	"guardian",
	"student",
]);
export const rewardTierEnum = pgEnum("reward_tier", [
	"daily",
	"weekly",
	"milestone",
]);
export const subscriptionStatusEnum = pgEnum("subscription_status", [
	"trial",
	"active",
	"canceled",
]);
export const consentKindEnum = pgEnum("consent_kind", [
	"privacy_notice",
	"parental_consent",
	"child_notice",
	"marketing",
]);

/** Çocuk profili. Hesap velinin (guardianId), girişi çocuğun kendi kullanıcı kaydı (userId). */
export const child = pgTable(
	"child",
	{
		id: id(),
		guardianId: text("guardian_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		userId: text("user_id")
			.notNull()
			.unique()
			.references(() => user.id, { onDelete: "cascade" }),
		/** Ad ya da takma ad (ADR-0010 madde 1: başka kimlik bilgisi tutulmaz). */
		displayName: text("display_name").notNull(),
		grade: integer("grade").default(6).notNull(),
		// Plan ayarları (ADR-0013): veli belirler, uygulama tavsiye eder.
		dailyBudgetMinutes: integer("daily_budget_minutes").default(90).notNull(),
		/** Çocuğun kesintisiz dikkat süresi. */
		blockMinutes: integer("block_minutes").default(30).notNull(),
		/** ISO hafta günleri 1-7. Tavsiye: Pazartesi-Cumartesi. */
		studyDays: jsonb("study_days")
			.$type<number[]>()
			.default([1, 2, 3, 4, 5, 6])
			.notNull(),
		idleTime: idleTimeEnum("idle_time").default("review").notNull(),
		createdAt: createdAt(),
	},
	(t) => [
		index("child_guardian_idx").on(t.guardianId),
		check("child_budget_positive", sql`${t.dailyBudgetMinutes} > 0`),
		check("child_block_positive", sql`${t.blockMinutes} > 0`),
	],
);

/** Çocuk başına ders ayarı: planda açık mı, okulun temposuna göre hafta kaydırması. */
export const childSubject = pgTable(
	"child_subject",
	{
		childId: text("child_id")
			.notNull()
			.references(() => child.id, { onDelete: "cascade" }),
		subject: subjectEnum("subject").notNull(),
		enabled: boolean("enabled").default(true).notNull(),
		/** Okul planın N hafta gerisinde (+) ya da ilerisinde (-) ise (karar günlüğü K-006). */
		weekOffset: integer("week_offset").default(0).notNull(),
	},
	(t) => [primaryKey({ columns: [t.childId, t.subject] })],
);

/** Çocuğun kullandığı kaynaklar (kütüphane kitap kimlikleri). */
export const childSource = pgTable(
	"child_source",
	{
		childId: text("child_id")
			.notNull()
			.references(() => child.id, { onDelete: "cascade" }),
		bookId: text("book_id").notNull(),
		createdAt: createdAt(),
	},
	(t) => [primaryKey({ columns: [t.childId, t.bookId] })],
);

/** Ücretli plan yetkisi, çocuk başına (ADR-0014). Ödeme sağlayıcısı entegrasyonu sonraya. */
export const subscription = pgTable("subscription", {
	id: id(),
	childId: text("child_id")
		.notNull()
		.unique()
		.references(() => child.id, { onDelete: "cascade" }),
	status: subscriptionStatusEnum("status").notNull(),
	trialStartedAt: timestamp("trial_started_at"),
	trialEndsAt: timestamp("trial_ends_at"),
	currentPeriodEnd: timestamp("current_period_end"),
	canceledAt: timestamp("canceled_at"),
	/** İptalden sonra plan verisinin tutulacağı son tarih (6 ay, ADR-0014 güncellemesi). */
	retainUntil: timestamp("retain_until"),
	provider: text("provider"),
	providerRef: text("provider_ref"),
	createdAt: createdAt(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
});

/** Haftalık plan. Her hafta başında üretilir ve hafta içinde yalnızca kullanıcı eylemiyle değişir. */
export const plan = pgTable(
	"plan",
	{
		id: id(),
		childId: text("child_id")
			.notNull()
			.references(() => child.id, { onDelete: "cascade" }),
		/** Haftanın Pazartesi'si. */
		weekStart: date("week_start", { mode: "string" }).notNull(),
		/** Üretim anındaki ayarlar (sonradan değişse de plan açıklanabilir kalır). */
		settings: jsonb("settings").notNull(),
		coverage: jsonb("coverage").notNull(),
		unplaced: jsonb("unplaced").notNull(),
		generatedAt: timestamp("generated_at").defaultNow().notNull(),
	},
	(t) => [unique("plan_child_week_uq").on(t.childId, t.weekStart)],
);

export const planTask = pgTable(
	"plan_task",
	{
		id: id(),
		planId: text("plan_id")
			.notNull()
			.references(() => plan.id, { onDelete: "cascade" }),
		childId: text("child_id")
			.notNull()
			.references(() => child.id, { onDelete: "cascade" }),
		day: integer("day").notNull(),
		block: integer("block").notNull(),
		minutes: integer("minutes").notNull(),
		subject: subjectEnum("subject").notNull(),
		topic: text("topic").notNull(),
		resource: text("resource").notNull(),
		work: text("work").notNull(),
		reasonSource: taskSourceEnum("reason_source").notNull(),
		reasonDetail: text("reason_detail").notNull(),
		/** Kütüphane işinin kimliği (ödevde yok); devir ve taşımada kullanılır. */
		itemId: text("item_id"),
		carriedOver: boolean("carried_over").default(false).notNull(),
		doneAt: timestamp("done_at"),
	},
	(t) => [
		index("plan_task_plan_idx").on(t.planId),
		index("plan_task_child_idx").on(t.childId),
		check("plan_task_day_valid", sql`${t.day} between 1 and 7`),
	],
);

/** Görev işaretleme ve taşıma geçmişi (ADR-0013). */
export const planEvent = pgTable(
	"plan_event",
	{
		id: id(),
		planId: text("plan_id")
			.notNull()
			.references(() => plan.id, { onDelete: "cascade" }),
		taskId: text("task_id"),
		kind: text("kind").notNull(),
		actorUserId: text("actor_user_id").references(() => user.id, {
			onDelete: "set null",
		}),
		fromDay: integer("from_day"),
		toDay: integer("to_day"),
		createdAt: createdAt(),
	},
	(t) => [index("plan_event_plan_idx").on(t.planId)],
);

/** Öğretmenin çalışma grubu (arayüzde "çalışma grubu", ADR-0014). */
export const studyGroup = pgTable(
	"study_group",
	{
		id: id(),
		teacherId: text("teacher_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		name: text("name").notNull(),
		/** Davet linkindeki kod; tahmin edilemez olmalı. */
		joinCode: text("join_code").notNull().unique(),
		createdAt: createdAt(),
		archivedAt: timestamp("archived_at"),
	},
	(t) => [index("study_group_teacher_idx").on(t.teacherId)],
);

export const groupMember = pgTable(
	"group_member",
	{
		groupId: text("group_id")
			.notNull()
			.references(() => studyGroup.id, { onDelete: "cascade" }),
		childId: text("child_id")
			.notNull()
			.references(() => child.id, { onDelete: "cascade" }),
		joinedAt: timestamp("joined_at").defaultNow().notNull(),
	},
	(t) => [
		primaryKey({ columns: [t.groupId, t.childId] }),
		index("group_member_child_idx").on(t.childId),
	],
);

/** Öğretmenin gruba verdiği ödev. Her üye çocuk için bir `homework` satırı üretilir. */
export const assignment = pgTable(
	"assignment",
	{
		id: id(),
		groupId: text("group_id")
			.notNull()
			.references(() => studyGroup.id, { onDelete: "cascade" }),
		teacherId: text("teacher_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		subject: subjectEnum("subject").notNull(),
		title: text("title").notNull(),
		description: text("description"),
		dueDate: date("due_date", { mode: "string" }),
		createdAt: createdAt(),
	},
	(t) => [index("assignment_group_idx").on(t.groupId)],
);

/** Çocuğun ödevi: öğretmenden, veliden ya da çocuğun kendisinden gelir. */
export const homework = pgTable(
	"homework",
	{
		id: id(),
		childId: text("child_id")
			.notNull()
			.references(() => child.id, { onDelete: "cascade" }),
		subject: subjectEnum("subject").notNull(),
		title: text("title").notNull(),
		description: text("description"),
		dueDate: date("due_date", { mode: "string" }),
		source: homeworkSourceEnum("source").notNull(),
		createdByUserId: text("created_by_user_id").references(() => user.id, {
			onDelete: "set null",
		}),
		assignmentId: text("assignment_id").references(() => assignment.id, {
			onDelete: "set null",
		}),
		doneAt: timestamp("done_at"),
		doneByUserId: text("done_by_user_id").references(() => user.id, {
			onDelete: "set null",
		}),
		createdAt: createdAt(),
	},
	(t) => [
		index("homework_child_idx").on(t.childId),
		index("homework_assignment_idx").on(t.assignmentId),
	],
);

/** Manuel deneme girişi (ADR-0015): ders bazında net + zorlanılan konular. */
export const exam = pgTable(
	"exam",
	{
		id: id(),
		childId: text("child_id")
			.notNull()
			.references(() => child.id, { onDelete: "cascade" }),
		name: text("name").notNull(),
		date: date("date", { mode: "string" }).notNull(),
		enteredByUserId: text("entered_by_user_id").references(() => user.id, {
			onDelete: "set null",
		}),
		createdAt: createdAt(),
	},
	(t) => [index("exam_child_idx").on(t.childId)],
);

export const examSubject = pgTable(
	"exam_subject",
	{
		examId: text("exam_id")
			.notNull()
			.references(() => exam.id, { onDelete: "cascade" }),
		subject: subjectEnum("subject").notNull(),
		questions: integer("questions").notNull(),
		correct: integer("correct").notNull(),
		wrong: integer("wrong").notNull(),
		blank: integer("blank").notNull(),
	},
	(t) => [
		primaryKey({ columns: [t.examId, t.subject] }),
		check(
			"exam_subject_sum",
			sql`${t.correct} + ${t.wrong} + ${t.blank} = ${t.questions}`,
		),
		check(
			"exam_subject_nonneg",
			sql`${t.correct} >= 0 and ${t.wrong} >= 0 and ${t.blank} >= 0`,
		),
	],
);

export const examWeakTopic = pgTable(
	"exam_weak_topic",
	{
		id: id(),
		examId: text("exam_id")
			.notNull()
			.references(() => exam.id, { onDelete: "cascade" }),
		subject: subjectEnum("subject").notNull(),
		/** Konu adı (müfredat/kitap konusu). */
		topic: text("topic").notNull(),
	},
	(t) => [unique("exam_weak_topic_uq").on(t.examId, t.subject, t.topic)],
);

/** Veli tanımlı ödül (ADR-0016). Çocuk başına seviye başına bir ödül. */
export const reward = pgTable(
	"reward",
	{
		id: id(),
		childId: text("child_id")
			.notNull()
			.references(() => child.id, { onDelete: "cascade" }),
		tier: rewardTierEnum("tier").notNull(),
		title: text("title").notNull(),
		/** Gereken tamamlama oranı, (0, 1]. */
		threshold: real("threshold").default(0.8).notNull(),
		active: boolean("active").default(true).notNull(),
		createdAt: createdAt(),
	},
	(t) => [
		unique("reward_child_tier_uq").on(t.childId, t.tier),
		check(
			"reward_threshold_valid",
			sql`${t.threshold} > 0 and ${t.threshold} <= 1`,
		),
	],
);

/** Ödülün hangi dönem için verildiği. Veli teslim ettiğinde yazılır. */
export const rewardGrant = pgTable(
	"reward_grant",
	{
		id: id(),
		rewardId: text("reward_id")
			.notNull()
			.references(() => reward.id, { onDelete: "cascade" }),
		/** Günlük: tarih, haftalık: haftanın Pazartesi'si, büyük: dönem anahtarı. */
		periodKey: text("period_key").notNull(),
		grantedByUserId: text("granted_by_user_id").references(() => user.id, {
			onDelete: "set null",
		}),
		grantedAt: timestamp("granted_at").defaultNow().notNull(),
	},
	(t) => [unique("reward_grant_period_uq").on(t.rewardId, t.periodKey)],
);

/** Erişim kaydı (ADR-0010): kim hangi çocuğun verisine baktı. */
export const accessLog = pgTable(
	"access_log",
	{
		id: id(),
		actorUserId: text("actor_user_id").references(() => user.id, {
			onDelete: "set null",
		}),
		actorRole: text("actor_role").notNull(),
		childId: text("child_id")
			.notNull()
			.references(() => child.id, { onDelete: "cascade" }),
		action: text("action").notNull(),
		createdAt: createdAt(),
	},
	(t) => [index("access_log_child_idx").on(t.childId, t.createdAt)],
);

/** Aydınlatma ve rıza kaydı (ADR-0010 madde 4): hangi sürümü ne zaman onayladı. */
export const consent = pgTable(
	"consent",
	{
		id: id(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		kind: consentKindEnum("kind").notNull(),
		version: text("version").notNull(),
		grantedAt: timestamp("granted_at").defaultNow().notNull(),
		revokedAt: timestamp("revoked_at"),
	},
	(t) => [index("consent_user_idx").on(t.userId)],
);

/** "Kaynak eklenmesini iste" akışı (ADR-0004). */
export const bookRequest = pgTable("book_request", {
	id: id(),
	userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
	title: text("title").notNull(),
	subject: subjectEnum("subject"),
	note: text("note"),
	createdAt: createdAt(),
});
