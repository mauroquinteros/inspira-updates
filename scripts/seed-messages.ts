import { config } from "dotenv";
import postgres from "postgres";

config();

const USER_ID = "65cfc74a-6082-4a5b-9722-2da02d71ba36";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("Missing DATABASE_URL environment variable");
  process.exit(1);
}

const sql = postgres(DATABASE_URL, {
  ssl: process.env.NODE_ENV === "production" ? "require" : false,
});

export interface MessageEntry {
  group_id: string;
  content: string;
  scheduled_for: string;
  status?: "scheduled" | "sent" | "failed" | "cancelled";
}

async function seed() {
  const { messages } = await import("./data/scheduled-messages");

  console.log(`Seeding ${messages.length} message(s)...`);

  for (const msg of messages) {
    if (!msg.scheduled_for.endsWith("-05:00")) {
      console.error(`Invalid timezone in "${msg.scheduled_for}" — expected -05:00 (Peru/Lima)`);
      process.exit(1);
    }

    const scheduledFor = new Date(msg.scheduled_for).toISOString();

    const existing = await sql`
      SELECT id FROM scheduled_messages
      WHERE user_id = ${USER_ID}
        AND group_id = ${msg.group_id}
        AND content = ${msg.content}
        AND scheduled_for = ${scheduledFor}
      LIMIT 1
    `;

    if (existing.length > 0) {
      console.log(`  → skipped (duplicate): "${msg.content.slice(0, 40)}"`);
      continue;
    }

    const status = msg.status ?? "scheduled";

    await sql`
      INSERT INTO scheduled_messages (user_id, group_id, content, scheduled_for, status)
      VALUES (${USER_ID}, ${msg.group_id}, ${msg.content}, ${scheduledFor}, ${status})
    `;
    console.log(`  → inserted: "${msg.content.slice(0, 40)}" @ ${scheduledFor}`);
  }

  console.log("Done.");
  await sql.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
