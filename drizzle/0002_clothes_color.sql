CREATE TYPE "public"."clothing_color" AS ENUM('branco', 'preto', 'cinza', 'bege', 'marrom', 'vermelho', 'rosa', 'laranja', 'amarelo', 'verde', 'azul', 'roxo', 'estampado');--> statement-breakpoint
ALTER TABLE "clothes" ADD COLUMN "color" "clothing_color";
