-- VDA Trading Terminal – Demo / Development Seed Data
-- =====================================================
-- Populates the database with a set of demo users, trading accounts,
-- symbols, open orders, and trade history so the platform is immediately
-- usable after a fresh schema migration.
--
-- Usage:
--   psql -d vda_trading -f database/schema.sql   # run once to create tables
--   psql -d vda_trading -f database/seeds.sql    # load demo data
--
-- This script runs inside a single transaction.  Any error automatically
-- triggers a full ROLLBACK so the database is never left in a partial state.
--
-- ⚠  CRITICAL: These credentials are for LOCAL DEVELOPMENT ONLY.
--    Change ALL passwords immediately before deploying to any environment
--    other than local development (staging, production, or any internet-
--    accessible server).
--
-- Demo credentials:
--   Super-admin:  superadmin@vda.trade  / SuperAdmin1234!
--   Admin/Broker: admin@vda.trade       / Admin1234!
--   Trader 1:     demo@vda.trade        / Demo1234!
--   Trader 2:     trader2@vda.trade     / Trader1234!

BEGIN;

-- ── Extension needed for password hashing ────────────────────────────────
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Wipe existing seed data (idempotent re-run) ───────────────────────────
DELETE FROM trade_history;
DELETE FROM broker_exposure;
DELETE FROM margin_records;
DELETE FROM orders;
DELETE FROM price_feed;
DELETE FROM candles;
DELETE FROM sessions;
DELETE FROM accounts;
DELETE FROM users;

-- ── Users ─────────────────────────────────────────────────────────────────

INSERT INTO users (id, email, password_hash, name, role, is_active) VALUES
  ('00000000-0000-0000-0000-000000000001',
   'superadmin@vda.trade',
   crypt('SuperAdmin1234!', gen_salt('bf', 10)),
   'Super Admin',
   'admin',
   TRUE),

  ('00000000-0000-0000-0000-000000000002',
   'admin@vda.trade',
   crypt('Admin1234!', gen_salt('bf', 10)),
   'VDA Admin',
   'admin',
   TRUE),

  ('00000000-0000-0000-0000-000000000003',
   'demo@vda.trade',
   crypt('Demo1234!', gen_salt('bf', 10)),
   'Demo Trader',
   'trader',
   TRUE),

  ('00000000-0000-0000-0000-000000000004',
   'trader2@vda.trade',
   crypt('Trader1234!', gen_salt('bf', 10)),
   'Jane Trader',
   'trader',
   TRUE);

-- ── Trading accounts ──────────────────────────────────────────────────────

INSERT INTO accounts (id, user_id, login, server, currency, leverage,
                      balance, equity, margin, free_margin, margin_level, profit) VALUES
  ('00000000-0000-0000-0001-000000000001',
   '00000000-0000-0000-0000-000000000003',
   '10001', 'VDA-Demo', 'USD', 100,
   10000.00, 10150.50, 200.00, 9950.50, 5075.25, 150.50),

  ('00000000-0000-0000-0001-000000000002',
   '00000000-0000-0000-0000-000000000004',
   '10002', 'VDA-Demo', 'USD', 200,
   25000.00, 24820.00, 500.00, 24320.00, 4964.00, -180.00);

-- ── Additional symbols (top-ups beyond schema.sql seed) ───────────────────
-- The schema.sql INSERT uses ON CONFLICT DO NOTHING, so these are safe.

INSERT INTO symbols (name, description, digits, contract_size, spread) VALUES
  ('USDJPY', 'US Dollar vs Yen',          3, 100000, 0.02000),
  ('XAUUSD', 'Gold vs US Dollar',         2,    100, 0.30000),
  ('USDCHF', 'US Dollar vs Swiss Franc',  5, 100000, 0.00020),
  ('AUDUSD', 'Aussie vs US Dollar',       5, 100000, 0.00020),
  ('USDCAD', 'US Dollar vs Canadian',     5, 100000, 0.00020),
  ('NZDUSD', 'NZD vs US Dollar',          5, 100000, 0.00030),
  ('BTCUSD', 'Bitcoin vs US Dollar',      2,      1, 5.00000),
  ('ETHUSD', 'Ethereum vs US Dollar',     2,      1, 0.50000)
ON CONFLICT (name) DO NOTHING;

-- ── Sample price feed (latest tick per symbol) ────────────────────────────

