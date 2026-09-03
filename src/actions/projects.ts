"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "@/db";
import { projects } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { PROJECT_COLORS } from "@/lib/constants";

function revalidate() {
  revalidatePath("/");
  revalidatePath("/aufgaben");
  revalidatePath("/projekte");
}

export async function createProject(formData: FormData) {
  await requireUser();
  const name = String(formData.get("name") ?? "").trim();
  const color = String(formData.get("color") ?? PROJECT_COLORS[0]);
  if (!name) return;
  await getDb().insert(projects).values({
    id: crypto.randomUUID(),
    name,
    color: PROJECT_COLORS.includes(color) ? color : PROJECT_COLORS[0],
    createdAt: new Date().toISOString(),
  });
  revalidate();
}

export async function renameProject(formData: FormData) {
  await requireUser();
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const color = String(formData.get("color") ?? "");
  if (!id || !name) return;
  await getDb()
    .update(projects)
    .set({ name, ...(PROJECT_COLORS.includes(color) ? { color } : {}) })
    .where(eq(projects.id, id));
  revalidate();
}

export async function deleteProject(formData: FormData) {
  await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await getDb().delete(projects).where(eq(projects.id, id));
  revalidate();
}
