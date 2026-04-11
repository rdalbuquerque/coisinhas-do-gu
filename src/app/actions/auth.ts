"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { signSession, SESSION_COOKIE } from "@/lib/session";

export async function login(formData: FormData): Promise<void> {
  const senha = String(formData.get("senha") || "");
  if (senha.trim() !== process.env.AUTH_PASSWORD?.trim()) {
    redirect("/login?error=1");
  }
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, await signSession(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  });
  redirect("/registrar");
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  redirect("/login");
}
