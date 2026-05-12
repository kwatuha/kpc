-- Append-only audit trail (PostgreSQL). The API also runs equivalent DDL on first audit if missing.
CREATE TABLE IF NOT EXISTS audit_trail (
    id BIGSERIAL PRIMARY KEY,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    action VARCHAR(128) NOT NULL,
    entity_type VARCHAR(64) NULL,
    entity_id VARCHAR(128) NULL,
    actor_user_id INTEGER NULL,
    actor_username VARCHAR(255) NULL,
    ip_address VARCHAR(64) NULL,
    user_agent TEXT NULL,
    detail JSONB NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_trail_occurred ON audit_trail (occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_trail_action ON audit_trail (action);
CREATE INDEX IF NOT EXISTS idx_audit_trail_entity ON audit_trail (entity_type, entity_id);
