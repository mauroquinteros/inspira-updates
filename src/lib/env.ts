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
  BETTER_AUTH_SECRET: requireEnv("BETTER_AUTH_SECRET"),
  BETTER_AUTH_URL: requireEnv("BETTER_AUTH_URL"),
  GOOGLE_CLIENT_ID: requireEnv("GOOGLE_CLIENT_ID"),
  GOOGLE_CLIENT_SECRET: requireEnv("GOOGLE_CLIENT_SECRET"),
};
