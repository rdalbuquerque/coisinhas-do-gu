"use server";

import { revalidatePath } from "next/cache";
import { eq, sql } from "drizzle-orm";
import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySession } from "@/lib/session";
import { db } from "@/lib/db";
import { clothingTypes, clothes, enxovalItems } from "@/lib/db/schema";
import type { EnxovalKind } from "@/lib/types/database";

async function requireAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token || !(await verifySession(token))) throw new Error("Unauthorized");
}

export async function createClothingType(name: string, kind: EnxovalKind = "roupinhas") {
  await requireAuth();
  try {
    await db.insert(clothingTypes).values({ name, kind });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("duplicate") || msg.includes("unique")) {
      throw new Error("Esse tipo já existe.");
    }
    throw err;
  }
  revalidatePath("/tipos");
  revalidatePath("/registrar");
}

export async function updateClothingType(id: string, name: string) {
  await requireAuth();
  await db.update(clothingTypes).set({ name }).where(eq(clothingTypes.id, id));
  revalidatePath("/tipos");
  revalidatePath("/registrar");
  revalidatePath("/inventario");
}

export async function ensureClothingTypes(
  names: string[],
  kind: EnxovalKind = "roupinhas"
): Promise<{ name: string; id: string }[]> {
  await requireAuth();

  const existing = await db
    .select({ id: clothingTypes.id, name: clothingTypes.name })
    .from(clothingTypes)
    .where(eq(clothingTypes.kind, kind));

  const existingMap = new Map(existing.map((t) => [t.name.toLowerCase(), t]));

  const result: { name: string; id: string }[] = [];
  const toCreate: string[] = [];

  for (const name of names) {
    const found = existingMap.get(name.toLowerCase());
    if (found) result.push({ name: found.name, id: found.id });
    else toCreate.push(name);
  }

  if (toCreate.length > 0) {
    const created = await db
      .insert(clothingTypes)
      .values(toCreate.map((name) => ({ name, kind })))
      .returning({ id: clothingTypes.id, name: clothingTypes.name });

    for (const t of created) result.push({ name: t.name, id: t.id });

    revalidatePath("/tipos");
    revalidatePath("/registrar");
  }

  return result;
}

export async function deleteClothingType(id: string) {
  await requireAuth();

  const [{ count: clothesCount }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(clothes)
    .where(eq(clothes.clothing_type_id, id));

  if (clothesCount > 0) {
    throw new Error(`Esse tipo está em uso em ${clothesCount} peça(s). Remova as peças primeiro.`);
  }

  const [{ count: itemsCount }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(enxovalItems)
    .where(eq(enxovalItems.clothing_type_id, id));

  if (itemsCount > 0) {
    throw new Error(`Esse tipo está em uso em ${itemsCount} item(ns) de enxoval. Remova dos enxovais primeiro.`);
  }

  await db.delete(clothingTypes).where(eq(clothingTypes.id, id));
  revalidatePath("/tipos");
  revalidatePath("/registrar");
}
