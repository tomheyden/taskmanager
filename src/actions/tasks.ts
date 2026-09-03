"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import {
  PRIORITIES,
  STATUSES,
  subtasks,
  tasks,
  type Priority,
  type Status,
} from "@/db/schema";
import { getAllUsers, requireUser } from "@/lib/auth";

export type TaskFormState = { error?: string };

type ParsedTask = {
  title: string;
  description: string;
  dueDate: string;
  assigneeId: string;
  priority: Priority;
  projectId: string | null;
  steps: string[];
};

async function parseTaskForm(formData: FormData): Promise<{ data?: ParsedTask; error?: string }> {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const dueDate = String(formData.get("dueDate") ?? "").trim();
  const assigneeId = String(formData.get("assigneeId") ?? "");
  const priority = String(formData.get("priority") ?? "medium") as Priority;
  const projectRaw = String(formData.get("projectId") ?? "");
  const steps = String(formData.get("steps") ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  if (title.length < 3) return { error: "Der Titel braucht mindestens drei Zeichen." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) return { error: "Bitte einen Stichtag wählen." };
  if (!PRIORITIES.includes(priority)) return { error: "Ungültige Priorität." };

  const users = await getAllUsers();
  if (!users.some((u) => u.id === assigneeId)) return { error: "Bitte wählen, wer verantwortlich ist." };

  return {
    data: {
      title,
      description,
      dueDate,
      assigneeId,
      priority,
      projectId: projectRaw || null,
      steps,
    },
  };
}

function revalidateAll(id?: string) {
  revalidatePath("/");
  revalidatePath("/aufgaben");
  revalidatePath("/projekte");
  if (id) revalidatePath(`/aufgaben/${id}`);
}

export async function createTask(_prev: TaskFormState, formData: FormData): Promise<TaskFormState> {
  const me = await requireUser();
  const { data, error } = await parseTaskForm(formData);
  if (!data) return { error };

  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  await db.insert(tasks).values({
    id,
    title: data.title,
    description: data.description,
    dueDate: data.dueDate,
    assigneeId: data.assigneeId,
    creatorId: me.id,
    priority: data.priority,
    projectId: data.projectId,
    status: "open",
    createdAt: now,
    updatedAt: now,
  });
  if (data.steps.length) {
    await db.insert(subtasks).values(
      data.steps.map((title, position) => ({
        id: crypto.randomUUID(),
        taskId: id,
        title,
        done: false,
        position,
        createdAt: now,
      })),
    );
  }
  revalidateAll(id);
  redirect(`/aufgaben/${id}`);
}

export async function updateTask(
  id: string,
  _prev: TaskFormState,
  formData: FormData,
): Promise<TaskFormState> {
  await requireUser();
  const { data, error } = await parseTaskForm(formData);
  if (!data) return { error };

  await db
    .update(tasks)
    .set({
      title: data.title,
      description: data.description,
      dueDate: data.dueDate,
      assigneeId: data.assigneeId,
      priority: data.priority,
      projectId: data.projectId,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(tasks.id, id));
  revalidateAll(id);
  redirect(`/aufgaben/${id}`);
}

export async function setStatus(formData: FormData) {
  await requireUser();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as Status;
  if (!id || !STATUSES.includes(status)) return;
  const now = new Date().toISOString();
  await db
    .update(tasks)
    .set({ status, updatedAt: now, completedAt: status === "done" ? now : null })
    .where(eq(tasks.id, id));
  revalidateAll(id);
}

export async function deleteTask(id: string) {
  await requireUser();
  await db.delete(tasks).where(eq(tasks.id, id));
  revalidateAll();
  redirect("/aufgaben");
}
