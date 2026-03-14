# VDA Trading Platform – Security Audit

## Executive Summary

The VDA Trading Platform implements a defence-in-depth approach combining JWT-based authentication, role-based access control (RBAC), rate limiting, and structured audit logging. In its current demo/development configuration the backend operates with an in-memory data store, which is acceptable for evaluation but must be replaced before any production deployment. The controls documented here address the OWASP Top 10 at a foundational level; the Known Limitations and Security Recommendations sections below must be actioned prior to go-live.

---

## Authentication & Authorization

### JWT Token Implementation

- Tokens are signed using `jsonwebtoken` with the `HS256` algorithm.
- The signing secret is read from the `JWT_SECRET` environment variable at startup. If the variable is absent the server will refuse to start in production mode.
- Default token expiry: **1 hour** (`JWT_EXPIRES_IN=1h`). Override via environment variable.
- Tokens are transmitted as Bearer tokens in the `Authorization` header and are never stored in cookies, mitigating CSRF risk.
- Token validation is enforced by the `authMiddleware` on every protected route before any business logic executes.

### Role-Based Access Control (RBAC)

The platform defines the following roles in ascending privilege order:

| Role            | Scope                                                   |
|-----------------|---------------------------------------------------------|
| `TRADER`        | Own account, orders, and wallet only                    |
| `SUPPORT`       | Chat conversations and tickets (read-only)              |
| `CRM_AGENT`     | Clients, leads, notes, activities, tickets              |
| `FINANCE`       | Deposits, withdrawals, payment gateways                 |
| `DEALER`        | Execute and manage orders, view all accounts            |
| `BROKER_ADMIN`  | Full access within own broker's scope                   |
| `ADMIN`         | Full access within own broker's scope + user management |
| `SUPER_ADMIN`   | Full platform access, manages all brokers               |

Role checks are enforced via the `requireRole` middleware applied per route group. Attempting to access a resource outside the permitted role set returns `HTTP 403 Forbidden`.

### Two-Factor Authentication (2FA)

- Implementation: Time-based One-Time Password (TOTP) per RFC 6238.
- Library: `speakeasy` for TOTP generation and verification.
- Setup flow: server generates a base32 secret and QR code; the user scans it with an authenticator app (Google Authenticator, Authy, etc.) and confirms with a valid token.
- The TOTP secret is stored per user and checked on login when 2FA is enabled.
- Window tolerance: ±1 time step (30 seconds) to account for clock skew.

---

## Rate Limiting

Rate limiting is implemented using `express-rate-limit` and is applied globally and per endpoint group.

| Endpoint Group     | Limit                   | Window      |
|--------------------|-------------------------|-------------|
| Auth endpoints     | 20 requests             | 15 minutes  |
| General API        | 120 requests            | 1 minute    |
| Admin endpoints    | 60 requests             | 1 minute    |

Exceeding any limit returns `HTTP 429 Too Many Requests`. The client IP address is used as the rate-limit key. Behind a reverse proxy, ensure `app.set('trust proxy', 1)` is configured and the proxy sets a genuine `X-Forwarded-For` header.

---

## Input Validation

### Request Body Validation

Controllers validate required fields and data types before processing. Missing or malformed fields return `HTTP 400 Bad Request` with a descriptive error message.

### SQL Injection Prevention

- Demo mode uses in-memory Maps; no SQL is executed.
- Production mode uses parameterised queries (prepared statements) via `pg` / an ORM. User-supplied input is never interpolated directly into query strings.

### XSS Prevention

- The React frontend relies on JSX's default HTML escaping for all dynamic content rendered in the DOM.
- `dangerouslySetInnerHTML` is not used in the application code.
- API responses are JSON; no HTML is rendered server-side.

### CORS

- Allowed origins are controlled via the `CORS_ORIGINS` environment variable (comma-separated list).
- Wildcard (`*`) origins are disabled in production configuration.

---

## Audit Logging

