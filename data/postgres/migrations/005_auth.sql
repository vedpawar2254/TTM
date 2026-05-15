-- Allow anonymous users (no email required)
ALTER TABLE users ALTER COLUMN email DROP NOT NULL;

-- Sessions must exist before messages reference them
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fk_messages_session'
      AND conrelid = 'messages'::regclass
  ) THEN
    ALTER TABLE messages
      ADD CONSTRAINT fk_messages_session
      FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE;
  END IF;
END $$;
