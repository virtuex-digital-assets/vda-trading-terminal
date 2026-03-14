# VDA Trading Platform – Platform Architecture

## Overview

The VDA Trading Platform is a unified broker operating system that provides a full-stack solution for running a retail forex / CFD brokerage. It combines a real-time trading terminal, back-office CRM, finance operations, document/KYC management, live chat, and a multi-broker administration console into a single deployable product.

The platform is designed as a multi-tenant system: a single deployment can host multiple brokers, each operating in its own isolated scope, all managed from a central `SUPER_ADMIN` console.

---

## System Components

### Frontend (React SPA)

| Attribute   | Detail                                      |
|-------------|---------------------------------------------|
| Framework   | React 18                                    |
| State       | Redux (global) + local component state      |
| Styling     | CSS Modules                                 |
| Port        | 3000 (development), 80/443 via nginx (production) |

**Functional modules:**

| Module              | Path Prefix       | Description                                  |
|---------------------|-------------------|----------------------------------------------|
| Trading Terminal    | `/terminal`       | Live quotes, order book, charting, positions |
| CRM                 | `/crm`            | Clients, leads, activities, notes            |
| Finance             | `/finance`        | Deposits, withdrawals, payment gateways      |
| Documents / KYC     | `/documents`      | Document upload and KYC review workflow      |
| Chat                | `/chat`           | Operator ↔ client messaging                  |
| Settings            | `/settings`       | Platform configuration                       |
| Super Admin         | `/super-admin`    | Broker management, global user control       |

The SPA communicates with the backend exclusively via REST (axios) and WebSocket (`ws://`). Authentication tokens are stored in `localStorage` and attached to every API request header.

---

### Backend (Express API)

| Attribute      | Detail                                  |
|----------------|-----------------------------------------|
| Runtime        | Node.js (LTS)                           |
| Framework      | Express.js                              |
| Real-time      | WebSocket server (`ws` package)         |
| Port           | 5000                                    |
| Auth           | JWT Bearer tokens                       |

**Layered architecture:**

```
HTTP Request
    │
    ▼
┌─────────────────────────────────────────┐
│              Routes (Express Router)    │  ← URL mapping, middleware chains
├─────────────────────────────────────────┤
│            Controllers                  │  ← Request/response handling, input validation
├─────────────────────────────────────────┤
│              Services                   │  ← Business logic, orchestration
├─────────────────────────────────────────┤
│              Models / Store             │  ← Data access layer (in-memory Maps / PostgreSQL)
└─────────────────────────────────────────┘
```

**Middleware stack (applied in order):**

1. `cors` – CORS policy enforcement
2. `express.json` – JSON body parsing
3. `express-rate-limit` – per-route rate limiting
4. `authMiddleware` – JWT verification and user injection
5. `requireRole` – role-based access control
6. Route handler / Controller

**WebSocket server** runs alongside the HTTP server on the same port. It pushes live market quotes and order/account updates to connected clients. Each message is a JSON object with a `type` field (e.g. `quote`, `order_update`, `account_update`).

---

### Database (PostgreSQL)

| Attribute   | Detail                                            |
|-------------|---------------------------------------------------|
| Engine      | PostgreSQL 14+                                    |
| ORM/Driver  | `pg` (node-postgres)                              |
| Migrations  | SQL files in `database/migrations/`               |
| Dev mode    | In-memory `Map` objects (no PostgreSQL required)  |

The schema covers all platform modules:

- `users` – authentication, roles, 2FA secrets
- `accounts` – trading account balances and leverage
- `orders` – open and historical positions
- `symbols` – tradeable instruments
- `deposits` / `withdrawals` – finance transactions
- `documents` / `kyc_reviews` – KYC workflow
- `crm_clients` / `crm_leads` / `crm_notes` / `crm_activities` / `crm_tickets` – CRM module
- `chat_conversations` / `chat_messages` – messaging
- `audit_logs` – immutable write-operation log
- `settings` – key/value platform configuration
- `brokers` / `broker_admins` – multi-tenancy
- `payment_gateways` – finance gateway configuration

Set `DATABASE_URL` to a valid PostgreSQL connection string to switch from in-memory mode to persistent storage.

---

### Market Data

