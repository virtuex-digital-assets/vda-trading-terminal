-- Migration 010: Platform settings

CREATE TABLE platform_settings (
    key          VARCHAR(100) PRIMARY KEY,
    value        TEXT         NOT NULL DEFAULT '',
    category     VARCHAR(100) NOT NULL DEFAULT 'general',
    description  TEXT,
    updated_by   UUID         REFERENCES users(id),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_platform_settings_category ON platform_settings (category);

INSERT INTO platform_settings (key, value, category, description) VALUES
    ('platform_name',        'VDA Trading',     'general',  'Name of the trading platform'),
    ('maintenance_mode',     'false',            'general',  'Enable maintenance mode'),
    ('support_email',        'support@vda.trade','general',  'Support email address'),
    ('max_leverage',         '500',              'trading',  'Maximum leverage allowed'),
    ('min_deposit',          '100',              'trading',  'Minimum deposit amount in USD'),
    ('default_currency',     'USD',              'trading',  'Default account currency'),
    ('kyc_required',         'true',             'compliance','KYC verification required for withdrawals'),
    ('kyc_auto_approve',     'false',            'compliance','Auto-approve KYC submissions'),
    ('crm_lead_auto_assign', 'true',             'crm',      'Auto-assign new leads to agents'),
    ('chat_enabled',         'true',             'communication','Enable internal chat system'),
    ('two_factor_required',  'false',            'security', '2FA required for all users'),
    ('session_timeout',      '3600',             'security', 'Session timeout in seconds'),
    ('stripe_enabled',       'false',            'payment',  'Enable Stripe payment gateway'),
    ('crypto_enabled',       'false',            'payment',  'Enable crypto payment gateway');
