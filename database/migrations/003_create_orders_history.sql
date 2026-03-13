-- 003 – Create orders, price feed, candles, trade history, broker exposure

CREATE TYPE IF NOT EXISTS order_type AS ENUM (
    'BUY','SELL','BUY LIMIT','SELL LIMIT','BUY STOP','SELL STOP');

CREATE TYPE IF NOT EXISTS order_status AS ENUM (
    'open','pending','closed','cancelled');

CREATE TABLE IF NOT EXISTS orders (
    ticket      BIGINT        PRIMARY KEY,
    account_id  UUID          NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    symbol      VARCHAR(20)   NOT NULL REFERENCES symbols(name),
    type        order_type    NOT NULL,
    status      order_status  NOT NULL DEFAULT 'open',
    lots        NUMERIC(10,2) NOT NULL CHECK (lots > 0),
    open_price  NUMERIC(18,5) NOT NULL,
    close_price NUMERIC(18,5),
    sl          NUMERIC(18,5),
    tp          NUMERIC(18,5),
    profit      NUMERIC(18,2) NOT NULL DEFAULT 0.00,
    swap        NUMERIC(18,2) NOT NULL DEFAULT 0.00,
    commission  NUMERIC(18,2) NOT NULL DEFAULT 0.00,
    comment     VARCHAR(100)  DEFAULT '',
    open_time   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    close_time  TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS price_feed (
    id      BIGSERIAL     PRIMARY KEY,
    symbol  VARCHAR(20)   NOT NULL REFERENCES symbols(name),
    bid     NUMERIC(18,5) NOT NULL,
    ask     NUMERIC(18,5) NOT NULL,
    time    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS candles (
    id        BIGSERIAL     PRIMARY KEY,
    symbol    VARCHAR(20)   NOT NULL REFERENCES symbols(name),
    timeframe VARCHAR(5)    NOT NULL,
    open_time BIGINT        NOT NULL,
    open      NUMERIC(18,5) NOT NULL,
    high      NUMERIC(18,5) NOT NULL,
    low       NUMERIC(18,5) NOT NULL,
    close     NUMERIC(18,5) NOT NULL,
    volume    INTEGER       NOT NULL DEFAULT 0,
    UNIQUE (symbol, timeframe, open_time)
);

CREATE TABLE IF NOT EXISTS trade_history (
    id          BIGSERIAL     PRIMARY KEY,
    ticket      BIGINT        NOT NULL REFERENCES orders(ticket),
    account_id  UUID          NOT NULL REFERENCES accounts(id),
    symbol      VARCHAR(20)   NOT NULL,
    type        VARCHAR(20)   NOT NULL,
    lots        NUMERIC(10,2) NOT NULL,
    open_price  NUMERIC(18,5) NOT NULL,
    close_price NUMERIC(18,5) NOT NULL,
    profit      NUMERIC(18,2) NOT NULL,
    swap        NUMERIC(18,2) NOT NULL DEFAULT 0.00,
    commission  NUMERIC(18,2) NOT NULL DEFAULT 0.00,
    open_time   TIMESTAMPTZ   NOT NULL,
    close_time  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS broker_exposure (
    id             BIGSERIAL     PRIMARY KEY,
    symbol         VARCHAR(20)   NOT NULL REFERENCES symbols(name),
    buy_lots       NUMERIC(12,2) NOT NULL DEFAULT 0,
    sell_lots      NUMERIC(12,2) NOT NULL DEFAULT 0,
    net_lots       NUMERIC(12,2) NOT NULL DEFAULT 0,
    unrealised_pnl NUMERIC(18,2) NOT NULL DEFAULT 0,
    snapshot_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS margin_records (
    id           BIGSERIAL     PRIMARY KEY,
    account_id   UUID          NOT NULL REFERENCES accounts(id),
    balance      NUMERIC(18,2) NOT NULL,
    equity       NUMERIC(18,2) NOT NULL,
    margin       NUMERIC(18,2) NOT NULL,
    free_margin  NUMERIC(18,2) NOT NULL,
    margin_level NUMERIC(10,2) NOT NULL,
    recorded_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
