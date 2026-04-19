import { betterAuth } from "better-auth";
import { Pool } from "pg";
import { env } from "@/lib/env";

const globalForAuthPool = globalThis as unknown as { authPool?: Pool };

const authPool =
  globalForAuthPool.authPool ??
  new Pool({
    connectionString: env.DATABASE_URL,
    ssl:
      process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : undefined,
  });

if (process.env.NODE_ENV !== "production") {
  globalForAuthPool.authPool = authPool;
}

export const auth = betterAuth({
  database: authPool,
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
});
