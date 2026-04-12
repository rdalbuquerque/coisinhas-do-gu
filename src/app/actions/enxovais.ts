"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySession } from "@/lib/session";
import { db } from "@/lib/db";
import { enxovais, enxovalItems } from "@/lib/db/schema";
import type { EnxovalKind } from "@/lib/types/database";

async function requireAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token || !(await verifySession(token))) throw new Error("Unauthorized");
}

function revalidateEnxoval() {
  revalidatePath("/enxoval");
  revalidatePath("/presentes");
}

export async function createEnxoval(data: {
  name: string;
  kind?: EnxovalKind;
  items: { clothing_type_id: string; size_period_id: string | null; target_quantity: number }[];
}) {
  await requireAuth();

  const [enxoval] = await db
    .insert(enxovais)
    .values({ name: data.name, kind: data.kind ?? "roupinhas" })
    .returning();

  if (data.items.length > 0) {
    await db.insert(enxovalItems).values(
      data.items.map((item) => ({
        enxoval_id: enxoval.id,
        clothing_type_id: item.clothing_type_id,
        size_period_id: item.size_period_id,
        target_quantity: item.target_quantity,
      }))
    );
  }

  revalidateEnxoval();
  return enxoval;
}

export async function updateEnxovalItem(id: string, target_quantity: number) {
  await requireAuth();
  await db.update(enxovalItems).set({ target_quantity }).where(eq(enxovalItems.id, id));
  revalidateEnxoval();
}

export async function addEnxovalItem(data: {
  enxoval_id: string;
  clothing_type_id: string;
  size_period_id: string | null;
  target_quantity: number;
}) {
  await requireAuth();
  await db.insert(enxovalItems).values(data);
  revalidateEnxoval();
}

export async function removeEnxovalItem(id: string) {
  await requireAuth();
  await db.delete(enxovalItems).where(eq(enxovalItems.id, id));
  revalidateEnxoval();
}

export async function deleteEnxoval(id: string) {
  await requireAuth();
  await db.delete(enxovais).where(eq(enxovais.id, id));
  revalidateEnxoval();
}
