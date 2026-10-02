CREATE TYPE "consent_kind" AS ENUM('privacy_notice', 'parental_consent', 'child_notice', 'marketing');--> statement-breakpoint
CREATE TYPE "homework_source" AS ENUM('teacher', 'guardian', 'student');--> statement-breakpoint
CREATE TYPE "idle_time" AS ENUM('review', 'reading', 'free');--> statement-breakpoint
CREATE TYPE "reward_tier" AS ENUM('daily', 'weekly', 'milestone');--> statement-breakpoint
CREATE TYPE "subject" AS ENUM('matematik', 'turkce', 'fen', 'sosyal', 'ingilizce');--> statement-breakpoint
CREATE TYPE "subscription_status" AS ENUM('trial', 'active', 'canceled');--> statement-breakpoint
CREATE TYPE "task_source" AS ENUM('homework', 'weekly_topic', 'weak_topic', 'spaced_review');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL UNIQUE,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"email" text NOT NULL UNIQUE,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"role" text DEFAULT 'guardian' NOT NULL,
	"username" text UNIQUE,
	"display_username" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "access_log" (
	"id" text PRIMARY KEY,
	"actor_user_id" text,
	"actor_role" text NOT NULL,
	"child_id" text NOT NULL,
	"action" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assignment" (
	"id" text PRIMARY KEY,
	"group_id" text NOT NULL,
	"teacher_id" text NOT NULL,
	"subject" "subject" NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"due_date" date,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "book_request" (
	"id" text PRIMARY KEY,
	"user_id" text,
	"title" text NOT NULL,
	"subject" "subject",
	"note" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "child" (
	"id" text PRIMARY KEY,
	"guardian_id" text NOT NULL,
	"user_id" text NOT NULL UNIQUE,
	"display_name" text NOT NULL,
	"grade" integer DEFAULT 6 NOT NULL,
	"daily_budget_minutes" integer DEFAULT 90 NOT NULL,
	"block_minutes" integer DEFAULT 30 NOT NULL,
	"study_days" jsonb DEFAULT '[1,2,3,4,5,6]' NOT NULL,
	"idle_time" "idle_time" DEFAULT 'review'::"idle_time" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "child_budget_positive" CHECK ("daily_budget_minutes" > 0),
	CONSTRAINT "child_block_positive" CHECK ("block_minutes" > 0)
);
--> statement-breakpoint
CREATE TABLE "child_source" (
	"child_id" text,
	"book_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "child_source_pkey" PRIMARY KEY("child_id","book_id")
);
--> statement-breakpoint
CREATE TABLE "child_subject" (
	"child_id" text,
	"subject" "subject",
	"enabled" boolean DEFAULT true NOT NULL,
	"week_offset" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "child_subject_pkey" PRIMARY KEY("child_id","subject")
);
--> statement-breakpoint
CREATE TABLE "consent" (
	"id" text PRIMARY KEY,
	"user_id" text NOT NULL,
	"kind" "consent_kind" NOT NULL,
	"version" text NOT NULL,
	"granted_at" timestamp DEFAULT now() NOT NULL,
	"revoked_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "exam" (
	"id" text PRIMARY KEY,
	"child_id" text NOT NULL,
	"name" text NOT NULL,
	"date" date NOT NULL,
	"entered_by_user_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exam_subject" (
	"exam_id" text,
	"subject" "subject",
	"questions" integer NOT NULL,
	"correct" integer NOT NULL,
	"wrong" integer NOT NULL,
	"blank" integer NOT NULL,
	CONSTRAINT "exam_subject_pkey" PRIMARY KEY("exam_id","subject"),
	CONSTRAINT "exam_subject_sum" CHECK ("correct" + "wrong" + "blank" = "questions"),
	CONSTRAINT "exam_subject_nonneg" CHECK ("correct" >= 0 and "wrong" >= 0 and "blank" >= 0)
);
--> statement-breakpoint
CREATE TABLE "exam_weak_topic" (
	"id" text PRIMARY KEY,
	"exam_id" text NOT NULL,
	"subject" "subject" NOT NULL,
	"topic" text NOT NULL,
	CONSTRAINT "exam_weak_topic_uq" UNIQUE("exam_id","subject","topic")
);
--> statement-breakpoint
CREATE TABLE "group_member" (
	"group_id" text,
	"child_id" text,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "group_member_pkey" PRIMARY KEY("group_id","child_id")
);
--> statement-breakpoint
CREATE TABLE "homework" (
	"id" text PRIMARY KEY,
	"child_id" text NOT NULL,
	"subject" "subject" NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"due_date" date,
	"source" "homework_source" NOT NULL,
	"created_by_user_id" text,
	"assignment_id" text,
	"done_at" timestamp,
	"done_by_user_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "plan" (
	"id" text PRIMARY KEY,
	"child_id" text NOT NULL,
	"week_start" date NOT NULL,
	"settings" jsonb NOT NULL,
	"coverage" jsonb NOT NULL,
	"unplaced" jsonb NOT NULL,
	"generated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "plan_child_week_uq" UNIQUE("child_id","week_start")
);
--> statement-breakpoint
CREATE TABLE "plan_event" (
	"id" text PRIMARY KEY,
	"plan_id" text NOT NULL,
	"task_id" text,
	"kind" text NOT NULL,
	"actor_user_id" text,
	"from_day" integer,
	"to_day" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "plan_task" (
	"id" text PRIMARY KEY,
	"plan_id" text NOT NULL,
	"child_id" text NOT NULL,
	"day" integer NOT NULL,
	"block" integer NOT NULL,
	"minutes" integer NOT NULL,
	"subject" "subject" NOT NULL,
	"topic" text NOT NULL,
	"resource" text NOT NULL,
	"work" text NOT NULL,
	"reason_source" "task_source" NOT NULL,
	"reason_detail" text NOT NULL,
	"item_id" text,
	"carried_over" boolean DEFAULT false NOT NULL,
	"done_at" timestamp,
	CONSTRAINT "plan_task_day_valid" CHECK ("day" between 1 and 7)
);
--> statement-breakpoint
CREATE TABLE "reward" (
	"id" text PRIMARY KEY,
	"child_id" text NOT NULL,
	"tier" "reward_tier" NOT NULL,
	"title" text NOT NULL,
	"threshold" real DEFAULT 0.8 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "reward_child_tier_uq" UNIQUE("child_id","tier"),
	CONSTRAINT "reward_threshold_valid" CHECK ("threshold" > 0 and "threshold" <= 1)
);
--> statement-breakpoint
CREATE TABLE "reward_grant" (
	"id" text PRIMARY KEY,
	"reward_id" text NOT NULL,
	"period_key" text NOT NULL,
	"granted_by_user_id" text,
	"granted_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "reward_grant_period_uq" UNIQUE("reward_id","period_key")
);
--> statement-breakpoint
CREATE TABLE "study_group" (
	"id" text PRIMARY KEY,
	"teacher_id" text NOT NULL,
	"name" text NOT NULL,
	"join_code" text NOT NULL UNIQUE,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"archived_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "subscription" (
	"id" text PRIMARY KEY,
	"child_id" text NOT NULL UNIQUE,
	"status" "subscription_status" NOT NULL,
	"trial_started_at" timestamp,
	"trial_ends_at" timestamp,
	"current_period_end" timestamp,
	"canceled_at" timestamp,
	"retain_until" timestamp,
	"provider" text,
	"provider_ref" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" ("user_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" ("identifier");--> statement-breakpoint
CREATE INDEX "access_log_child_idx" ON "access_log" ("child_id","created_at");--> statement-breakpoint
CREATE INDEX "assignment_group_idx" ON "assignment" ("group_id");--> statement-breakpoint
CREATE INDEX "child_guardian_idx" ON "child" ("guardian_id");--> statement-breakpoint
CREATE INDEX "consent_user_idx" ON "consent" ("user_id");--> statement-breakpoint
CREATE INDEX "exam_child_idx" ON "exam" ("child_id");--> statement-breakpoint
CREATE INDEX "group_member_child_idx" ON "group_member" ("child_id");--> statement-breakpoint
CREATE INDEX "homework_child_idx" ON "homework" ("child_id");--> statement-breakpoint
CREATE INDEX "homework_assignment_idx" ON "homework" ("assignment_id");--> statement-breakpoint
CREATE INDEX "plan_event_plan_idx" ON "plan_event" ("plan_id");--> statement-breakpoint
CREATE INDEX "plan_task_plan_idx" ON "plan_task" ("plan_id");--> statement-breakpoint
CREATE INDEX "plan_task_child_idx" ON "plan_task" ("child_id");--> statement-breakpoint
CREATE INDEX "study_group_teacher_idx" ON "study_group" ("teacher_id");--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "access_log" ADD CONSTRAINT "access_log_actor_user_id_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "user"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "access_log" ADD CONSTRAINT "access_log_child_id_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "child"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "assignment" ADD CONSTRAINT "assignment_group_id_study_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "study_group"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "assignment" ADD CONSTRAINT "assignment_teacher_id_user_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "book_request" ADD CONSTRAINT "book_request_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "child" ADD CONSTRAINT "child_guardian_id_user_id_fkey" FOREIGN KEY ("guardian_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "child" ADD CONSTRAINT "child_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "child_source" ADD CONSTRAINT "child_source_child_id_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "child"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "child_subject" ADD CONSTRAINT "child_subject_child_id_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "child"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "consent" ADD CONSTRAINT "consent_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "exam" ADD CONSTRAINT "exam_child_id_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "child"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "exam" ADD CONSTRAINT "exam_entered_by_user_id_user_id_fkey" FOREIGN KEY ("entered_by_user_id") REFERENCES "user"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "exam_subject" ADD CONSTRAINT "exam_subject_exam_id_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "exam"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "exam_weak_topic" ADD CONSTRAINT "exam_weak_topic_exam_id_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "exam"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "group_member" ADD CONSTRAINT "group_member_group_id_study_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "study_group"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "group_member" ADD CONSTRAINT "group_member_child_id_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "child"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "homework" ADD CONSTRAINT "homework_child_id_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "child"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "homework" ADD CONSTRAINT "homework_created_by_user_id_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "user"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "homework" ADD CONSTRAINT "homework_assignment_id_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "assignment"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "homework" ADD CONSTRAINT "homework_done_by_user_id_user_id_fkey" FOREIGN KEY ("done_by_user_id") REFERENCES "user"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "plan" ADD CONSTRAINT "plan_child_id_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "child"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "plan_event" ADD CONSTRAINT "plan_event_plan_id_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plan"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "plan_event" ADD CONSTRAINT "plan_event_actor_user_id_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "user"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "plan_task" ADD CONSTRAINT "plan_task_plan_id_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plan"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "plan_task" ADD CONSTRAINT "plan_task_child_id_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "child"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "reward" ADD CONSTRAINT "reward_child_id_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "child"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "reward_grant" ADD CONSTRAINT "reward_grant_reward_id_reward_id_fkey" FOREIGN KEY ("reward_id") REFERENCES "reward"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "reward_grant" ADD CONSTRAINT "reward_grant_granted_by_user_id_user_id_fkey" FOREIGN KEY ("granted_by_user_id") REFERENCES "user"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "study_group" ADD CONSTRAINT "study_group_teacher_id_user_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_child_id_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "child"("id") ON DELETE CASCADE;