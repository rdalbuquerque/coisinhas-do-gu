// One-off backfill: classify the predominant color of every roupinha
// that has a photo and no color yet, using the Vercel AI Gateway.
//
// Run with: node --env-file=.env.local scripts/backfill-clothes-colors.mjs
//
// Requires DATABASE_URL and AI_GATEWAY_API_KEY in .env.local.
// Idempotent: only touches rows where color IS NULL.

import { neon } from "@neondatabase/serverless";
import { generateObject } from "ai";
import { z } from "zod";

const COLORS = [
  "branco",
  "preto",
  "cinza",
  "bege",
  "marrom",
  "vermelho",
  "rosa",
  "laranja",
  "amarelo",
  "verde",
  "azul",
  "roxo",
  "estampado",
];

const CONCURRENCY = 3;

const colorSchema = z.object({ color: z.enum(COLORS) });

const PROMPT =
  "Identifique a cor predominante desta peça de roupa de bebê. " +
  "Escolha apenas uma cor da lista permitida pelo schema. " +
  "Se a peça tiver um padrão estampado sem cor dominante clara " +
  "(listras, bolinhas, desenhos coloridos), use 'estampado'.";

async function classify(photoUrl) {
  const res = await fetch(photoUrl);
  if (!res.ok) throw new Error(`fetch ${photoUrl}: ${res.status}`);
  const bytes = new Uint8Array(await res.arrayBuffer());
  const { object } = await generateObject({
    model: "openai/gpt-4o-mini",
    schema: colorSchema,
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: PROMPT },
          { type: "file", mediaType: "image/jpeg", data: bytes },
        ],
      },
    ],
  });
  return object.color;
}

async function runPool(items, worker) {
  let i = 0;
  const workers = Array.from({ length: CONCURRENCY }, async () => {
    while (true) {
      const idx = i++;
      if (idx >= items.length) return;
      await worker(items[idx], idx);
    }
  });
  await Promise.all(workers);
}

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL not set");
  if (!process.env.AI_GATEWAY_API_KEY)
    throw new Error("AI_GATEWAY_API_KEY not set");

  const sql = neon(process.env.DATABASE_URL);

  const rows = await sql`
    SELECT c.id, c.photo_url
    FROM clothes c
    JOIN clothing_types t ON c.clothing_type_id = t.id
    WHERE c.color IS NULL
      AND c.photo_url IS NOT NULL
      AND t.kind = 'roupinhas'
    ORDER BY c.created_at ASC
  `;

  console.log(`Found ${rows.length} roupinhas to classify.`);
  if (rows.length === 0) return;

  let done = 0;
  let failed = 0;
  await runPool(rows, async (row) => {
    const idx = ++done;
    try {
      const color = await classify(row.photo_url);
      await sql`UPDATE clothes SET color = ${color} WHERE id = ${row.id}`;
      console.log(`[${idx}/${rows.length}] ${row.id} -> ${color}`);
    } catch (err) {
      failed++;
      console.error(
        `[${idx}/${rows.length}] ${row.id} FAILED:`,
        err instanceof Error ? err.message : err
      );
    }
  });

  console.log(`Done. ${rows.length - failed} updated, ${failed} failed.`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
