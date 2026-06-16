import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

let db: ReturnType<typeof drizzle<typeof schema>> | undefined;

export function getDb() {
  if (db) return db;

  const databaseUrl = import.meta.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required to connect to Neon.");
  }

  db = drizzle(databaseUrl, { schema });

  return db;
}
