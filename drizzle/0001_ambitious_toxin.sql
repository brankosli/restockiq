CREATE TABLE IF NOT EXISTS "store_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"store_id" integer,
	"company_name" text,
	"address" text,
	"city" text,
	"country" text,
	"phone" text,
	"email" text,
	"website" text,
	"tax_id" text,
	"logo_url" text,
	"currency" text DEFAULT 'EUR',
	"order_notes" text,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "store_settings_store_id_unique" UNIQUE("store_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "store_settings" ADD CONSTRAINT "store_settings_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
