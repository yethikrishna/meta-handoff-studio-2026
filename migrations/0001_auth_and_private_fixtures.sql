PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS users (
 id TEXT PRIMARY KEY,
 email TEXT NOT NULL UNIQUE COLLATE NOCASE,
 email_verified_at INTEGER NOT NULL,
 created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS email_codes (
 id TEXT PRIMARY KEY,
 email TEXT NOT NULL COLLATE NOCASE,
 code_hash TEXT NOT NULL,
 expires_at INTEGER NOT NULL,
 attempts INTEGER NOT NULL DEFAULT 0 CHECK (attempts >= 0 AND attempts <= 5),
 created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS email_codes_email_exp_idx ON email_codes(email, expires_at);
CREATE TABLE IF NOT EXISTS sessions (
 token_hash TEXT PRIMARY KEY,
 user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 expires_at INTEGER NOT NULL,
 created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions(user_id);
CREATE TABLE IF NOT EXISTS scenarios (
 id TEXT PRIMARY KEY,
 user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 name TEXT NOT NULL,
 recipient TEXT NOT NULL,
 data_types_json TEXT NOT NULL CHECK (json_valid(data_types_json) AND json_type(data_types_json) = 'array'),
 action TEXT NOT NULL,
 created_at INTEGER NOT NULL,
 updated_at INTEGER NOT NULL,
 UNIQUE (user_id, id)
);
CREATE INDEX IF NOT EXISTS scenarios_user_updated_idx ON scenarios(user_id, updated_at DESC);
