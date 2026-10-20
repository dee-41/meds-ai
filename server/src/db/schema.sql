-- MEDS-AI minimal schema. Safe to run more than once (IF NOT EXISTS).
-- Nothing is inserted here: no users, no assessments, no sample data.

-- Future user accounts. Passwords must only ever be stored as hashes.
CREATE TABLE IF NOT EXISTS users (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email         TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Emails are unique regardless of upper/lower case.
CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_idx ON users (lower(email));

-- Future symptom assessments: what a person entered on the Predict Disease page.
-- This is sensitive health data, so deleting a user also deletes their assessments.
CREATE TABLE IF NOT EXISTS symptom_assessments (
  id             BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id        BIGINT REFERENCES users (id) ON DELETE CASCADE,
  symptoms       TEXT[] NOT NULL DEFAULT '{}',   -- chips chosen from suggestions
  description    TEXT,                           -- free text in the user's own words
  duration_value INTEGER CHECK (duration_value > 0),
  duration_unit  TEXT CHECK (duration_unit IN ('hours', 'days', 'weeks', 'months')),
  severity       TEXT CHECK (severity IN ('mild', 'moderate', 'severe')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- an assessment must contain at least some symptom information
  CHECK (cardinality(symptoms) > 0 OR description IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS symptom_assessments_user_idx ON symptom_assessments (user_id);