- All write operations (order placement, deposits, withdrawals, user management, settings changes) are written to the audit log with timestamp, actor identity, action type, and relevant metadata.
- In demo/development mode the audit log is held in an in-memory array capped at **1,000 entries** (oldest entries are evicted when the cap is reached).
- In production the `audit_logs` table in PostgreSQL provides persistent, unbounded audit history.
- The audit log is accessible to `ADMIN` and `SUPER_ADMIN` roles via `GET /api/admin/audit`.

---

## Known Limitations (Demo / Development Mode)

The following limitations apply to the current demo build. Each **must** be resolved before production deployment.

| # | Limitation | Production Mitigation |
|---|------------|-----------------------|
| 1 | **In-memory data store** – all data is lost on restart; no persistence | Replace with PostgreSQL using `DATABASE_URL` |
| 2 | **API keys / gateway secrets stored in memory** – visible in heap dumps | Use a secrets manager (HashiCorp Vault, AWS KMS, Azure Key Vault) |
| 3 | **No file upload validation** – document uploads accept any payload | Add MIME-type validation, file-size limits, and antivirus scanning (e.g., ClamAV) |
| 4 | **Document storage is simulated** – files are not persisted to disk or cloud | Use S3, Azure Blob Storage, or GCS with server-side encryption |
| 5 | **WebSocket connections are unauthenticated** – any client can subscribe to the WS feed | Validate JWT on the WS upgrade handshake; reject unauthenticated upgrades |
| 6 | **Default/weak JWT secret** – the demo ships with a placeholder secret | Set a cryptographically random `JWT_SECRET` of ≥ 64 characters in production |

---

## Security Recommendations

The following controls are recommended prior to and after production deployment.

### Transport Security

- Terminate TLS at the load balancer or reverse proxy (nginx with Let's Encrypt / ACM).
- Redirect all HTTP traffic to HTTPS (`301`).
- Enforce `HSTS` with a `max-age` of at least 1 year.

### JWT Secret

- Generate with: `openssl rand -hex 64`
- Store in a secrets manager; do not commit to source control.
- Rotate the secret on a defined schedule; invalidate all active sessions on rotation.

### Database

- Enable SSL for all PostgreSQL connections (`?sslmode=require` in `DATABASE_URL`).
- Restrict database user permissions to the minimum required (no `SUPERUSER`, no DDL in runtime role).
- Enable `pg_audit` for database-level audit logging.

### Network & Infrastructure

- Implement IP allowlisting for `/api/admin/*` endpoints (restrict to internal network / VPN).
- Deploy a Web Application Firewall (WAF) in front of the API (AWS WAF, Cloudflare, or ModSecurity).
- Isolate database and backend services in a private subnet; expose only the frontend load balancer publicly.

### Application Hardening

- Enable `helmet.js` for security headers (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Content-Security-Policy`).
- Implement CSRF protection if cookie-based authentication is introduced.
- Encrypt sensitive fields at rest (API keys, bank account numbers) using AES-256-GCM before storing in the database.
- Validate and sanitise all file uploads before storage: check MIME type, enforce maximum file size, rename files to a UUID on storage.

### Dependency Management

- Run `npm audit` regularly and integrate it into the CI pipeline.
- Pin dependencies to specific versions and review changelogs before upgrading.
- Use Dependabot or Renovate for automated dependency update PRs.

### Monitoring & Incident Response

- Ship application logs and audit logs to a centralised SIEM (Elastic, Splunk, Datadog).
- Set up alerts for repeated authentication failures, rate-limit breaches, and unusual trading volume.
- Define and test an incident response runbook covering credential rotation, session invalidation, and customer notification.

---

## Dependencies Security

Key security-relevant packages used by the platform:

| Package               | Purpose                                 |
|-----------------------|-----------------------------------------|
| `bcryptjs`            | Password hashing (bcrypt, cost factor 10) |
| `jsonwebtoken`        | JWT signing and verification (HS256)    |
| `express-rate-limit`  | Per-IP rate limiting on API routes      |
| `speakeasy`           | TOTP generation and verification (2FA)  |
| `cors`                | Cross-Origin Resource Sharing control   |
| `helmet` *(recommended)* | HTTP security headers               |

Run `npm audit` from the project root to check for known CVEs in all installed dependencies. Address any `high` or `critical` findings before deployment.
