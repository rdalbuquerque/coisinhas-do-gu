"use server";

import { put, del } from "@vercel/blob";
import { cookies } from "next/headers";
import { generateObject } from "ai";
import { z } from "zod";
import { SESSION_COOKIE, verifySession } from "@/lib/session";
import { CLOTHING_COLORS } from "@/lib/constants";
import type { ClothingColor } from "@/lib/types/database";

async function requireAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token || !(await verifySession(token))) throw new Error("Unauthorized");
}

export async function uploadClothingPhoto(formData: FormData): Promise<string> {
  await requireAuth();

  const file = formData.get("file");
  if (!(file instanceof Blob)) throw new Error("Arquivo inválido");

  const ext = (file.type.split("/")[1] || "jpg").replace("jpeg", "jpg");
  const filename = `clothes/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const blob = await put(filename, file, {
    access: "public",
    contentType: file.type || "image/jpeg",
  });

  return blob.url;
}

export async function deleteClothingPhoto(url: string): Promise<void> {
  await requireAuth();
  await del(url);
}

const COLOR_VALUES = CLOTHING_COLORS.map((c) => c.value) as [
  ClothingColor,
  ...ClothingColor[],
];

const colorSchema = z.object({
  color: z.enum(COLOR_VALUES),
});

export async function detectClothingColor(
  formData: FormData
): Promise<ClothingColor> {
  await requireAuth();

  const file = formData.get("file");
  if (!(file instanceof Blob)) throw new Error("Arquivo inválido");

  const bytes = new Uint8Array(await file.arrayBuffer());

  const { object } = await generateObject({
    model: "openai/gpt-4o-mini",
    schema: colorSchema,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text:
              "Identifique a cor predominante desta peça de roupa de bebê. " +
              "Escolha apenas uma cor da lista permitida pelo schema. " +
              "Se a peça tiver um padrão estampado sem cor dominante clara " +
              "(listras, bolinhas, desenhos coloridos), use 'estampado'.",
          },
          { type: "file", mediaType: "image/jpeg", data: bytes },
        ],
      },
    ],
  });

  return object.color;
}
