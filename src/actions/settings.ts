"use server";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { requireUser } from "@/lib/auth";

export type SettingsState = { error?: string; ok?: string };

export async function updateProfile(_prev: SettingsState, formData: FormData): Promise<SettingsState> {
  const me = await requireUser();
  const name = String(formData.get("name") ?? "").trim();
  const color = String(formData.get("color") ?? me.color);
  if (name.length < 2) return { error: "Der Name braucht mindestens zwei Zeichen." };
  if (!/^#[0-9a-fA-F]{6}$/.test(color)) return { error: "Ungültige Farbe." };
  await getDb().update(users).set({ name, color }).where(eq(users.id, me.id));
  revalidatePath("/", "layout");
  return { ok: "Profil gespeichert." };
}

export async function changePassword(_prev: SettingsState, formData: FormData): Promise<SettingsState> {
  const me = await requireUser();
  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  const repeat = String(formData.get("repeat") ?? "");
  if (!(await bcrypt.compare(current, me.passwordHash))) return { error: "Das aktuelle Passwort stimmt nicht." };
  if (next.length < 8) return { error: "Das neue Passwort braucht mindestens acht Zeichen." };
  if (next !== repeat) return { error: "Die Wiederholung stimmt nicht überein." };
  await getDb().update(users).set({ passwordHash: await bcrypt.hash(next, 10) }).where(eq(users.id, me.id));
  return { ok: "Passwort geändert." };
}
