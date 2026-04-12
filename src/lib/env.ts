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
  EVOLUTION_INSTANCE_NAME: requireEnv("EVOLUTION_INSTANCE_NAME"),
  DATABASE_URL: requireEnv("DATABASE_URL"),
};
