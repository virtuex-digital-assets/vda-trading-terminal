-- Migration 004: Brokers and broker administration
-- Adds multi-broker support, broker admins, and extended user roles

-- Extend users role check to include all platform roles
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check
    CHECK (role IN ('super_admin','admin','broker_admin','dealer','finance','crm_agent','support','trader'));

-- Brokers table
CREATE TABLE brokers (
    id            UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    name          VARCHAR(255) NOT NULL,
    email         VARCHAR(255) NOT NULL UNIQUE,
    phone         VARCHAR(50),
    country       VARCHAR(100),
    status        VARCHAR(20)  NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive','suspended')),
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Broker-user assignments (broker admins, dealers, etc.)
CREATE TABLE broker_users (
    id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    broker_id  UUID        NOT NULL REFERENCES brokers(id) ON DELETE CASCADE,
    user_id    UUID        NOT NULL REFERENCES users(id)   ON DELETE CASCADE,
    role       VARCHAR(50) NOT NULL DEFAULT 'broker_admin',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(broker_id, user_id)
);

-- Add broker_id to users for scoped access
ALTER TABLE users ADD COLUMN IF NOT EXISTS broker_id UUID REFERENCES brokers(id);

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id         BIGSERIAL    PRIMARY KEY,
    user_id    UUID         REFERENCES users(id),
    action     VARCHAR(255) NOT NULL,
    resource   VARCHAR(100),
    resource_id VARCHAR(100),
    details    JSONB,
    ip_address INET,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_brokers_status        ON brokers (status);
CREATE INDEX idx_broker_users_broker   ON broker_users (broker_id);
CREATE INDEX idx_broker_users_user     ON broker_users (user_id);
CREATE INDEX idx_audit_logs_user       ON audit_logs (user_id);
CREATE INDEX idx_audit_logs_created    ON audit_logs (created_at DESC);
