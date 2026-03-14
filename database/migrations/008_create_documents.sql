-- Migration 008: Document and KYC management

CREATE TABLE documents (
    id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id       UUID        NOT NULL REFERENCES users(id),
    broker_id     UUID        REFERENCES brokers(id),
    type          VARCHAR(100) NOT NULL CHECK (type IN ('passport','national_id','driving_license','utility_bill','bank_statement','selfie','other')),
    filename      VARCHAR(500) NOT NULL,
    original_name VARCHAR(500) NOT NULL,
    mimetype      VARCHAR(100),
    size          INTEGER,
    status        VARCHAR(50)  NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
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
    documents    UUID[],
    reviewed_by  UUID        REFERENCES users(id),
    note         TEXT,
    submitted_at TIMESTAMPTZ,
    reviewed_at  TIMESTAMPTZ,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_documents_user        ON documents (user_id);
CREATE INDEX idx_documents_status      ON documents (status);
CREATE INDEX idx_kyc_reviews_user      ON kyc_reviews (user_id);
CREATE INDEX idx_kyc_reviews_status    ON kyc_reviews (status);
