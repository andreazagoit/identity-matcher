ALTER TABLE "user" ALTER COLUMN "gender" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "oauth_client" ADD COLUMN "scopes" text[];--> statement-breakpoint
ALTER TABLE "oauth_client" ADD COLUMN "grant_types" text[];--> statement-breakpoint
ALTER TABLE "oauth_client" ADD COLUMN "response_types" text[];--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "latitude" real;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "longitude" real;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "location_updated_at" timestamp;