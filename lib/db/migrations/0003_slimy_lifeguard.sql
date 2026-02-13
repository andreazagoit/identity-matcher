CREATE TYPE "public"."assessment_status" AS ENUM('in_progress', 'completed');--> statement-breakpoint
CREATE TABLE "assessments" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"assessment_name" text NOT NULL,
	"answers" jsonb NOT NULL,
	"status" "assessment_status" DEFAULT 'completed' NOT NULL,
	"completed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"psychological_desc" text,
	"values_desc" text,
	"interests_desc" text,
	"behavioral_desc" text,
	"psychological_embedding" vector(1536),
	"values_embedding" vector(1536),
	"interests_embedding" vector(1536),
	"behavioral_embedding" vector(1536),
	"assessment_version" real DEFAULT 1,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "assessments_user_idx" ON "assessments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "assessments_assessment_name_idx" ON "assessments" USING btree ("assessment_name");--> statement-breakpoint
CREATE INDEX "profiles_psychological_idx" ON "profiles" USING hnsw ("psychological_embedding" vector_cosine_ops);--> statement-breakpoint
CREATE INDEX "profiles_values_idx" ON "profiles" USING hnsw ("values_embedding" vector_cosine_ops);--> statement-breakpoint
CREATE INDEX "profiles_interests_idx" ON "profiles" USING hnsw ("interests_embedding" vector_cosine_ops);--> statement-breakpoint
CREATE INDEX "profiles_behavioral_idx" ON "profiles" USING hnsw ("behavioral_embedding" vector_cosine_ops);--> statement-breakpoint
CREATE INDEX "profiles_user_idx" ON "profiles" USING btree ("user_id");--> statement-breakpoint
ALTER TABLE "oauth_client" DROP COLUMN "skip_consent";--> statement-breakpoint
ALTER TABLE "oauth_client" DROP COLUMN "type";