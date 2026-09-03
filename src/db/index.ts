import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

/**
 * Verbindungsdaten erst beim ersten Zugriff auflösen, nicht beim Import.
 * Sonst bricht schon `next build` ab, wenn DATABASE_URL noch nicht gesetzt ist.
 */
/** Erster nicht-leerer Wert. Leere Strings zählen nicht als gesetzt. */
function firstSet(...names: string[]) {
  for (const name of names) {
    const value = process.env[name]?.trim();
    if (value) return value;
  }
  return undefined;
}

function resolveUrl() {
  // TURSO_* setzt die Vercel-Marketplace-Integration, DATABASE_URL ist der lokale Name.
  const url = firstSet("DATABASE_URL", "TURSO_DATABASE_URL");
  if (url) return url;
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "Keine Datenbank konfiguriert. Bitte DATABASE_URL (libsql://...) und DATABASE_AUTH_TOKEN setzen " +
        "oder die Turso-Integration im Vercel-Projekt installieren. Siehe README.",
    );
  }
  return "file:./data/stichtag.db";
}

function createDb() {
  const url = resolveUrl();
  const client = createClient({
    url,
    // Ein Auth-Token darf nur bei einer Remote-Datenbank mitgehen.
    authToken: url.startsWith("file:")
      ? undefined
      : firstSet("DATABASE_AUTH_TOKEN", "TURSO_AUTH_TOKEN"),
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