INSERT INTO price_feed (symbol, bid, ask, time) VALUES
  ('EURUSD', 1.08520, 1.08532, NOW() - INTERVAL '5 seconds'),
  ('GBPUSD', 1.26840, 1.26858, NOW() - INTERVAL '5 seconds'),
  ('USDJPY', 149.520, 149.542, NOW() - INTERVAL '5 seconds'),
  ('XAUUSD', 2312.40, 2312.70, NOW() - INTERVAL '5 seconds'),
  ('USDCHF', 0.89720, 0.89740, NOW() - INTERVAL '5 seconds'),
  ('AUDUSD', 0.65480, 0.65498, NOW() - INTERVAL '5 seconds'),
  ('USDCAD', 1.35620, 1.35640, NOW() - INTERVAL '5 seconds'),
  ('NZDUSD', 0.59860, 0.59889, NOW() - INTERVAL '5 seconds'),
  ('BTCUSD', 67450.00, 67455.00, NOW() - INTERVAL '5 seconds'),
  ('ETHUSD', 3120.50, 3121.00, NOW() - INTERVAL '5 seconds');

-- ── Open orders ───────────────────────────────────────────────────────────

INSERT INTO orders (ticket, account_id, symbol, type, status, lots,
                    open_price, sl, tp, profit, swap, commission, comment, open_time) VALUES
  (1001,
   '00000000-0000-0000-0001-000000000001',
   'EURUSD', 'BUY', 'open', 0.10,
   1.08450, 1.08000, 1.09000,
   7.20, -0.10, -0.70, 'Demo long EURUSD', NOW() - INTERVAL '2 hours'),

  (1002,
   '00000000-0000-0000-0001-000000000001',
   'XAUUSD', 'BUY', 'open', 0.05,
   2308.00, 2280.00, 2360.00,
   143.30, -0.20, -1.00, 'Gold long', NOW() - INTERVAL '1 hour'),

  (1003,
   '00000000-0000-0000-0001-000000000002',
   'GBPUSD', 'SELL', 'open', 0.20,
   1.26950, 1.27500, 1.26500,
   -180.00, -0.30, -1.40, 'Short GBP', NOW() - INTERVAL '3 hours');

-- ── Closed trade history ──────────────────────────────────────────────────

INSERT INTO orders (ticket, account_id, symbol, type, status, lots,
                    open_price, close_price, sl, tp, profit, swap, commission,
                    comment, open_time, close_time) VALUES
  (900,
   '00000000-0000-0000-0001-000000000001',
   'EURUSD', 'BUY', 'closed', 0.10,
   1.07800, 1.08200, 1.07500, 1.08500,
   40.00, -0.50, -0.70, 'Closed profit', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day'),

  (901,
   '00000000-0000-0000-0001-000000000001',
   'USDJPY', 'SELL', 'closed', 0.10,
   150.200, 149.500, 150.800, 149.000,
   47.00, -0.20, -0.70, 'JPY short win', NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days'),

  (902,
   '00000000-0000-0000-0001-000000000002',
   'XAUUSD', 'BUY', 'closed', 0.05,
   2295.00, 2310.00, 2280.00, 2330.00,
   75.00, -0.30, -1.00, 'Gold scalp', NOW() - INTERVAL '4 days', NOW() - INTERVAL '3 days');

INSERT INTO trade_history (ticket, account_id, symbol, type, lots,
                           open_price, close_price, profit, swap, commission,
                           open_time, close_time)
-- orders.type is the order_type enum; trade_history.type is VARCHAR(20).
-- The explicit cast converts the enum value to its text representation.
SELECT ticket, account_id, symbol, type::text, lots,
       open_price, close_price, profit, swap, commission,
       open_time, close_time
FROM   orders
WHERE  status = 'closed';

-- ── Margin snapshots ──────────────────────────────────────────────────────

INSERT INTO margin_records (account_id, balance, equity, margin,
                            free_margin, margin_level, recorded_at) VALUES
  ('00000000-0000-0000-0001-000000000001',
   10000.00, 10150.50, 200.00, 9950.50, 5075.25, NOW() - INTERVAL '1 hour'),
  ('00000000-0000-0000-0001-000000000002',
   25000.00, 24820.00, 500.00, 24320.00, 4964.00, NOW() - INTERVAL '1 hour');

-- ── Broker exposure snapshot ──────────────────────────────────────────────

INSERT INTO broker_exposure (symbol, buy_lots, sell_lots, net_lots,
                             unrealised_pnl, snapshot_at) VALUES
  ('EURUSD', 0.10, 0.00, 0.10,   7.20, NOW()),
  ('GBPUSD', 0.00, 0.20, -0.20,-180.00, NOW()),
  ('XAUUSD', 0.05, 0.00, 0.05, 143.30, NOW());

COMMIT;
