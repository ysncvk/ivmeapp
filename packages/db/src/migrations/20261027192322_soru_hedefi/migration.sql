CREATE TABLE "daily_goal" (
	"child_id" text,
	"subject" "subject",
	"questions" integer NOT NULL,
	CONSTRAINT "daily_goal_pkey" PRIMARY KEY("child_id","subject"),
	CONSTRAINT "daily_goal_range" CHECK ("questions" between 1 and 500)
);
--> statement-breakpoint
CREATE TABLE "question_log" (
	"child_id" text,
	"subject" "subject",
	"day" date,
	"solved" integer NOT NULL,
	"logged_by_user_id" text,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "question_log_pkey" PRIMARY KEY("child_id","subject","day"),
	CONSTRAINT "question_log_range" CHECK ("solved" between 0 and 1000)
);
--> statement-breakpoint
ALTER TABLE "daily_goal" ADD CONSTRAINT "daily_goal_child_id_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "child"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "question_log" ADD CONSTRAINT "question_log_child_id_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "child"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "question_log" ADD CONSTRAINT "question_log_logged_by_user_id_user_id_fkey" FOREIGN KEY ("logged_by_user_id") REFERENCES "user"("id") ON DELETE SET NULL;