| Attribute   | Detail                                              |
|-------------|-----------------------------------------------------|
| Pattern     | Adapter / Strategy pattern                          |
| Entry point | `backend/services/marketDataProvider.js`            |
| Default     | Built-in price simulator                            |

The `marketDataProvider` abstraction allows drop-in replacement of the price feed without modifying business logic. To add a live data source:

1. Create a new provider class in `backend/services/providers/` implementing the standard adapter interface.
2. Set `MARKET_DATA_PROVIDER=<your-provider-name>` in the environment.
3. The factory in `marketDataProvider.js` will instantiate the correct provider at startup.

---

## Role Hierarchy

```
SUPER_ADMIN
    │
    ├── Full access to all brokers, all data, all settings
    │
ADMIN / BROKER_ADMIN
    │
    ├── Full access within own broker's scope
    │
DEALER
    │
    ├── Execute, modify, and force-close orders
    ├── View all accounts within scope
    │
FINANCE
    │
    ├── Approve / reject deposits and withdrawals
    ├── Manage payment gateways
    │
CRM_AGENT
    │
    ├── Manage clients, leads, notes, activities
    ├── Create and resolve support tickets
    │
SUPPORT
    │
    ├── View chat conversations
    ├── View tickets (read-only)
    │
TRADER
    │
    └── Own account, own orders, own wallet only
```

Access checks cascade downward: a `SUPER_ADMIN` implicitly satisfies any lower-role requirement.

---

## Data Flow Diagrams

### 1. Trade Execution Flow

```
TRADER places order via UI
        │
        ▼
POST /api/orders  ──► authMiddleware (JWT check)
        │
        ▼
OrderController.createOrder
        │
        ├── Validate symbol, volume, type
        ├── Check account margin
        │
        ▼
OrderService.executeOrder
        │
        ├── Fetch current bid/ask from MarketDataProvider
        ├── Calculate required margin
        ├── Write order to Store (in-memory) / DB
        │
        ▼
WebSocket broadcast ──► TRADER client (order_update)
                    ──► DEALER / ADMIN clients (account_update)
        │
        ▼
Audit log entry written
        │
        ▼
HTTP 201 response ──► UI displays new position
```

---

### 2. Deposit Approval Flow

```
TRADER submits deposit request via UI
        │
        ▼
POST /api/finance/deposits  ──► authMiddleware
        │
        ▼
FinanceController.createDeposit
        │
        ├── Validate amount, gateway, currency
        ├── Create deposit record (status: PENDING)
        │
        ▼
HTTP 201 ──► UI shows "Pending" status

        [FINANCE / ADMIN reviews in back-office]
        │
        ▼
PATCH /api/finance/deposits/:id/approve  ──► requireRole(FINANCE | ADMIN)
        │
        ▼
FinanceService.approveDeposit
        │
        ├── Update deposit status → APPROVED
        ├── Credit trader's account balance
        ├── Write wallet transaction record
        │
        ▼
Audit log entry written
        │
        ▼
HTTP 200 ──► UI reflects updated balance
```

---

### 3. KYC Review Flow

```
TRADER uploads identity document via UI
        │
        ▼
POST /api/documents  ──► authMiddleware
        │
        ▼
DocumentController.uploadDocument
        │
        ├── Validate document type
        ├── Store document record (status: PENDING)
        │   (file stored in S3 / simulated in demo)
        │
        ▼
HTTP 201 ──► UI shows "Under Review"

        [ADMIN reviews document in back-office]
        │
        ▼
PATCH /api/documents/:id/review  ──► requireRole(ADMIN | SUPER_ADMIN)
        │
        ▼
DocumentService.reviewDocument
        │
        ├── Update document status → APPROVED | REJECTED
        ├── If all required docs approved → update KYC status
        │
        ▼
Audit log entry written
        │
        ▼
HTTP 200 ──► TRADER UI reflects updated KYC status
```

---

## Module Dependencies Map

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Frontend   │────►│  Backend API │────►│  PostgreSQL  │
│  (React SPA) │     │  (Express)   │     │  (optional)  │
└──────────────┘     └──────┬───────┘     └──────────────┘
                            │
              ┌─────────────┼──────────────┐
              ▼             ▼              ▼
       ┌─────────┐   ┌──────────┐   ┌──────────────┐
       │ Auth /  │   │  Market  │   │  In-Memory   │
       │  RBAC   │   │  Data    │   │  Store (dev) │
       └─────────┘   │ Provider │   └──────────────┘
                     └──────────┘

