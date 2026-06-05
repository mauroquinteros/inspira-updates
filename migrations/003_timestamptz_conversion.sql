-- Convert all naive `timestamp` columns to `timestamptz`.
--
-- Why: columns were declared `timestamp WITHOUT time zone`. The app writes
-- instants in UTC via Date.toISOString(), so Postgres stored the UTC wall-clock
-- with the offset stripped. On read, postgres.js re-localizes that naive value
-- to the runtime timezone (Lima, UTC-5), shifting displayed times +5h.
--
-- Fix: reinterpret the stored naive values as UTC (`AT TIME ZONE 'UTC'`) while
-- changing the type to `timestamptz`. This preserves the real instant and lets
-- the client render the correct local time.
--
-- Idempotent: only converts a column that is still `timestamp without time zone`.
-- This matters because the migrate runner re-executes every .sql file on each run,
-- and applying `AT TIME ZONE 'UTC'` to an already-`timestamptz` column would
-- toggle it back to naive `timestamp` and reintroduce the bug.
DO $$
DECLARE
  col RECORD;
BEGIN
  FOR col IN
    SELECT * FROM (VALUES
      ('saved_groups','created_at'),
      ('saved_groups','updated_at'),
      ('scheduled_messages','scheduled_for'),
      ('scheduled_messages','created_at'),
      ('scheduled_messages','updated_at'),
      ('scheduled_messages','sent_at'),
      ('message_executions','executed_at'),
      ('users','created_at'),
      ('users','updated_at'),
      ('evolution_instances','created_at'),
      ('evolution_instances','updated_at')
    ) AS t(tbl, colname)
  LOOP
    IF (
      SELECT data_type FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = col.tbl
        AND column_name = col.colname
    ) = 'timestamp without time zone' THEN
      EXECUTE format(
        'ALTER TABLE public.%I ALTER COLUMN %I TYPE timestamptz USING %I AT TIME ZONE ''UTC''',
        col.tbl, col.colname, col.colname
      );
    END IF;
  END LOOP;
END $$;
