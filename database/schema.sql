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

-- ═══════════════════════════════════════════════════════════════════════════
-- White Label Multi-Tenant Extension
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Brokers (white label tenants) ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS brokers (
    id                 UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug               VARCHAR(100) NOT NULL UNIQUE,
    name               VARCHAR(255) NOT NULL,
    owner_email        VARCHAR(255) NOT NULL,
    status             VARCHAR(20)  NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended','inactive')),
    -- Branding (JSON)
    branding           JSONB        NOT NULL DEFAULT '{}',
    -- Domain config
    domain             VARCHAR(255),
    custom_domain      VARCHAR(255),
    -- Trading conditions (JSON)
    trading_conditions JSONB        NOT NULL DEFAULT '{}',
    -- Features flags (JSON)
    features           JSONB        NOT NULL DEFAULT '{}',
    -- MT4 bridge config (JSON, sensitive - store encrypted in production)
    mt4_config         JSONB        NOT NULL DEFAULT '{}',
    created_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_brokers_slug   ON brokers (slug);
CREATE INDEX IF NOT EXISTS idx_brokers_status ON brokers (status);

-- Add broker_id to users (multi-tenant isolation)
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS broker_id UUID REFERENCES brokers(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_users_broker ON users (broker_id);

-- Add broker_id to accounts
ALTER TABLE accounts
    ADD COLUMN IF NOT EXISTS broker_id UUID REFERENCES brokers(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_accounts_broker ON accounts (broker_id);

-- ── Broker revenue tracking ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS broker_revenue (
    id          BIGSERIAL    PRIMARY KEY,
    broker_id   UUID         NOT NULL REFERENCES brokers(id) ON DELETE CASCADE,
    type        VARCHAR(30)  NOT NULL CHECK (type IN ('commission','spread','deposit','withdrawal')),
    amount      NUMERIC(18,2) NOT NULL,
    reference   VARCHAR(100),
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_broker_revenue_broker ON broker_revenue (broker_id, created_at DESC);

-- ── Copy Trading ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS copy_strategies (
    id              UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    broker_id       UUID         REFERENCES brokers(id) ON DELETE SET NULL,
    provider_id     UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_id      UUID         NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    performance_fee NUMERIC(5,2) NOT NULL DEFAULT 20 CHECK (performance_fee BETWEEN 0 AND 50),
    min_deposit     NUMERIC(18,2) NOT NULL DEFAULT 100,
    max_followers   INTEGER      NOT NULL DEFAULT 100,
    is_public       BOOLEAN      NOT NULL DEFAULT TRUE,
    status          VARCHAR(20)  NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused','closed')),
    stats           JSONB        NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_copy_strategies_provider ON copy_strategies (provider_id);
CREATE INDEX IF NOT EXISTS idx_copy_strategies_public   ON copy_strategies (is_public, status);

CREATE TABLE IF NOT EXISTS copy_subscriptions (
    id                   UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    strategy_id          UUID        NOT NULL REFERENCES copy_strategies(id) ON DELETE CASCADE,
    follower_id          UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    follower_account_id  UUID        NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    risk_factor          NUMERIC(5,2) NOT NULL DEFAULT 1.0 CHECK (risk_factor BETWEEN 0.1 AND 5.0),
    max_lots             NUMERIC(10,2) NOT NULL DEFAULT 10,
    status               VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused','cancelled')),
    stats                JSONB       NOT NULL DEFAULT '{}',
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (strategy_id, follower_id)
);

CREATE INDEX IF NOT EXISTS idx_copy_subs_follower  ON copy_subscriptions (follower_id);
CREATE INDEX IF NOT EXISTS idx_copy_subs_strategy  ON copy_subscriptions (strategy_id);

-- ── Risk Engine ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_routing (
    ticket      BIGINT       PRIMARY KEY,
    broker_id   UUID         REFERENCES brokers(id) ON DELETE SET NULL,
    book        VARCHAR(10)  NOT NULL CHECK (book IN ('a-book','b-book')),
    reason      TEXT,
    hedge_ref   VARCHAR(100),
    routed_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── Liquidity Providers ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS liquidity_providers (
    id             VARCHAR(50)  PRIMARY KEY,
    name           VARCHAR(255) NOT NULL,
    type           VARCHAR(30)  NOT NULL DEFAULT 'ecn',
    status         VARCHAR(20)  NOT NULL DEFAULT 'active',
    priority       INTEGER      NOT NULL DEFAULT 5,
    spread_markup  NUMERIC(10,6) NOT NULL DEFAULT 0.0001,
    max_lots       NUMERIC(10,2) NOT NULL DEFAULT 100,
    min_lots       NUMERIC(10,4) NOT NULL DEFAULT 0.01,
    symbols        TEXT[]       NOT NULL DEFAULT '{}',
    latency_ms     INTEGER      NOT NULL DEFAULT 25,
    fill_rate      NUMERIC(5,4) NOT NULL DEFAULT 0.95,
    stats          JSONB        NOT NULL DEFAULT '{}',
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── MT4 Servers ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS mt4_servers (
    id          VARCHAR(50)  PRIMARY KEY,
    broker_id   UUID         REFERENCES brokers(id) ON DELETE SET NULL,
    name        VARCHAR(255) NOT NULL,
    host        VARCHAR(255) NOT NULL,
    port        INTEGER      NOT NULL DEFAULT 443,
    -- login/password stored encrypted in production
    version     VARCHAR(50),
    status      VARCHAR(20)  NOT NULL DEFAULT 'disconnected',
    last_sync   TIMESTAMPTZ,
    sync_stats  JSONB        NOT NULL DEFAULT '{}',
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mt4_servers_broker ON mt4_servers (broker_id);

-- ── Update triggers ────────────────────────────────────────────────────────
CREATE TRIGGER brokers_updated_at
    BEFORE UPDATE ON brokers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER copy_strategies_updated_at
    BEFORE UPDATE ON copy_strategies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
