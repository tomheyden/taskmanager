import "server-only";
import { asc, desc, eq } from "drizzle-orm";
import { cache } from "react";
import { db } from "@/db";
import { projects, subtasks, tasks, type TaskWithRelations } from "@/db/schema";

const withRelations = {
  assignee: true as const,
  creator: true as const,
  project: true as const,
  subtasks: { orderBy: [asc(subtasks.position), asc(subtasks.createdAt)] },
};

export const getTasks = cache(async (): Promise<TaskWithRelations[]> => {
  return db.query.tasks.findMany({
    with: withRelations,
    orderBy: [asc(tasks.dueDate), asc(tasks.createdAt)],
  });
});

export const getTask = cache(async (id: string): Promise<TaskWithRelations | null> => {
  const task = await db.query.tasks.findFirst({ where: eq(tasks.id, id), with: withRelations });
  return task ?? null;
});

export const getProjects = cache(async () => {
  return db.query.projects.findMany({ orderBy: [asc(projects.name)] });
});

export const getRecentlyCompleted = cache(async (limit = 5) => {
  return db.query.tasks.findMany({
    where: eq(tasks.status, "done"),
    with: withRelations,
    orderBy: [desc(tasks.completedAt)],
    limit,
  });
});
