import postgres from "postgres";
import { env } from "@/lib/env";

const globalForDb = globalThis as unknown as { db: ReturnType<typeof postgres> | undefined };

export const db =
  globalForDb.db ??
  postgres(env.DATABASE_URL, {
    ssl: process.env.NODE_ENV === "production" ? "require" : false,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.db = db;
}
