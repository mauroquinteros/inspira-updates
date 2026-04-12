import { config } from "dotenv";
import { readdir, readFile } from "fs/promises";
import { join } from "path";
import postgres from "postgres";

config();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("Missing DATABASE_URL environment variable");
  process.exit(1);
}

const sql = postgres(DATABASE_URL, {
  ssl: process.env.NODE_ENV === "production" ? "require" : false,
});

async function migrate() {
  const migrationsDir = join(process.cwd(), "migrations");
  const files = (await readdir(migrationsDir))
    .filter((f) => f.endsWith(".sql"))
    .sort();

  console.log(`Running ${files.length} migration(s)...`);

  for (const file of files) {
    const filePath = join(migrationsDir, file);
    const sqlContent = await readFile(filePath, "utf-8");
    console.log(`  → ${file}`);
    await sql.unsafe(sqlContent);
  }

  console.log("Migrations complete.");
  await sql.end();
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
