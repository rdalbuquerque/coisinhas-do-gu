CREATE TYPE "public"."season" AS ENUM('verao', 'inverno', 'neutro');--> statement-breakpoint
CREATE TABLE "clothes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clothing_type_id" uuid NOT NULL,
	"size_period_id" uuid NOT NULL,
	"season" "season" DEFAULT 'neutro' NOT NULL,
	"photo_url" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clothing_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "clothing_types_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "enxovais" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "enxoval_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"enxoval_id" uuid NOT NULL,
	"clothing_type_id" uuid NOT NULL,
	"size_period_id" uuid NOT NULL,
	"target_quantity" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "enxoval_items_enxoval_id_clothing_type_id_size_period_id_unique" UNIQUE("enxoval_id","clothing_type_id","size_period_id")
);
--> statement-breakpoint
CREATE TABLE "size_periods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "clothes" ADD CONSTRAINT "clothes_clothing_type_id_clothing_types_id_fk" FOREIGN KEY ("clothing_type_id") REFERENCES "public"."clothing_types"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clothes" ADD CONSTRAINT "clothes_size_period_id_size_periods_id_fk" FOREIGN KEY ("size_period_id") REFERENCES "public"."size_periods"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enxoval_items" ADD CONSTRAINT "enxoval_items_enxoval_id_enxovais_id_fk" FOREIGN KEY ("enxoval_id") REFERENCES "public"."enxovais"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enxoval_items" ADD CONSTRAINT "enxoval_items_clothing_type_id_clothing_types_id_fk" FOREIGN KEY ("clothing_type_id") REFERENCES "public"."clothing_types"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enxoval_items" ADD CONSTRAINT "enxoval_items_size_period_id_size_periods_id_fk" FOREIGN KEY ("size_period_id") REFERENCES "public"."size_periods"("id") ON DELETE restrict ON UPDATE no action;
