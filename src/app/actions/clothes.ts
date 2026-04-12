"use server";

import { revalidatePath } from "next/cache";
import { eq, sql } from "drizzle-orm";
import { del } from "@vercel/blob";
import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySession } from "@/lib/session";
import { db } from "@/lib/db";
import { clothes } from "@/lib/db/schema";
import type { Season } from "@/lib/types/database";

interface ClothingInput {
  clothing_type_id: string;
  size_period_id: string | null;
  season: Season;
  photo_url: string | null;
  notes: string | null;
}

async function requireAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token || !(await verifySession(token))) throw new Error("Unauthorized");
}

function revalidateClothes() {
  revalidatePath("/inventario");
  revalidatePath("/enxoval");
  revalidatePath("/presentes");
  revalidatePath("/registrar");
}

export async function createClothing(input: ClothingInput) {
  await requireAuth();
  await db.insert(clothes).values(input);
  revalidateClothes();
}

export async function updateClothing(id: string, input: ClothingInput) {
  await requireAuth();
  await db
    .update(clothes)
    .set({ ...input, updated_at: sql`now()` })
    .where(eq(clothes.id, id));
  revalidateClothes();
}

export async function deleteClothing(id: string) {
  await requireAuth();

  const [existing] = await db
    .select({ photo_url: clothes.photo_url })
    .from(clothes)
    .where(eq(clothes.id, id))
    .limit(1);

  if (existing?.photo_url) {
    try {
      await del(existing.photo_url);
    } catch {
      // best-effort
    }
  }

  await db.delete(clothes).where(eq(clothes.id, id));
  revalidateClothes();
}
