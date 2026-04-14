-- Long-term memory table scaffold
CREATE TABLE IF NOT EXISTS long_term_memory (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  theme_vector JSONB NOT NULL,
  summary JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
