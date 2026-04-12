CREATE TYPE "public"."enxoval_kind" AS ENUM('roupinhas', 'quarto');--> statement-breakpoint
ALTER TABLE "clothing_types" ADD COLUMN "kind" "enxoval_kind" DEFAULT 'roupinhas' NOT NULL;--> statement-breakpoint
ALTER TABLE "clothing_types" DROP CONSTRAINT "clothing_types_name_unique";--> statement-breakpoint
ALTER TABLE "clothing_types" ADD CONSTRAINT "clothing_types_name_kind_unique" UNIQUE("name","kind");--> statement-breakpoint
ALTER TABLE "enxovais" ADD COLUMN "kind" "enxoval_kind" DEFAULT 'roupinhas' NOT NULL;--> statement-breakpoint
ALTER TABLE "clothes" ALTER COLUMN "size_period_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "enxoval_items" ALTER COLUMN "size_period_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "enxoval_items" DROP CONSTRAINT "enxoval_items_enxoval_id_clothing_type_id_size_period_id_unique";--> statement-breakpoint
ALTER TABLE "enxoval_items" ADD CONSTRAINT "enxoval_items_enxoval_id_clothing_type_id_size_period_id_unique" UNIQUE NULLS NOT DISTINCT ("enxoval_id","clothing_type_id","size_period_id");
