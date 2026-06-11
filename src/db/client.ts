import postgres from "postgres";
import { env } from "@/lib/env";

const globalForDb = globalThis as unknown as { db: ReturnType<typeof postgres> | undefined };

export const db =
  globalForDb.db ??
  postgres(env.DATABASE_URL, {
    ssl: process.env.NODE_ENV === "production" ? "require" : false,
    // Recycle idle connections before the Supabase pooler / NAT silently kills
    // them. Without this, a long-lived dev server (or a warm serverless instance)
    // reuses a dead socket and the next query hangs until `read ETIMEDOUT`.
    idle_timeout: 20, // close a connection after 20s idle
    connect_timeout: 10, // fail fast instead of hanging if a connect stalls
    max: 10, // pool size
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.db = db;
}
