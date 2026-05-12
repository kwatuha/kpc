-- Payment status labels for the payment request ladder (UI: Approval levels → Payment statuses tab).
-- Safe to run on empty DBs.

CREATE TABLE IF NOT EXISTS payment_status_definitions (
    "statusId" SERIAL PRIMARY KEY,
    "statusName" VARCHAR(255) NOT NULL,
    description TEXT
);

COMMENT ON TABLE payment_status_definitions IS 'Named payment workflow statuses; used by /api/payment-status';
