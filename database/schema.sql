-- VDA Trading Terminal – PostgreSQL Database Schema
-- ====================================================
-- This schema describes the production database structure.
-- The backend/models/index.js provides an equivalent in-memory
-- implementation that works without a database connection.

-- ── Extensions ──────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Users ────────────────────────────────────────────────────────────────
CREATE TABLE users (
    id            UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name          VARCHAR(255) NOT NULL,
    role          VARCHAR(50)  NOT NULL DEFAULT 'trader' CHECK (role IN ('admin', 'trader', 'manager')),
    is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users (email);

-- ── Trading accounts ─────────────────────────────────────────────────────
CREATE TABLE accounts (
    id            UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id       UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    login         VARCHAR(20)  NOT NULL UNIQUE,
    server        VARCHAR(100) NOT NULL DEFAULT 'VDA-Demo',
    currency      CHAR(3)      NOT NULL DEFAULT 'USD',
    leverage      INTEGER      NOT NULL DEFAULT 100 CHECK (leverage BETWEEN 1 AND 3000),
    balance       NUMERIC(18,2) NOT NULL DEFAULT 10000.00,
    equity        NUMERIC(18,2) NOT NULL DEFAULT 10000.00,
    margin        NUMERIC(18,2) NOT NULL DEFAULT 0.00,
    free_margin   NUMERIC(18,2) NOT NULL DEFAULT 10000.00,
    margin_level  NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    profit        NUMERIC(18,2) NOT NULL DEFAULT 0.00,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_accounts_user_id ON accounts (user_id);
CREATE INDEX idx_accounts_login   ON accounts (login);

-- ── Symbols ──────────────────────────────────────────────────────────────
CREATE TABLE symbols (
    id            SERIAL       PRIMARY KEY,
    name          VARCHAR(20)  NOT NULL UNIQUE,
    description   VARCHAR(100),
    digits        INTEGER      NOT NULL DEFAULT 5,
    contract_size INTEGER      NOT NULL DEFAULT 100000,
    spread        NUMERIC(10,5) NOT NULL DEFAULT 0.0001,
    is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

INSERT INTO symbols (name, description, digits, contract_size, spread) VALUES
    ('EURUSD', 'Euro vs US Dollar',       5, 100000, 0.00010),
    ('GBPUSD', 'Pound vs US Dollar',      5, 100000, 0.00020),
    ('USDJPY', 'US Dollar vs Yen',        3, 100000, 0.020),
    ('XAUUSD', 'Gold vs US Dollar',       2, 100,    0.30),
    ('USDCHF', 'US Dollar vs Swiss Franc',5, 100000, 0.00020),
    ('AUDUSD', 'Aussie vs US Dollar',     5, 100000, 0.00020),
    ('USDCAD', 'US Dollar vs Canadian',   5, 100000, 0.00020),
    ('NZDUSD', 'NZD vs US Dollar',        5, 100000, 0.00030),
    ('BTCUSD', 'Bitcoin vs US Dollar',    2, 1,      5.00),
    ('ETHUSD', 'Ethereum vs US Dollar',   2, 1,      0.50);

-- ── Price feed (tick data) ────────────────────────────────────────────────
CREATE TABLE price_feed (
    id         BIGSERIAL    PRIMARY KEY,
    symbol     VARCHAR(20)  NOT NULL REFERENCES symbols(name),
    bid        NUMERIC(18,5) NOT NULL,
    ask        NUMERIC(18,5) NOT NULL,
    time       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_price_feed_symbol_time ON price_feed (symbol, time DESC);

-- ── OHLCV Candles ─────────────────────────────────────────────────────────
CREATE TABLE candles (
    id         BIGSERIAL    PRIMARY KEY,
    symbol     VARCHAR(20)  NOT NULL REFERENCES symbols(name),
    timeframe  VARCHAR(5)   NOT NULL,
    open_time  BIGINT       NOT NULL,  -- Unix timestamp (seconds)
    open       NUMERIC(18,5) NOT NULL,
    high       NUMERIC(18,5) NOT NULL,
    low        NUMERIC(18,5) NOT NULL,
    close      NUMERIC(18,5) NOT NULL,
    volume     INTEGER      NOT NULL DEFAULT 0,
    UNIQUE (symbol, timeframe, open_time)
);

CREATE INDEX idx_candles_lookup ON candles (symbol, timeframe, open_time DESC);

-- ── Orders ───────────────────────────────────────────────────────────────
CREATE TYPE order_type AS ENUM (
    'BUY', 'SELL',
    'BUY LIMIT', 'SELL LIMIT',
    'BUY STOP', 'SELL STOP'
);

CREATE TYPE order_status AS ENUM ('open', 'pending', 'closed', 'cancelled');

CREATE TABLE orders (
    ticket      BIGINT       PRIMARY KEY,
    account_id  UUID         NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    symbol      VARCHAR(20)  NOT NULL REFERENCES symbols(name),
    type        order_type   NOT NULL,
    status      order_status NOT NULL DEFAULT 'open',
    lots        NUMERIC(10,2) NOT NULL CHECK (lots > 0),
    open_price  NUMERIC(18,5) NOT NULL,
    close_price NUMERIC(18,5),
    sl          NUMERIC(18,5),
    tp          NUMERIC(18,5),
    profit      NUMERIC(18,2) NOT NULL DEFAULT 0.00,
    swap        NUMERIC(18,2) NOT NULL DEFAULT 0.00,
    commission  NUMERIC(18,2) NOT NULL DEFAULT 0.00,
    comment     VARCHAR(100)  DEFAULT '',
    open_time   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    close_time  TIMESTAMPTZ
);

CREATE INDEX idx_orders_account_status ON orders (account_id, status);
CREATE INDEX idx_orders_symbol         ON orders (symbol);
CREATE INDEX idx_orders_open_time      ON orders (open_time DESC);

-- ── Trade history (materialised closed orders) ────────────────────────────
CREATE TABLE trade_history (
    id            BIGSERIAL    PRIMARY KEY,
    ticket        BIGINT       NOT NULL REFERENCES orders(ticket),
    account_id    UUID         NOT NULL REFERENCES accounts(id),
    symbol        VARCHAR(20)  NOT NULL,
    type          VARCHAR(20)  NOT NULL,
    lots          NUMERIC(10,2) NOT NULL,
    open_price    NUMERIC(18,5) NOT NULL,
    close_price   NUMERIC(18,5) NOT NULL,
    profit        NUMERIC(18,2) NOT NULL,
    swap          NUMERIC(18,2) NOT NULL DEFAULT 0.00,
    commission    NUMERIC(18,2) NOT NULL DEFAULT 0.00,
    open_time     TIMESTAMPTZ  NOT NULL,
    close_time    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_trade_history_account ON trade_history (account_id, close_time DESC);

-- ── Margin records ────────────────────────────────────────────────────────
CREATE TABLE margin_records (
    id            BIGSERIAL    PRIMARY KEY,
    account_id    UUID         NOT NULL REFERENCES accounts(id),
    balance       NUMERIC(18,2) NOT NULL,
    equity        NUMERIC(18,2) NOT NULL,
    margin        NUMERIC(18,2) NOT NULL,
    free_margin   NUMERIC(18,2) NOT NULL,
    margin_level  NUMERIC(10,2) NOT NULL,
    recorded_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_margin_account_time ON margin_records (account_id, recorded_at DESC);

-- ── Broker exposure (risk snapshot) ──────────────────────────────────────
CREATE TABLE broker_exposure (
    id             BIGSERIAL    PRIMARY KEY,
    symbol         VARCHAR(20)  NOT NULL REFERENCES symbols(name),
    buy_lots       NUMERIC(12,2) NOT NULL DEFAULT 0,
    sell_lots      NUMERIC(12,2) NOT NULL DEFAULT 0,
    net_lots       NUMERIC(12,2) NOT NULL DEFAULT 0,
    unrealised_pnl NUMERIC(18,2) NOT NULL DEFAULT 0,
    snapshot_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_broker_exposure_time ON broker_exposure (snapshot_at DESC);

-- ── Sessions (JWT refresh token store) ───────────────────────────────────
CREATE TABLE sessions (
    id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id      UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    refresh_token VARCHAR(512) NOT NULL UNIQUE,
    expires_at   TIMESTAMPTZ NOT NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    revoked      BOOLEAN     NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_sessions_user    ON sessions (user_id);
CREATE INDEX idx_sessions_token   ON sessions (refresh_token);

-- ── updated_at trigger helper ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER accounts_updated_at
    BEFORE UPDATE ON accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Brokers ──────────────────────────────────────────────────────────────
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

CREATE TABLE broker_users (
    id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    broker_id  UUID        NOT NULL REFERENCES brokers(id) ON DELETE CASCADE,
    user_id    UUID        NOT NULL REFERENCES users(id)   ON DELETE CASCADE,
    role       VARCHAR(50) NOT NULL DEFAULT 'broker_admin',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(broker_id, user_id)
);

-- ── CRM ─────────────────────────────────────────────────────────────────
CREATE TABLE crm_clients (
    id            UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id       UUID         REFERENCES users(id),
    broker_id     UUID         REFERENCES brokers(id),
    name          VARCHAR(255) NOT NULL,
    email         VARCHAR(255) NOT NULL,
    phone         VARCHAR(50),
    country       VARCHAR(100),
    status        VARCHAR(50)  NOT NULL DEFAULT 'active',
    kyc_status    VARCHAR(50)  NOT NULL DEFAULT 'pending',
    assigned_to   UUID         REFERENCES users(id),
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE crm_leads (
    id            UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    broker_id     UUID         REFERENCES brokers(id),
    name          VARCHAR(255) NOT NULL,
    email         VARCHAR(255),
    phone         VARCHAR(50),
    source        VARCHAR(100),
    status        VARCHAR(50)  NOT NULL DEFAULT 'new',
    assigned_to   UUID         REFERENCES users(id),
    notes         TEXT,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE crm_notes (
    id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id  UUID        REFERENCES crm_clients(id) ON DELETE CASCADE,
    lead_id    UUID        REFERENCES crm_leads(id)   ON DELETE CASCADE,
    content    TEXT        NOT NULL,
    author_id  UUID        NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE crm_activities (
    id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id    UUID        REFERENCES crm_clients(id) ON DELETE CASCADE,
    lead_id      UUID        REFERENCES crm_leads(id)   ON DELETE CASCADE,
    type         VARCHAR(50) NOT NULL,
    description  TEXT,
    author_id    UUID        NOT NULL REFERENCES users(id),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE support_tickets (
    id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id    UUID        REFERENCES crm_clients(id),
    broker_id    UUID        REFERENCES brokers(id),
    subject      VARCHAR(255) NOT NULL,
    description  TEXT,
    status       VARCHAR(50) NOT NULL DEFAULT 'open',
    priority     VARCHAR(20) NOT NULL DEFAULT 'medium',
    assigned_to  UUID        REFERENCES users(id),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Finance ──────────────────────────────────────────────────────────────
CREATE TABLE deposits (
    id           UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id      UUID          NOT NULL REFERENCES users(id),
    account_id   UUID          REFERENCES accounts(id),
    broker_id    UUID          REFERENCES brokers(id),
    amount       NUMERIC(18,2) NOT NULL CHECK (amount > 0),
    currency     CHAR(3)       NOT NULL DEFAULT 'USD',
    method       VARCHAR(100)  NOT NULL DEFAULT 'bank_transfer',
    status       VARCHAR(50)   NOT NULL DEFAULT 'pending',
    reference    VARCHAR(255),
    note         TEXT,
    approved_by  UUID          REFERENCES users(id),
    approved_at  TIMESTAMPTZ,
    created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TABLE withdrawals (
    id           UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id      UUID          NOT NULL REFERENCES users(id),
    account_id   UUID          REFERENCES accounts(id),
    broker_id    UUID          REFERENCES brokers(id),
    amount       NUMERIC(18,2) NOT NULL CHECK (amount > 0),
    currency     CHAR(3)       NOT NULL DEFAULT 'USD',
    method       VARCHAR(100)  NOT NULL DEFAULT 'bank_transfer',
    status       VARCHAR(50)   NOT NULL DEFAULT 'pending',
    reference    VARCHAR(255),
    note         TEXT,
    approved_by  UUID          REFERENCES users(id),
    approved_at  TIMESTAMPTZ,
    created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ── Payments ─────────────────────────────────────────────────────────────
CREATE TABLE payment_gateway_configs (
    id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    broker_id    UUID        REFERENCES brokers(id),
    name         VARCHAR(255) NOT NULL,
    provider     VARCHAR(100) NOT NULL,
    api_key      TEXT,
    api_secret   TEXT,
    webhook_url  VARCHAR(500),
    mode         VARCHAR(20)  NOT NULL DEFAULT 'sandbox',
    status       VARCHAR(20)  NOT NULL DEFAULT 'enabled',
    config       JSONB        DEFAULT '{}',
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── Documents & KYC ──────────────────────────────────────────────────────
CREATE TABLE documents (
    id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id       UUID        NOT NULL REFERENCES users(id),
    broker_id     UUID        REFERENCES brokers(id),
    type          VARCHAR(100) NOT NULL CHECK (type IN ('passport','national_id','driving_license','utility_bill','bank_statement','selfie','other')),
    filename      VARCHAR(500) NOT NULL,
    original_name VARCHAR(500) NOT NULL,
    mimetype      VARCHAR(100),
    size          INTEGER,
    status        VARCHAR(50)  NOT NULL DEFAULT 'pending',
    reviewed_by   UUID         REFERENCES users(id),
    review_note   TEXT,
    uploaded_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    reviewed_at   TIMESTAMPTZ
);

CREATE TABLE kyc_reviews (
    id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id      UUID        NOT NULL REFERENCES users(id),
    broker_id    UUID        REFERENCES brokers(id),
    status       VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','submitted','under_review','approved','rejected')),
    reviewed_by  UUID        REFERENCES users(id),
    note         TEXT,
    submitted_at TIMESTAMPTZ,
    reviewed_at  TIMESTAMPTZ,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Chat ─────────────────────────────────────────────────────────────────
CREATE TABLE chat_conversations (
    id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    title        VARCHAR(255),
    type         VARCHAR(50) NOT NULL DEFAULT 'direct' CHECK (type IN ('direct','group','support','crm')),
    participants UUID[]      NOT NULL DEFAULT '{}',
    last_message TEXT,
    last_message_at TIMESTAMPTZ,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE chat_messages (
    id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID        NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
    sender_id       UUID        NOT NULL REFERENCES users(id),
    content         TEXT        NOT NULL,
    read_by         UUID[]      NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Platform Settings ────────────────────────────────────────────────────
CREATE TABLE platform_settings (
    key          VARCHAR(100) PRIMARY KEY,
    value        TEXT         NOT NULL DEFAULT '',
    category     VARCHAR(100) NOT NULL DEFAULT 'general',
    description  TEXT,
    updated_by   UUID         REFERENCES users(id),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── Audit Logs ───────────────────────────────────────────────────────────
CREATE TABLE audit_logs (
    id           BIGSERIAL    PRIMARY KEY,
    user_id      UUID         REFERENCES users(id),
    action       VARCHAR(255) NOT NULL,
    resource     VARCHAR(100),
    resource_id  VARCHAR(100),
    details      JSONB,
    ip_address   INET,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
