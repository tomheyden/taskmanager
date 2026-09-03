"use server";

import { eq, max } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { subtasks, tasks } from "@/db/schema";
import { requireUser } from "@/lib/auth";

function revalidate(taskId: string) {
  revalidatePath("/");
  revalidatePath("/aufgaben");
  revalidatePath(`/aufgaben/${taskId}`);
}

async function touch(taskId: string) {
  await db.update(tasks).set({ updatedAt: new Date().toISOString() }).where(eq(tasks.id, taskId));
}

export async function addSubtask(taskId: string, title: string) {
  await requireUser();
  const clean = title.trim();
  if (!clean) return;
  const [{ value }] = await db
    .select({ value: max(subtasks.position) })
    .from(subtasks)
    .where(eq(subtasks.taskId, taskId));
  await db.insert(subtasks).values({
    id: crypto.randomUUID(),
    taskId,
    title: clean,
    done: false,
    position: (value ?? -1) + 1,
    createdAt: new Date().toISOString(),
  });
  await touch(taskId);
  revalidate(taskId);
}

export async function toggleSubtask(id: string, done: boolean) {
  await requireUser();
  const row = await db.query.subtasks.findFirst({ where: eq(subtasks.id, id) });
  if (!row) return;
  await db.update(subtasks).set({ done }).where(eq(subtasks.id, id));
  await touch(row.taskId);
  revalidate(row.taskId);
}

export async function renameSubtask(id: string, title: string) {
  await requireUser();
  const clean = title.trim();
  const row = await db.query.subtasks.findFirst({ where: eq(subtasks.id, id) });
  if (!row || !clean) return;
  await db.update(subtasks).set({ title: clean }).where(eq(subtasks.id, id));
  revalidate(row.taskId);
}

export async function deleteSubtask(id: string) {
  await requireUser();
  const row = await db.query.subtasks.findFirst({ where: eq(subtasks.id, id) });
  if (!row) return;
  await db.delete(subtasks).where(eq(subtasks.id, id));
  await touch(row.taskId);
  revalidate(row.taskId);
}
