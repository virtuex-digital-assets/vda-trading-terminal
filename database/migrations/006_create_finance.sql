-- Migration 006: Finance and transaction tables

-- Deposits
CREATE TABLE deposits (
    id           UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id      UUID          NOT NULL REFERENCES users(id),
    account_id   UUID          REFERENCES accounts(id),
    broker_id    UUID          REFERENCES brokers(id),
    amount       NUMERIC(18,2) NOT NULL CHECK (amount > 0),
    currency     CHAR(3)       NOT NULL DEFAULT 'USD',
    method       VARCHAR(100)  NOT NULL DEFAULT 'bank_transfer',
    status       VARCHAR(50)   NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','cancelled','completed')),
    reference    VARCHAR(255),
    note         TEXT,
    approved_by  UUID          REFERENCES users(id),
    approved_at  TIMESTAMPTZ,
    created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Withdrawals
CREATE TABLE withdrawals (
    id           UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id      UUID          NOT NULL REFERENCES users(id),
    account_id   UUID          REFERENCES accounts(id),
    broker_id    UUID          REFERENCES brokers(id),
    amount       NUMERIC(18,2) NOT NULL CHECK (amount > 0),
    currency     CHAR(3)       NOT NULL DEFAULT 'USD',
    method       VARCHAR(100)  NOT NULL DEFAULT 'bank_transfer',
    status       VARCHAR(50)   NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','cancelled','completed')),
    bank_name    VARCHAR(255),
    account_number VARCHAR(100),
    reference    VARCHAR(255),
    note         TEXT,
    approved_by  UUID          REFERENCES users(id),
    approved_at  TIMESTAMPTZ,
    created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- General ledger transactions
CREATE TABLE transactions (
    id           UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id      UUID          NOT NULL REFERENCES users(id),
    account_id   UUID          REFERENCES accounts(id),
    type         VARCHAR(50)   NOT NULL CHECK (type IN ('deposit','withdrawal','adjustment','fee','commission','profit','loss')),
    amount       NUMERIC(18,2) NOT NULL,
    currency     CHAR(3)       NOT NULL DEFAULT 'USD',
    balance_after NUMERIC(18,2),
    reference    VARCHAR(255),
    description  TEXT,
    created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_deposits_user         ON deposits (user_id);
CREATE INDEX idx_deposits_status       ON deposits (status);
CREATE INDEX idx_withdrawals_user      ON withdrawals (user_id);
CREATE INDEX idx_withdrawals_status    ON withdrawals (status);
CREATE INDEX idx_transactions_user     ON transactions (user_id);
CREATE INDEX idx_transactions_created  ON transactions (created_at DESC);
