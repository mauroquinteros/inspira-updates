function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  EVOLUTION_API_BASE_URL: requireEnv("EVOLUTION_API_BASE_URL"),
  EVOLUTION_API_KEY: requireEnv("EVOLUTION_API_KEY"),
  // Legacy single-tenant fallback. New multi-tenant flow resolves instance per user.
  EVOLUTION_INSTANCE_NAME: process.env.EVOLUTION_INSTANCE_NAME ?? "",
  DATABASE_URL: requireEnv("DATABASE_URL"),
  CRON_SECRET: requireEnv("CRON_SECRET"),
  NEXT_PUBLIC_SUPABASE_URL: requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: requireEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
};
