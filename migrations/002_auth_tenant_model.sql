-- users: app-level ownership model mapped from auth identities
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT UNIQUE NOT NULL,
  name          TEXT NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

-- evolution_instances: one Evolution instance per user
CREATE TABLE IF NOT EXISTS evolution_instances (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL UNIQUE REFERENCES users(id),
  instance_name  TEXT NOT NULL UNIQUE,
  status         TEXT NOT NULL DEFAULT 'pending',
  created_at     TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_evolution_instance_status
    CHECK (status IN ('pending', 'connected', 'disconnected'))
);

-- Add ownership to saved_groups
ALTER TABLE saved_groups
  ADD COLUMN IF NOT EXISTS user_id UUID;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'saved_groups_user_id_fkey'
  ) THEN
    ALTER TABLE saved_groups
      ADD CONSTRAINT saved_groups_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES users(id);
  END IF;
END $$;

-- Replace global uniqueness with per-user uniqueness
ALTER TABLE saved_groups
  DROP CONSTRAINT IF EXISTS saved_groups_group_jid_key;

CREATE UNIQUE INDEX IF NOT EXISTS saved_groups_user_id_group_jid_uidx
  ON saved_groups (user_id, group_jid);

-- Add ownership to scheduled_messages
ALTER TABLE scheduled_messages
  ADD COLUMN IF NOT EXISTS user_id UUID;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'scheduled_messages_user_id_fkey'
  ) THEN
    ALTER TABLE scheduled_messages
      ADD CONSTRAINT scheduled_messages_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES users(id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS scheduled_messages_user_id_idx
  ON scheduled_messages (user_id);
