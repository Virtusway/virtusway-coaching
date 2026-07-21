import { DATABASE_URL } from "astro:env/server";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

let db: ReturnType<typeof drizzle<typeof schema>> | undefined;

export function getDb() {
  if (db) return db;

  db = drizzle(DATABASE_URL, { schema });

  return db;
}