Module cross-dependencies (backend services):
  OrderService      → AccountService, MarketDataProvider, AuditService
  FinanceService    → AccountService, WalletService, AuditService
  DocumentService   → KYCService, AuditService
  CRMService        → UserService, AuditService
  ChatService       → UserService, WebSocketServer
  AdminService      → All services (read aggregation)
  BrokerService     → UserService, AuditService
```

---

## Infrastructure (Docker)

The platform ships with a complete Docker Compose configuration for local development and single-node production deployment.

### docker-compose.yml

Orchestrates three services:

| Service    | Image                | Port mapping  | Description                     |
|------------|----------------------|---------------|---------------------------------|
| `postgres` | `postgres:14-alpine` | 5432          | PostgreSQL database              |
| `backend`  | `Dockerfile.backend` | 5000:5000     | Node.js Express API              |
| `frontend` | `Dockerfile.frontend`| 3000:80       | React app served via nginx       |

The `backend` service depends on `postgres` and waits for it to be healthy before starting.

### Dockerfile.backend

```
Base image  : node:18-alpine
Build steps : npm ci --production
Entrypoint  : node backend/server.js
Exposed     : 5000
```

### Dockerfile.frontend

```
Stage 1 (build) : node:18-alpine  → npm run build → /app/build
Stage 2 (serve) : nginx:alpine    → copy /app/build → /usr/share/nginx/html
Exposed         : 80
```

The nginx configuration in `docker/nginx.conf` handles:
- SPA fallback (`try_files $uri /index.html`)
- Reverse proxy for `/api/` → `http://backend:5000`
- WebSocket upgrade headers for `/ws`

---

## Environment Variables

| Variable                | Default        | Description                                              |
|-------------------------|----------------|----------------------------------------------------------|
| `PORT`                  | `5000`         | HTTP server port                                         |
| `JWT_SECRET`            | *(required)*   | Secret for JWT signing; min 64 random chars in production|
| `JWT_EXPIRES_IN`        | `1h`           | Token lifetime (e.g. `1h`, `7d`)                        |
| `CORS_ORIGINS`          | `*`            | Comma-separated allowed CORS origins                     |
| `DATABASE_URL`          | *(optional)*   | PostgreSQL connection string; omit to use in-memory store|
| `MARKET_DATA_PROVIDER`  | `simulator`    | Market data adapter name                                 |
| `NODE_ENV`              | `development`  | `development` \| `production`                            |

Copy `.env.example` to `.env` and populate before running `docker-compose up`.

---

## Scalability Considerations

### Horizontal Scaling

The backend is stateless when PostgreSQL is used as the data store. Multiple backend instances can run behind a load balancer (AWS ALB, nginx upstream) without shared state issues.

> **Note:** In-memory mode is inherently single-instance. Do not use it in a horizontally scaled deployment.

### WebSocket Load Balancing

WebSocket connections are long-lived and stateful. When running multiple backend instances, configure **sticky sessions** (session affinity) at the load balancer so each WS client consistently hits the same instance. Alternatively, move the WS pub/sub layer to Redis Pub/Sub to decouple it from individual instances.

### Caching

| Layer         | Recommendation                                             |
|---------------|------------------------------------------------------------|
| Market quotes | Redis (TTL: 100 ms) to reduce MarketDataProvider load      |
| Session/JWT   | Redis token blocklist for immediate revocation             |
| Symbol list   | In-memory cache with 60-second TTL (already implemented)   |

### Frontend / CDN

Build the React SPA with `npm run build` and serve the `build/` directory via a CDN (CloudFront, Cloudflare Pages, or Azure Static Web Apps) for global low-latency delivery. The API remains on a fixed origin; set `CORS_ORIGINS` accordingly.

### Database Connection Pooling

Use `pg-pool` with a pool size tuned to `(2 × CPU cores) + disk spindles` as a starting baseline. Expose pool metrics to your monitoring stack to right-size under load.
