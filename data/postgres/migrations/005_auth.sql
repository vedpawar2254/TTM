-- Allow anonymous users (no email required)
ALTER TABLE users ALTER COLUMN email DROP NOT NULL;

-- Sessions must exist before messages reference them
ALTER TABLE messages
  ADD CONSTRAINT fk_messages_session
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE;
