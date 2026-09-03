import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

/**
 * Verbindungsdaten erst beim ersten Zugriff auflösen, nicht beim Import.
 * Sonst bricht schon `next build` ab, wenn DATABASE_URL noch nicht gesetzt ist.
 */
function resolveUrl() {
  const url = process.env.DATABASE_URL?.trim();
  if (url) return url;
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "DATABASE_URL fehlt. In Produktion braucht Stichtag eine gehostete libSQL-Datenbank (libsql://...), siehe README.",
    );
  }
  return "file:./data/stichtag.db";
}

function createDb() {
  const client = createClient({
    url: resolveUrl(),
    authToken: process.env.DATABASE_AUTH_TOKEN?.trim() || undefined,
  });
  return drizzle(client, { schema });
}

type Db = ReturnType<typeof createDb>;

// Verbindung über Hot Reloads und wiederverwendete Function-Instanzen hinweg behalten.
const globalForDb = globalThis as unknown as { stichtagDb?: Db };

export function getDb(): Db {
  globalForDb.stichtagDb ??= createDb();
  return globalForDb.stichtagDb;
}

export { schema };
