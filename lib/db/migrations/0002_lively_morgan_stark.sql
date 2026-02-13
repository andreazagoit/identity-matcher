ALTER TABLE "apikey" ADD COLUMN "client_id" text;--> statement-breakpoint
ALTER TABLE "apikey" ADD CONSTRAINT "apikey_client_id_oauth_client_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."oauth_client"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "apikey_clientId_idx" ON "apikey" USING btree ("client_id");