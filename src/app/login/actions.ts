"use server";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import { SESSION_COOKIE, sessionCookieOptions, signSession } from "@/lib/session";

export type LoginState = { error?: string };

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("weiter") ?? "");

  if (!email || !password) return { error: "Bitte E-Mail und Passwort eingeben." };

  const user = await db.query.users.findFirst({ where: eq(users.email, email) });
  const ok = user ? await bcrypt.compare(password, user.passwordHash) : false;
  if (!user || !ok) return { error: "E-Mail oder Passwort stimmen nicht." };

  const token = await signSession(user.id);
  (await cookies()).set(SESSION_COOKIE, token, sessionCookieOptions);
  redirect(next.startsWith("/") ? next : "/");
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/login");
}
