-- Migration 005: CRM system tables

-- CRM Clients (full profiles for active traders)
CREATE TABLE crm_clients (
    id            UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id       UUID         REFERENCES users(id),
    broker_id     UUID         REFERENCES brokers(id),
    name          VARCHAR(255) NOT NULL,
    email         VARCHAR(255) NOT NULL,
    phone         VARCHAR(50),
    country       VARCHAR(100),
    status        VARCHAR(50)  NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive','suspended','pending')),
    kyc_status    VARCHAR(50)  NOT NULL DEFAULT 'pending' CHECK (kyc_status IN ('pending','submitted','approved','rejected')),
    assigned_to   UUID         REFERENCES users(id),
    tags          TEXT[],
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- CRM Leads (prospects not yet converted)
CREATE TABLE crm_leads (
    id            UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    broker_id     UUID         REFERENCES brokers(id),
    name          VARCHAR(255) NOT NULL,
    email         VARCHAR(255),
    phone         VARCHAR(50),
    source        VARCHAR(100),
    status        VARCHAR(50)  NOT NULL DEFAULT 'new' CHECK (status IN ('new','contacted','qualified','converted','lost')),
    assigned_to   UUID         REFERENCES users(id),
    notes         TEXT,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- CRM Notes
CREATE TABLE crm_notes (
    id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id  UUID        REFERENCES crm_clients(id) ON DELETE CASCADE,
    lead_id    UUID        REFERENCES crm_leads(id)   ON DELETE CASCADE,
    content    TEXT        NOT NULL,
    author_id  UUID        NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- CRM Activities (calls, emails, meetings)
CREATE TABLE crm_activities (
    id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id   UUID        REFERENCES crm_clients(id) ON DELETE CASCADE,
    lead_id     UUID        REFERENCES crm_leads(id)   ON DELETE CASCADE,
    type        VARCHAR(50) NOT NULL CHECK (type IN ('call','email','meeting','note','task','other')),
    description TEXT,
    outcome     VARCHAR(255),
    author_id   UUID        NOT NULL REFERENCES users(id),
    scheduled_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Support Tickets
CREATE TABLE support_tickets (
    id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id    UUID        REFERENCES crm_clients(id),
    broker_id    UUID        REFERENCES brokers(id),
    subject      VARCHAR(255) NOT NULL,
    description  TEXT,
    status       VARCHAR(50) NOT NULL DEFAULT 'open' CHECK (status IN ('open','in_progress','resolved','closed')),
    priority     VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high','urgent')),
    assigned_to  UUID        REFERENCES users(id),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_crm_clients_broker    ON crm_clients (broker_id);
CREATE INDEX idx_crm_clients_email     ON crm_clients (email);
CREATE INDEX idx_crm_clients_assigned  ON crm_clients (assigned_to);
CREATE INDEX idx_crm_leads_broker      ON crm_leads (broker_id);
CREATE INDEX idx_crm_notes_client      ON crm_notes (client_id);
CREATE INDEX idx_crm_activities_client ON crm_activities (client_id);
CREATE INDEX idx_support_tickets_broker ON support_tickets (broker_id);
