-- Migration 007: Payment gateway configurations

CREATE TABLE payment_gateway_configs (
    id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    broker_id    UUID        REFERENCES brokers(id),
    name         VARCHAR(255) NOT NULL,
    provider     VARCHAR(100) NOT NULL,
    api_key      TEXT,
    api_secret   TEXT,
    webhook_url  VARCHAR(500),
    mode         VARCHAR(20)  NOT NULL DEFAULT 'sandbox' CHECK (mode IN ('sandbox','live')),
    status       VARCHAR(20)  NOT NULL DEFAULT 'enabled' CHECK (status IN ('enabled','disabled')),
    config       JSONB        DEFAULT '{}',
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payment_gateways_broker  ON payment_gateway_configs (broker_id);
CREATE INDEX idx_payment_gateways_status  ON payment_gateway_configs (status);

INSERT INTO payment_gateway_configs (name, provider, mode, status) VALUES
    ('Stripe', 'stripe', 'sandbox', 'enabled'),
    ('Bank Transfer', 'bank', 'live', 'enabled');
