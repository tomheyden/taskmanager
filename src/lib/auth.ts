import "server-only";
import { asc, eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { getDb } from "@/db";
import { users, type User } from "@/db/schema";
import { SESSION_COOKIE, verifySession } from "./session";

export const getCurrentUser = cache(async (): Promise<User | null> => {
  const store = await cookies();
  const userId = await verifySession(store.get(SESSION_COOKIE)?.value);
  if (!userId) return null;
  const user = await getDb().query.users.findFirst({ where: eq(users.id, userId) });
  return user ?? null;
});

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export const getAllUsers = cache(async () => {
  return getDb().query.users.findMany({ orderBy: [asc(users.createdAt)] });
});

export async function getPartner(me: User) {
  const all = await getAllUsers();
  return all.find((u) => u.id !== me.id) ?? null;
}
