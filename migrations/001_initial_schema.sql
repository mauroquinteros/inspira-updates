-- saved_groups: store the WhatsApp groups we care about
CREATE TABLE IF NOT EXISTS saved_groups (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_jid    TEXT UNIQUE NOT NULL,
  group_name   TEXT NOT NULL,
  is_active    BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMP NOT NULL DEFAULT NOW()
);

-- scheduled_messages: messages to be sent at a future time
CREATE TABLE IF NOT EXISTS scheduled_messages (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id       UUID NOT NULL REFERENCES saved_groups(id),
  content        TEXT NOT NULL,
  scheduled_for  TIMESTAMP NOT NULL,
  status         TEXT NOT NULL DEFAULT 'scheduled',
  created_at     TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMP NOT NULL DEFAULT NOW(),
  sent_at        TIMESTAMP NULL,
  CONSTRAINT chk_status CHECK (status IN ('scheduled', 'sent', 'failed', 'cancelled'))
);

-- message_executions: log every send attempt
CREATE TABLE IF NOT EXISTS message_executions (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scheduled_message_id  UUID NOT NULL REFERENCES scheduled_messages(id),
  executed_at           TIMESTAMP NOT NULL DEFAULT NOW(),
  status                TEXT NOT NULL,
  response_payload      JSONB NULL,
  error_message         TEXT NULL
);
