-- Migration 009: Chat and messaging system

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

CREATE INDEX idx_chat_messages_conversation ON chat_messages (conversation_id, created_at DESC);
