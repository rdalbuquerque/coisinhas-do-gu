"use server";

import { put, del } from "@vercel/blob";
import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

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
