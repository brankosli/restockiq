CREATE TABLE IF NOT EXISTS "pending_alerts" (
	"id" serial PRIMARY KEY NOT NULL,
	"store_id" integer,
	"vendor_id" integer,
	"items" text DEFAULT '[]' NOT NULL,
	"notes" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"sent_at" timestamp
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pending_alerts" ADD CONSTRAINT "pending_alerts_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pending_alerts" ADD CONSTRAINT "pending_alerts_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
