-- Optional manual migration: email OTP for login (also auto-applied on API startup via loginOtpService).
--
-- Per-user toggle (disable for a few accounts during dev; enable when you want 6-digit email OTP after password):
--   PostgreSQL: column `otp_enabled` on `users`
--   MySQL:      column `otpEnabled` on `users`
--
-- PostgreSQL
ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_enabled BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS login_otp_challenges (
    id VARCHAR(36) PRIMARY KEY,
    user_id INTEGER NOT NULL,
    otp_hash TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_login_otp_challenges_expires ON login_otp_challenges (expires_at);
CREATE INDEX IF NOT EXISTS idx_login_otp_challenges_user ON login_otp_challenges (user_id);

-- MySQL (run separately if you use MySQL; ignore errors if objects already exist)
-- ALTER TABLE users ADD COLUMN otpEnabled TINYINT(1) NOT NULL DEFAULT 0;
-- CREATE TABLE IF NOT EXISTS login_otp_challenges (
--   id VARCHAR(36) NOT NULL PRIMARY KEY,
--   userId INT NOT NULL,
--   otpHash VARCHAR(255) NOT NULL,
--   expiresAt DATETIME NOT NULL,
--   INDEX idx_login_otp_user (userId),
--   INDEX idx_login_otp_expires (expiresAt)
-- );
