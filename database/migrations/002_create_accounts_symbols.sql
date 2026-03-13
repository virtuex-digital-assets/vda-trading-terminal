-- 002 – Create accounts + symbols tables

CREATE TABLE IF NOT EXISTS accounts (
    id            UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id       UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    login         VARCHAR(20)   NOT NULL UNIQUE,
    server        VARCHAR(100)  NOT NULL DEFAULT 'VDA-Demo',
    currency      CHAR(3)       NOT NULL DEFAULT 'USD',
    leverage      INTEGER       NOT NULL DEFAULT 100,
    balance       NUMERIC(18,2) NOT NULL DEFAULT 10000.00,
    equity        NUMERIC(18,2) NOT NULL DEFAULT 10000.00,
    margin        NUMERIC(18,2) NOT NULL DEFAULT 0.00,
    free_margin   NUMERIC(18,2) NOT NULL DEFAULT 10000.00,
    margin_level  NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    profit        NUMERIC(18,2) NOT NULL DEFAULT 0.00,
    created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS symbols (
    id            SERIAL        PRIMARY KEY,
    name          VARCHAR(20)   NOT NULL UNIQUE,
    description   VARCHAR(100),
    digits        INTEGER       NOT NULL DEFAULT 5,
    contract_size INTEGER       NOT NULL DEFAULT 100000,
    spread        NUMERIC(10,5) NOT NULL DEFAULT 0.0001,
    is_active     BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

INSERT INTO symbols (name, description, digits, contract_size, spread)
VALUES
    ('EURUSD','Euro vs US Dollar',       5,100000,0.00010),
    ('GBPUSD','Pound vs US Dollar',      5,100000,0.00020),
    ('USDJPY','US Dollar vs Yen',        3,100000,0.020),
    ('XAUUSD','Gold vs US Dollar',       2,100,   0.30),
    ('USDCHF','US Dollar vs Swiss Franc',5,100000,0.00020),
    ('AUDUSD','Aussie vs US Dollar',     5,100000,0.00020),
    ('USDCAD','US Dollar vs Canadian',   5,100000,0.00020),
    ('NZDUSD','NZD vs US Dollar',        5,100000,0.00030),
    ('BTCUSD','Bitcoin vs US Dollar',    2,1,     5.00),
    ('ETHUSD','Ethereum vs US Dollar',   2,1,     0.50)
ON CONFLICT (name) DO NOTHING;
