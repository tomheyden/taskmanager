import "dotenv/config";
import { defineConfig } from "drizzle-kit";

/** Erster nicht-leerer Wert. Leere Strings zählen nicht als gesetzt. */
function firstSet(...names: string[]) {
  for (const name of names) {
    const value = process.env[name]?.trim();
    if (value) return value;
  }
  return undefined;
}

// TURSO_* setzt die Vercel-Marketplace-Integration, DATABASE_URL ist der lokale Name.
const url = firstSet("DATABASE_URL", "TURSO_DATABASE_URL") ?? "file:./data/stichtag.db";
const authToken = firstSet("DATABASE_AUTH_TOKEN", "TURSO_AUTH_TOKEN");
const isRemote = !url.startsWith("file:");

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: isRemote ? "turso" : "sqlite",
  dbCredentials: isRemote ? { url, authToken } : { url },
});
